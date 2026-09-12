import {
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
} from './quotient-negamax-domain-contract.mjs';
import { createLocalSemanticDescriptorCache } from './quotient-local-semantic-descriptor.mjs';
import { createQuotientNegamaxEngine } from './quotient-negamax-engine.mjs';
import { createPackedProofStore } from './quotient-packed-proof-store.mjs';
import { createSemanticSharedTtView } from './quotient-semantic-shared-tt.mjs';

export function createOnlineSemanticQuotientPort(kernel, semanticArena) {
  const { states, supportAccess, columns, cellCount, centerOrder } = kernel;
  const descriptorCache = createLocalSemanticDescriptorCache(kernel);
  const tt = createSemanticSharedTtView(semanticArena);
  const proofStore = createPackedProofStore(semanticArena.recordBuffer);
  const identityMetrics = { ttProbes: 0, ttEnsures: 0 };

  function descriptor(stateId) {
    return descriptorCache.stateDescriptor(stateId);
  }

  const port = Object.freeze({
    columns,
    cellCount,
    rootId: kernel.rootId,
    centerOrder,
    frontierOrder: kernel.frontierOrder ?? null,
    proofStore,
    proofKey(stateId) {
      identityMetrics.ttProbes += 1;
      return tt.probe(descriptor(stateId));
    },
    ensureProofKey(stateId) {
      identityMetrics.ttEnsures += 1;
      return tt.ensure(descriptor(stateId));
    },
    rankAt: (stateId) => supportAccess.rankAt(states.support[stateId]),
    isLegal: (stateId, column) => supportAccess.landingAt(states.support[stateId], column) !== 0xff,
    landingCellAt: (stateId, column) => supportAccess.landingAt(states.support[stateId], column),
    transition: kernel.advance,
    tacticalCode: kernel.tacticalCode,
    frontierBoundCode: kernel.frontierBoundCode ?? (() => 0),
  });

  return Object.freeze({ port, tt, proofStore, descriptorCache, identityMetrics });
}

export function createOnlineSemanticQuotientSearcher(kernel, semanticArena, options = {}) {
  const semantic = createOnlineSemanticQuotientPort(kernel, semanticArena);
  const engine = createQuotientNegamaxEngine(semantic.port, {
    etc: options.etc === true,
    etcMinRemaining: options.etcMinRemaining ?? 0,
  });

  function replayPath(path) {
    let stateId = kernel.rootId;
    let frontierSeed = kernel.frontierOrder?.createRootSeed() ?? null;
    for (let index = 0; index < path.length; index += 1) {
      const column = path[index];
      const supportIndex = kernel.states.support[stateId];
      const landingCell = kernel.supportAccess.landingAt(supportIndex, column);
      if (landingCell === 0xff) throw new Error(`illegal planner path at ply ${index}: ${path.join(',')}`);
      const mover = kernel.supportAccess.rankAt(supportIndex) & 1;
      const child = kernel.advance(stateId, column);
      if (child === QN_ILLEGAL) throw new Error(`illegal planner path at ply ${index}: ${path.join(',')}`);
      if (child === QN_TERMINAL_WIN) throw new Error(`planner path crosses terminal win at ply ${index}: ${path.join(',')}`);
      if (frontierSeed) frontierSeed = kernel.frontierOrder.advanceSeed(frontierSeed, mover, landingCell);
      stateId = child;
    }
    return Object.freeze({ stateId, frontierSeed });
  }

  function searchPath(path, alpha, beta) {
    const replayed = replayPath(path);
    return Object.freeze({
      stateId: replayed.stateId,
      value: engine.search(replayed.stateId, alpha, beta, replayed.frontierSeed),
    });
  }

  function solvePath(path) {
    return searchPath(path, -2, 2);
  }

  function stats() {
    return Object.freeze({
      search: Object.freeze({ ...engine.metrics }),
      identity: Object.freeze({ ...semantic.identityMetrics }),
      semanticTt: semantic.tt.stats(),
      proofStore: Object.freeze({ ...semantic.proofStore.metrics }),
      descriptorCache: Object.freeze({ ...semantic.descriptorCache.metrics }),
      localStates: kernel.states.count,
      localClasses: kernel.classes.size,
    });
  }

  return Object.freeze({
    search: engine.search,
    replayPath,
    searchPath,
    solvePath,
    stats,
    metrics: engine.metrics,
    identityMetrics: semantic.identityMetrics,
    tt: semantic.tt,
    proofStore: semantic.proofStore,
    descriptorCache: semantic.descriptorCache,
    port: semantic.port,
  });
}
