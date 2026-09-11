import { performance } from 'node:perf_hooks';
import {
  createResidualWinspaceProfile,
  normalizeResidualRequirements,
} from '../../../../components/bsfp/residual-winspace.mjs';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import {
  createQuotientNativeNegamaxKernel,
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
} from './quotient-native-negamax-kernel.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3, expectedRelationalStates: 3735 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4, expectedRelationalStates: 34095 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4, expectedRelationalStates: 11317 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4, expectedRelationalStates: 294593 }),
]);

const PRIOR_PRECOMPILED_EXPANDED = Object.freeze({
  '4x3:c3': Object.freeze({ noEtc: 39, etc: 37 }),
  '4x4:c4': Object.freeze({ noEtc: 4291, etc: 2912 }),
  '5x3:c4': Object.freeze({ noEtc: 971, etc: 800 }),
  '4x5:c4': Object.freeze({ noEtc: 15096, etc: 10562 }),
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function pairToBigInt(lo, hi) {
  return BigInt(lo >>> 0) | (BigInt(hi >>> 0) << 32n);
}

function classBigInts(kernel, classId) {
  return kernel.classTerms(classId).map(([lo, hi]) => pairToBigInt(lo, hi));
}

function requirementsKey(requirements) {
  return normalizeResidualRequirements(requirements).map((mask) => mask.toString(16)).join('.');
}

function classKey(kernel, classId) {
  return classBigInts(kernel, classId).map((mask) => mask.toString(16)).join('.');
}

function qualifyCompiledClassTransitions(kernel) {
  const residual = createResidualWinspaceProfile(kernel);
  const classes = kernel.classes;
  const classCountAtStart = classes.size;
  let ownChecked = 0;
  let blockChecked = 0;
  let terminalChecked = 0;

  for (let classId = 0; classId < classCountAtStart; classId += 1) {
    const source = classBigInts(kernel, classId);
    for (let cell = 0; cell < kernel.cellCount; cell += 1) {
      const cacheIndex = classId * kernel.cellCount + cell;
      const ownActual = classes.ownTransitions[cacheIndex];
      const blockActual = classes.blockTransitions[cacheIndex];
      const bit = 1n << BigInt(cell);

      if (ownActual !== -3) {
        const ownExpected = [];
        let terminal = false;
        for (const requirement of source) {
          const reduced = requirement & ~bit;
          if (reduced === 0n) {
            terminal = true;
            break;
          }
          ownExpected.push(reduced);
        }
        if (terminal) {
          assert(ownActual === -1, `own transition terminal mismatch class=${classId} cell=${cell}`);
          terminalChecked += 1;
        } else {
          assert(ownActual >= 0, `own transition unexpectedly terminal class=${classId} cell=${cell}`);
          assert(
            classKey(kernel, ownActual) === requirementsKey(ownExpected),
            `own transition class mismatch class=${classId} cell=${cell}`,
          );
        }
        ownChecked += 1;
      }

      if (blockActual !== -3) {
        const blockExpected = source.filter((requirement) => (requirement & bit) === 0n);
        assert(blockActual >= 0, `block transition invalid class=${classId} cell=${cell}`);
        assert(
          classKey(kernel, blockActual) === requirementsKey(blockExpected),
          `block transition class mismatch class=${classId} cell=${cell}`,
        );
        blockChecked += 1;
      }
    }
  }

  return Object.freeze({
    classCountAtStart,
    ownChecked,
    blockChecked,
    terminalChecked,
    mismatches: 0,
    reference: residual.kind,
  });
}

function exhaustRelationalGraph(kernel) {
  let nonterminalEdges = 0;
  let terminalEdges = 0;
  let illegalEdges = 0;
  for (let stateId = 0; stateId < kernel.states.count; stateId += 1) {
    for (let column = 0; column < kernel.columns; column += 1) {
      const target = kernel.advance(stateId, column);
      if (target === QN_ILLEGAL) illegalEdges += 1;
      else if (target === QN_TERMINAL_WIN) terminalEdges += 1;
      else nonterminalEdges += 1;
    }
  }
  return Object.freeze({
    relationalStates: kernel.states.count,
    nonterminalEdges,
    terminalEdges,
    illegalEdges,
  });
}

function expectedRootActions(spec, oracle) {
  const result = Array(spec.columns).fill(null);
  for (let column = 0; column < spec.columns; column += 1) {
    const heights = Array(spec.columns).fill(0);
    heights[column] = 1;
    const landingCell = column;
    const p0OwnershipMask = 1n << BigInt(landingCell);
    result[column] = oracle.evaluate({ heights, p0OwnershipMask });
  }
  return result;
}

function qualifyCase(spec) {
  const started = performance.now();
  const kernel = createQuotientNativeNegamaxKernel(spec, { cacheEdges: true });
  const census = exhaustRelationalGraph(kernel);
  assert(
    census.relationalStates === spec.expectedRelationalStates,
    `relational census mismatch ${spec.columns}x${spec.rows}: expected ${spec.expectedRelationalStates}, got ${census.relationalStates}`,
  );

  const transitionQualification = qualifyCompiledClassTransitions(kernel);
  const oracleStarted = performance.now();
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const oracleMs = performance.now() - oracleStarted;

  const solveKernel = createQuotientNativeNegamaxKernel(spec, { cacheEdges: true });
  const solver = solveKernel.createWdlSolver({ etc: true, etcMinRemaining: 0, wdlMode: 'full' });
  const rootWdl = solver.run();
  assert(rootWdl === oracle.rootWdl, `root WDL mismatch: expected ${oracle.rootWdl}, got ${rootWdl}`);
  const rootActions = solver.rootActionValues();
  const expectedActions = expectedRootActions(spec, oracle);
  for (let column = 0; column < spec.columns; column += 1) {
    assert(
      rootActions[column] === expectedActions[column],
      `root action WDL mismatch ${spec.columns}x${spec.rows}:c${spec.connect} column=${column}: expected ${expectedActions[column]}, got ${rootActions[column]}`,
    );
  }

  return Object.freeze({
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    status: 'pass',
    census,
    transitionQualification,
    oracle: Object.freeze({
      rootWdl: oracle.rootWdl,
      rootActions: expectedActions,
      boundaryRecords: oracle.stats.totalBoundaryRecords,
      elapsedMs: oracleMs,
    }),
    quotientSolve: Object.freeze({
      rootWdl,
      rootActions,
      metrics: solver.metrics,
      memory: solveKernel.memoryStats(),
    }),
    elapsedMs: performance.now() - started,
  });
}

function benchmarkOnce(spec, config) {
  const totalStarted = performance.now();
  const kernelStarted = performance.now();
  const kernel = createQuotientNativeNegamaxKernel(spec, { cacheEdges: true });
  const setupMs = performance.now() - kernelStarted;
  const solver = kernel.createWdlSolver(config);
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  const totalMs = performance.now() - totalStarted;
  return Object.freeze({
    result,
    setupMs,
    solveMs,
    totalMs,
    metrics: Object.freeze({ ...solver.metrics }),
    kernel: Object.freeze({
      states: kernel.states.count,
      classes: kernel.classes.size,
      stateIntern: Object.freeze({ ...kernel.states.metrics }),
      classIntern: Object.freeze({ ...kernel.classes.metrics }),
      transitions: Object.freeze({ ...kernel.transitionMetrics }),
      memory: kernel.memoryStats(),
    }),
  });
}

function benchmarkCandidate(spec, expectedWdl, name, config, repeats = 3) {
  const runs = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    const run = benchmarkOnce(spec, config);
    assert(run.result === expectedWdl, `${name} returned ${run.result}, expected ${expectedWdl}`);
    runs.push(run);
  }
  const medianRun = [...runs].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(runs.length / 2)];
  return Object.freeze({
    name,
    config: Object.freeze({ ...config }),
    result: medianRun.result,
    setupMsMedian: median(runs.map((run) => run.setupMs)),
    solveMsMedian: median(runs.map((run) => run.solveMs)),
    totalMsMedian: median(runs.map((run) => run.totalMs)),
    representative: medianRun,
  });
}

