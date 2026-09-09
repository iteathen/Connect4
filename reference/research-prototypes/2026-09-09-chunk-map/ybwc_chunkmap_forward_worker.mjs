import {parentPort,workerData} from 'node:worker_threads';
import {Solver} from './twoword_solver_chunkmap.mjs';
const s=new Solver(workerData);let pending=null;
function metrics(){return{nodes:s.nodes,ttHits:s.ttHits,crossHits:s.crossHits,writeAttempts:s.writeAttempts,writeSuccess:s.writeSuccess,writeBusy:s.writeBusy,mapLoads:s.mapLoads,mapInstalls:s.mapInstalls,depTransitions:s.depTransitions};}
function start(m,hold){s.resetMetrics();s.limit=Infinity;const sig=s.dependencySig(m.cLo>>>0,m.cHi>>>0,m.mLo>>>0,m.mHi>>>0,m.moves|0),desc=s.resolve(sig);const task={...m,sig,desc};if(hold){pending=task;parentPort.postMessage({type:'held',id:m.id,sig,desc});return;}run(task);}
function run(m){const t=process.hrtime.bigint();const score=s.negamax(m.cLo>>>0,m.cHi>>>0,m.mLo>>>0,m.mHi>>>0,m.moves|0,m.alpha|0,m.beta|0,m.sig,m.desc);parentPort.postMessage({type:'result',id:m.id,score,seconds:Number(process.hrtime.bigint()-t)/1e9,sig:m.sig,desc:m.desc,...metrics()});}
parentPort.on('message',m=>{if(m.type==='warm'){s.resetMetrics();s.limit=m.limit??30000;try{s.negamax(m.cLo>>>0,m.cHi>>>0,m.mLo>>>0,m.mHi>>>0,m.moves|0,m.alpha|0,m.beta|0);}catch(e){if(e!==911)throw e;}s.limit=Infinity;parentPort.postMessage({type:'warmed'});return;}if(m.type==='hold')return start(m,true);if(m.type==='task')return start(m,false);if(m.type==='release'){if(!pending||pending.id!==m.id)throw Error('bad release');const p=pending;pending=null;return run(p);}});
parentPort.postMessage({type:'ready'});
