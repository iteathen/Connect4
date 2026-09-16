import { Worker } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';

let requestId = 0;

function oneReply(worker, expectedType, payload) {
  const id = requestId++;
  return new Promise((resolve, reject) => {
    const onMessage = (message) => {
      if (message?.type !== expectedType || message.requestId !== id) return;
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

export async function startOnlineMaintenanceHost(spec, options = {}) {
  const worker = new Worker(new URL('./quotient-maintenance-worker.mjs', import.meta.url), {
    workerData: {
      spec,
      prebuildGraph: options.prebuildGraph !== false,
      prefixClasses: options.prefixClasses ?? 4096,
      semanticTt: {
        entryCapacity: options.entryCapacity ?? (1 << 19),
        termCapacity: options.termCapacity ?? (1 << 24),
      },
    },
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
  if (!published.semanticArena) throw new Error('maintenance host did not publish semantic TT arena');
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

export async function startOnlineSearchWorkers(count, spec, semanticArena, options = {}) {
  const workers = [];
  const ready = [];
  for (let workerId = 0; workerId < count; workerId += 1) {
    const worker = new Worker(new URL('./quotient-online-semantic-search-worker.mjs', import.meta.url), {
      workerData: {
        workerId,
        spec,
        semanticArena,
        prefixClasses: options.prefixClasses ?? 4096,
        etc: options.etc === true,
      },
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

export async function runOnlinePathTasks(workers, tasks) {
  const queue = [...tasks];
  const frontierValues = [];
  const metrics = {};
  const workerTaskCounts = Array(workers.length).fill(0);
  const localStateHighWater = Array(workers.length).fill(0);
  const localClassHighWater = Array(workers.length).fill(0);
  let nextTaskId = 0;
  let completed = 0;
  const started = performance.now();

  await new Promise((resolve, reject) => {
    const listeners = new Map();
    const errors = new Map();
    const cleanup = () => {
      for (const [worker, listener] of listeners) worker.off('message', listener);
      for (const [worker, listener] of errors) worker.off('error', listener);
      listeners.clear();
      errors.clear();
    };
    const dispatch = (worker, workerIndex) => {
      const task = queue.shift();
      if (task === undefined) return;
      workerTaskCounts[workerIndex] += 1;
      worker.postMessage({
        type: 'solve-path',
        taskId: nextTaskId++,
        plannerStateId: task.stateId,
        path: task.path,
      });
    };

    workers.forEach((worker, workerIndex) => {
      const onMessage = (message) => {
        if (message?.type === 'error') {
          cleanup();
          reject(new Error(`worker ${message.workerId}: ${message.message}`));
          return;
        }
        if (message?.type !== 'result') return;
        frontierValues.push([message.plannerStateId, message.value]);
        addMetrics(metrics, message.metrics);
        localStateHighWater[workerIndex] = Math.max(localStateHighWater[workerIndex], message.localStates ?? 0);
        localClassHighWater[workerIndex] = Math.max(localClassHighWater[workerIndex], message.localClasses ?? 0);
        completed += 1;
        if (completed === tasks.length) {
          cleanup();
          resolve();
        } else {
          dispatch(worker, workerIndex);
        }
      };
      const onError = (error) => {
        cleanup();
        reject(error);
      };
      listeners.set(worker, onMessage);
      errors.set(worker, onError);
      worker.on('message', onMessage);
      worker.on('error', onError);
      dispatch(worker, workerIndex);
    });

    if (tasks.length === 0) {
      cleanup();
      resolve();
    }
  });

  return Object.freeze({
    solveMs: performance.now() - started,
    frontierValues: Object.freeze(frontierValues),
    metrics: Object.freeze(metrics),
    workerTaskCounts: Object.freeze(workerTaskCounts),
    localStateHighWater: Object.freeze(localStateHighWater),
    localClassHighWater: Object.freeze(localClassHighWater),
  });
}
