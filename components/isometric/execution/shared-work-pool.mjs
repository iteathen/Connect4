// Shared numeric execution substrate for IsoMax decentralized worker pull.
// Semantic q truth remains manager-owned. This module owns execution reservation
// and bounded E2 transport only.

export const MAX_MOVES = 42;
export const PRIORITY_BANDS = 8;

export const WORK_FREE = 0;
export const WORK_WRITING = 1;
export const WORK_READY = 2;
export const WORK_RUNNING = 3;
export const WORK_DONE = 4;

export const SESSION_IDLE = 0;
export const SESSION_RUNNING = 1;
export const SESSION_STOP = 2;

export const PUB_CHILD = 1;
export const PUB_FRONTIER_END = 2;
export const PUB_EXACT = 3;
export const PUB_RETIRED = 4;
export const PUB_FAILURE = 5;

export const CTRL_ABORT = 0;
export const CTRL_SESSION = 1;
export const CTRL_WAKE = 2;
export const CTRL_WORK_NEXT = 3;
export const CTRL_FREE_WAKE = 4;
export const CTRL_PUB_WAKE = 5;
export const CTRL_FAILURE = 6;
export const CTRL_WORDS = 16;

export const WC_CLAIMS = 0;
export const WC_EXACT = 1;
export const WC_FRONTIERS = 2;
export const WC_CHILDREN = 3;
export const WC_DETERMINISTIC = 4;
export const WC_RETIRED = 5;
export const WC_STALE_QUEUE = 6;
export const WC_QUEUE_DEQUEUES = 7;
export const WC_FREE_WAITS = 8;
export const WC_PATH_REPLAYS = 9;
export const WC_TRANSITIONS = 10;
export const WC_FRONTIER_EVALS = 11;
export const WC_BAND_BASE = 16;
export const WC_WORDS = 24;

function positive(value, name, maximum = 1 << 28) {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new RangeError('invalid ' + name);
  }
  return value;
}

function sabI32(length) {
  return new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * length);
}

function initializeRingSequence(buffer, lanes, capacity) {
  const sequence = new Int32Array(buffer);
  for (let lane = 0; lane < lanes; lane++) {
    const base = lane * capacity;
    for (let index = 0; index < capacity; index++) sequence[base + index] = index;
  }
}

export function createSharedWorkPool({
  workCapacity,
  workerCount,
  publicationCapacity = Math.max(1024, Math.min(workCapacity * 2, 1 << 20)),
  queueCapacity = workCapacity,
} = {}) {
  positive(workCapacity, 'workCapacity');
  positive(workerCount, 'workerCount', 256);
  positive(publicationCapacity, 'publicationCapacity');
  positive(queueCapacity, 'queueCapacity');

  const descriptor = Object.freeze({
    workCapacity,
    workerCount,
    publicationCapacity,
    queueCapacity,
    bands: PRIORITY_BANDS,
    control: sabI32(CTRL_WORDS),

    workState: sabI32(workCapacity),
    workGeneration: sabI32(workCapacity),
    workTicket: sabI32(workCapacity),
    workPriority: sabI32(workCapacity),
    workQ: sabI32(workCapacity),
    workWorker: sabI32(workCapacity),
    workNeeded: sabI32(workCapacity),
    workPathLength: sabI32(workCapacity),
    workAffinity: sabI32(workCapacity),
    workAttempt: sabI32(workCapacity),
    workResult: sabI32(workCapacity),
    workPath: new SharedArrayBuffer(workCapacity * MAX_MOVES),

    queueSequence: sabI32(PRIORITY_BANDS * queueCapacity),
    queueSlot: sabI32(PRIORITY_BANDS * queueCapacity),
    queueGeneration: sabI32(PRIORITY_BANDS * queueCapacity),
    queueTicket: sabI32(PRIORITY_BANDS * queueCapacity),
    queueEnqueue: sabI32(PRIORITY_BANDS),
    queueDequeue: sabI32(PRIORITY_BANDS),

    freeSequence: sabI32(workCapacity),
    freeSlot: sabI32(workCapacity),
    freeEnqueue: sabI32(1),
    freeDequeue: sabI32(1),

    publicationSequence: sabI32(publicationCapacity),
    publicationKind: sabI32(publicationCapacity),
    publicationA: sabI32(publicationCapacity),
    publicationB: sabI32(publicationCapacity),
    publicationC: sabI32(publicationCapacity),
    publicationD: sabI32(publicationCapacity),
    publicationE: sabI32(publicationCapacity),
    publicationF: sabI32(publicationCapacity),
    publicationG: sabI32(publicationCapacity),
    publicationEnqueue: sabI32(1),
    publicationDequeue: sabI32(1),

    preferredSlot: sabI32(workerCount),
    preferredGeneration: sabI32(workerCount),
    preferredTicket: sabI32(workerCount),
    preferredBand: sabI32(workerCount),
    workerAlive: sabI32(workerCount),

    workerCounters: sabI32(workerCount * WC_WORDS),
  });

  initializeRingSequence(descriptor.queueSequence, PRIORITY_BANDS, queueCapacity);
  initializeRingSequence(descriptor.freeSequence, 1, workCapacity);
  initializeRingSequence(descriptor.publicationSequence, 1, publicationCapacity);

  const pool = openSharedWorkPool(descriptor);
  pool.workQ.fill(-1);
  pool.workWorker.fill(-1);
  pool.workAffinity.fill(-1);
  pool.preferredSlot.fill(-1);
  pool.preferredGeneration.fill(-1);
  pool.preferredTicket.fill(-1);
  pool.preferredBand.fill(-1);
  pool.workerAlive.fill(1);
  return descriptor;
}

