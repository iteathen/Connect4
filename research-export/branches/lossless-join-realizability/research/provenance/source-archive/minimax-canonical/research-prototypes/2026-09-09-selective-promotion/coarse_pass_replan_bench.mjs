import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const WIDTH=7,HEIGHT=6,STRIDE=7,CELLS=42,ORDER=[3,4,2,5,1,6,0];
const SEQ=process.argv[2]??'41267575';
const WORKERS=Math.max(1,Number(process.argv[3]??4)|0);
const TOTAL_POW=Number(process.argv[4]??20)|0;
const REPEATS=Math.max(1,Number(process.argv[5]??3)|0);
const MODES=(process.argv[6]??'flat,frozen1,replan1,cumulative1').split(',');
const OUTPUT_MODE=process.argv[7]??'full';
const SPLIT_DEPTH=4,LANE_CAP=2,SLAB_POW=15,SLAB_ENTRIES=1<<SLAB_POW;
const workerFile=resolve(dirname(fileURLToPath(import.meta.url)),'ybwc_descriptor_worker.mjs');

let bottom=0n;
const bottomMasks=[],columnMasks=[],topMasks=[];
for(let c=0;c<WIDTH;c++){
  const sh=BigInt(c*STRIDE);
  bottomMasks[c]=1n<<sh;
  topMasks[c]=1n<<BigInt(HEIGHT-1+c*STRIDE);
  columnMasks[c]=((1n<<6n)-1n)<<sh;
  bottom|=bottomMasks[c];
}
const board=bottom*((1n<<6n)-1n);
function winningPositions(position,mask){
  let r=(position<<1n)&(position<<2n)&(position<<3n);
  let p=(position<<7n)&(position<<14n);
  r|=p&(position<<21n);r|=p&(position>>7n);
  p=(position>>7n)&(position>>14n);r|=p&(position<<7n);r|=p&(position>>21n);
  p=(position<<6n)&(position<<12n);r|=p&(position<<18n);r|=p&(position>>6n);
  p=(position>>6n)&(position>>12n);r|=p&(position<<6n);r|=p&(position>>18n);
  p=(position<<8n)&(position<<16n);r|=p&(position<<24n);r|=p&(position>>8n);
  p=(position>>8n)&(position>>16n);r|=p&(position<<8n);r|=p&(position>>24n);
  return r&(board^mask);
}
const possible=mask=>(mask+bottom)&board;
const canPlay=(mask,c)=>(mask&topMasks[c])===0n;
const isWinningMove=(cur,mask,c)=>(winningPositions(cur,mask)&possible(mask)&columnMasks[c])!==0n;
const playColumn=(mask,c)=>(mask+bottomMasks[c])&columnMasks[c];
function parse(seq){
  let current=0n,mask=0n,moves=0;
  for(const ch of seq){
    const c=ch.charCodeAt(0)-49;
    if(c<0||c>=7||!canPlay(mask,c)||isWinningMove(current,mask,c))throw Error('bad sequence');
    const mv=playColumn(mask,c); current^=mask; mask|=mv; moves++;
  }
  return{current,mask,moves};
}
function pair(x){return[Number(x&0xffffffffn)>>>0,Number((x>>32n)&0xffffffffn)>>>0];}
function dependencySig2(state){
  const{current,mask,moves}=state;
  const p0=(moves&1)===0?current:(current^mask),p1=(moves&1)===0?(current^mask):current;
  let sig=0;
  for(let c=0;c<WIDTH;c++){
    const b=BigInt(c*STRIDE),b0=Number((p0>>b)&1n),b1=Number((p1>>b)&1n);
    let code=0;
    if(b0||b1){
      const o0=b1?1:0,s0=Number((p0>>(b+1n))&1n),s1=Number((p1>>(b+1n))&1n);
      if(!(s0||s1))code=o0?2:1;
      else {const o1=s1?1:0;code=3+(o0<<1)+o1;}
    }
    sig|=code<<(c*3);
  }
  return sig>>>0;
}
function popBig(x){let n=0;while(x){x&=x-1n;n++;}return n;}
function multiBit(x){return x!==0n&&(x&(x-1n))!==0n;}
const median=xs=>{const a=[...xs].sort((a,b)=>a-b);return a[(a.length-1)>>1];};
const isPowerOfTwo=x=>x>0&&(x&(x-1))===0;
const ilog2=x=>31-Math.clz32(x);

