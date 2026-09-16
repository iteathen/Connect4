import { Worker } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const WIDTH=7,HEIGHT=6,STRIDE=7,CELLS=42,ORDER=[3,4,2,5,1,6,0];
const SEQ=process.argv[2]??'';
const CHUNK_COUNT=Math.max(2,Number(process.argv[3]??32)|0), CHUNK_POW=15, CHUNK_SIZE=1<<CHUNK_POW;
const MAX_WORKERS=Math.max(1,Math.min(availableParallelism(),Number(process.argv[4]??availableParallelism())));
const DEP_ROWS=(Number(process.argv[5]??2)===1?1:2);
const workerFile=resolve(dirname(fileURLToPath(import.meta.url)),'ybwc_depclean_worker.mjs');
let bottom=0n;const bottomMasks=[],columnMasks=[],topMasks=[];
for(let c=0;c<WIDTH;c++){const sh=BigInt(c*STRIDE);bottomMasks[c]=1n<<sh;topMasks[c]=1n<<BigInt(HEIGHT-1+c*STRIDE);columnMasks[c]=((1n<<6n)-1n)<<sh;bottom|=bottomMasks[c];}
const board=bottom*((1n<<6n)-1n);
function winningPositions(position,mask){let r=(position<<1n)&(position<<2n)&(position<<3n);let p=(position<<7n)&(position<<14n);r|=p&(position<<21n);r|=p&(position>>7n);p=(position>>7n)&(position>>14n);r|=p&(position<<7n);r|=p&(position>>21n);p=(position<<6n)&(position<<12n);r|=p&(position<<18n);r|=p&(position>>6n);p=(position>>6n)&(position>>12n);r|=p&(position<<6n);r|=p&(position>>18n);p=(position<<8n)&(position<<16n);r|=p&(position<<24n);r|=p&(position>>8n);p=(position>>8n)&(position>>16n);r|=p&(position<<8n);r|=p&(position>>24n);return r&(board^mask);}
const possible=mask=>(mask+bottom)&board,canPlay=(mask,c)=>(mask&topMasks[c])===0n,isWinningMove=(cur,mask,c)=>(winningPositions(cur,mask)&possible(mask)&columnMasks[c])!==0n,playColumn=(mask,c)=>(mask+bottomMasks[c])&columnMasks[c];
function parse(seq){let current=0n,mask=0n,moves=0;for(const ch of seq){const c=ch.charCodeAt(0)-49;if(c<0||c>=7||!canPlay(mask,c)||isWinningMove(current,mask,c))throw Error('bad sequence');const mv=playColumn(mask,c);current^=mask;mask|=mv;moves++;}return{current,mask,moves};}
function pair(x){return[Number(x&0xffffffffn)>>>0,Number((x>>32n)&0xffffffffn)>>>0];}
function popBig(x){let n=0;while(x){x&=x-1n;n++;}return n;}function multiBit(x){return x!==0n&&(x&(x-1n))!==0n;}
class Pool{
  constructor(n){this.n=n;this.workers=[];this.id=1;this.waiters=new Map();this.idle=[];this.queue=[];this.resetMetrics();}
  resetMetrics(){this.nodes=0;this.workerSeconds=0;this.reclaims=0;this.allocations=0;this.spills=0;this.depTransitions=0;this.mapHits=0;this.tasks=0;}
  async init(root){
    const entries=CHUNK_COUNT*CHUNK_SIZE;
    this.keyLoSab=new SharedArrayBuffer(entries*this.n*4);this.keyHiSab=new SharedArrayBuffer(entries*this.n*4);this.valSab=new SharedArrayBuffer(entries*this.n);
    for(let i=0;i<this.n;i++){
      const w=new Worker(workerFile,{workerData:{keyLoSab:this.keyLoSab,keyHiSab:this.keyHiSab,valSab:this.valSab,workerIndex:i,chunkCount:CHUNK_COUNT,chunkPow:CHUNK_POW,depRows:DEP_ROWS}});
      w._idx=i;w.on('message',m=>this.onMessage(w,m));await new Promise((res,rej)=>{const f=m=>{if(m.type==='ready'){w.off('message',f);res();}};w.on('message',f);w.once('error',rej)});this.workers.push(w);this.idle.push(w);
    }
    const [cLo,cHi]=pair(root.current),[mLo,mHi]=pair(root.mask);
    await Promise.all(this.workers.map(w=>new Promise((res,rej)=>{const f=m=>{if(m.type==='warmed'){w.off('message',f);res();}};w.on('message',f);w.once('error',rej);w.postMessage({type:'warm',cLo,cHi,mLo,mHi,moves:root.moves,alpha:-1,beta:0,limit:30000});})));
  }
  onMessage(w,m){if(m.type!=='result')return;this.nodes+=m.nodes;this.workerSeconds+=m.seconds;this.reclaims+=m.reclaims;this.allocations+=m.allocations;this.spills+=m.spillTransitions;this.depTransitions+=m.depTransitions;this.mapHits+=m.mapHits;this.tasks++;const x=this.waiters.get(m.id);if(x){this.waiters.delete(m.id);x.resolve(m);}this.idle.push(w);this.pump();}
  pump(){while(this.idle.length&&this.queue.length){const w=this.idle.pop(),t=this.queue.shift();w.postMessage(t);}}
  run(state,alpha,beta){const id=this.id++,[cLo,cHi]=pair(state.current),[mLo,mHi]=pair(state.mask);return new Promise((resolve,reject)=>{this.waiters.set(id,{resolve,reject});this.queue.push({type:'task',id,cLo,cHi,mLo,mHi,moves:state.moves,alpha,beta});this.pump();});}
  async drain(){while(this.waiters.size||this.queue.length||this.idle.length!==this.workers.length)await new Promise(r=>setTimeout(r,0));}
  async close(){await Promise.all(this.workers.map(w=>w.terminate()));}
}
let shellNodes=0,splitNodes=0,siblingTasks=0;
function prepare(state,alpha,beta){shellNodes++;const{current,mask,moves}=state;let candidates=possible(mask);const opponentWins=winningPositions(current^mask,mask),forced=candidates&opponentWins;if(forced!==0n){if(multiBit(forced))return{terminal:-Math.trunc((CELLS-moves)/2)};candidates=forced;}candidates&=~(opponentWins>>1n);if(candidates===0n)return{terminal:-Math.trunc((CELLS-moves)/2)};if(moves>=CELLS-2)return{terminal:0};const min=-Math.trunc((CELLS-2-moves)/2);if(alpha<min){alpha=min;if(alpha>=beta)return{terminal:alpha};}const max=Math.trunc((CELLS-1-moves)/2);if(beta>max){beta=max;if(alpha>=beta)return{terminal:beta};}const children=[];for(let oi=0;oi<WIDTH;oi++){const c=ORDER[oi],mv=candidates&columnMasks[c];if(mv===0n)continue;const sc=popBig(winningPositions(current|mv,mask)),child={current:current^mask,mask:mask|mv,moves:moves+1,move:c,sc};let at=children.length;while(at>0&&children[at-1].sc<sc)at--;children.splice(at,0,child);}return{alpha,beta,children};}
async function pneg(pool,state,alpha,beta,depth,activeWorkers,laneCap){
  if(depth<=0){const r=await pool.run(state,alpha,beta);return r.score;}
  const p=prepare(state,alpha,beta);if('terminal'in p)return p.terminal;alpha=p.alpha;beta=p.beta;const children=p.children;if(!children.length)return alpha;splitNodes++;
  const before=pool.nodes+shellNodes,t0=process.hrtime.bigint();let score=-await pneg(pool,children[0],-beta,-alpha,depth-1,activeWorkers,laneCap);const eldestNodes=(pool.nodes+shellNodes)-before,eldestSec=Number(process.hrtime.bigint()-t0)/1e9;
  if(score>=beta)return score;if(score>alpha)alpha=score;if(children.length===1)return alpha;siblingTasks+=children.length-1;
  let localLaneCap=laneCap;if(eldestNodes<80000&&eldestSec<0.008)localLaneCap=1;let childDepth=depth-1;if(eldestNodes<30000&&eldestSec<0.003)childDepth=0;else if(eldestNodes<150000)childDepth=Math.min(childDepth,1);
  let next=1,cutoff=null,best=alpha;const laneCount=Math.min(activeWorkers,localLaneCap,Math.max(1,pool.idle.length),children.length-1);
  async function lane(){while(cutoff===null){const i=next++;if(i>=children.length)return;const ss=-await pneg(pool,children[i],-beta,-best,childDepth,activeWorkers,laneCap);if(ss>=beta){cutoff=ss;return;}if(ss>best)best=ss;}}
  await Promise.all(Array.from({length:laneCount},()=>lane()));return cutoff===null?best:cutoff;
}
function chooseConfig(prevNodes,moves){
  const n=MAX_WORKERS;
  if(prevNodes===null){if(moves<=4)return{workers:n,depth:Math.min(4,Math.max(2,n)),lanes:Math.min(2,n)};return{workers:1,depth:0,lanes:1};}
  if(prevNodes<150000)return{workers:1,depth:0,lanes:1};
  if(prevNodes<1000000)return{workers:Math.min(2,n),depth:2,lanes:Math.min(2,n)};
  if(prevNodes<1500000)return{workers:Math.min(3,n),depth:3,lanes:Math.min(2,n)};
  return{workers:n,depth:Math.min(4,Math.max(2,n)),lanes:Math.min(2,n)};
}
async function solve(pool,state){
  let min=-Math.trunc((CELLS-state.moves)/2),max=Math.trunc((CELLS+1-state.moves)/2),prevNodes=null,iter=0;const iterations=[];
  while(min<max){let med=min+Math.trunc((max-min)/2);if(med<=0&&Math.trunc(min/2)<med)med=Math.trunc(min/2);else if(med>=0&&Math.trunc(max/2)>med)med=Math.trunc(max/2);const cfg=chooseConfig(prevNodes,state.moves),bNodes=pool.nodes+shellNodes,bRe=pool.reclaims,bAl=pool.allocations,bSp=pool.spills,bTr=pool.depTransitions,t0=process.hrtime.bigint();const s=await pneg(pool,state,med,med+1,cfg.depth,cfg.workers,cfg.lanes);await pool.drain();const sec=Number(process.hrtime.bigint()-t0)/1e9,nodes=(pool.nodes+shellNodes)-bNodes;const rec={iter:++iter,med,score:s,nodes,sec,nps:nodes/sec,reclaims:pool.reclaims-bRe,allocations:pool.allocations-bAl,spills:pool.spills-bSp,depTransitions:pool.depTransitions-bTr,...cfg};iterations.push(rec);console.log(JSON.stringify({type:'iteration',...rec}));prevNodes=nodes;if(s<=med)max=s;else min=s;}
  return{score:min===0?0:min,iterations};
}
const root=parse(SEQ);console.log(JSON.stringify({type:'start',sequence:SEQ,moves:root.moves,availableParallelism:availableParallelism(),maxWorkers:MAX_WORKERS,chunkCountPerWorker:CHUNK_COUNT,chunkEntries:CHUNK_SIZE,totalEntries:CHUNK_COUNT*CHUNK_SIZE*MAX_WORKERS,totalTTMiB:(CHUNK_COUNT*CHUNK_SIZE*MAX_WORKERS*9)/(1024*1024),depRows:DEP_ROWS}));
const pool=new Pool(MAX_WORKERS);await pool.init(root);pool.resetMetrics();shellNodes=0;splitNodes=0;siblingTasks=0;const t0=process.hrtime.bigint();const out=await solve(pool,root);const sec=Number(process.hrtime.bigint()-t0)/1e9;console.log(JSON.stringify({type:'done',score:out.score,seconds:sec,totalNodes:pool.nodes+shellNodes,nps:(pool.nodes+shellNodes)/sec,tasks:pool.tasks,reclaims:pool.reclaims,allocations:pool.allocations,spills:pool.spills,depTransitions:pool.depTransitions,mapHits:pool.mapHits,splitNodes,siblingTasks,iterations:out.iterations}));await pool.close();
