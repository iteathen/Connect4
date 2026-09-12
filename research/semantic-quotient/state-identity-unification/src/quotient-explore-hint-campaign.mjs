import { createSearchWorkerExecutor } from './quotient-search-worker-executor.mjs';
import { createSemanticSharedTtView } from './quotient-semantic-shared-tt.mjs';
import {
  startOnlineBranchManager,
  startOnlineSearchWorkers,
} from './quotient-online-semantic-worker-pool.mjs';

const SPEC = Object.freeze({ columns: 4, rows: 5, connect: 4 });
const PREFIX_CLASSES = Number(process.env.PREFIX_CLASSES ?? 4096);
const EXPLORE_DEPTH = Number(process.env.EXPLORE_DEPTH ?? 3);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

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

let exploreOnly;
let mixed;
try {
  const offered = await branchManager.offerExplore([], EXPLORE_DEPTH);
  assert(offered.hint !== null, 'root explore hint was not accepted');
  await executor.drain();

  const exploreReply = await branchManager.takeExploreResult();
  assert(exploreReply.result !== null, 'Branch Manager did not retain explore result');
  const fragment = exploreReply.result.fragment;
  assert(fragment.requestedDepth === EXPLORE_DEPTH, 'explore depth drifted');
  assert(fragment.reachedDepth === EXPLORE_DEPTH, 'explore did not reach requested depth');
  assert(fragment.uniqueStates > 1, 'explore did not discover quotient states');
  assert(fragment.frontierPaths.length > 0, 'explore did not expose frontier paths');
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
  kind: 'connect4-queued-explore-hint-v2',
  status: 'complete',
  spec: SPEC,
  exploreDepth: EXPLORE_DEPTH,
  policy: 'Branch Manager queues ExploreHint(path, depth) ahead of demand; idle workers dequeue immediately; authoritative work has dispatch priority',
  exploreOnly,
  mixed,
});

console.error(`EXPLORE_HINT_SUMMARY=${JSON.stringify(result)}`);
console.log(JSON.stringify(result, null, 2));
