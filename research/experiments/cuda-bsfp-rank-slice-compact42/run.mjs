import assert from 'node:assert/strict';

import { openCudaRuntime } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';

import { createRankSliceCompact42Plan } from './plan.mjs';

const U32_BYTES = 4;
const TWO32 = 0x1_0000_0000;

function low32(value) { return value >>> 0; }
function high10(value) { return Math.floor(value / TWO32) >>> 0; }
function pack42(low, high) { return (low >>> 0) + (high >>> 0) * TWO32; }

function pop32(value) {
  let x = value >>> 0;
  let count = 0;
  while (x !== 0) { x &= x - 1; count += 1; }
  return count;
}
function popcount(mask) { return pop32(low32(mask)) + pop32(high10(mask)); }
function subset(left, right) {
  return ((low32(left) & ~low32(right)) >>> 0) === 0 && ((high10(left) & ~high10(right)) >>> 0) === 0;
}

function normalizeMinimal(values) {
  const ordered = [...new Set(values)].sort((a, b) => popcount(a) - popcount(b) || a - b);
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) if (subset(retained, candidate)) continue outer;
    result.push(candidate);
  }
  return result;
}

function normalizeMaximal(values) {
  const ordered = [...new Set(values)].sort((a, b) => popcount(b) - popcount(a) || a - b);
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) if (subset(candidate, retained)) continue outer;
    result.push(candidate);
  }
  return result;
}

function combinationsExact(n, k) {
  const result = [];
  const limit = 1 << n;
  for (let mask = 0; mask < limit; mask += 1) if (pop32(mask) === k) result.push(mask >>> 0);
  return result;
}

function classifyMinimal(frontier, ownership) { return frontier.some((value) => subset(value, ownership)); }
function classifyMaximal(frontier, ownership) { return frontier.some((value) => subset(ownership, value)); }

function createSegment(direction, legal, candidates, cellCount) {
  const normalizedFull = direction === 0 ? normalizeMinimal(candidates) : normalizeMaximal(candidates);
  const admissible = candidates.filter((value) => direction === 0 ? popcount(value) <= legal : popcount(value) >= legal);
  const expected = direction === 0 ? normalizeMinimal(admissible) : normalizeMaximal(admissible);

  // Local semantic theorem: pruning impossible frontier records must preserve
  // the represented predicate on the exact legal-cardinality ownership slice.
  for (const ownership of combinationsExact(cellCount, legal)) {
    const full = direction === 0 ? classifyMinimal(normalizedFull, ownership) : classifyMaximal(normalizedFull, ownership);
    const sliced = direction === 0 ? classifyMinimal(expected, ownership) : classifyMaximal(expected, ownership);
    assert.equal(sliced, full, `rank-slice predicate mismatch direction=${direction} k=${legal} ownership=${ownership}`);
  }

  return { direction, legal, candidates, expected };
}

function createFixture() {
  const cellCount = 8;
  const base = [
    0b00000000, 0b00000001, 0b00000010, 0b00000011,
    0b00000101, 0b00000110, 0b00000111, 0b00001111,
    0b00110011, 0b01010101, 0b01111111, 0b11111111,
    0b00000011, 0b00000111, 0b00110011,
  ];
  const segments = [
    createSegment(0, 0, base, cellCount),
    createSegment(0, 2, base, cellCount),
    createSegment(0, 4, base, cellCount),
    createSegment(0, 7, base, cellCount),
    createSegment(1, 1, base, cellCount),
    createSegment(1, 3, base, cellCount),
    createSegment(1, 5, base, cellCount),
    createSegment(1, 8, base, cellCount),
  ];
  return { cellCount, segments };
}

function encodeU32(values) { return new Uint8Array(values.buffer, values.byteOffset, values.byteLength); }
async function allocateU32(runtime, count, access = 'read-write') {
  const memory = await runtime.allocateDevice({ byteLength: count * U32_BYTES });
  const view = await memory.view({ dtype: 'u32', elementCount: count, access });
  return { memory, view, count };
}
async function write(allocation, values) {
  assert.equal(values.length, allocation.count);
  await allocation.memory.write(encodeU32(values));
}
async function read(allocation) {
  const result = await allocation.memory.read({ byteLength: allocation.count * U32_BYTES });
  return new Uint32Array(result.bytes.buffer, result.bytes.byteOffset, allocation.count);
}
async function closeAllocation(allocation) {
  await allocation.view.close();
  await allocation.memory.close();
}

