import {
  packedAntichain42CollectiveSource,
  packedAntichain42CollectiveFunctions,
} from '../../../components/bsfp/cuda/packed-antichain-42-collective.mjs';

const source = `
function normalizeRankSliceSegmentPacked42(
  candidateLo, candidateHi, candidatePopcount,
  segmentOffsets, segmentDirections, legalP0Counts,
  outputLo, outputHi, outputCounts, outputStatus, checks,
  candidateCount, segmentCount, outputCapacityPerSegment
) {
  const segment = gpu.block.x();
  if (segment >= segmentCount) return;

  const start = segmentOffsets[segment];
  const end = segmentOffsets[segment + gpu.u32(1)];
  if (start > end || end > candidateCount) {
    if (gpu.thread.x() === gpu.u32(0)) {
      outputStatus[segment] = gpu.u32(2);
      outputCounts[segment] = gpu.u32(0);
    }
    return;
  }

  const direction = segmentDirections[segment];
  const legal = legalP0Counts[segment];
  let i = start + gpu.thread.x();
  while (i < end) {
    const cardinality = candidatePopcount[i];
    let admissible = true;
    if (direction === gpu.u32(0) && cardinality > legal) admissible = false;
    if (direction !== gpu.u32(0) && cardinality < legal) admissible = false;
    if (!admissible) candidatePopcount[i] = gpu.u32(99);
    i = i + gpu.blockDim.x();
  }
  gpu.barrier.block();

  packedNormalize42(
    candidateLo, candidateHi, candidatePopcount,
    outputLo, outputHi, outputCounts, outputStatus, checks,
    start, end, segment * outputCapacityPerSegment,
    segment, outputCapacityPerSegment, direction
  );
}
`;

const u32 = (name) => Object.freeze({ name, type: 'u32' });
const ptr = (name) => Object.freeze({ name, type: 'ptr<u32>' });

export const rankSliceCompact42DeviceProgram = Object.freeze({
  source: packedAntichain42CollectiveSource + source,
  compile: Object.freeze({ headerProfile: 'cuda-cccl' }),
  functions: Object.freeze([
    ...packedAntichain42CollectiveFunctions,
    Object.freeze({
      name: 'normalizeRankSliceSegmentPacked42',
      kind: 'kernel',
      returns: 'void',
      parameters: Object.freeze([
        ptr('candidateLo'), ptr('candidateHi'), ptr('candidatePopcount'),
        ptr('segmentOffsets'), ptr('segmentDirections'), ptr('legalP0Counts'),
        ptr('outputLo'), ptr('outputHi'), ptr('outputCounts'), ptr('outputStatus'), ptr('checks'),
        u32('candidateCount'), u32('segmentCount'), u32('outputCapacityPerSegment'),
      ]),
    }),
  ]),
});
