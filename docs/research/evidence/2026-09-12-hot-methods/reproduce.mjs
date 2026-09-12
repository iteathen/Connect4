import assert from 'node:assert/strict';
import { Session } from 'node:inspector';
import { promisify } from 'node:util';
import { gzip } from 'node:zlib';
import { writeFile } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
const base = pathToFileURL(resolve('research/semantic-quotient/state-identity-unification/src') + '/');
const { createSlot64ResidualQuotientKernel } = await import(new URL('quotient-native-negamax-slot64-residual-kernel.mjs', base));
const { createSemanticSharedTtArena } = await import(new URL('quotient-semantic-shared-tt.mjs', base));
const { createOnlineSemanticQuotientSearcher } = await import(new URL('quotient-online-semantic-search-lib.mjs', base));
const session = new Session(); session.connect();
const post = (method, args = {}) => new Promise((yes, no) => session.post(method, args, (error, result) => error ? no(error) : yes(result)));
await post('Profiler.enable');
await post('Profiler.setSamplingInterval', { interval: 1000 });
const results = [], raw = [];
try {
  for (const [columns, rows, entries] of [[4, 5, 65536], [4, 5, 4096], [4, 6, 65536]]) {
    const spec = { columns, rows, connect: 4 }, functions = new Map(), observations = [];
    let sampleCount = 0;
    for (let repeat = 0; repeat < 11; repeat++) {
      global.gc?.();
      const { kernel } = createSlot64ResidualQuotientKernel(spec, { cacheEdges: false, prefixClasses: 4096 });
      const arena = createSemanticSharedTtArena({ entryCapacity: entries, termCapacity: 1 << 24, domainSpec: spec });
      const searcher = createOnlineSemanticQuotientSearcher(kernel, arena, { etc: false });
      if (repeat >= 3) await post('Profiler.start');
      const value = searcher.search(kernel.rootId, -2, 2);
      let profile;
      if (repeat >= 3) ({ profile } = await post('Profiler.stop'));
      assert.ok(value === 0);
      if (!profile) continue;
      const byId = new Map(profile.nodes.map(n => [n.id, n])), parents = new Map();
      for (const node of profile.nodes) for (const id of node.children ?? []) parents.set(id, node.id);
      const keyOf = node => JSON.stringify([node.callFrame.url, node.callFrame.lineNumber, node.callFrame.functionName]);
      for (const node of profile.nodes) {
        const key = keyOf(node);
        if (!functions.has(key)) functions.set(key, { file: basename(node.callFrame.url || '(runtime)'),
          line: node.callFrame.lineNumber + 1, name: node.callFrame.functionName || '(anonymous)', selfSamples: 0, inclusiveSamples: 0 });
      }
      for (const sample of profile.samples ?? []) {
        sampleCount++;
        functions.get(keyOf(byId.get(sample))).selfSamples++;
        const seen = new Set();
        for (let id = sample; id !== undefined; id = parents.get(id)) {
          const key = keyOf(byId.get(id));
          if (!seen.has(key)) functions.get(key).inclusiveSamples++;
          seen.add(key);
        }
      }
      observations.push({ value, search: searcher.stats(), residual: { ...kernel.classes.metrics }, state: { ...kernel.states.metrics } });
      raw.push({ spec, entries, repeat, profile });
    }
    const methods = [...functions.values()].filter(row => row.selfSamples || row.inclusiveSamples)
      .map(row => ({ ...row, selfPercent: 100 * row.selfSamples / sampleCount, inclusivePercent: 100 * row.inclusiveSamples / sampleCount }))
      .sort((a, b) => b.selfSamples - a.selfSamples);
    results.push({ spec, entries, sampleCount, methods, observations });
    console.log(JSON.stringify({ spec, entries, sampleCount, top: methods.slice(0, 12) }));
  }
} finally { session.disconnect(); }
await writeFile('../frontier-audit-results/hot-method-profile.json', JSON.stringify({ sourceRevision: '3e56d8cb62028be0f232ec4d31d8b22cdb387ab3', node: process.version,
  scope: 'three warmups then eight sampled cold searches per case; setup, explicit GC and report outside sampling; single thread, no contention; 1ms sample interval; self and inclusive samples overlap through inlining and are not per-call costs; no full standard root', results }, null, 2) + '\n');
await writeFile('../frontier-audit-results/hot-method-profiles.json.gz', await promisify(gzip)(JSON.stringify(raw)));
