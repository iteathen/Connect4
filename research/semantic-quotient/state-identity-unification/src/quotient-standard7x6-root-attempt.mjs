import { availableParallelism } from 'node:os';
import { performance } from 'node:perf_hooks';
import { assertWdlValue } from './quotient-negamax-domain-contract.mjs';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createOnlineDependencyCoordinator } from './quotient-online-dependency-coordinator.mjs';
import {
  startOnlineBranchManager,
  startOnlineSearchWorkers,
} from './quotient-online-semantic-worker-pool.mjs';
import { createSearchWorkerExecutor } from './quotient-search-worker-executor.mjs';
import { createSemanticSharedTtView } from './quotient-semantic-shared-tt.mjs';

const SPEC = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const CELL_COUNT = SPEC.columns * SPEC.rows;
const EXPECTED_ROOT_WDL = 1;
const PREFIX_CLASSES = Number(process.env.PREFIX_CLASSES ?? 4096);
const SPLIT_DEPTH = Number(process.env.SPLIT_DEPTH ?? 3);
const PRIORITY_PROBE_DEPTH = Number(process.env.PRIORITY_PROBE_DEPTH ?? 0);
const REQUESTED_WORKERS = Number(process.env.SEARCH_WORKERS ?? 3);
const ENTRY_CAPACITY = Number(process.env.TT_ENTRY_CAPACITY ?? 8388608);
const TERM_CAPACITY = Number(process.env.TT_TERM_CAPACITY ?? 460000000);
const PROGRESS_MS = Number(process.env.PROGRESS_MS ?? 15000);
const CPU_PARALLELISM = availableParallelism();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isPowerOfTwo(value) {
  return Number.isInteger(value) && value > 0 && Number.isInteger(Math.log2(value));
}

assert(Number.isInteger(PREFIX_CLASSES) && PREFIX_CLASSES >= 1, 'PREFIX_CLASSES must be positive');
assert(Number.isInteger(SPLIT_DEPTH) && SPLIT_DEPTH >= 1 && SPLIT_DEPTH <= CELL_COUNT, `SPLIT_DEPTH must be in 1..${CELL_COUNT}`);
assert(Number.isInteger(PRIORITY_PROBE_DEPTH) && PRIORITY_PROBE_DEPTH >= 0 && PRIORITY_PROBE_DEPTH <= CELL_COUNT, `PRIORITY_PROBE_DEPTH must be in 0..${CELL_COUNT}`);
assert(Number.isInteger(REQUESTED_WORKERS) && REQUESTED_WORKERS >= 1 && REQUESTED_WORKERS <= 256, 'SEARCH_WORKERS must be in 1..256');
assert(isPowerOfTwo(ENTRY_CAPACITY) && ENTRY_CAPACITY >= 8 && ENTRY_CAPACITY <= 0x40000000, 'TT_ENTRY_CAPACITY must be a power of two in 8..2^30');
assert(Number.isInteger(TERM_CAPACITY) && TERM_CAPACITY >= 1 && TERM_CAPACITY <= 0x7fffffff, 'TT_TERM_CAPACITY must be in 1..INT32_MAX');
assert(Number.isInteger(PROGRESS_MS) && PROGRESS_MS >= 1000, 'PROGRESS_MS must be at least 1000');
assert(Number.isInteger(CPU_PARALLELISM) && CPU_PARALLELISM >= 1, 'availableParallelism must be positive');

const searchWorkers = Math.max(1, Math.min(REQUESTED_WORKERS, CPU_PARALLELISM));
const attemptStarted = performance.now();
let branchManager = null;
let branchManagerFinalStats = null;
let semanticArena = null;
let workers = [];
let executor = null;
let progressTimer = null;
let coordinatorKernel = null;
let coordinator = null;
let ttView = null;
let status = 'initializing';
let rootWdl = null;
let errorText = null;
let rootResolvedMs = null;
let quiescentMs = null;

function errorString(error) {
  return error instanceof Error ? error.stack ?? error.message : String(error);
}

function recordFailure(error) {
  if (errorText === null) errorText = errorString(error);
  status = 'failed';
}

