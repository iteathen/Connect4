import assert from 'node:assert/strict';

import { openCudaRuntime } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';

import { createRankSlicePhaseWindow42Plan } from './phase-window-plan.mjs';

const U32_BYTES = 4;
const TWO32 = 0x1_0000_0000;
function low32(value) { return value >>> 0; }
function high10(value) { return Math.floor(value / TWO32) >>> 0; }
function pack42(low, high) { return (low >>> 0) + (high >>> 0) * TWO32; }
function pop32(value) { let x = value >>> 0; let count = 0; while (x !== 0) { x &= x - 1; count += 1; } return count; }
function popcount(value) { return pop32(low32(value)) + pop32(high10(value)); }
function subset(left, right) { return ((low32(left) & ~low32(right)) >>> 0) === 0 && ((high10(left) & ~high10(right)) >>> 0) === 0; }

function normalize(values, direction) {
  const ordered = [...new Set(values)].sort((a, b) => {
    const delta = direction === 0 ? popcount(a) - popcount(b) : popcount(b) - popcount(a);
    return delta || a - b;
  });
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) {
      if (direction === 0 ? subset(retained, candidate) : subset(candidate, retained)) continue outer;
    }
    result.push(candidate);
  }
  return result;
}

function exactAssignments(rank, legal) {
  const result = [];
  const limit = 1 << rank;
  for (let mask = 0; mask < limit; mask += 1) if (pop32(mask) === legal) result.push(mask >>> 0);
  return result;
}

function classify(frontier, ownership, direction) {
  return frontier.some((value) => direction === 0 ? subset(value, ownership) : subset(ownership, value));
}

function createSegment(rank, direction) {
  const legal = Math.ceil(rank / 2);
  const universe = rank === 0 ? 0 : ((1 << rank) - 1) >>> 0;
  const source = [
    0, 1, 2, 3, 5, 6, 7, 15, 19, 21, 31, 51, 85, 127, 255,
    3, 7, 19, 51,
  ].map((value) => (value & universe) >>> 0);
  const full = normalize(source, direction);
  const admissible = source.filter((value) => direction === 0 ? popcount(value) <= legal : popcount(value) >= legal);
  const expected = normalize(admissible, direction);
  for (const ownership of exactAssignments(rank, legal)) {
    assert.equal(classify(full, ownership, direction), classify(expected, ownership, direction), `predicate mismatch rank=${rank} direction=${direction}`);
  }
  const phaseCount = direction === 0 ? Math.ceil(rank / 2) + 1 : Math.floor(rank / 2) + 1;
  return { rank, legal, direction, candidates: source, expected, phaseCount };
}

function createFixture() {
  const segments = [];
  for (const rank of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
    segments.push(createSegment(rank, 0));
    segments.push(createSegment(rank, 1));
  }
  return segments;
}

function encodeU32(values) { return new Uint8Array(values.buffer, values.byteOffset, values.byteLength); }
async function allocate(runtime, count, access = 'read-write') {
  const memory = await runtime.allocateDevice({ byteLength: count * U32_BYTES });
  const view = await memory.view({ dtype: 'u32', elementCount: count, access });
  return { memory, view, count };
}
async function write(allocation, values) { assert.equal(allocation.count, values.length); await allocation.memory.write(encodeU32(values)); }
async function read(allocation) { const { bytes } = await allocation.memory.read({ byteLength: allocation.count * U32_BYTES }); return new Uint32Array(bytes.buffer, bytes.byteOffset, allocation.count); }
async function close(allocation) { await allocation.view.close(); await allocation.memory.close(); }

