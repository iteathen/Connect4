import { parentPort, workerData } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';
import {
  buildSharedQuotientGraph,
  createSharedProofArena,
  resetSharedProofArena,
} from './quotient-shared-graph-lib.mjs';
import {
  createSemanticSharedTtArena,
  resetSemanticSharedTtArena,
} from './quotient-semantic-shared-tt.mjs';
import {
  buildQuotientLookaheadWorkDag,
  reduceQuotientLookaheadWorkDag,
} from './quotient-lookahead-work-dag.mjs';

if (!parentPort) throw new Error('dedup worker requires parentPort');

const started = performance.now();
const graph = buildSharedQuotientGraph(workerData.spec, {
  prefixClasses: workerData.prefixClasses ?? 4096,
});
const arena = createSharedProofArena(graph.stateCount);
const semanticArena = workerData.semanticTt
  ? createSemanticSharedTtArena({
      entryCapacity: workerData.semanticTt.entryCapacity,
      termCapacity: workerData.semanticTt.termCapacity,
    })
  : null;
const plans = new Map();
let nextPlanId = 1;
const stats = {
  buildMs: performance.now() - started,
  canonicalStates: graph.stateCount,
  residualClasses: graph.residualClassCount,
  canonicalEdges: graph.edgeCount,
  semanticTtEnabled: semanticArena !== null,
  resets: 0,
  cleanupPasses: 0,
  plansBuilt: 0,
  plansReduced: 0,
};

parentPort.postMessage({ type: 'published', graph, arena, semanticArena, stats: { ...stats } });

parentPort.on('message', (message) => {
  if (message?.type === 'reset') {
    resetSharedProofArena(arena);
    if (semanticArena) resetSemanticSharedTtArena(semanticArena);
    stats.resets += 1;
    parentPort.postMessage({ type: 'reset-complete', requestId: message.requestId, stats: { ...stats } });
    return;
  }

  if (message?.type === 'cleanup') {
    stats.cleanupPasses += 1;
    parentPort.postMessage({ type: 'cleanup-complete', requestId: message.requestId, stats: { ...stats } });
    return;
  }

  if (message?.type === 'build-plan') {
    const planStarted = performance.now();
    const plan = buildQuotientLookaheadWorkDag(graph, message.splitDepth, {
      probeDepth: message.probeDepth ?? 2,
    });
    const planId = nextPlanId++;
    plans.set(planId, plan);
    stats.plansBuilt += 1;
    parentPort.postMessage({
      type: 'plan-built',
      requestId: message.requestId,
      planId,
      splitDepth: plan.splitDepth,
      probeDepth: plan.probeDepth,
      uniqueNodes: plan.uniqueNodes,
      frontierTasks: plan.frontierTasks,
      transposedParentRefs: plan.transposedParentRefs,
      tasks: plan.tasks,
      planMs: performance.now() - planStarted,
      stats: { ...stats },
    });
    return;
  }

  if (message?.type === 'reduce-plan') {
    const plan = plans.get(message.planId);
    if (!plan) throw new Error(`unknown lookahead plan ${message.planId}`);
    const reduction = reduceQuotientLookaheadWorkDag(plan, message.frontierValues, graph.spec.columns);
    stats.plansReduced += 1;
    parentPort.postMessage({
      type: 'plan-reduced',
      requestId: message.requestId,
      planId: message.planId,
      rootWdl: reduction.rootWdl,
      rootActions: reduction.rootActions,
      stats: { ...stats },
    });
    return;
  }

  if (message?.type === 'release-plan') {
    plans.delete(message.planId);
    parentPort.postMessage({ type: 'plan-released', requestId: message.requestId, planId: message.planId });
  }
});
