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

function normalizeSegmentPacked42BucketedDedupFirst(candidateLo, candidateHi, candidatePopcount, segmentOffsets, segmentDirections, outputLo, outputHi, outputCounts, outputStatus, checks, bucketIndices, bucketCounts, bucketOffsets, bucketCursors, candidateCount, segmentCount, outputCapacityPerSegment) {
  const segment = gpu.block.x();
  if (segment >= segmentCount) return;
  const start = segmentOffsets[segment];
  const end = segmentOffsets[segment + gpu.u32(1)];
  if (start > end || end > candidateCount) {
    if (gpu.thread.x() === gpu.u32(0)) { outputStatus[segment] = gpu.u32(1); outputCounts[segment] = gpu.u32(0); }
    return;
  }
  packedNormalize42BucketedDedupFirst(candidateLo, candidateHi, candidatePopcount, outputLo, outputHi, outputCounts, outputStatus, checks,
    bucketIndices, bucketCounts, bucketOffsets, bucketCursors, start, end, segment * outputCapacityPerSegment,
    segment, outputCapacityPerSegment, segmentDirections[segment], start);
}
`;

const u32 = (name) => Object.freeze({ name, type: 'u32' });
const ptr = (name) => Object.freeze({ name, type: 'ptr<u32>' });
const normalizeParameters = Object.freeze([
  ptr('candidateLo'), ptr('candidateHi'), ptr('candidatePopcount'), ptr('segmentOffsets'), ptr('segmentDirections'),
  ptr('outputLo'), ptr('outputHi'), ptr('outputCounts'), ptr('outputStatus'), ptr('checks'),
  u32('candidateCount'), u32('segmentCount'), u32('outputCapacityPerSegment'),
]);
const bucketedParameters = Object.freeze([
  ptr('candidateLo'), ptr('candidateHi'), ptr('candidatePopcount'), ptr('segmentOffsets'), ptr('segmentDirections'),
  ptr('outputLo'), ptr('outputHi'), ptr('outputCounts'), ptr('outputStatus'), ptr('checks'),
  ptr('bucketIndices'), ptr('bucketCounts'), ptr('bucketOffsets'), ptr('bucketCursors'),
  u32('candidateCount'), u32('segmentCount'), u32('outputCapacityPerSegment'),
]);

export const segmentedPackedAntichain42DeviceProgram = Object.freeze({
  source: packedAntichain42CollectiveSource + source,
  compile: Object.freeze({ headerProfile: 'cuda-cccl' }),
  functions: Object.freeze([
    ...packedAntichain42CollectiveFunctions,
    Object.freeze({
      name: 'generateSegmentPairCandidatesPacked42', kind: 'kernel', returns: 'void',
      parameters: Object.freeze([
        ptr('leftLo'), ptr('leftHi'), ptr('rightLo'), ptr('rightHi'), ptr('leftOffsets'), ptr('rightOffsets'),
        ptr('candidateOffsets'), ptr('segmentDirections'), ptr('candidateLo'), ptr('candidateHi'), ptr('candidatePopcount'),
        ptr('generationStatus'), u32('leftCapacity'), u32('rightCapacity'), u32('candidateCapacity'), u32('segmentCount'),
      ]),
    }),
    Object.freeze({ name: 'normalizeSegmentPacked42', kind: 'kernel', returns: 'void', parameters: normalizeParameters }),
    Object.freeze({ name: 'normalizeSegmentPacked42Bucketed', kind: 'kernel', returns: 'void', parameters: bucketedParameters }),
    Object.freeze({ name: 'normalizeSegmentPacked42BucketedDedupFirst', kind: 'kernel', returns: 'void', parameters: bucketedParameters }),
  ]),
});
