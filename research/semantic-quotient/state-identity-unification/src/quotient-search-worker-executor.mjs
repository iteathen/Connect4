export function createSearchWorkerExecutor(workers) {
  if (!Array.isArray(workers) || workers.length < 1) throw new RangeError('workers must be non-empty');

  const queue = [];
  const idle = workers.map((worker, workerIndex) => ({ worker, workerIndex }));
  const busy = new Map();
  const pending = new Map();
  const listeners = new Map();
  let nextTaskId = 1;
  let nextSequence = 1;
  let closed = false;
  const metrics = {
    submitted: 0,
    completed: 0,
    failed: 0,
    maxQueued: 0,
    workerTasks: Array(workers.length).fill(0),
  };

  function reorderQueue() {
    queue.sort((a, b) => b.priority - a.priority || a.sequence - b.sequence);
  }

  function pump() {
    if (closed) return;
    while (idle.length > 0 && queue.length > 0) {
      reorderQueue();
      const slot = idle.shift();
      const task = queue.shift();
      busy.set(slot.worker, task.taskId);
      metrics.workerTasks[slot.workerIndex] += 1;
      slot.worker.postMessage({ ...task.message, taskId: task.taskId });
    }
  }

  function settleWorker(worker, workerIndex, message) {
    const taskId = busy.get(worker);
    if (taskId === undefined) return;
    if (message?.taskId !== taskId) return;
    const task = pending.get(taskId);
    if (!task) return;
    busy.delete(worker);
    pending.delete(taskId);
    idle.push({ worker, workerIndex });
    if (message?.type === 'error') {
      metrics.failed += 1;
      task.reject(new Error(message.message ?? `worker task ${taskId} failed`));
    } else if (message?.type === 'result') {
      metrics.completed += 1;
      task.resolve(message);
    } else {
      return;
    }
    pump();
  }

  for (let workerIndex = 0; workerIndex < workers.length; workerIndex += 1) {
    const worker = workers[workerIndex];
    const onMessage = (message) => settleWorker(worker, workerIndex, message);
    const onError = (error) => {
      const taskId = busy.get(worker);
      if (taskId !== undefined) {
        const task = pending.get(taskId);
        busy.delete(worker);
        pending.delete(taskId);
        metrics.failed += 1;
        task?.reject(error);
      }
    };
    worker.on('message', onMessage);
    worker.on('error', onError);
    listeners.set(worker, { onMessage, onError });
  }

  function submit(message, priority = 0) {
    if (closed) throw new Error('search worker executor is closed');
    const taskId = nextTaskId++;
    metrics.submitted += 1;
    return new Promise((resolve, reject) => {
      pending.set(taskId, { resolve, reject });
      queue.push({ taskId, message, priority, sequence: nextSequence++ });
      if (queue.length > metrics.maxQueued) metrics.maxQueued = queue.length;
      pump();
    });
  }

  function stats() {
    return Object.freeze({
      submitted: metrics.submitted,
      completed: metrics.completed,
      failed: metrics.failed,
      maxQueued: metrics.maxQueued,
      queued: queue.length,
      active: busy.size,
      workerTasks: Object.freeze([...metrics.workerTasks]),
    });
  }

  function close() {
    if (queue.length !== 0 || busy.size !== 0 || pending.size !== 0) {
      throw new Error('cannot close search worker executor with active tasks');
    }
    closed = true;
    for (const [worker, listener] of listeners) {
      worker.off('message', listener.onMessage);
      worker.off('error', listener.onError);
    }
    listeners.clear();
  }

  return Object.freeze({ submit, stats, close });
}
