import { createConnectWinningLines } from '../../../components/bsfp/geometry.mjs';
import { createBsfpSupportLatticeProfile } from '../../../components/bsfp/support-lattice.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function popcount(mask) {
  let value = mask;
  let count = 0;
  while (value !== 0n) {
    value &= value - 1n;
    count += 1;
  }
  return count;
}

function subset(left, right) {
  return (left & ~right) === 0n;
}

export function lineProductLeq(left, right) {
  return subset(left.h0, right.h0) && subset(right.h1, left.h1);
}

function pairKey(pair) {
  return `${pair.h0.toString(16)}:${pair.h1.toString(16)}`;
}

function orderedUnique(pairs, maximal) {
  const unique = new Map();
  for (const pair of pairs) unique.set(pairKey(pair), Object.freeze({ h0: pair.h0, h1: pair.h1 }));
  return [...unique.values()].sort((left, right) => {
    const h0Delta = popcount(left.h0) - popcount(right.h0);
    if (h0Delta !== 0) return maximal ? -h0Delta : h0Delta;
    const h1Delta = popcount(left.h1) - popcount(right.h1);
    if (h1Delta !== 0) return maximal ? h1Delta : -h1Delta;
    if (left.h0 !== right.h0) return left.h0 < right.h0 ? -1 : 1;
    return left.h1 < right.h1 ? -1 : left.h1 > right.h1 ? 1 : 0;
  });
}

/** Minimal generators of an upset in P(WinLines) x P(WinLines)^op. */
export function normalizeMinimalLineProduct(pairs) {
  const ordered = orderedUnique(pairs, false);
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) if (lineProductLeq(retained, candidate)) continue outer;
    result.push(candidate);
  }
  return Object.freeze(result);
}

/** Maximal generators of a downset in P(WinLines) x P(WinLines)^op. */
export function normalizeMaximalLineProduct(pairs) {
  const ordered = orderedUnique(pairs, true);
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) if (lineProductLeq(candidate, retained)) continue outer;
    result.push(candidate);
  }
  return Object.freeze(result);
}

function unionUpward(left, right) {
  return normalizeMinimalLineProduct([...left, ...right]);
}

function unionDownward(left, right) {
  return normalizeMaximalLineProduct([...left, ...right]);
}

function tiledPairReduce(left, right, combine, normalize, tileSize, stats) {
  if (left.length === 0 || right.length === 0) return Object.freeze([]);
  let frontier = Object.freeze([]);
  let tile = [];
  function flush() {
    if (tile.length === 0) return;
    stats.normalizationCalls += 1;
    stats.maximumNormalizationInput = Math.max(stats.maximumNormalizationInput, tile.length);
    const reduced = normalize(tile);
    stats.normalizationCalls += 1;
    stats.maximumNormalizationInput = Math.max(stats.maximumNormalizationInput, frontier.length + reduced.length);
    frontier = normalize([...frontier, ...reduced]);
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

// Join in the favorable-to-P0 product order.
function intersectUpward(left, right, tileSize, stats) {
  return tiledPairReduce(left, right, (a, b) => Object.freeze({
    h0: a.h0 | b.h0,
    h1: a.h1 & b.h1,
  }), normalizeMinimalLineProduct, tileSize, stats);
}

// Meet in the favorable-to-P0 product order.
function intersectDownward(left, right, tileSize, stats) {
  return tiledPairReduce(left, right, (a, b) => Object.freeze({
    h0: a.h0 & b.h0,
    h1: a.h1 | b.h1,
  }), normalizeMaximalLineProduct, tileSize, stats);
}

/** Exact preimage of a child Win upset under one legal placement. */
function cofactorUpward(frontier, incidenceMask, mover, allLinesMask, stats) {
  const result = [];
  if (mover === 0) {
    const outside = allLinesMask ^ incidenceMask;
    for (const pair of frontier) result.push(Object.freeze({ h0: pair.h0 & outside, h1: pair.h1 }));
  } else {
    for (const pair of frontier) {
      if (subset(incidenceMask, pair.h1)) result.push(pair);
    }
  }
  stats.normalizationCalls += 1;
  stats.maximumNormalizationInput = Math.max(stats.maximumNormalizationInput, result.length);
  return normalizeMinimalLineProduct(result);
}

/** Exact preimage of a child Loss downset under one legal placement. */
function cofactorDownward(frontier, incidenceMask, mover, allLinesMask, stats) {
  const result = [];
  if (mover === 0) {
    for (const pair of frontier) {
      if (subset(incidenceMask, pair.h0)) result.push(pair);
    }
  } else {
    const outside = allLinesMask ^ incidenceMask;
    for (const pair of frontier) result.push(Object.freeze({ h0: pair.h0, h1: pair.h1 & outside }));
  }
  stats.normalizationCalls += 1;
  stats.maximumNormalizationInput = Math.max(stats.maximumNormalizationInput, result.length);
  return normalizeMaximalLineProduct(result);
}

function supportUniverseMask(heights, columns) {
  let mask = 0n;
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < heights[column]; row += 1) mask |= 1n << BigInt(row * columns + column);
  }
  return mask;
}

