import { FRONTIER_SLOTS, FRONTIER_WORDS, ISOMETRIC_PROFILE, SLOT_WORDS } from './profile.mjs';

export const RESIDUAL_TERMINAL_WIN = -1;
const CLASS_UNKNOWN = -3;

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
  return mix32(hash ^ SLOT_WORDS);
}

function hashChunkTuple(ids) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < FRONTIER_SLOTS; index += 1) {
    hash = Math.imul(hash ^ mix32((ids[index] + 1) >>> 0), 0x01000193) >>> 0;
  }
  return mix32(hash ^ FRONTIER_SLOTS);
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
    this.words = new Uint32Array(this.capacity * SLOT_WORDS);
    this.hashSlots = new Int32Array(512);
    this.hashSlots.fill(-1);
  }

  ensureCapacity(required) {
    if (required <= this.capacity) return;
    const next = nextPowerOfTwo(required);
    const target = new Uint32Array(next * SLOT_WORDS);
    target.set(this.words);
    this.words = target;
    this.capacity = next;
  }

  equals(id, source, offset) {
    const base = id * SLOT_WORDS;
    return this.words[base] === (source[offset] >>> 0)
      && this.words[base + 1] === (source[offset + 1] >>> 0);
  }

  growHash() {
    const next = new Int32Array(this.hashSlots.length * 2);
    next.fill(-1);
    const mask = next.length - 1;
    for (let id = 0; id < this.count; id += 1) {
      const hash = hashWords2(this.words, id * SLOT_WORDS);
      let slot = hash & mask;
      while (next[slot] !== -1) slot = (slot + 1) & mask;
      next[slot] = id;
    }
    this.hashSlots = next;
  }

  intern(source, offset) {
    if ((this.count + 1) * 10 >= this.hashSlots.length * 7) this.growHash();
    const hash = hashWords2(source, offset);
    const mask = this.hashSlots.length - 1;
    let slot = hash & mask;
    while (true) {
      const id = this.hashSlots[slot];
      if (id === -1) break;
      if (this.equals(id, source, offset)) return id;
      slot = (slot + 1) & mask;
    }
    this.ensureCapacity(this.count + 1);
    const id = this.count;
    const base = id * SLOT_WORDS;
    this.words[base] = source[offset] >>> 0;
    this.words[base + 1] = source[offset + 1] >>> 0;
    this.hashSlots[slot] = id;
    this.count += 1;
    return id;
  }

  copyTo(id, target, offset) {
    const base = id * SLOT_WORDS;
    target[offset] = this.words[base];
    target[offset + 1] = this.words[base + 1];
  }

  word(id, localWord) {
    return this.words[id * SLOT_WORDS + localWord] >>> 0;
  }
}

export class ResidualPool {
  constructor({ transitionPrefixClasses = 4096 } = {}) {
    if (!Number.isInteger(transitionPrefixClasses) || transitionPrefixClasses < 1) {
      throw new RangeError('transitionPrefixClasses must be a positive integer');
    }
    this.profile = ISOMETRIC_PROFILE;
    this.transitionPrefixClasses = transitionPrefixClasses;
    this.slotPools = Array.from({ length: FRONTIER_SLOTS }, (_, slot) => new SlotChunkPool64(slot));

    this.classCount = 0;
    this.classCapacity = 1024;
    this.classSlotIds = Array.from({ length: FRONTIER_SLOTS }, () => new Uint8Array(this.classCapacity));
    this.classHashes = new Uint32Array(this.classCapacity);
    this.singletonLo = new Uint32Array(this.classCapacity);
    this.singletonHi = new Uint32Array(this.classCapacity);
    this.classHashSlots = new Int32Array(2048);
    this.classHashSlots.fill(-1);

    const cacheSize = transitionPrefixClasses * this.profile.cellCount;
    this.ownTransitions = new Int32Array(cacheSize);
    this.blockTransitions = new Int32Array(cacheSize);
    this.ownTransitions.fill(CLASS_UNKNOWN);
    this.blockTransitions.fill(CLASS_UNKNOWN);

    this.inputBits = new Uint32Array(FRONTIER_WORDS);
    this.resultBits = new Uint32Array(FRONTIER_WORDS);
    this.reducedBits = new Uint32Array(FRONTIER_WORDS);
    this.reflectBits = new Uint32Array(FRONTIER_WORDS);
    this.chunkIds = new Uint32Array(FRONTIER_SLOTS);
    this.reflectionCache = new Int32Array(this.classCapacity);
    this.reflectionCache.fill(CLASS_UNKNOWN);

    const initialBits = new Uint32Array(FRONTIER_WORDS);
    for (const termId of this.profile.initialIds) initialBits[termId >>> 5] |= 1 << (termId & 31);
    this.emptyClass = this.internBits(new Uint32Array(FRONTIER_WORDS));
    this.initialClass = this.internBits(initialBits);
    if (this.emptyClass !== 0 || this.initialClass !== 1) throw new Error('residual bootstrap IDs drifted');
  }

