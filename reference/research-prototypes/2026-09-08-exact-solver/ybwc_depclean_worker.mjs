import { parentPort, workerData } from 'node:worker_threads';
import { Solver } from './twoword_solver_depclean.mjs';
const chunkCount=workerData.chunkCount??16, chunkPow=workerData.chunkPow??15;
const solver=new Solver(chunkCount,false,chunkPow,workerData.depRows??2);
if(workerData.keyLoSab){
  const entries=chunkCount*(1<<chunkPow), wi=workerData.workerIndex|0;
  solver.keyLo=new Uint32Array(workerData.keyLoSab,wi*entries*4,entries);
  solver.keyHi=new Uint32Array(workerData.keyHiSab,wi*entries*4,entries);
  solver.val=new Uint8Array(workerData.valSab,wi*entries,entries);
}
parentPort.on('message',m=>{
  if(m.type==='warm'){
    solver.resetMetrics();solver.limit=m.limit??50000;
    const [sig,base]=solver.beginTask(m.cLo>>>0,m.cHi>>>0,m.mLo>>>0,m.mHi>>>0,m.moves|0);
    try{solver.negamax(m.cLo>>>0,m.cHi>>>0,m.mLo>>>0,m.mHi>>>0,m.moves|0,m.alpha|0,m.beta|0,sig,base);}catch(e){if(e!==911)throw e;}
    solver.limit=Infinity;parentPort.postMessage({type:'warmed'});return;
  }
  if(m.type==='task'){
    solver.resetMetrics();solver.limit=Infinity;
    const cLo=m.cLo>>>0,cHi=m.cHi>>>0,mLo=m.mLo>>>0,mHi=m.mHi>>>0,moves=m.moves|0;
    const [sig,base]=solver.beginTask(cLo,cHi,mLo,mHi,moves);
    const t0=process.hrtime.bigint();const score=solver.negamax(cLo,cHi,mLo,mHi,moves,m.alpha|0,m.beta|0,sig,base);const seconds=Number(process.hrtime.bigint()-t0)/1e9;
    parentPort.postMessage({type:'result',id:m.id,score,nodes:solver.nodes,seconds,cleanScans:solver.cleanScans,reclaims:solver.reclaims,allocations:solver.allocations,mapHits:solver.mapHits,spillTransitions:solver.spillTransitions,depTransitions:solver.depTransitions});
  }
});
parentPort.postMessage({type:'ready'});
