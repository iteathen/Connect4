export const BSFP_INVALID_ITEM_U32 = 0xffff_ffff;

function positiveSafeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${label} must be a positive safe integer`);
  return value;
}

export function createBsfpSupportLatticeProfile({ columns, rows, connect }) {
  const width = positiveSafeInteger(columns, 'columns');
  const height = positiveSafeInteger(rows, 'rows');
  const target = positiveSafeInteger(connect, 'connect');
  if (target > Math.max(width, height)) throw new RangeError('connect exceeds both board dimensions');

  const radix = height + 1;
  const itemCapacity = radix ** width;
  if (!Number.isSafeInteger(itemCapacity) || itemCapacity >= BSFP_INVALID_ITEM_U32) {
    throw new RangeError('support lattice does not fit the first u32 item-index profile');
  }

  const weights = new Uint32Array(width);
  let weight = 1;
  for (let column = 0; column < width; column += 1) {
    weights[column] = weight;
    weight *= radix;
  }

  function assertItemIndex(index) {
    if (!Number.isInteger(index) || index < 0 || index >= itemCapacity) {
      throw new RangeError('support-lattice item index is out of range');
    }
  }

  function encodeHeights(heights) {
    if (!Array.isArray(heights) && !(heights instanceof Uint8Array) && !(heights instanceof Uint32Array)) {
      throw new TypeError('heights must be an array-like integer vector');
    }
    if (heights.length !== width) throw new RangeError('heights length must equal columns');
    let index = 0;
    for (let column = 0; column < width; column += 1) {
      const value = heights[column];
      if (!Number.isInteger(value) || value < 0 || value > height) throw new RangeError('column height out of range');
      index += value * weights[column];
    }
    return index;
  }

  function decodeHeights(index) {
    assertItemIndex(index);
    const heights = new Uint8Array(width);
    let remaining = index;
    for (let column = width - 1; column >= 0; column -= 1) {
      const divisor = weights[column];
      heights[column] = Math.floor(remaining / divisor) % radix;
    }
    return heights;
  }

  function rankOf(index) {
    const heights = decodeHeights(index);
    let rank = 0;
    for (const value of heights) rank += value;
    return rank;
  }

  function derivePredecessorIndex(sourceIndex, emissionLane) {
    assertItemIndex(sourceIndex);
    if (!Number.isInteger(emissionLane) || emissionLane < 0 || emissionLane >= width) return BSFP_INVALID_ITEM_U32;
    const divisor = weights[emissionLane];
    const columnHeight = Math.floor(sourceIndex / divisor) % radix;
    if (columnHeight === 0) return BSFP_INVALID_ITEM_U32;
    return sourceIndex - divisor;
  }

  const ranks = new Uint32Array(itemCapacity);
  for (let index = 0; index < itemCapacity; index += 1) ranks[index] = rankOf(index);

  return Object.freeze({
    kind: 'connect4-bsfp-support-lattice-profile',
    columns: width,
    rows: height,
    connect: target,
    radix,
    itemCapacity,
    maxRank: width * height,
    maxEmissionsPerItem: width,
    invalidItemIndex: BSFP_INVALID_ITEM_U32,
    weights,
    ranks,
    encodeHeights,
    decodeHeights,
    rankOf,
    derivePredecessorIndex,
  });
}

export const BSFP_4X3_CONNECT3_SUPPORT = createBsfpSupportLatticeProfile({
  columns: 4,
  rows: 3,
  connect: 3,
});