  ensureReferenceWidth(slot, requiredId) {
    const current = this.classSlotIds[slot];
    const Type = referenceTypeFor(requiredId);
    if (current.BYTES_PER_ELEMENT >= Type.BYTES_PER_ELEMENT) return;
    const widened = new Type(this.classCapacity);
    widened.set(current);
    this.classSlotIds[slot] = widened;
  }

  ensureClassCapacity(required) {
    if (required <= this.classCapacity) return;
    const next = nextPowerOfTwo(required);
    for (let slot = 0; slot < FRONTIER_SLOTS; slot += 1) {
      const Type = this.classSlotIds[slot].constructor;
      const target = new Type(next);
      target.set(this.classSlotIds[slot]);
      this.classSlotIds[slot] = target;
    }
    const growU32 = (source) => { const target = new Uint32Array(next); target.set(source); return target; };
    this.classHashes = growU32(this.classHashes);
    this.singletonLo = growU32(this.singletonLo);
    this.singletonHi = growU32(this.singletonHi);
    const reflected = new Int32Array(next);
    reflected.fill(CLASS_UNKNOWN);
    reflected.set(this.reflectionCache);
    this.reflectionCache = reflected;
    this.classCapacity = next;
  }

  classEquals(id, ids) {
    for (let slot = 0; slot < FRONTIER_SLOTS; slot += 1) {
      if (this.classSlotIds[slot][id] !== ids[slot]) return false;
    }
    return true;
  }

  growClassHash() {
    const next = new Int32Array(this.classHashSlots.length * 2);
    next.fill(-1);
    const mask = next.length - 1;
    for (let id = 0; id < this.classCount; id += 1) {
      let slot = this.classHashes[id] & mask;
      while (next[slot] !== -1) slot = (slot + 1) & mask;
      next[slot] = id;
    }
    this.classHashSlots = next;
  }

  loadClassBits(id, target) {
    this.assertClass(id);
    for (let slot = 0; slot < FRONTIER_SLOTS; slot += 1) {
      this.slotPools[slot].copyTo(this.classSlotIds[slot][id], target, slot * SLOT_WORDS);
    }
    return target;
  }

  computeSingletonMasks(bits, id) {
    let lo = 0;
    let hi = 0;
    const p = this.profile;
    for (let word = 0; word < FRONTIER_WORDS; word += 1) {
      let active = (bits[word] & p.singletonTermMasks[word]) >>> 0;
      while (active !== 0) {
        const lsb = (active & -active) >>> 0;
        const termId = (word << 5) + bitIndex32(lsb);
        lo = (lo | p.lo[termId]) >>> 0;
        hi = (hi | p.hi[termId]) >>> 0;
        active = (active & (active - 1)) >>> 0;
      }
    }
    this.singletonLo[id] = lo;
    this.singletonHi[id] = hi;
  }

