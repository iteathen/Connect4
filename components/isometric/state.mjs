import {
  CELL_COUNT,
  COLUMNS,
  ROWS,
  STATUS_DRAW,
  STATUS_ONGOING,
  STATUS_PLAYER0_WIN,
  STATUS_PLAYER1_WIN,
} from '../domain/index.mjs';
import { ISOMETRIC_PROFILE } from './profile.mjs';
import { ResidualPool, RESIDUAL_TERMINAL_WIN } from './residual-pool.mjs';

const RANK_SHIFT = 21;

function packSupport(heights, ply) {
  let packed = (ply << RANK_SHIFT) >>> 0;
  for (let column = 0; column < COLUMNS; column += 1) packed = (packed | (heights[column] << (column * 3))) >>> 0;
  return packed >>> 0;
}

function reflectSupportCode(code) {
  const ply = code >>> RANK_SHIFT;
  let reflected = (ply << RANK_SHIFT) >>> 0;
  for (let column = 0; column < COLUMNS; column += 1) {
    const height = (code >>> (column * 3)) & 7;
    reflected = (reflected | (height << ((COLUMNS - 1 - column) * 3))) >>> 0;
  }
  return reflected >>> 0;
}

export class IsometricState {
  constructor({ pool = new ResidualPool(), moves = null } = {}) {
    if (!(pool instanceof ResidualPool)) throw new TypeError('pool must be a ResidualPool');
    this.pool = pool;
    this.profile = ISOMETRIC_PROFILE;
    this.heights = new Uint8Array(COLUMNS);
    this.ply = 0;
    this.sideToMove = 0;
    this.status = STATUS_ONGOING;
    this.supportLo = 0;
    this.supportHi = 0;
    this.playableLo = this.profile.initialPlayableLo >>> 0;
    this.playableHi = this.profile.initialPlayableHi >>> 0;
    this.supportCode = 0;
    this.p0Class = pool.initialClass;
    this.p1Class = pool.initialClass;

    this.moveCells = new Uint8Array(CELL_COUNT);
    this.class0History = new Int32Array(CELL_COUNT + 1);
    this.class1History = new Int32Array(CELL_COUNT + 1);
    this.statusHistory = new Uint8Array(CELL_COUNT + 1);
    this.class0History[0] = this.p0Class;
    this.class1History[0] = this.p1Class;
    this.statusHistory[0] = this.status;

    if (moves) {
      for (const column of moves) {
        if (this.play(column) < 0) throw new RangeError(`invalid move sequence at column ${column}`);
      }
    }
  }

  canPlay(column) {
    return Number.isInteger(column)
      && column >= 0
      && column < COLUMNS
      && this.status === STATUS_ONGOING
      && this.heights[column] < ROWS;
  }

  play(column) {
    if (!this.canPlay(column)) return -1;
    return this.applyUnchecked(column);
  }

  applyUnchecked(column) {
    const player = this.sideToMove;
    const row = this.heights[column];
    const cell = row * COLUMNS + column;
    const ownClass = player === 0 ? this.p0Class : this.p1Class;
    const opponentClass = player === 0 ? this.p1Class : this.p0Class;
    const nextOwn = this.pool.ownTransition(ownClass, cell);
    const nextOpponent = this.pool.blockTransition(opponentClass, cell);

    const bitLo = cell < 32 ? ((2 ** cell) >>> 0) : 0;
    const bitHi = cell >= 32 ? ((2 ** (cell - 32)) >>> 0) : 0;
    this.supportLo = (this.supportLo | bitLo) >>> 0;
    this.supportHi = (this.supportHi | bitHi) >>> 0;
    this.playableLo = (this.playableLo & ~bitLo) >>> 0;
    this.playableHi = (this.playableHi & ~bitHi) >>> 0;
    if (row + 1 < ROWS) {
      const above = cell + COLUMNS;
      const aboveLo = above < 32 ? ((2 ** above) >>> 0) : 0;
      const aboveHi = above >= 32 ? ((2 ** (above - 32)) >>> 0) : 0;
      this.playableLo = (this.playableLo | aboveLo) >>> 0;
      this.playableHi = (this.playableHi | aboveHi) >>> 0;
    }

    this.heights[column] = row + 1;
    this.moveCells[this.ply] = cell;
    this.ply += 1;
    this.sideToMove = 1 - player;
    this.supportCode = (this.supportCode + (1 << (column * 3)) + (1 << RANK_SHIFT)) >>> 0;

    if (player === 0) {
      this.p0Class = nextOwn;
      this.p1Class = nextOpponent;
    } else {
      this.p1Class = nextOwn;
      this.p0Class = nextOpponent;
    }
    if (nextOwn === RESIDUAL_TERMINAL_WIN) {
      this.status = player === 0 ? STATUS_PLAYER0_WIN : STATUS_PLAYER1_WIN;
    } else {
      this.status = this.ply === CELL_COUNT ? STATUS_DRAW : STATUS_ONGOING;
    }

    this.class0History[this.ply] = this.p0Class;
    this.class1History[this.ply] = this.p1Class;
    this.statusHistory[this.ply] = this.status;
    return cell;
  }

