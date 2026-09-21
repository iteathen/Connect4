import test from 'node:test';
import assert from 'node:assert/strict';

const NONE = -1;
const OWNER_BITS = 9;
const OWNER_MASK = (1 << OWNER_BITS) - 1;
const DEFICIT_BITS = 32 - OWNER_BITS;
const DEFICIT_MIN = -(1 << (DEFICIT_BITS - 1));
const DEFICIT_MAX = (1 << (DEFICIT_BITS - 1)) - 1;

function packAuthority(deficit, owner = NONE) {
  if (!Number.isInteger(deficit) || deficit < DEFICIT_MIN || deficit > DEFICIT_MAX) {
    throw new RangeError('prototype deficit out of packed range');
  }
  if (!Number.isInteger(owner) || owner < NONE || owner > 255) {
    throw new RangeError('prototype owner out of packed range');
  }
  const ownerCode = owner + 1;
  const deficitField = deficit & ((1 << DEFICIT_BITS) - 1);
  return ((deficitField << OWNER_BITS) | ownerCode) | 0;
}

function unpackAuthority(word) {
  const ownerCode = word & OWNER_MASK;
  const deficit = word >> OWNER_BITS;
  return { deficit, owner: ownerCode - 1 };
}

function currentFalseGrantRace() {
  const s = { idle: 1, ready: 1, permits: 0 };
  // Current worker claim order: READY_COUNT--, then workerIdle=0.
  s.ready--;
  // Current manager-style reconstruction sees a false uncovered unit here.
  const uncovered = Math.max(0, s.idle - s.ready - s.permits);
  s.permits += uncovered;
  s.idle--;
  return s;
}

function state({
  idle = 0,
  ready = 0,
  deficit = idle - ready,
  provisionalOwner = NONE,
  pending = [],
  published = [],
} = {}) {
  return {
    idle,
    ready,
    deficit,
    provisionalOwner,
    pending: new Set(pending),
    published: new Set(published),
  };
}

function exposureCount(s) {
  // A provisional owner and that same worker's pending ledger are one
  // reservation during transfer, not two independent exposures.
  const owners = new Set([...s.pending, ...s.published]);
  if (s.provisionalOwner !== NONE) owners.add(s.provisionalOwner);
  return owners.size;
}

function trueUncovered(s) {
  return s.idle - s.ready - exposureCount(s);
}

function assertSafe(s, label = '') {
  assert.ok(
    s.deficit <= trueUncovered(s),
    `${label}: represented deficit ${s.deficit} exceeds true uncovered ${trueUncovered(s)}`,
  );
}

// Transition ordering is intentionally one-sided: a torn transition may
// understate helper capacity, but must never manufacture authorization.
function activeBecomesIdle(s) {
  s.idle++;
  assertSafe(s, 'active->idle after idle++');
  s.deficit++;
  assertSafe(s, 'active->idle after deficit++');
}

function idleDies(s) {
  s.deficit--;
  assertSafe(s, 'idle death after deficit--');
  s.idle--;
  assertSafe(s, 'idle death after idle--');
}

function admitReady(s) {
  s.deficit--;
  assertSafe(s, 'ready admission after deficit--');
  s.ready++;
  assertSafe(s, 'ready admission after ready++');
}

function removeReady(s) {
  s.ready--;
  assertSafe(s, 'ready removal after ready--');
  s.deficit++;
  assertSafe(s, 'ready removal after deficit++');
}

function idleClaimsReady(s) {
  s.ready--;
  assertSafe(s, 'idle READY claim after ready--');
  s.idle--;
  assertSafe(s, 'idle READY claim after idle--');
  // Net deficit change is zero.
}

function activeClaimsReady(s) {
  s.ready--;
  assertSafe(s, 'active READY claim after ready--');
  s.deficit++;
  assertSafe(s, 'active READY claim after deficit++');
}

// One packed atomic transition consumes capacity and records who owns the short
// authority -> pending-ledger handoff.
function reserveExposure(s, workerId) {
  if (s.deficit <= 0 || s.provisionalOwner !== NONE) return false;
  s.deficit--;
  s.provisionalOwner = workerId;
  assertSafe(s, `reserve exposure worker ${workerId}`);
  return true;
}

function beginBranch(s, workerId) {
  assert.equal(s.provisionalOwner, workerId, 'only provisional owner may begin branch');
  assert.equal(s.pending.has(workerId), false, 'worker already has pending branch');
  s.pending.add(workerId);
}

