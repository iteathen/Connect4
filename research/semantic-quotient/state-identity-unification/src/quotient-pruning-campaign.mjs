import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createQuotientNegamaxEngine } from './quotient-negamax-engine.mjs';
import { TACTICAL_NONE, TACTICAL_DRAW, QN_TERMINAL_WIN, FRONTIER_BOUND_DRAW,
  FRONTIER_BOUND_NONE, FRONTIER_BOUND_MOVER_NO_WIN, FRONTIER_BOUND_OPPONENT_NO_WIN } from './quotient-negamax-domain-contract.mjs';

// Qualification only. The reference visits every legal physical successor,
// including siblings after a winning action. No tactical, TT or window pruning.
function buildOracle(spec) {
  const { columns: W, rows: H, connect: K } = spec;
  const { kernel: k } = createSlot64ResidualQuotientKernel(spec, { cacheEdges: false });
  const board = new Int8Array(W * H).fill(-1), heights = new Uint8Array(W);
  const memo = new Map(), expected = new Map(), fixtures = [];
  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
  const lines = [];
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) for (const [dc, dr] of directions) {
    if (c + (K - 1) * dc < 0 || c + (K - 1) * dc >= W || r + (K - 1) * dr < 0 || r + (K - 1) * dr >= H) continue;
    lines.push(Array.from({ length: K }, (_, i) => (r + i * dr) * W + c + i * dc));
  }
  let edges = 0, evalChecks = 0;
  const response = { certificates: 0, nonlocalCertificates: 0, drawCertificates: 0,
    rejectedParityOnlyWins: 0, guardComparisons: 0, boundComparisons: 0 };
  function wins(cell, player) {
    const c = cell % W, r = Math.floor(cell / W);
    for (const [dc, dr] of directions) {
      let count = 1;
      for (const sign of [-1, 1]) for (let n = 1; ; n++) {
        const x = c + sign * n * dc, y = r + sign * n * dr;
        if (x < 0 || x >= W || y < 0 || y >= H || board[y * W + x] !== player) break;
        count++;
      }
      if (count >= K) return true;
    }
    return false;
  }
  function visit(id, rank, seed) {
    const key = board.join(',');
    const old = memo.get(key);
    if (old) return old;
    const independentOrder = [];
    const stack = new Uint32Array(seed.length + 3); stack.set(seed, 3);
    for (let c = 0; c < W; c++) if (heights[c] < H) {
      const cell = heights[c] * W + c;
      for (let p = 0; p < 2; p++) {
        const score = lines.filter(line => line.includes(cell) && line.every(x => board[x] !== 1 - p)).length;
        assert.equal(k.frontierOrder.valueAtSeed(seed, p, cell), score);
        assert.equal(k.frontierOrder.valueAtStack(stack, 3, p, cell), score);
        evalChecks += 2;
        if (p === (rank & 1)) independentOrder.push({ column: c, value: score });
      }
    }
    independentOrder.sort((a, b) => b.value - a.value || a.column - b.column);
    assert.deepEqual(k.frontierOrder.orderLegal(k, id, seed).map(({ column, value }) => ({ column, value })), independentOrder);
    let value = rank === W * H ? 0 : -1, treeCalls = 1;
    for (let c = 0; c < W; c++) {
      if (heights[c] === H) continue;
      edges++;
      const cell = heights[c] * W + c;
      board[cell] = rank & 1; heights[c]++;
      const win = wins(cell, rank & 1), child = k.advance(id, c);
      if (win) {
        assert.equal(child, QN_TERMINAL_WIN);
        value = 1;
      } else {
        assert.ok(child >= 0);
        const result = visit(child, rank + 1, k.frontierOrder.advanceSeed(seed, rank & 1, cell));
        value = Math.max(value, -result.value);
        treeCalls += result.treeCalls;
      }
      heights[c]--; board[cell] = -1;
    }
    if (value === 0) value = 0; // W/D/L has one draw; canonicalize oracle arithmetic -0.
    const player = rank & 1;
    const ownLines = lines.filter(line => line.every(cell => board[cell] !== 1 - player));
    const otherLines = lines.filter(line => line.every(cell => board[cell] !== player));
    const covered = ownLines.every(line => line.some(cell => board[cell] === -1
      && (Math.floor(cell / W) & 1) === ((H - 1) & 1)));
    const guarded = heights.every(height => (H - height) % 2 === 0);
    assert.equal(k.supportAccess.hasEvenColumnRemainders(k.states.support[id]), guarded);
    response.guardComparisons++;
    const noWin = ownLines.length === 0 || (guarded && covered);
    const expectedBound = noWin && otherLines.length === 0 ? FRONTIER_BOUND_DRAW
      : noWin ? FRONTIER_BOUND_MOVER_NO_WIN
      : otherLines.length === 0 ? FRONTIER_BOUND_OPPONENT_NO_WIN : FRONTIER_BOUND_NONE;
    assert.equal(k.frontierBoundCode(id), expectedBound, 'compiled closure differs from physical response policy');
    if (noWin) assert.ok(value <= 0, 'response certificate excludes a real forced win');
    if (expectedBound === FRONTIER_BOUND_DRAW) assert.equal(value, 0);
    if (expectedBound === FRONTIER_BOUND_OPPONENT_NO_WIN) assert.ok(value >= 0);
    response.boundComparisons++;
    if (guarded && covered && ownLines.length > 0) {
      response.certificates++;
      if (k.tacticalCode(id) === TACTICAL_NONE) response.nonlocalCertificates++;
      if (otherLines.length === 0) response.drawCertificates++;
    }
    if (!guarded && covered && value === 1) response.rejectedParityOnlyWins++;
    assert.ok(Number.isSafeInteger(treeCalls));
    if (expected.has(id)) assert.equal(expected.get(id), value, 'quotient aliases different exact outcomes');
    expected.set(id, value);
    const result = { value, treeCalls };
    memo.set(key, result);
    fixtures.push({ id, seed });
    return result;
  }
  const root = visit(k.rootId, 0, k.frontierOrder.createRootSeed());
  return { k, expected, fixtures, root, physicalStates: memo.size, edges, evalChecks, response };
}

