import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
const baseline = 'C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/frontier-audit-results/ranked-probe-baseline-20260912';
const prefix = 'research/semantic-quotient/state-identity-unification/src';
const output = 'docs/research/evidence/2026-09-12-ranked-probe-refinement';
const files = ['quotient-semantic-shared-tt.mjs', 'quotient-slot64-residual-pool-v2.mjs',
  'quotient-live-line-move-order.mjs', 'quotient-semantic-arena-contract.test.mjs',
  'quotient-storage-contract.test.mjs', 'quotient-decision-contract.test.mjs'];
let patch = '';
const manifest = [];
for (const file of files) {
  const path = join(prefix, file), original = join(baseline, path);
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  manifest.push({ file: path, beforeSha256: hash(await readFile(original)), afterSha256: hash(await readFile(path)) });
  try { patch += (await promisify(execFile)('git', ['diff', '--no-index', '--', original, path])).stdout; }
  catch (error) { if (error.code !== 1) throw error; patch += error.stdout; }
}
await writeFile(join(output, 'unit.patch'), patch);
await writeFile(join(output, 'source-manifest.json'), JSON.stringify({ baseline,
  disposition: 'Retain isolated pre-unit baseline and exact source patch as benchmark provenance until integration.', files: manifest }, null, 2) + '\n');
console.log(JSON.stringify({ changedSourceFiles: manifest.length, patchBytes: Buffer.byteLength(patch) }));
