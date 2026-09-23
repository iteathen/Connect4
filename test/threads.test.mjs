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
const root = new Uint32Array(8); root[7] = 1;

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

test('death inside the TT transaction fails closed without lock takeover or deadlock', async () => {
  const manager = new IsoMaxBranchManager({ workers: 2, capacity: 32,
    kernelURL, kernelData: { graph, dieInLock: true }, timeoutMs: 5000 });
  const result = await manager.run(root);
  assert.equal(result.errorCode, 5);
  assert.equal(result.rootWdl, null);
  assert.equal(result.cleanup, true);
});

test('pre-aborted execution produces no value and cleans up', async () => {
  const controller = new AbortController(); controller.abort();
  const manager = new IsoMaxBranchManager({ workers: 2, capacity: 32,
    kernelURL, kernelData: { graph }, timeoutMs: 5000 });
  const result = await manager.run(root, { signal: controller.signal });
  assert.equal(result.errorCode, 7);
  assert.equal(result.rootWdl, null);
  assert.equal(result.cleanup, true);
});

test('seeded transposed DAGs agree with an independent oracle at 1/2/4 workers', async () => {
  let seed = 0x98736;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  const order = [3, 2, 4, 1, 5, 0, 6];
  function oracle(g, id) {
    const n = g[id];
    if (n.value) return n.value;
    const values = n.children.map(([, child]) => oracle(g, child));
    return n.rank & 1 ? Math.min(...values) : Math.max(...values);
  }
  for (let sample = 0; sample < 4; sample++) {
    const g = [null];
    for (let rank = 0; rank < 5; rank++) {
      for (let column = 0; column < 5; column++) {
        g.push(rank === 4 ? { rank, value: random() % 3 + 1 } : {
          rank, children: order.slice(0, 3).map(action => [action, (rank + 1) * 5 + 1 + random() % 5]),
        });
      }
    }
    const expected = oracle(g, 1);
    const move = g[1].children.find(([, child]) => oracle(g, child) === expected)[0];
    for (const workers of [1, 2, 4]) {
      const result = await new IsoMaxBranchManager({ workers, capacity: 128, buckets: 1,
        kernelURL, kernelData: { graph: g }, timeoutMs: 5000 }).run(root);
      assert.equal(result.status, 'EXACT', JSON.stringify(result));
      assert.equal(result.rootWdl, expected - 2);
      assert.equal(result.move, move);
      assert.equal(result.cleanup, true);
    }
  }
});
