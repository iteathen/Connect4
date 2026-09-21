import { parentPort, workerData } from 'node:worker_threads';
import { ROWS } from '../../domain/index.mjs';
import { ResidualPool } from '../residual-pool.mjs';
import { IsometricState } from '../state.mjs';
import { nativeFrontierCode } from '../frontier.mjs';
import { CENTER_ORDER, singletonEffectClass } from '../move-order.mjs';
import {
  CTRL_ABORT,
  CTRL_FREE_WAKE,
  CTRL_OCC_FREE_WAKE,
  CTRL_PUB_WAKE,
  CTRL_SESSION,
  CTRL_WAKE,
  MAX_MOVES,
  PUB_CHILD,
  PUB_EXACT,
  PUB_FAILURE,
  PUB_FRONTIER_END,
  PUB_RETIRED,
  SESSION_RUNNING,
  SESSION_STOP,
  WC_BAND_BASE,
  WC_CHILDREN,
  WC_CLAIMS,
  WC_DETERMINISTIC,
  WC_EXACT,
  WC_FREE_WAITS,
  WC_FRONTIER_EVALS,
  WC_FRONTIERS,
  WC_PATH_APPLIES,
  WC_PATH_REPLAYS,
  WC_PATH_UNDOS,
  WC_RETAINED_DESCENTS,
  WC_RESET_RETIREMENTS,
  WC_RETIRED,
  WC_STALE_QUEUE,
  WC_TRANSITIONS,
  WORK_DONE,
  WORK_READY,
  WORK_RUNNING,
  WORK_WRITING,
  allocateOccurrenceSlot,
  claimHighestReady,
  openSharedWorkPool,
  publishRecord,
} from './shared-work-pool.mjs';

if (!parentPort) throw new Error('IsoMax pull worker requires parentPort');

const workerIndex = workerData.workerId;
const workerCount = workerData.workerCount;
// Residual dictionaries are private per evaluator. They are not slices of one
// global reserve; any worker may inherit a hard subtree.
const retainedClasses = 524288;

class PullEvaluator {
  constructor() {
    this.pool = new ResidualPool();
    this.state = new IsometricState({ pool: this.pool });
    this.claimScratch = new Int32Array(4);
    this.queueScratch = new Int32Array(3);
    this.allocateScratch = new Int32Array(2);
    this.counters = new Int32Array(24);
    this.frontierSlots = new Int32Array(7);
    this.frontierGenerations = new Int32Array(7);
    this.frontierColumns = new Int8Array(7);
    this.frontierEvals = new Uint8Array(7);
  }

  prepareSession() {
    if (this.pool.classCount >= retainedClasses) {
      this.pool = new ResidualPool();
      this.state = new IsometricState({ pool: this.pool });
    }
    const additional = Math.max(1, retainedClasses - this.pool.classCount);
    this.pool.prepareSearchStorage(additional);
    this.counters.fill(0);
  }

  finishSession() {
    while (this.state.ply > 0) this.state.undo();
    this.pool.releaseSearchStorage();
  }

  resetToClaimedPath(shared, slot) {
    const length = Atomics.load(shared.workPathLength, slot);
    if (length < 0 || length > MAX_MOVES) throw new Error('invalid pull work path length');
    const base = slot * MAX_MOVES;

    // Portable identity remains the complete legal replay, but execution need
    // not reconstruct the unchanged prefix. Reuse only physical move equality;
    // no worker-local residual/class ID crosses this boundary.
    let common = Math.min(this.state.ply, length);
    let prefix = 0;
    while (prefix < common &&
      (this.state.moveCells[prefix] % 7) === shared.workPath[base + prefix]) prefix++;
    common = prefix;

    while (this.state.ply > common) {
      this.state.undo();
      this.counters[WC_PATH_UNDOS]++;
    }
    for (let ply = common; ply < length; ply++) {
      const column = shared.workPath[base + ply];
      if (!this.state.canPlay(column)) throw new Error('invalid portable pull replay');
      this.state.applyUnchecked(column);
      this.counters[WC_TRANSITIONS]++;
      this.counters[WC_PATH_APPLIES]++;
    }
    this.counters[WC_PATH_REPLAYS]++;
  }

  firstLegalColumn() {
    for (let index = 0; index < CENTER_ORDER.length; index++) {
      const column = CENTER_ORDER[index];
      if (this.state.heights[column] !== ROWS) return column;
    }
    return -1;
  }

  immediateWinningColumn() {
    const own = this.state.sideToMove === 0 ? this.state.p0Class : this.state.p1Class;
    for (let index = 0; index < CENTER_ORDER.length; index++) {
      const column = CENTER_ORDER[index];
      if (this.state.heights[column] === ROWS) continue;
      const cell = this.state.heights[column] * 7 + column;
      if (this.pool.hasSingletonAt(own, cell)) return column;
    }
    return -1;
  }

