import test from 'node:test';
import assert from 'node:assert/strict';

// Research prototype only. This models the vector-ledger refinement of the
// conserved-deficit family. Canonical q/qExecution remain work/execution
// authority. The worker ledger is only bounded transition/recovery evidence.
//
// The key representation change versus the discarded monotonic-credit epoch is:
//   * long-lived RUNNING q records store only durable origin (SCHED/ACTIVE);
//   * only the one in-progress claim stores an expected one-bit transaction parity;
//   * one atomic worker-ledger RMW both flips that parity and emits the claim's
//     pending (D, READY-consumed) vector.
// Because a worker is sequential, no later claim can flip parity while that
// transient CLAIM_* record exists. After qExecution finalizes to RUN_*, the
// expected parity is discarded and can never age/wrap on a long-lived ancestor.
//
// Manager harvest is additive and may race any claim microstep. It preserves the
// parity bit while atomically draining the pending vector. Counter saturation is
// fail-closed before qExecution claim linearization: the worker defers the claim
// (or availability advertisement), wakes the manager, and does not wrap/drop a
// credit or synchronously wait for a drain.

const KIND_ACTIVE = 'active';
const KIND_SCHED = 'sched';

function model({
  outsideAvailable = 0,
  workerAvailable = false,
  readyQ = [],
  maxPending = 3,
} = {}) {
  const s = {
    outsideAvailable,
    manager: {
      deficit: 0,
      ready: readyQ.length,
      harvestRmw: 0,
      recoveryRmw: 0,
    },
    worker: {
      generation: 1,
      ledger: {
        available: workerAvailable,
        txnParity: 0,
        pendingD: 0,
        pendingReadyConsumed: 0,
        maxPending,
      },
      ledgerRmw: 0,
      qExecutionRmw: 0,
      packedAuthorityWorkerCas: 0,
      deferredClaims: 0,
      deferredAvailability: 0,
      drainRequests: 0,
    },
    q: new Map(),
  };
  for (const id of readyQ) s.q.set(id, queuedQ(id));
  s.manager.deficit = trueDeficit(s);
  return s;
}

function queuedQ(id) {
  return {
    id,
    state: 'queued',
    ownerGeneration: 0,
    claimParity: null,
  };
}

function qState(s, id) {
  const q = s.q.get(id);
  assert.ok(q, `missing q ${id}`);
  return q;
}

function actualReady(s) {
  let count = 0;
  for (const q of s.q.values()) if (q.state === 'queued') count++;
  return count;
}

function trueDeficit(s) {
  return s.outsideAvailable
    + (s.worker.ledger.available ? 1 : 0)
    - actualReady(s);
}

function assertSafe(s, label = '') {
  assert.ok(
    s.manager.deficit <= trueDeficit(s),
    `${label} represented D=${s.manager.deficit} exceeds true D=${trueDeficit(s)}`,
  );
  assert.ok(s.manager.ready >= actualReady(s), `${label} represented READY undercounts actual queue`);
}

function assertStableExact(s, label = '') {
  assert.equal(s.worker.ledger.pendingD, 0, `${label} pendingD`);
  assert.equal(s.worker.ledger.pendingReadyConsumed, 0, `${label} pendingReady`);
  assert.equal(s.manager.ready, actualReady(s), `${label} READY exact`);
  assert.equal(s.manager.deficit, trueDeficit(s), `${label} D exact`);
  assertSafe(s, label);
}

function managerHarvest(s) {
  const l = s.worker.ledger;
  const d = l.pendingD;
  const r = l.pendingReadyConsumed;
  if (d === 0 && r === 0) return false;
  s.manager.deficit += d;
  s.manager.ready -= r;
  assert.ok(s.manager.ready >= 0, 'READY accounting underflow');
  l.pendingD = 0;
  l.pendingReadyConsumed = 0;
  s.manager.harvestRmw++;
  assertSafe(s, 'harvest');
  return true;
}

function managerAdmitReady(s, id) {
  assert.ok(!s.q.has(id), `duplicate q ${id}`);
  s.q.set(id, queuedQ(id));
  s.manager.ready++;
  s.manager.deficit--;
  assertSafe(s, 'admit READY');
}

function claimEffect(kind) {
  if (kind === KIND_ACTIVE) return { d: 1, ready: 1 };
  if (kind === KIND_SCHED) return { d: 0, ready: 1 };
  throw new Error(`bad claim kind ${kind}`);
}

