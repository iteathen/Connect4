import {
  INITIAL_SEARCH_RECORD,
  proofLower,
  proofUpper,
} from './quotient-negamax-search-record.mjs';
import {
  hashResidualTermIds,
  hashSemanticQuotientDescriptor,
} from './quotient-semantic-identity.mjs';

export { hashResidualTermIds, hashSemanticQuotientDescriptor } from './quotient-semantic-identity.mjs';

const SLOT_EMPTY = 0;
const SLOT_DESCRIPTOR_WRITING = 1;
const SLOT_READY = 2;
const SLOT_PROOF_WRITING = 3;
const META_TERM_NEXT = 0;
const META_ENTRY_COUNT = 1;
const META_REPLACEMENT_COUNT = 2;
const META_TERM_SPAN_REUSE_COUNT = 3;
const META_TERM_SPAN_GROW_COUNT = 4;
const META_WORDS = 5;
const DEFAULT_ASSOCIATIVITY = 8;
const INT32_MAX = 0x7fffffff;
const UINT32_MAX = 0xffffffff;

function nextPowerOfTwo(value) {
  let result = 1;
  while (result < value) result *= 2;
  return result;
}

function isPowerOfTwo(value) {
  return Number.isInteger(value) && value > 0 && (value & (value - 1)) === 0;
}

function generationLimitFor(entryCapacity) {
  return Math.min(
    UINT32_MAX,
    Math.floor((Number.MAX_SAFE_INTEGER - (entryCapacity - 1)) / entryCapacity),
  );
}

export function createSemanticSharedTtArena(options = {}) {
  const associativity = options.associativity ?? DEFAULT_ASSOCIATIVITY;
  if (!isPowerOfTwo(associativity)) throw new RangeError('semantic TT associativity must be a positive power of two');

  const requestedEntries = Math.max(options.entryCapacity ?? (1 << 19), associativity);
  const entryCapacity = nextPowerOfTwo(requestedEntries);
  if (entryCapacity % associativity !== 0) throw new RangeError('semantic TT entry capacity must be divisible by associativity');
  const bucketCount = entryCapacity / associativity;
  if (!isPowerOfTwo(bucketCount)) throw new RangeError('semantic TT bucket count must be a power of two');

  const termCapacity = options.termCapacity ?? (1 << 24);
  if (!Number.isInteger(termCapacity) || termCapacity < 1 || termCapacity > INT32_MAX) {
    throw new RangeError(`termCapacity must be an integer in 1..${INT32_MAX}`);
  }
  const generationLimit = generationLimitFor(entryCapacity);
  if (generationLimit < 1) throw new RangeError('semantic TT entry capacity leaves no safe handle generation domain');

  const metaBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * META_WORDS);
  const statusBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * entryCapacity);
  const generationBuffer = new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT * entryCapacity);
  const bucketLockBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * bucketCount);
  const victimCursorBuffer = new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT * bucketCount);
  const hashLoBuffer = new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT * entryCapacity);
  const hashHiBuffer = new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT * entryCapacity);
  const supportBuffer = new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT * entryCapacity);
  const p0StartBuffer = new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT * entryCapacity);
  const p1StartBuffer = new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT * entryCapacity);
  const p0LengthBuffer = new SharedArrayBuffer(Uint16Array.BYTES_PER_ELEMENT * entryCapacity);
  const p1LengthBuffer = new SharedArrayBuffer(Uint16Array.BYTES_PER_ELEMENT * entryCapacity);
  const termSpanCapacityBuffer = new SharedArrayBuffer(Uint16Array.BYTES_PER_ELEMENT * entryCapacity);
  const recordBuffer = new SharedArrayBuffer(Uint8Array.BYTES_PER_ELEMENT * entryCapacity);
  const termBuffer = new SharedArrayBuffer(Uint16Array.BYTES_PER_ELEMENT * termCapacity);
  new Uint8Array(recordBuffer).fill(INITIAL_SEARCH_RECORD);

  return Object.freeze({
    kind: 'connect4-exact-semantic-shared-tt-v4',
    entryCapacity,
    associativity,
    bucketCount,
    generationLimit,
    termCapacity,
    slotStates: Object.freeze({
      empty: SLOT_EMPTY,
      descriptorWriting: SLOT_DESCRIPTOR_WRITING,
      ready: SLOT_READY,
      proofWriting: SLOT_PROOF_WRITING,
    }),
    metaBuffer,
    statusBuffer,
    generationBuffer,
    bucketLockBuffer,
    victimCursorBuffer,
    hashLoBuffer,
    hashHiBuffer,
    supportBuffer,
    p0StartBuffer,
    p1StartBuffer,
    p0LengthBuffer,
    p1LengthBuffer,
    termSpanCapacityBuffer,
    recordBuffer,
    termBuffer,
  });
}

