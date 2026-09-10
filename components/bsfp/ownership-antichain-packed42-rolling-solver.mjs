import { createConnectWinningLines } from './geometry.mjs';
import { createBsfpSupportLatticeProfile } from './support-lattice.mjs';

const TWO32 = 0x1_0000_0000;
const MAX_MASK_42 = 2 ** 42 - 1;

function positiveSafeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${label} must be a positive safe integer`);
  return value;
}

function mask42(value, label = 'mask') {
  if (!Number.isSafeInteger(value) || value < 0 || value > MAX_MASK_42) {
    throw new RangeError(`${label} must be an exact nonnegative 42-bit integer mask`);
  }
  return value;
}

function low32(value) {
  return value >>> 0;
}

function high10(value) {
  return Math.floor(value / TWO32) >>> 0;
}

function pack42(low, high) {
  return (low >>> 0) + (high >>> 0) * TWO32;
}

function or42(left, right) {
  return pack42((low32(left) | low32(right)) >>> 0, (high10(left) | high10(right)) >>> 0);
}

function and42(left, right) {
  return pack42((low32(left) & low32(right)) >>> 0, (high10(left) & high10(right)) >>> 0);
}

function andNot42(left, right) {
  return pack42((low32(left) & ~low32(right)) >>> 0, (high10(left) & ~high10(right)) >>> 0);
}

function subset42(left, right) {
  return ((low32(left) & ~low32(right)) >>> 0) === 0
    && ((high10(left) & ~high10(right)) >>> 0) === 0;
}

function hasCell(mask, cell) {
  return cell < 32
    ? (low32(mask) & ((1 << cell) >>> 0)) !== 0
    : (high10(mask) & (1 << (cell - 32))) !== 0;
}

function setCell(mask, cell) {
  if (cell < 32) return pack42((low32(mask) | ((1 << cell) >>> 0)) >>> 0, high10(mask));
  return pack42(low32(mask), (high10(mask) | (1 << (cell - 32))) >>> 0);
}

function clearCell(mask, cell) {
  if (cell < 32) return pack42((low32(mask) & ~((1 << cell) >>> 0)) >>> 0, high10(mask));
  return pack42(low32(mask), (high10(mask) & ~(1 << (cell - 32))) >>> 0);
}

function pop32(value) {
  let x = value >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return Math.imul((x + (x >>> 4)) & 0x0f0f0f0f, 0x01010101) >>> 24;
}

function popcount42(mask) {
  return pop32(low32(mask)) + pop32(high10(mask));
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

function orderedUnique42(masks, descending) {
  const unique = new Set();
  for (let index = 0; index < masks.length; index += 1) unique.add(mask42(masks[index], `masks[${index}]`));
  const buckets = Array.from({ length: 43 }, () => []);
  for (const mask of unique) buckets[popcount42(mask)].push(mask);
  const result = [];
  if (descending) {
    for (let count = 42; count >= 0; count -= 1) {
      buckets[count].sort((a, b) => b - a);
      result.push(...buckets[count]);
    }
  } else {
    for (let count = 0; count <= 42; count += 1) {
      buckets[count].sort((a, b) => a - b);
      result.push(...buckets[count]);
    }
  }
  return result;
}

export function normalizeMinimalPacked42Antichain(masks) {
  const ordered = orderedUnique42(masks, false);
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) if (subset42(retained, candidate)) continue outer;
    result.push(candidate);
  }
  return Object.freeze(result);
}

export function normalizeMaximalPacked42Antichain(masks) {
  const ordered = orderedUnique42(masks, true);
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) if (subset42(candidate, retained)) continue outer;
    result.push(candidate);
  }
  return Object.freeze(result);
}

function normalizeMinimal(masks, stats) {
  stats.normalizationCalls += 1;
  stats.maximumNormalizationInput = Math.max(stats.maximumNormalizationInput, masks.length);
  return normalizeMinimalPacked42Antichain(masks);
}

function normalizeMaximal(masks, stats) {
  stats.normalizationCalls += 1;
  stats.maximumNormalizationInput = Math.max(stats.maximumNormalizationInput, masks.length);
  return normalizeMaximalPacked42Antichain(masks);
}

function unionUpward(left, right, stats) {
  return normalizeMinimal([...left, ...right], stats);
}

function unionDownward(left, right, stats) {
  return normalizeMaximal([...left, ...right], stats);
}

function tiledPairReduce(left, right, combine, normalize, tileSize, stats) {
  if (left.length === 0 || right.length === 0) return Object.freeze([]);
  let frontier = Object.freeze([]);
  let tile = [];

  function flush() {
    if (tile.length === 0) return;
    stats.candidateTiles += 1;
    stats.maximumCandidateTile = Math.max(stats.maximumCandidateTile, tile.length);
    const reducedTile = normalize(tile, stats);
    frontier = normalize([...frontier, ...reducedTile], stats);
    tile = [];
  }

  for (const a of left) {
    for (const b of right) {
      tile.push(combine(a, b));
      stats.generatedPairCandidates += 1;
      if (tile.length >= tileSize) flush();
    }
  }
  flush();
  return frontier;
}

function intersectUpward(left, right, tileSize, stats) {
  return tiledPairReduce(left, right, or42, normalizeMinimal, tileSize, stats);
}

function intersectDownward(left, right, tileSize, stats) {
  return tiledPairReduce(left, right, and42, normalizeMaximal, tileSize, stats);
}

function cofactorUpward(frontier, landingCell, mover, stats) {
  const result = [];
  if (mover === 0) {
    for (const mask of frontier) result.push(clearCell(mask, landingCell));
  } else {
    for (const mask of frontier) if (!hasCell(mask, landingCell)) result.push(mask);
  }
  return normalizeMinimal(result, stats);
}

function cofactorDownward(frontier, landingCell, mover, stats) {
  const result = [];
  if (mover === 0) {
    for (const mask of frontier) if (hasCell(mask, landingCell)) result.push(clearCell(mask, landingCell));
  } else {
    for (const mask of frontier) result.push(clearCell(mask, landingCell));
  }
  return normalizeMaximal(result, stats);
}

function subtractUpwardFromDownward(downward, forbiddenUpward, stats) {
  if (downward.length === 0 || forbiddenUpward.length === 0) return Object.freeze(downward.slice());
  const result = [];
  for (const cap of downward) {
    let candidates = [cap];
    for (const forbidden of forbiddenUpward) {
      const next = [];
      for (const candidate of candidates) {
        if (!subset42(forbidden, candidate)) {
          next.push(candidate);
          continue;
        }
        forEachSetCell(forbidden, (cell) => next.push(clearCell(candidate, cell)));
      }
      candidates = normalizeMaximal(next, stats);
      if (candidates.length === 0) break;
    }
    result.push(...candidates);
  }
  return normalizeMaximal(result, stats);
}

function subtractDownwardFromUpward(upward, forbiddenDownward, universeMask, stats) {
  if (upward.length === 0 || forbiddenDownward.length === 0) return Object.freeze(upward.slice());
  const result = [];
  for (const base of upward) {
    let candidates = [base];
    for (const forbidden of forbiddenDownward) {
      const next = [];
      for (const candidate of candidates) {
        if (!subset42(candidate, forbidden)) {
          next.push(candidate);
          continue;
        }
        const available = andNot42(universeMask, forbidden);
        forEachSetCell(available, (cell) => next.push(setCell(candidate, cell)));
      }
      candidates = normalizeMinimal(next, stats);
      if (candidates.length === 0) break;
    }
    result.push(...candidates);
  }
  return normalizeMinimal(result, stats);
}

function supportUniverseMask(heights, columns) {
  let mask = 0;
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < heights[column]; row += 1) mask = setCell(mask, row * columns + column);
  }
  return mask;
}

function buildLineMasks(columns, rows, connect) {
  return Object.freeze(createConnectWinningLines({ columns, rows, connect }).map((line) => {
    let mask = 0;
    for (const cell of line) mask = setCell(mask, cell);
    return mask;
  }));
}

function buildLineIncidence(lineMasks, cellCount) {
  const incidence = Array.from({ length: cellCount }, () => []);
  for (const lineMask of lineMasks) {
    for (let cell = 0; cell < cellCount; cell += 1) if (hasCell(lineMask, cell)) incidence[cell].push(lineMask);
  }
  return Object.freeze(incidence.map((entry) => Object.freeze(entry)));
}

function assertFrontierUniverse(frontier, universeMask, label) {
  for (const mask of frontier) if (!subset42(mask, universeMask)) throw new Error(`${label} escaped its support universe`);
}

function frontiersOverlap(wins, losses) {
  for (const win of wins) for (const loss of losses) if (subset42(win, loss)) return true;
  return false;
}

export function classifyPacked42AntichainWdl({ wins, losses }, p0OwnershipMask) {
  const p0 = mask42(p0OwnershipMask, 'p0OwnershipMask');
  const win = wins.some((minimum) => subset42(minimum, p0));
  const loss = losses.some((maximum) => subset42(p0, maximum));
  if (win && loss) throw new Error('packed42 ownership antichain frontiers overlap');
  return win ? 1 : loss ? -1 : 0;
}

function createRankItems(support) {
  const ranks = Array.from({ length: support.maxRank + 1 }, () => []);
  for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) ranks[support.ranks[supportIndex]].push(supportIndex);
  return Object.freeze(ranks.map((items) => Object.freeze(items)));
}

function solveSupport({ supportIndex, rank, support, childRank, columns, rows, incidence, candidateTileSize, stats }) {
  const heights = support.decodeHeights(supportIndex);
  const mover = rank & 1;
  const universeMask = supportUniverseMask(heights, columns);
  let aggregateWins = null;
  let aggregateLosses = null;

  for (let column = 0; column < columns; column += 1) {
    const row = heights[column];
    if (row >= rows) continue;
    const landingCell = row * columns + column;
    const childSupportIndex = supportIndex + support.weights[column];
    const child = childRank.get(childSupportIndex);
    if (!child) throw new Error(`packed42 rolling child ${childSupportIndex} is unavailable at rank ${rank + 1}`);

    let moveWins = cofactorUpward(child.wins, landingCell, mover, stats);
    let moveLosses = cofactorDownward(child.losses, landingCell, mover, stats);

    if (mover === 0) {
      const terminalWins = [];
      for (const lineMask of incidence[landingCell]) {
        const requiredP0 = clearCell(lineMask, landingCell);
        if (subset42(requiredP0, universeMask)) terminalWins.push(requiredP0);
      }
      const terminalWinFrontier = normalizeMinimal(terminalWins, stats);
      if (terminalWinFrontier.length > 0) {
        moveLosses = subtractUpwardFromDownward(moveLosses, terminalWinFrontier, stats);
        stats.terminalWinSubtractions += 1;
        moveWins = unionUpward(moveWins, terminalWinFrontier, stats);
      }
    } else {
      const terminalLosses = [];
      for (const lineMask of incidence[landingCell]) {
        const requiredP1 = clearCell(lineMask, landingCell);
        if (subset42(requiredP1, universeMask)) terminalLosses.push(andNot42(universeMask, requiredP1));
      }
      const terminalLossFrontier = normalizeMaximal(terminalLosses, stats);
      if (terminalLossFrontier.length > 0) {
        moveWins = subtractDownwardFromUpward(moveWins, terminalLossFrontier, universeMask, stats);
        stats.terminalLossSubtractions += 1;
        moveLosses = unionDownward(moveLosses, terminalLossFrontier, stats);
      }
    }

    if (aggregateWins === null) {
      aggregateWins = moveWins;
      aggregateLosses = moveLosses;
    } else if (mover === 0) {
      aggregateWins = unionUpward(aggregateWins, moveWins, stats);
      aggregateLosses = intersectDownward(aggregateLosses, moveLosses, candidateTileSize, stats);
    } else {
      aggregateWins = intersectUpward(aggregateWins, moveWins, candidateTileSize, stats);
      aggregateLosses = unionDownward(aggregateLosses, moveLosses, stats);
    }
  }

  const wins = aggregateWins ?? Object.freeze([]);
  const losses = aggregateLosses ?? Object.freeze([]);
  assertFrontierUniverse(wins, universeMask, 'Win frontier');
  assertFrontierUniverse(losses, universeMask, 'Loss frontier');
  if (frontiersOverlap(wins, losses)) throw new Error(`packed42 ownership antichain contradiction at support ${supportIndex}`);
  return Object.freeze({ wins, losses });
}

/** Exact root-only BSFP control using a 42-bit Number mask that maps losslessly to two u32 CUDA lanes. */
export function solveBsfpPacked42AntichainRootWdlRolling({
  columns,
  rows,
  connect,
  supportShardSize = 2048,
  candidateTileSize = 8192,
}) {
  if (!Number.isSafeInteger(columns) || !Number.isSafeInteger(rows) || columns < 1 || rows < 1) throw new RangeError('geometry dimensions must be positive safe integers');
  if (columns * rows > 42) throw new RangeError('packed42 BSFP reference supports at most 42 cells');
  const shardSize = positiveSafeInteger(supportShardSize, 'supportShardSize');
  const tileSize = positiveSafeInteger(candidateTileSize, 'candidateTileSize');
  const support = createBsfpSupportLatticeProfile({ columns, rows, connect });
  const lineMasks = buildLineMasks(columns, rows, connect);
  const incidence = buildLineIncidence(lineMasks, columns * rows);
  const rankItems = createRankItems(support);
  const stats = {
    totalWinRecords: 0,
    totalLossRecords: 0,
    maximumWinFrontier: 0,
    maximumLossFrontier: 0,
    terminalWinSubtractions: 0,
    terminalLossSubtractions: 0,
    peakRankBoundaryRecords: 0,
    peakResidentBoundaryRecords: 0,
    peakRankSupportCount: 0,
    totalShards: 0,
    generatedPairCandidates: 0,
    candidateTiles: 0,
    maximumCandidateTile: 0,
    normalizationCalls: 0,
    maximumNormalizationInput: 0,
  };
  const rankSummaries = [];
  let childRank = new Map();
  let childBoundaryRecords = 0;

  for (let rank = support.maxRank; rank >= 0; rank -= 1) {
    const items = rankItems[rank];
    const currentRank = new Map();
    let rankWinRecords = 0;
    let rankLossRecords = 0;
    let rankMaximumWinFrontier = 0;
    let rankMaximumLossFrontier = 0;
    let rankShards = 0;

    for (let shardStart = 0; shardStart < items.length; shardStart += shardSize) {
      const shardEnd = Math.min(items.length, shardStart + shardSize);
      rankShards += 1;
      stats.totalShards += 1;
      for (let offset = shardStart; offset < shardEnd; offset += 1) {
        const supportIndex = items[offset];
        const frontier = rank === support.maxRank
          ? Object.freeze({ wins: Object.freeze([]), losses: Object.freeze([]) })
          : solveSupport({ supportIndex, rank, support, childRank, columns, rows, incidence, candidateTileSize: tileSize, stats });
        currentRank.set(supportIndex, frontier);
        rankWinRecords += frontier.wins.length;
        rankLossRecords += frontier.losses.length;
        rankMaximumWinFrontier = Math.max(rankMaximumWinFrontier, frontier.wins.length);
        rankMaximumLossFrontier = Math.max(rankMaximumLossFrontier, frontier.losses.length);
        stats.maximumWinFrontier = Math.max(stats.maximumWinFrontier, frontier.wins.length);
        stats.maximumLossFrontier = Math.max(stats.maximumLossFrontier, frontier.losses.length);
      }
      stats.peakResidentBoundaryRecords = Math.max(stats.peakResidentBoundaryRecords, childBoundaryRecords + rankWinRecords + rankLossRecords);
    }

    const rankBoundaryRecords = rankWinRecords + rankLossRecords;
    stats.totalWinRecords += rankWinRecords;
    stats.totalLossRecords += rankLossRecords;
    stats.peakRankBoundaryRecords = Math.max(stats.peakRankBoundaryRecords, rankBoundaryRecords);
    stats.peakRankSupportCount = Math.max(stats.peakRankSupportCount, items.length);
    rankSummaries.push(Object.freeze({
      rank,
      supportCount: items.length,
      shardCount: rankShards,
      winRecords: rankWinRecords,
      lossRecords: rankLossRecords,
      boundaryRecords: rankBoundaryRecords,
      maximumWinFrontier: rankMaximumWinFrontier,
      maximumLossFrontier: rankMaximumLossFrontier,
    }));
    childRank = currentRank;
    childBoundaryRecords = rankBoundaryRecords;
  }

  const root = childRank.get(0);
  if (!root) throw new Error('packed42 rolling root frontier was not produced');
  const rootWdl = classifyPacked42AntichainWdl(root, 0);
  const totalBoundaryRecords = stats.totalWinRecords + stats.totalLossRecords;
  return Object.freeze({
    kind: 'connect4-bsfp-packed42-antichain-root-wdl-rolling-reference',
    columns,
    rows,
    connect,
    support,
    winningLineCount: lineMasks.length,
    rootWdl,
    rootFrontier: root,
    execution: Object.freeze({ rankWindow: 2, supportShardSize: shardSize, candidateTileSize: tileSize, maskRepresentation: 'exact-number-42-two-u32-compatible' }),
    stats: Object.freeze({
      ...stats,
      totalBoundaryRecords,
      retainedBoundaryRecordsAtEnd: root.wins.length + root.losses.length,
      peakResidentToTotalBoundaryRatio: totalBoundaryRecords === 0 ? 0 : stats.peakResidentBoundaryRecords / totalBoundaryRecords,
      rankSummaries: Object.freeze(rankSummaries),
    }),
  });
}
