// Production realization of the selected conserved-Δ vector accounting model.
// Canonical q/qExecution remain the sole work/execution authority. This module
// only carries bounded transition/recovery accounting and manager-owned coverage.

export const EXEC_KIND_ACTIVE = 0;
export const EXEC_KIND_SCHED = 1;

export const EXEC_NONE = 0;
export const EXEC_QUEUED = 1;
export const EXEC_RUN_ACTIVE_BASE = 2;      // 2..257
export const EXEC_RUN_SCHED_BASE = 258;     // 258..513
export const EXEC_CLAIM_ACTIVE_P0_BASE = 514;  // 514..769
export const EXEC_CLAIM_ACTIVE_P1_BASE = 770;  // 770..1025
export const EXEC_CLAIM_SCHED_P0_BASE = 1026;  // 1026..1281
export const EXEC_CLAIM_SCHED_P1_BASE = 1282;  // 1282..1537
export const EXEC_CODE_LIMIT = 1538;

const MAX_WORKERS = 256;

function validWorker(workerId) {
  return Number.isInteger(workerId) && workerId >= 0 && workerId < MAX_WORKERS;
}

function checkWorker(workerId) {
  if (!validWorker(workerId)) throw new RangeError('invalid IsoMax worker id');
}

export function runExecution(kind, workerId) {
  checkWorker(workerId);
  if (kind === EXEC_KIND_ACTIVE) return EXEC_RUN_ACTIVE_BASE + workerId;
  if (kind === EXEC_KIND_SCHED) return EXEC_RUN_SCHED_BASE + workerId;
  throw new RangeError('invalid IsoMax execution kind');
}

export function claimExecution(kind, parity, workerId) {
  checkWorker(workerId);
  if (parity !== 0 && parity !== 1) throw new RangeError('invalid IsoMax claim parity');
  if (kind === EXEC_KIND_ACTIVE) {
    return (parity ? EXEC_CLAIM_ACTIVE_P1_BASE : EXEC_CLAIM_ACTIVE_P0_BASE) + workerId;
  }
  if (kind === EXEC_KIND_SCHED) {
    return (parity ? EXEC_CLAIM_SCHED_P1_BASE : EXEC_CLAIM_SCHED_P0_BASE) + workerId;
  }
  throw new RangeError('invalid IsoMax execution kind');
}

export function executionIsRunning(execution) {
  return (execution >= EXEC_RUN_ACTIVE_BASE && execution < EXEC_CLAIM_ACTIVE_P0_BASE);
}

export function executionIsClaim(execution) {
  return execution >= EXEC_CLAIM_ACTIVE_P0_BASE && execution < EXEC_CODE_LIMIT;
}

export function executionWorker(execution) {
  if (execution >= EXEC_RUN_ACTIVE_BASE && execution < EXEC_RUN_SCHED_BASE) {
    return execution - EXEC_RUN_ACTIVE_BASE;
  }
  if (execution >= EXEC_RUN_SCHED_BASE && execution < EXEC_CLAIM_ACTIVE_P0_BASE) {
    return execution - EXEC_RUN_SCHED_BASE;
  }
  if (execution >= EXEC_CLAIM_ACTIVE_P0_BASE && execution < EXEC_CLAIM_ACTIVE_P1_BASE) {
    return execution - EXEC_CLAIM_ACTIVE_P0_BASE;
  }
  if (execution >= EXEC_CLAIM_ACTIVE_P1_BASE && execution < EXEC_CLAIM_SCHED_P0_BASE) {
    return execution - EXEC_CLAIM_ACTIVE_P1_BASE;
  }
  if (execution >= EXEC_CLAIM_SCHED_P0_BASE && execution < EXEC_CLAIM_SCHED_P1_BASE) {
    return execution - EXEC_CLAIM_SCHED_P0_BASE;
  }
  if (execution >= EXEC_CLAIM_SCHED_P1_BASE && execution < EXEC_CODE_LIMIT) {
    return execution - EXEC_CLAIM_SCHED_P1_BASE;
  }
  return -1;
}

