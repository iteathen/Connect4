// Cold measurement only; preload ../20260926-worker-scaling/node-counter-hook.mjs.
// Derived from the prior eight-worker driver, changing only worker count and sample selection.
import {appendFileSync,writeFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {cpus} from 'node:os';
import {performance} from 'node:perf_hooks';
import {solve7x6} from '../../../components/isometric/solve.mjs';
import {processCycleCounter} from '../../../tools/cycle-counter.mjs';

const config={workers:4,timeoutMs:120000,sharedCacheCapacity:65536,localCacheCapacity:65536,sharedSampleMask:7,cpcFrontierResponse:false,cpcProjectedAdvisory:false};
const sample=process.argv[2]??'full';
if(!['full','2','3'].includes(sample))throw Error('Invalid sample');
const inputs=sample==='full'?['45461667','35333571','13333111','']:['45461667'],expected=sample==='full'?[1,-1,0,1]:[1];
const output=new URL(`./workers-4-${sample}.json`,import.meta.url),journal=new URL(`./workers-4-${sample}.jsonl`,import.meta.url);
if(existsSync(output)||existsSync(journal))throw Error('Evidence already exists; refusing an accidental rerun/overwrite');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const report={sample,solverSourceSha:'2ed88683ba46fc4d99790414ad99a2e409acf400',comparison:'Same immutable node-counter-hook as prior eight-worker run. Full four-input run plus two fresh-process repeats of first solved input. All production source unchanged.',started:new Date().toISOString(),sha:git('rev-parse','HEAD'),jsminsys:git('-C','vendor/jsminsys','rev-parse','HEAD'),
  sourceDirty:!!git('status','--porcelain','--','components','tools','vendor','test','package.json'),
  node:process.version,v8:process.versions.v8,cpu:cpus()[0].model,logicalCpus:cpus().length,config,
  instrumentation:'node-counter-hook.mjs redirects existing node increments into one shared Float64 slot per worker on separate 64-byte cache lines. No added per-node counter increment, atomics or logging. Exact final counters read after all workers join. This changes counter storage and may affect timing; not an uninstrumented NEES qualification.',
  accounting:'totalNodesVisited sums node visits over all workers, including duplicates and forced-transit states counted by JSMinSys. Matches JSMinSys nodes semantics, not unique positions, root/cofactor count or Fhourstones engine nodes. cyclesPerNode = all-process QueryProcessCycleTime / totalNodesVisited. nodesPerSecond = totalNodesVisited / whole-operation wall seconds. Winner-only nodes reported separately.',
  protocol:sample==='full'?'Four official Fhourstones inputs in order, one attempt each, no warmup/retry, fresh solver session/caches per input, existing 120s case timeout. Node hooks preload in all workers; startup/termination included. Sampled process RSS is not exact peak allocation.':'Planned independent repeat of solved input 45461667 in a fresh Node process, no warmup, same four-worker settings and 120s cap. This is a repeatability sample, not a retry of a failure.',
  cases:[]};
const save=()=>writeFileSync(output,JSON.stringify(report,null,2)+'\n');
function record(event){const row={at:new Date().toISOString(),workers:4,...event};appendFileSync(journal,JSON.stringify(row)+'\n');console.log(JSON.stringify(row));}
save();record({event:'start',sha:report.sha,jsminsys:report.jsminsys,config});
const meter=await processCycleCounter();
try{
  for(let i=0;i<inputs.length;i++){
    const moves=Array.from(inputs[i],c=>c.charCodeAt(0)-49);
    record({event:'case-start',index:i,input:inputs[i],expectedWdl:expected[i]});
    const before=meter.read(),cpuBefore=process.cpuUsage(),start=performance.now();
    let peak=process.memoryUsage().rss;
    const pulse=setInterval(()=>{const rss=process.memoryUsage().rss;peak=Math.max(peak,rss);record({event:'progress',index:i,wallMs:performance.now()-start,cpuCycles:(meter.read()-before).toString(),rssBytes:rss});},15000);
    let result;
    try{result=await solve7x6(moves,config);}
    catch(error){result={status:'FAILED',rootWdl:null,error:error.stack,cleanup:null};}
    finally{clearInterval(pulse);}
    const cycles=meter.read()-before,wallMs=performance.now()-start,cpu=process.cpuUsage(cpuBefore);
    peak=Math.max(peak,process.memoryUsage().rss);
    const counts=result.benchmarkNodeCounts;
    const countsValid=result.cleanup===true&&counts?.length===4&&counts.every(x=>Number.isSafeInteger(x)&&x>=0);
    const totalNodesVisited=countsValid?counts.reduce((a,b)=>a+b,0):null;
    const winnerCountMatches=result.status==='EXACT'?countsValid&&counts[result.winner]===result.winnerMetrics.nodes:null;
    const entry={index:i,input:inputs[i],expectedWdl:expected[i],...result,wallMs,cpuMs:(cpu.user+cpu.system)/1000,
      cpuCycles:cycles.toString(),totalNodesVisited,nodesPerSecond:totalNodesVisited>0?totalNodesVisited*1000/wallMs:null,
      cyclesPerNode:totalNodesVisited>0?Number(cycles)/totalNodesVisited:null,countsValid,winnerCountMatches,
      peakObservedRssBytes:peak,oracleMatched:result.status==='EXACT'?result.rootWdl===expected[i]:null};
    report.cases.push(entry);save();record({event:'case-result',...entry});
    if(!countsValid||entry.oracleMatched===false||winnerCountMatches===false||result.status==='FAILED'){process.exitCode=2;break;}
  }
  report.finished=new Date().toISOString();report.allCasesAttempted=report.cases.length===inputs.length;
  report.outcome=report.cases.length===inputs.length&&report.cases.every(x=>x.oracleMatched===true)?'PASS':'INCOMPLETE_OR_FAILED';
  save();record({event:'finish',outcome:report.outcome,cases:report.cases.length});
}finally{meter.close();}