function processMemory() {
  const memory = process.memoryUsage();
  return Object.freeze({
    rss: memory.rss,
    heapUsed: memory.heapUsed,
    external: memory.external,
    arrayBuffers: memory.arrayBuffers,
  });
}

function progressSnapshot() {
  return Object.freeze({
    kind: 'connect4-standard7x6-frontier-root-progress-v4',
    status,
    elapsedMs: performance.now() - attemptStarted,
    rootWdl,
    rootResolvedMs,
    tt: ttView?.stats() ?? null,
    executor: executor?.stats() ?? null,
    coordinator: coordinatorKernel
      ? Object.freeze({
          states: coordinatorKernel.states.count,
          residualClasses: coordinatorKernel.classes.size,
          typedBytes: coordinatorKernel.memoryStats().totalTypedBytes,
          shallowExpanded: coordinator?.engine.metrics.shallowExpanded ?? 0,
          workerExpanded: coordinator?.engine.metrics.workerExpanded ?? 0,
          leafTasks: coordinator?.engine.metrics.leafTasks ?? 0,
          scoutTasks: coordinator?.engine.metrics.scoutTasks ?? 0,
          proofAdmissions: coordinator?.engine.metrics.proofAdmissions ?? 0,
          forcedMacroTransitions: coordinator?.engine.metrics.forcedMacroTransitions ?? 0,
          detachedScoutTasks: coordinator?.engine.metrics.detachedScoutTasks ?? 0,
        })
      : null,
    processMemory: processMemory(),
  });
}

async function drainProofWork() {
  if (coordinator) await coordinator.engine.drainBackground();
  if (executor) await executor.drain();
}

function recordResolvedRoot(value) {
  rootWdl = assertWdlValue(value, 'standard 7x6 root result');
  rootResolvedMs = performance.now() - attemptStarted;
  if (rootWdl !== EXPECTED_ROOT_WDL) {
    throw new Error(`standard 7x6 root oracle mismatch: expected ${EXPECTED_ROOT_WDL}, got ${rootWdl}`);
  }
}

try {
  branchManager = await startOnlineBranchManager(SPEC, {
    prebuildGraph: false,
    prefixClasses: PREFIX_CLASSES,
    entryCapacity: ENTRY_CAPACITY,
    termCapacity: TERM_CAPACITY,
    exploreEnabled: false,
  });
  assert(branchManager.published.graph === null, 'online 7x6 Branch Manager unexpectedly prebuilt a graph');
  assert(branchManager.published.arena === null, 'online 7x6 Branch Manager unexpectedly allocated a graph proof arena');
  semanticArena = branchManager.published.semanticArena;
  assert(semanticArena?.entryCapacity === ENTRY_CAPACITY, `semantic TT entry capacity drifted to ${semanticArena?.entryCapacity}`);
  assert(semanticArena?.termCapacity === TERM_CAPACITY, `semantic TT term capacity drifted to ${semanticArena?.termCapacity}`);
  ttView = createSemanticSharedTtView(semanticArena);

  workers = await startOnlineSearchWorkers(searchWorkers, SPEC, semanticArena, {
    prefixClasses: PREFIX_CLASSES,
    etc: false,
  });
  assert(workers.length === searchWorkers, `started ${workers.length} workers, expected ${searchWorkers}`);
  executor = createSearchWorkerExecutor(workers);

  coordinatorKernel = createSlot64ResidualQuotientKernel(SPEC, {
    cacheEdges: false,
    prefixClasses: PREFIX_CLASSES,
  }).kernel;
  coordinator = createOnlineDependencyCoordinator(
    coordinatorKernel,
    semanticArena,
    executor,
    {
      splitDepth: SPLIT_DEPTH,
      priorityProbeDepth: PRIORITY_PROBE_DEPTH,
    },
  );

  status = 'searching-win-threshold';
  progressTimer = setInterval(() => {
    console.error(`STANDARD7X6_ROOT_PROGRESS=${JSON.stringify(progressSnapshot())}`);
  }, PROGRESS_MS);
  progressTimer.unref();

  const first = assertWdlValue(
    await coordinator.engine.search(coordinatorKernel.rootId, 0, 1),
    'standard 7x6 win-threshold result',
  );
  if (first >= 1) {
    recordResolvedRoot(1);
  } else {
    status = 'searching-draw-threshold';
    const second = assertWdlValue(
      await coordinator.engine.search(coordinatorKernel.rootId, -1, 0),
      'standard 7x6 draw-threshold result',
    );
    recordResolvedRoot(second >= 0 ? 0 : -1);
  }

  // Authoritative threshold completion above is the exact proof time. Detached scouts
  // remain sound proof producers but are lifecycle cleanup, not a prerequisite for the result.
  status = 'quiescing';
  console.error(`STANDARD7X6_ROOT_RESOLVED=${JSON.stringify({ rootWdl, rootResolvedMs })}`);
  await drainProofWork();
  quiescentMs = performance.now() - attemptStarted;
} catch (error) {
  recordFailure(error);
} finally {
  if (progressTimer) clearInterval(progressTimer);
  try {
    await drainProofWork();
    if (rootWdl !== null && quiescentMs === null) quiescentMs = performance.now() - attemptStarted;
  } catch (error) {
    recordFailure(error);
  }

  if (executor) {
    try { await executor.drain(); } catch (error) { recordFailure(error); }
    try { executor.close(); } catch (error) { recordFailure(error); }
  }

  const workerTerminations = await Promise.allSettled(workers.map((worker) => worker.terminate()));
  for (const result of workerTerminations) {
    if (result.status === 'rejected') recordFailure(result.reason);
  }

  if (branchManager) {
    try {
      const cleaned = await branchManager.cleanup();
      branchManagerFinalStats = cleaned.stats ?? null;
    } catch (error) {
      recordFailure(error);
    }
    try { await branchManager.worker.terminate(); } catch (error) { recordFailure(error); }
  }

  if (errorText === null && rootWdl !== null) status = 'complete';
  else status = 'failed';
}

