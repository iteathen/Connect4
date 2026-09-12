import { parentPort, workerData } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';
import { exploreQuotientPath } from './quotient-explore-path.mjs';
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

function localResourceSnapshot() {
  const memory = process.memoryUsage();
  return Object.freeze({
    localStates: kernel.states.count,
    localClasses: kernel.classes.size,
    localTypedBytes: kernel.memoryStats().totalTypedBytes,
    descriptorCache: Object.freeze({ ...searcher.descriptorCache.metrics }),
    isolateMemory: Object.freeze({
      heapUsed: memory.heapUsed,
      external: memory.external,
      arrayBuffers: memory.arrayBuffers,
    }),
  });
}

parentPort.postMessage({ type: 'ready', workerId: workerData.workerId });
parentPort.on('message', (message) => {
  if (message?.type !== 'solve-path' && message?.type !== 'search-path' && message?.type !== 'explore-path') return;
  const started = performance.now();
  try {
    if (message.type === 'explore-path') {
      const fragment = exploreQuotientPath(kernel, message.path, message.depth);
      parentPort.postMessage({
        type: 'explore-result',
        taskId: message.taskId,
        hintId: message.hintId,
        workerId: workerData.workerId,
        elapsedMs: performance.now() - started,
        fragment,
        ...localResourceSnapshot(),
      });
      return;
    }

    const before = snapshotMetrics();
    const solved = message.type === 'search-path'
      ? searcher.searchPath(message.path, message.alpha, message.beta)
      : searcher.solvePath(message.path);
    parentPort.postMessage({
      type: 'result',
      taskId: message.taskId,
      workerId: workerData.workerId,
      plannerStateId: message.plannerStateId ?? null,
      localStateId: solved.stateId,
      alpha: message.alpha ?? null,
      beta: message.beta ?? null,
      value: solved.value,
      elapsedMs: performance.now() - started,
      metrics: deltaMetrics(before),
      ...localResourceSnapshot(),
    });
  } catch (error) {
    parentPort.postMessage({
      type: 'error',
      taskId: message.taskId,
      hintId: message.hintId ?? null,
      workerId: workerData.workerId,
      plannerStateId: message.plannerStateId ?? null,
      message: error instanceof Error ? error.stack ?? error.message : String(error),
    });
  }
});
