import assert from 'node:assert/strict';
import { createOnlineDependencyCoordinator } from './quotient-online-dependency-coordinator.mjs';
import {
  startOnlineBranchManager,
  startOnlineSearchWorkers,
} from './quotient-online-semantic-worker-pool.mjs';
import { createPackedProofStore } from './quotient-packed-proof-store.mjs';
import { createSearchWorkerExecutor } from './quotient-search-worker-executor.mjs';
import {
  createSemanticSharedTtArena,
  createSemanticSharedTtView,
} from './quotient-semantic-shared-tt.mjs';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';

const SPEC = Object.freeze({ columns: 4, rows: 5, connect: 4 });
const PREFIX_CLASSES = Number(process.env.PREFIX_CLASSES ?? 4096);
const GAME_ENTRY_CAPACITY = Number(process.env.REPLACEMENT_ENTRIES ?? 4096);
const GAME_TERM_CAPACITY = Number(process.env.REPLACEMENT_TERMS ?? (1 << 24));
const WORKERS = Number(process.env.REPLACEMENT_WORKERS ?? 2);
const SPLIT_DEPTH = Number(process.env.REPLACEMENT_SPLIT_DEPTH ?? 3);

function syntheticDescriptor(id) {
  return Object.freeze({
    supportIndex: id,
    p0: Object.freeze({ ids: Uint16Array.of(id % 625) }),
    p1: Object.freeze({ ids: Uint16Array.of((id + 1) % 625) }),
    hash: Object.freeze({ lo: 0, hi: id + 1 }),
  });
}

function runStaleHandleControl() {
  const arena = createSemanticSharedTtArena({
    entryCapacity: 8,
    associativity: 8,
    termCapacity: 1024,
  });
  const tt = createSemanticSharedTtView(arena);
  const proofs = createPackedProofStore(arena);
  const descriptors = Array.from({ length: 9 }, (_, id) => syntheticDescriptor(id));
  const handles = [];

  for (let id = 0; id < 8; id += 1) {
    const handle = tt.ensure(descriptors[id]);
    handles.push(handle);
    proofs.publishExact(handle, id % 3 - 1, id % SPEC.columns);
  }

  const staleHandle = handles[0];
  assert.equal(proofs.lower(staleHandle), -1);
  assert.equal(proofs.upper(staleHandle), -1);

  const replacementHandle = tt.ensure(descriptors[8]);
  assert.notEqual(replacementHandle, staleHandle, 'replacement reused the stale generation handle');
  proofs.publishExact(replacementHandle, 0, 2);

  assert.equal(tt.probe(descriptors[0]), -1, 'evicted descriptor remained probe-visible');
  assert.equal(tt.probe(descriptors[8]), replacementHandle, 'replacement descriptor did not retain its current handle');
  assert.equal(proofs.lower(staleHandle), -1, 'stale lower read did not degrade to default');
  assert.equal(proofs.upper(staleHandle), 1, 'stale upper read did not degrade to default');
  assert.equal(proofs.bestMove(staleHandle), -1, 'stale best-move read did not degrade to default');

  proofs.publishExact(staleHandle, 1, 3);
  assert.equal(proofs.lower(replacementHandle), 0, 'stale publication changed replacement lower bound');
  assert.equal(proofs.upper(replacementHandle), 0, 'stale publication changed replacement upper bound');
  assert.equal(proofs.bestMove(replacementHandle), 2, 'stale publication changed replacement move hint');

  const stats = tt.stats();
  assert.equal(stats.entries, 8, 'tiny replacement table did not remain fixed-capacity');
  assert.equal(stats.replacementsShared, 1, 'tiny replacement table did not record one replacement');
  assert.ok(proofs.metrics.staleReads >= 3, 'stale reads were not observed by proof store');
  assert.ok(proofs.metrics.stalePublications >= 1, 'stale publication was not rejected');

  return Object.freeze({
    staleHandle,
    replacementHandle,
    tt: stats,
    proofStore: Object.freeze({ ...proofs.metrics }),
  });
}

function createKernel() {
  return createSlot64ResidualQuotientKernel(SPEC, {
    cacheEdges: false,
    prefixClasses: PREFIX_CLASSES,
  }).kernel;
}

async function runConstrainedGameControl() {
  const branchManager = await startOnlineBranchManager(SPEC, {
    prebuildGraph: false,
    prefixClasses: PREFIX_CLASSES,
    entryCapacity: GAME_ENTRY_CAPACITY,
    termCapacity: GAME_TERM_CAPACITY,
    exploreEnabled: false,
  });
  const semanticArena = branchManager.published.semanticArena;
  const tt = createSemanticSharedTtView(semanticArena);
  const workers = await startOnlineSearchWorkers(WORKERS, SPEC, semanticArena, {
    prefixClasses: PREFIX_CLASSES,
    etc: false,
  });
  const executor = createSearchWorkerExecutor(workers);
  const kernel = createKernel();

  try {
    const coordinator = createOnlineDependencyCoordinator(kernel, semanticArena, executor, {
      splitDepth: SPLIT_DEPTH,
      priorityProbeDepth: 0,
    });
    const root = await coordinator.engine.solveRoot();
    await coordinator.engine.drainBackground();
    await executor.drain();
    assert.equal(root, 0, `constrained replacement root expected draw, got ${root}`);
    const rootStats = tt.stats();
    assert.ok(rootStats.replacementsShared > 0, 'constrained root did not exercise replacement');
    assert.ok(rootStats.entries <= GAME_ENTRY_CAPACITY, 'replacement table exceeded fixed entry capacity');

    await branchManager.reset();
    const actionCoordinator = createOnlineDependencyCoordinator(kernel, semanticArena, executor, {
      splitDepth: SPLIT_DEPTH,
      priorityProbeDepth: 0,
    });
    const actions = await actionCoordinator.engine.rootActionValues();
    await actionCoordinator.engine.drainBackground();
    await executor.drain();
    assert.deepEqual(actions, [0, 0, 0, 0], 'constrained replacement root action values drifted');
    const actionStats = tt.stats();
    assert.ok(actionStats.replacementsShared > 0, 'constrained action solve did not exercise replacement');

    return Object.freeze({
      root,
      actions: Object.freeze(actions),
      rootStats,
      actionStats,
      executor: executor.stats(),
      coordinatorMetrics: Object.freeze({ ...actionCoordinator.engine.metrics }),
    });
  } finally {
    await executor.drain();
    executor.close();
    await Promise.all(workers.map((worker) => worker.terminate()));
    await branchManager.cleanup();
    await branchManager.worker.terminate();
  }
}

const staleHandleControl = runStaleHandleControl();
const constrainedGameControl = await runConstrainedGameControl();

const result = Object.freeze({
  kind: 'connect4-semantic-proof-replacement-qualification-v1',
  status: 'complete',
  replacement: '8-way exact-descriptor set-associative with generation-bearing proof handles',
  staleHandleControl,
  constrainedGameControl,
});

console.error(`SEMANTIC_TT_REPLACEMENT_SUMMARY=${JSON.stringify(result)}`);
console.log(JSON.stringify(result, null, 2));
