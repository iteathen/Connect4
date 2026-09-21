import { parentPort, workerData } from 'node:worker_threads';
import { IsoMaxSolver } from '../solver.mjs';
import { CENTER_ORDER } from '../move-order.mjs';
import { PortableQBuilder } from './portable-q.mjs';
import {
  CTRL_ABORT,
  CTRL_MANAGER_WAKE,
  CTRL_ROOT_GENERATION,
  CTRL_ROOT_MOVE,
  CTRL_ROOT_MOVE_READY,
  CTRL_ROOT_Q,
  CTRL_SESSION,
  CTRL_WORKER_WAKE,
  EXEC_RUNNING_BASE,
  Q_EXACT_UNKNOWN,
  SESSION_RUNNING,
  WC_BRANCH_DESCRIPTORS,
  WC_CACHE_HITS,
  WC_CLAIMS,
  WC_CLAIM_BAND_BASE,
  WC_CONTROL_CHECKS,
  WC_DUPLICATE_REACHES,
  WC_EXACT_PUBLICATIONS,
  WC_FORCED_TRANSITIONS,
  WC_FRONTIERS,
  WC_NATIVE_EXACT,
  WC_Q_CREATED,
  WC_Q_REUSED,
  WC_QUEUE_EMPTY,
  WC_RECURSIVE_CHILDREN,
  WC_RELEASE_EVENTS,
  WC_REPLAY_APPLIES,
  WC_RESET_RETIREMENTS,
  WC_RETAINED_DESCENTS,
  WC_SHARED_EXACT_CONSUMED,
  WC_SOLVER_NODES,
  WORKER_COUNTER_WORDS,
  claimHighestQ,
  enterLocalQ,
  openSharedTT,
  probeOrInsertQ,
  publishExactQ,
  readExactQ,
  releaseRunningQ,
} from './shared-tt.mjs';
import {
  EVENT_DUPLICATE,
  EVENT_EXACT,
  EVENT_RELEASE,
  openSharedEvents,
  publishBranch,
  publishEvent,
} from './shared-events.mjs';

if (!parentPort) throw new Error('IsoMax retained worker requires parentPort');

const workerId = workerData.workerId;
const workerCount = workerData.workerCount;
const MAX_PLY = 42;
const resetExecution = Symbol('IsoMax shared execution reset');
const sessionStopped = Symbol('IsoMax shared session stopped');

class SharedBranchDistributor {
  constructor(runtime) {
    this.runtime = runtime;
    this.builder = new PortableQBuilder();
    this.insertScratch = new Int32Array(3);
    this.columns = new Uint8Array((MAX_PLY + 1) * 7);
    this.actions = new Uint8Array((MAX_PLY + 1) * 7);
    this.childQ = new Int32Array((MAX_PLY + 1) * 7);
    this.childGeneration = new Int32Array((MAX_PLY + 1) * 7);
    this.childEval = new Int32Array((MAX_PLY + 1) * 7);
    this.childQ.fill(-1);
  }

  evalClass(exact, maximizing, orderIndex) {
    if (exact === Q_EXACT_UNKNOWN) return 4;
    if (maximizing) {
      if (exact === 1) return 7;
      if (exact === 0) return 5;
      return 1;
    }
    if (exact === -1) return 7;
    if (exact === 0) return 5;
    return 1;
  }

  publishChildQ(state, base, orderIndex, canonicalAction, maximizing) {
    this.builder.prepare(state);
    const shared = this.runtime.shared;
    const q = probeOrInsertQ(
      shared,
      this.builder.words,
      this.builder.support,
      this.builder.flags,
      this.builder.replay,
      this.builder.replayLength,
      this.insertScratch,
    );
    const generation = this.insertScratch[1];
    if (this.insertScratch[2]) this.runtime.count(WC_Q_CREATED);
    else this.runtime.count(WC_Q_REUSED);
    const exact = readExactQ(shared, q, generation);
    this.childQ[base + canonicalAction] = q;
    this.childGeneration[base + canonicalAction] = generation;
    this.childEval[base + canonicalAction] = this.evalClass(exact, maximizing, orderIndex);
    return exact;
  }

