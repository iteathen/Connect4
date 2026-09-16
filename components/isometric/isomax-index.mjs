import { GUARD_APPLICABLE, GUARD_INAPPLICABLE, GUARD_UNRESOLVED, evaluateGuard } from './guards.mjs';
import { canonicalizeCertificatePayload, reflectConclusion } from './certificate.mjs';

function structuralBucket(root, p0Class, p1Class, create) {
  let byP1 = root.get(p0Class);
  if (!byP1) {
    if (!create) return null;
    byP1 = new Map();
    root.set(p0Class, byP1);
  }
  let bucket = byP1.get(p1Class);
  if (!bucket && create) {
    bucket = { certificates: [], byProofIdentity: new Map() };
    byP1.set(p1Class, bucket);
  }
  return bucket ?? null;
}

function canonicalOrientations(signature) {
  if (signature[3] === 1) return [0, 1];
  return [signature[2]];
}

export class IsoMaxCertificateIndex {
  constructor(pool) {
    if (!pool) throw new TypeError('IsoMaxCertificateIndex requires the ResidualPool used by indexed states');
    this.pool = pool;
    this.root = new Map();
    this.nextCertificateId = 1;
    this.size = 0;
  }

  add(state, { guard, conclusion, proofIdentity = null, provenance = null, dependencyCone = null } = {}) {
    if (state.pool !== this.pool) throw new Error('state residual pool does not belong to this IsoMax index');
    if (!guard) throw new TypeError('certificate guard is required');
    if (!conclusion) throw new TypeError('certificate conclusion is required');

    const signature = state.structuralSignature();
    const canonical = canonicalizeCertificatePayload(guard, conclusion, signature[2]);
    const bucket = structuralBucket(this.root, signature[0], signature[1], true);
    if (proofIdentity !== null && bucket.byProofIdentity.has(proofIdentity)) {
      return bucket.byProofIdentity.get(proofIdentity);
    }

    const certificate = Object.freeze({
      id: this.nextCertificateId++,
      p0Class: signature[0],
      p1Class: signature[1],
      guard: canonical.guard,
      conclusion: canonical.conclusion,
      proofIdentity,
      provenance,
      dependencyCone,
    });
    bucket.certificates.push(certificate);
    if (proofIdentity !== null) bucket.byProofIdentity.set(proofIdentity, certificate);
    this.size += 1;
    return certificate;
  }

  lookup(state, { conclusionKind = null } = {}) {
    if (state.pool !== this.pool) throw new Error('state residual pool does not belong to this IsoMax index');
    const signature = state.structuralSignature();
    const bucket = structuralBucket(this.root, signature[0], signature[1], false);
    if (!bucket) return { applicable: [], unresolved: [] };

    const applicable = [];
    const unresolved = [];
    const orientations = canonicalOrientations(signature);
    for (const certificate of bucket.certificates) {
      if (conclusionKind !== null && certificate.conclusion.kind !== conclusionKind) continue;
      let sawUnresolved = false;
      let applied = false;
      for (const orientation of orientations) {
        const result = evaluateGuard(state, certificate.guard, orientation);
        if (result === GUARD_APPLICABLE) {
          const conclusion = orientation === 0 ? certificate.conclusion : reflectConclusion(certificate.conclusion);
          applicable.push(Object.freeze({ certificate, conclusion, orientation }));
          applied = true;
          break;
        }
        if (result === GUARD_UNRESOLVED) sawUnresolved = true;
        else if (result !== GUARD_INAPPLICABLE) throw new Error(`invalid guard evaluation result: ${result}`);
      }
      if (!applied && sawUnresolved) unresolved.push(certificate);
    }
    return { applicable, unresolved };
  }
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

function hashSignature(signature) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < 3; index += 1) hash = Math.imul(hash ^ mix32(signature[index]), 0x01000193) >>> 0;
  return mix32(hash);
}

export class IsoMaxTransitionCache {
  constructor({ initialCapacity = 1024 } = {}) {
    if (!Number.isInteger(initialCapacity) || initialCapacity < 8) throw new RangeError('initialCapacity must be an integer >= 8');
    let capacity = 1;
    while (capacity < initialCapacity) capacity <<= 1;
    this.capacity = capacity;
    this.count = 0;
    this.used = new Uint8Array(capacity);
    this.p0 = new Int32Array(capacity);
    this.p1 = new Int32Array(capacity);
    this.support = new Uint32Array(capacity);
    this.values = new Array(capacity);
    this.scratch = new Int32Array(6);
    this.rehashScratch = new Int32Array(3);
  }

  matches(slot, signature) {
    return this.p0[slot] === signature[0]
      && this.p1[slot] === signature[1]
      && this.support[slot] === (signature[2] >>> 0);
  }

  findSlot(signature) {
    const mask = this.capacity - 1;
    let slot = hashSignature(signature) & mask;
    while (this.used[slot] !== 0 && !this.matches(slot, signature)) slot = (slot + 1) & mask;
    return slot;
  }

  grow() {
    const old = {
      capacity: this.capacity,
      used: this.used,
      p0: this.p0,
      p1: this.p1,
      support: this.support,
      values: this.values,
    };
    this.capacity <<= 1;
    this.count = 0;
    this.used = new Uint8Array(this.capacity);
    this.p0 = new Int32Array(this.capacity);
    this.p1 = new Int32Array(this.capacity);
    this.support = new Uint32Array(this.capacity);
    this.values = new Array(this.capacity);
    const signature = this.rehashScratch;
    for (let slot = 0; slot < old.capacity; slot += 1) {
      if (old.used[slot] === 0) continue;
      signature[0] = old.p0[slot];
      signature[1] = old.p1[slot];
      signature[2] = old.support[slot];
      this.setSignature(signature, old.values[slot]);
    }
  }

  get(state) {
    const signature = state.transitionSignature(this.scratch);
    const slot = this.findSlot(signature);
    return this.used[slot] === 0 ? undefined : this.values[slot];
  }

  set(state, value) {
    if (value === undefined) throw new TypeError('transition cache cannot store undefined');
    const signature = state.transitionSignature(this.scratch);
    return this.setSignature(signature, value);
  }

  setSignature(signature, value) {
    if ((this.count + 1) * 10 >= this.capacity * 7) this.grow();
    const slot = this.findSlot(signature);
    if (this.used[slot] === 0) {
      this.used[slot] = 1;
      this.p0[slot] = signature[0];
      this.p1[slot] = signature[1];
      this.support[slot] = signature[2] >>> 0;
      this.count += 1;
    }
    this.values[slot] = value;
    return value;
  }
}