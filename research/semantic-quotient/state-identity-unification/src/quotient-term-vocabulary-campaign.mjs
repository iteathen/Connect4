import { createConnectWinningLines } from '../../../../components/bsfp/geometry.mjs';
import { createFastQuotientNativeNegamaxKernel } from './quotient-native-negamax-fast-kernel.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3, enumerateQ: true, expectedQ: 3735 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4, enumerateQ: true, expectedQ: 34095 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4, enumerateQ: true, expectedQ: 11317 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4, enumerateQ: true, expectedQ: 294593 }),
  Object.freeze({ columns: 7, rows: 6, connect: 4, enumerateQ: false, expectedQ: null }),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function popcount32(value) {
  let x = value >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

function cardinality(lo, hi) {
  return popcount32(lo) + popcount32(hi);
}

function compareMaskPair(a, b) {
  const countDelta = cardinality(a[0], a[1]) - cardinality(b[0], b[1]);
  if (countDelta !== 0) return countDelta;
  const ah = a[1] >>> 0;
  const bh = b[1] >>> 0;
  if (ah !== bh) return ah < bh ? -1 : 1;
  const al = a[0] >>> 0;
  const bl = b[0] >>> 0;
  return al === bl ? 0 : al < bl ? -1 : 1;
}

function subsetOf(aLo, aHi, bLo, bHi) {
  return (((aLo & ~bLo) >>> 0) === 0) && (((aHi & ~bHi) >>> 0) === 0);
}

function pairKey(lo, hi) {
  return `${lo >>> 0}:${hi >>> 0}`;
}

function linePair(line) {
  let lo = 0;
  let hi = 0;
  for (const cell of line) {
    if (cell < 32) lo = (lo | ((2 ** cell) >>> 0)) >>> 0;
    else hi = (hi | ((2 ** (cell - 32)) >>> 0)) >>> 0;
  }
  return [lo >>> 0, hi >>> 0];
}

function enumerateNonemptySubsets(line) {
  const result = [];
  const n = line.length;
  const limit = 1 << n;
  for (let subset = 1; subset < limit; subset += 1) {
    let lo = 0;
    let hi = 0;
    for (let index = 0; index < n; index += 1) {
      if ((subset & (1 << index)) === 0) continue;
      const cell = line[index];
      if (cell < 32) lo = (lo | ((2 ** cell) >>> 0)) >>> 0;
      else hi = (hi | ((2 ** (cell - 32)) >>> 0)) >>> 0;
    }
    result.push([lo >>> 0, hi >>> 0]);
  }
  return result;
}

function discoverVocabulary(spec) {
  const lines = createConnectWinningLines(spec);
  const byKey = new Map();
  for (const line of lines) {
    for (const [lo, hi] of enumerateNonemptySubsets(line)) byKey.set(pairKey(lo, hi), [lo, hi]);
  }
  const terms = [...byKey.values()].sort(compareMaskPair);
  const idByKey = new Map(terms.map((term, id) => [pairKey(term[0], term[1]), id]));
  const cellCount = spec.columns * spec.rows;
  const sentinelTerminal = terms.length;
  assert(terms.length < 0xffff, 'term vocabulary does not fit u16 term IDs plus terminal sentinel');

  const cardinalityHistogram = {};
  for (const [lo, hi] of terms) {
    const count = cardinality(lo, hi);
    cardinalityHistogram[count] = (cardinalityHistogram[count] ?? 0) + 1;
  }

  let reduceChanged = 0;
  let reduceUnchanged = 0;
  let reduceTerminal = 0;
  let reductionClosureMismatches = 0;
  for (let id = 0; id < terms.length; id += 1) {
    const [lo, hi] = terms[id];
    for (let cell = 0; cell < cellCount; cell += 1) {
      const bitLo = cell < 32 ? ((2 ** cell) >>> 0) : 0;
      const bitHi = cell >= 32 ? ((2 ** (cell - 32)) >>> 0) : 0;
      const contains = (((lo & bitLo) >>> 0) !== 0) || (((hi & bitHi) >>> 0) !== 0);
      if (!contains) {
        reduceUnchanged += 1;
        continue;
      }
      const nextLo = (lo & ~bitLo) >>> 0;
      const nextHi = (hi & ~bitHi) >>> 0;
      if (nextLo === 0 && nextHi === 0) {
        reduceTerminal += 1;
        continue;
      }
      reduceChanged += 1;
      if (!idByKey.has(pairKey(nextLo, nextHi))) reductionClosureMismatches += 1;
    }
  }
  assert(reductionClosureMismatches === 0, 'vocabulary is not closed under one-cell residual reduction');

  let subsetPairs = 0;
  let strictSubsetPairs = 0;
  const dominanceListCounts = new Uint32Array(terms.length);
  for (let a = 0; a < terms.length; a += 1) {
    const [aLo, aHi] = terms[a];
    for (let b = 0; b < terms.length; b += 1) {
      const [bLo, bHi] = terms[b];
      if (!subsetOf(aLo, aHi, bLo, bHi)) continue;
      subsetPairs += 1;
      dominanceListCounts[a] += 1;
      if (a !== b) strictSubsetPairs += 1;
    }
  }

  const dominanceBitsetBytes = terms.length * Math.ceil(terms.length / 8);
  const sparseDominanceU16Bytes = subsetPairs * Uint16Array.BYTES_PER_ELEMENT
    + (terms.length + 1) * Uint32Array.BYTES_PER_ELEMENT;
  const termMaskBytes = terms.length * 2 * Uint32Array.BYTES_PER_ELEMENT;
  const termCardinalityBytes = terms.length * Uint8Array.BYTES_PER_ELEMENT;
  const reductionTableBytes = terms.length * cellCount * Uint16Array.BYTES_PER_ELEMENT;
  const initialLineIds = lines.map(linePair).map(([lo, hi]) => {
    const id = idByKey.get(pairKey(lo, hi));
    assert(id !== undefined, 'winning line missing from term vocabulary');
    return id;
  });

  return {
    lines,
    terms,
    idByKey,
    initialLineIds,
    cardinalityHistogram,
    sentinelTerminal,
    reduction: {
      unchanged: reduceUnchanged,
      changed: reduceChanged,
      terminal: reduceTerminal,
      closureMismatches: reductionClosureMismatches,
    },
    dominance: {
      subsetPairs,
      strictSubsetPairs,
      density: subsetPairs / (terms.length * terms.length),
      bitsetBytes: dominanceBitsetBytes,
      sparseU16Bytes: sparseDominanceU16Bytes,
    },
    bytes: {
      termMasksU32x2: termMaskBytes,
      termCardinalityU8: termCardinalityBytes,
      reductionTableU16: reductionTableBytes,
      dominanceBitset: dominanceBitsetBytes,
      sparseDominanceU16: sparseDominanceU16Bytes,
      coreWithBitset: termMaskBytes + termCardinalityBytes + reductionTableBytes + dominanceBitsetBytes,
      coreWithSparseDominance: termMaskBytes + termCardinalityBytes + reductionTableBytes + sparseDominanceU16Bytes,
    },
  };
}

function enumerateQAndCheckTerms(spec, vocabulary) {
  const wrap = createFastQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const kernel = wrap.kernel;
  for (let id = 0; id < kernel.states.count; id += 1) {
    for (let column = 0; column < kernel.columns; column += 1) {
      const target = kernel.advance(id, column);
      assert(target === QN_ILLEGAL || target === QN_TERMINAL_WIN || target >= 0, 'invalid q transition target');
    }
  }
  assert(kernel.states.count === spec.expectedQ, `${spec.columns}x${spec.rows}: q census drift`);

  const observedVocabulary = new Set();
  let storedTerms = 0;
  let maxClassLength = 0;
  for (let classId = 0; classId < kernel.classes.size; classId += 1) {
    const terms = kernel.classTerms(classId);
    storedTerms += terms.length;
    maxClassLength = Math.max(maxClassLength, terms.length);
    for (const [lo, hi] of terms) {
      const termId = vocabulary.idByKey.get(pairKey(lo, hi));
      assert(termId !== undefined, `reachable residual term escaped structural vocabulary class=${classId}`);
      observedVocabulary.add(termId);
    }
  }

  return {
    qStates: kernel.states.count,
    residualClasses: kernel.classes.size,
    storedTerms,
    maxClassLength,
    structuralVocabularyTerms: vocabulary.terms.length,
    observedVocabularyTerms: observedVocabulary.size,
    observedFraction: observedVocabulary.size / vocabulary.terms.length,
    currentLogicalMaskTermBytes: storedTerms * 8,
    candidateU16TermIdBytes: storedTerms * 2,
    logicalClassTermByteReduction: storedTerms === 0 ? 1 : (storedTerms * 2) / (storedTerms * 8),
  };
}

function runCase(spec) {
  const vocabulary = discoverVocabulary(spec);
  const q = spec.enumerateQ ? enumerateQAndCheckTerms(spec, vocabulary) : null;
  const result = {
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    winningLines: vocabulary.lines.length,
    structuralVocabularyTerms: vocabulary.terms.length,
    termIdBitsRequired: Math.max(1, Math.ceil(Math.log2(vocabulary.terms.length + 1))),
    fitsUint8WithTerminal: vocabulary.terms.length + 1 <= 0x100,
    fitsUint16WithTerminal: vocabulary.terms.length + 1 <= 0x10000,
    cardinalityHistogram: vocabulary.cardinalityHistogram,
    reduction: vocabulary.reduction,
    dominance: vocabulary.dominance,
    bytes: vocabulary.bytes,
    initialLineIds: vocabulary.initialLineIds,
    reachableQ: q,
  };
  console.error(`[q-term-vocab] ${result.geometry} lines=${result.winningLines} terms=${result.structuralVocabularyTerms} bits=${result.termIdBitsRequired} domDensity=${result.dominance.density.toFixed(4)}${q ? ` observed=${q.observedVocabularyTerms}/${result.structuralVocabularyTerms} storedTerms=${q.storedTerms}` : ''}`);
  return result;
}

const cases = CASES.map(runCase);
const standard = cases.find((entry) => entry.geometry === '7x6:c4');
console.error(`QUOTIENT_TERM_VOCABULARY_SUMMARY=${JSON.stringify(cases.map((entry) => ({ geometry: entry.geometry, lines: entry.winningLines, terms: entry.structuralVocabularyTerms, bits: entry.termIdBitsRequired, bitsetBytes: entry.dominance.bitsetBytes, reductionBytes: entry.bytes.reductionTableU16, observedTerms: entry.reachableQ?.observedVocabularyTerms ?? null })))}`);
console.log(JSON.stringify({
  kind: 'connect4-quotient-residual-term-vocabulary-v1',
  status: 'complete',
  date: '2026-09-11',
  construction: 'deduplicated non-empty subsets of every geometry winning line; no remembered vocabulary count used as authority',
  standard7x6: {
    winningLines: standard.winningLines,
    structuralVocabularyTerms: standard.structuralVocabularyTerms,
    termIdBitsRequired: standard.termIdBitsRequired,
    fitsUint16WithTerminal: standard.fitsUint16WithTerminal,
    bytes: standard.bytes,
    dominance: standard.dominance,
  },
  cases,
}, null, 2));
