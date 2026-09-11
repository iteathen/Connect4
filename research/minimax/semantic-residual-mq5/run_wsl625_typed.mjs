import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { parse } from '../../../reference/research-prototypes/2026-09-09-winspace-native/support.mjs';
import { Wsl625ResidualSolver } from './residual_solver_wsl625.mjs';
import { TypedWsl625ResidualSolver } from './residual_solver_wsl625_typed.mjs';

const ROOTS=[{seq:'663152175',expected:-4,label:'anchor-loss'},{seq:'41267575',expected:3,label:'anchor-win'}];
function run(Ctor,position){const solver=new Ctor(19),t=performance.now(),score=solver.solve(position),elapsedMs=performance.now()-t;return{score,elapsedMs,...solver.metrics()};}
function exactParity(a,b,label){
  const scalar=['score','nodes','ttHits','writeAttempts','writeSuccess','forcedTransitions','drawStops'];for(const k of scalar)assert.equal(b[k],a[k],`${label}: ${k}`);
  const state=['states','internHits','prepareCalls'];for(const k of state)assert.equal(b.stateArena[k],a.stateArena[k],`${label}: stateArena.${k}`);
  const side=['sideStates','storedRequirementIds','moverTransitionCacheEntries','blockerTransitionCacheEntries','normalizeCalls','internHits'];for(const k of side)assert.equal(b.sideArena[k],a.sideArena[k],`${label}: sideArena.${k}`);
}
const results=[];
for(const root of ROOTS){const position=parse(root.seq),base=run(Wsl625ResidualSolver,position),typed=run(TypedWsl625ResidualSolver,position);assert.equal(base.score,root.expected);assert.equal(typed.score,root.expected);exactParity(base,typed,root.label);results.push({...root,base,typed,ratios:{elapsed:typed.elapsedMs/base.elapsedMs,search:typed.searchMs/base.searchMs},typedBytes:{sideSlots:typed.sideArena.typedSideSlotBytes,stateSlots:typed.stateArena.typedStateSlotBytes,moverTransitions:typed.sideArena.moverTransitionBytes,blockerTransitions:typed.sideArena.blockerTransitionBytes}});console.error(`[MQ5 typed] ${root.label} nodes=${typed.nodes} base=${base.elapsedMs.toFixed(1)}ms typed=${typed.elapsedMs.toFixed(1)}ms ratio=${(typed.elapsedMs/base.elapsedMs).toFixed(3)}`);}
console.log(JSON.stringify({kind:'connect4-minimax-mq5-typed-exact-interning',status:'pass',authority:'exact identity requires full record equality after every open-address collision; hashes and slots are addressing only',fairness:'same WSL-625 state law, search policy, TT size/banks and transition semantics; only side/state interning plus mover/blocker cache containers change',results},null,2));
