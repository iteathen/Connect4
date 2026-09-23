import {workerData} from 'node:worker_threads';
import {
  prepareConnect4RbaGeometry,
  reconcileConnect4CpcRbaEvent32,
  prepareRbaBranchManager32,
  runRbaBranchManagerLoop32,
} from '../../../vendor/jsminsys/addons/index.mjs';

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const witness=new Int32Array(workerData.witnessBuffer);
const resetTargets=new Int32Array(workerData.resetBuffer);
const manager=prepareRbaBranchManager32({capacity:workerData.table.capacity,resetTargets});
const context={
  g,
  rootReflected:workerData.rootReflected?1:0,
  witness,
  resetTargets,
};

const reconcile=(table,q,c)=>
  reconcileConnect4CpcRbaEvent32(
    table,q,c.g,c.rootReflected,c.witness,c.resetTargets,0,
  );

runRbaBranchManagerLoop32(
  workerData.table,
  reconcile,
  {
    owner:1,
    budget:workerData.budget??64,
    context,
    manager,
    waitMs:1,
  },
);
