import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import {
  createQuotientNativeNegamaxKernel,
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
} from './quotient-native-negamax-kernel.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4 }),
]);

const EDGE_UNKNOWN = -3;
const TACTICAL_NONE = -100;
const TACTICAL_DRAW = -101;
const TACTICAL_LOSS = -102;
const TACTICAL_IMMEDIATE_BASE = 64;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function createMaterializedEtcWdlSolver(kernel, config = {}) {
  const { columns, cellCount, states, support, centerOrder, landingCells } = kernel;
  const etcMinRemaining = config.etcMinRemaining ?? 0;
  const wdlMode = config.wdlMode ?? 'full';
  const moveStack = new Int8Array((cellCount + 1) * columns);
  const metrics = {
    calls: 0,
    expanded: 0,
    ttExactReturns: 0,
    ttBoundReturns: 0,
    ttMoveOrderHits: 0,
    cutoffs: 0,
    firstMoveCutoffs: 0,
    tacticalExact: 0,
    forcedNodes: 0,
    etcCachedEdgeCandidates: 0,
    etcUnknownEdgesSkipped: 0,
    etcProbes: 0,
    etcCutoffs: 0,
    thresholdPasses: 0,
    transitionsRequested: 0,
  };

  function transition(stateId, column) {
    metrics.transitionsRequested += 1;
    return kernel.advance(stateId, column);
  }

  function prepareMoves(stateId, forcedColumn) {
    const supportIndex = states.support[stateId];
    const rank = support.ranks[supportIndex];
    const base = rank * columns;
    let count = 0;
    if (forcedColumn >= 0) {
      moveStack[base] = forcedColumn;
      metrics.forcedNodes += 1;
      return 1;
    }
    const best = states.bestMove[stateId];
    if (best >= 0 && landingCells[supportIndex * columns + best] !== 0xff) {
      moveStack[base + count] = best;
      count += 1;
      metrics.ttMoveOrderHits += 1;
    }
    for (const column of centerOrder) {
      if (column === best) continue;
      if (landingCells[supportIndex * columns + column] === 0xff) continue;
      moveStack[base + count] = column;
      count += 1;
    }
    return count;
  }

  function search(stateId, alpha, beta) {
    metrics.calls += 1;
    const lower = states.lower[stateId];
    const upper = states.upper[stateId];
    if (lower === upper) {
      metrics.ttExactReturns += 1;
      return lower;
    }
    if (lower >= beta) {
      metrics.ttBoundReturns += 1;
      return lower;
    }
    if (upper <= alpha) {
      metrics.ttBoundReturns += 1;
      return upper;
    }

    const tactical = kernel.tacticalCode(stateId);
    if (tactical >= TACTICAL_IMMEDIATE_BASE) {
      states.lower[stateId] = 1;
      states.upper[stateId] = 1;
      states.bestMove[stateId] = tactical - TACTICAL_IMMEDIATE_BASE;
      metrics.tacticalExact += 1;
      return 1;
    }
    if (tactical === TACTICAL_LOSS) {
      states.lower[stateId] = -1;
      states.upper[stateId] = -1;
      metrics.tacticalExact += 1;
      return -1;
    }
    if (tactical === TACTICAL_DRAW) {
      states.lower[stateId] = 0;
      states.upper[stateId] = 0;
      metrics.tacticalExact += 1;
      return 0;
    }
    assert(tactical === TACTICAL_NONE || (tactical >= 0 && tactical < columns), 'unexpected tactical code');

    const originalAlpha = alpha;
    const originalBeta = beta;
    alpha = Math.max(alpha, lower);
    beta = Math.min(beta, upper);

    const forcedColumn = tactical >= 0 ? tactical : -1;
    const moveCount = prepareMoves(stateId, forcedColumn);
    const supportIndex = states.support[stateId];
    const rank = support.ranks[supportIndex];
    const base = rank * columns;
    const remaining = cellCount - rank;

    if (remaining >= etcMinRemaining) {
      for (let index = 0; index < moveCount; index += 1) {
        const column = moveStack[base + index];
        const child = states.edgeAt(stateId, column);
        if (child === EDGE_UNKNOWN) {
          metrics.etcUnknownEdgesSkipped += 1;
          continue;
        }
        metrics.etcCachedEdgeCandidates += 1;
        if (child === QN_TERMINAL_WIN) {
          states.lower[stateId] = 1;
          states.upper[stateId] = 1;
          states.bestMove[stateId] = column;
          metrics.etcCutoffs += 1;
          return 1;
        }
        if (child < 0) continue;
        metrics.etcProbes += 1;
        const parentLower = -states.upper[child];
        if (parentLower >= beta) {
          states.lower[stateId] = Math.max(states.lower[stateId], parentLower);
          states.bestMove[stateId] = column;
          metrics.etcCutoffs += 1;
          return parentLower;
        }
      }
    }

    metrics.expanded += 1;
    let value = -2;
    let selected = -1;
    for (let index = 0; index < moveCount; index += 1) {
      const column = moveStack[base + index];
      const child = transition(stateId, column);
      assert(child !== QN_ILLEGAL, 'prepared legal quotient action became illegal');
      const score = child === QN_TERMINAL_WIN ? 1 : -search(child, -beta, -alpha);
      if (score > value) {
        value = score;
        selected = column;
      }
      if (value > alpha) alpha = value;
      if (alpha >= beta) {
        metrics.cutoffs += 1;
        if (index === 0) metrics.firstMoveCutoffs += 1;
        break;
      }
    }

    if (selected >= 0) states.bestMove[stateId] = selected;
    if (value <= originalAlpha) states.upper[stateId] = Math.min(states.upper[stateId], value);
    else if (value >= originalBeta) states.lower[stateId] = Math.max(states.lower[stateId], value);
    else {
      states.lower[stateId] = value;
      states.upper[stateId] = value;
    }
    return value;
  }

  function run() {
    if (wdlMode === 'threshold') {
      let value = search(kernel.rootId, 0, 1);
      metrics.thresholdPasses += 1;
      if (value >= 1) return 1;
      value = search(kernel.rootId, -1, 0);
      metrics.thresholdPasses += 1;
      return value >= 0 ? 0 : -1;
    }
    return search(kernel.rootId, -2, 2);
  }

  return Object.freeze({ run, metrics });
}

