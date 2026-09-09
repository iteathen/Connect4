import { parentPort, workerData } from 'node:worker_threads';
import { Solver } from './twoword_solver_sharedtt.mjs';
const pow=workerData.tablePow|0, size=1<<pow, off=workerData.offsetEntries|0, wid=workerData.workerId|0;
const solver=new Solver(pow,true,wid);
solver.keyLo=new Uint32Array(workerData.keyLoSab,off*4,size);
solver.keyHi=new Uint32Array(workerData.keyHiSab,off*4,size);
solver.val=new Uint8Array(workerData.valSab,off,size);
solver.ctrl=new Int32Array(workerData.ctrlSab,off*4,size);
solver.owner=new Uint8Array(workerData.ownerSab,off,size);
function metrics(){return {nodes:solver.nodes,ttHits:solver.ttHits,crossHits:solver.crossHits,writeAttempts:solver.writeAttempts,writeSuccess:solver.writeSuccess,writeBusy:solver.writeBusy};}
parentPort.on('message',m=>{
  if(m.type==='warm'){
    solver.resetMetrics(); solver.limit=m.limit??30000;
    try{solver.negamax(m.cLo>>>0,m.cHi>>>0,m.mLo>>>0,m.mHi>>>0,m.moves|0,m.alpha|0,m.beta|0);}catch(e){if(e!==911)throw e;}
    solver.limit=Infinity; parentPort.postMessage({type:'warmed'}); return;
  }
  if(m.type==='task'){
    solver.resetMetrics(); solver.limit=Infinity;
    const t0=process.hrtime.bigint();
    const score=solver.negamax(m.cLo>>>0,m.cHi>>>0,m.mLo>>>0,m.mHi>>>0,m.moves|0,m.alpha|0,m.beta|0);
    const seconds=Number(process.hrtime.bigint()-t0)/1e9;
    parentPort.postMessage({type:'result',id:m.id,score,seconds,...metrics()});
  }
});
parentPort.postMessage({type:'ready'});
