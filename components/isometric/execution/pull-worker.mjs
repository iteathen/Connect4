import { parentPort, workerData } from 'node:worker_threads';
import { ROWS } from '../../domain/index.mjs';
import { ResidualPool } from '../residual-pool.mjs';
import { IsometricState } from '../state.mjs';
import { nativeFrontierCode } from '../frontier.mjs';
import { CENTER_ORDER, promotedColumn } from '../move-order.mjs';
import {
  CTRL_ABORT,
  CTRL_FREE_WAKE,
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
  WC_PATH_REPLAYS,
  WC_RETIRED,
  WC_STALE_QUEUE,
  WC_TRANSITIONS,
  WORK_DONE,
  WORK_READY,
  WORK_RUNNING,
  WORK_WRITING,
  allocateWorkSlot,
  claimHighestReady,
  openSharedWorkPool,
  publishRecord,
} from './shared-work-pool.mjs';

if (!parentPort) throw new Error('IsoMax pull worker requires parentPort');

const workerIndex = workerData.workerId;
const workerCount = workerData.workerCount;
const retainedClasses = Math.max(4096, Math.floor(1048576 / workerCount));

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
    while (this.state.ply > 0) this.state.undo();
    const length = Atomics.load(shared.workPathLength, slot);
    if (length < 0 || length > MAX_MOVES) throw new Error('invalid pull work path length');
    const base = slot * MAX_MOVES;
    for (let ply = 0; ply < length; ply++) {
      const column = shared.workPath[base + ply];
      if (!this.state.canPlay(column)) throw new Error('invalid portable pull replay');
      this.state.applyUnchecked(column);
      this.counters[WC_TRANSITIONS]++;
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

  allocateChild(shared) {
    let slot = allocateWorkSlot(shared, this.allocateScratch);
    if (slot >= 0) return slot;
    if (Atomics.load(shared.control, CTRL_ABORT) ||
        Atomics.load(shared.control, CTRL_SESSION) !== SESSION_RUNNING) return -1;
    const epoch = Atomics.load(shared.control, CTRL_FREE_WAKE);
    this.counters[WC_FREE_WAITS]++;
    Atomics.wait(shared.control, CTRL_FREE_WAKE, epoch, 2);
    slot = allocateWorkSlot(shared, this.allocateScratch);
    if (slot >= 0) return slot;
    throw new Error('ISOMAX_PULL_WORK_CAPACITY');
  }

  publishBlocking(shared, kind, a, b, c, d, e, f, g) {
    while (!publishRecord(shared, kind, a, b, c, d, e, f, g)) {
      if (Atomics.load(shared.control, CTRL_ABORT) ||
          Atomics.load(shared.control, CTRL_SESSION) !== SESSION_RUNNING) return false;
      const epoch = Atomics.load(shared.control, CTRL_PUB_WAKE);
      Atomics.wait(shared.control, CTRL_PUB_WAKE, epoch, 2);
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
      const promoted = this.state.ply > rootPly ? promotedColumn(this.state) : -1;
      let childCount = 0;
      for (let orderIndex = 0; orderIndex < CENTER_ORDER.length; orderIndex++) {
        const column = CENTER_ORDER[orderIndex];
        if (this.state.heights[column] === ROWS) continue;
        const childSlot = this.allocateChild(shared);
        if (childSlot < 0) return this.publishRetired(shared, slot, generation, attempt);
        const childGeneration = this.allocateScratch[1];
        Atomics.store(shared.workPublisher, childSlot, workerIndex);
        const base = childSlot * MAX_MOVES;
        for (let ply = 0; ply < this.state.ply; ply++) {
          shared.workPath[base + ply] = this.state.moveCells[ply] % 7;
        }
        shared.workPath[base + this.state.ply] = column;
        Atomics.store(shared.workPathLength, childSlot, this.state.ply + 1);
        const localClass = column === promoted ? 1 : 0;
        // Publish the complete occurrence set before any child is executable.
        // This makes FRONTIER_END the semantic commit marker for the worker
        // attempt; a worker death before it cannot leave a half-frontier live.
        if (!this.publishBlocking(shared, PUB_CHILD,
          slot, generation, attempt, childSlot, childGeneration, column, localClass)) {
          return false;
        }
        this.frontierSlots[childCount] = childSlot;
        this.frontierGenerations[childCount] = childGeneration;
        childCount++;
        this.counters[WC_CHILDREN]++;
      }
      if (childCount < 2) throw new Error('pull decision frontier must expose at least two children');

      // Complete all child records in shared storage, but do not put any
      // child in a claimable queue before the semantic frontier commit marker.
      for (let index = 0; index < childCount; index++) {
        const childSlot = this.frontierSlots[index];
        if (Atomics.compareExchange(shared.workState, childSlot, WORK_WRITING, WORK_READY) !== WORK_WRITING) {
          throw new Error('invalid pull child state before frontier commit');
        }
      }

      Atomics.store(shared.workState, slot, WORK_DONE);
      this.counters[WC_FRONTIERS]++;
      if (!this.publishBlocking(shared, PUB_FRONTIER_END,
        slot, generation, attempt, childCount, firstDeterministic, this.state.ply, workerIndex)) return false;

      // FRONTIER_END is now visible. The worker relinquishes every child.
      // Canonical reconciliation alone assigns q identity and publishes the
      // resulting READY ticket at global priority. No discovery-lineage task
      // receives a provisional scheduling privilege.
      return true;
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
