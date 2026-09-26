// Cold measurement harness. No solver, library, or hot-path modifications.
// One-worker control launches the identical library worker directly, because
// the production Lazy SMP host rejects one worker. All other counts use it.
import {appendFileSync, existsSync, writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {cpus} from 'node:os';
import {performance} from 'node:perf_hooks';
import {solve7x6} from '../../../components/isometric/solve.mjs';
import {processCycleCounter} from '../../../tools/cycle-counter.mjs';
import {prepareConnect4RbaGeometry, shareConnect4RbaGeometry32} from '../../../vendor/jsminsys/addons/rba-connect4-geometry.mjs';
import {connect4RbaFromMoves} from '../../../vendor/jsminsys/addons/rba-connect4-solver.mjs';
import {createConnect4RbaSharedExactCache32} from '../../../vendor/jsminsys/addons/rba-connect4-shared-exact-cache.mjs';
import {createManagedThreadSession32,sharedViewBytes32} from '../../../vendor/jsminsys/addons/branch-manager-host.mjs';

const workers=Number(process.argv[2]);
if(![1,3,4,5].includes(workers))throw Error('Expected worker count 1, 3, 4, or 5');
const inputs=['45461667','35333571','13333111',''],expected=[1,-1,0,1];
const config={workers,timeoutMs:120000,sharedCacheCapacity:65536,localCacheCapacity:65536,sharedSampleMask:7,cpcFrontierResponse:false,cpcProjectedAdvisory:false};
const metricNames=['nodes','cutoffs','cacheHits','cpcExact','cpcBounds','cpcRestrictions','cpcForced','cpcPrecursors','cpcProjectedForks','frontCalls','frontExact','frontFailures','frontSteps','frontActionExact','cofactors'];
const geometry=workers===1?prepareConnect4RbaGeometry({columns:7,rows:6}):null;
async function oneWorker(moves){
  const root=connect4RbaFromMoves(moves,{geometry,positionCode:false});
  const workerGeometry=shareConnect4RbaGeometry32(geometry);
  const sharedExactCache=createConnect4RbaSharedExactCache32({capacity:config.sharedCacheCapacity,keyWords:geometry.keyWords});
  const control=new Int32Array(new SharedArrayBuffer(20));
  const resultWords=new Int32Array(new SharedArrayBuffer(16));
  const metricBuffer=new SharedArrayBuffer(120),metrics=new Float64Array(metricBuffer);
  control[4]=-1;
  const session=createManagedThreadSession32({control,stopIndex:0,doneIndex:1,errorIndex:2,wakeIndex:3,workerDiedCode:101,deadlineCode:102,cancelledCode:103});
  const start=performance.now();
  try{
    session.spawn(new URL('../../../vendor/jsminsys/addons/rba-connect4-lazy-smp-worker.mjs',import.meta.url),{
      control,resultWords,metricBuffer,workerIndex:0,geometry:workerGeometry,root,rootReflected:root.reflected,
      sharedExactCache,localCacheCapacity:config.localCacheCapacity,sharedSampleMask:config.sharedSampleMask,
      cpcFrontierResponse:false,cpcProjectedAdvisory:false,
    });
    await session.wait({timeoutMs:config.timeoutMs});
  }finally{await session.close();}
  const host=session.state(),winner=Atomics.load(control,4);
  const exact=!host.errorCode&&Atomics.load(control,1)===1&&winner===0;
  return {status:exact?'EXACT':host.errorCode===102?'TIMEOUT':'FAILED',rootWdl:exact?resultWords[0]-2:null,
    move:exact?resultWords[2]:-1,winner,winnerMetrics:exact?Object.fromEntries(metricNames.map((k,i)=>[k,metrics[i]])):null,
    sharedCacheHits:Atomics.load(sharedExactCache.stats,0),sharedCacheStores:Atomics.load(sharedExactCache.stats,1),
    sharedCacheStoreContention:Atomics.load(sharedExactCache.stats,2),completedWorkers:[Atomics.load(resultWords,3)],
    errorCode:host.errorCode,errors:host.errors,cleanup:host.cleanup,workersExited:host.workersExited,
    workersUsed:1,elapsedMs:performance.now()-start,
    sharedBytes:sharedViewBytes32(sharedExactCache)+sharedViewBytes32(workerGeometry)+156};
}
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const output=new URL(`./workers-${workers}.json`,import.meta.url),journal=new URL(`./workers-${workers}.jsonl`,import.meta.url);
if(existsSync(output)||existsSync(journal))throw Error('Refuse to overwrite existing qualification evidence; use a new qualification directory');
const report={started:new Date().toISOString(),sha:git('rev-parse','HEAD'),jsminsys:git('-C','vendor/jsminsys','rev-parse','HEAD'),
  sourceDirty:!!git('status','--porcelain','--','components','tools','vendor','test','package.json'),
  node:process.version,v8:process.versions.v8,cpu:cpus()[0].model,logicalCpus:cpus().length,config,
  mode:workers===1?'single unmodified Lazy SMP worker; benchmark-only host':'production solve7x6 Lazy SMP host',
  protocol:'Official four Fhourstones inputs in order; one attempt per count/input; 120s deadline; no warmup; fresh Node process per worker count; fresh caches/session per input.',
  interpretation:'Process cycles and CPU cover all threads. winnerMetrics exclude unfinished loser work; timeout nodes unavailable. RSS peak is sampled every 15s plus endpoints, not an exact allocator peak. One-worker control retains identical shared-cache settings and worker index zero. Not full NEES certification or completed Fhourstones score when any case times out.',
  cases:[]};
function save(){writeFileSync(output,JSON.stringify(report,null,2)+'\n');}
function record(event){const row={at:new Date().toISOString(),workers,...event};appendFileSync(journal,JSON.stringify(row)+'\n');console.log(JSON.stringify(row));}
save();record({event:'start',sha:report.sha,jsminsys:report.jsminsys,config});
const meter=await processCycleCounter();
try{
  for(let i=0;i<inputs.length;i++){
    const moves=Array.from(inputs[i],c=>c.charCodeAt(0)-49);
    record({event:'case-start',index:i,input:inputs[i],expectedWdl:expected[i]});
    const cycleBefore=meter.read(),cpuBefore=process.cpuUsage(),start=performance.now();
    let peakRssBytes=process.memoryUsage().rss;
    const pulse=setInterval(()=>{peakRssBytes=Math.max(peakRssBytes,process.memoryUsage().rss);record({event:'progress',index:i,wallMs:performance.now()-start,cpuCycles:(meter.read()-cycleBefore).toString(),rssBytes:process.memoryUsage().rss});},15000);
    let result;
    try{result=await (workers===1?oneWorker(moves):solve7x6(moves,config));}
    catch(error){result={status:'FAILED',rootWdl:null,error:error.stack,cleanup:null};}
    finally{clearInterval(pulse);}
    const cycles=meter.read()-cycleBefore,wallMs=performance.now()-start,cpu=process.cpuUsage(cpuBefore);
    peakRssBytes=Math.max(peakRssBytes,process.memoryUsage().rss);
    const entry={index:i,input:inputs[i],expectedWdl:expected[i],...result,wallMs,cpuMs:(cpu.user+cpu.system)/1000,
      cpuCycles:cycles.toString(),peakObservedRssBytes:peakRssBytes,oracleMatched:result.status==='EXACT'?result.rootWdl===expected[i]:null};
    report.cases.push(entry);save();record({event:'case-result',...entry});
    if(result.cleanup!==true||entry.oracleMatched===false||result.status==='FAILED'){process.exitCode=2;break;}
  }
  report.finished=new Date().toISOString();report.allCasesAttempted=report.cases.length===4;
  report.outcome=report.cases.length===4&&report.cases.every(x=>x.oracleMatched===true)?'PASS':'INCOMPLETE_OR_FAILED';
  save();record({event:'finish',outcome:report.outcome,cases:report.cases.length});
}finally{meter.close();}
