#!/usr/bin/env node
// Full-root-only, Node/V8 A/B/C comparison: this wrapper performs no game search
// and does not alter any of the three candidate implementations.
import {spawnSync} from 'node:child_process';
import {appendFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';

const here=dirname(fileURLToPath(import.meta.url));
const args=new Map();
for(let i=2;i<process.argv.length;i+=2){
  const key=process.argv[i],value=process.argv[i+1];
  if(!key?.startsWith('--')||value===undefined)throw Error('Expected --name value arguments');
  args.set(key.slice(2),value);
}
function intOpt(name,defaultValue,min,max){
  const v=Number(args.get(name)??defaultValue);
  if(!Number.isSafeInteger(v)||v<min||v>max)throw Error(`Invalid ${name}: ${v}`);
  return v;
}
const ttMiB=intOpt('tt-mib',512,1,2048),repeats=intOpt('repeats',2,1,20);
const deadlineMs=intOpt('deadline-ms',600000,0,3600000);
const nodeLimit=intOpt('node-limit',10000000000,1,Number.MAX_SAFE_INTEGER);
const width=intOpt('columns',7,1,10),height=intOpt('rows',6,1,10);
if((width!==7||height!==6)&&args.get('allow-smoke')!=='yes')
  throw Error('Full-root ranking targets empty 7x6; use --allow-smoke yes only for harness test');
const dir=resolve(args.get('suite')??join(here,'suite'));
const out=resolve(args.get('out')??join(here,'evidence','full-empty.jsonl'));
mkdirSync(dirname(out),{recursive:true});
if(args.has('reset-output')&&args.get('reset-output')==='yes')writeFileSync(out,'');
const results=[];
for(let round=0;round<repeats;round++){
  // Alternate order; run in independent cold Node processes, serially.
  const order=round%2===0?['A','B','C']:['C','B','A'];
  for(const variant of order){
    const invocation=[join(dir,'run.mjs'),'--variant',variant,'--columns',String(width),'--rows',String(height),
      '--tt-mib',String(ttMiB),'--node-limit',String(nodeLimit),'--deadline-ms',String(deadlineMs)];
    const wallStart=performance.now();
    const child=spawnSync(process.execPath,invocation,{cwd:dir,encoding:'utf8',
      timeout:deadlineMs?deadlineMs+20000:undefined,maxBuffer:1<<20,killSignal:'SIGTERM'});
    const outerWallMs=performance.now()-wallStart;
    let body;
    try{body=JSON.parse(child.stdout.trim().split(/\r?\n/).at(-1));}
    catch{body={status:'INCOMPLETE',cause:'MISSING_RESULT',message:(child.stderr||'').slice(0,500)}}
    const row={suite:'empty-firstwin-exact',width,height,rank:0,variant,round,
      nodeVersion:process.version,v8:process.versions.v8,platform:process.platform,arch:process.arch,
      ttBudgetMiB:ttMiB,nodeLimit,deadlineMs,outerWallMs,childStatus:child.status,
      childSignal:child.signal??null,...body};
    appendFileSync(out,JSON.stringify(row)+'\n');
    results.push(row);
    console.log(JSON.stringify(row));
  }
}
// A true ranking is admissible only with all candidates finishing each complete
// empty-board solve and each reporting consistent WDL and a legal root move.
const allExact=results.length===3*repeats&&results.every(x=>x.status==='EXACT'&&x.childStatus===0);
const allSameWdl=allExact&&results.every(x=>x.rootWdl===results[0].rootWdl);
const allLegalMoves=allExact&&results.every(x=>Number.isInteger(x.move)&&x.move>=0&&x.move<width);
const valid=allSameWdl&&allLegalMoves;
const byVariant=Object.fromEntries(['A','B','C'].map(variant=>{
  const rows=results.filter(x=>x.variant===variant);
  const sorted=rows.map(x=>x.elapsedMs).sort((a,b)=>a-b);
  return [variant,{completed:rows.every(x=>x.status==='EXACT'),samples:rows.length,
    medianSearchMs:rows.every(x=>x.status==='EXACT')?(sorted.length%2?sorted[sorted.length>>1]:
       (sorted[sorted.length/2-1]+sorted[sorted.length/2])/2):null,
    status:rows.map(x=>x.status)}];
}));
const summary={validFullRootComparison:valid,reason:valid?'all completed exact, matching WDL and legal moves':
  'one or more full solves incomplete, failed or disagreed; NO SPEED RANKING',
  nodeVersion:process.version,v8:process.versions.v8,ttBudgetMiB:ttMiB,rounds:repeats,
  geometry:`${width}x${height}`,byVariant};
writeFileSync(out.replace(/\.jsonl$/,'-summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({summary}));
if(!valid)process.exitCode=2;
