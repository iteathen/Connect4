import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';
import { createScaledTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-scaled-term-id-kernel.mjs';
import { createChunkedResidualQuotientKernel } from './quotient-native-negamax-chunked-residual-kernel.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3, expectedStates: 3735 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4, expectedStates: 34095 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4, expectedStates: 11317 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4, expectedStates: 294593 }),
]);

function assert(condition, message) { if (!condition) throw new Error(message); }
function median(values) { const sorted = [...values].sort((a, b) => a - b); return sorted[Math.floor(sorted.length / 2)]; }
function options() { return { cacheEdges: false, supportLayout: 'packed', prefixClasses: 4096 }; }
function createBaseline(spec) { return createScaledTermIdQuotientNativeNegamaxKernel(spec, options()); }
function createChunked(spec) { return createChunkedResidualQuotientKernel(spec, options()); }

function enumerate(kernel) {
  let terminalEdges = 0; let nonterminalEdges = 0; let illegalEdges = 0;
  for (let stateId = 0; stateId < kernel.states.count; stateId += 1) {
    for (let column = 0; column < kernel.columns; column += 1) {
      const child = kernel.advance(stateId, column);
      if (child === QN_ILLEGAL) illegalEdges += 1;
      else if (child === QN_TERMINAL_WIN) terminalEdges += 1;
      else nonterminalEdges += 1;
    }
  }
  return { states: kernel.states.count, terminalEdges, nonterminalEdges, illegalEdges };
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) if (a[index] !== b[index]) return false;
  return true;
}

function qualifyGraph(spec) {
  const baseline = createBaseline(spec).kernel;
  const chunkWrap = createChunked(spec);
  const chunked = chunkWrap.kernel;
  const baselineCensus = enumerate(baseline);
  const chunkedCensus = enumerate(chunked);
  assert(baselineCensus.states === spec.expectedStates, 'baseline state census drift');
  assert(JSON.stringify(chunkedCensus) === JSON.stringify(baselineCensus), 'chunked edge census mismatch');
  assert(chunked.classes.size === baseline.classes.size, `class count mismatch ${chunked.classes.size} != ${baseline.classes.size}`);
  assert(chunked.states.count === baseline.states.count, 'q-state count mismatch');

  for (let classId = 0; classId < baseline.classes.size; classId += 1) {
    const expected = baseline.classes.termIds(classId);
    const actual = chunked.classes.termIds(classId);
    assert(arraysEqual(actual, expected), `class ${classId} term-ID mismatch`);
  }
  for (let stateId = 0; stateId < baseline.states.count; stateId += 1) {
    const a = baseline.stateView(stateId);
    const b = chunked.stateView(stateId);
    assert(a.supportIndex === b.supportIndex, `state ${stateId} support mismatch`);
    assert(a.p0Class === b.p0Class, `state ${stateId} p0 class mismatch`);
    assert(a.p1Class === b.p1Class, `state ${stateId} p1 class mismatch`);
    for (let column = 0; column < spec.columns; column += 1) {
      assert(chunked.advance(stateId, column) === baseline.advance(stateId, column), `edge ${stateId}/${column} mismatch`);
    }
  }
  return {
    census: baselineCensus,
    classes: baseline.classes.size,
    baselineMemory: baseline.memoryStats(),
    chunkedMemory: chunked.memoryStats(),
    chunkMetrics: { ...chunkWrap.residual.chunkPool.metrics },
  };
}

function expectedRootActions(spec, oracle) {
  const values = Array(spec.columns).fill(null);
  for (let column = 0; column < spec.columns; column += 1) {
    const heights = Array(spec.columns).fill(0); heights[column] = 1;
    values[column] = oracle.evaluate({ heights, p0OwnershipMask: 1n << BigInt(column) });
  }
  return values;
}

