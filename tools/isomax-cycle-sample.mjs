// COLD measurement process. No timing/reporting is injected into production recursion.
import {performance} from 'node:perf_hooks';
import {cpus,freemem} from 'node:os';
import {validateMemoryConfig} from './isomax-cycle-analysis.mjs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {processCycleCounter} from './cycle-counter.mjs';

const library=resolve(process.argv[2]),input=process.argv[3]??'45461667',
  workers=4,caseConfig=validateMemoryConfig(JSON.parse(process.argv[4]??'{"sharedCacheCapacity":65536,"localCacheCapacity":65536,"timeoutMs":30000,"expectedMove":3}')),
  {sharedCacheCapacity,localCacheCapacity,timeoutMs}=caseConfig,meter=await processCycleCounter();
// The first read is already cumulative from process creation, including Node,
// loader, FFI meter initialization and all static imports above. Do not subtract it.
const bootstrapCycles=meter.read(),setupStarted=performance.now();
let beforeSolve,afterSolve,result;
try{
  const {prepareConnect4RbaGeometry,runLazySmpConnect4Rba32}=
    await import(pathToFileURL(resolve(library,'addons/index.mjs')).href);
  const geometry=prepareConnect4RbaGeometry({columns:7,rows:6}),
    moves=Array.from(input,c=>c.charCodeAt(0)-49),
    config={geometry,workers,sharedCacheCapacity,localCacheCapacity,
      sharedSampleMask:7,timeoutMs,cpcFrontierResponse:false,cpcProjectedAdvisory:false};
  beforeSolve=meter.read();
  const setupMs=performance.now()-setupStarted,start=performance.now(),cpuBefore=process.cpuUsage();
  result=await runLazySmpConnect4Rba32(moves,config);
  afterSolve=meter.read();
  const wallMs=performance.now()-start,cpu=process.cpuUsage(cpuBefore),
    totalNodes=result.benchmarkNodeCounts?.reduce((a,b)=>a+b,0)??null;
  const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
  console.log(JSON.stringify({kind:'isomax-total-cycle-sample-v1',input,workers,timeoutMs,
    sharedSampleMask:7,localCacheCapacity,sharedCacheCapacity,
    cacheBackingBytes:sharedCacheCapacity*(geometry.keyWords*4+8)+12+workers*localCacheCapacity*(geometry.keyWords*4+5),freeRamBytes:freemem(),
    librarySha:git('rev-parse','HEAD'),libraryDirty:!!git('status','--porcelain'),
    cpu:cpus()[0].model,node:process.version,v8:process.versions.v8,
    bootstrapCycles:bootstrapCycles.toString(),setupCycles:(beforeSolve-bootstrapCycles).toString(),
    solveCycles:(afterSolve-beforeSolve).toString(),totalProcessCycles:afterSolve.toString(),
    setupMs,wallMs,cpuMs:(cpu.user+cpu.system)/1000,rssAfterBytes:process.memoryUsage().rss,
    measurement:totalNodes===null?'production':'all-worker-node-instrumentation',
    totalNodes,cyclesPerVisit:totalNodes?Number(afterSolve)/totalNodes:null,
    visitsPerSecond:totalNodes?totalNodes/(wallMs/1000):null,
    expectedWdl:caseConfig.expectedWdl??1,expectedMove:caseConfig.expectedMove??null,
    outcome:result.status==='TIMEOUT'?'CENSORED':result.status,
    oracleMatched:result.status==='EXACT'&&result.rootWdl===(caseConfig.expectedWdl??1)&&(caseConfig.expectedMove===undefined||result.move===caseConfig.expectedMove),
    ...result}));
}catch(error){
  const final=meter.read();
  console.log(JSON.stringify({kind:'isomax-total-cycle-failure-v1',input,
    totalProcessCycles:final.toString(),bootstrapCycles:bootstrapCycles.toString(),
    error:error.stack??String(error)}));
  process.exitCode=1;
}finally{meter.close();}
