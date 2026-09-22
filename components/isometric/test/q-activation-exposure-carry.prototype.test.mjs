// Research-only falsifier for D.multiworker-economics.q-activation-carry-prototype-r2.
//
// This is deliberately not production authority. It isolates the accounting/lifetime
// question before any source-integrated experiment: can a manager-reserved spare
// capacity unit be attached to a queued q occurrence, transferred before RUN, and
// refunded/completed without creating coverage or losing it?
//
// Production qExecution/shared canonical TT remain the sole semantic/work authority.
// A source-integrated prototype must still prove the performance falsifiers on the
// unchanged hard exact corpus; this model only closes the conservation precondition.

import test from 'node:test';
import assert from 'node:assert/strict';

const Q_NONE = 0;
const Q_READY = 1;
const Q_CLAIM = 2;
const Q_RUN = 3;
const CARRY_NONE = 0;
const CARRY_QUEUED = 1;
const CARRY_WORKER = 2;
const CARRY_INFLIGHT = 3;

class CarryModel {
  constructor(capacity) {
    this.capacity = capacity;
    this.deficit = capacity;
    this.ready = 0;
    this.exposure = 0;
    this.q = new Map();
    this.workerCarry = new Map();
    this.metrics = { issued: 0, claimed: 0, refunded: 0, completed: 0 };
  }

  state(q) {
    let state = this.q.get(q);
    if (!state) {
      state = { execution: Q_NONE, carry: CARRY_NONE, worker: -1 };
      this.q.set(q, state);
    }
    return state;
  }

  admit(q, withCarry = true) {
    const state = this.state(q);
    assert.equal(state.execution, Q_NONE);
    if (this.deficit < 1) return false;

    // READY coverage is reserved before publication, matching the production
    // reserve->commit/refund ordering. The optional carry consumes a second D
    // unit before the q becomes claimable.
    this.deficit--;
    this.ready++;
    state.execution = Q_READY;
    if (withCarry && this.deficit > 0) {
      this.deficit--;
      this.exposure++;
      state.carry = CARRY_QUEUED;
      this.metrics.issued++;
    }
    this.check();
    return true;
  }

  cancel(q) {
    const state = this.state(q);
    assert.equal(state.execution, Q_READY);
    this.ready--;
    this.deficit++;
    if (state.carry === CARRY_QUEUED) {
      state.carry = CARRY_NONE;
      this.exposure--;
      this.deficit++;
      this.metrics.refunded++;
    }
    state.execution = Q_NONE;
    this.check();
  }

  beginClaim(q, worker) {
    const state = this.state(q);
    assert.equal(state.execution, Q_READY);
    assert.equal(this.workerCarry.get(worker) ?? CARRY_NONE, CARRY_NONE);
    state.execution = Q_CLAIM;
    state.worker = worker;

    // The physical READY occurrence has been consumed. Production carries this
    // through the worker vector/manager harvest; synchronous accounting here is
    // intentional because this model isolates carry conservation, not harvest lag.
    this.ready--;
    this.deficit++;

    // Carry transfer occurs while qExecution is transient CLAIM, before RUN.
    if (state.carry === CARRY_QUEUED) {
      state.carry = CARRY_WORKER;
      this.workerCarry.set(worker, CARRY_WORKER);
      this.metrics.claimed++;
    }
    this.check();
  }

  finishClaim(q) {
    const state = this.state(q);
    assert.equal(state.execution, Q_CLAIM);
    state.execution = Q_RUN;
    this.check();
  }

  branch(q) {
    const state = this.state(q);
    assert.equal(state.execution, Q_RUN);
    if (state.carry !== CARRY_WORKER) return false;
    assert.equal(this.workerCarry.get(state.worker), CARRY_WORKER);
    state.carry = CARRY_INFLIGHT;
    this.workerCarry.set(state.worker, CARRY_INFLIGHT);
    this.check();
    return true;
  }

  completeBranch(q) {
    const state = this.state(q);
    assert.equal(state.carry, CARRY_INFLIGHT);
    assert.equal(this.workerCarry.get(state.worker), CARRY_INFLIGHT);
    state.carry = CARRY_NONE;
    this.workerCarry.set(state.worker, CARRY_NONE);
    this.exposure--;
    this.deficit++;
    this.metrics.completed++;
    this.check();
  }

  finishQ(q) {
    const state = this.state(q);
    assert.ok(state.execution === Q_RUN || state.execution === Q_CLAIM);
    if (state.carry === CARRY_WORKER) {
      assert.equal(this.workerCarry.get(state.worker), CARRY_WORKER);
      this.workerCarry.set(state.worker, CARRY_NONE);
      state.carry = CARRY_NONE;
      this.exposure--;
      this.deficit++;
      this.metrics.refunded++;
    } else {
      assert.equal(state.carry, CARRY_NONE);
    }
    state.execution = Q_NONE;
    state.worker = -1;
    this.check();
  }

