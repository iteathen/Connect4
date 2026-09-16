import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { relative, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const [profilePath, resultPath, baselinePath, outputPrefix] = process.argv.slice(2);
assert.ok(outputPrefix, 'profile, result, baseline and output-prefix paths required');
const profile = JSON.parse(await readFile(profilePath, 'utf8'));
const result = JSON.parse(await readFile(resultPath, 'utf8'));
const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
assert.deepEqual(result.result, baseline.result, 'bounded result drift');
assert.deepEqual(result.search, baseline.search, 'search/proof/descriptor counters drift');
assert.deepEqual(result.domain, baseline.domain, 'domain drift');
const byId = new Map(profile.nodes.map(node => [node.id, node]));
const parents = new Map(), rows = new Map();
const key = node => JSON.stringify([node.callFrame.url, node.callFrame.lineNumber, node.callFrame.columnNumber, node.callFrame.functionName]);
for (const node of profile.nodes) {
  for (const child of node.children ?? []) parents.set(child, node.id);
  const frame = node.callFrame, url = frame.url;
  const file = url.startsWith('file:') ? relative(process.cwd(), fileURLToPath(url)).replaceAll('\\', '/') : url || '(V8 runtime)';
  if (!rows.has(key(node))) rows.set(key(node), { name: frame.functionName || '(anonymous)', file,
    absolutePath: url.startsWith('file:') ? fileURLToPath(url).replaceAll('\\', '/') : null,
    line: frame.lineNumber + 1, selfSamples: 0, inclusiveSamples: 0, selfUs: 0, inclusiveUs: 0, lineTicks: {} });
  const row = rows.get(key(node));
  for (const location of node.positionTicks ?? []) {
    row.lineTicks[location.line] = (row.lineTicks[location.line] ?? 0) + location.ticks;
  }
}
assert.equal(profile.samples.length, profile.timeDeltas.length);
let totalUs = 0;
for (let index = 0; index < profile.samples.length; index++) {
  const id = profile.samples[index], us = profile.timeDeltas[index];
  assert.ok(Number.isFinite(us) && us >= 0);
  totalUs += us;
  const leaf = rows.get(key(byId.get(id)));
  leaf.selfSamples++; leaf.selfUs += us;
  const seen = new Set();
  for (let parent = id; parent !== undefined; parent = parents.get(parent)) {
    const identity = key(byId.get(parent));
    if (seen.has(identity)) continue;
    seen.add(identity);
    const row = rows.get(identity);
    row.inclusiveSamples++; row.inclusiveUs += us;
  }
}
const methods = [...rows.values()].map(row => ({ ...row, selfMs: row.selfUs / 1000,
  inclusiveMs: row.inclusiveUs / 1000, selfPercent: row.selfUs * 100 / totalUs,
  inclusivePercent: row.inclusiveUs * 100 / totalUs })).sort((a, b) => b.selfUs - a.selfUs);
const report = { kind: 'bounded-negamax-sampled-operation-time', node: result.node,
  domain: result.domain, config: result.config, result: result.result,
  baselineSearchMs: baseline.searchMs, profiledSearchMs: result.searchMs, cpuMs: result.cpuMs,
  requestedSamplingIntervalUs: 1000, samples: profile.samples.length, sampledMs: totalUs / 1000,
  exactCountersMatchBaseline: true,
  interpretation: 'Estimated aggregate stack time from Inspector sample time deltas, not instrumented per-call timings. Self excludes callees; inclusive includes callees and overlaps. Unsampled methods are not proved free. JIT inlining, sampling, GC and profiler overhead affect attribution. Setup and serialization excluded from search timing; profiler boundary frames remain separately visible.',
  search: result.search, methods };
await writeFile(outputPrefix + '.json', JSON.stringify(report, null, 2) + '\n');
const escaped = value => String(value).replaceAll('|', '\\|');
const sourceLink = (row, line = row.line) => row.absolutePath && line > 0
  ? `[${escaped(basename(row.file))}:${line}](<${row.absolutePath}:${line}>)` : escaped(row.file);
let md = '# Depth-8 Negamax operation profile\n\nResearch direction / architecture: Josh Oshiro  \nImplementation / qualification: OpenAI ChatGPT\n\n';
md += `Empty ${result.domain.columns}-column by ${result.domain.rows}-row connect-${result.domain.connect} board, maximum depth ${result.config.depth}, timeout ${result.config.timeoutMs} ms. One cold profiled run.\n\n`;
md += `Search: ${result.searchMs.toFixed(2)} ms; process CPU: ${result.cpuMs.toFixed(2)} ms; ${profile.samples.length} samples at a requested 1 ms interval. Prior unprofiled run: ${baseline.searchMs.toFixed(2)} ms. Every search/proof/descriptor counter and bounded result matches.\n\n${report.interpretation}\n\n`;
md += 'Source links identify function definitions. For sampled locations inside each function, see [line mapping](operations-lines.md). Raw V8 position ticks identify sampled source locations; they are not exact instruction timings or per-call durations. Call-site locations can represent invoked or inlined work.\n\n';
md += '| Operation | Source | Self estimate (ms) | Inclusive estimate (ms) | Self % | Samples |\n|---|---|---:|---:|---:|---:|\n';
for (const row of methods) md += `| ${escaped(row.name)} | ${sourceLink(row)} | ${row.selfMs.toFixed(1)} | ${row.inclusiveMs.toFixed(1)} | ${row.selfPercent.toFixed(2)} | ${row.selfSamples} |\n`;
await writeFile(outputPrefix + '.md', md);
const sources = new Map();
let linesMd = '# Sampled source locations inside each operation\n\nResearch direction / architecture: Josh Oshiro\n\nImplementation / qualification: OpenAI ChatGPT\n\n';
linesMd += 'Derived from the existing depth-8 profile; no test rerun. Function self/inclusive times are sample-based aggregate estimates. Line counts are raw V8 position ticks, aggregated across appearances of the same function. They have no per-line timestamps, so no per-line milliseconds are invented. Optimization/inlining and call-site mapping can affect attribution. Links and excerpts refer to the profiled working-tree source.\n\n';
const locations = [];
for (const row of methods) {
  const entries = Object.entries(row.lineTicks).sort((a,b) => b[1]-a[1]);
  if (!row.absolutePath || !entries.length) continue;
  if (!sources.has(row.absolutePath)) sources.set(row.absolutePath, (await readFile(resolve(row.absolutePath), 'utf8')).split(/\r?\n/));
  const source = sources.get(row.absolutePath);
  linesMd += `## ${escaped(row.name)} — ${sourceLink(row)}\n\nSelf estimate: ${row.selfMs.toFixed(1)} ms; including callees: ${row.inclusiveMs.toFixed(1)} ms.\n\n| Source location | Position ticks | Code |\n|---|---:|---|\n`;
  for (const [lineText, ticks] of entries) {
    const line = Number(lineText);
    assert.ok(line >= 1 && line <= source.length, `invalid source location ${row.file}:${line}`);
    const code = source[line-1].trim();
    linesMd += `| ${sourceLink(row, line)} | ${ticks} | ${escaped(code).replaceAll('`', '\\`')} |\n`;
    locations.push({ function: row.name, file: row.file, functionLine: row.line, line, ticks, code });
  }
  linesMd += '\n';
}
await writeFile(outputPrefix + '-lines.md', linesMd);
await writeFile(outputPrefix + '-lines.json', JSON.stringify(locations, null, 2) + '\n');
console.log(JSON.stringify({ profiledSearchMs: report.profiledSearchMs, baselineSearchMs: report.baselineSearchMs,
  samples: report.samples, sampledMs: report.sampledMs, countersMatch: true,
  topSelf: methods.slice(0, 20) }, null, 2));
