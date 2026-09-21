import { Worker } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { IsoMaxSolver } from '../solver.mjs';
import { PortableQBuilder } from './portable-q.mjs';
import {
  CTRL_ABORT,
  CTRL_ERROR,
  CTRL_MANAGER_WAKE,
  CTRL_Q_HIGH_WATER,
  CTRL_ROOT_GENERATION,
  CTRL_ROOT_MOVE,
  CTRL_ROOT_MOVE_READY,
  CTRL_ROOT_ORIENTATION,
  CTRL_ROOT_Q,
  CTRL_ROOT_VALUE,
  CTRL_SESSION,
  CTRL_WORKER_WAKE,
  EXEC_NONE,
  EXEC_RUNNING_BASE,
  Q_EXACT_UNKNOWN,
  SESSION_DONE,
  SESSION_FAILED,
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
  createSharedTT,
  enqueueQ,
  openSharedTT,
  probeOrInsertQ,
  qIsCurrent,
  recoverWorkerBucketLocks,
  recoverWorkerTTReservations,
  recycleQIfDead,
  runningExecution,
} from './shared-tt.mjs';
import { createSharedEvents, openSharedEvents, recoverUnpublishedBranch } from './shared-events.mjs';

function positive(value, name, maximum = 2 ** 30) {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new RangeError('invalid ' + name);
  }
  return value;
}

export const defaultIsoMaxWorkers = () => Math.max(1, Math.min(4, availableParallelism() - 1));

export class IsoMaxBranchManager {
  constructor({
    workers = defaultIsoMaxWorkers(),
    qCapacity = 131072,
    queueCapacity = 32768,
    edgeCapacity = qCapacity * 7,
    branchCapacity = 4096,
    eventCapacity = 8192,
    classReserve = workers <= 2 ? 524288 : 262144,
    entryReserve = workers <= 2 ? 2097152 : 1048576,
    retainedClasses = 786432,
    retainedEntries = 4194304,
    controlQuantum = 512,
  } = {}) {
    this.workerCount = positive(workers, 'workers', 256);
    this.qCapacity = positive(qCapacity, 'qCapacity', 2 ** 24);
    this.queueCapacity = positive(queueCapacity, 'queueCapacity', 2 ** 24);
    this.edgeCapacity = positive(edgeCapacity, 'edgeCapacity', 2 ** 27);
    this.branchCapacity = positive(branchCapacity, 'branchCapacity', 2 ** 20);
    this.eventCapacity = positive(eventCapacity, 'eventCapacity', 2 ** 20);
    this.classReserve = positive(classReserve, 'classReserve', 2 ** 26);
    this.entryReserve = positive(entryReserve, 'entryReserve', 2 ** 27);
    this.retainedClasses = positive(retainedClasses, 'retainedClasses', 2 ** 26);
    this.retainedEntries = positive(retainedEntries, 'retainedEntries', 2 ** 27);
    this.controlQuantum = positive(controlQuantum, 'controlQuantum', 1 << 20);

    this.workers = new Array(this.workerCount).fill(null);
    this.ready = new Array(this.workerCount).fill(null);
    this.readyResolve = new Array(this.workerCount).fill(null);
    this.readyReject = new Array(this.workerCount).fill(null);
    this.workerGeneration = new Int32Array(this.workerCount);
    this.session = null;
    this.sessionCounter = 0;
    this.started = false;
    this.closed = false;
    this.busy = false;
    this.closing = false;
    this.suppressRecovery = false;
    this.lastStats = null;
  }

  makeReadyPromise(id) {
    this.ready[id] = new Promise((resolve, reject) => {
      this.readyResolve[id] = resolve;
      this.readyReject[id] = reject;
    });
    return this.ready[id];
  }

