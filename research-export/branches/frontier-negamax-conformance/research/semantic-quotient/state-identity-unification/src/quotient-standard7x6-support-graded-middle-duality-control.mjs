#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
//
// Target-free with respect to the emergent middle dimension and standard line count.
// Primitives: GF(2), K=4, H=6, W=7. The control derives geometry, corrected
// cell/line cores, residual complex, and a gravity-aware perfect dual pairing.

const FIELD = 2;
const K = 4;
const H = 6;
const W = 7;
const DIRECTIONS = [[1, 0], [0, 1], [1, 1], [1, -1]];

function zeros(rows, cols) { return Array.from({ length: rows }, () => Array(cols).fill(0)); }
function transpose(matrix) { return matrix.length === 0 ? [] : Array.from({ length: matrix[0].length }, (_, c) => matrix.map((row) => row[c])); }
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
      if (row === rank || a[row][col] === 0) continue;
      for (let c = col; c < cols; c += 1) a[row][c] ^= a[rank][c];
    }
    pivots.push(col);
    rank += 1;
  }
  return { a, pivots };
}
function rankMod2(matrix) { return rrefMod2(matrix).pivots.length; }
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
function independentColumnIndices(matrix) {
  const cols = matrix[0]?.length ?? 0;
  const chosen = [];
  let currentRank = 0;
  for (let c = 0; c < cols; c += 1) {
    const candidate = matrix.map((row) => [...chosen.map((j) => row[j]), row[c]]);
    const nextRank = rankMod2(candidate);
    if (nextRank > currentRank) { chosen.push(c); currentRank = nextRank; }
  }
  return chosen;
}
function restrictedKernelBasis(map, domainBasisVectors) {
  if (map.length === 0) return domainBasisVectors.map((v) => v.slice());
  const basisColumns = transpose(domainBasisVectors);
  const coefficientKernel = nullspaceBasisMod2(multiplyMod2(map, basisColumns));
  return coefficientKernel.map((coeffs) => {
    const v = Array(basisColumns.length).fill(0);
    for (let j = 0; j < coeffs.length; j += 1) if (coeffs[j]) {
      for (let i = 0; i < v.length; i += 1) v[i] ^= basisColumns[i][j];
    }
    return v;
  });
}
function generateLines(width, height, connect) {
  const lines = [];
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) for (const [dx, dy] of DIRECTIONS) {
    const cells = [];
    let valid = true;
    for (let i = 0; i < connect; i += 1) {
      const cx = x + i * dx;
      const cy = y + i * dy;
      if (cx < 0 || cx >= width || cy < 0 || cy >= height) { valid = false; break; }
      cells.push({ x: cx, y: cy, cell: cy * width + cx });
    }
    if (valid) lines.push({ x, y, dx, dy, cells });
  }
  return lines;
}
function incidence(lines, cellCount) {
  const matrix = zeros(cellCount, lines.length);
  for (let j = 0; j < lines.length; j += 1) for (const { cell } of lines[j].cells) matrix[cell][j] = 1;
  return matrix;
}
function intervalBasis(length, connect) {
  const matrix = zeros(length, length - connect + 1);
  for (let start = 0; start <= length - connect; start += 1) for (let i = 0; i < connect; i += 1) matrix[start + i][start] = 1;
  return matrix;
}
function parity(vector) { return vector.reduce((acc, bit) => acc ^ (bit & 1), 0); }
function combinations(array, size, start = 0, prefix = [], out = []) {
  if (prefix.length === size) { out.push(prefix.slice()); return out; }
  for (let i = start; i <= array.length - (size - prefix.length); i += 1) {
    prefix.push(array[i]); combinations(array, size, i + 1, prefix, out); prefix.pop();
  }
  return out;
}
function subsetKey(cells) { return cells.slice().sort((a, b) => a - b).join(','); }

const lines = generateLines(W, H, K);
const L = lines.length;
const cellCount = W * H;
const B = incidence(lines, cellCount);
const rankB = rankMod2(B);
const kernelB = nullspaceBasisMod2(B);
assert.equal(rankB + kernelB.length, L);
const imageBasis = independentColumnIndices(B).map((j) => B.map((row) => row[j]));
assert.equal(imageBasis.length, rankB);

