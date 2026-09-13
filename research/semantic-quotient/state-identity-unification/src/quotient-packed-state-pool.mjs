import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-negamax-domain-contract.mjs';

const UNKNOWN = -3;
function power(value) {
  if (!Number.isInteger(value) || value < 1 || value > 2 ** 29) throw new RangeError('invalid state capacity');
  let n = 1; while (n < value) n *= 2; return n;
}
function mix(value) {
  let x = value >>> 0; x ^= x >>> 16; x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15; x = Math.imul(x, 0x846ca68b); return (x ^ (x >>> 16)) >>> 0;
}
const pairHash = (lo, hi) => mix(lo ^ Math.imul(hi, 0x9e3779b1));
const wideHash = (lo, hi, third) => mix(lo ^ Math.imul(hi, 0x9e3779b1) ^ Math.imul(third, 0x85ebca6b));

// Initialization-only layout compilation. The wider representation preserves
// the full supported domain; a 64-bit optimization never truncates identity.
export function createPackedStateLayout(supportCapacity, classCapacity) {
  for (const n of [supportCapacity, classCapacity]) {
    if (!Number.isSafeInteger(n) || n < 1 || n > 2 ** 32) throw new RangeError('invalid identity capacity');
  }
  const s = Math.ceil(Math.log2(supportCapacity)), c = Math.ceil(Math.log2(classCapacity));
  const supportMask = (2 ** s - 1) >>> 0, classMask = (2 ** c - 1) >>> 0;
  if (s + 2 * c > 64) return Object.freeze({ words: 3, supportBits: s, classBits: c,
    low: a => a, high: (a, b) => b, third: (a, b, d) => d,
    support: lo => lo, p0: (lo, hi) => hi, p1: (lo, hi, third) => third, hash: wideHash });
  let low, high, p0, p1;
  if (s + 2 * c <= 32) {
    low = (a, b, d) => (a | (b << s) | (d << (s + c))) >>> 0;
    high = () => 0;
    p0 = lo => ((lo >>> s) & classMask) >>> 0;
    p1 = lo => ((lo >>> (s + c)) & classMask) >>> 0;
  } else if (s + c < 32) {
    low = (a, b, d) => (a | (b << s) | (d << (s + c))) >>> 0;
    high = (a, b, d) => d >>> (32 - s - c);
    p0 = lo => ((lo >>> s) & classMask) >>> 0;
    p1 = (lo, hi) => (((lo >>> (s + c)) | (hi << (32 - s - c))) & classMask) >>> 0;
  } else if (s + c === 32) {
    low = (a, b) => (a | (b << s)) >>> 0;
    high = (a, b, d) => d;
    p0 = lo => ((lo >>> s) & classMask) >>> 0;
    p1 = (lo, hi) => hi;
  } else if (s === 32) {
    low = a => a; high = (a, b, d) => (b | (d << c)) >>> 0;
    p0 = (lo, hi) => (hi & classMask) >>> 0;
    p1 = (lo, hi) => hi >>> c;
  } else {
    low = (a, b) => (a | (b << s)) >>> 0;
    high = (a, b, d) => ((b >>> (32 - s)) | (d << (s + c - 32))) >>> 0;
    p0 = (lo, hi) => (((lo >>> s) | (hi << (32 - s))) & classMask) >>> 0;
    p1 = (lo, hi) => hi >>> (s + c - 32);
  }
  return Object.freeze({ words: 2, supportBits: s, classBits: c, low, high, third: () => 0,
    support: lo => (lo & supportMask) >>> 0, p0, p1, hash: pairHash });
}

