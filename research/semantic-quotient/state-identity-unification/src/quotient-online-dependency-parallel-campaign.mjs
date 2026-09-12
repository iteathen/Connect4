import { availableParallelism } from 'node:os';
import { performance } from 'node:perf_hooks';
import {
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
  tacticalExactValue,
} from './quotient-negamax-domain-contract.mjs';
import {
  createDependencyAwareQuotientNegamaxEngine,
  createQuotientNegamaxEngine,
} from './quotient-negamax-engine.mjs';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createOnlineSemanticQuotientPort } from './quotient-online-semantic-search-lib.mjs';
import {
  startOnlineBranchManager,
  startOnlineSearchWorkers,
} from './quotient-online-semantic-worker-pool.mjs';
import { createSearchWorkerExecutor } from './quotient-search-worker-executor.mjs';

const SPEC = Object.freeze({ columns: 4, rows: 5, connect: 4 });
const REPEATS = Number(process.env.REPEATS ?? 5);
const DEPTHS = (process.env.SPLIT_DEPTHS ?? '2,3,4')
  .split(',').map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value > 0);
const REQUESTED_WORKERS = (process.env.WORKER_COUNTS ?? '1,2,3,4')
  .split(',').map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value > 0);
const PREFIX_CLASSES = Number(process.env.PREFIX_CLASSES ?? 4096);
const PRIORITY_PROBE_DEPTH = Number(process.env.PRIORITY_PROBE_DEPTH ?? 0);
const EXPECTED_ACTIONS = Object.freeze([0, 0, 0, 0]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function median(values) {
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
  const semantic = createOnlineSemanticQuotientPort(kernel, semanticArena);
  const basePort = semantic.port;
  const paths = [];
  paths[kernel.rootId] = Object.freeze([]);

  function transition(stateId, column) {
    const child = basePort.transition(stateId, column);
    if (child >= 0 && paths[child] === undefined) {
      const parentPath = paths[stateId];
      if (!parentPath) throw new Error(`missing representative path for state ${stateId}`);
      paths[child] = Object.freeze([...parentPath, column]);
    }
    return child;
  }

  const port = Object.freeze({ ...basePort, transition });
  const estimateMemo = new Map();
  function estimate(stateId, depth = PRIORITY_PROBE_DEPTH) {
    if (depth <= 0) return 1;
    const key = `${stateId}:${depth}`;
    const prior = estimateMemo.get(key);
    if (prior !== undefined) return prior;
    if (tacticalExactValue(kernel.tacticalCode(stateId)) !== null) {
      estimateMemo.set(key, 1);
      return 1;
    }
    let cost = 1;
    for (let column = 0; column < kernel.columns; column += 1) {
      if (!basePort.isLegal(stateId, column)) continue;
      const child = transition(stateId, column);
      if (child === QN_TERMINAL_WIN) cost += 1;
      else if (child !== QN_ILLEGAL) cost += estimate(child, depth - 1);
    }
    estimateMemo.set(key, cost);
    return cost;
  }

  const engine = createDependencyAwareQuotientNegamaxEngine(
    port,
    (stateId, alpha, beta, priority) => {
      const path = paths[stateId];
      if (!path) throw new Error(`missing leaf path for state ${stateId}`);
      return executor.submit({ type: 'search-path', path, alpha, beta }, priority);
    },
    {
      splitDepth,
      priorityAt: (stateId) => estimate(stateId),
    },
  );

  return Object.freeze({ engine, paths, semantic, estimateMemo });
}

function assertActions(actions, label) {
  assert(actions.length === EXPECTED_ACTIONS.length, `${label}: action length mismatch`);
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
        await executor.drain();
        assert(value === 0, `warmup workers=${workerCount} depth=${splitDepth}: expected draw, got ${value}`);
      }

      const runs = [];
      for (let repeat = 0; repeat < REPEATS; repeat += 1) {
        await branchManager.reset();
        const coordinator = createCoordinator(coordinatorKernel, semanticArena, executor, splitDepth);
        const started = performance.now();
        const value = await coordinator.engine.solveRoot();
        await executor.drain();
        const elapsedMs = performance.now() - started;
        assert(value === 0, `workers=${workerCount} depth=${splitDepth}: expected draw, got ${value}`);
        const executorStats = executor.stats();
        assert(executorStats.active === 0 && executorStats.queued === 0 && executorStats.pending === 0, 'executor retained work after solve');
        runs.push(Object.freeze({
          elapsedMs,
          shallowExpanded: coordinator.engine.metrics.shallowExpanded,
          workerExpanded: coordinator.engine.metrics.workerExpanded,
          totalExpanded: coordinator.engine.metrics.shallowExpanded + coordinator.engine.metrics.workerExpanded,
          leafTasks: coordinator.engine.metrics.leafTasks,
          scoutTasks: coordinator.engine.metrics.scoutTasks,
          reSearches: coordinator.engine.metrics.reSearches,
          parallelBatches: coordinator.engine.metrics.parallelBatches,
          forcedMacroTransitions: coordinator.engine.metrics.forcedMacroTransitions,
          proofAdmissions: coordinator.engine.metrics.proofAdmissions,
          coordinatorStates: coordinatorKernel.states.count,
          coordinatorClasses: coordinatorKernel.classes.size,
        }));
      }

      await branchManager.reset();
      const actionCoordinator = createCoordinator(coordinatorKernel, semanticArena, executor, splitDepth);
      const actions = await actionCoordinator.engine.rootActionValues();
      await executor.drain();
      assertActions(actions, `workers=${workerCount} depth=${splitDepth}`);

      results.push(Object.freeze({
        requestedWorkers,
        workers: workerCount,
        splitDepth,
        splitDepthMeaning: 'unresolved_decision_depth_after_forced_macro_normalization',
        elapsedMsMedian: median(runs.map((run) => run.elapsedMs)),
        totalExpandedMedian: median(runs.map((run) => run.totalExpanded)),
        shallowExpandedMedian: median(runs.map((run) => run.shallowExpanded)),
        workerExpandedMedian: median(runs.map((run) => run.workerExpanded)),
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

await branchManager.cleanup();
await branchManager.worker.terminate();

const baseline = Object.freeze({
  elapsedMsMedian: median(baselineRuns.map((run) => run.elapsedMs)),
  expandedMedian: median(baselineRuns.map((run) => run.expanded)),
  callsMedian: median(baselineRuns.map((run) => run.calls)),
  runs: baselineRuns,
});
const ranked = [...results].sort((a, b) => a.elapsedMsMedian - b.elapsedMsMedian);
const summary = Object.freeze({
  kind: 'connect4-online-frontier-dependency-parallel-negamax-v2',
  status: 'complete',
  spec: SPEC,
  repeats: REPEATS,
  availableParallelism: availableParallelism(),
  priorityProbeDepth: PRIORITY_PROBE_DEPTH,
  completeGlobalGraphRequiredByRecursiveSearch: false,
  canonicalProofIdentity: 'exact_semantic_descriptor',
  ordering: 'dynamic_live_winning_line_frontier',
  forcedTransit: 'macro_normalized_before_decision_depth',
  sharedProofAdmission: 'probe_without_allocation_then_ensure_on_publication',
  baseline,
  results,
  best: ranked[0] ?? null,
});

console.error(`ONLINE_DEPENDENCY_PARALLEL_SUMMARY=${JSON.stringify(summary)}`);
console.log(JSON.stringify(summary, null, 2));
