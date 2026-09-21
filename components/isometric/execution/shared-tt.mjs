import { FRONTIER_WORDS } from '../profile.mjs';

export const MAX_MOVES = 42;
export const MAX_ACTIONS = 7;
export const Q_PLAYER_WORDS = FRONTIER_WORDS;
export const Q_IDENTITY_WORDS = FRONTIER_WORDS * 2;
export const PRIORITY_BANDS = 8;

export const Q_EXACT_UNKNOWN = 2;

export const EXEC_NONE = 0;
export const EXEC_QUEUED = 1;
export const EXEC_RUNNING_BASE = 2;

export const CTRL_ABORT = 0;
export const CTRL_SESSION = 1;
export const CTRL_Q_NEXT = 2;
export const CTRL_FREE_HEAD = 3;
export const CTRL_ROOT_Q = 4;
export const CTRL_ROOT_GENERATION = 5;
export const CTRL_ROOT_ORIENTATION = 6;
export const CTRL_ROOT_VALUE = 7;
export const CTRL_ROOT_MOVE = 8;
export const CTRL_MANAGER_WAKE = 9;
export const CTRL_WORKER_WAKE = 10;
export const CTRL_WORKERS_READY = 11;
export const CTRL_WORKERS_DONE = 12;
export const CTRL_ERROR = 13;
export const CTRL_Q_HIGH_WATER = 14;
export const CTRL_EDGE_NEXT = 15;
export const CTRL_EDGE_FREE_HEAD = 16;
export const CTRL_WORDS = 32;

export const SESSION_IDLE = 0;
export const SESSION_RUNNING = 1;
export const SESSION_DONE = 2;
export const SESSION_FAILED = 3;

function positive(value, name, maximum = 2 ** 30) {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new RangeError('invalid ' + name);
  }
  return value;
}

function powerOfTwo(value, name) {
  positive(value, name);
  if ((value & (value - 1)) !== 0) throw new RangeError(name + ' must be a power of two');
  return value;
}

function nextPowerOfTwo(value) {
  let result = 1;
  while (result < value) result <<= 1;
  return result;
}

function sab(Type, length) {
  return new SharedArrayBuffer(Type.BYTES_PER_ELEMENT * length);
}

function view(Type, buffer) {
  return new Type(buffer);
}

function mix32(value) {
  let x = value | 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x | 0;
}

export function hashPortableQ(words, support, flags) {
  let hash = Math.imul(0x811c9dc5 ^ mix32(support), 0x01000193);
  hash = Math.imul(hash ^ mix32(flags), 0x01000193);
  for (let index = 0; index < Q_IDENTITY_WORDS; index++) {
    hash = Math.imul(hash ^ mix32(words[index]), 0x01000193);
  }
  return mix32(hash ^ Q_IDENTITY_WORDS);
}

export function runningExecution(workerId) {
  return EXEC_RUNNING_BASE + workerId;
}

export function executionWorker(execution) {
  return execution >= EXEC_RUNNING_BASE ? execution - EXEC_RUNNING_BASE : -1;
}

