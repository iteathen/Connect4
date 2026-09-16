import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { createFastQuotientNativeNegamaxKernel } from './quotient-native-negamax-fast-kernel.mjs';
import { createTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-term-id-kernel.mjs';
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
  for (let index = 0; index < left.length; index += 1) {
    if ((left[index][0] >>> 0) !== (right[index][0] >>> 0)) return false;
    if ((left[index][1] >>> 0) !== (right[index][1] >>> 0)) return false;
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

function qualifyGraph(spec) {
  const fastWrap = createFastQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const termWrap = createTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const fast = fastWrap.kernel;
  const term = termWrap.kernel;
  const fastCensus = enumerate(fast);
  const termCensus = enumerate(term);
  assert(fastCensus.states === spec.expectedStates, 'fast reference q census drift');
  assert(JSON.stringify(fastCensus) === JSON.stringify(termCensus), 'term-ID graph edge census differs from fast reference');
  assert(fast.classes.size === term.classes.size, 'term-ID residual class count differs');
  assert(fast.states.count === term.states.count, 'term-ID state count differs');

  for (let classId = 0; classId < fast.classes.size; classId += 1) {
    assert(termsEqual(fast.classTerms(classId), term.classTerms(classId)), `class ${classId} term semantics differ`);
  }
  for (let id = 0; id < fast.states.count; id += 1) {
    const a = fast.stateView(id);
    const b = term.stateView(id);
    assert(a.supportIndex === b.supportIndex, `state ${id} support differs`);
    assert(a.p0Class === b.p0Class, `state ${id} p0 class ID differs`);
    assert(a.p1Class === b.p1Class, `state ${id} p1 class ID differs`);
  }

  return {
    census: fastCensus,
    residualClasses: fast.classes.size,
    vocabularyTerms: termWrap.termId.vocabulary.count,
    termIdMemory: termWrap.termId.memoryStats(),
  };
}

function expectedRootActions(spec, oracle) {
  const values = Array(spec.columns).fill(null);
  for (let column = 0; column < spec.columns; column += 1) {
    const heights = Array(spec.columns).fill(0);
    heights[column] = 1;
    values[column] = oracle.evaluate({ heights, p0OwnershipMask: 1n << BigInt(column) });
  }
  return values;
}

function fullTermTypedBytes(termWrap) {
  const base = termWrap.kernel.memoryStats();
  const residual = termWrap.termId.memoryStats();
  const supportCore = termWrap.kernel.support.ranks.byteLength + termWrap.kernel.support.weights.byteLength;
  return base.state.totalTypedBytes + base.supportBytes + supportCore + residual.totalTypedBytes;
}

function runOnce(spec, mode, expectedWdl, expectedActions, qualify = false) {
  const started = performance.now();
  let kernel;
  let termWrap = null;
  if (mode === 'term-id') {
    termWrap = createTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
    kernel = termWrap.kernel;
  } else {
    kernel = createFastQuotientNativeNegamaxKernel(spec, { cacheEdges: false }).kernel;
  }
  const setupMs = performance.now() - started;
  const solver = kernel.createWdlSolver({ wdlMode: 'full', etc: false });
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `${mode} root WDL mismatch`);
  let actions = null;
  if (qualify) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `${mode} root action ${column} mismatch`);
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
    legacyTypedLowerBound: kernel.memoryStats().totalTypedBytes,
    fullTermTypedBytes: termWrap ? fullTermTypedBytes(termWrap) : null,
    termMemory: termWrap ? termWrap.termId.memoryStats() : null,
    termMetrics: termWrap ? { ...termWrap.termId.metrics } : null,
  };
}

function bench(spec, repeats = 21) {
  assert(Number.isInteger(repeats) && repeats > 0, 'repeat count must be positive');
  const graphQualification = qualifyGraph(spec);
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const actions = expectedRootActions(spec, oracle);
  const fastQualification = runOnce(spec, 'fast-mask', oracle.rootWdl, actions, true);
  const termQualification = runOnce(spec, 'term-id', oracle.rootWdl, actions, true);
  assert(fastQualification.expanded === termQualification.expanded, 'term-ID kernel changed expansion count');
  assert(fastQualification.calls === termQualification.calls, 'term-ID kernel changed call count');

  const fastRuns = [];
  const termRuns = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    fastRuns.push(runOnce(spec, 'fast-mask', oracle.rootWdl, actions));
    termRuns.push(runOnce(spec, 'term-id', oracle.rootWdl, actions));
  }
  const fastMs = median(fastRuns.map((entry) => entry.totalMs));
  const termMs = median(termRuns.map((entry) => entry.totalMs));
  const fastRepresentative = [...fastRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  const termRepresentative = [...termRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  const result = {
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    graphQualification,
    fastMask: {
      totalMsMedian: fastMs,
      solveMsMedian: median(fastRuns.map((entry) => entry.solveMs)),
      representative: fastRepresentative,
    },
    termId: {
      totalMsMedian: termMs,
      solveMsMedian: median(termRuns.map((entry) => entry.solveMs)),
      representative: termRepresentative,
    },
    timeRatioTermIdOverFastMask: termMs / fastMs,
  };
  console.error(`[q-term-id] ${result.geometry} mask=${fastMs.toFixed(3)}ms term=${termMs.toFixed(3)}ms ratio=${result.timeRatioTermIdOverFastMask.toFixed(3)} exp=${termRepresentative.expanded} termBytes=${termRepresentative.fullTermTypedBytes}`);
  return result;
}

const cases = CASES.map((spec) => bench(spec));
console.error(`QUOTIENT_TERM_ID_KERNEL_SUMMARY=${JSON.stringify(cases.map((entry) => ({ geometry: entry.geometry, maskMs: entry.fastMask.totalMsMedian, termMs: entry.termId.totalMsMedian, ratio: entry.timeRatioTermIdOverFastMask, expanded: entry.termId.representative.expanded, vocabulary: entry.graphQualification.vocabularyTerms, termBytes: entry.termId.representative.fullTermTypedBytes })))}`);
console.log(JSON.stringify({
  kind: 'connect4-quotient-term-id-kernel-campaign-v1',
  status: 'complete',
  date: '2026-09-11',
  qualification: 'complete reachable graph identity by qID/classID/mask semantics and edge census plus independent BSFP root/action WDL',
  termRepresentation: 'u16 IDs over geometry-derived non-empty winning-line subsets with precomputed reduction and subset bitset',
  cases,
}, null, 2));
