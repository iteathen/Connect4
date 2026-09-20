import test from 'node:test';
import assert from 'node:assert/strict';
import { ResidualPool, IsometricState, IsoMaxSolver, IsoMaxTransitionCache, IsoMaxWdlTransitionCache } from '../index.mjs';
import { makeCorpus } from '../../../benchmarks/isomax-ordering/corpus.mjs';

test('WDL payload ownership preserves generic objects and rejects lossy public writes', () => {
  const pool = new ResidualPool(), state = new IsometricState({ pool });
  const generic = new IsoMaxTransitionCache({ pool }), wdl = new IsoMaxWdlTransitionCache({ pool });
  const payload = { arbitrary: 1000 };
  generic.set(state, payload); assert.equal(generic.get(state), payload);
  for (const invalid of [42, 256, undefined, null, NaN, 0.5, payload])
    assert.throws(() => wdl.set(state, invalid), /WDL cache/);
  assert.equal(wdl.get(state), undefined);
  for (const value of [-1, 0, 1]) { wdl.set(state, value); assert.equal(wdl.get(state), value); }
  const solver = new IsoMaxSolver({ pool });
  assert.ok(solver.transitionCache instanceof IsoMaxWdlTransitionCache);
  solver.resetSearchMemory();
  assert.ok(solver.transitionCache.values instanceof Int8Array);
  assert.equal(new IsoMaxSolver({ pool, transitionCache: generic }).transitionCache, generic);
});

test('WDL storage survives collisions, repeated resize, reflection and sealing', () => {
  const pool = new ResidualPool(), cache = new IsoMaxWdlTransitionCache({ pool, initialCapacity: 8 });
  const entries = makeCorpus({ seed: 918, ply: 24, count: 160 }).map(({ moves }, i) => ({ moves, value: i % 3 - 1 }));
  const parent = new IsometricState({ pool, moves: [1, 3, 2, 4] });
  const hash = cache.prepareKey(parent), p0 = cache.scratch[0], p1 = cache.scratch[1], support = cache.scratch[2];
  for (const { moves, value } of entries) cache.set(new IsometricState({ pool, moves }), value);
  cache.setPreparedUnchecked(p0, p1, support, hash, -1);
  assert.equal(cache.get(parent), -1);
  assert.ok(cache.capacity >= 256);
  for (const { moves, value } of entries) {
    assert.equal(cache.get(new IsometricState({ pool, moves })), value);
    assert.equal(cache.get(new IsometricState({ pool, moves: moves.map(c => 6 - c) })), value);
  }
  cache.prepareSearchStorage(1024);
  assert.equal(cache.values.byteLength, cache.capacity);
  assert.equal(cache.get(parent), -1);
  assert.throws(() => cache.grow(), /TRANSITION_CAPACITY/);
});
