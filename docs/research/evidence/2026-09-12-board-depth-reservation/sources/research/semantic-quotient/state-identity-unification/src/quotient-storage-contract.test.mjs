import assert from 'node:assert/strict';
import test from 'node:test';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createScaledTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-scaled-term-id-kernel.mjs';
import { createTermVocabulary } from './quotient-term-id-pool.mjs';
import { installOnlineOnlyStateStorage } from './quotient-online-only-state-storage.mjs';
import { createLocalSemanticDescriptorCache } from './quotient-local-semantic-descriptor.mjs';
import { hashResidualTermIds } from './quotient-semantic-identity.mjs';
import { createSemanticSharedTtArena, createSemanticSharedTtView, resetSemanticSharedTtArena } from './quotient-semantic-shared-tt.mjs';
import { createOnlineSemanticQuotientSearcher } from './quotient-online-semantic-search-lib.mjs';
import { boundedPositionUpperBound, createBoundedStoragePlan } from './quotient-bounded-storage-plan.mjs';

const spec = { columns: 4, rows: 3, connect: 3 };
const make = (supportLayout = 'packed') => createSlot64ResidualQuotientKernel(spec, { supportLayout, prefixClasses: 8 }).kernel;

test('bounded reservations follow board/depth bounds, budget and actual owner byte counts', () => {
  assert.equal(boundedPositionUpperBound({ columns: 1, rows: 3 }, 3), 7n);
  assert.equal(boundedPositionUpperBound({ columns: 2, rows: 1 }, 2), 5n);
  assert.equal(boundedPositionUpperBound({ columns: 7, rows: 6 }, 8), 291271n);
  assert.equal(boundedPositionUpperBound({ columns: 7, rows: 6 }, 21), 42252235497n);
  for (const invalid of [0, -1, 0.5, NaN, '8']) assert.throws(() => boundedPositionUpperBound(spec, invalid));
  for (const domain of [spec, { columns: 4, rows: 4, connect: 4 }]) {
    const k = createSlot64ResidualQuotientKernel(domain, { prefixClasses: 8, cacheEdges: true }).kernel;
    const plan = createBoundedStoragePlan(k, 5, 64 * 1048576);
    assert.equal(plan.domain, k.domain, 'planner must use initialized domain owner');
    assert.ok(plan.estimatedBytes <= plan.budgetBytes);
    k.prepareSearchStorage(plan.searchStorage);
    const arena = createSemanticSharedTtArena({ ...plan.arena, domainSpec: k.domain });
    const searcher = createOnlineSemanticQuotientSearcher(k, arena);
    assert.equal(k.memoryStats().totalTypedBytes, plan.kernelBytes);
    assert.equal(searcher.descriptorCache.metrics.retainedTypedBytes + searcher.descriptorCache.metrics.scratchBytes, plan.descriptorBytes);
    const buffers = Object.values(arena).filter(value => value instanceof SharedArrayBuffer);
    assert.equal(buffers.reduce((total, buffer) => total + buffer.byteLength, 0), plan.arenaBytes);
    assert.throws(() => k.prepareSearchStorage(plan.searchStorage), /sealed/);
  }
  const standard = createSlot64ResidualQuotientKernel({ columns: 7, rows: 6, connect: 4 }, { cacheEdges: true }).kernel;
  const shallow = createBoundedStoragePlan(standard, 8, 2048 * 1048576);
  const deep = createBoundedStoragePlan(standard, 21, 2048 * 1048576);
  assert.equal(shallow.searchStorage.states, 524288);
  assert.equal(shallow.fullBoundCovered, true);
  assert.ok(deep.searchStorage.states > shallow.searchStorage.states);
  assert.equal(deep.fullBoundCovered, false);
  assert.ok(deep.estimatedBytes <= deep.budgetBytes);
  assert.throws(() => createBoundedStoragePlan(standard, 21, 1), /budget/);
});

