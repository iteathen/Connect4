import test from 'node:test';
import assert from 'node:assert/strict';
import { IsoMaxBranchManager } from '../components/isometric/execution/branch-manager.mjs';

const kernelURL = new URL('./fixtures/dag-kernel.mjs', import.meta.url).href;
const graph = [null,
  { rank: 0, children: [[3, 2], [2, 3]] },
  { rank: 1, children: [[3, 4], [2, 5]] },
  { rank: 1, children: [[3, 4], [2, 6]] },
  { rank: 2, children: [[3, 7], [2, 8]] },
  { rank: 2, value: 1 }, { rank: 2, value: 3 },
  { rank: 3, value: 1 }, { rank: 3, value: 2 },
];
const root = new Uint32Array(42); root[41] = 1;

// Hand solution: q4=max(loss,draw)=draw; q2=min(draw,loss)=loss;
// q3=min(draw,win)=draw; q1=max(loss,draw)=draw, best physical column 2.
for (const workers of [1, 2, 4]) {
  test(`${workers} real workers close a transposed DAG with deterministic root witness`, async () => {
    const manager = new IsoMaxBranchManager({ workers, capacity: 32, buckets: 1,
      kernelURL, kernelData: { graph }, timeoutMs: 5000 });
    const result = await manager.run(root);
    assert.equal(result.status, 'EXACT', JSON.stringify(result));
    assert.equal(result.rootWdl, 0);
    assert.equal(result.move, 2);
    assert.equal(result.cleanup, true);
    assert.equal(result.workersExited, workers + 1);
  });
}

test('mirror transport belongs to the external witness, not shared q equality', async () => {
  const manager = new IsoMaxBranchManager({ workers: 2, capacity: 32, buckets: 1,
    kernelURL, kernelData: { graph }, timeoutMs: 5000 });
  const result = await manager.run(root, { reflected: true });
  assert.equal(result.rootWdl, 0);
  assert.equal(result.move, 4);
  assert.equal(result.cleanup, true);
});

test('worker death fails closed and drains every owned thread', async () => {
  const manager = new IsoMaxBranchManager({ workers: 2, capacity: 32,
    kernelURL, kernelData: { graph, die: true }, timeoutMs: 5000 });
  const result = await manager.run(root);
  assert.equal(result.status, 'FAILED');
  assert.equal(result.rootWdl, null);
  assert.equal(result.errorCode, 5);
  assert.equal(result.cleanup, true);
  assert.equal(result.workersExited, 3);
});

test('deadline produces no WDL and terminates a noncooperative kernel', async () => {
  const manager = new IsoMaxBranchManager({ workers: 1, capacity: 32,
    kernelURL, kernelData: { graph, hang: true }, timeoutMs: 300 });
  const result = await manager.run(root);
  assert.equal(result.status, 'TIMEOUT');
  assert.equal(result.rootWdl, null);
  assert.equal(result.cleanup, true);
});

test('fixed capacity failure reports failure, never a smaller substituted solve', async () => {
  const manager = new IsoMaxBranchManager({ workers: 2, capacity: 1, buckets: 1,
    kernelURL, kernelData: { graph }, timeoutMs: 5000 });
  const result = await manager.run(root);
  assert.equal(result.status, 'FAILED');
  assert.equal(result.errorCode, 1);
  assert.equal(result.rootWdl, null);
  assert.equal(result.cleanup, true);
});
