import { createLiveLineMoveOrder } from './quotient-live-line-move-order.mjs';
import { createSearchWorkerExecutor } from './quotient-search-worker-executor.mjs';
import { createSemanticSharedTtView } from './quotient-semantic-shared-tt.mjs';
import {
  startOnlineBranchManager,
  startOnlineSearchWorkers,
  cleanupOnlineSession,
} from './quotient-online-semantic-worker-pool.mjs';

const SPEC = Object.freeze({ columns: 4, rows: 5, connect: 4 });
const STANDARD_SPEC = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const EXPECTED_STANDARD_ROOT_VALUES = Object.freeze([3, 4, 5, 7, 5, 4, 3]);
const EXPECTED_STANDARD_ROOT_ORDER = Object.freeze([3, 2, 4, 1, 5, 0, 6]);
const PREFIX_CLASSES = Number(process.env.PREFIX_CLASSES ?? 4096);
const EXPLORE_DEPTH = Number(process.env.EXPLORE_DEPTH ?? 3);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function qualifyLegacyRootIncidence() {
  const ordering = createLiveLineMoveOrder(STANDARD_SPEC);
  const root = ordering.createRootSeed();
  const values = [];
  for (let column = 0; column < STANDARD_SPEC.columns; column += 1) {
    values[column] = ordering.valueAtSeed(root, 0, column);
    assert(values[column] === EXPECTED_STANDARD_ROOT_VALUES[column],
      `7x6 root live-line value column ${column}: expected ${EXPECTED_STANDARD_ROOT_VALUES[column]}, got ${values[column]}`);
  }
  const ordered = Array.from({ length: STANDARD_SPEC.columns }, (_, column) => column)
    .sort((left, right) => values[right] - values[left] || left - right);
  assert(ordered.join(',') === EXPECTED_STANDARD_ROOT_ORDER.join(','),
    `7x6 root incidence order drifted: ${ordered.join(',')}`);
  return Object.freeze({ values: Object.freeze(values), order: Object.freeze(ordered) });
}

async function drainExploreResults(branchManager) {
  const results = [];
  while (true) {
    const reply = await branchManager.takeExploreResult();
    if (reply.result === null) return Object.freeze({ results: Object.freeze(results), stats: reply.stats });
    results.push(reply.result);
  }
}

function assertRootFragment(fragment, label) {
  assert(fragment.requestedDepth === EXPLORE_DEPTH, `${label}: explore depth drifted`);
  assert(fragment.reachedDepth === EXPLORE_DEPTH, `${label}: explore did not reach requested depth`);
  assert(fragment.ordering === 'dynamic-live-winning-line-frontier', `${label}: wrong move-order authority ${fragment.ordering}`);
  assert(fragment.contextIdentity === 'exact_q_semantic_content_plus_exact_live_line_frontier', `${label}: wrong exploration identity`);
  assert(fragment.uniqueContexts > 1, `${label}: explore did not discover frontier contexts`);
  assert(fragment.frontierCandidates.length > 0, `${label}: explore did not expose frontier candidates`);
  assert(fragment.scoredMoves > 0, `${label}: explore did not score moves`);
  if (EXPLORE_DEPTH === 3) {
    assert(fragment.uniqueContexts === 73, `${label}: expected 73 unique contexts, got ${fragment.uniqueContexts}`);
    assert(fragment.expandedContexts === 21, `${label}: expected 21 expanded contexts, got ${fragment.expandedContexts}`);
    assert(fragment.traversedEdges === 84, `${label}: expected 84 traversed edges, got ${fragment.traversedEdges}`);
    assert(fragment.duplicateContextEdges === 12, `${label}: expected 12 duplicate context edges, got ${fragment.duplicateContextEdges}`);
  }
}

const standardRootIncidence = qualifyLegacyRootIncidence();

const branchManager = await startOnlineBranchManager(SPEC, {
  prebuildGraph: false,
  prefixClasses: PREFIX_CLASSES,
  entryCapacity: 1 << 19,
  termCapacity: 1 << 24,
  exploreEnabled: true,
  exploreDepth: EXPLORE_DEPTH,
  exploreReservoirTarget: 2,
  exploreBacklogCapacity: 32,
});
let workers = [];
let executor = null;
let unsubscribeExplore = null;

