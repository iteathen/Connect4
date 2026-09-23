import { mix32 } from '../../../vendor/jsminsys/src/mix32.mjs';
import { atomicTryClaim32, atomicReleaseNoNotify32 } from '../../../vendor/jsminsys/src/atomic32.mjs';

export const LOCK = 0, ERROR = 1, STOP = 2, FREE = 3, LIVE = 4;
export const READY_HEAD = 5, READY_TAIL = 6, EVENT_HEAD = 7, EVENT_TAIL = 8;
export const DONE = 9, ROOT = 10, ROOT_GENERATION = 11, WAKE = 12;
export const CAPACITY = 1, CONFLICT = 2, GENERATION = 3, CONTRACT = 4;
export const WORKER_DIED = 5, DEADLINE = 6, CANCELLED = 7;
export const KEY_WORDS = 42, ACTIONS = 7;

// COLD: all view/object construction and initialization precedes execution.
export function createTT(capacity = 4096, bucketCount = 4096) {
  if (!Number.isSafeInteger(capacity) || capacity < 1 || capacity > 0x1000000 ||
      !Number.isSafeInteger(bucketCount) || bucketCount < 1 ||
      bucketCount > 0x1000000 || (bucketCount & (bucketCount - 1))) {
    throw new RangeError('invalid fixed TT capacity/bucket count');
  }
  const u32 = n => new Uint32Array(new SharedArrayBuffer(n * 4));
  const i32 = n => new Int32Array(new SharedArrayBuffer(n * 4));
  const t = {
    capacity, bucketMask: bucketCount - 1,
    control: i32(16), buckets: i32(bucketCount), keys: u32(capacity * KEY_WORDS),
    generation: u32(capacity), live: u32(capacity), refs: u32(capacity),
    execution: u32(capacity), exact: u32(capacity), phase: u32(capacity),
    link: i32(capacity), bucket: u32(capacity), readyNext: i32(capacity),
    readyGeneration: u32(capacity), eventNext: i32(capacity), event: u32(capacity),
    count: u32(capacity), parentHead: i32(capacity), witness: i32(capacity),
    child: i32(capacity * ACTIONS), childGeneration: u32(capacity * ACTIONS),
    edgeNext: i32(capacity * ACTIONS), edgePrev: i32(capacity * ACTIONS),
    edgeAction: u32(capacity * ACTIONS), edgeAttached: u32(capacity * ACTIONS),
  };
  t.buckets.fill(-1); t.parentHead.fill(-1); t.witness.fill(-1); t.child.fill(-1);
  t.control[READY_HEAD] = t.control[READY_TAIL] = -1;
  t.control[EVENT_HEAD] = t.control[EVENT_TAIL] = -1;
  t.control[ROOT] = -1;
  for (let q = 0; q < capacity; q++) t.link[q] = q + 1;
  t.link[capacity - 1] = -1;
  return t;
}

// E2 CONTRACT — KEEP THESE COMMENTS AND THEIR TRANSITIVE HELPER CONTRACTS.
// Every mutation below requires sole transaction ownership (enter/leave), or
// exclusive cold setup. Kernel computation NEVER runs under this lock. No
// dynamic aggregate, string, callback, copying API, or hidden resize belongs
// here. Failure is numeric. A dead lock owner fails the session; no takeover.
export function enter(t, owner) {
  if (Atomics.load(t.control, STOP)) return 0;
  return atomicTryClaim32(t.control, LOCK, 0, owner) ? 1 : 0;
}
export function leave(t) { atomicReleaseNoNotify32(t.control, LOCK, 0); }
export function fail(t, code) {
  Atomics.compareExchange(t.control, ERROR, 0, code);
  Atomics.store(t.control, STOP, 1);
  Atomics.add(t.control, WAKE, 1);
  Atomics.notify(t.control, WAKE);
  return 0;
}
export function valid(t, q, generation) {
  return q >= 0 && q < t.capacity && t.live[q] && t.generation[q] === generation;
}

