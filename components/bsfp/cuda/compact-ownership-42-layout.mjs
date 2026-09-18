import { createBsfpSupportLatticeProfile } from '../support-lattice.mjs';
import { createConnectWinningLines } from '../geometry.mjs';

export function compactOwnership42Shape({ columns, rows, connect, frontierCapacity = 1024, candidateTileSize = 2048, shardCapacity = 64, blockSize = 128, qualificationOracle = true }) {
  if (typeof qualificationOracle !== 'boolean') throw new TypeError('qualificationOracle must be boolean');
  for (const [key, value] of Object.entries({ columns, rows, connect, frontierCapacity, candidateTileSize, shardCapacity, blockSize })) {
    if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${key} must be a positive safe integer`);
  }
  if (columns * rows > 42 || blockSize > 1024 || frontierCapacity < connect) throw new RangeError('compact42 profile bounds exceeded');
  if (frontierCapacity ** 2 > 0xffff_ffff) throw new RangeError('pair product exceeds u32');
  if ((rows + 1) ** columns > 1_048_576) throw new RangeError('static compact profile exceeds its one-million-support envelope');
  const support = createBsfpSupportLatticeProfile({ columns, rows, connect });
  const rankCounts = new Uint32Array(support.maxRank + 1);
  for (const rank of support.ranks) rankCounts[rank]++;
  const rankCapacity = Math.max(...rankCounts);
  const shards = Math.min(shardCapacity, rankCapacity);
  const rankElements = 4 * rankCapacity * frontierCapacity;
  const scratchElements = shards * (candidateTileSize + frontierCapacity);
  const workElements = shards * 6 * frontierCapacity;
  const lineCount = createConnectWinningLines({ columns, rows, connect }).length;
  const f = BigInt(frontierCapacity);
  const total = f * f > 2n * f ? f * f : 2n * f;
  const tile = BigInt(candidateTileSize);
  const tilesPerCombine = (total + tile - 1n) / tile;
  const combinedCandidates = total + tilesPerCombine * f;
  const combines = BigInt(columns) * (2n * BigInt(lineCount) + 2n);
  const perSupportChecks = combines * combinedCandidates * f + 2n * BigInt(columns) * f * f;
  const normalizationCalls = combines * tilesPerCombine + 2n * BigInt(columns);
  const maxNormalizationInput = tile + f;
  const perSupportPriorScans = normalizationCalls * maxNormalizationInput * maxNormalizationInput;
  for (const [name, value] of [['subset', perSupportChecks], ['prior-scan', perSupportPriorScans]]) {
    if (value > 0xffff_ffff_ffff_ffffn) throw new RangeError(`compact42 per-support ${name} counter exceeds u64`);
  }
  const structuralBytes = 4 * (4 * support.itemCapacity + 4 * support.itemCapacity * columns + 1)
    + 8 * support.itemCapacity * columns * lineCount;
  // Per-support observer metrics are 12 u64 lanes plus four u32 report lanes = 112 bytes/support.
  const payloadUpperBoundBytes = 8 * rankElements + 16 * rankCapacity + 16 * scratchElements
    + 8 * workElements + 8 * shards + 4 + 112 * support.itemCapacity + structuralBytes;
  const oracleUpperBoundBytes = 16 * support.itemCapacity * frontierCapacity + 4 * (2 * support.itemCapacity + 1);
  for (const count of [rankElements, scratchElements, workElements, support.itemCapacity * columns * lineCount]) {
    if (count > 0xffff_ffff) throw new RangeError('compact42 layout exceeds u32 indexing');
  }
  return Object.freeze({ columns, rows, connect, frontierCapacity, candidateTileSize, shardCapacity: shards, blockSize,
    support, rankCounts, rankCapacity, rankElements, scratchElements, workElements,
    payloadUpperBoundBytes, oracleUpperBoundBytes, upperBoundBytes: payloadUpperBoundBytes + (qualificationOracle ? oracleUpperBoundBytes : 0) + 256 * 1024 ** 2 });
}

export function buildCompactOwnership42Layout(shape) {
  const { support, columns, rows, connect } = shape;
  const n = support.itemCapacity;
  const items = new Uint32Array(n);
  const slots = new Uint32Array(n);
  const rankOffsets = new Uint32Array(support.maxRank + 1);
  for (let rank = 1; rank <= support.maxRank; rank++) rankOffsets[rank] = rankOffsets[rank - 1] + shape.rankCounts[rank - 1];
  const used = new Uint32Array(rankOffsets.length);
  const children = new Uint32Array(n * columns).fill(0xffff_ffff);
  const landingLo = new Uint32Array(n * columns);
  const landingHi = new Uint32Array(n * columns);
  const universeLo = new Uint32Array(n);
  const universeHi = new Uint32Array(n);
  const terminalOffsets = new Uint32Array(n * columns + 1);
  const terminalMasks = [];
  const lines = createConnectWinningLines({ columns, rows, connect }).map((line) => line.reduce((mask, cell) => mask | (1n << BigInt(cell)), 0n));
  const split = (mask) => [Number(mask & 0xffff_ffffn), Number(mask >> 32n)];
  for (let item = 0; item < n; item++) {
    const rank = support.ranks[item];
    slots[item] = used[rank]++;
    items[rankOffsets[rank] + slots[item]] = item;
    const heights = support.decodeHeights(item);
    let universe = 0n;
    for (let column = 0; column < columns; column++) for (let row = 0; row < heights[column]; row++) universe |= 1n << BigInt(row * columns + column);
    [universeLo[item], universeHi[item]] = split(universe);
    for (let column = 0; column < columns; column++) {
      const edge = item * columns + column;
      terminalOffsets[edge] = terminalMasks.length;
      if (heights[column] === rows) continue;
      children[edge] = item + support.weights[column];
      if (support.ranks[children[edge]] !== rank + 1) throw new Error('invalid static rank dependency');
      const bit = 1n << BigInt(heights[column] * columns + column);
      [landingLo[edge], landingHi[edge]] = split(bit);
      for (const line of lines) if ((line & bit) !== 0n && ((line & ~bit) & ~universe) === 0n) terminalMasks.push(line & ~bit);
    }
  }
  terminalOffsets[n * columns] = terminalMasks.length;
  const terminalLo = Uint32Array.from(terminalMasks, (mask) => split(mask)[0]);
  const terminalHi = Uint32Array.from(terminalMasks, (mask) => split(mask)[1]);
  return { rankOffsets, inputs: { items, slots, children, landingLo, landingHi, universeLo, universeHi, terminalOffsets, terminalLo, terminalHi } };
}
