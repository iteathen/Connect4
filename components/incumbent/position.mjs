import { createProfile } from './profile.mjs';

export class PrimitivePosition {
  constructor(columns = 7, rows = 6, moves = null) {
    this.profile = createProfile(columns, rows);
    const p = this.profile;
    this.cells = new Uint8Array(p.cellCount);
    this.heights = new Uint32Array(p.columns);
    this.moveStack = new Uint32Array(p.cellCount);
    this.ply = 0;
    this.sideToMove = 0;
    this.hashLo = 0;
    this.hashHi = 0;

    // Exact incremental terminal frontier. Counts are packed as p0 + (p1 << 3).
    this.lineState = new Uint8Array(p.lineCount);
    this.lineEmptyXor = new Uint32Array(p.lineCount);
    this.singletonRefs0 = new Uint8Array(p.cellCount);
    this.singletonRefs1 = new Uint8Array(p.cellCount);
    // A line remains live for a player while it contains no opponent stone.
    this.liveResidualLineCount0 = p.lineCount;
    this.liveResidualLineCount1 = p.lineCount;
    // Telemetry only: monotonic count of transitions that reach an early exact dead draw.
    // Undo intentionally does not decrement this counter.
    this.earlyDeadDrawTransitionHits = 0;
    // 0 ongoing, 1 P0, 2 P1, 3 draw.
    this.winnerByPly = new Uint8Array(p.cellCount + 1);
    for (let line = 0, base = 0; line < p.lineCount; line++, base += 4) {
      this.lineEmptyXor[line] = p.lineCells[base]
        ^ p.lineCells[base + 1]
        ^ p.lineCells[base + 2]
        ^ p.lineCells[base + 3];
    }

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
    return this.applyUnchecked(column);
  }

  applyUnchecked(column) {
    const p = this.profile;
    const row = this.heights[column];
    const index = row * p.columns + column;
    const player = this.sideToMove;
    const encoded = player + 1;
    let won = false;

    const start = p.positionLineOffsets[index];
    const end = p.positionLineOffsets[index + 1];
    for (let at = start; at < end; at++) {
      const line = p.positionLineIndices[at];
      let state = this.lineState[line];
      let count0 = state & 7;
      let count1 = state >>> 3;
      let empty = this.lineEmptyXor[line];

      if (count0 === 3 && count1 === 0) this.singletonRefs0[empty]--;
      else if (count1 === 3 && count0 === 0) this.singletonRefs1[empty]--;

      // The mover's first stone on a line blocks that line for the opponent until undo.
      if (player === 0) {
        if (count0 === 0) this.liveResidualLineCount1--;
        count0++;
      } else {
        if (count1 === 0) this.liveResidualLineCount0--;
        count1++;
      }
      empty ^= index;
      state = count0 | (count1 << 3);
      this.lineState[line] = state;
      this.lineEmptyXor[line] = empty;

      if (count0 === 3 && count1 === 0) this.singletonRefs0[empty]++;
      else if (count1 === 3 && count0 === 0) this.singletonRefs1[empty]++;
      if ((player === 0 ? count0 : count1) === 4) won = true;
    }

    this.cells[index] = encoded;
    this.heights[column] = row + 1;
    this.moveStack[this.ply] = index;
    this.ply++;
    this.sideToMove = 1 - player;
    this.winnerByPly[this.ply] = won ? encoded : (this.ply === p.cellCount ? 3 : 0);
    if (this.ply < p.cellCount && this.liveResidualLineCount0 === 0 && this.liveResidualLineCount1 === 0) {
      this.earlyDeadDrawTransitionHits++;
    }
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

    const start = p.positionLineOffsets[index];
    const end = p.positionLineOffsets[index + 1];
    for (let at = start; at < end; at++) {
      const line = p.positionLineIndices[at];
      let state = this.lineState[line];
      let count0 = state & 7;
      let count1 = state >>> 3;
      let empty = this.lineEmptyXor[line];

      if (count0 === 3 && count1 === 0) this.singletonRefs0[empty]--;
      else if (count1 === 3 && count0 === 0) this.singletonRefs1[empty]--;

      if (player === 0) {
        if (count0 === 1) this.liveResidualLineCount1++;
        count0--;
      } else {
        if (count1 === 1) this.liveResidualLineCount0++;
        count1--;
      }
      empty ^= index;
      state = count0 | (count1 << 3);
      this.lineState[line] = state;
      this.lineEmptyXor[line] = empty;

      if (count0 === 3 && count1 === 0) this.singletonRefs0[empty]++;
      else if (count1 === 3 && count0 === 0) this.singletonRefs1[empty]++;
    }

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
    const code = this.winnerByPly[this.ply];
    return code === 0 ? -1 : code - 1;
  }

  isDeadDraw() {
    return this.liveResidualLineCount0 === 0 && this.liveResidualLineCount1 === 0;
  }

  isWinningMove(column, player = this.sideToMove) {
    const p = this.profile;
    if (column < 0 || column >= p.columns) return false;
    const row = this.heights[column];
    if (row >= p.rows) return false;
    const index = row * p.columns + column;
    return (player === 0 ? this.singletonRefs0[index] : this.singletonRefs1[index]) !== 0;
  }
}
