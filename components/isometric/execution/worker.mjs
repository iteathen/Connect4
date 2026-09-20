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
  // NEES E3 task/result transport; never use this richness as E0/E1 precedent.
  // This handler owns cold setup/result transport. Do not move its object
  // construction, memory sampling or postMessage calls into solveNode.
  // Retire/reset retained state only between tasks, never during recursion.
  try {
    if (poisoned) throw new Error('IsoMax worker is poisoned');
    if (message?.type !== 'isomax-task') throw new Error('unsupported IsoMax worker message');
    const localClassesBefore=solver.pool.classCount,localEntriesBefore=solver.transitionCache.count;
    const start = performance.now();
    const result = solver.runTask(message);
    const executionMs=performance.now()-start;
    const localClasses=solver.pool.classCount,localEntries=solver.transitionCache.count;
    const workerReset=localClasses>retainedClasses||localEntries>retainedEntries;
    parentPort.postMessage({type:'result',taskId:message.taskId,jobId:message.jobId,...result,
      workerId:workerData.workerId,executionMs,
      localClassesBefore,localEntriesBefore,localClasses,localEntries,workerReset,
      isolateMemory:process.memoryUsage()});
    // Bound retained per-worker warm state at task boundaries, not recursively.
    if(workerReset)solver=new IsoMaxTaskSolver();
  } catch (error) {
    poisoned = true;
    parentPort.postMessage({type:'error',taskId:message?.taskId,message:error.message});
  }
});
parentPort.postMessage({type:'ready',workerId:workerData.workerId});
