import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { applyFrontierBoundCode, FRONTIER_BOUND_DRAW, TACTICAL_NONE } from './quotient-negamax-domain-contract.mjs';
import { createDependencyAwareQuotientNegamaxEngine, createQuotientNegamaxEngine } from './quotient-negamax-engine.mjs';
import { createLocalQuotientProofStore } from './quotient-local-proof-store.mjs';
import { createLiveLineMoveOrder } from './quotient-live-line-move-order.mjs';

function port() {
  return {
    columns: 3, cellCount: 3, rootId: 0, centerOrder: [0, 1, 2],
    rankAt: id => id === 0 ? 0 : 1,
    isLegal: () => true,
    tacticalCode: () => TACTICAL_NONE,
    transition: (_, column) => column + 1,
    proofStore: createLocalQuotientProofStore({ columns: 3, count: 4 }),
  };
}

test('structural draw intersects prior proof and rejects contradictory exact bounds', () => {
  for (const value of [-1, 1]) assert.throws(() => applyFrontierBoundCode(FRONTIER_BOUND_DRAW, value, value), /contradict/);
  assert.deepEqual(applyFrontierBoundCode(FRONTIER_BOUND_DRAW, -1, 1), [0, 0]);
});

test('both decision policies reject rank-preserving forced transitions', async () => {
  const p = { ...port(), tacticalCode: () => 0, transition: () => 0 };
  // A malformed transition must fail at its boundary, before a forced-chain loop.
  let calls = 0;
  p.transition = () => { if (++calls > 5) throw Error('late loop guard'); return 0; };
  assert.throws(() => createQuotientNegamaxEngine(p).run(), /rank/);
  calls = 0;
  await assert.rejects(createDependencyAwareQuotientNegamaxEngine(p, () => 0, { splitDepth: 1 }).solveRoot(), /rank/);
});

test('a scout rejected with null cannot become a draw through numeric coercion', async () => {
  const engine = createDependencyAwareQuotientNegamaxEngine(port(), id => id === 2 ? Promise.reject(null) : 0, { splitDepth: 1 });
  await assert.rejects(engine.solveRoot());
  await engine.drainBackground();
});

test('a failed re-search retains ownership of its outstanding peer scouts', async () => {
  let rejectPeer;
  const peer = new Promise((_, reject) => { rejectPeer = reject; });
  let secondCalls = 0;
  const engine = createDependencyAwareQuotientNegamaxEngine(port(), id => {
    if (id === 1) return 1; // parent incumbent -1, scout window allows a draw improvement
    if (id === 2) return ++secondCalls === 1 ? 0 : Promise.reject(Error('re-search failure'));
    return peer;
  }, { splitDepth: 1 });
  await assert.rejects(engine.solveRoot(), /re-search failure/);
  let drained = false;
  const drain = engine.drainBackground().finally(() => { drained = true; });
  const observedDrain = assert.rejects(drain, /peer failure/);
  await nextTurn();
  const wasPending = !drained;
  rejectPeer(Error('peer failure'));
  await observedDrain;
  assert.equal(wasPending, true, 'drain forgot the peer still holding work');
});

test('frontier copying handles overlapping distinct views and keeps cached masks private', () => {
  const order = createLiveLineMoveOrder({ columns: 7, rows: 6, connect: 4 });
  const n = order.profile.stateWords;
  const data = new Uint32Array(n + 1);
  const seed = order.createRootSeed();
  data.set(seed);
  const expected = order.advanceSeed(seed, 0, 0);
  order.advanceInto(data.subarray(0, n), 0, 0, 0, data.subarray(1), 0);
  assert.deepEqual(data.subarray(1), expected);
  assert.equal(order.profile.through, undefined);
  assert.equal(order.profile.all, undefined);
});