export function createSharedTT({
  qCapacity = 65536,
  workerCount = 4,
  queueCapacity = 16384,
  bucketCount = nextPowerOfTwo(qCapacity * 2),
  edgeCapacity = qCapacity * MAX_ACTIONS,
} = {}) {
  positive(qCapacity, 'qCapacity', 2 ** 24);
  positive(workerCount, 'workerCount', 256);
  powerOfTwo(queueCapacity, 'queueCapacity');
  powerOfTwo(bucketCount, 'bucketCount');
  positive(edgeCapacity, 'edgeCapacity', 2 ** 27);
  if (bucketCount < qCapacity) throw new RangeError('bucketCount must be >= qCapacity');

  const descriptor = {
    qCapacity,
    workerCount,
    queueCapacity,
    bucketCount,
    edgeCapacity,
    control: sab(Int32Array, CTRL_WORDS),
    qGeneration: sab(Int32Array, qCapacity),
    qLive: sab(Int32Array, qCapacity),
    qHash: sab(Int32Array, qCapacity),
    qSupport: sab(Uint32Array, qCapacity),
    qFlags: sab(Int32Array, qCapacity),
    qExact: sab(Int32Array, qCapacity),
    qExecution: sab(Int32Array, qCapacity),
    qPriorityClass: sab(Int32Array, qCapacity),
    qPriorityDepth: sab(Int32Array, qCapacity),
    qFanIn: sab(Int32Array, qCapacity),
    qRefCount: sab(Int32Array, qCapacity),
    qReplayLength: sab(Int32Array, qCapacity),
    qHashNext: sab(Int32Array, qCapacity),
    qFreeNext: sab(Int32Array, qCapacity),
    qParentHead: sab(Int32Array, qCapacity),
    qChildMask: sab(Int32Array, qCapacity),
    qReductionMaximizing: sab(Int32Array, qCapacity),
    qWords: sab(Uint32Array, qCapacity * Q_IDENTITY_WORDS),
    qReplay: sab(Uint8Array, qCapacity * MAX_MOVES),
    qChildIndex: sab(Int32Array, qCapacity * MAX_ACTIONS),
    qChildGeneration: sab(Int32Array, qCapacity * MAX_ACTIONS),
    qChildEval: sab(Int32Array, qCapacity * MAX_ACTIONS),
    edgeParentQ: sab(Int32Array, edgeCapacity),
    edgeParentGeneration: sab(Int32Array, edgeCapacity),
    edgeChildQ: sab(Int32Array, edgeCapacity),
    edgeChildGeneration: sab(Int32Array, edgeCapacity),
    edgeAction: sab(Int32Array, edgeCapacity),
    edgeNextIncoming: sab(Int32Array, edgeCapacity),
    edgeFreeNext: sab(Int32Array, edgeCapacity),
    bucketHead: sab(Int32Array, bucketCount),
    bucketLock: sab(Int32Array, bucketCount),
    queueEnqueue: sab(Int32Array, PRIORITY_BANDS),
    queueDequeue: sab(Int32Array, PRIORITY_BANDS),
    queueSequence: sab(Int32Array, PRIORITY_BANDS * queueCapacity),
    queueQ: sab(Int32Array, PRIORITY_BANDS * queueCapacity),
    queueGeneration: sab(Int32Array, PRIORITY_BANDS * queueCapacity),
    workerReset: sab(Int32Array, workerCount),
  };

  const shared = openSharedTT(descriptor);
  shared.qExact.fill(Q_EXACT_UNKNOWN);
  shared.qHashNext.fill(-1);
  shared.qFreeNext.fill(-1);
  shared.qParentHead.fill(-1);
  shared.qChildIndex.fill(-1);
  shared.edgeParentQ.fill(-1);
  shared.edgeChildQ.fill(-1);
  shared.edgeNextIncoming.fill(-1);
  shared.edgeFreeNext.fill(-1);
  shared.bucketHead.fill(-1);
  Atomics.store(shared.control, CTRL_FREE_HEAD, -1);
  Atomics.store(shared.control, CTRL_EDGE_FREE_HEAD, -1);
  Atomics.store(shared.control, CTRL_ROOT_Q, -1);
  Atomics.store(shared.control, CTRL_ROOT_GENERATION, 0);
  Atomics.store(shared.control, CTRL_ROOT_VALUE, Q_EXACT_UNKNOWN);
  Atomics.store(shared.control, CTRL_ROOT_MOVE, -1);
  for (let band = 0; band < PRIORITY_BANDS; band++) {
    const base = band * queueCapacity;
    for (let offset = 0; offset < queueCapacity; offset++) {
      shared.queueSequence[base + offset] = offset;
      shared.queueQ[base + offset] = -1;
    }
  }
  return descriptor;
}

