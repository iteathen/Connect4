import { createTermVocabulary } from './quotient-term-id-pool.mjs';

const CLASS_UNKNOWN = -3;
const CLASS_TERMINAL_WIN = -1;
const CHUNK_WORDS = 2;
const TERMS_PER_CHUNK = 64;

function nextPowerOfTwo(value) {
  let result = 1;
  while (result < value) result *= 2;
  return result;
}

function mix32(value) {
  let x = value >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b) >>> 0;
  x ^= x >>> 16;
  return x >>> 0;
}

function chunkHash(lo, hi) {
  return mix32((lo ^ Math.imul(hi, 0x9e3779b1)) >>> 0);
}

function tupleHash(tuple) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < tuple.length; index += 1) {
    hash = Math.imul(hash ^ mix32((tuple[index] + 1) >>> 0), 0x01000193) >>> 0;
  }
  return mix32(hash ^ tuple.length);
}

function requiredWidthForId(id) {
  if (id <= 0xff) return 1;
  if (id <= 0xffff) return 2;
  return 4;
}

function arrayForWidth(width, length) {
  if (width === 1) return new Uint8Array(length);
  if (width === 2) return new Uint16Array(length);
  return new Uint32Array(length);
}

function createChunkDictionary() {
  let count = 0;
  let capacity = 256;
  let lo = new Uint32Array(capacity);
  let hi = new Uint32Array(capacity);
  let hashes = new Uint32Array(capacity);
  let hashSlots = new Int32Array(512);
  hashSlots.fill(-1);
  const metrics = { lookups: 0, hits: 0, misses: 0, storageGrows: 0, hashGrows: 0 };

  function ensureCapacity(required) {
    if (required <= capacity) return;
    const next = nextPowerOfTwo(required);
    const nextLo = new Uint32Array(next);
    const nextHi = new Uint32Array(next);
    const nextHashes = new Uint32Array(next);
    nextLo.set(lo);
    nextHi.set(hi);
    nextHashes.set(hashes);
    lo = nextLo;
    hi = nextHi;
    hashes = nextHashes;
    capacity = next;
    metrics.storageGrows += 1;
  }

  function growHash() {
    const next = new Int32Array(hashSlots.length * 2);
    next.fill(-1);
    const mask = next.length - 1;
    for (let id = 0; id < count; id += 1) {
      let slot = hashes[id] & mask;
      while (next[slot] !== -1) slot = (slot + 1) & mask;
      next[slot] = id;
    }
    hashSlots = next;
    metrics.hashGrows += 1;
  }

  function intern(wordLo, wordHi) {
    metrics.lookups += 1;
    if ((count + 1) * 10 >= hashSlots.length * 7) growHash();
    const hash = chunkHash(wordLo, wordHi);
    const mask = hashSlots.length - 1;
    let slot = hash & mask;
    while (true) {
      const id = hashSlots[slot];
      if (id === -1) break;
      if (hashes[id] === hash && lo[id] === (wordLo >>> 0) && hi[id] === (wordHi >>> 0)) {
        metrics.hits += 1;
        return id;
      }
      slot = (slot + 1) & mask;
    }
    ensureCapacity(count + 1);
    const id = count++;
    lo[id] = wordLo >>> 0;
    hi[id] = wordHi >>> 0;
    hashes[id] = hash;
    hashSlots[slot] = id;
    metrics.misses += 1;
    return id;
  }

  const zero = intern(0, 0);
  if (zero !== 0) throw new Error('chunk dictionary zero ID drifted');

  return Object.freeze({
    get size() { return count; },
    intern,
    loAt: (id) => lo[id] >>> 0,
    hiAt: (id) => hi[id] >>> 0,
    metrics,
    memoryStats() {
      return Object.freeze({
        count,
        capacity,
        chunkWordsBytes: lo.byteLength + hi.byteLength,
        hashBytes: hashes.byteLength,
        hashSlotBytes: hashSlots.byteLength,
        totalTypedBytes: lo.byteLength + hi.byteLength + hashes.byteLength + hashSlots.byteLength,
      });
    },
  });
}

