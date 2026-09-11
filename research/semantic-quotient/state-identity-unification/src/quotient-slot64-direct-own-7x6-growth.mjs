import { performance } from 'node:perf_hooks';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { createQuotientNativeNegamaxSupportLayoutKernel } from './quotient-native-negamax-support-layout-kernel.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';

const SPEC = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const EXPAND_THROUGH_RANK = 8;
const MAX_STATES = 2_000_000;
const PREFIX_CLASSES = 4096;
const EXPECTED_RANK_STATES = Object.freeze([1, 7, 49, 238, 1120, 4263, 16422, 54131, 182383]);
const EXPECTED_CLASSES_AFTER_EXPANDING_RANK = Object.freeze([16, 72, 548, 1780, 10304, 28154, 135109, 331014, 1357101]);
const EXPECTED_FINAL = Object.freeze({
  states: 797388,
  residualClasses: 1357101,
  nextFrontierStates: 538774,
  typedBytes: 118099719,
  residualBytes: 86493624,
  legalNonterminal: 1772397,
  terminalWin: 33274,
  illegal: 4627,
});
const HISTORICAL_V2 = Object.freeze({
  commit: 'e22d7a0fd4695c711efbb591b7fe7c430c321e5e',
  pairedDirectBlockBaselineMedianMs: 13060.289071000003,
  pairedDirectBlockBaselineRank8MedianMs: 9276.861176000002,
  postPromotionRun: 34656740698,
  postPromotionRunCampaignMs: 13594.622854,
});

function assert(condition, message) { if (!condition) throw new Error(message); }
function extract(source, name, nextName = null) {
  const marker = `const ${name} = \``;
  const start = source.indexOf(marker);
  assert(start >= 0, `${name} marker missing from candidate campaign`);
  const bodyStart = start + marker.length;
  const terminator = nextName ? `\`;\n\nconst ${nextName} = \`` : '`;';
  const end = source.indexOf(terminator, bodyStart);
  assert(end >= 0, `${name} terminator missing from candidate campaign`);
  return source.slice(bodyStart, end);
}

const candidateCampaignUrl = new URL('./quotient-slot64-direct-own-campaign.mjs', import.meta.url);
const baselinePoolUrl = new URL('./quotient-slot64-residual-pool-v2.mjs', import.meta.url);
const generatedPoolUrl = new URL('./quotient-slot64-residual-pool-direct-own-7x6.generated.mjs', import.meta.url);
const candidateCampaignSource = await readFile(candidateCampaignUrl, 'utf8');
const oldOwn = extract(candidateCampaignSource, 'OLD_OWN', 'NEW_OWN');
const newOwn = extract(candidateCampaignSource, 'NEW_OWN');
const baselineSource = await readFile(baselinePoolUrl, 'utf8');
const seam = baselineSource.indexOf(oldOwn);
assert(seam >= 0, 'direct-own seam no longer matches qualified slot64-v2 source');
assert(baselineSource.indexOf(oldOwn, seam + oldOwn.length) < 0, 'direct-own seam became ambiguous');
await writeFile(generatedPoolUrl, baselineSource.slice(0, seam) + newOwn + baselineSource.slice(seam + oldOwn.length), 'utf8');

