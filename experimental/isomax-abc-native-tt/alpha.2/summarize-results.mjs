import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const base=import.meta.dirname;
const status={};
for(const variant of ['A','B','C']){
 const path=join(base,`${variant}-2048MiB-node22.jsonl`);
 let content;
 try{content=readFileSync(path,'utf8').trim();}catch{content='';}
 let row=null;
 try{if(content)row=JSON.parse(content.split('\n').at(-1));}catch{}
 status[variant]=row?{
   status:row.status,rootWdl:row.rootWdl??null,move:row.move??null,
   elapsedMs:row.elapsedMs,nodes:row.nodes,
   ttBytes:row.ttBytes,ttEntries:row.ttEntries,
   ttProbes:row.ttProbes,ttHits:row.ttHits,ttStores:row.ttStores,
   exact:row.status==='EXACT'
 }:{status:'NOT_COMPLETED_OR_NOT_RUN',rootWdl:null,move:null};
}
const completed=Object.values(status).every(v=>v.exact);
const consistent=completed&&new Set(Object.values(status).map(v=>v.rootWdl)).size===1;
const legal=completed&&Object.values(status).every(v=>Number.isInteger(v.move)&&v.move>=0&&v.move<7);
const valid=completed&&consistent&&legal;
const sorted=valid?Object.entries(status).map(([variant,s])=>({variant,elapsedMs:s.elapsedMs})).sort((a,b)=>a.elapsedMs-b.elapsedMs):null;
const summary={geometry:{width:7,height:6,rank:0,firstWinStopped:true},sourceVersion:'0.3.0-alpha.2',
  implementation:'pure JavaScript Node/V8',nodeVersion:'22.16.0',v8:'12.4.254.21-node.26',
  environment:{cpu:'AMD EPYC 9V74',memoryCgroupGiB:4,effectiveCpuQuota:4,workerCount:1},
  sameNominalTTBudgetMiB:2048,completeRootExactAndValidWitnessComparison:valid,
  status,sortedByElapsedIfAllExact:sorted,
  conclusion:valid?'one completed sample per candidate, unqualified on target Node26+ and repeat variance':'NO THREE-WAY SPEED RANKING: incomplete, absent or discrepant full empty 7x6 solve'};
writeFileSync(join(base,'evidence','full-summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({completeRootExactAndValidWitnessComparison:valid,status: Object.fromEntries(Object.entries(status).map(([k,v])=>[k,v.status]))}));
