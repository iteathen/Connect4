import { Worker } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';
import { assertWdlValue } from './quotient-negamax-domain-contract.mjs';

let requestId = 1;
const unavailablePathWorkers = new WeakSet();
const activePathWorkers = new WeakSet();

function asError(error, fallback) {
  if (error instanceof Error) return error;
  if (error === undefined || error === null) return new Error(fallback);
  return new Error(String(error));
}

function positiveSafeInteger(value, label, maximum = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new RangeError(`${label} must be a safe integer in 1..${maximum}`);
  }
  return value;
}

function nextRequestId() {
  const id = positiveSafeInteger(requestId, 'Branch Manager requestId');
  if (requestId === Number.MAX_SAFE_INTEGER) throw new RangeError('Branch Manager requestId space exhausted');
  requestId += 1;
  return id;
}

function assertWorkerLike(worker, label) {
  if (!worker || typeof worker.on !== 'function' || typeof worker.off !== 'function'
      || typeof worker.postMessage !== 'function' || typeof worker.terminate !== 'function') {
    throw new TypeError(`${label} requires a Worker-like object`);
  }
}

function waitForWorkerMessage(worker, accept, payload = null, label = 'worker reply') {
  try {
    assertWorkerLike(worker, label);
  } catch (error) {
    return Promise.reject(error);
  }
  if (typeof accept !== 'function') return Promise.reject(new TypeError(`${label} requires an accept function`));
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
  if (typeof expectedType !== 'string' || expectedType.length === 0) throw new TypeError('expected reply type must be non-empty');
  if (!payload || typeof payload !== 'object' || typeof payload.type !== 'string') throw new TypeError('Branch Manager payload must have a type');
  const id = nextRequestId();
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
  const results = await Promise.allSettled(workers.map((worker) => worker.terminate()));
  const failures = results.filter((result) => result.status === 'rejected').map((result) => result.reason);
  if (failures.length > 0) throw new AggregateError(failures, 'one or more worker terminations failed');
}

export async function startOnlineBranchManager(spec, options = {}) {
  if (!spec || typeof spec !== 'object') throw new TypeError('Branch Manager requires a domain spec');
  const prefixClasses = positiveSafeInteger(options.prefixClasses ?? 4096, 'Branch Manager prefixClasses', 0x7fffffff);
  const entryCapacity = positiveSafeInteger(options.entryCapacity ?? (1 << 19), 'Branch Manager entryCapacity', 0x40000000);
  const termCapacity = positiveSafeInteger(options.termCapacity ?? (1 << 24), 'Branch Manager termCapacity', 0x7fffffff);
  const worker = new Worker(new URL('./quotient-branch-manager-worker.mjs', import.meta.url), {
    workerData: {
      spec,
      prebuildGraph: options.prebuildGraph !== false,
      prefixClasses,
      semanticTt: { entryCapacity, termCapacity },
      explore: {
        enabled: options.exploreEnabled === true,
        depth: options.exploreDepth ?? 3,
        reservoirTarget: options.exploreReservoirTarget ?? 4,
        backlogCapacity: options.exploreBacklogCapacity ?? 64,
        historyCapacity: options.exploreHistoryCapacity ?? 4096,
        completedCapacity: options.exploreCompletedCapacity ?? 64,
      },
    },
  });

  const readyExplore = [];
  const exploreListeners = new Set();
  let listenerError = null;
  const onManagerError = (error) => { listenerError ??= asError(error, 'Branch Manager failed'); };
  const onManagerExit = (code) => { listenerError ??= new Error(`Branch Manager exited with code ${code}`); };
  worker.on('error', onManagerError);
  worker.on('exit', onManagerExit);
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
    try {
      while (readyExplore.length > 0) listener(readyExplore.shift());
    } catch (error) {
      exploreListeners.delete(listener);
      listenerError ??= asError(error, 'explore listener failed while draining queued hints');
      throw listenerError;
    }
    return () => exploreListeners.delete(listener);
  }

  async function cleanup() {
    let result;
    try {
      // Cleanup must remain callable even after a client-side listener failure.
      if (worker.threadId === -1) throw listenerError ?? new Error('Branch Manager exited before cleanup');
      result = await oneReply(worker, 'cleanup-complete', { type: 'cleanup' });
    } finally {
      worker.off('message', onQueuedExplore);
      exploreListeners.clear();
      readyExplore.length = 0;
    }
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
      positiveSafeInteger(hintId, 'explore hintId');
      return oneReply(worker, 'explore-hint-completed', { type: 'complete-explore-hint', hintId, fragment });
    },
    abandonExplore: (hintId) => {
      assertHealthy();
      positiveSafeInteger(hintId, 'explore hintId');
      return oneReply(worker, 'explore-hint-abandoned', { type: 'abandon-explore-hint', hintId });
    },
    takeExploreResult: () => { assertHealthy(); return oneReply(worker, 'explore-result', { type: 'take-explore-result' }); },
    buildPlan: (splitDepth, probeDepth = 2) => {
      assertHealthy();
      return oneReply(worker, 'plan-built', { type: 'build-plan', splitDepth, probeDepth });
    },
    reducePlan: (planId, frontierValues) => {
      assertHealthy();
      positiveSafeInteger(planId, 'planId');
      if (!Array.isArray(frontierValues)) throw new TypeError('frontierValues must be an array');
      return oneReply(worker, 'plan-reduced', { type: 'reduce-plan', planId, frontierValues });
    },
    releasePlan: (planId) => {
      assertHealthy();
      positiveSafeInteger(planId, 'planId');
      return oneReply(worker, 'plan-released', { type: 'release-plan', planId });
    },
  });
}

