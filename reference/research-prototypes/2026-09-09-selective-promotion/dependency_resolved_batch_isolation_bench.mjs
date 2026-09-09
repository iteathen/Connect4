import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Solver } from '../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs';

const REPEATS=Math.max(1,Number(process.argv[2]??3)|0);
const POW=Number(process.argv[3]??19)|0;
const PASS=Number(process.argv[4]??6)|0;
const SIZE=1<<POW,ARENA=SIZE*2;
const here=dirname(fileURLToPath(import.meta.url));
const capture=resolve(here,'coarse_task_root_capture_patch.mjs');

const c=spawnSync(process.execPath,[capture,'41267575','1','21','1','flatQuarter','full'],{encoding:'utf8',maxBuffer:64*1024*1024});
if(c.status!==0)throw Error(c.stderr||`capture failed ${c.status}`);
const profile=JSON.parse(c.stdout.trim().split('\n').find(Boolean));
const rootRun=profile.runs[0];
function ownerAtC5R1(sig){const code=(sig>>>15)&7;return code<=2?-1:((code-3)&1);}
const passTasks=rootRun.taskEvidence.filter(t=>t.pass===PASS).sort((a,b)=>a.id-b.id);
const tasks=passTasks.map(t=>({...t,domain:ownerAtC5R1(t.sig2)})).filter(t=>t.domain>=0);
const unresolved=passTasks.filter(t=>ownerAtC5R1(t.sig2)<0);
const counts=[tasks.filter(t=>t.domain===0).length,tasks.filter(t=>t.domain===1).length];

const keyLoSab=new SharedArrayBuffer(ARENA*4),keyHiSab=new SharedArrayBuffer(ARENA*4),valSab=new SharedArrayBuffer(ARENA),ctrlSab=new SharedArrayBuffer(ARENA*4),ownerSab=new SharedArrayBuffer(ARENA);
const solver=new Solver(15,false,0);
function clearArena(){new Uint32Array(keyLoSab).fill(0);new Uint32Array(keyHiSab).fill(0);new Uint8Array(valSab).fill(0);new Int32Array(ctrlSab).fill(0);new Uint8Array(ownerSab).fill(0);}
function setRegion(off){solver.size=SIZE;solver.mask=SIZE-1;solver.keyLo=new Uint32Array(keyLoSab,off*4,SIZE);solver.keyHi=new Uint32Array(keyHiSab,off*4,SIZE);solver.val=new Uint8Array(valSab,off,SIZE);solver.ctrl=new Int32Array(ctrlSab,off*4,SIZE);solver.owner=new Uint8Array(ownerSab,off,SIZE);}
function runTask(t,off){setRegion(off);solver.resetMetrics();solver.limit=Infinity;const t0=process.hrtime.bigint();const score=solver.negamax(t.cLo>>>0,t.cHi>>>0,t.mLo>>>0,t.mHi>>>0,t.moves|0,t.alpha|0,t.beta|0);return{score,sec:Number(process.hrtime.bigint()-t0)/1e9,nodes:solver.nodes,hits:solver.ttHits};}
function orderFor(mode){
 if(mode==='sharedGrouped')return [...tasks.filter(t=>t.domain===0),...tasks.filter(t=>t.domain===1)];
 return tasks;
}
function trial(mode){
 clearArena();let totalNodes=0,totalSec=0,totalHits=0;const domainNodes=[0,0],domainHits=[0,0],scores=[];
 for(const t of orderFor(mode)){
   if(mode==='clearEach')clearArena();
   const off=mode==='splitInterleaved'&&t.domain===1?SIZE:0;
   const r=runTask(t,off);scores.push(r.score);totalNodes+=r.nodes;totalSec+=r.sec;totalHits+=r.hits;domainNodes[t.domain]+=r.nodes;domainHits[t.domain]+=r.hits;
 }
 return{totalNodes,totalSec,totalHits,domainNodes,domainHits,scores};
}
const med=xs=>{const a=[...xs].sort((x,y)=>x-y);return a[(a.length-1)>>1];};
const captureSummary={score:rootRun.score,nodes:rootRun.nodes,tasks:rootRun.tasks,pass:PASS,passTasks:passTasks.length,resolvedTasks:tasks.length,unresolvedTasks:unresolved.length,domainTaskCounts:counts,resolvedSig2s:[...new Set(tasks.map(t=>t.sig2))].sort((a,b)=>a-b)};
console.log(JSON.stringify({kind:'capture',tablePow:POW,...captureSummary}));
for(const mode of ['clearEach','sharedInterleaved','sharedGrouped','splitInterleaved']){
 const runs=[];for(let i=0;i<REPEATS;i++)runs.push(trial(mode));
 console.log(JSON.stringify({kind:'replay',mode,tablePow:POW,tableEntries:SIZE,arenaEntries:ARENA,...captureSummary,medianNodes:med(runs.map(r=>r.totalNodes)),medianSec:med(runs.map(r=>r.totalSec)),runs}));
}
