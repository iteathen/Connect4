import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const WIDTH=7, HEIGHT=6, STRIDE=7, CELLS=42;
const ORDER=[3,4,2,5,1,6,0];
const SEQ=process.argv[2]??'663152175';
const REPEATS=Number(process.argv[3]??3);
const CHUNK_POW=15, CHUNK_SIZE=1<<CHUNK_POW;
const workerFile=resolve(dirname(fileURLToPath(import.meta.url)),'ybwc_worker.mjs');

let bottom=0n; const bottomMasks=[], columnMasks=[], topMasks=[];
for(let c=0;c<WIDTH;c++){
  const sh=BigInt(c*STRIDE);
  bottomMasks[c]=1n<<sh;
  topMasks[c]=1n<<BigInt(HEIGHT-1+c*STRIDE);
  columnMasks[c]=((1n<<BigInt(HEIGHT))-1n)<<sh;
  bottom|=bottomMasks[c];
}
const board=bottom*((1n<<BigInt(HEIGHT))-1n);
function winningPositions(position,mask){
  let r=(position<<1n)&(position<<2n)&(position<<3n);
  let p=(position<<7n)&(position<<14n); r|=p&(position<<21n); r|=p&(position>>7n);
  p=(position>>7n)&(position>>14n); r|=p&(position<<7n); r|=p&(position>>21n);
  p=(position<<6n)&(position<<12n); r|=p&(position<<18n); r|=p&(position>>6n);
  p=(position>>6n)&(position>>12n); r|=p&(position<<6n); r|=p&(position>>18n);
  p=(position<<8n)&(position<<16n); r|=p&(position<<24n); r|=p&(position>>8n);
  p=(position>>8n)&(position>>16n); r|=p&(position<<8n); r|=p&(position>>24n);
  return r&(board^mask);
}
const possible=mask=>(mask+bottom)&board;
const canPlay=(mask,c)=>(mask&topMasks[c])===0n;
const isWinningMove=(current,mask,c)=>(winningPositions(current,mask)&possible(mask)&columnMasks[c])!==0n;
const playColumn=(mask,c)=>(mask+bottomMasks[c])&columnMasks[c];
function parse(seq){
  let current=0n,mask=0n,moves=0;
  for(const ch of seq){const c=ch.charCodeAt(0)-49;if(c<0||c>=7||!canPlay(mask,c)||isWinningMove(current,mask,c))throw new Error('bad sequence');const mv=playColumn(mask,c);current^=mask;mask|=mv;moves++;}
  return {current,mask,moves};
}
function popBig(x){let n=0;while(x){x&=x-1n;n++;}return n;}
function pair(x){return [Number(x&0xffffffffn)>>>0,Number((x>>32n)&0xffffffffn)>>>0];}
function multiBit(x){return x!==0n && (x&(x-1n))!==0n;}

