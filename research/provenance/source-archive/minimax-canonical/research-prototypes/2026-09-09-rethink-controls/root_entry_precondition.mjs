// Research-only: demonstrate the root guard required before ordinary negamax/shell.
// No change to the retained kernel. The coarse_selective_promotion_bench.mjs
// solve() entry at 990686a calls pneg() directly; prepare() has the same score cap.
import assert from 'node:assert/strict';
import { Solver } from '../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs';
const sequence='121212';
let current=0n,mask=0n;
for(const digit of sequence){const b=1n<<BigInt((Number(digit)-1)*7),move=(mask+b)&(63n*b);current^=mask;mask|=move;}
const pair=n=>[Number(n&0xffffffffn)>>>0,Number(n>>32n)>>>0];
const [cLo,cHi]=pair(current),[mLo,mHi]=pair(mask),moves=sequence.length;
// Independent vertical proof: current player owns three bottom cells in column 1,
// fourth is empty, so placing there wins immediately on move 7.
assert.equal(current&7n,7n);assert.equal(mask&8n,0n);
const expected=Math.trunc((43-moves)/2);
const solver=new Solver(15,true,0);
const guardedScore=solver.solveBits(cLo,cHi,mLo,mHi,moves);
solver.resetMetrics();
const directNullWindow=solver.negamax(cLo,cHi,mLo,mHi,moves,expected-1,expected);
const shellUpperCap=Math.trunc((41-moves)/2);
assert.equal(expected,18);assert.equal(guardedScore,expected);
assert.equal(directNullWindow,17);assert(shellUpperCap<expected);
console.log(JSON.stringify({sequence,cLo,cHi,mLo,mHi,moves,expected,guardedScore,directNullWindow,shellUpperCap,nodes:solver.nodes,meaning:'Internal negamax precondition violated by this direct call; coarse solve entry needs immediate-win guard. Existing layout benchmark positions are not invalidated by this counterexample.'}));