function transferToPending(s, workerId) {
  assert.equal(s.pending.has(workerId), true, 'pending ledger missing');
  assert.equal(s.provisionalOwner, workerId, 'provisional owner mismatch');
  s.provisionalOwner = NONE;
  assertSafe(s, `transfer provisional->pending worker ${workerId}`);
}

function publishBranch(s, workerId) {
  assert.equal(s.pending.has(workerId), true, 'pending branch missing');
  s.published.add(workerId);
  s.pending.delete(workerId);
  assertSafe(s, `publish branch worker ${workerId}`);
}

function consumePublishedAsReady(s, workerId) {
  assert.equal(s.published.delete(workerId), true, 'published branch missing');
  // Exposure E-- and READY R++ have net deficit zero. Releasing E first is
  // conservative: it can only transiently increase true uncovered capacity.
  s.ready++;
  assertSafe(s, `published->ready worker ${workerId}`);
}

function recoverDeadWorker(s, workerId) {
  if (s.provisionalOwner === workerId) {
    if (s.pending.has(workerId)) {
      // The pending ledger already accepted ownership; no refund here.
      s.provisionalOwner = NONE;
    } else {
      // Authorization CAS took effect but no ledger owns it: exact refund.
      s.provisionalOwner = NONE;
      s.deficit++;
    }
  }

  if (s.pending.delete(workerId)) {
    // Unpublished branch disappears: restore its consumed helper capacity.
    s.deficit++;
  }

  // Published descriptors survive worker death and retain the reservation.
  assertSafe(s, `recover worker ${workerId}`);
}

test('current aggregate/census authority reproduces false authorization', () => {
  const s = currentFalseGrantRace();
  assert.deepEqual(s, { idle: 0, ready: 0, permits: 1 });
  assert.ok(s.permits > Math.max(0, s.idle - s.ready));
});

test('delta authority makes torn idle READY claim conservative without a manager snapshot', () => {
  const s = state({ idle: 1, ready: 1, deficit: 0 });
  idleClaimsReady(s);
  assert.deepEqual(
    { idle: s.idle, ready: s.ready, deficit: s.deficit },
    { idle: 0, ready: 0, deficit: 0 },
  );
});

test('provisional latch exactly recovers crash after authorization CAS before branch ledger', () => {
  const s = state({ idle: 1, ready: 0, deficit: 1 });
  assert.equal(reserveExposure(s, 0), true);
  assert.equal(s.deficit, 0);
  assert.equal(s.provisionalOwner, 0);
  recoverDeadWorker(s, 0);
  assert.equal(s.deficit, 1);
  assert.equal(s.provisionalOwner, NONE);
  assertSafe(s);
});

test('crash after pending ledger store transfers recovery exactly once', () => {
  const s = state({ idle: 1, ready: 0, deficit: 1 });
  assert.equal(reserveExposure(s, 0), true);
  beginBranch(s, 0);
  // Crash before provisional latch clear: both structures identify one txn.
  recoverDeadWorker(s, 0);
  assert.equal(s.deficit, 1, 'capacity must be refunded exactly once');
  assert.equal(s.provisionalOwner, NONE);
  assert.equal(s.pending.size, 0);
  assertSafe(s);
});

test('crash after provisional clear before publication is owned by pending ledger', () => {
  const s = state({ idle: 1, ready: 0, deficit: 1 });
  assert.equal(reserveExposure(s, 0), true);
  beginBranch(s, 0);
  transferToPending(s, 0);
  recoverDeadWorker(s, 0);
  assert.equal(s.deficit, 1);
  assert.equal(s.pending.size, 0);
  assertSafe(s);
});

test('published descriptor survives publisher death and converts to READY without refund', () => {
  const s = state({ idle: 1, ready: 0, deficit: 1 });
  assert.equal(reserveExposure(s, 0), true);
  beginBranch(s, 0);
  transferToPending(s, 0);
  publishBranch(s, 0);
  recoverDeadWorker(s, 0);
  assert.equal(s.deficit, 0);
  assert.equal(s.published.has(0), true);
  consumePublishedAsReady(s, 0);
  assert.equal(s.deficit, 0);
  assert.equal(s.ready, 1);
  idleClaimsReady(s);
  assert.equal(s.deficit, 0);
  assertSafe(s);
});

