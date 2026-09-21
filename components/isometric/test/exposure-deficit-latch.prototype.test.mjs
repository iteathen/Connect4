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
