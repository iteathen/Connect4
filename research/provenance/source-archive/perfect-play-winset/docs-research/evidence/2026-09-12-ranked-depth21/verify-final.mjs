import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url)), repo = resolve(here, '../../../..');
const baseline = resolve(repo, '../frontier-audit-results/ranked-depth21-baseline-20260912');
const reference = JSON.parse(await readFile(resolve(here, 'depth8-0-baseline.json')));
const runs = [];
for (const stage of ['baseline', 'final', 'final', 'baseline']) {
  const source = stage === 'baseline' ? baseline : repo;
  const { stdout } = await promisify(execFile)(process.execPath, [resolve(source,
    'research/semantic-quotient/state-identity-unification/src/quotient-bounded-search.mjs'),
    '--columns', '7', '--rows', '6', '--depth', '8', '--timeout-ms', '60000'], { windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
  const result = JSON.parse(stdout);
  await writeFile(resolve(here, `verified-depth8-${runs.length}-${stage}.json`), JSON.stringify(result, null, 2));
  assert.deepEqual(result.result, reference.result);
  assert.deepEqual(result.search, reference.search);
  assert.deepEqual(result.operations, reference.operations);
  runs.push({ stage, searchMs: result.searchMs, cpuMs: result.cpuMs });
}
const means = Object.fromEntries(['baseline', 'final'].map(stage => {
  const pair = runs.filter(run => run.stage === stage);
  return [stage, { searchMs: pair.reduce((sum, run) => sum + run.searchMs, 0) / pair.length,
    cpuMs: pair.reduce((sum, run) => sum + run.cpuMs, 0) / pair.length }];
}));
await writeFile(resolve(here, 'verified-depth8-comparison.json'), JSON.stringify({ runs, means, exactCountersMatch: true }, null, 2));
console.log(JSON.stringify({ runs, means, exactCountersMatch: true }));
