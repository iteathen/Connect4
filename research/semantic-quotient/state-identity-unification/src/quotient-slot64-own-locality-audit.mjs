import { performance } from 'node:perf_hooks';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { createTermVocabulary } from './quotient-term-id-pool.mjs';
import { createQuotientNativeNegamaxSupportLayoutKernel } from './quotient-native-negamax-support-layout-kernel.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';

const SPEC = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const SOURCE_URL = new URL('./quotient-slot64-residual-pool-v2.mjs', import.meta.url);
const GENERATED_URL = new URL('./quotient-slot64-residual-pool-v2-own-audit.generated.mjs', import.meta.url);
const EXPECTED_RANK_STATES = Object.freeze([1, 7, 49, 238, 1120, 4263, 16422, 54131, 182383]);
const EXPECTED_CLASSES = Object.freeze([16, 72, 548, 1780, 10304, 28154, 135109, 331014, 1357101]);

function assert(condition, message) { if (!condition) throw new Error(message); }
function replaceOnce(source, from, to, label) {
  const index = source.indexOf(from);
  assert(index >= 0, `${label}: source seam missing`);
  assert(source.indexOf(from, index + from.length) < 0, `${label}: source seam ambiguous`);
  return source.slice(0, index) + to + source.slice(index + from.length);
}
function maskSlots(mask) {
  const slots = [];
  for (let slot = 0; slot < 10; slot += 1) if ((mask & (1 << slot)) !== 0) slots.push(slot);
  return slots;
}
function average(hist) {
  let samples = 0;
  let weighted = 0;
  for (let i = 0; i < hist.length; i += 1) { samples += hist[i]; weighted += hist[i] * i; }
  return samples === 0 ? 0 : weighted / samples;
}

let source = await readFile(SOURCE_URL, 'utf8');
source = replaceOnce(source,
  `  function ensureReferenceWidth(slot, requiredId) {`,
  `  const ownAudit = {\n    observations: 0,\n    sourceSlotHistogram: new Uint32Array(CHUNKS_PER_CLASS + 1),\n    targetSlotHistogram: new Uint32Array(CHUNKS_PER_CLASS + 1),\n    normalizationSlotHistogram: new Uint32Array(CHUNKS_PER_CLASS + 1),\n    changedSlotHistogram: new Uint32Array(CHUNKS_PER_CLASS + 1),\n  };\n\n  function ensureReferenceWidth(slot, requiredId) {`,
  'audit object');
source = replaceOnce(source,
  `  pool.metrics = metrics;\n  pool.slotPools = slotPools;`,
  `  pool.metrics = metrics;\n  pool.slotPools = slotPools;\n  pool.ownAudit = ownAudit;`,
  'audit exposure');
source = replaceOnce(source,
  `    loadClassBits(id, inputBits);\n    reducedBits.fill(0);\n    let affected = false;`,
  `    let auditSourceSlotMask = 0;\n    let auditTargetSlotMask = 0;\n    let auditNormalizationSlotMask = 0;\n    loadClassBits(id, inputBits);\n    reducedBits.fill(0);\n    let affected = false;`,
  'own audit masks');
source = replaceOnce(source,
  `      let active = (input & containsMasks[containsBase + word]) >>> 0;\n      resultBits[word] = (input & ~containsMasks[containsBase + word]) >>> 0;`,
  `      let active = (input & containsMasks[containsBase + word]) >>> 0;\n      if (active !== 0) auditSourceSlotMask |= 1 << (word >>> 1);\n      resultBits[word] = (input & ~containsMasks[containsBase + word]) >>> 0;`,
  'source slot observation');
source = replaceOnce(source,
  `        reducedBits[target >>> 5] |= 1 << (target & 31);\n        metrics.reducedTerms += 1;`,
  `        reducedBits[target >>> 5] |= 1 << (target & 31);\n        auditTargetSlotMask |= 1 << (target >>> 6);\n        metrics.reducedTerms += 1;`,
  'target slot observation');
source = replaceOnce(source,
  `          const targetWord = strictSupersetWordIndex[entry];\n          const mask = strictSupersetWordMask[entry];`,
  `          const targetWord = strictSupersetWordIndex[entry];\n          auditNormalizationSlotMask |= 1 << (targetWord >>> 1);\n          const mask = strictSupersetWordMask[entry];`,
  'normalization slot observation');
source = replaceOnce(source,
  `    const result = internBits(resultBits, id);\n    cacheSet(ownTransitions, id, cell, result);`,
  `    let auditChangedSlots = 0;\n    for (let auditSlot = 0; auditSlot < CHUNKS_PER_CLASS; auditSlot += 1) {\n      if (!slotPools[auditSlot].equals(classSlotIds[auditSlot][id], resultBits, auditSlot * CHUNK_WORDS)) auditChangedSlots += 1;\n    }\n    const auditSourceSlots = popcount32(auditSourceSlotMask);\n    const auditTargetSlots = popcount32(auditTargetSlotMask);\n    const auditNormalizationSlots = popcount32(auditNormalizationSlotMask);\n    ownAudit.observations += 1;\n    ownAudit.sourceSlotHistogram[auditSourceSlots] += 1;\n    ownAudit.targetSlotHistogram[auditTargetSlots] += 1;\n    ownAudit.normalizationSlotHistogram[auditNormalizationSlots] += 1;\n    ownAudit.changedSlotHistogram[auditChangedSlots] += 1;\n\n    const result = internBits(resultBits, id);\n    cacheSet(ownTransitions, id, cell, result);`,
  'changed slot observation');
