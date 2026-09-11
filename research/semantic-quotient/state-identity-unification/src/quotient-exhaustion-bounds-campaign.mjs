import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { createFastQuotientNativeNegamaxKernel } from './quotient-native-negamax-fast-kernel.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4 }),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function expectedRootActions(spec, oracle) {
  const actions = Array(spec.columns).fill(null);
  for (let column = 0; column < spec.columns; column += 1) {
    const heights = Array(spec.columns).fill(0);
    heights[column] = 1;
    actions[column] = oracle.evaluate({ heights, p0OwnershipMask: 1n << BigInt(column) });
  }
  return actions;
}

function installExhaustionBounds(kernel) {
  const states = kernel.states;
  const classes = kernel.classes;
  const originalIntern = states.intern.bind(states);
  const metrics = {
    seededStates: 0,
    nonLossSeeds: 0,
    nonWinSeeds: 0,
    exactDrawSeeds: 0,
  };

  function seed(id) {
    const supportIndex = states.support[id];
    const mover = kernel.support.ranks[supportIndex] & 1;
    const ownClass = mover === 0 ? states.p0Class[id] : states.p1Class[id];
    const opponentClass = mover === 0 ? states.p1Class[id] : states.p0Class[id];
    const ownEmpty = classes.isEmpty(ownClass);
    const opponentEmpty = classes.isEmpty(opponentClass);
    if (!ownEmpty && !opponentEmpty) return;

    metrics.seededStates += 1;
    if (opponentEmpty && states.lower[id] < 0) {
      states.lower[id] = 0;
      metrics.nonLossSeeds += 1;
    }
    if (ownEmpty && states.upper[id] > 0) {
      states.upper[id] = 0;
      metrics.nonWinSeeds += 1;
    }
    if (ownEmpty && opponentEmpty) metrics.exactDrawSeeds += 1;
  }

  states.intern = function internWithExhaustion(supportIndex, p0Class, p1Class) {
    const before = states.count;
    const id = originalIntern(supportIndex, p0Class, p1Class);
    if (id === before) seed(id);
    return id;
  };

  seed(kernel.rootId);
  return Object.freeze({ metrics });
}

function runOnce(spec, withExhaustion, expectedWdl, expectedActions, qualifyActions = false) {
  const started = performance.now();
  const wrap = createFastQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const exhaustion = withExhaustion ? installExhaustionBounds(wrap.kernel) : null;
  const setupMs = performance.now() - started;
  const solver = wrap.kernel.createWdlSolver({ wdlMode: 'full', etc: false });
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `${withExhaustion ? 'exhaustion' : 'baseline'} root WDL mismatch`);
  let actions = null;
  if (qualifyActions) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `${withExhaustion ? 'exhaustion' : 'baseline'} root action ${column} mismatch`);
    }
  }
  return {
    totalMs: performance.now() - started,
    setupMs,
    solveMs,
    result,
    actions,
    expanded: solver.metrics.expanded,
    calls: solver.metrics.calls,
    ttExactReturns: solver.metrics.ttExactReturns,
    ttBoundReturns: solver.metrics.ttBoundReturns,
    states: wrap.kernel.states.count,
    classes: wrap.kernel.classes.size,
    exhaustion: exhaustion ? { ...exhaustion.metrics } : null,
  };
}

function bench(spec, repeats = 21) {
  assert(Number.isInteger(repeats) && repeats > 0, 'repeat count must be positive');
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const actions = expectedRootActions(spec, oracle);
  const baselineQualification = runOnce(spec, false, oracle.rootWdl, actions, true);
  const exhaustionQualification = runOnce(spec, true, oracle.rootWdl, actions, true);

  const baselineRuns = [];
  const exhaustionRuns = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    baselineRuns.push(runOnce(spec, false, oracle.rootWdl, actions));
    exhaustionRuns.push(runOnce(spec, true, oracle.rootWdl, actions));
  }
  const baseTotal = median(baselineRuns.map((entry) => entry.totalMs));
  const exhaustionTotal = median(exhaustionRuns.map((entry) => entry.totalMs));
  const baseRepresentative = [...baselineRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  const exhaustionRepresentative = [...exhaustionRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  const result = {
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    baselineMs: baseTotal,
    exhaustionMs: exhaustionTotal,
    ratio: exhaustionTotal / baseTotal,
    baselineExpanded: baseRepresentative.expanded,
    exhaustionExpanded: exhaustionRepresentative.expanded,
    baselineCalls: baseRepresentative.calls,
    exhaustionCalls: exhaustionRepresentative.calls,
    exhaustionMetrics: exhaustionRepresentative.exhaustion,
    qualification: {
      baseline: baselineQualification,
      exhaustion: exhaustionQualification,
    },
  };
  console.error(`[q-exhaustion] ${result.geometry} base=${baseTotal.toFixed(3)}ms exhaust=${exhaustionTotal.toFixed(3)}ms ratio=${result.ratio.toFixed(3)} exp=${result.baselineExpanded}->${result.exhaustionExpanded} calls=${result.baselineCalls}->${result.exhaustionCalls}`);
  return result;
}

const cases = CASES.map((spec) => bench(spec));
console.error(`QUOTIENT_EXHAUSTION_SUMMARY=${JSON.stringify(cases.map((entry) => ({ geometry: entry.geometry, baseMs: entry.baselineMs, exhaustionMs: entry.exhaustionMs, ratio: entry.ratio, baseExpanded: entry.baselineExpanded, exhaustionExpanded: entry.exhaustionExpanded })))}`);
console.log(JSON.stringify({
  kind: 'connect4-quotient-one-sided-exhaustion-bounds-v1',
  status: 'complete',
  date: '2026-09-11',
  rule: {
    opponentResidualEmpty: 'side-to-move cannot lose, seed lower bound 0',
    ownResidualEmpty: 'side-to-move cannot win, seed upper bound 0',
    bilateralEmpty: 'exact draw',
  },
  authority: 'exact monotone residual semantics; root/action WDL independently checked against BSFP',
  cases,
}, null, 2));
