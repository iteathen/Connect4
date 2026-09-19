import test from 'node:test';
import assert from 'node:assert/strict';
import { Connect4Position, STATUS_ONGOING } from '../../domain/index.mjs';
import { IsoMaxSolver } from '../solver.mjs';
import { makeCorpus } from '../../../benchmarks/isomax-ordering/corpus.mjs';
import { singletonEffectClass, promotedColumn, CENTER_ORDER } from '../move-order.mjs';
import { loadFixedControlSolver } from '../../../benchmarks/isomax-ordering/fixed-control.mjs';

test('native advisory effects agree with realized physical child threats, including mirrors and high cells', () => {
  const solver = new IsoMaxSolver();
  const counts = [0, 0, 0];
  let comparisons = 0, vetoes = 0, highCells = 0;
  for (const ply of [12, 21, 28, 35]) {
    for (const { moves } of makeCorpus({ seed: 100 + ply, ply, count: 32 })) {
      for (const replay of [moves, moves.map(c => 6-c)]) {
        const state = solver.createState(replay), physical = new Connect4Position(replay);
        let expectedPromotion = -1, bestClass = 0;
        for (const column of CENTER_ORDER) {
          if (!state.canPlay(column)) continue;
          const player = physical.sideToMove;
          const key = state.gameplayKey();
          const beforeClasses = solver.pool.classCount;
          const actual = singletonEffectClass(state, column);
          const record = physical.play(column);
          assert.equal(physical.status, STATUS_ONGOING);
          const own = physical.legalMoves().filter(c => physical.isWinningMove(c, player)).length;
          const opponent = physical.legalMoves().filter(c => physical.isWinningMove(c, 1-player)).length;
          const expected = opponent ? 0 : Math.min(2, own);
          assert.equal(actual, expected, JSON.stringify({ replay, column }));
          assert.deepEqual(state.gameplayKey(), key);
          assert.equal(solver.pool.classCount, beforeClasses);
          physical.undo(record);
          if (expected > bestClass) { bestClass = expected; expectedPromotion = column; }
          counts[actual]++; comparisons++; vetoes += Number(opponent > 0);
          highCells += Number(state.heights[column] * 7 + column >= 32);
        }
        assert.equal(promotedColumn(state), expectedPromotion);
      }
    }
  }
  assert.ok(counts.every(n => n > 0));
  assert.ok(vetoes > 0 && highCells > 0);
  console.log(JSON.stringify({ comparisons, counts, vetoes, highCells }));
});

function physicalValue(position, memo = new Map()) {
  if (position.status) return position.status === 1 ? 1 : position.status === 2 ? -1 : 0;
  const key = position.cells.join('') + position.sideToMove;
  if (memo.has(key)) return memo.get(key);
  const winning = position.sideToMove === 0 ? 1 : -1;
  let best = -winning;
  for (const column of position.legalMoves()) {
    const record = position.play(column);
    const value = physicalValue(position, memo);
    position.undo(record);
    best = winning === 1 ? Math.max(best, value) : Math.min(best, value);
    if (best === winning) break;
  }
  memo.set(key, best);
  return best;
}

test('both orders agree with physical exact WDL, root move choice and restoration', async () => {
  const Control = await loadFixedControlSolver();
  for (const ply of [34, 35]) {
    for (const { moves } of makeCorpus({ seed: 73 + ply, ply, count: 16 })) {
      const reference = new Connect4Position(moves);
      const expected = physicalValue(reference);
      const decisions = [];
      for (const Solver of [Control, IsoMaxSolver]) {
        const solver = new Solver(), state = solver.createState(moves);
        const before = state.gameplayKey();
        const result = solver.solve(state);
        assert.equal(result.value, expected);
        assert.deepEqual(state.gameplayKey(), before);
        assert.equal(state.ply, ply);
        const record = reference.play(result.move);
        assert.ok(record);
        assert.equal(physicalValue(reference), expected);
        reference.undo(record);
        decisions.push(result.move);
      }
      assert.equal(decisions[0], decisions[1]);
    }
  }
});

test('imported roots keep center-first order and reset root scope on each entry point', () => {
  class ObserveRoot extends IsoMaxSolver {
    solveNode(state) {
      if (state.ply === this.orderingRootPly + 1) {
        this.firstColumn = state.moveCells[this.orderingRootPly] % 7;
        throw new Error('observed first root child');
      }
      return super.solveNode(state);
    }
  }
  const solver = new ObserveRoot();
  for (const ply of [21, 28]) {
    const roots = makeCorpus({ seed: 100 + ply, ply, count: 32 });
    const moves = roots.find(({ moves }) => {
      const state = solver.createState(moves);
      const promotion = promotedColumn(state);
      return promotion >= 0 && promotion !== CENTER_ORDER.find(c => state.canPlay(c));
    })?.moves;
    assert.ok(moves, 'fixture must distinguish root order from advisory promotion');
    for (const method of ['solveValue', 'solve']) {
      const state = solver.createState(moves), before = state.gameplayKey();
      solver.metrics.orderingPromotions = 999;
      assert.throws(() => solver[method](state), /observed first root child/);
      assert.equal(solver.firstColumn, CENTER_ORDER.find(c => state.canPlay(c)));
      assert.equal(solver.metrics.orderingPromotions, 0);
      assert.equal(solver.orderingRootPly, ply);
      assert.equal(state.ply, ply);
      assert.deepEqual(state.gameplayKey(), before);
    }
  }
});
