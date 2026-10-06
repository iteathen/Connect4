// Post-run analysis only. Never imported by or passed to the timed solver.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const dir=fileURLToPath(new URL('.',import.meta.url)),read=p=>JSON.parse(readFileSync(p,'utf8')),
 groups=[
  {name:'native32',sharedGiB:4,privateMiB:256,totalTtGiB:5.5,paths:['../20261006-large-shared-tt/partial-key-native32-control-01','native32-02','native32-03']},
  {name:'partial24-same-entries',sharedGiB:3,privateMiB:192,totalTtGiB:4.125,paths:['partial24-01','partial24-02','partial24-03']},
  {name:'partial24-shared-double',sharedGiB:6,privateMiB:192,totalTtGiB:7.125,paths:['partial24-shared-double-01','partial24-shared-double-02','partial24-shared-double-03']},
  {name:'partial24-private-double',sharedGiB:3,privateMiB:384,totalTtGiB:5.25,paths:['partial24-private-double-01','partial24-private-double-02','partial24-private-double-03']},
  {name:'partialMixed',sharedGiB:3.5,privateMiB:224,totalTtGiB:4.8125,paths:['mixed-01','mixed-02','mixed-03']}
 ];
function stats(values){const ordered=values.toSorted((a,b)=>a-b),mean=values.reduce((a,b)=>a+b,0)/values.length;
 return {n:values.length,values,mean,min:ordered[0],median:ordered[Math.floor(values.length/2)],max:ordered.at(-1),
  sampleSd:Math.sqrt(values.reduce((a,b)=>a+(b-mean)**2,0)/(values.length-1))};}
const results=[];
for(const group of groups){
 const runs=group.paths.map(p=>{
  const path=resolve(dir,p),raw=read(resolve(path,'stdout.json')),measurement=read(resolve(path,'measurement.json')),
   invocation=read(resolve(path,'invocation.json')),cleanup=read(resolve(path,'cleanup-verification.json')),r=raw.result;
  assert.equal(r.status,'EXACT',p);assert.equal(r.rootWdl,1,p);assert.equal(r.move,3,p);
  assert.equal(r.readyWorkers,6,p);assert.equal(r.workersUsed,6,p);assert.equal(r.workersExited,6,p);
  assert.equal(r.cleanup,true,p);assert.equal(cleanup.clean,true,p);assert.equal(measurement.exit_status,0,p);
  assert.equal(raw.startingPosition,'empty',p);assert.equal(raw.geometry,'7x6',p);
  assert.equal(r.workerAffinity.length,6,p);assert.ok(r.workerAffinity.every(a=>a.verified),p);
  assert.deepEqual(r.workerAffinity.map(a=>a.cpu).toSorted((a,b)=>a-b),[0,2,4,6,8,10],p);
  const identity=raw.identity??(raw.experiment==='baseline'?'native32':null);
  assert.ok(identity,p);
  const mixed=identity==='partialMixed',width=mixed?28:r.sharedTtEntryBytes,
   sharedBytes=raw.configuration.sharedCacheCapacity*width,privateBytes=raw.configuration.localCacheCapacity*width;
  assert.equal(sharedBytes/2**30,group.sharedGiB,p);assert.equal(privateBytes/2**20,group.privateMiB,p);
  assert.equal((sharedBytes+6*privateBytes)/2**30,group.totalTtGiB,p);
  return {path:p,identity,sourceCommit:invocation.sourceCommit,consumerCommit:invocation.repositoryCommit,
   runtime:raw.runtime,solveMs:r.preparedTiming.solveMs,initializationMs:r.preparedTiming.initializationMs,
   cleanupMs:r.preparedTiming.cleanupMs,wholeProcessCpuMs:measurement.cpu_ms,peakRssBytes:measurement.peak_rss_bytes,
   externalWallMs:measurement.wall_ms,sharedBytes,privateBytesPerWorker:privateBytes,
   sharedEntries:raw.configuration.sharedCacheCapacity*(mixed?1.5:1),privateEntriesPerWorker:raw.configuration.localCacheCapacity*(mixed?1.5:1),
   workerRoles:raw.configuration,executableHash:invocation.executable_hash,launchFlags:invocation.arguments.slice(0,5)};
 });
 const reference=results[0]?.runs[0]??runs[0];
 for(const run of runs){assert.deepEqual(run.runtime,reference.runtime);assert.equal(run.executableHash,reference.executableHash);assert.deepEqual(run.launchFlags,reference.launchFlags);
  for(const key of ['rootFrontier','sharedSampleMask','sharedProofBounds','supportBasisPlanBudgetBytes','supportClosurePlan','supportReflectionPlan','supportBasisViews'])
   assert.equal(run.workerRoles[key],reference.workerRoles[key],key);}
 results.push({...group,runs,solveMs:stats(runs.map(r=>r.solveMs)),wholeProcessCpuMs:stats(runs.map(r=>r.wholeProcessCpuMs)),
  peakRssBytes:stats(runs.map(r=>r.peakRssBytes))});
}
for(const group of results)group.meanSolveChangePercent=100*(group.solveMs.mean/results[0].solveMs.mean-1);
const rejected=read(resolve(dir,'partial16-double-01/summary.json')),
 rejectedCleanup=read(resolve(dir,'partial16-double-01/cleanup-verification.json')),
 censored=read(resolve(dir,'partial24-double-01/resource-status.json'));
assert.equal(rejected.status,'TIMEOUT');assert.equal(rejected.validated,false);assert.equal(rejectedCleanup.clean,true);
assert.equal(censored.status,'RESOURCE_CENSORED');assert.equal(censored.solveStarted,false);
const output={method:'Three fresh cold processes per full-coverage configuration, sequential crossover. Descriptive sample statistics; no inferential significance claim.',
 boundary:'all-ready/page-warmed TT -> actual empty 7x6 root -> exact result; initialization/cleanup excluded only from primary solveMs',
 workers:6,processCycles:'unavailable',cpuBoundary:'whole process including initialization and cleanup',
 searchCounters:'not collected in hot loop',controlTimeoutNote:'First native control used600s; subsequent runs use120s. Every admitted full-coverage run completed below either deadline. Native worker bodies unchanged.',
 rejected:{...rejected,reason:'16-byte-only policy lacks early/midgame cache coverage; timed out despite doubled entries. No incomplete solve promoted.'},resourceCensored:censored,results};
writeFileSync(resolve(dir,'comparison.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(results.map(g=>({name:g.name,totalTtGiB:g.totalTtGiB,solveMs:g.solveMs,changePercent:g.meanSolveChangePercent})),null,2));
