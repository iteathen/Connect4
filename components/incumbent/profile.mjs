const profileCache = new Map();

function splitmix32(seed) {
  let x = seed >>> 0;
  return () => {
    x = (x + 0x9e3779b9) >>> 0;
    let z = x;
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad) >>> 0;
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97) >>> 0;
    return (z ^ (z >>> 15)) >>> 0;
  };
}

export function createProfile(columns = 7, rows = 6) {
  if (!Number.isInteger(columns) || !Number.isInteger(rows) || columns < 4 || rows < 4) {
    throw new RangeError('columns and rows must be integers >= 4');
  }
  const cacheKey = `${columns}x${rows}`;
  const cached = profileCache.get(cacheKey);
  if (cached) return cached;

  const cellCount = columns * rows;
  if (!Number.isSafeInteger(cellCount) || cellCount > 0xffffffff || columns > 0x7fffffff) {
    throw new RangeError('board dimensions exceed the generic Uint32/Int32 index domain');
  }
  const rawLines = [];
  const pushLine = (a, b, c, d) => { rawLines.push(a, b, c, d); };
  const toIndex = (column, row) => row * columns + column;

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column <= columns - 4; column++) {
      pushLine(toIndex(column, row), toIndex(column + 1, row), toIndex(column + 2, row), toIndex(column + 3, row));
    }
  }
  for (let column = 0; column < columns; column++) {
    for (let row = 0; row <= rows - 4; row++) {
      pushLine(toIndex(column, row), toIndex(column, row + 1), toIndex(column, row + 2), toIndex(column, row + 3));
    }
  }
  for (let column = 0; column <= columns - 4; column++) {
    for (let row = 0; row <= rows - 4; row++) {
      pushLine(toIndex(column, row), toIndex(column + 1, row + 1), toIndex(column + 2, row + 2), toIndex(column + 3, row + 3));
    }
  }
  for (let column = 0; column <= columns - 4; column++) {
    for (let row = 3; row < rows; row++) {
      pushLine(toIndex(column, row), toIndex(column + 1, row - 1), toIndex(column + 2, row - 2), toIndex(column + 3, row - 3));
    }
  }

  const lineCells = new Uint32Array(rawLines);
  const lineCount = lineCells.length >>> 2;
  const membershipCounts = new Uint32Array(cellCount);
  for (let i = 0; i < lineCells.length; i++) membershipCounts[lineCells[i]]++;
  const positionLineOffsets = new Uint32Array(cellCount + 1);
  for (let i = 0; i < cellCount; i++) positionLineOffsets[i + 1] = positionLineOffsets[i] + membershipCounts[i];
  const positionLineIndices = new Uint32Array(lineCells.length);
  const cursors = new Uint32Array(positionLineOffsets);
  for (let line = 0; line < lineCount; line++) {
    const base = line << 2;
    for (let j = 0; j < 4; j++) {
      const cell = lineCells[base + j];
      positionLineIndices[cursors[cell]++] = line;
    }
  }

  const moveOrder = new Uint32Array(columns);
  let orderIndex = 0;
  const center = Math.floor(columns / 2);
  moveOrder[orderIndex++] = center;
  for (let offset = 1; orderIndex < columns; offset++) {
    const left = center - offset;
    const right = center + offset;
    if (left >= 0) moveOrder[orderIndex++] = left;
    if (right < columns) moveOrder[orderIndex++] = right;
  }

  const zobristLo = new Uint32Array(cellCount * 2);
  const zobristHi = new Uint32Array(cellCount * 2);
  const randomLo = splitmix32((0x6d2b79f5 ^ Math.imul(columns, 0x9e37) ^ rows) >>> 0);
  const randomHi = splitmix32((0x85ebca6b ^ Math.imul(rows, 0xc2b2) ^ columns) >>> 0);
  for (let i = 0; i < zobristLo.length; i++) {
    let lo = randomLo();
    let hi = randomHi();
    if (lo === 0 && hi === 0) hi = 1;
    zobristLo[i] = lo;
    zobristHi[i] = hi;
  }

  const profile = Object.freeze({
    key: cacheKey,
    columns,
    rows,
    cellCount,
    lineCount,
    lineCells,
    positionLineOffsets,
    positionLineIndices,
    moveOrder,
    center,
    zobristLo,
    zobristHi,
  });
  profileCache.set(cacheKey, profile);
  return profile;
}
