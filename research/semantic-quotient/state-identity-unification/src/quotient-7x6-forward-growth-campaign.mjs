import { performance } from 'node:perf_hooks';
import { createScaledTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-scaled-term-id-kernel.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';

const SPEC = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const MAX_RANK = Number.parseInt(process.env.MAX_RANK ?? '12', 10);
const MAX_STATES = Number.parseInt(process.env.MAX_STATES ?? '2000000', 10);
const PREFIX_CLASSES = Number.parseInt(process.env.PREFIX_CLASSES ?? '4096', 10);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(Number.isInteger(MAX_RANK) && MAX_RANK >= 0 && MAX_RANK <= 42, 'MAX_RANK must be an integer in [0,42]');
assert(Number.isInteger(MAX_STATES) && MAX_STATES >= 1, 'MAX_STATES must be positive');
assert(Number.isInteger(PREFIX_CLASSES) && PREFIX_CLASSES >= 1, 'PREFIX_CLASSES must be positive');

function snapshotMetrics(kernel, elapsedMs, rank, rankStates, edgeCounts) {
  const memory = kernel.memoryStats();
  const processMemory = process.memoryUsage();
  const classMetrics = kernel.classes.metrics;
  const stateMetrics = kernel.states.metrics;
  return Object.freeze({
    rank,
    rankStates,
    cumulativeStates: kernel.states.count,
    residualClasses: kernel.classes.size,
    residualTerms: memory.residual.residualTerms,
    elapsedMs,
    edges: { ...edgeCounts },
    classTransitions: {
      ownHits: classMetrics.ownTransitionHits,
      ownMisses: classMetrics.ownTransitionMisses,
      blockHits: classMetrics.blockTransitionHits,
      blockMisses: classMetrics.blockTransitionMisses,
      outOfPrefixOwn: classMetrics.outOfPrefixOwn ?? 0,
      outOfPrefixBlock: classMetrics.outOfPrefixBlock ?? 0,
      crossDominanceChecks: classMetrics.crossDominanceChecks,
    },
    stateIntern: {
      lookups: stateMetrics.internLookups,
      hits: stateMetrics.internHits,
      misses: stateMetrics.internMisses,
      hashGrows: stateMetrics.hashGrows,
      stateGrows: stateMetrics.stateGrows,
    },
    typedMemory: {
      total: memory.totalTypedBytes,
      state: memory.state.totalTypedBytes,
      residual: memory.residual.totalTypedBytes,
      residualTransitionCache: memory.residual.transitionCacheBytes,
      support: memory.supportBytes,
      bits: memory.bitBytes,
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
const wrap = createScaledTermIdQuotientNativeNegamaxKernel(SPEC, {
  cacheEdges: false,
  supportLayout: 'packed',
  prefixClasses: PREFIX_CLASSES,
});
const kernel = wrap.kernel;
const setupMs = performance.now() - setupStarted;

assert(kernel.support.itemCapacity === 823543, `unexpected 7x6 support capacity ${kernel.support.itemCapacity}`);
assert(kernel.classes.termVocabulary.count === 625, `unexpected 7x6 residual vocabulary ${kernel.classes.termVocabulary.count}`);
assert(kernel.supportAccess.kind === 'packed', '7x6 growth campaign must use packed support');

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
  const rankStarted = performance.now();
  const edgeStart = { ...edgeCounts };
  const stateStart = kernel.states.count;
  const classStart = kernel.classes.size;

  if (rank < MAX_RANK) {
    for (let index = 0; index < bucket.length; index += 1) {
      const stateId = bucket[index];
      const supportIndex = kernel.states.support[stateId];
      const actualRank = kernel.supportAccess.rankAt(supportIndex);
      assert(actualRank === rank, `bucket rank mismatch: state ${stateId} expected ${rank}, got ${actualRank}`);

      for (let column = 0; column < SPEC.columns; column += 1) {
        const child = kernel.advance(stateId, column);
        if (child === QN_ILLEGAL) edgeCounts.illegal += 1;
        else if (child === QN_TERMINAL_WIN) edgeCounts.terminalWin += 1;
        else edgeCounts.legalNonterminal += 1;

        while (nextUnbucketedId < kernel.states.count) {
          const newId = nextUnbucketedId++;
          const newRank = kernel.supportAccess.rankAt(kernel.states.support[newId]);
          assert(newRank === rank + 1, `new q state ${newId} skipped rank: parent=${rank}, child=${newRank}`);
          if (newRank <= MAX_RANK) buckets[newRank].push(newId);
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

  const rankElapsedMs = performance.now() - rankStarted;
  const cumulativeElapsedMs = performance.now() - campaignStarted;
  const rankEdges = {
    legalNonterminal: edgeCounts.legalNonterminal - edgeStart.legalNonterminal,
    terminalWin: edgeCounts.terminalWin - edgeStart.terminalWin,
    illegal: edgeCounts.illegal - edgeStart.illegal,
  };
  const snapshot = snapshotMetrics(kernel, cumulativeElapsedMs, rank, bucket.length, edgeCounts);
  const row = Object.freeze({
    ...snapshot,
    rankElapsedMs,
    newStatesWhileExpandingRank: kernel.states.count - stateStart,
    newResidualClassesWhileExpandingRank: kernel.classes.size - classStart,
    rankEdges,
  });
  ranks.push(row);
  console.error(`[7x6-growth] rank=${rank} statesAtRank=${bucket.length} totalStates=${kernel.states.count} classes=${kernel.classes.size} terms=${row.residualTerms} rankMs=${rankElapsedMs.toFixed(3)} typedMB=${(row.typedMemory.total / 1048576).toFixed(2)} outPrefix=${row.classTransitions.outOfPrefixOwn + row.classTransitions.outOfPrefixBlock}`);

  if (aborted) break;
}

const completedRank = ranks.at(-1)?.rank ?? -1;
const finalMemory = kernel.memoryStats();
const result = {
  kind: 'connect4-standard-7x6-quotient-forward-growth-v1',
  status: aborted ? 'capped' : 'complete-to-requested-rank',
  date: '2026-09-11',
  geometry: '7x6:c4',
  contract: {
    purpose: 'measure exact quotient-state and residual-class growth only; not an exact root solve',
    maxRank: MAX_RANK,
    maxStates: MAX_STATES,
    prefixClasses: PREFIX_CLASSES,
    supportLayout: 'packed-u32',
    residualRepresentation: 'u16-term-id',
    transitionCache: 'fixed-dense-prefix',
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
    residualTerms: finalMemory.residual.residualTerms,
    typedBytes: finalMemory.totalTypedBytes,
    stateBytes: finalMemory.state.totalTypedBytes,
    residualBytes: finalMemory.residual.totalTypedBytes,
    supportBytes: finalMemory.supportBytes,
    transitionCacheBytes: finalMemory.residual.transitionCacheBytes,
    edgeCounts,
    classMetrics: { ...kernel.classes.metrics },
    stateMetrics: { ...kernel.states.metrics },
  },
  ranks,
};

console.error(`QUOTIENT_7X6_FORWARD_GROWTH_SUMMARY=${JSON.stringify({
  status: result.status,
  completedRank,
  states: result.final.states,
  residualClasses: result.final.residualClasses,
  residualTerms: result.final.residualTerms,
  typedBytes: result.final.typedBytes,
  campaignMs: result.campaignMs,
  outOfPrefixOwn: result.final.classMetrics.outOfPrefixOwn ?? 0,
  outOfPrefixBlock: result.final.classMetrics.outOfPrefixBlock ?? 0,
  internHits: result.final.stateMetrics.internHits,
  internMisses: result.final.stateMetrics.internMisses,
})}`);
console.log(JSON.stringify(result, null, 2));
