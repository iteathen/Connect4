import { performance } from 'node:perf_hooks';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { createQuotientNativeNegamaxSupportLayoutKernel } from './quotient-native-negamax-support-layout-kernel.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';
import { installSlot64ResidualPool as installBaselinePool } from './quotient-slot64-residual-pool-v2.mjs';

const SPEC = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const REPEATS = Number.parseInt(process.env.REPEATS ?? '3', 10);
const PREFIX_CLASSES = 4096;
const EXPECTED_RANK_STATES = Object.freeze([1, 7, 49, 238, 1120, 4263, 16422, 54131, 182383]);
const EXPECTED_CLASSES = Object.freeze([16, 72, 548, 1780, 10304, 28154, 135109, 331014, 1357101]);
const EXPECTED = Object.freeze({
  states: 797388,
  classes: 1357101,
  frontier: 538774,
  typedBytes: 118099719,
  residualBytes: 86493624,
  legalNonterminal: 1772397,
  terminalWin: 33274,
  illegal: 4627,
});

function assert(condition, message) { if (!condition) throw new Error(message); }
function median(values) { const sorted = [...values].sort((a, b) => a - b); return sorted[Math.floor(sorted.length / 2)]; }
function extract(source, name, nextName = null) {
  const marker = `const ${name} = \``;
  const start = source.indexOf(marker);
  assert(start >= 0, `${name} marker missing`);
  const bodyStart = start + marker.length;
  const terminator = nextName ? `\`;\n\nconst ${nextName} = \`` : '`;';
  const end = source.indexOf(terminator, bodyStart);
  assert(end >= 0, `${name} terminator missing`);
  return source.slice(bodyStart, end);
}
assert(Number.isInteger(REPEATS) && REPEATS >= 3 && REPEATS <= 7, 'REPEATS must be in [3,7]');

const candidateDefinitionUrl = new URL('./quotient-slot64-direct-own-campaign.mjs', import.meta.url);
const baselinePoolUrl = new URL('./quotient-slot64-residual-pool-v2.mjs', import.meta.url);
const generatedUrl = new URL('./quotient-slot64-residual-pool-direct-own-paired.generated.mjs', import.meta.url);
const definitionSource = await readFile(candidateDefinitionUrl, 'utf8');
const oldOwn = extract(definitionSource, 'OLD_OWN', 'NEW_OWN');
const newOwn = extract(definitionSource, 'NEW_OWN');
const baselineSource = await readFile(baselinePoolUrl, 'utf8');
const seam = baselineSource.indexOf(oldOwn);
assert(seam >= 0 && baselineSource.indexOf(oldOwn, seam + oldOwn.length) < 0, 'direct-own candidate seam drifted');
await writeFile(generatedUrl, baselineSource.slice(0, seam) + newOwn + baselineSource.slice(seam + oldOwn.length), 'utf8');

function runOnce(installPool, label) {
  global.gc?.();
  const setupStarted = performance.now();
  const kernel = createQuotientNativeNegamaxSupportLayoutKernel(SPEC, {
    cacheEdges: false,
    supportLayout: 'packed',
    prefixClasses: PREFIX_CLASSES,
  });
  installPool(kernel, SPEC, { prefixClasses: PREFIX_CLASSES });
  const setupMs = performance.now() - setupStarted;
  assert(kernel.support.itemCapacity === 823543, `${label}: support capacity drift`);
  assert(kernel.classes.termVocabulary.count === 625, `${label}: vocabulary drift`);

  const buckets = Array.from({ length: 10 }, () => []);
  buckets[0].push(kernel.rootId);
  let nextUnbucketedId = 1;
  const edges = { legalNonterminal: 0, terminalWin: 0, illegal: 0 };
  let rank8Ms = null;
  const campaignStarted = performance.now();

  for (let rank = 0; rank <= 8; rank += 1) {
    const bucket = buckets[rank];
    assert(bucket.length === EXPECTED_RANK_STATES[rank], `${label}: rank-${rank} state count drift`);
    const rankStarted = performance.now();
    for (let index = 0; index < bucket.length; index += 1) {
      const stateId = bucket[index];
      for (let column = 0; column < SPEC.columns; column += 1) {
        const child = kernel.advance(stateId, column);
        if (child === QN_ILLEGAL) edges.illegal += 1;
        else if (child === QN_TERMINAL_WIN) edges.terminalWin += 1;
        else edges.legalNonterminal += 1;
        while (nextUnbucketedId < kernel.states.count) {
          const newId = nextUnbucketedId++;
          const childRank = kernel.supportAccess.rankAt(kernel.states.support[newId]);
          assert(childRank === rank + 1, `${label}: q ${newId} rank jump ${rank}->${childRank}`);
          buckets[childRank].push(newId);
        }
      }
    }
    assert(kernel.classes.size === EXPECTED_CLASSES[rank], `${label}: rank-${rank} class count drift`);
    if (rank === 8) rank8Ms = performance.now() - rankStarted;
  }

  const campaignMs = performance.now() - campaignStarted;
  const memory = kernel.memoryStats();
  assert(kernel.states.count === EXPECTED.states, `${label}: final q-state count drift`);
  assert(kernel.classes.size === EXPECTED.classes, `${label}: final class count drift`);
  assert(buckets[9].length === EXPECTED.frontier, `${label}: rank-9 frontier drift`);
  assert(memory.totalTypedBytes === EXPECTED.typedBytes, `${label}: typed bytes drift`);
  assert(memory.residual.totalTypedBytes === EXPECTED.residualBytes, `${label}: residual bytes drift`);
  assert(edges.legalNonterminal === EXPECTED.legalNonterminal, `${label}: nonterminal edge drift`);
  assert(edges.terminalWin === EXPECTED.terminalWin, `${label}: terminal edge drift`);
  assert(edges.illegal === EXPECTED.illegal, `${label}: illegal edge drift`);
  return Object.freeze({
    setupMs,
    campaignMs,
    rank8Ms,
    metrics: { ...kernel.classes.metrics },
  });
}

