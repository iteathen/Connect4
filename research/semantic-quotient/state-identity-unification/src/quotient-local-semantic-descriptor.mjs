import {
  createQuotientSemanticClassReferenceDescriptor,
  hashResidualTermIds,
  hashSemanticQuotientDescriptorParts,
} from './quotient-semantic-identity.mjs';

const CLASS_UNKNOWN_LENGTH = 0xffff;
const INITIAL_CLASS_CAPACITY = 1024;

function nextPowerOfTwo(value) {
  let result = 1;
  while (result < value) result *= 2;
  return result;
}

export function createLocalSemanticDescriptorCache(kernel) {
  let classCapacity = INITIAL_CLASS_CAPACITY;
  let classLengths = new Uint16Array(classCapacity);
  let classHashLo = new Uint32Array(classCapacity);
  let classHashHi = new Uint32Array(classCapacity);
  classLengths.fill(CLASS_UNKNOWN_LENGTH);

  const classHashScratch = { lo: 0, hi: 0 };
  const stateHashScratch = { lo: 0, hi: 0 };
  const metrics = {
    classBuilds: 0,
    classHits: 0,
    stateBuilds: 0,
    stateHits: 0,
    transientStateDescriptorUses: 0,
    stateDescriptorObjectsAllocated: 0,
    classDescriptorObjectsAllocated: 0,
    termArrayMaterializations: 0,
    termIdsMaterialized: 0,
    termIdsCached: 0,
    termArrayObjectsCached: 0,
    classDescriptorObjectsCached: 0,
    classMetadataBytes: classLengths.byteLength + classHashLo.byteLength + classHashHi.byteLength,
    termArenaBytes: 0,
    retainedTypedBytes: 0,
    classCapacity,
    termCapacity: 0,
  };

  function refreshRetainedBytes() {
    metrics.classMetadataBytes = classLengths.byteLength + classHashLo.byteLength + classHashHi.byteLength;
    metrics.termArenaBytes = 0;
    metrics.retainedTypedBytes = metrics.classMetadataBytes;
    metrics.classCapacity = classCapacity;
    metrics.termCapacity = 0;
  }
  refreshRetainedBytes();

  function ensureClassCapacity(required) {
    if (required <= classCapacity) return;
    const next = nextPowerOfTwo(required);
    const lengths = new Uint16Array(next);
    lengths.fill(CLASS_UNKNOWN_LENGTH);
    lengths.set(classLengths);
    classLengths = lengths;
    const lo = new Uint32Array(next);
    lo.set(classHashLo);
    classHashLo = lo;
    const hi = new Uint32Array(next);
    hi.set(classHashHi);
    classHashHi = hi;
    classCapacity = next;
    refreshRetainedBytes();
  }

  function materializeClassTerms(classId) {
    const ids = kernel.classes.termIds(classId);
    metrics.termArrayMaterializations += 1;
    metrics.termIdsMaterialized += ids.length;
    return ids;
  }

  function ensureClassMetadata(classId) {
    if (!Number.isInteger(classId) || classId < 0) throw new RangeError(`invalid residual class id ${classId}`);
    ensureClassCapacity(classId + 1);
    if (classLengths[classId] !== CLASS_UNKNOWN_LENGTH) {
      metrics.classHits += 1;
      return;
    }

    const ids = materializeClassTerms(classId);
    if (ids.length >= CLASS_UNKNOWN_LENGTH) throw new RangeError(`residual class ${classId} exceeds Uint16 semantic length domain`);
    hashResidualTermIds(ids, ids.length, classHashScratch);
    classLengths[classId] = ids.length;
    classHashLo[classId] = classHashScratch.lo;
    classHashHi[classId] = classHashScratch.hi;
    metrics.classBuilds += 1;
  }

  const termSource = Object.freeze({
    writeTermIds(classId, target, offset = 0) {
      ensureClassMetadata(classId);
      const length = classLengths[classId];
      if (!Number.isInteger(offset) || offset < 0 || offset + length > target.length) {
        throw new RangeError(`semantic term target cannot hold class ${classId} length ${length} at offset ${offset}`);
      }
      const ids = materializeClassTerms(classId);
      if (ids.length !== length) {
        throw new Error(`semantic class ${classId} length drift: expected ${length}, materialized ${ids.length}`);
      }
      target.set(ids, offset);
      return length;
    },
  });

  function classDescriptor(classId) {
    ensureClassMetadata(classId);
    metrics.classDescriptorObjectsAllocated += 1;
    return Object.freeze({
      classId,
      length: classLengths[classId],
      hash: Object.freeze({ lo: classHashLo[classId], hi: classHashHi[classId] }),
      termSource,
    });
  }

  const transientStateDescriptor = {
    stateId: 0,
    supportIndex: 0,
    p0ClassId: 0,
    p1ClassId: 0,
    p0Length: 0,
    p1Length: 0,
    termSource,
    hash: stateHashScratch,
  };

  function hotStateDescriptor(stateId) {
    const supportIndex = kernel.states.support[stateId];
    const p0ClassId = kernel.states.p0Class[stateId];
    const p1ClassId = kernel.states.p1Class[stateId];
    ensureClassMetadata(p0ClassId);
    ensureClassMetadata(p1ClassId);
    const p0Length = classLengths[p0ClassId];
    const p1Length = classLengths[p1ClassId];
    hashSemanticQuotientDescriptorParts(
      supportIndex,
      classHashLo[p0ClassId],
      classHashHi[p0ClassId],
      classHashLo[p1ClassId],
      classHashHi[p1ClassId],
      p0Length,
      p1Length,
      stateHashScratch,
    );
    transientStateDescriptor.stateId = stateId;
    transientStateDescriptor.supportIndex = supportIndex;
    transientStateDescriptor.p0ClassId = p0ClassId;
    transientStateDescriptor.p1ClassId = p1ClassId;
    transientStateDescriptor.p0Length = p0Length;
    transientStateDescriptor.p1Length = p1Length;
    metrics.stateBuilds += 1;
    metrics.transientStateDescriptorUses += 1;
    return transientStateDescriptor;
  }

  function stateDescriptor(stateId) {
    const supportIndex = kernel.states.support[stateId];
    const p0ClassId = kernel.states.p0Class[stateId];
    const p1ClassId = kernel.states.p1Class[stateId];
    ensureClassMetadata(p0ClassId);
    ensureClassMetadata(p1ClassId);
    metrics.stateBuilds += 1;
    metrics.stateDescriptorObjectsAllocated += 1;
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
    hotStateDescriptor,
    stateDescriptor,
    metrics,
  });
}
