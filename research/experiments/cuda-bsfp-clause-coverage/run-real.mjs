import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { openCudaRuntime } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';

import { createCoverage64ExperimentalPlan } from './plan.mjs';
import { createRealCoverage64Fixture } from './real-fixture.mjs';

const U32_BYTES = 4;
const NATIVE_WARMUPS = 1;
const NATIVE_REPETITIONS = 5;

function positiveIntegerEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${name} must be a positive safe integer`);
  return value;
}

function pop32(value) {
  let x = value >>> 0;
  let count = 0;
  while (x !== 0) { x &= x - 1; count += 1; }
  return count;
}

function subset64(left, right) {
  return ((left.lo & ~right.lo) >>> 0) === 0 && ((left.hi & ~right.hi) >>> 0) === 0;
}

function key64(value) {
  return `${value.hi.toString(16).padStart(8, '0')}:${value.lo.toString(16).padStart(8, '0')}`;
}

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

function packedCpuAuthority(segment) {
  const candidates = [];
  let rejected = 0;
  for (const left of segment.left) {
    for (const right of segment.right) {
      const candidate = { lo: (left.lo | right.lo) >>> 0, hi: (left.hi | right.hi) >>> 0 };
      if (packedCapacityKeep(candidate, segment)) candidates.push(candidate);
      else rejected += 1;
    }
  }
  return { frontier: normalizeMinimal64(candidates), rejected };
}

function assertPackedFixtureAuthority(fixture) {
  for (const segment of fixture.segments) {
    const packed = packedCpuAuthority(segment);
    assert.equal(packed.rejected, segment.authority.rejected, `${segment.id} packed rejected-count mismatch`);
    assert.deepEqual(
      packed.frontier.map(key64).sort(),
      segment.authority.frontier.map(key64).sort(),
      `${segment.id} packed frontier mismatch`,
    );
  }
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

async function qualify(runtime, native, fixture) {
  assertPackedFixtureAuthority(fixture);

  const segmentCount = fixture.segments.length;
  const maxCells = fixture.cellCount;
  const outputCapacityPerSegment = fixture.segments.reduce((maximum, segment) => Math.max(maximum, segment.authority.frontier.length + 16), 1);
  const allocations = [];

  const planStart = performance.now();
  const plan = await createCoverage64ExperimentalPlan(runtime, {
    leftCapacity: fixture.totalLeft,
    rightCapacity: fixture.totalRight,
    candidateCapacity: fixture.totalCandidates,
    segmentCapacity: segmentCount,
    outputCapacityPerSegment,
    maxCells,
    blockSize: 256,
  });
  const compileLoadPrepareMs = performance.now() - planStart;

  try {
    const leftLoHost = new Uint32Array(fixture.totalLeft);
    const leftHiHost = new Uint32Array(fixture.totalLeft);
    const rightLoHost = new Uint32Array(fixture.totalRight);
    const rightHiHost = new Uint32Array(fixture.totalRight);
    const leftOffsetsHost = new Uint32Array(segmentCount + 1);
    const rightOffsetsHost = new Uint32Array(segmentCount + 1);
    const candidateOffsetsHost = new Uint32Array(segmentCount + 1);
    const exactCountsHost = new Uint32Array(segmentCount);
    const cellCountsHost = new Uint32Array(segmentCount);
    const singletonMaskLoHost = new Uint32Array(segmentCount);
    const singletonMaskHiHost = new Uint32Array(segmentCount);
    const cellMetadataCount = segmentCount * maxCells;
    const singletonBitsLoHost = new Uint32Array(cellMetadataCount);
    const singletonBitsHiHost = new Uint32Array(cellMetadataCount);
    const containsLoHost = new Uint32Array(cellMetadataCount);
    const containsHiHost = new Uint32Array(cellMetadataCount);

    let leftCursor = 0;
    let rightCursor = 0;
    let candidateCursor = 0;
    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
      const segment = fixture.segments[segmentIndex];
      leftOffsetsHost[segmentIndex] = leftCursor;
      rightOffsetsHost[segmentIndex] = rightCursor;
      candidateOffsetsHost[segmentIndex] = candidateCursor;
      exactCountsHost[segmentIndex] = segment.exactCount;
      cellCountsHost[segmentIndex] = segment.cellCount;
      singletonMaskLoHost[segmentIndex] = segment.dictionary.singletonMaskLo;
      singletonMaskHiHost[segmentIndex] = segment.dictionary.singletonMaskHi;
      for (const value of segment.left) { leftLoHost[leftCursor] = value.lo; leftHiHost[leftCursor] = value.hi; leftCursor += 1; }
      for (const value of segment.right) { rightLoHost[rightCursor] = value.lo; rightHiHost[rightCursor] = value.hi; rightCursor += 1; }
      candidateCursor += segment.left.length * segment.right.length;
      for (let cell = 0; cell < maxCells; cell += 1) {
        const index = segmentIndex * maxCells + cell;
        singletonBitsLoHost[index] = segment.dictionary.singletonBits[cell].lo;
        singletonBitsHiHost[index] = segment.dictionary.singletonBits[cell].hi;
        containsLoHost[index] = segment.dictionary.contains[cell].lo;
        containsHiHost[index] = segment.dictionary.contains[cell].hi;
      }
    }
    leftOffsetsHost[segmentCount] = leftCursor;
    rightOffsetsHost[segmentCount] = rightCursor;
    candidateOffsetsHost[segmentCount] = candidateCursor;

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

    const leftLo = await allocFrom(leftLoHost);
    const leftHi = await allocFrom(leftHiHost);
    const rightLo = await allocFrom(rightLoHost);
    const rightHi = await allocFrom(rightHiHost);
    const leftOffsets = await allocFrom(leftOffsetsHost);
    const rightOffsets = await allocFrom(rightOffsetsHost);
    const candidateOffsets = await allocFrom(candidateOffsetsHost);
    const exactCounts = await allocFrom(exactCountsHost);
    const cellCounts = await allocFrom(cellCountsHost);
    const singletonMaskLo = await allocFrom(singletonMaskLoHost);
    const singletonMaskHi = await allocFrom(singletonMaskHiHost);
    const singletonBitsLo = await allocFrom(singletonBitsLoHost);
    const singletonBitsHi = await allocFrom(singletonBitsHiHost);
    const containsLo = await allocFrom(containsLoHost);
    const containsHi = await allocFrom(containsHiHost);
    const candidateLo = await allocOutput(fixture.totalCandidates);
    const candidateHi = await allocOutput(fixture.totalCandidates);
    const candidatePopcount = await allocOutput(fixture.totalCandidates);
    const generationStatus = await allocOutput(segmentCount);
    const rejectedCounts = await allocOutput(segmentCount);
    const outputElements = segmentCount * outputCapacityPerSegment;
    const outputLo = await allocOutput(outputElements);
    const outputHi = await allocOutput(outputElements);
    const outputCounts = await allocOutput(segmentCount);
    const outputStatus = await allocOutput(segmentCount);
    const checks = await allocOutput(fixture.totalCandidates);

    const bindings = {
      leftLo: leftLo.view, leftHi: leftHi.view, rightLo: rightLo.view, rightHi: rightHi.view,
      leftOffsets: leftOffsets.view, rightOffsets: rightOffsets.view, candidateOffsets: candidateOffsets.view,
      exactCounts: exactCounts.view, cellCounts: cellCounts.view,
      singletonMaskLo: singletonMaskLo.view, singletonMaskHi: singletonMaskHi.view,
      singletonBitsLo: singletonBitsLo.view, singletonBitsHi: singletonBitsHi.view,
      containsLo: containsLo.view, containsHi: containsHi.view,
      candidateLo: candidateLo.view, candidateHi: candidateHi.view, candidatePopcount: candidatePopcount.view,
      generationStatus: generationStatus.view, rejectedCounts: rejectedCounts.view,
      outputLo: outputLo.view, outputHi: outputHi.view, outputCounts: outputCounts.view, outputStatus: outputStatus.view,
      checks: checks.view,
    };

    const warmups = native ? positiveIntegerEnv('BSFP_COVERAGE_WARMUPS', NATIVE_WARMUPS) : 1;
    const repetitions = native ? positiveIntegerEnv('BSFP_COVERAGE_REPS', NATIVE_REPETITIONS) : 1;
    for (let index = 0; index < warmups; index += 1) await runOperation(plan, bindings);
    const samples = [];
    for (let index = 0; index < repetitions; index += 1) samples.push(await runOperation(plan, bindings));

    const result = {
      schemaVersion: 1,
      kind: 'connect4-cuda-bsfp-clause-coverage64-real-workload-qualification',
      mode: native ? 'native' : 'portable',
      outcome: native ? 'native-exact-real-frontier-pass' : 'portable-real-fixture-compile-prepare-submit-pass',
      planContract: plan.contract,
      fixtureKind: fixture.fixtureKind,
      semanticScope: 'real variable-geometry jobs encoded into fixed-two-u32 qualification profile; production width remains geometry-selected',
      segments: fixture.segments.map((segment) => ({
        id: segment.id,
        geometry: segment.geometry,
        rank: segment.rank,
        supportHeights: segment.supportHeights,
        beneficiary: segment.beneficiary,
        exactCount: segment.exactCount,
        dictionarySize: segment.dictionary.clauses.length,
        leftRecords: segment.left.length,
        rightRecords: segment.right.length,
        rawPairs: segment.rawPairs,
        cpuRejected: segment.authority.rejected,
        cpuSurvivors: segment.authority.frontier.length,
      })),
      totals: {
        rawPairs: fixture.totalCandidates,
        cpuRejected: fixture.segments.reduce((sum, segment) => sum + segment.authority.rejected, 0),
        cpuSurvivors: fixture.segments.reduce((sum, segment) => sum + segment.authority.frontier.length, 0),
      },
      timingsMs: { compileLoadPrepare: compileLoadPrepareMs, submissionWait: summarize(samples), rawSubmissionWaitSamples: samples },
      deviceSemanticValidation: native ? 'exact' : 'not-executed-by-testing-runtime',
      packedCpuAuthorityMismatches: 0,
    };

    if (native) {
      const generationValues = await readU32(generationStatus);
      const rejectedValues = await readU32(rejectedCounts);
      const outputCountValues = await readU32(outputCounts);
      const outputStatusValues = await readU32(outputStatus);
      const outputLoValues = await readU32(outputLo);
      const outputHiValues = await readU32(outputHi);
      for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
        const segment = fixture.segments[segmentIndex];
        assert.equal(generationValues[segmentIndex], 0, `${segment.id} generation metadata failed`);
        assert.equal(outputStatusValues[segmentIndex], 0, `${segment.id} output overflow/metadata failure`);
        assert.equal(rejectedValues[segmentIndex], segment.authority.rejected, `${segment.id} device rejected-count mismatch`);
        const observed = [];
        const base = segmentIndex * outputCapacityPerSegment;
        for (let i = 0; i < outputCountValues[segmentIndex]; i += 1) observed.push({ lo: outputLoValues[base + i], hi: outputHiValues[base + i] });
        assert.deepEqual(observed.map(key64).sort(), segment.authority.frontier.map(key64).sort(), `${segment.id} device frontier mismatch`);
      }
      result.exactFrontierMismatches = 0;
      result.rejectedCountMismatches = 0;
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
const fixture = createRealCoverage64Fixture();

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