test('two publishers: dead transaction recovery cannot alter live provisional owner', () => {
  const s = state({ idle: 2, ready: 0, deficit: 2 });
  assert.equal(reserveExposure(s, 0), true);
  beginBranch(s, 0);
  transferToPending(s, 0);

  assert.equal(reserveExposure(s, 1), true);
  assert.equal(s.provisionalOwner, 1);

  recoverDeadWorker(s, 0);
  assert.equal(s.provisionalOwner, 1, 'A recovery must not touch B provisional ownership');
  assert.equal(s.deficit, 1, 'A pending reservation refunded, B remains reserved');

  beginBranch(s, 1);
  transferToPending(s, 1);
  publishBranch(s, 1);
  assertSafe(s);
});

test('branch-capacity failure after reservation is detectable and exactly refundable', () => {
  const s = state({ idle: 1, ready: 0, deficit: 1 });
  assert.equal(reserveExposure(s, 0), true);
  // beginBranch fails before it can install pending ledger.
  recoverDeadWorker(s, 0);
  assert.equal(s.deficit, 1);
  assert.equal(s.provisionalOwner, NONE);
});

test('repeated worker deaths do not leak or double-refund deficit', () => {
  const s = state({ idle: 1, ready: 0, deficit: 1 });
  for (let generation = 0; generation < 1000; generation++) {
    assert.equal(reserveExposure(s, 0), true);
    if ((generation & 1) === 0) {
      recoverDeadWorker(s, 0);
    } else {
      beginBranch(s, 0);
      transferToPending(s, 0);
      recoverDeadWorker(s, 0);
    }
    assert.equal(s.deficit, 1);
    assert.equal(s.provisionalOwner, NONE);
    assert.equal(s.pending.size, 0);
    assert.equal(s.published.size, 0);
    assertSafe(s, `generation ${generation}`);
  }
});

test('basic deficit transition algebra is one-sided safe at every microstep', () => {
  const s = state({ idle: 0, ready: 0, deficit: 0 });
  activeBecomesIdle(s);
  admitReady(s);
  idleClaimsReady(s);
  admitReady(s);
  activeClaimsReady(s);
  activeBecomesIdle(s);
  admitReady(s);
  removeReady(s);
  idleDies(s);
  assert.deepEqual(
    { idle: s.idle, ready: s.ready, deficit: s.deficit },
    { idle: 0, ready: 0, deficit: 0 },
  );
});

test('one Int32 can carry prototype deficit plus provisional worker owner', () => {
  for (const deficit of [-1024, -1, 0, 1, 256, 1024, DEFICIT_MIN, DEFICIT_MAX]) {
    for (const owner of [NONE, 0, 1, 255]) {
      assert.deepEqual(unpackAuthority(packAuthority(deficit, owner)), { deficit, owner });
    }
  }
});


// Production-shape extension. The earlier compact model remains a coarse guard;
// this section mirrors the actual pending-ledger -> branchWrite -> manager
// consumption boundaries and treats NEES synchronization cost as an explicit
// promotion gate rather than assuming correctness implies efficiency.

const P_NONE = -1;

function pState({ workerCount = 2, idle = 0, ready = 0, deficit = idle - ready } = {}) {
  return {
    active: true,
    workerCount,
    idle,
    ready,
    deficit,
    owner: P_NONE,
    pendingPosition: new Int32Array(workerCount).fill(-1),
    pendingRefs: new Int32Array(workerCount),
    descriptorPrepared: new Int32Array(workerCount),
    branchWrite: new Int32Array(workerCount),
    branchRead: new Int32Array(workerCount),
    transferCredit: 0,
    authorityUpdates: 0,
  };
}

function pPublished(s, worker) {
  return s.branchWrite[worker] - s.branchRead[worker];
}

function pExposureCount(s) {
  let count = s.transferCredit;
  if (s.owner !== P_NONE && s.pendingPosition[s.owner] < 0) count++;
  for (let worker = 0; worker < s.workerCount; worker++) {
    count += pPublished(s, worker);
    const pending = s.pendingPosition[worker];
    if (pending >= 0 && s.branchWrite[worker] <= pending) count++;
  }
  return count;
}

function pTrueUncovered(s) {
  return s.idle - s.ready - pExposureCount(s);
}

function pSafe(s, label = '') {
  if (!s.active) return;
  assert.ok(s.deficit <= pTrueUncovered(s), label + ': false authorization');
}

function pAdjust(s, delta, label) {
  s.deficit += delta;
  s.authorityUpdates++;
  pSafe(s, label);
}

