import {
  INITIAL_SEARCH_RECORD,
  proofLower,
  proofUpper,
} from './quotient-negamax-search-record.mjs';
import {
  hashResidualTermIds,
  hashSemanticQuotientDescriptor,
  semanticQuotientP0Length,
  semanticQuotientP1Length,
  writeSemanticQuotientTermIds,
} from './quotient-semantic-identity.mjs';

export { hashResidualTermIds, hashSemanticQuotientDescriptor } from './quotient-semantic-identity.mjs';

const SLOT_EMPTY = 0;
const SLOT_DESCRIPTOR_WRITING = 1;
const SLOT_READY = 2;
const SLOT_PROOF_WRITING = 3;
const SLOT_POISONED = 4;
const META_TERM_NEXT = 0;
const META_ENTRY_COUNT = 1;
const META_REPLACEMENT_COUNT = 2;
const META_TERM_SPAN_REUSE_COUNT = 3;
const META_TERM_SPAN_GROW_COUNT = 4;
const META_TERM_DATA_CAPACITY = 5;
const META_TERM_CHUNK_COUNT = 6;
const META_WORDS = 7;
const DEFAULT_ASSOCIATIVITY = 8;
const MAX_ASSOCIATIVITY = 256;
const MAX_ENTRY_CAPACITY = 1 << 30;
const INT32_MAX = 0x7fffffff;
const UINT32_MAX = 0xffffffff;
const UINT16_MAX = 0xffff;
const TERM_CHUNK_END = UINT32_MAX;
const TERM_CHUNK_HEADER_WORDS = 3;
const ARENA_KIND = 'connect4-exact-semantic-shared-tt-v5';

