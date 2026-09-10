import { packedAntichain42CollectiveSource, packedAntichain42CollectiveFunctions } from './packed-antichain-42-collective.mjs';

const source = `
function generateSegmentPairCandidatesPacked42(leftLo, leftHi, rightLo, rightHi, leftOffsets, rightOffsets, candidateOffsets, segmentDirections, candidateLo, candidateHi, candidatePopcount, generationStatus, leftCapacity, rightCapacity, candidateCapacity, segmentCount) {
  const segment = gpu.block.x();
  if (segment >= segmentCount) return;

  const lane = gpu.thread.x();
  const leftStart = leftOffsets[segment];
  const leftEnd = leftOffsets[segment + gpu.u32(1)];
  const rightStart = rightOffsets[segment];
  const rightEnd = rightOffsets[segment + gpu.u32(1)];
  const candidateStart = candidateOffsets[segment];
  const candidateEnd = candidateOffsets[segment + gpu.u32(1)];
  let invalid = gpu.u32(0);
  if (leftStart > leftEnd || leftEnd > leftCapacity) invalid = gpu.u32(1);
  if (rightStart > rightEnd || rightEnd > rightCapacity) invalid = gpu.u32(1);
  if (candidateStart > candidateEnd || candidateEnd > candidateCapacity) invalid = gpu.u32(1);

  const leftCount = leftEnd - leftStart;
  const rightCount = rightEnd - rightStart;
  if (rightCount !== gpu.u32(0) && leftCount > gpu.u32(4294967295) / rightCount) invalid = gpu.u32(1);
  const pairCount = leftCount * rightCount;
  if (candidateEnd - candidateStart !== pairCount) invalid = gpu.u32(1);

  if (lane === gpu.u32(0)) generationStatus[segment] = invalid;
  if (invalid !== gpu.u32(0)) return;

  packedPairTile42(leftLo, leftHi, rightLo, rightHi, candidateLo, candidateHi, candidatePopcount, leftStart, rightStart, rightCount, gpu.u32(0), pairCount, candidateStart, segmentDirections[segment]);
}

function normalizeSegmentPacked42(candidateLo, candidateHi, candidatePopcount, segmentOffsets, segmentDirections, outputLo, outputHi, outputCounts, outputStatus, checks, candidateCount, segmentCount, outputCapacityPerSegment) {
  const segment = gpu.block.x();
  if (segment >= segmentCount) return;

  const start = segmentOffsets[segment];
  const end = segmentOffsets[segment + gpu.u32(1)];
  if (start > end || end > candidateCount) {
    if (gpu.thread.x() === gpu.u32(0)) { outputStatus[segment] = gpu.u32(1); outputCounts[segment] = gpu.u32(0); }
    return;
  }
  packedNormalize42(candidateLo, candidateHi, candidatePopcount, outputLo, outputHi, outputCounts, outputStatus, checks, start, end, segment * outputCapacityPerSegment, segment, outputCapacityPerSegment, segmentDirections[segment]);
}

function normalizeSegmentPacked42Bucketed(candidateLo, candidateHi, candidatePopcount, segmentOffsets, segmentDirections, outputLo, outputHi, outputCounts, outputStatus, checks, bucketIndices, bucketCounts, bucketOffsets, bucketCursors, candidateCount, segmentCount, outputCapacityPerSegment) {
  const segment = gpu.block.x();
  if (segment >= segmentCount) return;

  const start = segmentOffsets[segment];
  const end = segmentOffsets[segment + gpu.u32(1)];
  if (start > end || end > candidateCount) {
    if (gpu.thread.x() === gpu.u32(0)) { outputStatus[segment] = gpu.u32(1); outputCounts[segment] = gpu.u32(0); }
    return;
  }
  packedNormalize42Bucketed(candidateLo, candidateHi, candidatePopcount, outputLo, outputHi, outputCounts, outputStatus, checks,
    bucketIndices, bucketCounts, bucketOffsets, bucketCursors, start, end, segment * outputCapacityPerSegment,
    segment, outputCapacityPerSegment, segmentDirections[segment], start);
}

`;