test('changed-slot identity converges across blocking order, including all-zero address filters', () => {
  const imul = Math.imul;
  for (const collide of [false, true]) {
    // Adversarial address filter only: collapse avalanche outputs, preserving
    // exact words and transition arithmetic. Install before bootstrap so every
    // existing class has the same hash convention. Restore even after failure.
    if (collide) Math.imul = (a, b) => b === 0x7feb352d || b === 0x846ca68b ? 0 : imul(a, b);
    try {
      for (const domain of [{ columns: 4, rows: 4, connect: 4 }, { columns: 5, rows: 3, connect: 4 }]) {
        const k = createSlot64ResidualQuotientKernel(domain, { prefixClasses: 1 }).kernel;
        const pool = k.classes, vocabulary = pool.termVocabulary;
        assert.ok(pool.slotPools.length > 1);
        // Distinct mover seeds change the residual masks before the commuting
        // blocker operations. Same final exact content must get the same ID.
        for (let seed = 0; seed < 3; seed++) {
          const cellBit = (1 << seed) >>> 0;
          const parent = pool.ownTransition(pool.initialClass, seed, cellBit, 0);
          assert.ok(parent >= 0);
          const terms = pool.termIds(parent);
          for (let a = 0; a < vocabulary.cellCount; a++) {
            for (let b = a + 1; b < vocabulary.cellCount; b++) {
              const first = pool.blockTransition(parent, a);
              const ab = pool.blockTransition(first, b);
              const ba = pool.blockTransition(pool.blockTransition(parent, b), a);
              assert.equal(ab, ba, 'equal final content got different canonical class IDs');
              assert.equal(pool.blockTransition(ab, a), ab, 'idempotent blocker lost identity');
              const blocked = (1 << a) | (1 << b);
              const expected = terms.filter(term => (vocabulary.lo[term] & blocked) === 0);
              assert.deepEqual(pool.termIds(ab), expected);
            }
          }
        }
      }
    } finally { Math.imul = imul; }
  }
});

test('compact index preserves capacity and published keys when link or bucket allocation fails', () => {
  for (const failedLength of [512, 256]) {
    const chunk = make().classes.slotPools[0], pair = new Uint32Array(2), keys = [];
    for (let value = 1; chunk.count < 256; value++) {
      pair[0] = value; pair[1] = value ^ 0x40000000;
      keys.push([pair[0], pair[1], chunk.intern(pair, 0)]);
    }
    const count = chunk.count, words = chunk.words;
    const I32 = globalThis.Int32Array;
    globalThis.Int32Array = new Proxy(I32, { construct(Type, args) {
      if (args[0] === failedLength) throw Error('controlled compact index allocation');
      return Reflect.construct(Type, args);
    } });
    pair[0] = 0xffffffff; pair[1] = 0xffffffff;
    try { assert.throws(() => chunk.intern(pair, 0), /controlled compact index allocation/); }
    finally { globalThis.Int32Array = I32; }
    assert.equal(chunk.count, count);
    if (failedLength === 512) {
      assert.equal(chunk.words, words, 'payload committed before matching links existed');
    }
    for (const [lo, hi, id] of keys) {
      pair[0] = lo; pair[1] = hi;
      assert.equal(chunk.intern(pair, 0), id);
    }
    pair[0] = 0xffffffff; pair[1] = 0xffffffff;
    assert.equal(chunk.intern(pair, 0), count);
    const stats = chunk.memoryStats();
    assert.equal(stats.totalTypedBytes, stats.chunkCapacity * 14);
    assert.equal(stats.hashSlotBytes, stats.chunkCapacity * 2);
    assert.equal(stats.collisionLinkBytes, stats.chunkCapacity * 4);
    chunk.reserveForSearch(512);
    for (let value = 10000; chunk.count < 512; value++) {
      pair[0] = value; pair[1] = value;
      chunk.intern(pair, 0);
    }
    pair[0] = 0xfffffffe; pair[1] = 0xfffffffe;
    assert.throws(() => chunk.intern(pair, 0), /reserved chunk payload capacity/);
    assert.equal(chunk.count, 512);
  }
});

