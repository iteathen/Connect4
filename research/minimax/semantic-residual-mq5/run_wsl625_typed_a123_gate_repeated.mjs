import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { parse } from '../../../reference/research-prototypes/2026-09-09-winspace-native/support.mjs';
import { TypedWsl625ResidualSolver } from './residual_solver_wsl625_typed.mjs';
import { TypedA123Solver } from './typed_a123_solver.mjs';

const ROOTS={loss:{seq:'663152175',expected:-4,label:'anchor-loss'},win:{seq:'41267575',expected:3,label:'anchor-win'}};
const selected=process.argv[2]??'loss',root=ROOTS[selected];if(!root)throw new Error(`unknown root ${selected}`);
const LIMITS=[2,12,16,255],REPS=5,WARM=1;
class Gated extends TypedA123Solver{constructor(pow=19,maxReq=255){super(pow);this.maxReq=maxReq;this.a123GateSkips=0;}resetMetrics(){super.resetMetrics();this.a123GateSkips=0;}noWinA123(ref,h,m){if(this.side.length[ref]>this.maxReq){this.a123GateSkips++;return false;}return super.noWinA123(ref,h,m);}metrics(){return{...super.metrics(),maxReq:this.maxReq,a123GateSkips:this.a123GateSkips};}}
function runBase(pos){const s=new TypedWsl625ResidualSolver(19),t=performance.now(),score=s.solve(pos);return{score,elapsedMs:performance.now()-t,...s.metrics()};}
function runGate(pos,maxReq){const s=new Gated(19,maxReq),t=performance.now(),score=s.solve(pos);return{score,elapsedMs:performance.now()-t,...s.metrics()};}
function med(v){const a=[...v].sort((x,y)=>x-y),n=a.length;return n&1?a[n>>1]:(a[n/2-1]+a[n/2])/2;}
const pos=parse(root.seq),forms=['base',...LIMITS.map(String)],rows=[];
for(let rep=0;rep<REPS;rep++){const order=forms.slice(rep%forms.length).concat(forms.slice(0,rep%forms.length));const row={rep};for(const form of order){const r=form==='base'?runBase(pos):runGate(pos,Number(form));assert.equal(r.score,root.expected,`${root.label} rep=${rep} form=${form}`);row[form]=r;}rows.push(row);}
const timed=rows.filter(r=>r.rep>=WARM),summary={};for(const form of forms){const rr=timed.map(r=>r[form]),x=rows[0][form];summary[form]={nodes:x.nodes,medianMs:med(rr.map(r=>r.elapsedMs)),checks:x.a123Checks??0,cuts:x.a123Cuts??0,skips:x.a123GateSkips??0};}
for(const form of forms.filter(x=>x!=='base')){summary[form].nodeRatio=summary[form].nodes/summary.base.nodes;summary[form].timeRatio=summary[form].medianMs/summary.base.medianMs;}
console.log(JSON.stringify({kind:'connect4-minimax-typed-a123-gate-repeated',status:'pass',root,policy:`${REPS} rotated-order runs, first ${WARM} warmup; safe gate only skips certificate checks`,summary,rows:rows.map(r=>({rep:r.rep,...Object.fromEntries(forms.map(f=>[f,{nodes:r[f].nodes,ms:r[f].elapsedMs}]))}))},null,2));