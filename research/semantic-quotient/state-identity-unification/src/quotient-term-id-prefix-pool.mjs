import { createConnectWinningLines } from '../../../../components/bsfp/geometry.mjs';

const CLASS_UNKNOWN = -3;
const CLASS_TERMINAL_WIN = -1;

function nextPowerOfTwo(value) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 2 ** 30) throw new RangeError('prefix-pool capacity exceeds signed power-of-two index domain');
  let result = 1;
  while (result < value) result *= 2;
  return result;
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

function mix32(value) {
  let x = value >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b) >>> 0;
  x ^= x >>> 16;
  return x >>> 0;
}

function hashIds(ids, count) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < count; index += 1) {
    hash = Math.imul(hash ^ mix32((ids[index] + 1) >>> 0), 0x01000193) >>> 0;
  }
  return mix32(hash ^ count);
}

function lineMaskPair(line) {
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
  const limit = 1 << line.length;
  for (let subset = 1; subset < limit; subset += 1) {
    let lo = 0;
    let hi = 0;
    for (let index = 0; index < line.length; index += 1) {
      if ((subset & (1 << index)) === 0) continue;
      const cell = line[index];
      if (cell < 32) lo = (lo | ((2 ** cell) >>> 0)) >>> 0;
      else hi = (hi | ((2 ** (cell - 32)) >>> 0)) >>> 0;
    }
    result.push([lo >>> 0, hi >>> 0]);
  }
  return result;
}

function createTermVocabulary(spec) {
  if (!spec || !Number.isSafeInteger(spec.columns * spec.rows) || spec.columns * spec.rows > 64) throw new RangeError('prefix vocabulary requires at most 64 cells');
  if (!Number.isSafeInteger(spec.connect) || spec.connect < 1 || spec.connect >= 16) throw new RangeError('prefix vocabulary connect must be in 1..15');
  const lines = createConnectWinningLines(spec);
  const cellCount = spec.columns * spec.rows;
  const byKey = new Map();
  for (const line of lines) {
    for (const [lo, hi] of enumerateNonemptySubsets(line)) byKey.set(pairKey(lo, hi), [lo, hi]);
  }
  const terms = [...byKey.values()].sort(compareMaskPair);
  if (terms.length >= 0xffff) throw new RangeError('residual term vocabulary does not fit u16 IDs');
  const terminal = terms.length;
  const idByKey = new Map(terms.map((term, id) => [pairKey(term[0], term[1]), id]));
  const lo = new Uint32Array(terms.length);
  const hi = new Uint32Array(terms.length);
  const termCardinality = new Uint8Array(terms.length);
  for (let id = 0; id < terms.length; id += 1) {
    lo[id] = terms[id][0] >>> 0;
    hi[id] = terms[id][1] >>> 0;
    termCardinality[id] = cardinality(lo[id], hi[id]);
  }

  const reduce = new Uint16Array(terms.length * cellCount);
  for (let id = 0; id < terms.length; id += 1) {
    for (let cell = 0; cell < cellCount; cell += 1) {
      const bitLo = cell < 32 ? ((2 ** cell) >>> 0) : 0;
      const bitHi = cell >= 32 ? ((2 ** (cell - 32)) >>> 0) : 0;
      const contains = (((lo[id] & bitLo) >>> 0) !== 0) || (((hi[id] & bitHi) >>> 0) !== 0);
      if (!contains) {
        reduce[id * cellCount + cell] = id;
        continue;
      }
      const nextLo = (lo[id] & ~bitLo) >>> 0;
      const nextHi = (hi[id] & ~bitHi) >>> 0;
      if (nextLo === 0 && nextHi === 0) {
        reduce[id * cellCount + cell] = terminal;
        continue;
      }
      const nextId = idByKey.get(pairKey(nextLo, nextHi));
      if (nextId === undefined) throw new Error('term vocabulary is not closed under one-cell reduction');
      reduce[id * cellCount + cell] = nextId;
    }
  }

  const subsetRowBytes = Math.ceil(terms.length / 8);
  const subsetBits = new Uint8Array(terms.length * subsetRowBytes);
  for (let a = 0; a < terms.length; a += 1) {
    for (let b = 0; b < terms.length; b += 1) {
      if (subsetOf(lo[a], hi[a], lo[b], hi[b])) subsetBits[a * subsetRowBytes + (b >>> 3)] |= 1 << (b & 7);
    }
  }

  const initialIds = new Uint16Array(lines.length);
  for (let index = 0; index < lines.length; index += 1) {
    const [lineLo, lineHi] = lineMaskPair(lines[index]);
    const id = idByKey.get(pairKey(lineLo, lineHi));
    if (id === undefined) throw new Error('winning line missing from term vocabulary');
    initialIds[index] = id;
  }
  initialIds.sort();

  return Object.freeze({
    count: terms.length,
    terminal,
    cellCount,
    lineCount: lines.length,
    lo,
    hi,
    cardinality: termCardinality,
    reduce,
    subsetBits,
    subsetRowBytes,
    initialIds,
    subset(a, b) {
      return (subsetBits[a * subsetRowBytes + (b >>> 3)] & (1 << (b & 7))) !== 0;
    },
    bytes: lo.byteLength + hi.byteLength + termCardinality.byteLength + reduce.byteLength + subsetBits.byteLength + initialIds.byteLength,
  });
}

