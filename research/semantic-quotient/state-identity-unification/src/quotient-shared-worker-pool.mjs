import { Worker } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';

let requestId = 0;

function oneReply(worker, type, payload) {
  const id = requestId++;
  return new Promise((resolve, reject) => {
    const onMessage = (message) => {
      if (message?.type !== type || message.requestId !== id) return;
      worker.off('message', onMessage);
      worker.off('error', onError);
      resolve(message);
    };
    const onError = (error) => {
      worker.off('message', onMessage);
      reject(error);
    };
    worker.on('message', onMessage);
    worker.on('error', onError);
    worker.postMessage({ ...payload, requestId: id });
  });
}

export async function startMaintenanceHost(spec, prefixClasses = 4096) {
  const worker = new Worker(new URL('./quotient-shared-dedup-worker.mjs', import.meta.url), {
    workerData: { spec, prefixClasses },
  });
  const published = await new Promise((resolve, reject) => {
    const onMessage = (message) => {
      if (message?.type !== 'published') return;
      worker.off('message', onMessage);
      worker.off('error', onError);
      resolve(message);
    };
    const onError = (error) => {
      worker.off('message', onMessage);
      reject(error);
    };
    worker.on('message', onMessage);
    worker.on('error', onError);
  });
  return Object.freeze({
    worker,
    published,
    reset: () => oneReply(worker, 'reset-complete', { type: 'reset' }),
    cleanup: () => oneReply(worker, 'cleanup-complete', { type: 'cleanup' }),
    buildPlan: (splitDepth, probeDepth = 2) => oneReply(worker, 'plan-built', {
      type: 'build-plan', splitDepth, probeDepth,
    }),
    reducePlan: (planId, frontierValues) => oneReply(worker, 'plan-reduced', {
      type: 'reduce-plan', planId, frontierValues,
    }),
    releasePlan: (planId) => oneReply(worker, 'plan-released', {
      type: 'release-plan', planId,
    }),
  });
}

export async function startSearchWorkers(count, shared) {
  const workers = [];
  const ready = [];
  for (let workerId = 0; workerId < count; workerId += 1) {
    const worker = new Worker(new URL('./quotient-shared-search-worker.mjs', import.meta.url), {
      workerData: { workerId, shared },
    });
    workers.push(worker);
    ready.push(new Promise((resolve, reject) => {
      const onMessage = (message) => {
        if (message?.type !== 'ready') return;
        worker.off('message', onMessage);
        worker.off('error', onError);
        resolve();
      };
      const onError = (error) => {
        worker.off('message', onMessage);
        reject(error);
      };
      worker.on('message', onMessage);
      worker.on('error', onError);
    }));
  }
  await Promise.all(ready);
  return workers;
}

function addMetrics(target, source) {
  for (const [key, value] of Object.entries(source ?? {})) {
    if (typeof value === 'number') target[key] = (target[key] ?? 0) + value;
  }
}

async function runQueuedTasks(workers, tasks, makeMessage, consumeResult) {
  const queue = [...tasks];
  const metrics = {};
  const taskElapsedMs = [];
  const workerTaskCounts = Array(workers.length).fill(0);
  let taskId = 0;
  let completed = 0;
  const started = performance.now();

  await new Promise((resolve, reject) => {
    const messageListeners = new Map();
    const errorListeners = new Map();
    const cleanupListeners = () => {
      for (const [worker, listener] of messageListeners) worker.off('message', listener);
      for (const [worker, listener] of errorListeners) worker.off('error', listener);
      messageListeners.clear();
      errorListeners.clear();
    };
    const dispatch = (worker, workerIndex) => {
      const task = queue.shift();
      if (task === undefined) return;
      workerTaskCounts[workerIndex] += 1;
      worker.postMessage(makeMessage(task, taskId++));
    };
    workers.forEach((worker, workerIndex) => {
      const onMessage = (message) => {
        if (message?.type !== 'result') return;
        consumeResult(message);
        addMetrics(metrics, message.metrics);
        taskElapsedMs.push(message.elapsedMs);
        completed += 1;
        if (completed === tasks.length) {
          cleanupListeners();
          resolve();
        } else {
          dispatch(worker, workerIndex);
        }
      };
      const onError = (error) => {
        cleanupListeners();
        reject(error);
      };
      messageListeners.set(worker, onMessage);
      errorListeners.set(worker, onError);
      worker.on('message', onMessage);
      worker.on('error', onError);
      dispatch(worker, workerIndex);
    });
    if (tasks.length === 0) {
      cleanupListeners();
      resolve();
    }
  });

  return Object.freeze({
    solveMs: performance.now() - started,
    metrics: Object.freeze(metrics),
    taskElapsedMs: Object.freeze(taskElapsedMs),
    workerTaskCounts: Object.freeze(workerTaskCounts),
  });
}

export async function runRootColumns(workers, columns) {
  const actions = Array(columns.length).fill(null);
  const run = await runQueuedTasks(
    workers,
    columns,
    (column, taskId) => ({ type: 'solve-column', taskId, column }),
    (message) => { actions[message.column] = message.value; },
  );
  return Object.freeze({
    ...run,
    actions,
    rootWdl: Math.max(...actions.filter((value) => value !== null)),
  });
}

export async function runLookaheadTasks(workers, tasks) {
  const frontierValues = [];
  const run = await runQueuedTasks(
    workers,
    tasks,
    (task, taskId) => ({ type: 'solve-state', taskId, stateId: task.stateId }),
    (message) => { frontierValues.push([message.stateId, message.value]); },
  );
  return Object.freeze({ ...run, frontierValues: Object.freeze(frontierValues) });
}
