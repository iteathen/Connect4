import { createScaledTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-scaled-term-id-kernel.mjs';

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

function hashStateTriple(supportIndex, p0Class, p1Class) {
  let hash = mix32(supportIndex + 0x9e3779b9);
  hash = mix32(hash ^ Math.imul((p0Class + 1) >>> 0, 0x85ebca6b));
  hash = mix32(hash ^ Math.imul((p1Class + 1) >>> 0, 0xc2b2ae35));
  return hash >>> 0;
}

function fingerprint16(hash) {
  return ((hash ^ (hash >>> 16)) & 0xffff) >>> 0;
}

function installStateHash16(states) {
  const originalHashBytes = states.hashes?.byteLength ?? 0;
  const fingerprints = new Uint16Array(states.capacity);
  for (let id = 0; id < states.count; id += 1) {
    fingerprints[id] = fingerprint16(hashStateTriple(states.support[id], states.p0Class[id], states.p1Class[id]));
  }
  states.hashes = fingerprints;

  states._ensureStateCapacity = function ensureStateCapacityHash16(required) {
    if (required <= this.capacity) return;
    const nextCapacity = nextPowerOfTwo(required);
    const copy = (Type, source) => {
      const target = new Type(nextCapacity);
      target.set(source);
      return target;
    };
    this.support = copy(Uint32Array, this.support);
    this.p0Class = copy(Uint32Array, this.p0Class);
    this.p1Class = copy(Uint32Array, this.p1Class);
    this.lower = copy(Int8Array, this.lower);
    this.upper = copy(Int8Array, this.upper);
    const best = new Int8Array(nextCapacity);
    best.fill(-1);
    best.set(this.bestMove);
    this.bestMove = best;
    this.hashes = copy(Uint16Array, this.hashes);
    if (this.cacheEdges) {
      const edges = new Int32Array(nextCapacity * this.columns);
      edges.fill(-3);
      edges.set(this.edges);
      this.edges = edges;
    }
    this.capacity = nextCapacity;
    this.metrics.stateGrows += 1;
  };

  states._growHash = function growStateHashHash16() {
    const next = new Int32Array(this.hashSlots.length * 2);
    next.fill(-1);
    const mask = next.length - 1;
    for (let id = 0; id < this.count; id += 1) {
      const hash = hashStateTriple(this.support[id], this.p0Class[id], this.p1Class[id]);
      let slot = hash & mask;
      while (next[slot] !== -1) slot = (slot + 1) & mask;
      next[slot] = id;
      this.hashes[id] = fingerprint16(hash);
    }
    this.hashSlots = next;
    this.metrics.hashGrows += 1;
  };

  states.intern = function internStateHash16(supportIndex, p0Class, p1Class) {
    this.metrics.internLookups += 1;
    if ((this.count + 1) * 10 >= this.hashSlots.length * 7) this._growHash();
    const hash = hashStateTriple(supportIndex, p0Class, p1Class);
    const fp = fingerprint16(hash);
    const mask = this.hashSlots.length - 1;
    let slot = hash & mask;
    while (true) {
      const id = this.hashSlots[slot];
      if (id === -1) break;
      if (this.hashes[id] === fp
          && this.support[id] === supportIndex
          && this.p0Class[id] === p0Class
          && this.p1Class[id] === p1Class) {
        this.metrics.internHits += 1;
        return id;
      }
      slot = (slot + 1) & mask;
    }

    const id = this.count;
    this._ensureStateCapacity(id + 1);
    this.support[id] = supportIndex;
    this.p0Class[id] = p0Class;
    this.p1Class[id] = p1Class;
    this.lower[id] = -1;
    this.upper[id] = 1;
    this.bestMove[id] = -1;
    this.hashes[id] = fp;
    if (this.edges) {
      const start = id * this.columns;
      this.edges.fill(-3, start, start + this.columns);
    }
    this.hashSlots[slot] = id;
    this.count += 1;
    this.metrics.internMisses += 1;
    return id;
  };

  states.memoryStats = function hash16MemoryStats() {
    const stateBytes = this.support.byteLength
      + this.p0Class.byteLength
      + this.p1Class.byteLength
      + this.lower.byteLength
      + this.upper.byteLength
      + this.bestMove.byteLength
      + this.hashes.byteLength;
    return Object.freeze({
      stateCount: this.count,
      stateCapacity: this.capacity,
      stateArrayBytes: stateBytes,
      edgeCacheBytes: this.edges?.byteLength ?? 0,
      hashSlotBytes: this.hashSlots.byteLength,
      storedHashBytes: this.hashes.byteLength,
      hashBits: 16,
      originalHashBytesAtInstall: originalHashBytes,
      totalTypedBytes: stateBytes + (this.edges?.byteLength ?? 0) + this.hashSlots.byteLength,
    });
  };

  return Object.freeze({ originalHashBytesAtInstall: originalHashBytes });
}

export function createHash16ScaledQuotientKernel(spec, options = {}) {
  const wrap = createScaledTermIdQuotientNativeNegamaxKernel(spec, options);
  const stateHash = installStateHash16(wrap.kernel.states);
  return Object.freeze({ ...wrap, stateHash });
}
