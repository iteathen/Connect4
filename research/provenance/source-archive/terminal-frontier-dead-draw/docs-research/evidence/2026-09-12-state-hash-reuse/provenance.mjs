import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
const baseline = 'C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/frontier-audit-results/bound-hash-baseline-20260912';
const prefix = 'research/semantic-quotient/state-identity-unification/src';
const output = 'docs/research/evidence/2026-09-12-state-hash-reuse';
const files = ['quotient-local-semantic-descriptor.mjs', 'quotient-storage-contract.test.mjs',
  'quotient-search-worker-executor.mjs', 'quotient-semantic-tt-replacement-campaign.mjs', 'quotient-proof-lifecycle-control.mjs'];
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
  disposition: 'Retain baseline and exact patch as provenance until integration. Rejected bound-writer candidate is recorded separately.', files: manifest }, null, 2) + '\n');
const baselineResult = JSON.parse(await readFile(join(output, '1-baseline.json')));
const candidateResult = JSON.parse(await readFile(join(output, '2-candidate.json')));
const before = baselineResult.search.descriptorCache, after = candidateResult.search.descriptorCache;
await writeFile(join(output, 'hash-reuse.json'), JSON.stringify({
  priorHashComputations: before.transientStateDescriptorUses,
  hashComputations: after.stateHashBuilds, hashReuses: after.stateHashReuses,
  avoidedPercent: after.stateHashReuses / after.transientStateDescriptorUses * 100,
  descriptorBytesBefore: before.retainedTypedBytes, descriptorBytesAfter: after.retainedTypedBytes,
  additionalBytes: after.retainedTypedBytes - before.retainedTypedBytes,
  metadataCapacity: after.stateHashCapacity,
  comparatorExceptions: ['new state-hash telemetry', 'descriptor retainedTypedBytes', 'existing maxBucketScan exception (unchanged in these runs)'],
  exactness: 'Every other search/proof/class/descriptor-use counter matches. Full profile comparison against candidate also includes new hash counters.',
}, null, 2) + '\n');
console.log(JSON.stringify({ changedSourceFiles: manifest.length, patchBytes: Buffer.byteLength(patch) }));
