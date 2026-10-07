import {readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
const [packageRoot,history='']=process.argv.slice(2);
if(!packageRoot||!/^[1-7]{0,42}$/.test(history))throw Error('Usage: node [profile flags] run-diagnostic.mjs PRIVATE_PACKAGE [HISTORY_1_TO_7]');
const root=resolve(packageRoot),manifest=JSON.parse(readFileSync(join(root,'diagnostic-manifest.json'),'utf8'));
if(manifest.diagnosticOnly!==true||manifest.timingEligible!==false)throw Error('Diagnostic manifest required');
for(const [file,hash] of Object.entries(manifest.diagnosticFiles)){
 const actual=createHash('sha256').update(readFileSync(join(root,file))).digest('hex');
 if(actual!==hash)throw Error(`Diagnostic file changed: ${file}`);
}
const api=await import(pathToFileURL(join(root,'index.mjs')));
const cpuStart=process.cpuUsage(),start=performance.now();
const app=await api.prepareLazySmpConnect4Rba32({workers:6,memoryProfile:'12',cacheIdentity:'partial24',timeoutMs:600000,initializationTimeoutMs:120000});
let result;
try{result=await app.solve(Array.from(history,c=>Number(c)-1));}finally{await app.close();}
const counts=result.diagnosticRecursiveEntries,complete=counts?.length===6&&counts.every(Number.isSafeInteger)&&result.cleanup&&result.workersExited===6;
const sum=complete?counts.reduce((a,b)=>a+b,0):null;
const cpu=process.cpuUsage(cpuStart),cpuMs=(cpu.user+cpu.system)/1000;
console.log(JSON.stringify({schema:1,diagnosticOnly:true,sourceCommit:manifest.sourceCommit,timingEligible:false,
 definition:manifest.definition,perturbation:manifest.perturbation,history,workerPlan:app.workerPlan,
 configuration:{workers:6,sharedCacheCapacity:app.memoryPlan.sharedCacheCapacity,localCacheCapacity:app.memoryPlan.localCacheCapacity,cacheIdentity:app.memoryPlan.cacheIdentity},
 diagnosticCountsComplete:complete,recursiveEntriesByWorker:counts,totalRecursiveEntries:Number.isSafeInteger(sum)?sum:null,
 operationWallMs:performance.now()-start,processCpuMs:cpuMs,peakRssBytes:process.resourceUsage().maxRSS*1024,
 // Work rates describe this instrumented run only; they cannot normalize production wall time.
 instrumentedEntriesPerCpuSecond:complete&&cpuMs>0?sum/(cpuMs/1000):null,
 result},null,2));
if(!complete||result.status!=='EXACT')process.exitCode=2;
