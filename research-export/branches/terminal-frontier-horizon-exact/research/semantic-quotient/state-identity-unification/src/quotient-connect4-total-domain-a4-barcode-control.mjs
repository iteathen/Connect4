#!/usr/bin/env node
import assert from 'node:assert/strict';

// VALIDATION ONLY.
// The all-positive-W,H theorem is proved symbolically in
// docs/research/2026-09-14-a4-quiver-structural-decomposition.md.
// This finite runner may falsify an implementation of that theorem; it is not
// evidence for the unbounded claim.

const K = 4;
const DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];

function rankMasks(rows) {
  const basis = new Map();
  let rank = 0;
  for (const input of rows) {
    let v = input;
    while (v) {
      const pivot = v.toString(2).length - 1;
      const b = basis.get(pivot);
      if (b === undefined) {
        basis.set(pivot, v);
        rank++;
        break;
      }
      v ^= b;
    }
  }
  return rank;
}

function generateLines(W, H) {
  const lines = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      for (const [dx, dy] of DIRS) {
        const cells = [];
        let ok = true;
        for (let i = 0; i < K; i++) {
          const xx = x + i * dx;
          const yy = y + i * dy;
          if (xx < 0 || xx >= W || yy < 0 || yy >= H) {
            ok = false;
            break;
          }
          cells.push({ x: xx, y: yy, id: yy * W + xx });
        }
        if (ok) lines.push({ x, y, dx, dy, cells });
      }
    }
  }
  return lines;
}

function generatedBarcode(W, H) {
  const lines = generateLines(W, H);
  const L = lines.length;
  const cellRows = Array(W * H).fill(0n);
  const phaseRows = Array(W).fill(0n);
  const axisRows = Array(W + H).fill(0n);

  for (let j = 0; j < L; j++) {
    const bit = 1n << BigInt(j);
    const line = lines[j];
    const columnParity = new Uint8Array(W);
    const rowParity = new Uint8Array(H);

    for (const cell of line.cells) {
      cellRows[cell.id] ^= bit;
      columnParity[cell.x] ^= 1;
      rowParity[cell.y] ^= 1;
    }

    for (let x = 0; x < W; x++) if (columnParity[x]) axisRows[x] ^= bit;
    for (let y = 0; y < H; y++) if (rowParity[y]) axisRows[W + y] ^= bit;

    if (line.dx === 0 && line.dy === 1) phaseRows[line.x] ^= bit;
  }

  const rankB = rankMasks(cellRows);
  const rankP = rankMasks(phaseRows);
  const rankAB = rankMasks(axisRows);
  const rankPB = rankMasks([...phaseRows, ...cellRows]);
  const rankPAB = rankMasks([...phaseRows, ...axisRows]);

  const kernelB = L - rankB;
  const m12 = rankPB - rankB; // rank(P | ker B)
  const m22 = kernelB - m12;
  const m14 = rankP + rankAB - rankPAB;
  const m13 = rankP - m12 - m14;
  const m24 = rankAB - m14;
  const m23 = rankB - m13 - m14 - m24;

  const rankA = W + H - 1; // incidence rank of connected K_(W,H)
  const m11 = W - rankP;
  const yCell = m13 + m23;
  const m33 = (W * H - rankA) - yCell;
  const m34 = rankA - rankAB;
  const m44 = (W + H) - rankA;

  return {
    W, H, L, rankB, rankP, rankAB,
    m11, m12, m13, m14, m22, m23, m24, m33, m34, m44,
  };
}

function formulaBarcode(W, H) {
  const a = Math.max(W - 3, 0);
  const b = Math.max(H - 3, 0);
  const p = Math.min(W, 3);
  const q = Math.min(H, 3);
  const ab = a * b;
  const d = Math.min(2, ab);
  const ea = Math.min(1, a);
  const eb = Math.min(1, b);
  const rPhase = Math.min(a, ab)
    + Math.min(2, ab, a + Math.floor(Math.max(b - 1, 0) / 2));
  const yCell = W * H - p * q + d - a - b;
  const yLine = 3 * ab - d - rPhase;
  const m14 = eb * (1 - ea);

  const m = {
    m11: W * (1 - eb),
    m12: rPhase,
    m13: W * eb - rPhase - m14,
    m14,
    m22: yLine,
    m23: yCell - (W * eb - rPhase - m14),
    m24: a + b - m14,
    m33: (W - 1) * (H - 1) - yCell,
    m34: W + H - 1 - (a + b),
    m44: 1,
  };

  return {
    W,
    H,
    L: H * a + W * b + 2 * ab,
    rankB: W * H - p * q + d,
    rankP: W * eb,
    rankAB: a + b,
    ...m,
  };
}

const checked = [];
for (let W = 1; W <= 12; W++) {
  for (let H = 1; H <= 12; H++) {
    const actual = generatedBarcode(W, H);
    const expected = formulaBarcode(W, H);
    assert.deepEqual(actual, expected, `A4 barcode mismatch at ${W}x${H}`);
    checked.push([W, H]);
  }
}

const standard = generatedBarcode(7, 6);
assert.deepEqual(
  {
    m11: standard.m11,
    m12: standard.m12,
    m13: standard.m13,
    m14: standard.m14,
    m22: standard.m22,
    m23: standard.m23,
    m24: standard.m24,
    m33: standard.m33,
    m34: standard.m34,
    m44: standard.m44,
  },
  { m11: 0, m12: 6, m13: 1, m14: 0, m22: 28, m23: 27, m24: 7, m33: 2, m34: 5, m44: 1 },
);

console.log(`CONNECT4_A4_BARCODE_CONTROL=${JSON.stringify({
  status: 'passed',
  checkedFiniteInstances: checked.length,
  standard,
  proofBoundary: 'Finite generated-map validation only. The unbounded formula is proved symbolically in the research note and is not inferred from this sweep.',
})}`);