export function openSharedTT(descriptor) {
  if (!descriptor || !Number.isInteger(descriptor.qCapacity)) {
    throw new TypeError('invalid shared TT descriptor');
  }
  return {
    ...descriptor,
    control: view(Int32Array, descriptor.control),
    qGeneration: view(Int32Array, descriptor.qGeneration),
    qLive: view(Int32Array, descriptor.qLive),
    qHash: view(Int32Array, descriptor.qHash),
    qSupport: view(Uint32Array, descriptor.qSupport),
    qFlags: view(Int32Array, descriptor.qFlags),
    qExact: view(Int32Array, descriptor.qExact),
    qExecution: view(Int32Array, descriptor.qExecution),
    qPriorityClass: view(Int32Array, descriptor.qPriorityClass),
    qPriorityDepth: view(Int32Array, descriptor.qPriorityDepth),
    qFanIn: view(Int32Array, descriptor.qFanIn),
    qRefCount: view(Int32Array, descriptor.qRefCount),
    qReplayLength: view(Int32Array, descriptor.qReplayLength),
    qHashNext: view(Int32Array, descriptor.qHashNext),
    qFreeNext: view(Int32Array, descriptor.qFreeNext),
    qParentHead: view(Int32Array, descriptor.qParentHead),
    qChildMask: view(Int32Array, descriptor.qChildMask),
    qReductionMaximizing: view(Int32Array, descriptor.qReductionMaximizing),
    qWords: view(Uint32Array, descriptor.qWords),
    qReplay: view(Uint8Array, descriptor.qReplay),
    qChildIndex: view(Int32Array, descriptor.qChildIndex),
    qChildGeneration: view(Int32Array, descriptor.qChildGeneration),
    qChildEval: view(Int32Array, descriptor.qChildEval),
    edgeParentQ: view(Int32Array, descriptor.edgeParentQ),
    edgeParentGeneration: view(Int32Array, descriptor.edgeParentGeneration),
    edgeChildQ: view(Int32Array, descriptor.edgeChildQ),
    edgeChildGeneration: view(Int32Array, descriptor.edgeChildGeneration),
    edgeAction: view(Int32Array, descriptor.edgeAction),
    edgeNextIncoming: view(Int32Array, descriptor.edgeNextIncoming),
    edgeFreeNext: view(Int32Array, descriptor.edgeFreeNext),
    bucketHead: view(Int32Array, descriptor.bucketHead),
    bucketLock: view(Int32Array, descriptor.bucketLock),
    queueEnqueue: view(Int32Array, descriptor.queueEnqueue),
    queueDequeue: view(Int32Array, descriptor.queueDequeue),
    queueSequence: view(Int32Array, descriptor.queueSequence),
    queueQ: view(Int32Array, descriptor.queueQ),
    queueGeneration: view(Int32Array, descriptor.queueGeneration),
    workerReset: view(Int32Array, descriptor.workerReset),
  };
}

function lockBucket(shared, bucket) {
  while (Atomics.compareExchange(shared.bucketLock, bucket, 0, 1) !== 0) {
    Atomics.wait(shared.bucketLock, bucket, 1, 1);
  }
}

function unlockBucket(shared, bucket) {
  Atomics.store(shared.bucketLock, bucket, 0);
  Atomics.notify(shared.bucketLock, bucket, 1);
}

function exactIdentityEquals(shared, qIndex, hash, words, support, flags) {
  if (Atomics.load(shared.qLive, qIndex) === 0) return false;
  if (shared.qHash[qIndex] !== hash
      || shared.qSupport[qIndex] !== (support >>> 0)
      || shared.qFlags[qIndex] !== flags) return false;
  const base = qIndex * Q_IDENTITY_WORDS;
  for (let index = 0; index < Q_IDENTITY_WORDS; index++) {
    if (shared.qWords[base + index] !== (words[index] >>> 0)) return false;
  }
  return true;
}

function popFree(shared) {
  while (true) {
    const head = Atomics.load(shared.control, CTRL_FREE_HEAD);
    if (head < 0) return -1;
    const next = Atomics.load(shared.qFreeNext, head);
    if (Atomics.compareExchange(shared.control, CTRL_FREE_HEAD, head, next) === head) {
      Atomics.store(shared.qFreeNext, head, -1);
      return head;
    }
  }
}

