// Research-only counterfactual controls. Unchanged imported kernel; no online selector.
// Tasks copied from dependency_interleave_isolation_bench.mjs at 990686a094acaddc0bc37d0995759ab138d63aa4.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import os from 'node:os';
import { Solver } from '../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs';
const kernelURL=new URL('../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs',import.meta.url);
const kernel=readFileSync(kernelURL),blob=createHash('sha1').update(`blob ${kernel.length}\0`).update(kernel).digest('hex');
assert.equal(blob,'965c3806c92a7add544dce4777d965b3e12376d6');
const repeats=Number(process.argv[2]??5);
assert(Number.isInteger(repeats)&&repeats>=1&&repeats<=100);
const tasks=[
 {name:'A1',id:91,sig2:1008138,cLo:1075839104,cHi:7168,mLo:1881145473,mHi:15384,moves:12,alpha:3,beta:4},
 {name:'B',id:112,sig2:975370,cLo:1075839104,cHi:3088,mLo:4028629121,mHi:3128,moves:12,alpha:3,beta:4},
 {name:'A2',id:130,sig2:1008138,cLo:1075839104,cHi:3104,mLo:1881145473,mHi:3192,moves:12,alpha:3,beta:4}
];
const modes=['sharedN','shared2N','splitN','groupedN'];
const maxEntries=1<<21;
const buffers=[4,4,1,4,1].map(b=>new SharedArrayBuffer(maxEntries*b));
const all=[new Uint32Array(buffers[0]),new Uint32Array(buffers[1]),new Uint8Array(buffers[2]),new Int32Array(buffers[3]),new Uint8Array(buffers[4])];
const solver=new Solver(15,false,0);
function clear(){for(const a of all)a.fill(0);}
function bind(off,pow){const n=2**pow;assert(off>=0&&off+n<=maxEntries);solver.size=n;solver.mask=n-1;solver.keyLo=new Uint32Array(buffers[0],off*4,n);solver.keyHi=new Uint32Array(buffers[1],off*4,n);solver.val=new Uint8Array(buffers[2],off,n);solver.ctrl=new Int32Array(buffers[3],off*4,n);solver.owner=new Uint8Array(buffers[4],off,n);}
function run(t,off,pow,full=false){
 bind(off,pow);solver.resetMetrics();const start=process.hrtime.bigint();
 const score=full?solver.solveBits(t.cLo,t.cHi,t.mLo,t.mHi,t.moves):solver.negamax(t.cLo,t.cHi,t.mLo,t.mHi,t.moves,t.alpha,t.beta);
 return {name:t.name,score,nodes:solver.nodes,hits:solver.ttHits,seconds:Number(process.hrtime.bigint()-start)/1e9};
}
console.log(JSON.stringify({kind:'environment',node:process.version,v8:process.versions.v8,arch:process.arch,platform:process.platform,cpus:os.availableParallelism(),cpu:os.cpus()[0].model,workers:1,kernelBlob:blob,arenaBytes:buffers.reduce((s,b)=>s+b.byteLength,0),tasks}));
// Same-kernel full-score consistency is not independent oracle qualification.
const exact=[];
for(const t of tasks){clear();const r=run(t,0,19,true);exact.push(r.score);console.log(JSON.stringify({kind:'fullScoreConsistency',...r}));}
function trial(mode,pow,repeat){
 clear();const order=mode==='groupedN'?[0,2,1]:[0,1,2];const rows=[];const start=process.hrtime.bigint();
 for(const i of order){const t=tasks[i],p=mode==='shared2N'?pow+1:pow,off=mode==='splitN'&&i===1?2**pow:0;const r=run(t,off,p);assert(r.score<=t.alpha?exact[i]<=r.score:exact[i]>=r.score);rows.push(r);}
 return {kind:'trial',mode,pow,repeat,activeEntries:(mode==='shared2N'||mode==='splitN'?2:1)*2**pow,perTaskEntries:2**(pow+(mode==='shared2N'?1:0)),seconds:Number(process.hrtime.bigint()-start)/1e9,nodes:rows.reduce((s,r)=>s+r.nodes,0),hits:rows.reduce((s,r)=>s+r.hits,0),tasks:rows};
}
for(const pow of [18,19,20]){
 for(const mode of modes)trial(mode,pow,-1);
 for(let repeat=0;repeat<repeats;repeat++){
  const rotated=modes.slice(repeat%4).concat(modes.slice(0,repeat%4));if(repeat&1)rotated.reverse();
  for(const mode of rotated)console.log(JSON.stringify(trial(mode,pow,repeat)));
 }
}
