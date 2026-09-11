import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';
import { createScaledTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-scaled-term-id-kernel.mjs';
import { createChunkedTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-chunked-term-id-kernel.mjs';

const PREFIX_CLASSES = 4096;
const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 4, connect: 4, expectedStates: 34095 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4, expectedStates: 11317 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4, expectedStates: 294593 }),
]);
const STANDARD = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const STANDARD_RANK = 8;
const STANDARD_EXPECTED_STATES = 797388;
const STANDARD_EXPECTED_CLASSES = 1357101;
const STANDARD_EXPECTED_TERMS = 56882431;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
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

function idsEqual(left, right) {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) if (left[index] !== right[index]) return false;
  return true;
}

function qualifyGraph(spec) {
  const sparse = createScaledTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false, prefixClasses: PREFIX_CLASSES });
  const chunked = createChunkedTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false, prefixClasses: PREFIX_CLASSES });
  let nonterminal = 0;
  let terminal = 0;
  let illegal = 0;

  for (let stateId = 0; stateId < sparse.kernel.states.count; stateId += 1) {
    assert(stateId < chunked.kernel.states.count, `chunked state missing at ${stateId}`);
    const aState = sparse.kernel.stateView(stateId);
    const bState = chunked.kernel.stateView(stateId);
    assert(aState.supportIndex === bState.supportIndex, `state ${stateId} support drift`);
    assert(aState.p0Class === bState.p0Class, `state ${stateId} p0 class drift`);
    assert(aState.p1Class === bState.p1Class, `state ${stateId} p1 class drift`);
    for (let column = 0; column < spec.columns; column += 1) {
      const a = sparse.kernel.advance(stateId, column);
      const b = chunked.kernel.advance(stateId, column);
      assert(a === b, `edge drift state=${stateId} column=${column} sparse=${a} chunked=${b}`);
      if (a === QN_ILLEGAL) illegal += 1;
      else if (a === QN_TERMINAL_WIN) terminal += 1;
      else nonterminal += 1;
    }
  }

  assert(sparse.kernel.states.count === spec.expectedStates, `sparse q-state census drift: ${sparse.kernel.states.count}`);
  assert(chunked.kernel.states.count === sparse.kernel.states.count, 'chunked q-state count drift');
  assert(chunked.kernel.classes.size === sparse.kernel.classes.size, 'chunked residual-class count drift');

  for (let classId = 0; classId < sparse.kernel.classes.size; classId += 1) {
    const a = sparse.kernel.classes.termIds(classId);
    const b = chunked.kernel.classes.termIds(classId);
    assert(idsEqual(a, b), `class ${classId} term-ID semantics drift`);
  }

  return Object.freeze({
    census: { states: sparse.kernel.states.count, classes: sparse.kernel.classes.size, nonterminal, terminal, illegal },
    sparseMemory: sparse.kernel.memoryStats(),
    chunkedMemory: chunked.kernel.memoryStats(),
  });
}

function runSearch(spec, kind, expectedWdl, expectedActions, qualify = false) {
  const started = performance.now();
  const wrap = kind === 'sparse'
    ? createScaledTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false, prefixClasses: PREFIX_CLASSES })
    : createChunkedTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false, prefixClasses: PREFIX_CLASSES });
  const setupMs = performance.now() - started;
  const solver = wrap.kernel.createWdlSolver({ wdlMode: 'full', etc: false });
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `${kind} root WDL mismatch`);
  let actions = null;
  if (qualify) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `${kind} root action ${column} mismatch`);
    }
  }
  return Object.freeze({
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
  });
}

function bench(spec, repeats = 21) {
  const qualification = qualifyGraph(spec);
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const expectedActions = expectedRootActions(spec, oracle);
  const sparseQualified = runSearch(spec, 'sparse', oracle.rootWdl, expectedActions, true);
  const chunkedQualified = runSearch(spec, 'chunked', oracle.rootWdl, expectedActions, true);
  assert(sparseQualified.expanded === chunkedQualified.expanded, 'chunked representation changed expansion count');
  assert(sparseQualified.calls === chunkedQualified.calls, 'chunked representation changed call count');

  const sparseRuns = [];
  const chunkedRuns = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    if (repeat & 1) {
      chunkedRuns.push(runSearch(spec, 'chunked', oracle.rootWdl, expectedActions));
      sparseRuns.push(runSearch(spec, 'sparse', oracle.rootWdl, expectedActions));
    } else {
      sparseRuns.push(runSearch(spec, 'sparse', oracle.rootWdl, expectedActions));
      chunkedRuns.push(runSearch(spec, 'chunked', oracle.rootWdl, expectedActions));
    }
  }

  const sparseTotal = median(sparseRuns.map((x) => x.totalMs));
  const chunkedTotal = median(chunkedRuns.map((x) => x.totalMs));
  const sparseSolve = median(sparseRuns.map((x) => x.solveMs));
  const chunkedSolve = median(chunkedRuns.map((x) => x.solveMs));
  const result = Object.freeze({
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    qualification,
    sparse: { totalMs: sparseTotal, solveMs: sparseSolve, representative: [...sparseRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)] },
    chunked: { totalMs: chunkedTotal, solveMs: chunkedSolve, representative: [...chunkedRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)] },
    ratioTotal: chunkedTotal / sparseTotal,
    ratioSolve: chunkedSolve / sparseSolve,
  });
  console.error(`[chunked-pool] ${result.geometry} sparse=${sparseTotal.toFixed(3)}ms chunked=${chunkedTotal.toFixed(3)}ms totalRatio=${result.ratioTotal.toFixed(3)} solveRatio=${result.ratioSolve.toFixed(3)} sparseB=${qualification.sparseMemory.residual.totalTypedBytes} chunkedB=${qualification.chunkedMemory.residual.totalTypedBytes}`);
  return result;
}

