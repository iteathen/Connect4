import assert from 'node:assert/strict';

import { compileDeviceProgram, openCudaRuntime } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';

import { coverage64CoreAbsorptionExperimentalDeviceProgram } from './absorption-program.mjs';
import { createRealCoverage64Fixture } from './real-fixture.mjs';

const U32_BYTES = 4;
const native = process.argv.includes('native');

function pop32(value) { let x = value >>> 0; let count = 0; while (x !== 0) { x &= x - 1; count += 1; } return count; }
function subset64(left, right) { return ((left.lo & ~right.lo) >>> 0) === 0 && ((left.hi & ~right.hi) >>> 0) === 0; }
function or64(left, right) { return { lo: (left.lo | right.lo) >>> 0, hi: (left.hi | right.hi) >>> 0 }; }
function and64(left, right) { return { lo: (left.lo & right.lo) >>> 0, hi: (left.hi & right.hi) >>> 0 }; }
function key64(value) { return `${value.hi.toString(16).padStart(8, '0')}:${value.lo.toString(16).padStart(8, '0')}`; }
function equal64(left, right) { return left.lo === right.lo && left.hi === right.hi; }

function normalizeMinimal64(values) {
  const unique = new Map();
  for (const value of values) unique.set(key64(value), { lo: value.lo >>> 0, hi: value.hi >>> 0 });
  const ordered = [...unique.values()].sort((a, b) => {
    const delta = pop32(a.lo) + pop32(a.hi) - pop32(b.lo) - pop32(b.hi);
    if (delta !== 0) return delta;
    return a.hi - b.hi || a.lo - b.lo;
  });
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) if (subset64(retained, candidate)) continue outer;
    result.push(candidate);
  }
  return result;
}

function packedCapacityKeep(candidate, segment) {
  const dictionary = segment.dictionary;
  const forced = {
    lo: (candidate.lo & dictionary.singletonMaskLo) >>> 0,
    hi: (candidate.hi & dictionary.singletonMaskHi) >>> 0,
  };
  const forcedCount = pop32(forced.lo) + pop32(forced.hi);
  if (forcedCount > segment.exactCount) return false;

  let satisfiedLo = 0;
  let satisfiedHi = 0;
  for (let cell = 0; cell < segment.cellCount; cell += 1) {
    const bit = dictionary.singletonBits[cell];
    if ((forced.lo & bit.lo) !== 0 || (forced.hi & bit.hi) !== 0) {
      satisfiedLo = (satisfiedLo | dictionary.contains[cell].lo) >>> 0;
      satisfiedHi = (satisfiedHi | dictionary.contains[cell].hi) >>> 0;
    }
  }
  const extra = { lo: (candidate.lo & ~satisfiedLo) >>> 0, hi: (candidate.hi & ~satisfiedHi) >>> 0 };
  if (extra.lo === 0 && extra.hi === 0) return true;
  if (forcedCount === segment.exactCount) return false;
  if (forcedCount + 1 !== segment.exactCount) return true;

  for (let cell = 0; cell < segment.cellCount; cell += 1) {
    const bit = dictionary.singletonBits[cell];
    if ((forced.lo & bit.lo) !== 0 || (forced.hi & bit.hi) !== 0) continue;
    if (subset64(extra, dictionary.contains[cell])) return true;
  }
  return false;
}

