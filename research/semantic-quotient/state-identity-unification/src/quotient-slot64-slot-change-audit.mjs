import { performance } from 'node:perf_hooks';
import { createScaledTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-scaled-term-id-kernel.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';

const SPEC = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const EXPAND_THROUGH_RANK = Number.parseInt(process.env.EXPAND_THROUGH_RANK ?? '8', 10);
const MAX_STATES = Number.parseInt(process.env.MAX_STATES ?? '2000000', 10);
const PREFIX_CLASSES = Number.parseInt(process.env.PREFIX_CLASSES ?? '4096', 10);
const SLOT_SHIFT = 6; // 64 ontology terms per slot.
const SLOT_COUNT = 10;

const EXPECTED_STATES_AFTER_EXPANDING_RANK = Object.freeze([
  8, 57, 295, 1415, 5678, 22100, 76231, 258614, 797388,
]);
const EXPECTED_CLASSES_AFTER_EXPANDING_RANK = Object.freeze([
  16, 72, 548, 1780, 10304, 28154, 135109, 331014, 1357101,
]);

function assert(condition, message) { if (!condition) throw new Error(message); }
function popcount10(mask) {
  let x = mask & 0x3ff;
  x -= (x >>> 1) & 0x555;
  x = (x & 0x333) + ((x >>> 2) & 0x333);
  x = (x + (x >>> 4)) & 0x0f0f;
  return (x * 0x0101) >>> 8;
}
function percentileFromHistogram(histogram, q) {
  const total = histogram.reduce((sum, value) => sum + value, 0);
  if (total === 0) return null;
  const target = Math.max(1, Math.ceil(total * q));
  let seen = 0;
  for (let value = 0; value < histogram.length; value += 1) {
    seen += histogram[value];
    if (seen >= target) return value;
  }
  return histogram.length - 1;
}
function summarizeHistogram(histogram) {
  const total = histogram.reduce((sum, value) => sum + value, 0);
  let weighted = 0;
  for (let value = 0; value < histogram.length; value += 1) weighted += value * histogram[value];
  return {
    total,
    mean: total === 0 ? null : weighted / total,
    p50: percentileFromHistogram(histogram, 0.50),
    p90: percentileFromHistogram(histogram, 0.90),
    p95: percentileFromHistogram(histogram, 0.95),
    p99: percentileFromHistogram(histogram, 0.99),
    histogram,
  };
}

assert(Number.isInteger(EXPAND_THROUGH_RANK) && EXPAND_THROUGH_RANK >= 0 && EXPAND_THROUGH_RANK <= 8,
  'EXPAND_THROUGH_RANK must be in [0,8] for the known exact checkpoints');

const wrap = createScaledTermIdQuotientNativeNegamaxKernel(SPEC, {
  cacheEdges: true,
  supportLayout: 'packed',
  prefixClasses: PREFIX_CLASSES,
});
const kernel = wrap.kernel;
const buckets = Array.from({ length: EXPAND_THROUGH_RANK + 2 }, () => []);
buckets[0].push(kernel.rootId);
let nextUnbucketedId = 1;

const growthStarted = performance.now();
for (let rank = 0; rank <= EXPAND_THROUGH_RANK; rank += 1) {
  for (const stateId of buckets[rank]) {
    for (let column = 0; column < SPEC.columns; column += 1) {
      kernel.advance(stateId, column);
      while (nextUnbucketedId < kernel.states.count) {
        const id = nextUnbucketedId++;
        const childRank = kernel.supportAccess.rankAt(kernel.states.support[id]);
        assert(childRank === rank + 1, `q ${id} skipped rank ${rank}->${childRank}`);
        if (childRank < buckets.length) buckets[childRank].push(id);
      }
      assert(kernel.states.count <= MAX_STATES, `state cap ${MAX_STATES} exceeded`);
    }
  }
  assert(kernel.states.count === EXPECTED_STATES_AFTER_EXPANDING_RANK[rank],
    `rank-${rank} state checkpoint mismatch`);
  assert(kernel.classes.size === EXPECTED_CLASSES_AFTER_EXPANDING_RANK[rank],
    `rank-${rank} class checkpoint mismatch`);
}
const growthMs = performance.now() - growthStarted;

const storage = kernel.classes.researchStorageView();
const vocabulary = kernel.classes.termVocabulary;
assert(storage.classCount === 1357101, `unexpected class census ${storage.classCount}`);

function directAffectedMask(classId, cell) {
  const start = storage.starts[classId];
  const end = start + storage.lengths[classId];
  let mask = 0;
  for (let index = start; index < end; index += 1) {
    const termId = storage.flatIds[index];
    if (vocabulary.reduce[termId * vocabulary.cellCount + cell] !== termId) {
      mask |= 1 << (termId >>> SLOT_SHIFT);
    }
  }
  return mask & 0x3ff;
}

function changedSlotMask(leftClass, rightClass) {
  let left = storage.starts[leftClass];
  let right = storage.starts[rightClass];
  const leftEnd = left + storage.lengths[leftClass];
  const rightEnd = right + storage.lengths[rightClass];
  let mask = 0;
  while (left < leftEnd || right < rightEnd) {
    if (left >= leftEnd) {
      mask |= 1 << (storage.flatIds[right] >>> SLOT_SHIFT);
      right += 1;
      continue;
    }
    if (right >= rightEnd) {
      mask |= 1 << (storage.flatIds[left] >>> SLOT_SHIFT);
      left += 1;
      continue;
    }
    const a = storage.flatIds[left];
    const b = storage.flatIds[right];
    if (a === b) {
      left += 1;
      right += 1;
    } else if (a < b) {
      mask |= 1 << (a >>> SLOT_SHIFT);
      left += 1;
    } else {
      mask |= 1 << (b >>> SLOT_SHIFT);
      right += 1;
    }
  }
  return mask & 0x3ff;
}

const ownDirectHistogram = Array(SLOT_COUNT + 1).fill(0);
const ownFinalHistogram = Array(SLOT_COUNT + 1).fill(0);
const ownExtraHistogram = Array(SLOT_COUNT + 1).fill(0);
const blockDirectHistogram = Array(SLOT_COUNT + 1).fill(0);
const blockFinalHistogram = Array(SLOT_COUNT + 1).fill(0);
const combinedFinalHistogram = Array(SLOT_COUNT + 1).fill(0);
let analyzedNonterminal = 0;
let terminalEdges = 0;
let illegalEdges = 0;
let ownFinalEqualsDirect = 0;
let blockFinalEqualsDirect = 0;
let finalUnionMaskOr = 0;
let ownDirectMaskOr = 0;
let blockDirectMaskOr = 0;

const auditStarted = performance.now();
for (let rank = 0; rank <= EXPAND_THROUGH_RANK; rank += 1) {
  for (const stateId of buckets[rank]) {
    const supportIndex = kernel.states.support[stateId];
    const mover = kernel.supportAccess.rankAt(supportIndex) & 1;
    const parentP0 = kernel.states.p0Class[stateId];
    const parentP1 = kernel.states.p1Class[stateId];
    const ownParent = mover === 0 ? parentP0 : parentP1;
    const blockParent = mover === 0 ? parentP1 : parentP0;

    for (let column = 0; column < SPEC.columns; column += 1) {
      const landing = kernel.supportAccess.landingAt(supportIndex, column);
      const child = kernel.advance(stateId, column); // q-edge cache hit from growth pass.
      if (child === QN_ILLEGAL) { illegalEdges += 1; continue; }
      if (child === QN_TERMINAL_WIN) { terminalEdges += 1; continue; }

      const childP0 = kernel.states.p0Class[child];
      const childP1 = kernel.states.p1Class[child];
      const ownChild = mover === 0 ? childP0 : childP1;
      const blockChild = mover === 0 ? childP1 : childP0;

      const ownDirect = directAffectedMask(ownParent, landing);
      const blockDirect = directAffectedMask(blockParent, landing);
      const ownFinal = changedSlotMask(ownParent, ownChild);
      const blockFinal = changedSlotMask(blockParent, blockChild);
      const ownExtra = ownFinal & ~ownDirect;
      const combinedFinal = ownFinal | blockFinal;

      ownDirectHistogram[popcount10(ownDirect)] += 1;
      ownFinalHistogram[popcount10(ownFinal)] += 1;
      ownExtraHistogram[popcount10(ownExtra)] += 1;
      blockDirectHistogram[popcount10(blockDirect)] += 1;
      blockFinalHistogram[popcount10(blockFinal)] += 1;
      combinedFinalHistogram[popcount10(combinedFinal)] += 1;
      if (ownDirect === ownFinal) ownFinalEqualsDirect += 1;
      if (blockDirect === blockFinal) blockFinalEqualsDirect += 1;
      ownDirectMaskOr |= ownDirect;
      blockDirectMaskOr |= blockDirect;
      finalUnionMaskOr |= combinedFinal;
      analyzedNonterminal += 1;
    }
  }
}
const auditMs = performance.now() - auditStarted;

const result = {
  kind: 'connect4-standard-7x6-slot64-transition-locality-audit-v1',
  status: 'complete',
  date: '2026-09-11',
  geometry: '7x6:c4',
  contract: {
    expandThroughRank: EXPAND_THROUGH_RANK,
    qStates: kernel.states.count,
    residualClasses: kernel.classes.size,
    slotWidthTerms: 64,
    slotCount: SLOT_COUNT,
    note: 'final changed slots are exact symmetric-difference slots between parent and exact child residual classes; edge cache prevents transition recomputation during audit pass',
  },
  growthMs,
  auditMs,
  analyzedNonterminal,
  terminalEdges,
  illegalEdges,
  ownDirect: summarizeHistogram(ownDirectHistogram),
  ownFinal: summarizeHistogram(ownFinalHistogram),
  ownNormalizationExtra: summarizeHistogram(ownExtraHistogram),
  blockDirect: summarizeHistogram(blockDirectHistogram),
  blockFinal: summarizeHistogram(blockFinalHistogram),
  combinedFinal: summarizeHistogram(combinedFinalHistogram),
  ownFinalEqualsDirectFraction: analyzedNonterminal === 0 ? null : ownFinalEqualsDirect / analyzedNonterminal,
  blockFinalEqualsDirectFraction: analyzedNonterminal === 0 ? null : blockFinalEqualsDirect / analyzedNonterminal,
  masksEverUsed: {
    ownDirect: ownDirectMaskOr & 0x3ff,
    blockDirect: blockDirectMaskOr & 0x3ff,
    combinedFinal: finalUnionMaskOr & 0x3ff,
  },
};

console.error(`SLOT64_LOCALITY_SUMMARY=${JSON.stringify({
  states: result.contract.qStates,
  classes: result.contract.residualClasses,
  edges: analyzedNonterminal,
  growthMs,
  auditMs,
  ownDirectMean: result.ownDirect.mean,
  ownFinalMean: result.ownFinal.mean,
  ownExtraMean: result.ownNormalizationExtra.mean,
  blockDirectMean: result.blockDirect.mean,
  blockFinalMean: result.blockFinal.mean,
  combinedFinalMean: result.combinedFinal.mean,
  ownFinalP95: result.ownFinal.p95,
  blockFinalP95: result.blockFinal.p95,
  combinedFinalP95: result.combinedFinal.p95,
  ownDirectEqualsFinal: result.ownFinalEqualsDirectFraction,
  blockDirectEqualsFinal: result.blockFinalEqualsDirectFraction,
})}`);
console.log(JSON.stringify(result, null, 2));
