import assert from 'node:assert/strict';
import test from 'node:test';

import {
  classifyOwnershipAntichainWdl,
  normalizeMaximalOwnershipAntichain,
  normalizeMinimalOwnershipAntichain,
  solveBsfpOwnershipAntichainWdl,
} from '../ownership-antichain-solver.mjs';

function owns(bits, columns, column, row) {
  if (column < 0 || row < 0) return false;
  return (bits & (1n << BigInt(row * columns + column))) !== 0n;
}

function hasWinFrom(bits, geometry, column, row) {
  for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
    let count = 1;
    for (const sign of [-1, 1]) {
      let c = column + dc * sign;
      let r = row + dr * sign;
      while (c >= 0 && c < geometry.columns && r >= 0 && r < geometry.rows && owns(bits, geometry.columns, c, r)) {
        count += 1;
        c += dc * sign;
        r += dr * sign;
      }
    }
    if (count >= geometry.connect) return true;
  }
  return false;
}

function physicalKey(p0Bits, p1Bits) {
  return `${p0Bits.toString(16)}/${p1Bits.toString(16)}`;
}

function qualifyAgainstIndependentOracle(geometry, expected) {
  const solution = solveBsfpOwnershipAntichainWdl(geometry);
  const heights = new Uint8Array(geometry.columns);
  const exactMemo = new Map();
  const visited = new Set();
  let checkedStates = 0;
  let legalEdges = 0;
  let mismatches = 0;

  function exactWdl(p0Bits, p1Bits, moves) {
    const key = physicalKey(p0Bits, p1Bits);
    const cached = exactMemo.get(key);
    if (cached !== undefined) return cached;
    if (moves === geometry.columns * geometry.rows) {
      exactMemo.set(key, 0);
      return 0;
    }
    const mover = moves & 1;
    let best = mover === 0 ? -1 : 1;
    let hasMove = false;
    for (let column = 0; column < geometry.columns; column += 1) {
      const row = heights[column];
      if (row >= geometry.rows) continue;
      hasMove = true;
      const bit = 1n << BigInt(row * geometry.columns + column);
      heights[column] += 1;
      const nextP0 = mover === 0 ? p0Bits | bit : p0Bits;
      const nextP1 = mover === 1 ? p1Bits | bit : p1Bits;
      const moverBits = mover === 0 ? nextP0 : nextP1;
      const value = hasWinFrom(moverBits, geometry, column, row)
        ? (mover === 0 ? 1 : -1)
        : exactWdl(nextP0, nextP1, moves + 1);
      heights[column] -= 1;
      best = mover === 0 ? Math.max(best, value) : Math.min(best, value);
    }
    if (!hasMove) best = 0;
    exactMemo.set(key, best);
    return best;
  }

  function visit(p0Bits, p1Bits, moves) {
    const key = physicalKey(p0Bits, p1Bits);
    if (visited.has(key)) return;
    visited.add(key);
    checkedStates += 1;
    const expectedWdl = exactWdl(p0Bits, p1Bits, moves);
    const actualWdl = solution.evaluate({ heights, p0OwnershipMask: p0Bits });
    if (actualWdl !== expectedWdl) mismatches += 1;
    assert.equal(actualWdl, expectedWdl, `ownership-antichain W/D/L mismatch at ${key}`);

    if (moves === geometry.columns * geometry.rows) return;
    const mover = moves & 1;
    for (let column = 0; column < geometry.columns; column += 1) {
      const row = heights[column];
      if (row >= geometry.rows) continue;
      legalEdges += 1;
      const bit = 1n << BigInt(row * geometry.columns + column);
      heights[column] += 1;
      const nextP0 = mover === 0 ? p0Bits | bit : p0Bits;
      const nextP1 = mover === 1 ? p1Bits | bit : p1Bits;
      const moverBits = mover === 0 ? nextP0 : nextP1;
      if (!hasWinFrom(moverBits, geometry, column, row)) visit(nextP0, nextP1, moves + 1);
      heights[column] -= 1;
    }
  }

  visit(0n, 0n, 0);
  assert.equal(solution.rootWdl, expected.rootWdl);
  assert.equal(checkedStates, expected.checkedStates);
  assert.equal(legalEdges, expected.legalEdges);
  assert.equal(mismatches, 0);
  assert.deepEqual(solution.stats, expected.stats);
  return solution;
}

test('ownership antichains retain only minimal upward and maximal downward generators', () => {
  assert.deepEqual(normalizeMinimalOwnershipAntichain([0b111n, 0b1n, 0b11n, 0b1n]), [0b1n]);
  assert.deepEqual(normalizeMaximalOwnershipAntichain([0b1n, 0b11n, 0b111n, 0b11n]), [0b111n]);
  assert.equal(classifyOwnershipAntichainWdl({ wins: [0b10n], losses: [0b1n] }, 0b11n), 1);
  assert.equal(classifyOwnershipAntichainWdl({ wins: [0b10n], losses: [0b1n] }, 0b1n), -1);
  assert.equal(classifyOwnershipAntichainWdl({ wins: [0b10n], losses: [0b1n] }, 0n), -1);
  assert.throws(() => classifyOwnershipAntichainWdl({ wins: [0b1n], losses: [0b1n] }, 0b1n), /overlap/);
});

test('direct ownership-antichain BSFP is exact on every reachable 4x3 state', () => {
  qualifyAgainstIndependentOracle(
    { columns: 4, rows: 3, connect: 3 },
    {
      rootWdl: 1,
      checkedStates: 4659,
      legalEdges: 11818,
      stats: {
        totalWinRecords: 1398,
        totalLossRecords: 1606,
        totalBoundaryRecords: 3004,
        maximumWinFrontier: 19,
        maximumLossFrontier: 48,
        terminalWinSubtractions: 256,
        terminalLossSubtractions: 254,
      },
    },
  );
});

test('direct ownership-antichain BSFP is exact on every reachable 4x4 state', () => {
  qualifyAgainstIndependentOracle(
    { columns: 4, rows: 4, connect: 4 },
    {
      rootWdl: 0,
      checkedStates: 139625,
      legalEdges: 304574,
      stats: {
        totalWinRecords: 2754,
        totalLossRecords: 3837,
        totalBoundaryRecords: 6591,
        maximumWinFrontier: 26,
        maximumLossFrontier: 54,
        terminalWinSubtractions: 454,
        terminalLossSubtractions: 462,
      },
    },
  );
});

test('direct ownership-antichain BSFP preserves established larger small-game root W/D/L', () => {
  const fiveByThree = solveBsfpOwnershipAntichainWdl({ columns: 5, rows: 3, connect: 4 });
  assert.equal(fiveByThree.rootWdl, 0);
  assert.equal(fiveByThree.stats.totalBoundaryRecords, 5442);
  assert.equal(fiveByThree.stats.maximumWinFrontier, 19);
  assert.equal(fiveByThree.stats.maximumLossFrontier, 10);

  const fourByFive = solveBsfpOwnershipAntichainWdl({ columns: 4, rows: 5, connect: 4 });
  assert.equal(fourByFive.rootWdl, 0);
  assert.equal(fourByFive.stats.totalBoundaryRecords, 40707);
  assert.equal(fourByFive.stats.maximumWinFrontier, 84);
  assert.equal(fourByFive.stats.maximumLossFrontier, 75);
});