try {
  const { installSlot64ResidualPool: installCandidatePool } = await import(`${generatedUrl.href}?paired-direct-own-v1`);
  const baseline = [];
  const candidate = [];
  const sequence = [];

  for (let repeat = 0; repeat < REPEATS; repeat += 1) {
    const order = (repeat & 1) === 0 ? ['baseline', 'candidate'] : ['candidate', 'baseline'];
    for (const kind of order) {
      const row = kind === 'baseline'
        ? runOnce(installBaselinePool, `baseline-r${repeat}`)
        : runOnce(installCandidatePool, `candidate-r${repeat}`);
      (kind === 'baseline' ? baseline : candidate).push(row);
      sequence.push({ repeat, kind, campaignMs: row.campaignMs, rank8Ms: row.rank8Ms });
      console.error(`[paired-own-7x6] repeat=${repeat} kind=${kind} campaignMs=${row.campaignMs.toFixed(3)} rank8Ms=${row.rank8Ms.toFixed(3)}`);
    }
  }

  const baselineCampaign = baseline.map((row) => row.campaignMs);
  const candidateCampaign = candidate.map((row) => row.campaignMs);
  const baselineRank8 = baseline.map((row) => row.rank8Ms);
  const candidateRank8 = candidate.map((row) => row.rank8Ms);
  const summary = {
    kind: 'connect4-standard-7x6-slot64-direct-own-paired-v1',
    status: 'complete',
    date: '2026-09-11',
    repeats: REPEATS,
    exactCheckpoint: EXPECTED,
    baseline: {
      campaignMs: baselineCampaign,
      rank8Ms: baselineRank8,
      medianCampaignMs: median(baselineCampaign),
      medianRank8Ms: median(baselineRank8),
    },
    candidate: {
      campaignMs: candidateCampaign,
      rank8Ms: candidateRank8,
      medianCampaignMs: median(candidateCampaign),
      medianRank8Ms: median(candidateRank8),
    },
    ratios: {},
    sequence,
  };
  summary.ratios.campaign = summary.candidate.medianCampaignMs / summary.baseline.medianCampaignMs;
  summary.ratios.rank8 = summary.candidate.medianRank8Ms / summary.baseline.medianRank8Ms;
  console.error(`SLOT64_DIRECT_OWN_PAIRED_SUMMARY=${JSON.stringify({
    repeats: REPEATS,
    baselineCampaignMedian: summary.baseline.medianCampaignMs,
    candidateCampaignMedian: summary.candidate.medianCampaignMs,
    campaignRatio: summary.ratios.campaign,
    baselineRank8Median: summary.baseline.medianRank8Ms,
    candidateRank8Median: summary.candidate.medianRank8Ms,
    rank8Ratio: summary.ratios.rank8,
  })}`);
  console.log(JSON.stringify(summary, null, 2));
} finally {
  await unlink(generatedUrl).catch(() => {});
}
