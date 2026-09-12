import { parentPort, workerData } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';
import { buildSharedQuotientGraph } from './quotient-shared-graph-lib.mjs';
import { createExploreHintService } from './quotient-explore-hint-service.mjs';
import { createProofResourceService } from './quotient-proof-resource-service.mjs';
import { createQuotientWorkPlanService } from './quotient-work-plan-service.mjs';

if (!parentPort) throw new Error('branch manager worker requires parentPort');

const started = performance.now();
const prebuildGraph = workerData.prebuildGraph !== false;
const graph = prebuildGraph
  ? buildSharedQuotientGraph(workerData.spec, {
      prefixClasses: workerData.prefixClasses ?? 4096,
    })
  : null;
const proofResources = createProofResourceService(graph?.stateCount ?? 0, workerData.semanticTt ?? null);
const planService = graph ? createQuotientWorkPlanService(graph) : null;
const exploreHints = createExploreHintService();
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

function snapshotStats() {
  return Object.freeze({
    ...stats,
    exploreHints: exploreHints.stats(),
  });
}

parentPort.postMessage({
  type: 'published',
  graph,
  arena: proofResources.graphArena,
  semanticArena: proofResources.semanticArena,
  stats: snapshotStats(),
});

parentPort.on('message', (message) => {
  if (message?.type === 'reset') {
    proofResources.reset();
    exploreHints.clear();
    stats.resets += 1;
    parentPort.postMessage({ type: 'reset-complete', requestId: message.requestId, stats: snapshotStats() });
    return;
  }

  if (message?.type === 'cleanup') {
    exploreHints.clear();
    stats.cleanupPasses += 1;
    parentPort.postMessage({ type: 'cleanup-complete', requestId: message.requestId, stats: snapshotStats() });
    return;
  }

  if (message?.type === 'offer-explore-hint') {
    const hint = exploreHints.offer(message.path, message.depth);
    parentPort.postMessage({
      type: 'explore-hint-offered',
      requestId: message.requestId,
      hint,
      stats: snapshotStats(),
    });
    return;
  }

  if (message?.type === 'take-explore-hint') {
    parentPort.postMessage({
      type: 'explore-hint',
      requestId: message.requestId,
      hint: exploreHints.take(),
      stats: snapshotStats(),
    });
    return;
  }

  if (message?.type === 'complete-explore-hint') {
    const result = exploreHints.complete(message.hintId, message.fragment);
    parentPort.postMessage({
      type: 'explore-hint-completed',
      requestId: message.requestId,
      result,
      stats: snapshotStats(),
    });
    return;
  }

  if (message?.type === 'take-explore-result') {
    parentPort.postMessage({
      type: 'explore-result',
      requestId: message.requestId,
      result: exploreHints.takeCompleted(),
      stats: snapshotStats(),
    });
    return;
  }

  if (message?.type === 'build-plan') {
    if (!planService) throw new Error('work-plan service unavailable in semantic-only Branch Manager mode');
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
      stats: snapshotStats(),
    });
    return;
  }

  if (message?.type === 'reduce-plan') {
    if (!planService) throw new Error('work-plan service unavailable in semantic-only Branch Manager mode');
    const reduction = planService.reduce(message.planId, message.frontierValues);
    stats.plansReduced += 1;
    parentPort.postMessage({
      type: 'plan-reduced',
      requestId: message.requestId,
      planId: message.planId,
      rootWdl: reduction.rootWdl,
      rootActions: reduction.rootActions,
      stats: snapshotStats(),
    });
    return;
  }

  if (message?.type === 'release-plan') {
    if (!planService) throw new Error('work-plan service unavailable in semantic-only Branch Manager mode');
    planService.release(message.planId);
    parentPort.postMessage({ type: 'plan-released', requestId: message.requestId, planId: message.planId });
  }
});
