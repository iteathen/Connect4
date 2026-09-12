import assert from 'node:assert/strict';
import test from 'node:test';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';

const spec = { columns: 4, rows: 3, connect: 3 };
const make = (supportLayout = 'packed') => createSlot64ResidualQuotientKernel(spec, { supportLayout, prefixClasses: 8 }).kernel;

test('support access rejects malformed indices and columns without rank-zero aliases', () => {
  for (const layout of ['packed', 'table']) {
    const k = make(layout);
    for (const index of [-1, undefined, NaN, '0', 0.5, k.support.itemCapacity, 2 ** 32]) {
      assert.throws(() => k.supportAccess.rankAt(index), `${layout} rank ${index}`);
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
  const before = [s.support, s.p0Class, s.p1Class, s.hashes, s.edges, s.capacity];
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
  assert.equal(s.capacity, before[5]);
  for (let i = 0; i < 5; i += 1) assert.equal([s.support, s.p0Class, s.p1Class, s.hashes, s.edges][i], before[i]);
  assert.equal(s.intern(0, 1, 1), 0);
});
