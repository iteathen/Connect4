import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CELL_COUNT,
  COLUMNS,
  STATUS_DRAW,
  STATUS_ONGOING,
  STATUS_PLAYER0_WIN,
  STATUS_PLAYER1_WIN,
  Connect4Position,
} from '../../domain/index.mjs';
import {
  IsoMaxCertificateIndex,
  IsoMaxSolver,
  ResidualPool,
  allGuards,
  maskGuard,
  noWinConclusion,
  rankGuard,
  turnGuard,
} from '../index.mjs';

const DRAW_GAME = Object.freeze([
  1, 5, 2, 3, 6, 3, 2, 5, 4, 4, 1, 3, 0, 2, 5, 0, 6, 1, 6, 1, 2,
  2, 0, 1, 5, 0, 2, 5, 0, 5, 0, 6, 4, 4, 4, 6, 1, 4, 3, 3, 6, 3,
]);

function reflectMoves(moves) {
  return moves.map((column) => COLUMNS - 1 - column);
}

function terminalValue(position) {
  if (position.status === STATUS_PLAYER0_WIN) return 1;
  if (position.status === STATUS_PLAYER1_WIN) return -1;
  if (position.status === STATUS_DRAW) return 0;
  return null;
}

function positionKey(position) {
  let key = `${position.sideToMove}:`;
  for (let index = 0; index < CELL_COUNT; index += 1) key += String.fromCharCode(48 + position.cells[index]);
  return key;
}

function solvePhysical(position, memo = new Map()) {
  const terminal = terminalValue(position);
  if (terminal !== null) return terminal;
  const key = positionKey(position);
  const cached = memo.get(key);
  if (cached !== undefined) return cached;

  const maximizing = position.sideToMove === 0;
  let best = maximizing ? -1 : 1;
  for (const column of position.legalMoves()) {
    const record = position.play(column);
    assert.ok(record);
    const value = solvePhysical(position, memo);
    assert.equal(position.undo(record), true);
    if (maximizing) {
      if (value > best) best = value;
      if (best === 1) break;
    } else {
      if (value < best) best = value;
      if (best === -1) break;
    }
  }
  memo.set(key, best);
  return best;
}

function exactSupportGuard(state) {
  const boardLo = 0xffff_ffff >>> 0;
  const boardHi = 0x3ff;
  return allGuards(
    maskGuard({
      supportAllLo: state.supportLo,
      supportAllHi: state.supportHi,
      supportNoneLo: (boardLo & ~state.supportLo) >>> 0,
      supportNoneHi: (boardHi & ~state.supportHi) >>> 0,
    }),
    turnGuard(state.sideToMove),
    rankGuard({ min: state.ply, max: state.ply }),
  );
}

test('native IsoMax exact residue solver agrees with independent physical minimax on late roots', () => {
  const pool = new ResidualPool();
  const solver = new IsoMaxSolver({ pool });
  const prefixes = [34, 35, 36];

  for (const length of prefixes) {
    for (const moves of [DRAW_GAME.slice(0, length), reflectMoves(DRAW_GAME.slice(0, length))]) {
      const physical = new Connect4Position(moves);
      assert.equal(physical.status, STATUS_ONGOING);
      const expected = solvePhysical(physical);

      const state = solver.createState(moves);
      const result = solver.solve(state);
      assert.equal(result.value, expected, `W/D/L mismatch at prefix length ${length}`);
      assert.notEqual(result.move, null);

      const chosen = physical.play(result.move);
      assert.ok(chosen, `solver returned illegal move ${result.move}`);
      assert.equal(solvePhysical(physical), expected, `selected move does not preserve exact value at prefix length ${length}`);
    }
  }
});

test('guarded no-win certificates can close exact draw residue without changing W/D/L', () => {
  let selected = null;
  for (const length of [34, 33, 32]) {
    const moves = DRAW_GAME.slice(0, length);
    const physical = new Connect4Position(moves);
    const expected = solvePhysical(physical);
    assert.equal(expected, 0);

    const baselinePool = new ResidualPool();
    const baselineSolver = new IsoMaxSolver({ pool: baselinePool });
    const baselineState = baselineSolver.createState(moves);
    const baseline = baselineSolver.solveValue(baselineState);
    assert.equal(baseline.value, 0);
    if (baseline.metrics.nodes > 1) {
      selected = { moves, baselineNodes: baseline.metrics.nodes };
      break;
    }
  }
  assert.ok(selected, 'expected at least one late draw prefix requiring unresolved residue search');

  const pool = new ResidualPool();
  const certificates = new IsoMaxCertificateIndex(pool);
  const state = new IsoMaxSolver({ pool, certificates }).createState(selected.moves);
  const guard = exactSupportGuard(state);
  certificates.add(state, { guard, conclusion: noWinConclusion(0), proofIdentity: 'late-draw-p0-no-win' });
  certificates.add(state, { guard, conclusion: noWinConclusion(1), proofIdentity: 'late-draw-p1-no-win' });

  const solver = new IsoMaxSolver({ pool, certificates });
  const result = solver.solveValue(state);
  assert.equal(result.value, 0);
  assert.equal(result.metrics.nodes, 1);
  assert.ok(result.metrics.nodes < selected.baselineNodes);
  assert.equal(result.metrics.certificateNoWinHits, 2);
});

test('contradictory exact and no-win certificates fail closed', () => {
  const pool = new ResidualPool();
  const certificates = new IsoMaxCertificateIndex(pool);
  const solver = new IsoMaxSolver({ pool, certificates });
  const state = solver.createState(DRAW_GAME.slice(0, 36));
  const guard = exactSupportGuard(state);

  certificates.add(state, {
    guard,
    conclusion: { kind: 1, value: 1, distance: null },
    proofIdentity: 'contradictory-p0-win',
  });
  certificates.add(state, {
    guard,
    conclusion: noWinConclusion(0),
    proofIdentity: 'contradictory-p0-no-win',
  });
  assert.throws(() => solver.solveValue(state), /contradicts an applicable no-win certificate/);
});
