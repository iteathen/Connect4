import { parentPort, workerData } from 'node:worker_threads';
import { Solver } from './twoword_solver_sharedtt.mjs';
const wid=workerData.workerId|0;
const solver=new Solver(15,false,wid);
const keyLoSab=workerData.keyLoSab,keyHiSab=workerData.keyHiSab,valSab=workerData.valSab,ctrlSab=workerData.ctrlSab,ownerSab=workerData.ownerSab;
function setRegion(off,pow){const size=1<<pow;solver.size=size;solver.mask=size-1;solver.keyLo=new Uint32Array(keyLoSab,off*4,size);solver.keyHi=new Uint32Array(keyHiSab,off*4,size);solver.val=new Uint8Array(valSab,off,size);solver.ctrl=new Int32Array(ctrlSab,off*4,size);solver.owner=new Uint8Array(ownerSab,off,size);}
function metrics(){return {nodes:solver.nodes,ttHits:solver.ttHits,crossHits:solver.crossHits,writeAttempts:solver.writeAttempts,writeSuccess:solver.writeSuccess,writeBusy:solver.writeBusy};}
parentPort.on('message',m=>{
  if(m.type==='warm'){setRegion(0,Math.min(workerData.totalPow|0,17));solver.resetMetrics();solver.limit=m.limit??30000;try{solver.negamax(m.cLo>>>0,m.cHi>>>0,m.mLo>>>0,m.mHi>>>0,m.moves|0,m.alpha|0,m.beta|0);}catch(e){if(e!==911)throw e;}solver.limit=Infinity;parentPort.postMessage({type:'warmed'});return;}
  if(m.type==='task'){setRegion(m.offsetEntries|0,m.tablePow|0);solver.resetMetrics();solver.limit=Infinity;const t0=process.hrtime.bigint();const score=solver.negamax(m.cLo>>>0,m.cHi>>>0,m.mLo>>>0,m.mHi>>>0,m.moves|0,m.alpha|0,m.beta|0);const seconds=Number(process.hrtime.bigint()-t0)/1e9;parentPort.postMessage({type:'result',id:m.id,score,seconds,...metrics()});}
});
parentPort.postMessage({type:'ready'});