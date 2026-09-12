export function createSearchWorkerExecutor(workers, options = {}) {
  if (!Array.isArray(workers) || workers.length < 1) throw new RangeError('workers must be non-empty');
  if (new Set(workers).size !== workers.length) throw new Error('search worker executor requires unique workers');
  for (const worker of workers) {
    if (!worker || typeof worker.postMessage !== 'function' || typeof worker.on !== 'function' || typeof worker.off !== 'function') {
      throw new TypeError('search worker executor received an invalid worker');
    }
  }

  const completeExploreHint = typeof options.completeExploreHint === 'function' ? options.completeExploreHint : null;
  const abandonExploreHint = typeof options.abandonExploreHint === 'function' ? options.abandonExploreHint : null;

  const queue = [];
  const exploreQueue = [];
  const idle = workers.map((worker, workerIndex) => ({ worker, workerIndex }));
  const busy = new Map();
  const pending = new Map();
  const listeners = new Map();
  const drainWaiters = [];
  const sideEffects = new Set();
  const failedWorkers = new Set();
  const abandonedHints = new Set();
  let nextTaskId = 1;
  let nextSequence = 1;
  let closed = false;
  let backgroundError = null;
  const metrics = {
    submitted: 0,
    completed: 0,
    failed: 0,
    aborted: 0,
    maxQueued: 0,
    exploreQueued: 0,
    exploreStarted: 0,
    exploreCompleted: 0,
    exploreFailed: 0,
    workerFaults: 0,
    workerTasks: Array(workers.length).fill(0),
  };
  const workerResources = Array.from({ length: workers.length }, () => ({
    localStatesHighWater: 0,
    localClassesHighWater: 0,
    localTypedBytesHighWater: 0,
    onlineStateCapacityHighWater: 0,
    onlineStateBytesPerStateAvoided: 0,
    onlineStateLocalProofBytesAvoidedHighWater: 0,
    onlineStateLocalProofBytesRetainedHighWater: 0,
    descriptorStateBuildsHighWater: 0,
    descriptorClassBuildsHighWater: 0,
    descriptorTermIdsCachedHighWater: 0,
    descriptorTermArrayObjectsCachedHighWater: 0,
    descriptorClassObjectsCachedHighWater: 0,
    descriptorClassMetadataBytesHighWater: 0,
    descriptorTermArenaBytesHighWater: 0,
    descriptorRetainedTypedBytesHighWater: 0,
    descriptorClassCapacityHighWater: 0,
    descriptorTermCapacityHighWater: 0,
    isolateHeapUsedHighWater: 0,
    isolateExternalHighWater: 0,
    isolateArrayBuffersHighWater: 0,
  }));

  function asError(error, fallback) {
    if (error instanceof Error) return error;
    if (error === undefined || error === null) return new Error(fallback);
    return new Error(String(error));
  }

  function finiteCounter(value, label) {
    const actual = value ?? 0;
    if (!Number.isFinite(actual) || actual < 0) throw new Error(`${label} must be finite and non-negative, got ${actual}`);
    return actual;
  }

  function isDrained() {
    return queue.length === 0
      && exploreQueue.length === 0
      && busy.size === 0
      && pending.size === 0
      && sideEffects.size === 0;
  }

  function notifyDrained() {
    if (!isDrained()) return;
    while (drainWaiters.length > 0) {
      const waiter = drainWaiters.shift();
      if (backgroundError) waiter.reject(backgroundError);
      else waiter.resolve();
    }
  }

  function trackSideEffect(promise) {
    let tracked;
    tracked = Promise.resolve(promise)
      .catch((error) => {
        poison(error);
      })
      .finally(() => {
        sideEffects.delete(tracked);
        notifyDrained();
      });
    sideEffects.add(tracked);
  }

  function abandonHintOnce(hintId) {
    if (!Number.isInteger(hintId) || abandonedHints.has(hintId)) return;
    abandonedHints.add(hintId);
    if (abandonExploreHint) trackSideEffect(abandonExploreHint(hintId));
  }

  function rejectPendingTask(taskId, error, failed = false) {
    const task = pending.get(taskId);
    if (!task) return false;
    pending.delete(taskId);
    if (failed) metrics.failed += 1;
    else metrics.aborted += 1;
    task.reject(error);
    return true;
  }

  function poison(error, failedWorker = null) {
    const fatal = asError(error, 'search worker executor failed');
    if (backgroundError === null) backgroundError = fatal;
    if (failedWorker && !failedWorkers.has(failedWorker)) {
      failedWorkers.add(failedWorker);
      metrics.workerFaults += 1;
    }

    while (queue.length > 0) {
      const task = queue.shift();
      rejectPendingTask(task.taskId, backgroundError, false);
    }
    while (exploreQueue.length > 0) abandonHintOnce(exploreQueue.shift().hintId);

    for (const [worker, active] of busy) {
      if (active.kind === 'authoritative') rejectPendingTask(active.taskId, backgroundError, false);
      else abandonHintOnce(active.hintId);
      if (worker === failedWorker) busy.delete(worker);
    }
    idle.length = 0;
    notifyDrained();
  }

  function observeWorkerResources(workerIndex, message) {
    const resource = workerResources[workerIndex];
    if (!resource || !message || message.type === 'error') return;
    resource.localStatesHighWater = Math.max(resource.localStatesHighWater, finiteCounter(message.localStates, 'worker localStates'));
    resource.localClassesHighWater = Math.max(resource.localClassesHighWater, finiteCounter(message.localClasses, 'worker localClasses'));
    resource.localTypedBytesHighWater = Math.max(resource.localTypedBytesHighWater, finiteCounter(message.localTypedBytes, 'worker localTypedBytes'));
    resource.onlineStateCapacityHighWater = Math.max(
      resource.onlineStateCapacityHighWater,
      finiteCounter(message.onlineStateStorage?.stateCapacity, 'worker online state capacity'),
    );
    resource.onlineStateBytesPerStateAvoided = Math.max(
      resource.onlineStateBytesPerStateAvoided,
      finiteCounter(message.onlineStateStorage?.bytesPerStateAvoided, 'worker avoided state bytes'),
    );
    resource.onlineStateLocalProofBytesAvoidedHighWater = Math.max(
      resource.onlineStateLocalProofBytesAvoidedHighWater,
      finiteCounter(message.onlineStateStorage?.localProofBytesAvoided, 'worker avoided proof bytes'),
    );
    resource.onlineStateLocalProofBytesRetainedHighWater = Math.max(
      resource.onlineStateLocalProofBytesRetainedHighWater,
      finiteCounter(message.onlineStateStorage?.localProofBytesRetained, 'worker retained proof bytes'),
    );
    resource.descriptorStateBuildsHighWater = Math.max(
      resource.descriptorStateBuildsHighWater,
      finiteCounter(message.descriptorCache?.stateBuilds, 'descriptor state builds'),
    );
    resource.descriptorClassBuildsHighWater = Math.max(
      resource.descriptorClassBuildsHighWater,
      finiteCounter(message.descriptorCache?.classBuilds, 'descriptor class builds'),
    );
    resource.descriptorTermIdsCachedHighWater = Math.max(
      resource.descriptorTermIdsCachedHighWater,
      finiteCounter(message.descriptorCache?.termIdsCached, 'descriptor cached term IDs'),
    );
    resource.descriptorTermArrayObjectsCachedHighWater = Math.max(
      resource.descriptorTermArrayObjectsCachedHighWater,
      finiteCounter(message.descriptorCache?.termArrayObjectsCached, 'descriptor term arrays'),
    );
    resource.descriptorClassObjectsCachedHighWater = Math.max(
      resource.descriptorClassObjectsCachedHighWater,
      finiteCounter(message.descriptorCache?.classDescriptorObjectsCached, 'descriptor class objects'),
    );
    resource.descriptorClassMetadataBytesHighWater = Math.max(
      resource.descriptorClassMetadataBytesHighWater,
      finiteCounter(message.descriptorCache?.classMetadataBytes, 'descriptor class metadata bytes'),
    );
    resource.descriptorTermArenaBytesHighWater = Math.max(
      resource.descriptorTermArenaBytesHighWater,
      finiteCounter(message.descriptorCache?.termArenaBytes, 'descriptor term arena bytes'),
    );
    resource.descriptorRetainedTypedBytesHighWater = Math.max(
      resource.descriptorRetainedTypedBytesHighWater,
      finiteCounter(message.descriptorCache?.retainedTypedBytes, 'descriptor retained typed bytes'),
    );
    resource.descriptorClassCapacityHighWater = Math.max(
      resource.descriptorClassCapacityHighWater,
      finiteCounter(message.descriptorCache?.classCapacity, 'descriptor class capacity'),
    );
    resource.descriptorTermCapacityHighWater = Math.max(
      resource.descriptorTermCapacityHighWater,
      finiteCounter(message.descriptorCache?.termCapacity, 'descriptor term capacity'),
    );
    resource.isolateHeapUsedHighWater = Math.max(
      resource.isolateHeapUsedHighWater,
      finiteCounter(message.isolateMemory?.heapUsed, 'worker heap used'),
    );
    resource.isolateExternalHighWater = Math.max(
      resource.isolateExternalHighWater,
      finiteCounter(message.isolateMemory?.external, 'worker external bytes'),
    );
    resource.isolateArrayBuffersHighWater = Math.max(
      resource.isolateArrayBuffersHighWater,
      finiteCounter(message.isolateMemory?.arrayBuffers, 'worker ArrayBuffer bytes'),
    );
  }

  function reorderQueue() {
    queue.sort((a, b) => b.priority - a.priority || a.sequence - b.sequence);
  }

  function dispatchAuthoritative(slot, task) {
    busy.set(slot.worker, Object.freeze({ taskId: task.taskId, kind: 'authoritative' }));
    metrics.workerTasks[slot.workerIndex] += 1;
    slot.worker.postMessage({ ...task.message, taskId: task.taskId });
  }

  function dispatchExplore(slot, hint) {
    const taskId = nextTaskId++;
    busy.set(slot.worker, Object.freeze({ taskId, kind: 'explore', hintId: hint.hintId }));
    metrics.exploreStarted += 1;
    metrics.workerTasks[slot.workerIndex] += 1;
    slot.worker.postMessage({
      type: 'explore-path',
      taskId,
      hintId: hint.hintId,
      path: hint.path,
      depth: hint.depth,
    });
  }

  function pump() {
    if (closed || backgroundError) {
      notifyDrained();
      return;
    }

    while (idle.length > 0 && queue.length > 0) {
      reorderQueue();
      dispatchAuthoritative(idle.shift(), queue.shift());
    }

    while (idle.length > 0 && queue.length === 0 && exploreQueue.length > 0) {
      dispatchExplore(idle.shift(), exploreQueue.shift());
    }

    notifyDrained();
  }

  function settleWorker(worker, workerIndex, message) {
    const active = busy.get(worker);
    if (!active) {
      if (backgroundError || failedWorkers.has(worker)) return;
      poison(new Error(`worker ${workerIndex} replied with no active task`), worker);
      return;
    }
    if (message?.taskId !== active.taskId) {
      poison(new Error(`worker ${workerIndex} replied for task ${message?.taskId}; expected ${active.taskId}`), worker);
      return;
    }
    observeWorkerResources(workerIndex, message);
    busy.delete(worker);

    if (backgroundError) {
      notifyDrained();
      return;
    }

    const slot = { worker, workerIndex };
    if (active.kind === 'explore') {
      if (message?.type === 'error') {
        metrics.exploreFailed += 1;
        abandonHintOnce(active.hintId);
        poison(new Error(message.message ?? `explore hint ${active.hintId} failed`), worker);
        return;
      }
      if (message?.type !== 'explore-result') {
        metrics.exploreFailed += 1;
        abandonHintOnce(active.hintId);
        poison(new Error(`unexpected explore worker response ${message?.type}`), worker);
        return;
      }
      metrics.exploreCompleted += 1;
      if (!completeExploreHint) {
        poison(new Error('explore result has no Branch Manager completion handler'));
        return;
      }
      trackSideEffect(completeExploreHint(active.hintId, message.fragment));
      idle.push(slot);
      pump();
      return;
    }

    const task = pending.get(active.taskId);
    if (!task) {
      poison(new Error(`missing authoritative task ${active.taskId}`), worker);
      return;
    }
    if (message?.type === 'error') {
      rejectPendingTask(active.taskId, new Error(message.message ?? `worker task ${active.taskId} failed`), true);
      poison(new Error(message.message ?? `worker task ${active.taskId} failed`), worker);
      return;
    }
    if (message?.type !== 'result') {
      rejectPendingTask(active.taskId, new Error(`unexpected authoritative worker response ${message?.type}`), true);
      poison(new Error(`unexpected authoritative worker response ${message?.type}`), worker);
      return;
    }

    pending.delete(active.taskId);
    metrics.completed += 1;
    task.resolve(message);
    idle.push(slot);
    pump();
  }

  function failActiveWorker(worker, error) {
    const active = busy.get(worker);
    if (!active) return;
    busy.delete(worker);
    if (active.kind === 'authoritative') rejectPendingTask(active.taskId, error, true);
    else {
      metrics.exploreFailed += 1;
      abandonHintOnce(active.hintId);
    }
  }

  for (let workerIndex = 0; workerIndex < workers.length; workerIndex += 1) {
    const worker = workers[workerIndex];
    const onMessage = (message) => {
      try {
        settleWorker(worker, workerIndex, message);
      } catch (error) {
        failActiveWorker(worker, asError(error, `worker ${workerIndex} message handling failed`));
        poison(error, worker);
      }
    };
    const onError = (error) => {
      const fatal = asError(error, `worker ${workerIndex} failed`);
      failActiveWorker(worker, fatal);
      poison(fatal, worker);
    };
    const onExit = (code) => {
      if (closed) return;
      if (failedWorkers.has(worker)) {
        busy.delete(worker);
        notifyDrained();
        return;
      }
      const fatal = new Error(`worker ${workerIndex} exited before executor close with code ${code}`);
      failActiveWorker(worker, fatal);
      poison(fatal, worker);
    };
    worker.on('message', onMessage);
    worker.on('error', onError);
    worker.on('exit', onExit);
    listeners.set(worker, { onMessage, onError, onExit });
  }

  function submit(message, priority = 0) {
    if (closed) throw new Error('search worker executor is closed');
    if (backgroundError) throw backgroundError;
    if (!message || typeof message !== 'object') throw new TypeError('search worker task message must be an object');
    if (!Number.isFinite(priority)) throw new RangeError(`search worker priority must be finite, got ${priority}`);
    const taskId = nextTaskId++;
    metrics.submitted += 1;
    return new Promise((resolve, reject) => {
      pending.set(taskId, { resolve, reject });
      queue.push({ taskId, message, priority, sequence: nextSequence++ });
      if (queue.length > metrics.maxQueued) metrics.maxQueued = queue.length;
      pump();
    });
  }

  function enqueueExploreHint(hint) {
    if (closed) return false;
    if (backgroundError) throw backgroundError;
    if (!hint || !Number.isInteger(hint.hintId) || hint.hintId < 1
        || !Array.isArray(hint.path) || !Number.isInteger(hint.depth) || hint.depth < 1) {
      throw new TypeError('invalid Branch Manager explore hint');
    }
    exploreQueue.push(hint);
    metrics.exploreQueued += 1;
    pump();
    return true;
  }

  function drain() {
    if (isDrained()) {
      if (backgroundError) return Promise.reject(backgroundError);
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => drainWaiters.push({ resolve, reject }));
  }

  function stats() {
    return Object.freeze({
      submitted: metrics.submitted,
      completed: metrics.completed,
      failed: metrics.failed,
      aborted: metrics.aborted,
      workerFaults: metrics.workerFaults,
      maxQueued: metrics.maxQueued,
      exploreQueued: metrics.exploreQueued,
      exploreStarted: metrics.exploreStarted,
      exploreCompleted: metrics.exploreCompleted,
      exploreFailed: metrics.exploreFailed,
      queued: queue.length,
      exploreReady: exploreQueue.length,
      active: busy.size,
      pending: pending.size,
      backgroundSideEffects: sideEffects.size,
      poisoned: backgroundError !== null,
      workerTasks: Object.freeze([...metrics.workerTasks]),
      workerResources: Object.freeze(workerResources.map((resource) => Object.freeze({ ...resource }))),
    });
  }

  function detachListeners() {
    for (const [worker, listener] of listeners) {
      worker.off('message', listener.onMessage);
      worker.off('error', listener.onError);
      worker.off('exit', listener.onExit);
    }
    listeners.clear();
  }

  function close() {
    if (!isDrained()) throw new Error('cannot close search worker executor with active tasks');
    closed = true;
    detachListeners();
    if (backgroundError) throw backgroundError;
  }

  return Object.freeze({ submit, enqueueExploreHint, drain, stats, close });
}
