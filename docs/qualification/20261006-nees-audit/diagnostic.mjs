// Runtime observation only. No expected-answer input or hot-loop instrumentation.
import {writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {performance} from 'node:perf_hooks';
import {profile} from '../../../isomax/index.mjs';
const summaryPath=process.argv[2];if(!summaryPath)throw Error('Summary path required');
const producer='C:/r/jsminsys-cpc-rebuild-20261004/',
 {prepareConnect4RbaGeometry}=await import(pathToFileURL(producer+'addons/rba-connect4-geometry.mjs')),
 {prepareLazySmpConnect4Rba32}=await import(pathToFileURL(producer+'addons/rba-connect4-prepared-session-host.mjs')),
 {discoverWorkerPlan}=await import(pathToFileURL(producer+'addons/worker-topology.mjs')),
 plan=await discoverWorkerPlan();
if(plan.workers!==6)throw Error('Expected six discovered performance cores');
console.log(JSON.stringify({auditPhase:'PREPARATION_START',atMs:performance.now()}));
const app=await prepareLazySmpConnect4Rba32({...profile.options,workers:6,workerTargets:plan.targets,
 geometry:prepareConnect4RbaGeometry({columns:7,rows:6}),cacheIdentity:'partial24',
 sharedCacheCapacity:2**29,sharedBankCapacity:2**28,localCacheCapacity:2**23,timeoutMs:10000});
let result;
try{
 if(app.state().readyWorkers!==6||!app.state().affinityVerified)throw Error('Readiness/affinity failure');
 console.log(JSON.stringify({auditPhase:'READY',atMs:performance.now(),mainIsolateMemory:process.memoryUsage()}));
 console.log(JSON.stringify({auditPhase:'SEARCH_BEGIN_INCLUDES_ROOT_INGRESS',atMs:performance.now()}));
 result=await app.solve([]);
 console.log(JSON.stringify({auditPhase:'SEARCH_RETURN_AFTER_WORKER_CLEANUP',atMs:performance.now(),status:result.status}));
}finally{await app.close();}
const out={kind:'NEES realization diagnostic',performanceConclusionAllowed:false,
 note:'10-second observation with V8 tracing/code printing; not a full-solve benchmark. Root E3 work follows READY. Main heap snapshots exclude worker-isolate heaps.',
 runtime:{node:process.version,v8:process.versions.v8,platform:process.platform,arch:process.arch},workerPlan:plan,
 requested:{geometry:'7x6',start:'empty',sharedBytes:12*2**30,privateBytesPerWorker:192*2**20,timeoutMs:10000},result};
writeFileSync(summaryPath,JSON.stringify(out,null,2)+'\n');
process.exitCode=result.cleanup&&result.workersExited===6&&['TIMEOUT','EXACT'].includes(result.status)?0:1;