function campaign(spec, exhaustiveWindows) {
  const started = performance.now(), o = buildOracle(spec), { k, expected } = o;
  let publications = 0;
  const checked = { ...k.proofStore };
  for (const name of ['publishExact', 'publishLower', 'publishUpper']) {
    checked[name] = (id, value, hint = -1) => {
      const truth = expected.get(id);
      assert.notEqual(truth, undefined);
      if (name === 'publishExact') assert.ok(value === truth, 'incorrect exact publication');
      if (name === 'publishLower') assert.ok(value <= truth, 'unsound lower publication');
      if (name === 'publishUpper') assert.ok(value >= truth, 'unsound upper publication');
      publications++;
      return k.proofStore[name](id, value, hint);
    };
  }
  function port(proofStore = checked, closure = true, ordering = true) {
    return {
      columns: spec.columns, cellCount: spec.columns * spec.rows, rootId: k.rootId,
      centerOrder: k.centerOrder, proofStore,
      rankAt: id => k.supportAccess.rankAt(k.states.support[id]),
      isLegal: (id, c) => k.supportAccess.landingAt(k.states.support[id], c) !== 255,
      landingCellAt: (id, c) => k.supportAccess.landingAt(k.states.support[id], c),
      transition: k.advance,
      tacticalCode: closure ? k.tacticalCode : id =>
        k.supportAccess.rankAt(k.states.support[id]) === spec.columns * spec.rows ? TACTICAL_DRAW : TACTICAL_NONE,
      ...(closure ? { frontierBoundCode: k.frontierBoundCode } : {}),
      ...(ordering ? { frontierOrder: k.frontierOrder } : {}),
    };
  }
  const windows = [[-2, 2], [0, 1], [-1, 0], [-2, -1], [1, 2], [-1, 1]];
  const stride = exhaustiveWindows ? 1 : Math.max(1, Math.floor(o.fixtures.length / 256));
  const fixtures = o.fixtures.filter((_, i) => i % stride === 0);
  let checks = 0;
  const totals = {};
  for (const etc of [false, true]) for (const cold of [true, false]) {
    k.proofStore.reset();
    const engine = createQuotientNegamaxEngine(port(), { etc });
    for (const { id, seed } of fixtures) for (const [alpha, beta] of windows) {
      if (cold) k.proofStore.reset();
      const result = engine.search(id, alpha, beta, seed), truth = expected.get(id);
      if (result <= alpha) assert.ok(truth <= result, 'unsound fail-low');
      else if (result >= beta) assert.ok(truth >= result, 'unsound fail-high');
      else assert.ok(result === truth, 'wrong in-window value');
      assert.ok(k.proofStore.lower(id) <= truth && truth <= k.proofStore.upper(id));
      checks++;
    }
    totals[`etc_${etc}_cold_${cold}`] = { ...engine.metrics };
  }
  const emptyProof = {
    readInto(_id, target) { target[0] = -1; target[1] = 1; target[2] = -1; },
    lower: () => -1, upper: () => 1, bestMove: () => -1,
    publishExact: checked.publishExact, publishLower: checked.publishLower,
    publishUpper: checked.publishUpper, publishHint: () => false,
  };
  const ablations = [];
  for (const [name, tt, closure, order, etc] of [
    ['alpha_beta_only', false, false, false, false],
    ['plus_tt', true, false, false, false],
    ['plus_local_closure', true, true, false, false],
    ['plus_frontier_order', true, true, true, false],
    ['plus_etc', true, true, true, true],
  ]) {
    k.proofStore.reset();
    const engine = createQuotientNegamaxEngine(port(tt ? checked : emptyProof, closure, order), { etc });
    assert.ok(engine.solveRoot() === o.root.value);
    ablations.push({ name, ...engine.metrics });
  }
  assert.ok(ablations[0].calls < o.root.treeCalls, 'alpha-beta did not reduce the unpruned tree');
  assert.ok(ablations[0].cutoffs > 0);
  assert.ok(ablations[1].ttExactReturns + ablations[1].ttBoundReturns > 0);
  assert.ok(ablations[2].tacticalExact + ablations[2].frontierBoundCuts > 0);
  assert.ok(ablations[2].forcedMacroTransitions > 0);
  assert.ok(ablations[3].frontierOrderedNodes > 0);
  assert.ok(Object.values(totals).some(m => m.etcCutoffs > 0));
  assert.ok(o.response.certificates > 0);
  assert.ok(o.response.nonlocalCertificates > 0);
  assert.ok(o.response.rejectedParityOnlyWins > 0, 'parity without response guards was not falsified');
  const responseComparison = [];
  for (const enabled of [false, true]) {
    const { kernel } = createSlot64ResidualQuotientKernel(spec, { responseClosure: enabled, cacheEdges: false });
    const engine = kernel.createWdlSolver({ etc: false });
    assert.ok(engine.run() === o.root.value);
    responseComparison.push({ enabled, ...engine.metrics, states: kernel.states.count,
      closureTypedBytes: kernel.memoryStats().responseClosureBytes });
  }
  return { spec, oracle: { physicalStates: o.physicalStates, legalEdges: o.edges,
    rootWdl: o.root.value, unprunedTreeCallsExcludingWinningEdges: o.root.treeCalls },
    sampledWindowStates: fixtures.length, windowChecks: checks, checkedPublications: publications,
    independentlyCheckedEvalValues: o.evalChecks,
    responseClosure: o.response, responseComparison,
    mismatches: 0, windowMetrics: totals, rootAblations: ablations, elapsedMs: performance.now() - started };
}

console.log(JSON.stringify({ kind: 'connect4-independent-pruning-qualification-v1',
  note: 'Physical oracle exhaustively constructed first; timings include that construction. No standard 7x6 root.',
  cases: [campaign({ columns: 4, rows: 3, connect: 3 }, true),
    campaign({ columns: 4, rows: 4, connect: 4 }, false),
    campaign({ columns: 4, rows: 5, connect: 4 }, false)] }, null, 2));
