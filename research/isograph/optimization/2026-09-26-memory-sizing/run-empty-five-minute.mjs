// Exactly two owner-authorized diagnostic runs, sequential; no retries.
import {mkdirSync,writeFileSync,readFileSync,openSync,closeSync,appendFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync,execFileSync} from 'node:child_process';
import {freemem,cpus} from 'node:os';
import {createHash} from 'node:crypto';
const [harness,library,output]=process.argv.slice(2);
const git=(p,...a)=>execFileSync('git',['-C',p,...a],{encoding:'utf8'}).trim();
const snap=p=>({sha:git(p,'rev-parse','HEAD'),dirty:git(p,'status','--porcelain')});
const libraryState=snap(library),harnessState=snap(harness);
if(libraryState.dirty||harnessState.dirty)throw Error('dirty source');
const sample=resolve(harness,'tools/isomax-cycle-sample.mjs'),hook=resolve(harness,'tools/isomax-node-counts.mjs');
const arms=[{id:'baseline',capacity:65536},{id:'large',capacity:1048576}];
mkdirSync(output);
writeFileSync(resolve(output,'manifest.json'),JSON.stringify({library:libraryState,harness:harnessState,arms,workers:4,input:'',timeoutMs:300000,mask:7,instrumented:true,sourceHashes:Object.fromEntries([sample,hook].map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')])),cpu:cpus()[0].model,node:process.version,started:new Date().toISOString()},null,2)+'\n');
for(const arm of arms){
 if(freemem()<4*1024**3)throw Error('RAM admission failed');
 const current=snap(library);if(current.sha!==libraryState.sha||current.dirty)throw Error('source changed');
 const config={sharedCacheCapacity:arm.capacity,localCacheCapacity:arm.capacity,timeoutMs:300000,expectedWdl:1,progress:true};
 const args=['--experimental-ffi','--import',pathToFileURL(hook).href,sample,library,'',JSON.stringify(config)];
 const outPath=resolve(output,arm.id+'.stdout'),errPath=resolve(output,arm.id+'.stderr');
 const out=openSync(outPath,'wx'),err=openSync(errPath,'wx');
 appendFileSync(resolve(output,'events.jsonl'),JSON.stringify({event:'start',arm:arm.id,time:new Date().toISOString(),args,freeRam:freemem()})+'\n');console.log('START '+arm.id);
 let child;try{child=spawnSync(process.execPath,args,{cwd:harness,stdio:['ignore',out,err],timeout:315000});}finally{closeSync(out);closeSync(err);}
 appendFileSync(resolve(output,'events.jsonl'),JSON.stringify({event:'end',arm:arm.id,time:new Date().toISOString(),exit:child.status,error:child.error?.message})+'\n');
 if(child.status!==0)throw Error('child failed; evidence preserved, no retry');
 const s=JSON.parse(readFileSync(outPath,'utf8').trim());
 if(s.librarySha!==libraryState.sha||s.libraryDirty||!s.cleanup||s.workersExited!==4||s.errors.length||!['EXACT','TIMEOUT'].includes(s.status))throw Error('invalid outcome');
 if(s.status==='EXACT'&&s.rootWdl!==1)throw Error('oracle mismatch');
 if(s.status==='TIMEOUT'&&s.rootWdl!==null)throw Error('fabricated timeout value');
 if(s.sharedCacheCapacity!==arm.capacity||s.localCacheCapacity!==arm.capacity||s.timeoutMs!==300000)throw Error('config mismatch');
 if(s.benchmarkNodeCounts.length!==4||s.benchmarkNodeCounts.some(n=>!Number.isSafeInteger(n)||n<0)||s.benchmarkNodeCounts.reduce((a,b)=>a+b,0)!==s.totalNodes)throw Error('node accounting mismatch');
 if(BigInt(s.bootstrapCycles)+BigInt(s.setupCycles)+BigInt(s.solveCycles)!==BigInt(s.totalProcessCycles))throw Error('cycle partition mismatch');
 writeFileSync(resolve(output,arm.id+'.json'),JSON.stringify(s,null,2)+'\n');console.log(JSON.stringify({arm:arm.id,status:s.status,nodes:s.totalNodes,cycles:s.totalProcessCycles,cyclesPerVisit:s.cyclesPerVisit,wallMs:s.wallMs}));
}
