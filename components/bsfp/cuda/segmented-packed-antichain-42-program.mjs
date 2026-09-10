const source = `
function markSegmentDominatedPacked42(candidateLo, candidateHi, candidateSegment, segmentOffsets, segmentDirections, dominated, checks, candidateCount, segmentCount) {
  const i = gpu.thread.globalX();
  if (i >= candidateCount) return;

  const segment = candidateSegment[i];
  if (segment >= segmentCount) {
    dominated[i] = gpu.u32(1);
    checks[i] = gpu.u32(0);
    return;
  }

  const start = segmentOffsets[segment];
  const end = segmentOffsets[segment + gpu.u32(1)];
  const direction = segmentDirections[segment];
  const candidateLow = candidateLo[i];
  const candidateHigh = candidateHi[i];
  const notCandidateLow = candidateLow ^ gpu.u32(4294967295);
  const notCandidateHigh = candidateHigh ^ gpu.u32(4294967295);
  let isDominated = gpu.u32(0);
  let tested = gpu.u32(0);
  let j = start;

  while (j < end) {
    if (j !== i) {
      const otherLow = candidateLo[j];
      const otherHigh = candidateHi[j];
      let covers = gpu.u32(0);

      if (direction === gpu.u32(0)) {
        if ((otherLow & notCandidateLow) === gpu.u32(0) && (otherHigh & notCandidateHigh) === gpu.u32(0)) {
          covers = gpu.u32(1);
        }
      } else {
        const notOtherLow = otherLow ^ gpu.u32(4294967295);
        const notOtherHigh = otherHigh ^ gpu.u32(4294967295);
        if ((candidateLow & notOtherLow) === gpu.u32(0) && (candidateHigh & notOtherHigh) === gpu.u32(0)) {
          covers = gpu.u32(1);
        }
      }

      tested++;
      if (covers === gpu.u32(1)) {
        let equal = gpu.u32(0);
        if (otherLow === candidateLow && otherHigh === candidateHigh) equal = gpu.u32(1);
        if (equal === gpu.u32(0) || j < i) {
          isDominated = gpu.u32(1);
          break;
        }
      }
    }
    j++;
  }

  dominated[i] = isDominated;
  checks[i] = tested;
}

function compactSegmentSurvivorsPacked42(candidateLo, candidateHi, dominated, segmentOffsets, outputLo, outputHi, outputCounts, outputStatus, candidateCount, segmentCount, outputCapacityPerSegment) {
  const segment = gpu.thread.globalX();
  if (segment >= segmentCount) return;

  const start = segmentOffsets[segment];
  const end = segmentOffsets[segment + gpu.u32(1)];
  const outputBase = segment * outputCapacityPerSegment;
  let required = gpu.u32(0);
  let i = start;

  while (i < end && i < candidateCount) {
    if (dominated[i] === gpu.u32(0)) {
      if (required < outputCapacityPerSegment) {
        outputLo[outputBase + required] = candidateLo[i];
        outputHi[outputBase + required] = candidateHi[i];
      }
      required++;
    }
    i++;
  }

  outputCounts[segment] = required;
  if (required > outputCapacityPerSegment) {
    outputStatus[segment] = gpu.u32(1);
  } else {
    outputStatus[segment] = gpu.u32(0);
  }
}
`;

export const segmentedPackedAntichain42DeviceProgram = Object.freeze({
  source,
  compile: Object.freeze({ headerProfile: 'cuda-cccl' }),
  functions: Object.freeze([
    Object.freeze({
      name: 'markSegmentDominatedPacked42',
      kind: 'kernel',
      returns: 'void',
      parameters: Object.freeze([
        Object.freeze({ name: 'candidateLo', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidateHi', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidateSegment', type: 'ptr<u32>' }),
        Object.freeze({ name: 'segmentOffsets', type: 'ptr<u32>' }),
        Object.freeze({ name: 'segmentDirections', type: 'ptr<u32>' }),
        Object.freeze({ name: 'dominated', type: 'ptr<u32>' }),
        Object.freeze({ name: 'checks', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidateCount', type: 'u32' }),
        Object.freeze({ name: 'segmentCount', type: 'u32' }),
      ]),
    }),
    Object.freeze({
      name: 'compactSegmentSurvivorsPacked42',
      kind: 'kernel',
      returns: 'void',
      parameters: Object.freeze([
        Object.freeze({ name: 'candidateLo', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidateHi', type: 'ptr<u32>' }),
        Object.freeze({ name: 'dominated', type: 'ptr<u32>' }),
        Object.freeze({ name: 'segmentOffsets', type: 'ptr<u32>' }),
        Object.freeze({ name: 'outputLo', type: 'ptr<u32>' }),
        Object.freeze({ name: 'outputHi', type: 'ptr<u32>' }),
        Object.freeze({ name: 'outputCounts', type: 'ptr<u32>' }),
        Object.freeze({ name: 'outputStatus', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidateCount', type: 'u32' }),
        Object.freeze({ name: 'segmentCount', type: 'u32' }),
        Object.freeze({ name: 'outputCapacityPerSegment', type: 'u32' }),
      ]),
    }),
  ]),
});