  spawnWorker(id) {
    if (this.closed || this.closing) throw new Error('IsoMax manager is closed');
    const generation = ++this.workerGeneration[id];
    const ready = this.makeReadyPromise(id);
    const worker = new Worker(new URL('./worker.mjs', import.meta.url), {
      workerData: { workerId: id, workerCount: this.workerCount },
      execArgv: [],
      resourceLimits: {
        maxOldGenerationSizeMb: Math.max(64, Math.floor(4096 / (this.workerCount + 1))),
      },
    });
    this.workers[id] = worker;

    worker.on('message', message => this.handleWorkerMessage(id, generation, message));
    worker.on('error', error => this.handleWorkerFailure(id, generation, error));
    worker.on('exit', code => {
      if (generation !== this.workerGeneration[id]) return;
      this.workers[id] = null;
      if (!this.suppressRecovery && !this.closing && !this.closed && code !== 0) {
        void this.recoverDeadWorker(id, generation, new Error('IsoMax worker exited: ' + code));
      }
    });
    return ready;
  }

  handleWorkerMessage(id, generation, message) {
    if (generation !== this.workerGeneration[id]) return;
    if (message?.type === 'ready') {
      this.readyResolve[id]?.();
      this.readyResolve[id] = null;
      this.readyReject[id] = null;
      return;
    }

    const session = this.session;
    if (!session || message?.sessionId !== session.id) return;
    if (message.type === 'session-done') {
      if (session.workerDone[id] === 0) {
        session.workerDone[id] = 1;
        session.workerDoneCount++;
        if (session.workerDoneCount === this.workerCount) session.resolveWorkers();
      }
      return;
    }
    if (message.type === 'error') {
      this.failSession(new Error(message.message || 'IsoMax worker failed'));
    }
  }

  handleWorkerFailure(id, generation, error) {
    if (generation !== this.workerGeneration[id] || this.suppressRecovery) return;
    this.readyReject[id]?.(error);
    this.readyResolve[id] = null;
    this.readyReject[id] = null;
    if (this.session) void this.recoverDeadWorker(id, generation, error);
  }

  async recoverDeadWorker(id, generation, error) {
    if (generation !== this.workerGeneration[id] || this.closing || this.closed) return;
    const session = this.session;
    if (!session) {
      try {
        await this.spawnWorker(id);
      } catch {}
      return;
    }
    if (session.recovering[id]) return;
    session.recovering[id] = 1;
    try {
      const shared = session.shared;
      recoverWorkerBucketLocks(shared, id);
      recoverWorkerTTReservations(shared, id);
      recoverUnpublishedBranch(session.events, shared, id);
      const high = Math.min(shared.qCapacity, Atomics.load(shared.control, CTRL_Q_HIGH_WATER));
      for (let qIndex = 0; qIndex < high; qIndex++) {
        if (Atomics.load(shared.qLive, qIndex) === 0) continue;
        if (Atomics.load(shared.qExact, qIndex) !== Q_EXACT_UNKNOWN) continue;
        if (Atomics.compareExchange(
          shared.qExecution,
          qIndex,
          runningExecution(id),
          EXEC_NONE,
        ) !== runningExecution(id)) continue;
        const generationNow = Atomics.load(shared.qGeneration, qIndex);
        if (Atomics.load(shared.qRefCount, qIndex) > 0) {
          enqueueQ(
            shared,
            qIndex,
            generationNow,
            Atomics.load(shared.qPriorityClass, qIndex),
          );
          session.workerDeathRequeues++;
        } else {
          recycleQIfDead(shared, qIndex, generationNow);
        }
      }
      Atomics.add(shared.control, CTRL_MANAGER_WAKE, 1);
      Atomics.notify(shared.control, CTRL_MANAGER_WAKE, 1);

      const previous = this.workers[id];
      if (previous) {
        try { await previous.terminate(); } catch {}
      }
      if (this.closed || this.closing || this.session !== session) return;
      await this.spawnWorker(id);
      if (this.session !== session
          || Atomics.load(shared.control, CTRL_SESSION) !== SESSION_RUNNING) {
        session.workerDone[id] = 1;
        if (++session.workerDoneCount === this.workerCount) session.resolveWorkers();
        return;
      }
      session.workerDone[id] = 0;
      this.workers[id].postMessage(session.workerMessage);
    } catch (recoveryError) {
      this.failSession(new Error(
        'IsoMax worker recovery failed after ' + (error?.message || 'worker death')
          + ': ' + recoveryError.message,
      ));
    } finally {
      session.recovering[id] = 0;
    }
  }

