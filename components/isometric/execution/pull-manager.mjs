import { Worker } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import {
  CTRL_ABORT,
  CTRL_PUB_WAKE,
  CTRL_SESSION,
  CTRL_WAKE,
  PRIORITY_BANDS,
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
  WC_QUEUE_DEQUEUES,
  WC_RETIRED,
  WC_STALE_QUEUE,
  WC_TRANSITIONS,
  WC_WORDS,
  createSharedWorkPool,
  openSharedWorkPool,
  stopSharedPool,
} from './shared-work-pool.mjs';

export const defaultIsoMaxPullWorkers = () => Math.max(1, Math.min(4, availableParallelism() - 1));

function positive(value, name, maximum = 1 << 28) {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new RangeError('invalid ' + name);
  }
  return value;
}

function onceReady(worker, type, workerIndex = null) {
  return new Promise((resolve, reject) => {
    const onError = error => finish(error);
    const onExit = code => finish(new Error('IsoMax pull worker exited during startup: ' + code));
    const onMessage = message => {
      if (message?.type !== type) return;
      if (workerIndex !== null && message.workerId !== workerIndex) {
        finish(new Error('invalid IsoMax pull worker readiness'));
        return;
      }
      finish(null);
    };
    const finish = error => {
      worker.off('error', onError);
      worker.off('exit', onExit);
      worker.off('message', onMessage);
      error ? reject(error) : resolve();
    };
    worker.on('error', onError);
    worker.on('exit', onExit);
    worker.on('message', onMessage);
  });
}

export class IsoMaxPullBranchManager {
  constructor({
    workers = defaultIsoMaxPullWorkers(),
    maxTasks = 65536,
    maxEdges = maxTasks * 7,
    workCapacity = Math.min(maxTasks, 16384),
    queueCapacity = Math.max(1024, Math.min(workCapacity * 2, 1 << 20)),
    publicationCapacity = Math.max(4096, Math.min(workCapacity * 2, 1 << 20)),
  } = {}) {
    this.workerCount = positive(workers, 'workers', 256);
    this.maxTasks = positive(maxTasks, 'maxTasks');
    this.maxEdges = positive(maxEdges, 'maxEdges');
    this.workCapacity = positive(workCapacity, 'workCapacity');
    this.queueCapacity = positive(queueCapacity, 'queueCapacity');
    this.publicationCapacity = positive(publicationCapacity, 'publicationCapacity');
    if (this.workCapacity > this.maxTasks) throw new RangeError('workCapacity cannot exceed maxTasks');
    this.workers = new Array(this.workerCount).fill(null);
    this.reconciler = null;
    this.busy = false;
    this.closed = false;
    this.startPromise = null;
    this.session = null;
    this.lastStats = null;
  }

  async start() {
    if (this.closed) throw new Error('IsoMax pull manager is closed');
    if (this.startPromise) return this.startPromise;
    this.startPromise = this.#startOwnedWorkers();
    try {
      await this.startPromise;
    } catch (error) {
      this.startPromise = null;
      throw error;
    }
  }

  async #startOwnedWorkers() {
    const pending = [];
    if (!this.reconciler) {
      const reconciler = new Worker(new URL('./pull-reconciler.mjs', import.meta.url), {
        execArgv:[],
        resourceLimits:{maxOldGenerationSizeMb:Math.max(32, Math.floor(4096 / (this.workerCount + 2)))},
      });
      this.reconciler = reconciler;
      pending.push(onceReady(reconciler, 'pull-reconciler-idle'));
      reconciler.on('exit', code => {
        if (this.closed) return;
        if (this.reconciler === reconciler) this.reconciler = null;
        if (this.session) this.#abortSession(new Error('IsoMax pull reconciler exited: ' + code));
      });
      reconciler.on('error', error => {
        if (this.session) this.#abortSession(error);
      });
    }

    for (let id = 0; id < this.workerCount; id++) {
      if (this.workers[id]) continue;
      const worker = new Worker(new URL('./pull-worker.mjs', import.meta.url), {
        workerData:{workerId:id, workerCount:this.workerCount},
        execArgv:[],
        resourceLimits:{maxOldGenerationSizeMb:Math.max(16, Math.floor(4096 / (this.workerCount + 2)))},
      });
      this.workers[id] = worker;
      pending.push(onceReady(worker, 'pull-ready', id));
      worker.on('exit', code => this.#workerExited(id, worker, code));
      worker.on('error', error => {
        if (this.session) this.#markWorkerUnavailable(id, error);
      });
    }
    await Promise.all(pending);
  }

