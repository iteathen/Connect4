import test from 'node:test';
import assert from 'node:assert/strict';
import { nativeFrontierCode, deriveNativeFrontierConsequence } from '../frontier.mjs';
import { IsoMaxSolver } from '../solver.mjs';
import { STATUS_ONGOING } from '../../domain/index.mjs';
import { IsoMaxTaskSolver } from '../execution/task.mjs';
import { ResidualPool } from '../residual-pool.mjs';
import { IsoMaxTransitionCache } from '../isomax-index.mjs';
import { IsometricState } from '../state.mjs';
import { makeCorpus } from '../../../benchmarks/isomax-ordering/corpus.mjs';
import { ISOMETRIC_PROFILE } from '../profile.mjs';

test('preloaded cell masks match independent 42-bit decomposition including bit 31', () => {
  for (let cell = 0; cell < 42; cell++) {
    const wide = 1n << BigInt(cell);
    assert.equal(ISOMETRIC_PROFILE.cellLo[cell], Number(wide & 0xffffffffn));
    assert.equal(ISOMETRIC_PROFILE.cellHi[cell], Number(wide >> 32n));
  }
});

test('cold reservation preserves warm class content and transition identity across width growth', () => {
  const pool = new ResidualPool();
  const state = new IsometricState({ pool, moves: [3, 2, 4, 3, 5, 4] });
  const signature = [...state.gameplayKey()];
  const expected = Array.from({ length: pool.classCount }, (_, id) => pool.terms(id));
  const own = pool.ownTransition(state.p0Class, 7), blocked = pool.blockTransition(state.p1Class, 7);
  pool.prepareSearchStorage(65536);
  assert.equal(pool.sealed, true);
  for (const slots of pool.classSlotIds) assert.equal(slots.BYTES_PER_ELEMENT, 4);
  expected.forEach((terms, id) => assert.deepEqual(pool.terms(id), terms));
  assert.deepEqual([...state.gameplayKey()], signature);
  assert.equal(pool.ownTransition(state.p0Class, 7), own);
  assert.equal(pool.blockTransition(state.p1Class, 7), blocked);
  const retained = [...pool.classSlotIds];
  pool.prepareSearchStorage(1);
  retained.forEach((array, slot) => assert.equal(pool.classSlotIds[slot], array));
});

test('every isolated vocabulary term preserves all cell cofactors and reflection', () => {
  const pool = new ResidualPool(), p = ISOMETRIC_PROFILE, bits = new Uint32Array(20);
  const pair = wide => [[Number(wide & 0xffffffffn), Number(wide >> 32n)]];
  for (let id = 0; id < p.count; id++) {
    bits.fill(0); bits[id >>> 5] = 1 << (id & 31);
    const parent = pool.internBits(bits), mask = BigInt(p.lo[id]) | (BigInt(p.hi[id]) << 32n);
    let mirror = 0n;
    for (let cell = 0; cell < 42; cell++) {
      const bit = 1n << BigInt(cell), hit = (mask & bit) !== 0n;
      const remaining = mask & ~bit, own = pool.ownTransition(parent, cell);
      if (remaining === 0n) assert.equal(own, -1);
      else assert.deepEqual(pool.terms(own), pair(remaining));
      assert.equal(pool.blockTransition(parent, cell), hit ? 0 : parent);
      if (hit) mirror |= 1n << BigInt(Math.floor(cell / 7) * 7 + 6 - cell % 7);
    }
    assert.deepEqual(pool.terms(pool.reflectClass(parent)), pair(mirror));
  }
});

test('direct singleton projection is exact for every vocabulary term and mixed word-1 bits', () => {
  const pool = new ResidualPool(), bits = new Uint32Array(20), target = pool.classCount;
  for (let id = 0; id < ISOMETRIC_PROFILE.count; id++) {
    bits.fill(0); bits[id >>> 5] = 1 << (id & 31);
    pool.computeSingletonMasks(bits, target);
    const singleton = ISOMETRIC_PROFILE.cardinality[id] === 1;
    assert.equal(pool.singletonLo[target], singleton ? ISOMETRIC_PROFILE.lo[id] : 0);
    assert.equal(pool.singletonHi[target], singleton ? ISOMETRIC_PROFILE.hi[id] : 0);
  }
  bits.fill(0xffffffff); pool.computeSingletonMasks(bits, target);
  assert.equal(pool.singletonLo[target], 0xffffffff);
  assert.equal(pool.singletonHi[target], 0x3ff);
});

