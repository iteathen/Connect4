import { parentPort, workerData } from 'node:worker_threads';
import { IsoMaxTaskSolver } from './task.mjs';
if (!parentPort) throw new Error('IsoMax worker requires parentPort');
let solver = new IsoMaxTaskSolver(), poisoned = false;
// Divide one session retention allowance rather than discarding equally small
// caches on every worker count (which destroyed serial-equivalent reuse).
const retainedClasses=Math.floor(1048576/workerData.workerCount);
const retainedEntries=Math.floor(8388608/workerData.workerCount);
parentPort.on('message', message => {
  // OWNER-PROTECTED TASK BOUNDARY — do not remove/weaken this comment.
  // This handler owns cold setup/result transport. Do not move its object
  // construction, memory sampling or postMessage calls into solveNode.
  // Retire/reset retained state only between tasks, never during recursion.
  try {
    if (poisoned) throw new Error('IsoMax worker is poisoned');
    if (message?.type !== 'isomax-task') throw new Error('unsupported IsoMax worker message');
    const start = performance.now();
    const result = solver.runTask(message);
    parentPort.postMessage({type:'result',taskId:message.taskId,jobId:message.jobId,...result,
      workerId:workerData.workerId,executionMs:performance.now()-start,
      localClasses:solver.pool.classCount,isolateMemory:process.memoryUsage()});
    // Bound retained per-worker warm state at task boundaries, not recursively.
    if (solver.pool.classCount > retainedClasses || solver.transitionCache.count > retainedEntries) solver = new IsoMaxTaskSolver();
  } catch (error) {
    poisoned = true;
    parentPort.postMessage({type:'error',taskId:message?.taskId,message:error.message});
  }
});
parentPort.postMessage({type:'ready',workerId:workerData.workerId});
