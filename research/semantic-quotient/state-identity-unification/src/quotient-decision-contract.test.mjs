import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { applyFrontierBoundCode, FRONTIER_BOUND_DRAW, TACTICAL_NONE, TACTICAL_DRAW } from './quotient-negamax-domain-contract.mjs';
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
  const target = new Float64Array(3);
  for (const value of [-1, 1]) assert.throws(() => applyFrontierBoundCode(FRONTIER_BOUND_DRAW, value, value, target), /contradict/);
  assert.equal(applyFrontierBoundCode(FRONTIER_BOUND_DRAW, -1, 1, target), true);
  assert.deepEqual([...target], [0, 0, 0]);
});

test('both decision policies reject rank-preserving forced transitions', async () => {
  assert.throws(() => createQuotientNegamaxEngine({ ...port(), rankAt: () => 1 }), /root.*rank/);
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


test('coherent read boundary rejects malformed scalars before typed narrowing', () => {
  for(const values of [[0.5,1,-1],[-1,2,-1],[-1,1,256],[-1,1,NaN]]) {
    const p=port();
    p.proofStore={...p.proofStore,readInto(_key,target){target.set(values);}};
    assert.throws(()=>createQuotientNegamaxEngine(p).run());
  }
});

test('actual search visits moves in descending eval order; hints only break equal scores', async () => {
  for (const hint of [-1, 0, 4]) for (const asynchronous of [false, true]) {
    const visited = [], proofStore = createLocalQuotientProofStore({ columns: 7, count: 8 });
    proofStore.publishHint(0, hint);
    // Controlled draw leaves expose every selected root move without a cutoff.
    // Real frontier scores deliberately conflict with the fallback order.
    const p = {
      columns: 7, cellCount: 42, rootId: 0, centerOrder: [6, 5, 4, 3, 2, 1, 0],
      rankAt: id => id === 0 ? 0 : 1, isLegal: () => true,
      tacticalCode: id => id === 0 ? TACTICAL_NONE : TACTICAL_DRAW,
      transition: (id, c) => { assert.equal(id, 0); visited.push(c); return c + 1; },
      landingCellAt: (_id, c) => c,
      frontierOrder: createLiveLineMoveOrder({ columns: 7, rows: 6, connect: 4 }), proofStore,
    };
    const expected = hint === 4 ? [3, 4, 2, 1, 5, 0, 6] : [3, 2, 4, 1, 5, 0, 6];
    if (asynchronous) {
      const engine = createDependencyAwareQuotientNegamaxEngine(p, () => 0, { splitDepth: 1 });
      assert.ok(await engine.solveRoot() === 0);
      await engine.drainBackground();
    } else assert.ok(createQuotientNegamaxEngine(p, { etc: false }).solveRoot() === 0);
    assert.deepEqual(visited, expected);
  }
});

test('root action results expose one canonical draw value after perspective reversal', async () => {
  for (const asynchronous of [false, true]) {
    const p = { ...port(), tacticalCode: id => id === 0 ? TACTICAL_NONE : TACTICAL_DRAW };
    const engine = asynchronous
      ? createDependencyAwareQuotientNegamaxEngine(p, () => 0, { splitDepth: 1 })
      : createQuotientNegamaxEngine(p, { etc: false });
    assert.deepEqual(await engine.rootActionValues(), [0, 0, 0]);
  }
});