class Pool{
  constructor(n,mode){
    this.n=n;this.mode=mode;this.workers=[];this.id=1;this.waiters=new Map();this.idle=[];this.queue=[];
    this.chunkMap=new Int32Array(1<<21);
    this.descOffset=new Int32Array(32);
    this.descPow=new Int8Array(32);
    this.descCount=1;
    this.promoted=false;
    this.resetRun();
  }
  resetRun(){
    this.nodes=0;this.ttHits=0;this.crossHits=0;this.tasks=0;this.mapResolves=0;this.fallbackTasks=0;
    this.family=new Map();this.passFamily=new Map();this.descTasks=new Uint32Array(32);this.descNodes=new Float64Array(32);
    this.promotions=[];this.placementHistory=[];this.placementEpoch=0;this.passEvidence=[];this.taskEvidence=[];this.currentPass=0;
    this.chunkMap.fill(0);this.descCount=1;this.descOffset.fill(0);this.descPow.fill(0);
    this.descOffset[0]=0;this.descPow[0]=TOTAL_POW;this.promoted=false;
  }
  async init(root){
    const total=1<<TOTAL_POW;
    this.keyLoSab=new SharedArrayBuffer(total*4);
    this.keyHiSab=new SharedArrayBuffer(total*4);
    this.valSab=new SharedArrayBuffer(total);
    this.ctrlSab=new SharedArrayBuffer(total*4);
    this.ownerSab=new SharedArrayBuffer(total);
    for(let i=0;i<this.n;i++){
      const w=new Worker(workerFile,{workerData:{keyLoSab:this.keyLoSab,keyHiSab:this.keyHiSab,valSab:this.valSab,ctrlSab:this.ctrlSab,ownerSab:this.ownerSab,workerId:i,totalPow:TOTAL_POW}});
      w.on('message',m=>this.onMessage(w,m));
      await new Promise((res,rej)=>{
        const f=m=>{if(m.type==='ready'){w.off('message',f);res();}};
        w.on('message',f);w.once('error',rej);
      });
      this.workers.push(w);this.idle.push(w);
    }
    const[cLo,cHi]=pair(root.current),[mLo,mHi]=pair(root.mask);
    await Promise.all(this.workers.map(w=>new Promise((res,rej)=>{
      const f=m=>{if(m.type==='warmed'){w.off('message',f);res();}};
      w.on('message',f);w.once('error',rej);
      w.postMessage({type:'warm',cLo,cHi,mLo,mHi,moves:root.moves,alpha:-1,beta:0,limit:30000});
    })));
    this.clear();
  }
  clear(){
    new Uint32Array(this.keyLoSab).fill(0);new Uint32Array(this.keyHiSab).fill(0);
    new Uint8Array(this.valSab).fill(0);new Int32Array(this.ctrlSab).fill(0);new Uint8Array(this.ownerSab).fill(0);
  }
  onMessage(w,m){
    if(m.type!=='result')return;
    this.nodes+=m.nodes??0;this.ttHits+=m.ttHits??0;this.crossHits+=m.crossHits??0;this.tasks++;
    const x=this.waiters.get(m.id);
    if(x){
      const f=this.family.get(x.sig2)??{tasks:0,nodes:0,seconds:0};
      f.tasks++;f.nodes+=m.nodes??0;f.seconds+=m.seconds??0;this.family.set(x.sig2,f);
      const p=this.passFamily.get(x.sig2)??{tasks:0,nodes:0,seconds:0};
      p.tasks++;p.nodes+=m.nodes??0;p.seconds+=m.seconds??0;this.passFamily.set(x.sig2,p);
      this.descTasks[x.descId]++;this.descNodes[x.descId]+=m.nodes??0;
      this.taskEvidence.push({id:m.id,pass:x.pass,placementEpoch:x.placementEpoch,sig2:x.sig2,descId:x.descId,offsetEntries:x.offsetEntries,tablePow:x.tablePow,nodes:m.nodes??0,seconds:m.seconds??0,ttHits:m.ttHits??0,crossHits:m.crossHits??0});
      this.waiters.delete(m.id);x.resolve(m);
    }
    this.idle.push(w);this.pump();
  }
  pump(){while(this.idle.length&&this.queue.length){const w=this.idle.pop(),m=this.queue.shift();w.postMessage(m);}}
  run(state,alpha,beta){
    const id=this.id++,[cLo,cHi]=pair(state.current),[mLo,mHi]=pair(state.mask),sig2=dependencySig2(state);
    const descId=this.chunkMap[sig2]|0;
    const offsetEntries=this.descOffset[descId]|0,tablePow=this.descPow[descId]|0;
    this.mapResolves++;if(descId===0)this.fallbackTasks++;
    return new Promise((resolve,reject)=>{
      this.waiters.set(id,{resolve,reject,sig2,descId,pass:this.currentPass,placementEpoch:this.placementEpoch,offsetEntries,tablePow});
      this.queue.push({type:'task',id,cLo,cHi,mLo,mHi,moves:state.moves,alpha,beta,offsetEntries,tablePow});
      this.pump();
    });
  }
  snapshotPass(pass){
    const families=[...this.passFamily.entries()].map(([sig2,v])=>({sig2,...v})).sort((a,b)=>b.nodes-a.nodes);
    const totalNodes=families.reduce((s,x)=>s+x.nodes,0);
    this.passEvidence.push({pass,totalNodes,families});
    this.passFamily.clear();
    return {families,totalNodes};
  }
  cumulativeProfile(){
    const families=[...this.family.entries()].map(([sig2,v])=>({sig2,...v})).sort((a,b)=>b.nodes-a.nodes);
    const totalNodes=families.reduce((sum,x)=>sum+x.nodes,0);
    return {families,totalNodes};
  }
  installOne(profile,sourcePass,sourceKind){
    const top=profile.families[0];
    if(!top)return;
    // This method is called only after pool.drain(): no coarse task still holds the old placement.
    // Future tasks resolve the new chunk map once; existing TT bytes are retained as safe stale misses/hits.
    this.chunkMap.fill(0);
    const halfPow=TOTAL_POW-1,halfEntries=1<<halfPow;
    this.descCount=2;
    this.descOffset[0]=0;this.descPow[0]=halfPow;
    this.descOffset[1]=halfEntries;this.descPow[1]=halfPow;
    this.chunkMap[top.sig2]=1;
    this.promoted=true;
    this.placementEpoch++;
    const total=profile.totalNodes||1;
    const rec={placementEpoch:this.placementEpoch,afterPass:sourcePass,sourceKind,sig2:top.sig2,nodes:top.nodes,share:top.nodes/total,descId:1,offsetEntries:halfEntries,tablePow:halfPow,entries:halfEntries,slabs:1<<(halfPow-SLAB_POW)};
    this.promotions.push(rec);this.placementHistory.push(rec);
  }
  replanAfterPass(pass,passProfile){
    if(this.mode==='flat')return;
    if(this.mode==='frozen1'){if(pass===1)this.installOne(passProfile,pass,'first-pass-frozen');return;}
    if(this.mode==='replan1'){this.installOne(passProfile,pass,'previous-pass');return;}
    if(this.mode==='cumulative1'){this.installOne(this.cumulativeProfile(),pass,'cumulative');return;}
  }
  descriptorEvidence(){
    const out=[];
    let activeEntries=0;
    for(let d=0;d<this.descCount;d++){
      const entries=1<<this.descPow[d];
      activeEntries+=entries;
      out.push({descId:d,offsetEntries:this.descOffset[d],tablePow:this.descPow[d],entries,slabs:1<<(this.descPow[d]-SLAB_POW),tasks:this.descTasks[d],nodes:this.descNodes[d]});
    }
    return {descriptors:out,activeEntries,slabUtilization:activeEntries/(1<<TOTAL_POW)};
  }
  async drain(){while(this.waiters.size||this.queue.length||this.idle.length!==this.workers.length)await new Promise(r=>setImmediate(r));}
  async close(){await Promise.all(this.workers.map(w=>w.terminate()));}
}