  allocateChildOccurrence(shared) {
    const slot = allocateOccurrenceSlot(shared, this.allocateScratch, workerIndex);
    if (slot >= 0) return slot;
    if (Atomics.load(shared.control, CTRL_ABORT) ||
        Atomics.load(shared.control, CTRL_SESSION) !== SESSION_RUNNING) return -1;
    // Evaluators never wait for BranchManager storage. Capacity exhaustion is
    // explicit and fail-closed.
    throw new Error('ISOMAX_PULL_OCCURRENCE_CAPACITY');
  }

  publishBlocking(shared, kind, a, b, c, d, e, f, g) {
    // Worker and BranchManager loops are independent. Publication never waits
    // for reconciliation; a full bounded ingress ring fails closed.
    if (Atomics.load(shared.control, CTRL_ABORT) ||
        Atomics.load(shared.control, CTRL_SESSION) !== SESSION_RUNNING) return false;
    if (!publishRecord(shared, kind, a, b, c, d, e, f, g)) {
      throw new Error('ISOMAX_PULL_PUBLICATION_CAPACITY');
    }
    return true;
  }

  publishRetired(shared, slot, generation, attempt) {
    Atomics.store(shared.workState, slot, WORK_DONE);
    this.counters[WC_RETIRED]++;
    return this.publishBlocking(shared, PUB_RETIRED, slot, generation, attempt, workerIndex, 0, 0, 0);
  }

  runClaim(shared, rootPly) {
    const slot = this.claimScratch[0];
    const generation = this.claimScratch[1];
    const attempt = this.claimScratch[2];

    this.counters[WC_CLAIMS]++;
    this.counters[WC_BAND_BASE + this.claimScratch[3]]++;
    if (Atomics.load(shared.workGeneration, slot) !== generation ||
        Atomics.load(shared.workState, slot) !== WORK_RUNNING ||
        Atomics.load(shared.workNeeded, slot) === 0) {
      if (Atomics.load(shared.workNeeded, slot) === 0) this.counters[WC_RESET_RETIREMENTS]++;
      return this.publishRetired(shared, slot, generation, attempt);
    }

    const claimedLength = Atomics.load(shared.workPathLength, slot);
    const claimedRoot = claimedLength === rootPly;
    this.resetToClaimedPath(shared, slot);
    let firstDeterministic = -1;

    while (true) {
      if (Atomics.load(shared.control, CTRL_ABORT) ||
          Atomics.load(shared.control, CTRL_SESSION) !== SESSION_RUNNING ||
          Atomics.load(shared.workNeeded, slot) === 0) {
        if (Atomics.load(shared.workNeeded, slot) === 0) this.counters[WC_RESET_RETIREMENTS]++;
        return this.publishRetired(shared, slot, generation, attempt);
      }

      this.counters[WC_FRONTIER_EVALS]++;
      const native = nativeFrontierCode(this.state);
      if (native !== 0 && native < 64) {
        const value = (native & 3) - 2;
        let directMove = firstDeterministic;
        if (directMove < 0 && claimedRoot && this.state.ply === rootPly && !this.state.isTerminal()) {
          directMove = (native === 9 || native === 11)
            ? this.immediateWinningColumn()
            : this.firstLegalColumn();
        }
        Atomics.store(shared.workResult, slot, value);
        Atomics.store(shared.workState, slot, WORK_DONE);
        this.counters[WC_EXACT]++;
        return this.publishBlocking(shared, PUB_EXACT,
          slot, generation, attempt, value, directMove, workerIndex, this.state.ply);
      }

      if (native >= 64) {
        const column = (native - 64) % 7;
        if (firstDeterministic < 0) firstDeterministic = column;
        this.state.applyUnchecked(column);
        this.counters[WC_DETERMINISTIC]++;
        this.counters[WC_TRANSITIONS]++;
        continue;
      }

      let legalCount = 0;
      let onlyColumn = -1;
      for (let column = 0; column < 7; column++) {
        if (this.state.heights[column] === ROWS) continue;
        legalCount++;
        onlyColumn = column;
        if (legalCount > 1) break;
      }
      if (legalCount === 0) throw new Error('ongoing pull state has no legal moves');
      if (legalCount === 1) {
        if (firstDeterministic < 0) firstDeterministic = onlyColumn;
        this.state.applyUnchecked(onlyColumn);
        this.counters[WC_DETERMINISTIC]++;
        this.counters[WC_TRANSITIONS]++;
        continue;
      }

      if (Atomics.load(shared.control, CTRL_SESSION) !== SESSION_RUNNING ||
          Atomics.load(shared.workNeeded, slot) === 0) {
        return this.publishRetired(shared, slot, generation, attempt);
      }
      let childCount = 0;
      let retainedIndex = -1;
      let retainedEval = -1;
      for (let orderIndex = 0; orderIndex < CENTER_ORDER.length; orderIndex++) {
        const column = CENTER_ORDER[orderIndex];
        if (this.state.heights[column] === ROWS) continue;
        const evalClass = singletonEffectClass(this.state, column);
        this.frontierColumns[childCount] = column;
        this.frontierEvals[childCount] = evalClass;
        if (evalClass > retainedEval) {
          retainedEval = evalClass;
          retainedIndex = childCount;
        }
        childCount++;
      }
      if (childCount < 2) throw new Error('pull decision frontier must expose at least two children');

      // Highest worker-local eval continues in-place. CENTER_ORDER provides the
      // deterministic tie break because we only replace on a strictly higher
      // eval.
      if (retainedIndex > 0) {
        let temp = this.frontierColumns[0];
        this.frontierColumns[0] = this.frontierColumns[retainedIndex];
        this.frontierColumns[retainedIndex] = temp;
        temp = this.frontierEvals[0];
        this.frontierEvals[0] = this.frontierEvals[retainedIndex];
        this.frontierEvals[retainedIndex] = temp;
      }
      retainedIndex = 0;

      for (let index = 0; index < childCount; index++) {
        const column = this.frontierColumns[index];
        const childSlot = this.allocateChildOccurrence(shared);
        if (childSlot < 0) return this.publishRetired(shared, slot, generation, attempt);
        const childGeneration = this.allocateScratch[1];
        const base = childSlot * MAX_MOVES;
        for (let ply = 0; ply < this.state.ply; ply++) {
          shared.occurrencePath[base + ply] = this.state.moveCells[ply] % 7;
        }
        shared.occurrencePath[base + this.state.ply] = column;
        Atomics.store(shared.occurrencePathLength, childSlot, this.state.ply + 1);

        // PUB_CHILD carries the worker's already-computed eval. BranchManager
        // consumes it for global queue priority; it never recomputes the child.
        if (!this.publishBlocking(shared, PUB_CHILD,
          slot, generation, attempt, childSlot, childGeneration, column,
          this.frontierEvals[index])) return false;
        this.frontierSlots[index] = childSlot;
        this.frontierGenerations[index] = childGeneration;
        this.counters[WC_CHILDREN]++;
      }

      this.counters[WC_FRONTIERS]++;
      if (!this.publishBlocking(shared, PUB_FRONTIER_END,
        slot, generation, attempt, childCount, firstDeterministic, retainedIndex, workerIndex)) return false;

      // Do not surrender the frontier. The worker keeps its existing execution
      // reservation and immediately descends the retained highest-eval child.
      // BranchManager will asynchronously retarget this RUNNING slot to the
      // canonical retained child q and queue only the posted remainder.
      this.state.applyUnchecked(this.frontierColumns[retainedIndex]);
      this.counters[WC_TRANSITIONS]++;
      this.counters[WC_RETAINED_DESCENTS]++;
      firstDeterministic = -1;
      continue;
    }
  }

