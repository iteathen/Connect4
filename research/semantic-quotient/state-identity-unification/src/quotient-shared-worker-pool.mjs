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
    worker.once('error', onError);
    worker.postMessage({ ...payload, requestId: id });
  });
}

export async function startDedupOwner(spec, prefixClasses = 4096) {
  const worker = new Worker(new URL('./quotient-shared-dedup-worker.mjs', import.meta.url), {
    workerData: { spec, prefixClasses },
  });
  const published = await new Promise((resolve, reject) => {
    worker.once('error', reject);
    worker.on('message', (message) => {
      if (message?.type === 'published') resolve(message);
    });
  });
  return Object.freeze({
    worker,
    published,
    reset: () => oneReply(worker, 'reset-complete', { type: 'reset' }),
    cleanup: () => oneReply(worker, 'cleanup-complete', { type: 'cleanup' }),
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
      worker.once('error', reject);
      worker.on('message', (message) => {
        if (message?.type === 'ready') resolve();
      });
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

export async function runRootColumns(workers, columns) {
  const queue = [...columns];
  const actions = Array(columns.length).fill(null);
  const metrics = {};
  let taskId = 0;
  let completed = 0;
  const started = performance.now();

  await new Promise((resolve, reject) => {
    const listeners = new Map();
    const cleanupListeners = () => {
      for (const [worker, listener] of listeners) worker.off('message', listener);
    };
    const dispatch = (worker) => {
      const column = queue.shift();
      if (column === undefined) return;
      worker.postMessage({ type: 'solve-column', taskId: taskId++, column });
    };
    for (const worker of workers) {
      const listener = (message) => {
        if (message?.type !== 'result') return;
        actions[message.column] = message.value;
        addMetrics(metrics, message.metrics);
        completed += 1;
        if (completed === columns.length) {
          cleanupListeners();
          resolve();
        } else {
          dispatch(worker);
        }
      };
      listeners.set(worker, listener);
      worker.once('error', (error) => {
        cleanupListeners();
        reject(error);
      });
      worker.on('message', listener);
      dispatch(worker);
    }
  });

  return Object.freeze({
    solveMs: performance.now() - started,
    actions,
    rootWdl: Math.max(...actions.filter((value) => value !== null)),
    metrics: Object.freeze(metrics),
  });
}
