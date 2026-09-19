import { parentPort, workerData } from 'node:worker_threads';
import { IsoMaxTaskSolver } from './task.mjs';
if (!parentPort) throw new Error('IsoMax worker requires parentPort');
let solver = new IsoMaxTaskSolver(), poisoned = false;
parentPort.on('message', message => {
  try {
    if (poisoned) throw new Error('IsoMax worker is poisoned');
    if (message?.type !== 'isomax-task') throw new Error('unsupported IsoMax worker message');
    const start = performance.now();
    const result = solver.runTask(message);
    parentPort.postMessage({type:'result',taskId:message.taskId,jobId:message.jobId,...result,
      workerId:workerData.workerId,executionMs:performance.now()-start,
      localClasses:solver.pool.classCount,isolateMemory:process.memoryUsage()});
    // Bound retained per-worker warm state at task boundaries, not recursively.
    if (solver.pool.classCount > 65536 || solver.transitionCache.count > 262144) solver = new IsoMaxTaskSolver();
  } catch (error) {
    poisoned = true;
    parentPort.postMessage({type:'error',taskId:message?.taskId,message:error.message});
  }
});
parentPort.postMessage({type:'ready',workerId:workerData.workerId});