function nextPowerOfTwo(value) {
  if (!Number.isInteger(value) || value < 1 || value > MAX_ENTRY_CAPACITY) {
    throw new RangeError(`power-of-two request must be an integer in 1..${MAX_ENTRY_CAPACITY}, got ${value}`);
  }
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

function assertSharedBuffer(buffer, expectedBytes, label) {
  if (!(buffer instanceof SharedArrayBuffer)) throw new TypeError(`${label} must be SharedArrayBuffer`);
  if (buffer.byteLength !== expectedBytes) {
    throw new Error(`${label} byte length ${buffer.byteLength} does not match ${expectedBytes}`);
  }
}

export function assertSemanticSharedTtArena(arena) {
  if (!arena || typeof arena !== 'object' || arena.kind !== ARENA_KIND) {
    throw new TypeError(`semantic TT arena must have kind ${ARENA_KIND}`);
  }
  const { entryCapacity, associativity, bucketCount, generationLimit, termCapacity } = arena;
  if (!isPowerOfTwo(entryCapacity) || entryCapacity < 1 || entryCapacity > MAX_ENTRY_CAPACITY) {
    throw new RangeError(`semantic TT entryCapacity ${entryCapacity} is invalid`);
  }
  if (!isPowerOfTwo(associativity) || associativity > MAX_ASSOCIATIVITY || associativity > entryCapacity) {
    throw new RangeError(`semantic TT associativity ${associativity} is invalid`);
  }
  if (!isPowerOfTwo(bucketCount) || bucketCount !== entryCapacity / associativity) {
    throw new RangeError(`semantic TT bucketCount ${bucketCount} is inconsistent`);
  }
  if (!Number.isInteger(generationLimit) || generationLimit < 1 || generationLimit > UINT32_MAX) {
    throw new RangeError(`semantic TT generationLimit ${generationLimit} is invalid`);
  }
  if (generationLimit !== generationLimitFor(entryCapacity)) {
    throw new Error(`semantic TT generationLimit ${generationLimit} drifted for entryCapacity ${entryCapacity}`);
  }
  if (!Number.isInteger(termCapacity) || termCapacity < 1 || termCapacity > INT32_MAX) {
    throw new RangeError(`semantic TT termCapacity ${termCapacity} is invalid`);
  }
  const states = arena.slotStates;
  if (!states || states.empty !== SLOT_EMPTY || states.descriptorWriting !== SLOT_DESCRIPTOR_WRITING
      || states.ready !== SLOT_READY || states.proofWriting !== SLOT_PROOF_WRITING
      || states.poisoned !== SLOT_POISONED) {
    throw new Error('semantic TT slot-state contract drifted');
  }

  assertSharedBuffer(arena.metaBuffer, Int32Array.BYTES_PER_ELEMENT * META_WORDS, 'semantic TT metaBuffer');
  assertSharedBuffer(arena.statusBuffer, Int32Array.BYTES_PER_ELEMENT * entryCapacity, 'semantic TT statusBuffer');
  assertSharedBuffer(arena.generationBuffer, Uint32Array.BYTES_PER_ELEMENT * entryCapacity, 'semantic TT generationBuffer');
  assertSharedBuffer(arena.bucketLockBuffer, Int32Array.BYTES_PER_ELEMENT * bucketCount, 'semantic TT bucketLockBuffer');
  assertSharedBuffer(arena.victimCursorBuffer, Uint32Array.BYTES_PER_ELEMENT * bucketCount, 'semantic TT victimCursorBuffer');
  assertSharedBuffer(arena.hashLoBuffer, Uint32Array.BYTES_PER_ELEMENT * entryCapacity, 'semantic TT hashLoBuffer');
  assertSharedBuffer(arena.hashHiBuffer, Uint32Array.BYTES_PER_ELEMENT * entryCapacity, 'semantic TT hashHiBuffer');
  assertSharedBuffer(arena.supportBuffer, Uint32Array.BYTES_PER_ELEMENT * entryCapacity, 'semantic TT supportBuffer');
  assertSharedBuffer(arena.termChunkHeadBuffer, Uint32Array.BYTES_PER_ELEMENT * entryCapacity, 'semantic TT termChunkHeadBuffer');
  assertSharedBuffer(arena.p0LengthBuffer, Uint16Array.BYTES_PER_ELEMENT * entryCapacity, 'semantic TT p0LengthBuffer');
  assertSharedBuffer(arena.p1LengthBuffer, Uint16Array.BYTES_PER_ELEMENT * entryCapacity, 'semantic TT p1LengthBuffer');
  assertSharedBuffer(arena.termSpanCapacityBuffer, Uint16Array.BYTES_PER_ELEMENT * entryCapacity, 'semantic TT termSpanCapacityBuffer');
  assertSharedBuffer(arena.recordBuffer, Uint8Array.BYTES_PER_ELEMENT * entryCapacity, 'semantic TT recordBuffer');
  assertSharedBuffer(arena.termBuffer, Uint16Array.BYTES_PER_ELEMENT * termCapacity, 'semantic TT termBuffer');
  return arena;
}

function assertDescriptor(descriptor) {
  if (!descriptor || typeof descriptor !== 'object' || !descriptor.hash) {
    throw new TypeError('semantic TT descriptor must be an object with hash');
  }
  if (!Number.isInteger(descriptor.supportIndex) || descriptor.supportIndex < 0 || descriptor.supportIndex > UINT32_MAX) {
    throw new RangeError(`semantic TT descriptor supportIndex ${descriptor.supportIndex} is invalid`);
  }
  for (const [label, value] of [['hash.lo', descriptor.hash.lo], ['hash.hi', descriptor.hash.hi]]) {
    if (!Number.isInteger(value) || value < 0 || value > UINT32_MAX) {
      throw new RangeError(`semantic TT descriptor ${label} ${value} is invalid`);
    }
  }
  const p0Count = semanticQuotientP0Length(descriptor);
  const p1Count = semanticQuotientP1Length(descriptor);
  if (p0Count + p1Count > UINT16_MAX) throw new RangeError('semantic TT combined descriptor exceeds Uint16 slot capacity');
  return descriptor;
}

export function createSemanticSharedTtArena(options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('semantic TT options must be an object');
  }
  const associativity = options.associativity ?? DEFAULT_ASSOCIATIVITY;
  if (!isPowerOfTwo(associativity) || associativity > MAX_ASSOCIATIVITY) {
    throw new RangeError(`semantic TT associativity must be a power of two in 1..${MAX_ASSOCIATIVITY}`);
  }

  const requestedEntries = options.entryCapacity ?? (1 << 19);
  if (!Number.isInteger(requestedEntries) || requestedEntries < 1 || requestedEntries > MAX_ENTRY_CAPACITY) {
    throw new RangeError(`semantic TT entryCapacity must be an integer in 1..${MAX_ENTRY_CAPACITY}`);
  }
  const entryCapacity = nextPowerOfTwo(Math.max(requestedEntries, associativity));
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
  const termChunkHeadBuffer = new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT * entryCapacity);
  const p0LengthBuffer = new SharedArrayBuffer(Uint16Array.BYTES_PER_ELEMENT * entryCapacity);
  const p1LengthBuffer = new SharedArrayBuffer(Uint16Array.BYTES_PER_ELEMENT * entryCapacity);
  const termSpanCapacityBuffer = new SharedArrayBuffer(Uint16Array.BYTES_PER_ELEMENT * entryCapacity);
  const recordBuffer = new SharedArrayBuffer(Uint8Array.BYTES_PER_ELEMENT * entryCapacity);
  const termBuffer = new SharedArrayBuffer(Uint16Array.BYTES_PER_ELEMENT * termCapacity);
  new Uint32Array(termChunkHeadBuffer).fill(TERM_CHUNK_END);
  new Uint8Array(recordBuffer).fill(INITIAL_SEARCH_RECORD);

  return Object.freeze({
    kind: ARENA_KIND,
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
      poisoned: SLOT_POISONED,
    }),
    metaBuffer,
    statusBuffer,
    generationBuffer,
    bucketLockBuffer,
    victimCursorBuffer,
    hashLoBuffer,
    hashHiBuffer,
    supportBuffer,
    termChunkHeadBuffer,
    p0LengthBuffer,
    p1LengthBuffer,
    termSpanCapacityBuffer,
    recordBuffer,
    termBuffer,
  });
}