function benchmarkCase(spec, expectedWdl) {
  const geometry = `${spec.columns}x${spec.rows}:c${spec.connect}`;
  const base = Object.freeze({ wdlMode: 'full', etc: false, etcMinRemaining: 0 });
  const candidates = [
    benchmarkCandidate(spec, expectedWdl, 'Q0-wdl-full-no-etc', base),
    benchmarkCandidate(spec, expectedWdl, 'Q1-wdl-full-etc-all', { ...base, etc: true }),
    benchmarkCandidate(spec, expectedWdl, 'Q2-wdl-full-etc-interior3', { ...base, etc: true, etcMinRemaining: 3 }),
    benchmarkCandidate(spec, expectedWdl, 'Q3-wdl-threshold-etc-all', { ...base, wdlMode: 'threshold', etc: true }),
  ];
  const prior = PRIOR_PRECOMPILED_EXPANDED[geometry] ?? null;
  const best = [...candidates].sort((a, b) => a.totalMsMedian - b.totalMsMedian)[0];
  console.error(
    `[quotient-native] ${geometry}`
    + ` result=${expectedWdl}`
    + ` best=${best.name}`
    + ` totalMs=${best.totalMsMedian.toFixed(3)}`
    + ` expanded=${best.representative.metrics.expanded}`
    + ` qStates=${best.representative.kernel.states}`
    + ` classes=${best.representative.kernel.classes}`,
  );
  return Object.freeze({ geometry, expectedWdl, priorPrecompiledExpanded: prior, candidates, best: best.name });
}