  solveOne(solver, state, column, qIndex, generation) {
    const runtime = this.runtime;
    const shared = runtime.shared;
    const previousQ = runtime.activeQ;
    const previousGeneration = runtime.activeGeneration;
    let owner = -1;
    let completed = false;
    state.applyUnchecked(column);
    solver.metrics.recursiveChildren++;
    runtime.activeQ = qIndex;
    runtime.activeGeneration = generation;
    try {
      let value = readExactQ(shared, qIndex, generation);
      if (value !== Q_EXACT_UNKNOWN) {
        runtime.count(WC_SHARED_EXACT_CONSUMED);
        solver.transitionCache.set(state, value);
        return value;
      }

      owner = enterLocalQ(shared, qIndex, generation, workerId);
      if (owner >= 0 && owner !== workerId) {
        runtime.count(WC_DUPLICATE_REACHES);
        runtime.publishEvent(EVENT_DUPLICATE, qIndex, generation, owner, 0);
      }

      value = solver.solveNode(state);
      runtime.publishExact(qIndex, generation, value);
      completed = true;
      return value;
    } finally {
      state.undo();
      runtime.activeQ = previousQ;
      runtime.activeGeneration = previousGeneration;
      if (!completed && owner === workerId
          && readExactQ(shared, qIndex, generation) === Q_EXACT_UNKNOWN
          && releaseRunningQ(shared, qIndex, generation, workerId)) {
        runtime.count(WC_RELEASE_EVENTS);
        runtime.publishEvent(EVENT_RELEASE, qIndex, generation, 0, 0);
      }
    }
  }

  solveChildren(solver, state, maximizing, lower, upper, promoted) {
    const runtime = this.runtime;
    const ply = state.ply;
    const base = ply * 7;
    let count = 0;

    if (promoted >= 0 && state.canPlay(promoted)) this.columns[base + count++] = promoted;
    for (let index = 0; index < CENTER_ORDER.length; index++) {
      const column = CENTER_ORDER[index];
      if (column === promoted || !state.canPlay(column)) continue;
      this.columns[base + count++] = column;
    }
    if (count === 0) throw new Error('ongoing shared-TT state has no legal moves');

    if (count === 1) {
      const column = this.columns[base];
      state.applyUnchecked(column);
      solver.metrics.recursiveChildren++;
      try {
        return solver.solveNode(state);
      } finally {
        state.undo();
      }
    }

    runtime.count(WC_FRONTIERS);
    for (let action = 0; action < 7; action++) {
      this.childQ[base + action] = -1;
      this.childGeneration[base + action] = 0;
      this.childEval[base + action] = 0;
    }

    const branchOrientation = state.gameplayOrientation();
    let mask = 0;
    let retainedOrder = 0;
    let retainedEval = -1;

    for (let orderIndex = 0; orderIndex < count; orderIndex++) {
      const column = this.columns[base + orderIndex];
      const action = branchOrientation ? 6 - column : column;
      this.actions[base + orderIndex] = action;
      state.applyUnchecked(column);
      try {
        this.publishChildQ(state, base, orderIndex, action, maximizing);
      } finally {
        state.undo();
      }
      mask |= 1 << action;
      const evaluation = this.childEval[base + action];
      if (evaluation > retainedEval) {
        retainedEval = evaluation;
        retainedOrder = orderIndex;
      }
    }

    const retainedAction = this.actions[base + retainedOrder];
    publishBranch(
      runtime.events,
      workerId,
      runtime.activeQ,
      runtime.activeGeneration,
      mask,
      retainedAction,
      maximizing,
      runtime.activeRunToken,
      this.childQ.subarray(base, base + 7),
      this.childGeneration.subarray(base, base + 7),
      this.childEval.subarray(base, base + 7),
    );
    runtime.count(WC_BRANCH_DESCRIPTORS);
    runtime.wakeManager();

    let best = maximizing ? -1 : 1;
    let cutoff = false;

    const retainedColumn = this.columns[base + retainedOrder];
    const retainedQ = this.childQ[base + retainedAction];
    const retainedGeneration = this.childGeneration[base + retainedAction];
    runtime.count(WC_RETAINED_DESCENTS);
    let childValue = this.solveOne(
      solver, state, retainedColumn, retainedQ, retainedGeneration,
    );
    if (maximizing) {
      if (childValue > best) best = childValue;
      if (best >= upper) cutoff = true;
    } else {
      if (childValue < best) best = childValue;
      if (best <= lower) cutoff = true;
    }

    if (!cutoff) {
      for (let orderIndex = 0; orderIndex < count; orderIndex++) {
        if (orderIndex === retainedOrder) continue;
        const column = this.columns[base + orderIndex];
        const action = this.actions[base + orderIndex];
        childValue = this.solveOne(
          solver,
          state,
          column,
          this.childQ[base + action],
          this.childGeneration[base + action],
        );
        if (maximizing) {
          if (childValue > best) best = childValue;
          if (best >= upper) break;
        } else {
          if (childValue < best) best = childValue;
          if (best <= lower) break;
        }
      }
    }

    runtime.publishExact(runtime.activeQ, runtime.activeGeneration, best);
    return best;
  }
}

