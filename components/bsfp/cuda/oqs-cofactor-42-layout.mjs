/** Finite qualification envelopes; not inferred 7x6 production capacities. */
export function oqsCofactor42Shape({ columns = 4, rows = 4, connect = 4, blockSize = 128 } = {}) {
  const small = (columns === 4 && rows === 3 && connect === 3) || (columns === 4 && rows === 4 && connect === 4);
  const wide = columns === 5 && rows === 5 && connect === 4;
  if (!small && !wide) throw new RangeError('unsupported OQS cofactor qualification geometry');
  if (![64, 128, 256].includes(blockSize)) throw new RangeError('unsupported OQS block size');
  const stateCapacity = wide ? 16384 : 1024;
  const candidateCapacity = wide ? 16384 : 2048;
  const frontierCapacity = wide ? 512 : 64;
  const recordCapacity = wide ? 32768 : 2048;
  const inputSizes = {
    stateXLo: stateCapacity, stateXHi: stateCapacity,
    stateWinLo: recordCapacity, stateWinHi: recordCapacity, stateWinOffsets: stateCapacity + 1,
    stateLossLo: recordCapacity, stateLossHi: recordCapacity, stateLossOffsets: stateCapacity + 1,
    activeStateCount: 1, cutMeta: 5, inputP0Lo: 16, inputP0Hi: 16,
  };
  const outputSizes = {
    scratchLo: candidateCapacity * frontierCapacity, scratchHi: candidateCapacity * frontierCapacity,
    scratchPopcount: candidateCapacity * frontierCapacity, checks: candidateCapacity * frontierCapacity,
    scratchCounts: candidateCapacity, candidateXLo: candidateCapacity, candidateXHi: candidateCapacity,
    outputWinLo: candidateCapacity * frontierCapacity, outputWinHi: candidateCapacity * frontierCapacity,
    outputLossLo: candidateCapacity * frontierCapacity, outputLossHi: candidateCapacity * frontierCapacity,
    outputWinCounts: candidateCapacity, outputWinStatus: candidateCapacity,
    outputLossCounts: candidateCapacity, outputLossStatus: candidateCapacity,
    generationStatus: candidateCapacity, candidateCount: 1, globalStatus: 1,
  };
  const deviceBytes = 4 * Object.values({ ...inputSizes, ...outputSizes }).reduce((a, b) => a + b, 0);
  return Object.freeze({ stateCapacity, candidateCapacity, frontierCapacity, recordCapacity, blockSize,
    inputSizes, outputSizes, deviceBytes, upperBoundBytes: deviceBytes + 256 * 1024 ** 2 });
}
