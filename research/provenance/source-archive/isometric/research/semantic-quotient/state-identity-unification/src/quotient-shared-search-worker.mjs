import { parentPort, workerData } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';
import { createSharedTtGraphSearcher } from './quotient-shared-tt-search-lib.mjs';

const searcher = createSharedTtGraphSearcher(workerData.shared, {
  workerSalt: workerData.workerId ?? 0,
});

function metricDelta(before, after) {
  const delta = {};
  for (const [key, value] of Object.entries(after)) delta[key] = value - (before[key] ?? 0);
  return delta;
}

parentPort.postMessage({ type: 'ready', workerId: workerData.workerId });
parentPort.on('message', (message) => {
  if (message?.type !== 'solve-column' && message?.type !== 'solve-state' && message?.type !== 'search-state') return;
  const before = { ...searcher.metrics };
  const started = performance.now();
  const value = message.type === 'search-state'
    ? searcher.search(message.stateId, message.alpha, message.beta)
    : message.type === 'solve-state'
      ? searcher.solveState(message.stateId)
      : searcher.solveRootColumn(message.column);
  parentPort.postMessage({
    type: 'result',
    taskId: message.taskId,
    workerId: workerData.workerId,
    column: message.column ?? null,
    stateId: message.stateId ?? null,
    alpha: message.alpha ?? null,
    beta: message.beta ?? null,
    value,
    elapsedMs: performance.now() - started,
    metrics: metricDelta(before, searcher.metrics),
  });
});
