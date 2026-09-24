import {workerData} from 'node:worker_threads';
import {
  prepareConnect4RbaGeometry,
  prepareConnect4CpcRbaEvaluator,
  evaluateConnect4CpcRbaTt32,
  publishConnect4CpcRbaEvaluation32,
  prepareRbaBranchWorker32,
  runRbaBranchWorkerLoop32,
  RBA_TT_ROOT,
} from '../../../vendor/jsminsys/addons/index.mjs';

const table=workerData.table;
const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const witness=new Int32Array(workerData.witnessBuffer);
const metrics=new Float64Array(workerData.metricsBuffer);
const resetTargets=new Int32Array(workerData.resetBuffer);
const state=prepareConnect4CpcRbaEvaluator({
  geometry:g,
  cpcFrontierResponse:!!workerData.cpcFrontierResponse,
  cpcProjectedAdvisory:!!workerData.cpcProjectedAdvisory,
});
const worker=prepareRbaBranchWorker32({
  owner:workerData.owner,
  workerCount:workerData.workers,
  readyTarget:workerData.readyTarget??workerData.workers*2,
  state,
  resetTargets,
});
const context={
  rootQ:table.control[RBA_TT_ROOT],
  rootReflected:workerData.rootReflected?1:0,
  witness,
};

let telemetry=0;
const evaluate=(t,q,s,expose,c)=>{
  const code=evaluateConnect4CpcRbaTt32(
    t,q,s,c.rootQ,c.rootReflected,
  );
  telemetry+=1;
  if((telemetry&1023)===0){
    metrics[4]=s.cpcCalls;
    metrics[5]=s.cpcExact;
    metrics[6]=s.cpcBounds;
    metrics[7]=s.cpcRestrictions;
    metrics[8]=s.cpcForced;
    metrics[9]=s.cpcPrecursors;
    metrics[10]=s.transitions;
    metrics[11]=expose;
  }
  return code;
};
const publish=(t,q,owner,s,code,c)=>
  publishConnect4CpcRbaEvaluation32(
    t,q,owner,s,code,c.rootQ,c.witness,0,
  );

runRbaBranchWorkerLoop32(
  table,
  worker,
  evaluate,
  publish,
  {context,waitMs:1,metrics},
);

// Final cold publication if the loop exits naturally before host teardown.
metrics[0]=worker.claims;
metrics[1]=worker.branches;
metrics[2]=worker.evaluations;
metrics[3]=worker.idlePolls;
metrics[4]=state.cpcCalls;
metrics[5]=state.cpcExact;
metrics[6]=state.cpcBounds;
metrics[7]=state.cpcRestrictions;
metrics[8]=state.cpcForced;
metrics[9]=state.cpcPrecursors;
metrics[10]=state.transitions;
metrics[11]=worker.expose;
