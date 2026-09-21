import test from 'node:test';
import assert from 'node:assert/strict';

// Research prototype only. It models a lower-traffic realization of the
// conserved-deficit family. The shared deficit remains the capacity authority;
// workerIdle is reinterpreted as a per-worker monotonic credit ledger plus an
// availability bit so common worker transitions do not serialize on it.
//
// workerWord layout in this model:
//   bit 0      : scheduler availability (1 = can claim a top-level READY q)
//   bits 1..31 : monotonically increasing +1 deficit-credit epoch
//
// Every worker-origin transition whose algebraic effect is D += 1 emits one
// credit by adding 2. A top-level completion also makes the slot available, so
// BUSY -> AVAILABLE is +3. The manager batches epoch deltas into D.

const AVAILABLE = 1;
const CREDIT_STEP = 2;

function epoch(word) { return word >>> 1; }
function available(word) { return word & AVAILABLE; }

function state({ deficit = 0, ready = 0, workerWord = 0, q = 'none' } = {}) {
  return {
    deficit,
    ready,
    workerWord,
    managerSeenEpoch: epoch(workerWord),
    q,
    expectedCreditEpoch: -1,
    workerLedgerRmw: 0,
    packedAuthorityWorkerCas: 0,
    managerDeficitRmw: 0,
  };
}

function harvestWorkerCredits(s) {
  const now = epoch(s.workerWord);
  const delta = now - s.managerSeenEpoch;
  assert.ok(delta >= 0, 'prototype excludes epoch wrap');
  if (delta !== 0) {
    s.deficit += delta;
    s.managerSeenEpoch = now;
    s.managerDeficitRmw++;
  }
  return delta;
}

function topLevelComplete(s) {
  assert.equal(available(s.workerWord), 0, 'completion must start BUSY');
  s.workerWord += CREDIT_STEP + AVAILABLE; // one per-worker RMW in production
  s.workerLedgerRmw++;
}

function schedulerClaimReady(s) {
  assert.equal(available(s.workerWord), 1, 'scheduler claim consumes availability');
  assert.equal(s.q, 'queued');
  assert.equal(s.ready, 1);
  // Existing qExecution CAS is the work-authority linearization. Clearing the
  // availability bit and READY coverage has net D effect 0.
  s.q = 'scheduler-running';
  s.ready = 0;
  s.workerWord -= AVAILABLE;
  s.workerLedgerRmw++;
}

function activeClaimQ(s) {
  assert.equal(available(s.workerWord), 0, 'local reclaim occurs while BUSY');
  assert.equal(s.q, 'queued');
  assert.equal(s.ready, 1);
  const nextEpoch = epoch(s.workerWord) + 1;
  // Production qExecution can encode active-origin plus the expected credit
  // epoch/parity without becoming another semantic/work authority.
  s.q = 'active-running';
  s.expectedCreditEpoch = nextEpoch;
}

function activeClaimDecReady(s) {
  assert.equal(s.q, 'active-running');
  assert.equal(s.ready, 1);
  s.ready = 0;
}

function emitActiveClaimCredit(s) {
  assert.equal(s.q, 'active-running');
  assert.equal(available(s.workerWord), 0);
  s.workerWord += CREDIT_STEP;
  s.workerLedgerRmw++;
  assert.equal(epoch(s.workerWord), s.expectedCreditEpoch);
}

function recoverDeadActiveClaim(s) {
  assert.equal(s.q, 'active-running');
  // Recovery first folds every durable worker credit into D. This removes any
  // ambiguity about whether the current active reclaim reached its credit RMW.
  harvestWorkerCredits(s);
  const credited = epoch(s.workerWord) >= s.expectedCreditEpoch;

  // qExecution is authoritative. Restoring the dead running q to QUEUED makes
  // READY coverage exact again. If its D+=1 credit was emitted, cancel it;
  // otherwise the stored D still carries the original READY coverage and no
  // correction is needed.
  s.q = 'queued';
  s.ready = 1;
  if (credited) {
    s.deficit -= 1;
    s.managerDeficitRmw++;
  }

  // Dead BUSY slot -> replacement AVAILABLE while the requeued q supplies one
  // unit of coverage: +availability and +READY cancel, so no credit epoch is
  // emitted for this recovery transition.
  if (!available(s.workerWord)) s.workerWord += AVAILABLE;
  s.expectedCreditEpoch = -1;
}

