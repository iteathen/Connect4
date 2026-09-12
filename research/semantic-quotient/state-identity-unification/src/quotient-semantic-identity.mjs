const UINT16_MAX = 0xffff;
const UINT32_MAX = 0xffffffff;

function mix32(value) {
  let x = value >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b) >>> 0;
  x ^= x >>> 16;
  return x >>> 0;
}

function assertUint32(value, label) {
  if (!Number.isInteger(value) || value < 0 || value > UINT32_MAX) {
    throw new RangeError(`${label} must be an integer in 0..${UINT32_MAX}, got ${value}`);
  }
  return value >>> 0;
}

function assertUint16Length(value, label) {
  if (!Number.isInteger(value) || value < 0 || value > UINT16_MAX) {
    throw new RangeError(`${label} must be an integer in 0..${UINT16_MAX}, got ${value}`);
  }
  return value;
}

function assertStateId(value, label = 'semantic stateId') {
  if (!Number.isInteger(value) || value < 0 || !Number.isSafeInteger(value)) {
    throw new RangeError(`${label} must be a non-negative safe integer, got ${value}`);
  }
  return value;
}

function assertClassId(value, label) {
  if (!Number.isInteger(value) || value < 0 || !Number.isSafeInteger(value)) {
    throw new RangeError(`${label} must be a non-negative safe integer, got ${value}`);
  }
  return value;
}

function assertTermIds(ids, length = ids?.length) {
  if (!(ids instanceof Uint16Array)) throw new TypeError('residual term IDs must be Uint16Array');
  if (!Number.isInteger(length) || length < 0 || length > ids.length) {
    throw new RangeError(`residual term hash length ${length} is outside source length ${ids.length}`);
  }
  return length;
}

function foldTermIds(ids, length, seed, multiplier) {
  let hash = seed >>> 0;
  for (let index = 0; index < length; index += 1) {
    hash = Math.imul(hash ^ ((ids[index] + 1) >>> 0), multiplier) >>> 0;
    hash = mix32(hash ^ index);
  }
  return mix32(hash ^ length);
}

function writeHash(target, lo, hi) {
  if (target === null || target === undefined) return Object.freeze({ lo, hi });
  if (typeof target !== 'object' || Array.isArray(target) || Object.isFrozen(target)) {
    throw new TypeError('semantic hash target must be a mutable object');
  }
  target.lo = lo;
  target.hi = hi;
  if (target.lo !== lo || target.hi !== hi) throw new Error('semantic hash target rejected hash assignment');
  return target;
}

export function hashResidualTermIds(ids, length = ids?.length, target = null) {
  const actualLength = assertTermIds(ids, length);
  const lo = foldTermIds(ids, actualLength, 0x811c9dc5, 0x01000193);
  const hi = foldTermIds(ids, actualLength, 0x9e3779b9, 0x85ebca6b);
  return writeHash(target, lo, hi);
}

export function hashSemanticQuotientDescriptorPartsUnchecked(
  supportIndex,
  p0HashLo,
  p0HashHi,
  p1HashLo,
  p1HashHi,
  p0Length,
  p1Length,
  target = null,
) {
  let lo = mix32((supportIndex + 0x9e3779b9) >>> 0);
  lo = mix32(lo ^ p0HashLo ^ Math.imul((p0Length + 1) >>> 0, 0x85ebca6b));
  lo = mix32(lo ^ p1HashLo ^ Math.imul((p1Length + 1) >>> 0, 0xc2b2ae35));
  let hi = mix32((supportIndex ^ 0xa5a5a5a5) >>> 0);
  hi = mix32(hi ^ p0HashHi ^ Math.imul((p0Length + 3) >>> 0, 0x27d4eb2d));
  hi = mix32(hi ^ p1HashHi ^ Math.imul((p1Length + 5) >>> 0, 0x165667b1));
  return writeHash(target, lo, hi);
}

