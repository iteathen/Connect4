import test from 'node:test';
import assert from 'node:assert/strict';
import { PhysicalControl } from '../qualification/physical-control.mjs';
import { IsometricState, IsoMaxSolver, IsoMaxCertificateIndex, rankGuard, noWinConclusion } from '../index.mjs';

test('recursive winning evidence cannot be clamped to draw by a contradictory no-win certificate', () => {
  const cases = [
    [1,4,1,6,6,6,5,6,2,6,6,3,2,3,4,3,4,5,2,1,3,0,5,0,3,4,3,4,0,1,1,0,4,2],
    [4,5,3,2,4,3,1,2,4,0,3,5,6,0,3,5,5,0,0,0,5,4,6,2,2,4,4,3,5,6,2,0,6,3,1,6,2],
  ];
  for (const moves of cases) {
  const player = moves.length & 1;
  const winningValue = player === 0 ? 1 : -1;
  const expected = new PhysicalControl(moves).solve();
  assert.equal(expected.value,winningValue);
  const state = new IsometricState({moves}), pool = state.pool;
  const before = state.gameplayKey();
  assert.equal(new IsoMaxSolver({pool}).solveValue(state).value,winningValue);
  const certificates = new IsoMaxCertificateIndex(pool);
  certificates.add(state,{guard:rankGuard({min:moves.length,max:moves.length}),conclusion:noWinConclusion(player)});
  const solver = new IsoMaxSolver({pool,certificates});
  assert.throws(()=>solver.solveValue(state),/violates P[01] no-win/);
  assert.deepEqual(state.gameplayKey(),before);
  assert.equal(state.ply,moves.length);
  assert.equal(solver.transitionCache.get(state),undefined,'contradiction must not publish a draw');
  }
});
