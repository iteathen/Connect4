import test from 'node:test';
import assert from 'node:assert/strict';
import * as tt from '../components/isometric/execution/shared-tt.mjs';
import { prepareWorker7x6, workerStep7x6 } from '../components/isometric/execution/worker.mjs';
import { managerStep7x6 } from '../components/isometric/execution/manager.mjs';

function key(id, rank) {
  const k = new Uint32Array(8); k[0] = rank << 21; k[7] = id; return k;
}
function setup() {
  const t = tt.createTT7x6(32, 1);
  const root = tt.intern7x6(t, key(1, 0), 0);
  t.control[tt.ROOT] = root; t.control[tt.ROOT_GENERATION] = t.generation[root];
  tt.enqueue(t, root);
  return t;
}
function evaluate(t, q, s, expose) {
  const id = t.keys[q * 8 + 7];
  if (id !== 1) return id === 2 ? 3 : 1;
  if (!expose) { s.witness = 3; return 3; }
  s.count = 2;
  s.keys[0] = 1 << 21; s.keys[7] = 2; s.actions[0] = 3;
  s.keys[8] = 1 << 21; s.keys[15] = 3; s.actions[1] = 2;
  return 4;
}

test('pending branch owns child pins until in-place manager attachment', () => {
  const t = setup(); const w = prepareWorker7x6(2, 2);
  workerStep7x6(t, w, evaluate);
  const root = t.control[tt.ROOT];
  assert.equal(t.phase[root], 2);
  const child = t.child[root * 7];
  assert.equal(t.refs[child], 1);
  assert.equal(w.q, child, 'first ranked child remains locally owned without manager ack');
  assert.equal(t.execution[child], 2);
  managerStep7x6(t, 16);
  assert.equal(t.refs[child], 1, 'topology consumes pin rather than double-retaining');
  assert.notEqual(t.parentHead[child], -1);
  workerStep7x6(t, w, evaluate);
  managerStep7x6(t, 32);
  assert.equal(t.control[tt.DONE], 1);
  assert.equal(t.exact[root], 3);
  assert.equal(t.witness[root], 3);
});

test('one worker requests native local closure, not all-frontier publication', () => {
  const t = setup(); const w = prepareWorker7x6(2, 1);
  workerStep7x6(t, w, evaluate); managerStep7x6(t, 16);
  assert.equal(t.control[tt.DONE], 1);
  assert.equal(t.control[tt.LIVE], 1);
  assert.equal(t.exact[t.control[tt.ROOT]], 3);
});

test('local continuation preserves the claimed TT region without unwind or copying', () => {
  const t = setup(); const w = prepareWorker7x6(2, 1);
  let calls = 0;
  const kernel = (table, q, s) => {
    calls++; assert.equal(table, t);
    assert.equal(q, t.control[tt.ROOT]);
    if (calls < 4) return 5;
    s.witness = 3; return 2;
  };
  for (let i = 0; i < 4; i++) workerStep7x6(t, w, kernel);
  managerStep7x6(t, 16);
  assert.equal(calls, 4); assert.equal(t.control[tt.DONE], 1);
  assert.equal(t.exact[t.control[tt.ROOT]], 2);
});

test('unknown is not draw, and failed kernel output fails closed', () => {
  const t = setup(); const w = prepareWorker7x6(2, 1);
  workerStep7x6(t, w, () => 0);
  assert.equal(t.control[tt.ERROR], tt.CONTRACT);
  assert.equal(t.exact[t.control[tt.ROOT]], 0);
  assert.equal(t.control[tt.DONE], 0);
});

test('root tie witness waits for earlier action despite a later winning completion', () => {
  const t = setup(); const w = prepareWorker7x6(2, 2);
  workerStep7x6(t, w, evaluate); managerStep7x6(t, 16);
  const root = t.control[tt.ROOT];
  const first = t.child[root * 7], later = t.child[root * 7 + 1];
  tt.setExact(t, later, 3); managerStep7x6(t, 16);
  assert.equal(t.exact[root], 3);
  assert.equal(t.control[tt.DONE], 0);
  tt.setExact(t, first, 3); managerStep7x6(t, 16);
  assert.equal(t.control[tt.DONE], 1);
  assert.equal(t.witness[root], 3);
});

test('retiring a local continuation releases ownership before polling another q', () => {
  const t = setup(); const w = prepareWorker7x6(2, 2);
  let calls = 0;
  const kernel = () => { calls++; return 5; };
  workerStep7x6(t, w, kernel);
  const root = t.control[tt.ROOT];
  tt.release(t, root, t.generation[root]);
  workerStep7x6(t, w, kernel);
  assert.equal(calls, 1, 'retired continuation must not execute again');
  assert.equal(w.q, -1);
  assert.equal(t.live[root], 0);
});

test('pruning one parent preserves a transposed child still needed by another', () => {
  const t = setup(), a = prepareWorker7x6(2, 2), b = prepareWorker7x6(3, 2);
  const emit = (table, q, w) => {
    const id = table.keys[q * 8 + 7];
    const rank = table.keys[q * 8] >>> 21;
    w.count = 2; w.actions[0] = 3; w.actions[1] = 2;
    w.keys[0] = w.keys[8] = (rank + 1) << 21;
    if (id === 1) { w.keys[7] = 2; w.keys[15] = 3; }
    else { w.keys[7] = 4; w.keys[15] = id === 2 ? 5 : 6; }
    return 4;
  };
  workerStep7x6(t, a, emit); managerStep7x6(t);
  const root = t.control[tt.ROOT], left = t.child[root * 7], right = t.child[root * 7 + 1];
  workerStep7x6(t, b, emit); managerStep7x6(t); // b takes right and retains shared child
  workerStep7x6(t, a, emit); managerStep7x6(t); // left also references same child
  const shared = t.child[left * 7];
  assert.equal(t.child[right * 7], shared);
  assert.equal(t.refs[shared], 2);
  tt.setExact(t, t.child[left * 7 + 1], 1); managerStep7x6(t);
  assert.equal(t.exact[left], 1);
  assert.equal(t.refs[shared], 1);
  assert.equal(t.live[shared], 1);
  assert.equal(t.execution[shared], b.owner);
  tt.setExact(t, shared, 2);
  tt.setExact(t, t.child[right * 7 + 1], 3);
  managerStep7x6(t, 64);
  assert.equal(t.exact[root], 2);
  assert.equal(t.witness[root], 2);
  assert.equal(t.control[tt.DONE], 1);
});

test('ready-reservoir pressure requests local closure instead of exposing every branch', () => {
  const t = setup(), w = prepareWorker7x6(2, 2);
  for (let id = 10; id < 14; id++) tt.enqueue(t, tt.intern7x6(t, key(id, 1), 0));
  let admitted = -1;
  workerStep7x6(t, w, (table, q, s, expose) => { admitted = expose; return 2; });
  assert.equal(admitted, 0);
});