function growToRank(kind) {
  const started = performance.now();
  const wrap = kind === 'sparse'
    ? createScaledTermIdQuotientNativeNegamaxKernel(STANDARD, { cacheEdges: false, prefixClasses: PREFIX_CLASSES })
    : createChunkedTermIdQuotientNativeNegamaxKernel(STANDARD, { cacheEdges: false, prefixClasses: PREFIX_CLASSES });
  const kernel = wrap.kernel;
  const buckets = Array.from({ length: STANDARD_RANK + 2 }, () => []);
  buckets[0].push(kernel.rootId);
  let nextUnbucketedId = 1;
  const rankRows = [];
  for (let rank = 0; rank <= STANDARD_RANK; rank += 1) {
    const bucket = buckets[rank];
    for (let index = 0; index < bucket.length; index += 1) {
      const stateId = bucket[index];
      for (let column = 0; column < STANDARD.columns; column += 1) {
        kernel.advance(stateId, column);
        while (nextUnbucketedId < kernel.states.count) {
          const newId = nextUnbucketedId++;
          const newRank = kernel.supportAccess.rankAt(kernel.states.support[newId]);
          assert(newRank === rank + 1, `${kind} rank drift at q ${newId}`);
          if (newRank < buckets.length) buckets[newRank].push(newId);
        }
      }
    }
    rankRows.push({ rank, frontier: bucket.length, qStates: kernel.states.count, classes: kernel.classes.size, residualTerms: kernel.classes.memoryStats().residualTerms });
    assert(kernel.states.count <= 1000000, `${kind} exceeded bounded growth state cap`);
  }
  assert(kernel.states.count === STANDARD_EXPECTED_STATES, `${kind} standard q-state count drift: ${kernel.states.count}`);
  assert(kernel.classes.size === STANDARD_EXPECTED_CLASSES, `${kind} standard class count drift: ${kernel.classes.size}`);
  assert(kernel.classes.memoryStats().residualTerms === STANDARD_EXPECTED_TERMS, `${kind} standard term count drift`);
  return Object.freeze({ kind, elapsedMs: performance.now() - started, qStates: kernel.states.count, classes: kernel.classes.size, residualTerms: kernel.classes.memoryStats().residualTerms, memory: kernel.memoryStats(), rankRows });
}

const bounded = CASES.map((spec) => bench(spec));
let sparseGrowth = growToRank('sparse');
if (global.gc) global.gc();
let chunkedGrowth = growToRank('chunked');

console.error(`CHUNKED_RESIDUAL_SUMMARY=${JSON.stringify({
  bounded: bounded.map((x) => ({ geometry: x.geometry, totalRatio: x.ratioTotal, solveRatio: x.ratioSolve, sparseResidualBytes: x.qualification.sparseMemory.residual.totalTypedBytes, chunkedResidualBytes: x.qualification.chunkedMemory.residual.totalTypedBytes })),
  standard7x6: { sparseMs: sparseGrowth.elapsedMs, chunkedMs: chunkedGrowth.elapsedMs, sparseResidualBytes: sparseGrowth.memory.residual.totalTypedBytes, chunkedResidualBytes: chunkedGrowth.memory.residual.totalTypedBytes, sparseTotalBytes: sparseGrowth.memory.totalTypedBytes, chunkedTotalBytes: chunkedGrowth.memory.totalTypedBytes },
})}`);

console.log(JSON.stringify({
  kind: 'connect4-chunked-term-id-residual-pool-campaign-v1',
  status: 'complete',
  date: '2026-09-11',
  authority: 'residual-class storage/interner only; sparse transition and dominance semantics retained',
  qualification: 'complete bounded graph qID/classID/term-ID/edge identity plus independent BSFP root/action WDL; standard 7x6 growth identity through full rank-8 expansion',
  chunking: '10 slot-local exact dictionaries of two u32 words over the fixed 625-term ontology; dynamic u8/u16/u32 class chunk IDs',
  bounded,
  standard7x6: { sparse: sparseGrowth, chunked: chunkedGrowth },
}, null, 2));

sparseGrowth = null;
chunkedGrowth = null;
