import { performance } from 'node:perf_hooks';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-negamax-domain-contract.mjs';

const SPEC = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const EXPAND_THROUGH_RANK = Number(process.env.EXPAND_THROUGH_RANK ?? 8);
const SAMPLES_PER_RANK = Number(process.env.SAMPLES_PER_RANK ?? 12000);
const PREFIX_CLASSES = Number(process.env.PREFIX_CLASSES ?? 4096);
const TARGET_LOAD = Number(process.env.TARGET_LOAD ?? 0.65);
const ENTRY_BYTES = 29;
const TERM_BYTES = 2;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function nextPowerOfTwo(value) {
  let result = 1;
  while (result < value) result *= 2;
  return result;
}

function quantile(sorted, fraction) {
  if (sorted.length === 0) return 0;
  return sorted[Math.floor((sorted.length - 1) * fraction)];
}

function summarize(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const total = values.reduce((sum, value) => sum + value, 0);
  return Object.freeze({
    count: values.length,
    total,
    mean: values.length === 0 ? 0 : total / values.length,
    min: sorted[0] ?? 0,
    p50: quantile(sorted, 0.50),
    p90: quantile(sorted, 0.90),
    p95: quantile(sorted, 0.95),
    p99: quantile(sorted, 0.99),
    max: sorted.at(-1) ?? 0,
  });
}

function sampleIds(ids, limit) {
  if (ids.length <= limit) return ids;
  const sampled = [];
  const step = ids.length / limit;
  for (let index = 0; index < limit; index += 1) sampled.push(ids[Math.floor(index * step)]);
  return sampled;
}

const started = performance.now();
const { kernel } = createSlot64ResidualQuotientKernel(SPEC, {
  cacheEdges: false,
  prefixClasses: PREFIX_CLASSES,
});
const buckets = Array.from({ length: EXPAND_THROUGH_RANK + 2 }, () => []);
buckets[0].push(kernel.rootId);
let nextUnbucketedId = 1;

for (let rank = 0; rank <= EXPAND_THROUGH_RANK; rank += 1) {
  for (const stateId of buckets[rank]) {
    assert(kernel.supportAccess.rankAt(kernel.states.support[stateId]) === rank, `rank drift at q ${stateId}`);
    for (let column = 0; column < SPEC.columns; column += 1) {
      const child = kernel.advance(stateId, column);
      if (child === QN_ILLEGAL || child === QN_TERMINAL_WIN) continue;
      while (nextUnbucketedId < kernel.states.count) {
        const newId = nextUnbucketedId++;
        const newRank = kernel.supportAccess.rankAt(kernel.states.support[newId]);
        assert(newRank === rank + 1, `new state ${newId} rank ${newRank} from parent rank ${rank}`);
        buckets[newRank].push(newId);
      }
    }
  }
}

assert(kernel.states.count === 797388, `expected 797388 q states, got ${kernel.states.count}`);
assert(kernel.classes.size === 1357101, `expected 1357101 residual classes, got ${kernel.classes.size}`);
assert(buckets[9].length === 538774, `expected 538774 rank-9 states, got ${buckets[9].length}`);

const classCountCache = new Uint16Array(kernel.classes.size);
function residualTermCount(classId) {
  const encoded = classCountCache[classId];
  if (encoded !== 0) return encoded - 1;
  const count = kernel.classes.termIds(classId).length;
  classCountCache[classId] = count + 1;
  return count;
}

const initialPerPlayer = residualTermCount(kernel.classes.initialClass);
assert(initialPerPlayer === 69, `expected 69 initial requirements per player, got ${initialPerPlayer}`);

const byRank = [];
let estimatedTotalTermIds = 0;
let sampledStates = 0;
let sampledClasses = 0;
let observedMax = 0;
for (let rank = 0; rank < buckets.length; rank += 1) {
  const ids = sampleIds(buckets[rank], SAMPLES_PER_RANK);
  const totals = [];
  for (const stateId of ids) {
    const total = residualTermCount(kernel.states.p0Class[stateId])
      + residualTermCount(kernel.states.p1Class[stateId]);
    totals.push(total);
    if (total > observedMax) observedMax = total;
  }
  const stats = summarize(totals);
  estimatedTotalTermIds += stats.mean * buckets[rank].length;
  sampledStates += ids.length;
  byRank.push(Object.freeze({
    rank,
    states: buckets[rank].length,
    sampledStates: ids.length,
    termIds: stats,
  }));
}
for (const encoded of classCountCache) if (encoded !== 0) sampledClasses += 1;
assert(observedMax <= initialPerPlayer * 2, `sampled descriptor exceeded hard upper bound ${initialPerPlayer * 2}`);

const liveEntries = kernel.states.count;
const recommendedEntryCapacity = nextPowerOfTwo(Math.ceil(liveEntries / TARGET_LOAD));
const estimatedTermCapacity = Math.ceil(estimatedTotalTermIds);
const estimatedCheckpointBytes = 8
  + recommendedEntryCapacity * ENTRY_BYTES
  + estimatedTermCapacity * TERM_BYTES;

const models = [];
const weightedMeanTerms = estimatedTotalTermIds / liveEntries;
for (let exponent = 20; exponent <= 25; exponent += 1) {
  const entryCapacity = 2 ** exponent;
  const liveAtTarget = Math.floor(entryCapacity * TARGET_LOAD);
  const termIds = Math.ceil(liveAtTarget * weightedMeanTerms);
  models.push(Object.freeze({
    entryCapacity,
    liveAtTarget,
    entryMetadataBytes: entryCapacity * ENTRY_BYTES + 8,
    estimatedTermIdsAtObservedMean: termIds,
    estimatedTermBytesAtObservedMean: termIds * TERM_BYTES,
    estimatedTotalBytesAtObservedMean: entryCapacity * ENTRY_BYTES + 8 + termIds * TERM_BYTES,
  }));
}

const result = Object.freeze({
  kind: 'connect4-standard7x6-semantic-tt-density-sample-v1',
  status: 'complete',
  spec: SPEC,
  expandThroughRank: EXPAND_THROUGH_RANK,
  elapsedMs: performance.now() - started,
  qStates: kernel.states.count,
  residualClasses: kernel.classes.size,
  rank9Frontier: buckets[9].length,
  sampledStates,
  sampledResidualClasses: sampledClasses,
  descriptorDensity: Object.freeze({
    weightedMeanTermIdsPerState: weightedMeanTerms,
    estimatedTotalTermIds,
    hardUpperTermIdsPerState: initialPerPlayer * 2,
    observedSampleMax: observedMax,
    byRank: Object.freeze(byRank),
  }),
  rank8CheckpointArenaEstimate: Object.freeze({
    targetLoad: TARGET_LOAD,
    liveEntries,
    recommendedEntryCapacity,
    estimatedTermCapacity,
    entryMetadataBytes: recommendedEntryCapacity * ENTRY_BYTES + 8,
    estimatedTermBytes: estimatedTermCapacity * TERM_BYTES,
    estimatedTotalBytes: estimatedCheckpointBytes,
  }),
  capacityModels: Object.freeze(models),
  localKernelTypedBytes: kernel.memoryStats().totalTypedBytes,
});

console.error(`SEMANTIC_TT_DENSITY_SAMPLE=${JSON.stringify(result)}`);
console.log(JSON.stringify(result, null, 2));