const columnParity = zeros(W, cellCount);
const rowParity = zeros(H, cellCount);
for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) {
  const cell = y * W + x;
  columnParity[x][cell] = 1;
  rowParity[y][cell] = 1;
}
const columnProjectionRank = rankMod2(multiplyMod2(columnParity, B));
const rowProjectionRank = rankMod2(multiplyMod2(rowParity, B));
assert.equal(columnProjectionRank, W - K + 1);
assert.equal(rowProjectionRank, H - K + 1);
assert.notEqual(columnProjectionRank, W);

const axisParity = [...columnParity, ...rowParity];
const axisProjectionRank = rankMod2(multiplyMod2(axisParity, B));
assert.equal(axisProjectionRank, (W - K + 1) + (H - K + 1));
assert.equal(axisProjectionRank, W);
const YcellBasis = restrictedKernelBasis(axisParity, imageBasis);
assert.equal(YcellBasis.length, rankB - axisProjectionRank);
for (const v of YcellBasis) assert.equal(parity(multiplyMod2(axisParity, transpose([v])).flat()), 0);

const horizontalLineParity = zeros(H, L);
const verticalLineParity = zeros(W, L);
for (let j = 0; j < L; j += 1) {
  const line = lines[j];
  if (line.dx === 1 && line.dy === 0) horizontalLineParity[line.y][j] = 1;
  if (line.dx === 0 && line.dy === 1) verticalLineParity[line.x][j] = 1;
}
const kernelColumns = transpose(kernelB);
const horizontalKernelProjectionRank = rankMod2(multiplyMod2(horizontalLineParity, kernelColumns));
const verticalKernelProjectionRank = rankMod2(multiplyMod2(verticalLineParity, kernelColumns));
assert.equal(horizontalKernelProjectionRank, H - 1);
assert.notEqual(horizontalKernelProjectionRank, H);
assert.equal(verticalKernelProjectionRank, H);
const YlineBasis = restrictedKernelBasis(verticalLineParity, kernelB);
assert.equal(YlineBasis.length, kernelB.length - verticalKernelProjectionRank);

assert.equal(YcellBasis.length, YlineBasis.length);
const Ydim = YcellBasis.length;
assert.equal(L, FIELD * Ydim + W + H);
assert.equal(Ydim, W * K);
assert.equal(Ydim, (W * (W + 1)) / FIELD);
assert.equal(rankMod2(transpose(YcellBasis)), Ydim);
assert.equal(rankMod2(transpose(YlineBasis)), Ydim);
for (const v of YlineBasis) {
  assert.deepEqual(multiplyMod2(B, transpose([v])).flat(), Array(cellCount).fill(0));
  assert.deepEqual(multiplyMod2(verticalLineParity, transpose([v])).flat(), Array(W).fill(0));
}

const lineIndexByCells = new Map(lines.map((line, i) => [subsetKey(line.cells.map(({ cell }) => cell)), i]));
function reflectedCell(cell, kind) {
  let x = cell % W;
  let y = Math.floor(cell / W);
  if (kind === 'horizontal') x = W - 1 - x;
  if (kind === 'vertical') y = H - 1 - y;
  return y * W + x;
}
function cellPermutation(kind) { return Array.from({ length: cellCount }, (_, cell) => reflectedCell(cell, kind)); }
function linePermutation(kind) {
  return lines.map((line) => {
    const target = lineIndexByCells.get(subsetKey(line.cells.map(({ cell }) => reflectedCell(cell, kind))));
    assert.notEqual(target, undefined);
    return target;
  });
}
function fixedSubspaceDimension(basisVectors, permutation) {
  const columns = transpose(basisVectors);
  const displacement = zeros(columns.length, columns[0].length);
  for (let i = 0; i < columns.length; i += 1) for (let j = 0; j < columns[0].length; j += 1) displacement[i][j] = columns[i][j] ^ columns[permutation[i]][j];
  return basisVectors.length - rankMod2(displacement);
}
const symmetry = {};
for (const kind of ['horizontal', 'vertical']) symmetry[kind] = {
  cellFixedDimension: fixedSubspaceDimension(YcellBasis, cellPermutation(kind)),
  lineFixedDimension: fixedSubspaceDimension(YlineBasis, linePermutation(kind)),
};
assert.equal(symmetry.horizontal.cellFixedDimension, symmetry.horizontal.lineFixedDimension);
assert.notEqual(symmetry.vertical.cellFixedDimension, symmetry.vertical.lineFixedDimension);

