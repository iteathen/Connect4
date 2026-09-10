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
const PORTABLE_SEGMENTS = 8;
const PORTABLE_SEGMENT_SIZE = 64;
const NATIVE_SEGMENTS = 1024;
const NATIVE_SEGMENT_SIZE = 512;

function pop32(value) {
  let x = value >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return Math.imul((x + (x >>> 4)) & 0x0f0f0f0f, 0x01010101) >>> 24;
}
function pairKey(low, high) { return `${high.toString(16).padStart(8, '0')}:${low.toString(16).padStart(8, '0')}`; }
function subsetPair(aLow, aHigh, bLow, bHigh) { return ((aLow & ~bLow) >>> 0) === 0 && ((aHigh & ~bHigh) >>> 0) === 0; }
function combinePair(aLow, aHigh, bLow, bHigh, direction) {
  return direction === SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MINIMAL
    ? [(aLow | bLow) >>> 0, (aHigh | bHigh) >>> 0]
    : [(aLow & bLow) >>> 0, (aHigh & bHigh) >>> 0];
}
function exactExpectedKeys(low, high, pop, direction) {
  const indices = Array.from({ length: low.length }, (_, index) => index);
  indices.sort((a, b) => {
    const delta = direction === SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MINIMAL ? pop[a] - pop[b] : pop[b] - pop[a];
    return delta || a - b;
  });
  const retained = [];
  outer: for (const index of indices) {
    for (const prior of retained) {
      const dominated = direction === SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MINIMAL
        ? subsetPair(low[prior], high[prior], low[index], high[index])
        : subsetPair(low[index], high[index], low[prior], high[prior]);
      if (dominated) continue outer;
    }
    retained.push(index);
  }
  return retained.map((index) => pairKey(low[index], high[index])).sort();
}
function factorPair(count) {
  let left = Math.floor(Math.sqrt(count));
  while (left > 1 && count % left !== 0) left -= 1;
  return [left, count / left];
}
function operand(index, side) {
  const pattern = side === 0 ? Math.imul(index + 3, 37) & 0xff : Math.imul(index + 5, 53) & 0xff;
  const low = ((side === 0 ? 0x00010000 : 0x00020000) | 0x00040000 | pattern) >>> 0;
  const high = (0x200 | (1 << ((index + side * 2) % 5))) & 0x3ff;
  return [low, high];
}
function createBase(segmentSize, direction) {
  const [leftCount, rightCount] = factorPair(segmentSize);
  const low = new Uint32Array(segmentSize);
  const high = new Uint32Array(segmentSize);
  const pop = new Uint32Array(segmentSize);
  let cursor = 0;
  for (let a = 0; a < leftCount; a += 1) {
    const left = operand(a, 0);
    for (let b = 0; b < rightCount; b += 1) {
      const right = operand(b, 1);
      const [candidateLow, candidateHigh] = combinePair(left[0], left[1], right[0], right[1], direction);
      low[cursor] = candidateLow;
      high[cursor] = candidateHigh;
      pop[cursor] = pop32(candidateLow) + pop32(candidateHigh);
      cursor += 1;
    }
  }
  const uniqueCandidateCount = new Set(Array.from({ length: segmentSize }, (_, i) => pairKey(low[i], high[i]))).size;
  return Object.freeze({ low, high, pop, uniqueCandidateCount, expected: exactExpectedKeys(low, high, pop, direction) });
}
function createFixture(segmentCount, segmentSize) {
  const bases = [createBase(segmentSize, 0), createBase(segmentSize, 1)];
  const candidateCount = segmentCount * segmentSize;
  const candidateLo = new Uint32Array(candidateCount);
  const candidateHi = new Uint32Array(candidateCount);
  const candidatePopcount = new Uint32Array(candidateCount);
  const segmentOffsets = new Uint32Array(segmentCount + 1);
  const segmentDirections = new Uint32Array(segmentCount);
  let totalUnique = 0;
  for (let segment = 0; segment < segmentCount; segment += 1) {
    const direction = segment & 1;
    const base = segment * segmentSize;
    segmentOffsets[segment] = base;
    segmentDirections[segment] = direction;
    candidateLo.set(bases[direction].low, base);
    candidateHi.set(bases[direction].high, base);
    candidatePopcount.set(bases[direction].pop, base);
    totalUnique += bases[direction].uniqueCandidateCount;
  }
  segmentOffsets[segmentCount] = candidateCount;
  return Object.freeze({
    kind: 'cartesian-or-and-duplicate-stress', segmentCount, segmentSize, candidateCount,
    candidateLo, candidateHi, candidatePopcount, segmentOffsets, segmentDirections,
    uniqueCandidateCount: totalUnique,
    exactDuplicateCount: candidateCount - totalUnique,
    duplicateFraction: (candidateCount - totalUnique) / candidateCount,
    expectedKeys(segment) { return bases[segmentDirections[segment]].expected; },
  });
}
function encodeU32(values) { return new Uint8Array(values.buffer, values.byteOffset, values.byteLength); }
async function allocateU32(runtime, count, access = 'read-write') {
  const memory = await runtime.allocateDevice({ byteLength: count * U32_BYTES });
  const view = await memory.view({ dtype: 'u32', elementCount: count, access });
  return { memory, view, count };
}
async function writeU32(allocation, values) { assert.equal(values.length, allocation.count); await allocation.memory.write(encodeU32(values)); }
async function readU32(allocation) {
  const result = await allocation.memory.read({ byteLength: allocation.count * U32_BYTES });
  return new Uint32Array(result.bytes.buffer, result.bytes.byteOffset, allocation.count);
}
async function closeAllocation(allocation) { await allocation.view.close(); await allocation.memory.close(); }

