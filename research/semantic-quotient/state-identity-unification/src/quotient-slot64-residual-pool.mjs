import { createTermVocabulary } from './quotient-term-id-pool.mjs';

const CLASS_UNKNOWN = -3;
const CLASS_TERMINAL_WIN = -1;
const WORDS_PER_CLASS = 20;
const CHUNK_WORDS = 2;
const CHUNKS_PER_CLASS = WORDS_PER_CLASS / CHUNK_WORDS;

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

function hashWords2(words, offset) {
  let hash = 0x811c9dc5;
  hash = Math.imul(hash ^ mix32(words[offset]), 0x01000193) >>> 0;
  hash = Math.imul(hash ^ mix32(words[offset + 1]), 0x01000193) >>> 0;
  return mix32(hash ^ CHUNK_WORDS);
}

function hashChunkTuple(ids) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < CHUNKS_PER_CLASS; index += 1) {
    hash = Math.imul(hash ^ mix32((ids[index] + 1) >>> 0), 0x01000193) >>> 0;
  }
  return mix32(hash ^ CHUNKS_PER_CLASS);
}

function bitIndex32(value) {
  return 31 - Math.clz32(value >>> 0);
}

function popcount32(value) {
  let x = value >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

function referenceTypeFor(maxId) {
  if (maxId <= 0xff) return Uint8Array;
  if (maxId <= 0xffff) return Uint16Array;
  return Uint32Array;
}

class SlotChunkPool64 {
  constructor(slot) {
    this.slot = slot;
    this.count = 0;
    this.capacity = 256;
    this.words = new Uint32Array(this.capacity * CHUNK_WORDS);
    this.hashSlots = new Int32Array(512);
    this.hashSlots.fill(-1);
    this.metrics = { lookups: 0, hits: 0, misses: 0, payloadGrows: 0, hashGrows: 0 };
  }

  _ensureCapacity(required) {
    if (required <= this.capacity) return;
    const next = nextPowerOfTwo(required);
    const target = new Uint32Array(next * CHUNK_WORDS);
    target.set(this.words);
    this.words = target;
    this.capacity = next;
    this.metrics.payloadGrows += 1;
  }

  equals(id, source, offset) {
    const base = id * CHUNK_WORDS;
    return this.words[base] === (source[offset] >>> 0)
      && this.words[base + 1] === (source[offset + 1] >>> 0);
  }

  _growHash() {
    const next = new Int32Array(this.hashSlots.length * 2);
    next.fill(-1);
    const mask = next.length - 1;
    for (let id = 0; id < this.count; id += 1) {
      const hash = hashWords2(this.words, id * CHUNK_WORDS);
      let slot = hash & mask;
      while (next[slot] !== -1) slot = (slot + 1) & mask;
      next[slot] = id;
    }
    this.hashSlots = next;
    this.metrics.hashGrows += 1;
  }

  intern(source, offset) {
    this.metrics.lookups += 1;
    if ((this.count + 1) * 10 >= this.hashSlots.length * 7) this._growHash();
    const hash = hashWords2(source, offset);
    const mask = this.hashSlots.length - 1;
    let slot = hash & mask;
    while (true) {
      const id = this.hashSlots[slot];
      if (id === -1) break;
      if (this.equals(id, source, offset)) {
        this.metrics.hits += 1;
        return id;
      }
      slot = (slot + 1) & mask;
    }
    this._ensureCapacity(this.count + 1);
    const id = this.count;
    const base = id * CHUNK_WORDS;
    this.words[base] = source[offset] >>> 0;
    this.words[base + 1] = source[offset + 1] >>> 0;
    this.hashSlots[slot] = id;
    this.count += 1;
    this.metrics.misses += 1;
    return id;
  }

  copyTo(id, target, offset) {
    const base = id * CHUNK_WORDS;
    target[offset] = this.words[base];
    target[offset + 1] = this.words[base + 1];
  }

  memoryStats() {
    return Object.freeze({
      slot: this.slot,
      chunkCount: this.count,
      chunkCapacity: this.capacity,
      payloadBytes: this.words.byteLength,
      hashSlotBytes: this.hashSlots.byteLength,
      totalTypedBytes: this.words.byteLength + this.hashSlots.byteLength,
    });
  }
}

export function installSlot64ResidualPool(kernel, spec, options = {}) {
  const pool = kernel.classes;
  const vocabulary = createTermVocabulary(spec);
  if (vocabulary.count > WORDS_PER_CLASS * 32) {
    throw new RangeError(`slot64 residual pool currently supports at most ${WORDS_PER_CLASS * 32} ontology terms`);
  }
  if (spec.columns === 7 && spec.rows === 6 && spec.connect === 4 && vocabulary.count !== 625) {
    throw new Error(`standard 7x6 vocabulary drifted: ${vocabulary.count}`);
  }
  const prefixClasses = options.prefixClasses ?? 4096;
  if (!Number.isInteger(prefixClasses) || prefixClasses < 1) throw new RangeError('prefixClasses must be positive');

  const slotPools = Array.from({ length: CHUNKS_PER_CLASS }, (_, slot) => new SlotChunkPool64(slot));
  let classCount = 0;
  let classCapacity = 1024;
  let classSlotIds = Array.from({ length: CHUNKS_PER_CLASS }, () => new Uint8Array(classCapacity));
  let classHashes = new Uint32Array(classCapacity);
  let singletonLo = new Uint32Array(classCapacity);
  let singletonHi = new Uint32Array(classCapacity);
  let classHashSlots = new Int32Array(2048);
  classHashSlots.fill(-1);

  const ownTransitions = new Int32Array(prefixClasses * vocabulary.cellCount);
  const blockTransitions = new Int32Array(prefixClasses * vocabulary.cellCount);
  ownTransitions.fill(CLASS_UNKNOWN);
  blockTransitions.fill(CLASS_UNKNOWN);

  const containsMasks = new Uint32Array(vocabulary.cellCount * WORDS_PER_CLASS);
  let strictSupersetDense = new Uint32Array(vocabulary.count * WORDS_PER_CLASS);
  const singletonTermMasks = new Uint32Array(WORDS_PER_CLASS);
  for (let termId = 0; termId < vocabulary.count; termId += 1) {
    const word = termId >>> 5;
    const bit = 1 << (termId & 31);
    if (vocabulary.cardinality[termId] === 1) singletonTermMasks[word] |= bit;
    for (let cell = 0; cell < vocabulary.cellCount; cell += 1) {
      const bitLo = cell < 32 ? ((2 ** cell) >>> 0) : 0;
      const bitHi = cell >= 32 ? ((2 ** (cell - 32)) >>> 0) : 0;
      if ((((vocabulary.lo[termId] & bitLo) >>> 0) !== 0) || (((vocabulary.hi[termId] & bitHi) >>> 0) !== 0)) {
        containsMasks[cell * WORDS_PER_CLASS + word] |= bit;
      }
    }
    for (let candidate = 0; candidate < vocabulary.count; candidate += 1) {
      if (candidate === termId) continue;
      if (!vocabulary.subset(termId, candidate)) continue;
      strictSupersetDense[termId * WORDS_PER_CLASS + (candidate >>> 5)] |= 1 << (candidate & 31);
    }
  }

  const strictSupersetStarts = new Uint32Array(vocabulary.count + 1);
  let strictSupersetEntryCount = 0;
  for (let termId = 0; termId < vocabulary.count; termId += 1) {
    strictSupersetStarts[termId] = strictSupersetEntryCount;
    const base = termId * WORDS_PER_CLASS;
    for (let word = 0; word < WORDS_PER_CLASS; word += 1) {
      if (strictSupersetDense[base + word] !== 0) strictSupersetEntryCount += 1;
    }
  }
  strictSupersetStarts[vocabulary.count] = strictSupersetEntryCount;
  const strictSupersetWordIndex = new Uint8Array(strictSupersetEntryCount);
  const strictSupersetWordMask = new Uint32Array(strictSupersetEntryCount);
  let strictSupersetWrite = 0;
  for (let termId = 0; termId < vocabulary.count; termId += 1) {
    const base = termId * WORDS_PER_CLASS;
    for (let word = 0; word < WORDS_PER_CLASS; word += 1) {
      const mask = strictSupersetDense[base + word] >>> 0;
      if (mask === 0) continue;
      strictSupersetWordIndex[strictSupersetWrite] = word;
      strictSupersetWordMask[strictSupersetWrite] = mask;
      strictSupersetWrite += 1;
    }
  }
  if (strictSupersetWrite !== strictSupersetEntryCount) throw new Error('sparse superset row build drifted');
  strictSupersetDense = null;

  const inputBits = new Uint32Array(WORDS_PER_CLASS);
  const resultBits = new Uint32Array(WORDS_PER_CLASS);
  const reducedBits = new Uint32Array(WORDS_PER_CLASS);
  const initialBits = new Uint32Array(WORDS_PER_CLASS);
  const chunkIds = new Uint32Array(CHUNKS_PER_CLASS);
  for (const termId of vocabulary.initialIds) initialBits[termId >>> 5] |= 1 << (termId & 31);

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
    reducedTerms: 0,
    supersetWordProbes: 0,
    supersetWordClears: 0,
    classGrows: 0,
    hashGrows: 0,
    slotReferenceWidens: 0,
    parentChunkReuses: 0,
    chunkInterns: 0,
    outOfPrefixOwn: 0,
    outOfPrefixBlock: 0,
    cachedStores: 0,
  };

  function ensureReferenceWidth(slot, requiredId) {
    const current = classSlotIds[slot];
    const Type = referenceTypeFor(requiredId);
    if (current.BYTES_PER_ELEMENT >= Type.BYTES_PER_ELEMENT) return;
    const widened = new Type(classCapacity);
    widened.set(current);
    classSlotIds[slot] = widened;
    metrics.slotReferenceWidens += 1;
  }

  function ensureClassCapacity(required) {
    if (required <= classCapacity) return;
    const next = nextPowerOfTwo(required);
    for (let slot = 0; slot < CHUNKS_PER_CLASS; slot += 1) {
      const Type = classSlotIds[slot].constructor;
      const target = new Type(next);
      target.set(classSlotIds[slot]);
      classSlotIds[slot] = target;
    }
    const hashes = new Uint32Array(next); hashes.set(classHashes); classHashes = hashes;
    const lo = new Uint32Array(next); lo.set(singletonLo); singletonLo = lo;
    const hi = new Uint32Array(next); hi.set(singletonHi); singletonHi = hi;
    classCapacity = next;
    metrics.classGrows += 1;
  }

  function classEquals(id, ids) {
    for (let slot = 0; slot < CHUNKS_PER_CLASS; slot += 1) {
      if (classSlotIds[slot][id] !== ids[slot]) return false;
    }
    return true;
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
    metrics.hashGrows += 1;
  }

  function loadClassBits(id, target) {
    for (let slot = 0; slot < CHUNKS_PER_CLASS; slot += 1) {
      slotPools[slot].copyTo(classSlotIds[slot][id], target, slot * CHUNK_WORDS);
    }
  }

  function computeSingletonMasks(bits) {
    let lo = 0;
    let hi = 0;
    for (let word = 0; word < WORDS_PER_CLASS; word += 1) {
      let active = (bits[word] & singletonTermMasks[word]) >>> 0;
      while (active !== 0) {
        const lsb = (active & -active) >>> 0;
        const termId = (word << 5) + bitIndex32(lsb);
        lo = (lo | vocabulary.lo[termId]) >>> 0;
        hi = (hi | vocabulary.hi[termId]) >>> 0;
        active = (active & (active - 1)) >>> 0;
      }
    }
    return [lo, hi];
  }

  function internBits(bits, parentId = -1) {
    metrics.internLookups += 1;
    let sameAsParent = parentId >= 0;
    for (let slot = 0; slot < CHUNKS_PER_CLASS; slot += 1) {
      const offset = slot * CHUNK_WORDS;
      if (parentId >= 0) {
        const parentChunk = classSlotIds[slot][parentId];
        if (slotPools[slot].equals(parentChunk, bits, offset)) {
          chunkIds[slot] = parentChunk;
          metrics.parentChunkReuses += 1;
          continue;
        }
        sameAsParent = false;
      }
      chunkIds[slot] = slotPools[slot].intern(bits, offset);
      metrics.chunkInterns += 1;
    }
    if (sameAsParent) {
      metrics.internHits += 1;
      return parentId;
    }
    if ((classCount + 1) * 10 >= classHashSlots.length * 7) growClassHash();
    const hash = hashChunkTuple(chunkIds);
    const mask = classHashSlots.length - 1;
    let slot = hash & mask;
    while (true) {
      const id = classHashSlots[slot];
      if (id === -1) break;
      if (classHashes[id] === hash && classEquals(id, chunkIds)) {
        metrics.internHits += 1;
        return id;
      }
      slot = (slot + 1) & mask;
    }

    for (let chunk = 0; chunk < CHUNKS_PER_CLASS; chunk += 1) ensureReferenceWidth(chunk, chunkIds[chunk]);
    ensureClassCapacity(classCount + 1);
    const id = classCount;
    for (let chunk = 0; chunk < CHUNKS_PER_CLASS; chunk += 1) classSlotIds[chunk][id] = chunkIds[chunk];
    classHashes[id] = hash;
    const [lo, hi] = computeSingletonMasks(bits);
    singletonLo[id] = lo;
    singletonHi[id] = hi;
    classHashSlots[slot] = id;
    classCount += 1;
    metrics.internMisses += 1;
    return id;
  }

  const emptyBits = new Uint32Array(WORDS_PER_CLASS);
  const emptyClass = internBits(emptyBits);
  const initialClass = internBits(initialBits);
  if (emptyClass !== 0 || initialClass !== 1) throw new Error('slot64 residual bootstrap IDs drifted');
  if (pool.emptyClass !== emptyClass || pool.initialClass !== initialClass) throw new Error('slot64 residual bootstrap does not match base q IDs');

  function cacheGet(cache, id, cell, own) {
    if (id >= prefixClasses) {
      if (own) metrics.outOfPrefixOwn += 1;
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

  Object.defineProperty(pool, 'size', { configurable: true, get: () => classCount });
  pool.emptyClass = emptyClass;
  pool.initialClass = initialClass;
  pool.termVocabulary = vocabulary;
  pool.metrics = metrics;
  pool.slotPools = slotPools;
  pool.isEmpty = (id) => id === emptyClass;
  pool.hasSingletonAt = (id, bitLo, bitHi) => (((singletonLo[id] & bitLo) >>> 0) !== 0) || (((singletonHi[id] & bitHi) >>> 0) !== 0);

  pool.termIds = function slot64TermIds(id) {
    loadClassBits(id, inputBits);
    let count = 0;
    for (let word = 0; word < WORDS_PER_CLASS; word += 1) count += popcount32(inputBits[word]);
    const ids = new Uint16Array(count);
    let out = 0;
    for (let word = 0; word < WORDS_PER_CLASS; word += 1) {
      let active = inputBits[word] >>> 0;
      while (active !== 0) {
        const lsb = (active & -active) >>> 0;
        ids[out++] = (word << 5) + bitIndex32(lsb);
        active = (active & (active - 1)) >>> 0;
      }
    }
    return ids;
  };

  pool.terms = function slot64Terms(id) {
    const ids = pool.termIds(id);
    const result = [];
    for (const termId of ids) result.push([vocabulary.lo[termId] >>> 0, vocabulary.hi[termId] >>> 0]);
    return result;
  };

  pool.ownTransition = function ownTransitionSlot64(id, cell, bitLo, bitHi) {
    const cached = cacheGet(ownTransitions, id, cell, true);
    if (cached !== CLASS_UNKNOWN) { metrics.ownTransitionHits += 1; return cached; }
    metrics.ownTransitionMisses += 1;
    if ((((singletonLo[id] & bitLo) >>> 0) !== 0) || (((singletonHi[id] & bitHi) >>> 0) !== 0)) {
      cacheSet(ownTransitions, id, cell, CLASS_TERMINAL_WIN);
      metrics.ownTerminal += 1;
      return CLASS_TERMINAL_WIN;
    }

    loadClassBits(id, inputBits);
    reducedBits.fill(0);
    let affected = false;
    const containsBase = cell * WORDS_PER_CLASS;
    for (let word = 0; word < WORDS_PER_CLASS; word += 1) {
      const input = inputBits[word] >>> 0;
      let active = (input & containsMasks[containsBase + word]) >>> 0;
      resultBits[word] = (input & ~containsMasks[containsBase + word]) >>> 0;
      if (active !== 0) affected = true;
      while (active !== 0) {
        const lsb = (active & -active) >>> 0;
        const termId = (word << 5) + bitIndex32(lsb);
        const target = vocabulary.reduce[termId * vocabulary.cellCount + cell];
        if (target === vocabulary.terminal) {
          cacheSet(ownTransitions, id, cell, CLASS_TERMINAL_WIN);
          metrics.ownTerminal += 1;
          return CLASS_TERMINAL_WIN;
        }
        reducedBits[target >>> 5] |= 1 << (target & 31);
        metrics.reducedTerms += 1;
        active = (active & (active - 1)) >>> 0;
      }
    }
    if (!affected) {
      cacheSet(ownTransitions, id, cell, id);
      metrics.ownNoop += 1;
      return id;
    }

    for (let word = 0; word < WORDS_PER_CLASS; word += 1) resultBits[word] = (resultBits[word] | reducedBits[word]) >>> 0;
    for (let word = 0; word < WORDS_PER_CLASS; word += 1) {
      let active = reducedBits[word] >>> 0;
      while (active !== 0) {
        const lsb = (active & -active) >>> 0;
        const termId = (word << 5) + bitIndex32(lsb);
        const start = strictSupersetStarts[termId];
        const end = strictSupersetStarts[termId + 1];
        for (let entry = start; entry < end; entry += 1) {
          const targetWord = strictSupersetWordIndex[entry];
          const mask = strictSupersetWordMask[entry];
          resultBits[targetWord] = (resultBits[targetWord] & ~mask) >>> 0;
          metrics.supersetWordProbes += 1;
          metrics.supersetWordClears += 1;
        }
        active = (active & (active - 1)) >>> 0;
      }
    }

    const result = internBits(resultBits, id);
    cacheSet(ownTransitions, id, cell, result);
    return result;
  };

  pool.blockTransition = function blockTransitionSlot64(id, cell) {
    const cached = cacheGet(blockTransitions, id, cell, false);
    if (cached !== CLASS_UNKNOWN) { metrics.blockTransitionHits += 1; return cached; }
    metrics.blockTransitionMisses += 1;
    loadClassBits(id, inputBits);
    const containsBase = cell * WORDS_PER_CLASS;
    let changed = false;
    for (let word = 0; word < WORDS_PER_CLASS; word += 1) {
      const input = inputBits[word] >>> 0;
      const next = (input & ~containsMasks[containsBase + word]) >>> 0;
      resultBits[word] = next;
      if (next !== input) changed = true;
    }
    if (!changed) {
      cacheSet(blockTransitions, id, cell, id);
      metrics.blockNoop += 1;
      return id;
    }
    const result = internBits(resultBits, id);
    cacheSet(blockTransitions, id, cell, result);
    return result;
  };

  pool.memoryStats = function slot64ResidualMemoryStats() {
    const classTupleBytes = classSlotIds.reduce((sum, ids) => sum + ids.byteLength, 0);
    const classMetadataBytes = classTupleBytes + classHashes.byteLength + singletonLo.byteLength + singletonHi.byteLength;
    const transitionCacheBytes = ownTransitions.byteLength + blockTransitions.byteLength;
    const maskBytes = containsMasks.byteLength
      + strictSupersetStarts.byteLength
      + strictSupersetWordIndex.byteLength
      + strictSupersetWordMask.byteLength
      + singletonTermMasks.byteLength;
    const scratchBytes = inputBits.byteLength + resultBits.byteLength + reducedBits.byteLength + initialBits.byteLength + chunkIds.byteLength;
    const slots = slotPools.map((entry) => entry.memoryStats());
    const chunkPayloadBytes = slots.reduce((sum, entry) => sum + entry.payloadBytes, 0);
    const chunkHashSlotBytes = slots.reduce((sum, entry) => sum + entry.hashSlotBytes, 0);
    const chunkDictionaryBytes = slots.reduce((sum, entry) => sum + entry.totalTypedBytes, 0);
    return Object.freeze({
      classCount,
      termVocabularyCount: vocabulary.count,
      residualTerms: null,
      vocabularyBytes: vocabulary.bytes,
      classTupleBytes,
      classReferenceWidths: classSlotIds.map((ids) => ids.BYTES_PER_ELEMENT),
      classMetadataBytes,
      transitionCacheKind: 'dense-prefix',
      transitionPrefixClasses: prefixClasses,
      transitionCacheBytes,
      classHashSlotBytes: classHashSlots.byteLength,
      chunkCounts: slots.map((entry) => entry.chunkCount),
      chunkPayloadBytes,
      chunkHashSlotBytes,
      chunkDictionaryBytes,
      slotDictionaries: slots,
      normalizationLayout: 'sparse-superset-word-rows',
      strictSupersetEntries: strictSupersetEntryCount,
      maskBytes,
      scratchBytes,
      totalTypedBytes: vocabulary.bytes
        + classMetadataBytes
        + transitionCacheBytes
        + classHashSlots.byteLength
        + chunkDictionaryBytes
        + maskBytes
        + scratchBytes,
    });
  };

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

  return Object.freeze({ vocabulary, prefixClasses, slotPools, metrics, memoryStats: pool.memoryStats });
}
