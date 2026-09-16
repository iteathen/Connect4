import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { performance } from 'node:perf_hooks';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { Session } from 'node:inspector';

if (process.argv[2] === '--child') {
  const config = JSON.parse(process.argv[3]);
  const { createSlot64ResidualQuotientKernel } = await import('./quotient-native-negamax-slot64-residual-kernel.mjs');
  const { createSemanticSharedTtArena } = await import('./quotient-semantic-shared-tt.mjs');
  const { createOnlineSemanticQuotientSearcher } = await import('./quotient-online-semantic-search-lib.mjs');
  const { createBoundedStoragePlan } = await import('./quotient-bounded-storage-plan.mjs');
  const setupStarted = performance.now();
  const { kernel } = createSlot64ResidualQuotientKernel(config.domain, { cacheEdges: true, prefixClasses: 4096 });
  const reservation = createBoundedStoragePlan(kernel, config.depth, config.reservationBudgetBytes);
  kernel.prepareSearchStorage(reservation.searchStorage);
  const arena = createSemanticSharedTtArena({ ...reservation.arena, domainSpec: kernel.domain });
  const searcher = createOnlineSemanticQuotientSearcher(kernel, arena, { etc: false });
  assert.equal(kernel.memoryStats().totalTypedBytes, reservation.kernelBytes, 'kernel reservation estimate drift');
  assert.equal(searcher.descriptorCache.metrics.retainedTypedBytes + searcher.descriptorCache.metrics.scratchBytes,
    reservation.descriptorBytes, 'descriptor reservation estimate drift');
  assert.equal(Object.values(arena).reduce((sum, value) => sum + (value instanceof SharedArrayBuffer ? value.byteLength : 0), 0),
    reservation.arenaBytes, 'shared arena reservation estimate drift');
  const setupMs = performance.now() - setupStarted;
  const storageBefore = kernel.storageGrowthStats();
  const descriptorCapacityBefore = searcher.descriptorCache.metrics.classCapacity;
  let result, searchMs, cpu, profile;
  const profiler = config.cpuProfile ? new Session() : null;
  const post = (method, params = {}) => new Promise((accept, reject) =>
    profiler.post(method, params, (error, response) => error ? reject(error) : accept(response)));
  try {
    if (profiler) {
      profiler.connect();
      await post('Profiler.enable');
      await post('Profiler.setSamplingInterval', { interval: 1000 });
      await post('Profiler.start');
    }
    const start = performance.now(), cpuStart = process.cpuUsage();
    result = searcher.searchBounded(kernel.rootId, -2, 2, config.depth);
    searchMs = performance.now() - start;
    cpu = process.cpuUsage(cpuStart);
    if (profiler) ({ profile } = await post('Profiler.stop'));
  } finally { profiler?.disconnect(); }
  // Profile serialization and reporting happen after the measured search.
  if (profile) await writeFile(config.cpuProfile, JSON.stringify(profile));
  assert.ok(result.maxReachedDepth <= config.depth);
  const storageAfter = kernel.storageGrowthStats();
  assert.equal(storageBefore.prepared, true);
  assert.deepEqual(storageAfter, storageBefore, 'storage grew inside bounded search');
  assert.equal(searcher.descriptorCache.metrics.classCapacity, descriptorCapacityBefore, 'descriptor metadata grew inside search');
  console.log(JSON.stringify({ kind: 'normal-frontier-negamax-bounded-search', node: process.version,
    domain: kernel.domain, config, reservation, result, setupMs, searchMs, cpuMs: (cpu.user + cpu.system) / 1000,
    search: searcher.stats(), memory: kernel.memoryStats(), storageDuringSearch: { before: storageBefore, after: storageAfter },
    operations: { transitions: { ...kernel.transitionMetrics }, states: { ...kernel.states.metrics },
      residual: { ...kernel.classes.metrics }, chunks: kernel.classes.slotPools.map(pool => ({ ...pool.metrics })) },
    processMemory: process.memoryUsage() }));
} else {
  const { values } = parseArgs({ options: {
    columns: { type: 'string', default: '7' }, rows: { type: 'string', default: '6' },
    connect: { type: 'string', default: '4' }, depth: { type: 'string', default: '8' },
    'timeout-ms': { type: 'string', default: '60000' },
    'memory-mib': { type: 'string', default: '2048' },
    'cpu-profile': { type: 'string' },
  } });
  for (const key of ['columns', 'rows', 'connect', 'depth', 'timeout-ms', 'memory-mib']) {
    const value = values[key];
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1) throw new RangeError(`invalid ${key}`);
  }
  const config = { domain: { columns: Number(values.columns), rows: Number(values.rows), connect: Number(values.connect) },
    depth: Number(values.depth), timeoutMs: Number(values['timeout-ms']), reservationBudgetBytes: Number(values['memory-mib']) * 1048576 };
  if (values['cpu-profile'] !== undefined) {
    if (!values['cpu-profile'].trim()) throw new TypeError('cpu-profile must name an output file');
    config.cpuProfile = resolve(values['cpu-profile']);
  }
  const child = spawn(process.execPath, ['--max-old-space-size=2048', fileURLToPath(import.meta.url), '--child', JSON.stringify(config)],
    { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  let stdout = '', stderr = '', timedOut = false;
  child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
  child.stdout.on('data', chunk => { stdout += chunk; });
  child.stderr.on('data', chunk => { stderr += chunk; });
  const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, config.timeoutMs);
  try {
    const [code, signal] = await once(child, 'close');
    if (timedOut) {
      console.log(JSON.stringify({ status: 'timed-out', config, signal, childExited: true }));
      process.exitCode = 124;
    } else {
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      process.exitCode = code ?? 1;
    }
  } finally { clearTimeout(timer); }
}
