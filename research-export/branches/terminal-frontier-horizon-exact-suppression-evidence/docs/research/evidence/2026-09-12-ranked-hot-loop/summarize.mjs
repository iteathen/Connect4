import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { basename, join } from 'node:path';
const output = 'docs/research/evidence/2026-09-12-ranked-hot-loop';
const before = JSON.parse(await readFile('docs/research/evidence/2026-09-12-direct-residual-line-cpu/line-cpu.json', 'utf8'));
const after = JSON.parse(await readFile('docs/research/evidence/2026-09-12-singleton-filter-line-cpu/line-cpu.json', 'utf8'));
const sum = (profile, name, file) => profile.methods.filter(row => row.function === name && row.url.endsWith(file)).reduce((total, row) => total + row.estimatedSelfCpuMs, 0);
const methods = [
  ['intern', 'quotient-slot64-residual-pool-v2.mjs'],
  ['equals', 'quotient-slot64-residual-pool-v2.mjs'],
  ['assertWordSource', 'quotient-slot64-residual-pool-v2.mjs'],
  ['stableDescriptorHandle', 'quotient-semantic-shared-tt.mjs'],
  ['probe', 'quotient-semantic-shared-tt.mjs'],
  ['tacticalCode', 'quotient-native-negamax-support-layout-kernel.mjs'],
].map(([name, file]) => ({ name, file, beforeEstimatedSelfCpuMs: sum(before, name, file), afterEstimatedSelfCpuMs: sum(after, name, file) }));
const terminal = JSON.parse(await readFile(join(output, 'terminal-boundary.log'), 'utf8'));
const terminalStates = terminal.results.reduce((sum, row) => sum + row.states, 0);
const baseline = 'C:/Users/josho/OneDrive/Documents/ChatGPT/GENERAL OPERATIONS/frontier-audit-results/hot-loop-baseline-20260912';
const prefix = 'research/semantic-quotient/state-identity-unification/src';
const files = ['quotient-slot64-residual-pool-v2.mjs', 'quotient-semantic-shared-tt.mjs', 'quotient-native-negamax-support-layout-kernel.mjs', 'quotient-storage-contract.test.mjs', 'quotient-semantic-arena-contract.test.mjs', 'quotient-bounded-line-profile.mjs'];
const manifest = [];
let patch = '';
for (const file of files) {
  const path = join(prefix, file), original = join(baseline, path);
  const sha = bytes => createHash('sha256').update(bytes).digest('hex');
  manifest.push({ file: path, beforeSha256: sha(await readFile(original)), afterSha256: sha(await readFile(path)) });
  try { patch += (await promisify(execFile)('git', ['diff', '--no-index', '--', original, path])).stdout; }
  catch (error) { if (error.code !== 1) throw error; patch += error.stdout; }
}
await writeFile(join(output, 'unit.patch'), patch);
await writeFile(join(output, 'source-manifest.json'), JSON.stringify({ baseline, files: manifest }, null, 2) + '\n');
await writeFile(join(output, 'profile-comparison.json'), JSON.stringify({ methods, terminalStates,
  caveat: 'Self estimates shift across function boundaries when code is inlined/moved; compare complete operation and total CPU, not disappearance of a function alone.' }, null, 2) + '\n');
console.log(JSON.stringify({ methods, terminalStates }));