export function openSharedWorkPool(descriptor) {
  if (!descriptor || !Number.isSafeInteger(descriptor.workCapacity)) {
    throw new TypeError('invalid shared work-pool descriptor');
  }
  return {
    descriptor,
    workCapacity: descriptor.workCapacity,
    workerCount: descriptor.workerCount,
    publicationCapacity: descriptor.publicationCapacity,
    queueCapacity: descriptor.queueCapacity,
    bands: descriptor.bands,

    control: new Int32Array(descriptor.control),
    workState: new Int32Array(descriptor.workState),
    workGeneration: new Int32Array(descriptor.workGeneration),
    workTicket: new Int32Array(descriptor.workTicket),
    workPriority: new Int32Array(descriptor.workPriority),
    workQ: new Int32Array(descriptor.workQ),
    workWorker: new Int32Array(descriptor.workWorker),
    workNeeded: new Int32Array(descriptor.workNeeded),
    workPathLength: new Int32Array(descriptor.workPathLength),
    workAffinity: new Int32Array(descriptor.workAffinity),
    workAttempt: new Int32Array(descriptor.workAttempt),
    workResult: new Int32Array(descriptor.workResult),
    workPath: new Uint8Array(descriptor.workPath),

    queueSequence: new Int32Array(descriptor.queueSequence),
    queueSlot: new Int32Array(descriptor.queueSlot),
    queueGeneration: new Int32Array(descriptor.queueGeneration),
    queueTicket: new Int32Array(descriptor.queueTicket),
    queueEnqueue: new Int32Array(descriptor.queueEnqueue),
    queueDequeue: new Int32Array(descriptor.queueDequeue),

    freeSequence: new Int32Array(descriptor.freeSequence),
    freeSlot: new Int32Array(descriptor.freeSlot),
    freeEnqueue: new Int32Array(descriptor.freeEnqueue),
    freeDequeue: new Int32Array(descriptor.freeDequeue),

    publicationSequence: new Int32Array(descriptor.publicationSequence),
    publicationKind: new Int32Array(descriptor.publicationKind),
    publicationA: new Int32Array(descriptor.publicationA),
    publicationB: new Int32Array(descriptor.publicationB),
    publicationC: new Int32Array(descriptor.publicationC),
    publicationD: new Int32Array(descriptor.publicationD),
    publicationE: new Int32Array(descriptor.publicationE),
    publicationF: new Int32Array(descriptor.publicationF),
    publicationG: new Int32Array(descriptor.publicationG),
    publicationEnqueue: new Int32Array(descriptor.publicationEnqueue),
    publicationDequeue: new Int32Array(descriptor.publicationDequeue),

    preferredSlot: new Int32Array(descriptor.preferredSlot),
    preferredGeneration: new Int32Array(descriptor.preferredGeneration),
    preferredTicket: new Int32Array(descriptor.preferredTicket),
    preferredBand: new Int32Array(descriptor.preferredBand),
    workerAlive: new Int32Array(descriptor.workerAlive),

    workerCounters: new Int32Array(descriptor.workerCounters),
  };
}

