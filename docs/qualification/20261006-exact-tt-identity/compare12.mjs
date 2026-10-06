// Post-run only: expected answers and results never enter solver runtime.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const read=(id,file)=>JSON.parse(readFileSync(new URL(id+'/'+file,import.meta.url),'utf8'));
const groups=[
 {name:'6GiB-single-bank-postfree',sharedGiB:6,banks:1,bankEntries:2**28,ids:['partial24-shared-6gib-postfree-control-01']},
 {name:'6GiB-two-bank-postfree',sharedGiB:6,banks:2,bankEntries:2**27,ids:[1,2,3].map(n=>'partial24-shared-6gib-banked-control-0'+n)},
 {name:'12GiB-two-bank-postfree',sharedGiB:12,banks:2,bankEntries:2**28,ids:[1,2,3].map(n=>'partial24-shared-12gib-0'+n)}
];
function stats(values){const a=values.toSorted((x,y)=>x-y),mean=values.reduce((x,y)=>x+y,0)/values.length;
 return {n:values.length,values,mean,min:a[0],median:a[Math.floor(a.length/2)],max:a.at(-1),
  sampleSd:values.length>1?Math.sqrt(values.reduce((x,y)=>x+(y-mean)**2,0)/(values.length-1)):null};}
let reference;
const results=groups.map(group=>{
 const runs=group.ids.map(id=>{
  const raw=read(id,'stdout.json'),m=read(id,'measurement.json'),i=read(id,'invocation.json'),c=read(id,'cleanup-verification.json'),r=raw.result;
  assert.equal(r.status,'EXACT',id);assert.equal(r.rootWdl,1,id);assert.equal(r.move,3,id);
  assert.equal(raw.startingPosition,'empty',id);assert.equal(raw.geometry,'7x6',id);
  assert.equal(r.readyWorkers,6,id);assert.equal(r.workersUsed,6,id);assert.equal(r.workersExited,6,id);
  assert.equal(r.cleanup,true,id);assert.equal(c.clean,true,id);assert.equal(m.exit_status,0,id);
  assert.equal(r.sharedTtEntryBytes,24,id);assert.equal(r.privateTtEntryBytes,24,id);
  assert.equal(r.sharedTtBanks,group.banks,id);
  if(group.banks>1)assert.equal(r.sharedTtBankEntries,group.bankEntries,id);
  assert.equal(r.sharedTtPayloadBytes,group.sharedGiB*2**30,id);
  assert.equal(raw.configuration.localCacheCapacity,2**23,id);
  assert.ok(r.workerAffinity.every(a=>a.verified),id);
  assert.deepEqual(r.workerAffinity.map(a=>a.cpu).toSorted((a,b)=>a-b),[0,2,4,6,8,10],id);
  reference??={runtime:raw.runtime,sourceCommit:i.sourceCommit,executableHash:i.executable_hash,flags:i.arguments.slice(0,5),configuration:raw.configuration};
  assert.deepEqual(raw.runtime,reference.runtime,id);assert.equal(i.sourceCommit,reference.sourceCommit,id);
  assert.equal(i.executable_hash,reference.executableHash,id);assert.deepEqual(i.arguments.slice(0,5),reference.flags,id);
  for(const key of ['workerMode','rootFrontier','sharedSampleMask','sharedProofBounds','localCacheLayout','supportBasisPlanBudgetBytes','supportClosurePlan','supportReflectionPlan','supportBasisViews','timeoutMs'])
   assert.equal(raw.configuration[key],reference.configuration[key],key);
  return {id,sourceCommit:i.sourceCommit,consumerCommit:i.repositoryCommit,configuration:raw.configuration,
   solveMs:r.preparedTiming.solveMs,initializationMs:r.preparedTiming.initializationMs,cleanupMs:r.preparedTiming.cleanupMs,
   wholeProcessCpuMs:m.cpu_ms,peakRssBytes:m.peak_rss_bytes,externalWallMs:m.wall_ms};
 });
 return {...group,totalTtGiB:group.sharedGiB+1.125,runs,solveMs:stats(runs.map(r=>r.solveMs)),
  wholeProcessCpuMs:stats(runs.map(r=>r.wholeProcessCpuMs)),peakRssBytes:stats(runs.map(r=>r.peakRssBytes))};
});
const output={sourceCommit:reference.sourceCommit,runtime:reference.runtime,executableHash:reference.executableHash,
 method:'Fresh post-task-cleanup environment, sequential crossover, three6GiB/two-bank and three12GiB/two-bank runs; one fresh6GiB/single-bank reference. Descriptive statistics only.',
 primaryBoundary:'all-ready/page-warmed TT -> actual empty7x6 root -> exact result; initialization/cleanup separately recorded',
 processCycles:'unavailable',cpuBoundary:'whole process including preparation and cleanup',results,
 mean12Vs6BankedChangePercent:100*(results[2].solveMs.mean/results[1].solveMs.mean-1)};
writeFileSync(new URL('comparison12.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({groups:results.map(g=>({name:g.name,totalTtGiB:g.totalTtGiB,solveMs:g.solveMs,peakRssGiB:g.peakRssBytes.max/2**30})),mean12Vs6BankedChangePercent:output.mean12Vs6BankedChangePercent},null,2));
