import { solveBsfpOwnershipAntichainWdl } from '../../../components/bsfp/ownership-antichain-solver.mjs';
import {
  classifyLineProductWdl,
  solveDirectLineProductBsfp,
} from './direct-line-product-solver.mjs';

const COMPLETE_CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
]);

const HOT_CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 5, connect: 4, maximumCheckedRank: 20 }),
  Object.freeze({ columns: 5, rows: 4, connect: 4, maximumCheckedRank: 20 }),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function supportUniverseMask(heights, columns) {
  let mask = 0n;
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < heights[column]; row += 1) mask |= 1n << BigInt(row * columns + column);
  }
  return mask;
}

function occupiedCells(mask, cellCount) {
  const result = [];
  for (let cell = 0; cell < cellCount; cell += 1) if ((mask & (1n << BigInt(cell))) !== 0n) result.push(cell);
  return result;
}

function ownershipFromLocal(localMask, cells) {
  let global = 0n;
  for (let index = 0; index < cells.length; index += 1) {
    if ((localMask & (1 << index)) !== 0) global |= 1n << BigInt(cells[index]);
  }
  return global;
}

function hitMask(cellMask, geometry) {
  let hits = 0n;
  for (let cell = 0; cell < geometry.cellCount; cell += 1) {
    if ((cellMask & (1n << BigInt(cell))) !== 0n) hits |= geometry.incidenceMasks[cell];
  }
  return hits;
}

function pairFromOwnership(p0, universe, geometry) {
  return Object.freeze({
    h0: hitMask(p0, geometry),
    h1: hitMask(universe & ~p0, geometry),
  });
}

function selectHottestSupportPerRank(c1, maximumCheckedRank) {
  const best = new Array(Math.min(c1.support.maxRank, maximumCheckedRank) + 1).fill(null);
  for (let supportIndex = 0; supportIndex < c1.support.itemCapacity; supportIndex += 1) {
    const rank = c1.support.ranks[supportIndex];
    if (rank > maximumCheckedRank) continue;
    const frontier = c1.frontierAt(supportIndex);
    const records = frontier.wins.length + frontier.losses.length;
    if (!best[rank] || records > best[rank].records) best[rank] = { supportIndex, records };
  }
  return best.filter(Boolean).map((entry) => entry.supportIndex);
}

function verifySupport({ spec, c1, direct, supportIndex }) {
  const heights = c1.support.decodeHeights(supportIndex);
  const universe = supportUniverseMask(heights, spec.columns);
  const cells = occupiedCells(universe, spec.columns * spec.rows);
  const rank = cells.length;
  assert(rank <= 30, 'qualification local ownership mask exceeds Number bit capacity');
  const count = 2 ** rank;
  const c1Frontier = c1.frontierAt(supportIndex);
  const directFrontier = direct.frontierAt(supportIndex);
  let mismatches = 0;
  let directOverlaps = 0;
  let wins = 0;
  let losses = 0;
  let draws = 0;

  for (let local = 0; local < count; local += 1) {
    const p0 = ownershipFromLocal(local, cells);
    const expected = c1.evaluate({ heights, p0OwnershipMask: p0 });
    const pair = pairFromOwnership(p0, universe, direct.geometry);
    let actual;
    try {
      actual = classifyLineProductWdl(directFrontier, pair);
    } catch (error) {
      if (String(error?.message ?? error).includes('overlap')) {
        directOverlaps += 1;
        continue;
      }
      throw error;
    }
    if (actual !== expected) mismatches += 1;
    if (expected === 1) wins += 1;
    else if (expected === -1) losses += 1;
    else draws += 1;
  }

  assert(directOverlaps === 0, `direct line-product Win/Loss overlap on realizable states at support ${supportIndex}`);
  assert(mismatches === 0, `direct line-product mismatch at support ${supportIndex}: ${mismatches}`);

  return Object.freeze({
    supportIndex,
    rank,
    ownershipAssignments: count,
    c1BoundaryRecords: c1Frontier.wins.length + c1Frontier.losses.length,
    directBoundaryRecords: directFrontier.wins.length + directFrontier.losses.length,
    directWinRecords: directFrontier.wins.length,
    directLossRecords: directFrontier.losses.length,
    wins,
    losses,
    draws,
    mismatches,
    directOverlaps,
  });
}

