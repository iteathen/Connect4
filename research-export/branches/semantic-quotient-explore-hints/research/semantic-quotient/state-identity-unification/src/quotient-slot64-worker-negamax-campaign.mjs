import { performance } from 'node:perf_hooks';
import { availableParallelism } from 'node:os';
import { Worker } from 'node:worker_threads';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { solveStateWdl } from './quotient-slot64-worker-negamax-lib.mjs';
import {
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
} from './quotient-native-negamax-support-layout-kernel.mjs';

const SPEC = Object.freeze({
  columns: Number(process.env.COLUMNS ?? 4),
  rows: Number(process.env.ROWS ?? 5),
  connect: Number(process.env.CONNECT ?? 4),
});
const REPEATS = Number(process.env.REPEATS ?? 5);
const PREFIX_CLASSES = Number(process.env.PREFIX_CLASSES ?? 4096);
const REQUESTED_WORKERS = (process.env.WORKER_COUNTS ?? '1,2,4')
  .split(',')
  .map((value) => Number(value.trim()))
  .filter((value) => Number.isInteger(value) && value > 0);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function centerOrder(columns) {
  const center = (columns - 1) / 2;
  return Array.from({ length: columns }, (_, column) => column)
    .sort((a, b) => Math.abs(a - center) - Math.abs(b - center) || a - b);
}

function addMetrics(target, source) {
  if (!source) return;
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'number') target[key] = (target[key] ?? 0) + value;
  }
}

function nativeSolve() {
  const started = performance.now();
  const { kernel } = createSlot64ResidualQuotientKernel(SPEC, {
    cacheEdges: true,
    prefixClasses: PREFIX_CLASSES,
  });
  const setupMs = performance.now() - started;
  const solver = kernel.createWdlSolver({ etc: true, etcMinRemaining: 0, wdlMode: 'full' });
  const solveStarted = performance.now();
  const rootWdl = solver.run();
  const rootActions = solver.rootActionValues();
  const solveMs = performance.now() - solveStarted;
  return Object.freeze({
    rootWdl,
    rootActions,
    setupMs,
    solveMs,
    totalMs: performance.now() - started,
    metrics: Object.freeze({ ...solver.metrics }),
  });
}

function sequentialRootSplit() {
  const started = performance.now();
  const { kernel } = createSlot64ResidualQuotientKernel(SPEC, {
    cacheEdges: true,
    prefixClasses: PREFIX_CLASSES,
  });
  const setupMs = performance.now() - started;
  const solveStarted = performance.now();
  const rootActions = Array(SPEC.columns).fill(null);
  const aggregate = {};
  for (const column of centerOrder(SPEC.columns)) {
    const child = kernel.advance(kernel.rootId, column);
    if (child === QN_ILLEGAL) continue;
    if (child === QN_TERMINAL_WIN) {
      rootActions[column] = 1;
      continue;
    }
    const solved = solveStateWdl(kernel, child, { etc: true, etcMinRemaining: 0 });
    rootActions[column] = -solved.value;
    addMetrics(aggregate, solved.metrics);
  }
  const solveMs = performance.now() - solveStarted;
  const rootWdl = Math.max(...rootActions.filter((value) => value !== null));
  return Object.freeze({
    rootWdl,
    rootActions,
    setupMs,
    solveMs,
    totalMs: performance.now() - started,
    metrics: Object.freeze(aggregate),
  });
}

async function workerRootSplit(workerCount, collectAll = true) {
  const started = performance.now();
  const actualWorkers = Math.max(1, Math.min(workerCount, SPEC.columns, availableParallelism()));
  const stopBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
  const stopView = new Int32Array(stopBuffer);
  Atomics.store(stopView, 0, 0);
  const workerUrl = new URL('./quotient-slot64-worker-negamax-worker.mjs', import.meta.url);
  const workers = [];
  let settled = false;

  const ready = [];
  for (let index = 0; index < actualWorkers; index += 1) {
    const worker = new Worker(workerUrl, {
      workerData: {
        workerId: index,
        spec: SPEC,
        prefixClasses: PREFIX_CLASSES,
        etc: true,
        etcMinRemaining: 0,
        stopBuffer,
      },
    });
    workers.push(worker);
    ready.push(new Promise((resolve, reject) => {
      const onMessage = (message) => {
        if (message?.type !== 'ready') return;
        worker.off('message', onMessage);
        resolve();
      };
      worker.on('message', onMessage);
      worker.once('error', reject);
    }));
  }

  try {
    await Promise.all(ready);
    const readyMs = performance.now() - started;
    const solveStarted = performance.now();
    const queue = centerOrder(SPEC.columns);
    const rootActions = Array(SPEC.columns).fill(null);
    const aggregate = {};
    let nextTaskId = 0;
    let active = 0;
    let completed = 0;

    const solveResult = await new Promise((resolve, reject) => {
      const maybeFinish = () => {
        if (settled) return;
        if (collectAll) {
          if (completed !== SPEC.columns) return;
          settled = true;
          const values = rootActions.filter((value) => value !== null);
          resolve({ rootWdl: Math.max(...values), rootActions, earlyWin: false });
          return;
        }
        if (rootActions.some((value) => value === 1)) {
          Atomics.store(stopView, 0, 1);
          settled = true;
          resolve({ rootWdl: 1, rootActions, earlyWin: true });
          return;
        }
        if (completed === SPEC.columns) {
          settled = true;
          const values = rootActions.filter((value) => value !== null);
          resolve({ rootWdl: Math.max(...values), rootActions, earlyWin: false });
        }
      };

      const dispatch = (worker) => {
        if (settled) return;
        const column = queue.shift();
        if (column === undefined) {
          maybeFinish();
          return;
        }
        active += 1;
        worker.postMessage({ type: 'solve-column', taskId: nextTaskId++, column });
      };

      for (const worker of workers) {
        worker.on('error', (error) => {
          if (!settled) {
            settled = true;
            reject(error);
          }
        });
        worker.on('message', (message) => {
          if (message?.type === 'ready') return;
          if (message?.type === 'error') {
            if (!settled) {
              settled = true;
              reject(new Error(`worker ${message.workerId}: ${message.message}`));
            }
            return;
          }
          if (message?.type !== 'result' && message?.type !== 'stopped') return;
          active -= 1;
          if (message.type === 'result') {
            rootActions[message.column] = message.value;
            addMetrics(aggregate, message.metrics);
            completed += 1;
          }
          if (!settled) {
            maybeFinish();
            if (!settled) dispatch(worker);
          }
        });
      }
      for (const worker of workers) dispatch(worker);
    });

    const solveMs = performance.now() - solveStarted;
    const totalMs = performance.now() - started;
    const terminateStarted = performance.now();
    Atomics.store(stopView, 0, 1);
    await Promise.all(workers.map((worker) => worker.terminate()));
    const terminateMs = performance.now() - terminateStarted;
    return Object.freeze({
      requestedWorkers: workerCount,
      workers: actualWorkers,
      availableParallelism: availableParallelism(),
      collectAll,
      ...solveResult,
      readyMs,
      solveMs,
      totalMs,
      terminateMs,
      aggregateMetrics: Object.freeze(aggregate),
      activeAtResolution: active,
    });
  } catch (error) {
    Atomics.store(stopView, 0, 1);
    await Promise.allSettled(workers.map((worker) => worker.terminate()));
    throw error;
  }
}