const summary = Object.freeze({
  kind: 'connect4-standard7x6-frontier-dependency-root-attempt-v4',
  status,
  spec: SPEC,
  expectedRootWdl: EXPECTED_ROOT_WDL,
  rootWdl,
  error: errorText,
  rootResolvedMs,
  quiescentMs,
  elapsedMs: performance.now() - attemptStarted,
  configuration: Object.freeze({
    requestedWorkers: REQUESTED_WORKERS,
    searchWorkers,
    availableParallelism: CPU_PARALLELISM,
    splitDepth: SPLIT_DEPTH,
    splitDepthMeaning: 'unresolved_decision_depth_after_forced_macro_normalization',
    priorityProbeDepth: PRIORITY_PROBE_DEPTH,
    prefixClasses: PREFIX_CLASSES,
    ttEntryCapacity: semanticArena?.entryCapacity ?? ENTRY_CAPACITY,
    ttTermCapacity: semanticArena?.termCapacity ?? TERM_CAPACITY,
    ordering: 'dynamic_live_winning_line_frontier',
    forcedTransit: 'macro_normalized_before_decision_depth',
    sharedProofAdmission: 'probe_without_allocation_then_generation_stable_read_or_rebind_on_publication',
    siblingCompletion: 'incremental_completion_order_with_noninterrupting_detach_after_cutoff',
    rootProofTiming: 'authoritative_threshold_completion_before_detached_quiescence',
    autonomousExploration: false,
  }),
  tt: ttView?.stats() ?? null,
  executor: executor?.stats() ?? null,
  coordinator: coordinatorKernel
    ? Object.freeze({
        states: coordinatorKernel.states.count,
        residualClasses: coordinatorKernel.classes.size,
        memory: coordinatorKernel.memoryStats(),
        metrics: Object.freeze({ ...coordinator.engine.metrics }),
      })
    : null,
  branchManager: branchManagerFinalStats ?? branchManager?.published.stats ?? null,
  processMemory: processMemory(),
});

console.error(`STANDARD7X6_ROOT_ATTEMPT=${JSON.stringify(summary)}`);
console.log(JSON.stringify(summary, null, 2));

if (status === 'failed') process.exitCode = 1;
