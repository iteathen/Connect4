#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
//
// Target-free projection audit.  The common middle dimension is never supplied
// as a literal constant.  It must emerge independently from the cell/image and
// line/dependency sides of the GF(2) winning-line incidence operator.

const FIELD = 2;
const K = 4;
const H = 6;
const W = 7;
const DIRECTIONS = [[1, 0], [0, 1], [1, 1], [1, -1]];

assert.equal(W, H + 1);
assert.equal(W, 2 * K - 1);
assert.equal(H, 2 * K - 2);

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
        if (valid) lines.push({ x, y, dx, dy, cells });
      }
    }
  }
  return lines;
}

function zeros(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function rankMod2(input) {
  const a = input.map((row) => row.map((x) => x & 1));
  const rows = a.length;
  const cols = a[0]?.length ?? 0;
  let rank = 0;
  for (let col = 0; col < cols && rank < rows; col += 1) {
    let pivot = rank;
    while (pivot < rows && a[pivot][col] === 0) pivot += 1;
    if (pivot === rows) continue;
    [a[rank], a[pivot]] = [a[pivot], a[rank]];
    for (let row = 0; row < rows; row += 1) {
      if (row !== rank && a[row][col]) {
        for (let c = col; c < cols; c += 1) a[row][c] ^= a[rank][c];
      }
    }
    rank += 1;
  }
  return rank;
}

function rrefMod2(input) {
  const a = input.map((row) => row.map((x) => x & 1));
  const rows = a.length;
  const cols = a[0]?.length ?? 0;
  const pivots = [];
  let rank = 0;
  for (let col = 0; col < cols && rank < rows; col += 1) {
    let pivot = rank;
    while (pivot < rows && a[pivot][col] === 0) pivot += 1;
    if (pivot === rows) continue;
    [a[rank], a[pivot]] = [a[pivot], a[rank]];
    for (let row = 0; row < rows; row += 1) {
      if (row !== rank && a[row][col]) {
        for (let c = col; c < cols; c += 1) a[row][c] ^= a[rank][c];
      }
    }
    pivots.push(col);
    rank += 1;
  }
  return { a, pivots };
}

function nullspaceBasisMod2(matrix) {
  const { a, pivots } = rrefMod2(matrix);
  const cols = a[0]?.length ?? 0;
  const pivotSet = new Set(pivots);
  const free = Array.from({ length: cols }, (_, i) => i).filter((i) => !pivotSet.has(i));
  return free.map((f) => {
    const v = Array(cols).fill(0);
    v[f] = 1;
    for (let row = 0; row < pivots.length; row += 1) {
      let bit = 0;
      for (const j of free) bit ^= a[row][j] & v[j];
      v[pivots[row]] = bit;
    }
    return v;
  });
}

function multiplyMod2(left, right) {
  const rows = left.length;
  const inner = left[0]?.length ?? 0;
  assert.equal(right.length, inner);
  const cols = right[0]?.length ?? 0;
  const out = zeros(rows, cols);
  for (let r = 0; r < rows; r += 1) {
    for (let k = 0; k < inner; k += 1) if (left[r][k]) {
      for (let c = 0; c < cols; c += 1) out[r][c] ^= right[k][c];
    }
  }
  return out;
}

function transpose(matrix) {
  if (matrix.length === 0) return [];
  return Array.from({ length: matrix[0].length }, (_, c) => matrix.map((row) => row[c]));
}

function parity(vector) {
  return vector.reduce((a, b) => a ^ (b & 1), 0);
}

const lines = generateLines(W, H, K);
const L = lines.length; // derived from geometry; no primitive line-count constant.
const cellCount = W * H;

// B : F_2^L -> F_2^(WH), line coefficients to cell-incidence parity.
const B = zeros(cellCount, L);
for (let line = 0; line < L; line += 1) {
  for (const cell of lines[line].cells) B[cell][line] = 1;
}

const rankB = rankMod2(B);
const lineKernelBasis = nullspaceBasisMod2(B);
const lineKernelDim = lineKernelBasis.length;
assert.equal(rankB + lineKernelDim, L);

// Candidate 1 from the proposed construction: column parity alone.
const columnParity = zeros(W, cellCount);
const rowParity = zeros(H, cellCount);
for (let y = 0; y < H; y += 1) {
  for (let x = 0; x < W; x += 1) {
    const cell = y * W + x;
    columnParity[x][cell] = 1;
    rowParity[y][cell] = 1;
  }
}
const columnOnImage = multiplyMod2(columnParity, B);
const rowOnImage = multiplyMod2(rowParity, B);
const columnProjectionRank = rankMod2(columnOnImage);
const rowProjectionRank = rankMod2(rowOnImage);

// Exact falsifier: neither axis alone sees all of the image quotient.
assert.equal(columnProjectionRank, W - K + 1);
assert.equal(rowProjectionRank, H - K + 1);
assert.notEqual(columnProjectionRank, W);

// Corrected natural cell-side projection: retain both board-axis parities.
const axisOnImage = [...columnOnImage, ...rowOnImage];
const axisProjectionRank = rankMod2(axisOnImage);
assert.equal(axisProjectionRank, (W - K + 1) + (H - K + 1));
assert.equal(axisProjectionRank, W); // standard 7x6 connect-4 specialization.
const cellCoreDim = rankB - axisProjectionRank;

// Candidate 2 from the proposed construction: horizontal-line parity per row.
// Compare it with the vertical-line parity per column map on ker(B).
const horizontalLineParity = zeros(H, L);
const verticalLineParity = zeros(W, L);
for (let i = 0; i < L; i += 1) {
  const line = lines[i];
  if (line.dx === 1 && line.dy === 0) horizontalLineParity[line.y][i] = 1;
  if (line.dx === 0 && line.dy === 1) verticalLineParity[line.x][i] = 1;
}
const kernelBasisColumns = transpose(lineKernelBasis); // L x dim ker(B)
const horizontalOnKernel = multiplyMod2(horizontalLineParity, kernelBasisColumns);
const verticalOnKernel = multiplyMod2(verticalLineParity, kernelBasisColumns);
const horizontalKernelProjectionRank = rankMod2(horizontalOnKernel);
const verticalKernelProjectionRank = rankMod2(verticalOnKernel);

// Exact falsifier/correction. Horizontal parity lands in the even-weight
// subspace of F_2^H (dimension H-1), while vertical parity lands in the
// even-weight subspace of F_2^W (dimension W-1 = H).
assert.equal(horizontalKernelProjectionRank, H - 1);
assert.notEqual(horizontalKernelProjectionRank, H);
assert.equal(verticalKernelProjectionRank, W - 1);
assert.equal(verticalKernelProjectionRank, H);
for (const basisImage of transpose(horizontalOnKernel)) assert.equal(parity(basisImage), 0);
for (const basisImage of transpose(verticalOnKernel)) assert.equal(parity(basisImage), 0);

const lineCoreDim = lineKernelDim - verticalKernelProjectionRank;

// The target-free dimension lock now emerges through two corrected, natural
// exact sequences.  No literal value for the common middle dimension appears
// anywhere in the premises.
assert.equal(cellCoreDim, lineCoreDim);
const Ydim = cellCoreDim;
assert.equal(L, 2 * Ydim + W + H);

// Consequences checked only after Y has emerged.
assert.equal(Ydim, W * K);
assert.equal(Ydim, (W * (W + 1)) / FIELD);

// Cofactor R is a graded residual operator at fixed Connect-K, not a map from
// the primitive Connect-K line universe to the primitive Connect-(K-1) game.
// An interior cofactor of a horizontal K-line is a concrete type counterexample.
const horizontal = lines.find((line) => line.dx === 1 && line.dy === 0 && line.x === 0 && line.y === 0);
assert(horizontal);
const residual = horizontal.cells.filter((_, index) => index !== 1);
const shorterPrimitiveLines = generateLines(W, H, K - 1).map((line) => line.cells.join(','));
assert.equal(shorterPrimitiveLines.includes(residual.join(',')), false);

console.log(`CANONICAL_PROJECTION_AUDIT=${JSON.stringify({
  kind: 'standard7x6-target-free-canonical-projection-audit-v1',
  primitives: { field: FIELD, connect: K, rows: H, columns: W },
  derived: { lineCount: L, rankB, lineKernelDim, commonMiddleDimension: Ydim },
  proposedProjectionFalsifiers: {
    columnParityOnImage: { rank: columnProjectionRank, requestedRank: W, surjective: false },
    horizontalLineParityOnKernel: { rank: horizontalKernelProjectionRank, requestedRank: H, surjective: false },
  },
  correctedExactSequences: {
    cellSide: {
      projection: 'row-plus-column parity restricted to im(B)',
      quotientRank: axisProjectionRank,
      coreDimension: cellCoreDim,
      quotientStructure: `length-${K} column-interval span plus length-${K} row-interval span`,
    },
    lineSide: {
      projection: 'vertical-line parity per column restricted to ker(B)',
      quotientRank: verticalKernelProjectionRank,
      quotientStructure: 'even-weight subspace of F_2^W',
      coreDimension: lineCoreDim,
    },
  },
  canonicalityBoundary: 'The two kernels are canonical typed subspaces and have equal derived dimension; no canonical intertwiner between them has yet been proved, so only abstract vector-space isomorphism is currently justified.',
  operatorBoundary: {
    P: 'Native CPC P acts on column phase; an intertwiner from the corrected cell quotient to CPC phase is still required.',
    R: 'Residual cofactor lowers local requirement degree at fixed K; it is not B_K -> B_(K-1). Use a graded residual complex rather than a different-game incidence square.',
    explicitRTypeCounterexample: residual,
  },
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
})}`);
