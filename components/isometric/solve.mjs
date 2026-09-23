import {performance} from 'node:perf_hooks';
import {
  createManagedThreadSession32,
  spawnManagedFileWorker32,
  waitManagedThreadSession32,
  closeManagedThreadSession32,
  managedThreadSessionState32,
} from '../../vendor/jsminsys/addons/branch-manager-host.mjs';

const STOP=0,DONE=1,ERROR=2,WAKE=3;
const WORKER_DIED=1,DEADLINE=2,CANCELLED=3;
const MAX_TIMEOUT_MS=120000;

export async function solve7x6(moves,{
  workers=1,
  timeoutMs=MAX_TIMEOUT_MS,
  signal,
  cacheCapacity=65536,
  cpcFrontierResponse=false,
  cpcProjectedAdvisory=false,
}={}){
  if(workers!==1)throw new RangeError('JSMinSys IsoMax currently requires workers=1');
  if(!Number.isFinite(timeoutMs)||timeoutMs<=0||timeoutMs>MAX_TIMEOUT_MS)
    throw new RangeError('invalid IsoMax timeout');

  const control=new Int32Array(new SharedArrayBuffer(4*Int32Array.BYTES_PER_ELEMENT));
  const session=createManagedThreadSession32({
    control,
    stopIndex:STOP,
    doneIndex:DONE,
    errorIndex:ERROR,
    wakeIndex:WAKE,
    workerDiedCode:WORKER_DIED,
    deadlineCode:DEADLINE,
    cancelledCode:CANCELLED,
  });
  const started=performance.now();
  let result=null;

  try{
    const worker=spawnManagedFileWorker32(
      session,
      new URL('./jsminsys/worker.mjs',import.meta.url),
      {
        controlBuffer:control.buffer,
        doneIndex:DONE,
        wakeIndex:WAKE,
        moves:Array.from(moves),
        options:{cacheCapacity,cpcFrontierResponse,cpcProjectedAdvisory},
      },
    );
    const message=new Promise(resolve=>worker.once('message',resolve));
    const errorCode=await waitManagedThreadSession32(session,{timeoutMs,signal});
    if(errorCode===0&&Atomics.load(control,DONE))result=await message;
  }finally{
    await closeManagedThreadSession32(session);
  }

  const elapsedMs=performance.now()-started,state=managedThreadSessionState32(session);
  if(result){
    return {
      ...result,
      errorCode:0,
      errors:state.errors,
      elapsedMs,
      cleanup:state.cleanup,
      workersExited:state.workersExited,
      sharedBytes:control.byteLength,
      requestedWorkers:workers,
      workersUsed:1,
    };
  }

  const errorCode=state.errorCode;
  return {
    status:errorCode===DEADLINE?'TIMEOUT':errorCode===CANCELLED?'INTERRUPTED':'FAILED',
    rootWdl:null,
    move:-1,
    errorCode,
    errors:state.errors,
    metrics:null,
    elapsedMs,
    cleanup:state.cleanup,
    workersExited:state.workersExited,
    sharedBytes:control.byteLength,
    requestedWorkers:workers,
    workersUsed:1,
  };
}
