import { performance } from 'node:perf_hooks';
import { createChunkedResidualQuotientKernel } from './quotient-native-negamax-chunked-residual-kernel.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';

const SPEC = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const MAX_RANK = Number.parseInt(process.env.MAX_RANK ?? '12', 10);
const MAX_STATES = Number.parseInt(process.env.MAX_STATES ?? '2000000', 10);
const PREFIX_CLASSES = Number.parseInt(process.env.PREFIX_CLASSES ?? '4096', 10);

const EXPECTED_RANK_STATES = Object.freeze([
  1,
  7,
  49,
  238,
  1120,
  4263,
  16422,
  54131,
  182383,
  538774,
]);

// Counts recorded by the exact term-list 7x6 census after completely expanding
// each support rank. These are target-scale semantic regression checkpoints.
const EXPECTED_CLASSES_AFTER_EXPANDING_RANK = Object.freeze([
  16,
  72,
  548,
  1780,
  10304,
  28154,
  135109,
  331014,
  1357101,
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(Number.isInteger(MAX_RANK) && MAX_RANK >= 0 && MAX_RANK <= 42, 'MAX_RANK must be in [0,42]');
assert(Number.isInteger(MAX_STATES) && MAX_STATES >= 1, 'MAX_STATES must be positive');
assert(Number.isInteger(PREFIX_CLASSES) && PREFIX_CLASSES >= 1, 'PREFIX_CLASSES must be positive');

function snapshot(kernel, rank, rankStates, elapsedMs, edges) {
  const memory = kernel.memoryStats();
  const residual = memory.residual;
  const processMemory = process.memoryUsage();
  const classMetrics = kernel.classes.metrics;
  const chunkMetrics = kernel.classes.chunkPool.metrics;
  return Object.freeze({
    rank,
    rankStates,
    cumulativeStates: kernel.states.count,
    residualClasses: kernel.classes.size,
    uniqueChunks: residual.chunkCount,
    chunkCapacity: residual.chunkCapacity,
    elapsedMs,
    edges: { ...edges },
    classTransitions: {
      ownHits: classMetrics.ownTransitionHits,
      ownMisses: classMetrics.ownTransitionMisses,
      blockHits: classMetrics.blockTransitionHits,
      blockMisses: classMetrics.blockTransitionMisses,
      outOfPrefixOwn: classMetrics.outOfPrefixOwn ?? 0,
      outOfPrefixBlock: classMetrics.outOfPrefixBlock ?? 0,
      reducedTerms: classMetrics.reducedTerms,
      supersetWordClears: classMetrics.supersetWordClears,
    },
    chunkIntern: {
      lookups: chunkMetrics.lookups,
      hits: chunkMetrics.hits,
      misses: chunkMetrics.misses,
      payloadGrows: chunkMetrics.payloadGrows,
      hashGrows: chunkMetrics.hashGrows,
    },
    classIntern: {
      lookups: classMetrics.internLookups,
      hits: classMetrics.internHits,
      misses: classMetrics.internMisses,
      hashGrows: classMetrics.hashGrows,
      classGrows: classMetrics.classGrows,
    },
    stateIntern: { ...kernel.states.metrics },
    typedMemory: {
      total: memory.totalTypedBytes,
      state: memory.state.totalTypedBytes,
      residual: residual.totalTypedBytes,
      support: memory.supportBytes,
      transitionCache: residual.transitionCacheBytes,
      classMetadata: residual.classMetadataBytes,
      classHashSlots: residual.classHashSlotBytes,
      chunkPayload: residual.chunkPayloadBytes,
      chunkHashSlots: residual.chunkHashSlotBytes,
      ontologyMasks: residual.maskBytes,
    },
    processMemory: {
      rss: processMemory.rss,
      heapTotal: processMemory.heapTotal,
      heapUsed: processMemory.heapUsed,
      external: processMemory.external,
      arrayBuffers: processMemory.arrayBuffers,
    },
  });
}

const setupStarted = performance.now();
const wrap = createChunkedResidualQuotientKernel(SPEC, {
  cacheEdges: false,
  supportLayout: 'packed',
  prefixClasses: PREFIX_CLASSES,
});
const kernel = wrap.kernel;
const setupMs = performance.now() - setupStarted;

assert(kernel.support.itemCapacity === 823543, `unexpected 7x6 support capacity ${kernel.support.itemCapacity}`);
assert(kernel.classes.termVocabulary.count === 625, `unexpected 7x6 vocabulary ${kernel.classes.termVocabulary.count}`);
assert(kernel.supportAccess.kind === 'packed', 'chunked 7x6 census requires packed support');

const buckets = Array.from({ length: MAX_RANK + 1 }, () => []);
buckets[0].push(kernel.rootId);
let nextUnbucketedId = 1;
let aborted = false;
let abortReason = null;
const edgeCounts = { legalNonterminal: 0, terminalWin: 0, illegal: 0 };
const ranks = [];
const campaignStarted = performance.now();

for (let rank = 0; rank <= MAX_RANK; rank += 1) {
  const bucket = buckets[rank];
  if (rank < EXPECTED_RANK_STATES.length) {
    assert(bucket.length === EXPECTED_RANK_STATES[rank], `rank-${rank} q-state count mismatch: ${bucket.length} != ${EXPECTED_RANK_STATES[rank]}`);
  }

  const rankStarted = performance.now();
  const edgeStart = { ...edgeCounts };
  const stateStart = kernel.states.count;
  const classStart = kernel.classes.size;

  if (rank < MAX_RANK) {
    for (let index = 0; index < bucket.length; index += 1) {
      const stateId = bucket[index];
      const supportIndex = kernel.states.support[stateId];
      assert(kernel.supportAccess.rankAt(supportIndex) === rank, `rank mismatch for q ${stateId}`);

      for (let column = 0; column < SPEC.columns; column += 1) {
        const child = kernel.advance(stateId, column);
        if (child === QN_ILLEGAL) edgeCounts.illegal += 1;
        else if (child === QN_TERMINAL_WIN) edgeCounts.terminalWin += 1;
        else edgeCounts.legalNonterminal += 1;

        while (nextUnbucketedId < kernel.states.count) {
          const newId = nextUnbucketedId++;
          const childRank = kernel.supportAccess.rankAt(kernel.states.support[newId]);
          assert(childRank === rank + 1, `new q ${newId} skipped support rank: ${rank}->${childRank}`);
          if (childRank <= MAX_RANK) buckets[childRank].push(newId);
        }

        if (kernel.states.count > MAX_STATES) {
          aborted = true;
          abortReason = `state-cap:${MAX_STATES}`;
          break;
        }
      }
      if (aborted) break;
    }
  }

  if (!aborted && rank < EXPECTED_CLASSES_AFTER_EXPANDING_RANK.length && rank < MAX_RANK) {
    const expectedClasses = EXPECTED_CLASSES_AFTER_EXPANDING_RANK[rank];
    assert(kernel.classes.size === expectedClasses, `rank-${rank} residual-class count mismatch: ${kernel.classes.size} != ${expectedClasses}`);
  }

  const rankElapsedMs = performance.now() - rankStarted;
  const cumulativeElapsedMs = performance.now() - campaignStarted;
  const rankEdges = {
    legalNonterminal: edgeCounts.legalNonterminal - edgeStart.legalNonterminal,
    terminalWin: edgeCounts.terminalWin - edgeStart.terminalWin,
    illegal: edgeCounts.illegal - edgeStart.illegal,
  };
  const row = Object.freeze({
    ...snapshot(kernel, rank, bucket.length, cumulativeElapsedMs, edgeCounts),
    rankElapsedMs,
    newStatesWhileExpandingRank: kernel.states.count - stateStart,
    newResidualClassesWhileExpandingRank: kernel.classes.size - classStart,
    rankEdges,
  });
  ranks.push(row);
  console.error(`[7x6-chunked] rank=${rank} statesAtRank=${bucket.length} totalStates=${kernel.states.count} classes=${kernel.classes.size} chunks=${row.uniqueChunks} rankMs=${rankElapsedMs.toFixed(3)} typedMB=${(row.typedMemory.total / 1048576).toFixed(2)} residualMB=${(row.typedMemory.residual / 1048576).toFixed(2)} rssMB=${(row.processMemory.rss / 1048576).toFixed(1)}`);

  if (aborted) break;
}

const finalMemory = kernel.memoryStats();
const processMemory = process.memoryUsage();
const completedRank = ranks.at(-1)?.rank ?? -1;
const result = {
  kind: 'connect4-standard-7x6-chunked-residual-forward-growth-v1',
  status: aborted ? 'capped' : 'complete-to-requested-rank',
  date: '2026-09-11',
  geometry: '7x6:c4',
  contract: {
    purpose: 'target-scale storage/runtime qualification of exact persistent chunked residual representation; not an exact root solve',
    maxRank: MAX_RANK,
    maxStates: MAX_STATES,
    prefixClasses: PREFIX_CLASSES,
    supportLayout: 'packed-u32',
    residualRepresentation: 'persistent-five-by-128bit-chunk-IDs',
  },
  setupMs,
  campaignMs: performance.now() - campaignStarted,
  completedRank,
  aborted,
  abortReason,
  supportStates: kernel.support.itemCapacity,
  vocabularyTerms: kernel.classes.termVocabulary.count,
  final: {
    states: kernel.states.count,
    residualClasses: kernel.classes.size,
    uniqueChunks: finalMemory.residual.chunkCount,
    chunkCapacity: finalMemory.residual.chunkCapacity,
    typedBytes: finalMemory.totalTypedBytes,
    stateBytes: finalMemory.state.totalTypedBytes,
    residualBytes: finalMemory.residual.totalTypedBytes,
    supportBytes: finalMemory.supportBytes,
    transitionCacheBytes: finalMemory.residual.transitionCacheBytes,
    classMetadataBytes: finalMemory.residual.classMetadataBytes,
    classHashSlotBytes: finalMemory.residual.classHashSlotBytes,
    chunkPayloadBytes: finalMemory.residual.chunkPayloadBytes,
    chunkHashSlotBytes: finalMemory.residual.chunkHashSlotBytes,
    edgeCounts,
    classMetrics: { ...kernel.classes.metrics },
    chunkMetrics: { ...kernel.classes.chunkPool.metrics },
    stateMetrics: { ...kernel.states.metrics },
    processMemory: {
      rss: processMemory.rss,
      heapTotal: processMemory.heapTotal,
      heapUsed: processMemory.heapUsed,
      external: processMemory.external,
      arrayBuffers: processMemory.arrayBuffers,
    },
  },
  ranks,
};

console.error(`QUOTIENT_7X6_CHUNKED_GROWTH_SUMMARY=${JSON.stringify({
  status: result.status,
  completedRank,
  states: result.final.states,
  residualClasses: result.final.residualClasses,
  uniqueChunks: result.final.uniqueChunks,
  chunkCapacity: result.final.chunkCapacity,
  typedBytes: result.final.typedBytes,
  residualBytes: result.final.residualBytes,
  rss: result.final.processMemory.rss,
  campaignMs: result.campaignMs,
  chunkHits: result.final.chunkMetrics.hits,
  chunkMisses: result.final.chunkMetrics.misses,
  classInternHits: result.final.classMetrics.internHits,
  classInternMisses: result.final.classMetrics.internMisses,
  stateInternHits: result.final.stateMetrics.internHits,
  stateInternMisses: result.final.stateMetrics.internMisses,
})}`);
console.log(JSON.stringify(result, null, 2));
