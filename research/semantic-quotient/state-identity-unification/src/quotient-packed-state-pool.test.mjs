import test from 'node:test';
import assert from 'node:assert/strict';
import { QN_ILLEGAL } from './quotient-negamax-domain-contract.mjs';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createPackedStateLayout, PackedQuotientStatePool } from './quotient-packed-state-pool.mjs';

test('native identity layout round trips all width regimes against independent BigInt concatenation', () => {
  let random = 0x541112;
  function next() { random ^= random << 13; random ^= random >>> 17; random ^= random << 5; return random >>> 0; }
  for (let s = 0; s <= 32; s++) for (let c = 0; c <= 32; c++) {
    const l = createPackedStateLayout(2 ** s, 2 ** c);
    assert.equal(l.words, s + 2 * c <= 64 ? 2 : 3);
    for (let i = 0; i < 16; i++) {
      const a = i === 0 ? 2 ** s - 1 : next() % 2 ** s;
      const b = i === 0 ? 2 ** c - 1 : next() % 2 ** c;
      const d = i === 0 ? 2 ** c - 1 : next() % 2 ** c;
      const lo = l.low(a, b, d), hi = l.high(a, b, d), third = l.third(a, b, d);
      assert.equal(l.support(lo), a); assert.equal(l.p0(lo, hi), b); assert.equal(l.p1(lo, hi, third), d);
      if (l.words === 2) assert.equal(BigInt(lo) | (BigInt(hi) << 32n),
        BigInt(a) | (BigInt(b) << BigInt(s)) | (BigInt(d) << BigInt(s + c)));
    }
  }
  for (const invalid of [0, -1, NaN, Infinity, 0.5, '64', 2 ** 32 + 1]) {
    assert.throws(() => createPackedStateLayout(invalid, 1));
    assert.throws(() => createPackedStateLayout(1, invalid));
  }
});

test('sealing preserves IDs and edges, replaces payload, and rejects capacity aliases', () => {
  for (const classCapacity of [1024, 2 ** 22, 2 ** 32]) {
    const classes = { size: classCapacity }, p = new PackedQuotientStatePool(7, true, 823543, classes);
    const triples = [[0, 0, 0], [2114, 21, 20], [2114, 39, 38], [823542, classCapacity - 1, classCapacity - 1]];
    triples.forEach(t => p.intern(...t)); p.setEdge(0, 3, 1);
    const bytes = p.estimateReservedBytes(8192, classCapacity);
    const readSupport = p.supportAt.bind(p), readP0 = p.p0At.bind(p), readP1 = p.p1At.bind(p);
    p.reserveForSearch(8192, classCapacity);
    assert.equal(p.memoryStats().totalTypedBytes, bytes);
    assert.equal(p.memoryStats().identityWords, classCapacity <= 2 ** 22 ? 2 : 3);
    assert.equal(p.edgeAt(0, 3), 1);
    assert.equal(p.support, undefined); assert.equal(p.p0Class, undefined); assert.equal(p.p1Class, undefined);
    for (let id = 0; id < triples.length; id++) {
      assert.equal(p.intern(...triples[id]), id);
      assert.deepEqual([p.supportAt(id), p.p0At(id), p.p1At(id)], triples[id]);
      assert.deepEqual([readSupport(id), readP0(id), readP1(id)], triples[id], 'reader captured before sealing became stale');
    }
    for (const invalid of [-1, p.count, NaN, 0.5, '0', 2 ** 32]) {
      assert.throws(() => p.supportAt(invalid)); assert.throws(() => p.p0At(invalid)); assert.throws(() => p.p1At(invalid));
    }
    for (const invalid of [-1, NaN, 0.5, '0', classCapacity]) assert.throws(() => p.intern(0, invalid, 0));
    assert.throws(() => p.intern(823543, 0, 0));
  }
});

