import { parentPort, workerData } from 'node:worker_threads';
import { Solver } from './twoword_solver_tasklocal.mjs';
const CHUNK_SIZE=1<<15;
const solver=new Solver(18,false,15);
solver.keyLo=new Uint32Array(workerData.keyLoSab);
solver.keyHi=new Uint32Array(workerData.keyHiSab);
solver.val=new Uint8Array(workerData.valSab);
function run(t){
  solver.chunkBase=t.chunkIndex*CHUNK_SIZE; solver.nodes=0; solver.limit=t.limit;
  const t0=process.hrtime.bigint(); let score=null,stopped=false;
  try{score=solver.solveBits(t.cLo>>>0,t.cHi>>>0,t.mLo>>>0,t.mHi>>>0,t.moves|0);}catch(e){if(e===911)stopped=true;else throw e;}
  const seconds=Number(process.hrtime.bigint()-t0)/1e9; solver.limit=Infinity;
  return {id:t.id,nodes:solver.nodes,seconds,score,stopped};
}
parentPort.on('message',m=>{
  if(m.type==='warm'){const t={...m.task,limit:100000};run(t);parentPort.postMessage({type:'warmed'});return;}
  if(m.type==='task'){parentPort.postMessage({type:'result',result:run(m.task)});return;}
});
parentPort.postMessage({type:'ready'});
