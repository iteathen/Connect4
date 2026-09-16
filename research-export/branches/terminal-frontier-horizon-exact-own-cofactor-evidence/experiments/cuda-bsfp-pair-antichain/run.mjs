import assert from 'node:assert/strict';

import { openCudaRuntimeForTesting } from 'cuda-js/testing';
import {
  SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION,
  createSegmentedPackedPairAntichain42Plan,
} from '../../components/bsfp/cuda/index.mjs';

const U32_BYTES = 4;
const SEGMENTS = 4;
const PER_SIDE = 4;
const PER_SEGMENT_CANDIDATES = PER_SIDE * PER_SIDE;
const LEFT_CAPACITY = SEGMENTS * PER_SIDE;
const RIGHT_CAPACITY = SEGMENTS * PER_SIDE;
const CANDIDATE_CAPACITY = SEGMENTS * PER_SEGMENT_CANDIDATES;
const OUTPUT_CAPACITY = 16;

function encodeU32(values) {
  return new Uint8Array(values.buffer, values.byteOffset, values.byteLength);
}

async function allocateU32(runtime, count, access = 'read-write') {
  const memory = await runtime.allocateDevice({ byteLength: count * U32_BYTES });
  const view = await memory.view({ dtype: 'u32', elementCount: count, access });
  return { memory, view, count };
}

async function write(allocation, values) {
  assert.equal(allocation.count, values.length);
  await allocation.memory.write(encodeU32(values));
}

async function close(allocation) {
  await allocation.view.close();
  await allocation.memory.close();
}

const runtime = await openCudaRuntimeForTesting({ compiler: true });
const allocations = [];
let plan;
let operation;
try {
  plan = await createSegmentedPackedPairAntichain42Plan(runtime, {
    leftCapacity: LEFT_CAPACITY,
    rightCapacity: RIGHT_CAPACITY,
    candidateCapacity: CANDIDATE_CAPACITY,
    segmentCapacity: SEGMENTS,
    outputCapacityPerSegment: OUTPUT_CAPACITY,
    blockSize: 64,
  });
  const leftLo = await allocateU32(runtime, LEFT_CAPACITY, 'read');
  const leftHi = await allocateU32(runtime, LEFT_CAPACITY, 'read');
  const rightLo = await allocateU32(runtime, RIGHT_CAPACITY, 'read');
  const rightHi = await allocateU32(runtime, RIGHT_CAPACITY, 'read');
  const leftOffsets = await allocateU32(runtime, SEGMENTS + 1, 'read');
  const rightOffsets = await allocateU32(runtime, SEGMENTS + 1, 'read');
  const candidateOffsets = await allocateU32(runtime, SEGMENTS + 1, 'read');
  const directions = await allocateU32(runtime, SEGMENTS, 'read');
  const candidateLo = await allocateU32(runtime, CANDIDATE_CAPACITY, 'read-write');
  const candidateHi = await allocateU32(runtime, CANDIDATE_CAPACITY, 'read-write');
  const candidatePopcount = await allocateU32(runtime, CANDIDATE_CAPACITY, 'read-write');
  const generationStatus = await allocateU32(runtime, SEGMENTS, 'write');
  const outputLo = await allocateU32(runtime, SEGMENTS * OUTPUT_CAPACITY, 'read-write');
  const outputHi = await allocateU32(runtime, SEGMENTS * OUTPUT_CAPACITY, 'read-write');
  const outputCounts = await allocateU32(runtime, SEGMENTS, 'read-write');
  const outputStatus = await allocateU32(runtime, SEGMENTS, 'read-write');
  const checks = await allocateU32(runtime, CANDIDATE_CAPACITY, 'write');
  allocations.push(leftLo, leftHi, rightLo, rightHi, leftOffsets, rightOffsets, candidateOffsets, directions, candidateLo, candidateHi, candidatePopcount, generationStatus, outputLo, outputHi, outputCounts, outputStatus, checks);

  const leftValues = Uint32Array.from({ length: LEFT_CAPACITY }, (_, i) => (1 << (i % 20)) >>> 0);
  const rightValues = Uint32Array.from({ length: RIGHT_CAPACITY }, (_, i) => (1 << ((i + 7) % 20)) >>> 0);
  const sideOffsets = Uint32Array.from([0, 4, 8, 12, 16]);
  const pairOffsets = Uint32Array.from([0, 16, 32, 48, 64]);
  const directionValues = Uint32Array.from([
    SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MINIMAL,
    SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MAXIMAL,
    SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MINIMAL,
    SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MAXIMAL,
  ]);
  await write(leftLo, leftValues);
  await write(leftHi, new Uint32Array(LEFT_CAPACITY));
  await write(rightLo, rightValues);
  await write(rightHi, new Uint32Array(RIGHT_CAPACITY));
  await write(leftOffsets, sideOffsets);
  await write(rightOffsets, sideOffsets);
  await write(candidateOffsets, pairOffsets);
  await write(directions, directionValues);

  operation = await plan.submit({
    leftLo: leftLo.view,
    leftHi: leftHi.view,
    rightLo: rightLo.view,
    rightHi: rightHi.view,
    leftOffsets: leftOffsets.view,
    rightOffsets: rightOffsets.view,
    candidateOffsets: candidateOffsets.view,
    segmentDirections: directions.view,
    candidateLo: candidateLo.view,
    candidateHi: candidateHi.view,
    candidatePopcount: candidatePopcount.view,
    generationStatus: generationStatus.view,
    outputLo: outputLo.view,
    outputHi: outputHi.view,
    outputCounts: outputCounts.view,
    outputStatus: outputStatus.view,
    checks: checks.view,
  });
  const terminal = await operation.wait();
  assert.equal(terminal.status, 'completed');
  console.log(JSON.stringify({
    schemaVersion: 1,
    kind: 'connect4-cuda-bsfp-segmented-pair-antichain-42-portable',
    planContract: plan.contract,
    segments: SEGMENTS,
    candidateCapacity: CANDIDATE_CAPACITY,
    outcome: 'portable-pair-generate-normalize-submit-pass',
  }, null, 2));
} finally {
  if (operation) await operation.close();
  if (plan) await plan.close();
  for (let i = allocations.length - 1; i >= 0; i -= 1) await close(allocations[i]);
  const closed = await runtime.close();
  assert.equal(closed.graceful, true);
}