class Pool{
  constructor(n){this.n=n;this.workers=[];this.id=1;this.waiters=new Map();this.idle=[];this.queue=[];this.nodes=0;this.workerSeconds=0;}
  async init(root){
    const totalPow=CHUNK_POW+Math.ceil(Math.log2(Math.max(1,this.n)));
    const totalSize=(1<<totalPow);
    this.keyLoSab=new SharedArrayBuffer(totalSize*4); this.keyHiSab=new SharedArrayBuffer(totalSize*4); this.valSab=new SharedArrayBuffer(totalSize);
    for(let i=0;i<this.n;i++){
      const w=new Worker(workerFile,{workerData:{keyLoSab:this.keyLoSab,keyHiSab:this.keyHiSab,valSab:this.valSab,workerIndex:i,chunkPow:CHUNK_POW,totalPow}});
      w.on('message',m=>this.onMessage(w,m));
      await new Promise((res,rej)=>{const f=m=>{if(m.type==='ready'){w.off('message',f);res();}};w.on('message',f);w.once('error',rej)});
      this.workers.push(w);this.idle.push(w);
    }
    const [cLo,cHi]=pair(root.current),[mLo,mHi]=pair(root.mask);
    await Promise.all(this.workers.map(w=>new Promise((res,rej)=>{const f=m=>{if(m.type==='warmed'){w.off('message',f);res();}};w.on('message',f);w.once('error',rej);w.postMessage({type:'warm',cLo,cHi,mLo,mHi,moves:root.moves,alpha:-1,beta:0,limit:50000});})));
  }
  onMessage(w,m){
    if(m.type!=='result')return;
    this.nodes+=m.nodes;this.workerSeconds+=m.seconds;
    const x=this.waiters.get(m.id); if(x){this.waiters.delete(m.id);x.resolve({score:m.score,nodes:m.nodes,seconds:m.seconds});}
    this.idle.push(w);this.pump();
  }
  pump(){while(this.idle.length&&this.queue.length){const w=this.idle.pop(),t=this.queue.shift();w.postMessage(t.msg);}}
  run(state,alpha,beta){
    const id=this.id++;const [cLo,cHi]=pair(state.current),[mLo,mHi]=pair(state.mask);
    return new Promise((resolve,reject)=>{this.waiters.set(id,{resolve,reject});this.queue.push({msg:{type:'task',id,cLo,cHi,mLo,mHi,moves:state.moves,alpha,beta}});this.pump();});
  }
  async drain(){while(this.waiters.size||this.queue.length||this.idle.length!==this.workers.length)await new Promise(r=>setTimeout(r,0));}
  async close(){await Promise.all(this.workers.map(w=>w.terminate()));}
}

let shellNodes=0, splitNodes=0, siblingTasks=0;
function prepare(state,alpha,beta){
  shellNodes++;
  const {current,mask,moves}=state;
  let candidates=possible(mask);
  const opponentWins=winningPositions(current^mask,mask);
  const forced=candidates&opponentWins;
  if(forced!==0n){if(multiBit(forced))return {terminal:-Math.trunc((CELLS-moves)/2)};candidates=forced;}
  candidates &= ~(opponentWins>>1n);
  if(candidates===0n)return {terminal:-Math.trunc((CELLS-moves)/2)};
  if(moves>=CELLS-2)return {terminal:0};
  const min=-Math.trunc((CELLS-2-moves)/2); if(alpha<min){alpha=min;if(alpha>=beta)return {terminal:alpha};}
  const max=Math.trunc((CELLS-1-moves)/2); if(beta>max){beta=max;if(alpha>=beta)return {terminal:beta};}
  const children=[];
  for(let oi=0;oi<WIDTH;oi++){
    const c=ORDER[oi],mv=candidates&columnMasks[c];if(mv===0n)continue;
    const sc=popBig(winningPositions(current|mv,mask));
    const child={current:current^mask,mask:mask|mv,moves:moves+1,move:c,ord:oi,sc};
    let at=children.length;while(at>0&&children[at-1].sc<sc)at--;children.splice(at,0,child);
  }
  return {alpha,beta,children};
}

async function pneg(pool,state,alpha,beta,depth,activeWorkers,laneCap){
  if(depth<=0){const r=await pool.run(state,alpha,beta);return r.score;}
  const p=prepare(state,alpha,beta);if('terminal'in p)return p.terminal;
  alpha=p.alpha;beta=p.beta;const children=p.children;if(children.length===0)return alpha;
  splitNodes++;
  // Young Brothers Wait: eldest first. Recursively split it too.
  let score=-await pneg(pool,children[0],-beta,-alpha,depth-1,activeWorkers,laneCap);
  if(score>=beta)return score;
  if(score>alpha)alpha=score;
  if(children.length===1)return alpha;
  siblingTasks+=children.length-1;
  // Lazy younger-brother scheduling: only keep at most N sibling proofs in flight.
  // Stop launching as soon as any sibling fails high. Already-running proofs may finish.
  let next=1, cutoff=null, best=alpha;
  const laneCount=Math.min(activeWorkers,laneCap,children.length-1);
  async function lane(){
    while(cutoff===null){
      const i=next++; if(i>=children.length) return;
      const childScore=await pneg(pool,children[i],-beta,-best,depth-1,activeWorkers,laneCap);
      const s=-childScore;
      if(s>=beta){cutoff=s;return;}
      if(s>best)best=s;
    }
  }
  await Promise.all(Array.from({length:laneCount},()=>lane()));
  return cutoff===null?best:cutoff;
}