test('cheap chunk address collisions preserve exact IDs through dictionary rehash', () => {
  const chunk = make().classes.slotPools[0];
  const keys = new Uint32Array(800), ids = new Uint32Array(400);
  // Every pair folds to zero in the candidate address filter, including empty.
  // Distinct complete keys must still receive distinct canonical IDs.
  for (let index = 0; index < ids.length; index++) {
    const high = (index + 0x80000000) >>> 0;
    keys[index * 2] = Math.imul(high, 0x9e3779b1) >>> 0;
    keys[index * 2 + 1] = high;
    ids[index] = chunk.intern(keys, index * 2);
  }
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(chunk.metrics.hashGrows > 0);
  const count = chunk.count;
  for (let index = ids.length - 1; index >= 0; index--) {
    assert.equal(chunk.intern(keys, index * 2), ids[index]);
    assert.equal(chunk.equals(ids[index], keys, index * 2), true);
  }
  assert.equal(chunk.count, count);
});

test('reserved composed hashes reuse immutable local IDs across traversal and shared arena reset', () => {
  const k = createSlot64ResidualQuotientKernel(spec, {
    searchStorage: { states: 16384, classes: 16384, chunksPerSlot: 16384 } }).kernel;
  k.prepareSearchStorage();
  const cache = createLocalSemanticDescriptorCache(k);
  for (let state = 0; state < k.states.count; state++) {
    for (let column = 0; column < k.columns; column++) k.advance(state, column);
  }
  const metadataBytes = cache.metrics.retainedTypedBytes;
  for (let state = 0; state < k.states.count; state++) {
    const expected = cache.stateDescriptor(state), actual = cache.hotStateDescriptor(state);
    assert.equal(actual.p0Length, expected.p0Length);
    assert.equal(actual.p1Length, expected.p1Length);
    assert.deepEqual(actual.hash, expected.hash);
  }
  const builds = cache.metrics.stateHashBuilds;
  for (let state = k.states.count - 1; state >= 0; state--) {
    assert.deepEqual(cache.hotStateDescriptor(state).hash, cache.stateDescriptor(state).hash);
  }
  assert.equal(builds, k.states.count);
  assert.equal(cache.metrics.stateHashBuilds, builds);
  assert.equal(cache.metrics.stateHashReuses, k.states.count);
  assert.equal(cache.metrics.retainedTypedBytes, metadataBytes);
  const beforeInvalid = cache.metrics.stateHashReuses;
  for (const invalid of [-1, NaN, 0.5, '0', k.states.count]) assert.throws(() => cache.hotStateDescriptor(invalid));
  assert.equal(cache.metrics.stateHashReuses, beforeInvalid);
  const arena = createSemanticSharedTtArena({ entryCapacity: 8, termCapacity: 4096, domainSpec: spec });
  const tt = createSemanticSharedTtView(arena);
  const descriptor = cache.hotStateDescriptor(k.rootId), originalHash = { ...descriptor.hash };
  const old = tt.ensure(descriptor);
  resetSemanticSharedTtArena(arena);
  assert.equal(tt.probe(cache.hotStateDescriptor(k.rootId)), -1);
  const current = tt.ensure(cache.hotStateDescriptor(k.rootId));
  assert.notEqual(current, old);
  assert.deepEqual(descriptor.hash, originalHash);
  assert.equal(cache.metrics.stateHashBuilds, builds);
});

test('empty chunk identity survives dictionary growth and validates input before reuse', () => {
  const chunk = make().classes.slotPools[0], pair = new Uint32Array(2);
  const empty = chunk.intern(pair, 0);
  for (let value = 1; value < 1100; value++) {
    pair[0] = value; pair[1] = 0x80000000;
    assert.notEqual(chunk.intern(pair, 0), empty);
  }
  pair.fill(0);
  const count = chunk.count, grows = chunk.metrics.hashGrows;
  assert.equal(chunk.intern(pair, 0), empty);
  assert.equal(chunk.count, count);
  assert.equal(chunk.metrics.hashGrows, grows);
  assert.throws(() => chunk.intern([0, 0], 0));
  assert.throws(() => chunk.intern(pair, 1));
});

