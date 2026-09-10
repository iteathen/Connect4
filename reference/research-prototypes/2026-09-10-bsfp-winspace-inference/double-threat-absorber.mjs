import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { createConnectWinningLines } from '../../../components/bsfp/geometry.mjs';
import { createBsfpSupportLatticeProfile } from '../../../components/bsfp/support-lattice.mjs';
import {
  normalizeMinimalPacked42Antichain,
  normalizeMaximalPacked42Antichain,
  solveBsfpPacked42AntichainRootWdlRolling,
} from '../../../components/bsfp/ownership-antichain-packed42-rolling-solver.mjs';

const TWO32 = 0x1_0000_0000;
const TILE_SIZE = 8192;

function low32(value) { return value >>> 0; }
function high10(value) { return Math.floor(value / TWO32) >>> 0; }
function pack42(low, high) { return (low >>> 0) + (high >>> 0) * TWO32; }
function or42(left, right) { return pack42((low32(left) | low32(right)) >>> 0, (high10(left) | high10(right)) >>> 0); }
function and42(left, right) { return pack42((low32(left) & low32(right)) >>> 0, (high10(left) & high10(right)) >>> 0); }
function andNot42(left, right) { return pack42((low32(left) & ~low32(right)) >>> 0, (high10(left) & ~high10(right)) >>> 0); }
function subset42(left, right) {
  return ((low32(left) & ~low32(right)) >>> 0) === 0
    && ((high10(left) & ~high10(right)) >>> 0) === 0;
}
function hasCell(mask, cell) {
  return cell < 32 ? (low32(mask) & ((1 << cell) >>> 0)) !== 0 : (high10(mask) & (1 << (cell - 32))) !== 0;
}
function setCell(mask, cell) {
  return cell < 32
    ? pack42((low32(mask) | ((1 << cell) >>> 0)) >>> 0, high10(mask))
    : pack42(low32(mask), (high10(mask) | (1 << (cell - 32))) >>> 0);
}
function clearCell(mask, cell) {
  return cell < 32
    ? pack42((low32(mask) & ~((1 << cell) >>> 0)) >>> 0, high10(mask))
    : pack42(low32(mask), (high10(mask) & ~(1 << (cell - 32))) >>> 0);
}
function forEachSetCell(mask, callback) {
  let low = low32(mask);
  while (low !== 0) {
    const bit = (low & -low) >>> 0;
    callback(31 - Math.clz32(bit));
    low = (low & (low - 1)) >>> 0;
  }
  let high = high10(mask);
  while (high !== 0) {
    const bit = (high & -high) >>> 0;
    callback(32 + 31 - Math.clz32(bit));
    high = (high & (high - 1)) >>> 0;
  }
}

function supportUniverseMask(heights, columns) {
  let mask = 0;
  for (let column = 0; column < columns; column++) {
    for (let row = 0; row < heights[column]; row++) mask = setCell(mask, row * columns + column);
  }
  return mask;
}

function buildIncidence(columns, rows, connect) {
  const masks = createConnectWinningLines({ columns, rows, connect }).map((line) => line.reduce((mask, cell) => setCell(mask, cell), 0));
  const incidence = Array.from({ length: columns * rows }, () => []);
  for (const lineMask of masks) {
    for (let cell = 0; cell < columns * rows; cell++) if (hasCell(lineMask, cell)) incidence[cell].push(lineMask);
  }
  return { masks, incidence };
}

function normalizeMinimal(values) { return normalizeMinimalPacked42Antichain(values); }
function normalizeMaximal(values) { return normalizeMaximalPacked42Antichain(values); }

function subtractUpwardFromDownward(downward, forbiddenUpward) {
  if (downward.length === 0 || forbiddenUpward.length === 0) return Object.freeze(downward.slice());
  const result = [];
  for (const cap of downward) {
    let candidates = [cap];
    for (const forbidden of forbiddenUpward) {
      const next = [];
      for (const candidate of candidates) {
        if (!subset42(forbidden, candidate)) { next.push(candidate); continue; }
        forEachSetCell(forbidden, (cell) => next.push(clearCell(candidate, cell)));
      }
      candidates = normalizeMaximal(next);
      if (candidates.length === 0) break;
    }
    result.push(...candidates);
  }
  return normalizeMaximal(result);
}

