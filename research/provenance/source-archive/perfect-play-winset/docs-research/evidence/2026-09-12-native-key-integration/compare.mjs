import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
const here = new URL('./', import.meta.url), repo = new URL('../../../../', here);
const baseline = new URL('../frontier-audit-results/native-key-integration-baseline-20260912/', repo);
const label = process.argv[2];
if (!/^[a-z0-9-]+$/.test(label ?? '')) throw Error('provide a fresh evidence label');
const output = new URL(`${label}/`, here); await mkdir(output);
const start = performance.now(), runs = [];
let reference;
for (const stage of ['baseline', 'candidate', 'candidate', 'baseline']) {
  const source = stage === 'baseline' ? baseline : repo;
  const remaining = Math.floor(60000 - (performance.now() - start));
  if (remaining < 1) throw Error('60-second total comparison budget exhausted');
  const { stdout } = await promisify(execFile)(process.execPath, [fileURLToPath(new URL(
    'research/semantic-quotient/state-identity-unification/src/quotient-bounded-search.mjs', source)),
    '--columns', '7', '--rows', '6', '--depth', '8', '--timeout-ms', String(remaining)],
    { windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
  const result = JSON.parse(stdout);
  await writeFile(new URL(`${runs.length}-${stage}.json`, output), JSON.stringify(result, null, 2));
  reference ??= result;
  assert.deepEqual(result.result, reference.result); assert.deepEqual(result.search, reference.search);
  assert.deepEqual(result.operations, reference.operations);
  runs.push({ stage, searchMs: result.searchMs, cpuMs: result.cpuMs,
    stateBytes: result.memory.state.stateArrayBytes, kernelBytes: result.memory.totalTypedBytes });
}
const means = Object.fromEntries(['baseline', 'candidate'].map(stage => {
  const subset = runs.filter(r => r.stage === stage);
  return [stage, { searchMs: subset.reduce((n, r) => n + r.searchMs, 0) / subset.length,
    cpuMs: subset.reduce((n, r) => n + r.cpuMs, 0) / subset.length }];
}));
const result = { label, runs, means, exactCountersMatch: true, elapsedMs: performance.now() - start, totalBudgetMs: 60000 };
await writeFile(new URL('comparison.json', output), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
