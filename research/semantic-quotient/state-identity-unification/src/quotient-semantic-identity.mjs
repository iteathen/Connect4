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

export function termIdSequencesEqual(left, right) {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

export function quotientSemanticDescriptorsEqual(left, right) {
  return left.supportIndex === right.supportIndex
    && termIdSequencesEqual(left.p0.ids, right.p0.ids)
    && termIdSequencesEqual(left.p1.ids, right.p1.ids);
}
