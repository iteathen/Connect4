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
  const pairCount = leftCount * rightCount;
  if (candidateEnd - candidateStart !== pairCount) invalid = gpu.u32(1);

  if (lane === gpu.u32(0)) generationStatus[segment] = invalid;
  if (invalid !== gpu.u32(0)) return;

  const direction = segmentDirections[segment];
  const stride = gpu.blockDim.x();
  let pair = lane;
  while (pair < pairCount) {
    const destination = candidateStart + pair;
    const leftIndex = leftStart + pair / rightCount;
    const rightIndex = rightStart + pair % rightCount;
    let low = leftLo[leftIndex] | rightLo[rightIndex];
    let high = leftHi[leftIndex] | rightHi[rightIndex];
    if (direction !== gpu.u32(0)) {
      low = leftLo[leftIndex] & rightLo[rightIndex];
      high = leftHi[leftIndex] & rightHi[rightIndex];
    }
    candidateLo[destination] = low;
    candidateHi[destination] = high;

    let count = gpu.u32(0);
    let lowBits = low;
    while (lowBits !== gpu.u32(0)) {
      lowBits = lowBits & (lowBits - gpu.u32(1));
      count++;
    }
    let highBits = high;
    while (highBits !== gpu.u32(0)) {
      highBits = highBits & (highBits - gpu.u32(1));
      count++;
    }
    candidatePopcount[destination] = count;
    pair = pair + stride;
  }
}

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
              if ((otherLow & notCandidateLow) === gpu.u32(0) && (otherHigh & notCandidateHigh) === gpu.u32(0)) dominated = gpu.u32(1);
            } else {
              const notOtherLow = otherLow ^ gpu.u32(4294967295);
              const notOtherHigh = otherHigh ^ gpu.u32(4294967295);
              if ((candidateLow & notOtherLow) === gpu.u32(0) && (candidateHigh & notOtherHigh) === gpu.u32(0)) dominated = gpu.u32(1);
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
  ]),
});
