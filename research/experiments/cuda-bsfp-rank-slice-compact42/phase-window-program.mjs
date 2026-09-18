const source = `
function normalizeRankSlicePhaseWindowPacked42(
  candidateLo, candidateHi, candidatePopcount,
  segmentOffsets, segmentDirections, segmentRanks,
  outputLo, outputHi, outputCounts, outputStatus, checks,
  candidateCount, segmentCount, outputCapacityPerSegment
) {
  const segment = gpu.block.x();
  if (segment >= segmentCount) return;
  const lane = gpu.thread.x();
  const stride = gpu.blockDim.x();
  const start = segmentOffsets[segment];
  const end = segmentOffsets[segment + gpu.u32(1)];
  const rank = segmentRanks[segment];
  const direction = segmentDirections[segment];

  if (start > end || end > candidateCount || rank > gpu.u32(42)) {
    if (lane === gpu.u32(0)) {
      outputStatus[segment] = gpu.u32(2);
      outputCounts[segment] = gpu.u32(0);
    }
    return;
  }

  if (lane === gpu.u32(0)) {
    outputCounts[segment] = gpu.u32(0);
    outputStatus[segment] = gpu.u32(0);
  }
  let initial = start + lane;
  while (initial < end) {
    checks[initial] = gpu.u32(0);
    initial = initial + stride;
  }
  gpu.barrier.block();

  const legal = (rank + gpu.u32(1)) / gpu.u32(2);
  let phaseCount = legal + gpu.u32(1);
  if (direction !== gpu.u32(0)) phaseCount = rank - legal + gpu.u32(1);

  const outputBase = segment * outputCapacityPerSegment;
  let phase = gpu.u32(0);
  while (phase < phaseCount) {
    let target = phase;
    if (direction !== gpu.u32(0)) target = rank - phase;
    const frontierCount = outputCounts[segment];
    gpu.barrier.block();

    let i = start + lane;
    while (i < end) {
      if (candidatePopcount[i] === target) {
        const low = candidateLo[i];
        const high = candidateHi[i];
        let dominated = false;
        let tested = gpu.u32(0);
        let j = gpu.u32(0);
        while (j < frontierCount) {
          const otherLow = outputLo[outputBase + j];
          const otherHigh = outputHi[outputBase + j];
          tested++;
          if (direction === gpu.u32(0)) {
            if ((otherLow & ~low) === gpu.u32(0) && (otherHigh & ~high) === gpu.u32(0)) dominated = true;
          } else {
            if ((low & ~otherLow) === gpu.u32(0) && (high & ~otherHigh) === gpu.u32(0)) dominated = true;
          }
          if (dominated) break;
          j++;
        }
        if (!dominated) {
          let prior = start;
          while (prior < i) {
            if (candidatePopcount[prior] === target && candidateLo[prior] === low && candidateHi[prior] === high) {
              dominated = true;
              break;
            }
            prior++;
          }
        }
        checks[i] = tested;
        if (!dominated) {
          const slot = gpu.atomic.add(outputCounts, segment, gpu.u32(1));
          if (slot < outputCapacityPerSegment) {
            outputLo[outputBase + slot] = low;
            outputHi[outputBase + slot] = high;
          } else {
            gpu.atomic.cas(outputStatus, segment, gpu.u32(0), gpu.u32(1));
          }
        }
      }
      i = i + stride;
    }
    gpu.barrier.block();
    if (outputStatus[segment] !== gpu.u32(0)) return;
    phase++;
  }
}
`;

const u32 = (name) => Object.freeze({ name, type: 'u32' });
const ptr = (name) => Object.freeze({ name, type: 'ptr<u32>' });

export const rankSlicePhaseWindow42DeviceProgram = Object.freeze({
  source,
  compile: Object.freeze({ headerProfile: 'cuda-cccl' }),
  functions: Object.freeze([
    Object.freeze({
      name: 'normalizeRankSlicePhaseWindowPacked42',
      kind: 'kernel',
      returns: 'void',
      parameters: Object.freeze([
        ptr('candidateLo'), ptr('candidateHi'), ptr('candidatePopcount'),
        ptr('segmentOffsets'), ptr('segmentDirections'), ptr('segmentRanks'),
        ptr('outputLo'), ptr('outputHi'), ptr('outputCounts'), ptr('outputStatus'), ptr('checks'),
        u32('candidateCount'), u32('segmentCount'), u32('outputCapacityPerSegment'),
      ]),
    }),
  ]),
});
