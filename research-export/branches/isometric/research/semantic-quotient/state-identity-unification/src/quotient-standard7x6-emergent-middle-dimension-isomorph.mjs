#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
//
// Deliberately target-free: the middle dimension is never supplied as a literal
// or primitive. The only scalar structural inputs are turn modulus, connect
// arity, board height, and board width.

const TURN_MODULUS = 2;
const K = 4;
const H = 6;
const W = 7;
const DIRECTIONS = [[1, 0], [0, 1], [1, 1], [1, -1]];

function generateWinningLines(width, height, connect) {
  const lines = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      for (const [dx, dy] of DIRECTIONS) {
        const endX = x + (connect - 1) * dx;
        const endY = y + (connect - 1) * dy;
        if (endX < 0 || endX >= width || endY < 0 || endY >= height) continue;
        lines.push(Array.from({ length: connect }, (_, i) => (y + i * dy) * width + x + i * dx));
      }
    }
  }
  return lines;
}

function incidence(lines, cellCount) {
  return lines.map((line) => {
    const row = new Uint8Array(cellCount);
    for (const cell of line) row[cell] = 1;
    return row;
  });
}

function rankGF2(matrix) {
  const a = matrix.map((row) => Uint8Array.from(row));
  const rows = a.length;
  const cols = a[0]?.length ?? 0;
  let rank = 0;
  for (let col = 0; col < cols && rank < rows; col += 1) {
    let pivot = rank;
    while (pivot < rows && a[pivot][col] === 0) pivot += 1;
    if (pivot === rows) continue;
    [a[rank], a[pivot]] = [a[pivot], a[rank]];
    for (let r = 0; r < rows; r += 1) {
      if (r === rank || a[r][col] === 0) continue;
      for (let c = col; c < cols; c += 1) a[r][c] ^= a[rank][c];
    }
    rank += 1;
  }
  return rank;
}

// Geometry is derived from W,H,K rather than supplied as a line-count axiom.
const lines = generateWinningLines(W, H, K);
const L = lines.length;
const geometricCount =
  H * (W - K + 1)
  + W * (H - K + 1)
  + TURN_MODULUS * (W - K + 1) * (H - K + 1);
assert.equal(L, geometricCount);
assert(lines.every((line) => line.length === K));

// B is the winning-line -> cell incidence/boundary operator over GF(2).
// Its matrix is represented with winning lines as rows; transpose has the same
// rank, so rank(B) is exact.
const B = incidence(lines, W * H);
const imageDimension = rankGF2(B);
const kernelDimension = L - imageDimension;

// The target is defined only as the common excess induced by B. No target
// cardinality is present in the signature.
const imageExcess = imageDimension - W;
const kernelExcess = kernelDimension - H;
assert.equal(imageExcess, kernelExcess);
const emergentMiddle = imageExcess;
assert(Number.isInteger(emergentMiddle) && emergentMiddle >= 0);

// Rank-nullity makes the middle value unique:
//   L = (W+y) + (H+y) = TURN_MODULUS*y + W + H.
const numerator = L - W - H;
assert.equal(numerator % TURN_MODULUS, 0);
const uniqueRankNullityWitness = numerator / TURN_MODULUS;
assert.equal(emergentMiddle, uniqueRankNullityWitness);
assert.equal(L, TURN_MODULUS * emergentMiddle + W + H);

// Independent structural isomorphs discovered only after y has emerged.
const contiguousColumnIntervals = (W * (W + 1)) / TURN_MODULUS;
const kRowSlabCells = W * K;
assert.equal(emergentMiddle, contiguousColumnIntervals);
assert.equal(emergentMiddle, kRowSlabCells);

// Mod-2 collapse: the doubled middle sector disappears and only the board-axis
// residue remains. This is a cardinality grading, not a W/D/L oracle.
assert.equal(L % TURN_MODULUS, (W + H) % TURN_MODULUS);

// K is also the native residual/cofactor degree: a winning-line requirement has
// K cells and an incident own-cell cofactor drops the degree by exactly one.
for (const line of lines) {
  let residual = line.slice();
  for (const cell of line) {
    const beforeDegree = residual.length;
    residual = residual.filter((candidate) => candidate !== cell);
    assert.equal(residual.length, beforeDegree - 1);
  }
  assert.equal(residual.length, 0);
}

console.log(`EMERGENT_MIDDLE_DIMENSION_ISOMORPH=${JSON.stringify({
  kind: 'standard7x6-emergent-middle-dimension-v1',
  primitives: {
    turnModulus: TURN_MODULUS,
    connectArity: K,
    boardHeight: H,
    boardWidth: W,
  },
  derivedGeometry: {
    winningLineDimension: L,
    cellDimension: W * H,
  },
  incidenceOperator: {
    field: 'GF(2)',
    imageDimension,
    kernelDimension,
    imageExcessOverWidth: imageExcess,
    kernelExcessOverHeight: kernelExcess,
    shortExactDimensionLaw: 'dim(lineSpace)=dim(kernel)+dim(image)',
  },
  theorem: {
    emergentMiddle,
    uniqueEquation: 'L = 2*y + W + H',
    independentlyRecoveredAs: {
      contiguousColumnIntervals,
      kRowSlabCells,
    },
    mod2Collapse: 'L mod 2 = (W + H) mod 2',
  },
  proofBoundary: 'Exact finite structural theorem only; no solved W/D/L premise and no claim that dimension equality alone is a strategy theorem.',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
})}`);