function runOnce(spec, chunked, expectedWdl, expectedActions, qualifyActions = false) {
  const started = performance.now();
  const wrap = chunked ? createChunked(spec) : createBaseline(spec);
  const setupMs = performance.now() - started;
  const solver = wrap.kernel.createWdlSolver({ wdlMode: 'full', etc: false });
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `${chunked ? 'chunked' : 'baseline'} root WDL mismatch`);
  let actions = null;
  if (qualifyActions) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `${chunked ? 'chunked' : 'baseline'} root action ${column} mismatch`);
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
    states: wrap.kernel.states.count,
    classes: wrap.kernel.classes.size,
    memory: wrap.kernel.memoryStats(),
    classMetrics: { ...wrap.kernel.classes.metrics },
    chunkMetrics: chunked ? { ...wrap.residual.chunkPool.metrics } : null,
  };
}

function bench(spec, repeats = 17) {
  const graph = qualifyGraph(spec);
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const expectedActions = expectedRootActions(spec, oracle);
  const baselineQualification = runOnce(spec, false, oracle.rootWdl, expectedActions, true);
  const chunkedQualification = runOnce(spec, true, oracle.rootWdl, expectedActions, true);
  assert(chunkedQualification.expanded === baselineQualification.expanded, 'chunked expansion count mismatch');
  assert(chunkedQualification.calls === baselineQualification.calls, 'chunked call count mismatch');

  const baselineRuns = []; const chunkedRuns = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    if ((repeat & 1) === 0) {
      baselineRuns.push(runOnce(spec, false, oracle.rootWdl, expectedActions));
      chunkedRuns.push(runOnce(spec, true, oracle.rootWdl, expectedActions));
    } else {
      chunkedRuns.push(runOnce(spec, true, oracle.rootWdl, expectedActions));
      baselineRuns.push(runOnce(spec, false, oracle.rootWdl, expectedActions));
    }
  }
  const baselineMs = median(baselineRuns.map((entry) => entry.totalMs));
  const chunkedMs = median(chunkedRuns.map((entry) => entry.totalMs));
  const baselineRep = [...baselineRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  const chunkedRep = [...chunkedRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  const result = {
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    graph,
    baseline: { totalMs: baselineMs, solveMs: median(baselineRuns.map((entry) => entry.solveMs)), representative: baselineRep, qualification: baselineQualification },
    chunked: { totalMs: chunkedMs, solveMs: median(chunkedRuns.map((entry) => entry.solveMs)), representative: chunkedRep, qualification: chunkedQualification },
    ratioChunkedOverBaseline: chunkedMs / baselineMs,
    rootBytesSaved: baselineRep.memory.totalTypedBytes - chunkedRep.memory.totalTypedBytes,
    fullGraphBytesSaved: graph.baselineMemory.totalTypedBytes - graph.chunkedMemory.totalTypedBytes,
  };
  console.error(`[q-chunked] ${result.geometry} base=${baselineMs.toFixed(3)}ms chunk=${chunkedMs.toFixed(3)}ms ratio=${result.ratioChunkedOverBaseline.toFixed(3)} rootSave=${result.rootBytesSaved} fullSave=${result.fullGraphBytesSaved}`);
  return result;
}

function structural7x6() {
  const spec = { columns: 7, rows: 6, connect: 4 };
  const baseline = createBaseline(spec).kernel;
  const chunkWrap = createChunked(spec);
  return {
    baseline: baseline.memoryStats(),
    chunked: chunkWrap.kernel.memoryStats(),
    chunkMetrics: { ...chunkWrap.residual.chunkPool.metrics },
    rootBytesSaved: baseline.memoryStats().totalTypedBytes - chunkWrap.kernel.memoryStats().totalTypedBytes,
  };
}

const cases = CASES.map((spec) => bench(spec));
const standard7x6 = structural7x6();
console.error(`CHUNKED_RESIDUAL_SUMMARY=${JSON.stringify(cases.map((entry) => ({ geometry: entry.geometry, baselineMs: entry.baseline.totalMs, chunkedMs: entry.chunked.totalMs, ratio: entry.ratioChunkedOverBaseline, rootBytesSaved: entry.rootBytesSaved, fullGraphBytesSaved: entry.fullGraphBytesSaved })))}`);
console.log(JSON.stringify({
  kind: 'connect4-persistent-128bit-chunked-residual-v1',
  status: 'complete',
  date: '2026-09-11',
  qualification: 'complete class/qID/edge graph identity plus independent BSFP root/action WDL and identical Negamax work',
  cases,
  standard7x6,
}, null, 2));
