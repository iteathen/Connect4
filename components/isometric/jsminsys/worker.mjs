import {parentPort,workerData} from 'node:worker_threads';
import {solveIsoMax7x6Exact} from './solver.mjs';

const {
  controlBuffer,
  doneIndex,
  wakeIndex,
  moves,
  options,
}=workerData;
const control=new Int32Array(controlBuffer);

const result=solveIsoMax7x6Exact(moves,options);
parentPort.postMessage(result);
Atomics.store(control,doneIndex,1);
Atomics.add(control,wakeIndex,1);
Atomics.notify(control,wakeIndex);
