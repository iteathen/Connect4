import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const bench=resolve(dirname(fileURLToPath(import.meta.url)),'coarse_selective_promotion_bench.mjs');
const args=process.argv.slice(2,7);
const r=spawnSync(process.execPath,[bench,...args],{encoding:'utf8',maxBuffer:64*1024*1024});
if(r.error)throw r.error;
if(r.status!==0){
  process.stderr.write(r.stderr||'');
  process.exit(r.status??1);
}
for(const line of r.stdout.split('\n')){
  if(!line)continue;
  const x=JSON.parse(line);
  const runs=x.runs.map(q=>({
    score:q.score,sec:q.sec,nodes:q.nodes,workerNodes:q.workerNodes,shellNodes:q.shellNodes,
    ttHits:q.ttHits,crossHits:q.crossHits,tasks:q.tasks,mapResolves:q.mapResolves,fallbackTasks:q.fallbackTasks,
    promotions:q.promotions,descriptors:q.descriptors,activeEntries:q.activeEntries,slabUtilization:q.slabUtilization
  }));
  console.log(JSON.stringify({
    mode:x.mode,seq:x.seq,workers:x.workers,totalPow:x.totalPow,totalEntries:x.totalEntries,slabEntries:x.slabEntries,
    medianSec:x.medianSec,medianNodes:x.medianNodes,scores:x.scores,runs
  }));
}
