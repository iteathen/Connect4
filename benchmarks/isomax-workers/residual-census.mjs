// Diagnostic instrumentation only. Never import this into production recursion.
// Maps, timers and wrappers intentionally perturb execution: counts are evidence;
// instrumented times are attribution clues, NOT optimization timing claims.
import fs from 'node:fs';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import { IsoMaxTaskSolver } from '../../components/isometric/execution/task.mjs';
const roots = ['717657616532237625', '466537327657277224', '616767454664457417', ''];
if (isMainThread) {
  const worker = new Worker(new URL(import.meta.url));
  let records;
  await new Promise((resolve, reject) => {
    worker.on('message', value => { records = value; });
    worker.on('error', reject);
    worker.on('exit', code => code ? reject(new Error('census worker failed ' + code)) : resolve());
  });
  if (!records) throw new Error('missing census');
  const report = { source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    node: process.version, cpu: os.cpus()[0].model, quantum: 65536,
    mode: 'real worker native task; repeated warm-root tasks, not manager scheduling; instrumentation perturbs timing', records };
  fs.writeFileSync(process.argv[2], JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(records.map(r => ({ sequence: r.sequence, nodes: r.nodes,
    classes: r.classCount, transitions: r.transitions, blockChunks: r.blockChunks,
    phasesMs: r.phasesMs }))));
} else {
  const records = [], abort = new SharedArrayBuffer(4), needed = new SharedArrayBuffer(4);
  Atomics.store(new Int32Array(needed), 0, 1);
  for (const sequence of roots) {
    const solver = new IsoMaxTaskSolver(), pool = solver.pool;
    const phasesMs = {}, phaseCalls = {}, transitions = {}, tasks = [];
    let currentBlock = -1, currentCell = -1;
    const triples = new Set(), blockChunks = { internerCalls: 0, repeatedTriples: 0 };
    for (let slot = 0; slot < pool.slotPools.length; slot++) {
      const chunk = pool.slotPools[slot], intern = chunk.intern;
      chunk.intern = function (source, offset) {
        if (currentBlock >= 0) {
          // Bound numeric key encoding by actual class/chunk domain in this run.
          const parent = pool.classSlotIds[slot][currentBlock];
          if (parent >= 2 ** 24) throw new Error('census triple key bound');
          const key = ((slot * 2 ** 24 + parent) * 42) + currentCell;
          blockChunks.internerCalls++;
          if (triples.has(key)) blockChunks.repeatedTriples++; else triples.add(key);
        }
        return intern.call(this, source, offset);
      };
    }
    for (const kind of ['own', 'block']) {
      const name = kind + 'Transition', original = pool[name], seen = new Set();
      const bands = Array.from({ length: 9 }, (_, i) => ({ lower: i ? 4096 * 2 ** (i - 1) : 0,
        upper: i < 8 ? 4096 * 2 ** i : null, calls: 0, directHits: 0, recomputations: 0 }));
      transitions[kind] = bands;
      pool[name] = function (id, cell) {
        const band = bands[Math.min(8, id < 4096 ? 0 : 1 + Math.floor(Math.log2(id / 4096)))];
        band.calls++;
        const key = id * 42 + cell;
        if (id < this.transitionPrefixClasses && this[kind + 'Transitions'][key] !== -3) band.directHits++;
        else if (seen.has(key)) band.recomputations++;
        seen.add(key);
        if (kind === 'block') { currentBlock = id; currentCell = cell; }
        const start = performance.now();
        try { return original.call(this, id, cell); }
        finally {
          phasesMs[name] = (phasesMs[name] ?? 0) + performance.now() - start;
          if (kind === 'block') currentBlock = -1;
        }
      };
    }
    for (const [owner, name, label] of [[solver, 'createState', 'replay'],
      [pool, 'prepareSearchStorage', 'poolPreparation'],
      [solver.transitionCache, 'prepareSearchStorage', 'cachePreparation'],
      [solver, 'packageContinuation', 'continuationPackaging']]) {
      const original = owner[name];
      owner[name] = function (...args) {
        const start = performance.now(); phaseCalls[label] = (phaseCalls[label] ?? 0) + 1;
        try { return original.apply(this, args); }
        finally { phasesMs[label] = (phasesMs[label] ?? 0) + performance.now() - start; }
      };
    }
    const moves = Array.from(sequence, c => Number(c) - 1);
    let result, nodes = 0;
    do {
      const start = performance.now();
      result = solver.runTask({ moves, rootPly: moves.length, nodeBudget: 65536, abort, needed });
      nodes += result.nodes;
      tasks.push({ elapsedMs: performance.now() - start, nodes: result.nodes, classes: pool.classCount,
        chunks: pool.slotPools.map(p => p.count), kind: result.kind });
    } while (result.kind === 'split' && tasks.length < (sequence ? 128 : 8));
    if (sequence && result.kind !== 'exact') throw new Error('census exact root did not complete');
    records.push({ sequence, nodes, value: result.value ?? null, result: result.kind,
      classCount: pool.classCount, transitions, blockChunks: { ...blockChunks, uniqueTriples: triples.size },
      phasesMs, phaseCalls, tasks });
  }
  parentPort.postMessage(records); parentPort.close();
}
