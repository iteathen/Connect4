// Experimental warp-native fixed-two-u32 support-edge coverage cofactor.
//
// One warp owns one child coverage record. After the exact validity/kill guard,
// lane j evaluates whether parent coverage bit j has any selected child preimage;
// masked ballot packs 32 predicates into one output u32. A second ballot covers
// parent IDs 32..63. Frontier compaction/normalization remains a separate stage.

const source = `
function mapCoverageCofactorWarp64(
  inputLo, inputHi, recordOffsets,
  validLo, validHi, killLo, killHi,
  preimageLo, preimageHi,
  outputLo, outputHi, outputKeep, segmentStatus,
  recordCapacity, segmentCount, maxDictionary
) {
  const segment = gpu.block.x();
  if (segment >= segmentCount) return;

  const width = gpu.warp.width();
  const linear = gpu.thread.x();
  const lane = gpu.warp.laneId();
  const warpInBlock = linear / width;
  const warpsPerBlock = gpu.blockDim.x() / width;
  const start = recordOffsets[segment];
  const end = recordOffsets[segment + gpu.u32(1)];

  let invalidSegment = gpu.u32(0);
  if (start > end || end > recordCapacity) invalidSegment = gpu.u32(1);
  if (maxDictionary === gpu.u32(0) || maxDictionary > gpu.u32(64)) invalidSegment = gpu.u32(1);
  if (warpsPerBlock === gpu.u32(0)) invalidSegment = gpu.u32(1);
  if (linear === gpu.u32(0)) segmentStatus[segment] = invalidSegment;
  gpu.barrier.block();
  if (invalidSegment !== gpu.u32(0)) return;

  const allowedLo = validLo[segment];
  const allowedHi = validHi[segment];
  const fatalLo = killLo[segment];
  const fatalHi = killHi[segment];
  const mapBase = segment * maxDictionary;
  const participation = gpu.u32(4294967295);

  let record = start + warpInBlock;
  while (record < end) {
    const low = inputLo[record];
    const high = inputHi[record];
    const invalidInput = ((low & ~allowedLo) !== gpu.u32(0)) || ((high & ~allowedHi) !== gpu.u32(0));
    const killed = ((low & fatalLo) !== gpu.u32(0)) || ((high & fatalHi) !== gpu.u32(0));

    if (invalidInput) {
      if (lane === gpu.u32(0)) {
        outputLo[record] = gpu.u32(0);
        outputHi[record] = gpu.u32(0);
        outputKeep[record] = gpu.u32(2);
        gpu.atomic.cas(segmentStatus, segment, gpu.u32(0), gpu.u32(2));
      }
    } else if (killed) {
      if (lane === gpu.u32(0)) {
        outputLo[record] = gpu.u32(0);
        outputHi[record] = gpu.u32(0);
        outputKeep[record] = gpu.u32(0);
      }
    } else {
      let lowPredicate = false;
      if (lane < maxDictionary) {
        const preLo = preimageLo[mapBase + lane];
        const preHi = preimageHi[mapBase + lane];
        lowPredicate = ((low & preLo) !== gpu.u32(0)) || ((high & preHi) !== gpu.u32(0));
      }
      const mappedLo = gpu.warp.ballot(participation, lowPredicate);

      const highId = lane + gpu.u32(32);
      let highPredicate = false;
      if (highId < maxDictionary) {
        const preLo = preimageLo[mapBase + highId];
        const preHi = preimageHi[mapBase + highId];
        highPredicate = ((low & preLo) !== gpu.u32(0)) || ((high & preHi) !== gpu.u32(0));
      }
      const mappedHi = gpu.warp.ballot(participation, highPredicate);

      if (lane === gpu.u32(0)) {
        outputLo[record] = mappedLo;
        outputHi[record] = mappedHi;
        outputKeep[record] = gpu.u32(1);
      }
    }

    record = record + warpsPerBlock;
  }
}
`;

const ptr = (name) => Object.freeze({ name, type: 'ptr<u32>' });
const u32 = (name) => Object.freeze({ name, type: 'u32' });

export const coverage64WarpCofactorExperimentalDeviceProgram = Object.freeze({
  source,
  compile: Object.freeze({ headerProfile: 'cuda-cccl' }),
  functions: Object.freeze([
    Object.freeze({
      name: 'mapCoverageCofactorWarp64',
      kind: 'kernel',
      returns: 'void',
      parameters: Object.freeze([
        ptr('inputLo'), ptr('inputHi'), ptr('recordOffsets'),
        ptr('validLo'), ptr('validHi'), ptr('killLo'), ptr('killHi'),
        ptr('preimageLo'), ptr('preimageHi'),
        ptr('outputLo'), ptr('outputHi'), ptr('outputKeep'), ptr('segmentStatus'),
        u32('recordCapacity'), u32('segmentCount'), u32('maxDictionary'),
      ]),
    }),
  ]),
});
