import { parentPort, workerData } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';
import {
  buildSharedQuotientGraph,
  createSharedProofArena,
  resetSharedProofArena,
} from './quotient-shared-graph-lib.mjs';

if (!parentPort) throw new Error('dedup worker requires parentPort');

const started = performance.now();
const graph = buildSharedQuotientGraph(workerData.spec, {
  prefixClasses: workerData.prefixClasses ?? 4096,
});
const arena = createSharedProofArena(graph.stateCount);
const stats = {
  buildMs: performance.now() - started,
  canonicalStates: graph.stateCount,
  residualClasses: graph.residualClassCount,
  canonicalEdges: graph.edgeCount,
  resets: 0,
  cleanupPasses: 0,
};

parentPort.postMessage({ type: 'published', graph, arena, stats: { ...stats } });

parentPort.on('message', (message) => {
  if (message?.type === 'reset') {
    resetSharedProofArena(arena);
    stats.resets += 1;
    parentPort.postMessage({ type: 'reset-complete', requestId: message.requestId, stats: { ...stats } });
  } else if (message?.type === 'cleanup') {
    stats.cleanupPasses += 1;
    parentPort.postMessage({ type: 'cleanup-complete', requestId: message.requestId, stats: { ...stats } });
  }
});
