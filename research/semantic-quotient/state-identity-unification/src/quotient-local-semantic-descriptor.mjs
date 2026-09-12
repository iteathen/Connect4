import {
  createQuotientSemanticClassReferenceDescriptor,
  hashResidualTermIds,
  hashSemanticQuotientDescriptorPartsUnchecked,
} from './quotient-semantic-identity.mjs';

const CLASS_UNKNOWN_LENGTH = 0xffff;
const INITIAL_CLASS_CAPACITY = 1024;

function nextPowerOfTwo(value) {
  let result = 1;
  while (result < value) result *= 2;
  return result;
}

export function createLocalSemanticDescriptorCache(kernel) {
  if (!kernel || typeof kernel !== 'object' || !kernel.states || !kernel.classes) {
    throw new TypeError('local semantic descriptor cache requires a quotient kernel');
  }
  if (typeof kernel.classes.termIds !== 'function') {
    throw new TypeError('local semantic descriptor cache requires classes.termIds');
  }

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

  function assertClassId(classId) {
    const size = kernel.classes.size;
    if (!Number.isInteger(size) || size < 0) throw new Error(`residual class pool reported invalid size ${size}`);
    if (!Number.isInteger(classId) || classId < 0 || classId >= size) {
      throw new RangeError(`residual class id ${classId} is outside current class count ${size}`);
    }
  }

  function assertStateId(stateId) {
    const count = kernel.states.count;
    if (!Number.isInteger(count) || count < 1) throw new Error(`quotient state pool reported invalid count ${count}`);
    if (!Number.isInteger(stateId) || stateId < 0 || stateId >= count) {
      throw new RangeError(`semantic state id ${stateId} is outside current state count ${count}`);
    }
  }

  function ensureClassCapacity(required) {
    if (!Number.isInteger(required) || required < 1) throw new RangeError(`invalid semantic class capacity request ${required}`);
    if (required <= classCapacity) return;
    const next = nextPowerOfTwo(required);
    if (!Number.isSafeInteger(next) || next <= classCapacity) throw new RangeError(`semantic class capacity overflow at ${required}`);
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
    assertClassId(classId);
    const ids = kernel.classes.termIds(classId);
    if (!(ids instanceof Uint16Array)) {
      throw new TypeError(`residual class ${classId} termIds must return Uint16Array`);
    }
    if (ids.length >= CLASS_UNKNOWN_LENGTH) {
      throw new RangeError(`residual class ${classId} exceeds Uint16 semantic length domain`);
    }
    metrics.termArrayMaterializations += 1;
    metrics.termIdsMaterialized += ids.length;
    return ids;
  }

  function ensureClassMetadata(classId) {
    assertClassId(classId);
    ensureClassCapacity(classId + 1);
    if (classLengths[classId] !== CLASS_UNKNOWN_LENGTH) {
      metrics.classHits += 1;
      return;
    }

    const ids = materializeClassTerms(classId);
    hashResidualTermIds(ids, ids.length, classHashScratch);
    classLengths[classId] = ids.length;
    classHashLo[classId] = classHashScratch.lo;
    classHashHi[classId] = classHashScratch.hi;
    metrics.classBuilds += 1;
  }

  const termSource = Object.freeze({
    writeTermIds(classId, target, offset = 0) {
      if (!(target instanceof Uint16Array)) throw new TypeError('semantic term target must be Uint16Array');
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

  function loadStateParts(stateId) {
    assertStateId(stateId);
    const supportIndex = kernel.states.support[stateId];
    const p0ClassId = kernel.states.p0Class[stateId];
    const p1ClassId = kernel.states.p1Class[stateId];
    if (!Number.isInteger(supportIndex) || supportIndex < 0 || supportIndex > 0xffffffff) {
      throw new Error(`semantic state ${stateId} has invalid support index ${supportIndex}`);
    }
    assertClassId(p0ClassId);
    assertClassId(p1ClassId);
    ensureClassMetadata(p0ClassId);
    ensureClassMetadata(p1ClassId);
    return { supportIndex, p0ClassId, p1ClassId };
  }

  function hotStateDescriptor(stateId) {
    const { supportIndex, p0ClassId, p1ClassId } = loadStateParts(stateId);
    const p0Length = classLengths[p0ClassId];
    const p1Length = classLengths[p1ClassId];
    if (p0Length + p1Length >= CLASS_UNKNOWN_LENGTH) {
      throw new RangeError(`semantic state ${stateId} combined residual length exceeds Uint16 domain`);
    }
    hashSemanticQuotientDescriptorPartsUnchecked(
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
    const { supportIndex, p0ClassId, p1ClassId } = loadStateParts(stateId);
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