test('direct semantic edges agree with recomputation and repeated edges bypass every interner', () => {
  const config = { prefixClasses: 8, searchStorage: { states: 16384, classes: 16384, chunksPerSlot: 16384 } };
  const cached = createSlot64ResidualQuotientKernel(spec, { ...config, cacheEdges: true }).kernel;
  const direct = createSlot64ResidualQuotientKernel(spec, { ...config, cacheEdges: false }).kernel;
  cached.prepareSearchStorage(); direct.prepareSearchStorage();
  let terminals = 0, illegal = 0;
  for (let state = 0; state < cached.states.count; state++) {
    for (let column = 0; column < spec.columns; column++) {
      const expected = direct.advance(state, column), actual = cached.advance(state, column);
      assert.equal(actual, expected);
      if (actual === -1) terminals++;
      if (actual === -2) illegal++;
      const stateLookups = cached.states.metrics.internLookups;
      const residualLookups = cached.classes.metrics.internLookups;
      const chunkLookups = cached.classes.slotPools.reduce((sum, pool) => sum + pool.metrics.lookups, 0);
      assert.equal(cached.advance(state, column), actual);
      assert.equal(cached.states.metrics.internLookups, stateLookups);
      assert.equal(cached.classes.metrics.internLookups, residualLookups);
      assert.equal(cached.classes.slotPools.reduce((sum, pool) => sum + pool.metrics.lookups, 0), chunkLookups);
    }
  }
  assert.ok(terminals > 0 && illegal > 0);
  assert.equal(cached.states.count, direct.states.count);
  assert.equal(cached.classes.size, direct.classes.size);
  assert.ok(cached.transitionMetrics.edgeCacheHits > 0);
});

test('prepared exact search performs no typed allocation or backing-array growth', () => {
  const k = createSlot64ResidualQuotientKernel(spec, { prefixClasses: 8, cacheEdges: false,
    searchStorage: { states: 16384, classes: 16384, chunksPerSlot: 16384 } }).kernel;
  const arena = createSemanticSharedTtArena({ entryCapacity: 128, termCapacity: 65536, domainSpec: spec });
  const searcher = createOnlineSemanticQuotientSearcher(k, arena);
  const before = k.storageGrowthStats(), memory = k.memoryStats();
  const descriptorCapacity = searcher.descriptorCache.metrics.classCapacity;
  const types = [ 'Uint8Array', 'Int8Array', 'Uint16Array', 'Int16Array', 'Uint32Array', 'Int32Array', 'Float64Array', 'ArrayBuffer', 'SharedArrayBuffer' ];
  const originals = types.map(name => globalThis[name]);
  for (let index = 0; index < types.length; index++) globalThis[types[index]] = new Proxy(originals[index], {
    construct() { throw new Error('typed allocation attempted inside prepared search'); },
  });
  let value;
  try { value = searcher.search(k.rootId, -2, 2); }
  finally { for (let index = 0; index < types.length; index++) globalThis[types[index]] = originals[index]; }
  assert.ok(value === -1 || value === 0 || value === 1);
  assert.deepEqual(k.storageGrowthStats(), before);
  assert.equal(searcher.descriptorCache.metrics.classCapacity, descriptorCapacity);
  assert.equal(k.memoryStats().totalTypedBytes, memory.totalTypedBytes);
});

test('reserved state/chunk exhaustion preserves published identities instead of allocating', () => {
  const k = createSlot64ResidualQuotientKernel({ columns: 4, rows: 5, connect: 4 }, {
    searchStorage: { states: 4096, classes: 1024, chunksPerSlot: 256 } }).kernel;
  k.prepareSearchStorage();
  const before = k.storageGrowthStats();
  assert.throws(() => {
    for (let p0 = 0; p0 < 2; p0++) for (let p1 = 0; p1 < 2; p1++) {
      for (let support = 0; support < k.support.itemCapacity; support++) k.states.intern(support, p0, p1);
    }
  }, /reserved quotient state capacity/);
  assert.equal(k.states.count, 4096);
  assert.equal(k.states.intern(0, 1, 1), k.rootId);
  const chunk = k.classes.slotPools[0], pair = new Uint32Array(2);
  assert.throws(() => {
    for (let index = 1; index < 1000; index++) { pair[0] = index; pair[1] = index; chunk.intern(pair, 0); }
  }, /reserved chunk payload capacity/);
  assert.equal(chunk.count, 256);
  assert.deepEqual(k.storageGrowthStats(), before);
});

