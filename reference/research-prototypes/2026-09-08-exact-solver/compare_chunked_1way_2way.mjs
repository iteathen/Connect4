import {Solver as DirectSolver} from './twoword_solver_capacity_fast.mjs';
import {Solver as TwoWaySolver} from './twoword_solver_capacity_2way.mjs';
const WIDTH=7, HEIGHT=6, STRIDE=7; const bot=[], col=[];
for(let c=0;c<WIDTH;c++){const sh=BigInt(c*STRIDE); bot[c]=1n<<sh; col[c]=((1n<<BigInt(HEIGHT))-1n)<<sh;}
function pair(x){return [Number(x&0xffffffffn)>>>0,Number((x>>32n)&0xffffffffn)>>>0];}
function state(seq){let current=0n,mask=0n,moves=0; for(const ch of seq){const c=ch.charCodeAt(0)-49; const mv=(mask+bot[c])&col[c]; current^=mask; mask|=mv; moves++;} const [cLo,cHi]=pair(current),[mLo,mHi]=pair(mask); return {cLo,cHi,mLo,mHi,moves};}
const seq=process.argv[2]??'663152175', st=state(seq);
function run(Cls, cp){const s=new Cls(cp,true,15); const t0=process.hrtime.bigint(); const score=s.solveBits(st.cLo,st.cHi,st.mLo,st.mHi,st.moves); const sec=Number(process.hrtime.bigint()-t0)/1e9; return {score,nodes:s.nodes,sec,nps:s.nodes/sec};}
function med(Cls,cp,n=9){const a=[];for(let i=0;i<n;i++)a.push(run(Cls,cp));a.sort((x,y)=>x.sec-y.sec);return {median:a[n>>1],all:a};}
run(DirectSolver,2);run(TwoWaySolver,2);
for(const cp of [2,3]){
  console.log(JSON.stringify({kind:'1way',entries:(1<<cp)*32768,...med(DirectSolver,cp)}));
  console.log(JSON.stringify({kind:'2way',entries:(1<<cp)*32768,...med(TwoWaySolver,cp)}));
}