function pushFree(shared, qIndex) {
  while (true) {
    const head = Atomics.load(shared.control, CTRL_FREE_HEAD);
    Atomics.store(shared.qFreeNext, qIndex, head);
    if (Atomics.compareExchange(shared.control, CTRL_FREE_HEAD, head, qIndex) === head) return;
  }
}

function allocateQIndex(shared) {
  const recycled = popFree(shared);
  if (recycled >= 0) return recycled;
  const qIndex = Atomics.add(shared.control, CTRL_Q_NEXT, 1);
  if (qIndex >= shared.qCapacity) return -1;
  let high = Atomics.load(shared.control, CTRL_Q_HIGH_WATER);
  while (qIndex + 1 > high
      && Atomics.compareExchange(shared.control, CTRL_Q_HIGH_WATER, high, qIndex + 1) !== high) {
    high = Atomics.load(shared.control, CTRL_Q_HIGH_WATER);
  }
  return qIndex;
}

function nextGeneration(shared, qIndex) {
  let generation = (Atomics.load(shared.qGeneration, qIndex) + 1) | 0;
  if (generation <= 0) generation = 1;
  Atomics.store(shared.qGeneration, qIndex, generation);
  return generation;
}

export function qIsCurrent(shared, qIndex, generation) {
  return qIndex >= 0
    && qIndex < shared.qCapacity
    && Atomics.load(shared.qLive, qIndex) !== 0
    && Atomics.load(shared.qGeneration, qIndex) === generation;
}

/**
 * Probe/insert exact portable q content. out[0]=qIndex, out[1]=generation,
 * out[2]=created(0/1). The returned reference owns one qRefCount pin.
 */
export function probeOrInsertQ(shared, words, support, flags, replay, replayLength, out) {
  if (!(words instanceof Uint32Array) || words.length < Q_IDENTITY_WORDS) {
    throw new TypeError('portable q requires exact Uint32 identity words');
  }
  if (!(replay instanceof Uint8Array) || !Number.isInteger(replayLength)
      || replayLength < 0 || replayLength > MAX_MOVES || replay.length < replayLength) {
    throw new TypeError('invalid portable replay seed');
  }
  if (!(out instanceof Int32Array) || out.length < 3) throw new TypeError('invalid q result scratch');

  const hash = hashPortableQ(words, support, flags);
  const bucket = hash & (shared.bucketCount - 1);
  lockBucket(shared, bucket);
  try {
    let qIndex = Atomics.load(shared.bucketHead, bucket);
    while (qIndex >= 0) {
      if (exactIdentityEquals(shared, qIndex, hash, words, support, flags)) {
        Atomics.add(shared.qRefCount, qIndex, 1);
        out[0] = qIndex;
        out[1] = Atomics.load(shared.qGeneration, qIndex);
        out[2] = 0;
        return qIndex;
      }
      qIndex = Atomics.load(shared.qHashNext, qIndex);
    }

    qIndex = allocateQIndex(shared);
    if (qIndex < 0) throw new Error('ISOMAX_SHARED_TT_CAPACITY');
    const generation = nextGeneration(shared, qIndex);
    Atomics.store(shared.qLive, qIndex, 0);
    shared.qHash[qIndex] = hash;
    shared.qSupport[qIndex] = support >>> 0;
    shared.qFlags[qIndex] = flags | 0;
    Atomics.store(shared.qExact, qIndex, Q_EXACT_UNKNOWN);
    Atomics.store(shared.qExecution, qIndex, EXEC_NONE);
    Atomics.store(shared.qPriorityClass, qIndex, 0);
    Atomics.store(shared.qPriorityDepth, qIndex, 0);
    Atomics.store(shared.qFanIn, qIndex, 0);
    Atomics.store(shared.qRefCount, qIndex, 1);
    shared.qReplayLength[qIndex] = replayLength;
    Atomics.store(shared.qParentHead, qIndex, -1);
    Atomics.store(shared.qChildMask, qIndex, 0);
    Atomics.store(shared.qReductionMaximizing, qIndex, 0);

    const wordBase = qIndex * Q_IDENTITY_WORDS;
    for (let index = 0; index < Q_IDENTITY_WORDS; index++) {
      shared.qWords[wordBase + index] = words[index] >>> 0;
    }
    const replayBase = qIndex * MAX_MOVES;
    for (let index = 0; index < replayLength; index++) shared.qReplay[replayBase + index] = replay[index];
    for (let index = replayLength; index < MAX_MOVES; index++) shared.qReplay[replayBase + index] = 0;

    const childBase = qIndex * MAX_ACTIONS;
    for (let action = 0; action < MAX_ACTIONS; action++) {
      Atomics.store(shared.qChildIndex, childBase + action, -1);
      Atomics.store(shared.qChildGeneration, childBase + action, 0);
      Atomics.store(shared.qChildEval, childBase + action, 0);
    }

    Atomics.store(shared.qHashNext, qIndex, Atomics.load(shared.bucketHead, bucket));
    Atomics.store(shared.qLive, qIndex, 1);
    Atomics.store(shared.bucketHead, bucket, qIndex);
    out[0] = qIndex;
    out[1] = generation;
    out[2] = 1;
    return qIndex;
  } finally {
    unlockBucket(shared, bucket);
  }
}

