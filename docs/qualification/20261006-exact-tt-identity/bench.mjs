// Solver never receives expected outcomes. Validation is outside this process.
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {performance} from 'node:perf_hooks';
import {cpus} from 'node:os';
import {profile} from '../../../isomax/index.mjs';
const options={identity:'native32',timeout:'120000','shared-entries':'134217728','local-entries':'8388608','shared-bank-entries':'0'};
for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i].replace(/^--/,'');if(!Object.hasOwn(options,k)||process.argv[i+1]===undefined)throw Error('Invalid option');options[k]=process.argv[i+1];}
if(!['native32','partial24','partialMixed'].includes(options.identity))throw Error('Unknown candidate');
const producer='C:/r/jsminsys-cpc-rebuild-20261004',modules={
 ...await import(pathToFileURL(resolve(producer,'addons/rba-connect4-geometry.mjs'))),
 ...await import(pathToFileURL(resolve(producer,'addons/rba-connect4-prepared-session-host.mjs'))),
 ...await import(pathToFileURL(resolve(producer,'addons/worker-topology.mjs')))},plan=await modules.discoverWorkerPlan();
if(plan.workers!==6)throw Error('Controlled experiment requires six discovered performance cores');
const started=performance.now(),configuration={...profile.options,cacheIdentity:options.identity,workers:plan.workers,workerTargets:plan.targets,
 sharedCacheCapacity:Number(options['shared-entries']),localCacheCapacity:Number(options['local-entries']),timeoutMs:Number(options.timeout),
 sharedBankCapacity:Number(options['shared-bank-entries'])||null,
 geometry:modules.prepareConnect4RbaGeometry({columns:7,rows:6})};
const app=await modules.prepareLazySmpConnect4Rba32(configuration);
let result;
try{if(app.state().readyWorkers!==6||!app.state().affinityVerified)throw Error('Readiness/pinning failure');result=await app.solve([]);}
finally{await app.close();}
console.log(JSON.stringify({identity:options.identity,startingPosition:'empty',geometry:'7x6',workerPlan:plan,
 configuration:{...profile.options,cacheIdentity:options.identity,workers:6,sharedCacheCapacity:configuration.sharedCacheCapacity,localCacheCapacity:configuration.localCacheCapacity,sharedBankCapacity:configuration.sharedBankCapacity,timeoutMs:configuration.timeoutMs},
 primaryWallMs:result.preparedTiming.solveMs,operationWallMs:performance.now()-started,
 runtime:{node:process.version,v8:process.versions.v8,cpu:cpus()[0]?.model},memory:process.memoryUsage(),result},null,2));
process.exitCode=result.status==='EXACT'?0:2;
