import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { parse } from '../../../reference/research-prototypes/2026-09-09-winspace-native/support.mjs';
import { TypedWsl625ResidualSolver } from './residual_solver_wsl625_typed.mjs';
import { TypedA123Solver } from './typed_a123_solver.mjs';

const ROOTS=[{seq:'663152175',expected:-4,label:'anchor-loss'},{seq:'41267575',expected:3,label:'anchor-win'}];
const LIMITS=[2,4,6,8,12,16,255];
class GatedA123Solver extends TypedA123Solver{
  constructor(pow=19,maxReq=255){super(pow);this.maxReq=maxReq;this.a123GateSkips=0;}
  resetMetrics(){super.resetMetrics();this.a123GateSkips=0;}
  noWinA123(currentRef,height,moves){if(this.side.length[currentRef]>this.maxReq){this.a123GateSkips++;return false;}return super.noWinA123(currentRef,height,moves);}
  metrics(){return{...super.metrics(),a123GateSkips:this.a123GateSkips,maxReq:this.maxReq};}
}
function runBase(pos){const s=new TypedWsl625ResidualSolver(19),t=performance.now(),score=s.solve(pos);return{score,elapsedMs:performance.now()-t,...s.metrics()};}
function runGate(pos,maxReq){const s=new GatedA123Solver(19,maxReq),t=performance.now(),score=s.solve(pos);return{score,elapsedMs:performance.now()-t,...s.metrics()};}
const results=[];
for(const root of ROOTS){const pos=parse(root.seq),base=runBase(pos);assert.equal(base.score,root.expected);const forms=[];for(const maxReq of LIMITS){const r=runGate(pos,maxReq);assert.equal(r.score,root.expected,`${root.label} maxReq=${maxReq}`);forms.push({maxReq,...r,nodeRatio:r.nodes/base.nodes,timeRatio:r.elapsedMs/base.elapsedMs});console.error(`[A123 gate] ${root.label} <=${maxReq} nodes=${r.nodes} time=${r.elapsedMs.toFixed(1)}ms checks=${r.a123Checks} skips=${r.a123GateSkips} cuts=${r.a123Cuts}`);}results.push({...root,base,forms});}
console.log(JSON.stringify({kind:'connect4-minimax-typed-a123-residual-count-gates',status:'pass',safety:'gate only skips a sound A1-A3 certificate check when current residual antichain length exceeds maxReq; it cannot create a false cutoff',policy:'exploratory cross; no form rejected from this single timing pass; promising Pareto forms require repeated qualification',limits:LIMITS,results},null,2));