export async function startOnlineSearchWorkers(count, spec, semanticArena, options = {}) {
  positiveSafeInteger(count, 'search worker count', 256);
  if (!spec || typeof spec !== 'object') throw new TypeError('search workers require a domain spec');
  if (!semanticArena || typeof semanticArena !== 'object') throw new TypeError('search workers require a semantic arena');
  const prefixClasses = positiveSafeInteger(options.prefixClasses ?? 4096, 'search worker prefixClasses', 0x7fffffff);

  const workers = [];
  const ready = [];
  const startupGuards = new Map();
  let rejectStartup;
  const startupFailure = new Promise((_, reject) => { rejectStartup = reject; });
  startupFailure.catch(() => {});
  try {
    for (let workerId = 0; workerId < count; workerId += 1) {
      const worker = new Worker(new URL('./quotient-online-semantic-search-worker.mjs', import.meta.url), {
        workerData: {
          workerId,
          spec,
          semanticArena,
          prefixClasses,
          etc: options.etc === true,
        },
      });
      workers.push(worker);
      const onError = (error) => rejectStartup(asError(error, `search worker ${workerId} startup failed`));
      const onExit = (code) => rejectStartup(new Error(`search worker ${workerId} exited during pool startup: ${code}`));
      worker.on('error', onError);
      worker.on('exit', onExit);
      startupGuards.set(worker, { onError, onExit });
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
    await Promise.race([Promise.all(ready), startupFailure]);
    return workers;
  } catch (error) {
    for (const pendingReady of ready) pendingReady.catch(() => {});
    try {
      await terminateWorkers(workers);
    } catch (terminationError) {
      throw new AggregateError([asError(error, 'search worker startup failed'), terminationError], 'search worker startup and cleanup failed');
    }
    throw error;
  } finally {
    // Observe any peers still completing startup on an early construction failure.
    await Promise.allSettled(ready);
    for (const [worker, guard] of startupGuards) {
      worker.off('error', guard.onError);
      worker.off('exit', guard.onExit);
    }
  }
}

export async function cleanupOnlineSession({ workers = [], executor = null, branchManager = null, unsubscribeExplore = null } = {}) {
  const errors = [];
  let managerStats = null;
  const attempt = async (operation) => {
    try { return await operation(); }
    catch (error) { errors.push(asError(error, 'online session cleanup failed')); return null; }
  };
  if (branchManager) await attempt(() => branchManager.stopExplore());
  if (unsubscribeExplore) await attempt(unsubscribeExplore);
  if (executor) {
    await attempt(() => executor.drain());
    await attempt(() => executor.close());
  }
  // Drain/close failure must never skip termination of the contaminated set.
  await attempt(() => terminateWorkers(workers));
  if (branchManager) {
    const reply = await attempt(() => branchManager.cleanup());
    managerStats = reply?.stats ?? null;
    await attempt(() => branchManager.worker.terminate());
  }
  if (errors.length) throw new AggregateError(errors, 'online session cleanup failed', { cause: errors[0] });
  return managerStats;
}

function addMetrics(target, source) {
  for (const [key, value] of Object.entries(source ?? {})) {
    if (typeof value !== 'number') continue;
    if (!Number.isFinite(value) || value < 0) throw new Error(`worker metric ${key} must be finite and non-negative`);
    target[key] = (target[key] ?? 0) + value;
  }
}

function assertPathTask(task) {
  if (!task || !Number.isSafeInteger(task.stateId) || task.stateId < 0 || !Array.isArray(task.path)) {
    throw new TypeError('invalid online path task');
  }
  for (let index = 0; index < task.path.length; index += 1) {
    const column = task.path[index];
    if (!Number.isSafeInteger(column) || column < 0) {
      throw new RangeError(`online path task column ${column} at ply ${index} must be non-negative`);
    }
  }
}

export async function runOnlinePathTasks(workers, tasks) {
  if (!Array.isArray(workers) || workers.length < 1) throw new RangeError('runOnlinePathTasks requires workers');
  if (new Set(workers).size !== workers.length) throw new Error('runOnlinePathTasks requires unique workers');
  for (let index = 0; index < workers.length; index += 1) assertWorkerLike(workers[index], `path worker ${index}`);
  if (!Array.isArray(tasks)) throw new TypeError('runOnlinePathTasks tasks must be an array');
  for (const task of tasks) assertPathTask(task);
  for (const worker of workers) {
    if (unavailablePathWorkers.has(worker) || worker.threadId === -1) throw new Error('path worker pool is unavailable after failure/exit');
    if (activePathWorkers.has(worker)) throw new Error('path worker already belongs to an active batch');
  }
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

  const queue = structuredClone(tasks);
  const frontierValues = [];
  const metrics = {};
  const workerTaskCounts = Array(workers.length).fill(0);
  const localStateHighWater = Array(workers.length).fill(0);
  const localClassHighWater = Array(workers.length).fill(0);
  const activeTaskByWorker = new Map();
  let nextTaskId = 1;
  let completed = 0;
  const started = performance.now();

  for (const worker of workers) activePathWorkers.add(worker);
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
      const fatal = asError(error, 'online path task failed');
      for (const worker of workers) unavailablePathWorkers.add(worker);
      cleanup();
      // A worker may still be executing the failed batch. Terminate the whole pool so
      // stale replies can never contaminate a later runOnlinePathTasks invocation.
      terminateWorkers(workers).then(
        () => reject(fatal),
        (terminationError) => reject(new AggregateError([fatal, terminationError], 'online path task and worker cleanup failed')),
      );
    };
    const finishResolve = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };
    const dispatch = (worker, workerIndex) => {
      if (settled) return;
      const task = queue.shift();
      if (task === undefined) return;
      if (nextTaskId === Number.MAX_SAFE_INTEGER) {
        finishReject(new RangeError('online path task ID space exhausted'));
        return;
      }
      const taskId = nextTaskId++;
      activeTaskByWorker.set(worker, { taskId, plannerStateId: task.stateId });
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
      if (settled) return;
      const onMessage = (message) => {
        const activeTask = activeTaskByWorker.get(worker);
        if (activeTask === undefined) {
          finishReject(new Error(`worker ${workerIndex} replied without an active path task`));
          return;
        }
        if (message?.taskId !== activeTask.taskId) {
          finishReject(new Error(`worker ${workerIndex} replied for task ${message?.taskId}; expected ${activeTask.taskId}`));
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
          if (message.plannerStateId !== activeTask.plannerStateId) {
            throw new Error(`worker ${workerIndex} returned invalid planner state ${message.plannerStateId}`);
          }
          frontierValues.push([message.plannerStateId, message.value]);
          addMetrics(metrics, message.metrics);
          const localStates = message.localStates ?? 0;
          const localClasses = message.localClasses ?? 0;
          if (!Number.isSafeInteger(localStates) || localStates < 0 || !Number.isSafeInteger(localClasses) || localClasses < 0) {
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
  }).finally(() => { for (const worker of workers) activePathWorkers.delete(worker); });

  return Object.freeze({
    solveMs: performance.now() - started,
    frontierValues: Object.freeze(frontierValues),
    metrics: Object.freeze(metrics),
    workerTaskCounts: Object.freeze(workerTaskCounts),
    localStateHighWater: Object.freeze(localStateHighWater),
    localClassHighWater: Object.freeze(localClassHighWater),
  });
}