function runOnce(spec, candidate) {
  const started = performance.now();
  const kernel = createQuotientNativeNegamaxKernel(spec, { cacheEdges: candidate.cacheEdges });
  const setupMs = performance.now() - started;
  const solver = candidate.mode === 'materialized-etc'
    ? createMaterializedEtcWdlSolver(kernel, candidate.config)
    : kernel.createWdlSolver(candidate.config);
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  return Object.freeze({
    result,
    setupMs,
    solveMs,
    totalMs: performance.now() - started,
    metrics: Object.freeze({ ...solver.metrics }),
    kernel: Object.freeze({
      states: kernel.states.count,
      classes: kernel.classes.size,
      transitions: Object.freeze({ ...kernel.transitionMetrics }),
      stateIntern: Object.freeze({ ...kernel.states.metrics }),
      classIntern: Object.freeze({ ...kernel.classes.metrics }),
      memory: kernel.memoryStats(),
    }),
  });
}

function benchmarkCandidate(spec, expected, candidate, repeats = 5) {
  const runs = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    const run = runOnce(spec, candidate);
    assert(run.result === expected, `${candidate.name}: expected ${expected}, got ${run.result}`);
    runs.push(run);
  }
  const representative = [...runs].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(runs.length / 2)];
  return Object.freeze({
    name: candidate.name,
    mode: candidate.mode,
    cacheEdges: candidate.cacheEdges,
    config: Object.freeze({ ...candidate.config }),
    totalMsMedian: median(runs.map((run) => run.totalMs)),
    solveMsMedian: median(runs.map((run) => run.solveMs)),
    setupMsMedian: median(runs.map((run) => run.setupMs)),
    representative,
  });
}

