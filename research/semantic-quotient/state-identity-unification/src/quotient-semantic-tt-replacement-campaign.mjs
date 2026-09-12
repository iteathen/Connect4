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

function syntheticDescriptor(id, total = 2) {
  const ids = new Uint16Array(total);
  for (let index = 0; index < total; index += 1) ids[index] = (id * 31 + index) % 625;
  return Object.freeze({
    supportIndex: id,
    p0: Object.freeze({ ids }),
    p1: Object.freeze({ ids: new Uint16Array(0) }),
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

function runSlotChunkGrowthControl() {
  const arena = createSemanticSharedTtArena({
    entryCapacity: 8,
    associativity: 8,
    termCapacity: 640,
  });
  const tt = createSemanticSharedTtView(arena);
  const firstHandles = [];

  for (let lane = 0; lane < 8; lane += 1) {
    firstHandles.push(tt.ensure(syntheticDescriptor(lane, 2)));
  }

  let latest = [];
  for (let total = 3; total <= 20; total += 1) {
    latest = [];
    for (let lane = 0; lane < 8; lane += 1) {
      const descriptor = syntheticDescriptor(total * 100 + lane, total);
      const handle = tt.ensure(descriptor);
      assert.equal(tt.probe(descriptor), handle, `grown descriptor ${total}/${lane} was not probe-stable`);
      latest.push(descriptor);
    }
    for (const descriptor of latest) {
      assert.ok(tt.probe(descriptor) >= 0, `current growth-stage descriptor ${descriptor.supportIndex} was evicted early`);
    }
  }

  for (const handle of firstHandles) {
    assert.ok(handle >= arena.entryCapacity, 'initial semantic handle was malformed');
  }

  const stats = tt.stats();
  assert.equal(stats.entries, 8, 'chunk-growth control exceeded physical entry capacity');
  assert.equal(stats.replacementsShared, 144, 'chunk-growth control replacement count drifted');
  assert.equal(stats.termSpanGrowsShared, 144, 'every monotone synthetic growth should extend its physical slot');
  assert.equal(stats.termChunkCountShared, 152, 'chunk-growth control allocated an unexpected number of slot-owned chunks');
  assert.equal(stats.termIdsUsed, 160, 'slot-owned descriptor data capacity should equal eight final 20-term maxima');
  assert.equal(stats.termHeaderWordsUsed, 456, 'chunk header footprint drifted');
  assert.equal(stats.termArenaWordsUsed, 616, 'slot-owned chunks should remain within the deliberately tight arena');
  assert.ok(stats.termArenaWordsUsed <= arena.termCapacity, 'chunk-growth control exceeded its bounded arena');

  return Object.freeze({
    latestSupports: Object.freeze(latest.map((descriptor) => descriptor.supportIndex)),
    tt: stats,
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

    const executorStats = executor.stats();
    const activeWorkerResources = executorStats.workerResources.filter((resource, index) => executorStats.workerTasks[index] > 0);
    assert.ok(activeWorkerResources.length > 0, 'constrained game did not exercise search-worker descriptor storage');
    for (const resource of activeWorkerResources) {
      assert.ok(resource.descriptorClassBuildsHighWater > 0, 'worker did not construct residual semantic metadata');
      assert.ok(resource.descriptorTermIdsCachedHighWater > 0, 'worker did not populate flat exact term storage');
      assert.equal(resource.descriptorTermArrayObjectsCachedHighWater, 0, 'worker retained per-class term-array objects');
      assert.equal(resource.descriptorClassObjectsCachedHighWater, 0, 'worker retained per-class semantic descriptor objects');
      assert.ok(resource.descriptorClassMetadataBytesHighWater > 0, 'worker did not report class metadata storage');
      assert.ok(resource.descriptorTermArenaBytesHighWater > 0, 'worker did not report flat term-arena storage');
      assert.equal(
        resource.descriptorRetainedTypedBytesHighWater,
        resource.descriptorClassMetadataBytesHighWater + resource.descriptorTermArenaBytesHighWater,
        'worker flat descriptor typed-byte ownership accounting drifted',
      );
    }

    return Object.freeze({
      root,
      actions: Object.freeze(actions),
      rootStats,
      actionStats,
      executor: executorStats,
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
const slotChunkGrowthControl = runSlotChunkGrowthControl();
const constrainedGameControl = await runConstrainedGameControl();

const result = Object.freeze({
  kind: 'connect4-semantic-proof-replacement-qualification-v3',
  status: 'complete',
  replacement: '8-way exact-descriptor set-associative with generation-bearing proof handles, slot-owned extension chunks, and flat worker semantic descriptor ownership',
  staleHandleControl,
  slotChunkGrowthControl,
  constrainedGameControl,
});

console.error(`SEMANTIC_TT_REPLACEMENT_SUMMARY=${JSON.stringify(result)}`);
console.log(JSON.stringify(result, null, 2));