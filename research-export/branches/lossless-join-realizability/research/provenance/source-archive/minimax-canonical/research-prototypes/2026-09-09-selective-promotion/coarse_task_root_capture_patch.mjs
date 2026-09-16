import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here=dirname(fileURLToPath(import.meta.url));
const base=resolve(here,'coarse_partition_locality_control_bench.mjs');
const generated=resolve(here,'coarse_task_root_capture.generated.mjs');
let src=readFileSync(base,'utf8');
function once(from,to){
  const at=src.indexOf(from);
  if(at<0||src.indexOf(from,at+1)>=0)throw Error(`expected one patch target: ${from.slice(0,80)}`);
  src=src.slice(0,at)+to+src.slice(at+from.length);
}
once("this.taskEvidence.push({id:m.id,pass:x.pass,sig2:x.sig2,descId:x.descId,offsetEntries:x.offsetEntries,tablePow:x.tablePow,nodes:m.nodes??0,seconds:m.seconds??0,ttHits:m.ttHits??0,crossHits:m.crossHits??0});","this.taskEvidence.push({id:m.id,pass:x.pass,sig2:x.sig2,descId:x.descId,offsetEntries:x.offsetEntries,tablePow:x.tablePow,cLo:x.cLo,cHi:x.cHi,mLo:x.mLo,mHi:x.mHi,moves:x.moves,alpha:x.alpha,beta:x.beta,nodes:m.nodes??0,seconds:m.seconds??0,ttHits:m.ttHits??0,crossHits:m.crossHits??0});");
once("this.waiters.set(id,{resolve,reject,sig2,descId,pass:this.currentPass,offsetEntries,tablePow});","this.waiters.set(id,{resolve,reject,sig2,descId,pass:this.currentPass,offsetEntries,tablePow,cLo,cHi,mLo,mHi,moves:state.moves,alpha,beta});");
writeFileSync(generated,src);
try{
  const r=spawnSync(process.execPath,[generated,...process.argv.slice(2)],{stdio:'inherit'});
  process.exitCode=r.status??1;
}finally{
  try{unlinkSync(generated);}catch{}
}