function ringEnqueue(sequence, enqueue, lane, capacity, payloadWriter) {
  const base = lane * capacity;
  for (let spins = 0; spins < 1024; spins++) {
    const position = Atomics.load(enqueue, lane);
    const cell = base + (position % capacity);
    const seq = Atomics.load(sequence, cell);
    const difference = seq - position;
    if (difference === 0) {
      if (Atomics.compareExchange(enqueue, lane, position, position + 1) !== position) continue;
      payloadWriter(cell);
      Atomics.store(sequence, cell, position + 1);
      return true;
    }
    if (difference < 0) return false;
  }
  return false;
}

function ringDequeue(sequence, dequeue, lane, capacity, payloadReader) {
  const base = lane * capacity;
  for (let spins = 0; spins < 1024; spins++) {
    const position = Atomics.load(dequeue, lane);
    const cell = base + (position % capacity);
    const seq = Atomics.load(sequence, cell);
    const difference = seq - (position + 1);
    if (difference === 0) {
      if (Atomics.compareExchange(dequeue, lane, position, position + 1) !== position) continue;
      payloadReader(cell);
      Atomics.store(sequence, cell, position + capacity);
      return true;
    }
    if (difference < 0) return false;
  }
  return false;
}

export function enqueueReady(pool, slot, generation, band) {
  if (band < 0 || band >= pool.bands) throw new RangeError('invalid work priority band');
  if (Atomics.load(pool.workGeneration, slot) !== generation) return false;
  if (Atomics.load(pool.workState, slot) !== WORK_READY) return false;
  let ticket = 0;
  const queued = ringEnqueue(pool.queueSequence, pool.queueEnqueue, band, pool.queueCapacity, (cell) => {
    ticket = Atomics.add(pool.workTicket, slot, 1) + 1;
    Atomics.store(pool.workPriority, slot, band);
    pool.queueSlot[cell] = slot;
    pool.queueGeneration[cell] = generation;
    pool.queueTicket[cell] = ticket;
  });
  if (!queued) return false;
  Atomics.add(pool.control, CTRL_WAKE, 1);
  Atomics.notify(pool.control, CTRL_WAKE);
  const affinity = Atomics.load(pool.workAffinity, slot);
  if (affinity >= 0 && affinity < pool.workerCount) {
    Atomics.store(pool.preferredSlot, affinity, slot);
    Atomics.store(pool.preferredGeneration, affinity, generation);
    Atomics.store(pool.preferredTicket, affinity, ticket);
    Atomics.store(pool.preferredBand, affinity, band);
  }
  return true;
}

function tryClaimPreferred(pool, workerIndex, minimumBand, claimScratch) {
  const slot = Atomics.load(pool.preferredSlot, workerIndex);
  if (slot < 0 || slot >= pool.workCapacity) return false;
  const generation = Atomics.load(pool.preferredGeneration, workerIndex);
  const ticket = Atomics.load(pool.preferredTicket, workerIndex);
  const band = Atomics.load(pool.preferredBand, workerIndex);
  if (band < minimumBand) return false;
  if (Atomics.load(pool.workGeneration, slot) !== generation ||
      Atomics.load(pool.workTicket, slot) !== ticket ||
      Atomics.load(pool.workPriority, slot) !== band ||
      Atomics.load(pool.workNeeded, slot) === 0) return false;
  if (Atomics.compareExchange(pool.workState, slot, WORK_READY, WORK_RUNNING) !== WORK_READY) return false;
  Atomics.store(pool.workWorker, slot, workerIndex);
  const attempt = Atomics.add(pool.workAttempt, slot, 1) + 1;
  claimScratch[0] = slot;
  claimScratch[1] = generation;
  claimScratch[2] = attempt;
  claimScratch[3] = band;
  return true;
}