class RetainedPullWorker {
  constructor() {
    this.solver = new IsoMaxSolver();
    this.state = this.solver.createState();
    this.shared = null;
    this.events = null;
    this.activeQ = -1;
    this.activeGeneration = 0;
    this.activeRunToken = 0;
    this.externalRootPly = 0;
    this.controlQuantum = 512;
    this.resetting = false;
    this.claim = new Int32Array(3);
    this.queueScratch = new Int32Array(2);
    this.distributor = new SharedBranchDistributor(this);
    this.solver.branchDistributor = this.distributor;
    this.solver.checkTaskControl = () => this.checkTaskControl();
  }

  count(index, delta = 1) {
    Atomics.add(
      this.shared.workerCounters,
      workerId * WORKER_COUNTER_WORDS + index,
      delta,
    );
  }

  wakeManager() {
    Atomics.add(this.shared.control, CTRL_MANAGER_WAKE, 1);
    Atomics.notify(this.shared.control, CTRL_MANAGER_WAKE, 1);
  }

  publishEvent(kind, qIndex, generation, value, aux) {
    publishEvent(this.events, workerId, kind, qIndex, generation, value, aux);
    this.wakeManager();
  }

  publishExact(qIndex, generation, value) {
    const priorExecution = publishExactQ(this.shared, qIndex, generation, value);
    if (priorExecution < 0) return;
    this.count(WC_EXACT_PUBLICATIONS);
    this.publishEvent(EVENT_EXACT, qIndex, generation, value, priorExecution);
  }

  checkTaskControl() {
    this.count(WC_CONTROL_CHECKS);
    if (Atomics.load(this.shared.control, CTRL_ABORT)) throw new Error('ISOMAX_ABORTED');
    if (Atomics.load(this.shared.control, CTRL_SESSION) !== SESSION_RUNNING) throw sessionStopped;
    if (Atomics.load(this.shared.workerReset, workerId) !== this.activeRunToken) {
      this.resetting = true;
      throw resetExecution;
    }
    this.solver.nextControlNode = this.solver.metrics.nodes + this.controlQuantum;
  }

  resetMetrics() {
    for (const key of Object.keys(this.solver.metrics)) this.solver.metrics[key] = 0;
    this.solver.orderingRootPly = this.externalRootPly;
    this.solver.nextControlNode = 0;
    this.resetting = false;
  }

  prepareSession(message) {
    this.shared = openSharedTT(message.tt);
    this.events = openSharedEvents(message.events);
    this.externalRootPly = message.rootPly;
    this.controlQuantum = message.controlQuantum;
    if (!Number.isSafeInteger(this.controlQuantum) || this.controlQuantum < 1
        || this.controlQuantum > (1 << 20)) throw new RangeError('invalid retained-pull controlQuantum');

    if (this.solver.pool.classCount > message.retainedClasses
        || this.solver.transitionCache.count > message.retainedEntries) {
      this.solver = new IsoMaxSolver();
      this.state = this.solver.createState();
      this.distributor = new SharedBranchDistributor(this);
      this.solver.branchDistributor = this.distributor;
      this.solver.checkTaskControl = () => this.checkTaskControl();
    }

    this.solver.pool.prepareSearchStorage(message.classReserve);
    this.solver.transitionCache.prepareSearchStorage(message.entryReserve);
  }

  finishSession() {
    while (this.state.ply > 0) this.state.undo();
    this.solver.nextControlNode = Infinity;
    this.solver.pool.releaseSearchStorage();
    this.solver.transitionCache.sealed = false;
    this.shared = null;
    this.events = null;
    this.activeQ = -1;
    this.activeGeneration = 0;
  }

  replayQ(qIndex, generation) {
    const shared = this.shared;
    if (Atomics.load(shared.qGeneration, qIndex) !== generation
        || Atomics.load(shared.qLive, qIndex) === 0) throw new Error('stale claimed q');
    const length = shared.qReplayLength[qIndex];
    const replayBase = qIndex * MAX_PLY;
    let common = Math.min(this.state.ply, length);
    let prefix = 0;
    while (prefix < common
        && (this.state.moveCells[prefix] % 7) === shared.qReplay[replayBase + prefix]) prefix++;
    common = prefix;
    while (this.state.ply > common) this.state.undo();
    for (let ply = common; ply < length; ply++) {
      const column = shared.qReplay[replayBase + ply];
      if (!this.state.canPlay(column)) throw new Error('invalid shared q replay seed');
      this.state.applyUnchecked(column);
      this.count(WC_REPLAY_APPLIES);
    }
    return this.state;
  }