test('standalone local solver reserves its proof arrays without adding them to online workers', () => {
  const k = createSlot64ResidualQuotientKernel(spec, {
    searchStorage: { states: 16384, classes: 16384, chunksPerSlot: 16384 } }).kernel;
  assert.equal(k.proofStore.metrics.capacity, 0);
  const solver = k.createWdlSolver();
  assert.equal(k.proofStore.metrics.capacity, k.states.capacity);
  const grows = k.proofStore.metrics.grows, before = k.storageGrowthStats();
  const result = solver.run();
  assert.ok(result === -1 || result === 0 || result === 1);
  assert.equal(k.proofStore.metrics.grows, grows);
  assert.deepEqual(k.storageGrowthStats(), before);
  k.proofStore.reset();
  assert.equal(solver.run(), result);
  assert.equal(k.proofStore.metrics.grows, grows);
});

test('reserved residual exhaustion preserves existing classes and reports the resource boundary', () => {
  const k = createSlot64ResidualQuotientKernel({ columns: 4, rows: 5, connect: 4 }, {
    searchStorage: { states: 16384, classes: 1024, chunksPerSlot: 4096 }, prefixClasses: 8 }).kernel;
  k.prepareSearchStorage();
  const initial = k.classes.termIds(1), before = k.storageGrowthStats();
  assert.throws(() => {
    for (let state = 0; state < k.states.count; state++) for (let column = 0; column < k.columns; column++) k.advance(state, column);
  }, /reserved residual class capacity/);
  assert.equal(k.classes.size, 1024);
  assert.deepEqual(k.classes.termIds(1), initial);
  assert.deepEqual(k.storageGrowthStats(), before);
  for (const searchStorage of [1, 'large', [], { states: -1 }, { classes: 0.5 }, { chunksPerSlot: NaN }]) {
    assert.throws(() => createSlot64ResidualQuotientKernel(spec, { searchStorage }));
  }
});

test('chunk exact keys survive collisions and growth; a hit never requests insertion capacity', () => {
  const chunk = make().classes.slotPools[0];
  const source = new Uint32Array(2), pairs = [];
  for (let word = 1; chunk.count < 256; word++) {
    source[0] = word; source[1] = (word ^ 0x80000000) >>> 0;
    pairs.push([source[0], source[1], chunk.intern(source, 0)]);
  }
  assert.equal(chunk.hashSlots.length, 128);
  const before = chunk.metrics.hashGrows;
  for (const [lo, hi, id] of pairs) {
    source[0] = lo; source[1] = hi;
    assert.equal(chunk.intern(source, 0), id);
  }
  assert.equal(chunk.metrics.hashGrows, before, 'existing keys grew insertion capacity');
  source[0] = 0xffffffff; source[1] = 0xffffffff;
  const newId = chunk.intern(source, 0);
  assert.equal(chunk.hashSlots.length, 256);
  assert.equal(chunk.intern(source, 0), newId);
  for (const [lo, hi, id] of pairs) {
    source[0] = lo; source[1] = hi;
    assert.equal(chunk.intern(source, 0), id);
  }
  const count = chunk.count;
  for (const offset of [-1, 0.5, NaN, 1, '0']) assert.throws(() => chunk.intern(source, offset));
  assert.throws(() => chunk.intern([1, 2], 0));
  assert.equal(chunk.count, count);
});

