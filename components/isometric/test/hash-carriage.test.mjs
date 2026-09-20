import test from 'node:test';
import assert from 'node:assert/strict';
import { ResidualPool, IsometricState, IsoMaxTransitionCache } from '../index.mjs';
import { makeCorpus } from '../../../benchmarks/isomax-ordering/corpus.mjs';

// Independent wide-integer reference: exact polynomial/avalanche arithmetic
// modulo 2^32, not JavaScript signed/unsigned Number carrier assumptions.
const u32 = n => BigInt.asUintN(32, n);
function mix(value) {
  let x = u32(BigInt(value));
  x ^= x >> 16n; x = u32(x * 0x7feb352dn);
  x ^= x >> 15n; x = u32(x * 0x846ca68bn);
  return u32(x ^ (x >> 16n));
}
function hash(values, salt = 0) {
  let h = 0x811c9dc5n;
  for (const value of values) h = u32((h ^ mix(value)) * 0x01000193n);
  return Number(mix(h ^ BigInt(salt)));
}

test('prepared q locator preserves all 32 bits across adversarial signed carriers', () => {
  const pool = new ResidualPool(), cache = new IsoMaxTransitionCache({ pool });
  const key = new Int32Array(3), state = { pool, gameplayKey(target) { target.set(key); } };
  const extremes = [0, -1, 1, 0x7fffffff, -0x80000000, 0x40000000, -0x40000000];
  let random = 991, negative = 0;
  for (let i = 0; i < 10000; i++) {
    for (let j = 0; j < 3; j++) {
      random = Math.imul(random, 1664525) + 1013904223 | 0;
      key[j] = i < extremes.length ** 3 ? extremes[Math.floor(i / extremes.length ** j) % extremes.length] : random;
    }
    const actual = cache.prepareKey(state);
    assert.equal(actual, actual | 0);
    assert.equal(actual >>> 0, hash(key));
    negative += Number(actual < 0);
  }
  assert.ok(negative > 1000);
});

test('class hash magnitude matches Uint32 storage and re-interning stays exact', () => {
  const pool = new ResidualPool();
  for (const { moves } of makeCorpus({ seed: 449, ply: 28, count: 32 })) {
    const state = new IsometricState({ pool, moves });
    state.gameplayKey();
  }
  const bits = new Uint32Array(20), count = pool.classCount;
  let highBit = 0;
  for (let id = 0; id < count; id++) {
    const expected = hash(pool.classSlotIds.map(slot => slot[id] + 1), 10);
    assert.equal(pool.classHashes[id], expected);
    highBit += Number(expected >= 0x80000000);
    pool.loadClassBits(id, bits);
    assert.equal(pool.internBits(bits), id);
  }
  assert.equal(pool.classCount, count);
  assert.ok(highBit > 100);
});