function pActiveIdle(s) {
  s.idle++;
  pSafe(s, 'active->idle publish');
  pAdjust(s, 1, 'active->idle authority');
}

function pAdmitReady(s) {
  pAdjust(s, -1, 'ready admission authority');
  s.ready++;
  pSafe(s, 'ready admission publish');
}

function pRemoveReady(s) {
  s.ready--;
  pSafe(s, 'ready removal publish');
  pAdjust(s, 1, 'ready removal authority');
}

function pIdleClaim(s) {
  s.ready--;
  pSafe(s, 'idle claim ready--');
  s.idle--;
  pSafe(s, 'idle claim idle--');
}

function pActiveClaim(s) {
  s.ready--;
  pSafe(s, 'active claim ready--');
  pAdjust(s, 1, 'active claim authority');
}

function pReserve(s, worker) {
  if (s.deficit <= 0 || s.owner !== P_NONE) return false;
  s.deficit--;
  s.owner = worker;
  s.authorityUpdates++;
  pSafe(s, 'reserve exposure');
  return true;
}

function pBegin(s, worker, refs = 1) {
  assert.equal(s.owner, worker);
  assert.equal(s.pendingPosition[worker], -1);
  s.pendingPosition[worker] = s.branchWrite[worker];
  s.pendingRefs[worker] = refs;
  pSafe(s, 'begin branch');
}

function pClearOwner(s, worker) {
  assert.equal(s.owner, worker);
  assert.notEqual(s.pendingPosition[worker], -1);
  s.owner = P_NONE;
  s.authorityUpdates++;
  pSafe(s, 'clear provisional owner');
}

function pWriteDescriptor(s, worker) {
  assert.notEqual(s.pendingPosition[worker], -1);
  s.descriptorPrepared[worker] = 1;
  pSafe(s, 'descriptor fields');
}

function pPublishWrite(s, worker) {
  const position = s.pendingPosition[worker];
  assert.notEqual(position, -1);
  assert.equal(s.descriptorPrepared[worker], 1);
  assert.equal(s.branchWrite[worker], position);
  s.branchWrite[worker] = position + 1;
  pSafe(s, 'branchWrite publish');
}

function pClearPendingRefs(s, worker) {
  s.pendingRefs[worker] = 0;
  pSafe(s, 'pending refs clear');
}

function pClearPendingPosition(s, worker) {
  s.pendingPosition[worker] = -1;
  s.descriptorPrepared[worker] = 0;
  pSafe(s, 'pending position clear');
}

function pRecover(s, worker) {
  if (s.owner === worker) {
    if (s.pendingPosition[worker] < 0) {
      s.owner = P_NONE;
      pAdjust(s, 1, 'recover provisional-only');
    } else {
      s.owner = P_NONE;
      s.authorityUpdates++;
    }
  }
  const position = s.pendingPosition[worker];
  if (position >= 0) {
    const published = s.branchWrite[worker] > position;
    s.pendingRefs[worker] = 0;
    s.pendingPosition[worker] = -1;
    s.descriptorPrepared[worker] = 0;
    if (!published) pAdjust(s, 1, 'recover unpublished');
  }
  pSafe(s, 'recover dead worker');
}

function pConsumeDescriptor(s, worker) {
  assert.ok(pPublished(s, worker) > 0);
  // Retire descriptor coverage before installing manager-local transfer credit.
  // The gap can only understate usable coverage; deficit is unchanged.
  s.branchRead[worker]++;
  pSafe(s, 'descriptor retired before transfer credit');
  s.transferCredit++;
  pSafe(s, 'manager transfer credit installed');
}

function pAdmitFromManager(s) {
  if (s.transferCredit > 0) {
    s.transferCredit--;
    s.ready++;
    pSafe(s, 'transfer credit -> READY');
    return;
  }
  pAdmitReady(s);
}

function pReleaseCredit(s) {
  if (s.transferCredit <= 0) return;
  const credit = s.transferCredit;
  s.transferCredit = 0;
  pAdjust(s, credit, 'release unused transfer credit');
}

function pPublishFully(s, worker) {
  assert.equal(pReserve(s, worker), true);
  pBegin(s, worker);
  pClearOwner(s, worker);
  pWriteDescriptor(s, worker);
  pPublishWrite(s, worker);
  pClearPendingRefs(s, worker);
  pClearPendingPosition(s, worker);
}

