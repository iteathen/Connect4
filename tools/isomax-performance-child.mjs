import fs from 'node:fs';
import { IsoMaxBranchManager } from '../components/isometric/execution/branch-manager.mjs';

const started=performance.now();
const manager=new IsoMaxBranchManager(process.argv[4]?{workers:Number(process.argv[4])}:{});
const moves=process.argv[2]?process.argv[2].split(',').map(Number):[];
const timeoutMs=process.argv[3]?Number(process.argv[3]):120000;
function emit(phase,snapshot={},extra={}) {
  const resource=process.resourceUsage();
  const now=performance.now();
  fs.writeSync(1,JSON.stringify({kind:'isomax-performance',phase,elapsedMs:now-started,
    solveMs:snapshot.elapsedMs??0,metrics:snapshot.metrics??{nodes:0},
    execution:{workerCount:manager.workerCount,managerNodes:snapshot.managerNodes??0,
      executor:snapshot.executor??null},
    memory:{...process.memoryUsage(),maxRssBytes:resource.maxRSS*1024},
    cpuUserUs:resource.userCPUTime,cpuSystemUs:resource.systemCPUTime,
    ...extra})+'\n');
}
emit('prepared',{}, {rootPly:moves.length});
let result,error;
try{
  result=await manager.solveMoves(moves,{timeoutMs,selectMove:false,onProgress:s=>emit('progress',s)});
}catch(caught){error=caught;}
finally{await manager.close();}
if(error){
  const timedOut=error.message.startsWith('ISOMAX_TIMEOUT');
  emit(timedOut?'timeout':'failure',manager.lastStats??{},{
    rootWdl:null,error:{name:error.name,message:error.message},cleanup:'workers-terminated'});
  if(!timedOut)process.exitCode=1;
}else emit('complete',result,{rootWdl:result.value,cleanup:'workers-terminated'});
