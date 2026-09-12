import { parentPort, workerData } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';
import { buildSharedQuotientGraph } from './quotient-shared-graph-lib.mjs';
import { createProofResourceService } from './quotient-proof-resource-service.mjs';
import { createQuotientWorkPlanService } from './quotient-work-plan-service.mjs';

if (!parentPort) throw new Error('maintenance worker requires parentPort');

const started = performance.now();
const prebuildGraph = workerData.prebuildGraph !== false;
const graph = prebuildGraph
  ? buildSharedQuotientGraph(workerData.spec, {
      prefixClasses: workerData.prefixClasses ?? 4096,
    })
  : null;
const proofResources = createProofResourceService(graph?.stateCount ?? 0, workerData.semanticTt ?? null);
const planService = graph ? createQuotientWorkPlanService(graph) : null;
const stats = {
  buildMs: performance.now() - started,
  prebuildGraph,
  canonicalStates: graph?.stateCount ?? 0,
  residualClasses: graph?.residualClassCount ?? 0,
  canonicalEdges: graph?.edgeCount ?? 0,
  semanticTtEnabled: proofResources.semanticArena !== null,
  resets: 0,
  cleanupPasses: 0,
  plansBuilt: 0,
  plansReduced: 0,
};

parentPort.postMessage({
  type: 'published',
  graph,
  arena: proofResources.graphArena,
  semanticArena: proofResources.semanticArena,
  stats: { ...stats },
});

parentPort.on('message', (message) => {
  if (message?.type === 'reset') {
    proofResources.reset();
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
    if (!planService) throw new Error('work-plan service unavailable in semantic-only maintenance mode');
    const planStarted = performance.now();
    const { planId, plan } = planService.build(message.splitDepth, message.probeDepth ?? 2);
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
    if (!planService) throw new Error('work-plan service unavailable in semantic-only maintenance mode');
    const reduction = planService.reduce(message.planId, message.frontierValues);
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
    if (!planService) throw new Error('work-plan service unavailable in semantic-only maintenance mode');
    planService.release(message.planId);
    parentPort.postMessage({ type: 'plan-released', requestId: message.requestId, planId: message.planId });
  }
});
