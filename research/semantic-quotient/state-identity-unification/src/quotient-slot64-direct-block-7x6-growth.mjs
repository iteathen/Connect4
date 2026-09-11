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
const FROZEN_SPARSE_BASELINE = Object.freeze({
  commit: 'fde0d90c952278fbb796c5a9d3964cf1ec0e71bb',
  workflowRun: 34655651266,
  workflowJob: 103447350433,
  campaignMs: 13145.194454999999,
  rank8Ms: 9354.055164000001,
  typedBytes: 118099719,
  residualBytes: 86493624,
  states: 797388,
  residualClasses: 1357101,
  nextFrontierStates: 538774,
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function extractCandidateBlock(campaignSource, name, nextName = null) {
  const marker = `const ${name} = \``;
  const start = campaignSource.indexOf(marker);
  assert(start >= 0, `${name} marker missing from bounded candidate campaign`);
  const bodyStart = start + marker.length;
  const terminator = nextName ? `\`;\n\nconst ${nextName} = \`` : '`;';
  const end = campaignSource.indexOf(terminator, bodyStart);
  assert(end >= 0, `${name} terminator missing from bounded candidate campaign`);
  return campaignSource.slice(bodyStart, end);
}

const candidateCampaignUrl = new URL('./quotient-slot64-direct-block-campaign.mjs', import.meta.url);
const qualifiedPoolUrl = new URL('./quotient-slot64-residual-pool.mjs', import.meta.url);
const generatedPoolUrl = new URL('./quotient-slot64-residual-pool-direct-block-7x6.generated.mjs', import.meta.url);

const candidateCampaignSource = await readFile(candidateCampaignUrl, 'utf8');
const oldBlock = extractCandidateBlock(candidateCampaignSource, 'OLD_BLOCK', 'NEW_BLOCK');
const newBlock = extractCandidateBlock(candidateCampaignSource, 'NEW_BLOCK');
const qualifiedPoolSource = await readFile(qualifiedPoolUrl, 'utf8');
const seam = qualifiedPoolSource.indexOf(oldBlock);
assert(seam >= 0, 'direct-block seam no longer matches qualified sparse slot64 source');
assert(qualifiedPoolSource.indexOf(oldBlock, seam + oldBlock.length) < 0, 'direct-block seam became ambiguous');
await writeFile(generatedPoolUrl, qualifiedPoolSource.slice(0, seam) + newBlock + qualifiedPoolSource.slice(seam + oldBlock.length), 'utf8');

try {
  const { installSlot64ResidualPool } = await import(`${generatedPoolUrl.href}?rank8-direct-block-v1`);
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
  assert(kernel.supportAccess.kind === 'packed', '7x6 direct-block gate requires packed support');

  const buckets = Array.from({ length: EXPAND_THROUGH_RANK + 2 }, () => []);
  buckets[0].push(kernel.rootId);
  let nextUnbucketedId = 1;
  const edges = { legalNonterminal: 0, terminalWin: 0, illegal: 0 };
  const rankRows = [];
  const campaignStarted = performance.now();

  for (let rank = 0; rank <= EXPAND_THROUGH_RANK; rank += 1) {
    const bucket = buckets[rank];
    assert(bucket.length === EXPECTED_RANK_STATES[rank], `rank-${rank} q-state count mismatch: ${bucket.length}`);
    const rankStarted = performance.now();
    for (let index = 0; index < bucket.length; index += 1) {
      const stateId = bucket[index];
      assert(kernel.supportAccess.rankAt(kernel.states.support[stateId]) === rank, `q ${stateId} support-rank mismatch`);
      for (let column = 0; column < SPEC.columns; column += 1) {
        const child = kernel.advance(stateId, column);
        if (child === QN_ILLEGAL) edges.illegal += 1;
        else if (child === QN_TERMINAL_WIN) edges.terminalWin += 1;
        else edges.legalNonterminal += 1;

        while (nextUnbucketedId < kernel.states.count) {
          const newId = nextUnbucketedId++;
          const childRank = kernel.supportAccess.rankAt(kernel.states.support[newId]);
          assert(childRank === rank + 1, `q ${newId} skipped rank ${rank}->${childRank}`);
          buckets[childRank].push(newId);
        }
        assert(kernel.states.count <= MAX_STATES, `state cap ${MAX_STATES} exceeded`);
      }
    }
    assert(kernel.classes.size === EXPECTED_CLASSES_AFTER_EXPANDING_RANK[rank],
      `rank-${rank} class count mismatch: ${kernel.classes.size}`);
    const memory = kernel.memoryStats();
    const row = Object.freeze({
      rank,
      statesAtRank: bucket.length,
      cumulativeStates: kernel.states.count,
      residualClasses: kernel.classes.size,
      rankMs: performance.now() - rankStarted,
      typedBytes: memory.totalTypedBytes,
      residualBytes: memory.residual.totalTypedBytes,
      parentChunkReuses: kernel.classes.metrics.parentChunkReuses,
      chunkInterns: kernel.classes.metrics.chunkInterns,
    });
    rankRows.push(row);
    console.error(`[7x6-direct-block] rank=${rank} states=${kernel.states.count} classes=${kernel.classes.size} rankMs=${row.rankMs.toFixed(3)} typedMB=${(row.typedBytes / 1048576).toFixed(2)}`);
  }

  const campaignMs = performance.now() - campaignStarted;
  const memory = kernel.memoryStats();
  assert(kernel.states.count === FROZEN_SPARSE_BASELINE.states, 'final q-state checkpoint mismatch');
  assert(kernel.classes.size === FROZEN_SPARSE_BASELINE.residualClasses, 'final class checkpoint mismatch');
  assert(buckets[9].length === FROZEN_SPARSE_BASELINE.nextFrontierStates, 'rank-9 frontier checkpoint mismatch');
  assert(memory.totalTypedBytes === FROZEN_SPARSE_BASELINE.typedBytes, 'typed memory drifted from exact sparse baseline');
  assert(memory.residual.totalTypedBytes === FROZEN_SPARSE_BASELINE.residualBytes, 'residual memory drifted from exact sparse baseline');

  const result = {
    kind: 'connect4-standard-7x6-slot64-direct-block-growth-v1',
    status: 'complete-to-rank8',
    date: '2026-09-11',
    candidate: 'same source-generated direct-block transition that passed bounded run 34656048236',
    setupMs,
    campaignMs,
    rank8Ms: rankRows.at(-1).rankMs,
    states: kernel.states.count,
    residualClasses: kernel.classes.size,
    nextFrontierStates: buckets[9].length,
    typedBytes: memory.totalTypedBytes,
    residualBytes: memory.residual.totalTypedBytes,
    edgeCounts: edges,
    classMetrics: { ...kernel.classes.metrics },
    frozenSparseBaseline: FROZEN_SPARSE_BASELINE,
    ratios: {
      campaignVsSparse: campaignMs / FROZEN_SPARSE_BASELINE.campaignMs,
      rank8VsSparse: rankRows.at(-1).rankMs / FROZEN_SPARSE_BASELINE.rank8Ms,
    },
    ranks: rankRows,
  };
  console.error(`SLOT64_DIRECT_BLOCK_7X6_SUMMARY=${JSON.stringify({
    campaignMs,
    rank8Ms: result.rank8Ms,
    campaignRatio: result.ratios.campaignVsSparse,
    rank8Ratio: result.ratios.rank8VsSparse,
    states: result.states,
    residualClasses: result.residualClasses,
    nextFrontierStates: result.nextFrontierStates,
    typedBytes: result.typedBytes,
    residualBytes: result.residualBytes,
  })}`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await unlink(generatedPoolUrl).catch(() => {});
}