export function claimHighestReady(pool, workerIndex, claimScratch, queueScratch) {
  let highest = -1;
  for (let band = pool.bands - 1; band >= 0; band--) {
    if (Atomics.load(pool.queueDequeue, band) < Atomics.load(pool.queueEnqueue, band)) {
      highest = band;
      break;
    }
  }
  if (highest >= 0 && tryClaimPreferred(pool, workerIndex, highest, claimScratch)) return true;

  for (let band = pool.bands - 1; band >= 0; band--) {
    while (ringDequeue(pool.queueSequence, pool.queueDequeue, band, pool.queueCapacity, (cell) => {
      queueScratch[0] = pool.queueSlot[cell];
      queueScratch[1] = pool.queueGeneration[cell];
      queueScratch[2] = pool.queueTicket[cell];
    })) {
      const slot = queueScratch[0];
      const generation = queueScratch[1];
      const ticket = queueScratch[2];
      const counterBase = workerIndex * WC_WORDS;
      Atomics.add(pool.workerCounters, counterBase + WC_QUEUE_DEQUEUES, 1);
      if (slot < 0 || slot >= pool.workCapacity ||
          Atomics.load(pool.workGeneration, slot) !== generation ||
          Atomics.load(pool.workTicket, slot) !== ticket ||
          Atomics.load(pool.workPriority, slot) !== band ||
          Atomics.load(pool.workNeeded, slot) === 0) {
        Atomics.add(pool.workerCounters, counterBase + WC_STALE_QUEUE, 1);
        continue;
      }
      if (Atomics.compareExchange(pool.workState, slot, WORK_READY, WORK_RUNNING) !== WORK_READY) {
        Atomics.add(pool.workerCounters, counterBase + WC_STALE_QUEUE, 1);
        continue;
      }
      Atomics.store(pool.workWorker, slot, workerIndex);
      const attempt = Atomics.add(pool.workAttempt, slot, 1) + 1;
      claimScratch[0] = slot;
      claimScratch[1] = generation;
      claimScratch[2] = attempt;
      claimScratch[3] = band;
      return true;
    }
  }
  return false;
}

function enqueueFree(pool, slot) {
  const queued = ringEnqueue(pool.freeSequence, pool.freeEnqueue, 0, pool.workCapacity, (cell) => {
    pool.freeSlot[cell] = slot;
  });
  if (!queued) throw new Error('ISOMAX_PULL_FREE_RING_CAPACITY');
  Atomics.add(pool.control, CTRL_FREE_WAKE, 1);
  Atomics.notify(pool.control, CTRL_FREE_WAKE);
}

function dequeueFree(pool, scratch) {
  return ringDequeue(pool.freeSequence, pool.freeDequeue, 0, pool.workCapacity, (cell) => {
    scratch[0] = pool.freeSlot[cell];
  });
}

export function allocateWorkSlot(pool, scratch) {
  let slot;
  if (dequeueFree(pool, scratch)) slot = scratch[0];
  else {
    slot = Atomics.add(pool.control, CTRL_WORK_NEXT, 1);
    if (slot >= pool.workCapacity) return -1;
  }
  const generation = Atomics.add(pool.workGeneration, slot, 1) + 1;
  Atomics.store(pool.workState, slot, WORK_WRITING);
  Atomics.store(pool.workTicket, slot, 0);
  Atomics.store(pool.workPriority, slot, 0);
  Atomics.store(pool.workQ, slot, -1);
  Atomics.store(pool.workWorker, slot, -1);
  Atomics.store(pool.workNeeded, slot, 1);
  Atomics.store(pool.workPathLength, slot, 0);
  Atomics.store(pool.workAffinity, slot, -1);
  Atomics.store(pool.workResult, slot, 0);
  scratch[0] = slot;
  scratch[1] = generation;
  return slot;
}

export function releaseWorkSlot(pool, slot, generation) {
  if (slot < 0 || slot >= pool.workCapacity) return false;
  if (Atomics.load(pool.workGeneration, slot) !== generation) return false;
  if (Atomics.load(pool.workState, slot) === WORK_RUNNING) return false;
  Atomics.store(pool.workNeeded, slot, 0);
  Atomics.store(pool.workQ, slot, -1);
  Atomics.store(pool.workWorker, slot, -1);
  Atomics.store(pool.workPathLength, slot, 0);
  Atomics.store(pool.workAffinity, slot, -1);
  Atomics.store(pool.workState, slot, WORK_FREE);
  enqueueFree(pool, slot);
  return true;
}

export function retireWorkSlot(pool, slot, generation) {
  if (slot < 0 || slot >= pool.workCapacity) return false;
  if (Atomics.load(pool.workGeneration, slot) !== generation) return false;
  Atomics.store(pool.workNeeded, slot, 0);
  const state = Atomics.load(pool.workState, slot);
  if (state === WORK_READY || state === WORK_WRITING) {
    Atomics.store(pool.workState, slot, WORK_DONE);
    return releaseWorkSlot(pool, slot, generation);
  }
  return state === WORK_RUNNING || state === WORK_DONE;
}

