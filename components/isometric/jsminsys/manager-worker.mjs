import {workerData} from 'node:worker_threads';
import {
  prepareConnect4RbaGeometry,
  reconcileConnect4RbaEvent32,
  runRbaBranchManagerLoop32,
} from '../../../vendor/jsminsys/addons/index.mjs';

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const witness=new Int32Array(workerData.witnessBuffer);
const context={
  g,
  rootReflected:workerData.rootReflected?1:0,
  witness,
};

const reconcile=(table,q,c)=>
  reconcileConnect4RbaEvent32(
    table,q,c.g,c.rootReflected,c.witness,0,
  );

runRbaBranchManagerLoop32(
  workerData.table,
  reconcile,
  {
    owner:1,
    budget:workerData.budget??64,
    context,
    waitMs:1,
  },
);