  recoverDead(q) {
    const state = this.state(q);
    assert.ok(state.execution === Q_CLAIM || state.execution === Q_RUN);
    if (state.carry === CARRY_WORKER || state.carry === CARRY_INFLIGHT) {
      this.workerCarry.set(state.worker, CARRY_NONE);
      state.carry = CARRY_NONE;
      this.exposure--;
      this.deficit++;
      this.metrics.refunded++;
    }
    state.execution = Q_NONE;
    state.worker = -1;
    this.check();
  }

  check() {
    assert.ok(this.deficit >= 0, 'D must not underflow');
    assert.ok(this.ready >= 0, 'READY must not underflow');
    assert.ok(this.exposure >= 0, 'exposure must not underflow');
    assert.equal(
      this.deficit + this.ready + this.exposure,
      this.capacity,
      'capacity coverage must be exactly conserved',
    );
    let qExposure = 0;
    for (const state of this.q.values()) {
      if (state.carry !== CARRY_NONE) qExposure++;
    }
    assert.equal(
      qExposure,
      this.exposure,
      'every represented exposure unit has exactly one q occurrence owner',
    );
  }
}

test('admission attaches at most one carry and reserves it before publication', () => {
  const model = new CarryModel(4);
  assert.equal(model.admit(1), true);
  assert.deepEqual([model.deficit, model.ready, model.exposure], [2, 1, 1]);
  assert.equal(model.metrics.issued, 1);
});

test('stale/cancelled unclaimed q refunds READY and carry exactly', () => {
  const model = new CarryModel(4);
  model.admit(1);
  model.cancel(1);
  assert.deepEqual([model.deficit, model.ready, model.exposure], [4, 0, 0]);
  assert.equal(model.metrics.refunded, 1);
});

test('claim transfers carry before RUN and branch consumes/completes it', () => {
  const model = new CarryModel(4);
  model.admit(1);
  model.beginClaim(1, 0);
  assert.equal(model.state(1).carry, CARRY_WORKER);
  model.finishClaim(1);
  assert.equal(model.branch(1), true);
  model.completeBranch(1);
  model.finishQ(1);
  assert.deepEqual([model.deficit, model.ready, model.exposure], [4, 0, 0]);
  assert.deepEqual(model.metrics, { issued: 1, claimed: 1, refunded: 0, completed: 1 });
});

test('claimed but unused carry refunds at the q lifetime boundary', () => {
  const model = new CarryModel(4);
  model.admit(1);
  model.beginClaim(1, 0);
  model.finishClaim(1);
  model.finishQ(1);
  assert.deepEqual([model.deficit, model.ready, model.exposure], [4, 0, 0]);
  assert.deepEqual(model.metrics, { issued: 1, claimed: 1, refunded: 1, completed: 0 });
});

test('death after transfer or after branch consumption recovers exactly once', () => {
  for (const consume of [false, true]) {
    const model = new CarryModel(4);
    model.admit(1);
    model.beginClaim(1, 0);
    model.finishClaim(1);
    if (consume) model.branch(1);
    model.recoverDead(1);
    assert.deepEqual([model.deficit, model.ready, model.exposure], [4, 0, 0]);
  }
});

test('four-worker repeated interleavings never overgrant or drift', () => {
  const model = new CarryModel(4);
  for (let round = 0; round < 100; round++) {
    const q0 = round * 2;
    const q1 = q0 + 1;
    assert.equal(model.admit(q0), true);
    assert.equal(model.admit(q1), true);
    model.beginClaim(q0, 0);
    model.finishClaim(q0);
    model.beginClaim(q1, 1);
    model.finishClaim(q1);
    if ((round & 1) === 0) {
      model.branch(q0);
      model.completeBranch(q0);
      model.finishQ(q0);
      model.finishQ(q1);
    } else {
      model.finishQ(q0);
      model.branch(q1);
      model.completeBranch(q1);
      model.finishQ(q1);
    }
    assert.deepEqual([model.deficit, model.ready, model.exposure], [4, 0, 0]);
  }
});

test('capacity two cannot manufacture a second carry', () => {
  const model = new CarryModel(2);
  assert.equal(model.admit(1), true);
  assert.equal(model.admit(2), false);
  assert.deepEqual([model.deficit, model.ready, model.exposure], [0, 1, 1]);
  model.cancel(1);
});