let shellNodes=0;
function prepare(state,alpha,beta){
  shellNodes++;
  const{current,mask,moves}=state;
  let candidates=possible(mask);
  const opponentWins=winningPositions(current^mask,mask),forced=candidates&opponentWins;
  if(forced!==0n){if(multiBit(forced))return{terminal:-Math.trunc((CELLS-moves)/2)};candidates=forced;}
  candidates&=~(opponentWins>>1n);
  if(candidates===0n)return{terminal:-Math.trunc((CELLS-moves)/2)};
  if(moves>=CELLS-2)return{terminal:0};
  const min=-Math.trunc((CELLS-2-moves)/2);
  if(alpha<min){alpha=min;if(alpha>=beta)return{terminal:alpha};}
  const max=Math.trunc((CELLS-1-moves)/2);
  if(beta>max){beta=max;if(alpha>=beta)return{terminal:beta};}
  const children=[];
  for(let oi=0;oi<WIDTH;oi++){
    const c=ORDER[oi],mv=candidates&columnMasks[c];
    if(mv===0n)continue;
    const sc=popBig(winningPositions(current|mv,mask));
    const child={current:current^mask,mask:mask|mv,moves:moves+1,sc};
    let at=children.length;while(at>0&&children[at-1].sc<sc)at--;children.splice(at,0,child);
  }
  return{alpha,beta,children};
}
async function pneg(pool,state,alpha,beta,depth){
  if(depth<=0){const r=await pool.run(state,alpha,beta);return r.score;}
  const p=prepare(state,alpha,beta);if('terminal'in p)return p.terminal;
  alpha=p.alpha;beta=p.beta;const children=p.children;if(!children.length)return alpha;
  let score=-await pneg(pool,children[0],-beta,-alpha,depth-1);
  if(score>=beta)return score;if(score>alpha)alpha=score;if(children.length===1)return alpha;
  let next=1,cutoff=null,best=alpha;
  const laneCount=Math.min(pool.n,LANE_CAP,Math.max(1,pool.idle.length),children.length-1);
  async function lane(){
    while(cutoff===null){
      const i=next++;if(i>=children.length)return;
      const s=-await pneg(pool,children[i],-beta,-best,depth-1);
      if(s>=beta){cutoff=s;return;}if(s>best)best=s;
    }
  }
  await Promise.all(Array.from({length:laneCount},()=>lane()));
  return cutoff===null?best:cutoff;
}
async function solve(pool,state){
  let min=-Math.trunc((CELLS-state.moves)/2),max=Math.trunc((CELLS+1-state.moves)/2),pass=0;
  while(min<max){
    let med=min+Math.trunc((max-min)/2);
    if(med<=0&&Math.trunc(min/2)<med)med=Math.trunc(min/2);
    else if(med>=0&&Math.trunc(max/2)>med)med=Math.trunc(max/2);
    pool.currentPass=pass+1;
    const s=await pneg(pool,state,med,med+1,SPLIT_DEPTH);
    await pool.drain();
    pass++;
    const profile=pool.snapshotPass(pass);
    if(s<=med)max=s;else min=s;
    if(min<max)pool.replanAfterPass(pass,profile);
  }
  return min===0?0:min;
}