async function qualify(runtime, native) {
  const fixture = createFixture();
  const segmentCount = fixture.segments.length;
  const candidateCount = fixture.segments.reduce((sum, segment) => sum + segment.candidates.length, 0);
  const outputCapacityPerSegment = Math.max(...fixture.segments.map((segment) => segment.expected.length + 4), 4);
  const plan = await createRankSliceCompact42Plan(runtime, {
    candidateCapacity: candidateCount,
    segmentCapacity: segmentCount,
    outputCapacityPerSegment,
    blockSize: 128,
  });
  const allocations = [];

  try {
    const candidateLoHost = new Uint32Array(candidateCount);
    const candidateHiHost = new Uint32Array(candidateCount);
    const candidatePopHost = new Uint32Array(candidateCount);
    const offsetsHost = new Uint32Array(segmentCount + 1);
    const directionsHost = new Uint32Array(segmentCount);
    const legalHost = new Uint32Array(segmentCount);
    let cursor = 0;
    for (let segment = 0; segment < segmentCount; segment += 1) {
      const entry = fixture.segments[segment];
      offsetsHost[segment] = cursor;
      directionsHost[segment] = entry.direction;
      legalHost[segment] = entry.legal;
      for (const value of entry.candidates) {
        candidateLoHost[cursor] = low32(value);
        candidateHiHost[cursor] = high10(value);
        candidatePopHost[cursor] = popcount(value);
        cursor += 1;
      }
    }
    offsetsHost[segmentCount] = cursor;

    async function from(values, access = 'read') {
      const allocation = await allocateU32(runtime, values.length, access);
      allocations.push(allocation);
      await write(allocation, values);
      return allocation;
    }
    async function output(count) {
      const allocation = await allocateU32(runtime, count, 'read-write');
      allocations.push(allocation);
      return allocation;
    }

    const candidateLo = await from(candidateLoHost);
    const candidateHi = await from(candidateHiHost);
    const candidatePopcount = await from(candidatePopHost, 'read-write');
    const segmentOffsets = await from(offsetsHost);
    const segmentDirections = await from(directionsHost);
    const legalP0Counts = await from(legalHost);
    const outputElements = segmentCount * outputCapacityPerSegment;
    const outputLo = await output(outputElements);
    const outputHi = await output(outputElements);
    const outputCounts = await output(segmentCount);
    const outputStatus = await output(segmentCount);
    const checks = await output(candidateCount);

    const operation = await plan.submit({
      candidateLo: candidateLo.view,
      candidateHi: candidateHi.view,
      candidatePopcount: candidatePopcount.view,
      segmentOffsets: segmentOffsets.view,
      segmentDirections: segmentDirections.view,
      legalP0Counts: legalP0Counts.view,
      outputLo: outputLo.view,
      outputHi: outputHi.view,
      outputCounts: outputCounts.view,
      outputStatus: outputStatus.view,
      checks: checks.view,
    });
    try {
      const terminal = await operation.wait();
      assert.equal(terminal.status, 'completed');
    } finally {
      await operation.close();
    }

    if (native) {
      const counts = await read(outputCounts);
      const statuses = await read(outputStatus);
      const lows = await read(outputLo);
      const highs = await read(outputHi);
      for (let segment = 0; segment < segmentCount; segment += 1) {
        assert.equal(statuses[segment], 0, `segment ${segment} status`);
        const baseIndex = segment * outputCapacityPerSegment;
        const observed = [];
        for (let index = 0; index < counts[segment]; index += 1) observed.push(pack42(lows[baseIndex + index], highs[baseIndex + index]));
        assert.deepEqual([...observed].sort((a, b) => a - b), [...fixture.segments[segment].expected].sort((a, b) => a - b), `segment ${segment} native frontier`);
      }
    }

    return {
      schemaVersion: 1,
      kind: 'connect4-cuda-bsfp-rank-slice-compact42-qualification',
      mode: native ? 'native' : 'portable',
      planContract: plan.contract,
      segmentCount,
      candidateCount,
      exactSlicePredicateMismatches: 0,
      deviceSemanticValidation: native ? 'exact' : 'not-executed-by-testing-runtime',
      segments: fixture.segments.map((segment) => ({
        direction: segment.direction === 0 ? 'minimal-win' : 'maximal-loss',
        legalP0Count: segment.legal,
        candidates: segment.candidates.length,
        survivingFrontier: segment.expected.length,
        impossibleCandidateOccurrences: segment.candidates.filter((value) => segment.direction === 0 ? popcount(value) > segment.legal : popcount(value) < segment.legal).length,
      })),
    };
  } finally {
    await plan.close();
    for (let index = allocations.length - 1; index >= 0; index -= 1) await closeAllocation(allocations[index]);
  }
}

const mode = process.argv[2] ?? 'portable';
if (!['portable', 'native'].includes(mode)) throw new RangeError('mode must be portable or native');
const native = mode === 'native';
let runtime;
try {
  runtime = native ? await openCudaRuntime({ compiler: true }) : await openCudaRuntimeForTesting({ compiler: true });
  const result = await qualify(runtime, native);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} finally {
  if (runtime) {
    const closed = await runtime.close();
    assert.equal(closed.graceful, true);
  }
}
