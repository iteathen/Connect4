import { Worker } from 'node:worker_threads';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const REPEATS=Math.max(1,Number(process.argv[2]??5)|0);
const POW=Number(process.argv[3]??19)|0;
const WORKERS=Math.max(1,Number(process.argv[4]??4)|0);
const PASS=Number(process.argv[5]??6)|0;
const MODES=(process.argv[6]??'sharedInterleaved,sharedGroupedPhased,splitInterleaved').split(',');
const SIZE=1<<POW,ARENA=SIZE*2;
const here=dirname(fileURLToPath(import.meta.url));
const capture=resolve(here,'coarse_task_root_capture_patch.mjs');
const workerFile=resolve(here,'ybwc_descriptor_worker.mjs');

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
function clearArena(){new Uint32Array(keyLoSab).fill(0);new Uint32Array(keyHiSab).fill(0);new Uint8Array(valSab).fill(0);new Int32Array(ctrlSab).fill(0);new Uint8Array(ownerSab).fill(0);}
class Pool{
  constructor(){this.workers=[];this.idle=[];this.queue=[];this.waiters=new Map();this.nextId=1;}
  async init(){
    for(let i=0;i<WORKERS;i++){
      const w=new Worker(workerFile,{workerData:{keyLoSab,keyHiSab,valSab,ctrlSab,ownerSab,workerId:i,totalPow:POW+1}});
      w.on('message',m=>this.onMessage(w,m));
      await new Promise((res,rej)=>{const f=m=>{if(m.type==='ready'){w.off('message',f);res();}};w.on('message',f);w.once('error',rej);});
      this.workers.push(w);this.idle.push(w);
    }
    const t=tasks[0];
    await Promise.all(this.workers.map(w=>new Promise((res,rej)=>{const f=m=>{if(m.type==='warmed'){w.off('message',f);res();}};w.on('message',f);w.once('error',rej);w.postMessage({type:'warm',cLo:t.cLo,cHi:t.cHi,mLo:t.mLo,mHi:t.mHi,moves:t.moves,alpha:t.alpha,beta:t.beta,limit:30000});})));
    clearArena();
  }
  onMessage(w,m){
    if(m.type!=='result')return;
    const q=this.waiters.get(m.id);if(q){this.waiters.delete(m.id);q.resolve(m);}
    this.idle.push(w);this.pump();
  }
  pump(){while(this.idle.length&&this.queue.length){const w=this.idle.pop(),m=this.queue.shift();w.postMessage(m);}}
  submit(t,off){
    const id=this.nextId++;
    return new Promise((resolve,reject)=>{this.waiters.set(id,{resolve,reject});this.queue.push({type:'task',id,cLo:t.cLo,cHi:t.cHi,mLo:t.mLo,mHi:t.mHi,moves:t.moves,alpha:t.alpha,beta:t.beta,offsetEntries:off,tablePow:POW});this.pump();});
  }
  async batch(list,offsetFn){return Promise.all(list.map(t=>this.submit(t,offsetFn(t))));}
  async close(){await Promise.all(this.workers.map(w=>w.terminate()));}
}
const pool=new Pool();await pool.init();
function summarize(list,results){let nodes=0,hits=0,cross=0,workerSeconds=0;const domainNodes=[0,0],domainHits=[0,0],scores=[];for(let i=0;i<results.length;i++){const t=list[i],r=results[i];nodes+=r.nodes;hits+=r.ttHits;cross+=r.crossHits;workerSeconds+=r.seconds;domainNodes[t.domain]+=r.nodes;domainHits[t.domain]+=r.ttHits;scores.push(r.score);}return{nodes,hits,cross,workerSeconds,domainNodes,domainHits,scores};}
async function trial(mode){
  clearArena();const t0=process.hrtime.bigint();let summary;
  if(mode==='sharedGroupedPhased'){
    const g0=tasks.filter(t=>t.domain===0),g1=tasks.filter(t=>t.domain===1);
    const r0=await pool.batch(g0,()=>0),r1=await pool.batch(g1,()=>0);
    const s0=summarize(g0,r0),s1=summarize(g1,r1);
    summary={nodes:s0.nodes+s1.nodes,hits:s0.hits+s1.hits,cross:s0.cross+s1.cross,workerSeconds:s0.workerSeconds+s1.workerSeconds,domainNodes:[s0.domainNodes[0],s1.domainNodes[1]],domainHits:[s0.domainHits[0],s1.domainHits[1]],scores:[...s0.scores,...s1.scores]};
  }else{
    const rs=await pool.batch(tasks,t=>mode==='splitInterleaved'&&t.domain===1?SIZE:0);
    summary=summarize(tasks,rs);
  }
  summary.wallSec=Number(process.hrtime.bigint()-t0)/1e9;return summary;
}
const med=xs=>{const a=[...xs].sort((x,y)=>x-y);return a[(a.length-1)>>1];};
const meta={captureScore:rootRun.score,captureNodes:rootRun.nodes,pass:PASS,passTasks:passTasks.length,resolvedTasks:tasks.length,unresolvedTasks:unresolved.length,domainTaskCounts:counts};
console.log(JSON.stringify({kind:'capture',tablePow:POW,workers:WORKERS,...meta}));
for(const mode of MODES){const runs=[];for(let i=0;i<REPEATS;i++)runs.push(await trial(mode));console.log(JSON.stringify({kind:'parallelReplay',mode,tablePow:POW,tableEntries:SIZE,arenaEntries:ARENA,workers:WORKERS,...meta,medianWallSec:med(runs.map(r=>r.wallSec)),medianNodes:med(runs.map(r=>r.nodes)),runs}));}
await pool.close();