function claimHasRoom(s, kind) {
  const effect = claimEffect(kind);
  const l = s.worker.ledger;
  return l.pendingD + effect.d <= l.maxPending
    && l.pendingReadyConsumed + effect.ready <= l.maxPending;
}

function beginClaim(s, id, kind) {
  const q = qState(s, id);
  assert.equal(q.state, 'queued');
  if (kind === KIND_SCHED) assert.equal(s.worker.ledger.available, true, 'scheduler claim requires availability');
  else assert.equal(s.worker.ledger.available, false, 'active claim requires BUSY worker');

  if (!claimHasRoom(s, kind)) {
    s.worker.deferredClaims++;
    s.worker.drainRequests++;
    assertSafe(s, 'claim saturation defer');
    return false;
  }

  q.state = `claim-${kind}`;
  q.ownerGeneration = s.worker.generation;
  q.claimParity = s.worker.ledger.txnParity ^ 1;
  s.worker.qExecutionRmw++;
  assertSafe(s, 'after q claim CAS');
  return true;
}

function emitClaimVector(s, id) {
  const q = qState(s, id);
  assert.match(q.state, /^claim-(active|sched)$/);
  const kind = q.state.slice('claim-'.length);
  const effect = claimEffect(kind);
  const l = s.worker.ledger;
  assert.equal(q.claimParity, l.txnParity ^ 1, 'expected parity must be next toggle');
  assert.ok(l.pendingD + effect.d <= l.maxPending, 'pendingD saturation crossed');
  assert.ok(l.pendingReadyConsumed + effect.ready <= l.maxPending, 'pendingReady saturation crossed');

  l.pendingD += effect.d;
  l.pendingReadyConsumed += effect.ready;
  if (kind === KIND_SCHED) {
    assert.equal(l.available, true);
    l.available = false;
  }
  l.txnParity = q.claimParity;
  s.worker.ledgerRmw++;
  assertSafe(s, 'after vector RMW');
}

function finalizeClaim(s, id) {
  const q = qState(s, id);
  assert.match(q.state, /^claim-(active|sched)$/);
  const kind = q.state.slice('claim-'.length);
  assert.equal(s.worker.ledger.txnParity, q.claimParity, 'cannot finalize before vector RMW');
  q.state = `running-${kind}`;
  q.claimParity = null;
  s.worker.qExecutionRmw++;
  assertSafe(s, 'after q origin finalization');
}

function claimNormally(s, id, kind, { harvest = true } = {}) {
  assert.equal(beginClaim(s, id, kind), true);
  emitClaimVector(s, id);
  finalizeClaim(s, id);
  if (harvest) managerHarvest(s);
  return qState(s, id);
}

function finishExact(s, id) {
  const q = qState(s, id);
  assert.match(q.state, /^running-(active|sched)$/);
  q.state = 'exact';
  q.ownerGeneration = 0;
  q.claimParity = null;
  assertSafe(s, 'exact finish');
}

function abandonWithoutRequeue(s, id) {
  const q = qState(s, id);
  assert.match(q.state, /^running-(active|sched)$/);
  q.state = 'orphan';
  q.ownerGeneration = 0;
  q.claimParity = null;
  assertSafe(s, 'orphan finish');
}

function tryAdvertiseAvailability(s) {
  const l = s.worker.ledger;
  assert.equal(l.available, false, 'availability transition starts BUSY');
  if (l.pendingD >= l.maxPending) {
    s.worker.deferredAvailability++;
    s.worker.drainRequests++;
    assertSafe(s, 'availability saturation defer');
    return false;
  }
  l.available = true;
  l.pendingD++;
  s.worker.ledgerRmw++;
  assertSafe(s, 'availability credit');
  return true;
}

function markTransientDisposition(s, id, disposition) {
  const q = qState(s, id);
  assert.match(q.state, /^claim-(active|sched)$/);
  assert.ok(disposition === 'exact' || disposition === 'orphan');
  q.disposition = disposition;
}

function requeueRepresentedConsumedQ(s, q) {
  q.state = 'queued';
  q.ownerGeneration = 0;
  q.claimParity = null;
  delete q.disposition;
  s.manager.ready++;
  s.manager.deficit--; // restored READY coverage
  s.manager.recoveryRmw++;
}

