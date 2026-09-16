import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';

// Run from the candidate repository root. argv[2] is an exact baseline checkout;
// argv[3] is the output JSON. Child processes isolate each version's JIT state.
const cases = [[4, 5, 65536], [4, 5, 4096], [4, 6, 65536]];
if (process.argv[2] === '--child') {
  const [, , , root, caseIndex] = process.argv;
  const base = pathToFileURL(resolve(root, 'research/semantic-quotient/state-identity-unification/src') + '/');
  const { createSlot64ResidualQuotientKernel } = await import(new URL('quotient-native-negamax-slot64-residual-kernel.mjs', base));
  const { createSemanticSharedTtArena } = await import(new URL('quotient-semantic-shared-tt.mjs', base));
  const { createOnlineSemanticQuotientSearcher } = await import(new URL('quotient-online-semantic-search-lib.mjs', base));
  const [columns, rows, entries] = cases[Number(caseIndex)];
  const spec = { columns, rows, connect: 4 }, samples = [];
  for (let repeat = 0; repeat < 12; repeat++) {
    global.gc();
    const { kernel } = createSlot64ResidualQuotientKernel(spec, { cacheEdges: false, prefixClasses: 4096 });
    const arena = createSemanticSharedTtArena({ entryCapacity: entries, termCapacity: 1 << 24, domainSpec: spec });
    const searcher = createOnlineSemanticQuotientSearcher(kernel, arena, { etc: false });
    const cpu = process.cpuUsage(), start = performance.now();
    const value = searcher.search(kernel.rootId, -2, 2);
    const elapsedMs = performance.now() - start, cpuTime = process.cpuUsage(cpu);
    assert.ok(value === 0, 'exact draw');
    if (repeat < 3) continue;
    samples.push({ elapsedMs, cpuMs: (cpuTime.user + cpuTime.system) / 1000,
      search: searcher.stats(), residual: { ...kernel.classes.metrics },
      state: { ...kernel.states.metrics }, memory: kernel.memoryStats() });
  }
  console.log(JSON.stringify({ spec, entries, samples }));
} else {
  assert.ok(process.argv[2] && process.argv[3], 'baseline root and output path required');
  const script = fileURLToPath(import.meta.url), runs = [];
  for (let batch = 0; batch < 3; batch++) {
    for (let index = 0; index < cases.length; index++) {
      for (const candidate of batch % 2 ? [true, false] : [false, true]) {
        const child = spawnSync(process.execPath, ['--expose-gc', script, '--child',
          resolve(candidate ? '.' : process.argv[2]), String(index)], { encoding: 'utf8', maxBuffer: 16 << 20 });
        assert.equal(child.status, 0, child.stderr);
        runs.push({ batch, candidate, ...JSON.parse(child.stdout) });
      }
    }
  }
  const median = values => [...values].sort((a,b) => a-b)[values.length >>> 1];
  const summary = cases.map(([columns, rows, entries]) => {
    const matching = runs.filter(r => r.spec.columns === columns && r.spec.rows === rows && r.entries === entries);
    const before = matching.filter(r => !r.candidate).flatMap(r => r.samples);
    const after = matching.filter(r => r.candidate).flatMap(r => r.samples);
    for (const sample of [...before, ...after]) {
      assert.deepEqual(sample.search.search, before[0].search.search);
      assert.deepEqual(sample.search.semanticTt, before[0].search.semanticTt);
      assert.equal(sample.search.localStates, before[0].search.localStates);
      assert.equal(sample.search.localClasses, before[0].search.localClasses);
      assert.deepEqual(sample.state, before[0].state);
    }
    const baselineMs = median(before.map(s => s.elapsedMs)), candidateMs = median(after.map(s => s.elapsedMs));
    return { columns, rows, entries, samplesPerVersion: before.length, baselineMs, candidateMs,
      percentFaster: 100 * (baselineMs - candidateMs) / baselineMs,
      baselineCpuMs: median(before.map(s => s.cpuMs)), candidateCpuMs: median(after.map(s => s.cpuMs)),
      search: after[0].search, baselineMemory: before[0].memory, candidateMemory: after[0].memory };
  });
  const result = { node: process.version, baseline: '0317c1c',
    scope: 'single-thread bounded exact draws; three warmups and nine samples per isolated process, three batches; alternating version order; setup/GC/report outside timing; no full root', summary, runs };
  writeFileSync(process.argv[3], JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(summary.map(({columns, rows, entries, baselineMs, candidateMs, percentFaster}) => ({columns, rows, entries, baselineMs, candidateMs, percentFaster})), null, 2));
}