test('canonical cardinality and descriptor hashes match independent term sequences across growth and geometries', () => {
  for (const domain of [spec, { columns: 4, rows: 4, connect: 4 }, { columns: 4, rows: 5, connect: 4 }, { columns: 7, rows: 6, connect: 4 }]) {
    const options = { prefixClasses: 8, cacheEdges: false, responseClosure: false };
    const k = createSlot64ResidualQuotientKernel(domain, options).kernel;
    const reference = createScaledTermIdQuotientNativeNegamaxKernel(domain, options).kernel;
    const cache = createLocalSemanticDescriptorCache(k);
    const first = cache.classDescriptor(1);
    for (let state = 0; state < k.states.count && state < 5000; state++) {
      for (let column = 0; column < domain.columns; column++) {
        assert.equal(k.advance(state, column), reference.advance(state, column));
      }
    }
    assert.equal(k.classes.size, reference.classes.size);
    for (let id = 0; id < k.classes.size; id++) {
      const expected = reference.classes.termIds(id);
      const target = new Uint16Array(expected.length + 4).fill(0xffff);
      assert.equal(k.classes.termCount(id), expected.length);
      assert.equal(k.classes.writeTermIds(id, target, 2), expected.length);
      assert.deepEqual(target.subarray(2, 2 + expected.length), expected);
      assert.deepEqual([...target.subarray(0, 2), ...target.subarray(2 + expected.length)], [65535, 65535, 65535, 65535]);
      const descriptor = cache.classDescriptor(id);
      assert.equal(descriptor.length, expected.length);
      assert.deepEqual(descriptor.hash, hashResidualTermIds(expected));
    }
    const builds = cache.metrics.classBuilds;
    for (let id = k.classes.size - 1; id >= 0; id--) cache.classDescriptor(id);
    assert.equal(cache.metrics.classBuilds, builds, 'hash-ready bits survive growth, including bit 31');
    assert.deepEqual(cache.classDescriptor(1), first);
    assert.ok(k.classes.metrics.ownTransitionMisses > 0 && k.classes.metrics.blockTransitionMisses > 0);
    if (domain.rows === 5) assert.ok(k.classes.metrics.classGrows > 0);
  }
});

test('term writer rejects malformed capacity before mutation and class-count allocation failure preserves published classes', () => {
  const k = createSlot64ResidualQuotientKernel({ columns: 4, rows: 5, connect: 4 }, { prefixClasses: 8 }).kernel;
  const pool = k.classes, count = pool.termCount(1);
  const target = new Uint16Array(count).fill(0xffff);
  for (const offset of [-1, 0.5, NaN, 1, 2 ** 32]) {
    assert.throws(() => pool.writeTermIds(1, target, offset));
    assert.ok(target.every(value => value === 0xffff));
  }
  for (const id of [-1, pool.size, 0.5, NaN]) assert.throws(() => pool.termCount(id));
  const U16 = globalThis.Uint16Array;
  globalThis.Uint16Array = new Proxy(U16, { construct(Type, args) {
    if (pool.size === 1024 && args[0] === 2048) throw new RangeError('controlled class-count allocation failure');
    return Reflect.construct(Type, args);
  } });
  try {
    assert.throws(() => {
      for (let state = 0; state < k.states.count; state++) for (let column = 0; column < k.columns; column++) k.advance(state, column);
    }, /controlled class-count allocation/);
  } finally { globalThis.Uint16Array = U16; }
  assert.equal(pool.size, 1024);
  for (let id = 0; id < pool.size; id++) assert.equal(pool.termCount(id), pool.termIds(id).length);
  assert.equal(pool.termCount(1), count);
  for (let state = 0; state < k.states.count && pool.size === 1024; state++) for (let column = 0; column < k.columns; column++) k.advance(state, column);
  assert.ok(pool.size > 1024, 'growth resumes after allocation recovery');
  assert.equal(pool.termCount(1), count);
});

test('qualification baseline keeps one proof owner and rejects invalid residual inputs', () => {
  const wrap = createScaledTermIdQuotientNativeNegamaxKernel(spec, { prefixClasses: 8 });
  assert.equal(wrap.kernel.proofStore, wrap.proofStore);
  const pool = wrap.kernel.classes;
  for (const id of [-1, undefined, pool.size]) {
    assert.throws(() => pool.termIds(id));
    assert.throws(() => pool.isEmpty(id));
    assert.throws(() => pool.ownTransition(id, 0));
  }
  assert.throws(() => pool.ownTransition(1, -1));
  assert.throws(() => pool.hasSingletonAt(1, 2 ** 32, 0));
  assert.throws(() => createTermVocabulary({ columns: 1, rows: 32, connect: 32 }), /connect/);
});

