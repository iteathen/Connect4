import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMinimalOwnershipAntichain as min, normalizeMaximalOwnershipAntichain as max } from '../ownership-antichain-solver.mjs';
import { oqsCofactor42Shape } from '../cuda/oqs-cofactor-42-layout.mjs';

test('all four-bit antichains preserve incomparability under the claimed cofactor restrictions', () => {
  let antichains = 0;
  for (let family = 0; family < 65536; family++) {
    const masks = Array.from({ length: 16 }, (_, i) => i).filter(i => family & (1 << i)).map(BigInt);
    if (masks.some((a, i) => masks.some((b, j) => i !== j && (a & b) === a))) continue;
    antichains++;
    for (let fixed = 0n; fixed < 16n; fixed++) {
      const wins = masks.filter(m => (m & fixed) === 0n);
      const losses = masks.filter(m => (fixed & ~m) === 0n).map(m => m & ~fixed);
      assert.equal(min(wins).length, wins.length);
      assert.equal(max(losses).length, losses.length);
      assert.equal(new Set(losses).size, losses.length);
    }
  }
  assert.equal(antichains, 168);
});

test('OQS physical envelope covers wide measured candidates without admitting 7x6', () => {
  const shape = oqsCofactor42Shape({ columns: 5, rows: 5, connect: 4 });
  assert(shape.candidateCapacity >= 11132);
  assert(shape.frontierCapacity >= 456);
  assert(shape.recordCapacity >= 17448);
  assert(shape.upperBoundBytes < 600 * 1024 ** 2);
  assert.throws(() => oqsCofactor42Shape({ columns: 7, rows: 6, connect: 4 }), /unsupported/);
});