export function installPrefixTermIdPool(kernel, spec, options = {}) {
  const pool = kernel.classes;
  const vocabulary = createTermVocabulary(spec);
  const prefixClasses = options.prefixClasses ?? 4096;
  if (!Number.isSafeInteger(prefixClasses) || prefixClasses < 1 || prefixClasses * vocabulary.cellCount > 0x7fffffff) throw new RangeError('prefixClasses must fit the signed cache index domain');

  const maxTerms = vocabulary.lineCount;
  const scratchReduced = new Uint16Array(maxTerms);
  const scratchUnchanged = new Uint16Array(maxTerms);
  const scratchSurvivor = new Uint16Array(maxTerms);
  const scratchResult = new Uint16Array(maxTerms);

  let classCount = 0;
  let classCapacity = 1024;
  let termCapacity = 4096;
  let termCount = 0;
  let starts = new Uint32Array(classCapacity);
  let lengths = new Uint16Array(classCapacity);
  let hashes = new Uint32Array(classCapacity);
  let singletonLo = new Uint32Array(classCapacity);
  let singletonHi = new Uint32Array(classCapacity);
  let flatIds = new Uint16Array(termCapacity);
  let hashSlots = new Int32Array(2048);
  hashSlots.fill(-1);

  const ownTransitions = new Int32Array(prefixClasses * vocabulary.cellCount);
  const blockTransitions = new Int32Array(prefixClasses * vocabulary.cellCount);
  ownTransitions.fill(CLASS_UNKNOWN);
  blockTransitions.fill(CLASS_UNKNOWN);

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
    termGrows: 0,
    hashGrows: 0,
    outOfPrefixOwn: 0,
    outOfPrefixBlock: 0,
    cachedStores: 0,
  };

  function ensureClassCapacity(required) {
    if (required <= classCapacity) return;
    const next = nextPowerOfTwo(required);
    const grow = (Type, source) => { const target = new Type(next); target.set(source); return target; };
    const nextStarts = grow(Uint32Array, starts);
    const nextLengths = grow(Uint16Array, lengths);
    const nextHashes = grow(Uint32Array, hashes);
    const nextLo = grow(Uint32Array, singletonLo);
    const nextHi = grow(Uint32Array, singletonHi);
    starts = nextStarts;
    lengths = nextLengths;
    hashes = nextHashes;
    singletonLo = nextLo;
    singletonHi = nextHi;
    classCapacity = next;
    metrics.classGrows += 1;
  }

  function ensureTermCapacity(required) {
    if (required <= termCapacity) return;
    const next = nextPowerOfTwo(required);
    const target = new Uint16Array(next);
    target.set(flatIds);
    flatIds = target;
    termCapacity = next;
    metrics.termGrows += 1;
  }

  function classEquals(id, ids, count) {
    if (lengths[id] !== count) return false;
    const start = starts[id];
    for (let index = 0; index < count; index += 1) if (flatIds[start + index] !== ids[index]) return false;
    return true;
  }

  function growHash() {
    if (hashSlots.length >= 2 ** 30) throw new RangeError('prefix-pool hash capacity exhausted');
    const next = new Int32Array(hashSlots.length * 2);
    next.fill(-1);
    const mask = next.length - 1;
    for (let id = 0; id < classCount; id += 1) {
      let slot = hashes[id] & mask;
      while (next[slot] !== -1) slot = (slot + 1) & mask;
      next[slot] = id;
    }
    hashSlots = next;
    metrics.hashGrows += 1;
  }

  function internIds(ids, count) {
    if (!(ids instanceof Uint16Array) || !Number.isInteger(count) || count < 0 || count > ids.length || count > maxTerms) throw new RangeError('invalid prefix term sequence');
    for (let i = 0; i < count; i += 1) {
      if (ids[i] >= vocabulary.count || (i > 0 && ids[i - 1] >= ids[i])) throw new Error('prefix term sequence must be strictly ordered vocabulary IDs');
    }
    metrics.internLookups += 1;
    if ((classCount + 1) * 10 >= hashSlots.length * 7) growHash();
    const hash = hashIds(ids, count);
    const mask = hashSlots.length - 1;
    let slot = hash & mask;
    while (true) {
      const id = hashSlots[slot];
      if (id === -1) break;
      if (hashes[id] === hash && classEquals(id, ids, count)) {
        metrics.internHits += 1;
        return id;
      }
      slot = (slot + 1) & mask;
    }

    ensureClassCapacity(classCount + 1);
    ensureTermCapacity(termCount + count);
    const id = classCount;
    const start = termCount;
    let singlesLo = 0;
    let singlesHi = 0;
    for (let index = 0; index < count; index += 1) {
      const termId = ids[index];
      flatIds[termCount++] = termId;
      if (vocabulary.cardinality[termId] === 1) {
        singlesLo = (singlesLo | vocabulary.lo[termId]) >>> 0;
        singlesHi = (singlesHi | vocabulary.hi[termId]) >>> 0;
      }
    }
    starts[id] = start;
    lengths[id] = count;
    hashes[id] = hash;
    singletonLo[id] = singlesLo;
    singletonHi[id] = singlesHi;
    hashSlots[slot] = id;
    classCount += 1;
    metrics.internMisses += 1;
    return id;
  }

  const emptyClass = internIds(new Uint16Array(0), 0);
  const initialClass = internIds(vocabulary.initialIds, vocabulary.initialIds.length);
  if (emptyClass !== 0 || initialClass !== 1) throw new Error('prefix term-ID bootstrap IDs drifted');
  if (pool.emptyClass !== emptyClass || pool.initialClass !== initialClass) throw new Error('prefix term-ID bootstrap does not match base q IDs');

  function cacheGet(cache, id, cell, kind) {
    assertClass(id);
    if (!Number.isInteger(cell) || cell < 0 || cell >= vocabulary.cellCount) throw new RangeError('invalid prefix transition cell');
    if (id >= prefixClasses) {
      if (kind === 'own') metrics.outOfPrefixOwn += 1;
      else metrics.outOfPrefixBlock += 1;
      return CLASS_UNKNOWN;
    }
    const cached = cache[id * vocabulary.cellCount + cell];
    if (cached !== CLASS_UNKNOWN && cached !== CLASS_TERMINAL_WIN) assertClass(cached);
    if (kind === 'block' && cached === CLASS_TERMINAL_WIN) throw new Error('block transition cannot create a win');
    return cached;
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
  function assertClass(id) {
    if (!Number.isInteger(id) || id < 0 || id >= classCount) throw new RangeError(`invalid prefix class ${id}`);
  }
  pool.isEmpty = (id) => { assertClass(id); return lengths[id] === 0; };
  pool.hasSingletonAt = (id, bitLo, bitHi) => {
    assertClass(id);
    if (!Number.isInteger(bitLo) || bitLo < 0 || bitLo > 0xffffffff || !Number.isInteger(bitHi) || bitHi < 0 || bitHi > 0xffffffff) throw new RangeError('prefix singleton masks must be Uint32');
    return (((singletonLo[id] & bitLo) >>> 0) !== 0) || (((singletonHi[id] & bitHi) >>> 0) !== 0);
  };
  pool.terms = function termsForQualification(id) {
    assertClass(id);
    const result = [];
    const start = starts[id];
    for (let index = 0; index < lengths[id]; index += 1) {
      const termId = flatIds[start + index];
      result.push([vocabulary.lo[termId] >>> 0, vocabulary.hi[termId] >>> 0]);
    }
    return result;
  };
  pool.termIds = (id) => { assertClass(id); return flatIds.slice(starts[id], starts[id] + lengths[id]); };
  pool.researchStorageView = function researchStorageView() {
    return Object.freeze({
      classCount,
      termCount,
      starts,
      lengths,
      flatIds,
    });
  };

  pool.ownTransition = function ownTransitionPrefix(id, cell) {
    const cached = cacheGet(ownTransitions, id, cell, 'own');
    if (cached !== CLASS_UNKNOWN) {
      metrics.ownTransitionHits += 1;
      return cached;
    }
    metrics.ownTransitionMisses += 1;

    const start = starts[id];
    const count = lengths[id];
    let reducedCount = 0;
    let unchangedCount = 0;
    for (let index = 0; index < count; index += 1) {
      const termId = flatIds[start + index];
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

  pool.blockTransition = function blockTransitionPrefix(id, cell) {
    const cached = cacheGet(blockTransitions, id, cell, 'block');
    if (cached !== CLASS_UNKNOWN) {
      metrics.blockTransitionHits += 1;
      return cached;
    }
    metrics.blockTransitionMisses += 1;

    const start = starts[id];
    const count = lengths[id];
    let resultCount = 0;
    for (let index = 0; index < count; index += 1) {
      const termId = flatIds[start + index];
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

  pool.memoryStats = function prefixTermIdMemoryStats() {
    const scratchBytes = scratchReduced.byteLength + scratchUnchanged.byteLength + scratchSurvivor.byteLength + scratchResult.byteLength;
    const classMetadataBytes = starts.byteLength + lengths.byteLength + hashes.byteLength + singletonLo.byteLength + singletonHi.byteLength;
    const classTermBytes = flatIds.byteLength;
    const transitionCacheBytes = ownTransitions.byteLength + blockTransitions.byteLength;
    return Object.freeze({
      classCount,
      residualTerms: termCount,
      termVocabularyCount: vocabulary.count,
      vocabularyBytes: vocabulary.bytes,
      classMetadataBytes,
      classTermBytes,
      logicalClassTermBytes: termCount * Uint16Array.BYTES_PER_ELEMENT,
      transitionCacheKind: 'dense-prefix',
      transitionPrefixClasses: prefixClasses,
      transitionCacheBytes,
      hashSlotBytes: hashSlots.byteLength,
      scratchBytes,
      totalTypedBytes: vocabulary.bytes + classMetadataBytes + classTermBytes + transitionCacheBytes + hashSlots.byteLength + scratchBytes,
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

  return Object.freeze({ vocabulary, prefixClasses, metrics, memoryStats: pool.memoryStats });
}