test('production-shaped publication death prefixes refund only before branchWrite', () => {
  for (let point = 0; point < 6; point++) {
    const s = pState({ workerCount: 1, idle: 1, deficit: 1 });
    assert.equal(pReserve(s, 0), true);
    if (point === 0) { pRecover(s, 0); assert.equal(s.deficit, 1); continue; }
    pBegin(s, 0);
    if (point === 1) { pRecover(s, 0); assert.equal(s.deficit, 1); continue; }
    pClearOwner(s, 0);
    if (point === 2) { pRecover(s, 0); assert.equal(s.deficit, 1); continue; }
    pWriteDescriptor(s, 0);
    if (point === 3) { pRecover(s, 0); assert.equal(s.deficit, 1); continue; }
    pPublishWrite(s, 0);
    if (point === 4) {
      pRecover(s, 0);
      assert.equal(s.deficit, 0);
      assert.equal(pPublished(s, 0), 1);
      continue;
    }
    pClearPendingRefs(s, 0);
    pRecover(s, 0);
    assert.equal(s.deficit, 0);
    assert.equal(pPublished(s, 0), 1);
  }
});

test('published multiplicity is ring cardinality, not worker identity', () => {
  const s = pState({ workerCount: 1, idle: 2, deficit: 2 });
  pPublishFully(s, 0);
  pPublishFully(s, 0);
  assert.equal(pPublished(s, 0), 2);
  assert.equal(pExposureCount(s), 2);
  pSafe(s);
});

test('manager coverage transfer handles descriptor -> 0/1/N READY', () => {
  const zero = pState({ workerCount: 1, idle: 1, deficit: 1 });
  pPublishFully(zero, 0);
  pConsumeDescriptor(zero, 0);
  pReleaseCredit(zero);
  assert.deepEqual({ ready: zero.ready, deficit: zero.deficit }, { ready: 0, deficit: 1 });

  const one = pState({ workerCount: 1, idle: 1, deficit: 1 });
  pPublishFully(one, 0);
  pConsumeDescriptor(one, 0);
  pAdmitFromManager(one);
  assert.deepEqual({ ready: one.ready, deficit: one.deficit }, { ready: 1, deficit: 0 });

  const many = pState({ workerCount: 1, idle: 1, deficit: 1 });
  pPublishFully(many, 0);
  pConsumeDescriptor(many, 0);
  pAdmitFromManager(many);
  pAdmitFromManager(many);
  pAdmitFromManager(many);
  assert.deepEqual({ ready: many.ready, deficit: many.deficit }, { ready: 3, deficit: -2 });
});

test('multiple descriptor credits may collapse into fewer READY without false authorization', () => {
  const s = pState({ workerCount: 1, idle: 2, deficit: 2 });
  pPublishFully(s, 0);
  pPublishFully(s, 0);
  pConsumeDescriptor(s, 0);
  pConsumeDescriptor(s, 0);
  assert.equal(s.transferCredit, 2);
  pAdmitFromManager(s);
  pReleaseCredit(s);
  assert.deepEqual(
    { ready: s.ready, deficit: s.deficit, credit: s.transferCredit },
    { ready: 1, deficit: 1, credit: 0 },
  );
});

test('queued exact/stale retirement and READY claims preserve deficit algebra', () => {
  const remove = pState({ idle: 1, ready: 1, deficit: 0 });
  pRemoveReady(remove);
  assert.deepEqual({ ready: remove.ready, deficit: remove.deficit }, { ready: 0, deficit: 1 });

  const active = pState({ idle: 0, ready: 1, deficit: -1 });
  pActiveClaim(active);
  assert.deepEqual({ ready: active.ready, deficit: active.deficit }, { ready: 0, deficit: 0 });

  const idle = pState({ idle: 1, ready: 1, deficit: 0 });
  pIdleClaim(idle);
  assert.deepEqual(
    { idle: idle.idle, ready: idle.ready, deficit: idle.deficit },
    { idle: 0, ready: 0, deficit: 0 },
  );
});

test('dead publisher recovery cannot alter another live provisional owner', () => {
  const s = pState({ workerCount: 2, idle: 2, deficit: 2 });
  assert.equal(pReserve(s, 0), true);
  pBegin(s, 0);
  pClearOwner(s, 0);
  assert.equal(pReserve(s, 1), true);
  pRecover(s, 0);
  assert.equal(s.owner, 1);
  assert.equal(s.deficit, 1);
  pSafe(s);
});

