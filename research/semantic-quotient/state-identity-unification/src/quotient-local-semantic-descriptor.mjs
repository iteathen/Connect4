import {
  createQuotientSemanticClassReferenceDescriptor,
  hashResidualTermIds,
} from './quotient-semantic-identity.mjs';

const CLASS_UNKNOWN_LENGTH = 0xffff;
const INITIAL_CLASS_CAPACITY = 1024;
const INITIAL_TERM_CAPACITY = 1 << 16;

function nextPowerOfTwo(value) {
  let result = 1;
  while (result < value) result *= 2;
  return result;
}

export function createLocalSemanticDescriptorCache(kernel) {
  let classCapacity = INITIAL_CLASS_CAPACITY;
  let classStarts = new Uint32Array(classCapacity);
  let classLengths = new Uint16Array(classCapacity);
  let classHashLo = new Uint32Array(classCapacity);
  let classHashHi = new Uint32Array(classCapacity);
  classLengths.fill(CLASS_UNKNOWN_LENGTH);

  let termCapacity = INITIAL_TERM_CAPACITY;
  let termIds = new Uint16Array(termCapacity);
  let termCount = 0;

  const metrics = {
    classBuilds: 0,
    classHits: 0,
    stateBuilds: 0,
    stateHits: 0,
    termIdsCached: 0,
    termArrayObjectsCached: 0,
    classDescriptorObjectsCached: 0,
    classMetadataBytes: classStarts.byteLength + classLengths.byteLength + classHashLo.byteLength + classHashHi.byteLength,
    termArenaBytes: termIds.byteLength,
    retainedTypedBytes: 0,
    classCapacity,
    termCapacity,
  };

  function refreshRetainedBytes() {
    metrics.classMetadataBytes = classStarts.byteLength + classLengths.byteLength + classHashLo.byteLength + classHashHi.byteLength;
    metrics.termArenaBytes = termIds.byteLength;
    metrics.retainedTypedBytes = metrics.classMetadataBytes + metrics.termArenaBytes;
    metrics.classCapacity = classCapacity;
    metrics.termCapacity = termCapacity;
  }
  refreshRetainedBytes();

  function ensureClassCapacity(required) {
    if (required <= classCapacity) return;
    const next = nextPowerOfTwo(required);
    const starts = new Uint32Array(next); starts.set(classStarts); classStarts = starts;
    const lengths = new Uint16Array(next); lengths.fill(CLASS_UNKNOWN_LENGTH); lengths.set(classLengths); classLengths = lengths;
    const lo = new Uint32Array(next); lo.set(classHashLo); classHashLo = lo;
    const hi = new Uint32Array(next); hi.set(classHashHi); classHashHi = hi;
    classCapacity = next;
    refreshRetainedBytes();
  }

  function ensureTermCapacity(required) {
    if (required <= termCapacity) return;
    const next = nextPowerOfTwo(required);
    const target = new Uint16Array(next);
    target.set(termIds.subarray(0, termCount));
    termIds = target;
    termCapacity = next;
    refreshRetainedBytes();
  }

  function ensureClassMetadata(classId) {
    if (!Number.isInteger(classId) || classId < 0) throw new RangeError(`invalid residual class id ${classId}`);
    ensureClassCapacity(classId + 1);
    if (classLengths[classId] !== CLASS_UNKNOWN_LENGTH) {
      metrics.classHits += 1;
      return;
    }

    const ids = kernel.classes.termIds(classId);
    if (ids.length >= CLASS_UNKNOWN_LENGTH) throw new RangeError(`residual class ${classId} exceeds Uint16 semantic length domain`);
    ensureTermCapacity(termCount + ids.length);
    const start = termCount;
    termIds.set(ids, start);
    termCount += ids.length;
    const hash = hashResidualTermIds(ids);
    classStarts[classId] = start;
    classLengths[classId] = ids.length;
    classHashLo[classId] = hash.lo;
    classHashHi[classId] = hash.hi;
    metrics.classBuilds += 1;
    metrics.termIdsCached += ids.length;
  }

  const termSource = Object.freeze({
    writeTermIds(classId, target, offset = 0) {
      ensureClassMetadata(classId);
      const length = classLengths[classId];
      if (!Number.isInteger(offset) || offset < 0 || offset + length > target.length) {
        throw new RangeError(`semantic term target cannot hold class ${classId} length ${length} at offset ${offset}`);
      }
      const start = classStarts[classId];
      for (let index = 0; index < length; index += 1) target[offset + index] = termIds[start + index];
      return length;
    },
  });

  function classDescriptor(classId) {
    ensureClassMetadata(classId);
    return Object.freeze({
      classId,
      length: classLengths[classId],
      hash: Object.freeze({ lo: classHashLo[classId], hi: classHashHi[classId] }),
      termSource,
    });
  }

  function stateDescriptor(stateId) {
    const supportIndex = kernel.states.support[stateId];
    const p0ClassId = kernel.states.p0Class[stateId];
    const p1ClassId = kernel.states.p1Class[stateId];
    ensureClassMetadata(p0ClassId);
    ensureClassMetadata(p1ClassId);
    metrics.stateBuilds += 1;
    return createQuotientSemanticClassReferenceDescriptor(
      stateId,
      supportIndex,
      p0ClassId,
      p1ClassId,
      classLengths[p0ClassId],
      classLengths[p1ClassId],
      classHashLo[p0ClassId],
      classHashHi[p0ClassId],
      classHashLo[p1ClassId],
      classHashHi[p1ClassId],
      termSource,
    );
  }

  return Object.freeze({
    classDescriptor,
    stateDescriptor,
    metrics,
  });
}
