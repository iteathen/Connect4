import { createQuotientNativeNegamaxKernel } from './quotient-native-negamax-kernel.mjs';

const CLASS_UNKNOWN = -3;
const CLASS_TERMINAL_WIN = -1;
const HASH_SEED = 0x811c9dc5;
const HASH_PRIME = 0x01000193;

function popcount32(value) {
  let x = value >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

function pairSubsetRaw(aLo, aHi, bLo, bHi) {
  return (((aLo & ~bLo) >>> 0) === 0) && (((aHi & ~bHi) >>> 0) === 0);
}

function comparePairRaw(aLo, aHi, bLo, bHi) {
  const countDelta = (popcount32(aLo) + popcount32(aHi)) - (popcount32(bLo) + popcount32(bHi));
  if (countDelta !== 0) return countDelta;
  const ah = aHi >>> 0;
  const bh = bHi >>> 0;
  if (ah !== bh) return ah < bh ? -1 : 1;
  const al = aLo >>> 0;
  const bl = bLo >>> 0;
  return al === bl ? 0 : al < bl ? -1 : 1;
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

function hashStep(hash, lo, hi) {
  let next = Math.imul(hash ^ mix32(lo), HASH_PRIME) >>> 0;
  next = Math.imul(next ^ mix32(hi), HASH_PRIME) >>> 0;
  return next;
}

function finalizeHash(hash, count) {
  return mix32(hash ^ count);
}

function installCoverageFusedTransitions(kernel) {
  const pool = kernel.classes;
  const maxTerms = Math.max(1, pool.lengths[pool.initialClass]);
  const reducedLo = new Uint32Array(maxTerms);
  const reducedHi = new Uint32Array(maxTerms);
  const unchangedLo = new Uint32Array(maxTerms);
  const unchangedHi = new Uint32Array(maxTerms);
  const survivorLo = new Uint32Array(maxTerms);
  const survivorHi = new Uint32Array(maxTerms);
  const resultLo = new Uint32Array(maxTerms);
  const resultHi = new Uint32Array(maxTerms);
  const coverageLo = [];
  const coverageHi = [];

  const metrics = {
    ownCoverageNoop: 0,
    blockCoverageNoop: 0,
    ownTerminal: 0,
    ownMisses: 0,
    blockMisses: 0,
    crossDominanceChecks: 0,
    internLookups: 0,
    internHits: 0,
    internMisses: 0,
    fusedHashes: 0,
  };

  function computeCoverage(id) {
    const start = pool.starts[id];
    const length = pool.lengths[id];
    let lo = 0;
    let hi = 0;
    for (let index = 0; index < length; index += 1) {
      lo = (lo | pool.flatLo[start + index]) >>> 0;
      hi = (hi | pool.flatHi[start + index]) >>> 0;
    }
    coverageLo[id] = lo;
    coverageHi[id] = hi;
  }

  for (let id = 0; id < pool.size; id += 1) computeCoverage(id);

  function classEqualsRaw(id, lo, hi, count) {
    if (pool.lengths[id] !== count) return false;
    const start = pool.starts[id];
    for (let index = 0; index < count; index += 1) {
      if ((pool.flatLo[start + index] >>> 0) !== (lo[index] >>> 0)) return false;
      if ((pool.flatHi[start + index] >>> 0) !== (hi[index] >>> 0)) return false;
    }
    return true;
  }

  function internCanonicalRaw(lo, hi, count, hash) {
    metrics.internLookups += 1;
    pool.metrics.internLookups += 1;
    if ((pool.size + 1) * 10 >= pool.hashSlots.length * 7) pool._growHash();
    const mask = pool.hashSlots.length - 1;
    let slot = hash & mask;
    while (true) {
      const id = pool.hashSlots[slot];
      if (id === -1) break;
      if (pool.hashes[id] === hash && classEqualsRaw(id, lo, hi, count)) {
        metrics.internHits += 1;
        pool.metrics.internHits += 1;
        return id;
      }
      slot = (slot + 1) & mask;
    }

    const id = pool.size;
    const start = pool.flatLo.length;
    let singletonLo = 0;
    let singletonHi = 0;
    let unionLo = 0;
    let unionHi = 0;
    for (let index = 0; index < count; index += 1) {
      const termLo = lo[index] >>> 0;
      const termHi = hi[index] >>> 0;
      pool.flatLo.push(termLo);
      pool.flatHi.push(termHi);
      unionLo = (unionLo | termLo) >>> 0;
      unionHi = (unionHi | termHi) >>> 0;
      if (popcount32(termLo) + popcount32(termHi) === 1) {
        singletonLo = (singletonLo | termLo) >>> 0;
        singletonHi = (singletonHi | termHi) >>> 0;
      }
    }
    pool.starts.push(start);
    pool.lengths.push(count);
    pool.hashes.push(hash);
    pool.singletonLo.push(singletonLo >>> 0);
    pool.singletonHi.push(singletonHi >>> 0);
    coverageLo[id] = unionLo;
    coverageHi[id] = unionHi;
    pool.hashSlots[slot] = id;
    pool.metrics.internMisses += 1;
    metrics.internMisses += 1;
    pool._ensureTransitionCapacity(pool.size);
    return id;
  }

  pool.ownTransition = function ownTransitionCoverage(id, cell, bitLo, bitHi) {
    const cacheIndex = id * this.cellCount + cell;
    const cached = this.ownTransitions[cacheIndex];
    if (cached !== CLASS_UNKNOWN) {
      this.metrics.ownTransitionHits += 1;
      return cached;
    }
    this.metrics.ownTransitionMisses += 1;
    metrics.ownMisses += 1;

    if ((((coverageLo[id] & bitLo) >>> 0) === 0) && (((coverageHi[id] & bitHi) >>> 0) === 0)) {
      this.ownTransitions[cacheIndex] = id;
      metrics.ownCoverageNoop += 1;
      return id;
    }

    const start = this.starts[id];
    const length = this.lengths[id];
    let reducedCount = 0;
    let unchangedCount = 0;
    for (let index = 0; index < length; index += 1) {
      const lo = this.flatLo[start + index] >>> 0;
      const hi = this.flatHi[start + index] >>> 0;
      const contains = (((lo & bitLo) >>> 0) !== 0) || (((hi & bitHi) >>> 0) !== 0);
      if (!contains) {
        unchangedLo[unchangedCount] = lo;
        unchangedHi[unchangedCount] = hi;
        unchangedCount += 1;
        continue;
      }
      const nextLo = (lo & ~bitLo) >>> 0;
      const nextHi = (hi & ~bitHi) >>> 0;
      if (nextLo === 0 && nextHi === 0) {
        this.ownTransitions[cacheIndex] = CLASS_TERMINAL_WIN;
        metrics.ownTerminal += 1;
        return CLASS_TERMINAL_WIN;
      }
      reducedLo[reducedCount] = nextLo;
      reducedHi[reducedCount] = nextHi;
      reducedCount += 1;
    }

    let survivorCount = 0;
    outer: for (let u = 0; u < unchangedCount; u += 1) {
      const uLo = unchangedLo[u];
      const uHi = unchangedHi[u];
      for (let r = 0; r < reducedCount; r += 1) {
        metrics.crossDominanceChecks += 1;
        if (pairSubsetRaw(reducedLo[r], reducedHi[r], uLo, uHi)) continue outer;
      }
      survivorLo[survivorCount] = uLo;
      survivorHi[survivorCount] = uHi;
      survivorCount += 1;
    }

    let r = 0;
    let u = 0;
    let resultCount = 0;
    let hash = HASH_SEED;
    while (r < reducedCount || u < survivorCount) {
      let lo;
      let hi;
      if (r >= reducedCount) {
        lo = survivorLo[u];
        hi = survivorHi[u];
        u += 1;
      } else if (u >= survivorCount) {
        lo = reducedLo[r];
        hi = reducedHi[r];
        r += 1;
      } else if (comparePairRaw(reducedLo[r], reducedHi[r], survivorLo[u], survivorHi[u]) <= 0) {
        lo = reducedLo[r];
        hi = reducedHi[r];
        r += 1;
      } else {
        lo = survivorLo[u];
        hi = survivorHi[u];
        u += 1;
      }
      resultLo[resultCount] = lo;
      resultHi[resultCount] = hi;
      hash = hashStep(hash, lo, hi);
      resultCount += 1;
    }

    metrics.fusedHashes += 1;
    const result = internCanonicalRaw(resultLo, resultHi, resultCount, finalizeHash(hash, resultCount));
    this.ownTransitions[cacheIndex] = result;
    return result;
  };

  pool.blockTransition = function blockTransitionCoverage(id, cell, bitLo, bitHi) {
    const cacheIndex = id * this.cellCount + cell;
    const cached = this.blockTransitions[cacheIndex];
    if (cached !== CLASS_UNKNOWN) {
      this.metrics.blockTransitionHits += 1;
      return cached;
    }
    this.metrics.blockTransitionMisses += 1;
    metrics.blockMisses += 1;

    if ((((coverageLo[id] & bitLo) >>> 0) === 0) && (((coverageHi[id] & bitHi) >>> 0) === 0)) {
      this.blockTransitions[cacheIndex] = id;
      metrics.blockCoverageNoop += 1;
      return id;
    }

    const start = this.starts[id];
    const length = this.lengths[id];
    let resultCount = 0;
    let hash = HASH_SEED;
    for (let index = 0; index < length; index += 1) {
      const lo = this.flatLo[start + index] >>> 0;
      const hi = this.flatHi[start + index] >>> 0;
      const contains = (((lo & bitLo) >>> 0) !== 0) || (((hi & bitHi) >>> 0) !== 0);
      if (contains) continue;
      resultLo[resultCount] = lo;
      resultHi[resultCount] = hi;
      hash = hashStep(hash, lo, hi);
      resultCount += 1;
    }
    metrics.fusedHashes += 1;
    const result = internCanonicalRaw(resultLo, resultHi, resultCount, finalizeHash(hash, resultCount));
    this.blockTransitions[cacheIndex] = result;
    return result;
  };

  return Object.freeze({
    metrics,
    coverageLo,
    coverageHi,
    scratchBytes: maxTerms * 8 * Uint32Array.BYTES_PER_ELEMENT,
  });
}

export function createFast2QuotientNativeNegamaxKernel(spec, options = {}) {
  const kernel = createQuotientNativeNegamaxKernel(spec, options);
  const specialization = installCoverageFusedTransitions(kernel);
  return Object.freeze({ kernel, specialization });
}
