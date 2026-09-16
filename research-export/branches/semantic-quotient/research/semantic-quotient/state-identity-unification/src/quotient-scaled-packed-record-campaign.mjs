import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';
import { createScaledTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-scaled-term-id-kernel.mjs';
import { createPackedRecordScaledQuotientKernel } from './quotient-native-negamax-scaled-packed-record-kernel.mjs';

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
function createPacked(spec) { return createPackedRecordScaledQuotientKernel(spec, options()); }

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
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
  return true;
}
function qualifyGraph(spec) {
  const baseline = createBaseline(spec).kernel;
  const packedWrap = createPacked(spec);
  const packed = packedWrap.kernel;
  const expected = enumerate(baseline);
  const actual = enumerate(packed);
  assert(expected.states === spec.expectedStates, 'baseline state census drift');
  assert(JSON.stringify(actual) === JSON.stringify(expected), 'packed-record census mismatch');
  assert(packed.classes.size === baseline.classes.size, 'packed-record class count mismatch');
  assert(packed.states.count === baseline.states.count, 'packed-record q count mismatch');
  for (let classId = 0; classId < baseline.classes.size; classId += 1) {
    assert(arraysEqual(packed.classes.termIds(classId), baseline.classes.termIds(classId)), `class ${classId} mismatch`);
  }
  for (let stateId = 0; stateId < baseline.states.count; stateId += 1) {
    assert(packed.states.support[stateId] === baseline.states.support[stateId], `state ${stateId} support mismatch`);
    assert(packed.states.p0Class[stateId] === baseline.states.p0Class[stateId], `state ${stateId} p0 mismatch`);
    assert(packed.states.p1Class[stateId] === baseline.states.p1Class[stateId], `state ${stateId} p1 mismatch`);
    const view = packedWrap.stateView(stateId);
    assert(view.lower === -1 && view.upper === 1 && view.bestMove === -1, `state ${stateId} initial record mismatch`);
    for (let column = 0; column < spec.columns; column += 1) {
      assert(packed.advance(stateId, column) === baseline.advance(stateId, column), `edge ${stateId}/${column} mismatch`);
    }
  }
  return { census: expected, classes: baseline.classes.size, baselineMemory: baseline.memoryStats(), packedMemory: packed.memoryStats() };
}
function expectedRootActions(spec, oracle) {
  const values = Array(spec.columns).fill(null);
  for (let column = 0; column < spec.columns; column += 1) {
    const heights = Array(spec.columns).fill(0); heights[column] = 1;
    values[column] = oracle.evaluate({ heights, p0OwnershipMask: 1n << BigInt(column) });
  }
  return values;
}
function runOnce(spec, packed, expectedWdl, expectedActions, qualifyActions = false) {
  const started = performance.now();
  const wrap = packed ? createPacked(spec) : createBaseline(spec);
  const setupMs = performance.now() - started;
  const solver = packed ? wrap.createWdlSolver({ wdlMode: 'full', etc: false }) : wrap.kernel.createWdlSolver({ wdlMode: 'full', etc: false });
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `${packed ? 'packed' : 'baseline'} root WDL mismatch`);
  let actions = null;
  if (qualifyActions) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) assert(actions[column] === expectedActions[column], `${packed ? 'packed' : 'baseline'} action ${column} mismatch`);
  }
  const rootView = packed ? wrap.stateView(wrap.kernel.rootId) : wrap.kernel.stateView(wrap.kernel.rootId);
  return { totalMs: performance.now() - started, setupMs, solveMs, result, actions, expanded: solver.metrics.expanded, calls: solver.metrics.calls, states: wrap.kernel.states.count, classes: wrap.kernel.classes.size, rootView, memory: wrap.kernel.memoryStats() };
}
function bench(spec, repeats = 23) {
  const graph = qualifyGraph(spec);
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const expectedActions = expectedRootActions(spec, oracle);
  const baselineQualification = runOnce(spec, false, oracle.rootWdl, expectedActions, true);
  const packedQualification = runOnce(spec, true, oracle.rootWdl, expectedActions, true);
  assert(packedQualification.expanded === baselineQualification.expanded, 'packed-record expansion mismatch');
  assert(packedQualification.calls === baselineQualification.calls, 'packed-record calls mismatch');
  assert(packedQualification.rootView.lower === baselineQualification.rootView.lower, 'packed-record root lower mismatch');
  assert(packedQualification.rootView.upper === baselineQualification.rootView.upper, 'packed-record root upper mismatch');
  assert(packedQualification.rootView.bestMove === baselineQualification.rootView.bestMove, 'packed-record root best mismatch');

  const baselineRuns = []; const packedRuns = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    if ((repeat & 1) === 0) {
      baselineRuns.push(runOnce(spec, false, oracle.rootWdl, expectedActions));
      packedRuns.push(runOnce(spec, true, oracle.rootWdl, expectedActions));
    } else {
      packedRuns.push(runOnce(spec, true, oracle.rootWdl, expectedActions));
      baselineRuns.push(runOnce(spec, false, oracle.rootWdl, expectedActions));
    }
  }
  const baselineMs = median(baselineRuns.map((entry) => entry.totalMs));
  const packedMs = median(packedRuns.map((entry) => entry.totalMs));
  const baselineRep = [...baselineRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  const packedRep = [...packedRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  const result = { geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`, graph, baseline: { totalMs: baselineMs, solveMs: median(baselineRuns.map((entry) => entry.solveMs)), representative: baselineRep, qualification: baselineQualification }, packed: { totalMs: packedMs, solveMs: median(packedRuns.map((entry) => entry.solveMs)), representative: packedRep, qualification: packedQualification }, ratioPackedOverBaseline: packedMs / baselineMs, rootBytesSaved: baselineRep.memory.totalTypedBytes - packedRep.memory.totalTypedBytes, fullGraphBytesSaved: graph.baselineMemory.totalTypedBytes - graph.packedMemory.totalTypedBytes };
  console.error(`[q-packed-record] ${result.geometry} base=${baselineMs.toFixed(3)}ms packed=${packedMs.toFixed(3)}ms ratio=${result.ratioPackedOverBaseline.toFixed(3)} rootSave=${result.rootBytesSaved} fullGraphSave=${result.fullGraphBytesSaved}`);
  return result;
}
function structural7x6() {
  const spec = { columns: 7, rows: 6, connect: 4 };
  const baseline = createBaseline(spec).kernel;
  const packed = createPacked(spec).kernel;
  return { baseline: baseline.memoryStats(), packed: packed.memoryStats(), rootBytesSaved: baseline.memoryStats().totalTypedBytes - packed.memoryStats().totalTypedBytes };
}
const cases = CASES.map((spec) => bench(spec));
const standard7x6 = structural7x6();
console.error(`PACKED_RECORD_SUMMARY=${JSON.stringify(cases.map((entry) => ({ geometry: entry.geometry, baselineMs: entry.baseline.totalMs, packedMs: entry.packed.totalMs, ratio: entry.ratioPackedOverBaseline, rootBytesSaved: entry.rootBytesSaved, fullGraphBytesSaved: entry.fullGraphBytesSaved })))}`);
console.log(JSON.stringify({ kind: 'connect4-scaled-packed-search-record-v1', status: 'complete', date: '2026-09-11', qualification: 'complete graph/qID/class/edge identity plus BSFP root/action WDL, identical search work, and matching root search record', cases, standard7x6 }, null, 2));
