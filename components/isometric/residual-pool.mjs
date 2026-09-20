import { FRONTIER_SLOTS, FRONTIER_WORDS, ISOMETRIC_PROFILE, SLOT_WORDS } from './profile.mjs';

export const RESIDUAL_TERMINAL_WIN = -1;
const CLASS_UNKNOWN = -3;

function nextPowerOfTwo(value) {
  // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
  // Preparation/growth helper only; never route a sealed recursive miss into resizing.
  // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
  let result = 1;
  while (result < value) result *= 2;
  return result;
}

function growU32(source, next) {
  // OWNER-PROTECTED COLD HELPER — do not remove/weaken this comment.
  // Keep at module scope. A nested closure capturing next made V8 allocate a
  // function context at ensureClassCapacity entry, even on its no-growth path.
  // Only the cold, unsealed growth branch may call this allocating helper.
  const target = new Uint32Array(next);
  target.set(source);
  return target;
}

function mix32(value) {
  // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
  // Keep scalar integer mixing; no string/BigInt conversion or allocating hash input.
  // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
  let x = value | 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x;
}

function hashWords2(words, offset) {
  // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
  // Hash the existing two-word storage directly; full words still decide equality.
  // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
  let hash = 0x811c9dc5;
  hash = Math.imul(hash ^ mix32(words[offset]), 0x01000193);
  hash = Math.imul(hash ^ mix32(words[offset + 1]), 0x01000193);
  return mix32(hash ^ SLOT_WORDS);
}

function hashChunkTuple(ids) {
  // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
  // Scan the existing numeric tuple; do not materialize an array/key per probe.
  // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
  let hash = 0x811c9dc5;
  for (let index = 0; index < FRONTIER_SLOTS; index += 1) {
    hash = Math.imul(hash ^ mix32(ids[index] + 1), 0x01000193);
  }
  // OWNER-PROTECTED MAGNITUDE BOUNDARY — classHashes is Uint32 storage and
  // interners use strict numeric equality. Only intermediates are signed;
  // converting this result to signed would break immutable class identity.
  return mix32(hash ^ FRONTIER_SLOTS) >>> 0;
}

function bitIndex32(value) {
  // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
  // Keep the integer bit primitive; callers supply the isolated nonzero bit.
  // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
  // Preserve bit 31 as signed int32 across calls; clz32 reads the same bits.
  // Unsigned 0x80000000 can otherwise box before a MathClz32 builtin call.
  return 31 - Math.clz32(value | 0);
}

function popcount32(value) {
  // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
  // Numeric diagnostic enumeration helper; do not add term enumeration to native recursion.
  // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
  let x = value >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

function referenceTypeFor(maxId) {
  // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
  // Width selection may be checked hot, but widening/copying belongs before sealing.
  // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
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
    this.sealed = false;
  }

  ensureCapacity(required) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // A sealed miss must fail; no grow-on-demand fallback or recursive buffer copy.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    if (required <= this.capacity) return;
    if (this.sealed) throw new Error('ISOMAX_CHUNK_CAPACITY');
    const next = nextPowerOfTwo(required);
    const target = new Uint32Array(next * SLOT_WORDS);
    target.set(this.words);
    this.words = target;
    this.capacity = next;
  }

  equals(id, source, offset) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Compare both exact words in place; hashes and chunk IDs from other pools are insufficient.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    const base = id * SLOT_WORDS;
    return this.words[base] === (source[offset] >>> 0)
      && this.words[base + 1] === (source[offset + 1] >>> 0);
  }

  growHash(length = this.hashSlots.length * 2) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Cold preparation only. Preserve exact rehashing and the sealed rejection.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    if (this.sealed) throw new Error('ISOMAX_CHUNK_HASH_CAPACITY');
    const next = new Int32Array(length);
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
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Probe numeric immutable words; keep successful sealed insertion allocation-free.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
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
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // These two scalar loads/stores are residual computation into caller-owned scratch, not a buffer clone.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    const base = id * SLOT_WORDS;
    target[offset] = this.words[base];
    target[offset + 1] = this.words[base + 1];
  }

  word(id, localWord) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Direct scalar access only; do not return a view/object or expand chunk contents.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    return this.words[id * SLOT_WORDS + localWord] >>> 0;
  }
}

