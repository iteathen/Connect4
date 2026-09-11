import { performance } from 'node:perf_hooks';
import { createScaledTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-scaled-term-id-kernel.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';

const SPEC = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const EXPAND_THROUGH_RANK = Number.parseInt(process.env.EXPAND_THROUGH_RANK ?? '8', 10);
const MAX_STATES = Number.parseInt(process.env.MAX_STATES ?? '1000000', 10);
const WORDS_PER_CLASS = Math.ceil(625 / 32); // 20 u32 words
const CHUNK_WORDS = Object.freeze([1, 2, 4, 5]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function nextPowerOfTwo(value) {
  let result = 1;
  while (result < value) result *= 2;
  return result;
}

function hashCapacityBytes(count, loadNumerator = 7, loadDenominator = 10) {
  if (count === 0) return 0;
  const minimumSlots = Math.ceil((count * loadDenominator) / loadNumerator);
  return nextPowerOfTwo(minimumSlots) * Int32Array.BYTES_PER_ELEMENT;
}

function binaryChunkKey(words, offset, count) {
  const chars = new Array(count * 2);
  let out = 0;
  for (let index = 0; index < count; index += 1) {
    const value = words[offset + index] >>> 0;
    chars[out++] = value & 0xffff;
    chars[out++] = value >>> 16;
  }
  return String.fromCharCode(...chars);
}

function chunkKey(words, offset, count) {
  if (count === 1) return words[offset] >>> 0;
  if (count === 2) return (BigInt(words[offset] >>> 0) << 32n) | BigInt(words[offset + 1] >>> 0);
  return binaryChunkKey(words, offset, count);
}

function buildGraph() {
  const started = performance.now();
  let wrap = createScaledTermIdQuotientNativeNegamaxKernel(SPEC, {
    cacheEdges: false,
    supportLayout: 'packed',
    prefixClasses: 4096,
  });
  let kernel = wrap.kernel;
  assert(kernel.classes.termVocabulary.count === 625, 'standard 7x6 vocabulary drift');

  const buckets = Array.from({ length: EXPAND_THROUGH_RANK + 2 }, () => []);
  buckets[0].push(kernel.rootId);
  let nextUnbucketed = 1;
  const edges = { nonterminal: 0, terminal: 0, illegal: 0 };

  for (let rank = 0; rank <= EXPAND_THROUGH_RANK; rank += 1) {
    const bucket = buckets[rank];
    for (let index = 0; index < bucket.length; index += 1) {
      const stateId = bucket[index];
      assert(kernel.supportAccess.rankAt(kernel.states.support[stateId]) === rank, `rank mismatch at q ${stateId}`);
      for (let column = 0; column < SPEC.columns; column += 1) {
        const child = kernel.advance(stateId, column);
        if (child === QN_ILLEGAL) edges.illegal += 1;
        else if (child === QN_TERMINAL_WIN) edges.terminal += 1;
        else edges.nonterminal += 1;
        while (nextUnbucketed < kernel.states.count) {
          const newId = nextUnbucketed++;
          const childRank = kernel.supportAccess.rankAt(kernel.states.support[newId]);
          assert(childRank === rank + 1, `child rank jump ${rank}->${childRank}`);
          if (childRank < buckets.length) buckets[childRank].push(newId);
        }
        if (kernel.states.count > MAX_STATES) throw new Error(`state cap exceeded before audit: ${kernel.states.count} > ${MAX_STATES}`);
      }
    }
  }

  const graphMs = performance.now() - started;
  const memory = kernel.memoryStats();
  const classCount = kernel.classes.size;
  const termCount = memory.residual.residualTerms;
  const classCapacity = memory.residual.classMetadataBytes / 18;
  const bitsetBytes = classCount * WORDS_PER_CLASS * Uint32Array.BYTES_PER_ELEMENT;
  const bits = new Uint32Array(classCount * WORDS_PER_CLASS);
  const bitsetStarted = performance.now();
  for (let classId = 0; classId < classCount; classId += 1) {
    const ids = kernel.classes.termIds(classId);
    const base = classId * WORDS_PER_CLASS;
    for (let index = 0; index < ids.length; index += 1) {
      const termId = ids[index];
      bits[base + (termId >>> 5)] |= 1 << (termId & 31);
    }
  }
  const bitsetBuildMs = performance.now() - bitsetStarted;

  const graphSummary = {
    expandedThroughRank: EXPAND_THROUGH_RANK,
    frontierRank: EXPAND_THROUGH_RANK + 1,
    frontierStates: buckets[EXPAND_THROUGH_RANK + 1].length,
    qStates: kernel.states.count,
    residualClasses: classCount,
    residualTerms: termCount,
    graphMs,
    bitsetBuildMs,
    currentResidualMemory: { ...memory.residual },
    currentTotalTypedBytes: memory.totalTypedBytes,
    bitsetLogicalBytes: bitsetBytes,
    classCapacity,
    edges,
    classMetrics: { ...kernel.classes.metrics },
  };

  // Release the graph before allocating large chunk-intern sets. The dense
  // bitset matrix is the exact class substrate needed by the audit.
  wrap = null;
  kernel = null;
  if (global.gc) global.gc();
  return { bits, classCount, graphSummary };
}

function auditChunking(bits, classCount, chunkWords, current) {
  assert(WORDS_PER_CLASS % chunkWords === 0, 'chunk size must divide 20 words');
  const chunksPerClass = WORDS_PER_CLASS / chunkWords;
  const occurrences = classCount * chunksPerClass;
  const unique = new Set();
  const started = performance.now();
  let zeroOccurrences = 0;

  for (let classId = 0; classId < classCount; classId += 1) {
    const base = classId * WORDS_PER_CLASS;
    for (let chunk = 0; chunk < chunksPerClass; chunk += 1) {
      const offset = base + chunk * chunkWords;
      let allZero = true;
      for (let word = 0; word < chunkWords; word += 1) {
        if (bits[offset + word] !== 0) { allZero = false; break; }
      }
      if (allZero) zeroOccurrences += 1;
      unique.add(chunkKey(bits, offset, chunkWords));
    }
  }

  const uniqueChunks = unique.size;
  const auditMs = performance.now() - started;
  const idealIdBytes = uniqueChunks <= 0xffff ? 2 : 4;
  const practicalIdBytes = 4;
  const logicalChunkPayloadBytes = uniqueChunks * chunkWords * Uint32Array.BYTES_PER_ELEMENT;
  const practicalChunkCapacity = nextPowerOfTwo(Math.max(1, uniqueChunks));
  const practicalChunkPayloadBytes = practicalChunkCapacity * chunkWords * Uint32Array.BYTES_PER_ELEMENT;
  const chunkHashSlotBytes = hashCapacityBytes(uniqueChunks);
  const classCapacity = Math.round(current.classMetadataBytes / 18);
  const practicalClassRefBytes = classCapacity * chunksPerClass * practicalIdBytes;
  const idealClassRefBytes = classCount * chunksPerClass * idealIdBytes;
  const projectedClassMetadataBytes = classCapacity * 12; // hash32 + singletonLo + singletonHi
  const fixedOtherResidualBytes = current.vocabularyBytes + current.transitionCacheBytes + current.hashSlotBytes + current.scratchBytes;
  const practicalProjectedResidualBytes = fixedOtherResidualBytes
    + practicalChunkPayloadBytes
    + chunkHashSlotBytes
    + practicalClassRefBytes
    + projectedClassMetadataBytes;
  const idealLogicalResidualBytes = current.vocabularyBytes
    + current.transitionCacheBytes
    + current.scratchBytes
    + logicalChunkPayloadBytes
    + idealClassRefBytes
    + classCount * 12;

  const result = {
    chunkWords,
    chunkBits: chunkWords * 32,
    chunksPerClass,
    occurrences,
    uniqueChunks,
    reuseFactor: occurrences / uniqueChunks,
    zeroOccurrences,
    zeroFraction: zeroOccurrences / occurrences,
    auditMs,
    idealIdBytes,
    logicalChunkPayloadBytes,
    practicalChunkCapacity,
    practicalChunkPayloadBytes,
    chunkHashSlotBytes,
    idealClassRefBytes,
    practicalClassRefBytes,
    projectedClassMetadataBytes,
    practicalProjectedResidualBytes,
    idealLogicalResidualBytes,
    practicalRatioToCurrentResidual: practicalProjectedResidualBytes / current.totalTypedBytes,
    idealRatioToCurrentResidual: idealLogicalResidualBytes / current.totalTypedBytes,
  };
  unique.clear();
  if (global.gc) global.gc();
  console.error(`[chunk-audit] ${result.chunkBits}b unique=${uniqueChunks} reuse=${result.reuseFactor.toFixed(2)} zero=${(result.zeroFraction * 100).toFixed(1)}% practicalMB=${(practicalProjectedResidualBytes / 1048576).toFixed(1)} ratio=${result.practicalRatioToCurrentResidual.toFixed(3)} auditMs=${auditMs.toFixed(1)}`);
  return result;
}

const { bits, classCount, graphSummary } = buildGraph();
const chunkResults = [];
for (const chunkWords of CHUNK_WORDS) {
  chunkResults.push(auditChunking(bits, classCount, chunkWords, graphSummary.currentResidualMemory));
}

const fixedBitsetClassCapacity = Math.round(graphSummary.currentResidualMemory.classMetadataBytes / 18);
const fixedBitsetProjected = {
  logicalBitsetBytes: classCount * WORDS_PER_CLASS * 4,
  capacityBitsetBytes: fixedBitsetClassCapacity * WORDS_PER_CLASS * 4,
  projectedClassMetadataBytes: fixedBitsetClassCapacity * 12,
};
fixedBitsetProjected.projectedResidualBytes = graphSummary.currentResidualMemory.vocabularyBytes
  + graphSummary.currentResidualMemory.transitionCacheBytes
  + graphSummary.currentResidualMemory.hashSlotBytes
  + graphSummary.currentResidualMemory.scratchBytes
  + fixedBitsetProjected.capacityBitsetBytes
  + fixedBitsetProjected.projectedClassMetadataBytes;
fixedBitsetProjected.ratioToCurrentResidual = fixedBitsetProjected.projectedResidualBytes / graphSummary.currentResidualMemory.totalTypedBytes;

const result = {
  kind: 'connect4-standard-7x6-residual-chunk-sharing-audit-v1',
  status: 'complete',
  date: '2026-09-11',
  authority: 'storage-model audit only; no solver semantics or transition representation changed',
  geometry: '7x6:c4',
  graph: graphSummary,
  fixed625BitClass: fixedBitsetProjected,
  chunkResults,
};
console.error(`RESIDUAL_CHUNK_AUDIT_SUMMARY=${JSON.stringify({ classes: classCount, terms: graphSummary.residualTerms, currentResidualBytes: graphSummary.currentResidualMemory.totalTypedBytes, fixedBitsetBytes: fixedBitsetProjected.projectedResidualBytes, chunks: chunkResults.map((entry) => ({ bits: entry.chunkBits, unique: entry.uniqueChunks, reuse: entry.reuseFactor, practicalBytes: entry.practicalProjectedResidualBytes, practicalRatio: entry.practicalRatioToCurrentResidual })) })}`);
console.log(JSON.stringify(result, null, 2));
