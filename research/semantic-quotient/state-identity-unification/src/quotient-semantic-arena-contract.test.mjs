import assert from 'node:assert/strict';
import test from 'node:test';
import { Worker } from 'node:worker_threads';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { createPackedProofStore } from './quotient-packed-proof-store.mjs';
import { createSemanticSharedTtArena, createSemanticSharedTtView, resetSemanticSharedTtArena } from './quotient-semantic-shared-tt.mjs';

const descriptor = (id, terms = [1]) => ({ supportIndex: id, p0: { ids: new Uint16Array(terms) }, p1: { ids: new Uint16Array() }, hash: { lo: 0, hi: id } });
const fixture = () => {
  const arena = createSemanticSharedTtArena({ entryCapacity: 1, associativity: 1, termCapacity: 64 });
  return { arena, tt: createSemanticSharedTtView(arena), proofs: createPackedProofStore(arena) };
};

test('arena views reject aliases/growth and snapshot mutable transport metadata', () => {
  const { arena } = fixture();
  for (const invalid of [
    { ...arena, generationBuffer: arena.statusBuffer },
    { ...arena, recordBuffer: new SharedArrayBuffer(1, { maxByteLength: 2 }) },
  ]) {
    assert.throws(() => createSemanticSharedTtView(invalid));
    assert.throws(() => createPackedProofStore(invalid));
  }
  const transport = { ...arena, slotStates: { ...arena.slotStates } };
  const tt = createSemanticSharedTtView(transport);
  const proofs = createPackedProofStore(transport);
  const handle = tt.ensure(descriptor(1));
  transport.entryCapacity = 99;
  transport.generationLimit = 0;
  transport.slotStates.ready = 0;
  proofs.publishExact(handle, 0);
  assert.equal(proofs.upper(handle), 0);
  assert.equal(tt.probe(descriptor(1)), handle);
});

test('a failure after payload overwrite poisons the new generation until quiescent reset', () => {
  const { arena, tt, proofs } = fixture();
  const old = tt.ensure(descriptor(1, [1, 2]));
  proofs.publishExact(old, 1);
  // Force the checked replacement telemetry boundary after descriptor bytes
  // and generation have changed, unlike pre-write allocation exhaustion.
  Atomics.store(new Int32Array(arena.metaBuffer), 2, 0x7fffffff);
  assert.throws(() => tt.ensure(descriptor(2, [3, 4])), /counter.*Int32/);
  assert.equal(new Int32Array(arena.statusBuffer)[0], arena.slotStates.poisoned);
  assert.equal(tt.probe(descriptor(1, [1, 2])), -1);
  assert.equal(tt.probe(descriptor(2, [3, 4])), -1);
  assert.equal(proofs.isCurrent(old), false);
  assert.equal(proofs.publishExact(old, 0), null);
  resetSemanticSharedTtArena(arena);
  const recovered = tt.ensure(descriptor(1, [1, 2]));
  assert.notEqual(recovered, old);
  proofs.publishExact(recovered, 1);
  assert.equal(proofs.lower(recovered), 1);
});

test('generation exhaustion never wraps into a prior handle', () => {
  const { arena, tt, proofs } = fixture();
  const old = tt.ensure(descriptor(1));
  Atomics.store(new Uint32Array(arena.generationBuffer), 0, arena.generationLimit);
  assert.throws(() => tt.ensure(descriptor(2)), /generation exhausted/);
  assert.equal(proofs.isCurrent(old), false);
  assert.equal(new Uint32Array(arena.generationBuffer)[0], arena.generationLimit);
  resetSemanticSharedTtArena(arena);
  assert.throws(() => tt.ensure(descriptor(1)), /generation exhausted/);
});

test('negative allocation and counters cannot alias existing term storage', () => {
  for (const counter of [0, 5]) {
    const { arena, tt } = fixture();
    Atomics.store(new Int32Array(arena.metaBuffer), counter, -1);
    assert.throws(() => tt.ensure(descriptor(1)), /invalid|negative/);
    assert.equal(tt.probe(descriptor(1)), -1);
  }
});

test('proof writer excludes replacement and reset, then wakes replacement on release', { timeout: 10000 }, async () => {
  const { arena, tt, proofs } = fixture();
  const old = tt.ensure(descriptor(1));
  const gate = new SharedArrayBuffer(4);
  const workerSource = `
    const {parentPort,workerData:d}=require('node:worker_threads');
    (async()=>{
      const {createPackedProofStore}=await import(d.proofs);
      const {createSemanticSharedTtView}=await import(d.tt);
      if(d.role==='proof'){
        const store=Atomics.store; let armed=true;
        Atomics.store=(a,i,v)=>{
          if(armed&&a.buffer===d.arena.recordBuffer){
            armed=false;parentPort.postMessage('locked');
            if(Atomics.wait(new Int32Array(d.gate),0,0,5000)==='timed-out')throw Error('proof test gate timeout');
          }
          return store(a,i,v);
        };
        createPackedProofStore(d.arena).publishExact(d.handle,1);
        parentPort.postMessage('published');
      } else {
        const tt=createSemanticSharedTtView(d.arena);
        const handle=tt.ensure({supportIndex:2,p0:{ids:new Uint16Array([2])},p1:{ids:new Uint16Array()},hash:{lo:0,hi:2}});
        parentPort.postMessage(handle);
      }
    })().catch(e=>{parentPort.postMessage({error:e.stack});process.exitCode=1;});
  `;
  const data = { arena, gate, handle: old, proofs: new URL('./quotient-packed-proof-store.mjs', import.meta.url).href, tt: new URL('./quotient-semantic-shared-tt.mjs', import.meta.url).href };
  const writer = new Worker(workerSource, { eval: true, workerData: { ...data, role: 'proof' } });
  let replacement;
  try {
    assert.deepEqual(await once(writer, 'message'), ['locked']);
    const beforeReset = new Uint8Array(arena.metaBuffer).slice();
    assert.throws(() => resetSemanticSharedTtArena(arena), /quiescence/);
    assert.deepEqual(new Uint8Array(arena.metaBuffer), beforeReset);
    replacement = new Worker(workerSource, { eval: true, workerData: { ...data, role: 'replace' } });
    const result = once(replacement, 'message');
    const deadline = Date.now() + 5000;
    while (Atomics.load(new Int32Array(arena.bucketLockBuffer), 0) !== 1) {
      if (Date.now() > deadline) throw Error('replacement did not acquire its bucket');
      await delay(1);
    }
    assert.equal(new Int32Array(arena.statusBuffer)[0], arena.slotStates.proofWriting);
    assert.equal(new Uint32Array(arena.generationBuffer)[0], 1);
    Atomics.store(new Int32Array(gate), 0, 1);
    Atomics.notify(new Int32Array(gate), 0);
    const [handle] = await result;
    assert.equal(typeof handle, 'number', JSON.stringify(handle));
    assert.notEqual(handle, old);
    assert.equal(proofs.lower(handle), -1, 'old proof leaked into replacement');
    assert.equal(proofs.isCurrent(old), false);
  } finally {
    Atomics.store(new Int32Array(gate), 0, 1);
    Atomics.notify(new Int32Array(gate), 0);
    await Promise.all([writer.terminate(), replacement?.terminate()]);
  }
});
