import { performance } from 'node:perf_hooks';
import { createScaledTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-scaled-term-id-kernel.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';

const SPEC = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const EXPAND_THROUGH_RANK = Number.parseInt(process.env.EXPAND_THROUGH_RANK ?? '8', 10);
const MAX_STATES = Number.parseInt(process.env.MAX_STATES ?? '1000000', 10);
const PREFIX_CLASSES = Number.parseInt(process.env.PREFIX_CLASSES ?? '4096', 10);
const WORDS_PER_CLASS = Math.ceil(625 / 32);
const FIXED_BITSET_BYTES = WORDS_PER_CLASS * Uint32Array.BYTES_PER_ELEMENT;
const HYBRID_THRESHOLDS = Object.freeze([8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64]);
const CHUNK_WORDS = Object.freeze([1, 2, 4, 5]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function idBytesForCount(count) {
  if (count <= 0x100) return 1;
  if (count <= 0x10000) return 2;
  return 4;
}

function quantileFromHistogram(histogram, total, fraction) {
  if (total === 0) return 0;
  const target = Math.max(1, Math.ceil(total * fraction));
  let seen = 0;
  for (let value = 0; value < histogram.length; value += 1) {
    seen += histogram[value] ?? 0;
    if (seen >= target) return value;
  }
  return histogram.length - 1;
}

function summarizeHistogram(histogram, total, sum, max) {
  return Object.freeze({
    count: total,
    mean: total === 0 ? 0 : sum / total,
    median: quantileFromHistogram(histogram, total, 0.5),
    p90: quantileFromHistogram(histogram, total, 0.9),
    p95: quantileFromHistogram(histogram, total, 0.95),
    p99: quantileFromHistogram(histogram, total, 0.99),
    max,
  });
}

function binaryChunkKey(words, base, width) {
  if (width === 1) return words[base] >>> 0;
  const codeUnits = new Array(width * 2);
  let out = 0;
  for (let index = 0; index < width; index += 1) {
    const value = words[base + index] >>> 0;
    codeUnits[out++] = value & 0xffff;
    codeUnits[out++] = value >>> 16;
  }
  return String.fromCharCode(...codeUnits);
}

assert(EXPAND_THROUGH_RANK >= 0 && EXPAND_THROUGH_RANK <= 12, 'EXPAND_THROUGH_RANK out of bounded census range');
assert(MAX_STATES >= 1, 'MAX_STATES must be positive');
assert(WORDS_PER_CLASS === 20, 'standard 7x6 vocabulary should require 20 u32 words');
for (const width of CHUNK_WORDS) assert(WORDS_PER_CLASS % width === 0, `chunk width ${width} must divide ${WORDS_PER_CLASS}`);

const buildStarted = performance.now();
const wrap = createScaledTermIdQuotientNativeNegamaxKernel(SPEC, {
  cacheEdges: false,
  supportLayout: 'packed',
  prefixClasses: PREFIX_CLASSES,
});
const kernel = wrap.kernel;
assert(kernel.classes.termVocabulary.count === 625, `expected 625 terms, got ${kernel.classes.termVocabulary.count}`);
assert(typeof kernel.classes.researchStorageView === 'function', 'research residual storage view is unavailable');

const buckets = Array.from({ length: EXPAND_THROUGH_RANK + 2 }, () => []);
buckets[0].push(kernel.rootId);
let nextUnbucketedId = 1;
const classCreationBoundaries = [{ expandedRank: -1, classCount: kernel.classes.size }];
const qStateBoundaries = [{ expandedRank: -1, stateCount: kernel.states.count }];
const edges = { nonterminal: 0, terminal: 0, illegal: 0 };

for (let rank = 0; rank <= EXPAND_THROUGH_RANK; rank += 1) {
  const bucket = buckets[rank];
  const rankStarted = performance.now();
  for (let index = 0; index < bucket.length; index += 1) {
    const stateId = bucket[index];
    const actualRank = kernel.supportAccess.rankAt(kernel.states.support[stateId]);
    assert(actualRank === rank, `q state ${stateId} rank drift: expected ${rank}, got ${actualRank}`);
    for (let column = 0; column < SPEC.columns; column += 1) {
      const child = kernel.advance(stateId, column);
      if (child === QN_ILLEGAL) edges.illegal += 1;
      else if (child === QN_TERMINAL_WIN) edges.terminal += 1;
      else edges.nonterminal += 1;

      while (nextUnbucketedId < kernel.states.count) {
        const newId = nextUnbucketedId++;
        const newRank = kernel.supportAccess.rankAt(kernel.states.support[newId]);
        assert(newRank === rank + 1, `new state ${newId} skipped rank ${rank + 1} -> ${newRank}`);
        if (newRank < buckets.length) buckets[newRank].push(newId);
      }
      assert(kernel.states.count <= MAX_STATES, `state cap ${MAX_STATES} exceeded while expanding rank ${rank}`);
    }
  }
  classCreationBoundaries.push({ expandedRank: rank, classCount: kernel.classes.size });
  qStateBoundaries.push({ expandedRank: rank, stateCount: kernel.states.count });
  console.error(`[residual-census] expandedRank=${rank} frontier=${bucket.length} qStates=${kernel.states.count} classes=${kernel.classes.size} terms=${kernel.classes.memoryStats().residualTerms} rankMs=${(performance.now() - rankStarted).toFixed(3)}`);
}

const buildMs = performance.now() - buildStarted;
const storage = kernel.classes.researchStorageView();
assert(storage.classCount === kernel.classes.size, 'storage-view class count drift');
assert(storage.termCount === kernel.classes.memoryStats().residualTerms, 'storage-view term count drift');
const classCount = storage.classCount;
const termCount = storage.termCount;

const histogram = new Uint32Array(626);
let lengthSum = 0;
let maxLength = 0;
for (let id = 0; id < classCount; id += 1) {
  const length = storage.lengths[id];
  assert(length <= 625, `class ${id} length ${length} exceeds vocabulary`);
  histogram[length] += 1;
  lengthSum += length;
  if (length > maxLength) maxLength = length;
}
const lengthSummary = summarizeHistogram(histogram, classCount, lengthSum, maxLength);

const byCreationRank = [];
for (let boundaryIndex = 1; boundaryIndex < classCreationBoundaries.length; boundaryIndex += 1) {
  const previous = classCreationBoundaries[boundaryIndex - 1];
  const current = classCreationBoundaries[boundaryIndex];
  const local = new Uint32Array(626);
  let localSum = 0;
  let localMax = 0;
  for (let id = previous.classCount; id < current.classCount; id += 1) {
    const length = storage.lengths[id];
    local[length] += 1;
    localSum += length;
    if (length > localMax) localMax = length;
  }
  byCreationRank.push(Object.freeze({
    expandedRank: current.expandedRank,
    firstClassId: previous.classCount,
    endClassIdExclusive: current.classCount,
    ...summarizeHistogram(local, current.classCount - previous.classCount, localSum, localMax),
  }));
}

const sparsePayloadBytes = termCount * Uint16Array.BYTES_PER_ELEMENT;
const fixedBitsetPayloadBytes = classCount * FIXED_BITSET_BYTES;
const hybrid = HYBRID_THRESHOLDS.map((threshold) => {
  let bytes = 0;
  let sparseClasses = 0;
  let denseClasses = 0;
  for (let length = 0; length < histogram.length; length += 1) {
    const count = histogram[length];
    if (count === 0) continue;
    if (length <= threshold) {
      bytes += count * length * Uint16Array.BYTES_PER_ELEMENT;
      sparseClasses += count;
    } else {
      bytes += count * FIXED_BITSET_BYTES;
      denseClasses += count;
    }
  }
  return Object.freeze({ threshold, payloadBytes: bytes, ratioToSparse: bytes / sparsePayloadBytes, sparseClasses, denseClasses });
});

const denseStarted = performance.now();
const denseWords = new Uint32Array(classCount * WORDS_PER_CLASS);
for (let id = 0; id < classCount; id += 1) {
  const base = id * WORDS_PER_CLASS;
  const start = storage.starts[id];
  const end = start + storage.lengths[id];
  for (let termIndex = start; termIndex < end; termIndex += 1) {
    const termId = storage.flatIds[termIndex];
    denseWords[base + (termId >>> 5)] |= (1 << (termId & 31)) >>> 0;
  }
}
const denseBuildMs = performance.now() - denseStarted;

const chunkModels = [];
for (const width of CHUNK_WORDS) {
  const chunkStarted = performance.now();
  const slots = WORDS_PER_CLASS / width;
  const sets = Array.from({ length: slots }, () => new Set());
  const nonzeroReferences = new Uint32Array(slots);
  for (let id = 0; id < classCount; id += 1) {
    const classBase = id * WORDS_PER_CLASS;
    for (let slot = 0; slot < slots; slot += 1) {
      const base = classBase + slot * width;
      let nonzero = false;
      for (let word = 0; word < width; word += 1) {
        if (denseWords[base + word] !== 0) {
          nonzero = true;
          break;
        }
      }
      if (nonzero) nonzeroReferences[slot] += 1;
      sets[slot].add(binaryChunkKey(denseWords, base, width));
    }
  }

  const slotModels = [];
  let dictionaryBytes = 0;
  let tupleBytesPerClass = 0;
  let totalUniqueChunks = 0;
  let totalChunkReferences = classCount * slots;
  let totalNonzeroReferences = 0;
  for (let slot = 0; slot < slots; slot += 1) {
    const uniqueChunks = sets[slot].size;
    const idBytes = idBytesForCount(uniqueChunks);
    const payloadBytes = uniqueChunks * width * Uint32Array.BYTES_PER_ELEMENT;
    dictionaryBytes += payloadBytes;
    tupleBytesPerClass += idBytes;
    totalUniqueChunks += uniqueChunks;
    totalNonzeroReferences += nonzeroReferences[slot];
    slotModels.push(Object.freeze({
      slot,
      uniqueChunks,
      idBytes,
      dictionaryBytes: payloadBytes,
      nonzeroReferences: nonzeroReferences[slot],
      nonzeroFraction: nonzeroReferences[slot] / classCount,
    }));
  }
  const tupleBytes = classCount * tupleBytesPerClass;
  const totalPayloadBytes = dictionaryBytes + tupleBytes;
  chunkModels.push(Object.freeze({
    chunkWords: width,
    chunkBytes: width * Uint32Array.BYTES_PER_ELEMENT,
    slots,
    totalUniqueChunks,
    totalChunkReferences,
    sharingFactor: totalChunkReferences / totalUniqueChunks,
    totalNonzeroReferences,
    nonzeroFraction: totalNonzeroReferences / totalChunkReferences,
    tupleBytesPerClass,
    tupleBytes,
    dictionaryBytes,
    totalPayloadBytes,
    ratioToSparse: totalPayloadBytes / sparsePayloadBytes,
    ratioToFixedBitset: totalPayloadBytes / fixedBitsetPayloadBytes,
    slotModels,
    analysisMs: performance.now() - chunkStarted,
  }));
  console.error(`[chunk-census] words=${width} unique=${totalUniqueChunks} tupleB/class=${tupleBytesPerClass} payloadMB=${(totalPayloadBytes / 1048576).toFixed(2)} ratioSparse=${(totalPayloadBytes / sparsePayloadBytes).toFixed(3)} sharing=${(totalChunkReferences / totalUniqueChunks).toFixed(2)}`);
}

const currentMemory = kernel.memoryStats();
const result = {
  kind: 'connect4-standard-7x6-residual-storage-census-v1',
  status: 'complete',
  date: '2026-09-11',
  geometry: '7x6:c4',
  contract: {
    expandThroughRank: EXPAND_THROUGH_RANK,
    maxStates: MAX_STATES,
    supportLayout: 'packed-u32',
    residualRepresentation: 'u16-term-id',
    transitionCache: `dense-prefix-${PREFIX_CLASSES}`,
    vocabularyTerms: 625,
  },
  buildMs,
  denseBuildMs,
  qStates: kernel.states.count,
  qStateBoundaries,
  classCreationBoundaries,
  residualClasses: classCount,
  residualTermIds: termCount,
  edges,
  lengthSummary,
  lengthHistogram: Array.from(histogram, (count, length) => count === 0 ? null : [length, count]).filter(Boolean),
  byCreationRank,
  payloadModels: {
    sparseU16: { payloadBytes: sparsePayloadBytes },
    fixedBitsetU32: { wordsPerClass: WORDS_PER_CLASS, bytesPerClass: FIXED_BITSET_BYTES, payloadBytes: fixedBitsetPayloadBytes, ratioToSparse: fixedBitsetPayloadBytes / sparsePayloadBytes },
    hybrid,
    chunkedSlotLocal: chunkModels,
  },
  currentTypedMemory: currentMemory,
};

console.error(`RESIDUAL_STORAGE_CENSUS_SUMMARY=${JSON.stringify({
  qStates: result.qStates,
  residualClasses: classCount,
  residualTermIds: termCount,
  lengthSummary,
  sparseMB: sparsePayloadBytes / 1048576,
  fixedBitsetMB: fixedBitsetPayloadBytes / 1048576,
  bestHybrid: [...hybrid].sort((a, b) => a.payloadBytes - b.payloadBytes)[0],
  bestChunk: [...chunkModels].sort((a, b) => a.totalPayloadBytes - b.totalPayloadBytes)[0],
})}`);
console.log(JSON.stringify(result, null, 2));
