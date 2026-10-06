// COLD sequential campaign. Run one sample at a time; append outcomes before analysis.
import {mkdirSync,writeFileSync,appendFileSync,readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {cpus,platform,release,freemem} from 'node:os';
import {validateCycleSample,summarizeCycleBlocks,validateMemoryConfig} from './isomax-cycle-analysis.mjs';

const [mode,outputArg,baselineArg,candidateArg,blocksArg='4']=process.argv.slice(2);
if(!['noise','instrumentation','candidate','memory'].includes(mode)||!outputArg||!baselineArg)
  throw Error('usage: node tools/isomax-cycle-campaign.mjs noise|instrumentation|candidate OUTPUT BASELINE [CANDIDATE] [BLOCKS=4]');
const output=resolve(outputArg),baseline=resolve(baselineArg),candidate=mode==='memory'?baseline:resolve(candidateArg??baselineArg),blocks=Number(blocksArg);
if(!Number.isInteger(blocks)||blocks<2||blocks>16)throw Error('blocks must be 2..16');
if(mode!=='candidate'&&mode!=='memory'&&baseline!==candidate)throw Error('calibration requires identical library paths');
const memory=mode==='memory'?JSON.parse(readFileSync(candidateArg,'utf8')):null;
if(memory){validateMemoryConfig(memory.baseline);validateMemoryConfig(memory.candidate);}
const here=dirname(fileURLToPath(import.meta.url)),sample=resolve(here,'isomax-cycle-sample.mjs'),
  hook=resolve(here,'isomax-node-counts.mjs'),journal=resolve(output,'samples.jsonl'),samples=[];
// Fails if OUTPUT already exists; no prior evidence can be overwritten.
mkdirSync(output);
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
// Capture identity BEFORE launching any child, including one that never emits JSON.
const snapshot=path=>({path,sha:git('-C',path,'rev-parse','HEAD'),
  dirty:!!git('-C',path,'status','--porcelain')});
const baselineSource=snapshot(baseline),candidateSource=snapshot(candidate);
writeFileSync(resolve(output,'manifest.json'),JSON.stringify({mode,blocks,baseline,candidate,
  baselineSource,candidateSource,cpu:cpus()[0].model,platform:platform(),osRelease:release(),
  node:process.version,v8:process.versions.v8,
  applicationSha:git('rev-parse','HEAD'),started:new Date().toISOString(),
  sampleSha256:hash(sample),hookSha256:hash(hook),analysisSha256:hash(resolve(here,'isomax-cycle-analysis.mjs')),
  controllerSha256:hash(fileURLToPath(import.meta.url)),counterSha256:hash(resolve(here,'cycle-counter.mjs')),
  boundary:'Process creation through joined native solve. Setup+bootstrap+solve cycles close exactly. Excludes subsequent report output and parent harness.',
  sequence:'ABBA',input:memory?.input??'45461667',workers:4,memory},null,2)+'\n',{flag:'wx'});
if(baselineSource.dirty||candidateSource.dirty)throw Error('dirty library cannot start qualification; manifest preserved');
for(let block=0;block<blocks;block++)for(const arm of ['A','B','B','A']){
  const instrumented=!!memory?.instrumented||(mode==='instrumentation'&&arm==='B');
  if(freemem()<4*1024**3)throw Error('memory admission failed: less than 4 GiB free');
  const caseConfig=memory?(arm==='A'?memory.baseline:memory.candidate):null;
  const startedAt=new Date().toISOString();
  const expectedSource=arm==='B'?candidateSource:baselineSource;
  const currentSource=snapshot(expectedSource.path);
  if(currentSource.dirty||currentSource.sha!==expectedSource.sha){
    appendFileSync(resolve(output,'processes.jsonl'),JSON.stringify({block,arm,startedAt,
      error:'library changed before launch',expectedSource,currentSource})+'\n');
    throw Error('library changed before launch; no retry');
  }
  const args=['--experimental-ffi',...(instrumented?['--import',pathToFileURL(hook).href]:[]),sample,
    arm==='B'?candidate:baseline,memory?.input??'45461667',...(caseConfig?[JSON.stringify(caseConfig)]:[])];
  const child=spawnSync(process.execPath,args,{encoding:'utf8',timeout:45000,maxBuffer:4*1024*1024});
  const raw={block,arm,index:samples.length,expectedSource,startedAt,finishedAt:new Date().toISOString(),exitCode:child.status,
    signal:child.signal,error:child.error?.message??null,stdout:child.stdout,stderr:child.stderr};
  appendFileSync(resolve(output,'processes.jsonl'),JSON.stringify(raw)+'\n');
  if(child.status!==0)throw Error('sample failed; raw outcome preserved; no retry');
  const s={...JSON.parse(child.stdout.trim()),block,arm};
  appendFileSync(journal,JSON.stringify(s)+'\n');
  if(caseConfig&&(s.sharedCacheCapacity!==caseConfig.sharedCacheCapacity||s.localCacheCapacity!==caseConfig.localCacheCapacity))throw Error('memory configuration mismatch');
  if(memory&&s.status==='TIMEOUT'){if(!s.cleanup||s.workersExited!==4||s.rootWdl!==null||BigInt(s.bootstrapCycles)+BigInt(s.setupCycles)+BigInt(s.solveCycles)!==BigInt(s.totalProcessCycles))throw Error('invalid timeout cleanup/accounting');console.log(JSON.stringify({block,arm,status:'TIMEOUT'}));continue;}
  validateCycleSample(s,expectedSource.sha,instrumented?'all-worker-node-instrumentation':'production');samples.push(s);
  console.log(JSON.stringify({block,arm,measurement:s.measurement,cycles:s.totalProcessCycles,ms:s.wallMs,nodes:s.totalNodes}));
}
const summary=samples.length===blocks*4?summarizeCycleBlocks(samples,mode):{mode,status:'CENSORED',completedSamples:samples.length,totalSamples:blocks*4,promotion:'NOT_QUALIFIED'};
writeFileSync(resolve(output,'summary.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(summary));
