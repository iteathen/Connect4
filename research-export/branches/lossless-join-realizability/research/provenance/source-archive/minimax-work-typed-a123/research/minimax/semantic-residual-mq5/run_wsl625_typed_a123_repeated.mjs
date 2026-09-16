import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { parse } from '../../../reference/research-prototypes/2026-09-09-winspace-native/support.mjs';
import { TypedWsl625ResidualSolver } from './residual_solver_wsl625_typed.mjs';
import { TypedA123Solver } from './typed_a123_solver.mjs';

const ROOTS=[{seq:'663152175',expected:-4,nodes:557605,label:'anchor-loss'},{seq:'41267575',expected:3,nodes:3161623,label:'anchor-win'}],REPS=5,WARM=1;
function run(Ctor,pos){const s=new Ctor(19),t=performance.now(),score=s.solve(pos),elapsedMs=performance.now()-t;return{score,elapsedMs,...s.metrics()};}function med(v){const a=[...v].sort((x,y)=>x-y),n=a.length;return n&1?a[n>>1]:(a[n/2-1]+a[n/2])/2;}
const results=[];for(const root of ROOTS){const pos=parse(root.seq),rows=[];for(let rep=0;rep<REPS;rep++){const order=(rep&1)?[['a123',TypedA123Solver],['base',TypedWsl625ResidualSolver]]:[['base',TypedWsl625ResidualSolver],['a123',TypedA123Solver]],row={rep};for(const[name,C]of order)row[name]=run(C,pos);assert.equal(row.base.score,root.expected);assert.equal(row.a123.score,root.expected);assert.equal(row.a123.nodes,root.nodes);rows.push(row);}const timed=rows.filter(r=>r.rep>=WARM),b=med(timed.map(r=>r.base.elapsedMs)),a=med(timed.map(r=>r.a123.elapsedMs));results.push({...root,baseMedianMs:b,a123MedianMs:a,timeRatio:a/b,nodeRatio:root.nodes/rows[0].base.nodes,speedup:b/a,rows:rows.map(r=>({rep:r.rep,baseMs:r.base.elapsedMs,a123Ms:r.a123.elapsedMs}))});console.error(`[typed+A123 repeated] ${root.label} base=${b.toFixed(1)} a123=${a.toFixed(1)} ratio=${(a/b).toFixed(3)}`);}
console.log(JSON.stringify({kind:'connect4-minimax-typed-a123-repeated',status:'pass',policy:'5 alternating-order runs per anchor; first run warmup; exact score and previously-qualified A123 node count asserted every repetition',results},null,2));
