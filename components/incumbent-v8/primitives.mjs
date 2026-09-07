export function popcount32(value) {
  value >>>= 0;
  value -= (value >>> 1) & 0x55555555;
  value = (value & 0x33333333) + ((value >>> 2) & 0x33333333);
  return ((((value + (value >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24);
}

export function ctz32(value) {
  value >>>= 0;
  if (value === 0) return 32;
  return 31 - Math.clz32((value & -value) >>> 0);
}

export function columnHeight(geometry, occupiedLow, occupiedHigh, column) {
  return popcount32(occupiedLow & geometry.columnLow[column])
    + popcount32(occupiedHigh & geometry.columnHigh[column]);
}

export function landingIndex(geometry, occupiedLow, occupiedHigh, column) {
  const row = columnHeight(geometry, occupiedLow, occupiedHigh, column);
  return row >= geometry.rows ? -1 : row * geometry.columns + column;
}

export function addBitLow(low, index) {
  return (low | (1 << index)) >>> 0;
}

export function addBitHigh(high, index) {
  return (high | (1 << (index - 32))) >>> 0;
}