let phase = 'autonomous';
let phaseExploreCompletions = 0;
let autonomous;
let mixed;
try {
  const semanticArena = branchManager.published.semanticArena;
  const semanticTt = createSemanticSharedTtView(semanticArena);
  workers = await startOnlineSearchWorkers(2, SPEC, semanticArena, { prefixClasses: PREFIX_CLASSES, etc: false });
  executor = createSearchWorkerExecutor(workers, {
    completeExploreHint: async (hintId, fragment) => {
      phaseExploreCompletions += 1;
      const stopAt = phase === 'autonomous' ? 3 : 1;
      if (phaseExploreCompletions >= stopAt) await branchManager.stopExplore();
      return branchManager.completeExplore(hintId, fragment);
    },
    abandonExploreHint: (hintId) => branchManager.abandonExplore(hintId),
  });
  unsubscribeExplore = branchManager.subscribeExplore(executor.enqueueExploreHint);
  await executor.drain();
  const autonomousResults = await drainExploreResults(branchManager);
  assert(autonomousResults.results.length >= 3,
    `autonomous Branch Manager expected >=3 completed explores, got ${autonomousResults.results.length}`);
  const rootResult = autonomousResults.results.find((entry) => entry.path.length === 0);
  assert(rootResult !== undefined, 'autonomous Branch Manager did not seed the root exploration itself');
  assertRootFragment(rootResult.fragment, 'autonomous-root');
  assert(autonomousResults.stats.exploreHints.seen >= autonomousResults.results.length,
    'persistent exploration seen-set did not retain completed contexts');
  assert(autonomousResults.stats.exploreSessionStarts >= 1, 'autonomous exploration session did not start');
  assert(autonomousResults.stats.exploreCandidatesAccepted > 1, 'Branch Manager did not replenish from completed frontier candidates');
  const ttAfterExplore = semanticTt.stats();
  assert(ttAfterExplore.entries === 0, `structural explore published ${ttAfterExplore.entries} TT entries`);
  autonomous = Object.freeze({
    completedExplores: autonomousResults.results.length,
    rootFragment: rootResult.fragment,
    executor: executor.stats(),
    branchManager: autonomousResults.stats,
    semanticTt: ttAfterExplore,
  });

  phase = 'mixed';
  phaseExploreCompletions = 0;
  await branchManager.reset();
  const authoritative = executor.submit({
    type: 'search-path',
    path: [],
    alpha: -2,
    beta: 2,
  }, 1000);

  const solved = await authoritative;
  assert(solved.value === 0, `4x5 authoritative root expected draw, got ${solved.value}`);
  await executor.drain();
  const mixedExploreResults = await drainExploreResults(branchManager);
  assert(mixedExploreResults.results.length >= 1, 'mixed phase did not consume autonomous explore work');
  const mixedStats = executor.stats();
  assert(mixedStats.submitted === 1, `expected one authoritative task, got ${mixedStats.submitted}`);
  assert(mixedStats.completed === 1, `expected one authoritative completion, got ${mixedStats.completed}`);
  assert(mixedStats.exploreCompleted >= autonomousResults.results.length + 1,
    'expected exploration to continue only from idle capacity');
  assert(mixedStats.active === 0 && mixedStats.queued === 0 && mixedStats.pending === 0 && mixedStats.exploreReady === 0,
    'executor retained work after mixed phase');

  mixed = Object.freeze({
    authoritativeValue: solved.value,
    authoritativeWorker: solved.workerId,
    completedExplores: mixedExploreResults.results.length,
    executor: mixedStats,
    branchManager: mixedExploreResults.stats,
    semanticTt: semanticTt.stats(),
  });
} finally {
  await cleanupOnlineSession({ executor, workers, branchManager, unsubscribeExplore });
}

const result = Object.freeze({
  kind: 'connect4-autonomous-branch-manager-frontier-explore-v5',
  status: 'complete',
  spec: SPEC,
  exploreDepth: EXPLORE_DEPTH,
  policy: 'Branch Manager auto-seeds and replenishes a bounded exact frontier-context reservoir; workers never request branches; authoritative proof work has idle-dispatch priority and running work is never interrupted',
  standardRootIncidence,
  autonomous,
  mixed,
});

console.error(`EXPLORE_HINT_SUMMARY=${JSON.stringify(result)}`);
console.log(JSON.stringify(result, null, 2));
