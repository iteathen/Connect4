import test from 'node:test';
import assert from 'node:assert/strict';
import { nativeFrontierCode, deriveNativeFrontierConsequence } from '../frontier.mjs';
import { IsoMaxSolver } from '../solver.mjs';
import { STATUS_ONGOING } from '../../domain/index.mjs';

test('scalar frontier classifies every single and paired cell across both words', () => {
  const pool = { emptyClass: 0, singletonLo: new Uint32Array(3), singletonHi: new Uint32Array(3) };
  const state = { pool, status: STATUS_ONGOING, p0Class: 1, p1Class: 2,
    playableLo: 0xffffffff, playableHi: 0x3ff, sideToMove: 0 };
  for (let side = 0; side < 2; side++) {
    state.sideToMove = side;
    const own = side + 1, opponent = 2 - side;
    for (let a = 0; a < 42; a++) {
      for (let b = a; b < 42; b++) {
        pool.singletonLo.fill(0); pool.singletonHi.fill(0);
        for (const cell of [a, b]) {
          if (cell < 32) pool.singletonLo[opponent] |= 1 << cell;
          else pool.singletonHi[opponent] |= 1 << (cell - 32);
        }
        assert.equal(nativeFrontierCode(state), a === b ? 64 + a : side === 0 ? 17 : 19);
        const conclusion = deriveNativeFrontierConsequence(state);
        assert.ok(Object.isFrozen(conclusion));
        assert.strictEqual(deriveNativeFrontierConsequence(state), conclusion);
        // First-win precedence must survive the multiple-threat shortcut.
        pool.singletonLo[own] = 1;
        assert.equal(nativeFrontierCode(state), side === 0 ? 11 : 9);
      }
    }
  }
});

test('default recursion skips certificate materialization and conclusion construction', () => {
  const solver = new IsoMaxSolver();
  const state = solver.createState(Array.from('466537327657277224', c => Number(c) - 1));
  solver.collectCertificateFacts = () => { throw new Error('empty certificate path entered'); };
  const freeze = Object.freeze;
  Object.freeze = () => { throw new Error('recursive object freezing'); };
  try {
    const result = solver.solve(state);
    assert.ok([-1, 0, 1].includes(result.value));
    assert.equal(state.ply, 18);
  } finally { Object.freeze = freeze; }
});