function subtractDownwardFromUpward(upward, forbiddenDownward, universeMask) {
  if (upward.length === 0 || forbiddenDownward.length === 0) return Object.freeze(upward.slice());
  const result = [];
  for (const base of upward) {
    let candidates = [base];
    for (const forbidden of forbiddenDownward) {
      const next = [];
      for (const candidate of candidates) {
        if (!subset42(candidate, forbidden)) { next.push(candidate); continue; }
        const available = andNot42(universeMask, forbidden);
        forEachSetCell(available, (cell) => next.push(setCell(candidate, cell)));
      }
      candidates = normalizeMinimal(next);
      if (candidates.length === 0) break;
    }
    result.push(...candidates);
  }
  return normalizeMinimal(result);
}

function terminalRequirements({ heights, columns, rows, incidence, universeMask }) {
  const entries = [];
  for (let column = 0; column < columns; column++) {
    const row = heights[column];
    if (row >= rows) continue;
    const landingCell = row * columns + column;
    const requirements = [];
    for (const lineMask of incidence[landingCell]) {
      const required = clearCell(lineMask, landingCell);
      if (subset42(required, universeMask)) requirements.push(required);
    }
    entries.push({ column, landingCell, requirements: normalizeMinimal(requirements) });
  }
  return entries;
}

/**
 * Exact local certificate under the C4-0008 nonterminal-predecessor semantics.
 * Two distinct currently playable completion cells cannot both be blocked in one move.
 * The mover's own immediate-win region is subtracted because it terminates first.
 */
export function deriveDoubleThreatAbsorber({ rank, universeMask, playableRequirements }) {
  const mover = rank & 1;
  if (playableRequirements.length < 2) return Object.freeze({ direction: mover === 0 ? 'maximal-loss' : 'minimal-win', frontier: Object.freeze([]), rawPairWitnesses: 0 });
  const raw = [];
  let witnesses = 0;
  for (let left = 0; left < playableRequirements.length; left++) {
    const a = playableRequirements[left];
    if (a.requirements.length === 0) continue;
    for (let right = left + 1; right < playableRequirements.length; right++) {
      const b = playableRequirements[right];
      if (b.requirements.length === 0 || a.landingCell === b.landingCell) continue;
      for (const qa of a.requirements) for (const qb of b.requirements) {
        witnesses++;
        raw.push(mover === 0 ? andNot42(universeMask, or42(qa, qb)) : or42(qa, qb));
      }
    }
  }
  if (raw.length === 0) return Object.freeze({ direction: mover === 0 ? 'maximal-loss' : 'minimal-win', frontier: Object.freeze([]), rawPairWitnesses: witnesses });
  const ownImmediateRequirements = normalizeMinimal(playableRequirements.flatMap((entry) => entry.requirements));
  if (mover === 0) {
    const rawLoss = normalizeMaximal(raw);
    return Object.freeze({ direction: 'maximal-loss', frontier: subtractUpwardFromDownward(rawLoss, ownImmediateRequirements), rawPairWitnesses: witnesses });
  }
  const opponentImmediateLossCaps = normalizeMaximal(ownImmediateRequirements.map((required) => andNot42(universeMask, required)));
  const rawWin = normalizeMinimal(raw);
  return Object.freeze({ direction: 'minimal-win', frontier: subtractDownwardFromUpward(rawWin, opponentImmediateLossCaps, universeMask), rawPairWitnesses: witnesses });
}

function cofactorTarget(frontier, landingCell, mover) {
  const result = [];
  if (mover === 0) {
    // P0-to-move target is the maximal Loss frontier.
    for (const mask of frontier) if (hasCell(mask, landingCell)) result.push(clearCell(mask, landingCell));
    return normalizeMaximal(result);
  }
  // P1-to-move target is the minimal Win frontier.
  for (const mask of frontier) if (!hasCell(mask, landingCell)) result.push(mask);
  return normalizeMinimal(result);
}

function targetMoveFrontier({ child, mover, landingCell, requirements, universeMask }) {
  if (mover === 0) {
    let losses = cofactorTarget(child.losses, landingCell, mover);
    if (requirements.length) losses = subtractUpwardFromDownward(losses, requirements);
    return losses;
  }
  let wins = cofactorTarget(child.wins, landingCell, mover);
  if (requirements.length) {
    const terminalLossCaps = normalizeMaximal(requirements.map((required) => andNot42(universeMask, required)));
    wins = subtractDownwardFromUpward(wins, terminalLossCaps, universeMask);
  }
  return wins;
}