export class ResidualPool {
  constructor({ transitionPrefixClasses = 65536 } = {}) {
    // OWNER-PROTECTED PREPARATION — do not remove/weaken this comment.
    // Fixed pool-local own/block memo: 21 MiB per pool, allocated before search.
    // The 4K prefix repeatedly recomputed later classes; 16K and 64K were paired
    // against it in benchmarks/isomax-workers/issue-75-prefix-*.json. Do not
    // shrink/grow this policy on hit rate alone or allocate pages in recursion.
    if (!Number.isInteger(transitionPrefixClasses) || transitionPrefixClasses < 1) {
      throw new RangeError('transitionPrefixClasses must be a positive integer');
    }
    this.profile = ISOMETRIC_PROFILE;
    this.sealed = false;
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
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Preparation widens references; sealed recursion must reject unexpected widening.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    const current = this.classSlotIds[slot];
    const Type = referenceTypeFor(requiredId);
    if (current.BYTES_PER_ELEMENT >= Type.BYTES_PER_ELEMENT) return;
    if (this.sealed) throw new Error('ISOMAX_REFERENCE_CAPACITY');
    const widened = new Type(this.classCapacity);
    widened.set(current);
    this.classSlotIds[slot] = widened;
  }

  ensureClassCapacity(required) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Allocate/copy only before recursive entry. Keep sealed overflow fail-closed.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    if (required <= this.classCapacity) return;
    if (this.sealed) throw new Error('ISOMAX_CLASS_CAPACITY');
    const next = nextPowerOfTwo(required);
    for (let slot = 0; slot < FRONTIER_SLOTS; slot += 1) {
      const Type = this.classSlotIds[slot].constructor;
      const target = new Type(next);
      target.set(this.classSlotIds[slot]);
      this.classSlotIds[slot] = target;
    }
    this.classHashes = growU32(this.classHashes, next);
    this.singletonLo = growU32(this.singletonLo, next);
    this.singletonHi = growU32(this.singletonHi, next);
    const reflected = new Int32Array(next);
    reflected.fill(CLASS_UNKNOWN);
    reflected.set(this.reflectionCache);
    this.reflectionCache = reflected;
    this.classCapacity = next;
  }

  classEquals(id, ids) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Full slot-tuple equality is authority; avoid allocating descriptors or hash-only matches.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    for (let slot = 0; slot < FRONTIER_SLOTS; slot += 1) {
      if (this.classSlotIds[slot][id] !== ids[slot]) return false;
    }
    return true;
  }

  growClassHash(length = this.classHashSlots.length * 2) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Preparation only. Never silently grow an active sealed worker dictionary.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    if (this.sealed) throw new Error('ISOMAX_CLASS_HASH_CAPACITY');
    const next = new Int32Array(length);
    next.fill(-1);
    const mask = next.length - 1;
    for (let id = 0; id < this.classCount; id += 1) {
      let slot = this.classHashes[id] & mask;
      while (next[slot] !== -1) slot = (slot + 1) & mask;
      next[slot] = id;
    }
    this.classHashSlots = next;
  }

  prepareSearchStorage(additionalClasses) {
    // OWNER-PROTECTED HOT-PATH BOUNDARY — do not remove/weaken these comments.
    // Reserve, widen and rehash BEFORE recursion, then seal every owner.
    // Never "fix" a capacity error by growing/copying from a recursive caller
    // or silently unsealing. Preserve warm IDs and exact dictionary equality.
    // Memory headroom is deliberately spent to avoid hot-loop allocation.
    if (!Number.isSafeInteger(additionalClasses) || additionalClasses < 1 ||
        additionalClasses > 2 ** 26) throw new RangeError('invalid residual reservation');
    this.releaseSearchStorage();
    const required = this.classCount + additionalClasses;
    // OWNER-PROTECTED PREPARATION ORDER — do not remove/weaken this comment.
    // Determine chunk reference widths before growing class arrays. Widening
    // after growth copies the new, mostly-unused reservation a second time.
    // Chunk IDs/content and existing class IDs remain unchanged in both steps.
    for (let slot = 0; slot < FRONTIER_SLOTS; slot++) {
      const chunks = this.slotPools[slot], chunkRequired = chunks.count + additionalClasses;
      chunks.ensureCapacity(chunkRequired);
      const hashLength = nextPowerOfTwo(Math.ceil((chunkRequired + 1) * 10 / 7));
      if (hashLength > chunks.hashSlots.length) chunks.growHash(hashLength);
      this.ensureReferenceWidth(slot, chunks.capacity - 1);
      chunks.sealed = true;
    }
    this.ensureClassCapacity(required);
    const classHashLength = nextPowerOfTwo(Math.ceil((required + 1) * 10 / 7));
    if (classHashLength > this.classHashSlots.length) this.growClassHash(classHashLength);
    this.sealed = true;
  }

  releaseSearchStorage() {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Unseal only after recursive unwind, never to bypass a hot capacity failure.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    this.sealed = false;
    for (let slot = 0; slot < FRONTIER_SLOTS; slot++) this.slotPools[slot].sealed = false;
  }

  loadClassBits(id, target) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Use caller-owned fixed scratch and indexed scalar stores; no returned fresh view/array.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    this.assertClass(id);
    for (let slot = 0; slot < FRONTIER_SLOTS; slot += 1) {
      this.slotPools[slot].copyTo(this.classSlotIds[slot][id], target, slot * SLOT_WORDS);
    }
    return target;
  }

  computeSingletonMasks(bits, id) {
    // OWNER-PROTECTED HOT-PATH — do not remove/weaken this comment.
    // Write scalar results directly to reserved metadata. Returning [lo, hi]
    // or an object and destructuring it recreates allocation per new class.
    // profile.mjs checks the full singleton-term-ID -> cell-ID correspondence.
    // Project the FINAL normalized bits; this works for own moves, reflection
    // and arbitrary valid interning, without assumed parent/update provenance.
    // Word 1 also contains larger terms, so its singleton mask is mandatory.
    this.singletonLo[id] = bits[0] >>> 0;
    this.singletonHi[id] = (bits[1] & this.profile.singletonTermMasks[1]) >>> 0;
  }

  internBits(bits, parentId = -1) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Keep shared scratch call-local; reuse unchanged chunks and verify full exact content.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
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
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Numeric pool-local addressing only. Preserve terminal/unknown sentinel distinctions.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    return id < this.transitionPrefixClasses ? id * this.profile.cellCount + cell : -1;
  }

  ownTransition(id, cell) {
    // OWNER-PROTECTED HOT-PATH — do not remove/weaken this comment.
    // NEES E1 / NEES-EXTREME residual transition.
    // Preserve dense transformation plus sparse normalization and shared
    // scratch. The earlier lazy/branchy mover regressed the real 7x6 workload;
    // a locality proxy alone does not authorize replacing this implementation.
    // No allocating term lists, string identities, or scratch-buffer copies.
    this.assertClass(id);
    this.assertCell(cell);
    const cacheIndex = this.cacheIndex(id, cell);
    if (cacheIndex >= 0) {
      const cached = this.ownTransitions[cacheIndex];
      if (cached !== CLASS_UNKNOWN) return cached;
    }

    const bitLo = ISOMETRIC_PROFILE.cellLo[cell];
    const bitHi = ISOMETRIC_PROFILE.cellHi[cell];
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
        const lsb = active & -active;
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
        const lsb = active & -active;
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
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // NEES E1 / NEES-EXTREME residual transition.
    // Keep exact slot-local masking and scalar metadata; do not allocate term lists or generalize locality to own normalization.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
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
    const bitLo = ISOMETRIC_PROFILE.cellLo[cell];
    const bitHi = ISOMETRIC_PROFILE.cellHi[cell];
    this.singletonLo[result] = (this.singletonLo[id] & ~bitLo) >>> 0;
    this.singletonHi[result] = (this.singletonHi[id] & ~bitHi) >>> 0;
    this.classHashSlots[hashSlot] = result;
    this.classCount += 1;
    if (cacheIndex >= 0) this.blockTransitions[cacheIndex] = result;
    return result;
  }

  reflectClass(id) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Memoize in reserved storage; scratch is borrowed only during this call, never across recursion.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    if (id === RESIDUAL_TERMINAL_WIN) return RESIDUAL_TERMINAL_WIN;
    this.assertClass(id);
    const cached = this.reflectionCache[id];
    if (cached !== CLASS_UNKNOWN) return cached;
    this.loadClassBits(id, this.inputBits);
    this.reflectBits.fill(0);
    for (let word = 0; word < FRONTIER_WORDS; word += 1) {
      let active = this.inputBits[word] >>> 0;
      while (active !== 0) {
        const lsb = active & -active;
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
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Compare immutable numeric content directly; sentinel ordering and exact reflection ties matter.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
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
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Keep direct chunk access; no subarray, term expansion or object-shaped word result.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    const slot = Math.floor(word / SLOT_WORDS);
    return this.slotPools[slot].word(this.classSlotIds[slot][id], word & 1);
  }

  termIds(id) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Allocating optional/diagnostic API, excluded from ordinary worker recursion; do not substitute it for wordAt.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    this.assertClass(id);
    this.loadClassBits(id, this.inputBits);
    let count = 0;
    for (let word = 0; word < FRONTIER_WORDS; word += 1) count += popcount32(this.inputBits[word]);
    const ids = new Uint16Array(count);
    let out = 0;
    for (let word = 0; word < FRONTIER_WORDS; word += 1) {
      let active = this.inputBits[word] >>> 0;
      while (active !== 0) {
        const lsb = active & -active;
        ids[out++] = (word << 5) + bitIndex32(lsb);
        active = (active & (active - 1)) >>> 0;
      }
    }
    return ids;
  }

  terms(id) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Allocating optional proof/RBA boundary only, never ordinary sealed recursion.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    const p = this.profile;
    return Array.from(this.termIds(id), (termId) => [p.lo[termId] >>> 0, p.hi[termId] >>> 0]);
  }

  isEmpty(id) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Empty-class identity is scalar; do not scan residual terms to recover this fact.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    return id === this.emptyClass;
  }

  hasSingletonAt(id, cell) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Use existing numeric masks. Keep public validation unless a separately qualified trusted boundary replaces it.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    this.assertClass(id);
    this.assertCell(cell);
    const bitLo = ISOMETRIC_PROFILE.cellLo[cell];
    const bitHi = ISOMETRIC_PROFILE.cellHi[cell];
    return (((this.singletonLo[id] & bitLo) >>> 0) !== 0) || (((this.singletonHi[id] & bitHi) >>> 0) !== 0);
  }

  assertClass(id) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Successful validation is scalar; diagnostics allocate only on failure. Do not remove boundary checks globally.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    if (!Number.isInteger(id) || id < 0 || id >= this.classCount) throw new RangeError(`invalid residual class: ${id}`);
  }

  assertCell(cell) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Successful validation is scalar; diagnostic formatting belongs only on failure.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    if (!Number.isInteger(cell) || cell < 0 || cell >= this.profile.cellCount) throw new RangeError(`invalid cell: ${cell}`);
  }
}
