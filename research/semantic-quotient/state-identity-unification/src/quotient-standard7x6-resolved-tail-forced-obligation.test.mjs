import test from 'node:test';
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createResolvedTailLexicographicProofEngine } from './quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const C3 = 16;

function setup() {
  const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
    cacheEdges: true,
    prefixClasses: 4096,
    responseClosure: true,
    searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
  });
  kernel.prepareSearchStorage();
  return { kernel, rho: createResolvedTailLexicographicProofEngine(kernel, { maxProofStates: 100000 }) };
}
function replay(kernel, sequence) {
  let state = kernel.rootId;
  for (const digit of sequence) {
    const next = kernel.advance(state, Number(digit) - 1);
    assert(Number.isSafeInteger(next) && next >= 0, `bad replay ${sequence}`);
    state = next;
  }
  return state;
}

test('two enabled P1 singleton obligations are an exact one-move response-capacity loss boundary', () => {
  const { kernel, rho } = setup();
  const state = replay(kernel, '46656555464434757776');
  assert.deepEqual(rho.p1Obligations(state).map(rho.repair.coord), ['G5', 'D6'].sort((a,b)=>a.localeCompare(b)));
  const result = rho.prove(state, C3);
  assert.equal(result.proved, false);
  assert.equal(result.kind, 'forced_obligation_capacity_loss');
  assert.equal(result.exactLoss, true);
  assert.equal(result.responseSlots, 1);
  assert.equal(result.obligations.length, 2);
});

test('one enabled P1 singleton obligation forces the exact defense column before ordinary rho', () => {
  const { kernel, rho } = setup();
  const state = replay(kernel, '46656555464435767777');
  assert.deepEqual(rho.p1Obligations(state).map(rho.repair.coord), ['D5']);
  const result = rho.prove(state, C3);
  assert.equal(result.forcedDefense?.cell, 'D5');
  assert.equal(result.forcedDefense?.column, 'D');
  assert.notEqual(result.kind, 'forced_obligation_capacity_loss');
});
