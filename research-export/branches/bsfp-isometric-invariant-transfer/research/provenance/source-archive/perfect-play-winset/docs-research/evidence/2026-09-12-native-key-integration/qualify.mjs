import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
const here = new URL('./', import.meta.url), src = new URL('../../../../research/semantic-quotient/state-identity-unification/src/', here);
const output = new URL('qualified/', here); await mkdir(output);
const hash = b => createHash('sha256').update(b).digest('hex'), hashes = {};
for (const name of await readdir(src)) if (name.endsWith('.mjs')) hashes[name] = hash(await readFile(new URL(name, src)));
const tests = ['packed-state-pool', 'storage-contract', 'decision-contract', 'semantic-arena-contract',
  'proof-store-contract', 'worker-contract', 'paired-response-contract', 'control-parity-derivation'];
const campaigns = ['slot64-residual', 'semantic-tt-replacement', 'online-dependency-parallel', 'explore-hint', 'terminal-boundary', 'pruning'];
const jobs = [{ name: 'controls', args: ['--test', ...tests.map(n => fileURLToPath(new URL(`quotient-${n}.test.mjs`, src)))] },
  ...campaigns.map(name => ({ name, args: ['--expose-gc', '--max-old-space-size=6144', fileURLToPath(new URL(`quotient-${name}-campaign.mjs`, src))] })),
  { name: 'providers', args: [fileURLToPath(new URL('quotient-residual-provider-control.mjs', src))] }];
const start = performance.now(), results = [];
for (const job of jobs) {
  const timeout = Math.floor(60000 - (performance.now() - start)); assert.ok(timeout > 0);
  const began = performance.now();
  const { stdout, stderr } = await promisify(execFile)(process.execPath, job.args,
    { windowsHide: true, timeout, maxBuffer: 32 * 1024 * 1024 });
  await writeFile(new URL(`${job.name}.log`, output), stdout + stderr);
  results.push({ name: job.name, elapsedMs: performance.now() - began, passed: true });
  console.log(`${job.name}: passed`);
}
for (const [name, expected] of Object.entries(hashes)) assert.equal(hash(await readFile(new URL(name, src))), expected, `source drift: ${name}`);
await writeFile(new URL('source-hashes.json', output), JSON.stringify(hashes, null, 2));
await writeFile(new URL('results.json', output), JSON.stringify({ results, elapsedMs: performance.now() - start, totalBudgetMs: 60000, allChildrenExited: true }, null, 2));
