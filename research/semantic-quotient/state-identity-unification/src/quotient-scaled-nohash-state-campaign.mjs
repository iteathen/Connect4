import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';
import { createScaledTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-scaled-term-id-kernel.mjs';
import { createNoStoredStateHashScaledQuotientKernel } from './quotient-native-negamax-scaled-nohash-kernel.mjs';

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

function createVariant(spec, nohash) {
  const options = { cacheEdges: false, supportLayout: 'packed', prefixClasses: 4096 };
  return nohash
    ? createNoStoredStateHashScaledQuotientKernel(spec, options)
    : createScaledTermIdQuotientNativeNegamaxKernel(spec, options);
}

function enumerate(kernel) {
  let terminalEdges = 0;
  let nonterminalEdges = 0;
  let illegalEdges = 0;
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

function arraysEqual(left, right) {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) if (left[index] !== right[index]) return false;
  return true;
}

function qualifyGraph(spec) {
  const baseline = createVariant(spec, false).kernel;
  const nohash = createVariant(spec, true).kernel;
  const baselineCensus = enumerate(baseline);
  const nohashCensus = enumerate(nohash);
  assert(baselineCensus.states === spec.expectedStates, 'scaled baseline state census drift');
  assert(JSON.stringify(nohashCensus) === JSON.stringify(baselineCensus), 'nohash edge census mismatch');
  assert(nohash.classes.size === baseline.classes.size, 'nohash class count mismatch');
  assert(nohash.states.count === baseline.states.count, 'nohash q state count mismatch');
  for (let classId = 0; classId < baseline.classes.size; classId += 1) {
    assert(arraysEqual(nohash.classes.termIds(classId), baseline.classes.termIds(classId)), `class ${classId} mismatch`);
  }
  for (let stateId = 0; stateId < baseline.states.count; stateId += 1) {
    const a = baseline.stateView(stateId);
    const b = nohash.stateView(stateId);
    assert(a.supportIndex === b.supportIndex, `state ${stateId} support mismatch`);
    assert(a.p0Class === b.p0Class, `state ${stateId} p0 mismatch`);
    assert(a.p1Class === b.p1Class, `state ${stateId} p1 mismatch`);
    for (let column = 0; column < spec.columns; column += 1) {
      assert(nohash.advance(stateId, column) === baseline.advance(stateId, column), `state ${stateId}/${column} edge mismatch`);
    }
  }
  return {
    census: baselineCensus,
    classes: baseline.classes.size,
    baselineMemory: baseline.memoryStats(),
    nohashMemory: nohash.memoryStats(),
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

function runOnce(spec, nohash, expectedWdl, expectedActions, qualifyActions = false) {
  const started = performance.now();
  const wrap = createVariant(spec, nohash);
  const setupMs = performance.now() - started;
  const solver = wrap.kernel.createWdlSolver({ wdlMode: 'full', etc: false });
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `${nohash ? 'nohash' : 'baseline'} root WDL mismatch`);
  let actions = null;
  if (qualifyActions) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `${nohash ? 'nohash' : 'baseline'} root action ${column} mismatch`);
    }
  }
  return {
    totalMs: performance.now() - started,
    setupMs,
    solveMs,
    expanded: solver.metrics.expanded,
    calls: solver.metrics.calls,
    states: wrap.kernel.states.count,
    classes: wrap.kernel.classes.size,
    stateInternMetrics: { ...wrap.kernel.states.metrics },
    memory: wrap.kernel.memoryStats(),
  };
}

function bench(spec, repeats = 21) {
  const graph = qualifyGraph(spec);
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const expectedActions = expectedRootActions(spec, oracle);
  const baselineQualification = runOnce(spec, false, oracle.rootWdl, expectedActions, true);
  const nohashQualification = runOnce(spec, true, oracle.rootWdl, expectedActions, true);
  assert(nohashQualification.expanded === baselineQualification.expanded, 'nohash expansion count mismatch');
  assert(nohashQualification.calls === baselineQualification.calls, 'nohash call count mismatch');

  const baselineRuns = [];
  const nohashRuns = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    if ((repeat & 1) === 0) {
      baselineRuns.push(runOnce(spec, false, oracle.rootWdl, expectedActions));
      nohashRuns.push(runOnce(spec, true, oracle.rootWdl, expectedActions));
    } else {
      nohashRuns.push(runOnce(spec, true, oracle.rootWdl, expectedActions));
      baselineRuns.push(runOnce(spec, false, oracle.rootWdl, expectedActions));
    }
  }
  const baselineMs = median(baselineRuns.map((entry) => entry.totalMs));
  const nohashMs = median(nohashRuns.map((entry) => entry.totalMs));
  const baselineRep = [...baselineRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  const nohashRep = [...nohashRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  const result = {
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    graph,
    baseline: { totalMs: baselineMs, solveMs: median(baselineRuns.map((entry) => entry.solveMs)), representative: baselineRep, qualification: baselineQualification },
    nohash: { totalMs: nohashMs, solveMs: median(nohashRuns.map((entry) => entry.solveMs)), representative: nohashRep, qualification: nohashQualification },
    ratioNoHashOverBaseline: nohashMs / baselineMs,
    rootBytesSaved: baselineRep.memory.totalTypedBytes - nohashRep.memory.totalTypedBytes,
    fullGraphBytesSaved: graph.baselineMemory.totalTypedBytes - graph.nohashMemory.totalTypedBytes,
  };
  console.error(`[q-nohash] ${result.geometry} base=${baselineMs.toFixed(3)}ms nohash=${nohashMs.toFixed(3)}ms ratio=${result.ratioNoHashOverBaseline.toFixed(3)} rootSave=${result.rootBytesSaved} fullGraphSave=${result.fullGraphBytesSaved}`);
  return result;
}

function structural7x6() {
  const spec = { columns: 7, rows: 6, connect: 4 };
  const baseline = createVariant(spec, false).kernel;
  const nohash = createVariant(spec, true).kernel;
  return {
    baseline: baseline.memoryStats(),
    nohash: nohash.memoryStats(),
    rootBytesSaved: baseline.memoryStats().totalTypedBytes - nohash.memoryStats().totalTypedBytes,
  };
}

const cases = CASES.map((spec) => bench(spec));
const standard7x6 = structural7x6();
console.error(`NOHASH_STATE_SUMMARY=${JSON.stringify(cases.map((entry) => ({ geometry: entry.geometry, baselineMs: entry.baseline.totalMs, nohashMs: entry.nohash.totalMs, ratio: entry.ratioNoHashOverBaseline, rootBytesSaved: entry.rootBytesSaved, fullGraphBytesSaved: entry.fullGraphBytesSaved })))}`);
console.log(JSON.stringify({
  kind: 'connect4-scaled-quotient-no-stored-state-hash-v1',
  status: 'complete',
  date: '2026-09-11',
  qualification: 'complete graph class/qID/edge identity plus independent BSFP root/action WDL and identical Negamax work',
  cases,
  standard7x6,
}, null, 2));
