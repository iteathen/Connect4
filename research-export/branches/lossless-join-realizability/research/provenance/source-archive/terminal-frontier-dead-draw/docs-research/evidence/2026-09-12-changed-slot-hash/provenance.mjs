import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const output = dirname(fileURLToPath(import.meta.url));
const root = resolve(output, '../../../..');
const baseline = resolve(root, '../frontier-audit-results/changed-slot-baseline-20260912');
const prefix = 'research/semantic-quotient/state-identity-unification/src';
const files = ['quotient-slot64-residual-pool-v2.mjs', 'quotient-storage-contract.test.mjs'];
let patch = '';
const manifest = [];
for (const file of files) {
  const relative = join(prefix, file), path = join(root, relative), original = join(baseline, relative);
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  manifest.push({ file: relative, beforeSha256: hash(await readFile(original)), afterSha256: hash(await readFile(path)) });
  try { patch += (await promisify(execFile)('git', ['diff', '--no-index', '--', original, path])).stdout; }
  catch (error) { if (error.code !== 1) throw error; patch += error.stdout; }
}
const runs = await Promise.all(['1-baseline', '2-candidate', '3-candidate', '4-baseline'].map(async file => JSON.parse(await readFile(join(output, `${file}.json`), 'utf8'))));
for (const run of runs.slice(1)) {
  for (const key of ['result', 'search', 'operations', 'memory', 'storageDuringSearch']) assert.deepEqual(run[key], runs[0][key], key);
}
await writeFile(join(output, 'unit.patch'), patch);
await writeFile(join(output, 'source-manifest.json'), JSON.stringify({ baseline,
  disposition: 'Retained changed-slot local class hashing; no extra storage; exact source patch against pre-unit working-tree snapshot.',
  allFourRunsExactCountersAndMemoryMatch: true, files: manifest }, null, 2) + '\n');
console.log('Source provenance saved; all four runs match exact counters and memory.');
