import {writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {setTimeout as sleep} from 'node:timers/promises';
import {createManagedThreadSession32} from '../vendor/jsminsys/addons/branch-manager-host.mjs';

const STOP=0,DONE=1,ERROR=2,WAKE=3,WINNER=4;
const winnerFile=join(tmpdir(),'jsms-lazy-winner-fixture.mjs');
const errorFile=join(tmpdir(),'jsms-lazy-loser-error-fixture.mjs');
const exitFile=join(tmpdir(),'jsms-lazy-loser-exit-fixture.mjs');

await writeFile(winnerFile,`import {workerData} from 'node:worker_threads';
const c=workerData.control;
Atomics.store(c,${WINNER},0);Atomics.store(c,${DONE},1);Atomics.add(c,${WAKE},1);Atomics.notify(c,${WAKE});
setTimeout(()=>{},500);`);
await writeFile(errorFile,`setTimeout(()=>{throw new Error('injected loser fault after DONE')},20);setTimeout(()=>{},500);`);
await writeFile(exitFile,`setTimeout(()=>process.exit(0),20);setTimeout(()=>{},500);`);

async function scenario(kind,file){
  const control=new Int32Array(new SharedArrayBuffer(5*4));
  control[WINNER]=-1;
  const session=createManagedThreadSession32({control,stopIndex:STOP,doneIndex:DONE,errorIndex:ERROR,wakeIndex:WAKE,
    workerDiedCode:101,deadlineCode:102,cancelledCode:103});
  try{
    session.spawn(pathToFileURL(winnerFile),{control});
    session.spawn(pathToFileURL(file),{control});
    await session.wait({timeoutMs:1000});
    await sleep(80);
    return {kind,beforeClose:session.state(),winner:Atomics.load(control,WINNER),
      done:Atomics.load(control,DONE),error:Atomics.load(control,ERROR)};
  }finally{await session.close();}
}
try{
  const loserError=await scenario('loser-error-after-done',errorFile);
  const loserExit=await scenario('loser-clean-exit-after-done',exitFile);
  console.log(JSON.stringify({event:'lazy-smp-postdone-fault-policy',loserError,loserExit}));
}finally{
  await Promise.allSettled([rm(winnerFile,{force:true}),rm(errorFile,{force:true}),rm(exitFile,{force:true})]);
}
