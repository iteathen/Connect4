// Experimental fixed-two-u32 support-edge coverage cofactor primitive.
//
// One input record maps to either one parent coverage record or KILL. Frontier
// dedup/subset normalization is deliberately a separate algorithm stage.

const source = `
function mapCoverageCofactor64(
  inputLo, inputHi, recordOffsets,
  validLo, validHi, killLo, killHi,
  contributionLo, contributionHi,
  outputLo, outputHi, outputKeep, segmentStatus,
  recordCapacity, segmentCount, maxDictionary
) {
  const segment = gpu.block.x();
  if (segment >= segmentCount) return;
  const lane = gpu.thread.x();
  const start = recordOffsets[segment];
  const end = recordOffsets[segment + gpu.u32(1)];

  let invalidSegment = gpu.u32(0);
  if (start > end || end > recordCapacity) invalidSegment = gpu.u32(1);
  if (maxDictionary === gpu.u32(0) || maxDictionary > gpu.u32(64)) invalidSegment = gpu.u32(1);
  if (lane === gpu.u32(0)) segmentStatus[segment] = invalidSegment;
  gpu.barrier.block();
  if (invalidSegment !== gpu.u32(0)) return;

  const allowedLo = validLo[segment];
  const allowedHi = validHi[segment];
  const fatalLo = killLo[segment];
  const fatalHi = killHi[segment];
  const mapBase = segment * maxDictionary;

  let record = start + lane;
  while (record < end) {
    const low = inputLo[record];
    const high = inputHi[record];
    outputLo[record] = gpu.u32(0);
    outputHi[record] = gpu.u32(0);
    outputKeep[record] = gpu.u32(0);

    if ((low & ~allowedLo) !== gpu.u32(0) || (high & ~allowedHi) !== gpu.u32(0)) {
      outputKeep[record] = gpu.u32(2);
      gpu.atomic.cas(segmentStatus, segment, gpu.u32(0), gpu.u32(2));
    } else if ((low & fatalLo) !== gpu.u32(0) || (high & fatalHi) !== gpu.u32(0)) {
      outputKeep[record] = gpu.u32(0);
    } else {
      let mappedLo = gpu.u32(0);
      let mappedHi = gpu.u32(0);
      let id = gpu.u32(0);
      while (id < maxDictionary) {
        let present = gpu.u32(0);
        if (id < gpu.u32(32)) {
          const bit = gpu.u32(1) << id;
          if ((low & bit) !== gpu.u32(0)) present = gpu.u32(1);
        } else {
          const highId = id - gpu.u32(32);
          const bit = gpu.u32(1) << highId;
          if ((high & bit) !== gpu.u32(0)) present = gpu.u32(1);
        }
        if (present !== gpu.u32(0)) {
          mappedLo = mappedLo | contributionLo[mapBase + id];
          mappedHi = mappedHi | contributionHi[mapBase + id];
        }
        id++;
      }
      outputLo[record] = mappedLo;
      outputHi[record] = mappedHi;
      outputKeep[record] = gpu.u32(1);
    }

    record = record + gpu.blockDim.x();
  }
}
`;

const ptr = (name) => Object.freeze({ name, type: 'ptr<u32>' });
const u32 = (name) => Object.freeze({ name, type: 'u32' });

export const coverage64CofactorExperimentalDeviceProgram = Object.freeze({
  source,
  compile: Object.freeze({ headerProfile: 'cuda-cccl' }),
  functions: Object.freeze([
    Object.freeze({
      name: 'mapCoverageCofactor64',
      kind: 'kernel',
      returns: 'void',
      parameters: Object.freeze([
        ptr('inputLo'), ptr('inputHi'), ptr('recordOffsets'),
        ptr('validLo'), ptr('validHi'), ptr('killLo'), ptr('killHi'),
        ptr('contributionLo'), ptr('contributionHi'),
        ptr('outputLo'), ptr('outputHi'), ptr('outputKeep'), ptr('segmentStatus'),
        u32('recordCapacity'), u32('segmentCount'), u32('maxDictionary'),
      ]),
    }),
  ]),
});
