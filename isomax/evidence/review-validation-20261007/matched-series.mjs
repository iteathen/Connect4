import {spawnSync,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {freemem,totalmem} from 'node:os';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const here=fileURLToPath(new URL('./',import.meta.url)),repo=resolve(here,'../../..');
const node=process.argv[2],control=process.argv[3];
if(!node||!control)throw Error('Usage: node matched-series.mjs NODE CONTROL_CHECKOUT');
const sha256=x=>createHash('sha256').update(x).digest('hex');
const controlSha=execFileSync('git',['rev-parse','HEAD'],{cwd:control,encoding:'utf8'}).trim();
if(controlSha!=='679239578f853d0a7a2f1bcd70c860926a8ddc14')throw Error('Control source identity mismatch');
if(execFileSync('git',['diff','--name-only','HEAD'],{cwd:control,encoding:'utf8'}).trim())throw Error('Modified control source');
const candidate=resolve(repo,'isomax/runtime'),candidateSha='8b81911bb19f58665f5a5bbb4811a05fc0fd9fba';
const runtimeHash=sha256(readFileSync(node));
if(runtimeHash!=='2f2843c1802f6a17ba7fabe5550c90bb055c9bef8738a08338d94f71dbe91f29')throw Error('Historical runtime identity mismatch');
const firstPair=Number(process.argv[4]??1),lastPair=Number(process.argv[5]??5);
if(!Number.isInteger(firstPair)||!Number.isInteger(lastPair)||firstPair<1||lastPair<firstPair)throw Error('Invalid pair range');
const rows=firstPair===1?[]:JSON.parse(readFileSync(resolve(here,'matched','progress.json'),'utf8'));
for(let pair=firstPair;pair<=lastPair;pair++)for(const arm of ['control','candidate']){
 const id=arm+'-'+String(pair).padStart(2,'0'),dir=resolve(here,'matched',id);mkdirSync(dir,{recursive:true});
 if(freemem()<16.5*2**30)throw Error('Insufficient unchanged memory headroom before '+id);
 const source=arm==='control'?control:candidate,sourceCommit=arm==='control'?controlSha:candidateSha;
 const flags=['--experimental-ffi','--max-inlined-bytecode-size=2400','--max-inlined-bytecode-size-cumulative=9600',
 '--import',new URL('../../../isomax/runtime/tools/benchmark-v8-startup-preload.mjs',import.meta.url).href];
 const args=[...flags,resolve(here,'matched-child.mjs'),source,sourceCommit];
 const invocation={id,sourceCommit,runtimeSha256:runtimeHash,command:'NODE '+flags.slice(0,3).join(' ')+' --import PACKAGE/runtime/tools/benchmark-v8-startup-preload.mjs matched-child.mjs SOURCE '+sourceCommit,
 totalMemoryBytes:totalmem(),availableMemoryBytes:freemem(),backgroundLoad:'Held in the selected benchmark state throughout both arms; unrelated applications are not recorded.',
 coldStart:'fresh process; fresh shared and private TTs; no persisted data',timingBoundary:'primary READY -> actual empty root -> EXACT; full process captured separately',startedUtc:new Date().toISOString()};
 writeFileSync(resolve(dir,'invocation.json'),JSON.stringify(invocation,null,2)+'\n');
 const env={...process.env};delete env.JMS_WORKER_AFFINITY_FILE;delete env.JMS_WORKER_AFFINITY_REPORT;
 const start=performance.now(),r=spawnSync(node,args,{cwd:repo,env,encoding:'utf8',timeout:360000,maxBuffer:16*1024*1024}),wall=performance.now()-start;
 writeFileSync(resolve(dir,'stdout.json'),r.stdout??'');
 writeFileSync(resolve(dir,'stderr.txt'),(r.stderr??'').replaceAll(repo,'REPOSITORY').replace(/C:[\\/]Users[\\/][^\\/\s]+/gi,'USER_HOME'));
 if(r.error||r.status!==0)throw Error(id+' failed; raw evidence retained');
 const out=JSON.parse(r.stdout),valid=out.result.status==='EXACT'&&out.result.rootWdl===1&&out.result.cleanup===true&&out.result.workersExited===6;
 if(!valid)throw Error(id+' failed post-run validation');
 const summary={id,arm,sourceCommit,primaryMs:out.primaryWallMs,operationMs:out.operationWallMs,externalWallMs:wall,
 cpuMs:out.cpuMs,peakRssBytes:out.peakRssBytes,rootWdl:out.result.rootWdl,move:out.result.move,workersExited:out.result.workersExited,cleanup:out.result.cleanup,validatedAfterReturn:true};
 rows.push(summary);writeFileSync(resolve(dir,'summary.json'),JSON.stringify(summary,null,2)+'\n');
 console.log(JSON.stringify(summary));
 writeFileSync(resolve(here,'matched','progress.json'),JSON.stringify(rows,null,2)+'\n');
}
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
const exclusions=firstPair>1?[{ids:['control-01','candidate-01'],reason:'A qualification-only CPU process overlapped both solves. Excluded on observed workload contamination, not timing or returned value.'}]:[];
const accepted=rows.filter(r=>!exclusions.some(e=>e.ids.includes(r.id)));
const describe=arm=>{const r=accepted.filter(x=>x.arm===arm),times=r.map(x=>x.primaryMs),m=mean(times);return{samples:r.length,meanPrimaryMs:m,minPrimaryMs:Math.min(...times),maxPrimaryMs:Math.max(...times),sampleSdMs:Math.sqrt(times.reduce((s,x)=>s+(x-m)**2,0)/(times.length-1)),meanCpuMs:mean(r.map(x=>x.cpuMs)),meanOperationMs:mean(r.map(x=>x.operationMs)),meanExternalWallMs:mean(r.map(x=>x.externalWallMs))};};
const a=describe('control'),b=describe('candidate'),pairs=Array.from({length:accepted.length/2},(_,i)=>accepted[i*2].primaryMs-accepted[i*2+1].primaryMs);
writeFileSync(resolve(here,'matched','summary.json'),JSON.stringify({order:'A B repeated; first five pairs declared before replay, sixth replaces contaminated first pair',exclusions,control:a,candidate:b,observedPercentReduction:100*(a.meanPrimaryMs-b.meanPrimaryMs)/a.meanPrimaryMs,pairedSavingsMs:pairs,
 interpretation:'Local matched observation only; fixed order may retain drift/order effects. No attribution to individual edits or portable speed guarantee.',rows},null,2)+'\n');