  async start() {
    if (this.closed) throw new Error('IsoMax manager is closed');
    if (this.started) return;
    const ready = [];
    for (let id = 0; id < this.workerCount; id++) ready.push(this.spawnWorker(id));
    try {
      await Promise.all(ready);
      this.started = true;
    } catch (error) {
      await Promise.allSettled(this.workers.filter(Boolean).map(worker => worker.terminate()));
      this.workers.fill(null);
      this.closed = true;
      throw error;
    }
  }

  failSession(error) {
    const session = this.session;
    if (!session || session.failure) return;
    session.failure = error;
    session.rejectFailure?.(error);
    Atomics.store(session.shared.control, CTRL_ABORT, 1);
    Atomics.store(session.shared.control, CTRL_SESSION, SESSION_FAILED);
    Atomics.add(session.shared.control, CTRL_MANAGER_WAKE, 1);
    Atomics.notify(session.shared.control, CTRL_MANAGER_WAKE, Infinity);
    Atomics.add(session.shared.control, CTRL_WORKER_WAKE, 1);
    Atomics.notify(session.shared.control, CTRL_WORKER_WAKE, Infinity);
  }

  createSession(moves) {
    const ttDescriptor = createSharedTT({
      qCapacity: this.qCapacity,
      workerCount: this.workerCount,
      queueCapacity: this.queueCapacity,
      edgeCapacity: this.edgeCapacity,
    });
    const eventDescriptor = createSharedEvents({
      workerCount: this.workerCount,
      branchCapacity: this.branchCapacity,
      eventCapacity: this.eventCapacity,
    });
    const shared = openSharedTT(ttDescriptor);
    const events = openSharedEvents(eventDescriptor);

    const rootSolver = new IsoMaxSolver();
    const rootState = rootSolver.createState(moves);
    const builder = new PortableQBuilder();
    builder.prepare(rootState);
    const insert = new Int32Array(3);
    const rootQ = probeOrInsertQ(
      shared,
      builder.words,
      builder.support,
      builder.flags,
      builder.replay,
      builder.replayLength,
      insert,
    );
    const rootGeneration = insert[1];

    Atomics.store(shared.control, CTRL_ROOT_Q, rootQ);
    Atomics.store(shared.control, CTRL_ROOT_GENERATION, rootGeneration);
    Atomics.store(shared.control, CTRL_ROOT_ORIENTATION, builder.orientation);
    Atomics.store(shared.control, CTRL_ROOT_VALUE, Q_EXACT_UNKNOWN);
    Atomics.store(shared.control, CTRL_ROOT_MOVE, -1);
    Atomics.store(shared.control, CTRL_ROOT_MOVE_READY, 0);
    Atomics.store(shared.control, CTRL_ABORT, 0);
    Atomics.store(shared.control, CTRL_ERROR, 0);
    Atomics.store(shared.control, CTRL_SESSION, SESSION_RUNNING);
    enqueueQ(shared, rootQ, rootGeneration, 7);

    let resolveWorkers;
    const workersDone = new Promise(resolve => { resolveWorkers = resolve; });
    let rejectFailure;
    const failureSignal = new Promise((_, reject) => { rejectFailure = reject; });
    // failSession() owns this rejection; solveMoves races it immediately.
    // Attach a sink as well so setup-time failure cannot become unhandled.
    failureSignal.catch(() => {});
    const id = ++this.sessionCounter;
    const workerMessage = {
      type: 'session',
      sessionId: id,
      tt: ttDescriptor,
      events: eventDescriptor,
      rootPly: moves.length,
      controlQuantum: this.controlQuantum,
      classReserve: this.classReserve,
      entryReserve: this.entryReserve,
      retainedClasses: this.retainedClasses,
      retainedEntries: this.retainedEntries,
    };

    return {
      id,
      ttDescriptor,
      eventDescriptor,
      shared,
      events,
      rootQ,
      rootGeneration,
      rootPly: moves.length,
      workerMessage,
      workerDone: new Uint8Array(this.workerCount),
      workerDoneCount: 0,
      workersDone,
      resolveWorkers,
      failureSignal,
      rejectFailure,
      recovering: new Uint8Array(this.workerCount),
      workerDeathRequeues: 0,
      failure: null,
      managerMetrics: null,
      managerWorker: null,
    };
  }