export function executionKind(execution) {
  if ((execution >= EXEC_RUN_ACTIVE_BASE && execution < EXEC_RUN_SCHED_BASE)
      || (execution >= EXEC_CLAIM_ACTIVE_P0_BASE && execution < EXEC_CLAIM_SCHED_P0_BASE)) {
    return EXEC_KIND_ACTIVE;
  }
  if ((execution >= EXEC_RUN_SCHED_BASE && execution < EXEC_CLAIM_ACTIVE_P0_BASE)
      || (execution >= EXEC_CLAIM_SCHED_P0_BASE && execution < EXEC_CODE_LIMIT)) {
    return EXEC_KIND_SCHED;
  }
  return -1;
}

export function executionClaimParity(execution) {
  if (execution >= EXEC_CLAIM_ACTIVE_P0_BASE && execution < EXEC_CLAIM_ACTIVE_P1_BASE) return 0;
  if (execution >= EXEC_CLAIM_ACTIVE_P1_BASE && execution < EXEC_CLAIM_SCHED_P0_BASE) return 1;
  if (execution >= EXEC_CLAIM_SCHED_P0_BASE && execution < EXEC_CLAIM_SCHED_P1_BASE) return 0;
  if (execution >= EXEC_CLAIM_SCHED_P1_BASE && execution < EXEC_CODE_LIMIT) return 1;
  return -1;
}

// One per-worker Int32 holds all worker-owned accounting. The two 14-bit
// counters are intentionally bounded. Saturation is detected before q claim
// linearization; no carry, wrap, or dropped credit is permitted.
const LEDGER_AVAILABLE = 1;
const LEDGER_PARITY = 2;
const LEDGER_D_SHIFT = 2;
const LEDGER_READY_SHIFT = 16;
const LEDGER_COUNTER_MASK = 0x3fff;
export const WORKER_LEDGER_MAX_PENDING = LEDGER_COUNTER_MASK;

function ledgerAvailable(word) {
  return (word & LEDGER_AVAILABLE) !== 0;
}

function ledgerParity(word) {
  return (word & LEDGER_PARITY) >>> 1;
}

function ledgerPendingD(word) {
  return (word >>> LEDGER_D_SHIFT) & LEDGER_COUNTER_MASK;
}

function ledgerPendingReady(word) {
  return (word >>> LEDGER_READY_SHIFT) & LEDGER_COUNTER_MASK;
}

function packLedger(available, parity, pendingD, pendingReady) {
  if (pendingD < 0 || pendingD > LEDGER_COUNTER_MASK
      || pendingReady < 0 || pendingReady > LEDGER_COUNTER_MASK) {
    throw new Error('IsoMax worker ledger overflow');
  }
  return ((available ? LEDGER_AVAILABLE : 0)
    | ((parity & 1) << 1)
    | (pendingD << LEDGER_D_SHIFT)
    | (pendingReady << LEDGER_READY_SHIFT)) | 0;
}

export function initializeWorkerLedger(shared, workerId, available = true) {
  checkWorker(workerId);
  Atomics.store(shared.workerLedger, workerId, packLedger(available, 0, 0, 0));
}

export function workerIsAvailable(shared, workerId) {
  return ledgerAvailable(Atomics.load(shared.workerLedger, workerId));
}

export function workerLedgerParity(shared, workerId) {
  return ledgerParity(Atomics.load(shared.workerLedger, workerId));
}

export function workerClaimHasRoom(shared, workerId, kind) {
  const word = Atomics.load(shared.workerLedger, workerId);
  if (kind === EXEC_KIND_SCHED) {
    return ledgerAvailable(word) && ledgerPendingReady(word) < LEDGER_COUNTER_MASK;
  }
  if (kind === EXEC_KIND_ACTIVE) {
    return !ledgerAvailable(word)
      && ledgerPendingD(word) < LEDGER_COUNTER_MASK
      && ledgerPendingReady(word) < LEDGER_COUNTER_MASK;
  }
  return false;
}

