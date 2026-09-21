import test from 'node:test';
import assert from 'node:assert/strict';

const NONE = 0;
const EXPOSURE_BASE = 1;
const IDLE_BASE = EXPOSURE_BASE + 256;
const ACTIVE_CLAIM_BASE = IDLE_BASE + 256;
const TXN_BITS = 10;
const TXN_MASK = (1 << TXN_BITS) - 1;
const DEFICIT_BITS = 32 - TXN_BITS;
const DEFICIT_MIN = -(1 << (DEFICIT_BITS - 1));
const DEFICIT_MAX = (1 << (DEFICIT_BITS - 1)) - 1;

function txnCode(kind, worker) {
  if (kind === 'none') return NONE;
  assert.ok(worker >= 0 && worker < 256);
  if (kind === 'exposure') return EXPOSURE_BASE + worker;
  if (kind === 'idle') return IDLE_BASE + worker;
  if (kind === 'activeClaim') return ACTIVE_CLAIM_BASE + worker;
  throw new Error('bad txn kind');
}

function decodeTxn(code) {
  if (code === NONE) return { kind: 'none', worker: -1 };
  if (code < IDLE_BASE) return { kind: 'exposure', worker: code - EXPOSURE_BASE };
  if (code < ACTIVE_CLAIM_BASE) return { kind: 'idle', worker: code - IDLE_BASE };
  return { kind: 'activeClaim', worker: code - ACTIVE_CLAIM_BASE };
}

function packAuthority(deficit, code) {
  assert.ok(deficit >= DEFICIT_MIN && deficit <= DEFICIT_MAX);
  assert.ok(code >= 0 && code <= TXN_MASK);
  return ((deficit << TXN_BITS) | code) | 0;
}

function unpackAuthority(word) {
  return { deficit: word >> TXN_BITS, txn: decodeTxn(word & TXN_MASK) };
}

function idleState() {
  return { deficit: 0, txn: NONE, idle: 0, authorityCas: 0 };
}

function acquireIdle(s) {
  assert.equal(s.txn, NONE);
  s.txn = txnCode('idle', 0);
  s.authorityCas++;
}

function publishIdle(s) {
  assert.equal(decodeTxn(s.txn).kind, 'idle');
  s.idle = 1;
}

function commitIdle(s) {
  assert.equal(decodeTxn(s.txn).kind, 'idle');
  s.deficit += 1;
  s.txn = NONE;
  s.authorityCas++;
}

function recoverIdleDeath(s) {
  const txn = decodeTxn(s.txn);
  if (txn.kind === 'idle') {
    s.idle = 0;
    s.txn = NONE;
    s.authorityCas++;
    return;
  }
  if (s.idle) {
    s.deficit -= 1;
    s.idle = 0;
    s.authorityCas++;
  }
}

function claimState() {
  return {
    deficit: -1,
    txn: NONE,
    qQueued: true,
    qRunning: 'none',
    ready: 1,
    authorityCas: 0,
  };
}

function acquireActiveClaim(s) {
  assert.equal(s.txn, NONE);
  s.txn = txnCode('activeClaim', 0);
  s.authorityCas++;
}

function claimQ(s) {
  assert.equal(s.qQueued, true);
  s.qQueued = false;
  s.qRunning = 'active';
}

function decReady(s) {
  assert.equal(s.ready, 1);
  s.ready = 0;
}

function commitActiveClaim(s) {
  assert.equal(decodeTxn(s.txn).kind, 'activeClaim');
  s.deficit += 1;
  s.txn = NONE;
  s.authorityCas++;
}

function recoverActiveClaimDeath(s) {
  const pending = decodeTxn(s.txn).kind === 'activeClaim';
  if (s.qRunning === 'active') {
    s.qRunning = 'none';
    s.qQueued = true;
    // Production recovery already scans qExecution ownership. A cold exact
    // READY recount from qExecution authority removes the torn READY_COUNT
    // decrement as a second source of crash ambiguity.
    s.ready = 1;
    if (!pending) s.deficit -= 1;
  }
  if (pending) {
    s.txn = NONE;
    s.authorityCas++;
  }
}

test('tagged latch exactly recovers ACTIVE->IDLE death at every prefix', () => {
  for (let crash = 0; crash < 4; crash++) {
    const s = idleState();
    if (crash >= 1) acquireIdle(s);
    if (crash >= 2) publishIdle(s);
    if (crash >= 3) commitIdle(s);
    recoverIdleDeath(s);
    assert.deepEqual(
      { deficit: s.deficit, idle: s.idle, txn: s.txn },
      { deficit: 0, idle: 0, txn: NONE },
    );
  }
});

test('tagged latch plus authoritative q recovery handles ACTIVE READY claim prefixes', () => {
  for (let crash = 0; crash < 5; crash++) {
    const s = claimState();
    if (crash >= 1) acquireActiveClaim(s);
    if (crash >= 2) claimQ(s);
    if (crash >= 3) decReady(s);
    if (crash >= 4) commitActiveClaim(s);
    recoverActiveClaimDeath(s);
    assert.deepEqual(
      {
        deficit: s.deficit,
        qQueued: s.qQueued,
        qRunning: s.qRunning,
        ready: s.ready,
        txn: s.txn,
      },
      {
        deficit: -1,
        qQueued: true,
        qRunning: 'none',
        ready: 1,
        txn: NONE,
      },
    );
  }
});

test('repeated death and worker-id reuse do not accumulate deficit drift', () => {
  for (let rep = 0; rep < 1000; rep++) {
    const idle = idleState();
    const idlePoint = rep % 4;
    if (idlePoint >= 1) acquireIdle(idle);
    if (idlePoint >= 2) publishIdle(idle);
    if (idlePoint >= 3) commitIdle(idle);
    recoverIdleDeath(idle);
    assert.equal(idle.deficit, 0);

    const claim = claimState();
    const claimPoint = rep % 5;
    if (claimPoint >= 1) acquireActiveClaim(claim);
    if (claimPoint >= 2) claimQ(claim);
    if (claimPoint >= 3) decReady(claim);
    if (claimPoint >= 4) commitActiveClaim(claim);
    recoverActiveClaimDeath(claim);
    assert.equal(claim.deficit, -1);
  }
});

test('10 transaction bits cover exposure, idle registration, and active claims', () => {
  assert.ok(ACTIVE_CLAIM_BASE + 255 <= TXN_MASK);
  for (const deficit of [-1280, -1, 0, 1, 256, DEFICIT_MIN, DEFICIT_MAX]) {
    for (const [kind, worker] of [
      ['none', 0],
      ['exposure', 255],
      ['idle', 255],
      ['activeClaim', 255],
    ]) {
      const code = txnCode(kind, worker);
      assert.deepEqual(
        unpackAuthority(packAuthority(deficit, code)),
        { deficit, txn: decodeTxn(code) },
      );
    }
  }
});

test('NEES projection exposes serialization cost of exact detectability', () => {
  const idle = idleState();
  acquireIdle(idle);
  publishIdle(idle);
  commitIdle(idle);

  const claim = claimState();
  acquireActiveClaim(claim);
  claimQ(claim);
  decReady(claim);
  commitActiveClaim(claim);

  assert.equal(idle.authorityCas, 2);
  assert.equal(claim.authorityCas, 2);
  // Exposure reservation already uses the same packed authority handoff in the
  // candidate. This repair is exact, but it would serialize idle registration,
  // active READY claims, and exposure reservation on one cache line/txn slot.
  // That is a correctness proof, not a NEES acceptance result.
});
