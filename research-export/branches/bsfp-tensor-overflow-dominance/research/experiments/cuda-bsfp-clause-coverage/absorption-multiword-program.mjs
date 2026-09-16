// Experimental geometry-selected multiword core-relative absorption marker.
// This widens only the exact core/absorbable-row-column marking stage. Product
// generation, legal-slice filtering, residual normalization and final antichain
// authority remain separate consumer-owned stages.

const source = `
function markCoreRelativeAbsorptionMultiword(
  leftWords, rightWords,
  leftOffsets, rightOffsets,
  leftAbsorbed, rightAbsorbed,
  coreA, coreB, status,
  leftCapacity, rightCapacity, segmentCount, wordCount
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
  if (wordCount === gpu.u32(0)) invalid = gpu.u32(1);

  if (lane === gpu.u32(0)) status[segment] = invalid;
  let i = leftStart + lane;
  while (i < leftEnd) { leftAbsorbed[i] = gpu.u32(0); i = i + stride; }
  i = rightStart + lane;
  while (i < rightEnd) { rightAbsorbed[i] = gpu.u32(0); i = i + stride; }

  let word = lane;
  const coreBase = segment * wordCount;
  while (word < wordCount) {
    coreA[coreBase + word] = gpu.u32(0);
    coreB[coreBase + word] = gpu.u32(0);
    word = word + stride;
  }
  gpu.barrier.block();
  if (invalid !== gpu.u32(0)) return;

  if (lane === gpu.u32(0)) {
    word = gpu.u32(0);
    while (word < wordCount) {
      let a = leftWords[leftStart * wordCount + word];
      let cursor = leftStart + gpu.u32(1);
      while (cursor < leftEnd) {
        a = a & leftWords[cursor * wordCount + word];
        cursor++;
      }
      let b = rightWords[rightStart * wordCount + word];
      cursor = rightStart + gpu.u32(1);
      while (cursor < rightEnd) {
        b = b & rightWords[cursor * wordCount + word];
        cursor++;
      }
      coreA[coreBase + word] = a;
      coreB[coreBase + word] = b;
      word++;
    }
  }
  gpu.barrier.block();

  const rightCount = rightEnd - rightStart;
  const pairCount = (leftEnd - leftStart) * rightCount;
  let pair = lane;
  while (pair < pairCount) {
    const leftIndex = leftStart + pair / rightCount;
    const rightIndex = rightStart + pair % rightCount;
    let rowAbsorbs = gpu.u32(1);
    let colAbsorbs = gpu.u32(1);
    word = gpu.u32(0);
    while (word < wordCount && (rowAbsorbs !== gpu.u32(0) || colAbsorbs !== gpu.u32(0))) {
      const a = leftWords[leftIndex * wordCount + word];
      const b = rightWords[rightIndex * wordCount + word];
      const aCore = coreA[coreBase + word];
      const bCore = coreB[coreBase + word];
      if ((b & ~(a | bCore)) !== gpu.u32(0)) rowAbsorbs = gpu.u32(0);
      if ((a & ~(b | aCore)) !== gpu.u32(0)) colAbsorbs = gpu.u32(0);
      word++;
    }
    if (rowAbsorbs !== gpu.u32(0)) gpu.atomic.cas(leftAbsorbed, leftIndex, gpu.u32(0), gpu.u32(1));
    if (colAbsorbs !== gpu.u32(0)) gpu.atomic.cas(rightAbsorbed, rightIndex, gpu.u32(0), gpu.u32(1));
    pair = pair + stride;
  }
}
`;

const ptr = (name) => Object.freeze({ name, type: 'ptr<u32>' });
const u32 = (name) => Object.freeze({ name, type: 'u32' });

export const coverageMultiwordCoreAbsorptionExperimentalDeviceProgram = Object.freeze({
  source,
  compile: Object.freeze({ headerProfile: 'cuda-cccl' }),
  functions: Object.freeze([
    Object.freeze({
      name: 'markCoreRelativeAbsorptionMultiword', kind: 'kernel', returns: 'void',
      parameters: Object.freeze([
        ptr('leftWords'), ptr('rightWords'),
        ptr('leftOffsets'), ptr('rightOffsets'),
        ptr('leftAbsorbed'), ptr('rightAbsorbed'),
        ptr('coreA'), ptr('coreB'), ptr('status'),
        u32('leftCapacity'), u32('rightCapacity'), u32('segmentCount'), u32('wordCount'),
      ]),
    }),
  ]),
});