export class PackedQuotientStatePool {
  #supportCapacity;
  #classes;
  #classLimit = 2 ** 32;
  #layout;
  #words;
  #slots;
  #sealed = false;
  #supportRead;
  #p0Read;
  #p1Read;
  #partsRead;
  #lastValidatedState = -1;
  supportAt(id) { return this.#supportRead(id); }
  p0At(id) { return this.#p0Read(id); }
  p1At(id) { return this.#p1Read(id); }
  writeStateParts(id, target) {
    if (id !== this.#lastValidatedState) this.#assertState(id);
    this.#lastValidatedState = -1;
    this.#partsRead(id, target);
  }
  #count = 0;
  #capacity = 4096;
  get count() { return this.#count; }
  get capacity() { return this.#capacity; }

  constructor(columns, cacheEdges, supportCapacity, classes) {
    this.columns = columns; this.cacheEdges = cacheEdges;
    this.#supportCapacity = supportCapacity; this.#classes = classes;
    this.#count = 0; this.#capacity = 4096;
    this.#layout = createPackedStateLayout(supportCapacity, this.#classLimit);
    this.#words = new Uint32Array(this.#capacity * this.#layout.words);
    this.#slots = new Int32Array(8192); this.#slots.fill(-1);
    this.edges = cacheEdges ? new Int32Array(this.#capacity * columns).fill(UNKNOWN) : null;
    this.metrics = { internLookups: 0, internHits: 0, internMisses: 0, hashGrows: 0, stateGrows: 0 };
    this.#bindReaders();
  }

  #assertState(id) {
    if (!Number.isInteger(id) || id < 0 || id >= this.#count) throw new RangeError('invalid quotient state id');
  }
  #bindReaders() {
    const layout = this.#layout, s = layout.supportBits, c = layout.classBits;
    const supportMask = (2 ** s - 1) >>> 0, classMask = (2 ** c - 1) >>> 0;
    if (layout.words === 3) {
      this.#supportRead = id => { this.#assertState(id); return this.#words[id * 3]; };
      this.#p0Read = id => { this.#assertState(id); return this.#words[id * 3 + 1]; };
      this.#p1Read = id => { this.#assertState(id); return this.#words[id * 3 + 2]; };
    } else {
      this.#supportRead = id => { this.#assertState(id); return (this.#words[id * 2] & supportMask) >>> 0; };
      if (s + c <= 32) {
        this.#p0Read = id => { this.#assertState(id); return ((this.#words[id * 2] >>> s) & classMask) >>> 0; };
      } else if (s === 32) {
        this.#p0Read = id => { this.#assertState(id); return (this.#words[id * 2 + 1] & classMask) >>> 0; };
      } else {
        this.#p0Read = id => {
          this.#assertState(id); const at = id * 2;
          return (((this.#words[at] >>> s) | (this.#words[at + 1] << (32 - s))) & classMask) >>> 0;
        };
      }
      if (s + 2 * c <= 32) {
        this.#p1Read = id => { this.#assertState(id); return ((this.#words[id * 2] >>> (s + c)) & classMask) >>> 0; };
      } else if (s + c < 32) {
        this.#p1Read = id => {
          this.#assertState(id); const at = id * 2;
          return (((this.#words[at] >>> (s + c)) | (this.#words[at + 1] << (32 - s - c))) & classMask) >>> 0;
        };
      } else {
        this.#p1Read = id => { this.#assertState(id); return this.#words[id * 2 + 1] >>> (s + c - 32); };
      }
    }
    this.#partsRead = (id, target) => {
      const at = id * layout.words, lo = this.#words[at], hi = this.#words[at + 1];
      target.supportIndex = layout.support(lo);
      target.p0ClassId = layout.p0(lo, hi);
      target.p1ClassId = layout.p1(lo, hi, layout.words === 3 ? this.#words[at + 2] : 0);
    };
    if (layout.words === 2 && s > 0 && s < 32 && s + c > 32) {
      this.#partsRead = (id, target) => {
        const at = id * 2, lo = this.#words[at], hi = this.#words[at + 1];
        target.supportIndex = (lo & supportMask) >>> 0;
        target.p0ClassId = (((lo >>> s) | (hi << (32 - s))) & classMask) >>> 0;
        target.p1ClassId = hi >>> (s + c - 32);
      };
    }
  }
  #buildSlots(words, layout, capacity) {
    const slots = new Int32Array(capacity); slots.fill(-1);
    const mask = capacity - 1, stride = layout.words;
    for (let id = 0; id < this.#count; id++) {
      const at = id * stride;
      let slot = layout.hash(words[at], words[at + 1], stride === 3 ? words[at + 2] : 0) & mask;
      while (slots[slot] !== -1) slot = (slot + 1) & mask;
      slots[slot] = id;
    }
    return slots;
  }
  estimateReservedBytes(required, classCapacity = this.#classLimit) {
    power(required);
    const capacity = power(Math.max(required, this.#capacity));
    const layout = createPackedStateLayout(this.#supportCapacity, classCapacity);
    return capacity * (layout.words * 4 + (this.cacheEdges ? this.columns * 4 : 0))
      + Math.max(this.#slots.length, capacity * 2) * 4;
  }
  reserveForSearch(required, classCapacity = this.#classLimit) {
    if (this.#sealed) return this.#capacity;
    power(required);
    const capacity = power(Math.max(required, this.#capacity));
    const layout = createPackedStateLayout(this.#supportCapacity, classCapacity);
    if (classCapacity < this.#classes.size) throw new RangeError('class reservation excludes live identity');
    const words = new Uint32Array(capacity * layout.words);
    for (let id = 0; id < this.#count; id++) {
      const a = this.supportAt(id), b = this.p0At(id), d = this.p1At(id), at = id * layout.words;
      words[at] = layout.low(a, b, d); words[at + 1] = layout.high(a, b, d);
      if (layout.words === 3) words[at + 2] = d;
    }
    const slots = this.#buildSlots(words, layout, Math.max(this.#slots.length, capacity * 2));
    const edges = this.cacheEdges ? new Int32Array(capacity * this.columns).fill(UNKNOWN) : null;
    if (edges) edges.set(this.edges);
    // Publish only after every allocation and copy succeeds. State IDs survive.
    if (capacity > this.#capacity) this.metrics.stateGrows++;
    if (slots.length > this.#slots.length) this.metrics.hashGrows++;
    this.#words = words; this.#slots = slots; this.edges = edges; this.#capacity = capacity;
    this.#layout = layout; this.#classLimit = classCapacity; this.#sealed = true; this.#bindReaders();
    return capacity;
  }
  #growPayload() {
    if (this.#sealed) throw new RangeError('reserved quotient state capacity exhausted');
    const capacity = power(this.#capacity * 2), words = new Uint32Array(capacity * this.#layout.words);
    words.set(this.#words);
    const edges = this.cacheEdges ? new Int32Array(capacity * this.columns).fill(UNKNOWN) : null;
    if (edges) edges.set(this.edges);
    this.#words = words; this.edges = edges; this.#capacity = capacity; this.metrics.stateGrows++;
  }
  intern(a, b, d) {
    if (!Number.isInteger(a) || a < 0 || a >= this.#supportCapacity
        || !Number.isInteger(b) || b < 0 || b >= this.#classes.size || b >= this.#classLimit
        || !Number.isInteger(d) || d < 0 || d >= this.#classes.size || d >= this.#classLimit) {
      throw new RangeError('invalid quotient identity');
    }
    this.metrics.internLookups++;
    const layout = this.#layout, stride = layout.words, lo = layout.low(a, b, d), hi = layout.high(a, b, d);
    if ((this.#count + 1) * 10 >= this.#slots.length * 7) {
      if (this.#sealed || this.#slots.length >= 2 ** 30) throw new RangeError('quotient state hash capacity exhausted');
      this.#slots = this.#buildSlots(this.#words, layout, this.#slots.length * 2); this.metrics.hashGrows++;
    }
    const mask = this.#slots.length - 1;
    let slot = layout.hash(lo, hi, d) & mask;
    while (true) {
      const id = this.#slots[slot]; if (id === -1) break;
      const at = id * stride;
      if (((this.#words[at] ^ lo) | (this.#words[at + 1] ^ hi)) === 0
          && (stride === 2 || this.#words[at + 2] === d)) { this.metrics.internHits++; return id; }
      slot = (slot + 1) & mask;
    }
    if (this.#count === this.#capacity) this.#growPayload();
    const id = this.#count, at = id * stride;
    this.#words[at] = lo; this.#words[at + 1] = hi; if (stride === 3) this.#words[at + 2] = d;
    this.#slots[slot] = id; this.#count++; this.metrics.internMisses++; return id;
  }
  #assertEdge(id, column) {
    this.#assertState(id);
    if (!Number.isInteger(column) || column < 0 || column >= this.columns) throw new RangeError('invalid quotient edge column');
  }
  edgeAt(id, column) {
    this.#assertEdge(id, column);
    this.#lastValidatedState = id;
    return this.edges ? this.edges[id * this.columns + column] : UNKNOWN;
  }
  setEdge(id, column, target) {
    this.#assertEdge(id, column);
    if (target !== QN_ILLEGAL && target !== QN_TERMINAL_WIN
        && (!Number.isInteger(target) || target < 0 || target >= this.#count)) throw new RangeError('invalid quotient edge target');
    if (this.edges) this.edges[id * this.columns + column] = target;
  }
  memoryStats() {
    const stateArrayBytes = this.#words.byteLength, edgeCacheBytes = this.edges?.byteLength ?? 0, hashSlotBytes = this.#slots.byteLength;
    return Object.freeze({ stateCount: this.#count, stateCapacity: this.#capacity, stateArrayBytes,
      identityWords: this.#layout.words, supportBits: this.#layout.supportBits, classBits: this.#layout.classBits,
      edgeCacheBytes, hashSlotBytes, totalTypedBytes: stateArrayBytes + edgeCacheBytes + hashSlotBytes });
  }
}