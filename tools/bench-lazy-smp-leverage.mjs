import {cpus} from 'node:os';
import {performance} from 'node:perf_hooks';
import {processCycleCounter} from './cycle-counter.mjs';
import {
  prepareConnect4RbaGeometry,
  runLazySmpConnect4Rba32,
} from '../vendor/jsminsys/addons/index.mjs';

const token=process.argv[2]??'45461667',
  timeoutMs=Number(process.argv[3]??30000),
  late=[4,0,0,0,3,3,0,0,6,2,3,0,2,3,6,3,6,3,4,6,2,2,6,1,2,5,6,4],
  moves=token==='EMPTY'?[]:token==='LATE'?late:Array.from(token,c=>c.charCodeAt(0)-49),
  geometry=prepareConnect4RbaGeometry({columns:7,rows:6}),
  meter=await processCycleCounter();
try{
  const before=meter.read(),cpuBefore=process.cpuUsage(),start=performance.now();
  const result=await runLazySmpConnect4Rba32(moves,{
    geometry,
    workers:4,
    sharedCacheCapacity:65536,
    localCacheCapacity:65536,
    sharedSampleMask:0,
    diagnosticLeverage:true,
    timeoutMs,
    cpcFrontierResponse:false,
    cpcProjectedAdvisory:false,
  });
  const cycles=meter.read()-before,cpu=process.cpuUsage(cpuBefore);
  console.log(JSON.stringify({
    event:'lazy-smp-leverage-census',
    input:token,
    cpu:cpus()[0].model,
    node:process.version,
    ...result,
    wallMs:performance.now()-start,
    cpuMs:(cpu.user+cpu.system)/1000,
    cpuCycles:cycles.toString(),
  }));
}finally{meter.close();}
