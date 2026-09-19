import { GUARD_APPLICABLE, GUARD_INAPPLICABLE, GUARD_UNRESOLVED, evaluateGuard } from './guards.mjs';
import { canonicalizeCertificatePayload, reflectConclusion } from './certificate.mjs';
import { reflectGuard } from './guards.mjs';
import { PROOF_PROFILE, snapshotProofData, proofDataKey } from './proof-payload.mjs';

function structuralBucket(root, p0Class, p1Class, create) {
  let byP1 = root.get(p0Class);
  if (!byP1) {
    if (!create) return null;
    byP1 = new Map();
    root.set(p0Class, byP1);
  }
  let bucket = byP1.get(p1Class);
  if (!bucket && create) {
    bucket = { certificates: [] };
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
    this.byProofIdentity = new Map();
    this.nextCertificateId = 1;
    this.size = 0;
  }

  add(state, { guard, conclusion, proofIdentity = null, provenance = null, dependencyCone = null, proofProfile = PROOF_PROFILE } = {}) {
    if (state.pool !== this.pool) throw new Error('state residual pool does not belong to this IsoMax index');
    if (!guard) throw new TypeError('certificate guard is required');
    if (!conclusion) throw new TypeError('certificate conclusion is required');

    if (proofProfile !== PROOF_PROFILE) throw new RangeError('unsupported IsoMax proof profile');
    if (proofIdentity !== null && typeof proofIdentity !== 'string' && !(Number.isSafeInteger(proofIdentity))) {
      throw new TypeError('proofIdentity must be null, a string or a safe integer');
    }
    guard = snapshotProofData(guard);
    conclusion = snapshotProofData(conclusion);
    dependencyCone = snapshotProofData(dependencyCone);
    provenance = snapshotProofData(provenance);
    const reflectedGuard = reflectGuard(guard);
    if ((reflectedGuard !== null && proofDataKey(reflectGuard(reflectedGuard)) !== proofDataKey(guard))
      || proofDataKey(reflectConclusion(reflectConclusion(conclusion))) !== proofDataKey(conclusion)) {
      throw new Error('proof payload is not losslessly reflection-transportable');
    }
    const signature = state.structuralSignature();
    let canonical = canonicalizeCertificatePayload(guard, conclusion, signature[2]);
    // A stabilizer permits either image. Compare the complete transported pair.
    if (signature[3] === 1 && reflectGuard(guard) !== null) {
      const other = canonicalizeCertificatePayload(guard, conclusion, 1);
      if (proofDataKey(other) < proofDataKey(canonical)) canonical = other;
    }
    canonical = snapshotProofData(canonical);
    const payloadKey = proofDataKey({ proofProfile, p0Class: signature[0], p1Class: signature[1], ...canonical, dependencyCone });
    if (proofIdentity !== null && this.byProofIdentity.has(proofIdentity)) {
      const existing = this.byProofIdentity.get(proofIdentity);
      if (existing.payloadKey !== payloadKey) throw new Error('proofIdentity collision: canonical proof payload differs');
      return existing.certificate;
    }
    const bucket = structuralBucket(this.root, signature[0], signature[1], true);

    const certificate = Object.freeze({
      id: this.nextCertificateId++,
      p0Class: signature[0],
      p1Class: signature[1],
      guard: canonical.guard,
      conclusion: canonical.conclusion,
      proofIdentity,
      proofProfile,
      provenance,
      dependencyCone,
    });
    bucket.certificates.push(certificate);
    if (proofIdentity !== null) this.byProofIdentity.set(proofIdentity, { payloadKey, certificate });
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
  // OWNER-PROTECTED HOT-PATH — do not remove/weaken this or adjacent comments.
  // Numeric exact q triples and reusable key scratch are intentional.
  // Do not replace them with string keys, signature objects/temporary arrays,
  // hash-only equality, or coarse WSL/proof identity. Sealed worker recursion
  // cannot grow/rehash; reserve at task entry. Rehash scratch must not alias a
  // live insertion key. Keep collision/resize/reflection controls effective.
  constructor({ pool, initialCapacity = 1024 } = {}) {
    if (!pool) throw new TypeError('IsoMaxTransitionCache requires its ResidualPool');
    this.pool = pool;
    if (!Number.isInteger(initialCapacity) || initialCapacity < 8 || initialCapacity > 2 ** 29) throw new RangeError('initialCapacity must be an integer in [8, 2^29]');
    let capacity = 1;
    while (capacity < initialCapacity) capacity <<= 1;
    this.capacity = capacity;
    this.count = 0;
    this.sealed = false;
    this.used = new Uint8Array(capacity);
    this.p0 = new Int32Array(capacity);
    this.p1 = new Int32Array(capacity);
    this.support = new Uint32Array(capacity);
    this.values = new Array(capacity);
    this.scratch = new Int32Array(3);
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

  grow(capacity = this.capacity * 2) {
    if (this.sealed) throw new Error('ISOMAX_TRANSITION_CAPACITY');
    const old = {
      capacity: this.capacity,
      used: this.used,
      p0: this.p0,
      p1: this.p1,
      support: this.support,
      values: this.values,
    };
    this.capacity = capacity;
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
      this.#setKey(signature, old.values[slot]);
    }
  }

  get(state) {
    if (state.pool !== this.pool) throw new Error('state residual pool does not belong to this gameplay cache');
    const signature = state.gameplayKey(this.scratch);
    const slot = this.findSlot(signature);
    return this.used[slot] === 0 ? undefined : this.values[slot];
  }

  prepareSearchStorage(additionalEntries) {
    if (!Number.isSafeInteger(additionalEntries) || additionalEntries < 1 ||
        additionalEntries > 2 ** 26) throw new RangeError('invalid cache reservation');
    this.sealed = false;
    let capacity = this.capacity;
    while ((this.count + additionalEntries + 1) * 10 >= capacity * 7) capacity *= 2;
    if (capacity > this.capacity) this.grow(capacity);
    this.sealed = true;
  }

  set(state, value) {
    if (state.pool !== this.pool) throw new Error('state residual pool does not belong to this gameplay cache');
    if (value === undefined) throw new TypeError('transition cache cannot store undefined');
    const signature = state.gameplayKey(this.scratch);
    return this.#setKey(signature, value);
  }

  #setKey(signature, value) {
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