await writeFile(GENERATED_URL, source, 'utf8');

function staticClosure() {
  const vocabulary = createTermVocabulary(SPEC);
  const rows = [];
  for (let cell = 0; cell < vocabulary.cellCount; cell += 1) {
    let sourceMask = 0;
    let targetMask = 0;
    let normalizationMask = 0;
    let affectedTerms = 0;
    let terminalTerms = 0;
    for (let termId = 0; termId < vocabulary.count; termId += 1) {
      const target = vocabulary.reduce[termId * vocabulary.cellCount + cell];
      if (target === termId) continue;
      affectedTerms += 1;
      sourceMask |= 1 << (termId >>> 6);
      if (target === vocabulary.terminal) { terminalTerms += 1; continue; }
      targetMask |= 1 << (target >>> 6);
      for (let candidate = 0; candidate < vocabulary.count; candidate += 1) {
        if (candidate === target) continue;
        if (vocabulary.subset(target, candidate)) normalizationMask |= 1 << (candidate >>> 6);
      }
    }
    rows.push(Object.freeze({
      cell,
      column: cell % SPEC.columns,
      row: Math.floor(cell / SPEC.columns),
      affectedTerms,
      terminalTerms,
      sourceSlots: maskSlots(sourceMask),
      targetSlots: maskSlots(targetMask),
      normalizationSlots: maskSlots(normalizationMask),
      unionSlots: maskSlots(sourceMask | targetMask | normalizationMask),
    }));
  }
  return rows;
}

try {
  const { installSlot64ResidualPool } = await import(`${GENERATED_URL.href}?own-locality-audit-v1`);
  const kernel = createQuotientNativeNegamaxSupportLayoutKernel(SPEC, {
    cacheEdges: false,
    supportLayout: 'packed',
    prefixClasses: 4096,
  });
  installSlot64ResidualPool(kernel, SPEC, { prefixClasses: 4096 });
  const buckets = Array.from({ length: 10 }, () => []);
  buckets[0].push(kernel.rootId);
  let nextUnbucketedId = 1;
  const edges = { legalNonterminal: 0, terminalWin: 0, illegal: 0 };
  const started = performance.now();

  for (let rank = 0; rank <= 8; rank += 1) {
    const bucket = buckets[rank];
    assert(bucket.length === EXPECTED_RANK_STATES[rank], `rank-${rank} q-state count mismatch`);
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
          assert(childRank === rank + 1, `q ${newId} rank jump ${rank}->${childRank}`);
          buckets[childRank].push(newId);
        }
      }
    }
    assert(kernel.classes.size === EXPECTED_CLASSES[rank], `rank-${rank} residual-class count mismatch`);
  }

  const audit = kernel.classes.ownAudit;
  const result = {
    kind: 'connect4-standard-7x6-slot64-own-locality-audit-v1',
    status: 'complete',
    date: '2026-09-11',
    exactCheckpoints: {
      states: kernel.states.count,
      residualClasses: kernel.classes.size,
      rank9FrontierStates: buckets[9].length,
      edges,
    },
    ownMetrics: {
      ownTransitionMisses: kernel.classes.metrics.ownTransitionMisses,
      ownTerminal: kernel.classes.metrics.ownTerminal,
      ownNoop: kernel.classes.metrics.ownNoop,
      reducedTerms: kernel.classes.metrics.reducedTerms,
      supersetWordProbes: kernel.classes.metrics.supersetWordProbes,
    },
    dynamicNonterminalAffected: {
      observations: audit.observations,
      sourceSlotHistogram: Array.from(audit.sourceSlotHistogram),
      targetSlotHistogram: Array.from(audit.targetSlotHistogram),
      normalizationSlotHistogram: Array.from(audit.normalizationSlotHistogram),
      changedSlotHistogram: Array.from(audit.changedSlotHistogram),
      averages: {
        sourceSlots: average(audit.sourceSlotHistogram),
        targetSlots: average(audit.targetSlotHistogram),
        normalizationSlots: average(audit.normalizationSlotHistogram),
        changedSlots: average(audit.changedSlotHistogram),
      },
    },
    staticPerCellClosure: staticClosure(),
    campaignMs: performance.now() - started,
  };

  console.error(`SLOT64_OWN_LOCALITY_SUMMARY=${JSON.stringify({
    observations: result.dynamicNonterminalAffected.observations,
    averages: result.dynamicNonterminalAffected.averages,
    sourceHistogram: result.dynamicNonterminalAffected.sourceSlotHistogram,
    targetHistogram: result.dynamicNonterminalAffected.targetSlotHistogram,
    normalizationHistogram: result.dynamicNonterminalAffected.normalizationSlotHistogram,
    changedHistogram: result.dynamicNonterminalAffected.changedSlotHistogram,
    ownMisses: result.ownMetrics.ownTransitionMisses,
    ownTerminal: result.ownMetrics.ownTerminal,
    ownNoop: result.ownMetrics.ownNoop,
    campaignMs: result.campaignMs,
  })}`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await unlink(GENERATED_URL).catch(() => {});
}