export function hashSemanticQuotientDescriptorParts(
  supportIndex,
  p0HashLo,
  p0HashHi,
  p1HashLo,
  p1HashHi,
  p0Length,
  p1Length,
  target = null,
) {
  return hashSemanticQuotientDescriptorPartsUnchecked(
    assertUint32(supportIndex, 'semantic supportIndex'),
    assertUint32(p0HashLo, 'semantic p0 hash lo'),
    assertUint32(p0HashHi, 'semantic p0 hash hi'),
    assertUint32(p1HashLo, 'semantic p1 hash lo'),
    assertUint32(p1HashHi, 'semantic p1 hash hi'),
    assertUint16Length(p0Length, 'semantic p0 length'),
    assertUint16Length(p1Length, 'semantic p1 length'),
    target,
  );
}

export function hashSemanticQuotientDescriptor(supportIndex, p0Hash, p1Hash, p0Length, p1Length) {
  if (!p0Hash || !p1Hash) throw new TypeError('semantic residual hashes are required');
  return hashSemanticQuotientDescriptorParts(
    supportIndex,
    p0Hash.lo,
    p0Hash.hi,
    p1Hash.lo,
    p1Hash.hi,
    p0Length,
    p1Length,
  );
}

export function createResidualSemanticDescriptor(classId, ids) {
  assertClassId(classId, 'residual classId');
  assertTermIds(ids);
  return Object.freeze({
    classId,
    ids,
    hash: hashResidualTermIds(ids),
  });
}

function assertResidualDescriptor(residual, label) {
  if (!residual || typeof residual !== 'object' || !(residual.ids instanceof Uint16Array) || !residual.hash) {
    throw new TypeError(`${label} must be an exact residual semantic descriptor`);
  }
  assertUint32(residual.hash.lo, `${label} hash lo`);
  assertUint32(residual.hash.hi, `${label} hash hi`);
  return residual;
}

export function createQuotientSemanticDescriptor(stateId, supportIndex, p0, p1) {
  assertStateId(stateId);
  assertUint32(supportIndex, 'semantic supportIndex');
  assertResidualDescriptor(p0, 'semantic p0');
  assertResidualDescriptor(p1, 'semantic p1');
  const p0Length = assertUint16Length(p0.ids.length, 'semantic p0 length');
  const p1Length = assertUint16Length(p1.ids.length, 'semantic p1 length');
  if (p0Length + p1Length > UINT16_MAX) throw new RangeError('semantic descriptor combined residual length exceeds Uint16');
  return Object.freeze({
    stateId,
    supportIndex,
    p0,
    p1,
    hash: hashSemanticQuotientDescriptor(
      supportIndex,
      p0.hash,
      p1.hash,
      p0Length,
      p1Length,
    ),
  });
}

export function createQuotientSemanticClassReferenceDescriptor(
  stateId,
  supportIndex,
  p0ClassId,
  p1ClassId,
  p0Length,
  p1Length,
  p0HashLo,
  p0HashHi,
  p1HashLo,
  p1HashHi,
  termSource,
) {
  assertStateId(stateId);
  assertUint32(supportIndex, 'semantic supportIndex');
  assertClassId(p0ClassId, 'semantic p0 classId');
  assertClassId(p1ClassId, 'semantic p1 classId');
  const actualP0Length = assertUint16Length(p0Length, 'semantic p0 length');
  const actualP1Length = assertUint16Length(p1Length, 'semantic p1 length');
  if (actualP0Length + actualP1Length > UINT16_MAX) {
    throw new RangeError('semantic descriptor combined residual length exceeds Uint16');
  }
  if (!termSource || typeof termSource.writeTermIds !== 'function') {
    throw new TypeError('class-reference semantic descriptor requires exact termSource.writeTermIds');
  }
  const hash = hashSemanticQuotientDescriptorParts(
    supportIndex,
    p0HashLo,
    p0HashHi,
    p1HashLo,
    p1HashHi,
    actualP0Length,
    actualP1Length,
  );
  return Object.freeze({
    stateId,
    supportIndex,
    p0ClassId,
    p1ClassId,
    p0Length: actualP0Length,
    p1Length: actualP1Length,
    termSource,
    hash,
  });
}