function assertActions(actual, expected, label) {
  assert(actual.length === expected.length, `${label}: action length mismatch`);
  for (let column = 0; column < expected.length; column += 1) {
    assert(actual[column] === expected[column], `${label}: column ${column}: expected ${expected[column]}, got ${actual[column]}`);
  }
}

const nativeRuns = Array.from({ length: REPEATS }, () => nativeSolve());
const expected = nativeRuns[0];
for (const run of nativeRuns) {
  assert(run.rootWdl === expected.rootWdl, 'native root WDL drifted');
  assertActions(run.rootActions, expected.rootActions, 'native');
}
if (SPEC.columns === 4 && SPEC.rows === 5 && SPEC.connect === 4) {
  assert(expected.rootWdl === 0, `4x5:c4 independent qualified root WDL expected draw, got ${expected.rootWdl}`);
  assertActions(expected.rootActions, [0, 0, 0, 0], '4x5:c4 independent qualified actions');
}

const sequentialRuns = Array.from({ length: REPEATS }, () => sequentialRootSplit());
for (const run of sequentialRuns) {
  assert(run.rootWdl === expected.rootWdl, `sequential root-split WDL mismatch: ${run.rootWdl} != ${expected.rootWdl}`);
  assertActions(run.rootActions, expected.rootActions, 'sequential root-split');
}

const workerResults = [];
for (const requested of REQUESTED_WORKERS) {
  const runs = [];
  for (let repeat = 0; repeat < REPEATS; repeat += 1) {
    const run = await workerRootSplit(requested, true);
    assert(run.rootWdl === expected.rootWdl, `${requested}-worker root WDL mismatch: ${run.rootWdl} != ${expected.rootWdl}`);
    assertActions(run.rootActions, expected.rootActions, `${requested}-worker root actions`);
    runs.push(run);
  }
  workerResults.push(Object.freeze({
    requestedWorkers: requested,
    workers: runs[0].workers,
    readyMsMedian: median(runs.map((run) => run.readyMs)),
    solveMsMedian: median(runs.map((run) => run.solveMs)),
    totalMsMedian: median(runs.map((run) => run.totalMs)),
    terminateMsMedian: median(runs.map((run) => run.terminateMs)),
    expandedMedian: median(runs.map((run) => run.aggregateMetrics.expanded ?? 0)),
    callsMedian: median(runs.map((run) => run.aggregateMetrics.calls ?? 0)),
    runs,
  }));
}

const summary = Object.freeze({
  kind: 'connect4-slot64-worker-root-split-negamax-v1',
  status: 'complete',
  date: '2026-09-11',
  spec: SPEC,
  repeats: REPEATS,
  availableParallelism: availableParallelism(),
  reference: Object.freeze({
    rootWdl: expected.rootWdl,
    rootActions: expected.rootActions,
    nativeSolveMsMedian: median(nativeRuns.map((run) => run.solveMs)),
    nativeTotalMsMedian: median(nativeRuns.map((run) => run.totalMs)),
  }),
  sequentialRootSplit: Object.freeze({
    solveMsMedian: median(sequentialRuns.map((run) => run.solveMs)),
    totalMsMedian: median(sequentialRuns.map((run) => run.totalMs)),
    expandedMedian: median(sequentialRuns.map((run) => run.metrics.expanded ?? 0)),
    callsMedian: median(sequentialRuns.map((run) => run.metrics.calls ?? 0)),
  }),
  workers: workerResults,
});

console.error(`WORKER_NEGAMAX_SUMMARY=${JSON.stringify(summary)}`);
console.log(JSON.stringify(summary, null, 2));
