import { availableParallelism } from 'node:os';
import { performance } from 'node:perf_hooks';
import { QN_ILLEGAL } from './quotient-negamax-domain-contract.mjs';
import {
  createDependencyAwareQuotientNegamaxEngine,
} from './quotient-negamax-engine.mjs';
import { createPackedProofStore } from './quotient-packed-proof-store.mjs';
import { createSearchWorkerExecutor } from './quotient-search-worker-executor.mjs';
import { estimateQuotientWork } from './quotient-lookahead-work-dag.mjs';
import { createSharedTtGraphSearcher } from './quotient-shared-tt-search-lib.mjs';
import {
  startMaintenanceHost,
  startSearchWorkers,
} from './quotient-shared-worker-pool.mjs';

const SPEC = Object.freeze({ columns: 4, rows: 5, connect: 4 });
const REPEATS = Number(process.env.REPEATS ?? 5);
const DEPTHS = (process.env.SPLIT_DEPTHS ?? '2,3,4')
  .split(',').map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value > 0);
const REQUESTED_WORKERS = (process.env.WORKER_COUNTS ?? '1,2,3,4')
  .split(',').map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value > 0);
const PREFIX_CLASSES = Number(process.env.PREFIX_CLASSES ?? 4096);
const PRIORITY_PROBE_DEPTH = Number(process.env.PRIORITY_PROBE_DEPTH ?? 2);
const EXPECTED_ACTIONS = Object.freeze([0, 0, 0, 0]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return (sorted.length & 1) === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function createGraphPort(shared, proofStore) {
  const { graph, spec } = shared;
  const edges = new Int32Array(graph.edgeBuffer);
  const tactical = new Int16Array(graph.tacticalBuffer);
  return Object.freeze({
    columns: spec.columns,
    cellCount: spec.columns * spec.rows,
    rootId: graph.rootId,
    centerOrder: graph.centerOrder,
    proofStore,
    isLegal: (stateId, column) => edges[stateId * spec.columns + column] !== QN_ILLEGAL,
    transition: (stateId, column) => edges[stateId * spec.columns + column],
    tacticalCode: (stateId) => tactical[stateId],
  });
}

function assertActions(actions, label) {
  assert(actions.length === EXPECTED_ACTIONS.length, `${label}: action length mismatch`);
  for (let column = 0; column < EXPECTED_ACTIONS.length; column += 1) {
    assert(actions[column] === EXPECTED_ACTIONS[column], `${label}: column ${column} expected 0, got ${actions[column]}`);
  }
}

const maintenance = await startMaintenanceHost(SPEC, PREFIX_CLASSES);
const shared = Object.freeze({
  spec: SPEC,
  graph: maintenance.published.graph,
  arena: maintenance.published.arena,
});
assert(shared.graph.stateCount === 294593, `q-state mismatch ${shared.graph.stateCount}`);
assert(shared.graph.residualClassCount === 69707, `residual-class mismatch ${shared.graph.residualClassCount}`);

const baselineRuns = [];
for (let repeat = 0; repeat < REPEATS; repeat += 1) {
  await maintenance.reset();
  const searcher = createSharedTtGraphSearcher(shared, { etc: true, workerSalt: 0 });
  const started = performance.now();
  const value = searcher.solveRoot();
  const elapsedMs = performance.now() - started;
  assert(value === 0, `baseline root expected draw, got ${value}`);
  baselineRuns.push(Object.freeze({
    elapsedMs,
    expanded: searcher.metrics.expanded,
    calls: searcher.metrics.calls,
  }));
}

const results = [];
for (const requestedWorkers of REQUESTED_WORKERS) {
  const workerCount = Math.max(1, Math.min(requestedWorkers, availableParallelism()));
  const workers = await startSearchWorkers(workerCount, shared);
  const executor = createSearchWorkerExecutor(workers);
  try {
    for (const splitDepth of DEPTHS) {
      const estimateMemo = new Map();
      const priorityAt = (stateId) => estimateQuotientWork(shared.graph, stateId, PRIORITY_PROBE_DEPTH, estimateMemo);

      await maintenance.reset();
      {
        const proofStore = createPackedProofStore(shared.arena.recordBuffer);
        const port = createGraphPort(shared, proofStore);
        const warmEngine = createDependencyAwareQuotientNegamaxEngine(
          port,
          (stateId, alpha, beta, priority) => executor.submit({
            type: 'search-state', stateId, alpha, beta,
          }, priority),
          { splitDepth, priorityAt },
        );
        const warmValue = await warmEngine.solveRoot();
        await executor.drain();
        assert(warmValue === 0, `warmup workers=${workerCount} depth=${splitDepth}: expected draw, got ${warmValue}`);
      }

      const runs = [];
      for (let repeat = 0; repeat < REPEATS; repeat += 1) {
        await maintenance.reset();
        const proofStore = createPackedProofStore(shared.arena.recordBuffer);
        const port = createGraphPort(shared, proofStore);
        const engine = createDependencyAwareQuotientNegamaxEngine(
          port,
          (stateId, alpha, beta, priority) => executor.submit({
            type: 'search-state', stateId, alpha, beta,
          }, priority),
          { splitDepth, priorityAt },
        );
        const started = performance.now();
        const value = await engine.solveRoot();
        await executor.drain();
        const elapsedMs = performance.now() - started;
        assert(value === 0, `workers=${workerCount} depth=${splitDepth}: expected draw, got ${value}`);
        const executorStats = executor.stats();
        assert(executorStats.active === 0 && executorStats.queued === 0 && executorStats.pending === 0, 'executor retained work after solve');
        runs.push(Object.freeze({
          elapsedMs,
          shallowExpanded: engine.metrics.shallowExpanded,
          workerExpanded: engine.metrics.workerExpanded,
          totalExpanded: engine.metrics.shallowExpanded + engine.metrics.workerExpanded,
          workerCalls: engine.metrics.workerCalls,
          leafTasks: engine.metrics.leafTasks,
          scoutTasks: engine.metrics.scoutTasks,
          reSearches: engine.metrics.reSearches,
          parallelBatches: engine.metrics.parallelBatches,
        }));
      }

      await maintenance.reset();
      const proofStore = createPackedProofStore(shared.arena.recordBuffer);
      const port = createGraphPort(shared, proofStore);
      const actionEngine = createDependencyAwareQuotientNegamaxEngine(
        port,
        (stateId, alpha, beta, priority) => executor.submit({
          type: 'search-state', stateId, alpha, beta,
        }, priority),
        { splitDepth, priorityAt },
      );
      const actions = await actionEngine.rootActionValues();
      await executor.drain();
      assertActions(actions, `workers=${workerCount} depth=${splitDepth}`);

      results.push(Object.freeze({
        requestedWorkers,
        workers: workerCount,
        splitDepth,
        elapsedMsMedian: median(runs.map((run) => run.elapsedMs)),
        totalExpandedMedian: median(runs.map((run) => run.totalExpanded)),
        workerExpandedMedian: median(runs.map((run) => run.workerExpanded)),
        shallowExpandedMedian: median(runs.map((run) => run.shallowExpanded)),
        leafTasksMedian: median(runs.map((run) => run.leafTasks)),
        scoutTasksMedian: median(runs.map((run) => run.scoutTasks)),
        reSearchesMedian: median(runs.map((run) => run.reSearches)),
        parallelBatchesMedian: median(runs.map((run) => run.parallelBatches)),
        actions,
        runs,
      }));
    }
  } finally {
    await executor.drain();
    executor.close();
    await Promise.all(workers.map((worker) => worker.terminate()));
  }
}

await maintenance.cleanup();
await maintenance.worker.terminate();

const baseline = Object.freeze({
  elapsedMsMedian: median(baselineRuns.map((run) => run.elapsedMs)),
  expandedMedian: median(baselineRuns.map((run) => run.expanded)),
  callsMedian: median(baselineRuns.map((run) => run.calls)),
  runs: baselineRuns,
});
const ranked = [...results].sort((a, b) => a.elapsedMsMedian - b.elapsedMsMedian);
const summary = Object.freeze({
  kind: 'connect4-dependency-aware-parallel-negamax-v1',
  status: 'complete',
  spec: SPEC,
  repeats: REPEATS,
  availableParallelism: availableParallelism(),
  priorityProbeDepth: PRIORITY_PROBE_DEPTH,
  baseline,
  results,
  best: ranked[0] ?? null,
});

console.error(`DEPENDENCY_PARALLEL_SUMMARY=${JSON.stringify(summary)}`);
console.log(JSON.stringify(summary, null, 2));
