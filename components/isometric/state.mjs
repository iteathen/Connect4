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
  // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
  // Reference reconstruction only; ordinary transitions maintain packed support incrementally.
  // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
  let packed = (ply << RANK_SHIFT) >>> 0;
  for (let column = 0; column < COLUMNS; column += 1) packed = (packed | (heights[column] << (column * 3))) >>> 0;
  return packed >>> 0;
}

function reflectSupportCode(code) {
  // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
  // Use numeric packed support directly, never expand a board/array or format a key.
  // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
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
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Public checked predicate; skip redundant checks internally only under proved caller preconditions.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    return Number.isInteger(column)
      && column >= 0
      && column < COLUMNS
      && this.status === STATUS_ONGOING
      && this.heights[column] < ROWS;
  }

  play(column) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Checked external replay boundary, not a reason to restore repeated validation in trusted recursion.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    if (!this.canPlay(column)) return -1;
    return this.applyUnchecked(column);
  }

  applyUnchecked(column) {
    // OWNER-PROTECTED HOT-PATH — do not remove/weaken this or adjacent comments.
    // NEES E1 / NEES-EXTREME under components/isometric/NEES_PROFILE.md.
    // Keep native scalar updates and preallocated reversible history. Do not
    // restore mask arrays, per-move objects, board adapters, snapshots, copies,
    // or global residual rebuilds. Preserve both unsigned mask halves and
    // first-win stopping. Entry legality is established by the caller.
    // See solver.mjs's owner contract; changes require restoration/differential
    // tests and paired recursive-worker measurements, not stylistic preference.
    const player = this.sideToMove;
    const row = this.heights[column];
    const cell = row * COLUMNS + column;
    const ownClass = player === 0 ? this.p0Class : this.p1Class;
    const opponentClass = player === 0 ? this.p1Class : this.p0Class;
    const nextOwn = this.pool.ownTransition(ownClass, cell);
    const nextOpponent = this.pool.blockTransition(opponentClass, cell);

    const bitLo = ISOMETRIC_PROFILE.cellLo[cell];
    const bitHi = ISOMETRIC_PROFILE.cellHi[cell];
    this.supportLo = (this.supportLo | bitLo) >>> 0;
    this.supportHi = (this.supportHi | bitHi) >>> 0;
    this.playableLo = (this.playableLo & ~bitLo) >>> 0;
    this.playableHi = (this.playableHi & ~bitHi) >>> 0;
    if (row + 1 < ROWS) {
      const above = cell + COLUMNS;
      const aboveLo = ISOMETRIC_PROFILE.cellLo[above];
      const aboveHi = ISOMETRIC_PROFILE.cellHi[above];
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
    // OWNER-PROTECTED HOT-PATH — do not remove/weaken this comment.
    // NEES E1 / NEES-EXTREME under components/isometric/NEES_PROFILE.md.
    // Undo restores native scalars/history in place: no replay, allocation,
    // snapshot copying or residual recomputation. Ancestor state must survive
    // ordinary returns AND scheduling/error unwind exactly.
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
    const bitLo = ISOMETRIC_PROFILE.cellLo[cell];
    const bitHi = ISOMETRIC_PROFILE.cellHi[cell];
    this.supportLo = (this.supportLo & ~bitLo) >>> 0;
    this.supportHi = (this.supportHi & ~bitHi) >>> 0;

    if (row + 1 < ROWS) {
      const above = cell + COLUMNS;
      const aboveLo = ISOMETRIC_PROFILE.cellLo[above];
      const aboveHi = ISOMETRIC_PROFILE.cellHi[above];
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
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Keep status scalar; no board scan or certificate construction.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    return this.status !== STATUS_ONGOING;
  }

  winner() {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Keep terminal interpretation scalar and first-win consistent.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    if (this.status === STATUS_PLAYER0_WIN) return 0;
    if (this.status === STATUS_PLAYER1_WIN) return 1;
    return null;
  }

  hasStructuralDrawCertificate() {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Bilateral exhaustion only; one empty residual is a bound, not an exact draw.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    return this.status === STATUS_ONGOING
      && this.pool.isEmpty(this.p0Class)
      && this.pool.isEmpty(this.p1Class);
  }

  supportCodeFromState() {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Independent reconstruction control; do not insert this column scan into maintained transitions.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    return packSupport(this.heights, this.ply);
  }

  reflectedSupportCode() {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Numeric reflection only; benchmark any cached representation with play/undo restoration.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    return reflectSupportCode(this.supportCode);
  }

  structuralSignature(target = new Int32Array(4)) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Allocating default is proof-facing. Ordinary q uses supplied scratch; never retain borrowed scratch across descendants.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
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
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Recursive callers must supply storage. Exact residual pair plus canonical support is q, not proof identity.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    // OWNER-PROTECTED ORBIT ORDER — support, then residual content. A mirror
    // swaps the two tuples, so the minimum has the same exact q_r orbit.
    // Keep gameplayOrientation in this order too; structuralSignature owns a
    // DIFFERENT proof retrieval orientation and must not be changed with q.
    const reflectedSupport = this.reflectedSupportCode();
    if (this.supportCode < reflectedSupport) {
      target[0] = this.p0Class;
      target[1] = this.p1Class;
      target[2] = this.supportCode;
      return target;
    }
    const reflected0 = this.pool.reflectClass(this.p0Class);
    const reflected1 = this.pool.reflectClass(this.p1Class);
    let comparison = 1;
    if (this.supportCode === reflectedSupport) {
      comparison = this.pool.compareClasses(this.p0Class, reflected0);
      if (comparison === 0) comparison = this.pool.compareClasses(this.p1Class, reflected1);
    }
    target[0] = comparison > 0 ? reflected0 : this.p0Class;
    target[1] = comparison > 0 ? reflected1 : this.p1Class;
    target[2] = reflectedSupport;
    return target;
  }

  gameplayOrientation() {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Allocating proof/transport helper, excluded from the ordinary recursive worker path.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    const reflectedSupport = this.reflectedSupportCode();
    if (this.supportCode !== reflectedSupport) return Number(reflectedSupport < this.supportCode);
    let comparison = this.pool.compareClasses(this.p0Class, this.pool.reflectClass(this.p0Class));
    if (comparison === 0) comparison = this.pool.compareClasses(this.p1Class, this.pool.reflectClass(this.p1Class));
    return Number(comparison > 0);
  }
}
