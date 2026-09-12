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

const exploreConfig = Object.freeze({
  enabled: workerData.explore?.enabled === true,
  depth: workerData.explore?.depth ?? 3,
  reservoirTarget: workerData.explore?.reservoirTarget ?? 4,
  backlogCapacity: workerData.explore?.backlogCapacity ?? 64,
});
if (!Number.isInteger(exploreConfig.depth) || exploreConfig.depth < 1) throw new RangeError('Branch Manager explore depth must be positive');
if (!Number.isInteger(exploreConfig.reservoirTarget) || exploreConfig.reservoirTarget < 1) throw new RangeError('Branch Manager explore reservoirTarget must be positive');
if (!Number.isInteger(exploreConfig.backlogCapacity) || exploreConfig.backlogCapacity < exploreConfig.reservoirTarget) {
  throw new RangeError('Branch Manager explore backlogCapacity must cover reservoirTarget');
}

let exploreActive = exploreConfig.enabled;
const candidateBacklog = [];
const candidateBacklogKeys = new Set();
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
  exploreSessionStarts: 0,
  exploreSessionStops: 0,
  exploreCandidatesAccepted: 0,
  exploreCandidatesDropped: 0,
};

function snapshotStats() {
  return Object.freeze({
    ...stats,
    exploreActive,
    exploreConfig,
    exploreBacklog: candidateBacklog.length,
    exploreHints: exploreHints.stats(),
  });
}

function postExploreHint(hint) {
  if (hint) parentPort.postMessage({ type: 'explore-hint-queued', hint });
}

function candidateBacklogKey(candidate) {
  return candidate.contextKey ?? `path:${candidate.path.join(',')}`;
}

function enqueueCandidate(candidate) {
  if (!candidate || !Array.isArray(candidate.path)) return false;
  const key = candidateBacklogKey(candidate);
  if (candidateBacklogKeys.has(key)) return false;
  if (candidateBacklog.length >= exploreConfig.backlogCapacity) {
    stats.exploreCandidatesDropped += 1;
    return false;
  }
  candidateBacklog.push(Object.freeze({
    path: Object.freeze([...candidate.path]),
    contextKey: candidate.contextKey ?? null,
  }));
  candidateBacklogKeys.add(key);
  stats.exploreCandidatesAccepted += 1;
  return true;
}

function refillExploreReservoir() {
  if (!exploreActive) return;
  while (candidateBacklog.length > 0 && exploreHints.stats().outstanding < exploreConfig.reservoirTarget) {
    const candidate = candidateBacklog.shift();
    candidateBacklogKeys.delete(candidateBacklogKey(candidate));
    postExploreHint(exploreHints.offer(candidate.path, exploreConfig.depth, candidate.contextKey));
  }
}

function clearExploreState() {
  exploreHints.clear();
  candidateBacklog.length = 0;
  candidateBacklogKeys.clear();
}

function seedExploreSession() {
  if (!exploreConfig.enabled) return;
  exploreActive = true;
  stats.exploreSessionStarts += 1;
  enqueueCandidate({ path: [], contextKey: null });
  refillExploreReservoir();
}

function stopExploreSession() {
  if (exploreActive) stats.exploreSessionStops += 1;
  exploreActive = false;
  candidateBacklog.length = 0;
  candidateBacklogKeys.clear();
}

parentPort.postMessage({
  type: 'published',
  graph,
  arena: proofResources.graphArena,
  semanticArena: proofResources.semanticArena,
  stats: snapshotStats(),
});
queueMicrotask(seedExploreSession);

parentPort.on('message', (message) => {
  if (message?.type === 'reset') {
    proofResources.reset();
    clearExploreState();
    exploreActive = false;
    stats.resets += 1;
    seedExploreSession();
    parentPort.postMessage({ type: 'reset-complete', requestId: message.requestId, stats: snapshotStats() });
    return;
  }

  if (message?.type === 'cleanup') {
    stopExploreSession();
    clearExploreState();
    stats.cleanupPasses += 1;
    parentPort.postMessage({ type: 'cleanup-complete', requestId: message.requestId, stats: snapshotStats() });
    return;
  }

  if (message?.type === 'stop-explore-session') {
    stopExploreSession();
    parentPort.postMessage({ type: 'explore-session-stopped', requestId: message.requestId, stats: snapshotStats() });
    return;
  }

  if (message?.type === 'complete-explore-hint') {
    const result = exploreHints.complete(message.hintId, message.fragment);
    if (exploreActive) {
      for (const candidate of message.fragment?.frontierCandidates ?? []) enqueueCandidate(candidate);
      refillExploreReservoir();
    }
    parentPort.postMessage({
      type: 'explore-hint-completed',
      requestId: message.requestId,
      result,
      stats: snapshotStats(),
    });
    return;
  }

  if (message?.type === 'abandon-explore-hint') {
    const abandoned = exploreHints.abandon(message.hintId);
    refillExploreReservoir();
    parentPort.postMessage({
      type: 'explore-hint-abandoned',
      requestId: message.requestId,
      hintId: message.hintId,
      abandoned,
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