function buildGeometry({ columns, rows, connect }) {
  const cellCount = columns * rows;
  const lines = createConnectWinningLines({ columns, rows, connect });
  const allLinesMask = (1n << BigInt(lines.length)) - 1n;
  const lineCellMasks = [];
  const incidenceMasks = Array.from({ length: cellCount }, () => 0n);
  const incidenceEntries = Array.from({ length: cellCount }, () => []);

  for (let lineId = 0; lineId < lines.length; lineId += 1) {
    const lineBit = 1n << BigInt(lineId);
    let cellMask = 0n;
    for (const cell of lines[lineId]) {
      cellMask |= 1n << BigInt(cell);
      incidenceMasks[cell] |= lineBit;
    }
    lineCellMasks.push(cellMask);
    for (const cell of lines[lineId]) incidenceEntries[cell].push(Object.freeze({ lineId, lineBit, cellMask }));
  }

  return Object.freeze({
    cellCount,
    lines,
    lineCellMasks: Object.freeze(lineCellMasks),
    incidenceMasks: Object.freeze(incidenceMasks),
    incidenceEntries: Object.freeze(incidenceEntries.map((entry) => Object.freeze(entry))),
    allLinesMask,
  });
}

function completingLineBits({ landingCell, landingBit, universeMask, incidenceEntries }) {
  let bits = 0n;
  for (const entry of incidenceEntries[landingCell]) {
    const required = entry.cellMask & ~landingBit;
    if ((required & ~universeMask) === 0n) bits |= entry.lineBit;
  }
  return bits;
}

function terminalWinMinima(completingBits, allLinesMask) {
  const result = [];
  for (let bits = completingBits; bits !== 0n; bits &= bits - 1n) {
    const lineBit = bits & -bits;
    result.push(Object.freeze({ h0: 0n, h1: allLinesMask ^ lineBit }));
  }
  return Object.freeze(result);
}

function terminalLossMaxima(completingBits, allLinesMask) {
  const result = [];
  for (let bits = completingBits; bits !== 0n; bits &= bits - 1n) {
    const lineBit = bits & -bits;
    result.push(Object.freeze({ h0: allLinesMask ^ lineBit, h1: 0n }));
  }
  return Object.freeze(result);
}

// Excluding P0 terminal-win territory requires every completing line to have
// already been physically hit by P1. This is a single downset-cap transform,
// not a Cartesian terminal subtraction.
function excludeP0TerminalFromLosses(losses, completingBits, stats) {
  if (completingBits === 0n || losses.length === 0) return losses;
  const result = losses.map((pair) => Object.freeze({ h0: pair.h0, h1: pair.h1 | completingBits }));
  stats.normalizationCalls += 1;
  stats.maximumNormalizationInput = Math.max(stats.maximumNormalizationInput, result.length);
  return normalizeMaximalLineProduct(result);
}

// Excluding P1 terminal-loss territory requires P0 to have physically hit
// every completing P1 line.
function excludeP1TerminalFromWins(wins, completingBits, stats) {
  if (completingBits === 0n || wins.length === 0) return wins;
  const result = wins.map((pair) => Object.freeze({ h0: pair.h0 | completingBits, h1: pair.h1 }));
  stats.normalizationCalls += 1;
  stats.maximumNormalizationInput = Math.max(stats.maximumNormalizationInput, result.length);
  return normalizeMinimalLineProduct(result);
}

function frontiersOverlap(wins, losses) {
  for (const win of wins) for (const loss of losses) if (lineProductLeq(win, loss)) return true;
  return false;
}

export function classifyLineProductWdl({ wins, losses }, pair) {
  const win = wins.some((minimum) => lineProductLeq(minimum, pair));
  const loss = losses.some((maximum) => lineProductLeq(pair, maximum));
  if (win && loss) throw new Error('line-product frontiers overlap at queried pair');
  return win ? 1 : loss ? -1 : 0;
}

/**
 * Research-only direct BSFP recurrence over identified winning-line product
 * cones. Boundary pairs are logical thresholds and need not themselves be
 * realizable physical states. Correctness is interpreted only over the
 * support-local image of ownership assignments.
 */
