import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { openCudaRuntime } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';
import { createPackedOwnershipDominance42Plan } from '../../components/bsfp/cuda/index.mjs';

const U32_BYTES = 4;
const FULL_SCAN_HIGH_BIT = 0x200;
const HIGH_42_MASK_WITHOUT_SENTINEL = 0x1ff;
const NATIVE_CANDIDATE_COUNT = 1_048_576;
const PORTABLE_CANDIDATE_COUNT = 4_096;
const DEFAULT_FRONTIER_COUNT = 568;
const NATIVE_REPETITIONS = 5;
const NATIVE_WARMUPS = 1;

function positiveIntegerEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${name} must be a positive safe integer`);
  return value;
}

function xorshift32(state) {
  let value = state >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return value >>> 0;
}

function createFixture(candidateCount, frontierCount) {
  const candidateLo = new Uint32Array(candidateCount);
  const candidateHi = new Uint32Array(candidateCount);
  const frontierLo = new Uint32Array(frontierCount);
  const frontierHi = new Uint32Array(frontierCount);
  let state = 0x9e3779b9;

  for (let index = 0; index < candidateCount; index += 1) {
    state = xorshift32(state + index + 1);
    candidateLo[index] = state;
    state = xorshift32(state ^ 0xa5a5a5a5);
    candidateHi[index] = state & HIGH_42_MASK_WITHOUT_SENTINEL;
  }
  for (let index = 0; index < frontierCount; index += 1) {
    state = xorshift32(state + 0x7f4a7c15 + index);
    frontierLo[index] = state;
    state = xorshift32(state ^ 0x3c6ef372);
    frontierHi[index] = (state & HIGH_42_MASK_WITHOUT_SENTINEL) | FULL_SCAN_HIGH_BIT;
  }

  return Object.freeze({ candidateLo, candidateHi, frontierLo, frontierHi });
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
  return Object.freeze({
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    mean: sum / sorted.length,
    max: sorted[sorted.length - 1],
  });
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
  const candidateCount = fixture.candidateLo.length;
  const frontierCount = fixture.frontierLo.length;
  const totalChecks = candidateCount * frontierCount;
  const allocations = [];

  const planStarted = performance.now();
  const plan = await createPackedOwnershipDominance42Plan(runtime, {
    candidateCapacity: candidateCount,
    frontierCapacity: frontierCount,
    blockSize: 256,
  });
  const compileLoadPrepareMs = performance.now() - planStarted;

  try {
    const allocationStarted = performance.now();
    const candidateLo = await allocateU32(runtime, candidateCount, 'read');
    const candidateHi = await allocateU32(runtime, candidateCount, 'read');
    const frontierLo = await allocateU32(runtime, frontierCount, 'read');
    const frontierHi = await allocateU32(runtime, frontierCount, 'read');
    const flags = await allocateU32(runtime, candidateCount, 'write');
    const checks = await allocateU32(runtime, candidateCount, 'write');
    allocations.push(candidateLo, candidateHi, frontierLo, frontierHi, flags, checks);
    const allocationMs = performance.now() - allocationStarted;

    const uploadStarted = performance.now();
    await writeU32(candidateLo, fixture.candidateLo);
    await writeU32(candidateHi, fixture.candidateHi);
    await writeU32(frontierLo, fixture.frontierLo);
    await writeU32(frontierHi, fixture.frontierHi);
    const uploadMs = performance.now() - uploadStarted;

    const bindings = {
      candidateLo: candidateLo.view,
      candidateHi: candidateHi.view,
      frontierLo: frontierLo.view,
      frontierHi: frontierHi.view,
      flags: flags.view,
      checks: checks.view,
    };

    const warmups = native ? positiveIntegerEnv('BSFP_DOMINANCE_WARMUPS', NATIVE_WARMUPS) : 1;
    const repetitions = native ? positiveIntegerEnv('BSFP_DOMINANCE_REPS', NATIVE_REPETITIONS) : 1;
    for (let index = 0; index < warmups; index += 1) await runOperation(plan, bindings);
    const executionSamplesMs = [];
    for (let index = 0; index < repetitions; index += 1) executionSamplesMs.push(await runOperation(plan, bindings));
    const executionMs = summarize(executionSamplesMs);

    const result = {
      schemaVersion: 1,
      kind: 'connect4-cuda-bsfp-packed-ownership-dominance-42-benchmark',
      mode: native ? 'native' : 'portable',
      outcome: native ? 'native-packed-dominance-pass' : 'portable-packed-dominance-compile-submit-pass',
      planContract: plan.contract,
      fixture: 'full-scan-no-hit-bit41',
      candidateCount,
      frontierCount,
      totalSubsetChecksPerMeasuredPass: totalChecks,
      warmups,
      repetitions,
      timingsMs: {
        compileLoadPrepare: compileLoadPrepareMs,
        allocation: allocationMs,
        upload: uploadMs,
        submissionWait: executionMs,
        rawSubmissionWaitSamples: executionSamplesMs,
      },
      throughput: {
        candidatesPerSecondMedian: candidateCount * 1000 / executionMs.median,
        subsetChecksPerSecondMedian: totalChecks * 1000 / executionMs.median,
        u32LaneSubsetOpsPerSecondMedian: totalChecks * 2 * 1000 / executionMs.median,
      },
      devicePayloadBytes: candidateCount * U32_BYTES * 4 + frontierCount * U32_BYTES * 2,
    };

    if (native) {
      const readStarted = performance.now();
      const flagValues = await readU32(flags);
      const checkValues = await readU32(checks);
      result.timingsMs.readback = performance.now() - readStarted;

      const verifyStarted = performance.now();
      let observedChecks = 0;
      let dominatedCount = 0;
      for (let index = 0; index < candidateCount; index += 1) {
        observedChecks += checkValues[index];
        dominatedCount += flagValues[index] === 0 ? 0 : 1;
        assert.equal(flagValues[index], 0, `unexpected dominated candidate at ${index}`);
        assert.equal(checkValues[index], frontierCount, `candidate ${index} did not scan the complete frontier`);
      }
      result.timingsMs.verification = performance.now() - verifyStarted;
      result.observedSubsetChecks = observedChecks;
      result.dominatedCount = dominatedCount;
      assert.equal(observedChecks, totalChecks);
      assert.equal(dominatedCount, 0);
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
const candidateCount = positiveIntegerEnv('BSFP_DOMINANCE_CANDIDATES', native ? NATIVE_CANDIDATE_COUNT : PORTABLE_CANDIDATE_COUNT);
const frontierCount = positiveIntegerEnv('BSFP_DOMINANCE_FRONTIER', DEFAULT_FRONTIER_COUNT);

const fixtureStarted = performance.now();
const fixture = createFixture(candidateCount, frontierCount);
const fixtureMs = performance.now() - fixtureStarted;

let runtime;
const processStarted = performance.now();
try {
  const runtimeStarted = performance.now();
  runtime = native
    ? await openCudaRuntime({ compiler: true })
    : await openCudaRuntimeForTesting({ compiler: true });
  const runtimeOpenMs = performance.now() - runtimeStarted;
  const result = await qualify(runtime, native, fixture);
  result.timingsMs.fixture = fixtureMs;
  result.timingsMs.runtimeOpen = runtimeOpenMs;
  result.timingsMs.processToResult = performance.now() - processStarted;
  console.log(JSON.stringify(result, null, 2));
} finally {
  if (runtime) {
    const closed = await runtime.close();
    assert.equal(closed.graceful, true);
  }
}
