import {Solver,pairFromBig} from './twoword_solver_capacity_fast.mjs';
const WIDTH=7,HEIGHT=6,STRIDE=7;
const bot=[], col=[];
for(let c=0;c<WIDTH;c++){const sh=BigInt(c*STRIDE); bot[c]=1n<<sh; col[c]=((1n<<BigInt(HEIGHT))-1n)<<sh;}
function state(seq){let current=0n,mask=0n,moves=0; for(const ch of seq){const c=ch.charCodeAt(0)-49; const mv=(mask+bot[c])&col[c]; current^=mask; mask|=mv; moves++;} const [cLo,cHi]=pairFromBig(current),[mLo,mHi]=pairFromBig(mask); return {cLo,cHi,mLo,mHi,moves};}
function run(pow,st){const s=new Solver(pow,true,15); const t0=process.hrtime.bigint(); const score=s.solveBits(st.cLo,st.cHi,st.mLo,st.mHi,st.moves); const sec=Number(process.hrtime.bigint()-t0)/1e9; return {pow,chunks:1<<pow,slots:(1<<pow)*32768,score,nodes:s.nodes,sec,nps:s.nodes/sec};}
const seq=process.argv[2]??'663152175', st=state(seq);
// Warm code in this isolate with sacrificial solves.
for(let i=0;i<2;i++) run(2,st);
for(const p of [0,1,2,3,4,5,6]){
  const rs=[]; for(let r=0;r<5;r++) rs.push(run(p,st));
  rs.sort((a,b)=>a.sec-b.sec); const m=rs[2];
  console.log(JSON.stringify({...m,seq,allSec:rs.map(x=>x.sec),allNodes:rs.map(x=>x.nodes)}));
}