function verifyCase(spec, selection) {
  const started = performance.now();
  const c1 = solveBsfpOwnershipAntichainWdl(spec);
  const c1ElapsedMs = performance.now() - started;
  const directStarted = performance.now();
  const direct = solveDirectLineProductBsfp(spec);
  const directElapsedMs = performance.now() - directStarted;
  assert(direct.rootWdl === c1.rootWdl, `${spec.columns}x${spec.rows} root mismatch`);

  let supportIndices;
  if (selection === 'all') {
    supportIndices = Array.from({ length: c1.support.itemCapacity }, (_, index) => index);
  } else {
    supportIndices = selectHottestSupportPerRank(c1, spec.maximumCheckedRank);
  }

  let ownershipAssignments = 0;
  let c1BoundaryRecords = 0;
  let directBoundaryRecords = 0;
  const supportResults = [];
  for (let index = 0; index < supportIndices.length; index += 1) {
    const result = verifySupport({ spec, c1, direct, supportIndex: supportIndices[index] });
    supportResults.push(result);
    ownershipAssignments += result.ownershipAssignments;
    c1BoundaryRecords += result.c1BoundaryRecords;
    directBoundaryRecords += result.directBoundaryRecords;
    if (selection !== 'all' || index % 128 === 0) {
      console.error(`[direct-line-product] ${spec.columns}x${spec.rows}:c${spec.connect} support=${result.supportIndex} rank=${result.rank} assignments=${result.ownershipAssignments} c1=${result.c1BoundaryRecords} direct=${result.directBoundaryRecords}`);
    }
  }

  return Object.freeze({
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    selection,
    rootWdl: direct.rootWdl,
    supportCount: direct.support.itemCapacity,
    checkedSupports: supportIndices.length,
    checkedOwnershipAssignments: ownershipAssignments,
    checkedC1BoundaryRecords: c1BoundaryRecords,
    checkedDirectBoundaryRecords: directBoundaryRecords,
    checkedBoundaryRatio: c1BoundaryRecords === 0 ? null : directBoundaryRecords / c1BoundaryRecords,
    c1TotalBoundaryRecords: c1.stats.totalBoundaryRecords,
    directTotalBoundaryRecords: direct.stats.totalBoundaryRecords,
    totalBoundaryRatio: c1.stats.totalBoundaryRecords === 0 ? null : direct.stats.totalBoundaryRecords / c1.stats.totalBoundaryRecords,
    c1MaximumWinFrontier: c1.stats.maximumWinFrontier,
    c1MaximumLossFrontier: c1.stats.maximumLossFrontier,
    directMaximumWinFrontier: direct.stats.maximumWinFrontier,
    directMaximumLossFrontier: direct.stats.maximumLossFrontier,
    directGeneratedPairCandidates: direct.stats.generatedPairCandidates,
    directTerminalLineApplications: direct.stats.terminalLineApplications,
    c1ElapsedMs,
    directElapsedMs,
    elapsedMs: performance.now() - started,
    supportResults: Object.freeze(supportResults),
  });
}

const cases = [];
for (const spec of COMPLETE_CASES) {
  cases.push(verifyCase(spec, 'all'));
  if (global.gc) global.gc();
}
for (const spec of HOT_CASES) {
  cases.push(verifyCase(spec, 'hottest-per-rank'));
  if (global.gc) global.gc();
}

console.log(JSON.stringify({
  kind: 'connect4-direct-line-product-bsfp-exact-qualification',
  status: 'pass',
  claims: Object.freeze({
    directOwnershipEnumerationUsedForRecurrence: false,
    directConcreteQuotientEnumerationUsedForRecurrence: false,
    boundaryPairsMayBeUnrealizableThresholds: true,
    completeCasesCheckedAgainstEveryC1OwnershipAssignment: COMPLETE_CASES.map((spec) => `${spec.columns}x${spec.rows}:c${spec.connect}`),
    hotCasesCheckedAgainstEveryAssignmentOfSelectedSupport: HOT_CASES.map((spec) => `${spec.columns}x${spec.rows}:c${spec.connect}`),
    productionSolverClaim: false,
    nativeCudaClaim: false,
  }),
  cases,
}, null, 2));