export function semanticQuotientP0Length(descriptor) {
  if (!descriptor || typeof descriptor !== 'object') throw new TypeError('semantic descriptor is required');
  if (descriptor.p0 !== undefined) {
    assertResidualDescriptor(descriptor.p0, 'semantic p0');
    return assertUint16Length(descriptor.p0.ids.length, 'semantic p0 length');
  }
  return assertUint16Length(descriptor.p0Length, 'semantic p0 length');
}

export function semanticQuotientP1Length(descriptor) {
  if (!descriptor || typeof descriptor !== 'object') throw new TypeError('semantic descriptor is required');
  if (descriptor.p1 !== undefined) {
    assertResidualDescriptor(descriptor.p1, 'semantic p1');
    return assertUint16Length(descriptor.p1.ids.length, 'semantic p1 length');
  }
  return assertUint16Length(descriptor.p1Length, 'semantic p1 length');
}

export function writeSemanticQuotientTermIds(descriptor, target, offset = 0) {
  if (!(target instanceof Uint16Array)) throw new TypeError('semantic descriptor term target must be Uint16Array');
  const p0Length = semanticQuotientP0Length(descriptor);
  const p1Length = semanticQuotientP1Length(descriptor);
  const total = p0Length + p1Length;
  if (total > UINT16_MAX) throw new RangeError('semantic descriptor combined residual length exceeds Uint16');
  if (!Number.isInteger(offset) || offset < 0 || offset + total > target.length) {
    throw new RangeError(`semantic descriptor term target cannot hold ${total} terms at offset ${offset}`);
  }

  if (descriptor.p0 !== undefined) {
    assertResidualDescriptor(descriptor.p0, 'semantic p0');
    assertResidualDescriptor(descriptor.p1, 'semantic p1');
    target.set(descriptor.p0.ids, offset);
    target.set(descriptor.p1.ids, offset + p0Length);
    return total;
  }

  if (!descriptor.termSource || typeof descriptor.termSource.writeTermIds !== 'function') {
    throw new TypeError('class-reference semantic descriptor requires exact term source');
  }
  assertClassId(descriptor.p0ClassId, 'semantic p0 classId');
  assertClassId(descriptor.p1ClassId, 'semantic p1 classId');
  const p0Written = descriptor.termSource.writeTermIds(descriptor.p0ClassId, target, offset);
  const p1Written = descriptor.termSource.writeTermIds(descriptor.p1ClassId, target, offset + p0Length);
  if (p0Written !== p0Length || p1Written !== p1Length) {
    throw new Error(`semantic class-reference term length drift: expected ${p0Length}/${p1Length}, wrote ${p0Written}/${p1Written}`);
  }
  return total;
}

export function termIdSequencesEqual(left, right) {
  if (!(left instanceof Uint16Array) || !(right instanceof Uint16Array)) {
    throw new TypeError('semantic term sequence comparison requires Uint16Array inputs');
  }
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

export function quotientSemanticDescriptorsEqual(left, right) {
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object') {
    throw new TypeError('semantic descriptor comparison requires two descriptors');
  }
  if (left.supportIndex !== right.supportIndex) return false;
  const leftP0 = semanticQuotientP0Length(left);
  const leftP1 = semanticQuotientP1Length(left);
  if (leftP0 !== semanticQuotientP0Length(right) || leftP1 !== semanticQuotientP1Length(right)) return false;

  if (left.p0 !== undefined && right.p0 !== undefined) {
    return termIdSequencesEqual(left.p0.ids, right.p0.ids)
      && termIdSequencesEqual(left.p1.ids, right.p1.ids);
  }

  const total = leftP0 + leftP1;
  const leftTerms = new Uint16Array(total);
  const rightTerms = new Uint16Array(total);
  writeSemanticQuotientTermIds(left, leftTerms);
  writeSemanticQuotientTermIds(right, rightTerms);
  return termIdSequencesEqual(leftTerms, rightTerms);
}
