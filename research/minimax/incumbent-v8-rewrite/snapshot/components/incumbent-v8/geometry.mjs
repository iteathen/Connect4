const MAX_FAST_CELLS = 64;

function setLaneBit(low, high, index) {
  if (index < 32) return [(low | (1 << index)) >>> 0, high >>> 0];
  return [low >>> 0, (high | (1 << (index - 32))) >>> 0];
}

export function compileConnect4Geometry(columns, rows) {
  if (!Number.isInteger(columns) || columns < 4) throw new RangeError("columns must be an integer >= 4");
  if (!Number.isInteger(rows) || rows < 4) throw new RangeError("rows must be an integer >= 4");
  const cellCount = columns * rows;
  if (cellCount > MAX_FAST_CELLS) {
    throw new RangeError(`incumbent-v8 u32x2 profile supports at most ${MAX_FAST_CELLS} cells`);
  }

  const lineLow = [];
  const lineHigh = [];
  const cellLines = Array.from({ length: cellCount }, () => []);

  function addLine(a, b, c, d) {
    const lineIndex = lineLow.length;
    let low = 0;
    let high = 0;
    const cells = [a, b, c, d];
    for (let i = 0; i < 4; i += 1) {
      const index = cells[i];
      [low, high] = setLaneBit(low, high, index);
      cellLines[index].push(lineIndex);
    }
    lineLow.push(low >>> 0);
    lineHigh.push(high >>> 0);
  }

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column <= columns - 4; column += 1) {
      const base = row * columns + column;
      addLine(base, base + 1, base + 2, base + 3);
    }
  }
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row <= rows - 4; row += 1) {
      const base = row * columns + column;
      addLine(base, base + columns, base + 2 * columns, base + 3 * columns);
    }
  }
  for (let column = 0; column <= columns - 4; column += 1) {
    for (let row = 0; row <= rows - 4; row += 1) {
      const base = row * columns + column;
      addLine(base, base + columns + 1, base + 2 * (columns + 1), base + 3 * (columns + 1));
    }
  }
  for (let column = 0; column <= columns - 4; column += 1) {
    for (let row = 3; row < rows; row += 1) {
      const base = row * columns + column;
      addLine(base, base - columns + 1, base - 2 * columns + 2, base - 3 * columns + 3);
    }
  }

  const cellLineOffsets = new Uint16Array(cellCount + 1);
  let incidenceCount = 0;
  for (let index = 0; index < cellCount; index += 1) {
    cellLineOffsets[index] = incidenceCount;
    incidenceCount += cellLines[index].length;
  }
  cellLineOffsets[cellCount] = incidenceCount;
  const cellLineIndices = new Uint16Array(incidenceCount);
  let incidenceIndex = 0;
  for (let index = 0; index < cellCount; index += 1) {
    const lines = cellLines[index];
    for (let i = 0; i < lines.length; i += 1) cellLineIndices[incidenceIndex++] = lines[i];
  }

  const columnLow = new Uint32Array(columns);
  const columnHigh = new Uint32Array(columns);
  const topLow = new Uint32Array(columns);
  const topHigh = new Uint32Array(columns);
  for (let column = 0; column < columns; column += 1) {
    let low = 0;
    let high = 0;
    for (let row = 0; row < rows; row += 1) {
      const index = row * columns + column;
      [low, high] = setLaneBit(low, high, index);
      if (row === rows - 1) {
        if (index < 32) topLow[column] = (1 << index) >>> 0;
        else topHigh[column] = (1 << (index - 32)) >>> 0;
      }
    }
    columnLow[column] = low;
    columnHigh[column] = high;
  }

  const moveOrder = new Int8Array(columns);
  const center = Math.floor(columns / 2);
  let orderIndex = 0;
  moveOrder[orderIndex++] = center;
  for (let offset = 1; orderIndex < columns; offset += 1) {
    const left = center - offset;
    const right = center + offset;
    if (left >= 0) moveOrder[orderIndex++] = left;
    if (right < columns) moveOrder[orderIndex++] = right;
  }

  return Object.freeze({
    columns,
    rows,
    cellCount,
    lineCount: lineLow.length,
    lineLow: Uint32Array.from(lineLow),
    lineHigh: Uint32Array.from(lineHigh),
    cellLineOffsets,
    cellLineIndices,
    columnLow,
    columnHigh,
    topLow,
    topHigh,
    moveOrder,
  });
}
