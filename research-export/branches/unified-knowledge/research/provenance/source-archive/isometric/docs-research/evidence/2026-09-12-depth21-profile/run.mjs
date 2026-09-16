import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../../../../research/semantic-quotient/state-identity-unification/src');
const output = resolve(here, '../2026-09-12-depth21-line-cpu');
let bounded = (await readFile(resolve(src, 'quotient-bounded-search.mjs'), 'utf8')).replaceAll('\r\n', '\n');
function change(source, before, after) {
  assert.equal(source.split(before).length, 2, `unique profiling seam: ${before}`);
  return source.replace(before, after);
}
bounded = bounded.replace(/(['"])(\.\/[^'"]+\.mjs)\1/g, (_, quote, name) => JSON.stringify(pathToFileURL(resolve(src, name)).href));
bounded = change(bounded, '  let result, searchMs, cpu, profile;', '  let result, searchMs, cpu, profile, failure = null;');
bounded = change(bounded, '    result = searcher.searchBounded(kernel.rootId, -2, 2, config.depth);',
  `    try { result = searcher.searchBounded(kernel.rootId, -2, 2, config.depth); }
    catch (error) { failure = error; }`);
bounded = change(bounded, '  assert.ok(result.maxReachedDepth <= config.depth);',
  `  if (failure) result = { status: 'failed', value: null, requestedDepth: config.depth,
    error: { name: failure.name, message: failure.message, stack: failure.stack } };
  else assert.ok(result.maxReachedDepth <= config.depth);`);
await writeFile(resolve(here, 'bounded.mjs'), bounded);

let profiler = (await readFile(resolve(src, 'quotient-bounded-line-profile.mjs'), 'utf8')).replaceAll('\r\n', '\n');
profiler = change(profiler, 'const output = resolve(outputArg), sourceDir = dirname(fileURLToPath(import.meta.url));',
  `const output = resolve(outputArg), sourceDir = ${JSON.stringify(src)};`);
profiler = change(profiler, "const baseline = JSON.parse(await readFile(resolve(baselineArg), 'utf8'));", 'const baseline = null;');
profiler = change(profiler, "const commandArgs = [join(sourceDir, 'quotient-bounded-search.mjs'), ...bounds, '--cpu-profile', profilePath];",
  `const commandArgs = [${JSON.stringify(resolve(here, 'bounded.mjs'))}, ...bounds, '--cpu-profile', profilePath];`);
const comparisonStart = profiler.indexOf("assert.deepEqual(result.domain, baseline.domain, 'domain drift');");
const comparisonEnd = profiler.indexOf('for (const [path, bytes] of captured)');
assert.ok(comparisonStart > 0 && comparisonEnd > comparisonStart);
profiler = profiler.slice(0, comparisonStart) + 'const probeScanComparison = null;\n' + profiler.slice(comparisonEnd);
profiler = profiler.replace('searchAndProofCountersMatchBaseline: true, probeScanComparison, baseline: resolve(baselineArg),',
  'searchAndProofCountersMatchBaseline: null, probeScanComparison, baseline: null, outcome: result.result,');
profiler = change(profiler,
  'Search/proof counters match baseline. Maximum bucket scan (execution telemetry): ${probeScanComparison.baseline} → ${probeScanComparison.candidate}.',
  "Outcome: ${result.result.status}. ${result.result.error?.message ?? ''} No comparison baseline was run for this depth.");
profiler = profiler.replace('exactCountersMatchBaseline: true,', 'exactCountersMatchBaseline: null, outcome: result.result,');
await writeFile(resolve(here, 'profile.mjs'), profiler);
const child = spawn(process.execPath, [resolve(here, 'profile.mjs'), output, '-', '--columns', '7', '--rows', '6', '--depth', '21', '--timeout-ms', '60000'],
  { stdio: 'inherit', windowsHide: true });
const [code] = await once(child, 'close');
process.exitCode = code ?? 1;
