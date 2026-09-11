import { createConnectWinningLines } from './geometry.mjs';
import { createBsfpSupportLatticeProfile } from './support-lattice.mjs';
import {
  classifyOwnershipAntichainWdl,
  normalizeMaximalOwnershipAntichain,
  normalizeMinimalOwnershipAntichain,
} from './ownership-antichain-solver.mjs';

function positiveSafeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${label} must be a positive safe integer`);
  return value;
}

function normalizeMinimal(masks, stats) {
  stats.normalizationCalls += 1;
  stats.maximumNormalizationInput = Math.max(stats.maximumNormalizationInput, masks.length);
  return normalizeMinimalOwnershipAntichain(masks);
}

function normalizeMaximal(masks, stats) {
  stats.normalizationCalls += 1;
  stats.maximumNormalizationInput = Math.max(stats.maximumNormalizationInput, masks.length);
  return normalizeMaximalOwnershipAntichain(masks);
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
    const unique = [...new Set(tile)];
    const reducedTile = normalize(unique, stats);
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
  return tiledPairReduce(left, right, (a, b) => a | b, normalizeMinimal, tileSize, stats);
}

function intersectDownward(left, right, tileSize, stats) {
  return tiledPairReduce(left, right, (a, b) => a & b, normalizeMaximal, tileSize, stats);
}

function cofactorUpward(frontier, landingBit, mover, stats) {
  const result = [];
  if (mover === 0) {
    for (const mask of frontier) result.push(mask & ~landingBit);
  } else {
    for (const mask of frontier) if ((mask & landingBit) === 0n) result.push(mask);
  }
  return normalizeMinimal(result, stats);
}

function cofactorDownward(frontier, landingBit, mover, stats) {
  const result = [];
  if (mover === 0) {
    for (const mask of frontier) if ((mask & landingBit) !== 0n) result.push(mask & ~landingBit);
  } else {
    for (const mask of frontier) result.push(mask & ~landingBit);
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
        if ((forbidden & ~candidate) !== 0n) {
          next.push(candidate);
          continue;
        }
        for (let bits = forbidden; bits !== 0n; bits &= bits - 1n) {
          const bit = bits & -bits;
          next.push(candidate & ~bit);
        }
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
        if ((candidate & ~forbidden) !== 0n) {
          next.push(candidate);
          continue;
        }
        const available = universeMask & ~forbidden;
        for (let bits = available; bits !== 0n; bits &= bits - 1n) {
          const bit = bits & -bits;
          next.push(candidate | bit);
        }
      }
      candidates = normalizeMinimal(next, stats);
      if (candidates.length === 0) break;
    }
    result.push(...candidates);
  }
  return normalizeMinimal(result, stats);
}

function supportUniverseMask(heights, columns) {
  let mask = 0n;
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < heights[column]; row += 1) mask |= 1n << BigInt(row * columns + column);
  }
  return mask;
}

function buildLineIncidence(lineMasks, cellCount) {
  const incidence = Array.from({ length: cellCount }, () => []);
  for (const lineMask of lineMasks) {
    for (let cell = 0; cell < cellCount; cell += 1) {
      if ((lineMask & (1n << BigInt(cell))) !== 0n) incidence[cell].push(lineMask);
    }
  }
  return Object.freeze(incidence.map((entry) => Object.freeze(entry)));
}

function assertFrontierUniverse(frontier, universeMask, label) {
  for (const mask of frontier) {
    if ((mask & ~universeMask) !== 0n) throw new Error(`${label} escaped its support universe`);
  }
}

function frontiersOverlap(wins, losses) {
  for (const win of wins) for (const loss of losses) if ((win & ~loss) === 0n) return true;
  return false;
}

function createRankItems(support) {
  const ranks = Array.from({ length: support.maxRank + 1 }, () => []);
  for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
    ranks[support.ranks[supportIndex]].push(supportIndex);
  }
  return Object.freeze(ranks.map((items) => Object.freeze(items)));
}

function solveSupport({
  supportIndex,
  rank,
  support,
  childRank,
  columns,
  rows,
  incidence,
  candidateTileSize,
  stats,
}) {
  const heights = support.decodeHeights(supportIndex);
  const mover = rank & 1;
  const universeMask = supportUniverseMask(heights, columns);
  let aggregateWins = null;
  let aggregateLosses = null;

  for (let column = 0; column < columns; column += 1) {
    const row = heights[column];
    if (row >= rows) continue;
    const landingCell = row * columns + column;
    const landingBit = 1n << BigInt(landingCell);
    const childSupportIndex = supportIndex + support.weights[column];
    const child = childRank.get(childSupportIndex);
    if (!child) throw new Error(`rolling ownership antichain child ${childSupportIndex} is unavailable at rank ${rank + 1}`);

    let moveWins = cofactorUpward(child.wins, landingBit, mover, stats);
    let moveLosses = cofactorDownward(child.losses, landingBit, mover, stats);

    if (mover === 0) {
      const terminalWins = [];
      for (const lineMask of incidence[landingCell]) {
        const requiredP0 = lineMask & ~landingBit;
        if ((requiredP0 & ~universeMask) === 0n) terminalWins.push(requiredP0);
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
        const requiredP1 = lineMask & ~landingBit;
        if ((requiredP1 & ~universeMask) === 0n) terminalLosses.push(universeMask & ~requiredP1);
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
  if (frontiersOverlap(wins, losses)) throw new Error(`rolling ownership antichain contradiction at support ${supportIndex}`);
  return Object.freeze({ wins, losses });
}

/**
 * Root-only direct BSFP W/D/L using a rolling two-rank window.
 *
 * Only rank r+1 is retained while rank r is produced. Current-rank supports
 * are processed in bounded shards, and pairwise antichain intersections are
 * reduced in bounded candidate tiles. This is the CPU reference execution
 * shape for a future bounded-arena CUDA profile; it does not enumerate the
 * physical colored-state graph or recursively search legal move trees.
 */
export function solveBsfpOwnershipAntichainRootWdlRolling({
  columns,
  rows,
  connect,
  supportShardSize = 2048,
  candidateTileSize = 8192,
}) {
  const shardSize = positiveSafeInteger(supportShardSize, 'supportShardSize');
  const tileSize = positiveSafeInteger(candidateTileSize, 'candidateTileSize');
  const support = createBsfpSupportLatticeProfile({ columns, rows, connect });
  const cellCount = columns * rows;
  const lines = createConnectWinningLines({ columns, rows, connect });
  const lineMasks = Object.freeze(lines.map((line) => {
    let mask = 0n;
    for (const cell of line) mask |= 1n << BigInt(cell);
    return mask;
  }));
  const incidence = buildLineIncidence(lineMasks, cellCount);
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
        let frontier;
        if (rank === support.maxRank) {
          frontier = Object.freeze({ wins: Object.freeze([]), losses: Object.freeze([]) });
        } else {
          frontier = solveSupport({
            supportIndex,
            rank,
            support,
            childRank,
            columns,
            rows,
            incidence,
            candidateTileSize: tileSize,
            stats,
          });
        }
        currentRank.set(supportIndex, frontier);
        rankWinRecords += frontier.wins.length;
        rankLossRecords += frontier.losses.length;
        rankMaximumWinFrontier = Math.max(rankMaximumWinFrontier, frontier.wins.length);
        rankMaximumLossFrontier = Math.max(rankMaximumLossFrontier, frontier.losses.length);
        stats.maximumWinFrontier = Math.max(stats.maximumWinFrontier, frontier.wins.length);
        stats.maximumLossFrontier = Math.max(stats.maximumLossFrontier, frontier.losses.length);
      }
      const producedBoundaryRecords = rankWinRecords + rankLossRecords;
      stats.peakResidentBoundaryRecords = Math.max(stats.peakResidentBoundaryRecords, childBoundaryRecords + producedBoundaryRecords);
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
  if (!root) throw new Error('rolling ownership antichain root frontier was not produced');
  const rootWdl = classifyOwnershipAntichainWdl(root, 0n);
  const totalBoundaryRecords = stats.totalWinRecords + stats.totalLossRecords;

  return Object.freeze({
    kind: 'connect4-bsfp-ownership-antichain-root-wdl-rolling-reference',
    columns,
    rows,
    connect,
    support,
    winningLineCount: lineMasks.length,
    rootWdl,
    rootFrontier: root,
    execution: Object.freeze({
      rankWindow: 2,
      supportShardSize: shardSize,
      candidateTileSize: tileSize,
    }),
    stats: Object.freeze({
      ...stats,
      totalBoundaryRecords,
      retainedBoundaryRecordsAtEnd: root.wins.length + root.losses.length,
      peakResidentToTotalBoundaryRatio: totalBoundaryRecords === 0 ? 0 : stats.peakResidentBoundaryRecords / totalBoundaryRecords,
      rankSummaries: Object.freeze(rankSummaries),
    }),
  });
}
