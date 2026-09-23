import { Worker } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';
import { createTT7x6, intern7x6, enqueue, fail, ROOT, ROOT_GENERATION, DONE, ERROR,
  STOP, WAKE, WORKER_DIED, DEADLINE, CANCELLED, KEY_WORDS, ROOT_REFLECTED } from './shared-tt.mjs';

// COLD HOST LIFECYCLE ONLY. This object is not the execution manager's q
// authority. The manager thread operates directly on the shared TT rows.
export class IsoMaxBranchManager {
  constructor({ workers = 1, capacity = 4096, buckets = 4096, kernelURL,
    kernelData = null, timeoutMs = 120000 } = {}) {
    if (!Number.isInteger(workers) || workers < 1 || workers > 64 ||
        !Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > 120000) {
      throw new RangeError('invalid workers or timeout (maximum 120 seconds)');
    }
    if (typeof kernelURL !== 'string' || !kernelURL.startsWith('file:')) {
      throw new TypeError('prepared local kernel module URL required');
    }
    this.options = { workers, capacity, buckets, kernelURL, kernelData, timeoutMs };
    this.running = false;
  }

  async run(rootWords, { reflected = false, signal } = {}) {
    if (this.running) throw new Error('session already running');
    if (!(rootWords instanceof Uint32Array) || rootWords.length !== KEY_WORDS ||
        (rootWords[0] >>> 21) > 42) throw new TypeError('canonical standard q required');
    const start = performance.now();
    const o = this.options;
    const t = createTT7x6(o.capacity, o.buckets);
    this.running = true;
    const root = intern7x6(t, rootWords, 0);
    t.control[ROOT] = root; t.control[ROOT_GENERATION] = t.generation[root];
    t.control[ROOT_REFLECTED] = reflected ? 1 : 0;
    enqueue(t, root);
    const threads = [], exits = [], errors = [];
    const metricViews=Array.from({length:o.workers},()=>new Float64Array(new SharedArrayBuffer(16*8)));
    let exited = 0, finished = false;
    let timer, poll;
    const abort = () => fail(t, CANCELLED);
    try {
      if (signal?.aborted) abort();
      signal?.addEventListener('abort', abort, { once: true });
      // One manager plus N evaluators. Only this setup clones view descriptors;
      // backing storage is shared and no per-branch structured clone occurs.
      const spawn = (file, data) => {
        const worker = new Worker(new URL(file, import.meta.url), { workerData: data });
        threads.push(worker);
        exits.push(new Promise(resolve => {
          worker.once('error', error => {
            errors.push(error.stack ?? String(error)); fail(t, WORKER_DIED);
          });
          worker.once('exit', code => {
            exited++;
            if (!finished && !Atomics.load(t.control, STOP) && !Atomics.load(t.control, DONE)) {
              errors.push(`Unexpected worker exit ${code}`); fail(t, WORKER_DIED);
            }
            resolve(code);
          });
        }));
      };
      spawn('./manager-worker.mjs', { table: t });
      for (let i = 0; i < o.workers; i++) spawn('./worker-thread.mjs', {
        table: t, owner: i + 2, workers: o.workers, kernelURL: o.kernelURL, kernelData: o.kernelData,
        metrics:metricViews[i],
      });
      await new Promise(resolve => {
        timer = setTimeout(() => { fail(t, DEADLINE); resolve(); }, o.timeoutMs);
        poll = setInterval(() => {
          if (Atomics.load(t.control, STOP) || Atomics.load(t.control, DONE)) resolve();
        }, 2);
      });
    } catch (error) {
      errors.push(error.stack ?? String(error)); fail(t, WORKER_DIED);
    } finally {
      finished = true;
      clearTimeout(timer); clearInterval(poll);
      signal?.removeEventListener('abort', abort);
      Atomics.store(t.control, STOP, 1);
      Atomics.add(t.control, WAKE, 1); Atomics.notify(t.control, WAKE);
      // Joining every termination prevents dangling workers, including a kernel
      // which ignores control polls. Never delete Node's own exit listeners.
      await Promise.allSettled(threads.map(worker => worker.terminate()));
      await Promise.all(exits);
      this.running = false;
    }
    const errorCode = Atomics.load(t.control, ERROR);
    const exact = !errorCode && Atomics.load(t.control, DONE) === 1;
    const move = exact ? t.witness[root] : -1;
    return {
      status: exact ? 'EXACT' : errorCode === DEADLINE ? 'TIMEOUT' : 'FAILED',
      rootWdl: exact ? t.exact[root] - 2 : null,
      move: reflected && move >= 0 ? 6 - move : move,
      errorCode, errors, elapsedMs: performance.now() - start,
      metrics:metricViews.reduce((sum,v)=>{
        const names=['fallbackNodes','transitions','claims','fallbackSelections','branches','continuations',
          'boundaryCalls','boundaryClosures','boundarySteps','boundaryFailures'];
        names.forEach((name,i)=>{sum[name]=(sum[name]??0)+v[i];});return sum;
      },{}),
      cleanup: exited === threads.length, workersExited: exited,
      sharedBytes: Object.values(t).reduce((n, v) => n + (ArrayBuffer.isView(v) ? v.byteLength : 0), 0),
    };
  }
}
