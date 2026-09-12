import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';

// Cold, matched proof obligations. Optional baseline is an extracted immutable
// Git source packet; no old implementation is installed into the candidate.
// Historical state-hash-removal attribution is frozen in its evidence packet;
// this maintained harness validates the current state owner's selected layout.
async function load(base) {
  const kernelUrl = new URL('quotient-native-negamax-slot64-residual-kernel.mjs', base);
  const [{ createSlot64ResidualQuotientKernel }, { createSemanticSharedTtArena }, { createOnlineSemanticQuotientSearcher }] = await Promise.all([
    import(kernelUrl), import(new URL('quotient-semantic-shared-tt.mjs', base)), import(new URL('quotient-online-semantic-search-lib.mjs', base)),
  ]);
  const source = await readFile(new URL('quotient-native-negamax-support-layout-kernel.mjs', base));
  return { createSlot64ResidualQuotientKernel, createSemanticSharedTtArena, createOnlineSemanticQuotientSearcher,
    sourceSha256: createHash('sha256').update(source).digest('hex') };
}
function run(api, spec) {
  global.gc?.();
  const start = performance.now();
  const { kernel } = api.createSlot64ResidualQuotientKernel(spec, { cacheEdges: false });
  const arena = api.createSemanticSharedTtArena({ entryCapacity: 65536, termCapacity: 1 << 24, domainSpec: spec });
  const searcher = api.createOnlineSemanticQuotientSearcher(kernel, arena, { etc: false });
  const ready = performance.now(), value = searcher.search(kernel.rootId, -2, 2), end = performance.now();
  return { kernel, row: { value, setupMs: ready - start, solveMs: end - ready, totalMs: end - start,
    calls: searcher.metrics.calls, expanded: searcher.metrics.expanded, metrics: { ...searcher.metrics },
    stateMetrics: { ...kernel.states.metrics }, memory: kernel.memoryStats() } };
}
function median(xs) { return xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)]; }
function assertStateStorage(row) {
  const state = row.memory.state;
  assert.ok(Number.isSafeInteger(state.identityWords) && (state.identityWords === 2 || state.identityWords === 3),
    `invalid state identity word count ${state.identityWords}`);
  assert.ok(Number.isSafeInteger(state.supportBits) && state.supportBits >= 0 && state.supportBits <= 32,
    `invalid state support width ${state.supportBits}`);
  assert.ok(Number.isSafeInteger(state.classBits) && state.classBits >= 0 && state.classBits <= 32,
    `invalid state class width ${state.classBits}`);
  const expectedWords = state.supportBits + 2 * state.classBits <= 64 ? 2 : 3;
  assert.equal(state.identityWords, expectedWords, 'state identity layout does not match sealed dimensions');
  assert.equal(state.stateArrayBytes, 4 * expectedWords * state.stateCapacity,
    'state payload bytes do not match the selected exact identity layout');
  return state;
}
function assertSameStateIds(before, after) {
  assert.equal(after.states.count, before.states.count, 'state count drift');
  if (typeof before.states.writeStateParts !== 'function' || typeof after.states.writeStateParts !== 'function') {
    throw new TypeError('baseline comparison requires the stable state-owner read surface');
  }
  const a = { supportIndex: 0, p0ClassId: 0, p1ClassId: 0 };
  const b = { supportIndex: 0, p0ClassId: 0, p1ClassId: 0 };
  for (let id = 0; id < after.states.count; id++) {
    before.states.writeStateParts(id, a);
    after.states.writeStateParts(id, b);
    assert.deepEqual(b, a, `state identity/placement drift at id ${id}`);
  }
}
// A timed child loads exactly one implementation. Sharing timed call sites
// between separately loaded module graphs can change V8 optimization behavior.
if (process.argv[2] === '--sample') {
  const api = await load(pathToFileURL(resolve(process.argv[3]) + '/'));
  const spec = { columns: Number(process.argv[4]), rows: Number(process.argv[5]), connect: 4 };
  const observations = [];
  for (let i = 0; i < 6; i++) {
    const { row } = run(api, spec);
    assert.ok(row.value === 0);
    assertStateStorage(row);
    if (i >= 3) observations.push(row);
  }
  console.log(JSON.stringify(observations));
  process.exit(0);
}
const current = await load(new URL('./', import.meta.url));
const baseline = process.argv[2] ? await load(pathToFileURL(resolve(process.argv[2]) + '/')) : null;
function sample(path, spec) {
  const child = spawnSync(process.execPath, ['--expose-gc', fileURLToPath(import.meta.url), '--sample', path,
    String(spec.columns), String(spec.rows)], { encoding: 'utf8', timeout: 120000, windowsHide: true });
  assert.ifError(child.error);
  assert.equal(child.status, 0, child.stderr);
  return JSON.parse(child.stdout);
}
const results = [], batches = baseline ? 3 : 1;
for (const [columns, rows] of [[4, 5], [5, 4], [4, 6]]) {
  const spec = { columns, rows, connect: 4 }, observations = [];
  // Untimed complete identity comparisons use only the public state-owner read
  // surface, so representation changes do not require exposing private arrays.
  if (baseline) {
    const before = run(baseline, spec), after = run(current, spec);
    assert.equal(after.row.value, before.row.value);
    assertStateStorage(after.row);
    assertStateStorage(before.row);
    assertSameStateIds(before.kernel, after.kernel);
  }
  for (let batch = 0; batch < batches; batch++) {
    let before, after;
    const currentPath = dirname(fileURLToPath(import.meta.url));
    if (!baseline) after = sample(currentPath, spec);
    else if (batch & 1) { after = sample(currentPath, spec); before = sample(process.argv[2], spec); }
    else { before = sample(process.argv[2], spec); after = sample(currentPath, spec); }
    for (let i = 0; i < after.length; i++) observations.push({ baseline: before?.[i], candidate: after[i] });
  }
  for (const { baseline: before, candidate: after } of observations) {
    assert.ok(after.value === 0); // Negamax's internal draw may be signed zero.
    assertStateStorage(after);
    if (before) {
      assertStateStorage(before);
      assert.equal(after.value, before.value);
      assert.deepEqual(after.metrics, before.metrics);
      assert.deepEqual(after.stateMetrics, before.stateMetrics);
      assert.deepEqual(after.memory.residual, before.memory.residual);
    }
  }
  const summarize = key => {
    const rows = observations.map(r => r[key]).filter(Boolean);
    return rows.length ? { medianSolveMs: median(rows.map(r => r.solveMs)), medianTotalMs: median(rows.map(r => r.totalMs)),
      calls: rows[0].calls, expanded: rows[0].expanded, identityWords: rows[0].memory.state.identityWords,
      stateArrayBytes: rows[0].memory.state.stateArrayBytes, stateBytes: rows[0].memory.state.totalTypedBytes,
      kernelBytes: rows[0].memory.totalTypedBytes } : null;
  };
  results.push({ spec, baseline: summarize('baseline'), candidate: summarize('candidate'), observations });
}
const result = { kind: 'state-retention-and-identity-comparison', node: process.version,
  baselineSourceSha256: baseline?.sourceSha256 ?? null, candidateSourceSha256: current.sourceSha256,
  processBatches: batches, warmupsPerProcess: 3, measurementsPerProcess: 3, fullStandardRootRun: false,
  scope: 'one implementation per fresh Node process; cold kernel and semantic TT per observation; alternating process order; sealed-layout storage contract, exact search metrics and optional complete state-ID identity compared through the state owner', results };
if (process.argv[3]) await writeFile(process.argv[3], JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ ...result, results: results.map(({ observations, ...summary }) => summary) }, null, 2));