test('worker id reuse waits for old provisional/pending disposition while published descriptors may survive', () => {
  const unpublished = pState({ workerCount: 1, idle: 1, deficit: 1 });
  assert.equal(pReserve(unpublished, 0), true);
  pBegin(unpublished, 0);
  pClearOwner(unpublished, 0);
  pRecover(unpublished, 0);
  assert.equal(unpublished.pendingPosition[0], -1);
  assert.equal(pReserve(unpublished, 0), true);

  const published = pState({ workerCount: 1, idle: 2, deficit: 2 });
  pPublishFully(published, 0);
  pRecover(published, 0);
  pPublishFully(published, 0);
  assert.equal(pPublished(published, 0), 2);
});

test('repeated crash prefixes do not leak or double-refund deficit', () => {
  for (let point = 0; point < 6; point++) {
    const s = pState({ workerCount: 1, idle: 1, deficit: 1 });
    for (let generation = 0; generation < 200; generation++) {
      assert.equal(pReserve(s, 0), true);
      if (point >= 1) pBegin(s, 0);
      if (point >= 2) pClearOwner(s, 0);
      if (point >= 3) pWriteDescriptor(s, 0);
      if (point >= 4) pPublishWrite(s, 0);
      if (point >= 5) pClearPendingRefs(s, 0);
      pRecover(s, 0);
      if (point >= 4) {
        pConsumeDescriptor(s, 0);
        pReleaseCredit(s);
      }
      assert.equal(s.deficit, 1, 'point=' + point + ' generation=' + generation);
      assert.equal(s.owner, P_NONE);
      assert.equal(s.pendingPosition[0], -1);
      assert.equal(pPublished(s, 0), 0);
      assert.equal(s.transferCredit, 0);
      pSafe(s);
    }
  }
});

test('NEES projection exposes added authority traffic instead of assuming a win', () => {
  const s = pState({ workerCount: 1 });
  pActiveIdle(s);                       // new authority update
  assert.equal(pReserve(s, 0), true);  // packed CAS
  pBegin(s, 0);                        // existing ledger write
  pClearOwner(s, 0);                   // packed owner clear
  pWriteDescriptor(s, 0);
  pPublishWrite(s, 0);
  pClearPendingRefs(s, 0);
  pClearPendingPosition(s, 0);
  pConsumeDescriptor(s, 0);
  pAdmitFromManager(s);                // manager-local transfer; no authority update
  pIdleClaim(s);                       // net-zero deficit; no authority update
  assert.equal(s.authorityUpdates, 3);
  assert.equal(s.deficit, 0);
  // Production promotion must measure CAS retries/cache-line contention and
  // compare these updates against the removed inflight/completeExposure path.
});

// Qualification-only contention adapter. The p* functions above remain the
// authoritative prototype transitions; this layer only observes attempts
// behind the existing provisional owner. CAS attempt means one modeled atomic
// handoff. A retry is a failed handoff whose owner coordinate was occupied.
// ownerBusyObservations counts coordinate-level observations; ownerBusyMisses
// counts the affected worker's private defer instead of a spin. Durations are
// model steps from first attempt through successful completion or crash.
function contentionHarness({
  workerCount = 2,
  idle = 0,
  ready = 0,
  deficit = idle - ready,
  horizon = 8,
} = {}) {
  const s = pState({ workerCount, idle, ready, deficit });
  s.step = 0;
  s.horizon = horizon;
  s.authorityCasAttempts = 0;
  s.authorityCasSuccesses = 0;
  s.authorityCasRetries = 0;
  s.ownerBusyObservations = 0;
  s.ownerBusyMisses = 0;
  s.ownerHeldSteps = 0;
  s.maxOwnerHeldSteps = 0;
  s.deferredByWorker = new Int32Array(workerCount);
  s.reservationStart = new Int32Array(workerCount).fill(-1);
  s.reservationEnd = new Int32Array(workerCount).fill(-1);
  s.reservationDurations = [];
  s.maxReservationDurationSteps = 0;
  s.ownerBusyWorkers = new Set();
  s.crashRecoveries = 0;
  s.recoveredUnpublishedRefunds = 0;
  s.stepKinds = [];
  return s;
}

function recordReservation(h, worker, step) {
  const start = h.reservationStart[worker];
  assert.ok(start >= 0, 'reservation started before completion');
  const duration = step - start + 1;
  h.reservationEnd[worker] = step;
  h.reservationDurations.push(duration);
  h.maxReservationDurationSteps = Math.max(
    h.maxReservationDurationSteps,
    duration,
  );
}

