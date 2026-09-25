import {cpus} from 'node:os';
import {performance} from 'node:perf_hooks';
import {processCycleCounter} from './cycle-counter.mjs';
import {
  prepareConnect4RbaGeometry,
  runLazySmpConnect4Rba32,
} from '../vendor/jsminsys/addons/index.mjs';

const rawInput=process.argv[2]??'45461667',
  input=rawInput==='EMPTY'?'':rawInput,
  sharedSampleMask=Number(process.argv[3]??7),
  overlapSampleMask=Number(process.argv[4]??255),
  overlapCapacity=Number(process.argv[5]??32768),
  timeoutMs=Number(process.argv[6]??30000),
  workers=4,
  moves=Array.from(input,c=>c.charCodeAt(0)-49),
  geometry=prepareConnect4RbaGeometry({columns:7,rows:6}),
  meter=await processCycleCounter();

function summarize(values){
  if(!values.length)return {count:0,min:0,median:0,p95:0,max:0,mean:0};
  values.sort((a,b)=>a-b);
  let sum=0;
  for(const value of values)sum+=value;
  return {
    count:values.length,
    min:values[0],
    median:values[Math.floor((values.length-1)*0.5)],
    p95:values[Math.floor((values.length-1)*0.95)],
    max:values[values.length-1],
    mean:sum/values.length,
  };
}

function analyzeOverlapTrace(trace,workerCount,traceEndMs){
  const counts=trace.counts,records=trace.records,meta=trace.meta,keys=trace.keys,
    cap=trace.capacityPerWorker,keyWords=trace.keyWords,
    recordWidth=6,metaWidth=5,groups=new Map(),
    recordedByWorker=new Array(workerCount),overflowByWorker=new Array(workerCount);
  let recorded=0,complete=0,incomplete=0;
  for(let worker=0;worker<workerCount;worker+=1){
    const count=Math.min(counts[worker*2],cap),overflow=counts[worker*2+1];
    recordedByWorker[worker]=count;overflowByWorker[worker]=overflow;recorded+=count;
    for(let local=0;local<count;local+=1){
      const event=worker*cap+local,rb=event*recordWidth,mb=event*metaWidth,kb=event*keyWords,
        start=records[rb],rawEnd=records[rb+1],end=rawEnd||traceEndMs,
        keyParts=new Array(keyWords);
      for(let k=0;k<keyWords;k+=1)keyParts[k]=keys[kb+k]>>>0;
      const key=keyParts.join(',');
      let list=groups.get(key);
      if(!list){list=[];groups.set(key,list);}
      const isComplete=rawEnd>0;
      if(isComplete)complete+=1;else incomplete+=1;
      list.push({
        worker,start,end,complete:isComplete,
        nodes:isComplete?Math.max(0,records[rb+3]-records[rb+2]):null,
        cofactors:isComplete?Math.max(0,records[rb+5]-records[rb+4]):null,
        depth:meta[mb],alpha:meta[mb+1],beta:meta[mb+2],
        result:meta[mb+3],kind:meta[mb+4],overlap:false,
      });
    }
  }

  let crossWorkerGroups=0,overlapGroups=0,sequentialCrossWorkerGroups=0,
    overlapPairs=0,overlappedOccurrences=0,maxDistinctConcurrentWorkers=1,
    windowVariantOverlapGroups=0;
  const overlapNodes=[],overlapCofactors=[],kindCounts={},top=[];
  for(const [key,events] of groups){
    const workersSeen=new Set(events.map(e=>e.worker));
    if(workersSeen.size<2)continue;
    crossWorkerGroups+=1;
    events.sort((a,b)=>a.start-b.start);
    const active=[];
    let groupPairs=0,groupMax=1;
    for(const event of events){
      for(let i=active.length-1;i>=0;i-=1)if(active[i].end<=event.start)active.splice(i,1);
      const activeWorkers=new Set([event.worker]);
      for(const prior of active){
        activeWorkers.add(prior.worker);
        if(prior.worker!==event.worker){
          groupPairs+=1;
          event.overlap=true;prior.overlap=true;
        }
      }
      if(activeWorkers.size>groupMax)groupMax=activeWorkers.size;
      active.push(event);
    }
    if(!groupPairs){sequentialCrossWorkerGroups+=1;continue;}
    overlapGroups+=1;overlapPairs+=groupPairs;
    if(groupMax>maxDistinctConcurrentWorkers)maxDistinctConcurrentWorkers=groupMax;
    const windows=new Set(events.filter(e=>e.overlap).map(e=>`${e.alpha}:${e.beta}`));
    if(windows.size>1)windowVariantOverlapGroups+=1;
    let groupMaxNodes=0,groupMaxCofactors=0;
    for(const event of events){
      if(!event.overlap)continue;
      overlappedOccurrences+=1;
      kindCounts[event.kind]=(kindCounts[event.kind]??0)+1;
      if(event.complete){
        overlapNodes.push(event.nodes);overlapCofactors.push(event.cofactors);
        if(event.nodes>groupMaxNodes)groupMaxNodes=event.nodes;
        if(event.cofactors>groupMaxCofactors)groupMaxCofactors=event.cofactors;
      }
    }
    top.push({
      key,
      workers:[...workersSeen].sort((a,b)=>a-b),
      events:events.length,
      overlapPairs:groupPairs,
      maxDistinctConcurrentWorkers:groupMax,
      windows:[...windows].sort(),
      maxInclusiveNodes:groupMaxNodes,
      maxInclusiveCofactors:groupMaxCofactors,
      kinds:Object.fromEntries(Object.entries(kindCounts).filter(()=>false)),
    });
  }
  top.sort((a,b)=>b.maxInclusiveNodes-a.maxInclusiveNodes||b.overlapPairs-a.overlapPairs);
  return {
    sampleMask:overlapSampleMask,
    deterministicSampleFraction:1/(overlapSampleMask+1),
    capacityPerWorker:cap,
    recorded,
    complete,
    incomplete,
    recordedByWorker,
    overflowByWorker,
    uniqueSampledKeys:groups.size,
    crossWorkerKeys:crossWorkerGroups,
    overlapKeys:overlapGroups,
    sequentialCrossWorkerKeys:sequentialCrossWorkerGroups,
    overlapPairs,
    overlappedOccurrences,
    maxDistinctConcurrentWorkers,
    windowVariantOverlapKeys:windowVariantOverlapGroups,
    overlapInclusiveNodes:summarize(overlapNodes),
    overlapInclusiveCofactors:summarize(overlapCofactors),
    overlapExitKinds:kindCounts,
    topOverlapKeys:top.slice(0,12).map(({key,...rest})=>({keyWords:key.split(',').map(Number),...rest})),
  };
}