function chooseConfig(prevNodes, moves){
  // Dirty adaptive policy: no extra probe. Use the previous mandatory null-window pass.
  // Keep idle workers warm but only expose as much parallelism as the prior pass justified.
  if(prevNodes === null) return {workers:1, depth:0, lanes:1};
  if(prevNodes < 150_000) return {workers:1, depth:0, lanes:1};
  if(prevNodes < 1_000_000) return {workers:2, depth:2, lanes:2};
  if(prevNodes < 1_500_000) return {workers:3, depth:3, lanes:2};
  return {workers:4, depth:4, lanes:2};
}
async function solveDynamic(pool,state){
  if((winningPositions(state.current,state.mask)&possible(state.mask))!==0n)return {score:Math.trunc((CELLS+1-state.moves)/2),iterations:[]};
  let min=-Math.trunc((CELLS-state.moves)/2),max=Math.trunc((CELLS+1-state.moves)/2),prevNodes=null;
  const iterations=[];
  while(min<max){
    let med=min+Math.trunc((max-min)/2);if(med<=0&&Math.trunc(min/2)<med)med=Math.trunc(min/2);else if(med>=0&&Math.trunc(max/2)>med)med=Math.trunc(max/2);
    const cfg=chooseConfig(prevNodes,state.moves);
    const before=pool.nodes+shellNodes;
    const t0=process.hrtime.bigint();
    const s=await pneg(pool,state,med,med+1,cfg.depth,cfg.workers,cfg.lanes);
    await pool.drain();
    const sec=Number(process.hrtime.bigint()-t0)/1e9;
    const after=pool.nodes+shellNodes;
    const iterNodes=after-before;
    iterations.push({med,score:s,nodes:iterNodes,sec,...cfg});
    prevNodes=iterNodes;
    if(s<=med)max=s;else min=s;
  }
  return {score:min===0?0:min,iterations};
}
const root=parse(SEQ);
const median=xs=>{const a=[...xs].sort((a,b)=>a-b);return a[(a.length-1)>>1];};
console.log(JSON.stringify({sequence:SEQ,repeats:REPEATS,mode:'dynamic-prev-null-window',chunkEntries:CHUNK_SIZE}));
const pool=new Pool(4); await pool.init(root); const runs=[];
for(let r=0;r<REPEATS;r++){
  new Uint32Array(pool.keyLoSab).fill(0);new Uint32Array(pool.keyHiSab).fill(0);new Uint8Array(pool.valSab).fill(0);
  pool.nodes=0;pool.workerSeconds=0;shellNodes=0;splitNodes=0;siblingTasks=0;
  const t0=process.hrtime.bigint(); const out=await solveDynamic(pool,root); await pool.drain(); const sec=Number(process.hrtime.bigint()-t0)/1e9;
  runs.push({sec,score:out.score,totalNodes:pool.nodes+shellNodes,aggregateNps:(pool.nodes+shellNodes)/sec,iterations:out.iterations,splitNodes,siblingTasks});
}
console.log(JSON.stringify({medianSec:median(runs.map(x=>x.sec)),medianNodes:median(runs.map(x=>x.totalNodes)),medianNps:median(runs.map(x=>x.aggregateNps)),scores:[...new Set(runs.map(x=>x.score))],runs}));
await pool.close();
