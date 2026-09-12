import { createLiveLineMoveOrder, EMPTY_OCCUPANCY } from './quotient-live-line-move-order.mjs';
import { createSearchWorkerExecutor } from './quotient-search-worker-executor.mjs';
import { createSemanticSharedTtView } from './quotient-semantic-shared-tt.mjs';
import {
  startOnlineBranchManager,
  startOnlineSearchWorkers,
} from './quotient-online-semantic-worker-pool.mjs';

const SPEC = Object.freeze({ columns: 4, rows: 5, connect: 4 });
const STANDARD_SPEC = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const STANDARD_CENTER_ORDER = Object.freeze([3, 2, 4, 1, 5, 0, 6]);
const EXPECTED_STANDARD_ROOT_VALUES = Object.freeze([3, 4, 5, 7, 5, 4, 3]);
const PREFIX_CLASSES = Number(process.env.PREFIX_CLASSES ?? 4096);
const EXPLORE_DEPTH = Number(process.env.EXPLORE_DEPTH ?? 3);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function qualifyLegacyRootIncidence() {
  const ordering = createLiveLineMoveOrder(STANDARD_SPEC, STANDARD_CENTER_ORDER);
  const values = [];
  for (let column = 0; column < STANDARD_SPEC.columns; column += 1) {
    values[column] = ordering.valueAt(column, EMPTY_OCCUPANCY.p1Lo, EMPTY_OCCUPANCY.p1Hi);
    assert(values[column] === EXPECTED_STANDARD_ROOT_VALUES[column],
      `7x6 root live-line value column ${column}: expected ${EXPECTED_STANDARD_ROOT_VALUES[column]}, got ${values[column]}`);
  }
  const ordered = STANDARD_CENTER_ORDER
    .map((column) => ({ column, value: values[column], tieRank: STANDARD_CENTER_ORDER.indexOf(column) }))
    .sort((left, right) => right.value - left.value || left.tieRank - right.tieRank)
    .map((entry) => entry.column);
  assert(ordered.join(',') === STANDARD_CENTER_ORDER.join(','),
    `7x6 root incidence order drifted: ${ordered.join(',')}`);
  return Object.freeze({ values: Object.freeze(values), order: Object.freeze(ordered) });
}

const standardRootIncidence = qualifyLegacyRootIncidence();

const branchManager = await startOnlineBranchManager(SPEC, {
  prebuildGraph: false,
  prefixClasses: PREFIX_CLASSES,
  entryCapacity: 1 << 19,
  termCapacity: 1 << 24,
});
const semanticArena = branchManager.published.semanticArena;
const semanticTt = createSemanticSharedTtView(semanticArena);
const workers = await startOnlineSearchWorkers(2, SPEC, semanticArena, {
  prefixClasses: PREFIX_CLASSES,
  etc: false,
});
const executor = createSearchWorkerExecutor(workers, {
  completeExploreHint: (hintId, fragment) => branchManager.completeExplore(hintId, fragment),
  abandonExploreHint: (hintId) => branchManager.abandonExplore(hintId),
});
const unsubscribeExplore = branchManager.subscribeExplore(executor.enqueueExploreHint);

function assertExploreFragment(fragment, label) {
  assert(fragment.requestedDepth === EXPLORE_DEPTH, `${label}: explore depth drifted`);
  assert(fragment.reachedDepth === EXPLORE_DEPTH, `${label}: explore did not reach requested depth`);
  assert(fragment.ordering === 'legacy-live-winning-line-incidence', `${label}: wrong move-order authority ${fragment.ordering}`);
  assert(fragment.uniqueStates > 1, `${label}: explore did not discover quotient states`);
  assert(fragment.frontierPaths.length > 0, `${label}: explore did not expose frontier paths`);
  assert(fragment.scoredMoves > 0, `${label}: explore did not score moves`);
  if (EXPLORE_DEPTH === 3) {
    assert(fragment.uniqueStates === 73, `${label}: expected 73 unique q states, got ${fragment.uniqueStates}`);
    assert(fragment.expandedStates === 21, `${label}: expected 21 expanded q states, got ${fragment.expandedStates}`);
    assert(fragment.traversedEdges === 84, `${label}: expected 84 traversed edges, got ${fragment.traversedEdges}`);
    assert(fragment.transposedEdges === 12, `${label}: expected 12 transposed edges, got ${fragment.transposedEdges}`);
  }
}

let exploreOnly;
let mixed;
try {
  const offered = await branchManager.offerExplore([], EXPLORE_DEPTH);
  assert(offered.hint !== null, 'root explore hint was not accepted');
  await executor.drain();

  const exploreReply = await branchManager.takeExploreResult();
  assert(exploreReply.result !== null, 'Branch Manager did not retain explore result');
  const fragment = exploreReply.result.fragment;
  assertExploreFragment(fragment, 'explore-only');
  const ttAfterExplore = semanticTt.stats();
  assert(ttAfterExplore.entries === 0, `structural explore published ${ttAfterExplore.entries} TT entries`);
  exploreOnly = Object.freeze({
    fragment,
    executor: executor.stats(),
    branchManager: exploreReply.stats,
    semanticTt: ttAfterExplore,
  });

  await branchManager.reset();
  const authoritative = executor.submit({
    type: 'search-path',
    path: [],
    alpha: -2,
    beta: 2,
  }, 1000);
  const mixedOffer = await branchManager.offerExplore([], EXPLORE_DEPTH);
  assert(mixedOffer.hint !== null, 'mixed-phase explore hint was not accepted');

  const solved = await authoritative;
  assert(solved.value === 0, `4x5 authoritative root expected draw, got ${solved.value}`);
  await executor.drain();
  const mixedExploreReply = await branchManager.takeExploreResult();
  assert(mixedExploreReply.result !== null, 'mixed phase did not complete explore hint');
  assertExploreFragment(mixedExploreReply.result.fragment, 'mixed');
  const mixedStats = executor.stats();
  assert(mixedStats.submitted === 1, `expected one authoritative task, got ${mixedStats.submitted}`);
  assert(mixedStats.completed === 1, `expected one authoritative completion, got ${mixedStats.completed}`);
  assert(mixedStats.exploreCompleted >= 2, `expected two total explore completions, got ${mixedStats.exploreCompleted}`);
  assert(mixedStats.exploreReady === 0, 'executor retained queued explore work');
  assert(mixedStats.active === 0 && mixedStats.queued === 0 && mixedStats.pending === 0, 'executor retained authoritative work');

  mixed = Object.freeze({
    authoritativeValue: solved.value,
    authoritativeWorker: solved.workerId,
    fragment: mixedExploreReply.result.fragment,
    executor: mixedStats,
    branchManager: mixedExploreReply.stats,
    semanticTt: semanticTt.stats(),
  });
} finally {
  await executor.drain();
  unsubscribeExplore();
  executor.close();
  await Promise.all(workers.map((worker) => worker.terminate()));
  await branchManager.cleanup();
  await branchManager.worker.terminate();
}

const result = Object.freeze({
  kind: 'connect4-queued-live-line-explore-v3',
  status: 'complete',
  spec: SPEC,
  exploreDepth: EXPLORE_DEPTH,
  policy: 'Branch Manager queues ExploreHint(path, depth) ahead of demand; idle workers explore by legacy live-winning-line incidence; quotient residual closure remains terminal authority; authoritative work has dispatch priority',
  standardRootIncidence,
  exploreOnly,
  mixed,
});

console.error(`EXPLORE_HINT_SUMMARY=${JSON.stringify(result)}`);
console.log(JSON.stringify(result, null, 2));