export function addQRef(shared, qIndex, generation) {
  if (!qIsCurrent(shared, qIndex, generation)) return false;
  const hash = shared.qHash[qIndex];
  const bucket = hash & (shared.bucketCount - 1);
  lockBucket(shared, bucket);
  try {
    if (!qIsCurrent(shared, qIndex, generation)) return false;
    Atomics.add(shared.qRefCount, qIndex, 1);
    return true;
  } finally {
    unlockBucket(shared, bucket);
  }
}

export function releaseQRef(shared, qIndex, generation) {
  if (!qIsCurrent(shared, qIndex, generation)) return -1;
  const prior = Atomics.sub(shared.qRefCount, qIndex, 1);
  if (prior <= 0) {
    Atomics.add(shared.qRefCount, qIndex, 1);
    throw new Error('shared q reference underflow');
  }
  return prior - 1;
}

export function recycleQIfDead(shared, qIndex, generation) {
  if (!qIsCurrent(shared, qIndex, generation)) return false;
  if (Atomics.load(shared.qRefCount, qIndex) !== 0
      || Atomics.load(shared.qExecution, qIndex) !== EXEC_NONE
      || Atomics.load(shared.qParentHead, qIndex) !== -1
      || Atomics.load(shared.qChildMask, qIndex) !== 0) return false;

  const hash = shared.qHash[qIndex];
  const bucket = hash & (shared.bucketCount - 1);
  lockBucket(shared, bucket);
  try {
    if (!qIsCurrent(shared, qIndex, generation)
        || Atomics.load(shared.qRefCount, qIndex) !== 0
        || Atomics.load(shared.qExecution, qIndex) !== EXEC_NONE
        || Atomics.load(shared.qParentHead, qIndex) !== -1
        || Atomics.load(shared.qChildMask, qIndex) !== 0) return false;

    let current = Atomics.load(shared.bucketHead, bucket);
    let previous = -1;
    while (current >= 0 && current !== qIndex) {
      previous = current;
      current = Atomics.load(shared.qHashNext, current);
    }
    if (current !== qIndex) throw new Error('live q missing from shared hash chain');
    const next = Atomics.load(shared.qHashNext, qIndex);
    if (previous < 0) Atomics.store(shared.bucketHead, bucket, next);
    else Atomics.store(shared.qHashNext, previous, next);

    Atomics.store(shared.qLive, qIndex, 0);
    Atomics.store(shared.qHashNext, qIndex, -1);
    Atomics.store(shared.qExact, qIndex, Q_EXACT_UNKNOWN);
    Atomics.store(shared.qPriorityClass, qIndex, 0);
    Atomics.store(shared.qPriorityDepth, qIndex, 0);
    Atomics.store(shared.qFanIn, qIndex, 0);
    shared.qReplayLength[qIndex] = 0;
    pushFree(shared, qIndex);
    return true;
  } finally {
    unlockBucket(shared, bucket);
  }
}

