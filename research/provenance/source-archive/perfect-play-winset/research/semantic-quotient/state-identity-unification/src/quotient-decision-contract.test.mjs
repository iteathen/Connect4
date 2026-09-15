import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { applyFrontierBoundCode, FRONTIER_BOUND_DRAW, TACTICAL_NONE, TACTICAL_DRAW, TACTICAL_LOSS } from './quotient-negamax-domain-contract.mjs';
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

test('frontier provider is selected at initialization and malformed providers fail closed', async () => {
  for (const bad of [0, 'none', {}, true]) {
    assert.throws(() => createQuotientNegamaxEngine({ ...port(), frontierBoundCode: bad }), /frontierBoundCode/);
    assert.throws(() => createDependencyAwareQuotientNegamaxEngine({ ...port(), frontierBoundCode: bad }, () => 0), /frontierBoundCode/);
  }
  const p = { ...port(), marker: FRONTIER_BOUND_DRAW, frontierBoundCode() { return this.marker; } };
  const engine = createQuotientNegamaxEngine(p);
  p.frontierBoundCode = () => { throw new Error('provider changed after initialization'); };
  assert.equal(engine.run(), 0);
  for (const invalid of [0, 1, null, 'true']) {
    assert.throws(() => createQuotientNegamaxEngine({ ...port(), isLegal: () => invalid }).searchBounded(0, -2, 2, 1), /boolean/);
  }
});

function boundedTree(tacticalAt) {
  const p = { columns: 2, cellCount: 3, rootId: 0, centerOrder: [0, 1],
    rankAt: id => id === 0 ? 0 : id < 3 ? 1 : 2,
    isLegal: id => id < 3,
    tacticalCode: tacticalAt,
    transition: (id, column) => id * 2 + column + 1,
    proofStore: createLocalQuotientProofStore({ columns: 2, count: 7 }) };
  return { p, engine: createQuotientNegamaxEngine(p, { etc: false }) };
}

test('bounded normal search keeps horizon leaves unknown and can resume exact search', () => {
  const { p, engine } = boundedTree(id => id < 3 ? TACTICAL_NONE : TACTICAL_DRAW);
  const result = engine.searchBounded(0, -2, 2, 1);
  assert.equal(result.value, null);
  assert.equal(result.maxReachedDepth, 1);
  assert.equal(result.horizonLeaves, 2);
  assert.equal(engine.metrics.transitionsRequested, 2);
  assert.equal(p.proofStore.lower(0), -1);
  assert.equal(p.proofStore.upper(0), 1);
  assert.ok(engine.run() === 0);
});

test('an unresolved sibling cannot turn a known draw into an exact root draw', () => {
  const { p, engine } = boundedTree(id => id === 1 || id >= 3 ? TACTICAL_DRAW : TACTICAL_NONE);
  assert.equal(engine.searchBounded(0, -2, 2, 1).value, null);
  assert.equal(p.proofStore.lower(0), 0);
  assert.equal(p.proofStore.upper(0), 1);
  assert.ok(engine.run() === 0);
});

test('a proved winning child still cuts off after an unresolved sibling', () => {
  const { p, engine } = boundedTree(id => id === 2 ? TACTICAL_LOSS : id >= 3 ? TACTICAL_DRAW : TACTICAL_NONE);
  assert.equal(engine.searchBounded(0, -2, 2, 1).value, 1);
  assert.equal(engine.metrics.cutoffs, 1);
  assert.equal(p.proofStore.lower(0), 1);
  assert.equal(p.proofStore.upper(0), 1);
});

test('bounded forced chains respect the horizon and restore unrestricted search after failure', () => {
  const { p, engine } = boundedTree(id => id < 3 ? 0 : TACTICAL_DRAW);
  assert.equal(engine.searchBounded(0, -2, 2, 1).value, null);
  assert.equal(engine.metrics.forcedMacroTransitions, 1);
  assert.equal(p.proofStore.lower(0), -1);
  assert.ok(engine.run() === 0);
  assert.throws(() => engine.searchBounded(0, -2, 2, -1));
});

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

test('fused frontier advancement matches independent masks for disjoint and overlapping views', () => {
  for (const spec of [{ columns: 7, rows: 6, connect: 4 }, { columns: 4, rows: 3, connect: 3 },
    { columns: 2, rows: 2, connect: 3 }]) {
    const order = createLiveLineMoveOrder(spec), n = order.profile.stateWords, words = n / 2;
    for (let mover = 0; mover < 2; mover++) for (let cell = 0; cell < spec.columns * spec.rows; cell++) {
      const seed = order.createRootSeed();
      for (let i = 0; i < n; i++) seed[i] &= (0xa5a5a5a5 ^ Math.imul(i + cell + 1, 0x9e3779b9));
      // Query line membership one bit at a time through the public evaluator.
      const expected = new Uint32Array(seed), one = new Uint32Array(n);
      for (let w = 0; w < words; w++) for (let b = 0; b < 32; b++) {
        const at = (1 - mover) * words + w;
        one[at] = 1 << b;
        if (order.valueAtSeed(one, 1 - mover, cell)) expected[at] &= ~(1 << b);
        one[at] = 0;
      }
      for (const [from, to] of [[0, n], [n, 0], [0, 1], [1, 0], [0, 0]]) {
        for (const views of [false, true]) {
          const data = new Uint32Array(n * 2);
          data.set(seed, from);
          if (views) order.advanceInto(data.subarray(from, from + n), 0, mover, cell, data.subarray(to, to + n), 0);
          else order.advanceInto(data, from, mover, cell, data, to);
          assert.deepEqual(data.subarray(to, to + n), expected);
        }
      }
      const target = new Uint32Array(n);
      order.advanceInto(seed, 0, mover, cell, target, 0);
      assert.deepEqual(target, expected);
    }
  }
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
