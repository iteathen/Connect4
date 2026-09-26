import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
const [baseline,candidate,counter,prefix='confirm']=process.argv.slice(2);
// Predeclared order, six fresh-process samples per variant and per root.
// The 5s cap belongs to each quick sample, never extended after a timeout.
for(const input of ['45461667','13333111271421','13333111444444']){
  for(let block=0;block<3;block++)for(const [i,variant] of ['a','b','b','a'].entries()){
    const out=`${prefix}-${input}-${block}-${i}-${variant}.json`;
    if(fs.existsSync(out))throw Error('refuse existing evidence '+out);
    execFileSync(process.execPath,['--experimental-ffi','run-sample.mjs',variant==='a'?baseline:candidate,counter,out,input],{stdio:'pipe',timeout:15000});
    const r=JSON.parse(fs.readFileSync(out));
    console.log(JSON.stringify({out,ms:r.wallMs,cycles:r.cycles,wdl:r.result.rootWdl,move:r.result.move}));
  }
}
