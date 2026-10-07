// One cold process/root. No native/reference/oracle code is available to the API.
import {pathToFileURL} from 'node:url';
import {join,resolve} from 'node:path';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const [packageRoot,history]=process.argv.slice(2);
if(!packageRoot||!/^[1-7]{8,16}$/.test(history??''))throw Error('Package root and8..16ply history required');
const api=await import(pathToFileURL(join(resolve(packageRoot),'index.mjs'))),cpuStart=process.cpuUsage(),start=performance.now();
const geometry=api.prepareConnect4RbaGeometry({columns:7,rows:6});
const app=await api.prepareLazySmpConnect4Rba32({geometry,workers:6,memoryProfile:'12',cacheIdentity:'partial24',timeoutMs:120000,initializationTimeoutMs:120000});
let result;
try{
 if(app.workerPlan.workers!==6||app.memoryPlan.sharedCacheCapacity!==536870912||app.memoryPlan.localCacheCapacity!==8388608||app.memoryPlan.cacheIdentity!=='partial24')throw Error('Full six-worker12GiB profile was not admitted');
 result=await app.solve(Array.from(history,c=>Number(c)-1));
}finally{await app.close();}
const cpu=process.cpuUsage(cpuStart);
console.log(JSON.stringify({schema:1,history,sourceCommit:api.profile.sourceCommit,
 profileSha256:createHash('sha256').update(readFileSync(join(packageRoot,'profile.json'))).digest('hex'),
 workerPlan:app.workerPlan,memoryPlan:app.memoryPlan,result,
 operationWallMs:performance.now()-start,processCpuMs:(cpu.user+cpu.system)/1000,
 peakRssBytes:process.resourceUsage().maxRSS*1024}));
if(result.status!=='EXACT'||!result.cleanup||result.workersExited!==6)process.exitCode=2;