test('invalid reservation requests fail before changing the state owner', () => {
  for (const value of [0, -1, NaN, 0.5, '4096', 2 ** 30]) {
    const p = new PackedQuotientStatePool(1, false, 4, { size: 4 });
    p.intern(0, 1, 1);
    assert.throws(() => p.estimateReservedBytes(value, 4));
    assert.throws(() => p.reserveForSearch(value, 4));
    assert.equal(p.intern(0, 1, 1), 0);
  }
});

test('all-zero bucket hash still distinguishes complete keys and full pool still returns existing IDs', () => {
  const imul = Math.imul;
  Math.imul = (a, b) => b === 0x7feb352d || b === 0x846ca68b ? 0 : imul(a, b);
  try {
    const p = new PackedQuotientStatePool(1, false, 65536, { size: 1024 });
    p.reserveForSearch(4096, 1024);
    for (let i = 0; i < 4096; i++) assert.equal(p.intern(i, i & 1023, (i * 3) & 1023), i);
    assert.throws(() => p.intern(4096, 0, 0), /capacity/);
    for (let i = 0; i < 4096; i++) assert.equal(p.intern(i, i & 1023, (i * 3) & 1023), i);
    assert.equal(p.count, 4096);
  } finally { Math.imul = imul; }
});

test('failed reservation allocation preserves readable identities and allows a clean retry', () => {
  for (const failType of ['words', 'slots', 'edges']) {
    const p = new PackedQuotientStatePool(7, true, 823543, { size: 1024 });
    p.intern(2114, 21, 20); p.setEdge(0, 1, 0);
    const before = p.memoryStats(), U32 = globalThis.Uint32Array, I32 = globalThis.Int32Array;
    const Type = failType === 'words' ? U32 : I32;
    const key = failType === 'words' ? 'Uint32Array' : 'Int32Array';
    const length = failType === 'edges' ? 8192 * 7 : 8192 * 2;
    globalThis[key] = new Proxy(Type, { construct(Target, args) {
      if (args[0] === length) throw Error('controlled reservation failure');
      return Reflect.construct(Target, args);
    } });
    try { assert.throws(() => p.reserveForSearch(8192, 1024), /controlled/); }
    finally { globalThis.Uint32Array = U32; globalThis.Int32Array = I32; }
    assert.deepEqual(p.memoryStats(), before);
    assert.equal(p.intern(2114, 21, 20), 0); assert.equal(p.edgeAt(0, 1), 0);
    p.reserveForSearch(8192, 1024); assert.equal(p.p1At(0), 20);
  }
});

test('edge validation handoff keeps direct state-part reads strict', () => {
  const p = new PackedQuotientStatePool(4, true, 64, { size: 64 });
  const first = p.intern(5, 7, 9);
  const second = p.intern(6, 8, 10);
  const target = { supportIndex: -1, p0ClassId: -1, p1ClassId: -1 };

  assert.throws(() => p.writeStateParts(-1, target), /invalid quotient state id/);
  p.edgeAt(first, 0);
  p.writeStateParts(first, target);
  assert.deepEqual(target, { supportIndex: 5, p0ClassId: 7, p1ClassId: 9 });

  p.edgeAt(first, 0);
  assert.throws(() => p.writeStateParts(p.count, target), /invalid quotient state id/);
  p.writeStateParts(second, target);
  assert.deepEqual(target, { supportIndex: 6, p0ClassId: 8, p1ClassId: 10 });
});

test('transition keeps state validation at the packed owner while preserving invalid-column semantics', () => {
  const { kernel } = createSlot64ResidualQuotientKernel({ columns: 4, rows: 3, connect: 3 }, {
    prefixClasses: 8,
    cacheEdges: true,
  });
  assert.throws(() => kernel.advance(-1, 0), /invalid quotient state id/);
  assert.equal(kernel.advance(kernel.rootId, -1), QN_ILLEGAL);
  assert.equal(kernel.advance(kernel.rootId, kernel.columns), QN_ILLEGAL);
  const child = kernel.advance(kernel.rootId, 0);
  assert.ok(child >= 0);
  assert.equal(kernel.advance(kernel.rootId, 0), child);
});