try{
  const before=meter.read(),cpuBefore=process.cpuUsage(),start=performance.now();
  const result=await runLazySmpConnect4Rba32(moves,{
    geometry,
    workers,
    sharedCacheCapacity:65536,
    localCacheCapacity:65536,
    sharedSampleMask,
    diagnosticOverlapSampleMask:overlapSampleMask,
    diagnosticOverlapCapacity:overlapCapacity,
    diagnosticProvenance:1,
    timeoutMs,
    cpcFrontierResponse:false,
    cpcProjectedAdvisory:false,
  });
  const traceEndMs=performance.timeOrigin+performance.now(),
    cycles=meter.read()-before,wallMs=performance.now()-start,cpu=process.cpuUsage(cpuBefore),
    overlap=analyzeOverlapTrace(result.diagnosticOverlapTrace,workers,traceEndMs);
  const {diagnosticOverlapTrace,...publicResult}=result;
  console.log(JSON.stringify({
    event:'lazy-smp-dts-overlap-census',
    input:rawInput,
    cpu:cpus()[0].model,
    node:process.version,
    sharedSampleMask,
    overlapSampleMask,
    overlapCapacity,
    ...publicResult,
    overlap,
    provenance:{
      labels:[
        'unclassified',
        'cpcNoResiduals',
        'cpcResidualExhaustion',
        'cpcMoverImmediateSingleton',
        'cpcMultipleOpponentThreats',
        'cpcStackedThreat',
        'cpcAllLift',
        'cpcForkPrecursor',
        'cpcLongRangeResponse',
        'intervalExact',
        'forcedTerminal',
        'recursiveFullWindow',
      ],
      hits:publicResult.diagnosticProvenanceHits,
      stores:publicResult.diagnosticProvenanceStores,
      hitsPerStore:publicResult.diagnosticProvenanceHits.map((hits,i)=>{
        const stores=publicResult.diagnosticProvenanceStores[i];
        return stores?hits/stores:0;
      }),
    },
    wallMs,
    cpuMs:(cpu.user+cpu.system)/1000,
    cpuCycles:cycles.toString(),
    rssBytes:process.memoryUsage().rss,
  }));
}finally{meter.close();}
