import { parentPort, workerData } from 'node:worker_threads';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import {
  solveStateWdl,
  WORKER_SEARCH_STOPPED,
} from './quotient-slot64-worker-negamax-lib.mjs';
import {
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
} from './quotient-native-negamax-support-layout-kernel.mjs';

if (!parentPort) throw new Error('worker parent port is required');

const stopView = new Int32Array(workerData.stopBuffer);
const { kernel } = createSlot64ResidualQuotientKernel(workerData.spec, {
  cacheEdges: true,
  prefixClasses: workerData.prefixClasses ?? 4096,
});

parentPort.postMessage({
  type: 'ready',
  workerId: workerData.workerId,
  rootId: kernel.rootId,
});

parentPort.on('message', (message) => {
  if (message?.type !== 'solve-column') return;
  const { taskId, column } = message;
  const started = performance.now();
  try {
    if (Atomics.load(stopView, 0) !== 0) {
      parentPort.postMessage({ type: 'stopped', taskId, column, workerId: workerData.workerId });
      return;
    }
    const child = kernel.advance(kernel.rootId, column);
    if (child === QN_ILLEGAL) {
      parentPort.postMessage({
        type: 'result', taskId, column, workerId: workerData.workerId,
        value: null, elapsedMs: performance.now() - started,
        metrics: null,
      });
      return;
    }
    if (child === QN_TERMINAL_WIN) {
      parentPort.postMessage({
        type: 'result', taskId, column, workerId: workerData.workerId,
        value: 1, elapsedMs: performance.now() - started,
        metrics: { calls: 0, expanded: 0, transitionsRequested: 1 },
      });
      return;
    }
    const solved = solveStateWdl(kernel, child, {
      etc: workerData.etc !== false,
      etcMinRemaining: workerData.etcMinRemaining ?? 0,
      stopView,
    });
    parentPort.postMessage({
      type: 'result',
      taskId,
      column,
      workerId: workerData.workerId,
      value: -solved.value,
      elapsedMs: performance.now() - started,
      metrics: solved.metrics,
      kernel: {
        states: kernel.states.count,
        classes: kernel.classes.size,
      },
    });
  } catch (error) {
    if (error === WORKER_SEARCH_STOPPED) {
      parentPort.postMessage({ type: 'stopped', taskId, column, workerId: workerData.workerId });
      return;
    }
    parentPort.postMessage({
      type: 'error',
      taskId,
      column,
      workerId: workerData.workerId,
      message: error instanceof Error ? error.stack ?? error.message : String(error),
    });
  }
});
