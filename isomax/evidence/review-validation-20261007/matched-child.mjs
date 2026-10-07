// Controlled raw-host comparison. No expected answer enters this process.
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {performance} from 'node:perf_hooks';
import {cpus} from 'node:os';
const root=resolve(process.argv[2]),sourceCommit=process.argv[3];
const {prepareConnect4RbaGeometry}=await import(pathToFileURL(resolve(root,'addons/rba-connect4-geometry.mjs')));
const {prepareLazySmpConnect4Rba32}=await import(pathToFileURL(resolve(root,'addons/rba-connect4-prepared-session-host.mjs')));
const {discoverWorkerPlan}=await import(pathToFileURL(resolve(root,'addons/worker-topology.mjs')));
const cpuStart=process.cpuUsage(),operationStart=performance.now(),workerPlan=await discoverWorkerPlan();
if(workerPlan.workers!==6)throw Error('Controlled series requires six discovered P-cores');
const configuration={workers:6,workerTargets:workerPlan.targets,workerMode:'minimal',
 sharedCacheLayout:'native',localCacheLayout:'native',rootFrontier:false,sharedSampleMask:0,sharedProofBounds:true,
 supportBasisPlanBudgetBytes:1073741824,supportClosurePlan:true,supportReflectionPlan:true,supportBasisViews:true,
 cacheIdentity:'partial24',sharedCacheCapacity:536870912,localCacheCapacity:8388608,sharedBankCapacity:268435456,
 timeoutMs:180000,initializationTimeoutMs:120000};
const app=await prepareLazySmpConnect4Rba32({...configuration,geometry:prepareConnect4RbaGeometry({columns:7,rows:6})});
let result;try{
 const ready=app.state();if(ready.readyWorkers!==6||!ready.affinityVerified||ready.searchStarted)throw Error('Readiness/pinning precondition failed');
 result=await app.solve([]);
}finally{await app.close();}
const cpu=process.cpuUsage(cpuStart);
console.log(JSON.stringify({sourceCommit,startingPosition:'empty',geometry:'7x6',workerPlan,configuration,
 runtime:{node:process.version,v8:process.versions.v8,cpu:cpus()[0]?.model},
 primaryWallMs:result.preparedTiming.solveMs,operationWallMs:performance.now()-operationStart,
 cpuMs:(cpu.user+cpu.system)/1000,peakRssBytes:process.resourceUsage().maxRSS*1024,result},null,2));
process.exitCode=result.status==='EXACT'?0:2;
