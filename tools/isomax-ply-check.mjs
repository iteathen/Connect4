// Bounded instrument OFF/ON qualification: two ABBA blocks, then a 5s timeout.
// Retain complete raw output and whole-process cycles, including the reporter.
import {spawnSync,execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {validateCycleSample,summarizeCycleBlocks} from './isomax-cycle-analysis.mjs';
const repo=fileURLToPath(new URL('../',import.meta.url)),library=resolve(process.argv[2]),output=resolve(process.argv[3]);
mkdirSync(output,{recursive:false});
const sha=dir=>execFileSync('git',['-C',dir,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  sources=['isomax-cycle-sample.mjs','isomax-cycle-analysis.mjs','isomax-node-counts.mjs','isomax-ply-reporter.mjs','isomax-ply-check.mjs'];
writeFileSync(resolve(output,'manifest.json'),JSON.stringify({harnessSha:sha(repo),librarySha:sha(library),
  node:process.version,started:new Date().toISOString(),
  sourceHashes:Object.fromEntries(sources.map(f=>[f,createHash('sha256').update(readFileSync(resolve(repo,'tools',f))).digest('hex')]))},null,2)+'\n');
function run(name,input,recordPly,timeoutMs,expectedMove){
  const config={sharedCacheCapacity:65536,localCacheCapacity:65536,timeoutMs,expectedWdl:1,
    ...(expectedMove===undefined?{}:{expectedMove}),recordPly,progress:true,plyReportMs:1000};
  const args=['--experimental-ffi','--import',pathToFileURL(resolve(repo,'tools/isomax-node-counts.mjs')).href,
    resolve(repo,'tools/isomax-cycle-sample.mjs'),library,input,JSON.stringify(config)],
    result=spawnSync(process.execPath,args,{cwd:repo,encoding:'utf8',timeout:timeoutMs+15000,maxBuffer:4*1024*1024});
  writeFileSync(resolve(output,`${name}.stdout`),result.stdout??'');
  writeFileSync(resolve(output,`${name}.stderr`),result.stderr??'');
  if(result.status!==0)throw Error(`${name} failed: ${result.error??result.stderr}`);
  const sample=JSON.parse(result.stdout.trim());
  if(recordPly&&(!sample.plyTelemetry?.cleanup||sample.plyTelemetry.invalidSamples||!sample.plyTelemetry.workerSamples))
    throw Error(`${name}: missing/invalid ply telemetry`);
  console.log(JSON.stringify({name,outcome:sample.outcome,totalProcessCycles:sample.totalProcessCycles,
    cyclesPerVisit:sample.cyclesPerVisit,wallMs:sample.wallMs}));
  return sample;
}
const samples=[];
for(let block=0;block<2;block++)for(const [index,arm] of ['A','B','B','A'].entries()){
  const sample=run(`block-${block}-${index}-${arm}`,'45461667',arm==='B',30000,3);
  validateCycleSample(sample,sha(library),arm==='B'?'all-worker-node-and-ply-instrumentation':'all-worker-node-instrumentation');
  samples.push({...sample,block,arm});
}
const timeout=run('timeout-empty','',true,5000);
if(timeout.status!=='TIMEOUT'||timeout.rootWdl!==null||!timeout.cleanup||timeout.workersExited!==4||timeout.errors.length)
  throw Error('empty-board timeout/cleanup contract failed');
if(BigInt(timeout.bootstrapCycles)+BigInt(timeout.setupCycles)+BigInt(timeout.solveCycles)!==BigInt(timeout.totalProcessCycles))
  throw Error('timeout cycle partition does not close');
writeFileSync(resolve(output,'summary.json'),JSON.stringify({
  comparison:summarizeCycleBlocks(samples,'ply-observer-overhead'),
  scope:'Short diagnostic screen only; not proof of <1% overhead or full solver qualification.',
  timeout:{status:timeout.status,cleanup:timeout.cleanup,workersExited:timeout.workersExited,
    totalNodes:timeout.totalNodes,plyTelemetry:timeout.plyTelemetry}},null,2)+'\n');
