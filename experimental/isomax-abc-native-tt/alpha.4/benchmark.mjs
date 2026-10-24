#!/usr/bin/env node
// Pure Node/V8 runner; isolated fresh child process for every candidate/fixture.
// No native test binaries, opening books, persisted TT content, or oracle lookups.
import {spawnSync} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import {writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,join} from 'node:path';
const base=dirname(fileURLToPath(import.meta.url));
const suites={
 quick:[
  {id:'empty-5x5',w:5,h:5,history:''},
  {id:'empty-6x5',w:6,h:5,history:''},
  {id:'q13-7x6',w:7,h:6,history:'4214254422333'},
  {id:'q17-7x6',w:7,h:6,history:'42142544223333111'},
 ],
 hard:[{id:'q8-7x6',w:7,h:6,history:'42142544'}]
};
const args=process.argv.slice(2),arg=(key,fallback)=>{
 const i=args.indexOf('--'+key);return i<0?fallback:args[i+1];
};
const suite=arg('suite','quick'),rounds=Number(arg('rounds',suite==='hard'?2:5)),
 MiB=Number(arg('tt-mib',32)),deadlineMs=Number(arg('deadline-ms',90000)),
 maxNodes=Number(arg('node-limit',200000000));
if(!suites[suite]||!Number.isInteger(rounds)||rounds<1||rounds>30)throw RangeError('invalid suite/rounds');
const shuffle=[['A','B','C'],['C','B','A'],['B','A','C'],['C','A','B'],['A','C','B'],['B','C','A']];
const rows=[];
for(const f of suites[suite]){
 for(let round=0;round<rounds;round++){
  for(const variant of shuffle[round%shuffle.length]){
   const argv=['run.mjs','--variant',variant,'--columns',String(f.w),'--rows',String(f.h),
    '--history',f.history,'--tt-mib',String(MiB),'--deadline-ms',String(deadlineMs),
    '--node-limit',String(maxNodes)];
   const started=performance.now();
   const child=spawnSync(process.execPath,argv,{cwd:base,encoding:'utf8',timeout:deadlineMs+12000,maxBuffer:1024*1024});
   const fullMs=performance.now()-started;
   let data=null;
   try{data=JSON.parse(child.stdout.trim().split('\n').at(-1));}catch{}
   const row={fixture:f.id,width:f.w,height:f.h,history:f.history,round,variant,ttBudgetMiB:MiB,
    nodeVersion:process.version,fullMs,success:child.status===0&&data?.status==='EXACT',
    ...(data||{}),error:data?.error||child.error?.message||(!data?child.stderr.trim().slice(0,600):null)};
   rows.push(row);
   process.stdout.write(`${f.id} r${round+1} ${variant}: ${row.success?`${row.elapsedMs.toFixed(1)}ms ${row.nodes} nodes WDL=${row.rootWdl} move=${row.move}`:'INCOMPLETE '+row.error}\n`);
  }
 }
}
const by=(fn,values)=>values.reduce(fn,0);
const med=items=>{
 const v=items.slice().sort((a,b)=>a-b);
 return v.length%2?v[(v.length-1)/2]:(v[v.length/2-1]+v[v.length/2])/2;
};
const summary=[];
for(const fixture of suites[suite])for(const variant of ['A','B','C']){
 const r=rows.filter(x=>x.fixture===fixture.id&&x.variant===variant),ok=r.filter(x=>x.success);
 summary.push({fixture:fixture.id,variant,attempts:r.length,completed:ok.length,
  ttBudgetMiB:MiB,ttRecordBytes:ok[0]?.ttRecordBytes??null,ttActualMiB:ok[0]?.ttBytes/1048576??null,
  ttEntries:ok[0]?.ttEntries??null,medianSolveMs:ok.length?med(ok.map(x=>x.elapsedMs)):null,
  medianFullMs:ok.length?med(ok.map(x=>x.fullMs)):null,
  medianCpuMs:ok.length?med(ok.map(x=>x.cpuMs)):null,
  medianNodes:ok.length?med(ok.map(x=>x.nodes)):null,
  allExactWdlAgree:ok.length===r.length&&new Set(rows.filter(x=>x.fixture===fixture.id&&x.success).map(x=>x.rootWdl)).size===1,
  errorCount:r.length-ok.length});
}
const cols=['fixture','variant','round','success','elapsedMs','fullMs','cpuMs','nodes','ttRecordBytes','ttBytes','ttEntries','ttHits','ttStores','rootWdl','move','forkTests','forkProofs','cachedProofSkips','error'];
const csv=(values,fields)=>[fields.join(','),...values.map(x=>fields.map(k=>{
  const v=x[k]??'',s=String(v);return /[",\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;
 }).join(','))].join('\n')+'\n';
const outDir=join(base,'evidence');mkdirSync(outDir,{recursive:true});
writeFileSync(join(outDir,`bench-${suite}-node${process.versions.node.replaceAll('.','_')}.json`),JSON.stringify({config:{suite,rounds,MiB,deadlineMs,maxNodes,nodeVersion:process.version,nodeV8:process.versions.v8,system:process.platform+'-'+process.arch},rows,summary},null,2));
writeFileSync(join(outDir,`bench-${suite}.csv`),csv(rows,cols));
writeFileSync(join(outDir,`bench-${suite}-summary.csv`),csv(summary,Object.keys(summary[0])));
console.log('SUMMARY',JSON.stringify(summary));
if(summary.some(x=>!x.allExactWdlAgree))process.exitCode=2;
