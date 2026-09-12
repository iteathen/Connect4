import {
  SHARED_INITIAL_RECORD,
} from './quotient-shared-graph-lib.mjs';

const SLOT_EMPTY = 0;
const SLOT_PUBLISHING = 1;
const SLOT_READY = 2;
const META_TERM_NEXT = 0;
const META_ENTRY_COUNT = 1;
const META_WORDS = 2;

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

function foldTermIds(ids, seed, multiplier) {
  let hash = seed >>> 0;
  for (let index = 0; index < ids.length; index += 1) {
    hash = Math.imul(hash ^ ((ids[index] + 1) >>> 0), multiplier) >>> 0;
    hash = mix32(hash ^ index);
  }
  return mix32(hash ^ ids.length);
}

export function hashResidualTermIds(ids) {
  return Object.freeze({
    lo: foldTermIds(ids, 0x811c9dc5, 0x01000193),
    hi: foldTermIds(ids, 0x9e3779b9, 0x85ebca6b),
  });
}

export function hashSemanticQuotientDescriptor(supportIndex, p0Hash, p1Hash, p0Length, p1Length) {
  let lo = mix32((supportIndex + 0x9e3779b9) >>> 0);
  lo = mix32(lo ^ p0Hash.lo ^ Math.imul((p0Length + 1) >>> 0, 0x85ebca6b));
  lo = mix32(lo ^ p1Hash.lo ^ Math.imul((p1Length + 1) >>> 0, 0xc2b2ae35));
  let hi = mix32((supportIndex ^ 0xa5a5a5a5) >>> 0);
  hi = mix32(hi ^ p0Hash.hi ^ Math.imul((p0Length + 3) >>> 0, 0x27d4eb2d));
  hi = mix32(hi ^ p1Hash.hi ^ Math.imul((p1Length + 5) >>> 0, 0x165667b1));
  return Object.freeze({ lo, hi });
}

export function createSemanticSharedTtArena(options = {}) {
  const requestedEntries = options.entryCapacity ?? (1 << 19);
  const entryCapacity = nextPowerOfTwo(requestedEntries);
  const termCapacity = options.termCapacity ?? (1 << 24);
  if (!Number.isInteger(termCapacity) || termCapacity < 1) throw new RangeError('termCapacity must be positive');

  const metaBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * META_WORDS);
  const statusBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * entryCapacity);
  const hashLoBuffer = new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT * entryCapacity);
  const hashHiBuffer = new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT * entryCapacity);
  const supportBuffer = new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT * entryCapacity);
  const p0StartBuffer = new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT * entryCapacity);
  const p1StartBuffer = new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT * entryCapacity);
  const p0LengthBuffer = new SharedArrayBuffer(Uint16Array.BYTES_PER_ELEMENT * entryCapacity);
  const p1LengthBuffer = new SharedArrayBuffer(Uint16Array.BYTES_PER_ELEMENT * entryCapacity);
  const recordBuffer = new SharedArrayBuffer(Uint8Array.BYTES_PER_ELEMENT * entryCapacity);
  const termBuffer = new SharedArrayBuffer(Uint16Array.BYTES_PER_ELEMENT * termCapacity);
  new Uint8Array(recordBuffer).fill(SHARED_INITIAL_RECORD);

  return Object.freeze({
    kind: 'connect4-exact-semantic-shared-tt-v1',
    entryCapacity,
    termCapacity,
    metaBuffer,
    statusBuffer,
    hashLoBuffer,
    hashHiBuffer,
    supportBuffer,
    p0StartBuffer,
    p1StartBuffer,
    p0LengthBuffer,
    p1LengthBuffer,
    recordBuffer,
    termBuffer,
  });
}

export function resetSemanticSharedTtArena(arena) {
  new Int32Array(arena.metaBuffer).fill(0);
  new Int32Array(arena.statusBuffer).fill(SLOT_EMPTY);
  new Uint8Array(arena.recordBuffer).fill(SHARED_INITIAL_RECORD);
}

export function createSemanticSharedTtView(arena) {
  const meta = new Int32Array(arena.metaBuffer);
  const status = new Int32Array(arena.statusBuffer);
  const hashLo = new Uint32Array(arena.hashLoBuffer);
  const hashHi = new Uint32Array(arena.hashHiBuffer);
  const support = new Uint32Array(arena.supportBuffer);
  const p0Start = new Uint32Array(arena.p0StartBuffer);
  const p1Start = new Uint32Array(arena.p1StartBuffer);
  const p0Length = new Uint16Array(arena.p0LengthBuffer);
  const p1Length = new Uint16Array(arena.p1LengthBuffer);
  const records = new Uint8Array(arena.recordBuffer);
  const terms = new Uint16Array(arena.termBuffer);
  const mask = arena.entryCapacity - 1;
  const metrics = {
    lookups: 0,
    hits: 0,
    inserts: 0,
    descriptorCompares: 0,
    hashCollisions: 0,
    publishWaits: 0,
    termIdsPublished: 0,
    maxProbe: 0,
  };

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

  function publish(slot, descriptor) {
    const p0Count = descriptor.p0.ids.length;
    const p1Count = descriptor.p1.ids.length;
    const total = p0Count + p1Count;
    const start = Atomics.add(meta, META_TERM_NEXT, total);
    if (start + total > arena.termCapacity) {
      Atomics.store(status, slot, SLOT_EMPTY);
      Atomics.notify(status, slot);
      throw new Error(`semantic TT term arena exhausted: ${start + total} > ${arena.termCapacity}`);
    }
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
    records[slot] = SHARED_INITIAL_RECORD;
    Atomics.add(meta, META_ENTRY_COUNT, 1);
    metrics.inserts += 1;
    metrics.termIdsPublished += total;
    Atomics.store(status, slot, SLOT_READY);
    Atomics.notify(status, slot);
  }

  function findOrCreate(descriptor) {
    metrics.lookups += 1;
    let slot = descriptor.hash.lo & mask;
    let probe = 0;
    while (probe < arena.entryCapacity) {
      let state = Atomics.load(status, slot);
      if (state === SLOT_EMPTY) {
        const prior = Atomics.compareExchange(status, slot, SLOT_EMPTY, SLOT_PUBLISHING);
        if (prior === SLOT_EMPTY) {
          publish(slot, descriptor);
          if (probe > metrics.maxProbe) metrics.maxProbe = probe;
          return slot;
        }
        state = prior;
      }

      if (state === SLOT_PUBLISHING) {
        metrics.publishWaits += 1;
        Atomics.wait(status, slot, SLOT_PUBLISHING, 1);
        continue;
      }

      if (state === SLOT_READY) {
        if (hashLo[slot] === descriptor.hash.lo && hashHi[slot] === descriptor.hash.hi) {
          if (descriptorEquals(slot, descriptor)) {
            metrics.hits += 1;
            if (probe > metrics.maxProbe) metrics.maxProbe = probe;
            return slot;
          }
          metrics.hashCollisions += 1;
        }
        slot = (slot + 1) & mask;
        probe += 1;
        continue;
      }

      throw new Error(`invalid semantic TT slot state ${state}`);
    }
    throw new Error('semantic TT entry table exhausted');
  }

  function stats() {
    return Object.freeze({
      ...metrics,
      entries: Atomics.load(meta, META_ENTRY_COUNT),
      termIdsUsed: Atomics.load(meta, META_TERM_NEXT),
      entryCapacity: arena.entryCapacity,
      termCapacity: arena.termCapacity,
    });
  }

  return Object.freeze({ findOrCreate, records, stats, metrics });
}