async function qualify(runtime, native, strategy, fixture) {
  const allocations = [];
  const outputCapacityPerSegment = fixture.segmentSize;
  const outputElements = fixture.segmentCount * outputCapacityPerSegment;
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
    const candidateLo = await allocateU32(runtime, fixture.candidateCount, 'read');
    const candidateHi = await allocateU32(runtime, fixture.candidateCount, 'read');
    const candidatePopcount = await allocateU32(runtime, fixture.candidateCount, 'read');
    const segmentOffsets = await allocateU32(runtime, fixture.segmentCount + 1, 'read');
    const segmentDirections = await allocateU32(runtime, fixture.segmentCount, 'read');
    const outputLo = await allocateU32(runtime, outputElements);
    const outputHi = await allocateU32(runtime, outputElements);
    const outputCounts = await allocateU32(runtime, fixture.segmentCount);
    const outputStatus = await allocateU32(runtime, fixture.segmentCount);
    const checks = await allocateU32(runtime, fixture.candidateCount, 'write');
    const bucketIndices = await allocateU32(runtime, fixture.candidateCount);
    const bucketCounts = await allocateU32(runtime, plan.bucketMetaElements);
    const bucketOffsets = await allocateU32(runtime, plan.bucketMetaElements);
    const bucketCursors = await allocateU32(runtime, plan.bucketMetaElements);
    allocations.push(candidateLo, candidateHi, candidatePopcount, segmentOffsets, segmentDirections, outputLo, outputHi, outputCounts, outputStatus, checks, bucketIndices, bucketCounts, bucketOffsets, bucketCursors);
    await writeU32(candidateLo, fixture.candidateLo);
    await writeU32(candidateHi, fixture.candidateHi);
    await writeU32(candidatePopcount, fixture.candidatePopcount);
    await writeU32(segmentOffsets, fixture.segmentOffsets);
    await writeU32(segmentDirections, fixture.segmentDirections);
    const started = performance.now();
    const operation = await plan.submit({
      candidateLo: candidateLo.view, candidateHi: candidateHi.view, candidatePopcount: candidatePopcount.view,
      segmentOffsets: segmentOffsets.view, segmentDirections: segmentDirections.view,
      outputLo: outputLo.view, outputHi: outputHi.view, outputCounts: outputCounts.view,
      outputStatus: outputStatus.view, checks: checks.view,
      bucketIndices: bucketIndices.view, bucketCounts: bucketCounts.view, bucketOffsets: bucketOffsets.view, bucketCursors: bucketCursors.view,
    });
    try { assert.equal((await operation.wait()).status, 'completed'); } finally { await operation.close(); }
    const submissionWaitMs = performance.now() - started;
    const result = {
      schemaVersion: 1,
      kind: 'connect4-cuda-bsfp-dedup-first-stress',
      mode: native ? 'native' : 'portable', strategy,
      fixture: fixture.kind, segmentCount: fixture.segmentCount, segmentSize: fixture.segmentSize,
      candidateCount: fixture.candidateCount, uniqueCandidateCount: fixture.uniqueCandidateCount,
      exactDuplicateCount: fixture.exactDuplicateCount, duplicateFraction: fixture.duplicateFraction,
      timingsMs: { compileLoadPrepare: compileLoadPrepareMs, submissionWait: submissionWaitMs },
      outcome: native ? 'native-dedup-first-stress-pass' : 'portable-dedup-first-stress-compile-submit-pass',
    };
    if (native) {
      const outLo = await readU32(outputLo);
      const outHi = await readU32(outputHi);
      const counts = await readU32(outputCounts);
      const statuses = await readU32(outputStatus);
      const checkValues = await readU32(checks);
      let subsetChecks = 0;
      let survivors = 0;
      for (let segment = 0; segment < fixture.segmentCount; segment += 1) {
        assert.equal(statuses[segment], SEGMENTED_PACKED_ANTICHAIN_42_STATUS.OK);
        const expected = fixture.expectedKeys(segment);
        assert.equal(counts[segment], expected.length);
        const actual = [];
        const base = segment * outputCapacityPerSegment;
        for (let i = 0; i < counts[segment]; i += 1) actual.push(pairKey(outLo[base + i], outHi[base + i]));
        actual.sort();
        assert.deepEqual(actual, expected);
        survivors += counts[segment];
      }
      for (const value of checkValues) subsetChecks += value;
      result.observedFrontierSubsetChecks = subsetChecks;
      result.survivors = survivors;
    }
    return result;
  } finally {
    await plan.close();
    for (let i = allocations.length - 1; i >= 0; i -= 1) await closeAllocation(allocations[i]);
  }
}