// Must be called only after qExecution successfully linearized QUEUED->CLAIM.
// Once that happens the physical queue occurrence has been consumed, so the
// vector must eventually be emitted even if exact publication races finalization.
export function emitClaimVector(shared, workerId, kind, expectedParity) {
  while (true) {
    const word = Atomics.load(shared.workerLedger, workerId);
    const parity = ledgerParity(word);
    if (parity === expectedParity) return true;
    if ((parity ^ 1) !== expectedParity) {
      throw new Error('IsoMax worker ledger parity changed during claim');
    }
    const pendingD = ledgerPendingD(word);
    const pendingReady = ledgerPendingReady(word);
    const available = ledgerAvailable(word);
    let nextD = pendingD;
    let nextAvailable = available;
    if (kind === EXEC_KIND_SCHED) {
      if (!available) throw new Error('IsoMax scheduler claim lost worker availability');
    } else if (kind === EXEC_KIND_ACTIVE) {
      if (available) throw new Error('IsoMax active claim unexpectedly owns availability');
      if (pendingD >= LEDGER_COUNTER_MASK) throw new Error('IsoMax worker D ledger overflow');
      nextD++;
    } else {
      throw new RangeError('invalid IsoMax execution kind');
    }
    if (pendingReady >= LEDGER_COUNTER_MASK) throw new Error('IsoMax worker READY ledger overflow');
    if (kind === EXEC_KIND_SCHED) nextAvailable = false;
    const next = packLedger(nextAvailable, expectedParity, nextD, pendingReady + 1);
    if (Atomics.compareExchange(shared.workerLedger, workerId, word, next) === word) return true;
  }
}

// Returns 1 when available is represented, 0 when the bounded pending-D field
// is saturated. A saturated worker stays BUSY and asks the manager to harvest;
// it never waits synchronously for manager approval.
export function tryAdvertiseAvailability(shared, workerId) {
  while (true) {
    const word = Atomics.load(shared.workerLedger, workerId);
    if (ledgerAvailable(word)) return 1;
    const pendingD = ledgerPendingD(word);
    if (pendingD >= LEDGER_COUNTER_MASK) return 0;
    const next = packLedger(
      true,
      ledgerParity(word),
      pendingD + 1,
      ledgerPendingReady(word),
    );
    if (Atomics.compareExchange(shared.workerLedger, workerId, word, next) === word) return 1;
  }
}

// Atomically drains only the additive vector and preserves availability/parity.
// Return packs pendingD in low 14 bits and pendingReady in bits 14..27.
export function harvestWorkerLedger(shared, workerId) {
  while (true) {
    const word = Atomics.load(shared.workerLedger, workerId);
    const pendingD = ledgerPendingD(word);
    const pendingReady = ledgerPendingReady(word);
    if (pendingD === 0 && pendingReady === 0) return 0;
    const next = packLedger(ledgerAvailable(word), ledgerParity(word), 0, 0);
    if (Atomics.compareExchange(shared.workerLedger, workerId, word, next) === word) {
      return pendingD | (pendingReady << 14);
    }
  }
}

export function harvestedD(harvested) {
  return harvested & LEDGER_COUNTER_MASK;
}

export function harvestedReady(harvested) {
  return (harvested >>> 14) & LEDGER_COUNTER_MASK;
}

// Recovery runs before a worker ID may be reused. Pending vectors must already
// have been harvested. Returns true only when replacement availability is new.
export function recoverWorkerAvailability(shared, workerId) {
  while (true) {
    const word = Atomics.load(shared.workerLedger, workerId);
    if (ledgerPendingD(word) !== 0 || ledgerPendingReady(word) !== 0) {
      throw new Error('IsoMax dead-worker ledger recovered before harvest');
    }
    if (ledgerAvailable(word)) return false;
    const next = packLedger(true, ledgerParity(word), 0, 0);
    if (Atomics.compareExchange(shared.workerLedger, workerId, word, next) === word) return true;
  }
}

export const EXPOSURE_NONE = 0;
export const EXPOSURE_GRANTED = 1;
export const EXPOSURE_INFLIGHT = 2;

