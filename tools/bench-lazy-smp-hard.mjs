import {cpus} from 'node:os';
import {performance} from 'node:perf_hooks';
import {processCycleCounter} from './cycle-counter.mjs';
import {
  prepareConnect4RbaGeometry,
  runLazySmpConnect4Rba32,
} from '../vendor/jsminsys/addons/index.mjs';

const inputArg=process.argv[2]??'35333571';
const input=inputArg==='EMPTY'?'':inputArg;
const expected=Number(process.argv[3]);
const requestedSharedSampleMask=Number(process.argv[4]??0);
const timeoutMs=Number(process.argv[5]??120000);
const phase=process.argv[6]??'sample';
const moves=Array.from(input,c=>c.charCodeAt(0)-49);
const geometry=prepareConnect4RbaGeometry({columns:7,rows:6});
const meter=await processCycleCounter();

try{
  const before=meter.read(),cpuBefore=process.cpuUsage(),start=performance.now();
  let result;
  try{
    result=await runLazySmpConnect4Rba32(moves,{
      geometry,
      workers:4,
      sharedCacheCapacity:65536,
      localCacheCapacity:65536,
      sharedSampleMask:requestedSharedSampleMask,
      timeoutMs,
      cpcFrontierResponse:false,
      cpcProjectedAdvisory:false,
    });
  }catch(error){
    result={status:'FAILED',rootWdl:null,move:-1,winner:-1,winnerMetrics:null,
      sharedCacheHits:null,sharedCacheStores:null,sharedCacheStoreContention:null,
      cleanup:false,error:error.stack??String(error)};
  }

  const cycles=meter.read()-before,wallMs=performance.now()-start,cpu=process.cpuUsage(cpuBefore);
  const winnerMetrics=result.winnerMetrics??null;
  const sample={
    event:'lazy-smp-hard-sample',
    phase,
    input,
    expected,
    workers:4,
    requestedSharedSampleMask,
    requestedDensity:requestedSharedSampleMask===0?'all':`1/${requestedSharedSampleMask+1}`,
    timeoutMs,
    cpu:cpus()[0].model,
    node:process.version,
    status:result.status,
    rootWdl:result.rootWdl??null,
    oracleMatched:result.status==='EXACT'?result.rootWdl===expected:null,
    move:result.move??-1,
    wallMs,
    cpuMs:(cpu.user+cpu.system)/1000,
    cpuCycles:cycles.toString(),
    winner:result.winner??-1,
    winnerNodes:winnerMetrics?.nodes??null,
    localCacheHits:winnerMetrics?.cacheHits??null,
    sharedCacheHits:result.sharedCacheHits??null,
    sharedCacheStores:result.sharedCacheStores??null,
    sharedCacheStoreContention:result.sharedCacheStoreContention??null,
    cleanup:result.cleanup??false,
    completedWorkers:result.completedWorkers??null,
    workersExited:result.workersExited??null,
    errorCode:result.errorCode??null,
    rssBytes:process.memoryUsage().rss,
  };
  console.log(JSON.stringify(sample));
  if(sample.cleanup!==true||sample.status==='FAILED'||sample.oracleMatched===false)process.exitCode=1;
}finally{
  meter.close();
}
