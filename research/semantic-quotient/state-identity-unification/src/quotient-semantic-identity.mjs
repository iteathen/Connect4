function mix32(value) {
  let x = value >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b) >>> 0;
  x ^= x >>> 16;
  return x >>> 0;
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
  target.lo = lo;
  target.hi = hi;
  return target;
}

export function hashResidualTermIds(ids, length = ids.length, target = null) {
  if (!Number.isInteger(length) || length < 0 || length > ids.length) {
    throw new RangeError(`residual term hash length ${length} is outside source length ${ids.length}`);
  }
  const lo = foldTermIds(ids, length, 0x811c9dc5, 0x01000193);
  const hi = foldTermIds(ids, length, 0x9e3779b9, 0x85ebca6b);
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
  let lo = mix32((supportIndex + 0x9e3779b9) >>> 0);
  lo = mix32(lo ^ p0HashLo ^ Math.imul((p0Length + 1) >>> 0, 0x85ebca6b));
  lo = mix32(lo ^ p1HashLo ^ Math.imul((p1Length + 1) >>> 0, 0xc2b2ae35));
  let hi = mix32((supportIndex ^ 0xa5a5a5a5) >>> 0);
  hi = mix32(hi ^ p0HashHi ^ Math.imul((p0Length + 3) >>> 0, 0x27d4eb2d));
  hi = mix32(hi ^ p1HashHi ^ Math.imul((p1Length + 5) >>> 0, 0x165667b1));
  return writeHash(target, lo, hi);
}

export function hashSemanticQuotientDescriptor(supportIndex, p0Hash, p1Hash, p0Length, p1Length) {
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
  return Object.freeze({
    classId,
    ids,
    hash: hashResidualTermIds(ids),
  });
}

export function createQuotientSemanticDescriptor(stateId, supportIndex, p0, p1) {
  return Object.freeze({
    stateId,
    supportIndex,
    p0,
    p1,
    hash: hashSemanticQuotientDescriptor(
      supportIndex,
      p0.hash,
      p1.hash,
      p0.ids.length,
      p1.ids.length,
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
  if (!termSource || typeof termSource.writeTermIds !== 'function') {
    throw new TypeError('class-reference semantic descriptor requires exact termSource.writeTermIds');
  }
  return Object.freeze({
    stateId,
    supportIndex,
    p0ClassId,
    p1ClassId,
    p0Length,
    p1Length,
    termSource,
    hash: hashSemanticQuotientDescriptorParts(
      supportIndex,
      p0HashLo,
      p0HashHi,
      p1HashLo,
      p1HashHi,
      p0Length,
      p1Length,
    ),
  });
}

export function semanticQuotientP0Length(descriptor) {
  return descriptor.p0 === undefined ? descriptor.p0Length : descriptor.p0.ids.length;
}

export function semanticQuotientP1Length(descriptor) {
  return descriptor.p1 === undefined ? descriptor.p1Length : descriptor.p1.ids.length;
}

export function writeSemanticQuotientTermIds(descriptor, target, offset = 0) {
  const p0Length = semanticQuotientP0Length(descriptor);
  const p1Length = semanticQuotientP1Length(descriptor);
  const total = p0Length + p1Length;
  if (!Number.isInteger(offset) || offset < 0 || offset + total > target.length) {
    throw new RangeError(`semantic descriptor term target cannot hold ${total} terms at offset ${offset}`);
  }

  if (descriptor.p0 !== undefined) {
    target.set(descriptor.p0.ids, offset);
    target.set(descriptor.p1.ids, offset + p0Length);
    return total;
  }

  const p0Written = descriptor.termSource.writeTermIds(descriptor.p0ClassId, target, offset);
  const p1Written = descriptor.termSource.writeTermIds(descriptor.p1ClassId, target, offset + p0Length);
  if (p0Written !== p0Length || p1Written !== p1Length) {
    throw new Error(`semantic class-reference term length drift: expected ${p0Length}/${p1Length}, wrote ${p0Written}/${p1Written}`);
  }
  return total;
}

export function termIdSequencesEqual(left, right) {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

export function quotientSemanticDescriptorsEqual(left, right) {
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
