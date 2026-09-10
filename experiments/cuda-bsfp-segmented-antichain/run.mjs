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

function pop32(value) {
  let x = value >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return Math.imul((x + (x >>> 4)) & 0x0f0f0f0f, 0x01010101) >>> 24;
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
  const candidatePopcount = new Uint32Array(candidateCount);
  const segmentOffsets = new Uint32Array(segmentCount + 1);
  const segmentDirections = new Uint32Array(segmentCount);

  for (let segment = 0; segment < segmentCount; segment += 1) {
    const base = segment * segmentSize;
    segmentOffsets[segment] = base;
    segmentDirections[segment] = segment & 1
      ? SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MAXIMAL
      : SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MINIMAL;
    const highSalt = ((segment * 73) ^ (segment >>> 2)) & 0x3ff;
    const highCount = pop32(highSalt);
    for (let local = 0; local < segmentSize - 1; local += 1) {
      const index = base + local;
      candidateLo[index] = baseMasks[local];
      candidateHi[index] = highSalt;
      candidatePopcount[index] = pop32(baseMasks[local]) + highCount;
    }
    // One exact duplicate per segment exercises deterministic lowest-input-index deduplication.
    const duplicate = base + segmentSize - 1;
    candidateLo[duplicate] = candidateLo[base];
    candidateHi[duplicate] = candidateHi[base];
    candidatePopcount[duplicate] = candidatePopcount[base];
  }
  segmentOffsets[segmentCount] = candidateCount;

  return Object.freeze({
    segmentCount,
    segmentSize,
    candidateCount,
    expectedSurvivorsPerSegment: segmentSize - 1,
    candidateLo,
    candidateHi,
    candidatePopcount,
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

function pairKey(low, high) {
  return `${high.toString(16).padStart(8, '0')}:${low.toString(16).padStart(8, '0')}`;
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
    const candidatePopcount = await allocateU32(runtime, fixture.candidateCount, 'read');
    const segmentOffsets = await allocateU32(runtime, fixture.segmentCount + 1, 'read');
    const segmentDirections = await allocateU32(runtime, fixture.segmentCount, 'read');
    const outputLo = await allocateU32(runtime, outputElements, 'read-write');
    const outputHi = await allocateU32(runtime, outputElements, 'read-write');
    const outputCounts = await allocateU32(runtime, fixture.segmentCount, 'read-write');
    const outputStatus = await allocateU32(runtime, fixture.segmentCount, 'read-write');
    const checks = await allocateU32(runtime, fixture.candidateCount, 'write');
    allocations.push(candidateLo, candidateHi, candidatePopcount, segmentOffsets, segmentDirections, outputLo, outputHi, outputCounts, outputStatus, checks);
    const allocationMs = performance.now() - allocationStarted;

    const uploadStarted = performance.now();
    await writeU32(candidateLo, fixture.candidateLo);
    await writeU32(candidateHi, fixture.candidateHi);
    await writeU32(candidatePopcount, fixture.candidatePopcount);
    await writeU32(segmentOffsets, fixture.segmentOffsets);
    await writeU32(segmentDirections, fixture.segmentDirections);
    const uploadMs = performance.now() - uploadStarted;

    const bindings = {
      candidateLo: candidateLo.view,
      candidateHi: candidateHi.view,
      candidatePopcount: candidatePopcount.view,
      segmentOffsets: segmentOffsets.view,
      segmentDirections: segmentDirections.view,
      outputLo: outputLo.view,
      outputHi: outputHi.view,
      outputCounts: outputCounts.view,
      outputStatus: outputStatus.view,
      checks: checks.view,
    };

    const executionMs = await runOperation(plan, bindings);
    const result = {
      schemaVersion: 2,
      kind: 'connect4-cuda-bsfp-segmented-packed-antichain-42-qualification',
      strategy: 'one-block-per-segment-43-cardinality-phases',
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
      const checksValues = await readU32(checks);
      const outputLoValues = await readU32(outputLo);
      const outputHiValues = await readU32(outputHi);
      const outputCountValues = await readU32(outputCounts);
      const outputStatusValues = await readU32(outputStatus);
      result.timingsMs.readback = performance.now() - readStarted;

      const verifyStarted = performance.now();
      let observedChecks = 0;
      let survivors = 0;
      for (let segment = 0; segment < fixture.segmentCount; segment += 1) {
        const base = segment * fixture.segmentSize;
        assert.equal(outputStatusValues[segment], SEGMENTED_PACKED_ANTICHAIN_42_STATUS.OK, `segment ${segment} overflowed`);
        assert.equal(outputCountValues[segment], fixture.expectedSurvivorsPerSegment, `segment ${segment} survivor count`);
        const expected = [];
        for (let local = 0; local < fixture.segmentSize - 1; local += 1) {
          const index = base + local;
          expected.push(pairKey(fixture.candidateLo[index], fixture.candidateHi[index]));
        }
        expected.sort();
        const actual = [];
        const outputBase = segment * outputCapacityPerSegment;
        for (let local = 0; local < outputCountValues[segment]; local += 1) {
          actual.push(pairKey(outputLoValues[outputBase + local], outputHiValues[outputBase + local]));
        }
        actual.sort();
        assert.deepEqual(actual, expected, `segment ${segment} survivor set`);
        survivors += actual.length;
        for (let local = 0; local < fixture.segmentSize; local += 1) observedChecks += checksValues[base + local];
      }
      result.timingsMs.verification = performance.now() - verifyStarted;
      result.observedFrontierSubsetChecks = observedChecks;
      result.removedDuplicates = fixture.segmentCount;
      result.survivors = survivors;
      result.throughput = {
        candidatesPerSecond: fixture.candidateCount * 1000 / executionMs,
        frontierSubsetChecksPerSecond: observedChecks * 1000 / executionMs,
      };
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