  maybePublishRootMove(state, value) {
    const shared = this.shared;
    if (this.activeQ !== Atomics.load(shared.control, CTRL_ROOT_Q)
        || this.activeGeneration !== Atomics.load(shared.control, CTRL_ROOT_GENERATION)
        || Atomics.load(shared.control, CTRL_ROOT_MOVE_READY)) return;

    let move = -1;
    if (!state.isTerminal()) {
      const distributor = this.solver.branchDistributor;
      this.solver.branchDistributor = null;
      try {
        move = this.solver.selectMoveForValue(state, value);
      } finally {
        this.solver.branchDistributor = distributor;
      }
    }
    Atomics.store(shared.control, CTRL_ROOT_MOVE, move);
    Atomics.store(shared.control, CTRL_ROOT_MOVE_READY, 1);
    this.wakeManager();
  }

  accumulateSolverMetrics() {
    const metrics = this.solver.metrics;
    this.count(WC_SOLVER_NODES, metrics.nodes);
    this.count(WC_CACHE_HITS, metrics.transitionCacheHits);
    this.count(WC_NATIVE_EXACT, metrics.nativeExactHits);
    this.count(WC_RECURSIVE_CHILDREN, metrics.recursiveChildren);
    this.count(WC_FORCED_TRANSITIONS, metrics.forcedTransitions);
  }

  runClaim(qIndex, generation, band) {
    this.activeQ = qIndex;
    this.activeGeneration = generation;
    this.activeRunToken = Atomics.load(this.shared.workerReset, workerId);
    this.resetMetrics();
    const state = this.replayQ(qIndex, generation);
    let value;
    let exact = false;
    try {
      value = this.solver.solveNode(state);
      this.maybePublishRootMove(state, value);
      this.publishExact(qIndex, generation, value);
      exact = true;
    } catch (error) {
      if (error === resetExecution || error === sessionStopped) {
        if (error === resetExecution) this.count(WC_RESET_RETIREMENTS);
      } else {
        throw error;
      }
    } finally {
      if (!exact
          && readExactQ(this.shared, qIndex, generation) === Q_EXACT_UNKNOWN
          && releaseRunningQ(this.shared, qIndex, generation, workerId)) {
        this.count(WC_RELEASE_EVENTS);
        this.publishEvent(EVENT_RELEASE, qIndex, generation, 0, 0);
      }
      this.accumulateSolverMetrics();
      this.activeQ = -1;
      this.activeGeneration = 0;
    }
  }

  runSession(message) {
    this.prepareSession(message);
    const shared = this.shared;
    try {
      while (Atomics.load(shared.control, CTRL_SESSION) === SESSION_RUNNING
          && !Atomics.load(shared.control, CTRL_ABORT)) {
        if (claimHighestQ(shared, workerId, this.claim, this.queueScratch)) {
          this.count(WC_CLAIMS);
          this.count(WC_CLAIM_BAND_BASE + this.claim[2]);
          this.runClaim(this.claim[0], this.claim[1], this.claim[2]);
          continue;
        }
        this.count(WC_QUEUE_EMPTY);
        const wake = Atomics.load(shared.control, CTRL_WORKER_WAKE);
        if (Atomics.load(shared.control, CTRL_SESSION) !== SESSION_RUNNING
            || Atomics.load(shared.control, CTRL_ABORT)) break;
        Atomics.wait(shared.control, CTRL_WORKER_WAKE, wake, 10);
      }
    } finally {
      this.finishSession();
    }
  }
}

const runtime = new RetainedPullWorker();
let poisoned = false;

parentPort.on('message', message => {
  if (message?.type !== 'session') return;
  if (poisoned) {
    parentPort.postMessage({ type: 'error', sessionId: message.sessionId, workerId, message: 'worker poisoned' });
    return;
  }
  try {
    runtime.runSession(message);
    parentPort.postMessage({ type: 'session-done', sessionId: message.sessionId, workerId });
  } catch (error) {
    poisoned = true;
    try {
      if (runtime.shared) {
        Atomics.store(runtime.shared.control, CTRL_ABORT, 1);
        Atomics.store(runtime.shared.control, CTRL_SESSION, 3);
        runtime.wakeManager();
        Atomics.add(runtime.shared.control, CTRL_WORKER_WAKE, 1);
        Atomics.notify(runtime.shared.control, CTRL_WORKER_WAKE, Infinity);
      }
    } catch {}
    parentPort.postMessage({
      type: 'error',
      sessionId: message.sessionId,
      workerId,
      message: error?.message ?? String(error),
      stack: error?.stack,
    });
  }
});

parentPort.postMessage({ type: 'ready', workerId, workerCount });