  #wakeReconciler(shared) {
    Atomics.add(shared.control, CTRL_PUB_WAKE, 1);
    Atomics.notify(shared.control, CTRL_PUB_WAKE, Infinity);
    Atomics.add(shared.control, CTRL_WAKE, 1);
    Atomics.notify(shared.control, CTRL_WAKE, Infinity);
  }

  #workerExited(id, worker, code) {
    if (this.workers[id] !== worker) return;
    this.workers[id] = null;
    if (this.closed) return;
    if (this.session) {
      this.#markWorkerUnavailable(id, new Error('IsoMax pull evaluator exited: ' + code));
    } else {
      this.startPromise = null;
    }
  }

  #markWorkerUnavailable(id, error = null) {
    const session = this.session;
    if (!session || session.done[id]) return;
    session.done[id] = 1;
    if (session.shared) {
      Atomics.store(session.shared.workerAlive, id, 0);
      this.#wakeReconciler(session.shared);
    }
    if (error && !session.workerErrors[id]) session.workerErrors[id] = error;
    session.checkWorkersDone();
  }

  #abortSession(error) {
    const session = this.session;
    if (!session) return;
    if (!session.failure) session.failure = error;
    if (session.shared) {
      Atomics.store(session.shared.control, CTRL_ABORT, 1);
      stopSharedPool(session.shared);
      this.#wakeReconciler(session.shared);
    }
  }

  async solveMoves(moves = [], {
    timeoutMs = 120000,
    signal,
    onProgress,
    selectMove = true,
    progressIntervalMs = 1000,
  } = {}) {
    if (this.busy || this.closed) throw new Error('IsoMax pull manager is busy or closed');
    positive(timeoutMs, 'timeoutMs', 120000);
    if (!Array.isArray(moves) || moves.length > 42 ||
        moves.some(column => !Number.isInteger(column) || column < 0 || column > 6)) {
      throw new TypeError('moves must be a legal-column replay array');
    }
    if (onProgress !== undefined && typeof onProgress !== 'function') {
      throw new TypeError('invalid progress callback');
    }
    await this.start();
    if (!this.reconciler || this.workers.some(worker => !worker)) {
      this.startPromise = null;
      await this.start();
    }

    this.busy = true;
    const started = performance.now();
    const descriptor = createSharedWorkPool({
      workCapacity:this.workCapacity,
      workerCount:this.workerCount,
      publicationCapacity:this.publicationCapacity,
      queueCapacity:this.queueCapacity,
    });
    const shared = openSharedWorkPool(descriptor);
    for (let id = 0; id < this.workerCount; id++) Atomics.store(shared.workerAlive, id, this.workers[id] ? 1 : 0);

    let resultMessage = null;
    let reconcilerReady = false;
    let resolveReady, rejectReady, resolveResult, rejectResult, resolveWorkers;
    const readyPromise = new Promise((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
    const resultPromise = new Promise((resolve, reject) => { resolveResult = resolve; rejectResult = reject; });
    const workersDonePromise = new Promise(resolve => { resolveWorkers = resolve; });

    const session = {
      descriptor,
      shared,
      failure:null,
      done:new Uint8Array(this.workerCount),
      counters:Array.from({length:this.workerCount}, () => new Int32Array(WC_WORDS)),
      localClasses:new Int32Array(this.workerCount),
      workerErrors:new Array(this.workerCount).fill(null),
      checkWorkersDone:() => {
        for (let id = 0; id < this.workerCount; id++) if (!session.done[id]) return;
        resolveWorkers();
      },
    };
    this.session = session;

    const onReconcilerMessage = message => {
      if (message?.type === 'pull-reconciler-ready') {
        if (!reconcilerReady) {
          reconcilerReady = true;
          resolveReady();
        }
        return;
      }
      if (message?.type === 'pull-progress') {
        try { onProgress?.(message.snapshot); }
        catch (error) { this.#abortSession(error); }
        return;
      }
      if (message?.type === 'pull-result') {
        resultMessage = message;
        resolveResult(message);
        return;
      }
      if (message?.type === 'pull-reconciler-error') {
        const error = session.failure ?? new Error(message.message ?? 'IsoMax pull reconciliation failed');
        if (message.snapshot) this.lastStats = message.snapshot;
        rejectReady(error);
        rejectResult(error);
      }
    };
    const onReconcilerError = error => {
      this.#abortSession(error);
      rejectReady(error);
      rejectResult(error);
    };
    this.reconciler.on('message', onReconcilerMessage);
    this.reconciler.on('error', onReconcilerError);

    const evaluatorListeners = [];
    for (let id = 0; id < this.workerCount; id++) {
      const worker = this.workers[id];
      const onMessage = message => {
        if (message?.workerId !== id) return;
        if (message.type === 'pull-session-done') {
          const source = message.counters ?? [];
          for (let index = 0; index < Math.min(source.length, WC_WORDS); index++) {
            session.counters[id][index] = source[index] | 0;
          }
          session.localClasses[id] = message.localClasses ?? 0;
          session.done[id] = 1;
          session.checkWorkersDone();
        } else if (message.type === 'pull-error') {
          const error = new Error(message.message ?? 'IsoMax pull evaluator failed');
          this.#abortSession(error);
          this.#markWorkerUnavailable(id, error);
        }
      };
      worker.on('message', onMessage);
      evaluatorListeners.push([worker, onMessage]);
    }

    let timeoutReason = null;
    const timeout = setTimeout(() => {
      timeoutReason = new Error('ISOMAX_TIMEOUT: ' + timeoutMs + ' ms; no exact pull root result');
      this.#abortSession(timeoutReason);
    }, timeoutMs);
    const onAbort = () => this.#abortSession(new Error('ISOMAX_ABORTED'));
    signal?.addEventListener('abort', onAbort, {once:true});
    if (signal?.aborted) onAbort();

    try {
      this.reconciler.postMessage({
        type:'isomax-pull-reconcile',
        pool:descriptor,
        moves:[...moves],
        maxTasks:this.maxTasks,
        maxEdges:this.maxEdges,
        selectMove,
        progressIntervalMs,
      });
      await readyPromise;
      if (session.failure) throw session.failure;

      for (let id = 0; id < this.workerCount; id++) {
        const worker = this.workers[id];
        if (!worker) {
          this.#markWorkerUnavailable(id);
          continue;
        }
        worker.postMessage({
          type:'isomax-pull-session',
          pool:descriptor,
          rootPly:moves.length,
        });
      }

      const message = await resultPromise;
      await workersDonePromise;
      if (session.failure && !resultMessage) throw session.failure;

      const aggregate = new Int32Array(WC_WORDS);
      for (const counters of session.counters) {
        for (let index = 0; index < WC_WORDS; index++) aggregate[index] += counters[index];
      }
      const claimsByBand = Array.from({length:PRIORITY_BANDS},
        (_, band) => aggregate[WC_BAND_BASE + band]);
      const workerMetrics = {
        claims:aggregate[WC_CLAIMS],
        exact:aggregate[WC_EXACT],
        frontiers:aggregate[WC_FRONTIERS],
        children:aggregate[WC_CHILDREN],
        deterministicTransitions:aggregate[WC_DETERMINISTIC],
        retired:aggregate[WC_RETIRED],
        staleQueueRecords:aggregate[WC_STALE_QUEUE],
        queueDequeues:aggregate[WC_QUEUE_DEQUEUES],
        freeSlotWaits:aggregate[WC_FREE_WAITS],
        pathReplays:aggregate[WC_PATH_REPLAYS],
        transitionAttempts:aggregate[WC_TRANSITIONS],
        nativeStateEvaluations:aggregate[WC_FRONTIER_EVALS],
        claimsByBand,
        localClasses:Array.from(session.localClasses),
      };
      const elapsedMs = performance.now() - started;
      const snapshot = message.snapshot ?? {};
      const result = {
        value:message.value,
        move:message.move,
        elapsedMs,
        resultReadyMs:elapsedMs,
        scheduler:{
          architecture:'decentralized-pull',
          workers:this.workerCount,
          maxTasks:this.maxTasks,
          maxEdges:this.maxEdges,
          workCapacity:this.workCapacity,
          queueCapacity:this.queueCapacity,
          publicationCapacity:this.publicationCapacity,
        },
        metrics:{
          ...(snapshot.metrics ?? {}),
          worker:workerMetrics,
        },
        canonicalQ:snapshot.qCount ?? 0,
        canonicalEdges:snapshot.edgeCount ?? 0,
        workAllocated:snapshot.workAllocated ?? 0,
        memory:process.memoryUsage(),
        cleanup:'shared pool stopped; evaluator session drained; workers retained',
      };
      this.lastStats = result;
      return result;
    } catch (error) {
      this.#abortSession(timeoutReason ?? session.failure ?? error);
      await Promise.race([
        workersDonePromise,
        new Promise(resolve => setTimeout(resolve, 1000)),
      ]);
      throw timeoutReason ?? session.failure ?? error;
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', onAbort);
      this.reconciler?.off('message', onReconcilerMessage);
      this.reconciler?.off('error', onReconcilerError);
      for (const [worker, listener] of evaluatorListeners) worker.off('message', listener);
      this.session = null;
      this.busy = false;
    }
  }

  async close() {
    if (this.closed && !this.reconciler && this.workers.every(worker => !worker)) return;
    this.closed = true;
    if (this.session) this.#abortSession(new Error('ISOMAX_ABORTED: pull session closed'));
    const owned = [this.reconciler, ...this.workers].filter(Boolean);
    this.reconciler = null;
    this.workers.fill(null);
    const stopped = await Promise.allSettled(owned.map(worker => worker.terminate()));
    if (stopped.some(result => result.status === 'rejected')) {
      throw new Error('IsoMax pull worker termination failed');
    }
  }
}

export async function solveIsoMaxPull(moves = [], options = {}) {
  const manager = new IsoMaxPullBranchManager(options);
  try {
    return await manager.solveMoves(moves, options);
  } finally {
    await manager.close();
  }
}
