import { Solver } from '../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs';
const REPEATS=Math.max(1,Number(process.argv[2]??7)|0),POW=Number(process.argv[3]??19)|0,SIZE=1<<POW,ARENA=SIZE*2;
const A1={id:91,sig2:1008138,cLo:1075839104,cHi:7168,mLo:1881145473,mHi:15384,moves:12,alpha:3,beta:4};
const B ={id:112,sig2:975370,cLo:1075839104,cHi:3088,mLo:4028629121,mHi:3128,moves:12,alpha:3,beta:4};
const A2={id:130,sig2:1008138,cLo:1075839104,cHi:3104,mLo:1881145473,mHi:3192,moves:12,alpha:3,beta:4};
const keyLoSab=new SharedArrayBuffer(ARENA*4),keyHiSab=new SharedArrayBuffer(ARENA*4),valSab=new SharedArrayBuffer(ARENA),ctrlSab=new SharedArrayBuffer(ARENA*4),ownerSab=new SharedArrayBuffer(ARENA);
const solver=new Solver(15,false,0);
function clearAll(){new Uint32Array(keyLoSab).fill(0);new Uint32Array(keyHiSab).fill(0);new Uint8Array(valSab).fill(0);new Int32Array(ctrlSab).fill(0);new Uint8Array(ownerSab).fill(0);}
function setRegion(off){solver.size=SIZE;solver.mask=SIZE-1;solver.keyLo=new Uint32Array(keyLoSab,off*4,SIZE);solver.keyHi=new Uint32Array(keyHiSab,off*4,SIZE);solver.val=new Uint8Array(valSab,off,SIZE);solver.ctrl=new Int32Array(ctrlSab,off*4,SIZE);solver.owner=new Uint8Array(ownerSab,off,SIZE);}
function run(t,off=0){setRegion(off);solver.resetMetrics();solver.limit=Infinity;const t0=process.hrtime.bigint();const score=solver.negamax(t.cLo>>>0,t.cHi>>>0,t.mLo>>>0,t.mHi>>>0,t.moves|0,t.alpha|0,t.beta|0);return{score,sec:Number(process.hrtime.bigint()-t0)/1e9,nodes:solver.nodes,hits:solver.ttHits};}
function trial(mode){
 clearAll(); const a1=run(A1,0); let b=null,a2;
 if(mode==='aOnly'){a2=run(A2,0);}
 else if(mode==='shared'){b=run(B,0);a2=run(A2,0);}
 else if(mode==='split'){b=run(B,SIZE);a2=run(A2,0);}
 else if(mode==='clearBeforeA2'){b=run(B,0);clearAll();a2=run(A2,0);}
 else throw Error(mode);
 return{a1,b,a2,totalNodes:a1.nodes+(b?.nodes??0)+a2.nodes,totalSec:a1.sec+(b?.sec??0)+a2.sec};
}
const med=xs=>{const a=[...xs].sort((x,y)=>x-y);return a[(a.length-1)>>1];};
for(const mode of ['aOnly','shared','split','clearBeforeA2']){const runs=[];for(let i=0;i<REPEATS;i++)runs.push(trial(mode));console.log(JSON.stringify({mode,tablePow:POW,tableEntries:SIZE,arenaEntries:ARENA,A1,B,A2,medianA2Nodes:med(runs.map(r=>r.a2.nodes)),medianTotalNodes:med(runs.map(r=>r.totalNodes)),medianSec:med(runs.map(r=>r.totalSec)),runs}));}