test('prepared q scalars survive scratch reuse, collisions, repeated growth and mirrored lookup', () => {
  const pool = new ResidualPool(), cache = new IsoMaxTransitionCache({ pool, initialCapacity: 8 });
  const root = new IsometricState({ pool, moves: [1, 3, 2, 4] });
  const hash = cache.prepareKey(root), a = cache.scratch[0], b = cache.scratch[1], support = cache.scratch[2] >>> 0;
  assert.equal(cache.getPreparedUnchecked(a, b, support, hash), undefined);
  const oldSlot = cache.findPreparedSlotUnchecked(a, b, support, hash);
  let collision = false;
  let negativeHash = false;
  const entries = makeCorpus({ seed: 774, ply: 20, count: 64 }).map(({ moves }, i) => {
    const state = new IsometricState({ pool, moves });
    const h = cache.prepareKey(state);
    assert.equal(h, h | 0);
    negativeHash ||= h < 0;
    if ((h & 7) === oldSlot) collision = true;
    cache.set(state, 100 + i); return { state, value: 100 + i };
  });
  assert.ok(collision); assert.ok(cache.capacity > 32);
  assert.ok(negativeHash, 'exercise the high hash bit without unsigned boxing');
  root.applyUnchecked(0); cache.get(root); root.undo();
  cache.setPreparedUnchecked(a, b, support, hash, 12345);
  assert.equal(cache.get(root), 12345);
  assert.equal(cache.get(new IsometricState({ pool, moves: [5, 3, 4, 2] })), 12345);
  for (const { state, value } of entries) assert.equal(cache.get(state), value);
  assert.throws(() => cache.prepareKey(new IsometricState()), /pool/);
});

test('recursive exact lookup and store derive q only once per entered node', () => {
  const solver = new IsoMaxSolver(), state = solver.createState(Array.from('466537327657277224', c => Number(c) - 1));
  const derive = state.gameplayKey;
  let derivations = 0;
  state.gameplayKey = function (target) { derivations++; return derive.call(this, target); };
  const result = solver.solveValue(state);
  assert.equal(result.value, 0);
  assert.equal(derivations, result.metrics.nodes);
  assert.ok(result.metrics.transitionCacheStores > 1000);
});

test('scalar frontier classifies every single and paired cell across both words', () => {
  const pool = { emptyClass: 0, singletonLo: new Uint32Array(3), singletonHi: new Uint32Array(3) };
  const state = { pool, status: STATUS_ONGOING, p0Class: 1, p1Class: 2,
    playableLo: 0xffffffff, playableHi: 0x3ff, sideToMove: 0 };
  for (let side = 0; side < 2; side++) {
    state.sideToMove = side;
    const own = side + 1, opponent = 2 - side;
    for (let a = 0; a < 42; a++) {
      for (let b = a; b < 42; b++) {
        pool.singletonLo.fill(0); pool.singletonHi.fill(0);
        for (const cell of [a, b]) {
          if (cell < 32) pool.singletonLo[opponent] |= 1 << cell;
          else pool.singletonHi[opponent] |= 1 << (cell - 32);
        }
        assert.equal(nativeFrontierCode(state), a === b ? 64 + a : side === 0 ? 17 : 19);
        const conclusion = deriveNativeFrontierConsequence(state);
        assert.ok(Object.isFrozen(conclusion));
        assert.strictEqual(deriveNativeFrontierConsequence(state), conclusion);
        // First-win precedence must survive the multiple-threat shortcut.
        pool.singletonLo[own] = 1;
        assert.equal(nativeFrontierCode(state), side === 0 ? 11 : 9);
      }
    }
  }
});

