import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { createQuotientNativeNegamaxKernel, QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';
import { createFastQuotientNativeNegamaxKernel } from './quotient-native-negamax-fast-kernel.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3, expectedStates: 3735 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4, expectedStates: 34095 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4, expectedStates: 11317 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4, expectedStates: 294593 }),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function termsEqual(left, right) {
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i += 1) {
    if ((left[i][0] >>> 0) !== (right[i][0] >>> 0)) return false;
    if ((left[i][1] >>> 0) !== (right[i][1] >>> 0)) return false;
  }
  return true;
}

function enumerate(kernel) {
  let terminalEdges = 0;
  let nonterminalEdges = 0;
  let illegalEdges = 0;
  for (let id = 0; id < kernel.states.count; id += 1) {
    for (let column = 0; column < kernel.columns; column += 1) {
      const target = kernel.advance(id, column);
      if (target === QN_ILLEGAL) illegalEdges += 1;
      else if (target === QN_TERMINAL_WIN) terminalEdges += 1;
      else nonterminalEdges += 1;
    }
  }
  return { states: kernel.states.count, terminalEdges, nonterminalEdges, illegalEdges };
}

function qualifyGraphIdentity(spec) {
  const base = createQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const fastWrap = createFastQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const fast = fastWrap.kernel;
  const baseCensus = enumerate(base);
  const fastCensus = enumerate(fast);
  assert(baseCensus.states === spec.expectedStates, 'base relational state census drift');
  assert(fastCensus.states === spec.expectedStates, 'fast relational state census drift');
  assert(JSON.stringify(baseCensus) === JSON.stringify(fastCensus), 'fast edge census differs from base');
  assert(base.classes.size === fast.classes.size, 'fast residual class count differs from base');
  assert(base.states.count === fast.states.count, 'fast state count differs from base');

  for (let classId = 0; classId < base.classes.size; classId += 1) {
    assert(termsEqual(base.classTerms(classId), fast.classTerms(classId)), `class ${classId} term identity mismatch`);
  }
  for (let id = 0; id < base.states.count; id += 1) {
    const a = base.stateView(id);
    const b = fast.stateView(id);
    assert(a.supportIndex === b.supportIndex, `state ${id} support mismatch`);
    assert(a.p0Class === b.p0Class, `state ${id} p0 class mismatch`);
    assert(a.p1Class === b.p1Class, `state ${id} p1 class mismatch`);
  }

  return {
    census: baseCensus,
    classes: base.classes.size,
    fastMetrics: { ...fastWrap.specialization.metrics },
  };
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

function runOnce(spec, fast, expectedWdl, expectedActions, qualifyActions = false) {
  const started = performance.now();
  const wrap = fast ? createFastQuotientNativeNegamaxKernel(spec, { cacheEdges: false }) : null;
  const kernel = fast ? wrap.kernel : createQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const setupMs = performance.now() - started;
  const solver = kernel.createWdlSolver({ wdlMode: 'full', etc: false });
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `${fast ? 'fast' : 'base'} root WDL mismatch`);
  let actions = null;
  if (qualifyActions) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `${fast ? 'fast' : 'base'} root action ${column} mismatch`);
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
    states: kernel.states.count,
    classes: kernel.classes.size,
    memory: kernel.memoryStats(),
    specialization: wrap ? { ...wrap.specialization.metrics } : null,
  };
}

function bench(spec, repeats = 15) {
  assert(Number.isInteger(repeats) && repeats > 0, 'repeat count must be positive');
  const graphQualification = qualifyGraphIdentity(spec);
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const expectedActions = expectedRootActions(spec, oracle);
  const baseQualification = runOnce(spec, false, oracle.rootWdl, expectedActions, true);
  const fastQualification = runOnce(spec, true, oracle.rootWdl, expectedActions, true);
  assert(baseQualification.expanded === fastQualification.expanded, 'fast kernel changed expansion count');
  assert(baseQualification.calls === fastQualification.calls, 'fast kernel changed call count');

  const baseRuns = [];
  const fastRuns = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    baseRuns.push(runOnce(spec, false, oracle.rootWdl, expectedActions));
    fastRuns.push(runOnce(spec, true, oracle.rootWdl, expectedActions));
  }
  const baseTotal = median(baseRuns.map((entry) => entry.totalMs));
  const fastTotal = median(fastRuns.map((entry) => entry.totalMs));
  const result = {
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    graphQualification,
    baseTotalMs: baseTotal,
    fastTotalMs: fastTotal,
    baseSolveMs: median(baseRuns.map((entry) => entry.solveMs)),
    fastSolveMs: median(fastRuns.map((entry) => entry.solveMs)),
    ratioFastOverBase: fastTotal / baseTotal,
    expanded: fastQualification.expanded,
    calls: fastQualification.calls,
    fastSpecialization: fastRuns[Math.floor(repeats / 2)].specialization,
  };
  console.error(`[q-fast-kernel] ${result.geometry} base=${baseTotal.toFixed(3)}ms fast=${fastTotal.toFixed(3)}ms ratio=${result.ratioFastOverBase.toFixed(3)} exp=${result.expanded}`);
  return result;
}

const cases = CASES.map((spec) => bench(spec));
console.error(`QUOTIENT_FAST_KERNEL_SUMMARY=${JSON.stringify(cases.map((entry) => ({ geometry: entry.geometry, baseMs: entry.baseTotalMs, fastMs: entry.fastTotalMs, ratio: entry.ratioFastOverBase, expanded: entry.expanded })))}`);
console.log(JSON.stringify({
  kind: 'connect4-flat-specialized-quotient-kernel-campaign-v1',
  status: 'complete',
  date: '2026-09-11',
  qualification: 'complete reachable graph identity by state/class ID and edge census plus independent BSFP root/action WDL',
  implementation: 'flat residual slabs, no nested transition term arrays, no generic sort/minimization, exact no-op class returns',
  cases,
}, null, 2));
