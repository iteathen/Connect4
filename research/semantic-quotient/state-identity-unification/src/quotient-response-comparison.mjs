import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createSemanticSharedTtArena } from './quotient-semantic-shared-tt.mjs';
import { createOnlineSemanticQuotientSearcher } from './quotient-online-semantic-search-lib.mjs';

const spec = { columns: 4, rows: 5, connect: 4 }, results = [];
function median(values) { return values.slice().sort((a, b) => a - b)[Math.floor(values.length / 2)]; }
for (const entries of [65536, 4096]) {
  const runs = [[], []];
  for (let repeat = 0; repeat < 11; repeat++) for (const enabled of repeat & 1 ? [true, false] : [false, true]) {
    global.gc?.();
    const start = performance.now();
    const { kernel } = createSlot64ResidualQuotientKernel(spec, { responseClosure: enabled, cacheEdges: false });
    const arena = createSemanticSharedTtArena({ entryCapacity: entries, termCapacity: 1 << 24, domainSpec: spec });
    const searcher = createOnlineSemanticQuotientSearcher(kernel, arena, { etc: false });
    const ready = performance.now();
    assert.ok(searcher.search(kernel.rootId, -2, 2) === 0);
    const end = performance.now();
    if (repeat >= 2) runs[Number(enabled)].push({ setupMs: ready - start, solveMs: end - ready,
      totalMs: end - start, calls: searcher.metrics.calls, expanded: searcher.metrics.expanded });
  }
  for (const enabled of [false, true]) {
    const rows = runs[Number(enabled)];
    results.push({ entries, responseClosure: enabled, medianSetupMs: median(rows.map(r => r.setupMs)),
      medianSolveMs: median(rows.map(r => r.solveMs)), medianTotalMs: median(rows.map(r => r.totalMs)), runs: rows });
  }
}
console.log(JSON.stringify({ kind: 'paired-bounded-response-comparison-v1', runtime: process.version, spec,
  repeats: 9, warmupPairs: 2, order: 'alternating; cold kernel and arena per observation', results }, null, 2));
