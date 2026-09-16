import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const output = dirname(fileURLToPath(import.meta.url)), root = resolve(output, '../../../..');
const prefix = 'research/semantic-quotient/state-identity-unification/src';
const names = ['quotient-bounded-storage-plan.mjs', 'quotient-bounded-search.mjs',
  'quotient-native-negamax-slot64-residual-kernel.mjs', 'quotient-native-negamax-support-layout-kernel.mjs',
  'quotient-slot64-residual-pool-v2.mjs', 'quotient-local-semantic-descriptor.mjs',
  'quotient-semantic-shared-tt.mjs', 'quotient-storage-contract.test.mjs'];
const manifest = [];
for (const file of [...names.map(name => `${prefix}/${name}`), '.github/workflows/semantic-quotient-slot64-residual.yml']) {
  const bytes = await readFile(join(root, file));
  const saved = join(output, 'sources', file);
  await mkdir(dirname(saved), { recursive: true }); await writeFile(saved, bytes);
  manifest.push({ file, sha256: createHash('sha256').update(bytes).digest('hex') });
}
const { createSlot64ResidualQuotientKernel } = await import(pathToFileURL(join(root, prefix, 'quotient-native-negamax-slot64-residual-kernel.mjs')));
const { createBoundedStoragePlan } = await import(pathToFileURL(join(root, prefix, 'quotient-bounded-storage-plan.mjs')));
const { kernel } = createSlot64ResidualQuotientKernel({ columns: 7, rows: 6, connect: 4 }, { cacheEdges: true, prefixClasses: 4096 });
const measured = JSON.parse(await readFile(resolve(output, '../2026-09-12-depth21-budget-profile/reservation.json'), 'utf8'));
assert.deepEqual(createBoundedStoragePlan(kernel, 21, 2048 * 1048576), measured);
await writeFile(join(output, 'source-manifest.json'), JSON.stringify({ files: manifest,
  finalPlannerMatchesMeasuredReservation: true,
  note: 'Final coverage flag also requires the conservative class bound to fit. Final storage controls passed after this cold-only reporting correction; measured reservations are identical.' }, null, 2));
console.log('Final sources frozen; current plan exactly matches the measured reservation.');
