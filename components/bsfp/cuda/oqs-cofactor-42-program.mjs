import { packedAntichain42CollectiveFunctions, packedAntichain42CollectiveSource } from './packed-antichain-42-collective.mjs';

export const OQS_COFACTOR_42_STATUS = Object.freeze({
  OK: 0,
  INVALID_EXTENT: 1,
  INVALID_STATE_OFFSETS: 2,
  FRONTIER_CAPACITY_EXCEEDED: 3,
  INVALID_INPUT_MASK: 4,
});

const source = `
function resetOqsCofactor42Control(globalStatus, candidateCount) {
  const i = gpu.thread.globalX();
  if (i === gpu.u32(0)) {
    globalStatus[gpu.u32(0)] = gpu.u32(0);
    candidateCount[gpu.u32(0)] = gpu.u32(0);
  }
}

function synthesizeOqsCofactor42Candidates(
  stateXLo, stateXHi,
  stateWinLo, stateWinHi, stateWinOffsets,
  stateLossLo, stateLossHi, stateLossOffsets,
  activeStateCount, cutMeta, inputP0Lo, inputP0Hi,
  scratchLo, scratchHi, scratchPopcount, scratchCounts, checks,
  candidateXLo, candidateXHi,
  outputWinLo, outputWinHi, outputWinCounts, outputWinStatus,
  outputLossLo, outputLossHi, outputLossCounts, outputLossStatus,
  generationStatus, candidateCount, globalStatus,
  stateCapacity, winRecordCapacity, lossRecordCapacity, candidateCapacity, frontierCapacity, preserveAntichains
) {
  const candidate = gpu.block.x();
  const lane = gpu.thread.x();
  const active = activeStateCount[gpu.u32(0)];
  const fixedLo = cutMeta[gpu.u32(0)];
  const fixedHi = cutMeta[gpu.u32(1)];
  const nextCrossingLo = cutMeta[gpu.u32(2)];
  const nextCrossingHi = cutMeta[gpu.u32(3)];
  const fanout = cutMeta[gpu.u32(4)];

  let invalidExtent = false;
  if (active > stateCapacity) invalidExtent = true;
  if (fanout === gpu.u32(0) || fanout > gpu.u32(16)) invalidExtent = true;
  if (fanout !== gpu.u32(0) && (fanout & (fanout - gpu.u32(1))) !== gpu.u32(0)) invalidExtent = true;
  if (fanout !== gpu.u32(0) && active > candidateCapacity / fanout) invalidExtent = true;
  if (((fixedHi | nextCrossingHi) & gpu.u32(4294966272)) !== gpu.u32(0)) invalidExtent = true;
  const fixedWidth = packedPopcount42(fixedLo, fixedHi);
  if (fixedWidth > gpu.u32(4)) invalidExtent = true;
  if (fanout !== (gpu.u32(1) << fixedWidth)) invalidExtent = true;
  if (invalidExtent) {
    gpu.atomic.cas(globalStatus, gpu.u32(0), gpu.u32(0), gpu.u32(1));
    return;
  }

  const totalCandidates = active * fanout;
  if (candidate === gpu.u32(0) && lane === gpu.u32(0)) candidateCount[gpu.u32(0)] = totalCandidates;
  if (candidate >= totalCandidates) return;

  const state = candidate / fanout;
  const ordinal = candidate % fanout;
  const p0Lo = inputP0Lo[ordinal];
  const p0Hi = inputP0Hi[ordinal];
  if ((p0Lo & ~fixedLo) !== gpu.u32(0) || (p0Hi & ~fixedHi) !== gpu.u32(0)) {
    if (lane === gpu.u32(0)) generationStatus[candidate] = gpu.u32(4);
    return;
  }
  const p1Lo = fixedLo & ~p0Lo;
  const p1Hi = fixedHi & ~p0Hi;

  const winStart = stateWinOffsets[state];
  const winEnd = stateWinOffsets[state + gpu.u32(1)];
  const lossStart = stateLossOffsets[state];
  const lossEnd = stateLossOffsets[state + gpu.u32(1)];
  let invalidOffsets = false;
  if (winStart > winEnd || winEnd > winRecordCapacity) invalidOffsets = true;
  if (lossStart > lossEnd || lossEnd > lossRecordCapacity) invalidOffsets = true;
  if (invalidOffsets) {
    if (lane === gpu.u32(0)) generationStatus[candidate] = gpu.u32(2);
    return;
  }
  if (winEnd - winStart > frontierCapacity || lossEnd - lossStart > frontierCapacity) {
    if (lane === gpu.u32(0)) generationStatus[candidate] = gpu.u32(3);
    return;
  }

  if (lane === gpu.u32(0)) generationStatus[candidate] = gpu.u32(0);
  if (lane === gpu.u32(0)) {
    candidateXLo[candidate] = (stateXLo[state] & nextCrossingLo) | (p0Lo & nextCrossingLo);
    candidateXHi[candidate] = (stateXHi[state] & nextCrossingHi) | (p0Hi & nextCrossingHi);
  }

  const scratchBase = candidate * frontierCapacity;

  if (lane === gpu.u32(0)) scratchCounts[candidate] = gpu.u32(0);
  gpu.barrier.block();
  let i = winStart + lane;
  while (i < winEnd) {
    const low = stateWinLo[i];
    const high = stateWinHi[i];
    if ((low & p1Lo) === gpu.u32(0) && (high & p1Hi) === gpu.u32(0)) {
      const slot = gpu.atomic.add(scratchCounts, candidate, gpu.u32(1));
      scratchLo[scratchBase + slot] = low & ~fixedLo;
      scratchHi[scratchBase + slot] = high & ~fixedHi;
      scratchPopcount[scratchBase + slot] = packedPopcount42(scratchLo[scratchBase + slot], scratchHi[scratchBase + slot]);
    }
    i = i + gpu.blockDim.x();
  }
  gpu.barrier.block();
  const rawWinCount = scratchCounts[candidate];
  // Fixing only P1 cells filters minimal generators without changing survivors.
  if (preserveAntichains !== gpu.u32(0) && p0Lo === gpu.u32(0) && p0Hi === gpu.u32(0)) {
    let copy = lane;
    while (copy < rawWinCount) {
      outputWinLo[scratchBase + copy] = scratchLo[scratchBase + copy];
      outputWinHi[scratchBase + copy] = scratchHi[scratchBase + copy];
      copy = copy + gpu.blockDim.x();
    }
    if (lane === gpu.u32(0)) { outputWinCounts[candidate] = rawWinCount; outputWinStatus[candidate] = gpu.u32(0); }
  } else {
  packedNormalize42(
    scratchLo, scratchHi, scratchPopcount,
    outputWinLo, outputWinHi, outputWinCounts, outputWinStatus, checks,
    scratchBase, scratchBase + rawWinCount, scratchBase, candidate, frontierCapacity, gpu.u32(0)
  );
  }
  gpu.barrier.block();
  if (outputWinStatus[candidate] !== gpu.u32(0)) return;

  if (lane === gpu.u32(0)) scratchCounts[candidate] = gpu.u32(0);
  gpu.barrier.block();
  i = lossStart + lane;
  while (i < lossEnd) {
    const low = stateLossLo[i];
    const high = stateLossHi[i];
    if ((p0Lo & ~low) === gpu.u32(0) && (p0Hi & ~high) === gpu.u32(0)) {
      const slot = gpu.atomic.add(scratchCounts, candidate, gpu.u32(1));
      scratchLo[scratchBase + slot] = low & ~fixedLo;
      scratchHi[scratchBase + slot] = high & ~fixedHi;
      scratchPopcount[scratchBase + slot] = packedPopcount42(scratchLo[scratchBase + slot], scratchHi[scratchBase + slot]);
    }
    i = i + gpu.blockDim.x();
  }
  gpu.barrier.block();
  const rawLossCount = scratchCounts[candidate];
  // All retained maximal caps contain every fixed P0 cell. Clearing that common
  // subset is injective and preserves subset comparisons between survivors.
  if (preserveAntichains !== gpu.u32(0) && p1Lo === gpu.u32(0) && p1Hi === gpu.u32(0)) {
    let copy = lane;
    while (copy < rawLossCount) {
      outputLossLo[scratchBase + copy] = scratchLo[scratchBase + copy];
      outputLossHi[scratchBase + copy] = scratchHi[scratchBase + copy];
      copy = copy + gpu.blockDim.x();
    }
    if (lane === gpu.u32(0)) { outputLossCounts[candidate] = rawLossCount; outputLossStatus[candidate] = gpu.u32(0); }
  } else {
  packedNormalize42(
    scratchLo, scratchHi, scratchPopcount,
    outputLossLo, outputLossHi, outputLossCounts, outputLossStatus, checks,
    scratchBase, scratchBase + rawLossCount, scratchBase, candidate, frontierCapacity, gpu.u32(1)
  );
  }
}
`;