function seedCovers(seed, candidate, mover) {
  if (mover === 0) return seed.some((cap) => subset42(candidate, cap));
  return seed.some((minimum) => subset42(minimum, candidate));
}

function pairIntersect(left, right, mover, stats, seed = Object.freeze([])) {
  if (left.length === 0 || right.length === 0) return Object.freeze([]);
  const baselinePotential = left.length * right.length;
  const filteredLeft = seed.length ? left.filter((value) => !seedCovers(seed, value, mover)) : left;
  const filteredRight = seed.length ? right.filter((value) => !seedCovers(seed, value, mover)) : right;
  stats.rawPairPotential += baselinePotential;
  stats.preMaterializationPairsAvoided += baselinePotential - filteredLeft.length * filteredRight.length;
  stats.inputRecordsAbsorbed += (left.length - filteredLeft.length) + (right.length - filteredRight.length);
  if (filteredLeft.length === 0 || filteredRight.length === 0) return Object.freeze([]);
  let frontier = Object.freeze([]);
  let tile = [];
  const normalize = mover === 0 ? normalizeMaximal : normalizeMinimal;
  const combine = mover === 0 ? and42 : or42;
  function flush() {
    if (!tile.length) return;
    stats.normalizationInputRecords += tile.length;
    const reduced = normalize(tile);
    stats.normalizationInputRecords += frontier.length + reduced.length;
    frontier = normalize([...frontier, ...reduced]);
    tile = [];
  }
  for (const a of filteredLeft) for (const b of filteredRight) {
    const candidate = combine(a, b);
    stats.generatedPairCandidates++;
    if (seed.length && seedCovers(seed, candidate, mover)) {
      stats.postCombineAbsorbed++;
      continue;
    }
    tile.push(candidate);
    if (tile.length >= TILE_SIZE) flush();
  }
  flush();
  return frontier;
}

function simulateTargetIntersection(moveFrontiers, mover, seed) {
  const stats = { rawPairPotential: 0, generatedPairCandidates: 0, preMaterializationPairsAvoided: 0, postCombineAbsorbed: 0, inputRecordsAbsorbed: 0, normalizationInputRecords: 0 };
  if (!moveFrontiers.length) return { frontier: Object.freeze([]), stats };
  let aggregate = seed.length ? moveFrontiers[0].filter((value) => !seedCovers(seed, value, mover)) : moveFrontiers[0];
  stats.inputRecordsAbsorbed += moveFrontiers[0].length - aggregate.length;
  for (let index = 1; index < moveFrontiers.length; index++) aggregate = pairIntersect(aggregate, moveFrontiers[index], mover, stats, seed);
  const normalize = mover === 0 ? normalizeMaximal : normalizeMinimal;
  return { frontier: normalize([...seed, ...aggregate]), stats };
}

function frontierEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function seedContained(seed, exact, mover) {
  if (mover === 0) return seed.every((cap) => exact.some((maximum) => subset42(cap, maximum)));
  return seed.every((minimum) => exact.some((generator) => subset42(generator, minimum)));
}

