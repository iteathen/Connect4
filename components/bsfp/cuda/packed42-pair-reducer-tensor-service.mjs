import { performance } from 'node:perf_hooks';

import {
  SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION,
  SEGMENTED_PACKED_ANTICHAIN_42_STATUS,
  createSegmentedPackedAntichain42Plan,
  createSegmentedPackedPairAntichain42Plan,
} from './index.mjs';
import { TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES } from './tensor-overflow-contract.mjs';

const U32_BYTES = 4;
const TWO32 = 0x1_0000_0000;
const MAX_MASK_42 = 2 ** 42 - 1;

function positiveSafeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${label} must be a positive safe integer`);
  return value;
}

function safeProduct(left, right, label) {
  const value = left * right;
  if (!Number.isSafeInteger(value)) throw new RangeError(`${label} exceeds safe integer capacity`);
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

async function readU32Prefix(allocation, count) {
  if (!Number.isSafeInteger(count) || count < 0 || count > allocation.count) throw new RangeError('GPU pair reducer read exceeds allocation capacity');
  if (count === 0) return new Uint32Array(0);
  const result = await allocation.memory.read({ byteLength: count * U32_BYTES });
  return new Uint32Array(result.bytes.buffer, result.bytes.byteOffset, count);
}

async function readU32Range(allocation, start, count) {
  if (!Number.isSafeInteger(start) || start < 0 || !Number.isSafeInteger(count) || count < 0 || start + count > allocation.count) {
    throw new RangeError('GPU pair reducer range read exceeds allocation capacity');
  }
  if (count === 0) return new Uint32Array(0);
  const result = await allocation.memory.read({ deviceOffset: start * U32_BYTES, byteLength: count * U32_BYTES });
  return new Uint32Array(result.bytes.buffer, result.bytes.byteOffset, count);
}

async function readU32(allocation) {
  return readU32Prefix(allocation, allocation.count);
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
    current.push(Object.freeze({ originalIndex: index, left, right, direction, product, context: source.context ?? null }));
    leftCount += left.length;
    rightCount += right.length;
    candidateCount += product;
  }
  flush();
  return Object.freeze(batches);
}

export function tensorOverflowOptions(options = {}) {
  return {
    candidateTile: options.tensorCandidateTile ?? 256,
    referenceTile: options.tensorReferenceTile ?? 1024,
    maxWorkspaceBytes: options.tensorMaxWorkspaceBytes ?? TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES,
    backend: options.tensorBackend ?? 'simt',
  };
}

export async function createPacked42PairReducerService(runtime, options = {}) {
  const overflowExecutor = options.overflowExecutor ?? 'packed';
  if (!['tensor', 'packed'].includes(overflowExecutor)) throw new RangeError('overflowExecutor must be tensor or packed');
  const primaryLimits = Object.freeze({
    segmentCapacity: positiveSafeInteger(options.segmentCapacity ?? 256, 'segmentCapacity'),
    leftCapacity: positiveSafeInteger(options.leftCapacity ?? 262144, 'leftCapacity'),
    rightCapacity: positiveSafeInteger(options.rightCapacity ?? 262144, 'rightCapacity'),
    candidateCapacity: positiveSafeInteger(options.candidateCapacity ?? 4194304, 'candidateCapacity'),
    outputCapacityPerSegment: positiveSafeInteger(options.outputCapacityPerSegment ?? 1024, 'outputCapacityPerSegment'),
    blockSize: positiveSafeInteger(options.blockSize ?? 256, 'blockSize'),
  });
  const outputElements = safeProduct(primaryLimits.segmentCapacity, primaryLimits.outputCapacityPerSegment, 'GPU pair reducer output slab');
  const overflowOutputCapacityPerSegment = Math.min(outputElements, primaryLimits.candidateCapacity);
  const limits = Object.freeze({ ...primaryLimits, overflowOutputCapacityPerSegment });
  const plan = await createSegmentedPackedPairAntichain42Plan(runtime, primaryLimits);
  let overflowPlan = null;
  if (overflowExecutor === 'packed' && overflowOutputCapacityPerSegment > primaryLimits.outputCapacityPerSegment) {
    try {
      overflowPlan = await createSegmentedPackedAntichain42Plan(runtime, {
        candidateCapacity: primaryLimits.candidateCapacity,
        segmentCapacity: 1,
        outputCapacityPerSegment: overflowOutputCapacityPerSegment,
        blockSize: primaryLimits.blockSize,
      });
    } catch (error) {
      await plan.close();
      throw error;
    }
  }

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
  const outputLo = await allocateU32(runtime, outputElements, 'read-write');
  const outputHi = await allocateU32(runtime, outputElements, 'read-write');
  const outputCounts = await allocateU32(runtime, limits.segmentCapacity, 'read-write');
  const outputStatus = await allocateU32(runtime, limits.segmentCapacity, 'read-write');
  const checks = await allocateU32(runtime, limits.candidateCapacity, 'write');
  allocations.push(leftLo, leftHi, rightLo, rightHi, leftOffsets, rightOffsets, candidateOffsets, segmentDirections, candidateLo, candidateHi, candidatePopcount, generationStatus, outputLo, outputHi, outputCounts, outputStatus, checks);

  let closed = false;
  let tensorNormalizer = null;
  const stats = {
    calls: 0,
    batches: 0,
    jobs: 0,
    inputLeftRecords: 0,
    inputRightRecords: 0,
    generatedPairCandidates: 0,
    submittedPairCandidates: 0,
    completedBatchPairCandidates: 0,
    activeBatch: null,
    activeOverflow: null,
    packedOverflowCalls: 0,
    survivingRecords: 0,
    overflowRetries: 0,
    overflowRecoveredJobs: 0,
    overflowFailures: 0,
    overflowInitialRequiredAtLeastMax: 0,
    overflowMaxSurvivingRecords: 0,
    uploadMs: 0,
    executionMs: 0,
    readbackMs: 0,
    overflowUploadMs: 0,
    overflowExecutionMs: 0,
    overflowReadbackMs: 0,
    tensorOverflowCalls: 0,
    tensorOverflowCandidates: 0,
  };

  async function recoverOverflow({ job, candidateStart, candidateEnd, initialRequiredAtLeast }, results) {
    stats.overflowRetries += 1;
    stats.overflowInitialRequiredAtLeastMax = Math.max(stats.overflowInitialRequiredAtLeastMax, initialRequiredAtLeast);
    const candidateCount = candidateEnd - candidateStart;
    stats.activeOverflow = { job: job.originalIndex, candidateCount, direction: job.direction, context: job.context, executor: overflowExecutor };
    try {
      await options.onOverflow?.({ job, initialRequiredAtLeast });
      if (overflowExecutor === 'packed') {
        if (!overflowPlan) throw new RangeError('No wider reused-slab specialization is available');
        const uploadStart = performance.now();
        await writePrefix(candidateOffsets, Uint32Array.of(candidateStart, candidateEnd));
        await writePrefix(segmentDirections, Uint32Array.of(job.direction));
        const uploadMs = performance.now() - uploadStart;
        stats.uploadMs += uploadMs; stats.overflowUploadMs += uploadMs;
        const operationStart = performance.now();
        const operation = await overflowPlan.submit({
          candidateLo: candidateLo.view, candidateHi: candidateHi.view, candidatePopcount: candidatePopcount.view,
          segmentOffsets: candidateOffsets.view, segmentDirections: segmentDirections.view,
          outputLo: outputLo.view, outputHi: outputHi.view, outputCounts: outputCounts.view,
          outputStatus: outputStatus.view, checks: checks.view,
        });
        try {
          const terminal = await operation.wait();
          if (terminal.status !== 'completed') throw new Error(`GPU pair reducer overflow recovery ended ${terminal.status}`);
        } finally { await operation.close(); }
        const executionMs = performance.now() - operationStart;
        stats.executionMs += executionMs; stats.overflowExecutionMs += executionMs;
        const readStart = performance.now();
        const status = (await readU32Prefix(outputStatus, 1))[0];
        const count = (await readU32Prefix(outputCounts, 1))[0];
        if (status !== SEGMENTED_PACKED_ANTICHAIN_42_STATUS.OK) throw new RangeError(`Packed recovery status ${status}; capacity ${limits.overflowOutputCapacityPerSegment}; required at least ${count}`);
        if (count > limits.overflowOutputCapacityPerSegment || count > job.product) throw new Error('Packed recovery returned impossible count');
        const lows = await readU32Prefix(outputLo, count);
        const highs = await readU32Prefix(outputHi, count);
        const frontier = Object.freeze(Array.from(lows, (low, i) => pack42(low, highs[i])));
        const readMs = performance.now() - readStart;
        stats.readbackMs += readMs; stats.overflowReadbackMs += readMs;
        results[job.originalIndex] = frontier;
        stats.packedOverflowCalls++;
        stats.survivingRecords += count;
        stats.overflowRecoveredJobs++;
        stats.overflowMaxSurvivingRecords = Math.max(stats.overflowMaxSurvivingRecords, count);
        return;
      }
    const readStarted = performance.now();
    const lows = await readU32Range(candidateLo, candidateStart, candidateCount);
    const highs = await readU32Range(candidateHi, candidateStart, candidateCount);
    const popcounts = await readU32Range(candidatePopcount, candidateStart, candidateCount);
    const readElapsed = performance.now() - readStarted;
    stats.readbackMs += readElapsed;
    stats.overflowReadbackMs += readElapsed;

      if (!tensorNormalizer) {
        const { createTensorPacked42OverflowNormalizer } = await import('./tensor-packed42-overflow-normalizer.mjs');
        tensorNormalizer = await createTensorPacked42OverflowNormalizer(runtime, tensorOverflowOptions(options));
      }
      const operationStarted = performance.now();
      const normalized = await tensorNormalizer.normalize({ lows, highs, popcounts, direction: job.direction });
      const operationElapsed = performance.now() - operationStarted;
      stats.executionMs += operationElapsed;
      stats.overflowExecutionMs += operationElapsed;
      stats.tensorOverflowCalls += 1;
      stats.tensorOverflowCandidates += candidateCount;
      if (normalized.frontier.length > job.product) throw new Error(`Tensor overflow returned impossible frontier count ${normalized.frontier.length} for job ${job.originalIndex}`);
      results[job.originalIndex] = normalized.frontier;
      stats.survivingRecords += normalized.frontier.length;
      stats.overflowRecoveredJobs += 1;
      stats.overflowMaxSurvivingRecords = Math.max(stats.overflowMaxSurvivingRecords, normalized.frontier.length);
    } catch (error) {
      stats.overflowFailures += 1;
      throw error;
    } finally { stats.activeOverflow = null; }
  }

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
      for (const mask of job.left) leftValues.push(mask);
      for (const mask of job.right) rightValues.push(mask);
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
    stats.submittedPairCandidates += candidateTotal;
    stats.activeBatch = { jobs: batch.length, candidateCount: candidateTotal, stage: 'submitted' };
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
    stats.generatedPairCandidates += candidateTotal;
    stats.activeBatch.stage = 'readback-and-recovery';

    const readStart = performance.now();
    const generation = await readU32(generationStatus);
    const statuses = await readU32(outputStatus);
    const counts = await readU32(outputCounts);
    const activeOutputElements = batch.length * limits.outputCapacityPerSegment;
    const lows = await readU32Prefix(outputLo, activeOutputElements);
    const highs = await readU32Prefix(outputHi, activeOutputElements);
    stats.readbackMs += performance.now() - readStart;

    const overflows = [];
    for (let segment = 0; segment < batch.length; segment += 1) {
      const job = batch[segment];
      if (generation[segment] !== 0) throw new Error(`GPU pair reducer rejected segment metadata for job ${job.originalIndex}`);
      if (statuses[segment] === SEGMENTED_PACKED_ANTICHAIN_42_STATUS.OUTPUT_CAPACITY_EXCEEDED) {
        overflows.push(Object.freeze({
          job,
          candidateStart: candidateOffsetsHost[segment],
          candidateEnd: candidateOffsetsHost[segment + 1],
          initialRequiredAtLeast: counts[segment],
        }));
        continue;
      }
      if (statuses[segment] !== SEGMENTED_PACKED_ANTICHAIN_42_STATUS.OK) throw new Error(`GPU pair reducer returned unknown status ${statuses[segment]}`);
      const count = counts[segment];
      if (count > limits.outputCapacityPerSegment || count > job.product) throw new Error(`GPU pair reducer returned impossible frontier count ${count} for job ${job.originalIndex}`);
      const base = segment * limits.outputCapacityPerSegment;
      const frontier = new Array(count);
      for (let i = 0; i < count; i += 1) frontier[i] = pack42(lows[base + i], highs[base + i]);
      results[job.originalIndex] = Object.freeze(frontier);
      stats.survivingRecords += count;
    }

    for (const overflow of overflows) await recoverOverflow(overflow, results);

    stats.batches += 1;
    stats.inputLeftRecords += leftTotal;
    stats.inputRightRecords += rightTotal;
    stats.completedBatchPairCandidates += candidateTotal;
    stats.activeBatch = null;
  }

  return Object.freeze({
    kind: 'connect4-bsfp-packed42-gpu-pair-reducer-tensor-overflow-service',
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
    snapshotStats() { return Object.freeze({ ...stats, overflowExecutor, activeBatch: stats.activeBatch ? { ...stats.activeBatch } : null, tensorOverflow: tensorNormalizer?.snapshotStats() ?? null }); },
    async close() {
      if (closed) return;
      closed = true;
      if (tensorNormalizer) await tensorNormalizer.close();
      if (overflowPlan) await overflowPlan.close();
      await plan.close();
      for (let index = allocations.length - 1; index >= 0; index -= 1) await closeAllocation(allocations[index]);
    },
  });
}
