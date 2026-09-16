import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const output = dirname(fileURLToPath(import.meta.url));
const root = resolve(output, '../../../..');
const src = resolve(root, 'research/semantic-quotient/state-identity-unification/src');
const control = resolve(output, 'recompute-control');
await mkdir(control);
const hashes = [];
async function load(name) {
  const bytes = await readFile(resolve(src, name));
  hashes.push({ file: name, sha256: createHash('sha256').update(bytes).digest('hex') });
  return bytes.toString().replaceAll('\r\n', '\n').replace(/(['"])(\.\/[^'"]+\.mjs)\1/g,
    (_, quote, name) => JSON.stringify(pathToFileURL(resolve(src, name)).href));
}
let pool = await load('quotient-slot64-residual-pool-v2.mjs');
pool += '\nexport const recomputeDiagnostic = { classesChecked: 0, fullTupleTerms: 0, changedSlotContributions: 0 };\n';
const seam = '    hash >>>= 0;';
assert.equal(pool.split(seam).length, 3);
pool = pool.replaceAll(seam, `${seam}
    let recomputedHash = 0;
    for (let s = 0; s < CHUNKS_PER_CLASS; s++) {
      recomputedHash ^= mix32(chunkIds[s] ^ Math.imul(s + 1, 0x9e3779b1));
    }
    if (hash !== (recomputedHash >>> 0)) throw Error('changed-slot fingerprint differs from full tuple recomputation');
    recomputeDiagnostic.classesChecked++;
    recomputeDiagnostic.fullTupleTerms += CHUNKS_PER_CLASS;`);
pool = pool.replace('      hash ^= mix32(chunkIds[slot] ^ salt);',
  '      recomputeDiagnostic.changedSlotContributions += parentChunk >= 0 ? 2 : 1;\n      hash ^= mix32(chunkIds[slot] ^ salt);');
pool = pool.replace('      hash ^= mix32(parentChunk ^ salt) ^ mix32(chunkIds[slotIndex] ^ salt);',
  '      recomputeDiagnostic.changedSlotContributions += 2;\n      hash ^= mix32(parentChunk ^ salt) ^ mix32(chunkIds[slotIndex] ^ salt);');
await writeFile(resolve(control, 'pool.mjs'), pool);
let kernel = await load('quotient-native-negamax-slot64-residual-kernel.mjs');
kernel = kernel.replace(JSON.stringify(pathToFileURL(resolve(src, 'quotient-slot64-residual-pool-v2.mjs')).href),
  JSON.stringify(pathToFileURL(resolve(control, 'pool.mjs')).href));
await writeFile(resolve(control, 'kernel.mjs'), kernel);
let bounded = await load('quotient-bounded-search.mjs');
bounded = bounded.replace(JSON.stringify(pathToFileURL(resolve(src, 'quotient-native-negamax-slot64-residual-kernel.mjs')).href),
  JSON.stringify(pathToFileURL(resolve(control, 'kernel.mjs')).href));
bounded = bounded.replace('  // Profile serialization and reporting happen after the measured search.',
  `  const { recomputeDiagnostic } = await import('./pool.mjs');
  await writeFile(new URL('./checks.json', import.meta.url), JSON.stringify(recomputeDiagnostic, null, 2));
  // Profile serialization and reporting happen after the measured search.`);
await writeFile(resolve(control, 'bounded.mjs'), bounded);
const { stdout, stderr } = await promisify(execFile)(process.execPath,
  [resolve(control, 'bounded.mjs'), '--columns', '7', '--rows', '6', '--depth', '8', '--timeout-ms', '60000'],
  { windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
await writeFile(resolve(control, 'result.json'), stdout);
await writeFile(resolve(control, 'run.log'), stderr);
const result = JSON.parse(stdout), baseline = JSON.parse(await readFile(resolve(output, '2-candidate.json'), 'utf8'));
for (const key of ['result', 'search', 'operations', 'memory', 'storageDuringSearch']) assert.deepEqual(result[key], baseline[key]);
for (const record of hashes) assert.equal(createHash('sha256').update(await readFile(resolve(src, record.file))).digest('hex'), record.sha256);
await writeFile(resolve(control, 'manifest.json'), JSON.stringify({ sources: hashes, productionSourceUnchanged: true,
  countersAndMemoryMatch: true, limitation: 'Instrumented correctness/control counts only; not performance evidence.' }, null, 2));
console.log(await readFile(resolve(control, 'checks.json'), 'utf8'));