const residualLevels = {};
for (let degree = 1; degree <= K; degree += 1) {
  const unique = new Map();
  for (const line of lines) for (const subset of combinations(line.cells.map(({ cell }) => cell), degree)) unique.set(subsetKey(subset), subset.slice().sort((a, b) => a - b));
  residualLevels[degree] = [...unique.values()];
}
function residualBoundary(degree) {
  const lower = residualLevels[degree - 1];
  const upper = residualLevels[degree];
  const lowerIndex = new Map(lower.map((subset, i) => [subsetKey(subset), i]));
  const matrix = zeros(lower.length, upper.length);
  for (let j = 0; j < upper.length; j += 1) for (let drop = 0; drop < upper[j].length; drop += 1) {
    const face = upper[j].filter((_, i) => i !== drop);
    matrix[lowerIndex.get(subsetKey(face))][j] ^= 1;
  }
  return matrix;
}
function residualIncidence(degree) {
  const matrix = zeros(cellCount, residualLevels[degree].length);
  residualLevels[degree].forEach((subset, j) => subset.forEach((cell) => { matrix[cell][j] = 1; }));
  return matrix;
}
const d4 = residualBoundary(K);
const d3 = residualBoundary(K - 1);
const J3 = residualIncidence(K - 1);
assert.equal(rankMod2(d4), L);
assert.equal(rankMod2(multiplyMod2(d3, d4)), 0);
assert.deepEqual(multiplyMod2(J3, d4), B);
const naiveResidualRank = rankMod2(J3);
const naiveContractedWidthArity = W * (K - 1);
assert.notEqual(naiveResidualRank, naiveContractedWidthArity);

function supportClosureSize(fragment) {
  const maxRowByColumn = Array(W).fill(-1);
  for (const { x, y } of fragment) maxRowByColumn[x] = Math.max(maxRowByColumn[x], y);
  return maxRowByColumn.reduce((sum, maxRow) => sum + (maxRow >= 0 ? maxRow + 1 : 0), 0);
}
function componentCountAlongLine(line, fragment) {
  const active = new Set(fragment.map(({ cell }) => cell));
  let components = 0;
  let inComponent = false;
  for (const point of line.cells) {
    if (active.has(point.cell)) { if (!inComponent) components += 1; inComponent = true; }
    else inComponent = false;
  }
  return components;
}
function residualSupportBit(line, deletedCell) {
  const fragment = line.cells.filter(({ cell }) => cell !== deletedCell.cell);
  const maxRow = Math.max(...fragment.map(({ y }) => y));
  return (supportClosureSize(fragment) + componentCountAlongLine(line, fragment) + maxRow) & 1;
}
const residualSupportPairingOperator = zeros(cellCount, L);
for (let j = 0; j < L; j += 1) for (const cell of lines[j].cells) residualSupportPairingOperator[cell.cell][j] = residualSupportBit(lines[j], cell);
const YcellColumns = transpose(YcellBasis);
const YlineColumns = transpose(YlineBasis);
const perfectPairingMatrix = multiplyMod2(transpose(YcellColumns), multiplyMod2(residualSupportPairingOperator, YlineColumns));
const residualSupportPairingRank = rankMod2(perfectPairingMatrix);
assert.equal(residualSupportPairingRank, Ydim);
function pairingOperatorEquivariant(kind) {
  const cp = cellPermutation(kind);
  const lp = linePermutation(kind);
  for (let cell = 0; cell < cellCount; cell += 1) for (let line = 0; line < L; line += 1) {
    if (residualSupportPairingOperator[cp[cell]][line] !== residualSupportPairingOperator[cell][lp[line]]) return false;
  }
  return true;
}
assert.equal(pairingOperatorEquivariant('horizontal'), true);
assert.equal(pairingOperatorEquivariant('vertical'), false);

const cellGramRank = rankMod2(multiplyMod2(transpose(YcellColumns), YcellColumns));
const lineGramRank = rankMod2(multiplyMod2(transpose(YlineColumns), YlineColumns));
assert(cellGramRank < Ydim);
assert(lineGramRank < Ydim);