export function resetSemanticSharedTtArena(arena) {
  const meta = new Int32Array(arena.metaBuffer);
  for (let index = 0; index < META_WORDS; index += 1) Atomics.store(meta, index, 0);
  new Int32Array(arena.statusBuffer).fill(SLOT_EMPTY);
  new Int32Array(arena.bucketLockBuffer).fill(0);
  new Uint32Array(arena.victimCursorBuffer).fill(0);
  new Uint16Array(arena.termSpanCapacityBuffer).fill(0);
  new Uint8Array(arena.recordBuffer).fill(INITIAL_SEARCH_RECORD);
  // Generations deliberately survive reset. A stale handle from an old epoch
  // cannot alias the first descriptor installed after reset.
}

export function createSemanticSharedTtView(arena) {
  const meta = new Int32Array(arena.metaBuffer);
  const status = new Int32Array(arena.statusBuffer);
  const generation = new Uint32Array(arena.generationBuffer);
  const bucketLocks = new Int32Array(arena.bucketLockBuffer);
  const victimCursor = new Uint32Array(arena.victimCursorBuffer);
  const hashLo = new Uint32Array(arena.hashLoBuffer);
  const hashHi = new Uint32Array(arena.hashHiBuffer);
  const support = new Uint32Array(arena.supportBuffer);
  const p0Start = new Uint32Array(arena.p0StartBuffer);
  const p1Start = new Uint32Array(arena.p1StartBuffer);
  const p0Length = new Uint16Array(arena.p0LengthBuffer);
  const p1Length = new Uint16Array(arena.p1LengthBuffer);
  const termSpanCapacity = new Uint16Array(arena.termSpanCapacityBuffer);
  const records = new Uint8Array(arena.recordBuffer);
  const terms = new Uint16Array(arena.termBuffer);
  const bucketMask = arena.bucketCount - 1;
  const metrics = {
    probes: 0,
    probeMisses: 0,
    ensures: 0,
    hits: 0,
    inserts: 0,
    replacements: 0,
    nonExactVictims: 0,
    exactVictims: 0,
    descriptorCompares: 0,
    hashCollisions: 0,
    bucketLockWaits: 0,
    proofWriterWaits: 0,
    termIdsPublished: 0,
    termIdsAllocated: 0,
    termSpanReuses: 0,
    termSpanGrows: 0,
    maxBucketScan: 0,
  };

  function encodeHandle(slot, generationValue) {
    if (!Number.isInteger(generationValue) || generationValue < 1 || generationValue > arena.generationLimit) {
      throw new RangeError(`semantic TT generation ${generationValue} is outside safe handle domain`);
    }
    const handle = generationValue * arena.entryCapacity + slot;
    if (!Number.isSafeInteger(handle)) throw new RangeError('semantic TT proof handle exceeded safe integer range');
    return handle;
  }

  function bucketBase(descriptor) {
    return (descriptor.hash.lo & bucketMask) * arena.associativity;
  }

  function termsEqual(start, ids) {
    for (let index = 0; index < ids.length; index += 1) {
      if (terms[start + index] !== ids[index]) return false;
    }
    return true;
  }

  function descriptorEquals(slot, descriptor) {
    metrics.descriptorCompares += 1;
    if (support[slot] !== descriptor.supportIndex) return false;
    if (p0Length[slot] !== descriptor.p0.ids.length || p1Length[slot] !== descriptor.p1.ids.length) return false;
    return termsEqual(p0Start[slot], descriptor.p0.ids)
      && termsEqual(p1Start[slot], descriptor.p1.ids);
  }

  function allocateTerms(total) {
    while (true) {
      const current = Atomics.load(meta, META_TERM_NEXT);
      const next = current + total;
      if (next > arena.termCapacity) {
        throw new Error(`semantic TT term arena exhausted: ${next} > ${arena.termCapacity}`);
      }
      if (Atomics.compareExchange(meta, META_TERM_NEXT, current, next) === current) return current;
    }
  }

  function incrementSharedCounter(index) {
    while (true) {
      const current = Atomics.load(meta, index);
      if (current >= INT32_MAX) return current;
      if (Atomics.compareExchange(meta, index, current, current + 1) === current) return current + 1;
    }
  }

  function acquireBucket(bucket) {
    while (Atomics.compareExchange(bucketLocks, bucket, 0, 1) !== 0) {
      metrics.bucketLockWaits += 1;
      Atomics.wait(bucketLocks, bucket, 1, 1);
    }
  }

  function releaseBucket(bucket) {
    Atomics.store(bucketLocks, bucket, 0);
    Atomics.notify(bucketLocks, bucket, 1);
  }

  function nextGeneration(slot) {
    const current = Atomics.load(generation, slot);
    if (current >= arena.generationLimit) {
      throw new Error(`semantic TT generation exhausted at slot ${slot}: ${current} >= ${arena.generationLimit}`);
    }
    return current + 1;
  }

  function descriptorSpan(slot, total, replacing) {
    const capacity = termSpanCapacity[slot];
    if (replacing && total <= capacity) {
      metrics.termSpanReuses += 1;
      incrementSharedCounter(META_TERM_SPAN_REUSE_COUNT);
      return p0Start[slot];
    }
    const start = allocateTerms(total);
    metrics.termIdsAllocated += total;
    if (replacing) {
      metrics.termSpanGrows += 1;
      incrementSharedCounter(META_TERM_SPAN_GROW_COUNT);
    }
    termSpanCapacity[slot] = total;
    return start;
  }

  function installDescriptor(slot, descriptor, replacing) {
    const p0Count = descriptor.p0.ids.length;
    const p1Count = descriptor.p1.ids.length;
    if (p0Count > 0xffff || p1Count > 0xffff) throw new RangeError('semantic TT residual descriptor exceeds Uint16 length');
    const total = p0Count + p1Count;
    if (total > 0xffff) throw new RangeError('semantic TT combined descriptor exceeds Uint16 slot-span capacity');
    const newGeneration = nextGeneration(slot);
    const start = descriptorSpan(slot, total, replacing);
    const p1Offset = start + p0Count;

    terms.set(descriptor.p0.ids, start);
    terms.set(descriptor.p1.ids, p1Offset);
    hashLo[slot] = descriptor.hash.lo;
    hashHi[slot] = descriptor.hash.hi;
    support[slot] = descriptor.supportIndex;
    p0Start[slot] = start;
    p1Start[slot] = p1Offset;
    p0Length[slot] = p0Count;
    p1Length[slot] = p1Count;
    Atomics.store(records, slot, INITIAL_SEARCH_RECORD);
    Atomics.store(generation, slot, newGeneration);

    metrics.termIdsPublished += total;
    if (replacing) {
      metrics.replacements += 1;
      incrementSharedCounter(META_REPLACEMENT_COUNT);
    } else {
      metrics.inserts += 1;
      incrementSharedCounter(META_ENTRY_COUNT);
    }

    Atomics.store(status, slot, SLOT_READY);
    Atomics.notify(status, slot);
    return encodeHandle(slot, newGeneration);
  }

  function stableDescriptorHandle(slot, descriptor) {
    const stateBefore = Atomics.load(status, slot);
    if (stateBefore !== SLOT_READY && stateBefore !== SLOT_PROOF_WRITING) return -1;
    const generationBefore = Atomics.load(generation, slot);
    if (generationBefore < 1) return -1;
    if (hashLo[slot] !== descriptor.hash.lo || hashHi[slot] !== descriptor.hash.hi) return -1;
    if (!descriptorEquals(slot, descriptor)) {
      metrics.hashCollisions += 1;
      return -1;
    }
    const generationAfter = Atomics.load(generation, slot);
    const stateAfter = Atomics.load(status, slot);
    if (generationAfter !== generationBefore) return -1;
    if (stateAfter !== SLOT_READY && stateAfter !== SLOT_PROOF_WRITING) return -1;
    return encodeHandle(slot, generationBefore);
  }

  function probe(descriptor) {
    metrics.probes += 1;
    const base = bucketBase(descriptor);
    let scanned = 0;
    for (let lane = 0; lane < arena.associativity; lane += 1) {
      scanned += 1;
      const handle = stableDescriptorHandle(base + lane, descriptor);
      if (handle >= 0) {
        metrics.hits += 1;
        if (scanned > metrics.maxBucketScan) metrics.maxBucketScan = scanned;
        return handle;
      }
    }
    metrics.probeMisses += 1;
    if (scanned > metrics.maxBucketScan) metrics.maxBucketScan = scanned;
    return -1;
  }

  function chooseVictim(base, bucket) {
    const cursor = Atomics.load(victimCursor, bucket) % arena.associativity;
    let firstReady = -1;
    let firstReadyLane = -1;
    for (let offset = 0; offset < arena.associativity; offset += 1) {
      const lane = (cursor + offset) % arena.associativity;
      const slot = base + lane;
      if (Atomics.load(status, slot) !== SLOT_READY) continue;
      if (firstReady < 0) {
        firstReady = slot;
        firstReadyLane = lane;
      }
      const record = Atomics.load(records, slot);
      if (proofLower(record) !== proofUpper(record)) {
        return Object.freeze({ slot, lane, exact: false });
      }
    }
    if (firstReady >= 0) return Object.freeze({ slot: firstReady, lane: firstReadyLane, exact: true });
    return null;
  }

  function ensure(descriptor) {
    metrics.ensures += 1;
    const bucket = descriptor.hash.lo & bucketMask;
    const base = bucket * arena.associativity;
    acquireBucket(bucket);
    try {
      while (true) {
        let emptySlot = -1;
        for (let lane = 0; lane < arena.associativity; lane += 1) {
          const slot = base + lane;
          const state = Atomics.load(status, slot);
          if (state === SLOT_EMPTY) {
            if (emptySlot < 0) emptySlot = slot;
            continue;
          }
          if (state === SLOT_DESCRIPTOR_WRITING) {
            throw new Error(`semantic TT descriptor-writing slot ${slot} observed while owning bucket ${bucket}`);
          }
          if (state === SLOT_READY || state === SLOT_PROOF_WRITING) {
            const handle = stableDescriptorHandle(slot, descriptor);
            if (handle >= 0) {
              metrics.hits += 1;
              return handle;
            }
          }
        }

        if (emptySlot >= 0) {
          const prior = Atomics.compareExchange(status, emptySlot, SLOT_EMPTY, SLOT_DESCRIPTOR_WRITING);
          if (prior !== SLOT_EMPTY) continue;
          try {
            return installDescriptor(emptySlot, descriptor, false);
          } catch (error) {
            Atomics.store(status, emptySlot, SLOT_EMPTY);
            Atomics.notify(status, emptySlot);
            throw error;
          }
        }

        const victim = chooseVictim(base, bucket);
        if (victim === null) {
          let waited = false;
          for (let lane = 0; lane < arena.associativity; lane += 1) {
            const slot = base + lane;
            if (Atomics.load(status, slot) === SLOT_PROOF_WRITING) {
              metrics.proofWriterWaits += 1;
              Atomics.wait(status, slot, SLOT_PROOF_WRITING, 1);
              waited = true;
              break;
            }
          }
          if (waited) continue;
          throw new Error(`semantic TT bucket ${bucket} has no replaceable slot`);
        }

        const prior = Atomics.compareExchange(status, victim.slot, SLOT_READY, SLOT_DESCRIPTOR_WRITING);
        if (prior !== SLOT_READY) continue;
        try {
          Atomics.store(victimCursor, bucket, (victim.lane + 1) % arena.associativity);
          if (victim.exact) metrics.exactVictims += 1;
          else metrics.nonExactVictims += 1;
          return installDescriptor(victim.slot, descriptor, true);
        } catch (error) {
          Atomics.store(status, victim.slot, SLOT_READY);
          Atomics.notify(status, victim.slot);
          throw error;
        }
      }
    } finally {
      releaseBucket(bucket);
    }
  }

  function stats() {
    return Object.freeze({
      ...metrics,
      entries: Atomics.load(meta, META_ENTRY_COUNT),
      replacementsShared: Atomics.load(meta, META_REPLACEMENT_COUNT),
      termSpanReusesShared: Atomics.load(meta, META_TERM_SPAN_REUSE_COUNT),
      termSpanGrowsShared: Atomics.load(meta, META_TERM_SPAN_GROW_COUNT),
      termIdsUsed: Atomics.load(meta, META_TERM_NEXT),
      entryCapacity: arena.entryCapacity,
      associativity: arena.associativity,
      bucketCount: arena.bucketCount,
      generationLimit: arena.generationLimit,
      termCapacity: arena.termCapacity,
    });
  }

  return Object.freeze({ probe, ensure, records, stats, metrics });
}