const CANDIDATES = Object.freeze([
  Object.freeze({
    name: 'R0-edge-cache-no-etc',
    mode: 'builtin',
    cacheEdges: true,
    config: Object.freeze({ wdlMode: 'full', etc: false, etcMinRemaining: 0 }),
  }),
  Object.freeze({
    name: 'R1-no-edge-cache-no-etc',
    mode: 'builtin',
    cacheEdges: false,
    config: Object.freeze({ wdlMode: 'full', etc: false, etcMinRemaining: 0 }),
  }),
  Object.freeze({
    name: 'R2-forcing-etc-all',
    mode: 'builtin',
    cacheEdges: true,
    config: Object.freeze({ wdlMode: 'full', etc: true, etcMinRemaining: 0 }),
  }),
  Object.freeze({
    name: 'R3-materialized-etc-all',
    mode: 'materialized-etc',
    cacheEdges: true,
    config: Object.freeze({ wdlMode: 'full', etcMinRemaining: 0 }),
  }),
  Object.freeze({
    name: 'R4-materialized-etc-interior3',
    mode: 'materialized-etc',
    cacheEdges: true,
    config: Object.freeze({ wdlMode: 'full', etcMinRemaining: 3 }),
  }),
  Object.freeze({
    name: 'R5-materialized-threshold-etc',
    mode: 'materialized-etc',
    cacheEdges: true,
    config: Object.freeze({ wdlMode: 'threshold', etcMinRemaining: 0 }),
  }),
]);

const cases = [];
for (const spec of CASES) {
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const candidates = CANDIDATES.map((candidate) => benchmarkCandidate(spec, oracle.rootWdl, candidate));
  const best = [...candidates].sort((a, b) => a.totalMsMedian - b.totalMsMedian)[0];
  const geometry = `${spec.columns}x${spec.rows}:c${spec.connect}`;
  console.error(
    `[quotient-native-refine] ${geometry}`
    + ` best=${best.name}`
    + ` totalMs=${best.totalMsMedian.toFixed(3)}`
    + ` expanded=${best.representative.metrics.expanded}`
    + ` states=${best.representative.kernel.states}`
    + ` classes=${best.representative.kernel.classes}`,
  );
  cases.push(Object.freeze({ geometry, expectedWdl: oracle.rootWdl, best: best.name, candidates }));
}

const compact = cases.map((entry) => ({
  geometry: entry.geometry,
  best: entry.best,
  candidates: Object.fromEntries(entry.candidates.map((candidate) => [candidate.name, {
    totalMsMedian: candidate.totalMsMedian,
    solveMsMedian: candidate.solveMsMedian,
    expanded: candidate.representative.metrics.expanded,
    etcCutoffs: candidate.representative.metrics.etcCutoffs ?? 0,
    etcProbes: candidate.representative.metrics.etcProbes ?? 0,
    unknownEdgesSkipped: candidate.representative.metrics.etcUnknownEdgesSkipped ?? 0,
    states: candidate.representative.kernel.states,
    classes: candidate.representative.kernel.classes,
    typedBytes: candidate.representative.kernel.memory.totalTypedBytes,
  }])),
}));

console.error(`QUOTIENT_NATIVE_REFINEMENT_SUMMARY=${JSON.stringify(compact)}`);
console.log(JSON.stringify({
  kind: 'connect4-quotient-native-negamax-refinement-v1',
  status: 'complete',
  date: '2026-09-11',
  question: 'Can ETC retain value when it is forbidden from constructing speculative quotient children, and does edge caching earn its memory without ETC?',
  materializedEtcContract: 'ETC may probe only an already-cached quotient edge; unknown edges are skipped rather than materialized for the probe.',
  cases,
}, null, 2));