export const segmentedPackedAntichain42DeviceProgram = Object.freeze({
  source: packedAntichain42CollectiveSource + source,
  compile: Object.freeze({ headerProfile: 'cuda-cccl' }),
  functions: Object.freeze([
    ...packedAntichain42CollectiveFunctions,
    Object.freeze({
      name: 'generateSegmentPairCandidatesPacked42',
      kind: 'kernel',
      returns: 'void',
      parameters: Object.freeze([
        Object.freeze({ name: 'leftLo', type: 'ptr<u32>' }),
        Object.freeze({ name: 'leftHi', type: 'ptr<u32>' }),
        Object.freeze({ name: 'rightLo', type: 'ptr<u32>' }),
        Object.freeze({ name: 'rightHi', type: 'ptr<u32>' }),
        Object.freeze({ name: 'leftOffsets', type: 'ptr<u32>' }),
        Object.freeze({ name: 'rightOffsets', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidateOffsets', type: 'ptr<u32>' }),
        Object.freeze({ name: 'segmentDirections', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidateLo', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidateHi', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidatePopcount', type: 'ptr<u32>' }),
        Object.freeze({ name: 'generationStatus', type: 'ptr<u32>' }),
        Object.freeze({ name: 'leftCapacity', type: 'u32' }),
        Object.freeze({ name: 'rightCapacity', type: 'u32' }),
        Object.freeze({ name: 'candidateCapacity', type: 'u32' }),
        Object.freeze({ name: 'segmentCount', type: 'u32' }),
      ]),
    }),
    Object.freeze({
      name: 'normalizeSegmentPacked42',
      kind: 'kernel',
      returns: 'void',
      parameters: Object.freeze([
        Object.freeze({ name: 'candidateLo', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidateHi', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidatePopcount', type: 'ptr<u32>' }),
        Object.freeze({ name: 'segmentOffsets', type: 'ptr<u32>' }),
        Object.freeze({ name: 'segmentDirections', type: 'ptr<u32>' }),
        Object.freeze({ name: 'outputLo', type: 'ptr<u32>' }),
        Object.freeze({ name: 'outputHi', type: 'ptr<u32>' }),
        Object.freeze({ name: 'outputCounts', type: 'ptr<u32>' }),
        Object.freeze({ name: 'outputStatus', type: 'ptr<u32>' }),
        Object.freeze({ name: 'checks', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidateCount', type: 'u32' }),
        Object.freeze({ name: 'segmentCount', type: 'u32' }),
        Object.freeze({ name: 'outputCapacityPerSegment', type: 'u32' }),
      ]),
    }),
    Object.freeze({
      name: 'normalizeSegmentPacked42Bucketed',
      kind: 'kernel',
      returns: 'void',
      parameters: Object.freeze([
        Object.freeze({ name: 'candidateLo', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidateHi', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidatePopcount', type: 'ptr<u32>' }),
        Object.freeze({ name: 'segmentOffsets', type: 'ptr<u32>' }),
        Object.freeze({ name: 'segmentDirections', type: 'ptr<u32>' }),
        Object.freeze({ name: 'outputLo', type: 'ptr<u32>' }),
        Object.freeze({ name: 'outputHi', type: 'ptr<u32>' }),
        Object.freeze({ name: 'outputCounts', type: 'ptr<u32>' }),
        Object.freeze({ name: 'outputStatus', type: 'ptr<u32>' }),
        Object.freeze({ name: 'checks', type: 'ptr<u32>' }),
        Object.freeze({ name: 'bucketIndices', type: 'ptr<u32>' }),
        Object.freeze({ name: 'bucketCounts', type: 'ptr<u32>' }),
        Object.freeze({ name: 'bucketOffsets', type: 'ptr<u32>' }),
        Object.freeze({ name: 'bucketCursors', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidateCount', type: 'u32' }),
        Object.freeze({ name: 'segmentCount', type: 'u32' }),
        Object.freeze({ name: 'outputCapacityPerSegment', type: 'u32' }),
      ]),
    }),
  ]),
});
