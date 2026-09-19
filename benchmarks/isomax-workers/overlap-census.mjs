import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import workerThreads from 'node:worker_threads';
import { syncBuiltinESMExports } from 'node:module';
import { execFileSync } from 'node:child_process';
const output=path.resolve(process.argv[2]);fs.mkdirSync(output,{recursive:true});
const NativeWorker=workerThreads.Worker;
let snapshots=[];
workerThreads.Worker=class extends NativeWorker{
  constructor(url,options){
    assert.ok(String(url).endsWith('/components/isometric/execution/worker.mjs'));
    super(new URL('./overlap-bootstrap.mjs',import.meta.url),{...options,workerData:{...options.workerData,originalWorkerUrl:String(url)}});
    this.on('message',m=>{if(m.overlap)snapshots.push({worker:m.workerId,...m.overlap});});
  }
};
syncBuiltinESMExports();
const { IsoMaxBranchManager }=await import('../../components/isometric/execution/branch-manager.mjs');
const report={source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),node:process.version,
  profile:'standard 7x6; WSL-625 words in profile order; reflection-canonical gameplay q only',
  policy:'cold snapshots after task 1 and each eighth task; content-hash 1/128 selection; exact full content equality; instrumented scheduling, not performance evidence',records:[]};
for(const sequence of ['717657616532237625','466537327657277224','616767454664457417']){
  snapshots=[];
  const manager=new IsoMaxBranchManager({workers:4});let result,error;
  try{result=await manager.solveMoves(Array.from(sequence,c=>Number(c)-1),{timeoutMs:30000});}
  catch(e){error=e;}
  finally{await manager.close();}
  fs.writeFileSync(path.join(output,sequence+'.json'),JSON.stringify(snapshots));
  const keys=new Map();let observations=0;
  for(const snapshot of snapshots)for(const entry of snapshot.entries){
    observations++;
    let prior=keys.get(entry.key);
    if(!prior){prior={value:entry.value,workers:new Set(),times:[]};keys.set(entry.key,prior);}
    assert.equal(prior.value,entry.value,'portable content WDL contradiction');
    prior.workers.add(snapshot.worker);prior.times.push(entry.observedAt);
  }
  const duplicates=[...keys.values()].filter(v=>v.workers.size>1);
  const lags=duplicates.map(v=>Math.max(...v.times)-Math.min(...v.times)).sort((a,b)=>a-b);
  report.records.push({sequence,result:result?{value:result.value,move:result.move}:null,error:error?.message??null,
    metrics:(result??manager.lastStats)?.metrics,cleanup:manager.workers.length===0,
    snapshots:snapshots.length,scanned:snapshots.reduce((s,r)=>s+r.scanned,0),
    censusMs:snapshots.reduce((s,r)=>s+r.censusMs,0),observations,uniqueSampledKeys:keys.size,
    crossWorkerKeys:duplicates.length,duplicateObservations:observations-keys.size,
    observationLagMedianMs:lags.length?lags[Math.floor(lags.length/2)]:null,
    limits:'late snapshot times, not completion times; 1/128 sample is not uniform proof; pool resets and end tails may be missed; no saved-node estimate'});
  fs.writeFileSync(path.join(output,'summary.json'),JSON.stringify(report,null,2)+'\n',{flush:true});
  console.log(JSON.stringify(report.records.at(-1)));
  if(error)throw error;
}