try {
  const { installSlot64ResidualPool } = await import(`${generatedPoolUrl.href}?rank8-direct-own-v1`);
  const setupStarted = performance.now();
  const kernel = createQuotientNativeNegamaxSupportLayoutKernel(SPEC, {
    cacheEdges: false,
    supportLayout: 'packed',
    prefixClasses: PREFIX_CLASSES,
  });
  installSlot64ResidualPool(kernel, SPEC, { prefixClasses: PREFIX_CLASSES });
  const setupMs = performance.now() - setupStarted;

  assert(kernel.support.itemCapacity === 823543, `unexpected support capacity ${kernel.support.itemCapacity}`);
  assert(kernel.classes.termVocabulary.count === 625, `unexpected vocabulary count ${kernel.classes.termVocabulary.count}`);
  assert(kernel.supportAccess.kind === 'packed', '7x6 direct-own gate requires packed support');

  const buckets = Array.from({ length: EXPAND_THROUGH_RANK + 2 }, () => []);
  buckets[0].push(kernel.rootId);
  let nextUnbucketedId = 1;
  const edgeCounts = { legalNonterminal: 0, terminalWin: 0, illegal: 0 };
  const ranks = [];
  const campaignStarted = performance.now();

  for (let rank = 0; rank <= EXPAND_THROUGH_RANK; rank += 1) {
    const bucket = buckets[rank];
    assert(bucket.length === EXPECTED_RANK_STATES[rank], `rank-${rank} q-state count mismatch: ${bucket.length}`);
    const rankStarted = performance.now();
    const stateStart = kernel.states.count;
    const classStart = kernel.classes.size;
    const edgeStart = { ...edgeCounts };

    for (let index = 0; index < bucket.length; index += 1) {
      const stateId = bucket[index];
      assert(kernel.supportAccess.rankAt(kernel.states.support[stateId]) === rank, `q ${stateId} support-rank mismatch`);
      for (let column = 0; column < SPEC.columns; column += 1) {
        const child = kernel.advance(stateId, column);
        if (child === QN_ILLEGAL) edgeCounts.illegal += 1;
        else if (child === QN_TERMINAL_WIN) edgeCounts.terminalWin += 1;
        else edgeCounts.legalNonterminal += 1;

        while (nextUnbucketedId < kernel.states.count) {
          const newId = nextUnbucketedId++;
          const childRank = kernel.supportAccess.rankAt(kernel.states.support[newId]);
          assert(childRank === rank + 1, `q ${newId} skipped support rank ${rank}->${childRank}`);
          buckets[childRank].push(newId);
        }
        assert(kernel.states.count <= MAX_STATES, `state cap ${MAX_STATES} exceeded`);
      }
    }

    assert(kernel.classes.size === EXPECTED_CLASSES_AFTER_EXPANDING_RANK[rank],
      `rank-${rank} residual-class count mismatch: ${kernel.classes.size}`);
    const memory = kernel.memoryStats();
    const row = Object.freeze({
      rank,
      rankStates: bucket.length,
      cumulativeStates: kernel.states.count,
      residualClasses: kernel.classes.size,
      rankMs: performance.now() - rankStarted,
      newStates: kernel.states.count - stateStart,
      newResidualClasses: kernel.classes.size - classStart,
      rankEdges: {
        legalNonterminal: edgeCounts.legalNonterminal - edgeStart.legalNonterminal,
        terminalWin: edgeCounts.terminalWin - edgeStart.terminalWin,
        illegal: edgeCounts.illegal - edgeStart.illegal,
      },
      typedBytes: memory.totalTypedBytes,
      residualBytes: memory.residual.totalTypedBytes,
    });
    ranks.push(row);
    console.error(`[7x6-direct-own] rank=${rank} states=${kernel.states.count} classes=${kernel.classes.size} rankMs=${row.rankMs.toFixed(3)} typedMB=${(row.typedBytes / 1048576).toFixed(2)}`);
  }

  const campaignMs = performance.now() - campaignStarted;
  const memory = kernel.memoryStats();
  const final = {
    states: kernel.states.count,
    residualClasses: kernel.classes.size,
    nextFrontierStates: buckets[9].length,
    typedBytes: memory.totalTypedBytes,
    residualBytes: memory.residual.totalTypedBytes,
    edgeCounts,
    classMetrics: { ...kernel.classes.metrics },
    stateMetrics: { ...kernel.states.metrics },
  };

  assert(final.states === EXPECTED_FINAL.states, `final q-state count mismatch ${final.states}`);
  assert(final.residualClasses === EXPECTED_FINAL.residualClasses, `final class count mismatch ${final.residualClasses}`);
  assert(final.nextFrontierStates === EXPECTED_FINAL.nextFrontierStates, `rank-9 frontier mismatch ${final.nextFrontierStates}`);
  assert(final.typedBytes === EXPECTED_FINAL.typedBytes, `typed-memory mismatch ${final.typedBytes}`);
  assert(final.residualBytes === EXPECTED_FINAL.residualBytes, `residual-memory mismatch ${final.residualBytes}`);
  assert(final.edgeCounts.legalNonterminal === EXPECTED_FINAL.legalNonterminal, 'legal-nonterminal edge census mismatch');
  assert(final.edgeCounts.terminalWin === EXPECTED_FINAL.terminalWin, 'terminal-win edge census mismatch');
  assert(final.edgeCounts.illegal === EXPECTED_FINAL.illegal, 'illegal-edge census mismatch');

  const result = {
    kind: 'connect4-standard-7x6-slot64-direct-own-growth-v1',
    status: 'complete-to-rank8',
    date: '2026-09-11',
    contract: {
      candidate: 'same source-generated direct lazy mover that passed bounded run 34657277213',
      expandThroughRank: EXPAND_THROUGH_RANK,
      supportLayout: 'packed-u32',
      residualRepresentation: 'slot64-v2 direct blocking plus lazy direct mover candidate',
    },
    setupMs,
    campaignMs,
    rank8Ms: ranks.at(-1).rankMs,
    final,
    historicalV2: HISTORICAL_V2,
    informationalRatios: {
      campaignVsHistoricalPairedBaselineMedian: campaignMs / HISTORICAL_V2.pairedDirectBlockBaselineMedianMs,
      rank8VsHistoricalPairedBaselineMedian: ranks.at(-1).rankMs / HISTORICAL_V2.pairedDirectBlockBaselineRank8MedianMs,
      campaignVsPostPromotionSeparateRun: campaignMs / HISTORICAL_V2.postPromotionRunCampaignMs,
    },
    ranks,
  };

  console.error(`SLOT64_DIRECT_OWN_7X6_SUMMARY=${JSON.stringify({
    campaignMs,
    rank8Ms: result.rank8Ms,
    states: final.states,
    residualClasses: final.residualClasses,
    nextFrontierStates: final.nextFrontierStates,
    typedBytes: final.typedBytes,
    residualBytes: final.residualBytes,
    campaignVsHistoricalPairedBaselineMedian: result.informationalRatios.campaignVsHistoricalPairedBaselineMedian,
    rank8VsHistoricalPairedBaselineMedian: result.informationalRatios.rank8VsHistoricalPairedBaselineMedian,
  })}`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await unlink(generatedPoolUrl).catch(() => {});
}