  undo() {
    if (this.ply === 0) return false;
    const currentPly = this.ply;
    const cell = this.moveCells[currentPly - 1];
    const row = Math.floor(cell / COLUMNS);
    const column = cell - row * COLUMNS;
    const player = 1 - this.sideToMove;

    this.ply -= 1;
    this.sideToMove = player;
    this.heights[column] = row;
    this.supportCode = (this.supportCode - (1 << (column * 3)) - (1 << RANK_SHIFT)) >>> 0;
    const bitLo = cell < 32 ? ((2 ** cell) >>> 0) : 0;
    const bitHi = cell >= 32 ? ((2 ** (cell - 32)) >>> 0) : 0;
    this.supportLo = (this.supportLo & ~bitLo) >>> 0;
    this.supportHi = (this.supportHi & ~bitHi) >>> 0;

    if (row + 1 < ROWS) {
      const above = cell + COLUMNS;
      const aboveLo = above < 32 ? ((2 ** above) >>> 0) : 0;
      const aboveHi = above >= 32 ? ((2 ** (above - 32)) >>> 0) : 0;
      this.playableLo = (this.playableLo & ~aboveLo) >>> 0;
      this.playableHi = (this.playableHi & ~aboveHi) >>> 0;
    }
    this.playableLo = (this.playableLo | bitLo) >>> 0;
    this.playableHi = (this.playableHi | bitHi) >>> 0;

    this.p0Class = this.class0History[this.ply];
    this.p1Class = this.class1History[this.ply];
    this.status = this.statusHistory[this.ply];
    return true;
  }

  isTerminal() {
    return this.status !== STATUS_ONGOING;
  }

  winner() {
    if (this.status === STATUS_PLAYER0_WIN) return 0;
    if (this.status === STATUS_PLAYER1_WIN) return 1;
    return null;
  }

  hasStructuralDrawCertificate() {
    return this.status === STATUS_ONGOING
      && this.pool.isEmpty(this.p0Class)
      && this.pool.isEmpty(this.p1Class);
  }

  supportCodeFromState() {
    return packSupport(this.heights, this.ply);
  }

  reflectedSupportCode() {
    return reflectSupportCode(this.supportCode);
  }

  structuralSignature(target = new Int32Array(4)) {
    const reflected0 = this.pool.reflectClass(this.p0Class);
    const reflected1 = this.pool.reflectClass(this.p1Class);
    let comparison = this.pool.compareClasses(this.p0Class, reflected0);
    if (comparison === 0) comparison = this.pool.compareClasses(this.p1Class, reflected1);
    const reflected = comparison > 0;
    target[0] = reflected ? reflected0 : this.p0Class;
    target[1] = reflected ? reflected1 : this.p1Class;
    target[2] = reflected ? 1 : 0;
    target[3] = comparison === 0 ? 1 : 0;
    return target;
  }

  // Pool-local q equality: normalized residual pair + support. Transport is not
  // part of equality; rank/turn follow support in the supported replay domain.
  gameplayKey(target = new Int32Array(3)) {
    const reflected0 = this.pool.reflectClass(this.p0Class);
    const reflected1 = this.pool.reflectClass(this.p1Class);
    let comparison = this.pool.compareClasses(this.p0Class, reflected0);
    if (comparison === 0) comparison = this.pool.compareClasses(this.p1Class, reflected1);
    target[0] = comparison > 0 ? reflected0 : this.p0Class;
    target[1] = comparison > 0 ? reflected1 : this.p1Class;
    target[2] = comparison > 0 ? this.reflectedSupportCode()
      : comparison === 0 ? Math.min(this.supportCode, this.reflectedSupportCode()) : this.supportCode;
    return target;
  }

  gameplayOrientation() {
    const signature = this.structuralSignature();
    return signature[3] === 1
      ? Number(this.reflectedSupportCode() < this.supportCode) : signature[2];
  }
}
