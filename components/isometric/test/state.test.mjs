import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CELL_COUNT,
  COLUMNS,
  ROWS,
  WINNING_LINES,
  STATUS_ONGOING,
} from '../../domain/index.mjs';
import {
  GUARD_APPLICABLE,
  GUARD_INAPPLICABLE,
  GUARD_UNRESOLVED,
  ISOMETRIC_PROFILE,
  IsometricState,
  ResidualPool,
  allGuards,
  evaluateGuard,
  maskGuard,
  rankGuard,
  realizabilityGuard,
  reflectGuard,
  turnGuard,
} from '../index.mjs';

class ReferencePosition {
  constructor() {
    this.cells = new Uint8Array(CELL_COUNT);
    this.heights = new Uint8Array(COLUMNS);
    this.sideToMove = 0;
    this.ply = 0;
    this.status = STATUS_ONGOING;
  }

  legalMoves() {
    if (this.status !== STATUS_ONGOING) return [];
    const moves = [];
    for (let column = 0; column < COLUMNS; column += 1) if (this.heights[column] < ROWS) moves.push(column);
    return moves;
  }

  play(column) {
    if (this.status !== STATUS_ONGOING || column < 0 || column >= COLUMNS || this.heights[column] >= ROWS) return null;
    const player = this.sideToMove;
    const row = this.heights[column];
    const index = row * COLUMNS + column;
    this.cells[index] = player + 1;
    this.heights[column] += 1;
    this.ply += 1;
    let won = false;
    for (const line of WINNING_LINES) {
      if (!line.includes(index)) continue;
      if (line.every((cell) => this.cells[cell] === player + 1)) { won = true; break; }
    }
    if (won) this.status = player === 0 ? 1 : 2;
    else if (this.ply === CELL_COUNT) this.status = 3;
    this.sideToMove = 1 - player;
    return { column, row, index, player };
  }
}

function maskForCells(cells) {
  let lo = 0;
  let hi = 0;
  for (const cell of cells) {
    if (cell < 32) lo = (lo | ((2 ** cell) >>> 0)) >>> 0;
    else hi = (hi | ((2 ** (cell - 32)) >>> 0)) >>> 0;
  }
  return [lo >>> 0, hi >>> 0];
}

function subset(a, b) {
  return (((a[0] & ~b[0]) >>> 0) === 0) && (((a[1] & ~b[1]) >>> 0) === 0);
}

function popcount32(value) {
  let x = value >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

function compareMasks(a, b) {
  const c = popcount32(a[0]) + popcount32(a[1]) - popcount32(b[0]) - popcount32(b[1]);
  if (c !== 0) return c;
  if ((a[1] >>> 0) !== (b[1] >>> 0)) return (a[1] >>> 0) < (b[1] >>> 0) ? -1 : 1;
  if ((a[0] >>> 0) !== (b[0] >>> 0)) return (a[0] >>> 0) < (b[0] >>> 0) ? -1 : 1;
  return 0;
}

function oracleResiduals(position, player) {
  const own = player + 1;
  const opponent = 2 - player;
  const candidates = [];
  const seen = new Set();
  for (const line of WINNING_LINES) {
    let blocked = false;
    const remaining = [];
    for (const cell of line) {
      const value = position.cells[cell];
      if (value === opponent) {
        blocked = true;
        break;
      }
      if (value !== own) remaining.push(cell);
    }
    if (blocked) continue;
    if (remaining.length === 0) throw new Error('oracle called on a position where player already has a line');
    const mask = maskForCells(remaining);
    const key = `${mask[0]}:${mask[1]}`;
    if (!seen.has(key)) {
      seen.add(key);
      candidates.push(mask);
    }
  }
  candidates.sort(compareMasks);
  const minimal = [];
  outer: for (const candidate of candidates) {
    for (const kept of minimal) if (subset(kept, candidate)) continue outer;
    minimal.push(candidate);
  }
  return minimal;
}

function termsEqual(actual, expected) {
  assert.equal(actual.length, expected.length);
  for (let i = 0; i < expected.length; i += 1) assert.deepEqual(actual[i], expected[i]);
}

function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  };
}

function reflectMove(column) {
  return COLUMNS - 1 - column;
}

test('WSL profile is the exact standard 625-term universe and reflection is involutive', () => {
  assert.equal(ISOMETRIC_PROFILE.count, 625);
  assert.equal(ISOMETRIC_PROFILE.lineCount, 69);
  for (let id = 0; id < ISOMETRIC_PROFILE.count; id += 1) {
    const reflected = ISOMETRIC_PROFILE.reflectedTermIds[id];
    assert.equal(ISOMETRIC_PROFILE.reflectedTermIds[reflected], id);
  }
});

