import test from 'node:test';
import assert from 'node:assert/strict';
import { compactOwnership42Shape, buildCompactOwnership42Layout } from '../cuda/compact-ownership-42-layout.mjs';
import { normalizeMaximalPacked42Antichain, normalizeMinimalPacked42Antichain } from '../ownership-antichain-packed42-rolling-solver.mjs';

test('compact schedule covers each support exactly once and consumes the next rank only', () => {
  const shape = compactOwnership42Shape({ columns: 4, rows: 4, connect: 4 });
  const { inputs, rankOffsets } = buildCompactOwnership42Layout(shape);
  assert.equal(new Set(inputs.items).size, 625);
  for (let rank = 0; rank <= 16; rank++) {
    for (let slot = 0; slot < shape.rankCounts[rank]; slot++) {
      const item = inputs.items[rankOffsets[rank] + slot];
      assert.equal(inputs.slots[item], slot);
      assert.equal(shape.support.ranks[item], rank);
      for (let column = 0; column < 4; column++) {
        const child = inputs.children[item * 4 + column];
        if (child !== 0xffff_ffff) assert.equal(shape.support.ranks[child], rank + 1);
      }
    }
  }
});

test('structural landing and terminal masks retain bits 31, 32 and 41', () => {
  const shape = compactOwnership42Shape({ columns: 1, rows: 42, connect: 4 });
  const { inputs } = buildCompactOwnership42Layout(shape);
  assert.equal(inputs.landingLo[31], 0x80000000);
  assert.equal(inputs.landingHi[32], 1);
  assert.equal(inputs.landingHi[41], 512);
  for (let rank = 0; rank < 42; rank++) {
    const qStart = inputs.terminalOffsets[rank];
    const qEnd = inputs.terminalOffsets[rank + 1];
    assert.equal(qEnd - qStart, rank >= 3 ? 1 : 0);
    if (rank >= 3) {
      const mask = BigInt(inputs.terminalLo[qStart]) | (BigInt(inputs.terminalHi[qStart]) << 32n);
      assert.equal(mask, 7n << BigInt(rank - 3));
    }
  }
});

test('terminal complement intersections equal direct cone subtraction on every four-bit assignment', () => {
  const universe = 15;
  const subset = (a, b) => (a & ~b) === 0;
  for (let q = 0; q <= universe; q++) {
    const bits = [1, 2, 4, 8].filter((bit) => (q & bit) !== 0);
    for (let source = 0; source <= universe; source++) {
      const down = normalizeMaximalPacked42Antichain(bits.map((bit) => source & (universe ^ bit)));
      const up = normalizeMinimalPacked42Antichain(bits.map((bit) => source | bit));
      for (let ownership = 0; ownership <= universe; ownership++) {
        assert.equal(down.some((cap) => subset(ownership, cap)), subset(ownership, source) && !subset(q, ownership));
        assert.equal(up.some((base) => subset(base, ownership)), subset(source, ownership) && !subset(ownership, universe ^ q));
      }
    }
  }
});

test('capacity and memory admission bound the complete physical layout before allocation', () => {
  const small = compactOwnership42Shape({ columns: 4, rows: 4, connect: 4 });
  const noOracle = compactOwnership42Shape({ columns: 4, rows: 4, connect: 4, qualificationOracle: false });
  assert.equal(small.upperBoundBytes - noOracle.upperBoundBytes, small.oracleUpperBoundBytes);
  assert.throws(() => compactOwnership42Shape({ columns: 4, rows: 4, connect: 4, frontierCapacity: 3 }), /bounds/);
  assert.throws(() => compactOwnership42Shape({ columns: 4, rows: 4, connect: 4, frontierCapacity: 65536, candidateTileSize: 65536 }), /pair product/);
  assert.throws(() => compactOwnership42Shape({ columns: 21, rows: 2, connect: 4 }), /support envelope/);
  assert.throws(() => compactOwnership42Shape({ columns: 7, rows: 7, connect: 4 }), /bounds/);
});
