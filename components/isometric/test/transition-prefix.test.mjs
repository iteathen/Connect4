import test from 'node:test';
import assert from 'node:assert/strict';
import { ResidualPool } from '../residual-pool.mjs';
import { IsoMaxSolver } from '../solver.mjs';
import { IsometricState } from '../state.mjs';
import { makeCorpus } from '../../../benchmarks/isomax-ordering/corpus.mjs';

test('fixed transition prefixes preserve exact residual, singleton, reflection and undo semantics', () => {
  const pools = [1, 4096, 65536].map(transitionPrefixClasses => new ResidualPool({ transitionPrefixClasses }));
  for (const { moves } of makeCorpus({ seed: 75, ply: 28, count: 48 })) {
    const states = pools.map(pool => new IsometricState({ pool }));
    const compare = () => {
      for (let i = 1; i < states.length; i++) {
        const a = states[0], b = states[i];
        for (const key of ['p0Class', 'p1Class', 'supportCode', 'supportLo', 'supportHi', 'playableLo', 'playableHi', 'sideToMove', 'status', 'ply'])
          assert.equal(b[key], a[key], key);
        assert.deepEqual(b.gameplayKey(), a.gameplayKey());
        for (const name of ['p0Class', 'p1Class']) if (a[name] >= 0) {
          assert.deepEqual(pools[i].termIds(b[name]), pools[0].termIds(a[name]));
          assert.equal(pools[i].singletonLo[b[name]], pools[0].singletonLo[a[name]]);
          assert.equal(pools[i].singletonHi[b[name]], pools[0].singletonHi[a[name]]);
        }
      }
    };
    for (const column of moves) { for (const state of states) state.play(column); compare(); }
    for (let ply = moves.length; ply > 0; ply--) { for (const state of states) state.undo(); compare(); }
  }
});

test('64K default crosses its prefix and preserves complete exact solve work versus 4K', () => {
  const moves = Array.from('466537327657277224', c => Number(c) - 1);
  const small = new IsoMaxSolver({ pool: new ResidualPool({ transitionPrefixClasses: 4096 }) });
  const large = new IsoMaxSolver();
  const expected = small.solveMoves(moves), actual = large.solveMoves(moves);
  assert.deepEqual(actual, expected);
  assert.equal(large.pool.transitionPrefixClasses, 65536);
  assert.ok(large.pool.classCount > 65536);
  assert.equal(large.pool.ownTransitions.byteLength + large.pool.blockTransitions.byteLength, 21 * 1024 * 1024);
});