  startManagerWorker(session) {
    const worker = new Worker(new URL('./manager-worker.mjs', import.meta.url), {
      workerData: {
        tt: session.ttDescriptor,
        events: session.eventDescriptor,
        workerCount: this.workerCount,
      },
      execArgv: [],
    });
    session.managerWorker = worker;
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (error, metrics) => {
        if (settled) return;
        settled = true;
        worker.removeAllListeners('message');
        worker.removeAllListeners('error');
        worker.removeAllListeners('exit');
        if (error) reject(error);
        else resolve(metrics);
      };
      worker.on('message', message => {
        if (message?.type === 'manager-done') finish(null, message.metrics);
        else if (message?.type === 'manager-error') finish(new Error(message.message));
      });
      worker.on('error', error => finish(error));
      worker.on('exit', code => {
        if (!settled && code !== 0) finish(new Error('IsoMax BranchManager worker exited: ' + code));
      });
    });
  }

  snapshotWorkerMetrics(shared) {
    const total = new Int32Array(WORKER_COUNTER_WORDS);
    for (let worker = 0; worker < this.workerCount; worker++) {
      const base = worker * WORKER_COUNTER_WORDS;
      for (let word = 0; word < WORKER_COUNTER_WORDS; word++) {
        total[word] += Atomics.load(shared.workerCounters, base + word);
      }
    }
    const claimsByBand = new Array(8);
    for (let band = 0; band < 8; band++) claimsByBand[band] = total[WC_CLAIM_BAND_BASE + band];
    return {
      claims: total[WC_CLAIMS],
      frontiers: total[WC_FRONTIERS],
      retainedDescents: total[WC_RETAINED_DESCENTS],
      duplicateReaches: total[WC_DUPLICATE_REACHES],
      resetRetirements: total[WC_RESET_RETIREMENTS],
      exactPublications: total[WC_EXACT_PUBLICATIONS],
      qCreated: total[WC_Q_CREATED],
      qReused: total[WC_Q_REUSED],
      queueEmptyPolls: total[WC_QUEUE_EMPTY],
      replayApplies: total[WC_REPLAY_APPLIES],
      controlChecks: total[WC_CONTROL_CHECKS],
      releaseEvents: total[WC_RELEASE_EVENTS],
      solverNodes: total[WC_SOLVER_NODES],
      cacheHits: total[WC_CACHE_HITS],
      nativeExactHits: total[WC_NATIVE_EXACT],
      recursiveChildren: total[WC_RECURSIVE_CHILDREN],
      forcedTransitions: total[WC_FORCED_TRANSITIONS],
      branchDescriptors: total[WC_BRANCH_DESCRIPTORS],
      sharedExactConsumed: total[WC_SHARED_EXACT_CONSUMED],
      claimsByBand,
    };
  }

  snapshot(session, elapsedMs = 0, cleanupMs = 0) {
    const shared = session.shared;
    let liveQ = 0;
    const high = Math.min(shared.qCapacity, Atomics.load(shared.control, CTRL_Q_HIGH_WATER));
    for (let qIndex = 0; qIndex < high; qIndex++) liveQ += Number(Atomics.load(shared.qLive, qIndex) !== 0);
    return {
      elapsedMs,
      cleanupMs,
      canonicalQ: high,
      liveQ,
      scheduler: {
        architecture: 'retained-decentralized-shared-tt',
        workers: this.workerCount,
        qCapacity: this.qCapacity,
        queueCapacity: this.queueCapacity,
      },
      metrics: {
        manager: session.managerMetrics ?? {},
        worker: this.snapshotWorkerMetrics(shared),
        workerDeathRequeues: session.workerDeathRequeues,
      },
    };
  }

  async solveMoves(moves = [], {
    timeoutMs = 120000,
    signal,
    onProgress,
  } = {}) {
    if (this.busy || this.closed) throw new Error('IsoMax manager is busy or closed');
    positive(timeoutMs, 'timeoutMs', 600000);
    if (!Array.isArray(moves)) throw new TypeError('moves must be an array');
    if (onProgress !== undefined && typeof onProgress !== 'function') throw new TypeError('invalid progress callback');
    if (signal?.aborted) throw new Error('ISOMAX_ABORTED');

    this.busy = true;
    const started = performance.now();
    let resultReadyMs = 0;
    let timer = null;
    let progressTimer = null;
    let onAbort = null;
    try {
      await this.start();
      const session = this.createSession(moves);
      this.session = session;

      const managerDone = this.startManagerWorker(session).then(metrics => {
        session.managerMetrics = metrics;
        return metrics;
      }).catch(error => {
        this.failSession(error);
        throw error;
      });

      for (let id = 0; id < this.workerCount; id++) {
        session.workerDone[id] = 0;
        this.workers[id].postMessage(session.workerMessage);
      }

      timer = setTimeout(() => this.failSession(new Error('ISOMAX_TIMEOUT')), timeoutMs);
      if (signal) {
        onAbort = () => this.failSession(new Error('ISOMAX_ABORTED'));
        signal.addEventListener('abort', onAbort, { once: true });
      }
      if (onProgress) {
        progressTimer = setInterval(() => {
          try { onProgress(this.snapshot(session, performance.now() - started, 0)); } catch {}
        }, 250);
      }

      await Promise.race([managerDone, session.failureSignal]);
      resultReadyMs = performance.now() - started;
      if (session.failure) throw session.failure;
      await session.workersDone;
      const cleanupMs = performance.now() - started - resultReadyMs;

      if (session.failure) throw session.failure;
      if (Atomics.load(session.shared.control, CTRL_SESSION) !== SESSION_DONE) {
        throw new Error('IsoMax shared session ended without exact root');
      }
      const value = Atomics.load(session.shared.control, CTRL_ROOT_VALUE);
      if (value !== -1 && value !== 0 && value !== 1) throw new Error('invalid shared root value');
      if (!Atomics.load(session.shared.control, CTRL_ROOT_MOVE_READY)) {
        throw new Error('shared root value completed without witness bookkeeping');
      }
      const moveRaw = Atomics.load(session.shared.control, CTRL_ROOT_MOVE);
      const move = moveRaw < 0 ? null : moveRaw;
      this.lastStats = this.snapshot(session, performance.now() - started, cleanupMs);
      return {
        value,
        move,
        ...this.lastStats,
        resultReadyMs,
        cleanup: 'shared q exact; workers returned to persistent polling boundary',
      };
    } finally {
      clearTimeout(timer);
      clearInterval(progressTimer);
      if (signal && onAbort) signal.removeEventListener('abort', onAbort);
      const session = this.session;
      if (session?.failure) {
        // A failed session must not rely on cooperative unwind to return host
        // control. Kill only this failed execution generation; normal success
        // retains persistent workers.
        this.suppressRecovery = true;
        try {
          if (session.managerWorker) {
            try { await session.managerWorker.terminate(); } catch {}
          }
          await Promise.allSettled(
            this.workers.filter(Boolean).map(worker => worker.terminate()),
          );
          this.workers.fill(null);
          this.started = false;
        } finally {
          this.suppressRecovery = false;
        }
      } else if (session?.managerWorker) {
        try { await session.managerWorker.terminate(); } catch {}
      }
      this.session = null;
      this.busy = false;
    }
  }

  async close() {
    if (this.closed) return;
    this.closing = true;
    if (this.session) this.failSession(new Error('ISOMAX_ABORTED'));
    const workers = this.workers.filter(Boolean);
    await Promise.allSettled(workers.map(worker => worker.terminate()));
    this.workers.fill(null);
    this.started = false;
    this.closed = true;
    this.closing = false;
  }
}

export async function solveIsoMax(moves = [], options = {}) {
  const manager = new IsoMaxBranchManager(options);
  try {
    return await manager.solveMoves(moves, options);
  } finally {
    await manager.close();
  }
}