function queueTryEnqueue(shared, band, qIndex, generation) {
  const capacity = shared.queueCapacity;
  const mask = capacity - 1;
  const base = band * capacity;
  while (true) {
    const position = Atomics.load(shared.queueEnqueue, band);
    const slot = base + (position & mask);
    const sequence = Atomics.load(shared.queueSequence, slot);
    const difference = (sequence - position) | 0;
    if (difference === 0) {
      if (Atomics.compareExchange(shared.queueEnqueue, band, position, position + 1) !== position) continue;
      shared.queueQ[slot] = qIndex;
      shared.queueGeneration[slot] = generation;
      Atomics.store(shared.queueSequence, slot, position + 1);
      Atomics.add(shared.control, CTRL_WORKER_WAKE, 1);
      Atomics.notify(shared.control, CTRL_WORKER_WAKE, Infinity);
      return true;
    }
    if (difference < 0) return false;
  }
}

function queueTryDequeue(shared, band, out) {
  const capacity = shared.queueCapacity;
  const mask = capacity - 1;
  const base = band * capacity;
  while (true) {
    const position = Atomics.load(shared.queueDequeue, band);
    const slot = base + (position & mask);
    const sequence = Atomics.load(shared.queueSequence, slot);
    const difference = (sequence - (position + 1)) | 0;
    if (difference === 0) {
      if (Atomics.compareExchange(shared.queueDequeue, band, position, position + 1) !== position) continue;
      out[0] = shared.queueQ[slot];
      out[1] = shared.queueGeneration[slot];
      Atomics.store(shared.queueSequence, slot, position + capacity);
      return true;
    }
    if (difference < 0) return false;
  }
}

export function enqueueQ(shared, qIndex, generation, priorityClass) {
  if (!qIsCurrent(shared, qIndex, generation)) return false;
  if (Atomics.load(shared.qExact, qIndex) !== Q_EXACT_UNKNOWN) return false;
  const band = Math.max(0, Math.min(PRIORITY_BANDS - 1, priorityClass | 0));
  Atomics.store(shared.qPriorityClass, qIndex, band);
  if (Atomics.compareExchange(shared.qExecution, qIndex, EXEC_NONE, EXEC_QUEUED) !== EXEC_NONE) {
    return false;
  }
  if (queueTryEnqueue(shared, band, qIndex, generation)) return true;
  Atomics.compareExchange(shared.qExecution, qIndex, EXEC_QUEUED, EXEC_NONE);
  throw new Error('ISOMAX_SHARED_QUEUE_CAPACITY');
}

/** out[0]=qIndex,out[1]=generation,out[2]=priorityBand. */
export function claimHighestQ(shared, workerId, out, queueScratch) {
  if (!Number.isInteger(workerId) || workerId < 0 || workerId >= shared.workerCount) {
    throw new RangeError('invalid worker id');
  }
  for (let band = PRIORITY_BANDS - 1; band >= 0; band--) {
    while (queueTryDequeue(shared, band, queueScratch)) {
      const qIndex = queueScratch[0], generation = queueScratch[1];
      if (!qIsCurrent(shared, qIndex, generation)) continue;
      if (Atomics.load(shared.qExact, qIndex) !== Q_EXACT_UNKNOWN) {
        Atomics.compareExchange(shared.qExecution, qIndex, EXEC_QUEUED, EXEC_NONE);
        continue;
      }
      if (Atomics.compareExchange(
        shared.qExecution, qIndex, EXEC_QUEUED, runningExecution(workerId),
      ) !== EXEC_QUEUED) continue;
      if (!qIsCurrent(shared, qIndex, generation)
          || Atomics.load(shared.qExact, qIndex) !== Q_EXACT_UNKNOWN) {
        Atomics.compareExchange(
          shared.qExecution, qIndex, runningExecution(workerId), EXEC_NONE,
        );
        continue;
      }
      out[0] = qIndex;
      out[1] = generation;
      out[2] = band;
      return true;
    }
  }
  return false;
}

