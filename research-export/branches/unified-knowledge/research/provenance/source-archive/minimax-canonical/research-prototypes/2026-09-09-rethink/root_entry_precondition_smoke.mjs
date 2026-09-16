// Research boundary witness, not a modification to the inherited negamax kernel.
import assert from 'node:assert/strict';
import { Solver } from '../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs';
// Legal sequence 121212: P0 has three stones in column 1, P1 three in column 2.
// P0 moves next and wins immediately in column 1. Neither player has already won.
const state = { cLo:7, cHi:0, mLo:903, mHi:0, moves:6 };
const full = new Solver(15, true, 0);
const exact = full.solveBits(state.cLo,state.cHi,state.mLo,state.mHi,state.moves);
const direct = new Solver(15, true, 0);
const bound = direct.negamax(state.cLo,state.cHi,state.mLo,state.mHi,state.moves,17,18);
assert.equal(exact,18); assert.equal(full.nodes,0); assert.equal(bound,17);
assert.equal(direct.nodes,1);
console.log(JSON.stringify({seq:'121212',state,alpha:17,beta:18,immediateWinExpected:18,guardedSolveBits:exact,guardedNodes:full.nodes,unguardedNegamaxBound:bound,unguardedNodes:direct.nodes,conclusion:'negamax requires a no-immediate-win entry precondition; inspected coarse solve wrapper does not establish it at an arbitrary root',scope:'kernel entry witness plus source audit; not a complete worker-pool execution'}));
