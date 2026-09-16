import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
const here = new URL('./', import.meta.url), repo = new URL('../../../../', here);
const sources = { packed: repo,
  wide: new URL('../frontier-audit-results/native-key-wide-control-20260912/', repo),
  baseline: new URL('../frontier-audit-results/native-key-integration-baseline-20260912/', repo) };
const output = new URL('storage-ablation/', here); await mkdir(output);
const start = performance.now(), runs = []; let reference;
for (const stage of ['baseline', 'wide', 'packed', 'packed', 'wide', 'baseline']) {
  const remaining = Math.floor(60000 - (performance.now() - start));
  assert.ok(remaining > 0, 'total 60-second budget exhausted');
  const { stdout } = await promisify(execFile)(process.execPath, [fileURLToPath(new URL(
    'research/semantic-quotient/state-identity-unification/src/quotient-bounded-search.mjs', sources[stage])),
    '--depth', '8', '--timeout-ms', String(remaining)], { windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
  const result = JSON.parse(stdout);
  await writeFile(new URL(`${runs.length}-${stage}.json`, output), JSON.stringify(result, null, 2));
  reference ??= result;
  assert.deepEqual(result.result, reference.result); assert.deepEqual(result.search, reference.search);
  assert.deepEqual(result.operations, reference.operations);
  runs.push({ stage, searchMs: result.searchMs, cpuMs: result.cpuMs, stateBytes: result.memory.state.stateArrayBytes });
}
const means = Object.fromEntries(Object.keys(sources).map(stage => {
  const subset = runs.filter(r => r.stage === stage);
  return [stage, { searchMs: subset.reduce((n, r) => n + r.searchMs, 0) / subset.length,
    cpuMs: subset.reduce((n, r) => n + r.cpuMs, 0) / subset.length }];
}));
const result = { runs, means, exactCountersMatch: true, elapsedMs: performance.now() - start };
await writeFile(new URL('comparison.json', output), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