/**
 * Try to make a locally retained q the execution leader.
 * Returns workerId when this worker owns it, another worker id when duplicate,
 * -1 when exact/stale.
 */
export function enterLocalQ(shared, qIndex, generation, workerId) {
  if (!qIsCurrent(shared, qIndex, generation)
      || Atomics.load(shared.qExact, qIndex) !== Q_EXACT_UNKNOWN) return -1;
  const desired = runningExecution(workerId);
  while (true) {
    const execution = Atomics.load(shared.qExecution, qIndex);
    if (execution === desired) return workerId;
    if (execution >= EXEC_RUNNING_BASE) return executionWorker(execution);
    if (execution !== EXEC_NONE && execution !== EXEC_QUEUED) return -1;
    if (Atomics.compareExchange(shared.qExecution, qIndex, execution, desired) === execution) {
      return workerId;
    }
    if (!qIsCurrent(shared, qIndex, generation)
        || Atomics.load(shared.qExact, qIndex) !== Q_EXACT_UNKNOWN) return -1;
  }
}

export function releaseRunningQ(shared, qIndex, generation, workerId) {
  if (!qIsCurrent(shared, qIndex, generation)) return false;
  return Atomics.compareExchange(
    shared.qExecution, qIndex, runningExecution(workerId), EXEC_NONE,
  ) === runningExecution(workerId);
}

/** Returns prior execution owner word. */
export function publishExactQ(shared, qIndex, generation, value) {
  if (value !== -1 && value !== 0 && value !== 1) throw new TypeError('invalid exact q WDL');
  if (!qIsCurrent(shared, qIndex, generation)) return -1;
  const prior = Atomics.compareExchange(shared.qExact, qIndex, Q_EXACT_UNKNOWN, value);
  if (prior !== Q_EXACT_UNKNOWN && prior !== value) {
    throw new Error('conflicting shared q exact values');
  }
  return Atomics.exchange(shared.qExecution, qIndex, EXEC_NONE);
}

export function readExactQ(shared, qIndex, generation) {
  if (!qIsCurrent(shared, qIndex, generation)) return Q_EXACT_UNKNOWN;
  return Atomics.load(shared.qExact, qIndex);
}


/** BranchManager-only bounded relationship allocation. Parent edges are
 * topology, never work authority; only q records own execution lifecycle. */
export function allocateParentEdge(shared) {
  let edge = Atomics.load(shared.control, CTRL_EDGE_FREE_HEAD);
  if (edge >= 0) {
    Atomics.store(shared.control, CTRL_EDGE_FREE_HEAD, shared.edgeFreeNext[edge]);
    shared.edgeFreeNext[edge] = -1;
    return edge;
  }
  edge = Atomics.add(shared.control, CTRL_EDGE_NEXT, 1);
  if (edge >= shared.edgeCapacity) throw new Error('ISOMAX_SHARED_EDGE_CAPACITY');
  return edge;
}

export function releaseParentEdge(shared, edge) {
  if (!Number.isInteger(edge) || edge < 0 || edge >= shared.edgeCapacity) {
    throw new RangeError('invalid shared parent edge');
  }
  shared.edgeParentQ[edge] = -1;
  shared.edgeParentGeneration[edge] = 0;
  shared.edgeChildQ[edge] = -1;
  shared.edgeChildGeneration[edge] = 0;
  shared.edgeAction[edge] = 0;
  shared.edgeNextIncoming[edge] = -1;
  const head = Atomics.load(shared.control, CTRL_EDGE_FREE_HEAD);
  shared.edgeFreeNext[edge] = head;
  Atomics.store(shared.control, CTRL_EDGE_FREE_HEAD, edge);
}
