#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
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
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 262144 }),
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
const minHardHistogram = new Map();
const positiveMoveCountHistogram = new Map();
const bestHardColumnHistogram = new Map();
const hardReplyColumnHistogram = new Map();
const hardKindStateIds = new Set();
const boundaryRows = [];
let totalPositiveMoves = 0;
let totalBestHardReplies = 0;
let rootsWithOneHardReply = 0;
let rootsWithTwoOrFewerHardReplies = 0;
let rootsWithThreeOrFewerHardReplies = 0;

for (let index = 0; index < unresolvedRoots.length; index += 1) {
  const root = unresolvedRoots[index];
  const scores = scoreRows[index];
  const positiveMoves = [];
  for (const column of legalColumns(kernel, root.stateId)) {
    if (scores[column] <= 0 || scores[column] === PONS_INVALID_MOVE) continue;
    const defender = kernel.advance(root.stateId, column);
    if (defender < 0) throw new Error(`positive discovery move terminal/illegal at ${root.sequence}/${column + 1}`);
    const replyKinds = [];
    const hardReplies = [];
    for (const defenderColumn of legalColumns(kernel, defender)) {
      const attacker = kernel.advance(defender, defenderColumn);
      if (attacker === domain.QN_TERMINAL_WIN || attacker < 0) {
        throw new Error(`positive discovery move permits terminal/illegal defender edge at ${root.sequence}/${column + 1}/${defenderColumn + 1}`);
      }
      const kind = shallowP0Kind(kernel, attacker);
      replyKinds.push(kind);
      if (kind === 'H') {
        hardReplies.push(defenderColumn);
        hardKindStateIds.add(attacker);
      }
    }
    positiveMoves.push({
      column,
      score: scores[column],
      hardCount: hardReplies.length,
      hardReplies,
      replyKinds,
    });
  }
  if (positiveMoves.length === 0) throw new Error(`unresolved winning source root has no positive exact move: ${root.sequence}`);
  totalPositiveMoves += positiveMoves.length;
  histogramIncrement(positiveMoveCountHistogram, positiveMoves.length);
  positiveMoves.sort((left, right) =>
    left.hardCount - right.hardCount
    || right.score - left.score
    || Math.abs(left.column - 3) - Math.abs(right.column - 3)
    || left.column - right.column);
  const best = positiveMoves[0];
  histogramIncrement(minHardHistogram, best.hardCount);
  histogramIncrement(bestHardColumnHistogram, best.column + 1);
  totalBestHardReplies += best.hardCount;
  for (const reply of best.hardReplies) histogramIncrement(hardReplyColumnHistogram, reply + 1);
  if (best.hardCount === 1) rootsWithOneHardReply += 1;
  if (best.hardCount <= 2) rootsWithTwoOrFewerHardReplies += 1;
  if (best.hardCount <= 3) rootsWithThreeOrFewerHardReplies += 1;
  boundaryRows.push({
    sequence: root.sequence,
    positiveMoves: positiveMoves.length,
    bestMove: best.column + 1,
    bestScore: best.score,
    minimumHardReplies: best.hardCount,
    hardReplyColumns: best.hardReplies.map(column => column + 1),
    replyKinds: best.replyKinds,
  });
}

boundaryRows.sort((left, right) =>
  left.minimumHardReplies - right.minimumHardReplies
  || left.positiveMoves - right.positiveMoves
  || left.sequence.localeCompare(right.sequence));

const toObject = map => Object.fromEntries([...map.entries()].sort((a, b) => Number(a[0]) - Number(b[0])));

console.log(`UNRESOLVED_BOUNDARY=${JSON.stringify({
  kind: 'standard7x6-depth8-unresolved-boundary-census-v1',
  attribution: {
    researchDirectionAndStructuralTarget: 'Josh Oshiro',
    formalizationImplementationAndQualification: 'OpenAI ChatGPT',
  },
  unresolvedRoots: unresolvedRoots.length,
  discoveryAuthority: 'Pons action scores are used only to restrict the diagnostic to value-preserving P0 candidate moves. Hard-reply classification itself uses only legal C4-0010 transitions and structural I/E(O) predicates.',
  totalPositiveCandidateMoves: totalPositiveMoves,
  averagePositiveMovesPerRoot: totalPositiveMoves / unresolvedRoots.length,
  positiveMoveCountHistogram: toObject(positiveMoveCountHistogram),
  minimumHardReplyHistogram: toObject(minHardHistogram),
  rootsWithExactlyOneHardReply: rootsWithOneHardReply,
  rootsWithAtMostTwoHardReplies: rootsWithTwoOrFewerHardReplies,
  rootsWithAtMostThreeHardReplies: rootsWithThreeOrFewerHardReplies,
  averageMinimumHardReplies: totalBestHardReplies / unresolvedRoots.length,
  uniqueHardP0QStatesAcrossAllPositiveMoves: hardKindStateIds.size,
  bestMoveColumnHistogram: toObject(bestHardColumnHistogram),
  hardReplyColumnHistogramUnderBestMoves: toObject(hardReplyColumnHistogram),
  easiestBoundaryExamples: boundaryRows.slice(0, 60),
  hardestBoundaryExamples: boundaryRows.slice(-40).reverse(),
  interpretation: 'minimumHardReplies is the smallest number of defender consequences still outside I or E(O) after a value-preserving P0 move. A small histogram mass at 1 or 2 identifies the narrowest missing theorem targets without claiming those hard consequences are equivalent.',
  theoremStatus: 'diagnostic/discovery control only; exact scores are not proof premises',
})}`);
