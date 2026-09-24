import * as jsmin from '../../vendor/jsminsys/addons/index.mjs';
import {performance} from 'node:perf_hooks';
import {
  prepareConnect4RbaGeometry,
  connect4RbaFromMoves,
  createRbaTt32,
  rbaTtIntern32,
  rbaTtSetRoot32,
  rbaTtEnqueue32,
  createManagedThreadSession32,
  spawnManagedFileWorker32,
  waitManagedThreadSession32,
  closeManagedThreadSession32,
  managedThreadSessionState32,
  createMetricViews32,
  sumMetricViews32,
  sharedViewBytes32,
  RBA_TT_STOP,
  RBA_TT_DONE,
  RBA_TT_ERROR,
  RBA_TT_WAKE,
  RBA_TT_READY_COUNT,
  RBA_TT_EVENT_COUNT,
  RBA_TT_LIVE,
} from '../../vendor/jsminsys/addons/index.mjs';

const geometry=prepareConnect4RbaGeometry({columns:7,rows:6});
const MAX_TIMEOUT_MS=120000;
const HOST_WORKER_DIED=101;
const HOST_DEADLINE=102;
const HOST_CANCELLED=103;
const METRIC_WIDTH=12;

export async function solve7x6(moves,{
  workers=1,
  capacity=65536,
  buckets=65536,
  basisElementBits=32,
  timeoutMs=MAX_TIMEOUT_MS,
  signal,
  managerBudget=64,
  readyTarget=workers*2,
  cpcFrontierResponse=false,
  cpcProjectedAdvisory=false,
}={}){
  if(!Number.isInteger(workers)||workers<1||workers>64)
    throw new RangeError('invalid IsoMax worker count');
  if(!Number.isSafeInteger(capacity)||capacity<1||
     !Number.isSafeInteger(buckets)||buckets<1||(buckets&(buckets-1)))
    throw new RangeError('invalid IsoMax shared TT capacity');
  if(basisElementBits!==16&&basisElementBits!==32)
    throw new RangeError('invalid IsoMax basis element width');
  if(!Number.isFinite(timeoutMs)||timeoutMs<=0||timeoutMs>MAX_TIMEOUT_MS)
    throw new RangeError('invalid IsoMax timeout');
  if(!Number.isInteger(managerBudget)||managerBudget<1||
     !Number.isInteger(readyTarget)||readyTarget<0)
    throw new RangeError('invalid IsoMax scheduling configuration');

  const root=connect4RbaFromMoves(moves,{geometry});
  const table=createRbaTt32({
    capacity,
    bucketCount:buckets,
    keyWords:geometry.keyWords,
    basisCapacity:geometry.maxBasis,
    basisElementBits,
    edgeCapacity:geometry.columns,
  });
  const rootQ=rbaTtIntern32(
    table,root.words,0,root.basis,0,root.basis.length,
  );
  if(rootQ<0)throw new Error('failed to intern IsoMax root');
  if(jsmin.rbaTtSetPositionCode32&&((root.positionLo|root.positionHi)!==0))
    jsmin.rbaTtSetPositionCode32(table,rootQ,root.positionLo,root.positionHi);
  rbaTtSetRoot32(table,rootQ);
  rbaTtEnqueue32(table,rootQ);

  const witness=new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
  witness[0]=-2;
  const resetTargets=new Int32Array(new SharedArrayBuffer(workers*Int32Array.BYTES_PER_ELEMENT));
  resetTargets.fill(-2);
  const metricViews=createMetricViews32(workers,METRIC_WIDTH);
  const metricOut=new Float64Array(METRIC_WIDTH);
  const session=createManagedThreadSession32({
    control:table.control,
    stopIndex:RBA_TT_STOP,
    doneIndex:RBA_TT_DONE,
    errorIndex:RBA_TT_ERROR,
    wakeIndex:RBA_TT_WAKE,
    workerDiedCode:HOST_WORKER_DIED,
    deadlineCode:HOST_DEADLINE,
    cancelledCode:HOST_CANCELLED,
  });

  const started=performance.now();
  try{
    spawnManagedFileWorker32(
      session,
      new URL('./jsminsys/manager-worker.mjs',import.meta.url),
      {
        table,
        witnessBuffer:witness.buffer,
        resetBuffer:resetTargets.buffer,
        rootReflected:root.reflected,
        budget:managerBudget,
      },
    );

    for(let i=0;i<workers;i+=1){
      spawnManagedFileWorker32(
        session,
        new URL('./jsminsys/worker.mjs',import.meta.url),
        {
          table,
          witnessBuffer:witness.buffer,
          resetBuffer:resetTargets.buffer,
          metricsBuffer:metricViews[i].buffer,
          owner:i+2,
          workers,
          readyTarget,
          rootReflected:root.reflected,
          cpcFrontierResponse,
          cpcProjectedAdvisory,
        },
      );
    }

    await waitManagedThreadSession32(session,{timeoutMs,signal});
  }finally{
    await closeManagedThreadSession32(session);
  }

  const elapsedMs=performance.now()-started;
  const host=managedThreadSessionState32(session);
  sumMetricViews32(metricViews,METRIC_WIDTH,metricOut);
  const errorCode=host.errorCode;
  const exact=!errorCode&&Atomics.load(table.control,RBA_TT_DONE)===1;
  const move=exact?witness[0]:-1;

  return {
    status:exact?'EXACT':
      errorCode===HOST_DEADLINE?'TIMEOUT':
      errorCode===HOST_CANCELLED?'INTERRUPTED':'FAILED',
    rootWdl:exact?table.exact[rootQ]-2:null,
    move,
    errorCode,
    errors:host.errors,
    fault:Array.from(table.fault),
    metrics:{
      claims:metricOut[0],
      branches:metricOut[1],
      evaluations:metricOut[2],
      idlePolls:metricOut[3],
      cpcCalls:metricOut[4],
      cpcExact:metricOut[5],
      cpcBounds:metricOut[6],
      cpcRestrictions:metricOut[7],
      cpcForced:metricOut[8],
      cpcPrecursors:metricOut[9],
      transitions:metricOut[10],
      readyExposure:metricOut[11],
      ttLive:table.control[RBA_TT_LIVE],
      readyCount:table.control[RBA_TT_READY_COUNT],
      eventCount:table.control[RBA_TT_EVENT_COUNT],
      exactPositionMerges:jsmin.RBA_TT_EXACT_POSITION_MERGES===undefined?
        0:table.control[jsmin.RBA_TT_EXACT_POSITION_MERGES],
    },
    reflected:root.reflected,
    elapsedMs,
    cleanup:host.cleanup,
    workersExited:host.workersExited,
    sharedBytes:sharedViewBytes32(table)+
      witness.byteLength+
      resetTargets.byteLength+
      metricViews.reduce((n,v)=>n+v.byteLength,0),
    requestedWorkers:workers,
    workersUsed:workers,
    basisElementBits,
  };
}