export function copyPathBetweenSlots(pool, sourceSlot, targetSlot, appendColumn = -1) {
  const length = Atomics.load(pool.workPathLength, sourceSlot);
  if (length < 0 || length > MAX_MOVES) throw new Error('invalid shared work path length');
  const extra = appendColumn >= 0 ? 1 : 0;
  if (length + extra > MAX_MOVES) throw new RangeError('shared work path exceeds board capacity');
  const sourceBase = sourceSlot * MAX_MOVES;
  const targetBase = targetSlot * MAX_MOVES;
  for (let index = 0; index < length; index++) pool.workPath[targetBase + index] = pool.workPath[sourceBase + index];
  if (extra) pool.workPath[targetBase + length] = appendColumn;
  Atomics.store(pool.workPathLength, targetSlot, length + extra);
  return length + extra;
}

export function writePathFromState(pool, slot, state, appendColumn = -1) {
  const extra = appendColumn >= 0 ? 1 : 0;
  if (state.ply + extra > MAX_MOVES) throw new RangeError('state path exceeds shared work capacity');
  const base = slot * MAX_MOVES;
  for (let ply = 0; ply < state.ply; ply++) pool.workPath[base + ply] = state.moveCells[ply] % 7;
  if (extra) pool.workPath[base + state.ply] = appendColumn;
  Atomics.store(pool.workPathLength, slot, state.ply + extra);
}

export function publishRecord(pool, kind, a = 0, b = 0, c = 0, d = 0, e = 0, f = 0, g = 0) {
  const queued = ringEnqueue(pool.publicationSequence, pool.publicationEnqueue, 0, pool.publicationCapacity, (cell) => {
    pool.publicationKind[cell] = kind;
    pool.publicationA[cell] = a;
    pool.publicationB[cell] = b;
    pool.publicationC[cell] = c;
    pool.publicationD[cell] = d;
    pool.publicationE[cell] = e;
    pool.publicationF[cell] = f;
    pool.publicationG[cell] = g;
  });
  if (!queued) return false;
  Atomics.add(pool.control, CTRL_PUB_WAKE, 1);
  Atomics.notify(pool.control, CTRL_PUB_WAKE);
  return true;
}

export function dequeuePublication(pool, scratch) {
  const dequeued = ringDequeue(pool.publicationSequence, pool.publicationDequeue, 0, pool.publicationCapacity, (cell) => {
    scratch[0] = pool.publicationKind[cell];
    scratch[1] = pool.publicationA[cell];
    scratch[2] = pool.publicationB[cell];
    scratch[3] = pool.publicationC[cell];
    scratch[4] = pool.publicationD[cell];
    scratch[5] = pool.publicationE[cell];
    scratch[6] = pool.publicationF[cell];
    scratch[7] = pool.publicationG[cell];
  });
  if (dequeued) {
    Atomics.add(pool.control, CTRL_PUB_WAKE, 1);
    Atomics.notify(pool.control, CTRL_PUB_WAKE);
  }
  return dequeued;
}

export function markReady(pool, slot, generation, band, affinityWorker = -1) {
  if (Atomics.load(pool.workGeneration, slot) !== generation) return false;
  Atomics.store(pool.workAffinity, slot, affinityWorker);
  Atomics.store(pool.workNeeded, slot, 1);
  let state = Atomics.load(pool.workState, slot);
  if (state === WORK_WRITING) {
    const observed = Atomics.compareExchange(pool.workState, slot, WORK_WRITING, WORK_READY);
    state = observed === WORK_WRITING ? WORK_READY : observed;
  }
  // Reconciliation may already have reprioritized, claimed or retired this
  // occurrence after FRONTIER_END. Never overwrite that newer state.
  if (state === WORK_RUNNING || state === WORK_DONE || state === WORK_FREE) return true;
  if (state !== WORK_READY) return false;
  if (Atomics.load(pool.workTicket, slot) !== 0) return true;
  return enqueueReady(pool, slot, generation, band);
}

export function stopSharedPool(pool) {
  Atomics.store(pool.control, CTRL_SESSION, SESSION_STOP);
  Atomics.add(pool.control, CTRL_WAKE, 1);
  Atomics.notify(pool.control, CTRL_WAKE, Infinity);
  Atomics.add(pool.control, CTRL_FREE_WAKE, 1);
  Atomics.notify(pool.control, CTRL_FREE_WAKE, Infinity);
}
