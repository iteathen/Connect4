#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const CENTER_ORDER = Object.freeze([3, 4, 2, 5, 1, 6, 0]);
const CENSUS = fileURLToPath(new URL('./quotient-standard7x6-proof-frontier-census.mjs', import.meta.url));
const PONS_INVALID_MOVE = -1000;
const MAX_CHAIN_PAIRS = Number(process.env.UNIQUE_HARD_MAX_CHAIN ?? 16);
if (!Number.isSafeInteger(MAX_CHAIN_PAIRS) || MAX_CHAIN_PAIRS < 1 || MAX_CHAIN_PAIRS > 16) {
  throw new RangeError(`UNIQUE_HARD_MAX_CHAIN must be 1..16, got ${MAX_CHAIN_PAIRS}`);
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function runCensus() {
  const child = spawnSync(process.execPath, [CENSUS], {
    env: process.env,
    encoding: 'utf-8',
    timeout: 20 * 60 * 1000,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (child.error) throw child.error;
  if (child.status !== 0) throw new Error(`proof-frontier census failed: ${(child.stderr ?? '').slice(-8000)}`);
  const line = (child.stdout ?? '').split(/\r?\n/).find(value => value.startsWith('PROOF_FRONTIER_CENSUS='));
  if (!line) throw new Error('proof-frontier census did not emit PROOF_FRONTIER_CENSUS');
  return JSON.parse(line.slice('PROOF_FRONTIER_CENSUS='.length));
}

function parsePonsLine(sequence, line) {
  const fields = line.trim().split(/\s+/);
  const scoreFields = sequence.length === 0 ? fields : fields[0] === sequence ? fields.slice(1) : null;
  if (!scoreFields || scoreFields.length !== DOMAIN.columns) throw new Error(`invalid Pons line for ${sequence}: ${line}`);
  return scoreFields.map((field, column) => {
    const score = Number(field);
    if (!Number.isSafeInteger(score) || score < PONS_INVALID_MOVE || score > 64) {
      throw new RangeError(`invalid Pons score ${field} at ${sequence}/${column + 1}`);
    }
    return score;
  });
}

function analyzeBatch(sequences) {
  if (!sequences.length) return [];
  const child = spawnSync(requiredEnv('PONS_SOLVER_PATH'), ['-a', '-b', requiredEnv('PONS_BOOK_PATH')], {
    input: `${sequences.join('\n')}\n`,
    encoding: 'utf-8',
    timeout: 120000,
    maxBuffer: Math.max(2 * 1048576, sequences.length * 256),
  });
  if (child.error) throw child.error;
  if (child.status !== 0) throw new Error(`Pons batch failed: ${(child.stderr ?? '').slice(-8000)}`);
  const lines = (child.stdout ?? '').split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length !== sequences.length) throw new Error(`Pons returned ${lines.length} lines for ${sequences.length} inputs`);
  return sequences.map((sequence, index) => parsePonsLine(sequence, lines[index]));
}

function chooseWinningWitness(scores, sequence) {
  let bestScore = -Infinity;
  let bestColumn = -1;
  for (const column of CENTER_ORDER) {
    const score = scores[column];
    if (score === PONS_INVALID_MOVE) continue;
    if (score > bestScore) {
      bestScore = score;
      bestColumn = column;
    }
  }
  if (bestColumn < 0 || bestScore <= 0) throw new Error(`no exact-winning discovery witness at ${sequence}`);
  return Object.freeze({ column: bestColumn, score: bestScore });
}

function replay(kernel, sequence) {
  let stateId = kernel.rootId;
  for (const digit of sequence) {
    const child = kernel.advance(stateId, Number(digit) - 1);
    if (!Number.isSafeInteger(child) || child < 0) throw new Error(`replay crossed terminal/illegal edge at ${sequence}`);
    stateId = child;
  }
  return stateId;
}

function rankOf(kernel, stateId) {
  return kernel.supportAccess.rankAt(kernel.states.supportAt(stateId));
}

function legalColumns(kernel, stateId) {
  const support = kernel.states.supportAt(stateId);
  const result = [];
  for (let column = 0; column < DOMAIN.columns; column += 1) {
    if (kernel.supportAccess.landingAt(support, column) !== 0xff) result.push(column);
  }
  return result;
}

const immediateMemo = new Map();
const overloadMemo = new Map();
const shallowMemo = new Map();

function immediate(kernel, stateId) {
  if (immediateMemo.has(stateId)) return immediateMemo.get(stateId);
  let value = false;
  if ((rankOf(kernel, stateId) & 1) === 0) {
    for (const column of legalColumns(kernel, stateId)) {
      if (kernel.advance(stateId, column) === domain.QN_TERMINAL_WIN) { value = true; break; }
    }
  }
  immediateMemo.set(stateId, value);
  return value;
}

function overload(kernel, stateId) {
  if (overloadMemo.has(stateId)) return overloadMemo.get(stateId);
  let value = false;
  if ((rankOf(kernel, stateId) & 1) === 1) {
    const legal = legalColumns(kernel, stateId);
    value = legal.length > 0;
    for (const column of legal) {
      const child = kernel.advance(stateId, column);
      if (child === domain.QN_TERMINAL_WIN || child < 0 || !immediate(kernel, child)) { value = false; break; }
    }
  }
  overloadMemo.set(stateId, value);
  return value;
}

function shallowP0Kind(kernel, stateId) {
  if (shallowMemo.has(stateId)) return shallowMemo.get(stateId);
  if ((rankOf(kernel, stateId) & 1) !== 0) throw new Error('shallowP0Kind requires P0-to-move state');
  let value = 'H';
  if (immediate(kernel, stateId)) value = 'I';
  else {
    for (const column of legalColumns(kernel, stateId)) {
      const child = kernel.advance(stateId, column);
      if (child >= 0 && overload(kernel, child)) { value = 'E(O)'; break; }
    }
  }
  shallowMemo.set(stateId, value);
  return value;
}

function localRank3RootClosed(kernel, stateId) {
  if (shallowP0Kind(kernel, stateId) !== 'H') return true;
  for (const rootColumn of legalColumns(kernel, stateId)) {
    const defender = kernel.advance(stateId, rootColumn);
    if (defender < 0) continue;
    let valid = true;
    for (const defenderColumn of legalColumns(kernel, defender)) {
      const attacker = kernel.advance(defender, defenderColumn);
      if (attacker === domain.QN_TERMINAL_WIN || attacker < 0 || shallowP0Kind(kernel, attacker) === 'H') { valid = false; break; }
    }
    if (valid) return true;
  }
  return false;
}

function classifyChosenStep(kernel, stateId, witnessColumn) {
  const defender = kernel.advance(stateId, witnessColumn);
  if (defender === domain.QN_TERMINAL_WIN) return Object.freeze({ closed: true, unresolved: Object.freeze([]), branchKinds: Object.freeze(['I']) });
  if (defender < 0) throw new Error(`chosen witness ${witnessColumn + 1} is illegal`);
  const unresolved = [];
  const branchKinds = [];
  for (const defenderColumn of legalColumns(kernel, defender)) {
    const attacker = kernel.advance(defender, defenderColumn);
    if (attacker === domain.QN_TERMINAL_WIN || attacker < 0) throw new Error(`winning witness permits P1 terminal/illegal reply ${defenderColumn + 1}`);
    const kind = shallowP0Kind(kernel, attacker);
    branchKinds.push(kind);
    if (kind === 'H') unresolved.push(Object.freeze({ column: defenderColumn, stateId: attacker }));
  }
  return Object.freeze({ closed: unresolved.length === 0, unresolved: Object.freeze(unresolved), branchKinds: Object.freeze(branchKinds) });
}

function increment(map, key) { map.set(key, (map.get(key) ?? 0) + 1); }
function numericObject(map) { return Object.fromEntries([...map.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))); }

const census = runCensus();
if (census.frontierDepth !== 8) throw new Error(`expected depth-8 census, got ${census.frontierDepth}`);
const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 1048576, classes: 1048576, chunksPerSlot: 262144 }),
});
kernel.prepareSearchStorage();

