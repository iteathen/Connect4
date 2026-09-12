import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createSemanticSharedTtArena } from './quotient-semantic-shared-tt.mjs';
import { createOnlineSemanticQuotientPort } from './quotient-online-semantic-search-lib.mjs';
import { createQuotientNegamaxEngine } from './quotient-negamax-engine.mjs';

const spec = { columns: 4, rows: 5, connect: 4 };
const results = [];
for (const responseClosure of [false, true]) for (const entries of [4096, 65536]) {
  const { kernel } = createSlot64ResidualQuotientKernel(spec, { responseClosure, cacheEdges: false });
  const arena = createSemanticSharedTtArena({ entryCapacity: entries, termCapacity: 1 << 24, domainSpec: spec });
  const semantic = createOnlineSemanticQuotientPort(kernel, arena);
  // Diagnostic observers only. These maps never answer a search/proof request.
  // They intentionally add overhead, so this lane makes no timing claim.
  const visits = new Map(), published = new Set();
  let repeatedVisits = 0, missesAfterPublication = 0, publications = 0;
  const proofStore = { ...semantic.port.proofStore };
  for (const name of ['publishExact', 'publishLower', 'publishUpper']) {
    proofStore[name] = (id, value, hint = -1) => {
      const result = semantic.port.proofStore[name](id, value, hint);
      published.add(id); publications++;
      return result;
    };
  }
  const port = { ...semantic.port, proofStore,
    proofKey(id) {
      const count = visits.get(id) ?? 0;
      if (count > 0) repeatedVisits++;
      visits.set(id, count + 1);
      const key = semantic.port.proofKey(id);
      if (key < 0 && published.has(id)) missesAfterPublication++;
      return key;
    },
  };
  const engine = createQuotientNegamaxEngine(port, { etc: false });
  assert.ok(engine.solveRoot() === 0);
  const cold = { ...engine.metrics, uniqueVisitedStates: visits.size, repeatedVisits,
    missesAfterPublication, publications, tt: semantic.tt.stats() };
  assert.ok(engine.solveRoot() === 0);
  assert.equal(engine.metrics.calls - cold.calls, 1, 'warm exact root proof was not reused');
  assert.equal(engine.metrics.expanded - cold.expanded, 0);
  results.push({ responseClosure, entries, cold,
    warmAdditionalCalls: engine.metrics.calls - cold.calls,
    caveat: 'A miss after publication proves absent retained identity; it does not prove the previous bound would close the new window.' });
}
console.log(JSON.stringify({ kind: 'bounded-proof-reuse-observer-v1', spec, results }, null, 2));
