// Safety-only added boundary check; not included in favorable timing cohorts.
import assert from 'node:assert/strict';
import {trajectory,rng,bits,brute} from './domain.mjs';
import {compile,makeGeometry} from './requirements.mjs';
import {Solver} from '../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs';
const random=rng(0xdead0909),g=makeGeometry();let found=false;
for(let i=0;i<10000;i++){
  const t=trajectory(random,40,{avoidWins:true});if(!t)continue;
  const cp=compile(t.state,g);if(!cp.draw)continue;
  const b=bits(t.state),oracle=brute(t.state),q=new Solver(15),score=q.solveBits(b.cLo,b.cHi,b.mLo,b.mHi,b.moves)||0;
  assert.equal(oracle.value,0);assert.equal(score,0);
  console.log(JSON.stringify({kind:'bothDeadGuard',seq:t.seq,attempts:i+1,ply:b.moves,compilerDraw:cp.draw,oracle:oracle.value,baseline:score,oracleNodes:oracle.nodes,passed:true}));found=true;break;
}
assert(found,'draw boundary was not covered');
