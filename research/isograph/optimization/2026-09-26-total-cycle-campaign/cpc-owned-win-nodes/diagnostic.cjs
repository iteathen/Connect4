const fs=require('fs'),cp=require('child_process'),url=require('url');
const output='C:/r/isomax-isograph-019/research/isograph/optimization/2026-09-26-total-cycle-campaign/cpc-owned-win-nodes';
fs.mkdirSync(output);
const script=fs.readFileSync(0,'utf8');
const root=process.cwd(),hook=url.pathToFileURL(root+'/tools/isomax-node-counts.mjs').href;
const libs={A:'C:/r/jsminsys-no-draw-control',B:'C:/r/jsminsys-c1'};
const git=(...a)=>cp.execFileSync('git',a,{encoding:'utf8'}).trim();
const manifest={type:'diagnostic-only-ABBA',applicationSha:git('rev-parse','HEAD'),sequence:'ABBA',node:process.version,arms:{}};
for(const arm of ['A','B']){const path=libs[arm];manifest.arms[arm]={path,sha:git('-C',path,'rev-parse','HEAD'),dirty:!!git('-C',path,'status','--porcelain')};if(manifest.arms[arm].dirty)throw Error('dirty');}
fs.writeFileSync(output+'/manifest.json',JSON.stringify(manifest,null,2));
(async()=>{const {validateCycleSample}=await import(url.pathToFileURL(root+'/tools/isomax-cycle-analysis.mjs').href);
for(const arm of ['A','B','B','A']){
const args=['--experimental-ffi','--import',hook,root+'/tools/isomax-cycle-sample.mjs',libs[arm],'45461667'];
const startedAt=new Date().toISOString(),r=cp.spawnSync(process.execPath,args,{encoding:'utf8',timeout:45000});
fs.appendFileSync(output+'/processes.jsonl',JSON.stringify({arm,args,startedAt,finishedAt:new Date().toISOString(),status:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message})+'\n');
if(r.status!==0)throw Error('failed diagnostic; no retry');const s={...JSON.parse(r.stdout.trim()),arm};
fs.appendFileSync(output+'/samples.jsonl',JSON.stringify(s)+'\n');validateCycleSample(s,manifest.arms[arm].sha,'all-worker-node-instrumentation');
console.log(JSON.stringify({arm,nodes:s.totalNodes,cycles:s.totalProcessCycles,cyclesPerVisit:s.cyclesPerVisit,wallMs:s.wallMs}));
}})();