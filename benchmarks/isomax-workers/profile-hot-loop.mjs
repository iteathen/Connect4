// Qualification only. Profiling never supplies timing used for promotion.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import inspector from 'node:inspector';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
const roots = ['717657616532237625', '466537327657277224', '616767454664457417'];
if (isMainThread) {
  const output = path.resolve(process.argv[2]);
  fs.mkdirSync(output, { recursive: true });
  const source = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', windowsHide: true }).trim();
  const moduleUrl = process.argv[3] ? pathToFileURL(path.resolve(process.argv[3], 'components/isometric/execution/task.mjs')).href
    : new URL('../../components/isometric/execution/task.mjs', import.meta.url).href;
  const worker = new Worker(new URL(import.meta.url), { workerData: { output, moduleUrl }, execArgv: [] });
  const result = await new Promise((resolve, reject) => {
    worker.once('message', resolve); worker.once('error', reject);
    worker.once('exit', code => { if (code) reject(new Error('profiler worker exit ' + code)); });
  });
  await new Promise((resolve, reject) => {
    if (worker.threadId === -1) return resolve();
    worker.once('exit', code => code ? reject(new Error('profiler exit ' + code)) : resolve());
  });
  const testedSource = process.argv[3] ? execFileSync('git', ['-C', process.argv[3], 'rev-parse', 'HEAD'],
    { encoding: 'utf8', windowsHide: true }).trim() : source;
  const sourceDiff = execFileSync('git', ['-C', process.argv[3] ?? process.cwd(), 'diff', 'HEAD'],
    { encoding: 'utf8', windowsHide: true });
  const report = { source: testedSource, sourceDirty: sourceDiff.length !== 0,
    sourceDiffSha256: createHash('sha256').update(sourceDiff).digest('hex'),
    harnessSource: source, node: process.version, v8: process.versions.v8, cpu: os.cpus()[0]?.model,
    workload: roots, quantum: 65536, mode: 'actual native task kernel in worker; profiles are not wall-time evidence', ...result };
  fs.writeFileSync(path.join(output, 'summary.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} else {
  const { IsoMaxTaskSolver } = await import(workerData.moduleUrl);
  const session = new inspector.Session(); session.connect();
  const post = (method, params = {}) => new Promise((resolve, reject) =>
    session.post(method, params, (error, data) => error ? reject(error) : resolve(data)));
  await post('Profiler.enable'); await post('Profiler.start');
  await post('HeapProfiler.enable'); await post('HeapProfiler.startSampling', { samplingInterval: 32768,
    includeObjectsCollectedByMajorGC: true, includeObjectsCollectedByMinorGC: true });
  const results = [], abort = new SharedArrayBuffer(4), needed = new SharedArrayBuffer(4);
  Atomics.store(new Int32Array(needed), 0, 1);
  for (const sequence of roots) {
    const moves = Array.from(sequence, c => Number(c) - 1), solver = new IsoMaxTaskSolver();
    let calls = 0, tasks = 0, result;
    do {
      result = solver.runTask({ moves, rootPly: moves.length, nodeBudget: 65536, abort, needed });
      calls += result.nodes; tasks++;
      if (tasks > 128) throw new Error('profile task bound exhausted');
    } while (result.kind === 'split');
    if (result.kind !== 'exact') throw new Error('profile did not finish exactly');
    results.push({ sequence, calls, tasks, value: result.value });
  }
  const { profile: cpu } = await post('Profiler.stop');
  const { profile: heap } = await post('HeapProfiler.stopSampling');
  session.disconnect();
  fs.writeFileSync(path.join(workerData.output, 'cpu.cpuprofile'), JSON.stringify(cpu));
  fs.writeFileSync(path.join(workerData.output, 'heap.heapprofile'), JSON.stringify(heap));
  const samples = new Map(), nodes = new Map(cpu.nodes.map(n => [n.id, n]));
  for (let i = 0; i < cpu.samples.length; i++)
    samples.set(cpu.samples[i], (samples.get(cpu.samples[i]) ?? 0) + cpu.timeDeltas[i]);
  const frame = f => ({ name: f.functionName, source: f.url.includes('/components/')
    ? f.url.slice(f.url.indexOf('/components/') + 1) : f.url.startsWith('node:') ? f.url : '(runtime/setup)',
    line: f.lineNumber + 1 });
  const totals = new Map();
  for (const [id, us] of samples) {
    const f = frame(nodes.get(id).callFrame), key = JSON.stringify(f);
    if (!totals.has(key)) totals.set(key, { ...f, selfUs: 0 });
    totals.get(key).selfUs += us;
  }
  const hot = [...totals.values()].sort((a,b) => b.selfUs - a.selfUs).slice(0, 40);
  const allocations = [];
  const visit = n => { if (n.selfSize) allocations.push({ ...frame(n.callFrame), sampledBytes: n.selfSize });
    for (const child of n.children) visit(child); };
  visit(heap.head); allocations.sort((a,b) => b.sampledBytes - a.sampledBytes);
  parentPort.postMessage({ results, cpuDurationUs: cpu.endTime - cpu.startTime, hot,
    sampledAllocationBytes: allocations.reduce((s,r) => s+r.sampledBytes,0), allocationSites: allocations.slice(0,30) });
  parentPort.close();
}
