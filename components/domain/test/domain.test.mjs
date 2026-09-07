import assert from "node:assert/strict";
import test from "node:test";

import {
  CELL_COUNT,
  COLUMNS,
  ROWS,
  STATUS_ONGOING,
  STATUS_PLAYER0_WIN,
  WINNING_LINES,
  Connect4Position,
} from "../index.mjs";

test("standard board has 42 cells and 69 winning lines", () => {
  assert.equal(COLUMNS, 7);
  assert.equal(ROWS, 6);
  assert.equal(CELL_COUNT, 42);
  assert.equal(WINNING_LINES.length, 69);
  assert.equal(new Set(WINNING_LINES.map((line) => line.join(","))).size, 69);
});

test("moves obey gravity and alternate players", () => {
  const position = new Connect4Position();
  const first = position.play(3);
  const second = position.play(3);

  assert.deepEqual(first, {
    column: 3,
    row: 0,
    index: 3,
    player: 0,
    previousStatus: STATUS_ONGOING,
    previousLastMoveIndex: -1,
  });
  assert.equal(second.row, 1);
  assert.equal(second.player, 1);
  assert.equal(position.sideToMove, 0);
  assert.equal(position.ply, 2);
  assert.deepEqual(position.legalMoves(), [0, 1, 2, 3, 4, 5, 6]);
});

test("horizontal win is detected and closes the position", () => {
  const position = Connect4Position.fromMoves([0, 0, 1, 1, 2, 2]);
  assert.equal(position.isWinningMove(3, 0), true);

  const record = position.play(3);
  assert.notEqual(record, null);
  assert.equal(position.status, STATUS_PLAYER0_WIN);
  assert.equal(position.winner(), 0);
  assert.deepEqual(position.legalMoves(), []);
  assert.equal(position.play(4), null);
});

test("vertical win is detected", () => {
  const position = Connect4Position.fromMoves([0, 1, 0, 1, 0, 1, 0]);
  assert.equal(position.status, STATUS_PLAYER0_WIN);
  assert.equal(position.winner(), 0);
});

test("rising diagonal win is detected", () => {
  const position = Connect4Position.fromMoves([0, 1, 1, 2, 4, 2, 2, 3, 4, 3, 5, 3, 3]);
  assert.equal(position.status, STATUS_PLAYER0_WIN);
  assert.equal(position.winner(), 0);
});

test("falling diagonal win is detected", () => {
  const position = Connect4Position.fromMoves([3, 3, 3, 3, 5, 5, 2, 1, 2, 0, 5, 0, 1, 5, 1, 0, 3, 1, 0]);
  assert.equal(position.status, STATUS_PLAYER0_WIN);
  assert.equal(position.winner(), 0);
});

test("a full column rejects another move without changing state", () => {
  const position = Connect4Position.fromMoves([0, 0, 0, 0, 0, 0]);
  const before = position.snapshot();
  assert.equal(position.canPlay(0), false);
  assert.equal(position.play(0), null);
  assert.deepEqual(position.snapshot(), before);
});

test("undo restores the exact prior domain state", () => {
  const position = Connect4Position.fromMoves([3, 2, 3, 4, 1, 5]);
  const before = position.snapshot();
  const record = position.play(3);
  assert.notEqual(record, null);
  assert.equal(position.undo(record), true);
  assert.deepEqual(position.snapshot(), before);
});

test("constructor rejects an invalid move sequence", () => {
  assert.throws(() => new Connect4Position([7]), RangeError);
});
