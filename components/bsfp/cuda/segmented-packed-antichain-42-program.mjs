const source = `
function normalizeSegmentPacked42(candidateLo, candidateHi, candidatePopcount, segmentOffsets, segmentDirections, outputLo, outputHi, outputCounts, outputStatus, checks, candidateCount, segmentCount, outputCapacityPerSegment) {
  const segment = gpu.block.x();
  if (segment >= segmentCount) return;

  const lane = gpu.thread.x();
  const stride = gpu.blockDim.x();
  const start = segmentOffsets[segment];
  const end = segmentOffsets[segment + gpu.u32(1)];
  const direction = segmentDirections[segment];
  const outputBase = segment * outputCapacityPerSegment;

  if (lane === gpu.u32(0)) {
    outputCounts[segment] = gpu.u32(0);
    outputStatus[segment] = gpu.u32(0);
  }
  gpu.barrier.block();

  let phase = gpu.u32(0);
  while (phase < gpu.u32(43)) {
    let targetPopcount = phase;
    if (direction !== gpu.u32(0)) targetPopcount = gpu.u32(42) - phase;

    let i = start + lane;
    while (i < end && i < candidateCount) {
      if (candidatePopcount[i] === targetPopcount) {
        const candidateLow = candidateLo[i];
        const candidateHigh = candidateHi[i];
        const notCandidateLow = candidateLow ^ gpu.u32(4294967295);
        const notCandidateHigh = candidateHigh ^ gpu.u32(4294967295);
        let dominated = gpu.u32(0);
        let tested = gpu.u32(0);
        let frontierCount = outputCounts[segment];
        if (frontierCount > outputCapacityPerSegment) frontierCount = outputCapacityPerSegment;
        let j = gpu.u32(0);

        while (j < frontierCount) {
          const otherLow = outputLo[outputBase + j];
          const otherHigh = outputHi[outputBase + j];
          const equal = otherLow === candidateLow && otherHigh === candidateHigh;
          if (!equal) {
            if (direction === gpu.u32(0)) {
              if ((otherLow & notCandidateLow) === gpu.u32(0) && (otherHigh & notCandidateHigh) === gpu.u32(0)) {
                dominated = gpu.u32(1);
              }
            } else {
              const notOtherLow = otherLow ^ gpu.u32(4294967295);
              const notOtherHigh = otherHigh ^ gpu.u32(4294967295);
              if ((candidateLow & notOtherLow) === gpu.u32(0) && (candidateHigh & notOtherHigh) === gpu.u32(0)) {
                dominated = gpu.u32(1);
              }
            }
          }
          tested++;
          if (dominated === gpu.u32(1)) break;
          j++;
        }

        if (dominated === gpu.u32(0)) {
          let prior = start;
          while (prior < i) {
            if (candidatePopcount[prior] === targetPopcount && candidateLo[prior] === candidateLow && candidateHi[prior] === candidateHigh) {
              dominated = gpu.u32(1);
              break;
            }
            prior++;
          }
        }

        checks[i] = tested;
        if (dominated === gpu.u32(0)) {
          const slot = gpu.atomic.add(outputCounts, segment, gpu.u32(1));
          if (slot < outputCapacityPerSegment) {
            outputLo[outputBase + slot] = candidateLow;
            outputHi[outputBase + slot] = candidateHigh;
          } else {
            gpu.atomic.cas(outputStatus, segment, gpu.u32(0), gpu.u32(1));
          }
        }
      } else {
        checks[i] = gpu.u32(0);
      }
      i = i + stride;
    }

    gpu.barrier.block();
    phase++;
  }
}
`;

export const segmentedPackedAntichain42DeviceProgram = Object.freeze({
  source,
  compile: Object.freeze({ headerProfile: 'cuda-cccl' }),
  functions: Object.freeze([
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
  ]),
});
