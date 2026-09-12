import { parentPort, workerData } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createOnlineSemanticQuotientSearcher } from './quotient-online-semantic-search-lib.mjs';

if (!parentPort) throw new Error('online semantic search worker requires parentPort');

const { kernel } = createSlot64ResidualQuotientKernel(workerData.spec, {
  cacheEdges: false,
  prefixClasses: workerData.prefixClasses ?? 4096,
});
const searcher = createOnlineSemanticQuotientSearcher(kernel, workerData.semanticArena, {
  etc: workerData.etc === true,
});

function snapshotMetrics() {
  return { ...searcher.metrics };
}

function deltaMetrics(before) {
  const result = {};
  for (const [key, value] of Object.entries(searcher.metrics)) result[key] = value - (before[key] ?? 0);
  return result;
}

parentPort.postMessage({ type: 'ready', workerId: workerData.workerId });
parentPort.on('message', (message) => {
  if (message?.type !== 'solve-path') return;
  const before = snapshotMetrics();
  const started = performance.now();
  try {
    const solved = searcher.solvePath(message.path);
    parentPort.postMessage({
      type: 'result',
      taskId: message.taskId,
      workerId: workerData.workerId,
      plannerStateId: message.plannerStateId,
      localStateId: solved.stateId,
      value: solved.value,
      elapsedMs: performance.now() - started,
      metrics: deltaMetrics(before),
      localStates: kernel.states.count,
      localClasses: kernel.classes.size,
    });
  } catch (error) {
    parentPort.postMessage({
      type: 'error',
      taskId: message.taskId,
      workerId: workerData.workerId,
      plannerStateId: message.plannerStateId,
      message: error instanceof Error ? error.stack ?? error.message : String(error),
    });
  }
});