export function solveDirectLineProductBsfp({
  columns,
  rows,
  connect,
  candidateTileSize = 8192,
  frontierRecordCap = 100000,
}) {
  if (!Number.isSafeInteger(candidateTileSize) || candidateTileSize < 1) throw new RangeError('candidateTileSize must be positive');
  if (!Number.isSafeInteger(frontierRecordCap) || frontierRecordCap < 1) throw new RangeError('frontierRecordCap must be positive');

  const support = createBsfpSupportLatticeProfile({ columns, rows, connect });
  const geometry = buildGeometry({ columns, rows, connect });
  const winFrontiers = new Array(support.itemCapacity);
  const lossFrontiers = new Array(support.itemCapacity);
  const stats = {
    totalWinRecords: 0,
    totalLossRecords: 0,
    maximumWinFrontier: 0,
    maximumLossFrontier: 0,
    generatedPairCandidates: 0,
    normalizationCalls: 0,
    maximumNormalizationInput: 0,
    terminalLineApplications: 0,
  };
  const rankSummaries = [];

  for (let rank = support.maxRank; rank >= 0; rank -= 1) {
    let rankWinRecords = 0;
    let rankLossRecords = 0;
    let rankMaxWin = 0;
    let rankMaxLoss = 0;
    let rankSupports = 0;

    for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
      if (support.ranks[supportIndex] !== rank) continue;
      rankSupports += 1;
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
        const incidenceMask = geometry.incidenceMasks[landingCell];
        const childSupportIndex = supportIndex + support.weights[column];
        const childWins = winFrontiers[childSupportIndex];
        const childLosses = lossFrontiers[childSupportIndex];
        if (childWins === undefined || childLosses === undefined) throw new Error('direct line-product rank order is incomplete');

        let moveWins = cofactorUpward(childWins, incidenceMask, mover, geometry.allLinesMask, stats);
        let moveLosses = cofactorDownward(childLosses, incidenceMask, mover, geometry.allLinesMask, stats);
        const completingBits = completingLineBits({
          landingCell,
          landingBit,
          universeMask,
          incidenceEntries: geometry.incidenceEntries,
        });

        if (mover === 0 && completingBits !== 0n) {
          moveLosses = excludeP0TerminalFromLosses(moveLosses, completingBits, stats);
          moveWins = unionUpward(moveWins, terminalWinMinima(completingBits, geometry.allLinesMask));
          stats.terminalLineApplications += popcount(completingBits);
        } else if (mover === 1 && completingBits !== 0n) {
          moveWins = excludeP1TerminalFromWins(moveWins, completingBits, stats);
          moveLosses = unionDownward(moveLosses, terminalLossMaxima(completingBits, geometry.allLinesMask));
          stats.terminalLineApplications += popcount(completingBits);
        }

        if (aggregateWins === null) {
          aggregateWins = moveWins;
          aggregateLosses = moveLosses;
        } else if (mover === 0) {
          aggregateWins = unionUpward(aggregateWins, moveWins);
          aggregateLosses = intersectDownward(aggregateLosses, moveLosses, candidateTileSize, stats);
        } else {
          aggregateWins = intersectUpward(aggregateWins, moveWins, candidateTileSize, stats);
          aggregateLosses = unionDownward(aggregateLosses, moveLosses);
        }
      }

      const wins = aggregateWins ?? Object.freeze([]);
      const losses = aggregateLosses ?? Object.freeze([]);
      if (wins.length > frontierRecordCap || losses.length > frontierRecordCap) {
        throw new Error(`direct line-product frontier cap exceeded at support ${supportIndex}: ${wins.length}/${losses.length}`);
      }
      if (frontiersOverlap(wins, losses)) throw new Error(`direct line-product contradiction at support ${supportIndex}`);
      winFrontiers[supportIndex] = wins;
      lossFrontiers[supportIndex] = losses;
      rankWinRecords += wins.length;
      rankLossRecords += losses.length;
      rankMaxWin = Math.max(rankMaxWin, wins.length);
      rankMaxLoss = Math.max(rankMaxLoss, losses.length);
      stats.totalWinRecords += wins.length;
      stats.totalLossRecords += losses.length;
      stats.maximumWinFrontier = Math.max(stats.maximumWinFrontier, wins.length);
      stats.maximumLossFrontier = Math.max(stats.maximumLossFrontier, losses.length);
    }

    rankSummaries.push(Object.freeze({
      rank,
      supportCount: rankSupports,
      winRecords: rankWinRecords,
      lossRecords: rankLossRecords,
      boundaryRecords: rankWinRecords + rankLossRecords,
      maximumWinFrontier: rankMaxWin,
      maximumLossFrontier: rankMaxLoss,
    }));
  }

  const rootPair = Object.freeze({ h0: 0n, h1: 0n });
  const rootWdl = classifyLineProductWdl({ wins: winFrontiers[0], losses: lossFrontiers[0] }, rootPair);
  return Object.freeze({
    kind: 'connect4-direct-line-product-bsfp-research',
    columns,
    rows,
    connect,
    support,
    geometry,
    rootWdl,
    stats: Object.freeze({
      ...stats,
      totalBoundaryRecords: stats.totalWinRecords + stats.totalLossRecords,
      rankSummaries: Object.freeze(rankSummaries),
    }),
    frontierAt(supportIndex) {
      if (!Number.isInteger(supportIndex) || supportIndex < 0 || supportIndex >= support.itemCapacity) throw new RangeError('supportIndex is out of range');
      return Object.freeze({ wins: winFrontiers[supportIndex], losses: lossFrontiers[supportIndex] });
    },
  });
}
