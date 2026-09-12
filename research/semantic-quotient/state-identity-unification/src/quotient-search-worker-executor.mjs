export function createSearchWorkerExecutor(workers, options = {}) {
  if (!Array.isArray(workers) || workers.length < 1) throw new RangeError('workers must be non-empty');

  const takeExploreHint = typeof options.takeExploreHint === 'function' ? options.takeExploreHint : null;
  const returnExploreHint = typeof options.returnExploreHint === 'function' ? options.returnExploreHint : null;
  const completeExploreHint = typeof options.completeExploreHint === 'function' ? options.completeExploreHint : null;

  const queue = [];
  const idle = workers.map((worker, workerIndex) => ({ worker, workerIndex }));
  const busy = new Map();
  const pending = new Map();
  const listeners = new Map();
  const drainWaiters = [];
  const hintRequests = new Set();
  const sideEffects = new Set();
  const hintMissEpoch = new Map();
  let hintEpoch = 1;
  let nextTaskId = 1;
  let nextSequence = 1;
  let closed = false;
  let backgroundError = null;
  const metrics = {
    submitted: 0,
    completed: 0,
    failed: 0,
    maxQueued: 0,
    exploreLeased: 0,
    exploreCompleted: 0,
    exploreFailed: 0,
    exploreReturned: 0,
    idleHintMisses: 0,
    workerTasks: Array(workers.length).fill(0),
  };

  function isDrained() {
    return queue.length === 0
      && busy.size === 0
      && pending.size === 0
      && hintRequests.size === 0
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
    return tracked;
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
    metrics.exploreLeased += 1;
    metrics.workerTasks[slot.workerIndex] += 1;
    slot.worker.postMessage({
      type: 'explore-path',
      taskId,
      hintId: hint.hintId,
      path: hint.path,
      depth: hint.depth,
    });
  }

  function requestExploreHint(slot) {
    if (!takeExploreHint) {
      idle.push(slot);
      return;
    }
    if (hintMissEpoch.get(slot.worker) === hintEpoch) {
      idle.push(slot);
      return;
    }

    hintRequests.add(slot.worker);
    Promise.resolve()
      .then(() => takeExploreHint())
      .then((reply) => {
        hintRequests.delete(slot.worker);
        const hint = reply?.hint ?? null;
        if (!hint) {
          metrics.idleHintMisses += 1;
          hintMissEpoch.set(slot.worker, hintEpoch);
          idle.push(slot);
          pump();
          return;
        }

        if (closed || queue.length > 0) {
          metrics.exploreReturned += 1;
          if (!returnExploreHint) {
            backgroundError ??= new Error('explore hint must be returned when authoritative work supersedes it');
            idle.push(slot);
            pump();
            return;
          }
          trackSideEffect(returnExploreHint(hint.hintId)).finally(() => {
            idle.push(slot);
            pump();
          });
          return;
        }

        dispatchExplore(slot, hint);
      })
      .catch((error) => {
        hintRequests.delete(slot.worker);
        backgroundError ??= error;
        idle.push(slot);
        pump();
      });
  }

  function pump() {
    if (closed) {
      notifyDrained();
      return;
    }

    while (idle.length > 0 && queue.length > 0) {
      reorderQueue();
      const slot = idle.shift();
      const task = queue.shift();
      dispatchAuthoritative(slot, task);
    }

    if (queue.length === 0 && takeExploreHint) {
      const candidates = idle.splice(0, idle.length);
      for (const slot of candidates) requestExploreHint(slot);
    }
    notifyDrained();
  }

  function settleWorker(worker, workerIndex, message) {
    const active = busy.get(worker);
    if (!active || message?.taskId !== active.taskId) return;
    busy.delete(worker);
    const slot = { worker, workerIndex };

    if (active.kind === 'explore') {
      if (message?.type === 'error') {
        metrics.exploreFailed += 1;
        backgroundError ??= new Error(message.message ?? `explore hint ${active.hintId} failed`);
        if (returnExploreHint) trackSideEffect(returnExploreHint(active.hintId));
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
          if (returnExploreHint) trackSideEffect(returnExploreHint(active.hintId));
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

  function notifyExploreHintsAvailable() {
    hintEpoch += 1;
    pump();
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
      exploreLeased: metrics.exploreLeased,
      exploreCompleted: metrics.exploreCompleted,
      exploreFailed: metrics.exploreFailed,
      exploreReturned: metrics.exploreReturned,
      idleHintMisses: metrics.idleHintMisses,
      queued: queue.length,
      active: busy.size,
      pending: pending.size,
      hintRequests: hintRequests.size,
      backgroundSideEffects: sideEffects.size,
      workerTasks: Object.freeze([...metrics.workerTasks]),
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

  return Object.freeze({ submit, notifyExploreHintsAvailable, drain, stats, close });
}
