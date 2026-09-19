import { Worker } from 'node:worker_threads';
import { IsoMaxBranchManager } from '../components/isometric/execution/branch-manager.mjs';

const started=performance.now();
const manager=new IsoMaxBranchManager(process.argv[4]?{workers:Number(process.argv[4])}:{});
const moves=process.argv[2]?process.argv[2].split(',').map(Number):[];
const timeoutMs=process.argv[3]?Number(process.argv[3]):120000;
const controller=new AbortController();
const reporter=new Worker(new URL('./isomax-performance-reporter.mjs',import.meta.url),{
  workerData:{started,workerCount:manager.workerCount},execArgv:[],
});
let reportingError=null;
const reporterClosed=new Promise(resolve=>{
  reporter.once('error',error=>{reportingError=error;controller.abort();});
  reporter.once('exit',code=>{
    if(code!==0){reportingError??=new Error('IsoMax reporter exited: '+code);controller.abort();}
    resolve();
  });
});
function emit(phase,snapshot={},extra={}) {
  if(!reportingError)reporter.postMessage({phase,snapshot,extra,observedAt:performance.now()});
}
emit('prepared',{}, {rootPly:moves.length});
let result,error;
try{
  result=await manager.solveMoves(moves,{timeoutMs,signal:controller.signal,selectMove:false,onProgress:s=>emit('progress',s)});
}catch(caught){error=caught;}
finally{await manager.close();}
if(error){
  const timedOut=error.message.startsWith('ISOMAX_TIMEOUT');
  emit(timedOut?'timeout':'failure',manager.lastStats??{},{
    rootWdl:null,error:{name:error.name,message:error.message},cleanup:'workers-terminated'});
  if(!timedOut)process.exitCode=1;
}else emit('complete',result,{rootWdl:result.value,cleanup:'workers-terminated'});
if(!reportingError)reporter.postMessage({close:true});
await reporterClosed;
if(reportingError)throw reportingError;
