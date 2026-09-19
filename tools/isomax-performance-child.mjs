import fs from 'node:fs';
import { performance } from 'node:perf_hooks';
import { IsoMaxSolver } from '../components/isometric/index.mjs';

const started=performance.now();
let solveStarted=null, lastSnapshot=0;
function emit(solver,phase,extra={}) {
  const resource=process.resourceUsage();
  const now=performance.now();
  fs.writeSync(1,JSON.stringify({kind:'isomax-performance',phase,elapsedMs:now-started,
    solveMs:solveStarted===null?null:now-solveStarted,metrics:{...solver.metrics},
    memory:{...process.memoryUsage(),maxRssBytes:resource.maxRSS*1024},
    cpuUserUs:resource.userCPUTime,cpuSystemUs:resource.systemCPUTime,
    cacheEntries:solver.transitionCache.count,cacheCapacity:solver.transitionCache.capacity,
    residualClasses:solver.pool.classCount,...extra})+'\n');
  lastSnapshot=now;
}
class ObservedSolver extends IsoMaxSolver {
  solveNode(state) {
    if ((this.metrics.nodes & 8191)===0 && performance.now()-lastSnapshot>=1000) emit(this,'progress');
    return super.solveNode(state);
  }
}
const solver=new ObservedSolver();
// Optional legal replay is used only by harness correctness controls. The
// public performance command always sends the empty standard-board workload.
const state=solver.createState(process.argv[2]?process.argv[2].split(',').map(Number):null);
emit(solver,'prepared',{rootPly:state.ply});
solveStarted=performance.now();
try {
  const {value}=solver.solveValue(state);
  emit(solver,'complete',{rootWdl:value});
} catch(error) {
  emit(solver,'failure',{error:{name:error.name,message:error.message}});
  throw error;
}
