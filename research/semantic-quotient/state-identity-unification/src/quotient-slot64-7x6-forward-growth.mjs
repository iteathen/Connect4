import { performance } from 'node:perf_hooks';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';

const SPEC = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const EXPAND_THROUGH_RANK = Number.parseInt(process.env.EXPAND_THROUGH_RANK ?? '8', 10);
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

const EXPECTED_STATES_AFTER_EXPANDING_RANK = Object.freeze([
  8,
  57,
  295,
  1415,
  5678,
  22100,
  76231,
  258614,
  797388,
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(Number.isInteger(EXPAND_THROUGH_RANK) && EXPAND_THROUGH_RANK >= 0 && EXPAND_THROUGH_RANK <= 41,
  'EXPAND_THROUGH_RANK must be an integer in [0,41]');
assert(Number.isInteger(MAX_STATES) && MAX_STATES >= 1, 'MAX_STATES must be positive');
assert(Number.isInteger(PREFIX_CLASSES) && PREFIX_CLASSES >= 1, 'PREFIX_CLASSES must be positive');

function snapshot(kernel, rank, rankStates, elapsedMs, edges) {
  const memory = kernel.memoryStats();
  const residual = memory.residual;
  const processMemory = process.memoryUsage();
  const classMetrics = kernel.classes.metrics;
  return Object.freeze({
    rank,
    rankStates,
    cumulativeStates: kernel.states.count,
    residualClasses: kernel.classes.size,
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
    persistence: {
      parentChunkReuses: classMetrics.parentChunkReuses,
      chunkInterns: classMetrics.chunkInterns,
      slotReferenceWidens: classMetrics.slotReferenceWidens,
      reusePerIntern: classMetrics.chunkInterns === 0 ? null : classMetrics.parentChunkReuses / classMetrics.chunkInterns,
    },
    stateIntern: { ...kernel.states.metrics },
    typedMemory: {
      total: memory.totalTypedBytes,
      state: memory.state.totalTypedBytes,
      residual: residual.totalTypedBytes,
      support: memory.supportBytes,
      transitionCache: residual.transitionCacheBytes,
      classTuple: residual.classTupleBytes,
      classMetadata: residual.classMetadataBytes,
      classHashSlots: residual.classHashSlotBytes,
      chunkPayload: residual.chunkPayloadBytes,
      chunkHashSlots: residual.chunkHashSlotBytes,
      chunkDictionary: residual.chunkDictionaryBytes,
      ontologyMasks: residual.maskBytes,
      scratch: residual.scratchBytes,
    },
    classReferenceWidths: [...residual.classReferenceWidths],
    chunkCounts: [...residual.chunkCounts],
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
const wrap = createSlot64ResidualQuotientKernel(SPEC, {
  cacheEdges: false,
  supportLayout: 'packed',
  prefixClasses: PREFIX_CLASSES,
});
const kernel = wrap.kernel;
const setupMs = performance.now() - setupStarted;

assert(kernel.support.itemCapacity === 823543, `unexpected 7x6 support capacity ${kernel.support.itemCapacity}`);
assert(kernel.classes.termVocabulary.count === 625, `unexpected 7x6 vocabulary ${kernel.classes.termVocabulary.count}`);
assert(kernel.supportAccess.kind === 'packed', 'slot64 7x6 census requires packed support');

// We expand ranks 0..EXPAND_THROUGH_RANK and therefore need one additional
// bucket for the frontier discovered by the final expanded rank.
const buckets = Array.from({ length: EXPAND_THROUGH_RANK + 2 }, () => []);
buckets[0].push(kernel.rootId);
let nextUnbucketedId = 1;
let aborted = false;
let abortReason = null;
const edgeCounts = { legalNonterminal: 0, terminalWin: 0, illegal: 0 };
const ranks = [];
const campaignStarted = performance.now();

for (let rank = 0; rank <= EXPAND_THROUGH_RANK; rank += 1) {
  const bucket = buckets[rank];
  if (rank < EXPECTED_RANK_STATES.length) {
    assert(bucket.length === EXPECTED_RANK_STATES[rank],
      `rank-${rank} q-state count mismatch: ${bucket.length} != ${EXPECTED_RANK_STATES[rank]}`);
  }

  const rankStarted = performance.now();
  const edgeStart = { ...edgeCounts };
  const stateStart = kernel.states.count;
  const classStart = kernel.classes.size;

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
        if (childRank < buckets.length) buckets[childRank].push(newId);
      }

      if (kernel.states.count > MAX_STATES) {
        aborted = true;
        abortReason = `state-cap:${MAX_STATES}`;
        break;
      }
    }
    if (aborted) break;
  }

  if (!aborted && rank < EXPECTED_CLASSES_AFTER_EXPANDING_RANK.length) {
    const expectedClasses = EXPECTED_CLASSES_AFTER_EXPANDING_RANK[rank];
    assert(kernel.classes.size === expectedClasses,
      `rank-${rank} residual-class count mismatch: ${kernel.classes.size} != ${expectedClasses}`);
  }
  if (!aborted && rank < EXPECTED_STATES_AFTER_EXPANDING_RANK.length) {
    const expectedStates = EXPECTED_STATES_AFTER_EXPANDING_RANK[rank];
    assert(kernel.states.count === expectedStates,
      `rank-${rank} cumulative q-state mismatch: ${kernel.states.count} != ${expectedStates}`);
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
  console.error(`[7x6-slot64] rank=${rank} statesAtRank=${bucket.length} totalStates=${kernel.states.count} classes=${kernel.classes.size} rankMs=${rankElapsedMs.toFixed(3)} typedMB=${(row.typedMemory.total / 1048576).toFixed(2)} residualMB=${(row.typedMemory.residual / 1048576).toFixed(2)} tupleMB=${(row.typedMemory.classTuple / 1048576).toFixed(2)} dictMB=${(row.typedMemory.chunkDictionary / 1048576).toFixed(2)} widths=${row.classReferenceWidths.join('')} rssMB=${(row.processMemory.rss / 1048576).toFixed(1)}`);

  if (aborted) break;
}

const finalMemory = kernel.memoryStats();
const residual = finalMemory.residual;
const processMemory = process.memoryUsage();
const completedExpandedRank = ranks.at(-1)?.rank ?? -1;
const result = {
  kind: 'connect4-standard-7x6-slot64-residual-forward-growth-v1',
  status: aborted ? 'capped' : 'complete-to-requested-rank',
  date: '2026-09-11',
  geometry: '7x6:c4',
  contract: {
    purpose: 'target-scale storage/runtime qualification of exact slot-local 64-bit persistent residual representation; not an exact root solve',
    expandThroughRank: EXPAND_THROUGH_RANK,
    maxStates: MAX_STATES,
    prefixClasses: PREFIX_CLASSES,
    supportLayout: 'packed-u32',
    residualRepresentation: '10-slot x 64-bit chunks; slot-local dictionaries; narrow IDs; parent-chunk reuse',
  },
  setupMs,
  campaignMs: performance.now() - campaignStarted,
  completedExpandedRank,
  aborted,
  abortReason,
  supportStates: kernel.support.itemCapacity,
  vocabularyTerms: kernel.classes.termVocabulary.count,
  nextFrontierRank: completedExpandedRank + 1,
  nextFrontierStates: buckets[completedExpandedRank + 1]?.length ?? null,
  final: {
    states: kernel.states.count,
    residualClasses: kernel.classes.size,
    typedBytes: finalMemory.totalTypedBytes,
    stateBytes: finalMemory.state.totalTypedBytes,
    residualBytes: residual.totalTypedBytes,
    supportBytes: finalMemory.supportBytes,
    transitionCacheBytes: residual.transitionCacheBytes,
    classTupleBytes: residual.classTupleBytes,
    classMetadataBytes: residual.classMetadataBytes,
    classHashSlotBytes: residual.classHashSlotBytes,
    classReferenceWidths: [...residual.classReferenceWidths],
    chunkCounts: [...residual.chunkCounts],
    chunkPayloadBytes: residual.chunkPayloadBytes,
    chunkHashSlotBytes: residual.chunkHashSlotBytes,
    chunkDictionaryBytes: residual.chunkDictionaryBytes,
    edgeCounts,
    classMetrics: { ...kernel.classes.metrics },
    stateMetrics: { ...kernel.states.metrics },
    processMemory: {
      rss: processMemory.rss,
      heapTotal: processMemory.heapTotal,
      heapUsed: processMemory.heapUsed,
      external: processMemory.external,
      arrayBuffers: processMemory.arrayBuffers,
    },
  },
  references: {
    termListRank8TypedBytes: 213445613,
    termListRank8ResidualBytes: 181839518,
    global128Rank8TypedBytes: 133828301,
    global128Rank8ResidualBytes: 102222206,
    modeledSlot64PayloadBytes: 31874153,
  },
  ranks,
};

console.error(`QUOTIENT_7X6_SLOT64_GROWTH_SUMMARY=${JSON.stringify({
  status: result.status,
  completedExpandedRank,
  nextFrontierStates: result.nextFrontierStates,
  states: result.final.states,
  residualClasses: result.final.residualClasses,
  typedBytes: result.final.typedBytes,
  residualBytes: result.final.residualBytes,
  classTupleBytes: result.final.classTupleBytes,
  chunkDictionaryBytes: result.final.chunkDictionaryBytes,
  classReferenceWidths: result.final.classReferenceWidths,
  chunkCounts: result.final.chunkCounts,
  parentChunkReuses: result.final.classMetrics.parentChunkReuses,
  chunkInterns: result.final.classMetrics.chunkInterns,
  slotReferenceWidens: result.final.classMetrics.slotReferenceWidens,
  rss: result.final.processMemory.rss,
  campaignMs: result.campaignMs,
  ratioTypedVsTermList: result.final.typedBytes / result.references.termListRank8TypedBytes,
  ratioResidualVsTermList: result.final.residualBytes / result.references.termListRank8ResidualBytes,
  ratioTypedVsGlobal128: result.final.typedBytes / result.references.global128Rank8TypedBytes,
  ratioResidualVsGlobal128: result.final.residualBytes / result.references.global128Rank8ResidualBytes,
})}`);
console.log(JSON.stringify(result, null, 2));