test('support access rejects malformed indices and columns without rank-zero aliases', () => {
  for (const layout of ['packed', 'table']) {
    const k = make(layout);
    for (const index of [-1, undefined, NaN, '0', 0.5, k.support.itemCapacity, 2 ** 32]) {
      assert.throws(() => k.supportAccess.rankAt(index), `${layout} rank ${index}`);
      assert.throws(() => k.supportAccess.hasEvenColumnRemainders(index));
      assert.throws(() => k.supportAccess.landingAt(index, 0));
      assert.throws(() => k.supportAccess.childAt(index, 0));
    }
    for (const column of [-1, undefined, NaN, '0', 0.5, spec.columns]) {
      assert.throws(() => k.supportAccess.landingAt(0, column));
      assert.throws(() => k.supportAccess.childAt(0, column));
    }
    assert.equal(k.supportAccess.childAt(spec.rows, 0), 0xffffffff, 'full column child must be illegal');
    assert.equal(k.supportAccess.rankAt(0), 0);
    assert.equal(k.supportAccess.rankAt(k.support.itemCapacity - 1), 12);
  }
});

test('paired response guard preserves every column reservoir in packed and table layouts', () => {
  for (const domain of [spec, { columns: 4, rows: 4, connect: 4 }]) {
    for (const layout of ['packed', 'table']) {
      const { kernel: k } = createSlot64ResidualQuotientKernel(domain, { supportLayout: layout });
      for (let index = 0; index < k.support.itemCapacity; index++) {
        let rest = index, paired = true;
        for (let c = 0; c < domain.columns; c++) {
          const height = rest % (domain.rows + 1); rest = Math.floor(rest / (domain.rows + 1));
          if ((domain.rows - height) % 2 !== 0) paired = false;
        }
        assert.equal(k.supportAccess.hasEvenColumnRemainders(index), paired);
      }
    }
  }
});

test('compiled residual coverage rejects malformed inputs and reads canonical chunks after growth', () => {
  const k = make();
  const words = k.classes.termWordCount;
  assert.throws(() => k.classes.everyTermInMask(-1, new Uint32Array(words)));
  assert.throws(() => k.classes.everyTermInMask(0, new Uint32Array(words - 1)));
  assert.throws(() => createSlot64ResidualQuotientKernel(spec, { responseClosure: 1 }));
  for (let id = 0; id < k.states.count; id++) for (let c = 0; c < k.columns; c++) k.advance(id, c);
  const mask = new Uint32Array(words);
  for (let i = 0; i < mask.length; i++) mask[i] = i & 1 ? 0xaaaaaaaa : 0x55555555;
  for (let id = 0; id < k.classes.size; id++) {
    const expected = k.classes.termIds(id).every(term => (mask[term >>> 5] & (1 << (term & 31))) !== 0);
    assert.equal(k.classes.everyTermInMask(id, mask), expected);
  }
  assert.equal(k.memoryStats().responseClosureBytes, words * Uint32Array.BYTES_PER_ELEMENT);
});

test('board input is captured once at initialization and residual widths derive from that domain', () => {
  for (const expected of [spec, { columns: 4, rows: 5, connect: 4 }, { columns: 7, rows: 6, connect: 4 }]) {
    const reads = { columns: 0, rows: 0, connect: 0 };
    const input = Object.fromEntries(Object.keys(reads).map(key => [key, expected[key]]));
    for (const key of Object.keys(reads)) Object.defineProperty(input, key, { get() {
      assert.equal(++reads[key], 1, `${key} must only be captured once`);
      return expected[key];
    } });
    const k = createSlot64ResidualQuotientKernel(input, { prefixClasses: 8 }).kernel;
    assert.deepEqual(k.domain, expected);
    assert.ok(Object.isFrozen(k.domain));
    const expectedWords = Math.ceil(k.classes.termVocabulary.count / 64) * 2;
    assert.equal(k.classes.termWordCount, expectedWords);
    assert.equal(k.classes.slotPools.length, expectedWords / 2);
    assert.equal(k.memoryStats().responseClosureBytes, expectedWords * 4);
    assert.throws(() => { k.classes.termWordCount = expectedWords + 2; }, TypeError);
    const child = k.advance(k.rootId, 0);
    assert.equal(k.supportAccess.rankAt(k.states.support[child]), 1);
  }
});

