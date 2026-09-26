import {cpus} from 'node:os';
import {performance} from 'node:perf_hooks';
import {processCycleCounter} from './cycle-counter.mjs';
import {
  prepareConnect4RbaGeometry,
  runLazySmpConnect4Rba32,
} from '../vendor/jsminsys/addons/index.mjs';

const rawInput=process.argv[2]??'45461667',
  input=rawInput==='EMPTY'?'':rawInput,
  actualMask=Number(process.argv[3]??7),
  diagnosticMask=Number(process.argv[4]??7),
  sharedCacheCapacity=Number(process.argv[5]??65536),
  localCacheCapacity=Number(process.argv[6]??65536),
  timeoutMs=Number(process.argv[7]??30000),
  moves=Array.from(input,c=>c.charCodeAt(0)-49),
  geometry=prepareConnect4RbaGeometry({columns:7,rows:6}),
  meter=await processCycleCounter();
try{
  const before=meter.read(),cpuBefore=process.cpuUsage(),start=performance.now();
  const result=await runLazySmpConnect4Rba32(moves,{
    geometry,
    workers:4,
    sharedCacheCapacity,
    localCacheCapacity,
    sharedSampleMask:actualMask,
    diagnosticSampleMask:diagnosticMask,
    timeoutMs,
    cpcFrontierResponse:false,
    cpcProjectedAdvisory:false,
  });
  const cycles=meter.read()-before,wallMs=performance.now()-start,cpu=process.cpuUsage(cpuBefore);
  console.log(JSON.stringify({
    event:'lazy-smp-lead-census',
    input:rawInput,
    cpu:cpus()[0].model,
    node:process.version,
    actualMask,
    diagnosticMask,
    sharedCacheCapacity,
    localCacheCapacity,
    ...result,
    wallMs,
    cpuMs:(cpu.user+cpu.system)/1000,
    cpuCycles:cycles.toString(),
    rssBytes:process.memoryUsage().rss,
  }));
}finally{meter.close();}
