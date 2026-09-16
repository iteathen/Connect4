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
const MAX_CHAIN_PAIRS = Number(process.env.VERTICAL_PAIR_MAX_CHAIN ?? 16);
if (!Number.isSafeInteger(MAX_CHAIN_PAIRS) || MAX_CHAIN_PAIRS < 1 || MAX_CHAIN_PAIRS > 16) {
  throw new RangeError(`VERTICAL_PAIR_MAX_CHAIN must be 1..16, got ${MAX_CHAIN_PAIRS}`);
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
  const scores = sequence.length === 0 ? fields : fields[0] === sequence ? fields.slice(1) : null;
  if (!scores || scores.length !== DOMAIN.columns) throw new Error(`invalid Pons line for ${sequence}: ${line}`);
  return scores.map((field, column) => {
    const score = Number(field);
    if (!Number.isSafeInteger(score) || score < PONS_INVALID_MOVE || score > 64) {
      throw new RangeError(`invalid Pons score ${field} at ${sequence}/${column + 1}`);
    }
    return score;
  });
}

function analyzeBatch(sequences) {
  if (sequences.length === 0) return [];
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
      if (kernel.advance(stateId, column) === domain.QN_TERMINAL_WIN) {
        value = true;
        break;
      }
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
      if (child === domain.QN_TERMINAL_WIN || child < 0 || !immediate(kernel, child)) {
        value = false;
        break;
      }
    }
  }
  overloadMemo.set(stateId, value);
  return value;
}

function shallowP0Kind(kernel, stateId) {
  if (shallowMemo.has(stateId)) return shallowMemo.get(stateId);
  if ((rankOf(kernel, stateId) & 1) !== 0) throw new Error('shallowP0Kind requires P0-to-move state');
  if (immediate(kernel, stateId)) {
    shallowMemo.set(stateId, 'I');
    return 'I';
  }
  for (const column of legalColumns(kernel, stateId)) {
    const child = kernel.advance(stateId, column);
    if (child >= 0 && overload(kernel, child)) {
      shallowMemo.set(stateId, 'E(O)');
      return 'E(O)';
    }
  }
  shallowMemo.set(stateId, 'H');
  return 'H';
}

function localRank3RootClosed(kernel, stateId) {
  const shallow = shallowP0Kind(kernel, stateId);
  if (shallow !== 'H') return true;
  for (const rootColumn of legalColumns(kernel, stateId)) {
    const defender = kernel.advance(stateId, rootColumn);
    if (defender < 0) continue;
    let valid = true;
    for (const defenderColumn of legalColumns(kernel, defender)) {
      const attacker = kernel.advance(defender, defenderColumn);
      if (attacker === domain.QN_TERMINAL_WIN || attacker < 0 || shallowP0Kind(kernel, attacker) === 'H') {
        valid = false;
        break;
      }
    }
    if (valid) return true;
  }
  return false;
}

function classifyChosenStep(kernel, stateId, witnessColumn) {
  const defender = kernel.advance(stateId, witnessColumn);
  if (defender === domain.QN_TERMINAL_WIN) {
    return Object.freeze({ closed: true, terminalAtP0Move: true, unresolved: Object.freeze([]), branchKinds: Object.freeze(['I']) });
  }
  if (defender < 0) throw new Error(`chosen witness ${witnessColumn + 1} is illegal`);
  const unresolved = [];
  const branchKinds = [];
  for (const defenderColumn of legalColumns(kernel, defender)) {
    const attacker = kernel.advance(defender, defenderColumn);
    if (attacker === domain.QN_TERMINAL_WIN || attacker < 0) {
      throw new Error(`selected winning witness permits P1 terminal/illegal reply in column ${defenderColumn + 1}`);
    }
    const kind = shallowP0Kind(kernel, attacker);
    branchKinds.push(kind);
    if (kind === 'H') unresolved.push(Object.freeze({ column: defenderColumn, stateId: attacker }));
  }
  return Object.freeze({
    closed: unresolved.length === 0,
    terminalAtP0Move: false,
    unresolved: Object.freeze(unresolved),
    branchKinds: Object.freeze(branchKinds),
  });
}

function increment(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

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
  if (localRank3RootClosed(kernel, stateId)) continue;
  unresolvedRoots.push({ stateId, sequence: representative.sequence });
}
if (unresolvedRoots.length !== 723) throw new Error(`expected 723 unresolved roots, got ${unresolvedRoots.length}`);

const rootScores = analyzeBatch(unresolvedRoots.map(root => root.sequence));
const starts = [];
for (let index = 0; index < unresolvedRoots.length; index += 1) {
  const root = unresolvedRoots[index];
  const witness = chooseWinningWitness(rootScores[index], root.sequence);
  const step = classifyChosenStep(kernel, root.stateId, witness.column);
  if (step.unresolved.length !== 1 || step.unresolved[0].column !== witness.column) continue;
  const hard = step.unresolved[0];
  starts.push(Object.freeze({
    parentSequence: root.sequence,
    parentMove: witness.column,
    stateId: hard.stateId,
    sequence: `${root.sequence}${witness.column + 1}${hard.column + 1}`,
  }));
}
if (starts.length !== 212) throw new Error(`expected 212 same-column one-hard starts, got ${starts.length}`);

