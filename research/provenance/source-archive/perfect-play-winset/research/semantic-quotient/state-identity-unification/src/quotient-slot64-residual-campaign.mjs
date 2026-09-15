import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-negamax-domain-contract.mjs';
import { createScaledTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-scaled-term-id-kernel.mjs';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3, expectedStates: 3735 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4, expectedStates: 34095 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4, expectedStates: 11317 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4, expectedStates: 294593 }),
]);

function assert(condition, message) { if (!condition) throw new Error(message); }
function median(values) { const sorted = [...values].sort((a, b) => a - b); return sorted[Math.floor(sorted.length / 2)]; }
function kernelOptions() { return { cacheEdges: false, supportLayout: 'packed', prefixClasses: 4096 }; }
function createBaseline(spec) { return createScaledTermIdQuotientNativeNegamaxKernel(spec, kernelOptions()); }
// Representation-only comparison keeps closure identical to the term-ID control.
// Production response closure is independently qualified by quotient-pruning-campaign.
function createCandidate(spec) { return createSlot64ResidualQuotientKernel(spec, { ...kernelOptions(), responseClosure: false }); }

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

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) if (a[index] !== b[index]) return false;
  return true;
}

function qualifyGraph(spec) {
  const baseline = createBaseline(spec).kernel;
  const candidateWrap = createCandidate(spec);
  const candidate = candidateWrap.kernel;
  const baselineCensus = enumerate(baseline);
  const candidateCensus = enumerate(candidate);
  assert(baselineCensus.states === spec.expectedStates, `baseline state census drift for ${spec.columns}x${spec.rows}`);
  assert(JSON.stringify(candidateCensus) === JSON.stringify(baselineCensus), 'slot64 edge census mismatch');
  assert(candidate.classes.size === baseline.classes.size, `class count mismatch ${candidate.classes.size} != ${baseline.classes.size}`);
  assert(candidate.states.count === baseline.states.count, 'q-state count mismatch');

  for (let classId = 0; classId < baseline.classes.size; classId += 1) {
    const expected = baseline.classes.termIds(classId);
    const actual = candidate.classes.termIds(classId);
    assert(arraysEqual(actual, expected), `class ${classId} term-ID mismatch`);
  }
  for (let stateId = 0; stateId < baseline.states.count; stateId += 1) {
    const a = baseline.stateView(stateId);
    const b = candidate.stateView(stateId);
    assert(a.supportIndex === b.supportIndex, `state ${stateId} support mismatch`);
    assert(a.p0Class === b.p0Class, `state ${stateId} p0-class mismatch`);
    assert(a.p1Class === b.p1Class, `state ${stateId} p1-class mismatch`);
    for (let column = 0; column < spec.columns; column += 1) {
      assert(candidate.advance(stateId, column) === baseline.advance(stateId, column), `edge ${stateId}/${column} mismatch`);
    }
  }

  return {
    census: baselineCensus,
    classes: baseline.classes.size,
    baselineMemory: baseline.memoryStats(),
    candidateMemory: candidate.memoryStats(),
    candidateMetrics: { ...candidate.classes.metrics },
    slotMetrics: candidateWrap.residual.slotPools.map((slot) => ({ ...slot.metrics })),
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

function runOnce(spec, candidate, expectedWdl, expectedActions, qualifyActions = false) {
  const started = performance.now();
  const wrap = candidate ? createCandidate(spec) : createBaseline(spec);
  const setupMs = performance.now() - started;
  const solver = wrap.kernel.createWdlSolver({ wdlMode: 'full', etc: false });
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `${candidate ? 'slot64' : 'baseline'} root WDL mismatch`);
  let actions = null;
  if (qualifyActions) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `${candidate ? 'slot64' : 'baseline'} root action ${column} mismatch`);
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
  };
}

