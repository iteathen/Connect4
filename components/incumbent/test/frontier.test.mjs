import assert from 'node:assert/strict';
import test from 'node:test';

import { PrimitivePosition } from '../index.mjs';

function bruteWinner(position) {
  const p = position.profile;
  if (position.ply >= 7) {
    const index = position.moveStack[position.ply - 1];
    const encoded = position.cells[index];
    const start = p.positionLineOffsets[index];
    const end = p.positionLineOffsets[index + 1];
    for (let at = start; at < end; at++) {
      const base = p.positionLineIndices[at] << 2;
      if (position.cells[p.lineCells[base]] === encoded
        && position.cells[p.lineCells[base + 1]] === encoded
        && position.cells[p.lineCells[base + 2]] === encoded
        && position.cells[p.lineCells[base + 3]] === encoded) {
        return encoded - 1;
      }
    }
  }
  if (position.ply === p.cellCount) return 2;
  return -1;
}

function bruteWinningMove(position, column, player) {
  const p = position.profile;
  if (column < 0 || column >= p.columns) return false;
  const row = position.heights[column];
  if (row >= p.rows) return false;
  const index = row * p.columns + column;
  const encoded = player + 1;
  const start = p.positionLineOffsets[index];
  const end = p.positionLineOffsets[index + 1];
  for (let at = start; at < end; at++) {
    const base = p.positionLineIndices[at] << 2;
    let matches = 0;
    for (let j = 0; j < 4; j++) {
      const cellIndex = p.lineCells[base + j];
      if (cellIndex === index || position.cells[cellIndex] === encoded) matches++;
      else break;
    }
    if (matches === 4) return true;
  }
  return false;
}

function assertFrontierMatchesBoard(position, label) {
  const p = position.profile;
  assert.equal(position.winner(), bruteWinner(position), `${label}: winner`);

  const refs0 = new Uint8Array(p.cellCount);
  const refs1 = new Uint8Array(p.cellCount);
  for (let line = 0, base = 0; line < p.lineCount; line++, base += 4) {
    let count0 = 0;
    let count1 = 0;
    let emptyXor = 0;
    for (let j = 0; j < 4; j++) {
      const index = p.lineCells[base + j];
      const cell = position.cells[index];
      if (cell === 1) count0++;
      else if (cell === 2) count1++;
      else emptyXor ^= index;
    }
    assert.equal(position.lineState[line], count0 | (count1 << 3), `${label}: line ${line} state`);
    assert.equal(position.lineEmptyXor[line], emptyXor, `${label}: line ${line} empty xor`);
    if (count0 === 3 && count1 === 0) refs0[emptyXor]++;
    else if (count1 === 3 && count0 === 0) refs1[emptyXor]++;
  }

  assert.deepEqual(position.singletonRefs0, refs0, `${label}: P0 singleton refs`);
  assert.deepEqual(position.singletonRefs1, refs1, `${label}: P1 singleton refs`);

  let playableWinCount0 = 0;
  let playableWinCount1 = 0;
  let playableWinColumnSum0 = 0;
  let playableWinColumnSum1 = 0;
  for (let column = 0; column < p.columns; column++) {
    const win0 = bruteWinningMove(position, column, 0);
    const win1 = bruteWinningMove(position, column, 1);
    assert.equal(position.isWinningMove(column, 0), win0, `${label}: P0 winning column ${column}`);
    assert.equal(position.isWinningMove(column, 1), win1, `${label}: P1 winning column ${column}`);
    if (win0) {
      playableWinCount0++;
      playableWinColumnSum0 += column;
    }
    if (win1) {
      playableWinCount1++;
      playableWinColumnSum1 += column;
    }
  }
  assert.equal(position.playableWinCount0, playableWinCount0, `${label}: P0 playable singleton count`);
  assert.equal(position.playableWinCount1, playableWinCount1, `${label}: P1 playable singleton count`);
  assert.equal(position.playableWinColumnSum0, playableWinColumnSum0, `${label}: P0 playable singleton column sum`);
  assert.equal(position.playableWinColumnSum1, playableWinColumnSum1, `${label}: P1 playable singleton column sum`);
}

function createRandom(seed) {
  let state = seed >>> 0;
  return (limit) => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state % limit;
  };
}

test('incremental terminal frontier remains exactly equivalent through apply/undo across profiles', () => {
  const geometries = [[4, 4], [5, 4], [7, 6], [8, 6], [6, 7]];
  const random = createRandom(0x4c34f00d);

  for (const [columns, rows] of geometries) {
    for (let trial = 0; trial < 80; trial++) {
      const position = new PrimitivePosition(columns, rows);
      assertFrontierMatchesBoard(position, `${columns}x${rows} trial ${trial} root`);

      const transitions = position.profile.cellCount * 2;
      for (let step = 0; step < transitions; step++) {
        const winner = position.winner();
        if (position.ply > 0 && (winner !== -1 || random(5) === 0)) {
          position.undoUnchecked();
          assertFrontierMatchesBoard(position, `${columns}x${rows} trial ${trial} undo ${step}`);
          continue;
        }

        const legal = [];
        for (let column = 0; column < columns; column++) {
          if (position.heights[column] < rows) legal.push(column);
        }
        if (legal.length === 0) break;
        position.applyUnchecked(legal[random(legal.length)]);
        assertFrontierMatchesBoard(position, `${columns}x${rows} trial ${trial} apply ${step}`);
      }

      while (position.ply > 0) {
        position.undoUnchecked();
        assertFrontierMatchesBoard(position, `${columns}x${rows} trial ${trial} unwind ${position.ply}`);
      }
    }
  }
});
