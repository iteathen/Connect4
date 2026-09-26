import {cpus} from 'node:os';
import {performance} from 'node:perf_hooks';
import {processCycleCounter} from './cycle-counter.mjs';
import {
  prepareConnect4RbaGeometry,
  createConnect4RbaSharedExactCache32,
  runLazySmpConnect4Rba32,
} from '../vendor/jsminsys/addons/index.mjs';

const input='45461667',moves=Array.from(input,c=>c.charCodeAt(0)-49),
  geometry=prepareConnect4RbaGeometry({columns:7,rows:6}),
  sharedExactCache=createConnect4RbaSharedExactCache32({capacity:65536,keyWords:geometry.keyWords}),
  meter=await processCycleCounter();

async function once(iteration){
  const before=meter.read(),cpuBefore=process.cpuUsage(),start=performance.now();
  const result=await runLazySmpConnect4Rba32(moves,{
    geometry,workers:4,sharedCacheCapacity:65536,sharedExactCache,
    localCacheCapacity:65536,sharedSampleMask:7,timeoutMs:30000,
    cpcFrontierResponse:false,cpcProjectedAdvisory:false,
  });
  const cycles=meter.read()-before,cpu=process.cpuUsage(cpuBefore);
  return {iteration,...result,wallMs:performance.now()-start,
    cpuMs:(cpu.user+cpu.system)/1000,cpuCycles:cycles.toString(),
    externalSharedHits:Atomics.load(sharedExactCache.stats,0),
    externalSharedStores:Atomics.load(sharedExactCache.stats,1)};
}
try{
  const first=await once(1),second=await once(2);
  console.log(JSON.stringify({event:'lazy-smp-persistence',cpu:cpus()[0].model,node:process.version,first,second}));
}finally{meter.close();}
