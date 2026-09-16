import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const toolbox = dirname(fileURLToPath(import.meta.url));
const here = resolve(toolbox, process.argv[3]); await mkdir(here);
const src = resolve(process.argv[2], 'research/semantic-quotient/state-identity-unification/src');
const output = resolve(here, 'profile');
const worker = resolve(toolbox, 'profile-worker.mjs');
function change(source, before, after) {
  assert.equal(source.split(before).length, 2, `unique profiling seam: ${before}`);
  return source.replace(before, after);
}
let bounded = (await readFile(resolve(src, 'quotient-bounded-search.mjs'), 'utf8')).replaceAll('\r\n', '\n');
bounded = bounded.replace(/(['"])(\.\/[^'"]+\.mjs)\1/g, (_, quote, name) => JSON.stringify(pathToFileURL(resolve(src, name)).href));
bounded = "import { Worker } from 'node:worker_threads';\n" + bounded;
const start = bounded.indexOf('  let result, searchMs, cpu, profile;');
const end = bounded.indexOf('  // Profile serialization and reporting happen after the measured search.');
assert.ok(start > 0 && end > start);
bounded = bounded.slice(0, start) + `  await writeFile(new URL('./reservation.json', import.meta.url), JSON.stringify(reservation, null, 2));
  let result, searchMs, cpu, profile, failure = null;
  globalThis.__c4Counters = () => ({ ...searcher.stats(), operations: { transitions: { ...kernel.transitionMetrics }, states: { ...kernel.states.metrics }, residual: { ...kernel.classes.metrics } }, memory: kernel.memoryStats() });
  const profilerWorker = new Worker(${JSON.stringify(worker)}, { workerData: {
    profile: config.cpuProfile, metadata: config.cpuProfile + '.window.json', checkpointMs: 55000 } });
  const saved = new Promise((accept, reject) => {
    profilerWorker.on('message', message => { if (message.status === 'saved') accept(); });
    profilerWorker.on('error', reject);
  });
  await once(profilerWorker, 'message');
  const started = performance.now(), cpuStarted = process.cpuUsage();
  try { result = searcher.searchBounded(kernel.rootId, -2, 2, config.depth); }
  catch (error) { failure = error; }
  searchMs = performance.now() - started; cpu = process.cpuUsage(cpuStarted);
  profilerWorker.postMessage({ stop: true });
  await saved; await profilerWorker.terminate();
` + bounded.slice(end);
bounded = change(bounded, '  assert.ok(result.maxReachedDepth <= config.depth);',
  `  if (failure) result = { status: 'failed', value: null, requestedDepth: config.depth,
    error: { name: failure.name, message: failure.message, stack: failure.stack } };
  else assert.ok(result.maxReachedDepth <= config.depth);`);
await writeFile(resolve(here, 'bounded.mjs'), bounded);

let profiler = (await readFile(resolve(src, 'quotient-bounded-line-profile.mjs'), 'utf8')).replaceAll('\r\n', '\n');
profiler = change(profiler, 'const output = resolve(outputArg), sourceDir = dirname(fileURLToPath(import.meta.url));',
  `const output = resolve(outputArg), sourceDir = ${JSON.stringify(src)};`);
profiler = change(profiler, "const baseline = JSON.parse(await readFile(resolve(baselineArg), 'utf8'));", 'const baseline = null;');
profiler = change(profiler, "const commandArgs = [join(sourceDir, 'quotient-bounded-search.mjs'), ...bounds, '--cpu-profile', profilePath];",
  `const commandArgs = [${JSON.stringify(resolve(here, 'bounded.mjs'))}, ...bounds, '--cpu-profile', profilePath];`);
profiler = change(profiler, '{ windowsHide: true, maxBuffer: 16 * 1024 * 1024 });',
  `{ windowsHide: true, maxBuffer: 16 * 1024 * 1024 }).catch(error => {
    if (error.code !== 124) throw error;
    return { stdout: error.stdout, stderr: error.stderr };
  });`);
profiler = change(profiler, 'const result = JSON.parse(stdout);',
  `const outcome = JSON.parse(stdout);
const profileWindow = JSON.parse(await readFile(profilePath + '.window.json', 'utf8'));
const reservation = JSON.parse(await readFile(${JSON.stringify(resolve(here, 'reservation.json'))}, 'utf8'));
const result = { domain: outcome.config.domain, config: outcome.config,
  result: outcome.result ?? { status: outcome.status }, searchMs: profileWindow.elapsedMs, cpuMs: profileWindow.cpuMs };`);
profiler = change(profiler, "await writeFile(join(output, 'result.json'), JSON.stringify(result) + '\\n');",
  "await writeFile(join(output, 'result.json'), JSON.stringify({ ...outcome, profileWindow, reservation }, null, 2) + '\\n');");
const comparisonStart = profiler.indexOf("assert.deepEqual(result.domain, baseline.domain, 'domain drift');");
const comparisonEnd = profiler.indexOf('for (const [path, bytes] of captured)');
assert.ok(comparisonStart > 0 && comparisonEnd > comparisonStart);
profiler = profiler.slice(0, comparisonStart) + 'const probeScanComparison = null;\n' + profiler.slice(comparisonEnd);
profiler = profiler.replace('searchAndProofCountersMatchBaseline: true, probeScanComparison, baseline: resolve(baselineArg),',
  'searchAndProofCountersMatchBaseline: null, probeScanComparison, baseline: null, outcome: result.result, profileWindow, reservation,');
profiler = change(profiler,
  'Search ${result.searchMs.toFixed(2)} ms; process CPU ${result.cpuMs.toFixed(2)} ms. Search/proof counters match baseline. Maximum bucket scan (execution telemetry): ${probeScanComparison.baseline} → ${probeScanComparison.candidate}.',
  'Outcome: ${result.result.status}. Captured profiling window ${result.searchMs.toFixed(2)} ms; process CPU within that window ${result.cpuMs.toFixed(2)} ms. The final interval before the hard kill is not profiled. No depth-21 completion or comparison-baseline claim. Process CPU includes the separate reporting worker.');
profiler = profiler.replace('exactCountersMatchBaseline: true,', 'exactCountersMatchBaseline: null, outcome: result.result, profileWindow,');
await writeFile(resolve(here, 'profile.mjs'), profiler);
const child = spawn(process.execPath, [resolve(here, 'profile.mjs'), output, '-', '--columns', '7', '--rows', '6', '--depth', '21', '--timeout-ms', '60000'],
  { stdio: 'inherit', windowsHide: true });
const [code] = await once(child, 'close');
process.exitCode = code ?? 1;
