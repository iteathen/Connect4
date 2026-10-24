// IsoMax 0.3.0-alpha.0: original-K4 incidence geometry.
// No fixed board dimensions, no external dependencies, no generated native code.
export function prepareGeometry({columns = 7, rows = 6} = {}) {
  if (!Number.isInteger(columns) || !Number.isInteger(rows) ||
      columns < 1 || rows < 1 || columns > 10 || rows > 10) {
    throw new RangeError('columns and rows must be integers in [1, 10]');
  }
  const cells = columns * rows;
  const list = [];
  // Directions are derived from dimensions, never encoded as static board offsets.
  for (let r = 0; r < rows; r++) for (let c = 0; c < columns; c++) {
    for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      const ex = c + 3 * dc, ey = r + 3 * dr;
      if (ex < 0 || ex >= columns || ey < 0 || ey >= rows) continue;
      for (let j = 0; j < 4; j++) list.push((c + dc * j) * rows + r + dr * j);
    }
  }
  const lineCount = list.length / 4;
  const lineWords = Math.max(1, Math.ceil(lineCount / 32));
  const siteLines = Uint16Array.from(list);
  const incidence = new Uint32Array(cells * lineWords);
  for (let l = 0; l < lineCount; l++) {
    const word = l >>> 5, bit = 1 << (l & 31);
    for (let j = 0; j < 4; j++) incidence[siteLines[l * 4 + j] * lineWords + word] |= bit;
  }
  const fullLines = new Uint32Array(lineWords);
  fullLines.fill(0xffffffff);
  const rem = lineCount & 31;
  if (rem) fullLines[lineWords - 1] = (0xffffffff >>> (32 - rem)) >>> 0;
  if (!lineCount) fullLines.fill(0);
  const order = Array.from({length: columns}, (_, i) => i);
  order.sort((a, b) => Math.abs(2*a - (columns-1)) - Math.abs(2*b - (columns-1)) || a - b);
  // Geometry is immutable by contract; inner typed arrays are not mutated by solver.
  return Object.freeze({columns, rows, cells, connectLength: 4, lineCount, lineWords, siteLines, incidence,
    fullLines, order: Uint8Array.from(order), heightWords: columns <= 8 ? 1 : 2});
}
