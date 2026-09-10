import { createConnectWinningLines } from '../../../components/bsfp/geometry.mjs';
import { solveBsfpOwnershipAntichainWdl } from '../../../components/bsfp/ownership-antichain-solver.mjs';

const COMPLETE_CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
]);

const HOT_SUPPORT_CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 5, connect: 4 }),
  Object.freeze({ columns: 5, rows: 4, connect: 4 }),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function popcount32(mask) {
  let value = mask >>> 0;
  value -= (value >>> 1) & 0x55555555;
  value = (value & 0x33333333) + ((value >>> 2) & 0x33333333);
  return (((value + (value >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

function subset32(left, right) {
  return ((left & ~right) >>> 0) === 0;
}

function favorableLeq(a, b) {
  return subset32(a.h0, b.h0) && subset32(b.h1, a.h1);
}

function normalizeWinBoundary(entries) {
  const ordered = entries.slice().sort((a, b) => {
    const p0 = popcount32(a.h0) - popcount32(b.h0);
    if (p0 !== 0) return p0;
    const p1 = popcount32(b.h1) - popcount32(a.h1);
    if (p1 !== 0) return p1;
    if (a.h0 !== b.h0) return a.h0 - b.h0;
    return a.h1 - b.h1;
  });
  const retained = [];
  outer: for (const candidate of ordered) {
    for (const prior of retained) {
      if (favorableLeq(prior, candidate)) continue outer;
    }
    retained.push(candidate);
  }
  return retained;
}

function normalizeLossBoundary(entries) {
  const ordered = entries.slice().sort((a, b) => {
    const p0 = popcount32(b.h0) - popcount32(a.h0);
    if (p0 !== 0) return p0;
    const p1 = popcount32(a.h1) - popcount32(b.h1);
    if (p1 !== 0) return p1;
    if (a.h0 !== b.h0) return b.h0 - a.h0;
    return a.h1 - b.h1;
  });
  const retained = [];
  outer: for (const candidate of ordered) {
    for (const prior of retained) {
      if (favorableLeq(candidate, prior)) continue outer;
    }
    retained.push(candidate);
  }
  return retained;
}

function createGeometry(spec) {
  const cellCount = spec.columns * spec.rows;
  assert(cellCount <= 30, 'product-antichain probe currently requires <=30 cells');
  const lines = createConnectWinningLines(spec);
  assert(lines.length > 0 && lines.length <= 26, 'pair-key Number encoding requires <=26 winning lines');
  const cellLineMasks = new Uint32Array(cellCount);
  for (let lineId = 0; lineId < lines.length; lineId += 1) {
    const lineBit = (1 << lineId) >>> 0;
    for (const cell of lines[lineId]) cellLineMasks[cell] = (cellLineMasks[cell] | lineBit) >>> 0;
  }
  return Object.freeze({ ...spec, cellCount, lineCount: lines.length, cellLineMasks, pairBase: 2 ** lines.length });
}

function universeMask(heights, columns) {
  let mask = 0;
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < heights[column]; row += 1) mask = (mask | (1 << (row * columns + column))) >>> 0;
  }
  return mask >>> 0;
}

function occupiedCells(mask, cellCount) {
  const cells = [];
  for (let cell = 0; cell < cellCount; cell += 1) if ((mask & (1 << cell)) !== 0) cells.push(cell);
  return cells;
}

function globalToLocal(maskBigInt, cells) {
  const mask = Number(maskBigInt);
  let local = 0;
  for (let index = 0; index < cells.length; index += 1) {
    if ((mask & (1 << cells[index])) !== 0) local |= 1 << index;
  }
  return local >>> 0;
}

function buildClassification(frontier, cells) {
  const rank = cells.length;
  const count = 2 ** rank;
  const wins = new Uint8Array(count);
  const losses = new Uint8Array(count);

  for (const mask of frontier.wins) wins[globalToLocal(mask, cells)] = 1;
  for (const mask of frontier.losses) losses[globalToLocal(mask, cells)] = 1;

  for (let bit = 1; bit < count; bit *= 2) {
    const span = bit * 2;
    for (let base = 0; base < count; base += span) {
      for (let offset = 0; offset < bit; offset += 1) {
        if (wins[base + offset]) wins[base + bit + offset] = 1;
        if (losses[base + bit + offset]) losses[base + offset] = 1;
      }
    }
  }

  for (let index = 0; index < count; index += 1) assert(!(wins[index] && losses[index]), 'C1 frontier classification overlaps');
  return Object.freeze({ wins, losses });
}

function buildLocalHits(cells, cellLineMasks) {
  const count = 2 ** cells.length;
  const hits = new Uint32Array(count);
  for (let mask = 1; mask < count; mask += 1) {
    const lowBit = mask & -mask;
    const localIndex = 31 - Math.clz32(lowBit);
    hits[mask] = (hits[mask ^ lowBit] | cellLineMasks[cells[localIndex]]) >>> 0;
  }
  return hits;
}

function pairEntry(key, pairBase) {
  const h1 = Math.floor(key / pairBase);
  const h0 = key - h1 * pairBase;
  return Object.freeze({ h0: h0 >>> 0, h1: h1 >>> 0 });
}

function analyzeSupport({ g, solver, supportIndex }) {
  const heights = solver.support.decodeHeights(supportIndex);
  const occupied = universeMask(heights, g.columns);
  const cells = occupiedCells(occupied, g.cellCount);
  const rank = cells.length;
  assert(rank === solver.support.ranks[supportIndex], 'support rank mismatch');
  const frontier = solver.frontierAt(supportIndex);
  const classification = buildClassification(frontier, cells);
  const hits = buildLocalHits(cells, g.cellLineMasks);
  const allLocal = (2 ** rank) - 1;
  const quotient = new Map();
  let quotientConflicts = 0;

  for (let ownership = 0; ownership <= allLocal; ownership += 1) {
    const h0 = hits[ownership] >>> 0;
    const h1 = hits[allLocal ^ ownership] >>> 0;
    const value = classification.wins[ownership] ? 1 : classification.losses[ownership] ? -1 : 0;
    const key = h0 + h1 * g.pairBase;
    if (quotient.has(key)) {
      if (quotient.get(key) !== value) quotientConflicts += 1;
    } else {
      quotient.set(key, value);
    }
  }
  assert(quotientConflicts === 0, `quotient W/D/L conflict at support ${supportIndex}`);

  const winEntries = [];
  const lossEntries = [];
  for (const [key, value] of quotient) {
    if (value === 1) winEntries.push(pairEntry(key, g.pairBase));
    else if (value === -1) lossEntries.push(pairEntry(key, g.pairBase));
  }
  const winBoundary = normalizeWinBoundary(winEntries);
  const lossBoundary = normalizeLossBoundary(lossEntries);

  let falseWinCoverage = 0;
  let falseLossCoverage = 0;
  let missingWinCoverage = 0;
  let missingLossCoverage = 0;
  for (const [key, value] of quotient) {
    const entry = pairEntry(key, g.pairBase);
    const winCovered = winBoundary.some((minimum) => favorableLeq(minimum, entry));
    const lossCovered = lossBoundary.some((maximum) => favorableLeq(entry, maximum));
    if (value === 1 && !winCovered) missingWinCoverage += 1;
    if (value !== 1 && winCovered) falseWinCoverage += 1;
    if (value === -1 && !lossCovered) missingLossCoverage += 1;
    if (value !== -1 && lossCovered) falseLossCoverage += 1;
  }
  assert(falseWinCoverage === 0 && falseLossCoverage === 0 && missingWinCoverage === 0 && missingLossCoverage === 0,
    `product dominance is not exact at support ${supportIndex}`);

  const uniqueBoundaryMasks = new Set();
  for (const entry of winBoundary) {
    uniqueBoundaryMasks.add(entry.h0);
    uniqueBoundaryMasks.add(entry.h1);
  }
  for (const entry of lossBoundary) {
    uniqueBoundaryMasks.add(entry.h0);
    uniqueBoundaryMasks.add(entry.h1);
  }

  const ownershipBoundaryRecords = frontier.wins.length + frontier.losses.length;
  const quotientBoundaryRecords = winBoundary.length + lossBoundary.length;
  return Object.freeze({
    supportIndex,
    rank,
    heights,
    ownershipAssignments: 2 ** rank,
    quotientClasses: quotient.size,
    quotientCollapse: (2 ** rank) / quotient.size,
    ownershipWinBoundary: frontier.wins.length,
    ownershipLossBoundary: frontier.losses.length,
    ownershipBoundaryRecords,
    quotientWinBoundary: winBoundary.length,
    quotientLossBoundary: lossBoundary.length,
    quotientBoundaryRecords,
    boundaryRecordRatio: ownershipBoundaryRecords === 0 ? null : quotientBoundaryRecords / ownershipBoundaryRecords,
    uniqueBoundaryMasks: uniqueBoundaryMasks.size,
    boundaryMaskOccurrences: quotientBoundaryRecords * 2,
    maskOccurrenceToUniqueRatio: uniqueBoundaryMasks.size === 0 ? null : (quotientBoundaryRecords * 2) / uniqueBoundaryMasks.size,
    quotientConflicts,
    falseWinCoverage,
    falseLossCoverage,
    missingWinCoverage,
    missingLossCoverage,
  });
}

function selectedSupports(solver, mode) {
  if (mode === 'all') return Array.from({ length: solver.support.itemCapacity }, (_, index) => index);
  assert(mode === 'max-boundary-per-rank', `unknown support selection mode ${mode}`);
  const best = Array.from({ length: solver.support.maxRank + 1 }, () => null);
  for (let supportIndex = 0; supportIndex < solver.support.itemCapacity; supportIndex += 1) {
    const rank = solver.support.ranks[supportIndex];
    const frontier = solver.frontierAt(supportIndex);
    const records = frontier.wins.length + frontier.losses.length;
    const current = best[rank];
    if (!current || records > current.records) best[rank] = { supportIndex, records };
  }
  return best.filter(Boolean).map((entry) => entry.supportIndex);
}

function aggregate(spec, mode) {
  const g = createGeometry(spec);
  const solveStarted = performance.now();
  const solver = solveBsfpOwnershipAntichainWdl(spec);
  const solveElapsedMs = performance.now() - solveStarted;
  const supportIndices = selectedSupports(solver, mode);
  const supportResults = [];
  const rankSummary = new Map();
  let totalAssignments = 0;
  let totalQuotientClasses = 0;
  let totalOwnershipBoundary = 0;
  let totalQuotientBoundary = 0;
  let maximumBoundaryRecordRatio = 0;
  let minimumBoundaryRecordRatio = Number.POSITIVE_INFINITY;

  for (let index = 0; index < supportIndices.length; index += 1) {
    const result = analyzeSupport({ g, solver, supportIndex: supportIndices[index] });
    supportResults.push(result);
    totalAssignments += result.ownershipAssignments;
    totalQuotientClasses += result.quotientClasses;
    totalOwnershipBoundary += result.ownershipBoundaryRecords;
    totalQuotientBoundary += result.quotientBoundaryRecords;
    if (result.boundaryRecordRatio !== null) {
      maximumBoundaryRecordRatio = Math.max(maximumBoundaryRecordRatio, result.boundaryRecordRatio);
      minimumBoundaryRecordRatio = Math.min(minimumBoundaryRecordRatio, result.boundaryRecordRatio);
    }

    let rank = rankSummary.get(result.rank);
    if (!rank) {
      rank = { rank: result.rank, supports: 0, ownershipAssignments: 0, quotientClasses: 0, ownershipBoundaryRecords: 0, quotientBoundaryRecords: 0 };
      rankSummary.set(result.rank, rank);
    }
    rank.supports += 1;
    rank.ownershipAssignments += result.ownershipAssignments;
    rank.quotientClasses += result.quotientClasses;
    rank.ownershipBoundaryRecords += result.ownershipBoundaryRecords;
    rank.quotientBoundaryRecords += result.quotientBoundaryRecords;

    if (mode !== 'all' || index % 128 === 0) {
      console.error(`[line-product] ${g.columns}x${g.rows}:c${g.connect} support=${result.supportIndex} rank=${result.rank} ownershipBoundary=${result.ownershipBoundaryRecords} quotientBoundary=${result.quotientBoundaryRecords} quotientClasses=${result.quotientClasses}`);
    }
  }

  const hottest = supportResults.slice().sort((a, b) => b.ownershipBoundaryRecords - a.ownershipBoundaryRecords).slice(0, 12);
  const summaries = [...rankSummary.values()].sort((a, b) => a.rank - b.rank).map((entry) => Object.freeze({
    ...entry,
    quotientCollapse: entry.quotientClasses === 0 ? null : entry.ownershipAssignments / entry.quotientClasses,
    boundaryRecordRatio: entry.ownershipBoundaryRecords === 0 ? null : entry.quotientBoundaryRecords / entry.ownershipBoundaryRecords,
  }));

  return Object.freeze({
    geometry: `${g.columns}x${g.rows}:c${g.connect}`,
    selection: mode,
    lineCount: g.lineCount,
    supportCount: solver.support.itemCapacity,
    analyzedSupports: supportIndices.length,
    c1RootWdl: solver.rootWdl,
    c1TotalBoundaryRecords: solver.stats.totalBoundaryRecords,
    selectedOwnershipAssignments: totalAssignments,
    selectedQuotientClasses: totalQuotientClasses,
    selectedQuotientCollapse: totalQuotientClasses === 0 ? null : totalAssignments / totalQuotientClasses,
    selectedOwnershipBoundaryRecords: totalOwnershipBoundary,
    selectedQuotientBoundaryRecords: totalQuotientBoundary,
    selectedBoundaryRecordRatio: totalOwnershipBoundary === 0 ? null : totalQuotientBoundary / totalOwnershipBoundary,
    minimumSupportBoundaryRecordRatio: minimumBoundaryRecordRatio === Number.POSITIVE_INFINITY ? null : minimumBoundaryRecordRatio,
    maximumSupportBoundaryRecordRatio: maximumBoundaryRecordRatio,
    solveElapsedMs,
    elapsedMs: performance.now() - solveStarted,
    rankSummaries: Object.freeze(summaries),
    hottestSupports: Object.freeze(hottest),
  });
}

const cases = [];
for (const spec of COMPLETE_CASES) {
  cases.push(aggregate(spec, 'all'));
  if (global.gc) global.gc();
}
for (const spec of HOT_SUPPORT_CASES) {
  cases.push(aggregate(spec, 'max-boundary-per-rank'));
  if (global.gc) global.gc();
}

console.log(JSON.stringify({
  kind: 'connect4-line-hit-product-antichain-falsification',
  status: 'pass',
  claims: Object.freeze({
    quotientKey: '(support,p0PhysicalLineHitMask,p1PhysicalLineHitMask)',
    favorableOrder: 'h0_superset_and_h1_subset_favors_p0',
    completeC1DomainCases: COMPLETE_CASES.map((spec) => `${spec.columns}x${spec.rows}:c${spec.connect}`),
    hotSupportCases: HOT_SUPPORT_CASES.map((spec) => `${spec.columns}x${spec.rows}:c${spec.connect}`),
    quotientWdlConflictFree: true,
    productDominanceBoundaryExactOnTestedAssignments: true,
    productionSolverClaim: false,
    nativeCudaClaim: false,
  }),
  cases,
}, null, 2));