const columnIntervals = intervalBasis(W, K);
const columnIntervalRank = rankMod2(columnIntervals);
const phasePairsInsideColumnBoundary = [];
for (let a = 0; a < W; a += 1) {
  const same = Array(W).fill(0); same[a] ^= 1; same[a] ^= 1; assert.deepEqual(same, Array(W).fill(0));
  for (let b = a + 1; b < W; b += 1) {
    const delta = Array(W).fill(0); delta[a] = 1; delta[b] = 1;
    if (rankMod2(columnIntervals.map((row, i) => [...row, delta[i]])) === columnIntervalRank) phasePairsInsideColumnBoundary.push([a, b]);
  }
}
assert.deepEqual(phasePairsInsideColumnBoundary, Array.from({ length: W - K }, (_, a) => [a, a + K]));
assert(phasePairsInsideColumnBoundary.length < (W * (W - 1)) / FIELD);

function familyRecord(connect) {
  const width = 2 * connect - 1;
  const height = 2 * connect - 2;
  const familyLines = generateLines(width, height, connect);
  const familyB = incidence(familyLines, width * height);
  const imageDimension = rankMod2(familyB);
  const kernelDimension = familyLines.length - imageDimension;
  return {
    connect, width, height, lineCount: familyLines.length, imageDimension, kernelDimension,
    imageExcessOverWidth: imageDimension - width,
    kernelExcessOverHeight: kernelDimension - height,
    commonMiddle: imageDimension - width === kernelDimension - height,
  };
}
const family = [];
for (let connect = 2; connect <= 8; connect += 1) family.push(familyRecord(connect));
assert.deepEqual(family.filter(({ commonMiddle }) => commonMiddle).map(({ connect }) => connect), [K]);
assert.equal(family[0].commonMiddle, false);

console.log(`SUPPORT_GRADED_MIDDLE_DUALITY=${JSON.stringify({
  kind: 'standard7x6-support-graded-middle-duality-v1',
  proved: true,
  primitives: { field: FIELD, connect: K, rows: H, columns: W },
  derivedGeometry: { lineCount: L, rankB, kernelDimension: kernelB.length },
  projectionAudit: {
    proposedColumnOnlyImageRank: columnProjectionRank,
    proposedHorizontalRowLineRank: horizontalKernelProjectionRank,
    correctedAxisImageRank: axisProjectionRank,
    correctedVerticalLineKernelRank: verticalKernelProjectionRank,
    cellCoreDimension: YcellBasis.length,
    lineCoreDimension: YlineBasis.length,
  },
  symmetryAudit: {
    bareIncidence: symmetry,
    interpretation: 'Top-bottom fixed-space mismatch falsifies B-only equivariant identification, not Connect4 naturality because gravity breaks top-bottom symmetry. Left-right fixed dimensions agree.',
  },
  residualComplex: {
    levelDimensions: Object.fromEntries(Object.entries(residualLevels).map(([degree, entries]) => [degree, entries.length])),
    topBoundaryRank: rankMod2(d4), boundarySquaredRank: rankMod2(multiplyMod2(d3, d4)), J3BoundaryEqualsB: true,
    degree3IncidenceRank: naiveResidualRank, naiveWidthTimesLowerArity: naiveContractedWidthArity,
    naiveWidthTimesLowerArityFalsified: naiveResidualRank !== naiveContractedWidthArity,
  },
  supportGradedDuality: {
    pairing: 'g(line\\{cell}) = supportClosureSize + lineComponentCount + maxRow mod 2',
    pairingRank: residualSupportPairingRank, commonDimension: Ydim,
    horizontalReflectionEquivariant: true, verticalReflectionEquivariant: false,
    theorem: 'Y_line is naturally perfectly paired with Y_cell under this residual/support functional, hence Y_line ~= Y_cell^*.',
    directIsomorphismBoundary: 'A canonical T:Y_line->Y_cell is not yet proved. Ambient dot products are degenerate on both cores, so perfect duality does not supply a canonical self-duality for free.',
    ambientCellGramRank: cellGramRank, ambientLineGramRank: lineGramRank,
  },
  PCompatibility: {
    sameColumnStutter: 'identity/zero displacement',
    distinctColumnPairsWhoseDeltaLiesInColumnIntervalBoundary: phasePairsInsideColumnBoundary.map(([a, b]) => [a + 1, b + 1]),
    conclusion: 'P does not act solely inside the corrected cell boundary quotient for arbitrary distinct-column transport.',
  },
  nearbyFamily: family,
  proofBoundary: 'Finite GF(2) structural theorem only. No W/D/L labels are premises. Dimension equality is upgraded to a natural perfect dual pairing, not yet to a canonical direct self-identification.',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
})}`);
