import assert from 'node:assert/strict';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../../..');
const relative = 'research/semantic-quotient/state-identity-unification/src';
const external = resolve(repo, '../frontier-audit-results');
const baseline = resolve(external, 'ranked-depth21-baseline-20260912');
const roots = { baseline, final: repo };
for (const stage of ['tt', 'singleton']) {
  const root = resolve(external, `ranked-depth21-${stage}-20260912`);
  await mkdir(root);
  const source = stage === 'tt' ? baseline : repo;
  await cp(resolve(source, relative), resolve(root, relative), { recursive: true });
  await cp(resolve(source, 'components'), resolve(root, 'components'), { recursive: true });
  const filename = stage === 'tt' ? 'quotient-semantic-shared-tt.mjs' : 'quotient-slot64-residual-pool-v2.mjs';
  const replacement = stage === 'tt' ? resolve(repo, relative, filename)
    : resolve(here, 'singleton-scalars/profile/sources', filename);
  await cp(replacement, resolve(root, relative, filename));
  roots[stage] = root;
}
const runs = [];
let reference;
// Forward then reverse sequence limits order/warm-host bias. Each solver uses
// a fresh process, the same domain/depth/reservation and its own hard timeout.
for (const stage of ['baseline', 'tt', 'singleton', 'final', 'final', 'singleton', 'tt', 'baseline']) {
  const { stdout, stderr } = await promisify(execFile)(process.execPath,
    [resolve(roots[stage], relative, 'quotient-bounded-search.mjs'), '--columns', '7', '--rows', '6', '--depth', '8', '--timeout-ms', '60000'],
    { windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
  const result = JSON.parse(stdout);
  await writeFile(resolve(here, `depth8-${runs.length}-${stage}.json`), JSON.stringify(result, null, 2));
  if (stderr) await writeFile(resolve(here, `depth8-${runs.length}-${stage}.stderr`), stderr);
  reference ??= result;
  assert.deepEqual(result.domain, reference.domain);
  assert.deepEqual(result.result, reference.result);
  assert.deepEqual(result.search, reference.search, 'search/proof/identity counter drift');
  assert.deepEqual(result.operations, reference.operations, 'operation counter drift');
  runs.push({ stage, searchMs: result.searchMs, cpuMs: result.cpuMs });
  console.log(JSON.stringify(runs.at(-1)));
}
const means = Object.fromEntries(Object.keys(roots).map(stage => {
  const pair = runs.filter(run => run.stage === stage);
  return [stage, { searchMs: pair.reduce((a, b) => a + b.searchMs, 0) / pair.length,
    cpuMs: pair.reduce((a, b) => a + b.cpuMs, 0) / pair.length }];
}));
await writeFile(resolve(here, 'completed-depth8-comparison.json'), JSON.stringify({ runs, means,
  exactCountersMatch: true, counters: reference.search, result: reference.result }, null, 2));
console.log(JSON.stringify({ means, exactCountersMatch: true }));
