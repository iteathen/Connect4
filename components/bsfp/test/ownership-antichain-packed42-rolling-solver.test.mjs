import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizeMaximalOwnershipAntichain,
  normalizeMinimalOwnershipAntichain,
} from '../ownership-antichain-solver.mjs';
import {
  normalizeMaximalPacked42Antichain,
  normalizeMinimalPacked42Antichain,
  solveBsfpPacked42AntichainRootWdlRolling,
} from '../ownership-antichain-packed42-rolling-solver.mjs';

function xorshift32(state) {
  let value = state >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return value >>> 0;
}

function randomMask42(state) {
  const next = xorshift32(state);
  const high = xorshift32(next ^ 0x9e3779b9) & 0x3ff;
  return { state: xorshift32(high ^ next), mask: next + high * 0x1_0000_0000 };
}

function canonicalMaskSet(values) {
  return [...values].sort((left, right) => left - right);
}

function expectSameNormalization(values) {
  const bigint = values.map((value) => BigInt(value));
  assert.deepEqual(
    canonicalMaskSet(normalizeMinimalPacked42Antichain(values)),
    canonicalMaskSet(normalizeMinimalOwnershipAntichain(bigint).map(Number)),
  );
  assert.deepEqual(
    canonicalMaskSet(normalizeMaximalPacked42Antichain(values)),
    canonicalMaskSet(normalizeMaximalOwnershipAntichain(bigint).map(Number)),
  );
}

test('packed42 antichain normalization is exactly set-equivalent to bigint semantics', () => {
  let state = 0x12345678;
  for (let sample = 0; sample < 64; sample += 1) {
    const values = [];
    for (let index = 0; index < 96; index += 1) {
      const generated = randomMask42(state + index + sample * 17);
      state = generated.state;
      values.push(generated.mask);
      if ((index & 15) === 0) values.push(generated.mask);
    }
    expectSameNormalization(values);
  }
  expectSameNormalization([0, 1, 0x8000_0000, 0x1_0000_0000, 2 ** 41, 2 ** 42 - 1]);
});

for (const expected of [
  { columns: 4, rows: 3, connect: 3, rootWdl: 1, totalBoundaryRecords: 3004, maximumWinFrontier: 19, maximumLossFrontier: 48 },
  { columns: 4, rows: 4, connect: 4, rootWdl: 0, totalBoundaryRecords: 6591, maximumWinFrontier: 26, maximumLossFrontier: 54 },
  { columns: 5, rows: 3, connect: 4, rootWdl: 0, totalBoundaryRecords: 5442, maximumWinFrontier: 19, maximumLossFrontier: 10 },
  { columns: 4, rows: 5, connect: 4, rootWdl: 0, totalBoundaryRecords: 40707, maximumWinFrontier: 84, maximumLossFrontier: 75 },
]) {
  test(`packed42 rolling BSFP preserves exact symbolic result on ${expected.columns}x${expected.rows} connect-${expected.connect}`, () => {
    const solved = solveBsfpPacked42AntichainRootWdlRolling(expected);
    assert.equal(solved.rootWdl, expected.rootWdl);
    assert.equal(solved.stats.totalBoundaryRecords, expected.totalBoundaryRecords);
    assert.equal(solved.stats.maximumWinFrontier, expected.maximumWinFrontier);
    assert.equal(solved.stats.maximumLossFrontier, expected.maximumLossFrontier);
    assert.equal(solved.execution.rankWindow, 2);
    assert.equal(solved.execution.maskRepresentation, 'exact-number-42-two-u32-compatible');
  });
}

test('packed42 reference rejects geometries wider than its exact 42-bit contract', () => {
  assert.throws(
    () => solveBsfpPacked42AntichainRootWdlRolling({ columns: 8, rows: 6, connect: 4 }),
    /at most 42 cells/,
  );
});
