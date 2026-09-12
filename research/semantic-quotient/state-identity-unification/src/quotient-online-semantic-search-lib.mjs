import {
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
} from './quotient-negamax-domain-contract.mjs';
import { createLocalSemanticDescriptorCache } from './quotient-local-semantic-descriptor.mjs';
import { createQuotientNegamaxEngine } from './quotient-negamax-engine.mjs';
import { createPackedProofStore } from './quotient-packed-proof-store.mjs';
import { createSemanticSharedTtView } from './quotient-semantic-shared-tt.mjs';

export function createOnlineSemanticQuotientSearcher(kernel, semanticArena, options = {}) {
  const { states, supportAccess, columns, cellCount, centerOrder } = kernel;
  const descriptorCache = createLocalSemanticDescriptorCache(kernel);
  const tt = createSemanticSharedTtView(semanticArena);
  const proofStore = createPackedProofStore(semanticArena.recordBuffer);
  const identityMetrics = { ttEntryLookups: 0 };

  const engine = createQuotientNegamaxEngine(Object.freeze({
    columns,
    cellCount,
    rootId: kernel.rootId,
    centerOrder,
    proofStore,
    proofKey(stateId) {
      identityMetrics.ttEntryLookups += 1;
      return tt.findOrCreate(descriptorCache.stateDescriptor(stateId));
    },
    rankAt: (stateId) => supportAccess.rankAt(states.support[stateId]),
    isLegal: (stateId, column) => supportAccess.landingAt(states.support[stateId], column) !== 0xff,
    transition: kernel.advance,
    tacticalCode: kernel.tacticalCode,
  }), {
    etc: options.etc === true,
    etcMinRemaining: options.etcMinRemaining ?? 0,
  });

  function replayPath(path) {
    let stateId = kernel.rootId;
    for (let index = 0; index < path.length; index += 1) {
      const child = kernel.advance(stateId, path[index]);
      if (child === QN_ILLEGAL) throw new Error(`illegal planner path at ply ${index}: ${path.join(',')}`);
      if (child === QN_TERMINAL_WIN) throw new Error(`planner path crosses terminal win at ply ${index}: ${path.join(',')}`);
      stateId = child;
    }
    return stateId;
  }

  function solvePath(path) {
    const stateId = replayPath(path);
    return Object.freeze({ stateId, value: engine.solveState(stateId) });
  }

  function stats() {
    return Object.freeze({
      search: Object.freeze({ ...engine.metrics }),
      identity: Object.freeze({ ...identityMetrics }),
      semanticTt: tt.stats(),
      proofStore: Object.freeze({ ...proofStore.metrics }),
      descriptorCache: Object.freeze({ ...descriptorCache.metrics }),
      localStates: kernel.states.count,
      localClasses: kernel.classes.size,
    });
  }

  return Object.freeze({
    search: engine.search,
    replayPath,
    solvePath,
    stats,
    metrics: engine.metrics,
    identityMetrics,
    tt,
    proofStore,
    descriptorCache,
  });
}