// Input: canonical standard-7x6 q, support/flags/20+20 residual words.
// Returns one OWNED pin, including hits. Hash locates; every word decides equality.
export function intern(t, words, offset) {
  let hash = 0;
  for (let w = 0; w < KEY_WORDS; w++) hash = mix32(hash ^ words[offset + w]);
  const bucket = hash & t.bucketMask;
  for (let q = t.buckets[bucket]; q !== -1; q = t.link[q]) {
    const base = q * KEY_WORDS;
    let w = 0;
    while (w < KEY_WORDS && t.keys[base + w] === words[offset + w]) w++;
    if (w === KEY_WORDS) {
      if (t.refs[q] === 0xffffffff) { fail(t, CAPACITY); return -1; }
      t.refs[q]++;
      return q;
    }
  }
  const q = t.control[FREE];
  if (q < 0) { fail(t, CAPACITY); return -1; }
  if (t.generation[q] === 0xffffffff) { fail(t, GENERATION); return -1; }
  t.control[FREE] = t.link[q];
  const base = q * KEY_WORDS;
  // Necessary new-key insertion writes authoritative content once. No manager
  // copy, replay, serialized identity, or second q payload is created.
  for (let w = 0; w < KEY_WORDS; w++) t.keys[base + w] = words[offset + w];
  t.generation[q]++;
  t.live[q] = 1; t.refs[q] = 1; t.exact[q] = 0; t.phase[q] = 0;
  t.execution[q] = 0; t.count[q] = 0; t.parentHead[q] = -1;
  t.event[q] = 0; t.witness[q] = -1;
  t.bucket[q] = bucket; t.link[q] = t.buckets[bucket]; t.buckets[bucket] = q;
  t.control[LIVE]++;
  return q;
}
export function retain(t, q, generation) {
  if (!valid(t, q, generation)) return 0;
  if (t.refs[q] === 0xffffffff) return fail(t, CAPACITY);
  t.refs[q]++;
  return 1;
}
export function release(t, q, generation) {
  if (!valid(t, q, generation) || t.refs[q] === 0) return 0;
  t.refs[q]--;
  if (t.refs[q] === 0 && t.count[q]) signal(t, q);
  recycle(t, q);
  return 1;
}
export function recycle(t, q) {
  if (!t.live[q] || t.refs[q] || t.execution[q] || t.event[q] ||
      t.count[q] || t.parentHead[q] !== -1) return 0;
  const bucket = t.bucket[q];
  let previous = -1;
  let scan = t.buckets[bucket];
  while (scan !== q && scan !== -1) { previous = scan; scan = t.link[scan]; }
  if (scan === -1) return fail(t, CONTRACT);
  if (previous === -1) t.buckets[bucket] = t.link[q];
  else t.link[previous] = t.link[q];
  t.live[q] = 0; t.link[q] = t.control[FREE]; t.control[FREE] = q;
  t.control[LIVE]--;
  return 1;
}

// Intrusive queue fields live in q; queued execution prevents reuse. Ticket
// generation is checked before claim. No independently authoritative work row.
export function enqueue(t, q) {
  if (!t.live[q] || !t.refs[q] || t.execution[q] || t.exact[q] || t.phase[q]) return 0;
  t.execution[q] = 1;
  t.readyGeneration[q] = t.generation[q]; t.readyNext[q] = -1;
  const tail = t.control[READY_TAIL];
  if (tail === -1) t.control[READY_HEAD] = q;
  else t.readyNext[tail] = q;
  t.control[READY_TAIL] = q;
  return 1;
}
export function take(t, owner) {
  let q = t.control[READY_HEAD];
  while (q !== -1) {
    t.control[READY_HEAD] = t.readyNext[q];
    if (t.control[READY_HEAD] === -1) t.control[READY_TAIL] = -1;
    if (!valid(t, q, t.readyGeneration[q]) || t.execution[q] !== 1) {
      fail(t, CONTRACT); return -1;
    }
    t.execution[q] = 0;
    if (t.refs[q] && !t.exact[q]) { t.execution[q] = owner; return q; }
    recycle(t, q);
    q = t.control[READY_HEAD];
  }
  return -1;
}
export function releaseExecution(t, q, owner) {
  if (t.execution[q] !== owner) return fail(t, CONTRACT);
  t.execution[q] = 0;
  recycle(t, q);
  return 1;
}

// Event membership pins q. Exact publication does NOT end worker access.
export function signal(t, q) {
  if (t.event[q]) return;
  t.event[q] = 1; t.eventNext[q] = -1;
  const tail = t.control[EVENT_TAIL];
  if (tail === -1) t.control[EVENT_HEAD] = q;
  else t.eventNext[tail] = q;
  t.control[EVENT_TAIL] = q;
}
export function takeEvent(t) {
  const q = t.control[EVENT_HEAD];
  if (q === -1) return -1;
  t.control[EVENT_HEAD] = t.eventNext[q];
  if (t.control[EVENT_HEAD] === -1) t.control[EVENT_TAIL] = -1;
  t.event[q] = 0;
  return q;
}
export function setExact(t, q, code) {
  if (code < 1 || code > 3) return fail(t, CONTRACT);
  if (t.exact[q] && t.exact[q] !== code) return fail(t, CONFLICT);
  t.exact[q] = code;
  signal(t, q);
  return 1;
}
