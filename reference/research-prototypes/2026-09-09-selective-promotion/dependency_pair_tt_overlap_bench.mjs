import { Solver } from '../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs';

const REPEATS=Math.max(1,Number(process.argv[2]??5)|0);
const TABLE_POW=19; // 512K entries per task-local descriptor
const TABLE_ENTRIES=1<<TABLE_POW;
const ARENA_ENTRIES=TABLE_ENTRIES*2;

const PAIRS=[
  {
    name:'incompatible-c5r1-opposite-owner',
    relation:'incompatible',
    a:{id:112,sig2:975370,cLo:1075839104,cHi:3088,mLo:4028629121,mHi:3128,moves:12,alpha:3,beta:4},
    b:{id:130,sig2:1008138,cLo:1075839104,cHi:3104,mLo:1881145473,mHi:3192,moves:12,alpha:3,beta:4},
  },
  {
    name:'overlap-ancestor-descendant',
    relation:'1008138-ancestor-of-1009162',
    a:{id:130,sig2:1008138,cLo:1075839104,cHi:3104,mLo:1881145473,mHi:3192,moves:12,alpha:3,beta:4},
    b:{id:120,sig2:1009162,cLo:1080033408,cHi:3072,mLo:1893728385,mHi:3096,moves:12,alpha:3,beta:4},
  },
];

const keyLoSab=new SharedArrayBuffer(ARENA_ENTRIES*4);
const keyHiSab=new SharedArrayBuffer(ARENA_ENTRIES*4);
const valSab=new SharedArrayBuffer(ARENA_ENTRIES);
const ctrlSab=new SharedArrayBuffer(ARENA_ENTRIES*4);
const ownerSab=new SharedArrayBuffer(ARENA_ENTRIES);
const solver=new Solver(15,false,0);

function clearArena(){
  new Uint32Array(keyLoSab).fill(0);new Uint32Array(keyHiSab).fill(0);
  new Uint8Array(valSab).fill(0);new Int32Array(ctrlSab).fill(0);new Uint8Array(ownerSab).fill(0);
}
function setRegion(offsetEntries){
  solver.size=TABLE_ENTRIES;solver.mask=TABLE_ENTRIES-1;
  solver.keyLo=new Uint32Array(keyLoSab,offsetEntries*4,TABLE_ENTRIES);
  solver.keyHi=new Uint32Array(keyHiSab,offsetEntries*4,TABLE_ENTRIES);
  solver.val=new Uint8Array(valSab,offsetEntries,TABLE_ENTRIES);
  solver.ctrl=new Int32Array(ctrlSab,offsetEntries*4,TABLE_ENTRIES);
  solver.owner=new Uint8Array(ownerSab,offsetEntries,TABLE_ENTRIES);
}
function runTask(task,offsetEntries){
  setRegion(offsetEntries);solver.resetMetrics();solver.limit=Infinity;
  const t0=process.hrtime.bigint();
  const score=solver.negamax(task.cLo>>>0,task.cHi>>>0,task.mLo>>>0,task.mHi>>>0,task.moves|0,task.alpha|0,task.beta|0);
  const sec=Number(process.hrtime.bigint()-t0)/1e9;
  return {score,sec,nodes:solver.nodes,ttHits:solver.ttHits,writeAttempts:solver.writeAttempts,writeSuccess:solver.writeSuccess,writeBusy:solver.writeBusy};
}
function runMode(pair,mode){
  clearArena();
  const a=runTask(pair.a,0);
  if(mode==='clearBetween'){
    new Uint32Array(keyLoSab,0,TABLE_ENTRIES).fill(0);new Uint32Array(keyHiSab,0,TABLE_ENTRIES).fill(0);
    new Uint8Array(valSab,0,TABLE_ENTRIES).fill(0);new Int32Array(ctrlSab,0,TABLE_ENTRIES).fill(0);new Uint8Array(ownerSab,0,TABLE_ENTRIES).fill(0);
  }
  const b=runTask(pair.b,mode==='split'?TABLE_ENTRIES:0);
  return {a,b,totalSec:a.sec+b.sec,totalNodes:a.nodes+b.nodes,totalHits:a.ttHits+b.ttHits};
}
const median=xs=>{const a=[...xs].sort((x,y)=>x-y);return a[(a.length-1)>>1];};
for(const pair of PAIRS){
  for(const mode of ['clearBetween','shared','split']){
    const runs=[];
    for(let i=0;i<REPEATS;i++)runs.push(runMode(pair,mode));
    console.log(JSON.stringify({pair:pair.name,relation:pair.relation,mode,tablePow:TABLE_POW,tableEntries:TABLE_ENTRIES,arenaEntries:ARENA_ENTRIES,taskA:pair.a,taskB:pair.b,medianSec:median(runs.map(r=>r.totalSec)),medianNodes:median(runs.map(r=>r.totalNodes)),runs}));
  }
}
