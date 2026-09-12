import { availableParallelism } from 'node:os';
import { performance } from 'node:perf_hooks';
import { createQuotientNegamaxEngine } from './quotient-negamax-engine.mjs';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createOnlineDependencyCoordinator } from './quotient-online-dependency-coordinator.mjs';
import { createOnlineSemanticQuotientPort } from './quotient-online-semantic-search-lib.mjs';
import {
  startOnlineBranchManager,
  startOnlineSearchWorkers,
} from './quotient-online-semantic-worker-pool.mjs';
import { createSearchWorkerExecutor } from './quotient-search-worker-executor.mjs';

const SPEC = Object.freeze({ columns: 4, rows: 5, connect: 4 });
const REPEATS = Number(process.env.REPEATS ?? 5);
const PREFIX_CLASSES = Number(process.env.PREFIX_CLASSES ?? 4096);
const PRIORITY_PROBE_DEPTH = Number(process.env.PRIORITY_PROBE_DEPTH ?? 0);
const EXPECTED_ACTIONS = Object.freeze([0, 0, 0, 0]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function parsePositiveIntegerList(raw, label) {
  const parts = raw.split(',').map((value) => value.trim());
  if (parts.length === 0 || parts.some((value) => value.length === 0)) throw new Error(`${label} contains an empty entry`);
  const values = parts.map(Number);
  if (values.some((value) => !Number.isSafeInteger(value) || value < 1)) {
    throw new Error(`${label} must contain only positive safe integers`);
  }
  return Object.freeze(values);
}

const DEPTHS = parsePositiveIntegerList(process.env.SPLIT_DEPTHS ?? '2,3,4', 'SPLIT_DEPTHS');
const REQUESTED_WORKERS = parsePositiveIntegerList(process.env.WORKER_COUNTS ?? '1,2,3,4', 'WORKER_COUNTS');
assert(Number.isSafeInteger(REPEATS) && REPEATS >= 1, 'REPEATS must be positive');
assert(Number.isSafeInteger(PREFIX_CLASSES) && PREFIX_CLASSES >= 1, 'PREFIX_CLASSES must be positive');
assert(Number.isSafeInteger(PRIORITY_PROBE_DEPTH) && PRIORITY_PROBE_DEPTH >= 0 && PRIORITY_PROBE_DEPTH <= SPEC.columns * SPEC.rows, 'PRIORITY_PROBE_DEPTH out of range');
assert(DEPTHS.every((depth) => depth <= SPEC.columns * SPEC.rows), 'SPLIT_DEPTHS exceeds board cell count');

function median(values) {
  assert(Array.isArray(values) && values.length > 0, 'median requires values');
  assert(values.every(Number.isFinite), 'median requires finite values');
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return (sorted.length & 1) === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function createLocalKernel() {
  return createSlot64ResidualQuotientKernel(SPEC, {
    cacheEdges: false,
    prefixClasses: PREFIX_CLASSES,
  }).kernel;
}

function createCoordinator(kernel, semanticArena, executor, splitDepth) {
  return createOnlineDependencyCoordinator(kernel, semanticArena, executor, {
    splitDepth,
    priorityProbeDepth: PRIORITY_PROBE_DEPTH,
  });
}

function assertActions(actions, label) {
  assert(Array.isArray(actions) && actions.length === EXPECTED_ACTIONS.length, `${label}: action length mismatch`);
  for (let column = 0; column < EXPECTED_ACTIONS.length; column += 1) {
    assert(actions[column] === EXPECTED_ACTIONS[column], `${label}: column ${column} expected 0, got ${actions[column]}`);
  }
}

const branchManager = await startOnlineBranchManager(SPEC, {
  prebuildGraph: false,
  prefixClasses: PREFIX_CLASSES,
  entryCapacity: 1 << 19,
  termCapacity: 1 << 24,
});
const semanticArena = branchManager.published.semanticArena;

const baselineKernel = createLocalKernel();
const baselineSemantic = createOnlineSemanticQuotientPort(baselineKernel, semanticArena);
const baselineEngine = createQuotientNegamaxEngine(baselineSemantic.port, { etc: false });
const baselineRuns = [];
for (let repeat = 0; repeat < REPEATS; repeat += 1) {
  await branchManager.reset();
  const started = performance.now();
  const value = baselineEngine.search(baselineKernel.rootId, -2, 2);
  const elapsedMs = performance.now() - started;
  assert(value === 0, `baseline root expected draw, got ${value}`);
  baselineRuns.push(Object.freeze({
    elapsedMs,
    expanded: baselineEngine.metrics.expanded,
    calls: baselineEngine.metrics.calls,
    forcedMacroTransitions: baselineEngine.metrics.forcedMacroTransitions,
    proofAdmissions: baselineEngine.metrics.proofAdmissions,
  }));
  for (const key of Object.keys(baselineEngine.metrics)) baselineEngine.metrics[key] = 0;
}

const results = [];
for (const requestedWorkers of REQUESTED_WORKERS) {
  const workerCount = Math.max(1, Math.min(requestedWorkers, availableParallelism()));
  const workers = await startOnlineSearchWorkers(workerCount, SPEC, semanticArena, {
    prefixClasses: PREFIX_CLASSES,
    etc: false,
  });
  const executor = createSearchWorkerExecutor(workers);
  const coordinatorKernel = createLocalKernel();
  try {
    for (const splitDepth of DEPTHS) {
      await branchManager.reset();
      {
        const warm = createCoordinator(coordinatorKernel, semanticArena, executor, splitDepth);
        const value = await warm.engine.solveRoot();
        await warm.engine.drainBackground();
        await executor.drain();
        assert(value === 0, `warmup workers=${workerCount} depth=${splitDepth}: expected draw, got ${value}`);
      }

      const runs = [];
      for (let repeat = 0; repeat < REPEATS; repeat += 1) {
        await branchManager.reset();
        const coordinator = createCoordinator(coordinatorKernel, semanticArena, executor, splitDepth);
        const started = performance.now();
        const value = await coordinator.engine.solveRoot();
        const rootResolvedMs = performance.now() - started;
        await coordinator.engine.drainBackground();
        await executor.drain();
        const elapsedMs = performance.now() - started;
        assert(value === 0, `workers=${workerCount} depth=${splitDepth}: expected draw, got ${value}`);
        const executorStats = executor.stats();
        const coordinatorStats = coordinator.stats();
        assert(executorStats.active === 0 && executorStats.queued === 0 && executorStats.pending === 0, 'executor retained work after solve');
        assert(executorStats.poisoned === false, 'executor became poisoned during successful solve');
        assert(coordinatorStats.representativePaths === coordinator.metrics.pathsStored, 'coordinator path diagnostics drifted');
        assert(coordinatorStats.priorityMemoEntries >= 0, 'coordinator priority memo diagnostics drifted');
        runs.push(Object.freeze({
          rootResolvedMs,
          elapsedMs,
          shallowExpanded: coordinator.engine.metrics.shallowExpanded,
          workerExpanded: coordinator.engine.metrics.workerExpanded,
          totalExpanded: coordinator.engine.metrics.shallowExpanded + coordinator.engine.metrics.workerExpanded,
          leafTasks: coordinator.engine.metrics.leafTasks,
          scoutTasks: coordinator.engine.metrics.scoutTasks,
          incrementalScoutCompletions: coordinator.engine.metrics.incrementalScoutCompletions,
          detachedScoutTasks: coordinator.engine.metrics.detachedScoutTasks,
          detachedBatches: coordinator.engine.metrics.detachedBatches,
          reSearches: coordinator.engine.metrics.reSearches,
          parallelBatches: coordinator.engine.metrics.parallelBatches,
          forcedMacroTransitions: coordinator.engine.metrics.forcedMacroTransitions,
          proofAdmissions: coordinator.engine.metrics.proofAdmissions,
          coordinatorStates: coordinatorKernel.states.count,
          coordinatorClasses: coordinatorKernel.classes.size,
          coordinatorPaths: coordinatorStats.representativePaths,
          priorityMemoEntries: coordinatorStats.priorityMemoEntries,
          priorityMemoDrops: coordinator.metrics.priorityMemoDrops,
        }));
      }

      await branchManager.reset();
      const actionCoordinator = createCoordinator(coordinatorKernel, semanticArena, executor, splitDepth);
      const actions = await actionCoordinator.engine.rootActionValues();
      await actionCoordinator.engine.drainBackground();
      await executor.drain();
      assertActions(actions, `workers=${workerCount} depth=${splitDepth}`);

      results.push(Object.freeze({
        requestedWorkers,
        workers: workerCount,
        splitDepth,
        splitDepthMeaning: 'unresolved_decision_depth_after_forced_macro_normalization',
        rootResolvedMsMedian: median(runs.map((run) => run.rootResolvedMs)),
        elapsedMsMedian: median(runs.map((run) => run.elapsedMs)),
        totalExpandedMedian: median(runs.map((run) => run.totalExpanded)),
        shallowExpandedMedian: median(runs.map((run) => run.shallowExpanded)),
        workerExpandedMedian: median(runs.map((run) => run.workerExpanded)),
        leafTasksMedian: median(runs.map((run) => run.leafTasks)),
        scoutTasksMedian: median(runs.map((run) => run.scoutTasks)),
        detachedScoutTasksMedian: median(runs.map((run) => run.detachedScoutTasks)),
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

await branchManager.cleanup();
await branchManager.worker.terminate();

const baseline = Object.freeze({
  elapsedMsMedian: median(baselineRuns.map((run) => run.elapsedMs)),
  expandedMedian: median(baselineRuns.map((run) => run.expanded)),
  callsMedian: median(baselineRuns.map((run) => run.calls)),
  runs: baselineRuns,
});
const ranked = [...results].sort((a, b) => a.rootResolvedMsMedian - b.rootResolvedMsMedian || a.elapsedMsMedian - b.elapsedMsMedian);
const summary = Object.freeze({
  kind: 'connect4-online-frontier-dependency-parallel-negamax-v5',
  status: 'complete',
  spec: SPEC,
  repeats: REPEATS,
  availableParallelism: availableParallelism(),
  priorityProbeDepth: PRIORITY_PROBE_DEPTH,
  completeGlobalGraphRequiredByRecursiveSearch: false,
  canonicalProofIdentity: 'exact_semantic_descriptor',
  coordinatorImplementation: 'createOnlineDependencyCoordinator',
  coordinatorDiagnostics: 'immutable_stats_snapshot',
  ordering: 'dynamic_live_winning_line_frontier_with_proof_hint_equal_score_tiebreak',
  forcedTransit: 'macro_normalized_before_decision_depth',
  sharedProofAdmission: 'probe_without_allocation_then_generation_stable_read_or_rebind_on_publication',
  siblingCompletion: 'incremental_completion_order_with_noninterrupting_detach_after_cutoff',
  baseline,
  results,
  best: ranked[0] ?? null,
});

console.error(`ONLINE_DEPENDENCY_PARALLEL_SUMMARY=${JSON.stringify(summary)}`);
console.log(JSON.stringify(summary, null, 2));