function attemptTransaction(h, worker, kind, crashAfter = null) {
  const step = h.step;
  assert.ok(
    Number.isInteger(worker) && worker >= 0 && worker < h.workerCount,
    `invalid contention worker ${worker}`,
  );
  assert.ok(step < h.horizon, `contention step ${step} exceeds horizon`);
  assert.ok(
    crashAfter === null || crashAfter === 'afterBegin',
    `unsupported crash point ${crashAfter}`,
  );

  if (h.reservationStart[worker] < 0) h.reservationStart[worker] = step;
  h.authorityCasAttempts++;

  if (h.owner !== P_NONE) {
    h.authorityCasRetries++;
    h.ownerBusyObservations++;
    h.ownerBusyMisses++;
    h.deferredByWorker[worker]++;
    h.ownerBusyWorkers.add(worker);
    pSafe(h, `owner busy worker ${worker}`);
    return { acquired: false, crashed: false };
  }

  if (kind === 'exposure') {
    if (!pReserve(h, worker)) {
      throw new Error(`exposure reservation failed for worker ${worker}`);
    }
  } else if (kind === 'activeRegistration') {
    h.owner = worker;
    pActiveIdle(h);
  } else if (kind === 'activeReadyClaim') {
    h.owner = worker;
    pActiveClaim(h);
  } else {
    throw new Error(`unknown contention transaction ${kind}`);
  }

  h.authorityCasSuccesses++;
  h.ownerHeldSteps++;
  h.maxOwnerHeldSteps = Math.max(h.maxOwnerHeldSteps, 1);

  if (kind === 'exposure') {
    pBegin(h, worker);
    pSafe(h, 'exposure branch ledger');
    if (crashAfter === 'afterBegin') {
      recordReservation(h, worker, step);
      return { acquired: true, crashed: true };
    }
    pClearOwner(h, worker);
    pWriteDescriptor(h, worker);
    pPublishWrite(h, worker);
    pClearPendingRefs(h, worker);
    pClearPendingPosition(h, worker);
  } else {
    h.owner = P_NONE;
    pSafe(h, `${kind} owner clear`);
  }

  recordReservation(h, worker, step);
  pSafe(h, `${kind} completion`);
  return { acquired: true, crashed: false };
}

function runStep(h, attempts, recoverCrashed = true) {
  assert.ok(h.step < h.horizon, `contention step ${h.step} exceeds horizon`);
  h.stepKinds.push(attempts.map(([, kind]) => kind));
  const crashed = [];

  for (const [worker, kind, crashAfter] of attempts) {
    const result = attemptTransaction(h, worker, kind, crashAfter);
    if (result.crashed) crashed.push(worker);
  }

  h.step++;
  if (recoverCrashed) {
    for (const worker of crashed) {
      const refund = recoverDeadWorker(h, worker, 'crashed contention transaction');
      assert.equal(refund, 1, 'unpublished exposure must refund exactly once');
    }
    assert.equal(h.owner, P_NONE, 'recovered contention transaction leaked owner');
    pSafe(h, 'contention step boundary');
  }
}

function recoverDeadWorker(h, worker, label = 'dead worker') {
  const before = h.deficit;
  pRecover(h, worker);
  h.crashRecoveries++;
  const refund = h.deficit - before;
  assert.ok(refund >= 0, `${label} unexpectedly increased deficit`);
  if (refund > 0) h.recoveredUnpublishedRefunds++;
  pSafe(h, `${label} after recovery`);
  return refund;
}

function closePublishedExposure(h, worker) {
  assert.equal(
    pPublished(h, worker),
    1,
    `expected one published exposure for worker ${worker}`,
  );
  pConsumeDescriptor(h, worker);
  pAdmitFromManager(h);
}

function assertState(h, expected) {
  pSafe(h, 'contention final state');
  assert.equal(h.idle, expected.idle, 'idle conservation');
  assert.equal(h.ready, expected.ready, 'READY conservation');
  assert.equal(h.deficit, expected.deficit, 'conserved Δ conservation');
}