function bench(spec, repeats = 17) {
  const graph = qualifyGraph(spec);
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const expectedActions = expectedRootActions(spec, oracle);
  const baselineQualification = runOnce(spec, false, oracle.rootWdl, expectedActions, true);
  const candidateQualification = runOnce(spec, true, oracle.rootWdl, expectedActions, true);
  assert(candidateQualification.expanded === baselineQualification.expanded, 'slot64 expansion count mismatch');
  assert(candidateQualification.calls === baselineQualification.calls, 'slot64 call count mismatch');

  const baselineRuns = [];
  const candidateRuns = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    if ((repeat & 1) === 0) {
      baselineRuns.push(runOnce(spec, false, oracle.rootWdl, expectedActions));
      candidateRuns.push(runOnce(spec, true, oracle.rootWdl, expectedActions));
    } else {
      candidateRuns.push(runOnce(spec, true, oracle.rootWdl, expectedActions));
      baselineRuns.push(runOnce(spec, false, oracle.rootWdl, expectedActions));
    }
  }
  const baselineMs = median(baselineRuns.map((entry) => entry.totalMs));
  const candidateMs = median(candidateRuns.map((entry) => entry.totalMs));
  const baselineRep = [...baselineRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  const candidateRep = [...candidateRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  const result = {
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    graph,
    baseline: {
      totalMs: baselineMs,
      solveMs: median(baselineRuns.map((entry) => entry.solveMs)),
      representative: baselineRep,
      qualification: baselineQualification,
    },
    slot64: {
      totalMs: candidateMs,
      solveMs: median(candidateRuns.map((entry) => entry.solveMs)),
      representative: candidateRep,
      qualification: candidateQualification,
    },
    ratioSlot64OverBaseline: candidateMs / baselineMs,
    rootBytesSaved: baselineRep.memory.totalTypedBytes - candidateRep.memory.totalTypedBytes,
    fullGraphBytesSaved: graph.baselineMemory.totalTypedBytes - graph.candidateMemory.totalTypedBytes,
  };
  console.error(`[q-slot64] ${result.geometry} base=${baselineMs.toFixed(3)}ms slot64=${candidateMs.toFixed(3)}ms ratio=${result.ratioSlot64OverBaseline.toFixed(3)} rootSave=${result.rootBytesSaved} fullSave=${result.fullGraphBytesSaved}`);
  return result;
}

function structural7x6() {
  const spec = { columns: 7, rows: 6, connect: 4 };
  const baseline = createBaseline(spec).kernel;
  const candidateWrap = createCandidate(spec);
  const candidate = candidateWrap.kernel;
  return {
    baseline: baseline.memoryStats(),
    slot64: candidate.memoryStats(),
    classReferenceWidths: candidate.classes.memoryStats().classReferenceWidths,
    slotChunkCounts: candidate.classes.memoryStats().chunkCounts,
    rootBytesSaved: baseline.memoryStats().totalTypedBytes - candidate.memoryStats().totalTypedBytes,
  };
}

const cases = CASES.map((spec) => bench(spec));
const standard7x6 = structural7x6();
const compact = cases.map((entry) => ({
  geometry: entry.geometry,
  baselineMs: entry.baseline.totalMs,
  slot64Ms: entry.slot64.totalMs,
  ratio: entry.ratioSlot64OverBaseline,
  rootBytesSaved: entry.rootBytesSaved,
  fullGraphBytesSaved: entry.fullGraphBytesSaved,
  candidateClassBytes: entry.graph.candidateMemory.residual.totalTypedBytes,
  baselineClassBytes: entry.graph.baselineMemory.residual.totalTypedBytes,
  referenceWidths: entry.graph.candidateMemory.residual.classReferenceWidths,
}));
console.error(`SLOT64_RESIDUAL_SUMMARY=${JSON.stringify(compact)}`);
console.log(JSON.stringify({
  kind: 'connect4-slot-local-64bit-residual-v1',
  status: 'complete',
  date: '2026-09-11',
  qualification: 'complete class/qID/edge graph identity plus independent BSFP root/action WDL and identical Negamax work',
  architecture: '10 fixed ontology slots, 64-bit chunks, slot-local dictionaries, per-slot narrow IDs, parent-chunk reuse',
  caveat: 'bounded controls have much smaller ontologies than standard 7x6; standard-7x6 bounded-growth is the promotion gate for memory economics',
  cases,
  standard7x6,
}, null, 2));
