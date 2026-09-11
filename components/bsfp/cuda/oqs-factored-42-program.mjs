import { oqsCofactor42DeviceProgram } from './oqs-cofactor-42-program.mjs';

const source = `
function resetOqsMapping(mappedCount, mappingGlobalStatus) {
  if (gpu.thread.globalX() === gpu.u32(0)) {
    mappedCount[gpu.u32(0)] = gpu.u32(0);
    mappingGlobalStatus[gpu.u32(0)] = gpu.u32(0);
  }
}

function mapOqsResidualOccurrences(
  occurrenceXLo, occurrenceXHi, occurrenceResidualId, activeOccurrenceCount,
  activeStateCount, cutMeta, inputP0Lo, inputP0Hi,
  globalStatus, candidateCount, generationStatus, outputWinStatus, outputLossStatus,
  mappedXLo, mappedXHi, mappedResidualSlots, mappedStatus, mappedCount, mappingGlobalStatus,
  occurrenceCapacity, mappedCapacity
) {
  const i = gpu.thread.globalX();
  const active = activeOccurrenceCount[gpu.u32(0)];
  const fanout = cutMeta[gpu.u32(4)];
  if (globalStatus[gpu.u32(0)] !== gpu.u32(0)) {
    if (i === gpu.u32(0)) mappingGlobalStatus[gpu.u32(0)] = gpu.u32(3);
    return;
  }
  if (active > occurrenceCapacity || fanout === gpu.u32(0) || fanout > gpu.u32(16)) {
    if (i === gpu.u32(0)) mappingGlobalStatus[gpu.u32(0)] = gpu.u32(1);
    return;
  }
  if (active > mappedCapacity / fanout) {
    if (i === gpu.u32(0)) mappingGlobalStatus[gpu.u32(0)] = gpu.u32(1);
    return;
  }
  const count = active * fanout;
  if (i === gpu.u32(0)) mappedCount[gpu.u32(0)] = count;
  if (i >= count) return;
  const occurrence = i / fanout;
  const ordinal = i % fanout;
  const pairId = occurrenceResidualId[occurrence];
  if (pairId >= activeStateCount[gpu.u32(0)]) { mappedStatus[i] = gpu.u32(2); return; }
  const slot = pairId * fanout + ordinal;
  if (slot >= candidateCount[gpu.u32(0)]) { mappedStatus[i] = gpu.u32(2); return; }
  if (generationStatus[slot] !== gpu.u32(0)) { mappedStatus[i] = gpu.u32(3); return; }
  if (outputWinStatus[slot] !== gpu.u32(0) || outputLossStatus[slot] !== gpu.u32(0)) {
    mappedStatus[i] = gpu.u32(3); return;
  }
  if ((occurrenceXHi[occurrence] & gpu.u32(4294966272)) !== gpu.u32(0)) {
    mappedStatus[i] = gpu.u32(4); return;
  }
  mappedXLo[i] = (occurrenceXLo[occurrence] & cutMeta[gpu.u32(2)]) | (inputP0Lo[ordinal] & cutMeta[gpu.u32(2)]);
  mappedXHi[i] = (occurrenceXHi[occurrence] & cutMeta[gpu.u32(3)]) | (inputP0Hi[ordinal] & cutMeta[gpu.u32(3)]);
  mappedResidualSlots[i] = slot;
  mappedStatus[i] = gpu.u32(0);
}
`;
const ptr = name => ({ name, type: 'ptr<u32>' });
const u32 = name => ({ name, type: 'u32' });
export const oqsFactored42DeviceProgram = Object.freeze({
  ...oqsCofactor42DeviceProgram,
  source: oqsCofactor42DeviceProgram.source + source,
  functions: Object.freeze([...oqsCofactor42DeviceProgram.functions,
    { name: 'resetOqsMapping', kind: 'kernel', returns: 'void', parameters: ['mappedCount', 'mappingGlobalStatus'].map(ptr) },
    { name: 'mapOqsResidualOccurrences', kind: 'kernel', returns: 'void', parameters: [
      ...['occurrenceXLo', 'occurrenceXHi', 'occurrenceResidualId', 'activeOccurrenceCount',
        'activeStateCount', 'cutMeta', 'inputP0Lo', 'inputP0Hi', 'globalStatus', 'candidateCount',
        'generationStatus', 'outputWinStatus', 'outputLossStatus', 'mappedXLo', 'mappedXHi',
        'mappedResidualSlots', 'mappedStatus', 'mappedCount', 'mappingGlobalStatus'].map(ptr),
      u32('occurrenceCapacity'), u32('mappedCapacity'),
    ] },
  ]),
});
