import test from 'node:test';
import assert from 'node:assert/strict';
import * as tt from '../components/isometric/execution/shared-tt.mjs';

// Hand-written keys differ in their last residual word: ignoring any tail word
// or treating the single bucket as equality must fail these tests.
function key(id, rank = 0, flags = 0) {
  const words = new Uint32Array(42);
  words[0] = rank << 21;
  words[1] = flags;
  words[41] = id;
  return words;
}

test('exact content, including sentinel flags, owns identity despite collisions', () => {
  const t = tt.createTT7x6(8, 1);
  const a = tt.intern7x6(t, key(8), 0);
  const b = tt.intern7x6(t, key(9), 0);
  const c = tt.intern7x6(t, key(8, 0, 1), 0);
  assert.notEqual(a, b);
  assert.notEqual(a, c);
  assert.equal(tt.intern7x6(t, key(8), 0), a);
  assert.equal(t.refs[a], 2);
});

test('last release recycles only unowned rows and invalidates stale generation', () => {
  const t = tt.createTT7x6(1, 1);
  const a = tt.intern7x6(t, key(8), 0);
  const generation = t.generation[a];
  assert.equal(tt.release(t, a, generation), 1);
  const b = tt.intern7x6(t, key(9), 0);
  assert.equal(a, b);
  assert.notEqual(t.generation[b], generation);
  assert.equal(tt.retain(t, a, generation), 0);
  assert.equal(tt.release(t, a, generation), 0);
  assert.equal(t.refs[b], 1);
});

test('queued and running q cannot recycle; a retired ticket produces no work', () => {
  const t = tt.createTT7x6(1, 1);
  const a = tt.intern7x6(t, key(8), 0);
  const g = t.generation[a];
  tt.enqueue(t, a);
  tt.release(t, a, g);
  assert.equal(tt.take(t, 2), -1);
  assert.equal(t.live[a], 0);
  const b = tt.intern7x6(t, key(9), 0);
  tt.enqueue(t, b);
  assert.equal(tt.take(t, 2), b);
  tt.release(t, b, t.generation[b]);
  assert.equal(t.live[b], 1);
  tt.releaseExecution(t, b, 2);
  assert.equal(t.live[b], 0);
});

test('capacity and conflicting exact values fail closed without inventing a draw', () => {
  const t = tt.createTT7x6(1, 1);
  const a = tt.intern7x6(t, key(8), 0);
  assert.equal(tt.intern7x6(t, key(9), 0), -1);
  assert.equal(t.control[tt.ERROR], tt.CAPACITY);
  assert.equal(t.exact[a], 0);
  const u = tt.createTT7x6(2, 1);
  const b = tt.intern7x6(u, key(9), 0);
  assert.equal(tt.setExact(u, b, 3), 1);
  assert.equal(tt.setExact(u, b, 1), 0);
  assert.equal(u.control[tt.ERROR], tt.CONFLICT);
  assert.equal(u.exact[b], 3);
});

test('generation exhaustion cannot alias a historic q reference', () => {
  const t = tt.createTT7x6(1, 1);
  t.generation[0] = 0xffffffff;
  assert.equal(tt.intern7x6(t, key(1), 0), -1);
  assert.equal(t.control[tt.ERROR], tt.GENERATION);
});

test('retired queued rows release bounded capacity without requiring a worker dequeue', () => {
  const t = tt.createTT7x6(2, 1);
  const a = tt.intern7x6(t, key(1), 0), b = tt.intern7x6(t, key(2), 0);
  tt.enqueue(t, a); tt.enqueue(t, b);
  tt.release(t, a, t.generation[a]);
  assert.notEqual(tt.intern7x6(t, key(3), 0), -1);
  assert.equal(tt.take(t, 2), b);
  assert.equal(t.control[tt.ERROR], 0);
});
