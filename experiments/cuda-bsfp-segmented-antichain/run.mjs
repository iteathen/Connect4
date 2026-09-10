import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { openCudaRuntime } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';
import {
  SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION,
  SEGMENTED_PACKED_ANTICHAIN_42_STATUS,
  createSegmentedPackedAntichain42Plan,
} from '../../components/bsfp/cuda/index.mjs';

const U32_BYTES = 4;
const DEFAULT_NATIVE_SEGMENTS = 1024;
const DEFAULT_NATIVE_SEGMENT_SIZE = 512;
const PORTABLE_SEGMENTS = 8;
const PORTABLE_SEGMENT_SIZE = 32;

function positiveIntegerEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 2) throw new RangeError(`${name} must be an integer >= 2`);
  return value;
}

function firstEqualPopcountMasks(count) {
  const masks = [];
  function visit(nextBit, remaining, mask) {
    if (masks.length >= count) return;
    if (remaining === 0) {
      masks.push(mask >>> 0);
      return;
    }
    for (let bit = nextBit; bit <= 20 - remaining && masks.length < count; bit += 1) {
      visit(bit + 1, remaining - 1, (mask | (1 << bit)) >>> 0);
    }
  }
  visit(0, 10, 0);
  if (masks.length < count) throw new RangeError('fixture segment size exceeds available equal-popcount masks');
  return Uint32Array.from(masks);
}

function createFixture(segmentCount, segmentSize) {
  const candidateCount = segmentCount * segmentSize;
  if (!Number.isSafeInteger(candidateCount)) throw new RangeError('candidate fixture size exceeds safe integer range');
  const baseMasks = firstEqualPopcountMasks(segmentSize - 1);
  const candidateLo = new Uint32Array(candidateCount);
  const candidateHi = new Uint32Array(candidateCount);
  const candidateSegment = new Uint32Array(candidateCount);
  const segmentOffsets = new Uint32Array(segmentCount + 1);
  const segmentDirections = new Uint32Array(segmentCount);

  for (let segment = 0; segment < segmentCount; segment += 1) {
    const base = segment * segmentSize;
    segmentOffsets[segment] = base;
    segmentDirections[segment] = segment & 1
      ? SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MAXIMAL
      : SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MINIMAL;
    const highSalt = ((segment * 73) ^ (segment >>> 2)) & 0x3ff;
    for (let local = 0; local < segmentSize - 1; local += 1) {
      const index = base + local;
      candidateLo[index] = baseMasks[local];
      candidateHi[index] = highSalt;
      candidateSegment[index] = segment;
    }
    // One exact duplicate per segment exercises deterministic tie-breaking:
    // the earlier record survives and the final record is removed.
    const duplicate = base + segmentSize - 1;
    candidateLo[duplicate] = candidateLo[base];
    candidateHi[duplicate] = candidateHi[base];
    candidateSegment[duplicate] = segment;
  }
  segmentOffsets[segmentCount] = candidateCount;

  return Object.freeze({
    segmentCount,
    segmentSize,
    candidateCount,
    expectedSurvivorsPerSegment: segmentSize - 1,
    candidateLo,
    candidateHi,
    candidateSegment,
    segmentOffsets,
    segmentDirections,
  });
}

function encodeU32(values) {
  return new Uint8Array(values.buffer, values.byteOffset, values.byteLength);
}

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

