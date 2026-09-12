import assert from 'node:assert/strict';
import test from 'node:test';
import { createPackedProofStore } from './quotient-packed-proof-store.mjs';
import { createSharedProofArena } from './quotient-proof-resource-service.mjs';
import { createSemanticSharedTtArena, createSemanticSharedTtView } from './quotient-semantic-shared-tt.mjs';
import * as records from './quotient-negamax-search-record.mjs';

const descriptor = (supportIndex) => ({ supportIndex, p0: { ids: new Uint16Array([1]) }, p1: { ids: new Uint16Array() }, hash: { lo: 0, hi: supportIndex } });
function semanticFixture() {
  const arena = createSemanticSharedTtArena({ entryCapacity: 1, associativity: 1, termCapacity: 64 });
  const tt = createSemanticSharedTtView(arena);
  return { arena, tt, store: createPackedProofStore(arena), handle: tt.ensure(descriptor(1)) };
}

test('proof arenas dispatch only explicit complete contracts', () => {
  const arena = createSharedProofArena(1);
  for (const invalid of [arena.recordBuffer, { ...arena, kind: 'unknown' }, { ...arena, kind: undefined }, { ...arena, stateCount: 2 }]) {
    assert.throws(() => createPackedProofStore(invalid));
  }
  const semantic = semanticFixture().arena;
  for (const invalid of [{ ...semantic, generationLimit: 0 }, { ...semantic, slotStates: { ...semantic.slotStates, ready: 4 } }, { ...semantic, statusBuffer: new SharedArrayBuffer(0) }]) {
    assert.throws(() => createPackedProofStore(invalid));
  }
});

test('publication rejects invalid values and hints before either live or stale access', () => {
  const shared = createSharedProofArena(1);
  const semantic = semanticFixture();
  for (const [store, handle] of [[createPackedProofStore(shared), 0], [semantic.store, semantic.handle], [semantic.store, -1]]) {
    for (const method of ['publishExact', 'publishLower', 'publishUpper']) {
      for (const value of [-2, 2, NaN, Infinity, -Infinity, 0.5, '0', null, undefined]) {
        assert.throws(() => store[method](handle, value), `${method} accepted ${String(value)}`);
      }
      for (const hint of [-2, 7, NaN, 0.5, '1', null]) assert.throws(() => store[method](handle, 0, hint));
    }
  }
  assert.equal(createPackedProofStore(shared).lower(0), -1);
  assert.equal(semantic.store.upper(semantic.handle), 1);
});

test('packed records reject reserved bits, invalid bounds and implicit number coercion', () => {
  for (const record of [-1, 128, 255, 3, 12, 2, NaN, 0.5, '120', undefined, null]) {
    for (const read of ['proofLower', 'proofUpper', 'bestMoveHint']) assert.throws(() => records[read](record));
    assert.throws(() => records.withProofBounds(record, -1, 1));
    assert.throws(() => records.withBestMoveHint(record, 0));
  }
  assert.throws(() => records.withProofLower(records.exactProofRecord(-1), 1));
  assert.throws(() => records.withProofUpper(records.exactProofRecord(1), -1));
  for (let lower = -1; lower <= 1; lower++) for (let upper = lower; upper <= 1; upper++) for (let hint = -1; hint <= 6; hint++) {
    const record = records.withBestMoveHint(records.withProofBounds(records.INITIAL_SEARCH_RECORD, lower, upper), hint);
    assert.equal(records.proofLower(record), lower);
    assert.equal(records.proofUpper(record), upper);
    assert.equal(records.bestMoveHint(record), hint);
  }
});

test('replacement before proof lock acquisition rejects old publication and releases the acquired generation', () => {
  const { arena, tt, store, handle } = semanticFixture();
  let replacementHandle;
  const compareExchange = Atomics.compareExchange;
  // Deterministically interleave the public descriptor owner at the pre-CAS edge.
  // Production code has no test hook and the replacement still uses normal ensure().
  let armed = true;
  Atomics.compareExchange = (array, index, expected, replacement) => {
    if (armed && array.buffer === arena.statusBuffer && expected === arena.slotStates.ready && replacement === arena.slotStates.proofWriting) {
      armed = false;
      replacementHandle = tt.ensure(descriptor(2));
    }
    return compareExchange(array, index, expected, replacement);
  };
  try { assert.equal(store.publishExact(handle, 1), null); }
  finally { Atomics.compareExchange = compareExchange; }
  assert.notEqual(replacementHandle, handle);
  assert.equal(Atomics.load(new Int32Array(arena.statusBuffer), 0), arena.slotStates.ready, 'stale writer stranded the new generation in PROOF_WRITING');
  assert.equal(store.lower(replacementHandle), -1);
  store.publishExact(replacementHandle, 0);
  assert.equal(store.upper(replacementHandle), 0);
  assert.equal(store.isCurrent(handle), false);
});

test('contradictory publication leaves the current proof intact and releases the writer', () => {
  const { arena, store, handle } = semanticFixture();
  store.publishExact(handle, 0, 2);
  assert.throws(() => store.publishLower(handle, 1));
  assert.equal(Atomics.load(new Int32Array(arena.statusBuffer), 0), arena.slotStates.ready);
  assert.equal(store.lower(handle), 0);
  assert.equal(store.upper(handle), 0);
  assert.equal(store.bestMove(handle), 2);
});


test('coherent proof read observes sound writer-held record without blocking', () => {
  const {arena,store,handle}=semanticFixture();
  store.publishExact(handle,0,2);
  const status=new Int32Array(arena.statusBuffer);
  const target=new Float64Array(3);
  const wait=Atomics.wait;
  Atomics.store(status,0,arena.slotStates.proofWriting);
  Atomics.wait=()=>{throw Error('reader attempted to block');};
  try {
    store.readInto(handle,target);
    assert.deepEqual([...target],[0,0,2]);
  } finally {Atomics.wait=wait;Atomics.store(status,0,arena.slotStates.ready);}
  for(const bad of [new Int8Array(3),new Float64Array(2),[]]) assert.throws(()=>store.readInto(handle,bad));
});
