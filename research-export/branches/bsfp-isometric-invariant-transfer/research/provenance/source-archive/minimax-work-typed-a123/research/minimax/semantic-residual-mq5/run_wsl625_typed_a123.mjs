import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { parse } from '../../../reference/research-prototypes/2026-09-09-winspace-native/support.mjs';
import { TypedWsl625ResidualSolver } from './residual_solver_wsl625_typed.mjs';
import { TypedA123Solver } from './typed_a123_solver.mjs';

const ROOTS=[{seq:'663152175',expected:-4,expectedA123Nodes:557605,label:'anchor-loss'},{seq:'41267575',expected:3,expectedA123Nodes:3161623,label:'anchor-win'}];
function run(Ctor,pos){const s=new Ctor(19),t=performance.now(),score=s.solve(pos),elapsedMs=performance.now()-t;return{score,elapsedMs,...s.metrics()};}
const results=[];for(const root of ROOTS){const pos=parse(root.seq),base=run(TypedWsl625ResidualSolver,pos),a123=run(TypedA123Solver,pos);assert.equal(base.score,root.expected);assert.equal(a123.score,root.expected);assert.equal(a123.nodes,root.expectedA123Nodes,`${root.label}: A123 proof tree drift from prior Map-backed qualification`);results.push({...root,base,a123,ratios:{nodes:a123.nodes/base.nodes,elapsed:a123.elapsedMs/base.elapsedMs,states:a123.stateArena.states/base.stateArena.states,sideStates:a123.sideArena.sideStates/base.sideArena.sideStates,prepares:a123.stateArena.prepareCalls/base.stateArena.prepareCalls,writes:a123.writeSuccess/base.writeSuccess}});console.error(`[typed+A123] ${root.label} base nodes=${base.nodes} ${base.elapsedMs.toFixed(1)}ms A123=${a123.nodes} ${a123.elapsedMs.toFixed(1)}ms nodeRatio=${(a123.nodes/base.nodes).toFixed(4)} timeRatio=${(a123.elapsedMs/base.elapsedMs).toFixed(4)}`);}
console.log(JSON.stringify({kind:'connect4-minimax-typed-mq5-plus-geometry-a123',status:'pass',pipeline:'typed exact WSL-625 semantic state + existing exact tactics/bounds + geometry-native A1-A3 one-sided no-win bound',authority:'A123 only tightens beta to draw on non-forced TT-miss decision states; TT authority remains exact lower/upper-bound encoding',results},null,2));
