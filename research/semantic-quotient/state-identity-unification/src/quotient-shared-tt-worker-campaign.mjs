import { availableParallelism } from 'node:os';
import { performance } from 'node:perf_hooks';
import { createSharedTtGraphSearcher } from './quotient-shared-tt-search-lib.mjs';
import {
  startBranchManager,
  startSearchWorkers,
  runRootColumns,
} from './quotient-shared-worker-pool.mjs';

const SPEC = Object.freeze({ columns: 4, rows: 5, connect: 4 });
const REPEATS = Number(process.env.REPEATS ?? 7);
const PREFIX_CLASSES = Number(process.env.PREFIX_CLASSES ?? 4096);
const REQUESTED = (process.env.WORKER_COUNTS ?? '1,2,4')
  .split(',')
  .map((value) => Number(value.trim()))
  .filter((value) => Number.isInteger(value) && value > 0);
const EXPECTED_ACTIONS = Object.freeze([0, 0, 0, 0]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function assertResult(run, label) {
  assert(run.rootWdl === 0, `${label}: expected root draw, got ${run.rootWdl}`);
  for (let column = 0; column < EXPECTED_ACTIONS.length; column += 1) {
    assert(run.actions[column] === EXPECTED_ACTIONS[column], `${label}: column ${column} expected 0, got ${run.actions[column]}`);
  }
}

function runSequential(shared) {
  const searcher = createSharedTtGraphSearcher(shared, { workerSalt: 0 });
  const actions = Array(SPEC.columns).fill(null);
  const started = performance.now();
  for (const column of shared.graph.centerOrder) actions[column] = searcher.solveRootColumn(column);
  return Object.freeze({
    solveMs: performance.now() - started,
    actions,
    rootWdl: Math.max(...actions),
    metrics: Object.freeze({ ...searcher.metrics }),
  });
}

const branchManager = await startBranchManager(SPEC, PREFIX_CLASSES);
const shared = Object.freeze({ spec: SPEC, graph: branchManager.published.graph, arena: branchManager.published.arena });
assert(shared.graph.stateCount === 294593, `canonical q-state mismatch: ${shared.graph.stateCount}`);
assert(shared.graph.residualClassCount === 69707, `residual-class mismatch: ${shared.graph.residualClassCount}`);

const sequentialRuns = [];
for (let repeat = 0; repeat < REPEATS; repeat += 1) {
  await branchManager.reset();
  const run = runSequential(shared);
  assertResult(run, 'sequential');
  sequentialRuns.push(run);
}

const workerResults = [];
for (const requested of REQUESTED) {
  const count = Math.max(1, Math.min(requested, SPEC.columns, availableParallelism()));
  const workers = await startSearchWorkers(count, shared);
  try {
    await branchManager.reset();
    const warmup = await runRootColumns(workers, shared.graph.centerOrder);
    assertResult(warmup, `${count}-worker warmup`);

    const runs = [];
    for (let repeat = 0; repeat < REPEATS; repeat += 1) {
      await branchManager.reset();
      const run = await runRootColumns(workers, shared.graph.centerOrder);
      assertResult(run, `${count}-worker`);
      runs.push(run);
      await branchManager.cleanup();
    }
    workerResults.push(Object.freeze({
      requested,
      workers: count,
      solveMsMedian: median(runs.map((run) => run.solveMs)),
      expandedMedian: median(runs.map((run) => run.metrics.expanded ?? 0)),
      callsMedian: median(runs.map((run) => run.metrics.calls ?? 0)),
      ttExactMedian: median(runs.map((run) => run.metrics.ttExactReturns ?? 0)),
      ttBoundMedian: median(runs.map((run) => run.metrics.ttBoundReturns ?? 0)),
    }));
  } finally {
    await Promise.all(workers.map((worker) => worker.terminate()));
  }
}

await branchManager.cleanup();
await branchManager.worker.terminate();

const summary = Object.freeze({
  kind: 'connect4-shared-proof-workers-v2',
  status: 'complete',
  spec: SPEC,
  repeats: REPEATS,
  availableParallelism: availableParallelism(),
  ownership: Object.freeze({
    branchManager: 'work-plan-and-proof-resource-services',
    recursiveSearch: 'search-workers',
    proofPublication: 'shared-proof-store',
    hotLoopBranchManagerRpc: false,
    sharedProofBytesPerState: 1,
  }),
  graph: Object.freeze({
    stateCount: shared.graph.stateCount,
    residualClassCount: shared.graph.residualClassCount,
    edgeCount: shared.graph.edgeCount,
    buildMs: branchManager.published.stats.buildMs,
  }),
  sequential: Object.freeze({
    solveMsMedian: median(sequentialRuns.map((run) => run.solveMs)),
    expandedMedian: median(sequentialRuns.map((run) => run.metrics.expanded ?? 0)),
    callsMedian: median(sequentialRuns.map((run) => run.metrics.calls ?? 0)),
  }),
  workers: workerResults,
});

console.error(`SHARED_PROOF_WORKER_SUMMARY=${JSON.stringify(summary)}`);
console.log(JSON.stringify(summary, null, 2));