const unresolvedRoots = [];
for (const representative of census.representativeQuotientStates) {
  const stateId = replay(kernel, representative.sequence);
  if (!localRank3RootClosed(kernel, stateId)) unresolvedRoots.push({ stateId, sequence: representative.sequence });
}
if (unresolvedRoots.length !== 723) throw new Error(`expected 723 unresolved roots, got ${unresolvedRoots.length}`);

const rootScores = analyzeBatch(unresolvedRoots.map(root => root.sequence));
const starts = [];
const initialDisplacement = new Map();
for (let index = 0; index < unresolvedRoots.length; index += 1) {
  const root = unresolvedRoots[index];
  const witness = chooseWinningWitness(rootScores[index], root.sequence);
  const step = classifyChosenStep(kernel, root.stateId, witness.column);
  if (step.unresolved.length !== 1) continue;
  const hard = step.unresolved[0];
  increment(initialDisplacement, Math.abs(witness.column - hard.column));
  starts.push(Object.freeze({
    parentSequence: root.sequence,
    stateId: hard.stateId,
    sequence: `${root.sequence}${witness.column + 1}${hard.column + 1}`,
    chainPairs: 1,
    path: [Object.freeze({ move: witness.column, hard: hard.column })],
  }));
}
if (starts.length !== 290) throw new Error(`expected 290 unique-hard starts, got ${starts.length}`);

let active = starts.map(start => ({ ...start }));
const closed = [];
const broken = [];
const layers = [];
const breakHistogram = new Map();
const allStepDisplacement = new Map();
for (const start of starts) increment(allStepDisplacement, Math.abs(start.path[0].move - start.path[0].hard));