const ptr = (name) => Object.freeze({ name, type: 'ptr<u32>' });
const u32 = (name) => Object.freeze({ name, type: 'u32' });

export const oqsCofactor42DeviceProgram = Object.freeze({
  source: packedAntichain42CollectiveSource + source,
  compile: Object.freeze({ headerProfile: 'cuda-cccl' }),
  functions: Object.freeze([
    ...packedAntichain42CollectiveFunctions,
    Object.freeze({
      name: 'resetOqsCofactor42Control',
      kind: 'kernel',
      returns: 'void',
      parameters: Object.freeze([ptr('globalStatus'), ptr('candidateCount')]),
    }),
    Object.freeze({
      name: 'synthesizeOqsCofactor42Candidates',
      kind: 'kernel',
      returns: 'void',
      parameters: Object.freeze([
        ptr('stateXLo'), ptr('stateXHi'),
        ptr('stateWinLo'), ptr('stateWinHi'), ptr('stateWinOffsets'),
        ptr('stateLossLo'), ptr('stateLossHi'), ptr('stateLossOffsets'),
        ptr('activeStateCount'), ptr('cutMeta'), ptr('inputP0Lo'), ptr('inputP0Hi'),
        ptr('scratchLo'), ptr('scratchHi'), ptr('scratchPopcount'), ptr('scratchCounts'), ptr('checks'),
        ptr('candidateXLo'), ptr('candidateXHi'),
        ptr('outputWinLo'), ptr('outputWinHi'), ptr('outputWinCounts'), ptr('outputWinStatus'),
        ptr('outputLossLo'), ptr('outputLossHi'), ptr('outputLossCounts'), ptr('outputLossStatus'),
        ptr('generationStatus'), ptr('candidateCount'), ptr('globalStatus'),
        u32('stateCapacity'), u32('winRecordCapacity'), u32('lossRecordCapacity'), u32('candidateCapacity'), u32('frontierCapacity'), u32('preserveAntichains'),
      ]),
    }),
  ]),
});
