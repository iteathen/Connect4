import test from 'node:test';
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });

function makeEngine() {
  const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
    cacheEdges: true,
    prefixClasses: 4096,
    responseClosure: true,
    searchStorage: Object.freeze({ states: 4096, classes: 8192, chunksPerSlot: 2048 }),
  });
  kernel.prepareSearchStorage();
  return { kernel, engine: createRepairCapacityProofEngine(kernel, { maxProofStates: 8 }) };
}

test('target distance is derived from the target row rather than hard-coded to row 3', () => {
  const { kernel, engine } = makeEngine();
  const root = kernel.rootId;
  assert.equal(engine.targetDistance(root, 0), 0, 'A1 should have zero support cells below it');
  assert.equal(engine.targetDistance(root, 14), 2, 'A3 should have two support cells below it');
  assert.equal(engine.targetDistance(root, 21), 3, 'A4 should have three support cells below it');
  assert.equal(engine.targetDistance(root, 35), 5, 'A6 should have five support cells below it');
});

test('target distance rejects cells outside the standard 7x6 domain', () => {
  const { kernel, engine } = makeEngine();
  assert.throws(() => engine.targetDistance(kernel.rootId, -1), /outside standard 7x6 domain/);
  assert.throws(() => engine.targetDistance(kernel.rootId, 42), /outside standard 7x6 domain/);
});
