export const COLUMNS = 7;
export const ROWS = 6;
export const CELL_COUNT = COLUMNS * ROWS;
export const CONNECT = 4;

export const CELL_EMPTY = 0;
export const CELL_PLAYER0 = 1;
export const CELL_PLAYER1 = 2;

export const STATUS_ONGOING = 0;
export const STATUS_PLAYER0_WIN = 1;
export const STATUS_PLAYER1_WIN = 2;
export const STATUS_DRAW = 3;

function toIndex(column, row) {
  return row * COLUMNS + column;
}

function buildWinningLines() {
  const lines = [];

  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column <= COLUMNS - CONNECT; column += 1) {
      lines.push([
        toIndex(column, row),
        toIndex(column + 1, row),
        toIndex(column + 2, row),
        toIndex(column + 3, row),
      ]);
    }
  }

  for (let column = 0; column < COLUMNS; column += 1) {
    for (let row = 0; row <= ROWS - CONNECT; row += 1) {
      lines.push([
        toIndex(column, row),
        toIndex(column, row + 1),
        toIndex(column, row + 2),
        toIndex(column, row + 3),
      ]);
    }
  }

  for (let column = 0; column <= COLUMNS - CONNECT; column += 1) {
    for (let row = 0; row <= ROWS - CONNECT; row += 1) {
      lines.push([
        toIndex(column, row),
        toIndex(column + 1, row + 1),
        toIndex(column + 2, row + 2),
        toIndex(column + 3, row + 3),
      ]);
    }
  }

  for (let column = 0; column <= COLUMNS - CONNECT; column += 1) {
    for (let row = CONNECT - 1; row < ROWS; row += 1) {
      lines.push([
        toIndex(column, row),
        toIndex(column + 1, row - 1),
        toIndex(column + 2, row - 2),
        toIndex(column + 3, row - 3),
      ]);
    }
  }

  return Object.freeze(lines.map((line) => Object.freeze(line)));
}

export const WINNING_LINES = buildWinningLines();

const POSITION_TO_LINES = Array.from({ length: CELL_COUNT }, () => []);
for (let lineIndex = 0; lineIndex < WINNING_LINES.length; lineIndex += 1) {
  for (const cellIndex of WINNING_LINES[lineIndex]) {
    POSITION_TO_LINES[cellIndex].push(lineIndex);
  }
}
for (const lineIndices of POSITION_TO_LINES) Object.freeze(lineIndices);
Object.freeze(POSITION_TO_LINES);

function assertPlayer(player) {
  if (player !== 0 && player !== 1) throw new RangeError("player must be 0 or 1");
}

function encodePlayer(player) {
  return player + 1;
}

export class Connect4Position {
  constructor(moves = []) {
    this.cells = new Uint8Array(CELL_COUNT);
    this.heights = new Uint8Array(COLUMNS);
    this.sideToMove = 0;
    this.ply = 0;
    this.status = STATUS_ONGOING;
    this.lastMoveIndex = -1;
    this.history = [];

    for (const column of moves) {
      const record = this.play(column);
      if (record === null) throw new RangeError(`invalid move sequence at column ${column}`);
    }
  }

  static fromMoves(moves) {
    return new Connect4Position(moves);
  }

  clone() {
    const copy = new Connect4Position();
    copy.cells.set(this.cells);
    copy.heights.set(this.heights);
    copy.sideToMove = this.sideToMove;
    copy.ply = this.ply;
    copy.status = this.status;
    copy.lastMoveIndex = this.lastMoveIndex;
    copy.history = this.history.map((record) => ({ ...record }));
    return copy;
  }

  isTerminal() {
    return this.status !== STATUS_ONGOING;
  }

  winner() {
    if (this.status === STATUS_PLAYER0_WIN) return 0;
    if (this.status === STATUS_PLAYER1_WIN) return 1;
    return null;
  }

  legalMoves() {
    if (this.isTerminal()) return [];
    const moves = [];
    for (let column = 0; column < COLUMNS; column += 1) {
      if (this.heights[column] < ROWS) moves.push(column);
    }
    return moves;
  }

  canPlay(column) {
    return Number.isInteger(column)
      && column >= 0
      && column < COLUMNS
      && !this.isTerminal()
      && this.heights[column] < ROWS;
  }

  isWinningMove(column, player = this.sideToMove) {
    assertPlayer(player);
    if (!Number.isInteger(column) || column < 0 || column >= COLUMNS) return false;
    const row = this.heights[column];
    if (row >= ROWS) return false;

    const index = toIndex(column, row);
    const encodedPlayer = encodePlayer(player);
    for (const lineIndex of POSITION_TO_LINES[index]) {
      const line = WINNING_LINES[lineIndex];
      let matches = true;
      for (const cellIndex of line) {
        if (cellIndex === index) continue;
        if (this.cells[cellIndex] !== encodedPlayer) {
          matches = false;
          break;
        }
      }
      if (matches) return true;
    }
    return false;
  }

  play(column) {
    if (!this.canPlay(column)) return null;

    const player = this.sideToMove;
    const row = this.heights[column];
    const index = toIndex(column, row);
    const previousStatus = this.status;
    const previousLastMoveIndex = this.lastMoveIndex;

    this.cells[index] = encodePlayer(player);
    this.heights[column] += 1;
    this.ply += 1;
    this.lastMoveIndex = index;

    if (this.#isWinFrom(index, player)) {
      this.status = player === 0 ? STATUS_PLAYER0_WIN : STATUS_PLAYER1_WIN;
    } else if (this.ply === CELL_COUNT) {
      this.status = STATUS_DRAW;
    }

    this.sideToMove = 1 - player;

    const record = {
      column,
      row,
      index,
      player,
      previousStatus,
      previousLastMoveIndex,
    };
    this.history.push(record);
    return record;
  }

  undo(record = this.history.at(-1)) {
    if (!record || this.history.length === 0) return false;
    const latest = this.history.at(-1);
    if (
      latest.index !== record.index
      || latest.column !== record.column
      || latest.player !== record.player
      || this.cells[record.index] !== encodePlayer(record.player)
    ) {
      return false;
    }

    this.history.pop();
    this.cells[record.index] = CELL_EMPTY;
    this.heights[record.column] -= 1;
    this.ply -= 1;
    this.sideToMove = record.player;
    this.status = record.previousStatus;
    this.lastMoveIndex = record.previousLastMoveIndex;
    return true;
  }

  toMoveSequence() {
    return this.history.map((record) => record.column);
  }

  snapshot() {
    return {
      cells: Array.from(this.cells),
      heights: Array.from(this.heights),
      sideToMove: this.sideToMove,
      ply: this.ply,
      status: this.status,
      lastMoveIndex: this.lastMoveIndex,
      moves: this.toMoveSequence(),
    };
  }

  #isWinFrom(index, player) {
    const encodedPlayer = encodePlayer(player);
    for (const lineIndex of POSITION_TO_LINES[index]) {
      const line = WINNING_LINES[lineIndex];
      let matches = true;
      for (const cellIndex of line) {
        if (this.cells[cellIndex] !== encodedPlayer) {
          matches = false;
          break;
        }
      }
      if (matches) return true;
    }
    return false;
  }
}