function requeueStillRepresentedQ(q) {
  q.state = 'queued';
  q.ownerGeneration = 0;
  q.claimParity = null;
  delete q.disposition;
}

function retireStillRepresentedReady(s, q, disposition) {
  // Claim CAS happened, but the vector RMW did not. Manager still counts this q
  // as READY. If it cannot be requeued, retire that coverage exactly here.
  q.state = disposition;
  q.ownerGeneration = 0;
  q.claimParity = null;
  delete q.disposition;
  s.manager.ready--;
  s.manager.deficit++;
  s.manager.recoveryRmw++;
}

function recoverDeadWorker(s) {
  const deadGeneration = s.worker.generation;
  const transient = [...s.q.values()].filter(
    q => q.ownerGeneration === deadGeneration && /^claim-(active|sched)$/.test(q.state),
  );
  assert.ok(transient.length <= 1, 'sequential worker may have only one transient claim');

  // First classify the only torn claim. The transient q carries expected parity;
  // the worker ledger carries actual parity. No historical epoch is consulted.
  for (const q of transient) {
    const emitted = s.worker.ledger.txnParity === q.claimParity;
    const disposition = q.disposition ?? 'requeue';
    if (emitted) {
      // The vector may already have been harvested. Draining again is harmless:
      // only still-pending additive evidence moves.
      managerHarvest(s);
      if (disposition === 'requeue') requeueRepresentedConsumedQ(s, q);
      else {
        q.state = disposition;
        q.ownerGeneration = 0;
        q.claimParity = null;
        delete q.disposition;
      }
    } else if (disposition === 'requeue') {
      // READY consumption was never represented, so restoring qExecution to
      // QUEUED requires no READY/D update.
      requeueStillRepresentedQ(q);
    } else {
      retireStillRepresentedReady(s, q, disposition);
    }
  }

  // Fold all finalized worker vectors before interpreting durable RUN origins.
  managerHarvest(s);

  for (const q of s.q.values()) {
    if (q.ownerGeneration !== deadGeneration) continue;
    if (q.state === 'running-active' || q.state === 'running-sched') {
      requeueRepresentedConsumedQ(s, q);
    }
  }

  // A replacement for the dead BUSY worker contributes one unit of available
  // capacity. If the crash happened before a scheduler claim's vector RMW, the
  // availability bit was never cleared and this contribution is already present.
  if (!s.worker.ledger.available) {
    s.worker.ledger.available = true;
    s.manager.deficit++;
    s.manager.recoveryRmw++;
  }

  assert.equal(s.worker.ledger.pendingD, 0);
  assert.equal(s.worker.ledger.pendingReadyConsumed, 0);
  s.worker.generation++;
  assertStableExact(s, 'post-death recovery');
}

function cloneForCrash(kind, { maxPending = 3 } = {}) {
  if (kind === KIND_SCHED) {
    return model({ outsideAvailable: 0, workerAvailable: true, readyQ: ['q'], maxPending });
  }
  return model({ outsideAvailable: 1, workerAvailable: false, readyQ: ['q'], maxPending });
}

function applyCrashStage(s, kind, stage, disposition = 'requeue') {
  // Stages intentionally include manager harvest both before and after the vector
  // RMW. There is no "claimTxn clear" stage in this realization: one-bit parity
  // persists and q finalization discards the transient expected value, removing
  // that worker RMW entirely.
  if (stage >= 1) assert.equal(beginClaim(s, 'q', kind), true);           // after q CAS
  if (stage === 2) managerHarvest(s);                                    // pre-vector harvest race
  if (stage >= 3) emitClaimVector(s, 'q');                               // after vector/parity RMW
  if (stage === 4) managerHarvest(s);                                    // vector harvested while CLAIM
  if (stage >= 5) finalizeClaim(s, 'q');                                 // durable origin established
  if (stage >= 6) managerHarvest(s);                                     // post-finalization harvest

  if (disposition !== 'requeue') {
    const q = qState(s, 'q');
    if (/^claim-/.test(q.state)) markTransientDisposition(s, 'q', disposition);
    else if (/^running-/.test(q.state)) {
      if (disposition === 'exact') finishExact(s, 'q');
      else abandonWithoutRequeue(s, 'q');
    } else if (q.state === 'queued') {
      // Crash before q CAS with an independently exact/orphaned q means manager
      // retires the still-READY occurrence as an ordinary manager event.
      q.state = disposition;
      s.manager.ready--;
      s.manager.deficit++;
    }
  }
}