function cpuAbsorption(segment) {
  assert(segment.left.length > 0 && segment.right.length > 0);
  let coreA = { ...segment.left[0] };
  for (const value of segment.left) coreA = and64(coreA, value);
  let coreB = { ...segment.right[0] };
  for (const value of segment.right) coreB = and64(coreB, value);

  const leftAbsorbed = new Uint32Array(segment.left.length);
  const rightAbsorbed = new Uint32Array(segment.right.length);
  for (let left = 0; left < segment.left.length; left += 1) {
    for (let right = 0; right < segment.right.length; right += 1) {
      if (leftAbsorbed[left] === 0 && subset64(segment.right[right], or64(segment.left[left], coreB))) leftAbsorbed[left] = 1;
      if (rightAbsorbed[right] === 0 && subset64(segment.left[left], or64(segment.right[right], coreA))) rightAbsorbed[right] = 1;
    }
  }

  const generated = [];
  const occurrenceCandidates = [];
  function emit(candidate) {
    generated.push(candidate);
    if (packedCapacityKeep(candidate, segment)) occurrenceCandidates.push(candidate);
  }

  let absorbedRecordEmits = 0;
  for (let left = 0; left < segment.left.length; left += 1) {
    if (leftAbsorbed[left] !== 0) {
      absorbedRecordEmits += 1;
      emit(or64(segment.left[left], coreB));
    }
  }
  for (let right = 0; right < segment.right.length; right += 1) {
    if (rightAbsorbed[right] !== 0) {
      absorbedRecordEmits += 1;
      emit(or64(segment.right[right], coreA));
    }
  }

  let remainingPairs = 0;
  for (let left = 0; left < segment.left.length; left += 1) {
    if (leftAbsorbed[left] !== 0) continue;
    for (let right = 0; right < segment.right.length; right += 1) {
      if (rightAbsorbed[right] !== 0) continue;
      remainingPairs += 1;
      emit(or64(segment.left[left], segment.right[right]));
    }
  }

  const generatedOperations = absorbedRecordEmits + remainingPairs;
  assert.equal(generated.length, generatedOperations, `${segment.id} generated-operation accounting drift`);

  const classes = new Map();
  for (const candidate of generated) {
    const key = key64(candidate);
    const current = classes.get(key);
    if (current) current.count += 1;
    else classes.set(key, { candidate, count: 1 });
  }

  const quotientCandidates = [];
  let acceptedClasses = 0;
  let rejectedClasses = 0;
  let acceptedOccurrencesByClass = 0;
  let rejectedOccurrencesByClass = 0;
  let duplicateAcceptedOccurrences = 0;
  let duplicateRejectedOccurrences = 0;
  for (const { candidate, count } of classes.values()) {
    if (packedCapacityKeep(candidate, segment)) {
      quotientCandidates.push(candidate);
      acceptedClasses += 1;
      acceptedOccurrencesByClass += count;
      duplicateAcceptedOccurrences += count - 1;
    } else {
      rejectedClasses += 1;
      rejectedOccurrencesByClass += count;
      duplicateRejectedOccurrences += count - 1;
    }
  }
  assert.equal(
    occurrenceCandidates.length,
    acceptedOccurrencesByClass,
    `${segment.id} exact-class guard outcome disagrees with occurrence evaluation`,
  );
  assert.equal(
    generated.length - occurrenceCandidates.length,
    rejectedOccurrencesByClass,
    `${segment.id} rejected occurrence accounting drift`,
  );

  const frontier = normalizeMinimal64(occurrenceCandidates);
  const quotientFrontier = normalizeMinimal64(quotientCandidates);
  assert.deepEqual(frontier.map(key64).sort(), quotientFrontier.map(key64).sort(), `${segment.id} quotient frontier mismatch`);
  assert.deepEqual(frontier.map(key64).sort(), segment.authority.frontier.map(key64).sort(), `${segment.id} absorption frontier mismatch`);

  const exactResultClasses = classes.size;
  const duplicateGeneratedOccurrences = generated.length - exactResultClasses;
  assert.equal(
    duplicateGeneratedOccurrences,
    duplicateAcceptedOccurrences + duplicateRejectedOccurrences,
    `${segment.id} duplicate class accounting drift`,
  );

  return {
    coreA,
    coreB,
    leftAbsorbed,
    rightAbsorbed,
    remainingPairs,
    absorbedRecordEmits,
    generatedOperations,
    exactResultClasses,
    duplicateGeneratedOccurrences,
    occurrenceGuardEvaluations: generatedOperations,
    quotientGuardEvaluations: exactResultClasses,
    guardEvaluationsSaved: duplicateGeneratedOccurrences,
    acceptedOccurrences: occurrenceCandidates.length,
    rejectedOccurrences: generated.length - occurrenceCandidates.length,
    acceptedClasses,
    rejectedClasses,
    duplicateAcceptedOccurrences,
    duplicateRejectedOccurrences,
    frontier,
  };
}

