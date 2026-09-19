import test from 'node:test';
import assert from 'node:assert/strict';
import { Connect4Position } from '../../components/domain/index.mjs';
import { exactValueConclusion, noWinConclusion, rankGuard } from '../../components/isometric/index.mjs';
import { makeCorpus } from '../isomax-ordering/corpus.mjs';
import { loadSolver, VARIANTS } from './variants.mjs';

function value(p, memo = new Map()) {
  if (p.status) return p.status === 1 ? 1 : p.status === 2 ? -1 : 0;
  const key = p.cells.join('') + p.sideToMove;
  if (memo.has(key)) return memo.get(key);
  const target = p.sideToMove === 0 ? 1 : -1;
  let best = -target;
  for (const c of p.legalMoves()) {
    const record = p.play(c), child = value(p, memo); p.undo(record);
    best = target === 1 ? Math.max(best,child) : Math.min(best,child);
    if (best === target) break;
  }
  memo.set(key,best); return best;
}
const snapshot = s => [s.ply,s.sideToMove,s.status,s.p0Class,s.p1Class,s.supportCode,
  s.supportLo,s.supportHi,s.playableLo,s.playableHi,[...s.heights],[...s.gameplayKey()]];

test('isolated candidates preserve physical WDL, all root-action values, moves and restoration', async () => {
  const classes = await Promise.all(VARIANTS.map(loadSolver));
  const coverage = { p0Empty:0,p1Empty:0,bothEmpty:0,terminal:0,roots:0,actions:0 };
  const roots = [34,35,38,39].flatMap(ply => makeCorpus({seed:0xc401+ply,ply,count:16}));
  roots.push({moves:[0,1,0,1,0,1,0]}, {moves:[0,1,0,1,2,1,2,1]});
  for (const { moves } of roots) for (const replay of [moves,moves.map(c=>6-c)]) {
    const physical = new Connect4Position(replay), expected = value(physical);
    let controlMove;
    for (const [i,Solver] of classes.entries()) {
      const solver = new Solver(), state = solver.createState(replay), before = snapshot(state);
      if (i===0) {
        coverage.roots++; coverage.p0Empty += Number(state.p0Class===0);
        coverage.p1Empty += Number(state.p1Class===0);
        coverage.bothEmpty += Number(state.p0Class===0 && state.p1Class===0);
        coverage.terminal += Number(state.isTerminal());
      }
      const result = solver.solve(state);
      assert.equal(result.value,expected,VARIANTS[i]);
      assert.deepEqual(snapshot(state),before);
      if(i===0) controlMove=result.move; else assert.equal(result.move,controlMove);
      if (state.isTerminal()) continue;
      for (const c of physical.legalMoves()) {
        const record=physical.play(c), childExpected=value(physical); physical.undo(record);
        state.applyUnchecked(c);
        assert.equal(solver.solveValue(state).value,childExpected);
        state.undo(); assert.deepEqual(snapshot(state),before);
        if(i===0) coverage.actions++;
      }
    }
  }
  assert.ok(coverage.p0Empty && coverage.p1Empty && coverage.bothEmpty && coverage.terminal);
  console.log(JSON.stringify({coverage}));
});

test('certificate contradictions still fail closed for every candidate', async () => {
  for (const variant of VARIANTS) {
    const Solver=await loadSolver(variant), solver=new Solver();
    const state=solver.createState(makeCorpus({seed:421,ply:34,count:1})[0].moves);
    const guard=rankGuard({min:34,max:34});
    solver.certificates.add(state,{guard,conclusion:exactValueConclusion(1),proofIdentity:'win'});
    solver.certificates.add(state,{guard,conclusion:noWinConclusion(0),proofIdentity:'no-win'});
    assert.throws(()=>solver.solveValue(state),/contradict/);
  }
});

test('exhaustion candidate remains active without certificates; obsolete I6 is rejected', async () => {
  await assert.rejects(loadSolver('I6-empty-facts'), /unknown candidate/);
  const Solver = await loadSolver('I1-both');
  let bounds = 0;
  for (const { moves } of makeCorpus({ seed: 0xc401 + 34, ply: 34, count: 16 })) {
    const solver = new Solver();
    const original = solver.assertNoWinBounds;
    solver.assertNoWinBounds = function (value, p0, p1) {
      if (p0 || p1) bounds++;
      return original.call(this, value, p0, p1);
    };
    solver.solveMoves(moves);
  }
  assert.ok(bounds > 0, 'candidate must not hide inside the nonempty-certificate branch');
});
