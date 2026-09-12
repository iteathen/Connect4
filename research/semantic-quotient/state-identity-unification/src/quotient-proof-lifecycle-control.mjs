import assert from 'node:assert/strict';
import { createOnlineSemanticQuotientPort } from './quotient-online-semantic-search-lib.mjs';
import { createPackedProofStore } from './quotient-packed-proof-store.mjs';
import {
  createSemanticSharedTtArena,
  createSemanticSharedTtView,
} from './quotient-semantic-shared-tt.mjs';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';

const SPEC = Object.freeze({ columns: 4, rows: 5, connect: 4 });
const PREFIX_CLASSES = Number(process.env.PREFIX_CLASSES ?? 4096);

function syntheticDescriptor(id) {
  const ids = new Uint16Array([
    (id * 31) % 625,
    (id * 31 + 1) % 625,
  ]);
  return Object.freeze({
    supportIndex: 1000 + id,
    p0: Object.freeze({ ids }),
    p1: Object.freeze({ ids: new Uint16Array(0) }),
    hash: Object.freeze({ lo: 0, hi: id + 1 }),
  });
}

function createKernel() {
  return createSlot64ResidualQuotientKernel(SPEC, {
    cacheEdges: false,
    prefixClasses: PREFIX_CLASSES,
  }).kernel;
}

const arena = createSemanticSharedTtArena({
  domainSpec: SPEC,
  entryCapacity: 8,
  associativity: 8,
  termCapacity: 4096,
});
const kernel = createKernel();
const semantic = createOnlineSemanticQuotientPort(kernel, arena);
const rawTt = createSemanticSharedTtView(arena);
const rawProofs = createPackedProofStore(arena);
const rootId = kernel.rootId;

const stableKey = semantic.port.ensureProofKey(rootId);
assert.equal(stableKey, rootId, 'semantic adapter leaked a generation-bearing proof handle');
semantic.proofStore.publishExact(stableKey, 0, 1);

const objectAllocationsBeforeHotProbe = semantic.descriptorCache.metrics.stateDescriptorObjectsAllocated;
const transientUsesBeforeHotProbe = semantic.descriptorCache.metrics.transientStateDescriptorUses;
for (let index = 0; index < 128; index += 1) {
  assert.equal(semantic.port.proofKey(rootId), rootId, 'hot semantic probe lost stable root identity');
}
assert.equal(
  semantic.descriptorCache.metrics.stateDescriptorObjectsAllocated,
  objectAllocationsBeforeHotProbe,
  'hot semantic probes allocated durable state descriptor objects',
);
assert.ok(
  semantic.descriptorCache.metrics.transientStateDescriptorUses >= transientUsesBeforeHotProbe + 128,
  'hot semantic probes did not use the transient descriptor scratch',
);
assert.equal(semantic.descriptorCache.metrics.termIdsCached, 0, 'semantic descriptor cache retained duplicate term IDs');
assert.equal(semantic.descriptorCache.metrics.termArenaBytes, 0, 'semantic descriptor cache retained a duplicate term arena');
assert.equal(
  semantic.descriptorCache.metrics.retainedTypedBytes,
  semantic.descriptorCache.metrics.classMetadataBytes,
  'semantic descriptor cache retained storage beyond class metadata',
);

const rootDescriptor = semantic.descriptorCache.stateDescriptor(rootId);
const originalHandle = rawTt.probe(rootDescriptor);
assert.ok(originalHandle >= arena.entryCapacity, 'root semantic identity was not admitted');
assert.equal(rawProofs.lower(originalHandle), 0, 'root lower proof was not published');
assert.equal(rawProofs.upper(originalHandle), 0, 'root upper proof was not published');

let replacements = 0;
for (let id = 0; id < 64 && rawTt.probe(rootDescriptor) >= 0; id += 1) {
  const handle = rawTt.ensure(syntheticDescriptor(id));
  rawProofs.publishExact(handle, (id % 3) - 1, id % SPEC.columns);
  replacements += 1;
}
assert.equal(rawTt.probe(rootDescriptor), -1, 'control failed to evict the original root generation');

const stalePublicationsBefore = rawProofs.metrics.stalePublications;
const staleResult = rawProofs.publishExact(originalHandle, 1, 3);
assert.equal(staleResult, null, 'raw stale publication did not report rejection');
assert.ok(
  rawProofs.metrics.stalePublications > stalePublicationsBefore,
  'raw proof store did not count the rejected stale publication',
);

const refreshesBefore = semantic.identityMetrics.proofHandleRefreshes;
const reboundResult = semantic.proofStore.publishExact(stableKey, 1, 2);
assert.notEqual(reboundResult, null, 'semantic adapter failed to publish after generation replacement');
assert.ok(
  semantic.identityMetrics.proofHandleRefreshes > refreshesBefore,
  'semantic adapter did not observe and refresh the evicted generation',
);

assert.equal(semantic.port.proofKey(rootId), rootId, 'stable root proof key was not restored');
assert.equal(semantic.proofStore.lower(stableKey), 1, 'rebound lower proof was lost');
assert.equal(semantic.proofStore.upper(stableKey), 1, 'rebound upper proof was lost');
assert.equal(semantic.proofStore.bestMove(stableKey), 2, 'rebound best-move proof hint was lost');

const reboundHandle = rawTt.probe(semantic.descriptorCache.stateDescriptor(rootId));
assert.ok(reboundHandle >= arena.entryCapacity, 'root identity was not re-admitted after eviction');
assert.notEqual(reboundHandle, originalHandle, 'root identity reused the stale generation handle');
assert.equal(rawProofs.lower(reboundHandle), 1, 'raw rebound lower proof mismatch');
assert.equal(rawProofs.upper(reboundHandle), 1, 'raw rebound upper proof mismatch');

const result = Object.freeze({
  kind: 'connect4-semantic-proof-lifecycle-control-v2',
  status: 'complete',
  stableKey,
  originalHandle,
  reboundHandle,
  replacements,
  identity: Object.freeze({ ...semantic.identityMetrics }),
  proofStore: Object.freeze({ ...rawProofs.metrics }),
  descriptorCache: Object.freeze({ ...semantic.descriptorCache.metrics }),
  tt: rawTt.stats(),
});

console.error(`SEMANTIC_PROOF_LIFECYCLE_SUMMARY=${JSON.stringify(result)}`);
console.log(JSON.stringify(result, null, 2));
