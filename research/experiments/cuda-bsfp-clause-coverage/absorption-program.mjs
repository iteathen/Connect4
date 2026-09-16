// Experimental fixed-two-u32 core-relative antichain absorption marker.
// This qualifies only core computation + absorbable row/column marking.
// Candidate generation, legal-slice filtering and final normalization remain
// separate consumer-owned stages.

const source = `
function markCoreRelativeAbsorption64(
  leftLo, leftHi, rightLo, rightHi,
  leftOffsets, rightOffsets,
  leftAbsorbed, rightAbsorbed,
  coreALo, coreAHi, coreBLo, coreBHi,
  status,
  leftCapacity, rightCapacity, segmentCount
) {
  const segment = gpu.block.x();
  if (segment >= segmentCount) return;
  const lane = gpu.thread.x();
  const stride = gpu.blockDim.x();
  const leftStart = leftOffsets[segment];
  const leftEnd = leftOffsets[segment + gpu.u32(1)];
  const rightStart = rightOffsets[segment];
  const rightEnd = rightOffsets[segment + gpu.u32(1)];

  let invalid = gpu.u32(0);
  if (leftStart >= leftEnd || leftEnd > leftCapacity) invalid = gpu.u32(1);
  if (rightStart >= rightEnd || rightEnd > rightCapacity) invalid = gpu.u32(1);

  if (lane === gpu.u32(0)) {
    status[segment] = invalid;
    coreALo[segment] = gpu.u32(0);
    coreAHi[segment] = gpu.u32(0);
    coreBLo[segment] = gpu.u32(0);
    coreBHi[segment] = gpu.u32(0);
  }

  let i = leftStart + lane;
  while (i < leftEnd) {
    leftAbsorbed[i] = gpu.u32(0);
    i = i + stride;
  }
  i = rightStart + lane;
  while (i < rightEnd) {
    rightAbsorbed[i] = gpu.u32(0);
    i = i + stride;
  }
  gpu.barrier.block();
  if (invalid !== gpu.u32(0)) return;

  if (lane === gpu.u32(0)) {
    let aLo = leftLo[leftStart];
    let aHi = leftHi[leftStart];
    let cursor = leftStart + gpu.u32(1);
    while (cursor < leftEnd) {
      aLo = aLo & leftLo[cursor];
      aHi = aHi & leftHi[cursor];
      cursor++;
    }
    let bLo = rightLo[rightStart];
    let bHi = rightHi[rightStart];
    cursor = rightStart + gpu.u32(1);
    while (cursor < rightEnd) {
      bLo = bLo & rightLo[cursor];
      bHi = bHi & rightHi[cursor];
      cursor++;
    }
    coreALo[segment] = aLo;
    coreAHi[segment] = aHi;
    coreBLo[segment] = bLo;
    coreBHi[segment] = bHi;
  }
  gpu.barrier.block();

  const aCoreLo = coreALo[segment];
  const aCoreHi = coreAHi[segment];
  const bCoreLo = coreBLo[segment];
  const bCoreHi = coreBHi[segment];
  const rightCount = rightEnd - rightStart;
  const pairCount = (leftEnd - leftStart) * rightCount;

  let pair = lane;
  while (pair < pairCount) {
    const leftIndex = leftStart + pair / rightCount;
    const rightIndex = rightStart + pair % rightCount;
    const aLo = leftLo[leftIndex];
    const aHi = leftHi[leftIndex];
    const bLo = rightLo[rightIndex];
    const bHi = rightHi[rightIndex];

    const rowLimitLo = aLo | bCoreLo;
    const rowLimitHi = aHi | bCoreHi;
    if ((bLo & ~rowLimitLo) === gpu.u32(0) && (bHi & ~rowLimitHi) === gpu.u32(0)) {
      gpu.atomic.cas(leftAbsorbed, leftIndex, gpu.u32(0), gpu.u32(1));
    }

    const colLimitLo = bLo | aCoreLo;
    const colLimitHi = bHi | aCoreHi;
    if ((aLo & ~colLimitLo) === gpu.u32(0) && (aHi & ~colLimitHi) === gpu.u32(0)) {
      gpu.atomic.cas(rightAbsorbed, rightIndex, gpu.u32(0), gpu.u32(1));
    }
    pair = pair + stride;
  }
}
`;

const ptr = (name) => Object.freeze({ name, type: 'ptr<u32>' });
const u32 = (name) => Object.freeze({ name, type: 'u32' });

export const coverage64CoreAbsorptionExperimentalDeviceProgram = Object.freeze({
  source,
  compile: Object.freeze({ headerProfile: 'cuda-cccl' }),
  functions: Object.freeze([
    Object.freeze({
      name: 'markCoreRelativeAbsorption64', kind: 'kernel', returns: 'void',
      parameters: Object.freeze([
        ptr('leftLo'), ptr('leftHi'), ptr('rightLo'), ptr('rightHi'),
        ptr('leftOffsets'), ptr('rightOffsets'),
        ptr('leftAbsorbed'), ptr('rightAbsorbed'),
        ptr('coreALo'), ptr('coreAHi'), ptr('coreBLo'), ptr('coreBHi'),
        ptr('status'),
        u32('leftCapacity'), u32('rightCapacity'), u32('segmentCount'),
      ]),
    }),
  ]),
});
