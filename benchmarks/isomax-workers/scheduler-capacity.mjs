import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const repo=fileURLToPath(new URL('../../',import.meta.url));
const child=fileURLToPath(new URL('./scheduler-reserve.mjs',import.meta.url));
const output=path.resolve(process.argv[2]??path.join(repo,'issue-102-capacity-aligned.json'));
const git=(...args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8',windowsHide:true}).trim();
const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
const runChild=(workers,reserve)=>{
  const stdout=execFileSync(process.execPath,['--max-old-space-size=4096',child,'child',String(workers),String(reserve)],{
    cwd:repo,encoding:'utf8',windowsHide:true,timeout:120000,maxBuffer:16*1024*1024,
  });
  return stdout.trim().split('\n').filter(Boolean).map(JSON.parse);
};
const summarizeRecords=records=>{
  const sum=(field,nested='metrics')=>records.reduce((s,r)=>s+(nested?r[nested]?.[field]:r[field]??0),0);
  const max=(field,nested='metrics')=>Math.max(...records.map(r=>nested?(r[nested]?.[field]??0):(r[field]??0)));
  const buckets=[0,0,0,0,0,0];
  for(const r of records)for(let i=0;i<6;i++)buckets[i]+=r.metrics?.taskExecutionMsBuckets?.[i]??0;
  return {
    wallMs:records.reduce((s,r)=>s+r.wallMs,0),
    resultReadyMs:records.reduce((s,r)=>s+(r.resultReadyMs??r.wallMs),0),
    nodes:records.reduce((s,r)=>s+r.nodes,0),
    maxRssBytes:Math.max(...records.map(r=>r.maxRssBytes)),
    submitted:sum('submitted'),
    retiredTasks:sum('retiredTasks'),
    zeroNodeRetiredTasks:sum('zeroNodeRetiredTasks'),
    busyRetiredTasks:sum('busyRetiredTasks'),
    requiredCalls:sum('requiredCalls'),
    requiredMs:sum('requiredMs'),
    transitionCacheHits:sum('transitionCacheHits'),
    transitionCacheStores:sum('transitionCacheStores'),
    warmEntryStarts:sum('warmEntryStarts'),
    warmClassStarts:sum('warmClassStarts'),
    localEntryGrowth:sum('localEntryGrowth'),
    localClassGrowth:sum('localClassGrowth'),
    workerResets:sum('workerResets'),
    idleWithReadyEvents:sum('idleWithReadyEvents'),
    redispatchIdleMsTotal:records.reduce((s,r)=>s+(r.executor?.redispatchIdleMsTotal??0),0),
    queueWaitMsTotal:records.reduce((s,r)=>s+(r.executor?.queueWaitMsTotal??0),0),
    maxQueued:Math.max(...records.map(r=>r.executor?.maxQueued??0)),
    maxPending:max('maxPending'),
    taskExecutionMsBuckets:buckets,
  };
};

if(git('status','--porcelain'))throw new Error('commit source before measuring');
const report={
  issue:102,
  kind:'capacity-aligned reserve confirmation',
  sourceRevision:git('rev-parse','HEAD'),
  node:process.version,
  cpu:os.cpus()[0]?.model??null,
  availableParallelism:os.availableParallelism(),
  roots:['717657616532237625','466537327657277224','616767454664457417'],
  policy:{workers:3,controlReserve:0,candidateReserve:3,taskNodes:65536,samples:7,freshProcessPerConfig:true,alternatingOrder:true},
  runs:[],
};
const oracleRecords=runChild(0,0);
const oracle=oracleRecords.map(r=>[r.sequence,r.value,r.move]);
report.serialOracle=summarizeRecords(oracleRecords);
for(let sample=0;sample<7;sample++){
  const order=sample%2===0?[[0,'control'],[3,'candidate']]:[[3,'candidate'],[0,'control']];
  for(const [reserve,label] of order){
    console.log(JSON.stringify({phase:'start',sample,label,reserve}));
    const records=runChild(3,reserve);
    records.forEach((r,i)=>assert.deepEqual([r.sequence,r.value,r.move],oracle[i]));
    const summary=summarizeRecords(records);
    report.runs.push({sample,label,workers:3,reserve,records,...summary});
    fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flush:true});
    console.log(JSON.stringify({phase:'finish',sample,label,reserve,wallMs:summary.wallMs,nodes:summary.nodes,
      zeroNodeRetiredTasks:summary.zeroNodeRetiredTasks,requiredMs:summary.requiredMs}));
  }
}
report.sameExactDecisions=true;
report.summary=['control','candidate'].map(label=>{
  const xs=report.runs.filter(r=>r.label===label);
  return {
    label,workers:3,reserve:xs[0].reserve,
    wallMs:xs.map(x=>x.wallMs),medianWallMs:median(xs.map(x=>x.wallMs)),
    resultReadyMs:xs.map(x=>x.resultReadyMs),medianResultReadyMs:median(xs.map(x=>x.resultReadyMs)),
    nodes:xs.map(x=>x.nodes),medianNodes:median(xs.map(x=>x.nodes)),
    maxRssBytes:Math.max(...xs.map(x=>x.maxRssBytes)),
    zeroNodeRetiredTasks:xs.map(x=>x.zeroNodeRetiredTasks),
    requiredMs:xs.map(x=>x.requiredMs),
    workerResets:xs.map(x=>x.workerResets),
    taskExecutionMsBuckets:xs.map(x=>x.taskExecutionMsBuckets),
  };
});
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flush:true});
console.log('ISOMAX_CAPACITY_SUMMARY '+JSON.stringify(report.summary));