test('one-bit transient parity detects claim-vector publication across manager harvest races', () => {
  for (const kind of [KIND_ACTIVE, KIND_SCHED]) {
    for (let stage = 0; stage <= 6; stage++) {
      const s = cloneForCrash(kind);
      applyCrashStage(s, kind, stage, 'requeue');
      recoverDeadWorker(s);
      assert.equal(qState(s, 'q').state, 'queued', `${kind} stage ${stage}`);
      assert.equal(s.worker.packedAuthorityWorkerCas, 0);
    }
  }
});

test('exact/orphan crash dispositions stay exact without per-q epoch metadata', () => {
  for (const kind of [KIND_ACTIVE, KIND_SCHED]) {
    for (const disposition of ['exact', 'orphan']) {
      for (let stage = 0; stage <= 6; stage++) {
        const s = cloneForCrash(kind);
        applyCrashStage(s, kind, stage, disposition);
        recoverDeadWorker(s);
        assert.equal(qState(s, 'q').state, disposition, `${kind}/${disposition}/stage ${stage}`);
      }
    }
  }
});

test('old ACTIVE ancestor survives credits far beyond tiny counter modulus without historical epoch', () => {
  const s = model({ outsideAvailable: 1, workerAvailable: false, readyQ: ['ancestor'], maxPending: 3 });
  claimNormally(s, 'ancestor', KIND_ACTIVE);
  assert.equal(qState(s, 'ancestor').state, 'running-active');
  managerAdmitReady(s, 'child-0');
  assertStableExact(s, 'ancestor established');

  // Keep ancestor RUNNING while many later claim vectors reuse the same one-bit
  // parity. Each child becomes exact; a new READY child restores coverage.
  for (let i = 0; i < 100; i++) {
    const id = `child-${i}`;
    assert.equal(qState(s, 'ancestor').state, 'running-active');
    assert.equal(beginClaim(s, id, KIND_ACTIVE), true);
    emitClaimVector(s, id);
    finalizeClaim(s, id);
    finishExact(s, id);
    managerHarvest(s);
    managerAdmitReady(s, `child-${i + 1}`);
    assertStableExact(s, `cycle ${i}`);
  }

  // Requeueing the very old ancestor cancels exactly one historical ACTIVE
  // reclaim credit regardless of 100 later parity toggles/harvests.
  recoverDeadWorker(s);
  assert.equal(qState(s, 'ancestor').state, 'queued');
  assertStableExact(s, 'old ancestor recovered');
});

test('forced counter saturation defers before q claim and never wraps/drops credits', () => {
  const s = model({ outsideAvailable: 1, workerAvailable: false, readyQ: ['old'], maxPending: 3 });
  claimNormally(s, 'old', KIND_ACTIVE);
  managerAdmitReady(s, 'q0');

  // Fill both pending counters to the artificial maximum without manager harvest.
  for (let i = 0; i < 3; i++) {
    const id = `q${i}`;
    assert.equal(beginClaim(s, id, KIND_ACTIVE), true);
    emitClaimVector(s, id);
    finalizeClaim(s, id);
    finishExact(s, id);
    managerAdmitReady(s, `q${i + 1}`);
  }
  assert.equal(s.worker.ledger.pendingD, 3);
  assert.equal(s.worker.ledger.pendingReadyConsumed, 3);

  const parityBefore = s.worker.ledger.txnParity;
  const deficitBefore = s.manager.deficit;
  assert.equal(beginClaim(s, 'q3', KIND_ACTIVE), false, 'saturated claim must defer');
  assert.equal(qState(s, 'q3').state, 'queued', 'qExecution authority untouched on saturation');
  assert.equal(s.worker.ledger.txnParity, parityBefore, 'no parity wrap/toggle on defer');
  assert.equal(s.manager.deficit, deficitBefore, 'no masked capacity mutation');
  assert.equal(s.worker.deferredClaims, 1);
  assert.equal(s.worker.drainRequests, 1);

  managerHarvest(s);
  assert.equal(beginClaim(s, 'q3', KIND_ACTIVE), true, 'claim succeeds after asynchronous drain');
  emitClaimVector(s, 'q3');
  finalizeClaim(s, 'q3');
  managerHarvest(s);
  assertSafe(s, 'post-saturation retry');
});