export function resetSemanticSharedTtArena(arena) {
  assertSemanticSharedTtArena(arena);
  const status = new Int32Array(arena.statusBuffer);
  for (let slot = 0; slot < status.length; slot += 1) {
    const state = Atomics.load(status, slot);
    if (state === SLOT_DESCRIPTOR_WRITING || state === SLOT_PROOF_WRITING) {
      throw new Error(`semantic TT reset requires quiescence; slot ${slot} is writing`);
    }
    if (state !== SLOT_EMPTY && state !== SLOT_READY && state !== SLOT_POISONED) {
      throw new Error(`semantic TT slot ${slot} has invalid state ${state}`);
    }
  }
  const locks = new Int32Array(arena.bucketLockBuffer);
  for (let bucket = 0; bucket < locks.length; bucket += 1) {
    if (Atomics.load(locks, bucket) !== 0) {
      throw new Error(`semantic TT reset requires quiescence; bucket ${bucket} is locked`);
    }
  }

  const meta = new Int32Array(arena.metaBuffer);
  for (let index = 0; index < META_WORDS; index += 1) Atomics.store(meta, index, 0);
  status.fill(SLOT_EMPTY);
  locks.fill(0);
  new Uint32Array(arena.victimCursorBuffer).fill(0);
  new Uint32Array(arena.termChunkHeadBuffer).fill(TERM_CHUNK_END);
  new Uint16Array(arena.termSpanCapacityBuffer).fill(0);
  new Uint8Array(arena.recordBuffer).fill(INITIAL_SEARCH_RECORD);
  // Generations deliberately survive reset so old handles can never alias the
  // first descriptor installed in the next quiescent epoch.
}

