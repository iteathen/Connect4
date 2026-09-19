import test from 'node:test';
import assert from 'node:assert/strict';
import { censusColdCopies, censusColdMethods } from './cold-copy-census.mjs';

test('cold copy census separates source and widened destination bytes and restores on every exit', () => {
  const prototype = Object.getPrototypeOf(Uint8Array.prototype);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'set');
  const target = new Uint32Array(7);
  const result = censusColdCopies(() => {
    target.set(new Uint8Array([1, 255]), 2);
    new Int32Array(3).set(new Int32Array([-1, 2, 3]));
    return 42;
  });
  assert.deepEqual(result, { value: 42, operations: 2, sourceBytes: 14, destinationBytes: 20 });
  assert.deepEqual([...target], [0, 0, 1, 255, 0, 0, 0]);
  assert.deepEqual(Object.getOwnPropertyDescriptor(prototype, 'set'), descriptor);
  assert.throws(() => censusColdCopies(() => { throw new Error('expected'); }), /expected/);
  assert.throws(() => censusColdCopies(() => censusColdCopies(() => 0)), /nested/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(prototype, 'set'), descriptor);
});

test('cold method wrappers restore inherited methods and report failure time', () => {
  const proto = { run() { throw new Error('expected'); } }, owner = Object.create(proto);
  let calls = 0;
  assert.throws(() => censusColdMethods([{ owner, name: 'run', record(ms) {
    assert.ok(ms >= 0); calls++;
  } }], () => owner.run()), /expected/);
  assert.equal(calls, 1); assert.equal(Object.hasOwn(owner, 'run'), false);
  assert.equal(owner.run, proto.run);
});
