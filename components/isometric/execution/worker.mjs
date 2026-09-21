import { parentPort, workerData } from 'node:worker_threads';
import { IsoMaxSolver } from '../solver.mjs';
import { CENTER_ORDER, singletonEffectClass } from '../move-order.mjs';
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
  addQRef,
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
  beginBranch,
  holdBranchRef,
  openSharedEvents,
  publishBranch,
  publishEvent,
  recoverUnpublishedBranch,
} from './shared-events.mjs';

if (!parentPort) throw new Error('IsoMax retained worker requires parentPort');

const workerId = workerData.workerId;
const workerCount = workerData.workerCount;
const MAX_PLY = 42;
const resetExecution = Symbol('IsoMax shared execution reset');
const yieldExecution = Symbol('IsoMax shared branch yield');
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
    this.childOrientation = new Uint8Array((MAX_PLY + 1) * 7);
    this.childQ.fill(-1);
  }

  holdPreparedQ(state) {
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
      workerId + 1,
    );
    const generation = this.insertScratch[1];
    holdBranchRef(this.runtime.events, workerId, q, generation);
    if (this.insertScratch[2]) this.runtime.count(WC_Q_CREATED);
    else this.runtime.count(WC_Q_REUSED);
    return q;
  }

  solveOne(solver, state, column, qIndex, generation, orientation) {
    const runtime = this.runtime;
    const shared = runtime.shared;
    const previousQ = runtime.activeQ;
    const previousGeneration = runtime.activeGeneration;
    const previousOrientation = runtime.activeOrientation;
    const previousBasePly = runtime.activeBasePly;
    let owner = -1;
    let completed = false;

    state.applyUnchecked(column);
    solver.metrics.recursiveChildren++;
    runtime.activeQ = qIndex;
    runtime.activeGeneration = generation;
    runtime.activeOrientation = orientation;
    runtime.activeBasePly = state.ply;

    try {
      let value = readExactQ(shared, qIndex, generation);
      if (value !== Q_EXACT_UNKNOWN) {
        runtime.count(WC_SHARED_EXACT_CONSUMED);
        solver.transitionCache.set(state, value);
        return value;
      }

      owner = enterLocalQ(shared, qIndex, generation, workerId);
      if (owner < 0) {
        value = readExactQ(shared, qIndex, generation);
        if (value !== Q_EXACT_UNKNOWN) {
          runtime.count(WC_SHARED_EXACT_CONSUMED);
          solver.transitionCache.set(state, value);
          return value;
        }
        throw yieldExecution;
      }
      if (owner !== workerId) {
        runtime.count(WC_DUPLICATE_REACHES);
        runtime.publishEvent(EVENT_DUPLICATE, qIndex, generation, owner, 0);
        throw yieldExecution;
      }

      runtime.executionQ = qIndex;
      runtime.executionGeneration = generation;
      value = solver.solveNode(state);
      runtime.publishExact(qIndex, generation, value);
      runtime.executionQ = -1;
      runtime.executionGeneration = 0;
      completed = true;
      return value;
    } finally {
      state.undo();
      if (!completed && owner === workerId
          && runtime.executionQ === qIndex
          && runtime.executionGeneration === generation
          && readExactQ(shared, qIndex, generation) === Q_EXACT_UNKNOWN
          && releaseRunningQ(shared, qIndex, generation, workerId)) {
        runtime.executionQ = -1;
        runtime.executionGeneration = 0;
        runtime.count(WC_RELEASE_EVENTS);
        runtime.publishEvent(EVENT_RELEASE, qIndex, generation, 0, 0);
      }
      runtime.activeQ = previousQ;
      runtime.activeGeneration = previousGeneration;
      runtime.activeOrientation = previousOrientation;
      runtime.activeBasePly = previousBasePly;
    }
  }

  solveChildren(solver, state, maximizing, lower, upper, promoted) {
    const runtime = this.runtime;
    const shared = runtime.shared;
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

    // Outdegree one is deterministic structure, not a global scheduling event.
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
      this.childOrientation[base + action] = 0;
    }

    const startQ = runtime.activeQ;
    const startGeneration = runtime.activeGeneration;
    const startOrientation = runtime.activeOrientation;
    const startBasePly = runtime.activeBasePly;
    const branchPosition = beginBranch(runtime.events, workerId);

    let decisionQ;
    let decisionGeneration;
    let decisionOrientation;
    let firstAction = -1;

    if (state.ply === startBasePly) {
      if (!addQRef(shared, startQ, startGeneration, workerId + 1)) {
        throw new Error('active shared q disappeared at decision frontier');
      }
      decisionQ = startQ;
      decisionGeneration = startGeneration;
      decisionOrientation = startOrientation;
      holdBranchRef(runtime.events, workerId, decisionQ, decisionGeneration);
    } else {
      decisionQ = this.holdPreparedQ(state);
      decisionGeneration = this.insertScratch[1];
      decisionOrientation = this.builder.orientation;
      const firstPhysical = state.moveCells[startBasePly] % 7;
      firstAction = startOrientation ? 6 - firstPhysical : firstPhysical;
    }

    let mask = 0;
    let retainedOrder = -1;
    let retainedEval = -1;

    // If another execution has already solved the deterministic endpoint, the
    // descriptor still publishes start -> decision so exact value/witness
    // propagation is canonical. No child work is manufactured.
    if (readExactQ(shared, decisionQ, decisionGeneration) === Q_EXACT_UNKNOWN) {
      for (let orderIndex = 0; orderIndex < count; orderIndex++) {
        const column = this.columns[base + orderIndex];
        const evaluation = singletonEffectClass(state, column);
        const action = decisionOrientation ? 6 - column : column;
        this.actions[base + orderIndex] = action;

        state.applyUnchecked(column);
        try {
          const q = this.holdPreparedQ(state);
          const generation = this.insertScratch[1];
          const orientation = this.builder.orientation;
          this.childQ[base + action] = q;
          this.childGeneration[base + action] = generation;
          this.childOrientation[base + action] = orientation;
          this.childEval[base + action] = evaluation;
        } finally {
          state.undo();
        }

        mask |= 1 << action;
        if (evaluation > retainedEval) {
          retainedEval = evaluation;
          retainedOrder = orderIndex;
        }
      }
    }

    const retainedAction = retainedOrder < 0 ? -1 : this.actions[base + retainedOrder];
    publishBranch(
      runtime.events,
      workerId,
      branchPosition,
      startQ,
      startGeneration,
      decisionQ,
      decisionGeneration,
      firstAction,
      mask,
      retainedAction,
      maximizing,
      runtime.activeRunToken,
      this.childQ,
      this.childGeneration,
      this.childEval,
      base,
    );
    runtime.count(WC_BRANCH_DESCRIPTORS);
    runtime.wakeManager();

    // The q currently represented by this recursive frame ceases to own CPU
    // once its dependency frontier is globally visible.
    if (runtime.executionQ === startQ
        && runtime.executionGeneration === startGeneration
        && releaseRunningQ(shared, startQ, startGeneration, workerId)) {
      runtime.executionQ = -1;
      runtime.executionGeneration = 0;
    }

    if (retainedOrder < 0) throw yieldExecution;

    // Only the highest-eval child remains local. Every posted sibling belongs
    // to the shared dependency/priority system and is never revisited here.
    runtime.count(WC_RETAINED_DESCENTS);
    const retainedColumn = this.columns[base + retainedOrder];
    this.solveOne(
      solver,
      state,
      retainedColumn,
      this.childQ[base + retainedAction],
      this.childGeneration[base + retainedAction],
      this.childOrientation[base + retainedAction],
    );

    // Parent reduction is BranchManager/shared-TT work. Returning a local best
    // would reintroduce a second dependency authority, so unwind this claim.
    throw yieldExecution;
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
    this.activeOrientation = 0;
    this.activeBasePly = 0;
    this.executionQ = -1;
    this.executionGeneration = 0;
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
    if (this.executionQ === qIndex && this.executionGeneration === generation) {
      this.executionQ = -1;
      this.executionGeneration = 0;
    }
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
    this.activeOrientation = 0;
    this.activeBasePly = 0;
    this.executionQ = -1;
    this.executionGeneration = 0;
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
    this.executionQ = qIndex;
    this.executionGeneration = generation;
    this.activeRunToken = Atomics.load(this.shared.workerReset, workerId);
    this.resetMetrics();
    const state = this.replayQ(qIndex, generation);
    this.distributor.builder.prepare(state);
    this.activeOrientation = this.distributor.builder.orientation;
    this.activeBasePly = state.ply;

    let exact = false;
    try {
      const value = this.solver.solveNode(state);
      this.maybePublishRootMove(state, value);
      this.publishExact(qIndex, generation, value);
      exact = true;
    } catch (error) {
      if (error === yieldExecution || error === resetExecution || error === sessionStopped) {
        if (error === resetExecution) this.count(WC_RESET_RETIREMENTS);
      } else {
        throw error;
      }
    } finally {
      if (!exact && this.executionQ >= 0
          && readExactQ(this.shared, this.executionQ, this.executionGeneration) === Q_EXACT_UNKNOWN
          && releaseRunningQ(
            this.shared,
            this.executionQ,
            this.executionGeneration,
            workerId,
          )) {
        this.count(WC_RELEASE_EVENTS);
        this.publishEvent(
          EVENT_RELEASE,
          this.executionQ,
          this.executionGeneration,
          0,
          0,
        );
      }
      this.executionQ = -1;
      this.executionGeneration = 0;
      this.accumulateSolverMetrics();
      this.activeQ = -1;
      this.activeGeneration = 0;
      this.activeOrientation = 0;
      this.activeBasePly = 0;
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
      if (runtime.shared && runtime.events) {
        recoverUnpublishedBranch(runtime.events, runtime.shared, workerId);
      }
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