export function createSemanticSharedTtView(arena) {
  assertSemanticSharedTtArena(arena);
  const meta = new Int32Array(arena.metaBuffer);
  const status = new Int32Array(arena.statusBuffer);
  const generation = new Uint32Array(arena.generationBuffer);
  const bucketLocks = new Int32Array(arena.bucketLockBuffer);
  const victimCursor = new Uint32Array(arena.victimCursorBuffer);
  const hashLo = new Uint32Array(arena.hashLoBuffer);
  const hashHi = new Uint32Array(arena.hashHiBuffer);
  const support = new Uint32Array(arena.supportBuffer);
  const termChunkHead = new Uint32Array(arena.termChunkHeadBuffer);
  const p0Length = new Uint16Array(arena.p0LengthBuffer);
  const p1Length = new Uint16Array(arena.p1LengthBuffer);
  const termSpanCapacity = new Uint16Array(arena.termSpanCapacityBuffer);
  const records = new Uint8Array(arena.recordBuffer);
  const terms = new Uint16Array(arena.termBuffer);
  const bucketMask = arena.bucketCount - 1;
  let descriptorTermScratch = new Uint16Array(1024);
  const metrics = {
    probes: 0,
    probeMisses: 0,
    ensures: 0,
    hits: 0,
    inserts: 0,
    replacements: 0,
    poisonedInstalls: 0,
    nonExactVictims: 0,
    exactVictims: 0,
    descriptorCompares: 0,
    hashCollisions: 0,
    bucketLockWaits: 0,
    proofWriterWaits: 0,
    termIdsPublished: 0,
    termIdsAllocated: 0,
    termArenaWordsAllocated: 0,
    termChunkAllocations: 0,
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

  function ensureDescriptorTermScratch(required) {
    if (!Number.isInteger(required) || required < 0 || required > UINT16_MAX) {
      throw new RangeError(`semantic descriptor scratch length ${required} is invalid`);
    }
    if (required <= descriptorTermScratch.length) return descriptorTermScratch;
    descriptorTermScratch = new Uint16Array(nextPowerOfTwo(required));
    return descriptorTermScratch;
  }

  function materializeDescriptorTerms(descriptor, total) {
    const target = ensureDescriptorTermScratch(total);
    const written = writeSemanticQuotientTermIds(descriptor, target, 0);
    if (written !== total) throw new Error(`semantic descriptor materialization drift: expected ${total}, wrote ${written}`);
    return target;
  }

  function chunkNext(start) {
    if (!Number.isInteger(start) || start < 0 || start + TERM_CHUNK_HEADER_WORDS > terms.length) {
      throw new Error(`semantic TT chunk start ${start} is invalid`);
    }
    return (terms[start] | (terms[start + 1] << 16)) >>> 0;
  }

  function setChunkNext(start, next) {
    if (!Number.isInteger(start) || start < 0 || start + TERM_CHUNK_HEADER_WORDS > terms.length) {
      throw new Error(`semantic TT chunk start ${start} is invalid`);
    }
    if (!Number.isInteger(next) || next < 0 || next > UINT32_MAX) throw new RangeError(`semantic TT chunk next ${next} is invalid`);
    terms[start] = next & UINT16_MAX;
    terms[start + 1] = (next >>> 16) & UINT16_MAX;
  }

  function chunkCapacity(start) {
    if (!Number.isInteger(start) || start < 0 || start + TERM_CHUNK_HEADER_WORDS > terms.length) {
      throw new Error(`semantic TT chunk start ${start} is invalid`);
    }
    return terms[start + 2];
  }

  function termsEqual(head, expected, total) {
    let logical = 0;
    let chunk = head;
    while (logical < total) {
      if (chunk === TERM_CHUNK_END) return false;
      const capacity = chunkCapacity(chunk);
      if (capacity < 1) return false;
      const take = Math.min(capacity, total - logical);
      const dataStart = chunk + TERM_CHUNK_HEADER_WORDS;
      if (dataStart + take > terms.length) return false;
      for (let offset = 0; offset < take; offset += 1) {
        if (terms[dataStart + offset] !== expected[logical + offset]) return false;
      }
      logical += take;
      chunk = chunkNext(chunk);
    }
    return true;
  }

  function descriptorEquals(slot, descriptor) {
    metrics.descriptorCompares += 1;
    if (support[slot] !== descriptor.supportIndex) return false;
    const p0Count = semanticQuotientP0Length(descriptor);
    const p1Count = semanticQuotientP1Length(descriptor);
    if (p0Length[slot] !== p0Count || p1Length[slot] !== p1Count) return false;
    const total = p0Count + p1Count;
    const expected = materializeDescriptorTerms(descriptor, total);
    return termsEqual(termChunkHead[slot], expected, total);
  }

  function allocateTerms(total) {
    if (!Number.isInteger(total) || total < 1) throw new RangeError(`semantic TT allocation length ${total} is invalid`);
    while (true) {
      const current = Atomics.load(meta, META_TERM_NEXT);
      const next = current + total;
      if (!Number.isSafeInteger(next) || next > arena.termCapacity) {
        throw new Error(`semantic TT term arena exhausted: ${next} > ${arena.termCapacity}`);
      }
      if (Atomics.compareExchange(meta, META_TERM_NEXT, current, next) === current) return current;
    }
  }

  function addSharedCounter(index, delta) {
    if (!Number.isInteger(index) || index < 0 || index >= META_WORDS) throw new RangeError(`invalid shared counter index ${index}`);
    if (!Number.isInteger(delta) || delta < 0) throw new RangeError(`invalid shared counter delta ${delta}`);
    while (true) {
      const current = Atomics.load(meta, index);
      const next = current + delta;
      if (next > INT32_MAX) throw new RangeError(`semantic TT shared counter ${index} exceeded Int32 domain`);
      if (Atomics.compareExchange(meta, index, current, next) === current) return next;
    }
  }

  function incrementSharedCounter(index) {
    return addSharedCounter(index, 1);
  }

  function allocateTermChunk(dataCapacity, nextHead) {
    if (!Number.isInteger(dataCapacity) || dataCapacity < 1 || dataCapacity > UINT16_MAX) {
      throw new RangeError(`semantic TT chunk data capacity ${dataCapacity} is outside Uint16 domain`);
    }
    const words = TERM_CHUNK_HEADER_WORDS + dataCapacity;
    const start = allocateTerms(words);
    setChunkNext(start, nextHead);
    terms[start + 2] = dataCapacity;
    addSharedCounter(META_TERM_DATA_CAPACITY, dataCapacity);
    incrementSharedCounter(META_TERM_CHUNK_COUNT);
    metrics.termIdsAllocated += dataCapacity;
    metrics.termArenaWordsAllocated += words;
    metrics.termChunkAllocations += 1;
    return start;
  }

  function writeDescriptorTerms(head, expected, total) {
    let logical = 0;
    let chunk = head;
    while (logical < total) {
      if (chunk === TERM_CHUNK_END) throw new Error('semantic TT descriptor chunk chain ended before logical descriptor');
      const capacity = chunkCapacity(chunk);
      if (capacity < 1) throw new Error(`semantic TT descriptor chunk ${chunk} has zero data capacity`);
      const take = Math.min(capacity, total - logical);
      const dataStart = chunk + TERM_CHUNK_HEADER_WORDS;
      if (dataStart + take > terms.length) throw new Error(`semantic TT descriptor chunk ${chunk} exceeds term arena`);
      for (let offset = 0; offset < take; offset += 1) terms[dataStart + offset] = expected[logical + offset];
      logical += take;
      chunk = chunkNext(chunk);
    }
  }

  function acquireBucket(bucket) {
    if (!Number.isInteger(bucket) || bucket < 0 || bucket >= arena.bucketCount) throw new RangeError(`invalid semantic TT bucket ${bucket}`);
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

  function poisonInstall(slot, error) {
    metrics.poisonedInstalls += 1;
    Atomics.store(status, slot, SLOT_POISONED);
    Atomics.notify(status, slot);
    return error;
  }

  function descriptorStorage(slot, total, replacing) {
    const capacity = replacing ? termSpanCapacity[slot] : 0;
    const head = replacing ? termChunkHead[slot] : TERM_CHUNK_END;
    if (replacing && total <= capacity) {
      incrementSharedCounter(META_TERM_SPAN_REUSE_COUNT);
      metrics.termSpanReuses += 1;
      return { head, capacity };
    }

    const additional = total - capacity;
    let nextHead = head;
    let nextCapacity = capacity;
    if (additional > 0) {
      nextHead = allocateTermChunk(additional, head);
      nextCapacity += additional;
    }
    if (nextCapacity > UINT16_MAX) throw new RangeError(`semantic TT slot capacity ${nextCapacity} exceeds Uint16`);
    if (replacing) {
      incrementSharedCounter(META_TERM_SPAN_GROW_COUNT);
      metrics.termSpanGrows += 1;
    }
    return { head: nextHead, capacity: nextCapacity };
  }

  function installDescriptor(slot, descriptor, replacing) {
    const p0Count = semanticQuotientP0Length(descriptor);
    const p1Count = semanticQuotientP1Length(descriptor);
    const total = p0Count + p1Count;
    if (total > UINT16_MAX) throw new RangeError('semantic TT combined descriptor exceeds Uint16 slot capacity');
    const expected = materializeDescriptorTerms(descriptor, total);
    const newGeneration = nextGeneration(slot);
    const handle = encodeHandle(slot, newGeneration);
    const storage = descriptorStorage(slot, total, replacing);

    // Once logical payload writing starts the previous descriptor storage may be
    // overwritten in-place. Any later failure therefore poisons the physical slot;
    // callers must never restore READY/EMPTY and expose ambiguous descriptor bytes.
    if (total > 0) writeDescriptorTerms(storage.head, expected, total);
    hashLo[slot] = descriptor.hash.lo;
    hashHi[slot] = descriptor.hash.hi;
    support[slot] = descriptor.supportIndex;
    termChunkHead[slot] = storage.head;
    p0Length[slot] = p0Count;
    p1Length[slot] = p1Count;
    termSpanCapacity[slot] = storage.capacity;
    Atomics.store(records, slot, INITIAL_SEARCH_RECORD);
    Atomics.store(generation, slot, newGeneration);

    metrics.termIdsPublished += total;
    if (replacing) {
      incrementSharedCounter(META_REPLACEMENT_COUNT);
      metrics.replacements += 1;
    } else {
      incrementSharedCounter(META_ENTRY_COUNT);
      metrics.inserts += 1;
    }

    Atomics.store(status, slot, SLOT_READY);
    Atomics.notify(status, slot);
    return handle;
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

  function probe(inputDescriptor) {
    const descriptor = assertDescriptor(inputDescriptor);
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
      if (proofLower(record) !== proofUpper(record)) return { slot, lane, exact: false };
    }
    if (firstReady >= 0) return { slot: firstReady, lane: firstReadyLane, exact: true };
    return null;
  }

  function ensure(inputDescriptor) {
    const descriptor = assertDescriptor(inputDescriptor);
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
          if (state === SLOT_POISONED) {
            throw new Error(`semantic TT poisoned slot ${slot} observed in bucket ${bucket}; quiescent reset required`);
          }
          if (state === SLOT_READY || state === SLOT_PROOF_WRITING) {
            const handle = stableDescriptorHandle(slot, descriptor);
            if (handle >= 0) {
              metrics.hits += 1;
              return handle;
            }
            continue;
          }
          throw new Error(`semantic TT slot ${slot} has invalid state ${state}`);
        }

        if (emptySlot >= 0) {
          const prior = Atomics.compareExchange(status, emptySlot, SLOT_EMPTY, SLOT_DESCRIPTOR_WRITING);
          if (prior !== SLOT_EMPTY) continue;
          try {
            return installDescriptor(emptySlot, descriptor, false);
          } catch (error) {
            throw poisonInstall(emptySlot, error);
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
          throw poisonInstall(victim.slot, error);
        }
      }
    } finally {
      releaseBucket(bucket);
    }
  }

  function stats() {
    const termArenaWordsUsed = Atomics.load(meta, META_TERM_NEXT);
    const termIdsUsed = Atomics.load(meta, META_TERM_DATA_CAPACITY);
    return Object.freeze({
      ...metrics,
      entries: Atomics.load(meta, META_ENTRY_COUNT),
      replacementsShared: Atomics.load(meta, META_REPLACEMENT_COUNT),
      termSpanReusesShared: Atomics.load(meta, META_TERM_SPAN_REUSE_COUNT),
      termSpanGrowsShared: Atomics.load(meta, META_TERM_SPAN_GROW_COUNT),
      termChunkCountShared: Atomics.load(meta, META_TERM_CHUNK_COUNT),
      termIdsUsed,
      termArenaWordsUsed,
      termHeaderWordsUsed: termArenaWordsUsed - termIdsUsed,
      entryCapacity: arena.entryCapacity,
      associativity: arena.associativity,
      bucketCount: arena.bucketCount,
      generationLimit: arena.generationLimit,
      termCapacity: arena.termCapacity,
    });
  }

  return Object.freeze({ probe, ensure, stats, metrics });
}