function encodeU32(values) { return new Uint8Array(values.buffer, values.byteOffset, values.byteLength); }
async function allocate(runtime, count, access = 'read-write') {
  const memory = await runtime.allocateDevice({ byteLength: count * U32_BYTES });
  const view = await memory.view({ dtype: 'u32', elementCount: count, access });
  return { memory, view, count };
}
async function write(allocation, values) { assert.equal(values.length, allocation.count); await allocation.memory.write(encodeU32(values)); }
async function read(allocation) {
  const result = await allocation.memory.read({ byteLength: allocation.count * U32_BYTES });
  return new Uint32Array(result.bytes.buffer, result.bytes.byteOffset, allocation.count);
}
async function closeAllocation(allocation) { await allocation.view.close(); await allocation.memory.close(); }
function binding(name) { return Object.freeze({ binding: name }); }

const fixture = createRealCoverage64Fixture();
const expectations = fixture.segments.map(cpuAbsorption);
const segmentCount = fixture.segments.length;
const leftLoHost = new Uint32Array(fixture.totalLeft);
const leftHiHost = new Uint32Array(fixture.totalLeft);
const rightLoHost = new Uint32Array(fixture.totalRight);
const rightHiHost = new Uint32Array(fixture.totalRight);
const leftOffsetsHost = new Uint32Array(segmentCount + 1);
const rightOffsetsHost = new Uint32Array(segmentCount + 1);
const expectedLeft = new Uint32Array(fixture.totalLeft);
const expectedRight = new Uint32Array(fixture.totalRight);
const expectedCoreALo = new Uint32Array(segmentCount);
const expectedCoreAHi = new Uint32Array(segmentCount);
const expectedCoreBLo = new Uint32Array(segmentCount);
const expectedCoreBHi = new Uint32Array(segmentCount);
let leftCursor = 0;
let rightCursor = 0;
let rawPairs = 0;
let remainingPairs = 0;
const quotientTotals = {
  absorbedRecordEmits: 0,
  generatedOperations: 0,
  exactResultClasses: 0,
  duplicateGeneratedOccurrences: 0,
  occurrenceGuardEvaluations: 0,
  quotientGuardEvaluations: 0,
  guardEvaluationsSaved: 0,
  acceptedOccurrences: 0,
  rejectedOccurrences: 0,
  acceptedClasses: 0,
  rejectedClasses: 0,
  duplicateAcceptedOccurrences: 0,
  duplicateRejectedOccurrences: 0,
};
const segmentMetrics = [];
for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
  const segment = fixture.segments[segmentIndex];
  const expected = expectations[segmentIndex];
  leftOffsetsHost[segmentIndex] = leftCursor;
  rightOffsetsHost[segmentIndex] = rightCursor;
  expectedCoreALo[segmentIndex] = expected.coreA.lo;
  expectedCoreAHi[segmentIndex] = expected.coreA.hi;
  expectedCoreBLo[segmentIndex] = expected.coreB.lo;
  expectedCoreBHi[segmentIndex] = expected.coreB.hi;
  for (let index = 0; index < segment.left.length; index += 1) {
    leftLoHost[leftCursor] = segment.left[index].lo;
    leftHiHost[leftCursor] = segment.left[index].hi;
    expectedLeft[leftCursor] = expected.leftAbsorbed[index];
    leftCursor += 1;
  }
  for (let index = 0; index < segment.right.length; index += 1) {
    rightLoHost[rightCursor] = segment.right[index].lo;
    rightHiHost[rightCursor] = segment.right[index].hi;
    expectedRight[rightCursor] = expected.rightAbsorbed[index];
    rightCursor += 1;
  }
  const segmentRawPairs = segment.left.length * segment.right.length;
  rawPairs += segmentRawPairs;
  remainingPairs += expected.remainingPairs;
  for (const key of Object.keys(quotientTotals)) quotientTotals[key] += expected[key];
  segmentMetrics.push({
    id: segment.id,
    geometry: segment.geometry,
    rank: segment.rank,
    supportHeights: segment.supportHeights,
    beneficiary: segment.beneficiary,
    exactCount: segment.exactCount,
    dictionarySize: segment.dictionarySize,
    leftRecords: segment.left.length,
    rightRecords: segment.right.length,
    rawPairs: segmentRawPairs,
    remainingPairs: expected.remainingPairs,
    absorbedRecordEmits: expected.absorbedRecordEmits,
    generatedOperations: expected.generatedOperations,
    exactResultClasses: expected.exactResultClasses,
    duplicateGeneratedOccurrences: expected.duplicateGeneratedOccurrences,
    occurrenceGuardEvaluations: expected.occurrenceGuardEvaluations,
    quotientGuardEvaluations: expected.quotientGuardEvaluations,
    guardEvaluationsSaved: expected.guardEvaluationsSaved,
    acceptedOccurrences: expected.acceptedOccurrences,
    rejectedOccurrences: expected.rejectedOccurrences,
    acceptedClasses: expected.acceptedClasses,
    rejectedClasses: expected.rejectedClasses,
    duplicateAcceptedOccurrences: expected.duplicateAcceptedOccurrences,
    duplicateRejectedOccurrences: expected.duplicateRejectedOccurrences,
  });
}
leftOffsetsHost[segmentCount] = leftCursor;
rightOffsetsHost[segmentCount] = rightCursor;
assert.equal(leftCursor, fixture.totalLeft);
assert.equal(rightCursor, fixture.totalRight);

