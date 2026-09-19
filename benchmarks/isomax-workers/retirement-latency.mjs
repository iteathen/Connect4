// Deterministic diagnostic handshake: retire a REAL running worker after node1.
// Per-node instrumentation perturbs speed. Latency includes delivery to parent;
// use separate uninstrumented paired manager runs for throughput decisions.
import fs from 'node:fs';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { IsoMaxTaskSolver } from '../../components/isometric/execution/task.mjs';
if (isMainThread) {
  const records = [];
  for (const interval of [8192, 2048, 512, 128, 32, 1]) {
    const needed = new SharedArrayBuffer(4), sync = new SharedArrayBuffer(4);
    Atomics.store(new Int32Array(needed), 0, 1);
    const worker = new Worker(new URL(import.meta.url), { workerData: { interval, needed, sync } });
    let requestAt, result;
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => { worker.terminate(); reject(new Error('retirement diagnostic timeout')); }, 20000);
      worker.on('message', message => {
        if (message.kind === 'ready-to-retire') {
          requestAt = performance.now();
          Atomics.store(new Int32Array(needed), 0, 0);
          Atomics.store(new Int32Array(sync), 0, 1); Atomics.notify(new Int32Array(sync), 0);
        } else result = { ...message, requestToResultMs: performance.now() - requestAt };
      });
      worker.once('error', error => { clearTimeout(timer); reject(error); });
      worker.once('exit', code => { clearTimeout(timer); code ? reject(new Error('worker exit ' + code)) : resolve(); });
    });
    assert.equal(result.kind, 'retired'); assert.equal(result.restored, true);
    assert.equal(result.hasValue, false); assert.equal(result.nodesAfterRequest, interval - 1);
    records.push({ interval, ...result });
  }
  const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
  const report = { source: git('rev-parse', 'HEAD'), diffSha256: createHash('sha256').update(git('diff','HEAD')).digest('hex'),
    node: process.version, policy: 'diagnostic handshake; real worker; not throughput evidence', records };
  fs.writeFileSync(process.argv[2], JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(records));
} else {
  const solver = new IsoMaxTaskSolver(), create = solver.createState, check = solver.checkTaskControl,
    enter = solver.solveNode;
  const snapshot = s => [s.ply, s.p0Class, s.p1Class, s.status, s.sideToMove,
    s.supportCode, s.supportLo, s.supportHi, s.playableLo, s.playableHi, ...s.heights];
  let state, before, triggered = false;
  solver.createState = function (moves) { state = create.call(this, moves); before = snapshot(state); return state; };
  solver.checkTaskControl = function (s) {
    check.call(this, s);
    this.nextControlNode = Math.min(this.nodeBudget, this.metrics.nodes + workerData.interval);
  };
  solver.solveNode = function (s) {
    if (!triggered && this.metrics.nodes === 1) {
      triggered = true; parentPort.postMessage({ kind:'ready-to-retire' });
      Atomics.wait(new Int32Array(workerData.sync), 0, 0);
    }
    return enter.call(this, s);
  };
  const result = solver.runTask({ moves:[], rootPly:0, nodeBudget:65536,
    abort:new SharedArrayBuffer(4), needed:workerData.needed });
  parentPort.postMessage({ kind:result.kind, nodesAfterRequest:result.nodes-1,
    controlChecks:result.metrics.controlChecks, hasValue:Object.hasOwn(result,'value'),
    restored:JSON.stringify(snapshot(state)) === JSON.stringify(before) });
  parentPort.close();
}