  internBits(bits, parentId = -1) {
    let sameAsParent = parentId >= 0;
    for (let slot = 0; slot < FRONTIER_SLOTS; slot += 1) {
      const offset = slot * SLOT_WORDS;
      if (parentId >= 0) {
        const parentChunk = this.classSlotIds[slot][parentId];
        if (this.slotPools[slot].equals(parentChunk, bits, offset)) {
          this.chunkIds[slot] = parentChunk;
          continue;
        }
        sameAsParent = false;
      }
      this.chunkIds[slot] = this.slotPools[slot].intern(bits, offset);
    }
    if (sameAsParent) return parentId;

    if ((this.classCount + 1) * 10 >= this.classHashSlots.length * 7) this.growClassHash();
    const hash = hashChunkTuple(this.chunkIds);
    const mask = this.classHashSlots.length - 1;
    let slot = hash & mask;
    while (true) {
      const id = this.classHashSlots[slot];
      if (id === -1) break;
      if (this.classHashes[id] === hash && this.classEquals(id, this.chunkIds)) return id;
      slot = (slot + 1) & mask;
    }

    for (let chunk = 0; chunk < FRONTIER_SLOTS; chunk += 1) this.ensureReferenceWidth(chunk, this.chunkIds[chunk]);
    this.ensureClassCapacity(this.classCount + 1);
    const id = this.classCount;
    for (let chunk = 0; chunk < FRONTIER_SLOTS; chunk += 1) this.classSlotIds[chunk][id] = this.chunkIds[chunk];
    this.classHashes[id] = hash;
    this.computeSingletonMasks(bits, id);
    this.classHashSlots[slot] = id;
    this.classCount += 1;
    return id;
  }

  cacheIndex(id, cell) {
    return id < this.transitionPrefixClasses ? id * this.profile.cellCount + cell : -1;
  }

  ownTransition(id, cell) {
    this.assertClass(id);
    this.assertCell(cell);
    const cacheIndex = this.cacheIndex(id, cell);
    if (cacheIndex >= 0) {
      const cached = this.ownTransitions[cacheIndex];
      if (cached !== CLASS_UNKNOWN) return cached;
    }

    const bitLo = cell < 32 ? ((2 ** cell) >>> 0) : 0;
    const bitHi = cell >= 32 ? ((2 ** (cell - 32)) >>> 0) : 0;
    if ((((this.singletonLo[id] & bitLo) >>> 0) !== 0) || (((this.singletonHi[id] & bitHi) >>> 0) !== 0)) {
      if (cacheIndex >= 0) this.ownTransitions[cacheIndex] = RESIDUAL_TERMINAL_WIN;
      return RESIDUAL_TERMINAL_WIN;
    }

    const p = this.profile;
    this.loadClassBits(id, this.inputBits);
    this.reducedBits.fill(0);
    let affected = false;
    const containsBase = cell * FRONTIER_WORDS;
    for (let word = 0; word < FRONTIER_WORDS; word += 1) {
      const input = this.inputBits[word] >>> 0;
      let active = (input & p.containsMasks[containsBase + word]) >>> 0;
      this.resultBits[word] = (input & ~p.containsMasks[containsBase + word]) >>> 0;
      if (active !== 0) affected = true;
      while (active !== 0) {
        const lsb = (active & -active) >>> 0;
        const termId = (word << 5) + bitIndex32(lsb);
        const target = p.reduce[termId * p.cellCount + cell];
        if (target === p.terminal) {
          if (cacheIndex >= 0) this.ownTransitions[cacheIndex] = RESIDUAL_TERMINAL_WIN;
          return RESIDUAL_TERMINAL_WIN;
        }
        this.reducedBits[target >>> 5] |= 1 << (target & 31);
        active = (active & (active - 1)) >>> 0;
      }
    }
    if (!affected) {
      if (cacheIndex >= 0) this.ownTransitions[cacheIndex] = id;
      return id;
    }

    for (let word = 0; word < FRONTIER_WORDS; word += 1) {
      this.resultBits[word] = (this.resultBits[word] | this.reducedBits[word]) >>> 0;
    }
    for (let word = 0; word < FRONTIER_WORDS; word += 1) {
      let active = this.reducedBits[word] >>> 0;
      while (active !== 0) {
        const lsb = (active & -active) >>> 0;
        const termId = (word << 5) + bitIndex32(lsb);
        const start = p.strictSupersetStarts[termId];
        const end = p.strictSupersetStarts[termId + 1];
        for (let entry = start; entry < end; entry += 1) {
          const targetWord = p.strictSupersetWordIndex[entry];
          this.resultBits[targetWord] = (this.resultBits[targetWord] & ~p.strictSupersetWordMask[entry]) >>> 0;
        }
        active = (active & (active - 1)) >>> 0;
      }
    }

    const result = this.internBits(this.resultBits, id);
    if (cacheIndex >= 0) this.ownTransitions[cacheIndex] = result;
    return result;
  }