async function qualify(runtime, native) {
  const segments = createFixture();
  const segmentCount = segments.length;
  const candidateCount = segments.reduce((sum, segment) => sum + segment.candidates.length, 0);
  const outputCapacityPerSegment = Math.max(...segments.map((segment) => segment.expected.length + 4), 4);
  const plan = await createRankSlicePhaseWindow42Plan(runtime, { candidateCapacity: candidateCount, segmentCapacity: segmentCount, outputCapacityPerSegment, blockSize: 128 });
  const allocations = [];
  try {
    const loHost = new Uint32Array(candidateCount);
    const hiHost = new Uint32Array(candidateCount);
    const popHost = new Uint32Array(candidateCount);
    const offsetsHost = new Uint32Array(segmentCount + 1);
    const directionsHost = new Uint32Array(segmentCount);
    const ranksHost = new Uint32Array(segmentCount);
    let cursor = 0;
    for (let segment = 0; segment < segmentCount; segment += 1) {
      const entry = segments[segment];
      offsetsHost[segment] = cursor;
      directionsHost[segment] = entry.direction;
      ranksHost[segment] = entry.rank;
      for (const value of entry.candidates) {
        loHost[cursor] = low32(value); hiHost[cursor] = high10(value); popHost[cursor] = popcount(value); cursor += 1;
      }
    }
    offsetsHost[segmentCount] = cursor;

    async function from(values, access = 'read') { const allocation = await allocate(runtime, values.length, access); allocations.push(allocation); await write(allocation, values); return allocation; }
    async function out(count) { const allocation = await allocate(runtime, count, 'read-write'); allocations.push(allocation); return allocation; }
    const candidateLo = await from(loHost); const candidateHi = await from(hiHost); const candidatePopcount = await from(popHost);
    const segmentOffsets = await from(offsetsHost); const segmentDirections = await from(directionsHost); const segmentRanks = await from(ranksHost);
    const outputElements = segmentCount * outputCapacityPerSegment;
    const outputLo = await out(outputElements); const outputHi = await out(outputElements); const outputCounts = await out(segmentCount); const outputStatus = await out(segmentCount); const checks = await out(candidateCount);

    const operation = await plan.submit({ candidateLo: candidateLo.view, candidateHi: candidateHi.view, candidatePopcount: candidatePopcount.view,
      segmentOffsets: segmentOffsets.view, segmentDirections: segmentDirections.view, segmentRanks: segmentRanks.view,
      outputLo: outputLo.view, outputHi: outputHi.view, outputCounts: outputCounts.view, outputStatus: outputStatus.view, checks: checks.view });
    try { const terminal = await operation.wait(); assert.equal(terminal.status, 'completed'); } finally { await operation.close(); }

    if (native) {
      const counts = await read(outputCounts); const statuses = await read(outputStatus); const lows = await read(outputLo); const highs = await read(outputHi);
      for (let segment = 0; segment < segmentCount; segment += 1) {
        assert.equal(statuses[segment], 0, `status segment=${segment}`);
        const observed = []; const base = segment * outputCapacityPerSegment;
        for (let index = 0; index < counts[segment]; index += 1) observed.push(pack42(lows[base + index], highs[base + index]));
        assert.deepEqual(observed.sort((a, b) => a - b), [...segments[segment].expected].sort((a, b) => a - b), `native frontier segment=${segment}`);
      }
    }

    const oldPhaseCandidateVisits = segments.reduce((sum, segment) => sum + 43 * segment.candidates.length, 0);
    const rankSlicePhaseCandidateVisits = segments.reduce((sum, segment) => sum + segment.phaseCount * segment.candidates.length, 0);
    return {
      schemaVersion: 1,
      kind: 'connect4-cuda-bsfp-rank-slice-phase-window42-qualification',
      mode: native ? 'native' : 'portable',
      planContract: plan.contract,
      exactSlicePredicateMismatches: 0,
      deviceSemanticValidation: native ? 'exact' : 'not-executed-by-testing-runtime',
      oldPhaseCandidateVisits,
      rankSlicePhaseCandidateVisits,
      phaseCandidateVisitReductionPercent: 100 * (1 - rankSlicePhaseCandidateVisits / oldPhaseCandidateVisits),
      segments: segments.map((segment) => ({ rank: segment.rank, direction: segment.direction === 0 ? 'minimal-win' : 'maximal-loss', legalP0Count: segment.legal, phaseCount: segment.phaseCount, oldPhaseCount: 43, candidates: segment.candidates.length, survivors: segment.expected.length })),
    };
  } finally {
    await plan.close();
    for (let index = allocations.length - 1; index >= 0; index -= 1) await close(allocations[index]);
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
  if (runtime) { const closed = await runtime.close(); assert.equal(closed.graceful, true); }
}