// Exposure reservations are distributed to producer workers, avoiding the old
// globally contended packed permit CAS. One producer can own at most one grant.
export function tryConsumeExposureGrant(shared, workerId) {
  return Atomics.compareExchange(
    shared.workerExposure,
    workerId,
    EXPOSURE_GRANTED,
    EXPOSURE_INFLIGHT,
  ) === EXPOSURE_GRANTED;
}

export function returnExposureGrant(shared, workerId) {
  return Atomics.compareExchange(
    shared.workerExposure,
    workerId,
    EXPOSURE_INFLIGHT,
    EXPOSURE_GRANTED,
  ) === EXPOSURE_INFLIGHT;
}

export class ConservedDeltaManager {
  constructor(shared, workerCount) {
    this.shared = shared;
    this.workerCount = workerCount;
    this.deficit = 0;
    this.ready = 0;
    this.exposure = 0;
    this.transfer = 0;
    for (let worker = 0; worker < workerCount; worker++) {
      if (workerIsAvailable(shared, worker)) this.deficit++;
    }
  }

  harvest(workerId) {
    const harvested = harvestWorkerLedger(this.shared, workerId);
    if (harvested === 0) return false;
    this.deficit += harvestedD(harvested);
    this.ready -= harvestedReady(harvested);
    if (this.ready < 0) throw new Error('IsoMax READY accounting underflow');
    return true;
  }

  harvestAll() {
    let progress = false;
    for (let worker = 0; worker < this.workerCount; worker++) {
      if (this.harvest(worker)) progress = true;
    }
    return progress;
  }

  beginReadyTransfer() {
    if (this.transfer !== 0) throw new Error('IsoMax READY transfer already active');
    if (this.deficit <= 0) return false;
    this.deficit--;
    this.transfer = 1;
    return true;
  }

  commitReadyTransfer() {
    if (this.transfer !== 1) throw new Error('IsoMax READY transfer missing');
    this.ready++;
    this.transfer = 0;
  }

  refundReadyTransfer() {
    if (this.transfer !== 1) throw new Error('IsoMax READY transfer missing');
    this.deficit++;
    this.transfer = 0;
  }

  retireReady() {
    if (this.ready <= 0) throw new Error('IsoMax READY retirement underflow');
    this.ready--;
    this.deficit++;
  }

  grantExposure(workerId) {
    if (this.deficit <= 0 || workerIsAvailable(this.shared, workerId)) return false;
    if (Atomics.compareExchange(
      this.shared.workerExposure,
      workerId,
      EXPOSURE_NONE,
      EXPOSURE_GRANTED,
    ) !== EXPOSURE_NONE) return false;
    this.deficit--;
    this.exposure++;
    return true;
  }

  revokeIdleGrant(workerId) {
    if (!workerIsAvailable(this.shared, workerId)) return false;
    if (Atomics.compareExchange(
      this.shared.workerExposure,
      workerId,
      EXPOSURE_GRANTED,
      EXPOSURE_NONE,
    ) !== EXPOSURE_GRANTED) return false;
    this.exposure--;
    this.deficit++;
    return true;
  }

  completeExposure(workerId) {
    if (Atomics.compareExchange(
      this.shared.workerExposure,
      workerId,
      EXPOSURE_INFLIGHT,
      EXPOSURE_NONE,
    ) !== EXPOSURE_INFLIGHT) {
      throw new Error('IsoMax exposure completion without inflight reservation');
    }
    this.exposure--;
    this.deficit++;
  }

  recoverExposure(workerId) {
    const prior = Atomics.exchange(this.shared.workerExposure, workerId, EXPOSURE_NONE);
    if (prior === EXPOSURE_NONE) return false;
    this.exposure--;
    this.deficit++;
    return true;
  }

  recoverWorker(workerId) {
    this.harvest(workerId);
    if (recoverWorkerAvailability(this.shared, workerId)) this.deficit++;
  }

  snapshot() {
    return {
      deficit: this.deficit,
      ready: this.ready,
      exposure: this.exposure,
      transfer: this.transfer,
    };
  }
}