  runSession(message) {
    const shared = openSharedWorkPool(message.pool);
    const rootPly = message.rootPly;
    if (!Number.isInteger(rootPly) || rootPly < 0 || rootPly > MAX_MOVES) {
      throw new TypeError('invalid pull root ply');
    }
    this.prepareSession();
    try {
      while (Atomics.load(shared.control, CTRL_SESSION) === SESSION_RUNNING &&
             !Atomics.load(shared.control, CTRL_ABORT)) {
        if (claimHighestReady(shared, workerIndex, this.claimScratch, this.queueScratch)) {
          this.runClaim(shared, rootPly);
          continue;
        }
        const wake = Atomics.load(shared.control, CTRL_WAKE);
        if (Atomics.load(shared.control, CTRL_SESSION) !== SESSION_RUNNING ||
            Atomics.load(shared.control, CTRL_ABORT)) break;
        Atomics.wait(shared.control, CTRL_WAKE, wake, 50);
      }
    } finally {
      this.finishSession();
    }
    return Array.from(this.counters);
  }
}

let evaluator = new PullEvaluator();
let running = false;

parentPort.on('message', (message) => {
  if (message?.type !== 'isomax-pull-session') {
    parentPort.postMessage({ type:'pull-error', workerId:workerIndex, message:'unsupported pull worker message' });
    return;
  }
  if (running) {
    parentPort.postMessage({ type:'pull-error', workerId:workerIndex, message:'pull worker session already running' });
    return;
  }
  running = true;
  try {
    const counters = evaluator.runSession(message);
    parentPort.postMessage({
      type:'pull-session-done',
      workerId:workerIndex,
      counters,
      localClasses:evaluator.pool.classCount,
    });
  } catch (error) {
    try {
      const shared = openSharedWorkPool(message.pool);
      Atomics.store(shared.control, CTRL_FAILURE, 1);
      Atomics.store(shared.control, CTRL_ABORT, 1);
      Atomics.store(shared.control, CTRL_SESSION, SESSION_STOP);
      Atomics.add(shared.control, CTRL_WAKE, 1);
      Atomics.notify(shared.control, CTRL_WAKE, Infinity);
      publishRecord(shared, PUB_FAILURE, workerIndex, 0, 0, 0, 0, 0, 0);
    } catch {}
    parentPort.postMessage({ type:'pull-error', workerId:workerIndex, message:error?.message ?? String(error) });
  } finally {
    running = false;
  }
});

parentPort.postMessage({ type:'pull-ready', workerId:workerIndex });