  blockTransition(id, cell) {
    this.assertClass(id);
    this.assertCell(cell);
    const cacheIndex = this.cacheIndex(id, cell);
    if (cacheIndex >= 0) {
      const cached = this.blockTransitions[cacheIndex];
      if (cached !== CLASS_UNKNOWN) return cached;
    }

    const p = this.profile;
    const containsBase = cell * FRONTIER_WORDS;
    let changedSlots = 0;
    for (let slotIndex = 0; slotIndex < FRONTIER_SLOTS; slotIndex += 1) {
      const parentChunk = this.classSlotIds[slotIndex][id];
      this.chunkIds[slotIndex] = parentChunk;
      const word = slotIndex * SLOT_WORDS;
      const mask0 = p.containsMasks[containsBase + word] >>> 0;
      const mask1 = p.containsMasks[containsBase + word + 1] >>> 0;
      if ((mask0 | mask1) === 0) continue;

      const input0 = this.slotPools[slotIndex].word(parentChunk, 0);
      const input1 = this.slotPools[slotIndex].word(parentChunk, 1);
      const next0 = (input0 & ~mask0) >>> 0;
      const next1 = (input1 & ~mask1) >>> 0;
      if (next0 === input0 && next1 === input1) continue;

      this.resultBits[word] = next0;
      this.resultBits[word + 1] = next1;
      this.chunkIds[slotIndex] = this.slotPools[slotIndex].intern(this.resultBits, word);
      changedSlots += 1;
    }

    if (changedSlots === 0) {
      if (cacheIndex >= 0) this.blockTransitions[cacheIndex] = id;
      return id;
    }

    if ((this.classCount + 1) * 10 >= this.classHashSlots.length * 7) this.growClassHash();
    const hash = hashChunkTuple(this.chunkIds);
    const hashMask = this.classHashSlots.length - 1;
    let hashSlot = hash & hashMask;
    while (true) {
      const existingId = this.classHashSlots[hashSlot];
      if (existingId === -1) break;
      if (this.classHashes[existingId] === hash && this.classEquals(existingId, this.chunkIds)) {
        if (cacheIndex >= 0) this.blockTransitions[cacheIndex] = existingId;
        return existingId;
      }
      hashSlot = (hashSlot + 1) & hashMask;
    }

    for (let slotIndex = 0; slotIndex < FRONTIER_SLOTS; slotIndex += 1) {
      this.ensureReferenceWidth(slotIndex, this.chunkIds[slotIndex]);
    }
    this.ensureClassCapacity(this.classCount + 1);
    const result = this.classCount;
    for (let slotIndex = 0; slotIndex < FRONTIER_SLOTS; slotIndex += 1) {
      this.classSlotIds[slotIndex][result] = this.chunkIds[slotIndex];
    }
    this.classHashes[result] = hash;
    const bitLo = cell < 32 ? ((2 ** cell) >>> 0) : 0;
    const bitHi = cell >= 32 ? ((2 ** (cell - 32)) >>> 0) : 0;
    this.singletonLo[result] = (this.singletonLo[id] & ~bitLo) >>> 0;
    this.singletonHi[result] = (this.singletonHi[id] & ~bitHi) >>> 0;
    this.classHashSlots[hashSlot] = result;
    this.classCount += 1;
    if (cacheIndex >= 0) this.blockTransitions[cacheIndex] = result;
    return result;
  }

