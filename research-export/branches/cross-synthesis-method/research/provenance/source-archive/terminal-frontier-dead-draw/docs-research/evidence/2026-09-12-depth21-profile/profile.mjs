// Offline profiling owner: no instrumentation, serialization or file IO in search.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const [outputArg, baselineArg, ...bounds] = process.argv.slice(2);
assert.ok(outputArg && baselineArg,
  'usage: node quotient-bounded-line-profile.mjs NEW_OUTPUT_DIRECTORY BASELINE_JSON [bounded-search options]');
assert.ok(!bounds.some(arg => arg.startsWith('--cpu-profile')), 'profile output is owned by this runner');
const output = resolve(outputArg), sourceDir = "C:\\Users\\josho\\OneDrive\\Documents\\ChatGPT\\GENERAL OPERATIONS\\connect4-frontier-audit\\research\\semantic-quotient\\state-identity-unification\\src";
const baseline = null;
// Refuse to overwrite evidence. Capture inputs before execution, outside timing.
await mkdir(output);
const captured = new Map();
for (const file of await readdir(sourceDir)) {
  if (file.endsWith('.mjs')) captured.set(join(sourceDir, file), await readFile(join(sourceDir, file)));
}
const profilePath = join(output, 'search.cpuprofile');
const commandArgs = ["C:\\Users\\josho\\OneDrive\\Documents\\ChatGPT\\GENERAL OPERATIONS\\connect4-frontier-audit\\docs\\research\\evidence\\2026-09-12-depth21-profile\\bounded.mjs", ...bounds, '--cpu-profile', profilePath];
const { stdout, stderr } = await promisify(execFile)(process.execPath, commandArgs,
  { windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
await writeFile(join(output, 'run.log'), stdout + stderr);
const result = JSON.parse(stdout);
await writeFile(join(output, 'result.json'), JSON.stringify(result) + '\n');
const probeScanComparison = null;
for (const [path, bytes] of captured) assert.ok(bytes.equals(await readFile(path)), `source changed during run: ${path}`);
const profile = JSON.parse(await readFile(profilePath, 'utf8'));
assert.equal(profile.samples.length, profile.timeDeltas.length);
const totalHits = profile.nodes.reduce((sum, node) => sum + (node.hitCount ?? 0), 0);
assert.ok(totalHits > 0 && Number.isFinite(result.cpuMs) && result.cpuMs >= 0);
const cpuPerHit = result.cpuMs / totalHits;
const lines = new Map(), methods = new Map(), sources = new Map();
await mkdir(join(output, 'sources'));
const sourceInfo = async url => {
  if (!url.startsWith('file:')) return null;
  const path = fileURLToPath(url), bytes = captured.get(path);
  if (!bytes) return null; // Uncaptured/runtime code is explicitly unmapped.
  if (!sources.has(path)) {
    const saved = join(output, 'sources', basename(path));
    await writeFile(saved, bytes);
    sources.set(path, { original: path, snapshot: saved,
      sha256: createHash('sha256').update(bytes).digest('hex'), text: bytes.toString('utf8').split(/\r?\n/) });
  }
  return sources.get(path);
};
let attributedTicks = 0;
for (const node of profile.nodes) {
  const frame = node.callFrame, info = await sourceInfo(frame.url);
  const name = frame.functionName || '(anonymous)';
  const identity = JSON.stringify([frame.url, frame.lineNumber, frame.columnNumber, name]);
  if (!methods.has(identity)) methods.set(identity, { function: name, url: frame.url,
    line: frame.lineNumber + 1, snapshot: info?.snapshot ?? null, hits: 0 });
  methods.get(identity).hits += node.hitCount ?? 0;
  const positions = node.positionTicks ?? [];
  const ticks = positions.reduce((sum, entry) => sum + entry.ticks, 0);
  assert.ok(ticks <= (node.hitCount ?? 0), 'position ticks exceed node hits');
  if (!info) continue;
  for (const position of positions) {
    assert.ok(Number.isSafeInteger(position.line) && position.line > 0 && position.line <= info.text.length);
    assert.ok(Number.isSafeInteger(position.ticks) && position.ticks >= 0);
    const key = JSON.stringify([identity, position.line]);
    if (!lines.has(key)) lines.set(key, { function: name, file: info.original, snapshot: info.snapshot,
      line: position.line, ticks: 0, code: info.text[position.line - 1].trim() });
    lines.get(key).ticks += position.ticks;
    attributedTicks += position.ticks;
  }
}
const lineRows = [...lines.values()].map(row => ({ ...row, estimatedCpuMs: row.ticks * cpuPerHit }))
  .sort((a, b) => b.ticks - a.ticks);
const methodRows = [...methods.values()].map(row => ({ ...row, estimatedSelfCpuMs: row.hits * cpuPerHit }))
  .sort((a, b) => b.hits - a.hits);
assert.ok(attributedTicks <= totalHits);
const interpretation = 'CPU-ms estimates apportion measured process CPU by V8 aggregate hit counts: line ticks / total node hitCount * process CPU ms. This assumes samples represent CPU distribution; it is not a timestamp measurement per line or invocation. Process CPU can include runtime/background work. Runtime/unmapped samples remain unassigned. JIT inlining and call-site attribution affect source placement. Aggregate hit counts and timestamped sample-array lengths can differ at profiler boundaries. No fabricated per-line time deltas, and no timers inserted into the hot loop.';
const report = { kind: 'bounded-negamax-line-cpu-estimates', interpretation,
  protocol: 'https://chromedevtools.github.io/devtools-protocol/tot/Profiler/#type-PositionTickInfo',
  searchMs: result.searchMs, processCpuMs: result.cpuMs, totalHits,
  timestampedSamples: profile.samples.length, attributedTicks,
  unmappedCpuMsEstimate: (totalHits - attributedTicks) * cpuPerHit,
  searchAndProofCountersMatchBaseline: null, probeScanComparison, baseline: null, outcome: result.result,
  command: [process.execPath, ...commandArgs], config: result.config,
  sources: [...sources.values()].map(({ text, ...info }) => info), methods: methodRows, lines: lineRows };
await writeFile(join(output, 'line-cpu.json'), JSON.stringify(report, null, 2) + '\n');
const escape = value => String(value).replaceAll('|', '\\|').replaceAll('`', '\\`');
const link = row => `[${basename(row.snapshot)}:${row.line}](<${row.snapshot.replaceAll('\\', '/')}:${row.line}>)`;
let md = '# Bounded Negamax CPU mapped to source lines\n\nResearch direction / architecture: Josh Oshiro  \nImplementation / qualification: OpenAI ChatGPT\n\n';
md += `${result.domain.columns} columns × ${result.domain.rows} rows, connect ${result.domain.connect}, depth ${result.config.depth}, timeout ${result.config.timeoutMs} ms. Search ${result.searchMs.toFixed(2)} ms; process CPU ${result.cpuMs.toFixed(2)} ms. Outcome: ${result.result.status}. ${result.result.error?.message ?? ''} No comparison baseline was run for this depth.\n\n`;
md += `${interpretation}\n\n[Profiler line-sample contract](${report.protocol}). Saved source hashes are in [JSON](line-cpu.json); links point to frozen source snapshots. ${totalHits} aggregate hits; ${attributedTicks} mapped line ticks; ${report.unmappedCpuMsEstimate.toFixed(2)} estimated CPU ms remain unmapped.\n\n`;
md += '| Function | Frozen source line | Estimated CPU ms | Line samples | Code |\n|---|---|---:|---:|---|\n';
for (const row of lineRows) md += `| ${escape(row.function)} | ${link(row)} | ${row.estimatedCpuMs.toFixed(2)} | ${row.ticks} | ${escape(row.code)} |\n`;
md += '\n## Function totals\n\nSelf CPU estimates exclude callees. These totals and the line table overlap; do not add them together.\n\n| Function | Source | Estimated self CPU ms | Hits |\n|---|---|---:|---:|\n';
for (const row of methodRows) md += `| ${escape(row.function)} | ${row.snapshot ? link(row) : escape(row.url || '(runtime)')} | ${row.estimatedSelfCpuMs.toFixed(2)} | ${row.hits} |\n`;
await writeFile(join(output, 'line-cpu.md'), md);
console.log(JSON.stringify({ report: join(output, 'line-cpu.md'), searchMs: result.searchMs,
  cpuMs: result.cpuMs, totalHits, mappedLines: lineRows.length, exactCountersMatchBaseline: null, outcome: result.result,
  topLines: lineRows.slice(0, 8) }));
