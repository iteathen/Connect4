import { parentPort, workerData } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';
import { createSharedTtGraphSearcher } from './quotient-shared-tt-search-lib.mjs';

const searcher = createSharedTtGraphSearcher(workerData.shared, {
  workerSalt: workerData.workerId ?? 0,
});

parentPort.postMessage({ type: 'ready', workerId: workerData.workerId });
parentPort.on('message', (message) => {
  if (message?.type !== 'solve-column') return;
  const started = performance.now();
  const value = searcher.solveRootColumn(message.column);
  parentPort.postMessage({
    type: 'result',
    taskId: message.taskId,
    workerId: workerData.workerId,
    column: message.column,
    value,
    elapsedMs: performance.now() - started,
    metrics: { ...searcher.metrics },
  });
});
