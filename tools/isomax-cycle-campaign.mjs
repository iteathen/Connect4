// COLD sequential campaign. Run one sample at a time; append outcomes before analysis.
import {mkdirSync,writeFileSync,appendFileSync,readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {validateCycleSample,summarizeCycleBlocks} from './isomax-cycle-analysis.mjs';

const [mode,outputArg,baselineArg,candidateArg,blocksArg='4']=process.argv.slice(2);
if(!['noise','instrumentation','candidate'].includes(mode)||!outputArg||!baselineArg)
  throw Error('usage: node tools/isomax-cycle-campaign.mjs noise|instrumentation|candidate OUTPUT BASELINE [CANDIDATE] [BLOCKS=4]');
const output=resolve(outputArg),baseline=resolve(baselineArg),candidate=resolve(candidateArg??baselineArg),blocks=Number(blocksArg);
if(!Number.isInteger(blocks)||blocks<2||blocks>16)throw Error('blocks must be 2..16');
if(mode!=='candidate'&&baseline!==candidate)throw Error('calibration requires identical library paths');
const here=dirname(fileURLToPath(import.meta.url)),sample=resolve(here,'isomax-cycle-sample.mjs'),
  hook=resolve(here,'isomax-node-counts.mjs'),journal=resolve(output,'samples.jsonl'),samples=[];
// Fails if OUTPUT already exists; no prior evidence can be overwritten.
mkdirSync(output);
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
writeFileSync(resolve(output,'manifest.json'),JSON.stringify({mode,blocks,baseline,candidate,
  applicationSha:git('rev-parse','HEAD'),started:new Date().toISOString(),
  sampleSha256:hash(sample),hookSha256:hash(hook),analysisSha256:hash(resolve(here,'isomax-cycle-analysis.mjs')),
  boundary:'Process creation through joined native solve. Setup+bootstrap+solve cycles close exactly. Excludes subsequent report output and parent harness.',
  sequence:'ABBA',input:'45461667',workers:4},null,2)+'\n',{flag:'wx'});
for(let block=0;block<blocks;block++)for(const arm of ['A','B','B','A']){
  const instrumented=mode==='instrumentation'&&arm==='B';
  const startedAt=new Date().toISOString();
  const args=['--experimental-ffi',...(instrumented?['--import',pathToFileURL(hook).href]:[]),sample,
    arm==='B'?candidate:baseline,'45461667'];
  const child=spawnSync(process.execPath,args,{encoding:'utf8',timeout:45000,maxBuffer:4*1024*1024});
  const raw={block,arm,index:samples.length,startedAt,finishedAt:new Date().toISOString(),exitCode:child.status,
    signal:child.signal,error:child.error?.message??null,stdout:child.stdout,stderr:child.stderr};
  appendFileSync(resolve(output,'processes.jsonl'),JSON.stringify(raw)+'\n');
  if(child.status!==0)throw Error('sample failed; raw outcome preserved; no retry');
  const s={...JSON.parse(child.stdout.trim()),block,arm};
  appendFileSync(journal,JSON.stringify(s)+'\n');
  validateCycleSample(s);samples.push(s);
  console.log(JSON.stringify({block,arm,measurement:s.measurement,cycles:s.totalProcessCycles,ms:s.wallMs,nodes:s.totalNodes}));
}
const summary=summarizeCycleBlocks(samples,mode);
writeFileSync(resolve(output,'summary.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(summary));
