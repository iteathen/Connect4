import { Worker } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';
import { assertWdlValue } from './quotient-negamax-domain-contract.mjs';

let requestId = 1;

function asError(error, fallback) {
  if (error instanceof Error) return error;
  if (error === undefined || error === null) return new Error(fallback);
  return new Error(String(error));
}

function waitForWorkerMessage(worker, accept, payload = null, label = 'worker reply') {
  if (!worker || typeof worker.on !== 'function' || typeof worker.off !== 'function' || typeof worker.postMessage !== 'function') {
    return Promise.reject(new TypeError(`${label} requires a Worker-like object`));
  }
  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = () => {
      worker.off('message', onMessage);
      worker.off('error', onError);
      worker.off('exit', onExit);
    };
    const finishResolve = (value) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(value);
    };
    const finishReject = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(asError(error, `${label} failed`));
    };
    const onMessage = (message) => {
      let decision;
      try {
        decision = accept(message);
      } catch (error) {
        finishReject(error);
        return;
      }
      if (decision === false) return;
      if (decision instanceof Error) finishReject(decision);
      else finishResolve(message);
    };
    const onError = (error) => finishReject(error);
    const onExit = (code) => finishReject(new Error(`${label} worker exited before reply with code ${code}`));
    worker.on('message', onMessage);
    worker.on('error', onError);
    worker.on('exit', onExit);
    if (payload !== null) {
      try {
        worker.postMessage(payload);
      } catch (error) {
        finishReject(error);
      }
    }
  });
}

function oneReply(worker, expectedType, payload) {
  const id = requestId++;
  return waitForWorkerMessage(
    worker,
    (message) => {
      if (message?.requestId !== id) return false;
      if (message.type !== expectedType) {
        return new Error(`request ${id} expected ${expectedType}, got ${message?.type}`);
      }
      return true;
    },
    { ...payload, requestId: id },
    `Branch Manager ${expectedType}`,
  );
}

async function terminateWorkers(workers) {
  await Promise.allSettled(workers.map((worker) => worker.terminate()));
}

export async function startOnlineBranchManager(spec, options = {}) {
  const worker = new Worker(new URL('./quotient-branch-manager-worker.mjs', import.meta.url), {
    workerData: {
      spec,
      prebuildGraph: options.prebuildGraph !== false,
      prefixClasses: options.prefixClasses ?? 4096,
      semanticTt: {
        entryCapacity: options.entryCapacity ?? (1 << 19),
        termCapacity: options.termCapacity ?? (1 << 24),
      },
      explore: {
        enabled: options.exploreEnabled === true,
        depth: options.exploreDepth ?? 3,
        reservoirTarget: options.exploreReservoirTarget ?? 4,
        backlogCapacity: options.exploreBacklogCapacity ?? 64,
      },
    },
  });

  const readyExplore = [];
  const exploreListeners = new Set();
  let listenerError = null;
  const onQueuedExplore = (message) => {
    if (message?.type !== 'explore-hint-queued' || !message.hint) return;
    if (exploreListeners.size === 0) {
      readyExplore.push(message.hint);
      return;
    }
    for (const listener of exploreListeners) {
      try {
        listener(message.hint);
      } catch (error) {
        listenerError ??= asError(error, 'explore listener failed');
      }
    }
  };
  worker.on('message', onQueuedExplore);

  let published;
  try {
    published = await waitForWorkerMessage(
      worker,
      (message) => message?.type === 'published',
      null,
      'Branch Manager publication',
    );
    if (!published.semanticArena) throw new Error('Branch Manager did not publish semantic TT arena');
  } catch (error) {
    worker.off('message', onQueuedExplore);
    await worker.terminate();
    throw error;
  }

  function assertHealthy() {
    if (listenerError) throw listenerError;
  }

  function subscribeExplore(listener) {
    assertHealthy();
    if (typeof listener !== 'function') throw new TypeError('explore listener must be a function');
    exploreListeners.add(listener);
    while (readyExplore.length > 0) listener(readyExplore.shift());
    return () => exploreListeners.delete(listener);
  }

  async function cleanup() {
    assertHealthy();
    const result = await oneReply(worker, 'cleanup-complete', { type: 'cleanup' });
    worker.off('message', onQueuedExplore);
    exploreListeners.clear();
    readyExplore.length = 0;
    return result;
  }

  return Object.freeze({
    worker,
    published,
    subscribeExplore,
    queuedExploreCount: () => readyExplore.length,
    reset: () => { assertHealthy(); return oneReply(worker, 'reset-complete', { type: 'reset' }); },
    cleanup,
    stopExplore: () => { assertHealthy(); return oneReply(worker, 'explore-session-stopped', { type: 'stop-explore-session' }); },
    completeExplore: (hintId, fragment) => {
      assertHealthy();
      return oneReply(worker, 'explore-hint-completed', { type: 'complete-explore-hint', hintId, fragment });
    },
    abandonExplore: (hintId) => {
      assertHealthy();
      return oneReply(worker, 'explore-hint-abandoned', { type: 'abandon-explore-hint', hintId });
    },
    takeExploreResult: () => { assertHealthy(); return oneReply(worker, 'explore-result', { type: 'take-explore-result' }); },
    buildPlan: (splitDepth, probeDepth = 2) => {
      assertHealthy();
      return oneReply(worker, 'plan-built', { type: 'build-plan', splitDepth, probeDepth });
    },
    reducePlan: (planId, frontierValues) => {
      assertHealthy();
      return oneReply(worker, 'plan-reduced', { type: 'reduce-plan', planId, frontierValues });
    },
    releasePlan: (planId) => {
      assertHealthy();
      return oneReply(worker, 'plan-released', { type: 'release-plan', planId });
    },
  });
}

