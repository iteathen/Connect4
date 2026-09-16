import {
  createQuotientSemanticClassReferenceDescriptor,
  hashResidualTermIds,
  hashSemanticQuotientDescriptorPartsUnchecked,
} from './quotient-semantic-identity.mjs';

const MAX_DESCRIPTOR_LENGTH = 0xfffe;
const INITIAL_CLASS_CAPACITY = 1024;
const MAX_POWER_OF_TWO = 1 << 30;

function nextPowerOfTwo(value) {
  if (!Number.isInteger(value) || value < 1 || value > MAX_POWER_OF_TWO) {
    throw new RangeError(`power-of-two request must be an integer in 1..${MAX_POWER_OF_TWO}, got ${value}`);
  }
  let result = 1;
  while (result < value) result *= 2;
  return result;
}

export function createLocalSemanticDescriptorCache(kernel) {
  if (!kernel || typeof kernel !== 'object' || !kernel.states || !kernel.classes) {
    throw new TypeError('local semantic descriptor cache requires a quotient kernel');
  }
  if (typeof kernel.classes.termCount !== 'function'
      || typeof kernel.classes.writeTermIds !== 'function') {
    throw new TypeError('local semantic descriptor cache requires classes.termCount/writeTermIds');
  }
  const vocabularyCount = kernel.classes.termVocabulary?.count;
  if (!Number.isInteger(vocabularyCount) || vocabularyCount < 1 || vocabularyCount > MAX_DESCRIPTOR_LENGTH) {
    throw new RangeError(`semantic term vocabulary count must be in 1..${MAX_DESCRIPTOR_LENGTH}, got ${vocabularyCount}`);
  }

  let classCapacity = INITIAL_CLASS_CAPACITY;
  // Only hash readiness is cached here. Exact lengths belong to the residual pool.
  let classHashReady = new Uint32Array(classCapacity / 32);
  let classHashLo = new Uint32Array(classCapacity);
  let classHashHi = new Uint32Array(classCapacity);

  // One bounded scratch buffer is sufficient because descriptor/TT operations are synchronous
  // within a worker. Exact residual ownership remains in the canonical class pool.
  const termScratch = new Uint16Array(vocabularyCount);
  const classHashScratch = { lo: 0, hi: 0 };
  const stateHashScratch = { lo: 0, hi: 0 };
  const transientStateDescriptor = {
    stateId: 0,
    supportIndex: 0,
    p0ClassId: 0,
    p1ClassId: 0,
    p0Length: 0,
    p1Length: 0,
    termSource: null,
    hash: stateHashScratch,
  };

  const metrics = {
    classBuilds: 0,
    classHits: 0,
    stateBuilds: 0,
    transientStateDescriptorUses: 0,
    stateDescriptorObjectsAllocated: 0,
    classDescriptorObjectsAllocated: 0,
    termArrayMaterializations: 0,
    termIdsMaterialized: 0,
    directTermWrites: 0,
    directTermIdsWritten: 0,
    termIdsCached: 0,
    termArrayObjectsCached: 0,
    classDescriptorObjectsCached: 0,
    classMetadataBytes: classHashReady.byteLength + classHashLo.byteLength + classHashHi.byteLength,
    scratchBytes: termScratch.byteLength,
    scratchCapacity: termScratch.length,
    termArenaBytes: 0,
    retainedTypedBytes: 0,
    classCapacity,
    termCapacity: 0,
  };

  function refreshRetainedBytes() {
    metrics.classMetadataBytes = classHashReady.byteLength + classHashLo.byteLength + classHashHi.byteLength;
    metrics.termArenaBytes = 0;
    // retainedTypedBytes intentionally describes retained semantic cache ownership;
    // the bounded reusable working scratch is reported separately as scratchBytes.
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
    return classId;
  }

  function assertStateId(stateId) {
    const count = kernel.states.count;
    if (!Number.isInteger(count) || count < 1) throw new Error(`quotient state pool reported invalid count ${count}`);
    if (!Number.isInteger(stateId) || stateId < 0 || stateId >= count) {
      throw new RangeError(`semantic state id ${stateId} is outside current state count ${count}`);
    }
    return stateId;
  }

  function ensureClassCapacity(required) {
    if (!Number.isInteger(required) || required < 1) throw new RangeError(`invalid semantic class capacity request ${required}`);
    if (required <= classCapacity) return;
    const next = nextPowerOfTwo(required);
    if (!Number.isSafeInteger(next) || next <= classCapacity) throw new RangeError(`semantic class capacity overflow at ${required}`);
    const ready = new Uint32Array(next / 32);
    ready.set(classHashReady);
    const lo = new Uint32Array(next);
    lo.set(classHashLo);
    const hi = new Uint32Array(next);
    hi.set(classHashHi);
    classHashReady = ready;
    classHashLo = lo;
    classHashHi = hi;
    classCapacity = next;
    refreshRetainedBytes();
  }

  function termCount(classId) {
    assertClassId(classId);
    const count = kernel.classes.termCount(classId);
    if (!Number.isInteger(count) || count < 0 || count > MAX_DESCRIPTOR_LENGTH || count > vocabularyCount) {
      throw new RangeError(`residual class ${classId} reported invalid term count ${count}`);
    }
    return count;
  }

  function writeClassTerms(classId, target, offset, expectedLength) {
    assertClassId(classId);
    if (!(target instanceof Uint16Array)) throw new TypeError('semantic term target must be Uint16Array');
    if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(expectedLength) || expectedLength < 0
        || offset + expectedLength > target.length) {
      throw new RangeError(`semantic term target cannot hold class ${classId} length ${expectedLength} at offset ${offset}`);
    }
    const written = kernel.classes.writeTermIds(classId, target, offset);
    if (written !== expectedLength) {
      throw new Error(`semantic class ${classId} length drift: expected ${expectedLength}, wrote ${written}`);
    }
    metrics.directTermWrites += 1;
    metrics.directTermIdsWritten += written;
    return written;
  }

  function ensureClassMetadata(classId) {
    const length = termCount(classId);
    ensureClassCapacity(classId + 1);
    const word = classId >>> 5;
    const bit = 1 << (classId & 31);
    if ((classHashReady[word] & bit) !== 0) {
      metrics.classHits += 1;
      return length;
    }

    writeClassTerms(classId, termScratch, 0, length);
    hashResidualTermIds(termScratch, length, classHashScratch);
    classHashLo[classId] = classHashScratch.lo;
    classHashHi[classId] = classHashScratch.hi;
    classHashReady[word] |= bit;
    metrics.classBuilds += 1;
    return length;
  }

  const termSource = Object.freeze({
    writeTermIds(classId, target, offset = 0) {
      const length = termCount(classId);
      return writeClassTerms(classId, target, offset, length);
    },
  });
  transientStateDescriptor.termSource = termSource;

  function classDescriptor(classId) {
    const length = ensureClassMetadata(classId);
    metrics.classDescriptorObjectsAllocated += 1;
    return Object.freeze({
      classId,
      length,
      hash: Object.freeze({ lo: classHashLo[classId], hi: classHashHi[classId] }),
      termSource,
    });
  }

  function readStateParts(stateId) {
    assertStateId(stateId);
    const supportIndex = kernel.states.support[stateId];
    const p0ClassId = kernel.states.p0Class[stateId];
    const p1ClassId = kernel.states.p1Class[stateId];
    if (!Number.isInteger(supportIndex) || supportIndex < 0 || supportIndex >= kernel.support.itemCapacity) {
      throw new Error(`semantic state ${stateId} has invalid support index ${supportIndex}`);
    }
    const p0Length = ensureClassMetadata(p0ClassId);
    const p1Length = ensureClassMetadata(p1ClassId);
    transientStateDescriptor.stateId = stateId;
    transientStateDescriptor.supportIndex = supportIndex;
    transientStateDescriptor.p0ClassId = p0ClassId;
    transientStateDescriptor.p1ClassId = p1ClassId;
    transientStateDescriptor.p0Length = p0Length;
    transientStateDescriptor.p1Length = p1Length;
  }

  function hotStateDescriptor(stateId) {
    readStateParts(stateId);
    const p0ClassId = transientStateDescriptor.p0ClassId;
    const p1ClassId = transientStateDescriptor.p1ClassId;
    const p0Length = transientStateDescriptor.p0Length;
    const p1Length = transientStateDescriptor.p1Length;
    if (p0Length + p1Length > MAX_DESCRIPTOR_LENGTH) {
      throw new RangeError(`semantic state ${stateId} combined residual length exceeds Uint16 domain`);
    }
    hashSemanticQuotientDescriptorPartsUnchecked(
      transientStateDescriptor.supportIndex,
      classHashLo[p0ClassId],
      classHashHi[p0ClassId],
      classHashLo[p1ClassId],
      classHashHi[p1ClassId],
      p0Length,
      p1Length,
      stateHashScratch,
    );
    transientStateDescriptor.p0Length = p0Length;
    transientStateDescriptor.p1Length = p1Length;
    metrics.stateBuilds += 1;
    metrics.transientStateDescriptorUses += 1;
    return transientStateDescriptor;
  }

  function stateDescriptor(stateId) {
    readStateParts(stateId);
    const supportIndex = transientStateDescriptor.supportIndex;
    const p0ClassId = transientStateDescriptor.p0ClassId;
    const p1ClassId = transientStateDescriptor.p1ClassId;
    metrics.stateBuilds += 1;
    metrics.stateDescriptorObjectsAllocated += 1;
    return createQuotientSemanticClassReferenceDescriptor(
      stateId,
      supportIndex,
      p0ClassId,
      p1ClassId,
      transientStateDescriptor.p0Length,
      transientStateDescriptor.p1Length,
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
