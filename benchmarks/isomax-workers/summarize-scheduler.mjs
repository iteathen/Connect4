// Cold evidence reduction. Raw stdout/stderr remain in the local capture tree.
import fs from 'node:fs';
import { createHash } from 'node:crypto';
const raw = fs.readFileSync(process.argv[2]);
const input = JSON.parse(raw);
const median = a => { a = a.toSorted((x,y)=>x-y); return (a[(a.length-1)>>1]+a[a.length>>1])/2; };
const sum = (a,k) => a.reduce((s,r)=>s+(r[k]??0),0);
const metricKeys = ['nodes','expandedEntries','transitionAttempts','nativeExactHits',
  'transitionCacheHits','recursiveChildren','forcedTransitions','managerExpansions',
  'submitted','splitTasks','retiredTaskNodes','qReuses','requiredMs','workerExecutionMs','workerResets'];
const report = {...input, rawSha256:createHash('sha256').update(raw).digest('hex'), runs:input.runs.map(run=>({
  sample:run.sample,variant:run.variant,exitCode:run.exitCode,timedOut:run.timedOut,
  records:run.records.map(r=>({sequence:r.sequence,value:r.value,move:r.move,
    sourceHash:r.sourceHash,candidateHash:r.candidateHash,wallMs:r.wallMs,
    resultReadyMs:r.resultReadyMs,maxRssBytes:r.maxRssBytes,cleanup:r.cleanup,
    ...Object.fromEntries(metricKeys.map(k=>[k,r.metrics[k]??null])),
    ...(r.observation?{survey:{tasks:r.observation.tasks.length,ready:r.observation.ready.length,
      maxParents:Math.max(0,...r.observation.ready.map(t=>t.maxParents)),
      maxFiber:Math.max(0,...r.observation.ready.map(t=>t.maxFiber)),
      fiberPairSamples:sum(r.observation.ready,'fiberPairs'),
      forcedTasks:r.observation.tasks.filter(t=>t.forcedChain>0).length,
      maxForcedChain:Math.max(0,...r.observation.tasks.map(t=>t.forcedChain)),
      rankGroups:[0,26,32].map((rank,i)=>{const tasks=r.observation.tasks.filter(t=>t.rank>=rank&&t.rank<([26,32,43][i]));
        return {rankFrom:rank,rankThrough:[25,31,42][i],tasks:tasks.length,nodes:sum(tasks,'nodes'),executionMs:sum(tasks,'executionMs')};})
    }}:{})}))
}))};
report.comparison = input.variants.map(variant=>{
  const runs=report.runs.filter(r=>r.variant===variant);
  const totals=runs.map(r=>({sample:r.sample,wallMs:sum(r.records,'wallMs'),
    ...Object.fromEntries(metricKeys.map(k=>[k,r.records.some(x=>x[k]===null)?null:sum(r.records,k)])),
    maxRssBytes:Math.max(0,...r.records.map(x=>x.maxRssBytes))}));
  return {variant,totals,medians:Object.fromEntries(['wallMs',...metricKeys].map(k=>[k,
    totals.some(t=>t[k]===null)?null:median(totals.map(t=>t[k]))])),
    maxRssBytes:Math.max(...totals.map(t=>t.maxRssBytes))};
});
fs.writeFileSync(process.argv[3],JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.comparison));
