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

export function installOnlineOnlyStateStorage(states) {
  if (!states || !(states.support instanceof Uint32Array)
      || !(states.p0Class instanceof Uint32Array)
      || !(states.p1Class instanceof Uint32Array)
      || !(states.hashes instanceof Uint32Array)) {
    throw new TypeError('online-only state storage requires the quotient state pool');
  }
  if (!(states.lower instanceof Int8Array)
      || !(states.upper instanceof Int8Array)
      || !(states.bestMove instanceof Int8Array)) {
    throw new Error('online-only state storage was already installed or local proof arrays are unavailable');
  }

  const localProofBytesAtInstall = states.lower.byteLength
    + states.upper.byteLength
    + states.bestMove.byteLength;
  const bytesPerStateAvoided = Int8Array.BYTES_PER_ELEMENT * 3;

  states.lower = null;
  states.upper = null;
  states.bestMove = null;

  states._ensureStateCapacity = function ensureOnlineStateCapacity(required) {
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
    this.hashes = copy(Uint32Array, this.hashes);
    if (this.cacheEdges) {
      const edges = new Int32Array(nextCapacity * this.columns);
      edges.fill(-3);
      edges.set(this.edges);
      this.edges = edges;
    }
    this.capacity = nextCapacity;
    this.metrics.stateGrows += 1;
  };

  states.intern = function internOnlineState(supportIndex, p0Class, p1Class) {
    this.metrics.internLookups += 1;
    if ((this.count + 1) * 10 >= this.hashSlots.length * 7) this._growHash();
    const hash = hashStateTriple(supportIndex, p0Class, p1Class);
    const mask = this.hashSlots.length - 1;
    let slot = hash & mask;
    while (true) {
      const id = this.hashSlots[slot];
      if (id === -1) break;
      if (this.hashes[id] === hash
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
    this.hashes[id] = hash;
    if (this.edges) {
      const start = id * this.columns;
      this.edges.fill(-3, start, start + this.columns);
    }
    this.hashSlots[slot] = id;
    this.count += 1;
    this.metrics.internMisses += 1;
    return id;
  };

  states.memoryStats = function onlineStateMemoryStats() {
    const stateBytes = this.support.byteLength
      + this.p0Class.byteLength
      + this.p1Class.byteLength
      + this.hashes.byteLength;
    return Object.freeze({
      stateCount: this.count,
      stateCapacity: this.capacity,
      stateArrayBytes: stateBytes,
      edgeCacheBytes: this.edges?.byteLength ?? 0,
      hashSlotBytes: this.hashSlots.byteLength,
      localProofBytes: 0,
      localProofBytesAvoided: this.capacity * bytesPerStateAvoided,
      bytesPerStateAvoided,
      totalTypedBytes: stateBytes + (this.edges?.byteLength ?? 0) + this.hashSlots.byteLength,
    });
  };

  function stats() {
    return Object.freeze({
      kind: 'connect4-online-only-state-storage-v1',
      stateCount: states.count,
      stateCapacity: states.capacity,
      bytesPerStateAvoided,
      localProofBytesAtInstall,
      localProofBytesRetained: 0,
      localProofBytesAvoided: states.capacity * bytesPerStateAvoided,
    });
  }

  return Object.freeze({ stats });
}
