import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { openCudaRuntime } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';

import { createCoverage64WarpCofactorExperimentalPlan } from './cofactor-warp-plan.mjs';
import { createRealCoverage64CofactorFixture } from './real-cofactor-fixture.mjs';

const U32_BYTES = 4;
const NATIVE_WARMUPS = 2;
const NATIVE_REPETITIONS = 15;

function positiveIntegerEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${name} must be a positive safe integer`);
  return value;
}

function encodeU32(values) { return new Uint8Array(values.buffer, values.byteOffset, values.byteLength); }

async function allocateU32(runtime, count, access = 'read-write') {
  const memory = await runtime.allocateDevice({ byteLength: count * U32_BYTES });
  const view = await memory.view({ dtype: 'u32', elementCount: count, access });
  return { memory, view, count };
}

async function writeU32(allocation, values) {
  assert.equal(values.length, allocation.count);
  await allocation.memory.write(encodeU32(values));
}

async function readU32(allocation) {
  const result = await allocation.memory.read({ byteLength: allocation.count * U32_BYTES });
  return new Uint32Array(result.bytes.buffer, result.bytes.byteOffset, allocation.count);
}

async function closeAllocation(allocation) {
  await allocation.view.close();
  await allocation.memory.close();
}

function summarize(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  const sum = sorted.reduce((total, value) => total + value, 0);
  return { min: sorted[0], median: sorted[Math.floor(sorted.length / 2)], mean: sum / sorted.length, max: sorted.at(-1) };
}

async function runOperation(plan, bindings) {
  const started = performance.now();
  const operation = await plan.submit(bindings);
  try {
    const terminal = await operation.wait();
    assert.equal(terminal.status, 'completed');
    return performance.now() - started;
  } finally {
    await operation.close();
  }
}

function bitIsSet(value, id) {
  if (id < 32) return (value.lo & ((1 << id) >>> 0)) !== 0;
  return (value.hi & ((1 << (id - 32)) >>> 0)) !== 0;
}

function setChildPreimage(preimageLo, preimageHi, base, parentId, childId) {
  const index = base + parentId;
  if (childId < 32) preimageLo[index] = (preimageLo[index] | ((1 << childId) >>> 0)) >>> 0;
  else preimageHi[index] = (preimageHi[index] | ((1 << (childId - 32)) >>> 0)) >>> 0;
}

function packFixture(fixture) {
  const segmentCount = fixture.segments.length;
  const inputLo = new Uint32Array(fixture.totalRecords);
  const inputHi = new Uint32Array(fixture.totalRecords);
  const recordOffsets = new Uint32Array(segmentCount + 1);
  const validLo = new Uint32Array(segmentCount);
  const validHi = new Uint32Array(segmentCount);
  const killLo = new Uint32Array(segmentCount);
  const killHi = new Uint32Array(segmentCount);
  const preimageLo = new Uint32Array(segmentCount * fixture.maxDictionary);
  const preimageHi = new Uint32Array(segmentCount * fixture.maxDictionary);
  const expectedLo = new Uint32Array(fixture.totalRecords);
  const expectedHi = new Uint32Array(fixture.totalRecords);
  const expectedKeep = new Uint32Array(fixture.totalRecords);

  let cursor = 0;
  for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
    const segment = fixture.segments[segmentIndex];
    recordOffsets[segmentIndex] = cursor;
    validLo[segmentIndex] = segment.validMask.lo;
    validHi[segmentIndex] = segment.validMask.hi;
    killLo[segmentIndex] = segment.killMask.lo;
    killHi[segmentIndex] = segment.killMask.hi;
    const mapBase = segmentIndex * fixture.maxDictionary;

    for (let childId = 0; childId < segment.contributions.length; childId += 1) {
      const contribution = segment.contributions[childId];
      for (let parentId = 0; parentId < segment.parentDictionary.length; parentId += 1) {
        if (bitIsSet(contribution, parentId)) setChildPreimage(preimageLo, preimageHi, mapBase, parentId, childId);
      }
    }

    // Independent inversion check: each child basis image must be reconstructed
    // exactly from the parent-bit preimage relation before any CUDA submission.
    for (let childId = 0; childId < segment.contributions.length; childId += 1) {
      let reconstructedLo = 0;
      let reconstructedHi = 0;
      for (let parentId = 0; parentId < segment.parentDictionary.length; parentId += 1) {
        const index = mapBase + parentId;
        const present = childId < 32
          ? (preimageLo[index] & ((1 << childId) >>> 0)) !== 0
          : (preimageHi[index] & ((1 << (childId - 32)) >>> 0)) !== 0;
        if (!present) continue;
        if (parentId < 32) reconstructedLo = (reconstructedLo | ((1 << parentId) >>> 0)) >>> 0;
        else reconstructedHi = (reconstructedHi | ((1 << (parentId - 32)) >>> 0)) >>> 0;
      }
      assert.equal(reconstructedLo, segment.contributions[childId].lo, `segment ${segmentIndex} child ${childId} preimage low inversion mismatch`);
      assert.equal(reconstructedHi, segment.contributions[childId].hi, `segment ${segmentIndex} child ${childId} preimage high inversion mismatch`);
    }

    for (let local = 0; local < segment.input.length; local += 1) {
      const input = segment.input[local];
      const expected = segment.expected[local];
      inputLo[cursor] = input.lo;
      inputHi[cursor] = input.hi;
      expectedLo[cursor] = expected.lo;
      expectedHi[cursor] = expected.hi;
      expectedKeep[cursor] = expected.keep;
      cursor += 1;
    }
  }
  recordOffsets[segmentCount] = cursor;
  assert.equal(cursor, fixture.totalRecords);

  return {
    segmentCount,
    inputLo, inputHi, recordOffsets,
    validLo, validHi, killLo, killHi,
    preimageLo, preimageHi,
    expectedLo, expectedHi, expectedKeep,
  };
}

async function qualify(runtime, native, fixture) {
  assert.ok(fixture.segments.some((segment) => segment.ownerTrue), 'fixture must include beneficiary-owned landing edges');
  assert.ok(fixture.segments.some((segment) => !segment.ownerTrue), 'fixture must include opponent-owned landing edges');
  const packed = packFixture(fixture);
  const allocations = [];

  const planStart = performance.now();
  const plan = await createCoverage64WarpCofactorExperimentalPlan(runtime, {
    recordCapacity: fixture.totalRecords,
    segmentCapacity: packed.segmentCount,
    maxDictionary: fixture.maxDictionary,
    blockSize: 256,
  });
  const compileLoadPrepareMs = performance.now() - planStart;

  async function allocFrom(values, access = 'read') {
    const allocation = await allocateU32(runtime, values.length, access);
    allocations.push(allocation);
    await writeU32(allocation, values);
    return allocation;
  }
  async function allocOutput(count) {
    const allocation = await allocateU32(runtime, count, 'read-write');
    allocations.push(allocation);
    return allocation;
  }

  try {
    const inputLo = await allocFrom(packed.inputLo);
    const inputHi = await allocFrom(packed.inputHi);
    const recordOffsets = await allocFrom(packed.recordOffsets);
    const validLo = await allocFrom(packed.validLo);
    const validHi = await allocFrom(packed.validHi);
    const killLo = await allocFrom(packed.killLo);
    const killHi = await allocFrom(packed.killHi);
    const preimageLo = await allocFrom(packed.preimageLo);
    const preimageHi = await allocFrom(packed.preimageHi);
    const outputLo = await allocOutput(fixture.totalRecords);
    const outputHi = await allocOutput(fixture.totalRecords);
    const outputKeep = await allocOutput(fixture.totalRecords);
    const segmentStatus = await allocOutput(packed.segmentCount);

    const bindings = {
      inputLo: inputLo.view, inputHi: inputHi.view, recordOffsets: recordOffsets.view,
      validLo: validLo.view, validHi: validHi.view, killLo: killLo.view, killHi: killHi.view,
      preimageLo: preimageLo.view, preimageHi: preimageHi.view,
      outputLo: outputLo.view, outputHi: outputHi.view, outputKeep: outputKeep.view,
      segmentStatus: segmentStatus.view,
    };

    const warmups = native ? positiveIntegerEnv('BSFP_WARP_COFACTOR_WARMUPS', NATIVE_WARMUPS) : 1;
    const repetitions = native ? positiveIntegerEnv('BSFP_WARP_COFACTOR_REPS', NATIVE_REPETITIONS) : 1;
    for (let index = 0; index < warmups; index += 1) await runOperation(plan, bindings);
    const samples = [];
    for (let index = 0; index < repetitions; index += 1) samples.push(await runOperation(plan, bindings));

    const result = {
      schemaVersion: 1,
      kind: 'connect4-cuda-bsfp-clause-coverage64-warp-cofactor-qualification',
      mode: native ? 'native' : 'portable',
      outcome: native ? 'native-exact-warp-cofactor-map-pass' : 'portable-warp-cofactor-compile-prepare-submit-pass',
      planContract: plan.contract,
      deviceJsContract: plan.deviceJsContract,
      fixtureKind: fixture.fixtureKind,
      semanticScope: 'one warp per real support-edge child coverage record; exact kill guard plus parent-bit preimage ballot image',
      segments: fixture.segments.map((segment) => ({
        id: segment.id,
        geometry: segment.geometry,
        rank: segment.rank,
        parentSupportHeights: segment.parentSupportHeights,
        childSupportHeights: segment.childSupportHeights,
        landingCell: segment.landingCell,
        mover: segment.mover,
        beneficiary: segment.beneficiary,
        ownerTrue: segment.ownerTrue,
        childDictionarySize: segment.childDictionary.length,
        parentDictionarySize: segment.parentDictionary.length,
        inputRecords: segment.input.length,
        killedRecords: segment.killed,
      })),
      totals: {
        inputRecords: fixture.totalRecords,
        killedRecords: fixture.killedRecords,
        retainedRecords: fixture.totalRecords - fixture.killedRecords,
      },
      maxDictionary: fixture.maxDictionary,
      blockSize: plan.blockSize,
      warpsPerBlock: plan.warpsPerBlock,
      timingsMs: { compileLoadPrepare: compileLoadPrepareMs, submissionWait: summarize(samples), rawSubmissionWaitSamples: samples },
      deviceSemanticValidation: native ? 'exact' : 'not-executed-by-testing-runtime',
      preimageInversionMismatches: 0,
      packedCpuAuthorityMismatches: 0,
    };

    if (native) {
      const observedLo = await readU32(outputLo);
      const observedHi = await readU32(outputHi);
      const observedKeep = await readU32(outputKeep);
      const statuses = await readU32(segmentStatus);
      for (let segment = 0; segment < packed.segmentCount; segment += 1) assert.equal(statuses[segment], 0, `warp cofactor segment ${segment} status failed`);
      for (let record = 0; record < fixture.totalRecords; record += 1) {
        assert.equal(observedKeep[record], packed.expectedKeep[record], `warp cofactor record ${record} keep mismatch`);
        assert.equal(observedLo[record], packed.expectedLo[record], `warp cofactor record ${record} low mismatch`);
        assert.equal(observedHi[record], packed.expectedHi[record], `warp cofactor record ${record} high mismatch`);
      }
      result.exactRecordMismatches = 0;
    }

    return result;
  } finally {
    await plan.close();
    for (let index = allocations.length - 1; index >= 0; index -= 1) await closeAllocation(allocations[index]);
  }
}

const mode = process.argv[2] ?? 'portable';
if (!['portable', 'native'].includes(mode)) throw new RangeError('mode must be portable or native');
const native = mode === 'native';
const fixture = createRealCoverage64CofactorFixture();

let runtime;
try {
  runtime = native ? await openCudaRuntime({ compiler: true }) : await openCudaRuntimeForTesting({ compiler: true });
  const result = await qualify(runtime, native, fixture);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} finally {
  if (runtime) {
    const closed = await runtime.close();
    assert.equal(closed.graceful, true);
  }
}