export async function startOnlineSearchWorkers(count, spec, semanticArena, options = {}) {
  if (!Number.isInteger(count) || count < 1) throw new RangeError('search worker count must be a positive integer');
  if (!semanticArena || typeof semanticArena !== 'object') throw new TypeError('search workers require a semantic arena');

  const workers = [];
  const ready = [];
  try {
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
      ready.push(waitForWorkerMessage(
        worker,
        (message) => {
          if (message?.type !== 'ready') return new Error(`search worker ${workerId} emitted ${message?.type} before ready`);
          if (message.workerId !== workerId) return new Error(`search worker ready ID drift: expected ${workerId}, got ${message.workerId}`);
          return true;
        },
        null,
        `search worker ${workerId} startup`,
      ));
    }
    await Promise.all(ready);
    return workers;
  } catch (error) {
    await terminateWorkers(workers);
    throw error;
  }
}

function addMetrics(target, source) {
  for (const [key, value] of Object.entries(source ?? {})) {
    if (typeof value !== 'number') continue;
    if (!Number.isFinite(value)) throw new Error(`worker metric ${key} is not finite`);
    target[key] = (target[key] ?? 0) + value;
  }
}

export async function runOnlinePathTasks(workers, tasks) {
  if (!Array.isArray(workers) || workers.length < 1) throw new RangeError('runOnlinePathTasks requires workers');
  if (!Array.isArray(tasks)) throw new TypeError('runOnlinePathTasks tasks must be an array');
  if (tasks.length === 0) {
    return Object.freeze({
      solveMs: 0,
      frontierValues: Object.freeze([]),
      metrics: Object.freeze({}),
      workerTaskCounts: Object.freeze(Array(workers.length).fill(0)),
      localStateHighWater: Object.freeze(Array(workers.length).fill(0)),
      localClassHighWater: Object.freeze(Array(workers.length).fill(0)),
    });
  }

  const queue = [...tasks];
  const frontierValues = [];
  const metrics = {};
  const workerTaskCounts = Array(workers.length).fill(0);
  const localStateHighWater = Array(workers.length).fill(0);
  const localClassHighWater = Array(workers.length).fill(0);
  const activeTaskByWorker = new Map();
  let nextTaskId = 1;
  let completed = 0;
  const started = performance.now();

  await new Promise((resolve, reject) => {
    let settled = false;
    const listeners = new Map();
    const cleanup = () => {
      for (const [worker, listener] of listeners) {
        worker.off('message', listener.onMessage);
        worker.off('error', listener.onError);
        worker.off('exit', listener.onExit);
      }
      listeners.clear();
      activeTaskByWorker.clear();
    };
    const finishReject = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(asError(error, 'online path task failed'));
    };
    const finishResolve = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };
    const dispatch = (worker, workerIndex) => {
      const task = queue.shift();
      if (task === undefined) return;
      if (!task || !Number.isInteger(task.stateId) || task.stateId < 0 || !Array.isArray(task.path)) {
        finishReject(new TypeError('invalid online path task'));
        return;
      }
      const taskId = nextTaskId++;
      activeTaskByWorker.set(worker, taskId);
      workerTaskCounts[workerIndex] += 1;
      try {
        worker.postMessage({
          type: 'solve-path',
          taskId,
          plannerStateId: task.stateId,
          path: task.path,
        });
      } catch (error) {
        finishReject(error);
      }
    };

    workers.forEach((worker, workerIndex) => {
      const onMessage = (message) => {
        const activeTaskId = activeTaskByWorker.get(worker);
        if (activeTaskId === undefined) {
          finishReject(new Error(`worker ${workerIndex} replied without an active path task`));
          return;
        }
        if (message?.taskId !== activeTaskId) {
          finishReject(new Error(`worker ${workerIndex} replied for task ${message?.taskId}; expected ${activeTaskId}`));
          return;
        }
        activeTaskByWorker.delete(worker);
        if (message?.type === 'error') {
          finishReject(new Error(`worker ${message.workerId}: ${message.message}`));
          return;
        }
        if (message?.type !== 'result') {
          finishReject(new Error(`worker ${workerIndex} returned unexpected message ${message?.type}`));
          return;
        }
        try {
          assertWdlValue(message.value, `worker ${workerIndex} path result`);
          if (!Number.isInteger(message.plannerStateId) || message.plannerStateId < 0) {
            throw new Error(`worker ${workerIndex} returned invalid planner state ${message.plannerStateId}`);
          }
          frontierValues.push([message.plannerStateId, message.value]);
          addMetrics(metrics, message.metrics);
          const localStates = message.localStates ?? 0;
          const localClasses = message.localClasses ?? 0;
          if (!Number.isFinite(localStates) || localStates < 0 || !Number.isFinite(localClasses) || localClasses < 0) {
            throw new Error(`worker ${workerIndex} returned invalid local resource counters`);
          }
          localStateHighWater[workerIndex] = Math.max(localStateHighWater[workerIndex], localStates);
          localClassHighWater[workerIndex] = Math.max(localClassHighWater[workerIndex], localClasses);
        } catch (error) {
          finishReject(error);
          return;
        }
        completed += 1;
        if (completed === tasks.length) finishResolve();
        else dispatch(worker, workerIndex);
      };
      const onError = (error) => finishReject(error);
      const onExit = (code) => finishReject(new Error(`worker ${workerIndex} exited during path tasks with code ${code}`));
      listeners.set(worker, { onMessage, onError, onExit });
      worker.on('message', onMessage);
      worker.on('error', onError);
      worker.on('exit', onExit);
      dispatch(worker, workerIndex);
    });
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
