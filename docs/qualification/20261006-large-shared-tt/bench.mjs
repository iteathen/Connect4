// External experiment entry point. No expected answer enters the solver.
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {performance} from 'node:perf_hooks';
import {cpus} from 'node:os';
import {profile} from '../../../isomax/index.mjs';
const args=process.argv.slice(2),options={mode:'candidate','shared-gib':'4','bank-gib':'0','producer-root':'C:/r/jsminsys-cpc-rebuild-20261004'};
for(let i=0;i<args.length;i+=2){const key=args[i]?.replace(/^--/,'');if(!Object.hasOwn(options,key)||args[i+1]===undefined)throw Error('Invalid benchmark option');options[key]=args[i+1];}
const sharedGiB=Number(options['shared-gib']),bankGiB=Number(options['bank-gib']);
if(![4,8,16].includes(sharedGiB)||![0,2,4].includes(bankGiB)||!['baseline','candidate'].includes(options.mode))throw Error('Unsupported experimental configuration');
const started=performance.now(),modules=options.mode==='baseline'?await import('../../../isomax/index.mjs'):{
 ...await import(pathToFileURL(resolve(options['producer-root'],'addons/rba-connect4-geometry.mjs'))),
 ...await import(pathToFileURL(resolve(options['producer-root'],'addons/rba-connect4-prepared-session-host.mjs'))),
 ...await import(pathToFileURL(resolve(options['producer-root'],'addons/worker-topology.mjs')))},
 plan=await modules.discoverWorkerPlan();
if(plan.workers!==6||plan.targets.length!==6)throw Error('Six available physical P-core targets required for this experiment');
const configuration={...profile.options,workers:plan.workers,geometry:modules.prepareConnect4RbaGeometry({columns:7,rows:6}),
 sharedCacheCapacity:sharedGiB*33554432,localCacheCapacity:8388608,sharedCacheLayout:'native',workerTargets:plan.targets,
 ...(bankGiB?{sharedBankCapacity:bankGiB*33554432}:{})};
const app=await modules.prepareLazySmpConnect4Rba32(configuration);
let result;
try{if(app.state().readyWorkers!==6||!app.state().affinityVerified)throw Error('All-ready verified affinity failed');result=await app.solve([]);}
finally{await app.close();}
console.log(JSON.stringify({experiment:options.mode,startingPosition:'empty',geometry:'7x6',sharedGiB,bankGiB,
 workerPlan:app.workerPlan??plan,configuration:{...profile.options,workers:6,sharedCacheCapacity:configuration.sharedCacheCapacity,
 sharedCacheLayout:'native',localCacheCapacity:8388608,sharedBankCapacity:configuration.sharedBankCapacity??null},
 primaryWallMs:result.preparedTiming.solveMs,operationWallMs:performance.now()-started,
 runtime:{node:process.version,v8:process.versions.v8,cpu:cpus()[0]?.model},memory:process.memoryUsage(),result},null,2));
process.exitCode=result.status==='EXACT'?0:2;
