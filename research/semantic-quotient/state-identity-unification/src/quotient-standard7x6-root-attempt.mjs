import { availableParallelism } from 'node:os';
import { performance } from 'node:perf_hooks';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createOnlineDependencyCoordinator } from './quotient-online-dependency-coordinator.mjs';
import {
  startOnlineMaintenanceHost,
  startOnlineSearchWorkers,
} from './quotient-online-semantic-worker-pool.mjs';
import { createSearchWorkerExecutor } from './quotient-search-worker-executor.mjs';
import { createSemanticSharedTtView } from './quotient-semantic-shared-tt.mjs';

const SPEC = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const PREFIX_CLASSES = Number(process.env.PREFIX_CLASSES ?? 4096);
const SPLIT_DEPTH = Number(process.env.SPLIT_DEPTH ?? 3);
const PRIORITY_PROBE_DEPTH = Number(process.env.PRIORITY_PROBE_DEPTH ?? 0);
const REQUESTED_WORKERS = Number(process.env.SEARCH_WORKERS ?? 3);
const ENTRY_CAPACITY = Number(process.env.TT_ENTRY_CAPACITY ?? 8388608);
const TERM_CAPACITY = Number(process.env.TT_TERM_CAPACITY ?? 460000000);
const PROGRESS_MS = Number(process.env.PROGRESS_MS ?? 30000);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(Number.isInteger(SPLIT_DEPTH) && SPLIT_DEPTH >= 1, 'SPLIT_DEPTH must be positive');
assert(Number.isInteger(REQUESTED_WORKERS) && REQUESTED_WORKERS >= 1, 'SEARCH_WORKERS must be positive');
assert(Number.isInteger(ENTRY_CAPACITY) && ENTRY_CAPACITY >= 1, 'TT_ENTRY_CAPACITY must be positive');
assert(Number.isInteger(TERM_CAPACITY) && TERM_CAPACITY >= 1, 'TT_TERM_CAPACITY must be positive');

const searchWorkers = Math.max(1, Math.min(REQUESTED_WORKERS, availableParallelism()));
const attemptStarted = performance.now();
let maintenance = null;
let workers = [];
let executor = null;
let progressTimer = null;
let coordinatorKernel = null;
let coordinator = null;
let ttView = null;
let status = 'initializing';
let rootWdl = null;
let errorText = null;

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
    kind: 'connect4-standard7x6-root-progress-v1',
    status,
    elapsedMs: performance.now() - attemptStarted,
    rootWdl,
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
        })
      : null,
    processMemory: processMemory(),
  });
}

try {
  maintenance = await startOnlineMaintenanceHost(SPEC, {
    prebuildGraph: false,
    prefixClasses: PREFIX_CLASSES,
    entryCapacity: ENTRY_CAPACITY,
    termCapacity: TERM_CAPACITY,
  });
  assert(maintenance.published.graph === null, 'online 7x6 maintenance host unexpectedly prebuilt a graph');
  assert(maintenance.published.arena === null, 'online 7x6 maintenance host unexpectedly allocated a graph proof arena');
  const semanticArena = maintenance.published.semanticArena;
  ttView = createSemanticSharedTtView(semanticArena);

  workers = await startOnlineSearchWorkers(searchWorkers, SPEC, semanticArena, {
    prefixClasses: PREFIX_CLASSES,
    etc: false,
  });
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

  const first = await coordinator.engine.search(coordinatorKernel.rootId, 0, 1);
  await executor.drain();
  if (first >= 1) {
    rootWdl = 1;
  } else {
    status = 'searching-draw-threshold';
    const second = await coordinator.engine.search(coordinatorKernel.rootId, -1, 0);
    await executor.drain();
    rootWdl = second >= 0 ? 0 : -1;
  }
  status = 'complete';
} catch (error) {
  status = 'failed';
  errorText = error instanceof Error ? error.stack ?? error.message : String(error);
} finally {
  if (progressTimer) clearInterval(progressTimer);
  if (executor) {
    try { await executor.drain(); } catch { /* preserve original result */ }
  }
}

const summary = Object.freeze({
  kind: 'connect4-standard7x6-online-dependency-root-attempt-v1',
  status,
  spec: SPEC,
  rootWdl,
  error: errorText,
  elapsedMs: performance.now() - attemptStarted,
  configuration: Object.freeze({
    requestedWorkers: REQUESTED_WORKERS,
    searchWorkers,
    availableParallelism: availableParallelism(),
    splitDepth: SPLIT_DEPTH,
    priorityProbeDepth: PRIORITY_PROBE_DEPTH,
    prefixClasses: PREFIX_CLASSES,
    ttEntryCapacity: ENTRY_CAPACITY,
    ttTermCapacity: TERM_CAPACITY,
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
  processMemory: processMemory(),
});

console.error(`STANDARD7X6_ROOT_ATTEMPT=${JSON.stringify(summary)}`);
console.log(JSON.stringify(summary, null, 2));

if (executor) {
  executor.close();
  await Promise.allSettled(workers.map((worker) => worker.terminate()));
}
if (maintenance) {
  try { await maintenance.cleanup(); } catch { /* result already captured */ }
  await maintenance.worker.terminate();
}

if (status === 'failed') process.exitCode = 1;
