import test from 'node:test';
import assert from 'node:assert/strict';

import { solveBsfp4x3Connect3Reference } from '../index.mjs';

const COLUMNS = 4;
const ROWS = 3;
const CONNECT = 3;
const CELL_COUNT = COLUMNS * ROWS;

function cellIndex(column, row) {
  return row * COLUMNS + column;
}

function hasWinFrom(cells, column, row, player) {
  const encoded = player + 1;
  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
  for (const [dc, dr] of directions) {
    let count = 1;
    for (const sign of [-1, 1]) {
      let c = column + dc * sign;
      let r = row + dr * sign;
      while (c >= 0 && c < COLUMNS && r >= 0 && r < ROWS && cells[cellIndex(c, r)] === encoded) {
        count += 1;
        c += dc * sign;
        r += dr * sign;
      }
    }
    if (count >= CONNECT) return true;
  }
  return false;
}

function stateKey(cells, sideToMove) {
  return `${sideToMove}:${Array.from(cells).join('')}`;
}

function createIndependentOracle() {
  const memo = new Map();

  function solve(cells, heights, sideToMove, ply) {
    const key = stateKey(cells, sideToMove);
    const cached = memo.get(key);
    if (cached !== undefined) return cached;

    let best = sideToMove === 0 ? -1 : 1;
    let hasMove = false;
    for (let column = 0; column < COLUMNS; column += 1) {
      const row = heights[column];
      if (row >= ROWS) continue;
      hasMove = true;
      cells[cellIndex(column, row)] = sideToMove + 1;
      heights[column] += 1;

      let value;
      if (hasWinFrom(cells, column, row, sideToMove)) {
        value = sideToMove === 0 ? 1 : -1;
      } else if (ply + 1 === CELL_COUNT) {
        value = 0;
      } else {
        value = solve(cells, heights, 1 - sideToMove, ply + 1);
      }

      heights[column] -= 1;
      cells[cellIndex(column, row)] = 0;
      if (sideToMove === 0) best = Math.max(best, value);
      else best = Math.min(best, value);
    }

    if (!hasMove) best = 0;
    memo.set(key, best);
    return best;
  }

  return { solve, memo };
}

function ownershipBits(cells) {
  const bits = new Uint8Array(CELL_COUNT);
  for (let index = 0; index < CELL_COUNT; index += 1) {
    if (cells[index] === 2) bits[index] = 1;
  }
  return bits;
}

test('direct symbolic BSFP solves the complete 4x3 connect-3 root without recursive search', () => {
  const solver = solveBsfp4x3Connect3Reference();
  assert.equal(solver.kind, 'connect4-bsfp-symbolic-wdl-reference');
  assert.equal(solver.support.itemCapacity, 256);
  assert.equal(solver.winningLineCount, 14);
  assert.equal(solver.rootWdl, 1);
  assert.ok(solver.stats.decisionNodeCount > 0);
});

test('direct symbolic BSFP agrees with an independent physical-state oracle on every reachable nonterminal 4x3 state', () => {
  const solver = solveBsfp4x3Connect3Reference();
  const oracle = createIndependentOracle();
  const cells = new Uint8Array(CELL_COUNT);
  const heights = new Uint8Array(COLUMNS);
  const visited = new Set();
  let checked = 0;
  let legalEdges = 0;

  function visit(sideToMove, ply) {
    const key = stateKey(cells, sideToMove);
    if (visited.has(key)) return;
    visited.add(key);

    const expected = oracle.solve(cells, heights, sideToMove, ply);
    const actual = solver.evaluateNonterminal({
      heights: Array.from(heights),
      ownershipBits: ownershipBits(cells),
    });
    assert.equal(actual, expected, `WDL mismatch at ${key}`);
    checked += 1;

    for (let column = 0; column < COLUMNS; column += 1) {
      const row = heights[column];
      if (row >= ROWS) continue;
      legalEdges += 1;
      cells[cellIndex(column, row)] = sideToMove + 1;
      heights[column] += 1;
      const terminalWin = hasWinFrom(cells, column, row, sideToMove);
      const terminalDraw = !terminalWin && ply + 1 === CELL_COUNT;
      if (!terminalWin && !terminalDraw) visit(1 - sideToMove, ply + 1);
      heights[column] -= 1;
      cells[cellIndex(column, row)] = 0;
    }
  }

  visit(0, 0);

  assert.equal(checked, 4631);
  assert.equal(legalEdges, 11818);
  assert.equal(oracle.solve(new Uint8Array(CELL_COUNT), new Uint8Array(COLUMNS), 0, 0), 1);
});