let active = starts.map(start => ({ ...start, chainPairs: 0, path: [] }));
const closed = [];
const broken = [];
const layerStats = [];
const breakHistogram = new Map();

for (let depth = 0; depth < MAX_CHAIN_PAIRS && active.length > 0; depth += 1) {
  const scores = analyzeBatch(active.map(item => item.sequence));
  const next = [];
  let closedThisLayer = 0;
  let continuedThisLayer = 0;
  let brokenThisLayer = 0;

  for (let index = 0; index < active.length; index += 1) {
    const item = active[index];
    const base = shallowP0Kind(kernel, item.stateId);
    if (base !== 'H') {
      closed.push({ ...item, base, closedAtPairDepth: depth });
      closedThisLayer += 1;
      continue;
    }

    const witness = chooseWinningWitness(scores[index], item.sequence);
    const step = classifyChosenStep(kernel, item.stateId, witness.column);
    const record = Object.freeze({
      move: witness.column,
      score: witness.score,
      branchKinds: step.branchKinds,
      unresolvedColumns: step.unresolved.map(entry => entry.column),
    });
    const path = [...item.path, record];

    if (step.closed) {
      closed.push({ ...item, path, chainPairs: item.chainPairs + 1, base: 'all-shallow-after-step', closedAtPairDepth: depth + 1 });
      closedThisLayer += 1;
      continue;
    }

    if (step.unresolved.length === 1 && step.unresolved[0].column === witness.column) {
      const hard = step.unresolved[0];
      next.push({
        ...item,
        stateId: hard.stateId,
        sequence: `${item.sequence}${witness.column + 1}${hard.column + 1}`,
        chainPairs: item.chainPairs + 1,
        path,
      });
      continuedThisLayer += 1;
      continue;
    }

    let reason;
    if (step.unresolved.length === 1) reason = 'single-off-column-hard';
    else if (step.unresolved.length > 1) reason = `multiple-hard-${step.unresolved.length}`;
    else reason = 'unexpected';
    increment(breakHistogram, reason);
    broken.push({ ...item, path, chainPairs: item.chainPairs + 1, reason });
    brokenThisLayer += 1;
  }

  layerStats.push(Object.freeze({
    pairDepth: depth,
    activeAtStart: active.length,
    closed: closedThisLayer,
    continuedSameColumn: continuedThisLayer,
    broken: brokenThisLayer,
    activeNext: next.length,
  }));
  active = next;
}

for (const item of active) {
  increment(breakHistogram, 'chain-cap');
  broken.push({ ...item, reason: 'chain-cap' });
}

const chainLengthHistogram = new Map();
for (const item of closed) increment(chainLengthHistogram, item.chainPairs);
const objectFromNumericMap = map => Object.fromEntries([...map.entries()].sort((a, b) => Number(a[0]) - Number(b[0])));

console.log(`VERTICAL_PAIR_CHAIN=${JSON.stringify({
  kind: 'standard7x6-depth8-vertical-pair-chain-v1',
  attribution: {
    researchDirectionAndStructuralTarget: 'Josh Oshiro',
    formalizationImplementationAndQualification: 'OpenAI ChatGPT',
  },
  sourceUnresolvedRoots: unresolvedRoots.length,
  sameColumnOneHardStarts: starts.length,
  maxChainPairs: MAX_CHAIN_PAIRS,
  structurallyClosedStarts: closed.length,
  unresolvedOrPatternBrokenStarts: broken.length,
  closureFraction: closed.length / starts.length,
  chainLengthHistogram: objectFromNumericMap(chainLengthHistogram),
  breakHistogram: Object.fromEntries([...breakHistogram.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
  layers: layerStats,
  closedExamples: closed.slice(0, 50).map(item => ({
    parentSequence: item.parentSequence,
    initialColumn: item.parentMove + 1,
    chainPairs: item.chainPairs,
    base: item.base,
    moves: item.path.map(step => step.move + 1),
  })),
  brokenExamples: broken.slice(0, 50).map(item => ({
    parentSequence: item.parentSequence,
    initialColumn: item.parentMove + 1,
    chainPairs: item.chainPairs,
    reason: item.reason,
    moves: item.path.map(step => step.move + 1),
    finalUnresolvedColumns: item.path.length ? item.path[item.path.length - 1].unresolvedColumns.map(column => column + 1) : [],
  })),
  materializedQStates: kernel.states.count,
  proofAuthority: 'Pons is used only to choose one legal P0 move at each H state. Every reported closed chain is independently checkable: all non-recursive P1 replies land in structural I/E(O), the sole recursive reply is the same column as the P0 move, each recursive macro-step consumes exactly two plies, and the finite chain ends in structural closure. Exact scores are not proof premises.',
  progressMeasure: 'remaining board plies decreases by two on every recursive same-column macro-step, so any emitted finite chain is well founded; the experiment does not assert that the pattern must continue for broken chains.',
  theoremStatus: 'constructive proof for closed starts only; broken or capped starts remain unresolved',
})}`);
