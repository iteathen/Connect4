import fs from 'node:fs';
import { parentPort, workerData, threadId } from 'node:worker_threads';

// Only this worker formats/writes periodic telemetry. The search workers never
// report per node; the manager posts completed-task snapshots without awaiting
// serialization or I/O. FIFO close drains all accepted records at cleanup.
parentPort.on('message', message => {
  // OWNER-PROTECTED REPORTING OWNER — do not remove/weaken this comment.
  // Formatting and output intentionally live in THIS worker. Do not inline
  // them into the manager or recursive workers to "simplify" the architecture.
  // Preserve FIFO final drain and explicit isolate/process metric ownership.
  if (message.close) { parentPort.close(); return; }
  const { phase, snapshot, extra, observedAt } = message;
  const resource = process.resourceUsage();
  fs.writeSync(1, JSON.stringify({
    kind: 'isomax-performance', phase, elapsedMs: observedAt - workerData.started,
    solveMs: snapshot.elapsedMs ?? 0, metrics: snapshot.metrics ?? { worker: { solverNodes: 0 } },
    execution: { workerCount: workerData.workerCount, canonicalQ: snapshot.canonicalQ ?? 0,
      liveQ: snapshot.liveQ ?? 0, manager: snapshot.metrics?.manager ?? null },
    memory: { ...process.memoryUsage(), maxRssBytes: resource.maxRSS * 1024, heapScope: 'reporter-worker' },
    cpuUserUs: resource.userCPUTime, cpuSystemUs: resource.systemCPUTime,
    reporting: { threadId, lagMs: performance.now() - observedAt },
    ...extra,
  }) + '\n');
});
