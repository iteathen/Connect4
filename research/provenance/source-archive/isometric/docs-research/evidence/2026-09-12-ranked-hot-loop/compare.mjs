import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const [baselineRoot, candidateRoot, outputDirectory] = process.argv.slice(2);
assert.ok(outputDirectory);
const output = resolve(outputDirectory), run = promisify(execFile);
const entry = 'research/semantic-quotient/state-identity-unification/src/quotient-bounded-search.mjs';
const args = ['--columns', '7', '--rows', '6', '--depth', '8', '--timeout-ms', '60000'];
const rows = [];
const normalizeSearch = search => {
  const { maxBucketScan, ...semanticTt } = search.semanticTt;
  return { ...search, semanticTt };
};
for (const variant of ['baseline', 'candidate', 'candidate', 'baseline']) {
  const root = resolve(variant === 'baseline' ? baselineRoot : candidateRoot);
  const { stdout, stderr } = await run(process.execPath, [join(root, entry), ...args],
    { windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
  const result = JSON.parse(stdout);
  await writeFile(join(output, `${rows.length + 1}-${variant}.json`), stdout);
  if (stderr) await writeFile(join(output, `${rows.length + 1}-${variant}.stderr.log`), stderr);
  if (rows.length) {
    assert.deepEqual(result.result, rows[0].result.result);
    assert.deepEqual(result.domain, rows[0].result.domain);
    assert.deepEqual(result.config, rows[0].result.config);
    assert.deepEqual(normalizeSearch(result.search), normalizeSearch(rows[0].result.search));
    assert.deepEqual(result.memory, rows[0].result.memory, 'retained geometry/storage changed');
  }
  rows.push({ variant, root, result });
  console.log(JSON.stringify({ run: rows.length, variant, searchMs: result.searchMs, cpuMs: result.cpuMs }));
}
const average = (variant, key) => rows.filter(row => row.variant === variant).reduce((sum, row) => sum + row.result[key], 0) / 2;
const baselineMs = average('baseline', 'searchMs'), candidateMs = average('candidate', 'searchMs');
const baselineCpuMs = average('baseline', 'cpuMs'), candidateCpuMs = average('candidate', 'cpuMs');
const summary = { order: rows.map(row => row.variant), coldProcessPerRun: true,
  bounds: { columns: 7, rows: 6, connect: 4, depth: 8, timeoutMs: 60000 },
  baselineMs, candidateMs, wallReductionPercent: (1 - candidateMs / baselineMs) * 100,
  baselineCpuMs, candidateCpuMs, cpuReductionPercent: (1 - candidateCpuMs / baselineCpuMs) * 100,
  searchAndProofCountersMatch: true, retainedMemoryMatches: true,
  maxBucketScan: rows.map(row => row.result.search.semanticTt.maxBucketScan),
  limitation: 'Two cold runs per variant, alternating order; bounded local evidence, not a full-root performance claim.',
  runs: rows.map(({ result, ...row }, index) => ({ ...row, evidence: `${index + 1}-${row.variant}.json`, searchMs: result.searchMs, cpuMs: result.cpuMs })) };
await writeFile(join(output, 'comparison.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary));