const root=parse(SEQ);
for(const mode of MODES){
  const pool=new Pool(WORKERS,mode);await pool.init(root);const runs=[];
  for(let i=0;i<REPEATS;i++){
    pool.clear();pool.resetRun();shellNodes=0;
    const t0=process.hrtime.bigint();
    const score=await solve(pool,root);await pool.drain();
    const sec=Number(process.hrtime.bigint()-t0)/1e9;
    const families=[...pool.family.entries()].map(([sig2,v])=>({sig2,...v})).sort((a,b)=>b.nodes-a.nodes);
    const layout=pool.descriptorEvidence();
    runs.push({
      score,sec,nodes:pool.nodes+shellNodes,workerNodes:pool.nodes,shellNodes,
      ttHits:pool.ttHits,crossHits:pool.crossHits,tasks:pool.tasks,mapResolves:pool.mapResolves,
      fallbackTasks:pool.fallbackTasks,promotions:pool.promotions,placementHistory:pool.placementHistory,descriptors:layout.descriptors,
      activeEntries:layout.activeEntries,slabUtilization:layout.slabUtilization,
      families,passEvidence:pool.passEvidence,taskEvidence:pool.taskEvidence
    });
  }
  const outputRuns=OUTPUT_MODE==='summary'?runs.map(r=>({
    score:r.score,sec:r.sec,nodes:r.nodes,workerNodes:r.workerNodes,shellNodes:r.shellNodes,
    ttHits:r.ttHits,crossHits:r.crossHits,tasks:r.tasks,mapResolves:r.mapResolves,fallbackTasks:r.fallbackTasks,
    promotions:r.promotions,descriptors:r.descriptors,activeEntries:r.activeEntries,slabUtilization:r.slabUtilization
  })):runs;
  console.log(JSON.stringify({
    mode,seq:SEQ,workers:WORKERS,totalPow:TOTAL_POW,totalEntries:1<<TOTAL_POW,slabEntries:SLAB_ENTRIES,outputMode:OUTPUT_MODE,
    medianSec:median(runs.map(r=>r.sec)),medianNodes:median(runs.map(r=>r.nodes)),
    scores:[...new Set(runs.map(r=>r.score))],runs:outputRuns
  }));
  await pool.close();
}
