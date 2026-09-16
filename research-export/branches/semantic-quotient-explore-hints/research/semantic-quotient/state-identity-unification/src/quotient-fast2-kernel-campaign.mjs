import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { createFastQuotientNativeNegamaxKernel } from './quotient-native-negamax-fast-kernel.mjs';
import { createFast2QuotientNativeNegamaxKernel } from './quotient-native-negamax-fast2-kernel.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';

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
  const v1Wrap = createFastQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const v2Wrap = createFast2QuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const v1 = v1Wrap.kernel;
  const v2 = v2Wrap.kernel;
  const a = enumerate(v1);
  const b = enumerate(v2);
  assert(a.states === spec.expectedStates, 'v1 relational state census drift');
  assert(b.states === spec.expectedStates, 'v2 relational state census drift');
  assert(JSON.stringify(a) === JSON.stringify(b), 'v2 edge census differs from v1');
  assert(v1.classes.size === v2.classes.size, 'v2 residual class count differs from v1');
  for (let classId = 0; classId < v1.classes.size; classId += 1) {
    assert(termsEqual(v1.classTerms(classId), v2.classTerms(classId)), `class ${classId} term identity mismatch`);
  }
  for (let id = 0; id < v1.states.count; id += 1) {
    const x = v1.stateView(id);
    const y = v2.stateView(id);
    assert(x.supportIndex === y.supportIndex, `state ${id} support mismatch`);
    assert(x.p0Class === y.p0Class, `state ${id} p0 class mismatch`);
    assert(x.p1Class === y.p1Class, `state ${id} p1 class mismatch`);
  }
  return { census: a, classes: v1.classes.size, v2Metrics: { ...v2Wrap.specialization.metrics } };
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

function runOnce(spec, v2, expectedWdl, expectedActions, qualifyActions = false) {
  const started = performance.now();
  const wrap = v2
    ? createFast2QuotientNativeNegamaxKernel(spec, { cacheEdges: false })
    : createFastQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const kernel = wrap.kernel;
  const setupMs = performance.now() - started;
  const solver = kernel.createWdlSolver({ wdlMode: 'full', etc: false });
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `${v2 ? 'v2' : 'v1'} root WDL mismatch`);
  let actions = null;
  if (qualifyActions) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `${v2 ? 'v2' : 'v1'} root action ${column} mismatch`);
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
    specialization: { ...wrap.specialization.metrics },
  };
}

function bench(spec, repeats = 15) {
  const graphQualification = qualifyGraphIdentity(spec);
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const expectedActions = expectedRootActions(spec, oracle);
  const q1 = runOnce(spec, false, oracle.rootWdl, expectedActions, true);
  const q2 = runOnce(spec, true, oracle.rootWdl, expectedActions, true);
  assert(q1.expanded === q2.expanded, 'v2 changed expansion count');
  assert(q1.calls === q2.calls, 'v2 changed call count');

  const v1Runs = [];
  const v2Runs = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    if ((repeat & 1) === 0) {
      v1Runs.push(runOnce(spec, false, oracle.rootWdl, expectedActions));
      v2Runs.push(runOnce(spec, true, oracle.rootWdl, expectedActions));
    } else {
      v2Runs.push(runOnce(spec, true, oracle.rootWdl, expectedActions));
      v1Runs.push(runOnce(spec, false, oracle.rootWdl, expectedActions));
    }
  }
  const v1Total = median(v1Runs.map((x) => x.totalMs));
  const v2Total = median(v2Runs.map((x) => x.totalMs));
  const result = {
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    graphQualification,
    v1TotalMs: v1Total,
    v2TotalMs: v2Total,
    v1SolveMs: median(v1Runs.map((x) => x.solveMs)),
    v2SolveMs: median(v2Runs.map((x) => x.solveMs)),
    ratioV2OverV1: v2Total / v1Total,
    expanded: q2.expanded,
    calls: q2.calls,
    v2Specialization: v2Runs[Math.floor(repeats / 2)].specialization,
  };
  console.error(`[q-fast2] ${result.geometry} v1=${v1Total.toFixed(3)}ms v2=${v2Total.toFixed(3)}ms ratio=${result.ratioV2OverV1.toFixed(3)} exp=${result.expanded}`);
  return result;
}

const cases = CASES.map((spec) => bench(spec));
console.error(`QUOTIENT_FAST2_SUMMARY=${JSON.stringify(cases.map((x) => ({ geometry: x.geometry, v1Ms: x.v1TotalMs, v2Ms: x.v2TotalMs, ratio: x.ratioV2OverV1, expanded: x.expanded })))}`);
console.log(JSON.stringify({
  kind: 'connect4-coverage-fused-hash-quotient-kernel-campaign-v1',
  status: 'complete',
  date: '2026-09-11',
  qualification: 'complete reachable graph identity by state/class ID and edge census plus independent BSFP root/action WDL',
  implementation: 'per-class residual coverage masks for O(1) no-op transition detection plus canonical hash fusion into filter/merge output',
  cases,
}, null, 2));
