import {Solver as DirectSolver} from './twoword_solver_capacity_fast.mjs';
import {Solver as TwoWaySolver} from './twoword_solver_2way_direct.mjs';
const WIDTH=7, HEIGHT=6, STRIDE=7;
const bot=[], col=[];
for(let c=0;c<WIDTH;c++){const sh=BigInt(c*STRIDE); bot[c]=1n<<sh; col[c]=((1n<<BigInt(HEIGHT))-1n)<<sh;}
function pairFromBig(x){return [Number(x & 0xffffffffn)>>>0, Number((x>>32n)&0xffffffffn)>>>0];}
function state(seq){let current=0n,mask=0n,moves=0; for(const ch of seq){const c=ch.charCodeAt(0)-49; const mv=(mask+bot[c])&col[c]; current^=mask; mask|=mv; moves++;} const [cLo,cHi]=pairFromBig(current),[mLo,mHi]=pairFromBig(mask); return {cLo,cHi,mLo,mHi,moves};}
const seq=process.argv[2]??'663152175'; const st=state(seq);
function runDirect(chunkPow){const s=new DirectSolver(chunkPow,true,15); const t0=process.hrtime.bigint(); const score=s.solveBits(st.cLo,st.cHi,st.mLo,st.mHi,st.moves); const sec=Number(process.hrtime.bigint()-t0)/1e9; return {kind:'direct',entries:(1<<chunkPow)*32768,score,nodes:s.nodes,sec,nps:s.nodes/sec};}
function runTwo(pow){const s=new TwoWaySolver(pow,true); const t0=process.hrtime.bigint(); const score=s.solveBits(st.cLo,st.cHi,st.mLo,st.mHi,st.moves); const sec=Number(process.hrtime.bigint()-t0)/1e9; return {kind:'2way',entries:1<<pow,score,nodes:s.nodes,sec,nps:s.nodes/sec,hits:s.hits,probes:s.probes};}
function medianRuns(fn,n=7){const arr=[]; for(let i=0;i<n;i++) arr.push(fn()); arr.sort((a,b)=>a.sec-b.sec); const m=arr[Math.floor(n/2)]; return {...m,all:arr.map(x=>({sec:x.sec,nodes:x.nodes,nps:x.nps}))};}
runDirect(2); runTwo(17);
for(const entries of [131072,262144]){
  const cp = entries===131072?2:3;
  const pw = entries===131072?17:18;
  console.log(JSON.stringify(medianRuns(()=>runDirect(cp))));
  console.log(JSON.stringify(medianRuns(()=>runTwo(pw))));
}
