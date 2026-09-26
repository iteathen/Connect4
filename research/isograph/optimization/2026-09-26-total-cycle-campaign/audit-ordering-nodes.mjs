// Diagnostic only: counters alter generated code; do not use this as production qualification.
import {mkdirSync,writeFileSync,appendFileSync,readFileSync} from 'node:fs';
import {execFileSync,spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const [harness,out,baseline,...candidates]=process.argv.slice(2);
const sample=resolve(harness,'tools/isomax-cycle-sample.mjs'),hook=resolve(harness,'tools/isomax-node-counts.mjs');
const {validateCycleSample}=await import(pathToFileURL(resolve(harness,'tools/isomax-cycle-analysis.mjs')));
const git=(p,...a)=>execFileSync('git',['-C',p,...a],{encoding:'utf8'}).trim();
const snap=p=>({path:p,sha:git(p,'rev-parse','HEAD'),dirty:!!git(p,'status','--porcelain')});
const sources=[baseline,...candidates].map(snap);if(sources.some(s=>s.dirty))throw Error('dirty input');
mkdirSync(out);writeFileSync(resolve(out,'manifest.json'),JSON.stringify({sources,harness:snap(harness),blocks:2,sequence:'ABBA',instrumentation:'all-worker counters, existing increments redirected to private padded slots, final read after join',hashes:Object.fromEntries([sample,hook].map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')])),started:new Date().toISOString()},null,2)+'\n');
const rows=[];
for(let comparison=1;comparison<sources.length;comparison++)for(let block=0;block<2;block++)for(const arm of ['A','B','B','A']){
 const expected=sources[arm==='A'?0:comparison],current=snap(expected.path);
 if(current.sha!==expected.sha||current.dirty)throw Error('source changed');
 const args=['--experimental-ffi','--import',pathToFileURL(hook).href,sample,expected.path,'45461667'];
 const r=spawnSync(process.execPath,args,{encoding:'utf8',timeout:45000,maxBuffer:4*1024*1024});
 appendFileSync(resolve(out,'processes.jsonl'),JSON.stringify({comparison,block,arm,args,exit:r.status,error:r.error?.message,stdout:r.stdout,stderr:r.stderr})+'\n');
 if(r.status!==0)throw Error('child failed, no retry');
 const s={...JSON.parse(r.stdout.trim()),comparison,block,arm};validateCycleSample(s,expected.sha,'all-worker-node-instrumentation');rows.push(s);appendFileSync(resolve(out,'samples.jsonl'),JSON.stringify(s)+'\n');
 console.log(JSON.stringify({comparison,block,arm,nodes:s.totalNodes,cyclesPerVisit:s.cyclesPerVisit,counts:s.benchmarkNodeCounts}));
}
const summary=[];
for(let comparison=1;comparison<sources.length;comparison++){
 const means=['A','B'].map(arm=>{const r=rows.filter(s=>s.comparison===comparison&&s.arm===arm);const mean=k=>r.reduce((n,s)=>n+Number(s[k]),0)/r.length;return {arm,nodes:mean('totalNodes'),cycles:mean('totalProcessCycles'),cyclesPerVisit:mean('cyclesPerVisit'),wallMs:mean('wallMs')};});
 summary.push({candidate:sources[comparison],means,deltas:Object.fromEntries(['nodes','cycles','cyclesPerVisit','wallMs'].map(k=>[k,100*(means[1][k]/means[0][k]-1)]))});
}
writeFileSync(resolve(out,'summary.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary));
