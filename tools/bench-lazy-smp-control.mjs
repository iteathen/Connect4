import {cpus} from 'node:os';
import {performance} from 'node:perf_hooks';
import {processCycleCounter} from './cycle-counter.mjs';
import {
  prepareConnect4RbaGeometry,
  runLazySmpConnect4Rba32,
} from '../vendor/jsminsys/addons/index.mjs';

const input='45461667',expected=1,moves=Array.from(input,c=>c.charCodeAt(0)-49);
const geometry=prepareConnect4RbaGeometry({columns:7,rows:6});
const meter=await processCycleCounter();
try{
  const before=meter.read(),cpuBefore=process.cpuUsage(),start=performance.now();
  const result=await runLazySmpConnect4Rba32(moves,{
    geometry,workers:4,sharedCacheCapacity:65536,localCacheCapacity:65536,timeoutMs:30000,
    cpcFrontierResponse:false,cpcProjectedAdvisory:false,
  });
  const cycles=meter.read()-before,wallMs=performance.now()-start,cpu=process.cpuUsage(cpuBefore);
  console.log(JSON.stringify({
    event:'sample',input,expected,cpu:cpus()[0].model,node:process.version,...result,
    wallMs,cpuMs:(cpu.user+cpu.system)/1000,cpuCycles:cycles.toString(),
    rssBytes:process.memoryUsage().rss,
    oracleMatched:result.status==='EXACT'?result.rootWdl===expected:null,
  }));
}finally{meter.close();}
