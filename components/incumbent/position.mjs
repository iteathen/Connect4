import { createProfile } from './profile.mjs';

export class PrimitivePosition {
  constructor(columns = 7, rows = 6, moves = null) {
    this.profile = createProfile(columns, rows);
    this.cells = new Uint8Array(this.profile.cellCount);
    this.heights = new Uint32Array(this.profile.columns);
    this.moveStack = new Uint32Array(this.profile.cellCount);
    this.ply = 0;
    this.sideToMove = 0;
    this.hashLo = 0;
    this.hashHi = 0;
    if (moves) {
      for (let i = 0; i < moves.length; i++) {
        if (this.play(moves[i]) < 0) throw new RangeError(`invalid move at ply ${i}: ${moves[i]}`);
      }
    }
  }

  play(column) {
    const p = this.profile;
    if (!Number.isInteger(column) || column < 0 || column >= p.columns) return -1;
    const row = this.heights[column];
    if (row >= p.rows || this.winner() !== -1) return -1;
    const index = row * p.columns + column;
    const player = this.sideToMove;
    const encoded = player + 1;
    this.cells[index] = encoded;
    this.heights[column] = row + 1;
    this.moveStack[this.ply] = index;
    this.ply++;
    this.sideToMove = 1 - player;
    const z = player * p.cellCount + index;
    this.hashLo = (this.hashLo ^ p.zobristLo[z]) >>> 0;
    this.hashHi = (this.hashHi ^ p.zobristHi[z]) >>> 0;
    return index;
  }

  applyUnchecked(column) {
    const p = this.profile;
    const row = this.heights[column];
    const index = row * p.columns + column;
    const player = this.sideToMove;
    this.cells[index] = player + 1;
    this.heights[column] = row + 1;
    this.moveStack[this.ply] = index;
    this.ply++;
    this.sideToMove = 1 - player;
    const z = player * p.cellCount + index;
    this.hashLo = (this.hashLo ^ p.zobristLo[z]) >>> 0;
    this.hashHi = (this.hashHi ^ p.zobristHi[z]) >>> 0;
    return index;
  }

  undoUnchecked() {
    const p = this.profile;
    const index = this.moveStack[--this.ply];
    const row = Math.floor(index / p.columns);
    const column = index - row * p.columns;
    const player = 1 - this.sideToMove;
    this.sideToMove = player;
    this.heights[column]--;
    this.cells[index] = 0;
    const z = player * p.cellCount + index;
    this.hashLo = (this.hashLo ^ p.zobristLo[z]) >>> 0;
    this.hashHi = (this.hashHi ^ p.zobristHi[z]) >>> 0;
  }

  canPlay(column) {
    return Number.isInteger(column) && column >= 0 && column < this.profile.columns && this.heights[column] < this.profile.rows && this.winner() === -1;
  }

  lastMoveIndex() {
    return this.ply === 0 ? -1 : this.moveStack[this.ply - 1];
  }

  winner() {
    if (this.ply >= 7) {
      const index = this.moveStack[this.ply - 1];
      const encoded = this.cells[index];
      const p = this.profile;
      const start = p.positionLineOffsets[index];
      const end = p.positionLineOffsets[index + 1];
      for (let at = start; at < end; at++) {
        const base = p.positionLineIndices[at] << 2;
        if (this.cells[p.lineCells[base]] === encoded
          && this.cells[p.lineCells[base + 1]] === encoded
          && this.cells[p.lineCells[base + 2]] === encoded
          && this.cells[p.lineCells[base + 3]] === encoded) {
          return encoded - 1;
        }
      }
    }
    if (this.ply === this.profile.cellCount) return 2;
    return -1;
  }

  isWinningMove(column, player = this.sideToMove) {
    const p = this.profile;
    if (column < 0 || column >= p.columns) return false;
    const row = this.heights[column];
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
        if (cellIndex === index || this.cells[cellIndex] === encoded) matches++;
        else break;
      }
      if (matches === 4) return true;
    }
    return false;
  }
}
