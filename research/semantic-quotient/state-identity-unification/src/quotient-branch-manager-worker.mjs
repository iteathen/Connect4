import { parentPort, workerData } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';
import { buildSharedQuotientGraph } from './quotient-shared-graph-lib.mjs';
import { createExploreHintService } from './quotient-explore-hint-service.mjs';
import { createProofResourceService } from './quotient-proof-resource-service.mjs';
import { createQuotientWorkPlanService } from './quotient-work-plan-service.mjs';

if (!parentPort) throw new Error('branch manager worker requires parentPort');
if (!workerData?.spec || typeof workerData.spec !== 'object') throw new TypeError('Branch Manager requires a domain spec');
const { columns, rows, connect } = workerData.spec;
if (!Number.isSafeInteger(columns) || columns < 1) throw new RangeError('Branch Manager columns must be a positive safe integer');
if (!Number.isSafeInteger(rows) || rows < 1) throw new RangeError('Branch Manager rows must be a positive safe integer');
if (!Number.isSafeInteger(connect) || connect < 1) throw new RangeError('Branch Manager connect must be a positive safe integer');
const cellCount = columns * rows;
if (!Number.isSafeInteger(cellCount) || cellCount < 1 || cellCount > 64) {
  throw new RangeError(`Branch Manager cell count ${cellCount} is outside 1..64`);
}
if (connect > Math.max(columns, rows)) throw new RangeError('Branch Manager connect exceeds both board dimensions');

function positiveSafeInteger(value, label, maximum = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new RangeError(`${label} must be a safe integer in 1..${maximum}`);
  }
  return value;
}

const prefixClasses = positiveSafeInteger(workerData.prefixClasses ?? 4096, 'Branch Manager prefixClasses', 0x7fffffff);
const exploreConfig = Object.freeze({
  enabled: workerData.explore?.enabled === true,
  depth: positiveSafeInteger(workerData.explore?.depth ?? 3, 'Branch Manager explore depth', cellCount),
  reservoirTarget: positiveSafeInteger(workerData.explore?.reservoirTarget ?? 4, 'Branch Manager explore reservoirTarget', 1 << 20),
  backlogCapacity: positiveSafeInteger(workerData.explore?.backlogCapacity ?? 64, 'Branch Manager explore backlogCapacity', 1 << 20),
  historyCapacity: positiveSafeInteger(workerData.explore?.historyCapacity ?? 4096, 'Branch Manager explore historyCapacity', 1 << 24),
  completedCapacity: positiveSafeInteger(workerData.explore?.completedCapacity ?? 64, 'Branch Manager explore completedCapacity', 1 << 20),
});
if (exploreConfig.backlogCapacity < exploreConfig.reservoirTarget) {
  throw new RangeError('Branch Manager explore backlogCapacity must cover reservoirTarget');
}

const started = performance.now();
const prebuildGraph = workerData.prebuildGraph !== false;
const graph = prebuildGraph
  ? buildSharedQuotientGraph(workerData.spec, { prefixClasses })
  : null;
const proofResources = createProofResourceService(graph?.stateCount ?? 0, workerData.semanticTt ?? null);
const planService = graph ? createQuotientWorkPlanService(graph) : null;
const exploreHints = createExploreHintService({
  columns,
  maxPathLength: cellCount,
  maxDepth: cellCount,
  historyCapacity: exploreConfig.historyCapacity,
  completedCapacity: exploreConfig.completedCapacity,
});

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

function normalizeCandidate(candidate) {
  if (!candidate || !Array.isArray(candidate.path)) throw new TypeError('explore candidate requires a path array');
  if (candidate.path.length > cellCount) throw new RangeError(`explore candidate path exceeds ${cellCount} plies`);
  const path = candidate.path.map((column, index) => {
    if (!Number.isSafeInteger(column) || column < 0 || column >= columns) {
      throw new RangeError(`explore candidate column ${column} at ply ${index} is outside 0..${columns - 1}`);
    }
    return column;
  });
  const contextKey = candidate.contextKey ?? null;
  if (contextKey !== null && (typeof contextKey !== 'string' || contextKey.length === 0 || contextKey.length > 1024)) {
    throw new TypeError('explore candidate contextKey must be null or a non-empty string of at most 1024 characters');
  }
  return Object.freeze({ path: Object.freeze(path), contextKey });
}

function normalizeExploreFragment(fragment) {
  if (!fragment || typeof fragment !== 'object') throw new TypeError('complete-explore-hint requires a fragment');
  const candidates = fragment.frontierCandidates ?? [];
  if (!Array.isArray(candidates)) throw new TypeError('explore fragment frontierCandidates must be an array');
  const normalizedCandidates = Object.freeze(candidates.map(normalizeCandidate));
  return Object.freeze({ ...fragment, frontierCandidates: normalizedCandidates });
}

