export const COVERAGE_MULTIWORD_COFACTOR_STATUS = Object.freeze({
  OK: 0,
  INVALID_INPUT: 1,
});

const source = `
function mapCoverageMultiwordCofactors(
  inputWords, recordOffsets,
  validWords, killWords, contributionWords,
  outputWords, outputKeep, outputStatus,
  segmentCount, wordCount, maxDictionary
) {
  const segment = gpu.block.x();
  const lane = gpu.thread.x();
  if (segment >= segmentCount) return;

  const start = recordOffsets[segment];
  const end = recordOffsets[segment + gpu.u32(1)];
  const record = start + lane;
  if (record >= end) return;

  const inputBase = record * wordCount;
  const mapWordBase = segment * wordCount;
  let invalid = false;
  let killed = false;
  let word = gpu.u32(0);
  while (word < wordCount) {
    const value = inputWords[inputBase + word];
    if ((value & ~validWords[mapWordBase + word]) !== gpu.u32(0)) invalid = true;
    if ((value & killWords[mapWordBase + word]) !== gpu.u32(0)) killed = true;
    word = word + gpu.u32(1);
  }

  if (invalid) {
    outputKeep[record] = gpu.u32(0);
    outputStatus[record] = gpu.u32(1);
    word = gpu.u32(0);
    while (word < wordCount) {
      outputWords[inputBase + word] = gpu.u32(0);
      word = word + gpu.u32(1);
    }
    return;
  }

  if (killed) {
    outputKeep[record] = gpu.u32(0);
    outputStatus[record] = gpu.u32(0);
    word = gpu.u32(0);
    while (word < wordCount) {
      outputWords[inputBase + word] = gpu.u32(0);
      word = word + gpu.u32(1);
    }
    return;
  }

  word = gpu.u32(0);
  while (word < wordCount) {
    let aggregate = gpu.u32(0);
    let id = gpu.u32(0);
    while (id < maxDictionary) {
      const inputWord = id / gpu.u32(32);
      const inputLane = id % gpu.u32(32);
      const bit = gpu.u32(1) << inputLane;
      if ((inputWords[inputBase + inputWord] & bit) !== gpu.u32(0)) {
        const contributionIndex = ((segment * maxDictionary + id) * wordCount) + word;
        aggregate = aggregate | contributionWords[contributionIndex];
      }
      id = id + gpu.u32(1);
    }
    outputWords[inputBase + word] = aggregate;
    word = word + gpu.u32(1);
  }
  outputKeep[record] = gpu.u32(1);
  outputStatus[record] = gpu.u32(0);
}
`;

const ptr = (name) => Object.freeze({ name, type: 'ptr<u32>' });
const u32 = (name) => Object.freeze({ name, type: 'u32' });

export const coverageMultiwordCofactorDeviceProgram = Object.freeze({
  source,
  compile: Object.freeze({ headerProfile: 'cuda-cccl' }),
  functions: Object.freeze([
    Object.freeze({
      name: 'mapCoverageMultiwordCofactors',
      kind: 'kernel',
      returns: 'void',
      parameters: Object.freeze([
        ptr('inputWords'), ptr('recordOffsets'),
        ptr('validWords'), ptr('killWords'), ptr('contributionWords'),
        ptr('outputWords'), ptr('outputKeep'), ptr('outputStatus'),
        u32('segmentCount'), u32('wordCount'), u32('maxDictionary'),
      ]),
    }),
  ]),
});
