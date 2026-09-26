import {cpus} from 'node:os';
import {performance} from 'node:perf_hooks';
import {processCycleCounter} from './cycle-counter.mjs';
import {
  prepareConnect4RbaGeometry,
  runLazySmpConnect4Rba32,
} from '../vendor/jsminsys/addons/index.mjs';

const rawInput=process.argv[2],
  timeoutMs=Number(process.argv[3]??8000);
if(!rawInput)throw new Error('position argument required');
const input=rawInput==='EMPTY'?'':rawInput,
  moves=Array.from(input,c=>c.charCodeAt(0)-49),
  geometry=prepareConnect4RbaGeometry({columns:7,rows:6}),
  meter=await processCycleCounter();

function displacement(values){
  const routeCount=12,byIncoming6=Array(routeCount).fill(0),byIncoming8=Array(routeCount).fill(0);
  let total=0,displaced6=0,displaced8=0,sameKey=0;
  if(Array.isArray(values)){
    for(let incoming=0;incoming<routeCount;incoming+=1){
      for(let displaced=0;displaced<routeCount;displaced+=1){
        const base=((incoming*routeCount+displaced)<<1),
          refresh=values[base]??0,collision=values[base+1]??0;
        sameKey+=refresh;total+=collision;
        if(displaced===6){byIncoming6[incoming]+=collision;displaced6+=collision;}
        if(displaced===8){byIncoming8[incoming]+=collision;displaced8+=collision;}
      }
    }
  }
  return {totalCollisions:total,sameKeyRefreshes:sameKey,displaced6,displaced8,byIncoming6,byIncoming8};
}

try{
  const before=meter.read(),cpuBefore=process.cpuUsage(),start=performance.now();
  const result=await runLazySmpConnect4Rba32(moves,{
    geometry,
    workers:4,
    sharedCacheCapacity:65536,
    localCacheCapacity:65536,
    sharedSampleMask:7,
    diagnosticOverlapSampleMask:-1,
    diagnosticProvenance:1,
    timeoutMs,
    cpcFrontierResponse:false,
    cpcProjectedAdvisory:false,
  });
  const cycles=meter.read()-before,wallMs=performance.now()-start,cpu=process.cpuUsage(cpuBefore),
    routeReplacement=displacement(result.diagnosticRouteReplacementStats),
    hits=result.diagnosticProvenanceHits??Array(12).fill(0),
    stores=result.diagnosticProvenanceStores??Array(12).fill(0);
  console.log(JSON.stringify({
    event:'lazy-smp-bounded-route-scan',
    input:rawInput,
    ply:moves.length,
    cpu:cpus()[0].model,
    node:process.version,
    status:result.status,
    rootWdl:result.rootWdl,
    move:result.move,
    winner:result.winner,
    cleanup:result.cleanup,
    workersExited:result.workersExited,
    sharedCacheHits:result.sharedCacheHits,
    sharedCacheStores:result.sharedCacheStores,
    route6:{hits:hits[6]??0,stores:stores[6]??0,displaced:routeReplacement.displaced6,byIncoming:routeReplacement.byIncoming6},
    route8:{hits:hits[8]??0,stores:stores[8]??0,displaced:routeReplacement.displaced8,byIncoming:routeReplacement.byIncoming8},
    totalCollisions:routeReplacement.totalCollisions,
    sameKeyRefreshes:routeReplacement.sameKeyRefreshes,
    wallMs,
    cpuMs:(cpu.user+cpu.system)/1000,
    cpuCycles:cycles.toString(),
    rssBytes:process.memoryUsage().rss,
  }));
}finally{meter.close();}
