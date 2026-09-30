import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {atomicWrite,isHeapLimitFailure,canAdvanceFresh} from './fresh-io.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),[phase,label,commit]=process.argv.slice(2),w=JSON.parse(fs.readFileSync(path.join(here,'FRESH_OOO_WARRANT.json')));
assert.ok(['prepare','replay'].includes(phase));assert.ok(w.candidateOrder.includes(label));
const dir=path.join(here,'fresh-'+label);fs.mkdirSync(dir,{recursive:true});
assert.ok(!fs.existsSync(path.join(dir,'fresh-replay-result.json')),'Scientific result already recorded: no repeated prepare or replay');
const ledger=path.join(dir,'fresh-resource-ledger.json'),used=fs.existsSync(ledger)?JSON.parse(fs.readFileSync(ledger)).elapsedMs:0;
const campaignUsed=w.candidateOrder.reduce((n,l)=>{const f=path.join(here,'fresh-'+l,'fresh-resource-ledger.json');return n+(fs.existsSync(f)?JSON.parse(fs.readFileSync(f)).elapsedMs:0);},0);
assert.ok(used<w.caps.wallMsPerCandidate&&campaignUsed<w.caps.campaignWallMs,'RESOURCE_CENSORED: time already exhausted');
if(label===w.candidateOrder[1]){
  const prior=path.join(here,'fresh-'+w.candidateOrder[0]);const r=path.join(prior,'fresh-replay-result.json'),m=path.join(prior,'fresh-structure-manifest.json'),l=path.join(prior,'fresh-resource-ledger.json');
  const canAdvance=canAdvanceFresh({resultStatus:fs.existsSync(r)?JSON.parse(fs.readFileSync(r)).status:undefined,
    structureStatus:fs.existsSync(m)?JSON.parse(fs.readFileSync(m)).status:undefined,
    resourceStatus:fs.existsSync(l)?JSON.parse(fs.readFileSync(l)).status:undefined});
  assert.ok(canAdvance,'Candidate order: backup requires documented prior vacuity/resource censoring');
}
const child=spawn(process.execPath,['--max-old-space-size='+w.caps.v8HeapMiB,path.join(here,'fresh-worker.mjs'),phase,label,...(commit?[commit]:[])],{stdio:['ignore','inherit','pipe'],env:{...process.env,FRESH_SUPERVISED:'1'},windowsHide:true});
let stderrTail='';child.stderr.on('data',chunk=>{process.stderr.write(chunk);stderrTail=(stderrTail+chunk.toString()).slice(-16384);});
const began=Date.now(),timeout=Math.min(w.caps.wallMsPerCandidate-used,w.caps.campaignWallMs-campaignUsed);
let timedOut=false;
const timer=setTimeout(()=>{timedOut=true;child.kill();atomicWrite(path.join(dir,'fresh-supervisor-stop.json'),JSON.stringify({status:'RESOURCE_CENSORED',reason:'wall cap',elapsedMs:used+Date.now()-began})+'\n');},timeout);
child.on('error',error=>{clearTimeout(timer);atomicWrite(path.join(dir,'fresh-supervisor-exit.json'),JSON.stringify({status:'FAILED_TO_START',error:error.message,elapsedMs:used+Date.now()-began})+'\n');process.exitCode=1;});
child.on('close',(code,signal)=>{
  clearTimeout(timer);const elapsedMs=used+Date.now()-began;
  const old=fs.existsSync(ledger)?JSON.parse(fs.readFileSync(ledger)):{};
  const heapLimit=isHeapLimitFailure(code,stderrTail),resource=timedOut||heapLimit||old.status==='RESOURCE_CENSORED';
  atomicWrite(ledger,JSON.stringify({...old,label,phase,elapsedMs,...(timedOut?{status:'RESOURCE_CENSORED',reason:'supervisor wall cap'}:heapLimit?{status:'RESOURCE_CENSORED',reason:'declared V8 heap cap'}:code!==0&&old.status!=='RESOURCE_CENSORED'?{status:'FAILED',reason:'nonresource child failure'}:{})})+'\n');
  if(code!==0)atomicWrite(path.join(dir,'fresh-supervisor-exit.json'),JSON.stringify({status:resource?'RESOURCE_CENSORED':'INCOMPLETE',code,signal,elapsedMs,stderrTail})+'\n');
  process.exitCode=code??1;
});