function candidateBacklogKey(candidate) {
  return candidate.contextKey ?? `path:${candidate.path.join(',')}`;
}

function enqueueNormalizedCandidate(candidate) {
  const key = candidateBacklogKey(candidate);
  if (candidateBacklogKeys.has(key)) return false;
  if (candidateBacklog.length >= exploreConfig.backlogCapacity) {
    stats.exploreCandidatesDropped += 1;
    return false;
  }
  candidateBacklog.push(candidate);
  candidateBacklogKeys.add(key);
  stats.exploreCandidatesAccepted += 1;
  return true;
}

function enqueueCandidate(candidate) {
  return enqueueNormalizedCandidate(normalizeCandidate(candidate));
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

function assertRequest(message) {
  if (!message || typeof message.type !== 'string' || message.type.length === 0) {
    throw new TypeError('Branch Manager message requires a type');
  }
  if (!Number.isSafeInteger(message.requestId) || message.requestId < 1) {
    throw new RangeError(`Branch Manager ${message.type} requires a positive safe requestId`);
  }
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
  assertRequest(message);

  if (message.type === 'reset') {
    proofResources.reset();
    clearExploreState();
    exploreActive = false;
    stats.resets += 1;
    seedExploreSession();
    parentPort.postMessage({ type: 'reset-complete', requestId: message.requestId, stats: snapshotStats() });
    return;
  }

  if (message.type === 'cleanup') {
    stopExploreSession();
    clearExploreState();
    stats.cleanupPasses += 1;
    parentPort.postMessage({ type: 'cleanup-complete', requestId: message.requestId, stats: snapshotStats() });
    return;
  }

  if (message.type === 'stop-explore-session') {
    stopExploreSession();
    parentPort.postMessage({ type: 'explore-session-stopped', requestId: message.requestId, stats: snapshotStats() });
    return;
  }

  if (message.type === 'complete-explore-hint') {
    if (!Number.isSafeInteger(message.hintId) || message.hintId < 1) throw new RangeError('complete-explore-hint requires a positive safe hintId');
    // Validate and normalize the entire returned frontier before retiring the outstanding hint.
    // A malformed worker fragment therefore cannot partially mutate Branch Manager state.
    const fragment = normalizeExploreFragment(message.fragment);
    const result = exploreHints.complete(message.hintId, fragment);
    if (exploreActive) {
      for (const candidate of fragment.frontierCandidates) enqueueNormalizedCandidate(candidate);
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

  if (message.type === 'abandon-explore-hint') {
    if (!Number.isSafeInteger(message.hintId) || message.hintId < 1) throw new RangeError('abandon-explore-hint requires a positive safe hintId');
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

  if (message.type === 'take-explore-result') {
    parentPort.postMessage({
      type: 'explore-result',
      requestId: message.requestId,
      result: exploreHints.takeCompleted(),
      stats: snapshotStats(),
    });
    return;
  }

  if (message.type === 'build-plan') {
    if (!planService) throw new Error('work-plan service unavailable in semantic-only Branch Manager mode');
    if (!Number.isSafeInteger(message.splitDepth) || message.splitDepth < 1 || message.splitDepth > cellCount) {
      throw new RangeError(`build-plan splitDepth must be in 1..${cellCount}`);
    }
    const probeDepth = message.probeDepth ?? 2;
    if (!Number.isSafeInteger(probeDepth) || probeDepth < 0 || probeDepth > cellCount) {
      throw new RangeError(`build-plan probeDepth must be in 0..${cellCount}`);
    }
    const planStarted = performance.now();
    const { planId, plan } = planService.build(message.splitDepth, probeDepth);
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

  if (message.type === 'reduce-plan') {
    if (!planService) throw new Error('work-plan service unavailable in semantic-only Branch Manager mode');
    if (!Number.isSafeInteger(message.planId) || message.planId < 1) throw new RangeError('reduce-plan requires a positive safe planId');
    if (!Array.isArray(message.frontierValues)) throw new TypeError('reduce-plan requires frontierValues array');
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

  if (message.type === 'release-plan') {
    if (!planService) throw new Error('work-plan service unavailable in semantic-only Branch Manager mode');
    if (!Number.isSafeInteger(message.planId) || message.planId < 1) throw new RangeError('release-plan requires a positive safe planId');
    if (!planService.release(message.planId)) throw new Error(`unknown lookahead plan ${message.planId}`);
    parentPort.postMessage({ type: 'plan-released', requestId: message.requestId, planId: message.planId });
    return;
  }

  throw new Error(`unsupported Branch Manager message type ${message.type}`);
});
