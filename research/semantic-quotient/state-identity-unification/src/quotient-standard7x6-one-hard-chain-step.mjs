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
  if (child.status !== 0) throw new Error(`census failed: ${(child.stderr ?? '').slice(-8000)}`);
  const line = (child.stdout ?? '').split(/\r?\n/).find(value => value.startsWith('PROOF_FRONTIER_CENSUS='));
  if (!line) throw new Error('missing PROOF_FRONTIER_CENSUS');
  return JSON.parse(line.slice('PROOF_FRONTIER_CENSUS='.length));
}

function parsePons(sequence, line) {
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

function analyze(sequences) {
  if (sequences.length === 0) return [];
  const child = spawnSync(requiredEnv('PONS_SOLVER_PATH'), ['-a', '-b', requiredEnv('PONS_BOOK_PATH')], {
    input: `${sequences.join('\n')}\n`,
    encoding: 'utf-8',
    timeout: 120000,
    maxBuffer: Math.max(2 * 1048576, sequences.length * 256),
  });
  if (child.error) throw child.error;
  if (child.status !== 0) throw new Error(`Pons failed: ${(child.stderr ?? '').slice(-8000)}`);
  const lines = (child.stdout ?? '').split(/\r?\n/).filter(Boolean);
  if (lines.length !== sequences.length) throw new Error(`Pons lines ${lines.length} != ${sequences.length}`);
  return sequences.map((sequence, index) => parsePons(sequence, lines[index]));
}

function choose(scores, sequence) {
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
  if (bestColumn < 0 || bestScore <= 0) throw new Error(`no exact-winning witness at ${sequence}; best=${bestScore}`);
  return Object.freeze({ column: bestColumn, score: bestScore });
}

function replay(kernel, sequence) {
  let stateId = kernel.rootId;
  for (const digit of sequence) {
    const child = kernel.advance(stateId, Number(digit) - 1);
    if (!Number.isSafeInteger(child) || child < 0) throw new Error(`bad replay ${sequence}`);
    stateId = child;
  }
  return stateId;
}

function rank(kernel, stateId) {
  return kernel.supportAccess.rankAt(kernel.states.supportAt(stateId));
}

function legal(kernel, stateId) {
  const support = kernel.states.supportAt(stateId);
  const result = [];
  for (let column = 0; column < DOMAIN.columns; column += 1) {
    if (kernel.supportAccess.landingAt(support, column) !== 0xff) result.push(column);
  }
  return result;
}

function landingRow(kernel, stateId, column) {
  const landing = kernel.supportAccess.landingAt(kernel.states.supportAt(stateId), column);
  return landing === 0xff ? -1 : Math.floor(landing / DOMAIN.columns);
}

const immediateMemo = new Map();
const overloadMemo = new Map();
const shallowMemo = new Map();

function immediate(kernel, stateId) {
  if (immediateMemo.has(stateId)) return immediateMemo.get(stateId);
  let value = false;
  if ((rank(kernel, stateId) & 1) === 0) {
    for (const column of legal(kernel, stateId)) {
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
  if ((rank(kernel, stateId) & 1) === 1) {
    const moves = legal(kernel, stateId);
    value = moves.length > 0;
    for (const column of moves) {
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

function shallow(kernel, stateId) {
  if (shallowMemo.has(stateId)) return shallowMemo.get(stateId);
  if ((rank(kernel, stateId) & 1) !== 0) throw new Error('shallow requires P0-to-move state');
  let value = 'H';
  if (immediate(kernel, stateId)) value = 'I';
  else {
    for (const column of legal(kernel, stateId)) {
      const child = kernel.advance(stateId, column);
      if (child >= 0 && overload(kernel, child)) {
        value = 'E(O)';
        break;
      }
    }
  }
  shallowMemo.set(stateId, value);
  return value;
}

function localProof(kernel, stateId) {
  if (immediate(kernel, stateId)) return true;
  if (shallow(kernel, stateId) === 'E(O)') return true;
  for (const rootColumn of legal(kernel, stateId)) {
    const defender = kernel.advance(stateId, rootColumn);
    if (defender < 0) continue;
    let valid = true;
    for (const reply of legal(kernel, defender)) {
      const attacker = kernel.advance(defender, reply);
      if (attacker === domain.QN_TERMINAL_WIN || attacker < 0 || shallow(kernel, attacker) === 'H') {
        valid = false;
        break;
      }
    }
    if (valid) return true;
  }
  return false;
}

function inc(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function object(map) {
  return Object.fromEntries([...map.entries()].sort((a, b) => Number(a[0]) - Number(b[0])));
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

const unresolved = [];
for (const representative of census.representativeQuotientStates) {
  const stateId = replay(kernel, representative.sequence);
  if (immediate(kernel, stateId) || localProof(kernel, stateId)) continue;
  unresolved.push({ stateId, sequence: representative.sequence });
}
if (unresolved.length !== 723) throw new Error(`expected 723 unresolved, got ${unresolved.length}`);

const rootScores = analyze(unresolved.map(row => row.sequence));
const sameColumnOneHard = [];
for (let index = 0; index < unresolved.length; index += 1) {
  const root = unresolved[index];
  const witness = choose(rootScores[index], root.sequence);
  const selectedRow = landingRow(kernel, root.stateId, witness.column);
  const defender = kernel.advance(root.stateId, witness.column);
  if (defender < 0) throw new Error(`winning witness terminal/illegal at ${root.sequence}`);
  const hard = [];
  for (const reply of legal(kernel, defender)) {
    const attacker = kernel.advance(defender, reply);
    if (attacker === domain.QN_TERMINAL_WIN || attacker < 0) throw new Error(`defender terminal/illegal under winning witness ${root.sequence}`);
    if (shallow(kernel, attacker) === 'H') {
      hard.push({ reply, attacker, replyRow: landingRow(kernel, defender, reply) });
    }
  }
  if (hard.length !== 1 || hard[0].reply !== witness.column) continue;
  const item = hard[0];
  sameColumnOneHard.push(Object.freeze({
    rootSequence: root.sequence,
    originalColumn: witness.column,
    selectedRow,
    replyRow: item.replyRow,
    hardState: item.attacker,
    hardSequence: `${root.sequence}${witness.column + 1}${item.reply + 1}`,
  }));
}

if (sameColumnOneHard.length !== 212) throw new Error(`expected 212 same-column one-hard roots, got ${sameColumnOneHard.length}`);

const nextScores = analyze(sameColumnOneHard.map(row => row.hardSequence));
const nextHardHistogram = new Map();
const nextWitnessColumnHistogram = new Map();
const nextHardReplyColumnHistogram = new Map();
const nextOneHardDistanceHistogram = new Map();
const nextOneHardRowPairHistogram = new Map();
let closesAtNextUniversal = 0;
let remainsOneHard = 0;
let reexpands = 0;
let repeatedSameColumn = 0;
let repeatedOriginalColumn = 0;
let totalNextHardReplies = 0;
const examples = [];

for (let index = 0; index < sameColumnOneHard.length; index += 1) {
  const row = sameColumnOneHard[index];
  const witness = choose(nextScores[index], row.hardSequence);
  const witnessRow = landingRow(kernel, row.hardState, witness.column);
  const defender = kernel.advance(row.hardState, witness.column);
  if (defender < 0) throw new Error(`next winning witness terminal/illegal at ${row.hardSequence}`);

  const hard = [];
  const kinds = [];
  for (const reply of legal(kernel, defender)) {
    const attacker = kernel.advance(defender, reply);
    if (attacker === domain.QN_TERMINAL_WIN || attacker < 0) throw new Error(`next defender terminal/illegal at ${row.hardSequence}`);
    const kind = shallow(kernel, attacker);
    kinds.push({ column: reply + 1, kind });
    if (kind === 'H') hard.push({ reply, replyRow: landingRow(kernel, defender, reply) });
  }

  inc(nextHardHistogram, hard.length);
  inc(nextWitnessColumnHistogram, witness.column + 1);
  totalNextHardReplies += hard.length;

  let outcome;
  if (hard.length === 0) {
    closesAtNextUniversal += 1;
    outcome = 'closes';
  } else if (hard.length === 1) {
    remainsOneHard += 1;
    outcome = 'one-hard';
    const only = hard[0];
    inc(nextHardReplyColumnHistogram, only.reply + 1);
    inc(nextOneHardDistanceHistogram, Math.abs(witness.column - only.reply));
    inc(nextOneHardRowPairHistogram, `${witnessRow + 1}->${only.replyRow + 1}`);
    if (only.reply === witness.column) {
      repeatedSameColumn += 1;
      if (witness.column === row.originalColumn) repeatedOriginalColumn += 1;
    }
  } else {
    reexpands += 1;
    outcome = 'reexpands';
  }

  if (examples.length < 80) {
    examples.push(Object.freeze({
      rootSequence: row.rootSequence,
      firstPairColumn: row.originalColumn + 1,
      firstPairRows: [row.selectedRow + 1, row.replyRow + 1],
      hardSequence: row.hardSequence,
      nextWitness: witness.column + 1,
      nextWitnessScore: witness.score,
      nextWitnessRow: witnessRow + 1,
      nextHardCount: hard.length,
      nextHardReplies: hard.map(item => item.reply + 1),
      nextKinds: kinds,
      outcome,
    }));
  }
}

console.log(`ONE_HARD_CHAIN_STEP=${JSON.stringify({
  kind: 'standard7x6-one-hard-recursive-chain-step-v1',
  attribution: {
    researchDirectionAndStructuralTarget: 'Josh Oshiro',
    formalizationImplementationAndQualification: 'OpenAI ChatGPT',
  },
  sourceUnresolvedRoots: unresolved.length,
  sourceOneHardRoots: 290,
  sourceSameColumnOneHardRoots: sameColumnOneHard.length,
  nextHardReplyHistogram: object(nextHardHistogram),
  closesAtNextUniversal,
  remainsOneHard,
  reexpands,
  averageNextHardReplies: totalNextHardReplies / sameColumnOneHard.length,
  repeatedSameColumn,
  repeatedSameColumnFractionAmongNextOneHard: repeatedSameColumn / Math.max(1, remainsOneHard),
  repeatedOriginalColumn,
  repeatedOriginalColumnFractionAmongNextOneHard: repeatedOriginalColumn / Math.max(1, remainsOneHard),
  nextWitnessColumnHistogram: object(nextWitnessColumnHistogram),
  nextHardReplyColumnHistogram: object(nextHardReplyColumnHistogram),
  nextOneHardDistanceHistogram: object(nextOneHardDistanceHistogram),
  nextOneHardLandingRowPairHistogramOneBased: Object.fromEntries([...nextOneHardRowPairHistogram.entries()].sort()),
  materializedQStates: kernel.states.count,
  examples,
  discoveryAuthority: 'Pinned Pons scores choose only the canonical exact-winning P0 witness at each compressed obligation. All branch classification into I/E(O)/H uses legal C4-0010 transitions and structural predicates only. Scores are not proof premises.',
  interpretation: 'A zero next-hard count closes the prior one-hard obligation by a rank-5 I/O/E/A certificate; one hard reply transports the obligation without branch expansion; two or more hard replies mark recursive re-expansion.',
  theoremStatus: 'diagnostic/control; one-hard transport is an exact proof-shape decomposition only when the hard successor is independently proved',
})}`);
