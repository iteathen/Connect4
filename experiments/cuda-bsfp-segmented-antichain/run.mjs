import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { openCudaRuntime } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';
import {
  SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION,
  SEGMENTED_PACKED_ANTICHAIN_42_STATUS,
  SEGMENTED_PACKED_ANTICHAIN_42_STRATEGY,
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

function pairKey(low, high) {
  return `${high.toString(16).padStart(8, '0')}:${low.toString(16).padStart(8, '0')}`;
}

function subsetPair(aLow, aHigh, bLow, bHigh) {
  return ((aLow & ~bLow) >>> 0) === 0 && ((aHigh & ~bHigh) >>> 0) === 0;
}

function exactExpectedKeys(candidateLo, candidateHi, candidatePopcount, direction) {
  const indices = [];
  for (let index = 0; index < candidateLo.length; index += 1) if (candidatePopcount[index] < 43) indices.push(index);
  indices.sort((a, b) => {
    const delta = direction === SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MINIMAL
      ? candidatePopcount[a] - candidatePopcount[b]
      : candidatePopcount[b] - candidatePopcount[a];
    return delta || a - b;
  });
  const retained = [];
  outer: for (const index of indices) {
    const low = candidateLo[index];
    const high = candidateHi[index];
    for (const prior of retained) {
      const priorLow = candidateLo[prior];
      const priorHigh = candidateHi[prior];
      if (direction === SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MINIMAL
        ? subsetPair(priorLow, priorHigh, low, high)
        : subsetPair(low, high, priorLow, priorHigh)) continue outer;
    }
    retained.push(index);
  }
  return Object.freeze(retained.map((index) => pairKey(candidateLo[index], candidateHi[index])).sort());
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

function createEqualFixture(segmentCount, segmentSize) {
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
    const duplicate = base + segmentSize - 1;
    candidateLo[duplicate] = candidateLo[base];
    candidateHi[duplicate] = candidateHi[base];
    candidatePopcount[duplicate] = candidatePopcount[base];
  }
  segmentOffsets[segmentCount] = candidateCount;

  return Object.freeze({
    kind: 'equal-cardinality-duplicate-stress', segmentCount, segmentSize, candidateCount,
    candidateLo, candidateHi, candidatePopcount, segmentOffsets, segmentDirections,
    injectedExactDuplicates: segmentCount,
    expectedSurvivorsByDirection: Object.freeze([segmentSize - 1, segmentSize - 1]),
    expectedKeys(segment) {
      const base = segment * segmentSize;
      const expected = [];
      for (let local = 0; local < segmentSize - 1; local += 1) {
        const index = base + local;
        expected.push(pairKey(candidateLo[index], candidateHi[index]));
      }
      return expected.sort();
    },
  });
}

function nextXorshift32(state) {
  let x = state.value >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  state.value = x >>> 0;
  return state.value;
}

function createMixedBase(segmentSize) {
  const low = new Uint32Array(segmentSize);
  const high = new Uint32Array(segmentSize);
  const pop = new Uint32Array(segmentSize);
  const state = { value: 0x9e3779b9 };
  const seen = new Set();
  let local = 0;
  while (local < segmentSize - 1) {
    const candidateLow = nextXorshift32(state);
    const candidateHigh = nextXorshift32(state) & 0x3ff;
    const cardinality = pop32(candidateLow) + pop32(candidateHigh);
    if (cardinality < 4 || cardinality > 38) continue;
    const key = pairKey(candidateLow, candidateHigh);
    if (seen.has(key)) continue;
    seen.add(key);
    low[local] = candidateLow;
    high[local] = candidateHigh;
    pop[local] = cardinality;
    local += 1;
  }
  low[segmentSize - 1] = low[0];
  high[segmentSize - 1] = high[0];
  pop[segmentSize - 1] = pop[0];
  return Object.freeze({ low, high, pop });
}

function createMixedFixture(segmentCount, segmentSize) {
  const candidateCount = segmentCount * segmentSize;
  if (!Number.isSafeInteger(candidateCount)) throw new RangeError('candidate fixture size exceeds safe integer range');
  const base = createMixedBase(segmentSize);
  const candidateLo = new Uint32Array(candidateCount);
  const candidateHi = new Uint32Array(candidateCount);
  const candidatePopcount = new Uint32Array(candidateCount);
  const segmentOffsets = new Uint32Array(segmentCount + 1);
  const segmentDirections = new Uint32Array(segmentCount);
  for (let segment = 0; segment < segmentCount; segment += 1) {
    const start = segment * segmentSize;
    segmentOffsets[segment] = start;
    segmentDirections[segment] = segment & 1
      ? SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MAXIMAL
      : SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MINIMAL;
    candidateLo.set(base.low, start);
    candidateHi.set(base.high, start);
    candidatePopcount.set(base.pop, start);
  }
  segmentOffsets[segmentCount] = candidateCount;
  const expected = Object.freeze([
    exactExpectedKeys(base.low, base.high, base.pop, SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MINIMAL),
    exactExpectedKeys(base.low, base.high, base.pop, SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MAXIMAL),
  ]);
  return Object.freeze({
    kind: 'mixed-cardinality-deterministic', segmentCount, segmentSize, candidateCount,
    candidateLo, candidateHi, candidatePopcount, segmentOffsets, segmentDirections,
    injectedExactDuplicates: segmentCount,
    expectedSurvivorsByDirection: Object.freeze(expected.map((keys) => keys.length)),
    expectedKeys(segment) { return expected[segmentDirections[segment]]; },
  });
}

function createFixture(segmentCount, segmentSize, fixtureKind) {
  if (fixtureKind === 'equal') return createEqualFixture(segmentCount, segmentSize);
  if (fixtureKind === 'mixed') return createMixedFixture(segmentCount, segmentSize);
  throw new RangeError('fixture must be equal or mixed');
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

async function qualify(runtime, native, bucketed, fixture) {
  const allocations = [];
  const outputCapacityPerSegment = fixture.segmentSize;
  const outputElements = fixture.segmentCount * outputCapacityPerSegment;
  const strategy = bucketed ? SEGMENTED_PACKED_ANTICHAIN_42_STRATEGY.BUCKETED : SEGMENTED_PACKED_ANTICHAIN_42_STRATEGY.LEGACY;
  const planStarted = performance.now();
  const plan = await createSegmentedPackedAntichain42Plan(runtime, {
    candidateCapacity: fixture.candidateCount,
    segmentCapacity: fixture.segmentCount,
    outputCapacityPerSegment,
    blockSize: 256,
    strategy,
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
    const bindings = {
      candidateLo: candidateLo.view, candidateHi: candidateHi.view, candidatePopcount: candidatePopcount.view,
      segmentOffsets: segmentOffsets.view, segmentDirections: segmentDirections.view,
      outputLo: outputLo.view, outputHi: outputHi.view, outputCounts: outputCounts.view,
      outputStatus: outputStatus.view, checks: checks.view,
    };
    if (bucketed) {
      const bucketIndices = await allocateU32(runtime, fixture.candidateCount, 'read-write');
      const bucketCounts = await allocateU32(runtime, plan.bucketMetaElements, 'read-write');
      const bucketOffsets = await allocateU32(runtime, plan.bucketMetaElements, 'read-write');
      const bucketCursors = await allocateU32(runtime, plan.bucketMetaElements, 'read-write');
      allocations.push(bucketIndices, bucketCounts, bucketOffsets, bucketCursors);
      Object.assign(bindings, {
        bucketIndices: bucketIndices.view, bucketCounts: bucketCounts.view,
        bucketOffsets: bucketOffsets.view, bucketCursors: bucketCursors.view,
      });
    }
    const allocationMs = performance.now() - allocationStarted;

    const uploadStarted = performance.now();
    await writeU32(candidateLo, fixture.candidateLo);
    await writeU32(candidateHi, fixture.candidateHi);
    await writeU32(candidatePopcount, fixture.candidatePopcount);
    await writeU32(segmentOffsets, fixture.segmentOffsets);
    await writeU32(segmentDirections, fixture.segmentDirections);
    const uploadMs = performance.now() - uploadStarted;

    const executionMs = await runOperation(plan, bindings);
    const result = {
      schemaVersion: 4,
      kind: 'connect4-cuda-bsfp-segmented-packed-antichain-42-qualification',
      strategy,
      fixture: fixture.kind,
      mode: native ? 'native' : 'portable',
      outcome: native ? 'native-segmented-packed-antichain-pass' : 'portable-segmented-packed-antichain-compile-submit-pass',
      planContract: plan.contract,
      segmentCount: fixture.segmentCount,
      segmentSize: fixture.segmentSize,
      candidateCount: fixture.candidateCount,
      outputCapacityPerSegment,
      injectedExactDuplicates: fixture.injectedExactDuplicates,
      expectedSurvivorsByDirection: fixture.expectedSurvivorsByDirection,
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
        const expected = fixture.expectedKeys(segment);
        assert.equal(outputCountValues[segment], expected.length, `segment ${segment} survivor count`);
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
      result.removedDuplicates = fixture.injectedExactDuplicates;
      result.survivors = survivors;
      result.verifiedSegments = fixture.segmentCount;
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
if (!['portable', 'native', 'portable-bucketed', 'native-bucketed'].includes(mode)) throw new RangeError('mode must be portable, native, portable-bucketed, or native-bucketed');
const fixtureKind = process.argv[3] ?? 'equal';
if (!['equal', 'mixed'].includes(fixtureKind)) throw new RangeError('fixture must be equal or mixed');
const native = mode.startsWith('native');
const bucketed = mode.endsWith('bucketed');
const segmentCount = positiveIntegerEnv('BSFP_SEGMENTED_ANTICHAIN_SEGMENTS', native ? DEFAULT_NATIVE_SEGMENTS : PORTABLE_SEGMENTS);
const segmentSize = positiveIntegerEnv('BSFP_SEGMENTED_ANTICHAIN_SEGMENT_SIZE', native ? DEFAULT_NATIVE_SEGMENT_SIZE : PORTABLE_SEGMENT_SIZE);
const fixture = createFixture(segmentCount, segmentSize, fixtureKind);

let runtime;
try {
  runtime = native ? await openCudaRuntime({ compiler: true }) : await openCudaRuntimeForTesting({ compiler: true });
  const result = await qualify(runtime, native, bucketed, fixture);
  console.log(JSON.stringify(result, null, 2));
} finally {
  if (runtime) {
    const closed = await runtime.close();
    assert.equal(closed.graceful, true);
  }
}
