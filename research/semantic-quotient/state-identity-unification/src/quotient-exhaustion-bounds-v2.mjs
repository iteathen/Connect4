import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { createFastQuotientNativeNegamaxKernel } from './quotient-native-negamax-fast-kernel.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4 }),
]);
const MODES = Object.freeze(['baseline', 'nonloss', 'nonwin', 'both']);

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

function installBounds(kernel, mode) {
  if (mode === 'baseline') return null;
  const useNonLoss = mode === 'nonloss' || mode === 'both';
  const useNonWin = mode === 'nonwin' || mode === 'both';
  const states = kernel.states;
  const classes = kernel.classes;
  const originalIntern = states.intern.bind(states);
  const metrics = { seededStates: 0, nonLossSeeds: 0, nonWinSeeds: 0 };

  function seed(id) {
    const supportIndex = states.support[id];
    const mover = kernel.support.ranks[supportIndex] & 1;
    const ownClass = mover === 0 ? states.p0Class[id] : states.p1Class[id];
    const opponentClass = mover === 0 ? states.p1Class[id] : states.p0Class[id];
    let touched = false;
    if (useNonLoss && classes.isEmpty(opponentClass) && states.lower[id] < 0) {
      states.lower[id] = 0;
      metrics.nonLossSeeds += 1;
      touched = true;
    }
    if (useNonWin && classes.isEmpty(ownClass) && states.upper[id] > 0) {
      states.upper[id] = 0;
      metrics.nonWinSeeds += 1;
      touched = true;
    }
    if (touched) metrics.seededStates += 1;
  }

  states.intern = function internWithBounds(supportIndex, p0Class, p1Class) {
    const before = states.count;
    const id = originalIntern(supportIndex, p0Class, p1Class);
    if (id === before) seed(id);
    return id;
  };
  seed(kernel.rootId);
  return metrics;
}

function runOnce(spec, mode, expectedWdl, expectedActions, qualify = false) {
  const started = performance.now();
  const wrap = createFastQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const boundMetrics = installBounds(wrap.kernel, mode);
  const solver = wrap.kernel.createWdlSolver({ wdlMode: 'full', etc: false });
  const solveStart = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStart;
  assert(result === expectedWdl, `${mode} root WDL mismatch`);
  if (qualify) {
    const actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `${mode} root action ${column} mismatch`);
    }
  }
  return {
    totalMs: performance.now() - started,
    solveMs,
    expanded: solver.metrics.expanded,
    calls: solver.metrics.calls,
    states: wrap.kernel.states.count,
    classes: wrap.kernel.classes.size,
    boundMetrics: boundMetrics ? { ...boundMetrics } : null,
  };
}

function bench(spec, repeats = 25) {
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const actions = expectedRootActions(spec, oracle);
  for (const mode of MODES) runOnce(spec, mode, oracle.rootWdl, actions, true);
  const result = { geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`, modes: {} };
  for (const mode of MODES) {
    const runs = [];
    for (let repeat = 0; repeat < repeats; repeat += 1) runs.push(runOnce(spec, mode, oracle.rootWdl, actions));
    const representative = [...runs].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
    result.modes[mode] = {
      totalMsMedian: median(runs.map((entry) => entry.totalMs)),
      solveMsMedian: median(runs.map((entry) => entry.solveMs)),
      expanded: representative.expanded,
      calls: representative.calls,
      states: representative.states,
      classes: representative.classes,
      boundMetrics: representative.boundMetrics,
    };
  }
  const base = result.modes.baseline.totalMsMedian;
  for (const mode of MODES) result.modes[mode].ratioToBaseline = result.modes[mode].totalMsMedian / base;
  console.error(`[q-exhaustion-v2] ${result.geometry} base=${result.modes.baseline.totalMsMedian.toFixed(3)} nonloss=${result.modes.nonloss.totalMsMedian.toFixed(3)} nonwin=${result.modes.nonwin.totalMsMedian.toFixed(3)} both=${result.modes.both.totalMsMedian.toFixed(3)}`);
  return result;
}

const cases = CASES.map((spec) => bench(spec));
console.error(`QUOTIENT_EXHAUSTION_V2_SUMMARY=${JSON.stringify(cases.map((entry) => ({ geometry: entry.geometry, baseline: entry.modes.baseline.totalMsMedian, nonloss: entry.modes.nonloss.totalMsMedian, nonwin: entry.modes.nonwin.totalMsMedian, both: entry.modes.both.totalMsMedian })))}`);
console.log(JSON.stringify({
  kind: 'connect4-quotient-one-sided-exhaustion-bounds-v2',
  status: 'complete',
  date: '2026-09-11',
  question: 'Which exact one-sided residual-exhaustion bound, if either, earns its cost on the flat quotient-native kernel?',
  modes: {
    nonloss: 'opponent residual empty => lower bound 0',
    nonwin: 'mover residual empty => upper bound 0',
    both: 'compose both exact bounds',
  },
  cases,
}, null, 2));
