function positiveSafeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${label} must be a positive safe integer`);
  return value;
}

export function createConnectWinningLines({ columns, rows, connect }) {
  const width = positiveSafeInteger(columns, 'columns');
  const height = positiveSafeInteger(rows, 'rows');
  const target = positiveSafeInteger(connect, 'connect');
  const lines = [];
  const index = (column, row) => row * width + column;

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column <= width - target; column += 1) {
      const line = [];
      for (let step = 0; step < target; step += 1) line.push(index(column + step, row));
      lines.push(Object.freeze(line));
    }
  }
  for (let column = 0; column < width; column += 1) {
    for (let row = 0; row <= height - target; row += 1) {
      const line = [];
      for (let step = 0; step < target; step += 1) line.push(index(column, row + step));
      lines.push(Object.freeze(line));
    }
  }
  for (let column = 0; column <= width - target; column += 1) {
    for (let row = 0; row <= height - target; row += 1) {
      const line = [];
      for (let step = 0; step < target; step += 1) line.push(index(column + step, row + step));
      lines.push(Object.freeze(line));
    }
  }
  for (let column = 0; column <= width - target; column += 1) {
    for (let row = target - 1; row < height; row += 1) {
      const line = [];
      for (let step = 0; step < target; step += 1) line.push(index(column + step, row - step));
      lines.push(Object.freeze(line));
    }
  }

  return Object.freeze(lines);
}

export function createWinningLineMasksU32(geometry) {
  const cellCount = geometry.columns * geometry.rows;
  if (!Number.isSafeInteger(cellCount) || cellCount < 1 || cellCount > 32) {
    throw new RangeError('u32 winning-line masks require a geometry of 1..32 cells');
  }
  return Uint32Array.from(createConnectWinningLines(geometry), (line) => {
    let mask = 0;
    for (const cell of line) mask = (mask | (1 << cell)) >>> 0;
    return mask;
  });
}