function recoverDeadBusyWithoutRequeue(s) {
  assert.equal(available(s.workerWord), 0);
  harvestWorkerCredits(s);
  // No READY replacement exists, so replacement availability is genuinely
  // uncovered capacity and must add one D credit.
  s.workerWord += CREDIT_STEP + AVAILABLE;
  s.workerLedgerRmw++;
  harvestWorkerCredits(s);
}

test('top-level completion credit survives immediate scheduler re-claim without global worker CAS', () => {
  const s = state({ deficit: -1, ready: 1, workerWord: 0, q: 'none' });
  topLevelComplete(s);              // logical D: 0, worker available
  s.q = 'queued';
  schedulerClaimReady(s);           // logical D stays 0: availability-- and READY--
  harvestWorkerCredits(s);
  assert.equal(s.deficit, 0);
  assert.equal(available(s.workerWord), 0);
  assert.equal(s.packedAuthorityWorkerCas, 0);
  assert.equal(s.workerLedgerRmw, 2); // replaces existing workerIdle exchanges, no global CAS
});

test('ACTIVE READY reclaim emits one per-worker credit and no packed-authority worker CAS', () => {
  const s = state({ deficit: -1, ready: 1, workerWord: 0, q: 'queued' });
  activeClaimQ(s);
  activeClaimDecReady(s);
  emitActiveClaimCredit(s);
  harvestWorkerCredits(s);
  assert.equal(s.deficit, 0);
  assert.equal(s.ready, 0);
  assert.equal(s.packedAuthorityWorkerCas, 0);
  assert.equal(s.workerLedgerRmw, 1);
});

test('ACTIVE READY crash prefixes recover exact D whether credit was emitted or not', () => {
  for (let crash = 0; crash < 5; crash++) {
    const s = state({ deficit: -1, ready: 1, workerWord: 0, q: 'queued' });
    if (crash >= 1) activeClaimQ(s);
    if (crash >= 2) activeClaimDecReady(s);
    if (crash >= 3) emitActiveClaimCredit(s);
    if (crash >= 4) harvestWorkerCredits(s);

    if (s.q === 'active-running') recoverDeadActiveClaim(s);
    else if (s.q === 'queued' && !available(s.workerWord)) s.workerWord += AVAILABLE;

    // Recovery returns to the pre-claim scheduling balance: one replacement
    // slot available and one READY q covering it, so D remains -1 relative to
    // this model's fixed outside capacity contribution.
    assert.equal(s.deficit, -1, `crash prefix ${crash}`);
    if (s.q === 'queued') {
      assert.equal(s.ready, 1);
      assert.equal(available(s.workerWord), 1);
    }
  }
});

test('dead BUSY worker with no q requeue creates exactly one uncovered replacement credit', () => {
  const s = state({ deficit: 0, ready: 0, workerWord: 0, q: 'none' });
  recoverDeadBusyWithoutRequeue(s);
  assert.equal(s.deficit, 1);
  assert.equal(available(s.workerWord), 1);
});

test('repeated active-claim death/respawn does not drift D', () => {
  for (let rep = 0; rep < 1000; rep++) {
    const s = state({ deficit: -1, ready: 1, workerWord: 0, q: 'queued' });
    activeClaimQ(s);
    activeClaimDecReady(s);
    if ((rep & 1) !== 0) emitActiveClaimCredit(s);
    if ((rep & 3) === 3) harvestWorkerCredits(s);
    recoverDeadActiveClaim(s);
    assert.equal(s.deficit, -1);
    assert.equal(s.ready, 1);
    assert.equal(available(s.workerWord), 1);
  }
});

test('NEES projection: idle/claim detectability leaves packed authority to exposure only', () => {
  const completion = state({ deficit: 0, workerWord: 0 });
  topLevelComplete(completion);
  harvestWorkerCredits(completion);

  const reclaim = state({ deficit: -1, ready: 1, workerWord: 0, q: 'queued' });
  activeClaimQ(reclaim);
  activeClaimDecReady(reclaim);
  emitActiveClaimCredit(reclaim);
  harvestWorkerCredits(reclaim);

  assert.equal(completion.packedAuthorityWorkerCas, 0);
  assert.equal(reclaim.packedAuthorityWorkerCas, 0);
  assert.equal(completion.workerLedgerRmw, 1);
  assert.equal(reclaim.workerLedgerRmw, 1);
  // Manager can batch multiple epoch deltas into one shifted add on the packed
  // D word while preserving the exposure-owner low bits. Exposure remains the
  // only worker transition that needs the packed provisional-owner CAS.
});
