import { enter, leave, valid, release, recycle, enqueue, signal, takeEvent,
  setExact, fail, CONTRACT, ROOT, DONE, STOP, WAKE, ACTIONS, KEY_WORDS } from './shared-tt.mjs';

// E2, manager-only under the TT transaction. PRESERVE THROUGH ALL CALLEES.
// No game evaluation, private identity table, replay, dynamic aggregate, or
// per-node message. Canonical topology is the same storage workers publish.
// An edge owns exactly one child pin, pending or attached, never both.
function detach7x6(t, q) {
  const base = q * ACTIONS;
  const count = t.count[q];
  t.count[q] = 0;
  for (let i = 0; i < count; i++) {
    const e = base + i, child = t.child[e];
    if (t.edgeAttached[e]) {
      const previous = t.edgePrev[e], next = t.edgeNext[e];
      if (previous === -1) t.parentHead[child] = next;
      else t.edgeNext[previous] = next;
      if (next !== -1) t.edgePrev[next] = previous;
      t.edgeAttached[e] = 0;
    }
    release(t, child, t.childGeneration[e]);
    t.child[e] = -1;
  }
  t.phase[q] = 4;
}

// Center-first tie priority7x6 is physical-action interpretation, not q identity.
function priority7x6(action) {
  return action < 3 ? (3 - action) * 2 - 1 : (action - 3) * 2;
}

function reconcile7x6(t, q) {
  if (!t.refs[q]) {
    if (t.count[q]) detach7x6(t, q);
    recycle(t, q);
    return;
  }
  const base = q * ACTIONS;
  if (t.phase[q] === 2) {
    for (let i = 0; i < t.count[q]; i++) {
      const e = base + i, child = t.child[e];
      if (!valid(t, child, t.childGeneration[e])) { fail(t, CONTRACT); return; }
      const head = t.parentHead[child];
      t.edgeNext[e] = head; t.edgePrev[e] = -1;
      if (head !== -1) t.edgePrev[head] = e;
      t.parentHead[child] = e; t.edgeAttached[e] = 1;
      enqueue(t, child);
    }
    t.phase[q] = 3;
  }
  const root = q === t.control[ROOT];
  if (t.phase[q] === 3) {
    const minimize = (t.keys[q * KEY_WORDS] >>> 21) & 1;
    let best = minimize ? 4 : 0;
    let unknown = 0, firstUnknown = 7, bestPriority = 7, action = -1;
    for (let i = 0; i < t.count[q]; i++) {
      const e = base + i, value = t.exact[t.child[e]];
      const order = priority7x6(t.edgeAction[e]);
      if (!value) { unknown++; if (order < firstUnknown) firstUnknown = order; }
      else if ((minimize ? value < best : value > best) ||
               (value === best && order < bestPriority)) {
        best = value; bestPriority = order; action = t.edgeAction[e];
      }
    }
    if (!unknown || best === (minimize ? 1 : 3)) {
      setExact(t, q, best);
      // Value can close before root's deterministic witness. Keep only this
      // necessary topology until earlier tied actions are ruled out.
      if (!root || firstUnknown > bestPriority) {
        t.witness[q] = action;
        detach7x6(t, q);
      }
    }
  }
  if (t.exact[q]) {
    for (let e = t.parentHead[q]; e !== -1; e = t.edgeNext[e]) {
      signal(t, (e / ACTIONS) | 0);
    }
    if (root && !t.count[q]) Atomics.store(t.control, DONE, 1);
  }
  recycle(t, q);
}

export function managerStep7x6(t, budget = 64) {
  if (!enter(t, 1)) return 0;
  let processed = 0;
  while (processed < budget && !Atomics.load(t.control, STOP)) {
    const q = takeEvent(t);
    if (q === -1) break;
    reconcile7x6(t, q); processed++;
  }
  leave(t);
  if (processed) { Atomics.add(t.control, WAKE, 1); Atomics.notify(t.control, WAKE); }
  return processed;
}