for (let depth = 1; depth < MAX_CHAIN_PAIRS && active.length; depth += 1) {
  const alreadyClosed = [];
  const needOracle = [];
  for (const item of active) {
    const base = shallowP0Kind(kernel, item.stateId);
    if (base !== 'H') alreadyClosed.push({ ...item, base });
    else needOracle.push(item);
  }
  for (const item of alreadyClosed) closed.push(item);

  const scores = analyzeBatch(needOracle.map(item => item.sequence));
  const next = [];
  let closedThisLayer = alreadyClosed.length;
  let continued = 0;
  let reexpanded = 0;
  for (let index = 0; index < needOracle.length; index += 1) {
    const item = needOracle[index];
    const witness = chooseWinningWitness(scores[index], item.sequence);
    const step = classifyChosenStep(kernel, item.stateId, witness.column);
    if (step.closed) {
      closed.push({ ...item, chainPairs: item.chainPairs + 1, base: 'all-shallow-after-step', path: [...item.path, { move: witness.column, hard: null }] });
      closedThisLayer += 1;
      continue;
    }
    if (step.unresolved.length === 1) {
      const hard = step.unresolved[0];
      const displacement = Math.abs(witness.column - hard.column);
      increment(allStepDisplacement, displacement);
      next.push({
        ...item,
        stateId: hard.stateId,
        sequence: `${item.sequence}${witness.column + 1}${hard.column + 1}`,
        chainPairs: item.chainPairs + 1,
        path: [...item.path, { move: witness.column, hard: hard.column }],
      });
      continued += 1;
      continue;
    }
    const reason = `multiple-hard-${step.unresolved.length}`;
    increment(breakHistogram, reason);
    broken.push({ ...item, chainPairs: item.chainPairs + 1, reason, path: [...item.path, { move: witness.column, hard: null, unresolved: step.unresolved.map(x => x.column) }] });
    reexpanded += 1;
  }
  layers.push(Object.freeze({ pairDepth: depth, activeAtStart: active.length, baseClosed: alreadyClosed.length, closedAfterChosenStep: closedThisLayer - alreadyClosed.length, continuedOneHard: continued, reexpanded, activeNext: next.length }));
  active = next;
}

for (const item of active) {
  increment(breakHistogram, 'chain-cap');
  broken.push({ ...item, reason: 'chain-cap' });
}

const chainLengthHistogram = new Map();
const closedInitialDisplacement = new Map();
for (const item of closed) {
  increment(chainLengthHistogram, item.chainPairs);
  increment(closedInitialDisplacement, Math.abs(item.path[0].move - item.path[0].hard));
}

console.log(`UNIQUE_HARD_CHAIN=${JSON.stringify({
  kind: 'standard7x6-depth8-unique-hard-chain-v1',
  attribution: {
    researchDirectionAndStructuralTarget: 'Josh Oshiro',
    formalizationImplementationAndQualification: 'OpenAI ChatGPT',
  },
  sourceUnresolvedRoots: unresolvedRoots.length,
  uniqueHardStarts: starts.length,
  maxChainPairs: MAX_CHAIN_PAIRS,
  structurallyClosedStarts: closed.length,
  unresolvedOrReexpandedStarts: broken.length,
  closureFraction: closed.length / starts.length,
  initialDisplacementHistogram: numericObject(initialDisplacement),
  closedInitialDisplacementHistogram: numericObject(closedInitialDisplacement),
  allTransportStepDisplacementHistogram: numericObject(allStepDisplacement),
  chainLengthHistogram: numericObject(chainLengthHistogram),
  breakHistogram: Object.fromEntries([...breakHistogram.entries()].sort()),
  layers,
  closedExamples: closed.slice(0, 60).map(item => ({
    parentSequence: item.parentSequence,
    chainPairs: item.chainPairs,
    base: item.base,
    transports: item.path.map(step => step.hard === null ? `${step.move + 1}->close` : `${step.move + 1}->${step.hard + 1}`),
  })),
  brokenExamples: broken.slice(0, 40).map(item => ({
    parentSequence: item.parentSequence,
    chainPairs: item.chainPairs,
    reason: item.reason,
    transports: item.path.map(step => step.hard === null ? `${step.move + 1}->expand` : `${step.move + 1}->${step.hard + 1}`),
  })),
  materializedQStates: kernel.states.count,
  proofAuthority: 'Pons chooses only one legal P0 discovery witness at each unresolved P0 state. Every reported closed chain is independently checkable from legal C4-0010 transitions: all side branches are structural I/E(O), exactly one unresolved branch is recursively transported, each transport consumes two plies, and the finite chain terminates in structural closure. Exact scores are not proof premises.',
  progressMeasure: 'remaining board plies decreases by two on every unique-hard transport step',
  theoremStatus: 'constructive proof for closed starts only; re-expanded or capped starts remain unresolved',
})}`);