test('native packed residual transitions match independent physical reconstruction', () => {
  const pool = new ResidualPool();
  for (let game = 0; game < 96; game += 1) {
    const random = makeRng(0x9e3779b9 ^ game);
    const state = new IsometricState({ pool });
    const oracle = new ReferencePosition();
    while (oracle.status === STATUS_ONGOING) {
      termsEqual(pool.terms(state.p0Class), oracleResiduals(oracle, 0));
      termsEqual(pool.terms(state.p1Class), oracleResiduals(oracle, 1));
      assert.equal(state.supportCodeFromState(), state.supportCode);
      assert.equal(state.sideToMove, oracle.sideToMove);
      assert.equal(state.ply, oracle.ply);

      const legal = oracle.legalMoves();
      if (legal.length === 0) break;
      const move = legal[random() % legal.length];
      const oracleRecord = oracle.play(move);
      const stateCell = state.play(move);
      assert.ok(oracleRecord);
      assert.equal(stateCell, oracleRecord.index);
      assert.equal(state.status, oracle.status);
      if (oracle.status !== STATUS_ONGOING) break;
    }
  }
});

test('play/undo restores exact packed state without a compatibility board', () => {
  const pool = new ResidualPool();
  const state = new IsometricState({ pool });
  const initialStructural = Array.from(state.structuralSignature());
  const initialTransition = Array.from(state.gameplayKey());
  const moves = [3, 2, 3, 4, 2, 4, 1, 5, 0, 6];
  let accepted = 0;
  for (const move of moves) {
    if (state.play(move) < 0) break;
    accepted += 1;
  }
  for (let i = 0; i < accepted; i += 1) assert.equal(state.undo(), true);
  assert.equal(state.undo(), false);
  assert.deepEqual(Array.from(state.structuralSignature()), initialStructural);
  assert.deepEqual(Array.from(state.gameplayKey()), initialTransition);
  assert.equal(state.supportLo, 0);
  assert.equal(state.supportHi, 0);
  assert.equal(state.ply, 0);
});

test('first win stops the native state immediately', () => {
  const state = new IsometricState();
  for (const move of [3, 0, 3, 0, 3, 0, 3]) assert.notEqual(state.play(move), -1);
  assert.equal(state.winner(), 0);
  assert.equal(state.ply, 7);
  assert.equal(state.play(1), -1);
  assert.equal(state.ply, 7);
});

test('mirrors share one coarse structural and transition signature', () => {
  const pool = new ResidualPool();
  const moves = [1, 3, 2, 4, 1, 2, 5, 0, 4, 6];
  const a = new IsometricState({ pool, moves });
  const b = new IsometricState({ pool, moves: moves.map(reflectMove) });
  assert.deepEqual(Array.from(a.structuralSignature()).slice(0, 2), Array.from(b.structuralSignature()).slice(0, 2));
  assert.deepEqual(Array.from(a.gameplayKey()), Array.from(b.gameplayKey()));
});

test('typed guards use bit masks on the fast path and preserve unresolved semantics', () => {
  const state = new IsometricState({ moves: [0, 3] });
  const [cell0Lo, cell0Hi] = maskForCells([0]);
  const [cell1Lo, cell1Hi] = maskForCells([1]);
  const support0 = maskGuard({ supportAllLo: cell0Lo, supportAllHi: cell0Hi });
  const noSupport1 = maskGuard({ supportNoneLo: cell1Lo, supportNoneHi: cell1Hi });
  assert.equal(evaluateGuard(state, support0), GUARD_APPLICABLE);
  assert.equal(evaluateGuard(state, noSupport1), GUARD_APPLICABLE);
  assert.equal(evaluateGuard(state, turnGuard(state.sideToMove)), GUARD_APPLICABLE);
  assert.equal(evaluateGuard(state, rankGuard({ min: 2, max: 2 })), GUARD_APPLICABLE);
  assert.equal(evaluateGuard(state, realizabilityGuard({ proof: 'required' })), GUARD_UNRESOLVED);
  assert.equal(
    evaluateGuard(state, allGuards(support0, realizabilityGuard({ proof: 'required' }))),
    GUARD_UNRESOLVED,
  );
  assert.equal(
    evaluateGuard(state, allGuards(maskGuard({ supportAllLo: cell1Lo }), realizabilityGuard({ proof: 'required' }))),
    GUARD_INAPPLICABLE,
  );

  const reflected = reflectGuard(support0);
  const mirrored = new IsometricState({ moves: [reflectMove(0), reflectMove(3)] });
  assert.equal(evaluateGuard(mirrored, reflected), GUARD_APPLICABLE);
});

test('support packing uses 27 bits and exactly reflects column heights', () => {
  const state = new IsometricState({ moves: [0, 6, 0, 4, 2] });
  assert.ok(state.supportCode < 2 ** 27);
  assert.equal(state.supportCode, state.supportCodeFromState());
  const mirrored = new IsometricState({ moves: [6, 0, 6, 2, 4] });
  assert.equal(state.reflectedSupportCode(), mirrored.supportCode);
});