test('state interning and cached edges reject values outside their owned domains', () => {
  const k = make();
  const count = k.states.count;
  for (const triple of [[2 ** 32, 1, 1], [-1, 1, 1], [0, 2 ** 32, 1], [0, 1, -1], [0, 1, k.classes.size], [0, '1', 1]]) {
    assert.throws(() => k.states.intern(...triple));
    assert.equal(k.states.count, count);
  }
  assert.throws(() => k.states.setEdge(0, 0, 2 ** 32));
  assert.throws(() => k.states.setEdge(0, 0, -99));
  assert.throws(() => k.states.edgeAt(-1, 0));
  assert.equal(k.states.intern(0, 1, 1), 0);
});

test('slot64 cell masks reject integer wrapping and preserve the residual class', () => {
  const k = make();
  const before = k.classes.termIds(1);
  for (const [lo, hi] of [[1 + 2 ** 32, 0], [1, 2 ** 32], [1 - 2 ** 32, 0]]) {
    assert.throws(() => k.classes.ownTransition(1, 0, lo, hi));
    assert.throws(() => k.classes.hasSingletonAt(1, lo, hi));
  }
  assert.deepEqual(k.classes.termIds(1), before);
});

test('failed state growth leaves every existing backing array and capacity intact', () => {
  const k = createSlot64ResidualQuotientKernel({ columns: 4, rows: 5, connect: 4 }, { prefixClasses: 8 }).kernel;
  const s = k.states;
  const before = [s.support, s.p0Class, s.p1Class, s.edges, s.capacity];
  const U32 = globalThis.Uint32Array;
  let allocations = 0;
  globalThis.Uint32Array = new Proxy(U32, { construct(target, args) {
    if (s.count === s.capacity && args[0] === s.capacity * 2 && ++allocations === 2) throw new RangeError('controlled allocation failure');
    return Reflect.construct(target, args);
  } });
  try {
    assert.throws(() => {
      for (let id = 0; id < s.count; id += 1) {
        for (let column = 0; column < k.columns; column += 1) k.advance(id, column);
      }
    }, /controlled allocation/);
  } finally {
    globalThis.Uint32Array = U32;
  }
  assert.equal(s.capacity, before[4]);
  for (let i = 0; i < 4; i += 1) assert.equal([s.support, s.p0Class, s.p1Class, s.edges][i], before[i]);
  assert.equal(s.intern(0, 1, 1), 0);
});

test('semantic IDs and cached edges survive repeated state growth and hash collisions', () => {
  for (const cacheEdges of [false, true]) {
    const k = createSlot64ResidualQuotientKernel({ columns: 4, rows: 5, connect: 4 }, { cacheEdges, prefixClasses: 8 }).kernel;
    const s = k.states, online = installOnlineOnlyStateStorage(s);
    const edges = [];
    // Grow through three backing tiers using actual legal residual transitions.
    for (let id = 0; s.count < 17000; id++) {
      assert.ok(id < s.count);
      for (let column = 0; column < k.columns; column++) edges.push([id, column, k.advance(id, column)]);
    }
    assert.ok(s.metrics.stateGrows >= 3);
    assert.ok(s.metrics.hashGrows >= 2);
    const count = s.count;
    for (let id = 0; id < count; id++) {
      assert.equal(s.intern(s.support[id], s.p0Class[id], s.p1Class[id]), id);
    }
    for (const [id, column, child] of edges) assert.equal(k.advance(id, column), child);
    assert.equal(s.count, count);
    assert.equal(s.memoryStats().stateArrayBytes, 12 * s.capacity);
    assert.equal(online.stats().localProofBytesRetained, 0);
    assert.equal(online.stats().stateCapacity, s.capacity);
  }
});