export function installChunkedTermIdPool(kernel, spec, options = {}) {
  const pool = kernel.classes;
  const vocabulary = createTermVocabulary(spec);
  const prefixClasses = options.prefixClasses ?? 4096;
  if (!Number.isInteger(prefixClasses) || prefixClasses < 1) throw new RangeError('prefixClasses must be positive');
  const chunkSlots = Math.ceil(vocabulary.count / TERMS_PER_CHUNK);
  const maxTerms = vocabulary.lineCount;

  const chunks = Array.from({ length: chunkSlots }, () => createChunkDictionary());
  let classCount = 0;
  let classCapacity = 1024;
  let classHashes = new Uint32Array(classCapacity);
  let classHashSlots = new Int32Array(2048);
  classHashSlots.fill(-1);
  const slotWidths = new Uint8Array(chunkSlots);
  slotWidths.fill(1);
  let classChunkIds = Array.from({ length: chunkSlots }, () => new Uint8Array(classCapacity));
  let residualTerms = 0;

  const tupleScratch = new Uint32Array(chunkSlots);
  const wordScratch = new Uint32Array(chunkSlots * CHUNK_WORDS);
  const scratchSource = new Uint16Array(maxTerms);
  const scratchReduced = new Uint16Array(maxTerms);
  const scratchUnchanged = new Uint16Array(maxTerms);
  const scratchSurvivor = new Uint16Array(maxTerms);
  const scratchResult = new Uint16Array(maxTerms);

  const ownTransitions = new Int32Array(prefixClasses * vocabulary.cellCount);
  const blockTransitions = new Int32Array(prefixClasses * vocabulary.cellCount);
  ownTransitions.fill(CLASS_UNKNOWN);
  blockTransitions.fill(CLASS_UNKNOWN);

  const singletonTermByCell = new Uint16Array(vocabulary.cellCount);
  singletonTermByCell.fill(0xffff);
  for (let termId = 0; termId < vocabulary.count; termId += 1) {
    if (vocabulary.cardinality[termId] !== 1) continue;
    let cell = -1;
    if (vocabulary.lo[termId] !== 0) cell = 31 - Math.clz32(vocabulary.lo[termId]);
    else if (vocabulary.hi[termId] !== 0) cell = 32 + (31 - Math.clz32(vocabulary.hi[termId]));
    if (cell >= 0 && cell < singletonTermByCell.length) singletonTermByCell[cell] = termId;
  }

  const metrics = {
    internLookups: 0,
    internHits: 0,
    internMisses: 0,
    ownTransitionHits: 0,
    ownTransitionMisses: 0,
    blockTransitionHits: 0,
    blockTransitionMisses: 0,
    ownNoop: 0,
    blockNoop: 0,
    ownTerminal: 0,
    crossDominanceChecks: 0,
    classGrows: 0,
    classHashGrows: 0,
    slotWidthUpgrades: 0,
    outOfPrefixOwn: 0,
    outOfPrefixBlock: 0,
    cachedStores: 0,
  };

  function ensureClassCapacity(required) {
    if (required <= classCapacity) return;
    const next = nextPowerOfTwo(required);
    const nextHashes = new Uint32Array(next);
    nextHashes.set(classHashes);
    classHashes = nextHashes;
    classChunkIds = classChunkIds.map((source, slot) => {
      const target = arrayForWidth(slotWidths[slot], next);
      target.set(source);
      return target;
    });
    classCapacity = next;
    metrics.classGrows += 1;
  }

  function ensureSlotWidth(slot, chunkId) {
    const required = requiredWidthForId(chunkId);
    if (required <= slotWidths[slot]) return;
    const target = arrayForWidth(required, classCapacity);
    target.set(classChunkIds[slot]);
    classChunkIds[slot] = target;
    slotWidths[slot] = required;
    metrics.slotWidthUpgrades += 1;
  }

  function growClassHash() {
    const next = new Int32Array(classHashSlots.length * 2);
    next.fill(-1);
    const mask = next.length - 1;
    for (let id = 0; id < classCount; id += 1) {
      let slot = classHashes[id] & mask;
      while (next[slot] !== -1) slot = (slot + 1) & mask;
      next[slot] = id;
    }
    classHashSlots = next;
    metrics.classHashGrows += 1;
  }

  function classEquals(id, tuple) {
    for (let slot = 0; slot < chunkSlots; slot += 1) {
      if (classChunkIds[slot][id] !== tuple[slot]) return false;
    }
    return true;
  }

  function internTuple(tuple, termCount) {
    metrics.internLookups += 1;
    if ((classCount + 1) * 10 >= classHashSlots.length * 7) growClassHash();
    const hash = tupleHash(tuple);
    const mask = classHashSlots.length - 1;
    let slot = hash & mask;
    while (true) {
      const id = classHashSlots[slot];
      if (id === -1) break;
      if (classHashes[id] === hash && classEquals(id, tuple)) {
        metrics.internHits += 1;
        return id;
      }
      slot = (slot + 1) & mask;
    }

    ensureClassCapacity(classCount + 1);
    const id = classCount;
    for (let chunkSlot = 0; chunkSlot < chunkSlots; chunkSlot += 1) {
      const chunkId = tuple[chunkSlot];
      ensureSlotWidth(chunkSlot, chunkId);
      classChunkIds[chunkSlot][id] = chunkId;
    }
    classHashes[id] = hash;
    classHashSlots[slot] = id;
    classCount += 1;
    residualTerms += termCount;
    metrics.internMisses += 1;
    return id;
  }

  function internIds(ids, count) {
    wordScratch.fill(0);
    for (let index = 0; index < count; index += 1) {
      const termId = ids[index];
      wordScratch[termId >>> 5] |= (1 << (termId & 31)) >>> 0;
    }
    for (let slot = 0; slot < chunkSlots; slot += 1) {
      tupleScratch[slot] = chunks[slot].intern(wordScratch[slot * 2], wordScratch[slot * 2 + 1]);
    }
    return internTuple(tupleScratch, count);
  }

  function enumerateTermIds(id, target) {
    let count = 0;
    for (let slot = 0; slot < chunkSlots; slot += 1) {
      const chunkId = classChunkIds[slot][id];
      let word0 = chunks[slot].loAt(chunkId);
      let word1 = chunks[slot].hiAt(chunkId);
      while (word0 !== 0) {
        const lsb = (word0 & -word0) >>> 0;
        const bit = 31 - Math.clz32(lsb);
        const termId = slot * TERMS_PER_CHUNK + bit;
        if (termId < vocabulary.count) target[count++] = termId;
        word0 = (word0 & (word0 - 1)) >>> 0;
      }
      while (word1 !== 0) {
        const lsb = (word1 & -word1) >>> 0;
        const bit = 31 - Math.clz32(lsb);
        const termId = slot * TERMS_PER_CHUNK + 32 + bit;
        if (termId < vocabulary.count) target[count++] = termId;
        word1 = (word1 & (word1 - 1)) >>> 0;
      }
    }
    return count;
  }

  function containsTerm(id, termId) {
    const slot = Math.floor(termId / TERMS_PER_CHUNK);
    const offset = termId % TERMS_PER_CHUNK;
    const chunkId = classChunkIds[slot][id];
    if (offset < 32) return ((chunks[slot].loAt(chunkId) >>> offset) & 1) !== 0;
    return ((chunks[slot].hiAt(chunkId) >>> (offset - 32)) & 1) !== 0;
  }

  function cacheGet(cache, id, cell, kind) {
    if (id >= prefixClasses) {
      if (kind === 'own') metrics.outOfPrefixOwn += 1;
      else metrics.outOfPrefixBlock += 1;
      return CLASS_UNKNOWN;
    }
    return cache[id * vocabulary.cellCount + cell];
  }

  function cacheSet(cache, id, cell, value) {
    if (id >= prefixClasses) return;
    cache[id * vocabulary.cellCount + cell] = value;
    metrics.cachedStores += 1;
  }

  const emptyClass = internIds(new Uint16Array(0), 0);
  const initialClass = internIds(vocabulary.initialIds, vocabulary.initialIds.length);
  if (emptyClass !== 0 || initialClass !== 1) throw new Error('chunked term-ID bootstrap IDs drifted');
  if (pool.emptyClass !== emptyClass || pool.initialClass !== initialClass) throw new Error('chunked bootstrap does not match base q IDs');

  Object.defineProperty(pool, 'size', { configurable: true, get: () => classCount });
  pool.emptyClass = emptyClass;
  pool.initialClass = initialClass;
  pool.termVocabulary = vocabulary;
  pool.metrics = metrics;
  pool.chunkSlots = chunkSlots;
  pool.chunkWords = CHUNK_WORDS;
  pool.isEmpty = (id) => id === emptyClass;
  pool.hasSingletonAt = function hasSingletonAtChunked(id, bitLo, bitHi) {
    let cell = -1;
    if (bitLo !== 0) cell = 31 - Math.clz32(bitLo);
    else if (bitHi !== 0) cell = 32 + (31 - Math.clz32(bitHi));
    if (cell < 0 || cell >= singletonTermByCell.length) return false;
    const termId = singletonTermByCell[cell];
    return termId !== 0xffff && containsTerm(id, termId);
  };
  pool.termIds = function termIdsChunked(id) {
    const count = enumerateTermIds(id, scratchSource);
    return scratchSource.slice(0, count);
  };
  pool.terms = function termsChunked(id) {
    const count = enumerateTermIds(id, scratchSource);
    const result = [];
    for (let index = 0; index < count; index += 1) {
      const termId = scratchSource[index];
      result.push([vocabulary.lo[termId] >>> 0, vocabulary.hi[termId] >>> 0]);
    }
    return result;
  };

  pool.ownTransition = function ownTransitionChunked(id, cell) {
    const cached = cacheGet(ownTransitions, id, cell, 'own');
    if (cached !== CLASS_UNKNOWN) {
      metrics.ownTransitionHits += 1;
      return cached;
    }
    metrics.ownTransitionMisses += 1;

    const count = enumerateTermIds(id, scratchSource);
    let reducedCount = 0;
    let unchangedCount = 0;
    for (let index = 0; index < count; index += 1) {
      const termId = scratchSource[index];
      const nextId = vocabulary.reduce[termId * vocabulary.cellCount + cell];
      if (nextId === vocabulary.terminal) {
        cacheSet(ownTransitions, id, cell, CLASS_TERMINAL_WIN);
        metrics.ownTerminal += 1;
        return CLASS_TERMINAL_WIN;
      }
      if (nextId === termId) scratchUnchanged[unchangedCount++] = termId;
      else scratchReduced[reducedCount++] = nextId;
    }
    if (reducedCount === 0) {
      cacheSet(ownTransitions, id, cell, id);
      metrics.ownNoop += 1;
      return id;
    }

    let survivorCount = 0;
    outer: for (let u = 0; u < unchangedCount; u += 1) {
      const candidate = scratchUnchanged[u];
      for (let r = 0; r < reducedCount; r += 1) {
        metrics.crossDominanceChecks += 1;
        if (vocabulary.subset(scratchReduced[r], candidate)) continue outer;
      }
      scratchSurvivor[survivorCount++] = candidate;
    }

    let r = 0;
    let u = 0;
    let resultCount = 0;
    while (r < reducedCount || u < survivorCount) {
      if (r >= reducedCount) scratchResult[resultCount++] = scratchSurvivor[u++];
      else if (u >= survivorCount) scratchResult[resultCount++] = scratchReduced[r++];
      else if (scratchReduced[r] <= scratchSurvivor[u]) scratchResult[resultCount++] = scratchReduced[r++];
      else scratchResult[resultCount++] = scratchSurvivor[u++];
    }

    const result = internIds(scratchResult, resultCount);
    cacheSet(ownTransitions, id, cell, result);
    return result;
  };

  pool.blockTransition = function blockTransitionChunked(id, cell) {
    const cached = cacheGet(blockTransitions, id, cell, 'block');
    if (cached !== CLASS_UNKNOWN) {
      metrics.blockTransitionHits += 1;
      return cached;
    }
    metrics.blockTransitionMisses += 1;

    const count = enumerateTermIds(id, scratchSource);
    let resultCount = 0;
    for (let index = 0; index < count; index += 1) {
      const termId = scratchSource[index];
      const nextId = vocabulary.reduce[termId * vocabulary.cellCount + cell];
      if (nextId === termId) scratchResult[resultCount++] = termId;
    }
    if (resultCount === count) {
      cacheSet(blockTransitions, id, cell, id);
      metrics.blockNoop += 1;
      return id;
    }
    const result = internIds(scratchResult, resultCount);
    cacheSet(blockTransitions, id, cell, result);
    return result;
  };

  pool.memoryStats = function chunkedMemoryStats() {
    let chunkDictionaryBytes = 0;
    let chunkCount = 0;
    const chunkSlotStats = [];
    for (let slot = 0; slot < chunkSlots; slot += 1) {
      const stats = chunks[slot].memoryStats();
      chunkDictionaryBytes += stats.totalTypedBytes;
      chunkCount += stats.count;
      chunkSlotStats.push(Object.freeze({ slot, classIdWidth: slotWidths[slot], ...stats }));
    }
    const classTupleBytes = classChunkIds.reduce((sum, array) => sum + array.byteLength, 0);
    const classHashBytes = classHashes.byteLength + classHashSlots.byteLength;
    const transitionCacheBytes = ownTransitions.byteLength + blockTransitions.byteLength;
    const scratchBytes = wordScratch.byteLength + tupleScratch.byteLength + scratchSource.byteLength + scratchReduced.byteLength + scratchUnchanged.byteLength + scratchSurvivor.byteLength + scratchResult.byteLength;
    const helperBytes = singletonTermByCell.byteLength;
    return Object.freeze({
      classCount,
      residualTerms,
      termVocabularyCount: vocabulary.count,
      vocabularyBytes: vocabulary.bytes,
      chunkWords: CHUNK_WORDS,
      chunkSlots,
      chunkCount,
      chunkDictionaryBytes,
      chunkSlotStats,
      classTupleBytes,
      classHashBytes,
      transitionCacheKind: 'dense-prefix',
      transitionPrefixClasses: prefixClasses,
      transitionCacheBytes,
      scratchBytes,
      helperBytes,
      totalTypedBytes: vocabulary.bytes + chunkDictionaryBytes + classTupleBytes + classHashBytes + transitionCacheBytes + scratchBytes + helperBytes,
    });
  };

  // Release the bootstrap discovery representation from authority.
  pool.flatLo = null;
  pool.flatHi = null;
  pool.starts = null;
  pool.lengths = null;
  pool.hashes = null;
  pool.singletonLo = null;
  pool.singletonHi = null;
  pool.hashSlots = null;
  pool.ownTransitions = null;
  pool.blockTransitions = null;

  return Object.freeze({
    vocabulary,
    prefixClasses,
    chunkWords: CHUNK_WORDS,
    chunkSlots,
    metrics,
    memoryStats: pool.memoryStats,
  });
}
