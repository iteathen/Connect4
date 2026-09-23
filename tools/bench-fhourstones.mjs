import {appendFileSync, writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {cpus} from 'node:os';
import {performance} from 'node:perf_hooks';
import {processCycleCounter} from './cycle-counter.mjs';
import {solve7x6} from '../components/isometric/solve.mjs';

// COLD benchmark driver only. No reporting or character processing in solver
// paths. Official four inputs in order, including the final EMPTY line.
// This runs IsoMax on Fhourstones inputs; it does not run the Fhourstones engine.
const inputs=['45461667','35333571','13333111',''];
const expected=[1,-1,0,1]; // P0 == mover at these even-rank roots.
const referenceNodes=[51596,8716732,169704432,1479113766];
const output=process.argv[2]??'docs/qualification/fhourstones-isomax.json';
const journal=output+'.jsonl';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
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
  config:{workers:1,capacity:4096,buckets:4096,timeoutMs:120000,quantum:256,
    boundaryDepth:2,boundaryCapacity:256,boundaryBudget:100000,allowFallback:true},
  protocol:'Official four inputs in order, one attempt each. Existing solver 120-second cap preserved. Fresh solver session per input. No extra warmup or retry.',
  interpretation:'Timeouts are incomplete, not WDL answers or completed Fhourstones scores. IsoMax fallbackNodes counts entered RBA fallback frames; boundarySteps is separate algebra work. These are not identical operations to Fhourstones ab nodes. Whole-operation wall/CPU/cycles include ingress, preparation, worker startup, cleanup and cold periodic measurement. CPU cycles sum all process threads; no nominal-GHz conversion. This is not full NEES/JMS certification.',
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
    try{result=await solve7x6(moves,report.config);}
    catch(error){result={status:'FAILED',rootWdl:null,error:error.stack??String(error),cleanup:null};}
    finally{clearInterval(pulse);}
    const cpuCycles=meter.read()-before,wallMs=performance.now()-start,cpu=process.cpuUsage(cpuBefore);
    const cpuMs=(cpu.user+cpu.system)/1000;
    const entry={index:i,input:inputs[i],expectedWdl:expected[i],...result,wallMs,cpuMs,
      cpuCycles:cpuCycles.toString(),rssBytes:process.memoryUsage().rss,
      oracleMatched:result.status==='EXACT'?result.rootWdl===expected[i]:null,
      fallbackKposPerWallSecond:(result.metrics?.fallbackNodes??0)/wallMs,
      fallbackKposPerCpuSecond:(result.metrics?.fallbackNodes??0)/cpuMs,
      cyclesPerFallbackNode:result.metrics?.fallbackNodes?Number(cpuCycles)/result.metrics.fallbackNodes:null};
    report.cases.push(entry);
    writeFileSync(output,JSON.stringify(report,null,2)+'\n');
    record({event:'case-result',...entry});
    if(result.cleanup!==true || entry.oracleMatched===false)break;
  }
  report.finished=new Date().toISOString();
  report.completed=report.cases.length===4&&report.cases.every(c=>c.oracleMatched===true);
  report.outcome=report.completed?'PASS':'INCOMPLETE_OR_FAILED';
  writeFileSync(output,JSON.stringify(report,null,2)+'\n');
  record({event:'finish',outcome:report.outcome,cases:report.cases.length});
  if(!report.completed)process.exitCode=1;
}finally{meter.close();}
