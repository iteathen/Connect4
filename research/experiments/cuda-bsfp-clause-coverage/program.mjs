// Experimental fixed-two-u32 clause-coverage primitive.
//
// This is a qualification profile, not the variable-size semantic contract.
// A production implementation must select the number of u32 lanes from the
// active support/orbit-local clause dictionary.

const source = `
function coveragePopcount32(value) {
  let x = value;
  let count = gpu.u32(0);
  while (x !== gpu.u32(0)) { x = x & (x - gpu.u32(1)); count++; }
  return count;
}

function coveragePopcount64(low, high) {
  return coveragePopcount32(low) + coveragePopcount32(high);
}

function coverageSubset64(leftLo, leftHi, rightLo, rightHi) {
  let result = gpu.u32(0);
  if ((leftLo & ~rightLo) === gpu.u32(0) && (leftHi & ~rightHi) === gpu.u32(0)) result = gpu.u32(1);
  return result;
}

function generateFilterCoveragePairs64(
  leftLo, leftHi, rightLo, rightHi,
  leftOffsets, rightOffsets, candidateOffsets,
  exactCounts, cellCounts,
  singletonMaskLo, singletonMaskHi,
  singletonBitsLo, singletonBitsHi,
  containsLo, containsHi,
  candidateLo, candidateHi, candidatePopcount,
  generationStatus, rejectedCounts,
  leftCapacity, rightCapacity, candidateCapacity,
  segmentCount, maxCells
) {
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
  if (cellCounts[segment] > maxCells) invalid = gpu.u32(1);

  if (lane === gpu.u32(0)) {
    generationStatus[segment] = invalid;
    rejectedCounts[segment] = gpu.u32(0);
  }
  if (invalid !== gpu.u32(0)) return;

  const k = exactCounts[segment];
  const singletonLo = singletonMaskLo[segment];
  const singletonHi = singletonMaskHi[segment];
  const cellCount = cellCounts[segment];
  const cellBase = segment * maxCells;

  let pair = lane;
  let localRejected = gpu.u32(0);
  while (pair < pairCount) {
    const leftIndex = leftStart + pair / rightCount;
    const rightIndex = rightStart + pair % rightCount;
    const low = leftLo[leftIndex] | rightLo[rightIndex];
    const high = leftHi[leftIndex] | rightHi[rightIndex];

    const forcedLo = low & singletonLo;
    const forcedHi = high & singletonHi;
    const forcedCount = coveragePopcount64(forcedLo, forcedHi);
    let keep = gpu.u32(1);

    if (forcedCount > k) {
      keep = gpu.u32(0);
    } else {
      // Every clause-ID in a record coverage signature is already upward
      // closed in the local clause poset. A forced singleton cell satisfies
      // exactly the dictionary clauses whose IDs are present in Contains[cell].
      let satisfiedLo = gpu.u32(0);
      let satisfiedHi = gpu.u32(0);
      let cell = gpu.u32(0);
      while (cell < cellCount) {
        const index = cellBase + cell;
        const bitLo = singletonBitsLo[index];
        const bitHi = singletonBitsHi[index];
        if ((forcedLo & bitLo) !== gpu.u32(0) || (forcedHi & bitHi) !== gpu.u32(0)) {
          satisfiedLo = satisfiedLo | containsLo[index];
          satisfiedHi = satisfiedHi | containsHi[index];
        }
        cell++;
      }

      const extraLo = low & ~satisfiedLo;
      const extraHi = high & ~satisfiedHi;
      let hasExtra = gpu.u32(0);
      if (extraLo !== gpu.u32(0) || extraHi !== gpu.u32(0)) hasExtra = gpu.u32(1);

      if (hasExtra !== gpu.u32(0) && forcedCount === k) {
        keep = gpu.u32(0);
      } else if (hasExtra !== gpu.u32(0) && forcedCount + gpu.u32(1) === k) {
        // Exactly one beneficiary stone remains. It must satisfy every
        // still-unsatisfied clause simultaneously.
        let found = gpu.u32(0);
        cell = gpu.u32(0);
        while (cell < cellCount && found === gpu.u32(0)) {
          const index = cellBase + cell;
          const bitLo = singletonBitsLo[index];
          const bitHi = singletonBitsHi[index];
          let alreadyForced = gpu.u32(0);
          if ((forcedLo & bitLo) !== gpu.u32(0) || (forcedHi & bitHi) !== gpu.u32(0)) alreadyForced = gpu.u32(1);
          if (alreadyForced === gpu.u32(0) && coverageSubset64(extraLo, extraHi, containsLo[index], containsHi[index]) !== gpu.u32(0)) {
            found = gpu.u32(1);
          }
          cell++;
        }
        if (found === gpu.u32(0)) keep = gpu.u32(0);
      }
    }

    const output = candidateStart + pair;
    candidateLo[output] = low;
    candidateHi[output] = high;
    if (keep !== gpu.u32(0)) candidatePopcount[output] = coveragePopcount64(low, high);
    else {
      candidatePopcount[output] = gpu.u32(65);
      localRejected++;
    }
    pair = pair + gpu.blockDim.x();
  }

  if (localRejected !== gpu.u32(0)) gpu.atomic.add(rejectedCounts, segment, localRejected);
}

function normalizeCoverageSegments64(
  candidateLo, candidateHi, candidatePopcount, candidateOffsets,
  outputLo, outputHi, outputCounts, outputStatus, checks,
  candidateCapacity, segmentCount, outputCapacityPerSegment
) {
  const segment = gpu.block.x();
  if (segment >= segmentCount) return;
  const lane = gpu.thread.x();
  const stride = gpu.blockDim.x();
  const start = candidateOffsets[segment];
  const end = candidateOffsets[segment + gpu.u32(1)];

  if (start > end || end > candidateCapacity) {
    if (lane === gpu.u32(0)) { outputStatus[segment] = gpu.u32(2); outputCounts[segment] = gpu.u32(0); }
    return;
  }

  if (lane === gpu.u32(0)) { outputCounts[segment] = gpu.u32(0); outputStatus[segment] = gpu.u32(0); }
  let initial = start + lane;
  while (initial < end) { checks[initial] = gpu.u32(0); initial = initial + stride; }
  gpu.barrier.block();

  const outputBase = segment * outputCapacityPerSegment;
  let phase = gpu.u32(0);
  while (phase < gpu.u32(65)) {
    const frontierCount = outputCounts[segment];
    gpu.barrier.block();
    let i = start + lane;
    while (i < end) {
      if (candidatePopcount[i] === phase) {
        const low = candidateLo[i];
        const high = candidateHi[i];
        let dominated = gpu.u32(0);
        let tested = gpu.u32(0);
        let j = gpu.u32(0);
        while (j < frontierCount) {
          tested++;
          if (coverageSubset64(outputLo[outputBase + j], outputHi[outputBase + j], low, high) !== gpu.u32(0)) {
            dominated = gpu.u32(1);
            break;
          }
          j++;
        }
        if (dominated === gpu.u32(0)) {
          let prior = start;
          while (prior < i) {
            if (candidatePopcount[prior] === phase && candidateLo[prior] === low && candidateHi[prior] === high) {
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

export const coverage64ExperimentalDeviceProgram = Object.freeze({
  source,
  compile: Object.freeze({ headerProfile: 'cuda-cccl' }),
  functions: Object.freeze([
    Object.freeze({
      name: 'coveragePopcount32', kind: 'device', returns: 'u32',
      parameters: Object.freeze([u32('value')]),
    }),
    Object.freeze({
      name: 'coveragePopcount64', kind: 'device', returns: 'u32',
      parameters: Object.freeze([u32('low'), u32('high')]),
    }),
    Object.freeze({
      name: 'coverageSubset64', kind: 'device', returns: 'u32',
      parameters: Object.freeze([u32('leftLo'), u32('leftHi'), u32('rightLo'), u32('rightHi')]),
    }),
    Object.freeze({
      name: 'generateFilterCoveragePairs64', kind: 'kernel', returns: 'void',
      parameters: Object.freeze([
        ptr('leftLo'), ptr('leftHi'), ptr('rightLo'), ptr('rightHi'),
        ptr('leftOffsets'), ptr('rightOffsets'), ptr('candidateOffsets'),
        ptr('exactCounts'), ptr('cellCounts'),
        ptr('singletonMaskLo'), ptr('singletonMaskHi'),
        ptr('singletonBitsLo'), ptr('singletonBitsHi'),
        ptr('containsLo'), ptr('containsHi'),
        ptr('candidateLo'), ptr('candidateHi'), ptr('candidatePopcount'),
        ptr('generationStatus'), ptr('rejectedCounts'),
        u32('leftCapacity'), u32('rightCapacity'), u32('candidateCapacity'),
        u32('segmentCount'), u32('maxCells'),
      ]),
    }),
    Object.freeze({
      name: 'normalizeCoverageSegments64', kind: 'kernel', returns: 'void',
      parameters: Object.freeze([
        ptr('candidateLo'), ptr('candidateHi'), ptr('candidatePopcount'), ptr('candidateOffsets'),
        ptr('outputLo'), ptr('outputHi'), ptr('outputCounts'), ptr('outputStatus'), ptr('checks'),
        u32('candidateCapacity'), u32('segmentCount'), u32('outputCapacityPerSegment'),
      ]),
    }),
  ]),
});