  reflectClass(id) {
    if (id === RESIDUAL_TERMINAL_WIN) return RESIDUAL_TERMINAL_WIN;
    this.assertClass(id);
    const cached = this.reflectionCache[id];
    if (cached !== CLASS_UNKNOWN) return cached;
    this.loadClassBits(id, this.inputBits);
    this.reflectBits.fill(0);
    for (let word = 0; word < FRONTIER_WORDS; word += 1) {
      let active = this.inputBits[word] >>> 0;
      while (active !== 0) {
        const lsb = (active & -active) >>> 0;
        const termId = (word << 5) + bitIndex32(lsb);
        const reflected = this.profile.reflectedTermIds[termId];
        this.reflectBits[reflected >>> 5] |= 1 << (reflected & 31);
        active = (active & (active - 1)) >>> 0;
      }
    }
    const result = this.internBits(this.reflectBits);
    this.reflectionCache[id] = result;
    this.reflectionCache[result] = id;
    return result;
  }

  compareClasses(a, b) {
    if (a === b) return 0;
    if (a === RESIDUAL_TERMINAL_WIN) return -1;
    if (b === RESIDUAL_TERMINAL_WIN) return 1;
    this.assertClass(a);
    this.assertClass(b);
    for (let word = FRONTIER_WORDS - 1; word >= 0; word -= 1) {
      const av = this.wordAt(a, word);
      const bv = this.wordAt(b, word);
      if (av !== bv) return av < bv ? -1 : 1;
    }
    return 0;
  }

  wordAt(id, word) {
    const slot = Math.floor(word / SLOT_WORDS);
    return this.slotPools[slot].word(this.classSlotIds[slot][id], word & 1);
  }

  termIds(id) {
    this.assertClass(id);
    this.loadClassBits(id, this.inputBits);
    let count = 0;
    for (let word = 0; word < FRONTIER_WORDS; word += 1) count += popcount32(this.inputBits[word]);
    const ids = new Uint16Array(count);
    let out = 0;
    for (let word = 0; word < FRONTIER_WORDS; word += 1) {
      let active = this.inputBits[word] >>> 0;
      while (active !== 0) {
        const lsb = (active & -active) >>> 0;
        ids[out++] = (word << 5) + bitIndex32(lsb);
        active = (active & (active - 1)) >>> 0;
      }
    }
    return ids;
  }

  terms(id) {
    const p = this.profile;
    return Array.from(this.termIds(id), (termId) => [p.lo[termId] >>> 0, p.hi[termId] >>> 0]);
  }

  isEmpty(id) {
    return id === this.emptyClass;
  }

  hasSingletonAt(id, cell) {
    this.assertClass(id);
    this.assertCell(cell);
    const bitLo = cell < 32 ? ((2 ** cell) >>> 0) : 0;
    const bitHi = cell >= 32 ? ((2 ** (cell - 32)) >>> 0) : 0;
    return (((this.singletonLo[id] & bitLo) >>> 0) !== 0) || (((this.singletonHi[id] & bitHi) >>> 0) !== 0);
  }

  assertClass(id) {
    if (!Number.isInteger(id) || id < 0 || id >= this.classCount) throw new RangeError(`invalid residual class: ${id}`);
  }

  assertCell(cell) {
    if (!Number.isInteger(cell) || cell < 0 || cell >= this.profile.cellCount) throw new RangeError(`invalid cell: ${cell}`);
  }
}