test('availability credit saturation is fail-closed and retryable without worker wait loop', () => {
  const s = model({ outsideAvailable: 3, workerAvailable: false, readyQ: ['a', 'b', 'c'], maxPending: 3 });
  // Produce three ACTIVE reclaim vectors to fill pendingD/pendingReady.
  for (const id of ['a', 'b', 'c']) {
    assert.equal(beginClaim(s, id, KIND_ACTIVE), true);
    emitClaimVector(s, id);
    finalizeClaim(s, id);
    finishExact(s, id);
  }
  assert.equal(s.worker.ledger.pendingD, 3);
  assert.equal(tryAdvertiseAvailability(s), false);
  assert.equal(s.worker.ledger.available, false, 'BUSY retained until credit can be represented');
  assert.equal(s.worker.deferredAvailability, 1);
  assert.equal(s.worker.drainRequests, 1);

  managerHarvest(s);
  assert.equal(tryAdvertiseAvailability(s), true);
  managerHarvest(s);
  assertStableExact(s, 'availability retry after drain');
});

test('repeated death/respawn and worker-ID reuse does not drift D or confuse generations', () => {
  const s = model({ outsideAvailable: 1, workerAvailable: true, readyQ: ['q0', 'q1'], maxPending: 3 });
  for (let rep = 0; rep < 64; rep++) {
    const queued = [...s.q.values()].filter(q => q.state === 'queued');
    assert.equal(queued.length, 2, `rep ${rep} queue width`);
    const root = queued[0].id;
    const child = queued[1].id;

    claimNormally(s, root, KIND_SCHED);
    const stage = rep % 7;
    applyCrashStageForExistingActive(s, child, stage);
    const deadGeneration = s.worker.generation;
    recoverDeadWorker(s);
    for (const q of s.q.values()) {
      assert.notEqual(q.ownerGeneration, deadGeneration, `rep ${rep} stale owner generation`);
    }
    assert.equal([...s.q.values()].filter(q => q.state === 'queued').length, 2);
    assertStableExact(s, `rep ${rep}`);
  }
});

function applyCrashStageForExistingActive(s, id, stage) {
  if (stage >= 1) assert.equal(beginClaim(s, id, KIND_ACTIVE), true);
  if (stage === 2) managerHarvest(s);
  if (stage >= 3) emitClaimVector(s, id);
  if (stage === 4) managerHarvest(s);
  if (stage >= 5) finalizeClaim(s, id);
  if (stage >= 6) managerHarvest(s);
}

test('deferred READY accounting is one-sided before harvest: it can under-admit but never overgrant D', () => {
  const active = cloneForCrash(KIND_ACTIVE);
  assert.equal(beginClaim(active, 'q', KIND_ACTIVE), true);
  assert.ok(active.manager.deficit < trueDeficit(active), 'ACTIVE q CAS creates conservative D lag');
  emitClaimVector(active, 'q');
  finalizeClaim(active, 'q');
  assert.ok(active.manager.deficit < trueDeficit(active), 'pending active vector remains conservative');
  managerHarvest(active);
  assert.equal(active.manager.deficit, trueDeficit(active));

  const sched = cloneForCrash(KIND_SCHED);
  assert.equal(beginClaim(sched, 'q', KIND_SCHED), true);
  assert.ok(sched.manager.deficit < trueDeficit(sched), 'scheduler q CAS conservatively undercounts until availability clears');
  emitClaimVector(sched, 'q');
  finalizeClaim(sched, 'q');
  assert.equal(sched.manager.deficit, trueDeficit(sched), 'scheduler claim net D is zero even before READY harvest');
  managerHarvest(sched);
  assertStableExact(sched);
});

test('NEES accounting: normal claim uses one worker-ledger RMW but adds one transient qExecution finalization', () => {
  for (const kind of [KIND_ACTIVE, KIND_SCHED]) {
    const s = cloneForCrash(kind);
    claimNormally(s, 'q', kind);
    assert.equal(s.worker.ledgerRmw, 1, `${kind} ledger RMW`);
    assert.equal(s.worker.qExecutionRmw, 2, `${kind} qExecution transitions`);
    assert.equal(s.worker.packedAuthorityWorkerCas, 0, `${kind} packed authority worker CAS`);
    assert.equal(s.worker.deferredClaims, 0);
  }
});