test('2-worker mixed contention defers privately and conserves after tagged recovery', () => {
  // Preserve the existing tagged crash-prefix cases above while adding a
  // contention schedule around registration, READY claim, and exposure handoff.
  const h = contentionHarness({
    workerCount: 2,
    idle: 5,
    ready: 1,
    deficit: 3,
    horizon: 6,
  });

  runStep(h, [[0, 'activeRegistration']]);

  // Hold the owner through an unpublished exposure prefix, then let the READY
  // claim observe the busy coordinate and defer instead of spinning.
  runStep(
    h,
    [
      [1, 'exposure', 'afterBegin'],
      [0, 'activeReadyClaim'],
    ],
    false,
  );
  assert.equal(recoverDeadWorker(h, 1, 'unpublished exposure'), 1);
  assert.equal(h.owner, P_NONE);
  assert.equal(h.pendingPosition[1], -1);
  assert.equal(pPublished(h, 1), 0);

  runStep(h, [[1, 'exposure']]);
  runStep(h, [[0, 'activeReadyClaim']]);
  closePublishedExposure(h, 1);

  assertState(h, { idle: 6, ready: 2, deficit: 4 });
  assert.equal(h.authorityCasAttempts, 5);
  assert.equal(h.authorityCasSuccesses, 4);
  assert.equal(h.authorityCasRetries, 1);
  assert.equal(h.authorityCasAttempts, h.authorityCasSuccesses + h.authorityCasRetries);
  assert.equal(h.ownerBusyObservations, 1);
  assert.equal(h.ownerBusyMisses, 1);
  assert.equal(h.ownerBusyObservations, h.authorityCasRetries);
  assert.equal(h.ownerBusyMisses, h.authorityCasRetries);
  assert.deepEqual(Array.from(h.deferredByWorker), [1, 0]);
  assert.deepEqual(Array.from(h.ownerBusyWorkers).sort((a, b) => a - b), [0]);
  assert.equal(h.recoveredUnpublishedRefunds, 1);
  assert.equal(h.crashRecoveries, 1);
  assert.deepEqual(
    [...h.reservationDurations].sort((a, b) => a - b),
    [1, 1, 1, 4],
  );
  assert.equal(h.maxReservationDurationSteps, 4);
  assert.equal(h.maxOwnerHeldSteps, 1);
  assert.equal(h.ownerHeldSteps, h.authorityCasSuccesses);
  assert.ok(h.maxReservationDurationSteps <= h.horizon);
  assert.ok(h.maxOwnerHeldSteps <= h.horizon);
});

test('4-worker adversarial mixed contention exposes packed-coordinate serialization', () => {
  const h = contentionHarness({
    workerCount: 4,
    idle: 5,
    ready: 1,
    deficit: 3,
    horizon: 6,
  });

  // All three transaction classes contend in the same model step.
  runStep(h, [
    [0, 'activeRegistration'],
    [1, 'activeReadyClaim'],
    [2, 'exposure'],
    [3, 'exposure'],
  ]);
  runStep(h, [
    [1, 'activeReadyClaim'],
    [2, 'exposure'],
    [3, 'exposure'],
  ]);
  runStep(h, [[2, 'exposure']]);
  runStep(h, [[3, 'exposure']]);
  closePublishedExposure(h, 2);
  closePublishedExposure(h, 3);

  assertState(h, { idle: 6, ready: 2, deficit: 3 });
  assert.deepEqual(h.stepKinds[0].sort(), [
    'activeReadyClaim',
    'activeRegistration',
    'exposure',
    'exposure',
  ]);
  assert.equal(h.authorityCasAttempts, 10);
  assert.equal(h.authorityCasSuccesses, 4);
  assert.equal(h.authorityCasRetries, 6);
  assert.equal(h.authorityCasAttempts, h.authorityCasSuccesses + h.authorityCasRetries);
  assert.equal(h.ownerBusyObservations, 6);
  assert.equal(h.ownerBusyMisses, 6);
  assert.equal(h.ownerBusyObservations, h.authorityCasRetries);
  assert.equal(h.ownerBusyMisses, h.authorityCasRetries);
  assert.deepEqual(Array.from(h.deferredByWorker), [0, 1, 2, 3]);
  assert.deepEqual(Array.from(h.ownerBusyWorkers).sort((a, b) => a - b), [1, 2, 3]);
  assert.equal(h.recoveredUnpublishedRefunds, 0);
  assert.equal(h.crashRecoveries, 0);
  assert.deepEqual(
    [...h.reservationDurations].sort((a, b) => a - b),
    [1, 2, 3, 4],
  );
  assert.equal(h.maxReservationDurationSteps, 4);
  assert.equal(h.maxOwnerHeldSteps, 1);
  assert.equal(h.ownerHeldSteps, h.authorityCasSuccesses);
  assert.ok(h.maxReservationDurationSteps <= h.horizon);
  assert.ok(h.maxOwnerHeldSteps <= h.horizon);
});