const mode = process.argv[2] ?? 'portable-bucketed';
const modes = new Map([
  ['portable-bucketed', [false, SEGMENTED_PACKED_ANTICHAIN_42_STRATEGY.BUCKETED]],
  ['portable-dedup-first', [false, SEGMENTED_PACKED_ANTICHAIN_42_STRATEGY.BUCKETED_DEDUP_FIRST]],
  ['native-bucketed', [true, SEGMENTED_PACKED_ANTICHAIN_42_STRATEGY.BUCKETED]],
  ['native-dedup-first', [true, SEGMENTED_PACKED_ANTICHAIN_42_STRATEGY.BUCKETED_DEDUP_FIRST]],
]);
if (!modes.has(mode)) throw new RangeError(`unknown mode: ${mode}`);
const [native, strategy] = modes.get(mode);
const fixture = createFixture(native ? NATIVE_SEGMENTS : PORTABLE_SEGMENTS, native ? NATIVE_SEGMENT_SIZE : PORTABLE_SEGMENT_SIZE);
let runtime;
try {
  runtime = native ? await openCudaRuntime({ compiler: true }) : await openCudaRuntimeForTesting({ compiler: true });
  console.log(JSON.stringify(await qualify(runtime, native, strategy, fixture), null, 2));
} finally {
  if (runtime) assert.equal((await runtime.close()).graceful, true);
}
