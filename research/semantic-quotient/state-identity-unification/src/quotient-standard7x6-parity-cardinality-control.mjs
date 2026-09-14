import assert from 'node:assert/strict';

const W = 7;
const H = 6;
const K = 4;
const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
];

function generateLines(width, height, connect) {
  const lines = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      for (const [dx, dy] of DIRECTIONS) {
        const cells = [];
        let valid = true;
        for (let i = 0; i < connect; i += 1) {
          const cx = x + i * dx;
          const cy = y + i * dy;
          if (cx < 0 || cx >= width || cy < 0 || cy >= height) {
            valid = false;
            break;
          }
          cells.push(cy * width + cx);
        }
        if (valid) lines.push(cells);
      }
    }
  }
  return lines;
}

function incidence(lines, cellCount) {
  return lines.map((line) => {
    const row = Array(cellCount).fill(0);
    for (const cell of line) row[cell] = 1;
    return row;
  });
}

function rankModPrime(matrix, prime) {
  const a = matrix.map((row) => row.map((value) => ((value % prime) + prime) % prime));
  const rows = a.length;
  const cols = a[0]?.length ?? 0;
  let rank = 0;

  const inverse = (value) => {
    for (let candidate = 1; candidate < prime; candidate += 1) {
      if ((value * candidate) % prime === 1) return candidate;
    }
    throw new Error(`no inverse for ${value} mod ${prime}`);
  };

  for (let col = 0; col < cols && rank < rows; col += 1) {
    let pivot = rank;
    while (pivot < rows && a[pivot][col] === 0) pivot += 1;
    if (pivot === rows) continue;
    [a[rank], a[pivot]] = [a[pivot], a[rank]];

    const inv = inverse(a[rank][col]);
    for (let c = col; c < cols; c += 1) a[rank][c] = (a[rank][c] * inv) % prime;

    for (let r = 0; r < rows; r += 1) {
      if (r === rank || a[r][col] === 0) continue;
      const factor = a[r][col];
      for (let c = col; c < cols; c += 1) {
        a[r][c] = (a[r][c] - factor * a[rank][c]) % prime;
        if (a[r][c] < 0) a[r][c] += prime;
      }
    }
    rank += 1;
  }

  return rank;
}

function restrictColumns(matrix, columns) {
  return matrix.map((row) => columns.map((column) => row[column]));
}

function dotMod2(row, vector) {
  let value = 0;
  for (let i = 0; i < row.length; i += 1) value ^= row[i] & vector[i];
  return value;
}

const lines = generateLines(W, H, K);
const matrix = incidence(lines, W * H);
const intervalCount = (W * (W + 1)) / 2;
const slabCellCount = W * K;
const geometricFormula =
  H * (W - K + 1)
  + W * (H - K + 1)
  + 2 * (W - K + 1) * (H - K + 1);

assert.equal(W, 2 * K - 1);
assert.equal(H, 2 * K - 2);
assert.equal(intervalCount, 28);
assert.equal(slabCellCount, 28);
assert.equal(intervalCount, slabCellCount);
assert.equal(lines.length, 69);
assert.equal(geometricFormula, 69);
assert.equal(geometricFormula, W * H + W * K - 1);
assert.equal(geometricFormula, 2 * intervalCount + W + H);

const rank2 = rankModPrime(matrix, 2);
const rank3 = rankModPrime(matrix, 3);
const rowNullity2 = lines.length - rank2;
const cellNullity2 = W * H - rank2;

assert.equal(rank2, 35);
assert.equal(rank2, intervalCount + W);
assert.equal(rowNullity2, 34);
assert.equal(rowNullity2, intervalCount + H);
assert.equal(cellNullity2, W);
assert.equal(rank3, 38);
assert.notEqual(rank3, rank2);

// Every K-consecutive-row slab has 28 cells but only 27 independent
// winning-line incidence coordinates over GF(2).
const slabRanks = [];
for (let firstRow = 0; firstRow <= H - K; firstRow += 1) {
  const columns = [];
  for (let y = firstRow; y < firstRow + K; y += 1) {
    for (let x = 0; x < W; x += 1) columns.push(y * W + x);
  }
  const slabRank = rankModPrime(restrictColumns(matrix, columns), 2);
  slabRanks.push(slabRank);
  assert.equal(columns.length, 28);
  assert.equal(slabRank, 27);
}

// The unique visible parity dependency in each 4-row slab is represented
// globally by the two central board rows: every winning line intersects
// rows 2 and 3 (zero-based) in 0, 2, or 4 cells.
const centralPair = Array(W * H).fill(0);
for (const y of [2, 3]) {
  for (let x = 0; x < W; x += 1) centralPair[y * W + x] = 1;
}
for (const row of matrix) assert.equal(dotMod2(row, centralPair), 0);

// Exact algebra for the dimension family W=2K-1, H=2K-2.
// L = WH + WK - 1 identically; the alternative L = 2WK + W + H
// differs by (K-4)(2K-1), so the 2*28+7+6 form selects K=4.
for (let k = 2; k <= 32; k += 1) {
  const w = 2 * k - 1;
  const h = 2 * k - 2;
  const l =
    h * (w - k + 1)
    + w * (h - k + 1)
    + 2 * (w - k + 1) * (h - k + 1);
  assert.equal(l, w * h + w * k - 1);
  assert.equal(l - (2 * w * k + w + h), (k - 4) * (2 * k - 1));
}

const result = {
  board: { W, H, K, cells: W * H },
  derived: {
    intervals: intervalCount,
    kRowSlabCells: slabCellCount,
    winningLines: lines.length,
    identity: '69 = 42 + 28 - 1 = 2*28 + 7 + 6',
  },
  gf2: {
    lineCellRank: rank2,
    lineDependencyNullity: rowNullity2,
    cellKernelNullity: cellNullity2,
    decomposition: '69 = (28 + 7) + (28 + 6)',
    kRowSlabRanks: slabRanks,
    centralPairRowsZeroBased: [2, 3],
  },
  comparison: { rankMod3: rank3 },
};

console.log(JSON.stringify(result, null, 2));