const qualification = [];
const benchmarks = [];
for (const spec of CASES) {
  const qualified = qualifyCase(spec);
  qualification.push(qualified);
  benchmarks.push(benchmarkCase(spec, qualified.oracle.rootWdl));
}

const compactSummary = benchmarks.map((entry) => ({
  geometry: entry.geometry,
  expectedWdl: entry.expectedWdl,
  best: entry.best,
  candidates: Object.fromEntries(entry.candidates.map((candidate) => [candidate.name, {
    totalMsMedian: candidate.totalMsMedian,
    solveMsMedian: candidate.solveMsMedian,
    expanded: candidate.representative.metrics.expanded,
    calls: candidate.representative.metrics.calls,
    etcCutoffs: candidate.representative.metrics.etcCutoffs,
    states: candidate.representative.kernel.states,
    classes: candidate.representative.kernel.classes,
    typedBytes: candidate.representative.kernel.memory.totalTypedBytes,
  }])),
}));

console.error(`QUOTIENT_NATIVE_NEGAMAX_SUMMARY=${JSON.stringify(compactSummary)}`);
console.log(JSON.stringify({
  kind: 'connect4-quotient-native-negamax-campaign-v1',
  status: 'complete',
  date: '2026-09-11',
  scope: {
    recursivePhysicalBoardState: false,
    recursiveResidualObjects: false,
    hotState: 'dense qID -> supportIndex + P0 residual class ID + P1 residual class ID',
    sideToMoveStorage: 'derived from support rank parity',
    residualMaskStorage: 'two u32 lanes; no BigInt in timed kernel',
    quotientTransition: 'lazy compiled class transitions + exact q interning + cached q edges',
    tacticalClosure: 'quotient-native singleton residual classification',
    tt: 'dense exact WDL bounds indexed directly by qID',
    correctnessOracle: 'qualified BigInt residual algebra plus independent BSFP WDL root/action oracle',
    timingIncludes: ['kernel setup', 'lazy quotient transition compilation', 'q interning', 'search'],
    timingExcludes: ['qualification reference checks', 'BSFP oracle construction'],
  },
  qualification,
  benchmarks,
}, null, 2));
