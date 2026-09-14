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
  if (bestColumn < 0 || bestScore <= 0) {
    throw new Error(`no exact-winning discovery witness at ${sequence}, best=${bestScore}`);
  }
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

function localRootProof(kernel, stateId) {
  if (immediate(kernel, stateId)) return 'I';
  if (shallowP0Kind(kernel, stateId) === 'E(O)') return 'E(O)';
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
    if (valid) return 'R3';
  }
  return null;
}

function histogramIncrement(map, key, amount = 1) {
  map.set(key, (map.get(key) ?? 0) + amount);
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
  if (rankOf(kernel, stateId) !== 8) throw new Error(`rank drift at ${representative.sequence}`);
  if (immediate(kernel, stateId)) continue;
  if (localRootProof(kernel, stateId)) continue;
  unresolvedRoots.push({ stateId, sequence: representative.sequence });
}
if (unresolvedRoots.length !== 723) throw new Error(`expected 723 unresolved roots, got ${unresolvedRoots.length}`);

const scoreRows = analyzeBatch(unresolvedRoots.map(root => root.sequence));
const hardReplyHistogram = new Map();
const positiveMoveCountHistogram = new Map();
const selectedMoveColumnHistogram = new Map();
const hardReplyColumnHistogram = new Map();
const hardKindStateIds = new Set();
const boundaryRows = [];
let totalPositiveMoves = 0;
let totalHardReplies = 0;
let rootsWithOneHardReply = 0;
let rootsWithTwoOrFewerHardReplies = 0;
let rootsWithThreeOrFewerHardReplies = 0;

for (let index = 0; index < unresolvedRoots.length; index += 1) {
  const root = unresolvedRoots[index];
  const scores = scoreRows[index];
  const legal = legalColumns(kernel, root.stateId);
  const positiveMoves = legal.filter(column => scores[column] > 0 && scores[column] !== PONS_INVALID_MOVE).length;
  if (positiveMoves === 0) throw new Error(`unresolved winning source root has no positive exact move: ${root.sequence}`);
  totalPositiveMoves += positiveMoves;
  histogramIncrement(positiveMoveCountHistogram, positiveMoves);

  const witness = chooseWinningWitness(scores, root.sequence);
  const defender = kernel.advance(root.stateId, witness.column);
  if (defender < 0) throw new Error(`selected discovery move terminal/illegal at ${root.sequence}/${witness.column + 1}`);

  const replyKinds = [];
  const hardReplies = [];
  for (const defenderColumn of legalColumns(kernel, defender)) {
    const attacker = kernel.advance(defender, defenderColumn);
    if (attacker === domain.QN_TERMINAL_WIN || attacker < 0) {
      throw new Error(`selected winning move permits terminal/illegal defender edge at ${root.sequence}/${witness.column + 1}/${defenderColumn + 1}`);
    }
    const kind = shallowP0Kind(kernel, attacker);
    replyKinds.push(Object.freeze({ column: defenderColumn + 1, kind }));
    if (kind === 'H') {
      hardReplies.push(defenderColumn);
      hardKindStateIds.add(attacker);
    }
  }

  histogramIncrement(hardReplyHistogram, hardReplies.length);
  histogramIncrement(selectedMoveColumnHistogram, witness.column + 1);
  totalHardReplies += hardReplies.length;
  for (const reply of hardReplies) histogramIncrement(hardReplyColumnHistogram, reply + 1);
  if (hardReplies.length === 1) rootsWithOneHardReply += 1;
  if (hardReplies.length <= 2) rootsWithTwoOrFewerHardReplies += 1;
  if (hardReplies.length <= 3) rootsWithThreeOrFewerHardReplies += 1;

  boundaryRows.push(Object.freeze({
    sequence: root.sequence,
    positiveMoves,
    selectedMove: witness.column + 1,
    selectedScore: witness.score,
    hardReplies: hardReplies.length,
    hardReplyColumns: hardReplies.map(column => column + 1),
    replyKinds: Object.freeze(replyKinds),
  }));
}

boundaryRows.sort((left, right) =>
  left.hardReplies - right.hardReplies
  || left.positiveMoves - right.positiveMoves
  || left.sequence.localeCompare(right.sequence));

const toObject = map => Object.fromEntries([...map.entries()].sort((a, b) => Number(a[0]) - Number(b[0])));

console.log(`UNRESOLVED_BOUNDARY=${JSON.stringify({
  kind: 'standard7x6-depth8-selected-witness-unresolved-boundary-v2',
  attribution: {
    researchDirectionAndStructuralTarget: 'Josh Oshiro',
    formalizationImplementationAndQualification: 'OpenAI ChatGPT',
  },
  unresolvedRoots: unresolvedRoots.length,
  materializedQStates: kernel.states.count,
  discoveryAuthority: 'Pons action scores select exactly one canonical exact-winning P0 witness per unresolved root using the proof-frontier max-score/center-priority rule. Defender-consequence classification uses only legal C4-0010 transitions and structural I/E(O) predicates. Scores are not proof premises.',
  totalPositiveCandidateMovesWithoutExpansion: totalPositiveMoves,
  averagePositiveMovesPerRoot: totalPositiveMoves / unresolvedRoots.length,
  positiveMoveCountHistogram: toObject(positiveMoveCountHistogram),
  selectedWitnessHardReplyHistogram: toObject(hardReplyHistogram),
  rootsWithExactlyOneHardReply: rootsWithOneHardReply,
  rootsWithAtMostTwoHardReplies: rootsWithTwoOrFewerHardReplies,
  rootsWithAtMostThreeHardReplies: rootsWithThreeOrFewerHardReplies,
  averageHardRepliesUnderSelectedWitness: totalHardReplies / unresolvedRoots.length,
  uniqueHardP0QStatesUnderSelectedWitnesses: hardKindStateIds.size,
  selectedMoveColumnHistogram: toObject(selectedMoveColumnHistogram),
  hardReplyColumnHistogram: toObject(hardReplyColumnHistogram),
  easiestBoundaryExamples: boundaryRows.slice(0, 60),
  hardestBoundaryExamples: boundaryRows.slice(-40).reverse(),
  interpretation: 'hardReplies counts defender consequences still outside I or E(O) under the canonical exact-winning proof witness. Small counts identify narrow missing structural-leaf targets without asserting equality between hard states.',
  theoremStatus: 'diagnostic/discovery control only; exact scores are not proof premises',
})}`);
