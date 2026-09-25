import {appendFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {cpus} from 'node:os';
import {performance} from 'node:perf_hooks';
import {processCycleCounter} from './cycle-counter.mjs';
import {
  prepareConnect4RbaGeometry,
  runLazySmpConnect4Rba32,
} from '../vendor/jsminsys/addons/index.mjs';

const inputs=['45461667','35333571','13333111',''];
const expected=[1,-1,0,1];
const referenceNodes=[51596,8716732,169704432,1479113766];
const output=process.argv[2]??'docs/qualification/fhourstones-isomax-lazy-smp-4w.json';
const journal=output+'.jsonl';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const geometry=prepareConnect4RbaGeometry({columns:7,rows:6});
const report={
  started:new Date().toISOString(),sha:git('rev-parse','HEAD'),
  sourceDirty:!!git('status','--porcelain','--','components','tools','vendor','test','package.json','package-lock.json'),
  jsminsys:git('-C','vendor/jsminsys','rev-parse','HEAD'),
  cpu:cpus()[0].model,platform:process.platform,arch:process.arch,
  node:process.version,v8:process.versions.v8,
  source:'https://tromp.github.io/c4/fhour.html',
  inputSource:'https://github.com/tromp/fhourstones/blob/7ddf48dc70931eaa9c07904e12424960c3a019a1/inputs',
  inputGitBlob:'a8036a915ad1a3568762c269844cfd2ded7df3d3',
  inputs,expected,referenceNodes,
  config:{workers:4,sharedCacheCapacity:65536,localCacheCapacity:65536,timeoutMs:120000,
    cpcFrontierResponse:false,cpcProjectedAdvisory:false},
  protocol:'Official four inputs in order, Lazy SMP with exactly four search workers, one attempt each, 120-second per-case ceiling, fresh solver session per input, no warmup or retry.',
  interpretation:'Only EXACT with matching WDL qualifies. Each Lazy-SMP worker owns a private CPC/Negamax stack and private local exact cache; workers share committed exact W/D/L cache entries only. No Branch Manager or surplus queue participates. Whole-operation wall/CPU/cycles include worker startup, shared-cache setup, cleanup and host measurement. CPU cycles sum all process threads.',
  cases:[],completed:false,
};
writeFileSync(output,JSON.stringify(report,null,2)+'\n');
writeFileSync(journal,JSON.stringify({event:'start',...report})+'\n');
function record(event){appendFileSync(journal,JSON.stringify(event)+'\n');console.log(JSON.stringify(event));}
const meter=await processCycleCounter();
try{
  for(let i=0;i<inputs.length;i++){
    const moves=Array.from(inputs[i],c=>c.charCodeAt(0)-49);
    record({event:'case-start',index:i,input:inputs[i],expectedWdl:expected[i]});
    const before=meter.read(),cpuBefore=process.cpuUsage(),start=performance.now();
    const pulse=setInterval(()=>record({event:'progress',index:i,elapsedMs:performance.now()-start,
      cpuCycles:(meter.read()-before).toString(),rssBytes:process.memoryUsage().rss}),30000);
    let result;
    try{result=await runLazySmpConnect4Rba32(moves,{geometry,...report.config});}
    catch(error){result={status:'FAILED',rootWdl:null,error:error.stack??String(error),cleanup:null};}
    finally{clearInterval(pulse);}
    const cpuCycles=meter.read()-before,wallMs=performance.now()-start,cpu=process.cpuUsage(cpuBefore);
    const cpuMs=(cpu.user+cpu.system)/1000;
    const entry={index:i,input:inputs[i],expectedWdl:expected[i],...result,wallMs,cpuMs,
      cpuCycles:cpuCycles.toString(),rssBytes:process.memoryUsage().rss,
      oracleMatched:result.status==='EXACT'?result.rootWdl===expected[i]:null};
    report.cases.push(entry);
    writeFileSync(output,JSON.stringify(report,null,2)+'\n');
    record({event:'case-result',...entry});
    if(result.cleanup!==true||entry.oracleMatched===false)break;
  }
  report.finished=new Date().toISOString();
  report.completed=report.cases.length===4&&report.cases.every(c=>c.oracleMatched===true);
  report.outcome=report.completed?'PASS':'INCOMPLETE_OR_FAILED';
  writeFileSync(output,JSON.stringify(report,null,2)+'\n');
  record({event:'finish',outcome:report.outcome,cases:report.cases.length});
  if(!report.completed)process.exitCode=1;
}finally{meter.close();}