test('actual native worker recursion reserves storage and never constructs/copies buffers', () => {
  // OWNER-PROTECTED REGRESSION CONTROL — do not remove/weaken this comment.
  // Do not disable traps, skip this test, shrink it to cache-only work, or move
  // instrumentation outside the actual recursive path to make a change pass.
  // New classes must be created under the traps. Extend coverage when adding
  // a hot-path operation; preserve the owner contract in solver.mjs.
  const solver = new IsoMaxTaskSolver();
  const needed = new SharedArrayBuffer(4), abort = new SharedArrayBuffer(4);
  Atomics.store(new Int32Array(needed), 0, 1);
  const names = ['Array', 'ArrayBuffer', 'SharedArrayBuffer', 'Uint8Array', 'Uint16Array', 'Uint32Array', 'Int32Array'];
  const originals = names.map(name => globalThis[name]);
  const typedPrototype = Object.getPrototypeOf(Uint8Array.prototype);
  const set = typedPrototype.set, subarray = typedPrototype.subarray;
  const arrayFrom = Array.from, iterator = Array.prototype[Symbol.iterator], stringify = JSON.stringify;
  const reject = () => { throw new Error('allocation/copy/iterator/string operation in worker recursion'); };
  const originalNode = solver.solveNode;
  let depth = 0, classesBefore, classesAfter;
  solver.solveNode = function (state) {
    const outer = depth++ === 0;
    if (outer) {
      assert.equal(this.pool.sealed, true); assert.equal(this.transitionCache.sealed, true);
      classesBefore = this.pool.classCount;
      for (let i = 0; i < names.length; i++) globalThis[names[i]] = new Proxy(originals[i], { construct: reject, apply: reject });
      typedPrototype.set = reject; typedPrototype.subarray = reject;
      originals[0].from = reject; originals[0].prototype[Symbol.iterator] = reject; JSON.stringify = reject;
    }
    try { return originalNode.call(this, state); }
    finally {
      depth--;
      if (outer) {
        for (let i = 0; i < names.length; i++) globalThis[names[i]] = originals[i];
        typedPrototype.set = set; typedPrototype.subarray = subarray;
        Array.from = arrayFrom; Array.prototype[Symbol.iterator] = iterator; JSON.stringify = stringify;
        classesAfter = this.pool.classCount;
      }
    }
  };
  const result = solver.runTask({ moves: [], rootPly: 0, nodeBudget: 4096, abort, needed });
  assert.equal(result.kind, 'split'); assert.equal(result.nodes, 4096);
  assert.ok(classesAfter > classesBefore); assert.ok(result.frames.length > 0);
  assert.equal(solver.pool.sealed, false); assert.equal(solver.nextControlNode, Infinity);
});

test('sealed pool and cache reject growth without losing published identities', () => {
  const pool = new ResidualPool(), cache = new IsoMaxTransitionCache({ pool });
  pool.prepareSearchStorage(8); cache.prepareSearchStorage(8);
  const initial = pool.initialClass, chunk = pool.slotPools[0];
  assert.throws(() => pool.ensureClassCapacity(pool.classCapacity + 1), /CLASS_CAPACITY/);
  assert.throws(() => pool.ensureReferenceWidth(0, 2 ** 25), /REFERENCE_CAPACITY/);
  assert.throws(() => pool.growClassHash(), /HASH_CAPACITY/);
  assert.throws(() => chunk.ensureCapacity(chunk.capacity + 1), /CHUNK_CAPACITY/);
  assert.throws(() => chunk.growHash(), /HASH_CAPACITY/);
  assert.throws(() => cache.grow(), /TRANSITION_CAPACITY/);
  assert.equal(pool.initialClass, initial);
  assert.ok(pool.termIds(initial).length > 0);
});

test('default recursion skips certificate materialization and conclusion construction', () => {
  const solver = new IsoMaxSolver();
  const state = solver.createState(Array.from('466537327657277224', c => Number(c) - 1));
  solver.collectCertificateFacts = () => { throw new Error('empty certificate path entered'); };
  const freeze = Object.freeze;
  Object.freeze = () => { throw new Error('recursive object freezing'); };
  try {
    const result = solver.solve(state);
    assert.ok([-1, 0, 1].includes(result.value));
    assert.equal(state.ply, 18);
  } finally { Object.freeze = freeze; }
});
