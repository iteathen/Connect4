import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const evidence = dirname(fileURLToPath(import.meta.url));
const root = resolve(evidence, '../../../..');
const src = resolve(root, 'research/semantic-quotient/state-identity-unification/src');
const runner = resolve(src, 'quotient-bounded-search.mjs');
const records = new Map();
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
async function capture(path) {
  if (records.has(path)) return;
  const bytes = await readFile(path);
  const name = relative(root, path).replaceAll('\\', '/');
  assert.ok(!name.startsWith('..'));
  records.set(path, { file: name, sha256: sha(bytes) });
  const snapshot = resolve(evidence, 'sources', name);
  await mkdir(dirname(snapshot), { recursive: true }); await writeFile(snapshot, bytes);
  const text = bytes.toString();
  for (const match of text.matchAll(/(?:from\s*|import\s*\(\s*|import\s*)['"](\.[^'"]+\.mjs)['"]/g)) {
    await capture(resolve(dirname(path), match[1]));
  }
}
await capture(runner);
let source = (await readFile(runner, 'utf8')).replaceAll('\r\n', '\n');
for (const file of ['quotient-native-negamax-slot64-residual-kernel.mjs', 'quotient-semantic-shared-tt.mjs', 'quotient-online-semantic-search-lib.mjs']) {
  source = source.replace(`import('./${file}')`, `import(${JSON.stringify(pathToFileURL(resolve(src, file)).href)})`);
}
const seam = '  // Profile serialization and reporting happen after the measured search.';
assert.equal(source.split(seam).length, 2);
source = source.replace(seam, `  const { inspectRelationalAddresses } = await import('./inspect.mjs');
  await writeFile(new URL('./addresses.json', import.meta.url), JSON.stringify(inspectRelationalAddresses(kernel), null, 2) + '\\n');
${seam}`);
await writeFile(resolve(evidence, 'bounded-diagnostic.mjs'), source);
const child = spawn(process.execPath, [resolve(evidence, 'bounded-diagnostic.mjs'), '--columns', '7', '--rows', '6', '--depth', '8', '--timeout-ms', '60000'],
  { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
let stdout = '', stderr = '';
child.stdout.on('data', bytes => { stdout += bytes; }); child.stderr.on('data', bytes => { stderr += bytes; });
const [code, signal] = await once(child, 'close');
await writeFile(resolve(evidence, 'run.log'), stderr);
assert.equal(code, 0, `bounded diagnostic failed: ${code}/${signal}: ${stderr}`);
const result = JSON.parse(stdout);
await writeFile(resolve(evidence, 'result.json'), JSON.stringify(result, null, 2) + '\n');
const baseline = JSON.parse(await readFile(resolve(evidence, '../2026-09-12-compact-chunk-line-cpu/result.json'), 'utf8'));
for (const key of ['result', 'search', 'memory', 'storageDuringSearch', 'operations']) assert.deepEqual(result[key], baseline[key], key);
for (const [path, record] of records) assert.equal(sha(await readFile(path)), record.sha256, `source changed: ${record.file}`);
await writeFile(resolve(evidence, 'source-manifest.json'), JSON.stringify({ kind: 'read-only post-search diagnostic',
  sourceFiles: [...records.values()], exactCountersAndMemoryMatchBaseline: true, productionSourceUnchanged: true,
  bound: result.config, searchMs: result.searchMs, cpuMs: result.cpuMs,
  diagnosticOutsideMeasuredSearch: true, childExited: true }, null, 2) + '\n');
console.log(JSON.stringify({ sourceFiles: records.size, searchMs: result.searchMs, cpuMs: result.cpuMs,
  exactCountersAndMemoryMatchBaseline: true, productionSourceUnchanged: true, childExited: true }));
