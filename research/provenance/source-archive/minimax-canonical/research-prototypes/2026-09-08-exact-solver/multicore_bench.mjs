import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const WIDTH=7, HEIGHT=6, STRIDE=7, CELLS=42;
const SEQ=process.argv[2] ?? '663152175';
const REPEATS=Number(process.argv[3] ?? 3);
const CHUNK_POW=15, CHUNK_SIZE=1<<CHUNK_POW, CHUNKS=8, TOTAL_SIZE=CHUNK_SIZE*CHUNKS;
const here=dirname(fileURLToPath(import.meta.url));
const workerFile=resolve(here,'multicore_worker.mjs');

let bottom=0n;
const bot=[], col=[], top=[];
for(let c=0;c<WIDTH;c++){
  const sh=BigInt(c*STRIDE);
  bot[c]=1n<<sh;
  top[c]=1n<<BigInt(HEIGHT-1+c*STRIDE);
  col[c]=((1n<<BigInt(HEIGHT))-1n)<<sh;
  bottom|=bot[c];
}
const board=bottom*((1n<<BigInt(HEIGHT))-1n);
function winningPositions(position, mask){
  let result=(position<<1n)&(position<<2n)&(position<<3n);
  let pair=(position<<7n)&(position<<14n); result|=pair&(position<<21n); result|=pair&(position>>7n);
  pair=(position>>7n)&(position>>14n); result|=pair&(position<<7n); result|=pair&(position>>21n);
  pair=(position<<6n)&(position<<12n); result|=pair&(position<<18n); result|=pair&(position>>6n);
  pair=(position>>6n)&(position>>12n); result|=pair&(position<<6n); result|=pair&(position>>18n);
  pair=(position<<8n)&(position<<16n); result|=pair&(position<<24n); result|=pair&(position>>8n);
  pair=(position>>8n)&(position>>16n); result|=pair&(position<<8n); result|=pair&(position>>24n);
  return result & (board ^ mask);
}
function possible(mask){ return (mask + bottom) & board; }
function canPlay(mask,c){ return (mask & top[c])===0n; }
function isWinningMove(current,mask,c){ return (winningPositions(current,mask)&possible(mask)&col[c])!==0n; }
function playColumnMask(mask,c){ return (mask+bot[c])&col[c]; }
function parse(seq){
  let current=0n,mask=0n,moves=0;
  for(let i=0;i<seq.length;i++){
    const c=seq.charCodeAt(i)-49;
    if(c<0||c>=WIDTH||!canPlay(mask,c)||isWinningMove(current,mask,c)) throw new Error(`invalid seq at ${i}`);
    const mv=playColumnMask(mask,c);
    current^=mask; mask|=mv; moves++;
  }
  return {current,mask,moves};
}
function pair(x){return [Number(x&0xffffffffn)>>>0,Number((x>>32n)&0xffffffffn)>>>0];}
function tasksFor(seq){
  const s=parse(seq), tasks=[], immediate=[];
  let id=0;
  for(let c=0;c<WIDTH;c++){
    if(!canPlay(s.mask,c)) continue;
    if(isWinningMove(s.current,s.mask,c)){
      immediate.push({move:c,score:Math.trunc((CELLS+1-s.moves)/2)});
      continue;
    }
    const mv=playColumnMask(s.mask,c);
    const childCurrent=s.current^s.mask;
    const childMask=s.mask|mv;
    const [cLo,cHi]=pair(childCurrent),[mLo,mHi]=pair(childMask);
    tasks.push({id:id++,move:c,cLo,cHi,mLo,mHi,moves:s.moves+1,chunkIndex:c});
  }
  return {root:s,tasks,immediate};
}

const {root,tasks,immediate}=tasksFor(SEQ);
const [rootCLo,rootCHi]=pair(root.current),[rootMLo,rootMHi]=pair(root.mask);
const warmState={cLo:rootCLo,cHi:rootCHi,mLo:rootMLo,mHi:rootMHi,moves:root.moves};

const keyLoSab=new SharedArrayBuffer(TOTAL_SIZE*4);
const keyHiSab=new SharedArrayBuffer(TOTAL_SIZE*4);
const valSab=new SharedArrayBuffer(TOTAL_SIZE);
const keyLo=new Uint32Array(keyLoSab), keyHi=new Uint32Array(keyHiSab), val=new Uint8Array(valSab);

function waitMessage(worker, predicate){
  return new Promise((resolve,reject)=>{
    const onMsg=(m)=>{if(predicate(m)){cleanup();resolve(m);}};
    const onErr=(e)=>{cleanup();reject(e);};
    const cleanup=()=>{worker.off('message',onMsg);worker.off('error',onErr);};
    worker.on('message',onMsg); worker.on('error',onErr);
  });
}
async function makeWorkers(n){
  const ws=[];
  for(let i=0;i<n;i++){
    const w=new Worker(workerFile,{workerData:{keyLoSab,keyHiSab,valSab}});
    await waitMessage(w,m=>m.type==='ready');
    ws.push(w);
  }
  await Promise.all(ws.map((w,i)=>{
    const p=waitMessage(w,m=>m.type==='warmed');
    w.postMessage({type:'warm',chunkIndex:(i%7),limit:100000,state:warmState});
    return p;
  }));
  return ws;
}
async function runPool(ws){
  keyLo.fill(0); keyHi.fill(0); val.fill(0);
  let next=0,done=0;
  const results=[];
  const t0=process.hrtime.bigint();
  await new Promise((resolve,reject)=>{
    const launch=(w)=>{ if(next<tasks.length) w.postMessage({type:'task',task:tasks[next++]}); };
    for(const w of ws){
      const onMsg=(m)=>{
        if(m.type!=='result') return;
        results.push(m.result); done++;
        if(done===tasks.length){ resolve(); return; }
        launch(w);
      };
      w.on('message',onMsg); w.once('error',reject); launch(w);
    }
  });
  const seconds=Number(process.hrtime.bigint()-t0)/1e9;
  const nodes=results.reduce((a,r)=>a+r.nodes,0);
  const moveScores=new Array(WIDTH).fill(null);
  for(const x of immediate) moveScores[x.move]=x.score;
  for(const r of results) moveScores[r.move]=-r.score;
  const rootScore=Math.max(...moveScores.filter(v=>v!==null));
  return {seconds,nodes,nps:nodes/seconds,rootScore,moveScores,results};
}
function median(xs){const a=[...xs].sort((x,y)=>x-y);return a[(a.length-1)>>1];}

console.log(JSON.stringify({sequence:SEQ,rootMoves:root.moves,tasks:tasks.length,immediate:immediate.length,totalEntries:TOTAL_SIZE,chunkEntries:CHUNK_SIZE,repeats:REPEATS}));
for(const n of [1,2,3,4]){
  const ws=await makeWorkers(n);
  const runs=[];
  for(let r=0;r<REPEATS;r++) runs.push(await runPool(ws));
  for(const w of ws) w.postMessage({type:'stop'});
  await Promise.all(ws.map(w=>w.terminate().catch(()=>{})));
  const medSec=median(runs.map(x=>x.seconds));
  const medNodes=median(runs.map(x=>x.nodes));
  const medNps=median(runs.map(x=>x.nps));
  const scores=[...new Set(runs.map(x=>x.rootScore))];
  console.log(JSON.stringify({workers:n,medianSeconds:medSec,medianNodes:medNodes,medianNps:medNps,scores,runs:runs.map(x=>({seconds:x.seconds,nodes:x.nodes,nps:x.nps,rootScore:x.rootScore}))}));
}
