export function createSearchWorkerExecutor(workers, options = {}) {
  if (!Array.isArray(workers) || workers.length < 1) throw new RangeError('workers must be non-empty');

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
  let nextTaskId = 1;
  let nextSequence = 1;
  let closed = false;
  let backgroundError = null;
  const metrics = {
    submitted: 0,
    completed: 0,
    failed: 0,
    maxQueued: 0,
    exploreQueued: 0,
    exploreStarted: 0,
    exploreCompleted: 0,
    exploreFailed: 0,
    workerTasks: Array(workers.length).fill(0),
  };
  const workerResources = Array.from({ length: workers.length }, () => ({
    localStatesHighWater: 0,
    localClassesHighWater: 0,
    localTypedBytesHighWater: 0,
    descriptorStateBuildsHighWater: 0,
    descriptorClassBuildsHighWater: 0,
    descriptorTermIdsCachedHighWater: 0,
    isolateHeapUsedHighWater: 0,
    isolateExternalHighWater: 0,
    isolateArrayBuffersHighWater: 0,
  }));

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
    const tracked = Promise.resolve(promise)
      .catch((error) => {
        backgroundError ??= error;
      })
      .finally(() => {
        sideEffects.delete(tracked);
        notifyDrained();
      });
    sideEffects.add(tracked);
  }

  function observeWorkerResources(workerIndex, message) {
    const resource = workerResources[workerIndex];
    if (!resource || !message || message.type === 'error') return;
    resource.localStatesHighWater = Math.max(resource.localStatesHighWater, message.localStates ?? 0);
    resource.localClassesHighWater = Math.max(resource.localClassesHighWater, message.localClasses ?? 0);
    resource.localTypedBytesHighWater = Math.max(resource.localTypedBytesHighWater, message.localTypedBytes ?? 0);
    resource.descriptorStateBuildsHighWater = Math.max(
      resource.descriptorStateBuildsHighWater,
      message.descriptorCache?.stateBuilds ?? 0,
    );
    resource.descriptorClassBuildsHighWater = Math.max(
      resource.descriptorClassBuildsHighWater,
      message.descriptorCache?.classBuilds ?? 0,
    );
    resource.descriptorTermIdsCachedHighWater = Math.max(
      resource.descriptorTermIdsCachedHighWater,
      message.descriptorCache?.termIdsCached ?? 0,
    );
    resource.isolateHeapUsedHighWater = Math.max(
      resource.isolateHeapUsedHighWater,
      message.isolateMemory?.heapUsed ?? 0,
    );
    resource.isolateExternalHighWater = Math.max(
      resource.isolateExternalHighWater,
      message.isolateMemory?.external ?? 0,
    );
    resource.isolateArrayBuffersHighWater = Math.max(
      resource.isolateArrayBuffersHighWater,
      message.isolateMemory?.arrayBuffers ?? 0,
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
    if (closed) {
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
    if (!active || message?.taskId !== active.taskId) return;
    observeWorkerResources(workerIndex, message);
    busy.delete(worker);
    const slot = { worker, workerIndex };

    if (active.kind === 'explore') {
      if (message?.type === 'error') {
        metrics.exploreFailed += 1;
        backgroundError ??= new Error(message.message ?? `explore hint ${active.hintId} failed`);
        if (abandonExploreHint) trackSideEffect(abandonExploreHint(active.hintId));
      } else if (message?.type === 'explore-result') {
        metrics.exploreCompleted += 1;
        if (!completeExploreHint) {
          backgroundError ??= new Error('explore result has no Branch Manager completion handler');
        } else {
          trackSideEffect(completeExploreHint(active.hintId, message.fragment));
        }
      } else {
        backgroundError ??= new Error(`unexpected explore worker response ${message?.type}`);
      }
      idle.push(slot);
      pump();
      return;
    }

    const task = pending.get(active.taskId);
    if (!task) {
      backgroundError ??= new Error(`missing authoritative task ${active.taskId}`);
      idle.push(slot);
      pump();
      return;
    }
    pending.delete(active.taskId);
    if (message?.type === 'error') {
      metrics.failed += 1;
      task.reject(new Error(message.message ?? `worker task ${active.taskId} failed`));
    } else if (message?.type === 'result') {
      metrics.completed += 1;
      task.resolve(message);
    } else {
      backgroundError ??= new Error(`unexpected authoritative worker response ${message?.type}`);
    }
    idle.push(slot);
    pump();
  }

  for (let workerIndex = 0; workerIndex < workers.length; workerIndex += 1) {
    const worker = workers[workerIndex];
    const onMessage = (message) => settleWorker(worker, workerIndex, message);
    const onError = (error) => {
      const active = busy.get(worker);
      if (active) {
        busy.delete(worker);
        if (active.kind === 'authoritative') {
          const task = pending.get(active.taskId);
          pending.delete(active.taskId);
          metrics.failed += 1;
          task?.reject(error);
        } else {
          metrics.exploreFailed += 1;
          if (abandonExploreHint) trackSideEffect(abandonExploreHint(active.hintId));
        }
      }
      backgroundError ??= error;
      notifyDrained();
    };
    worker.on('message', onMessage);
    worker.on('error', onError);
    listeners.set(worker, { onMessage, onError });
  }

  function submit(message, priority = 0) {
    if (closed) throw new Error('search worker executor is closed');
    if (backgroundError) throw backgroundError;
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
    if (!hint || !Number.isInteger(hint.hintId) || !Array.isArray(hint.path) || !Number.isInteger(hint.depth) || hint.depth < 1) {
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
      workerTasks: Object.freeze([...metrics.workerTasks]),
      workerResources: Object.freeze(workerResources.map((resource) => Object.freeze({ ...resource }))),
    });
  }

  function close() {
    if (!isDrained()) throw new Error('cannot close search worker executor with active tasks');
    if (backgroundError) throw backgroundError;
    closed = true;
    for (const [worker, listener] of listeners) {
      worker.off('message', listener.onMessage);
      worker.off('error', listener.onError);
    }
    listeners.clear();
  }

  return Object.freeze({ submit, enqueueExploreHint, drain, stats, close });
}