export function evaluateDoubleThreatAbsorberGeometry({ columns, rows, connect }) {
  const started = performance.now();
  const allFrontiers = new Map();
  const cpu = solveBsfpPacked42AntichainRootWdlRolling({ columns, rows, connect, candidateTileSize: TILE_SIZE,
    onFrontier(item, frontier) { allFrontiers.set(item, frontier); } });
  const support = createBsfpSupportLatticeProfile({ columns, rows, connect });
  const { incidence } = buildIncidence(columns, rows, connect);
  const totals = {
    supports: support.itemCapacity,
    supportsWithSeed: 0,
    seedRecords: 0,
    rawPairWitnesses: 0,
    baselinePairCandidates: 0,
    absorberPairCandidates: 0,
    preMaterializationPairsAvoided: 0,
    postCombineAbsorbed: 0,
    absorberInputRecords: 0,
    absorberNormalizationInputRecords: 0,
    unsoundSeeds: 0,
    baselineFrontierMismatches: 0,
    absorberFrontierMismatches: 0,
  };
  const byRank = Array.from({ length: support.maxRank + 1 }, (_, rank) => ({ rank, supports: 0, supportsWithSeed: 0, seedRecords: 0, baselinePairs: 0, absorberPairs: 0, preMaterializationPairsAvoided: 0 }));

  for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex++) {
    const rank = support.ranks[supportIndex];
    const mover = rank & 1;
    const heights = support.decodeHeights(supportIndex);
    const universeMask = supportUniverseMask(heights, columns);
    const playable = terminalRequirements({ heights, columns, rows, incidence, universeMask });
    const absorber = deriveDoubleThreatAbsorber({ rank, universeMask, playableRequirements: playable });
    const exactFrontier = allFrontiers.get(supportIndex);
    const exactTarget = mover === 0 ? exactFrontier.losses : exactFrontier.wins;
    byRank[rank].supports++;
    totals.rawPairWitnesses += absorber.rawPairWitnesses;
    if (absorber.frontier.length) {
      totals.supportsWithSeed++;
      totals.seedRecords += absorber.frontier.length;
      byRank[rank].supportsWithSeed++;
      byRank[rank].seedRecords += absorber.frontier.length;
      if (!seedContained(absorber.frontier, exactTarget, mover)) totals.unsoundSeeds++;
    }
    if (rank === support.maxRank) continue;
    const moves = [];
    for (const entry of playable) {
      const childIndex = supportIndex + support.weights[entry.column];
      const child = allFrontiers.get(childIndex);
      assert(child, `missing child frontier ${childIndex}`);
      moves.push(targetMoveFrontier({ child, mover, landingCell: entry.landingCell, requirements: entry.requirements, universeMask }));
    }
    const baseline = simulateTargetIntersection(moves, mover, Object.freeze([]));
    const inferred = simulateTargetIntersection(moves, mover, absorber.frontier);
    totals.baselinePairCandidates += baseline.stats.generatedPairCandidates;
    totals.absorberPairCandidates += inferred.stats.generatedPairCandidates;
    totals.preMaterializationPairsAvoided += inferred.stats.preMaterializationPairsAvoided;
    totals.postCombineAbsorbed += inferred.stats.postCombineAbsorbed;
    totals.absorberInputRecords += inferred.stats.inputRecordsAbsorbed;
    totals.absorberNormalizationInputRecords += inferred.stats.normalizationInputRecords;
    byRank[rank].baselinePairs += baseline.stats.generatedPairCandidates;
    byRank[rank].absorberPairs += inferred.stats.generatedPairCandidates;
    byRank[rank].preMaterializationPairsAvoided += inferred.stats.preMaterializationPairsAvoided;
    if (!frontierEqual(baseline.frontier, exactTarget)) totals.baselineFrontierMismatches++;
    if (!frontierEqual(inferred.frontier, exactTarget)) totals.absorberFrontierMismatches++;
  }

  assert.equal(totals.baselinePairCandidates, cpu.stats.generatedPairCandidates, 'research harness must reproduce baseline aggregate pair count');
  const pairReduction = totals.baselinePairCandidates === 0 ? 0 : 1 - totals.absorberPairCandidates / totals.baselinePairCandidates;
  return Object.freeze({
    geometry: `${columns}x${rows}:c${connect}`,
    rootWdl: cpu.rootWdl,
    durationMs: performance.now() - started,
    ...totals,
    pairReduction,
    sound: totals.unsoundSeeds === 0 && totals.baselineFrontierMismatches === 0 && totals.absorberFrontierMismatches === 0,
    byRank: byRank.filter((entry) => entry.supportsWithSeed || entry.baselinePairs),
  });
}

if (import.meta.url === new URL(`file://${process.argv[1]?.replaceAll('\\', '/')}`).href) {
  const requested = process.argv.slice(2);
  const geometries = requested.length ? requested : ['4x3:c3', '4x4:c4', '5x3:c4', '4x5:c4', '5x4:c4', '5x5:c4'];
  const results = geometries.map((text) => {
    const match = text.match(/^(\d+)x(\d+):c(\d+)$/);
    if (!match) throw new RangeError(`invalid geometry ${text}`);
    return evaluateDoubleThreatAbsorberGeometry({ columns: Number(match[1]), rows: Number(match[2]), connect: Number(match[3]) });
  });
  console.log(JSON.stringify({
    kind: 'connect4-bsfp-double-threat-absorber-research',
    outcome: results.every((result) => result.sound) ? 'sound-on-tested-complete-games' : 'candidate-falsified',
    results,
  }, null, 2));
}
