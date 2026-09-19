import test from 'node:test';
import assert from 'node:assert/strict';
import { nativeFrontierCode, deriveNativeFrontierConsequence } from '../frontier.mjs';
import { IsoMaxSolver } from '../solver.mjs';
import { STATUS_ONGOING } from '../../domain/index.mjs';
import { IsoMaxTaskSolver } from '../execution/task.mjs';
import { ResidualPool } from '../residual-pool.mjs';
import { IsoMaxTransitionCache } from '../isomax-index.mjs';

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
