import { performance } from 'node:perf_hooks';

import {
  SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION,
  SEGMENTED_PACKED_ANTICHAIN_42_STATUS,
  createSegmentedPackedPairAntichain42Plan,
} from './index.mjs';

const U32_BYTES = 4;
const TWO32 = 0x1_0000_0000;
const MAX_MASK_42 = 2 ** 42 - 1;

function positiveSafeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${label} must be a positive safe integer`);
  return value;
}

function mask42(value, label) {
  if (!Number.isSafeInteger(value) || value < 0 || value > MAX_MASK_42) throw new RangeError(`${label} must be an exact 42-bit nonnegative integer`);
  return value;
}

function low32(value) { return value >>> 0; }
function high10(value) { return Math.floor(value / TWO32) >>> 0; }
function pack42(low, high) { return (low >>> 0) + (high >>> 0) * TWO32; }

function encodeU32(values) {
  return new Uint8Array(values.buffer, values.byteOffset, values.byteLength);
}

async function allocateU32(runtime, count, access = 'read-write') {
  const memory = await runtime.allocateDevice({ byteLength: count * U32_BYTES });
  const view = await memory.view({ dtype: 'u32', elementCount: count, access });
  return { memory, view, count };
}

async function writePrefix(allocation, values) {
  if (!(values instanceof Uint32Array)) throw new TypeError('GPU pair reducer uploads must be Uint32Array values');
  if (values.length > allocation.count) throw new RangeError('GPU pair reducer upload exceeds allocation capacity');
  if (values.length === 0) return;
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

function normalizeDirection(value) {
  if (value === SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MINIMAL || value === 'minimal' || value === 'or') return SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MINIMAL;
  if (value === SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MAXIMAL || value === 'maximal' || value === 'and') return SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MAXIMAL;
  throw new RangeError('pair-reduction direction must be minimal/or or maximal/and');
}

function normalizeFrontier(frontier, label) {
  if (!Array.isArray(frontier)) throw new TypeError(`${label} must be an array`);
  return frontier.map((value, index) => mask42(value, `${label}[${index}]`));
}

function packJobs(jobs, limits) {
  const batches = [];
  let current = [];
  let leftCount = 0;
  let rightCount = 0;
  let candidateCount = 0;

  function flush() {
    if (current.length === 0) return;
    batches.push(Object.freeze(current));
    current = [];
    leftCount = 0;
    rightCount = 0;
    candidateCount = 0;
  }

  for (let index = 0; index < jobs.length; index += 1) {
    const source = jobs[index];
    const left = normalizeFrontier(source.left, `jobs[${index}].left`);
    const right = normalizeFrontier(source.right, `jobs[${index}].right`);
    const direction = normalizeDirection(source.direction);
    const product = left.length * right.length;
    if (!Number.isSafeInteger(product)) throw new RangeError(`jobs[${index}] pair product exceeds safe integer range`);
    if (left.length > limits.leftCapacity || right.length > limits.rightCapacity || product > limits.candidateCapacity) {
      throw new RangeError(`jobs[${index}] exceeds one GPU pair-reduction batch capacity`);
    }
    if (current.length === limits.segmentCapacity
      || leftCount + left.length > limits.leftCapacity
      || rightCount + right.length > limits.rightCapacity
      || candidateCount + product > limits.candidateCapacity) flush();
    current.push(Object.freeze({ originalIndex: index, left, right, direction, product }));
    leftCount += left.length;
    rightCount += right.length;
    candidateCount += product;
  }
  flush();
  return Object.freeze(batches);
}

export async function createPacked42PairReducerService(runtime, options = {}) {
  const limits = Object.freeze({
    segmentCapacity: positiveSafeInteger(options.segmentCapacity ?? 256, 'segmentCapacity'),
    leftCapacity: positiveSafeInteger(options.leftCapacity ?? 262144, 'leftCapacity'),
    rightCapacity: positiveSafeInteger(options.rightCapacity ?? 262144, 'rightCapacity'),
    candidateCapacity: positiveSafeInteger(options.candidateCapacity ?? 4194304, 'candidateCapacity'),
    outputCapacityPerSegment: positiveSafeInteger(options.outputCapacityPerSegment ?? 1024, 'outputCapacityPerSegment'),
    blockSize: positiveSafeInteger(options.blockSize ?? 256, 'blockSize'),
  });
  const plan = await createSegmentedPackedPairAntichain42Plan(runtime, limits);
  const allocations = [];
  const leftLo = await allocateU32(runtime, limits.leftCapacity, 'read');
  const leftHi = await allocateU32(runtime, limits.leftCapacity, 'read');
  const rightLo = await allocateU32(runtime, limits.rightCapacity, 'read');
  const rightHi = await allocateU32(runtime, limits.rightCapacity, 'read');
  const leftOffsets = await allocateU32(runtime, limits.segmentCapacity + 1, 'read');
  const rightOffsets = await allocateU32(runtime, limits.segmentCapacity + 1, 'read');
  const candidateOffsets = await allocateU32(runtime, limits.segmentCapacity + 1, 'read');
  const segmentDirections = await allocateU32(runtime, limits.segmentCapacity, 'read');
  const candidateLo = await allocateU32(runtime, limits.candidateCapacity, 'read-write');
  const candidateHi = await allocateU32(runtime, limits.candidateCapacity, 'read-write');
  const candidatePopcount = await allocateU32(runtime, limits.candidateCapacity, 'read-write');
  const generationStatus = await allocateU32(runtime, limits.segmentCapacity, 'write');
  const outputElements = limits.segmentCapacity * limits.outputCapacityPerSegment;
  const outputLo = await allocateU32(runtime, outputElements, 'read-write');
  const outputHi = await allocateU32(runtime, outputElements, 'read-write');
  const outputCounts = await allocateU32(runtime, limits.segmentCapacity, 'read-write');
  const outputStatus = await allocateU32(runtime, limits.segmentCapacity, 'read-write');
  const checks = await allocateU32(runtime, limits.candidateCapacity, 'write');
  allocations.push(leftLo, leftHi, rightLo, rightHi, leftOffsets, rightOffsets, candidateOffsets, segmentDirections, candidateLo, candidateHi, candidatePopcount, generationStatus, outputLo, outputHi, outputCounts, outputStatus, checks);

  let closed = false;
  const stats = {
    calls: 0,
    batches: 0,
    jobs: 0,
    inputLeftRecords: 0,
    inputRightRecords: 0,
    generatedPairCandidates: 0,
    survivingRecords: 0,
    uploadMs: 0,
    executionMs: 0,
    readbackMs: 0,
  };

  async function executeBatch(batch, results) {
    const leftValues = [];
    const rightValues = [];
    const leftOffsetsHost = new Uint32Array(limits.segmentCapacity + 1);
    const rightOffsetsHost = new Uint32Array(limits.segmentCapacity + 1);
    const candidateOffsetsHost = new Uint32Array(limits.segmentCapacity + 1);
    const directionsHost = new Uint32Array(limits.segmentCapacity);
    let leftTotal = 0;
    let rightTotal = 0;
    let candidateTotal = 0;

    for (let segment = 0; segment < batch.length; segment += 1) {
      const job = batch[segment];
      leftOffsetsHost[segment] = leftTotal;
      rightOffsetsHost[segment] = rightTotal;
      candidateOffsetsHost[segment] = candidateTotal;
      directionsHost[segment] = job.direction;
      leftValues.push(...job.left);
      rightValues.push(...job.right);
      leftTotal += job.left.length;
      rightTotal += job.right.length;
      candidateTotal += job.product;
    }
    for (let segment = batch.length; segment <= limits.segmentCapacity; segment += 1) {
      leftOffsetsHost[segment] = leftTotal;
      rightOffsetsHost[segment] = rightTotal;
      candidateOffsetsHost[segment] = candidateTotal;
      if (segment < limits.segmentCapacity) directionsHost[segment] = SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MINIMAL;
    }

    const leftLoHost = new Uint32Array(leftTotal);
    const leftHiHost = new Uint32Array(leftTotal);
    const rightLoHost = new Uint32Array(rightTotal);
    const rightHiHost = new Uint32Array(rightTotal);
    for (let i = 0; i < leftTotal; i += 1) { leftLoHost[i] = low32(leftValues[i]); leftHiHost[i] = high10(leftValues[i]); }
    for (let i = 0; i < rightTotal; i += 1) { rightLoHost[i] = low32(rightValues[i]); rightHiHost[i] = high10(rightValues[i]); }

    const uploadStart = performance.now();
    await writePrefix(leftLo, leftLoHost);
    await writePrefix(leftHi, leftHiHost);
    await writePrefix(rightLo, rightLoHost);
    await writePrefix(rightHi, rightHiHost);
    await writePrefix(leftOffsets, leftOffsetsHost);
    await writePrefix(rightOffsets, rightOffsetsHost);
    await writePrefix(candidateOffsets, candidateOffsetsHost);
    await writePrefix(segmentDirections, directionsHost);
    stats.uploadMs += performance.now() - uploadStart;

    const operationStart = performance.now();
    const operation = await plan.submit({
      leftLo: leftLo.view, leftHi: leftHi.view, rightLo: rightLo.view, rightHi: rightHi.view,
      leftOffsets: leftOffsets.view, rightOffsets: rightOffsets.view, candidateOffsets: candidateOffsets.view,
      segmentDirections: segmentDirections.view, candidateLo: candidateLo.view, candidateHi: candidateHi.view,
      candidatePopcount: candidatePopcount.view, generationStatus: generationStatus.view,
      outputLo: outputLo.view, outputHi: outputHi.view, outputCounts: outputCounts.view,
      outputStatus: outputStatus.view, checks: checks.view,
    });
    try {
      const terminal = await operation.wait();
      if (terminal.status !== 'completed') throw new Error(`GPU pair reducer operation ended ${terminal.status}`);
    } finally {
      await operation.close();
    }
    stats.executionMs += performance.now() - operationStart;

    const readStart = performance.now();
    const generation = await readU32(generationStatus);
    const statuses = await readU32(outputStatus);
    const counts = await readU32(outputCounts);
    const lows = await readU32(outputLo);
    const highs = await readU32(outputHi);
    stats.readbackMs += performance.now() - readStart;

    for (let segment = 0; segment < batch.length; segment += 1) {
      const job = batch[segment];
      if (generation[segment] !== 0) throw new Error(`GPU pair reducer rejected segment metadata for job ${job.originalIndex}`);
      if (statuses[segment] === SEGMENTED_PACKED_ANTICHAIN_42_STATUS.OUTPUT_CAPACITY_EXCEEDED) {
        throw new RangeError(`GPU pair reducer frontier capacity ${limits.outputCapacityPerSegment} exceeded by job ${job.originalIndex}; required at least ${counts[segment]}`);
      }
      if (statuses[segment] !== SEGMENTED_PACKED_ANTICHAIN_42_STATUS.OK) throw new Error(`GPU pair reducer returned unknown status ${statuses[segment]}`);
      const count = counts[segment];
      const base = segment * limits.outputCapacityPerSegment;
      const frontier = new Array(count);
      for (let i = 0; i < count; i += 1) frontier[i] = pack42(lows[base + i], highs[base + i]);
      results[job.originalIndex] = Object.freeze(frontier);
      stats.survivingRecords += count;
    }
    stats.batches += 1;
    stats.inputLeftRecords += leftTotal;
    stats.inputRightRecords += rightTotal;
    stats.generatedPairCandidates += candidateTotal;
  }

  return Object.freeze({
    kind: 'connect4-bsfp-packed42-gpu-pair-reducer-service',
    limits,
    async reduce(jobs) {
      if (closed) throw new Error('GPU pair reducer service is closed');
      if (!Array.isArray(jobs)) throw new TypeError('jobs must be an array');
      stats.calls += 1;
      stats.jobs += jobs.length;
      if (jobs.length === 0) return Object.freeze([]);
      const results = new Array(jobs.length);
      const batches = packJobs(jobs, limits);
      for (const batch of batches) await executeBatch(batch, results);
      return Object.freeze(results);
    },
    snapshotStats() { return Object.freeze({ ...stats }); },
    async close() {
      if (closed) return;
      closed = true;
      await plan.close();
      for (let index = allocations.length - 1; index >= 0; index -= 1) await closeAllocation(allocations[index]);
    },
  });
}
