import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import test from 'node:test';
import { once } from 'node:events';
import { createSearchWorkerExecutor } from './quotient-search-worker-executor.mjs';
import { runOnlinePathTasks, startOnlineBranchManager, startOnlineSearchWorkers } from './quotient-online-semantic-worker-pool.mjs';
import { createSemanticSharedTtArena } from './quotient-semantic-shared-tt.mjs';
import { buildSharedQuotientGraph } from './quotient-shared-graph-lib.mjs';
import { buildQuotientLookaheadWorkDag, reduceQuotientLookaheadWorkDag } from './quotient-lookahead-work-dag.mjs';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';

class FakeWorker extends EventEmitter {
  sent = [];
  terminated = false;
  postMessage(message) { this.sent.push(message); }
  async terminate() { this.terminated = true; }
}

test('postMessage failure poisons executor and releases every pending task', async () => {
  const worker = new FakeWorker();
  worker.postMessage = () => { throw Error('transport failed'); };
  const executor = createSearchWorkerExecutor([worker]);
  await assert.rejects(executor.submit({ type: 'search-path', path: [], alpha: 0, beta: 1 }), /transport/);
  assert.equal(executor.stats().pending, 0);
  assert.equal(executor.stats().active, 0);
  assert.equal(executor.stats().poisoned, true);
  await assert.rejects(executor.drain(), /transport/);
  assert.throws(() => executor.close(), /transport/);
});

test('malformed worker values poison before the worker can run queued work', async () => {
  const worker = new FakeWorker();
  const executor = createSearchWorkerExecutor([worker]);
  const first = executor.submit({ type: 'search-path' });
  const second = executor.submit({ type: 'search-path' });
  const settled = Promise.allSettled([first, second]);
  worker.emit('message', { type: 'result', taskId: worker.sent[0].taskId, value: '0' });
  assert.equal(worker.sent.length, 1);
  assert.deepEqual((await settled).map(r => r.status), ['rejected', 'rejected']);
  assert.throws(() => executor.close());
});

test('synchronous abandonment failure cannot interrupt executor poisoning', async () => {
  const worker = new FakeWorker();
  const executor = createSearchWorkerExecutor([worker], { abandonExploreHint() { throw Error('abandon failed'); } });
  executor.enqueueExploreHint({ hintId: 1, path: [], depth: 1 });
  assert.doesNotThrow(() => worker.emit('error', Error('worker failed')));
  await assert.rejects(executor.drain());
  assert.equal(executor.stats().active, 0);
  assert.throws(() => executor.close());
});

test('queued payloads are captured at submission instead of borrowing caller state', async () => {
  const worker = new FakeWorker();
  const executor = createSearchWorkerExecutor([worker]);
  const first = executor.submit({ type: 'search-path', path: [] });
  const payload = { type: 'search-path', path: [0] };
  const second = executor.submit(payload);
  payload.path[0] = 6;
  worker.emit('message', { type: 'result', taskId: worker.sent[0].taskId, value: 0 });
  assert.deepEqual(worker.sent[1].path, [0]);
  worker.emit('message', { type: 'result', taskId: worker.sent[1].taskId, value: 0 });
  await Promise.all([first, second]);
  await executor.drain();
  executor.close();
});

test('path replies must match the dispatched planner state and failed pools cannot be reused', async () => {
  const worker = new FakeWorker();
  const run = runOnlinePathTasks([worker], [{ stateId: 1, path: [0] }]);
  worker.emit('message', { type: 'result', taskId: worker.sent[0].taskId, plannerStateId: 2, value: 0 });
  await assert.rejects(run, /planner state/);
  assert.equal(worker.terminated, true);
  await assert.rejects(runOnlinePathTasks([worker], [{ stateId: 1, path: [0] }]), /unavailable/);
});

test('Branch Manager calls fail immediately after observed exit instead of awaiting a dead worker', { timeout: 5000 }, async () => {
  const manager = await startOnlineBranchManager({ columns: 4, rows: 3, connect: 3 }, { prebuildGraph: false, entryCapacity: 8, termCapacity: 128 });
  await manager.worker.terminate();
  await assert.rejects(async () => manager.reset(), /exit/);
  await assert.rejects(manager.cleanup(), /exit/);
});

test('semantic worker fails closed on unknown protocol and remains poisoned', { timeout: 5000 }, async () => {
  const arena = createSemanticSharedTtArena({ entryCapacity: 8, termCapacity: 128 });
  const [worker] = await startOnlineSearchWorkers(1, { columns: 4, rows: 3, connect: 3 }, arena);
  try {
    let reply = once(worker, 'message');
    worker.postMessage(null);
    assert.equal((await reply)[0].type, 'error');
    reply = once(worker, 'message');
    worker.postMessage({ type: 'search-path', taskId: 2, path: [], alpha: 0, beta: 1 });
    const [message] = await reply;
    assert.equal(message.type, 'error');
    assert.match(message.message, /unsupported/);
  } finally { await worker.terminate(); }
});

test('bounded work plan rejects bad ordering/ranks and reduces actual worker values exactly', { timeout: 10000 }, async () => {
  const spec = { columns: 4, rows: 3, connect: 3 };
  const graph = buildSharedQuotientGraph(spec);
  assert.throws(() => buildQuotientLookaheadWorkDag({ ...graph, centerOrder: [0, 0, 2, 3] }, 2), /permutation/);
  const edges = graph.edgeBuffer.slice(0);
  new Int32Array(edges)[graph.rootId * spec.columns] = graph.rootId;
  assert.throws(() => buildQuotientLookaheadWorkDag({ ...graph, edgeBuffer: edges }, 2), /rank/);
  const plan = buildQuotientLookaheadWorkDag(graph, 2);
  assert.equal(Object.isFrozen(plan.nodesByDepth), true);
  const arena = createSemanticSharedTtArena({ entryCapacity: 4096, termCapacity: 100000 });
  const workers = await startOnlineSearchWorkers(2, spec, arena);
  try {
    const result = await runOnlinePathTasks(workers, plan.tasks);
    const reduced = reduceQuotientLookaheadWorkDag(plan, result.frontierValues, spec.columns);
    assert.equal(reduced.rootWdl, solveBsfpOwnershipAntichainWdl(spec).rootWdl);
  } finally { await Promise.all(workers.map(w => w.terminate())); }
});