async function qualify(runtime, native, fixture) {
  const allocations = [];
  const outputCapacityPerSegment = fixture.segmentSize;
  const outputElements = fixture.segmentCount * outputCapacityPerSegment;
  const planStarted = performance.now();
  const plan = await createSegmentedPackedAntichain42Plan(runtime, {
    candidateCapacity: fixture.candidateCount,
    segmentCapacity: fixture.segmentCount,
    outputCapacityPerSegment,
    blockSize: 256,
  });
  const compileLoadPrepareMs = performance.now() - planStarted;

  try {
    const allocationStarted = performance.now();
    const candidateLo = await allocateU32(runtime, fixture.candidateCount, 'read');
    const candidateHi = await allocateU32(runtime, fixture.candidateCount, 'read');
    const candidateSegment = await allocateU32(runtime, fixture.candidateCount, 'read');
    const segmentOffsets = await allocateU32(runtime, fixture.segmentCount + 1, 'read');
    const segmentDirections = await allocateU32(runtime, fixture.segmentCount, 'read');
    const dominated = await allocateU32(runtime, fixture.candidateCount, 'write');
    const checks = await allocateU32(runtime, fixture.candidateCount, 'write');
    const outputLo = await allocateU32(runtime, outputElements, 'write');
    const outputHi = await allocateU32(runtime, outputElements, 'write');
    const outputCounts = await allocateU32(runtime, fixture.segmentCount, 'write');
    const outputStatus = await allocateU32(runtime, fixture.segmentCount, 'write');
    allocations.push(candidateLo, candidateHi, candidateSegment, segmentOffsets, segmentDirections, dominated, checks, outputLo, outputHi, outputCounts, outputStatus);
    const allocationMs = performance.now() - allocationStarted;

    const uploadStarted = performance.now();
    await writeU32(candidateLo, fixture.candidateLo);
    await writeU32(candidateHi, fixture.candidateHi);
    await writeU32(candidateSegment, fixture.candidateSegment);
    await writeU32(segmentOffsets, fixture.segmentOffsets);
    await writeU32(segmentDirections, fixture.segmentDirections);
    const uploadMs = performance.now() - uploadStarted;

    const bindings = {
      candidateLo: candidateLo.view,
      candidateHi: candidateHi.view,
      candidateSegment: candidateSegment.view,
      segmentOffsets: segmentOffsets.view,
      segmentDirections: segmentDirections.view,
      dominated: dominated.view,
      checks: checks.view,
      outputLo: outputLo.view,
      outputHi: outputHi.view,
      outputCounts: outputCounts.view,
      outputStatus: outputStatus.view,
    };

    const executionMs = await runOperation(plan, bindings);
    const result = {
      schemaVersion: 1,
      kind: 'connect4-cuda-bsfp-segmented-packed-antichain-42-qualification',
      mode: native ? 'native' : 'portable',
      outcome: native ? 'native-segmented-packed-antichain-pass' : 'portable-segmented-packed-antichain-compile-submit-pass',
      planContract: plan.contract,
      segmentCount: fixture.segmentCount,
      segmentSize: fixture.segmentSize,
      candidateCount: fixture.candidateCount,
      outputCapacityPerSegment,
      expectedSurvivorsPerSegment: fixture.expectedSurvivorsPerSegment,
      timingsMs: { compileLoadPrepare: compileLoadPrepareMs, allocation: allocationMs, upload: uploadMs, submissionWait: executionMs },
    };

    if (native) {
      const readStarted = performance.now();
      const dominatedValues = await readU32(dominated);
      const checksValues = await readU32(checks);
      const outputLoValues = await readU32(outputLo);
      const outputHiValues = await readU32(outputHi);
      const outputCountValues = await readU32(outputCounts);
      const outputStatusValues = await readU32(outputStatus);
      result.timingsMs.readback = performance.now() - readStarted;

      const verifyStarted = performance.now();
      let observedChecks = 0;
      let removedDuplicates = 0;
      for (let segment = 0; segment < fixture.segmentCount; segment += 1) {
        const base = segment * fixture.segmentSize;
        assert.equal(outputStatusValues[segment], SEGMENTED_PACKED_ANTICHAIN_42_STATUS.OK, `segment ${segment} overflowed`);
        assert.equal(outputCountValues[segment], fixture.expectedSurvivorsPerSegment, `segment ${segment} survivor count`);
        for (let local = 0; local < fixture.segmentSize - 1; local += 1) {
          const index = base + local;
          assert.equal(dominatedValues[index], 0, `segment ${segment} survivor ${local} marked dominated`);
          assert.equal(outputLoValues[segment * outputCapacityPerSegment + local], fixture.candidateLo[index]);
          assert.equal(outputHiValues[segment * outputCapacityPerSegment + local], fixture.candidateHi[index]);
          observedChecks += checksValues[index];
        }
        const duplicate = base + fixture.segmentSize - 1;
        assert.equal(dominatedValues[duplicate], 1, `segment ${segment} duplicate survived`);
        assert.ok(checksValues[duplicate] >= 1 && checksValues[duplicate] < fixture.segmentSize);
        observedChecks += checksValues[duplicate];
        removedDuplicates += 1;
      }
      result.timingsMs.verification = performance.now() - verifyStarted;
      result.observedSubsetChecks = observedChecks;
      result.removedDuplicates = removedDuplicates;
      result.survivors = fixture.segmentCount * fixture.expectedSurvivorsPerSegment;
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
const segmentCount = positiveIntegerEnv('BSFP_SEGMENTED_ANTICHAIN_SEGMENTS', native ? DEFAULT_NATIVE_SEGMENTS : PORTABLE_SEGMENTS);
const segmentSize = positiveIntegerEnv('BSFP_SEGMENTED_ANTICHAIN_SEGMENT_SIZE', native ? DEFAULT_NATIVE_SEGMENT_SIZE : PORTABLE_SEGMENT_SIZE);
const fixture = createFixture(segmentCount, segmentSize);

let runtime;
try {
  runtime = native
    ? await openCudaRuntime({ compiler: true })
    : await openCudaRuntimeForTesting({ compiler: true });
  const result = await qualify(runtime, native, fixture);
  console.log(JSON.stringify(result, null, 2));
} finally {
  if (runtime) {
    const closed = await runtime.close();
    assert.equal(closed.graceful, true);
  }
}