const runtime = await (native ? openCudaRuntime : openCudaRuntimeForTesting)({ compiler: true });
const allocations = [];
let module;
let fn;
let prepared;
try {
  const compiled = await compileDeviceProgram(runtime, coverage64CoreAbsorptionExperimentalDeviceProgram);
  const artifact = compiled.linker?.artifact ?? compiled.compiler?.artifact;
  assert(artifact && (artifact.format === 'ptx' || artifact.format === 'cubin'));
  module = await runtime.loadModule({ format: artifact.format, bytes: artifact.bytes });
  const entry = compiled.deviceProgram.kernels.find((kernel) => kernel.name === 'markCoreRelativeAbsorption64');
  assert(entry);
  fn = await module.getFunction({ name: entry.functionName, parameters: entry.parameters });

  async function from(values, access = 'read') { const a = await allocate(runtime, values.length, access); allocations.push(a); await write(a, values); return a; }
  async function output(count) { const a = await allocate(runtime, count, 'read-write'); allocations.push(a); return a; }
  const leftLo = await from(leftLoHost); const leftHi = await from(leftHiHost);
  const rightLo = await from(rightLoHost); const rightHi = await from(rightHiHost);
  const leftOffsets = await from(leftOffsetsHost); const rightOffsets = await from(rightOffsetsHost);
  const leftAbsorbed = await output(fixture.totalLeft); const rightAbsorbed = await output(fixture.totalRight);
  const coreALo = await output(segmentCount); const coreAHi = await output(segmentCount);
  const coreBLo = await output(segmentCount); const coreBHi = await output(segmentCount);
  const status = await output(segmentCount);

  prepared = await runtime.prepareOperationDag({ nodes: [{
    id: 'mark-core-relative-absorption', function: fn,
    grid: { x: segmentCount, y: 1, z: 1 }, block: { x: 256, y: 1, z: 1 },
    arguments: [
      binding('leftLo'), binding('leftHi'), binding('rightLo'), binding('rightHi'),
      binding('leftOffsets'), binding('rightOffsets'), binding('leftAbsorbed'), binding('rightAbsorbed'),
      binding('coreALo'), binding('coreAHi'), binding('coreBLo'), binding('coreBHi'), binding('status'),
      fixture.totalLeft, fixture.totalRight, segmentCount,
    ],
    accesses: [
      { argumentIndex: 0, byteOffset: 0, byteLength: fixture.totalLeft * U32_BYTES, mode: 'read' },
      { argumentIndex: 1, byteOffset: 0, byteLength: fixture.totalLeft * U32_BYTES, mode: 'read' },
      { argumentIndex: 2, byteOffset: 0, byteLength: fixture.totalRight * U32_BYTES, mode: 'read' },
      { argumentIndex: 3, byteOffset: 0, byteLength: fixture.totalRight * U32_BYTES, mode: 'read' },
      { argumentIndex: 4, byteOffset: 0, byteLength: (segmentCount + 1) * U32_BYTES, mode: 'read' },
      { argumentIndex: 5, byteOffset: 0, byteLength: (segmentCount + 1) * U32_BYTES, mode: 'read' },
      { argumentIndex: 6, byteOffset: 0, byteLength: fixture.totalLeft * U32_BYTES, mode: 'write' },
      { argumentIndex: 7, byteOffset: 0, byteLength: fixture.totalRight * U32_BYTES, mode: 'write' },
      { argumentIndex: 8, byteOffset: 0, byteLength: segmentCount * U32_BYTES, mode: 'read-write' },
      { argumentIndex: 9, byteOffset: 0, byteLength: segmentCount * U32_BYTES, mode: 'read-write' },
      { argumentIndex: 10, byteOffset: 0, byteLength: segmentCount * U32_BYTES, mode: 'read-write' },
      { argumentIndex: 11, byteOffset: 0, byteLength: segmentCount * U32_BYTES, mode: 'read-write' },
      { argumentIndex: 12, byteOffset: 0, byteLength: segmentCount * U32_BYTES, mode: 'write' },
    ],
  }] });

  const operation = await prepared.submit({ bindings: {
    leftLo: leftLo.view, leftHi: leftHi.view, rightLo: rightLo.view, rightHi: rightHi.view,
    leftOffsets: leftOffsets.view, rightOffsets: rightOffsets.view,
    leftAbsorbed: leftAbsorbed.view, rightAbsorbed: rightAbsorbed.view,
    coreALo: coreALo.view, coreAHi: coreAHi.view, coreBLo: coreBLo.view, coreBHi: coreBHi.view,
    status: status.view,
  } });
  const terminal = await operation.wait();
  assert.equal(terminal.status, 'completed');
  await operation.close();

  if (native) {
    assert.deepEqual([...await read(leftAbsorbed)], [...expectedLeft]);
    assert.deepEqual([...await read(rightAbsorbed)], [...expectedRight]);
    assert.deepEqual([...await read(coreALo)], [...expectedCoreALo]);
    assert.deepEqual([...await read(coreAHi)], [...expectedCoreAHi]);
    assert.deepEqual([...await read(coreBLo)], [...expectedCoreBLo]);
    assert.deepEqual([...await read(coreBHi)], [...expectedCoreBHi]);
    assert.deepEqual([...await read(status)], Array(segmentCount).fill(0));
  }

  console.log(JSON.stringify({
    schemaVersion: 2,
    kind: 'connect4-bsfp-core-relative-absorption-device-qualification',
    mode: native ? 'native' : 'portable',
    outcome: native ? 'native-exact-mark-pass' : 'portable-compile-prepare-submit-pass',
    fixtureKind: fixture.fixtureKind,
    segments: segmentCount,
    rawPairs,
    remainingPairs,
    pairEliminationRate: rawPairs === 0 ? 0 : 1 - remainingPairs / rawPairs,
    leftRecords: fixture.totalLeft,
    rightRecords: fixture.totalRight,
    resultIdentityQuotient: {
      ...quotientTotals,
      guardReduction: quotientTotals.occurrenceGuardEvaluations === 0
        ? 0
        : quotientTotals.guardEvaluationsSaved / quotientTotals.occurrenceGuardEvaluations,
      duplicateRejectedFractionOfSavings: quotientTotals.guardEvaluationsSaved === 0
        ? 0
        : quotientTotals.duplicateRejectedOccurrences / quotientTotals.guardEvaluationsSaved,
    },
    segmentMetrics,
    cpuAuthorityFrontierMismatches: 0,
    resultIdentityQuotientMismatches: 0,
    nativeDeviceEqualityChecked: native,
  }, null, 2));
} finally {
  if (prepared) await prepared.close();
  if (fn) await fn.close();
  if (module) await module.close();
  for (let index = allocations.length - 1; index >= 0; index -= 1) await closeAllocation(allocations[index]);
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, true);
}
