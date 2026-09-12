import {
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
  assertTacticalCode,
} from './quotient-negamax-domain-contract.mjs';
import { createLocalSemanticDescriptorCache } from './quotient-local-semantic-descriptor.mjs';
import { createQuotientNegamaxEngine } from './quotient-negamax-engine.mjs';
import { createPackedProofStore } from './quotient-packed-proof-store.mjs';
import { assertSemanticTtDomain, createSemanticSharedTtView } from './quotient-semantic-shared-tt.mjs';

export function createOnlineSemanticQuotientPort(kernel, semanticArena) {
  if (!kernel || typeof kernel !== 'object' || !semanticArena || typeof semanticArena !== 'object') {
    throw new TypeError('online semantic quotient port requires kernel and semantic arena');
  }
  semanticArena = assertSemanticTtDomain(semanticArena, kernel);
  const { states, supportAccess, columns, cellCount, centerOrder } = kernel;
  if (!states || !supportAccess || !Number.isSafeInteger(columns) || columns < 1 || columns > 7
      || !Number.isSafeInteger(cellCount) || cellCount < 1 || cellCount > 64) {
    throw new TypeError('online semantic quotient port received an invalid kernel state-space contract');
  }
  if (!Number.isSafeInteger(semanticArena.entryCapacity) || semanticArena.entryCapacity < 1) {
    throw new RangeError('online semantic quotient port requires a positive semantic entry capacity');
  }

  const descriptorCache = createLocalSemanticDescriptorCache(kernel);
  const tt = createSemanticSharedTtView(semanticArena);
  const semanticProofStore = createPackedProofStore(semanticArena);
  const identityMetrics = {
    ttProbes: 0,
    ttEnsures: 0,
    ttReprobes: 0,
    proofHandleRefreshes: 0,
    proofReadRetries: 0,
    publicationRetries: 0,
  };
  let cachedStateId = -1;
  let cachedHandle = -1;

  function assertStateId(stateId) {
    if (!Number.isSafeInteger(states.count) || states.count < 1) throw new Error(`online semantic state count is invalid: ${states.count}`);
    if (!Number.isSafeInteger(stateId) || stateId < 0 || stateId >= states.count) {
      throw new RangeError(`online semantic state id ${stateId} is outside current state count ${states.count}`);
    }
    return stateId;
  }

  function assertColumn(column, allowIllegal = false) {
    if (!Number.isSafeInteger(column) || column < 0 || column >= columns) {
      if (allowIllegal) return false;
      throw new RangeError(`online semantic column ${column} is outside 0..${columns - 1}`);
    }
    return true;
  }

  function descriptor(stateId) {
    assertStateId(stateId);
    return descriptorCache.hotStateDescriptor(stateId);
  }

  function assertHandle(handle, label, allowMiss = true) {
    if (!Number.isSafeInteger(handle)) throw new Error(`${label} returned non-integer handle ${handle}`);
    if (allowMiss && handle === -1) return handle;
    if (handle < semanticArena.entryCapacity) {
      throw new Error(`${label} returned malformed generation handle ${handle}`);
    }
    return handle;
  }

  function rememberHandle(stateId, handle) {
    assertStateId(stateId);
    assertHandle(handle, 'semantic TT', true);
    cachedStateId = stateId;
    cachedHandle = handle;
    return handle;
  }

  function probeHandle(stateId) {
    identityMetrics.ttProbes += 1;
    return rememberHandle(stateId, tt.probe(descriptor(stateId)));
  }

  function ensureHandle(stateId) {
    identityMetrics.ttEnsures += 1;
    const handle = assertHandle(tt.ensure(descriptor(stateId)), 'semantic TT ensure', false);
    return rememberHandle(stateId, handle);
  }

  function currentHandle(stateId, admit) {
    assertStateId(stateId);
    if (cachedStateId === stateId && cachedHandle >= 0) {
      if (semanticProofStore.isCurrent(cachedHandle)) return cachedHandle;
      identityMetrics.proofHandleRefreshes += 1;
      cachedHandle = -1;
    }
    if (admit) return ensureHandle(stateId);
    identityMetrics.ttReprobes += 1;
    return rememberHandle(stateId, tt.probe(descriptor(stateId)));
  }

  function readBound(stateId, fallback, read) {
    while (true) {
      const handle = currentHandle(stateId, false);
      if (handle < 0) return fallback;
      const value = read(handle);
      if (semanticProofStore.isCurrent(handle)) return value;
      identityMetrics.proofReadRetries += 1;
      cachedHandle = -1;
    }
  }

  function publishCurrent(stateId, publish) {
    while (true) {
      const handle = currentHandle(stateId, true);
      const result = publish(handle);
      if (result !== null) return result;
      identityMetrics.publicationRetries += 1;
      cachedHandle = -1;
    }
  }

  const proofStore = Object.freeze({
    isCurrent(stateId) {
      const handle = currentHandle(stateId, false);
      return handle >= 0 && semanticProofStore.isCurrent(handle);
    },
    lower(stateId) { return readBound(stateId, -1, semanticProofStore.lower); },
    upper(stateId) { return readBound(stateId, 1, semanticProofStore.upper); },
    bestMove(stateId) { return readBound(stateId, -1, semanticProofStore.bestMove); },
    publishExact(stateId, value, bestMoveValue = -1) {
      return publishCurrent(stateId, (handle) => semanticProofStore.publishExact(handle, value, bestMoveValue));
    },
    publishLower(stateId, value, bestMoveValue = -1) {
      return publishCurrent(stateId, (handle) => semanticProofStore.publishLower(handle, value, bestMoveValue));
    },
    publishUpper(stateId, value, bestMoveValue = -1) {
      return publishCurrent(stateId, (handle) => semanticProofStore.publishUpper(handle, value, bestMoveValue));
    },
    publishHint(stateId, bestMoveValue) {
      return publishCurrent(stateId, (handle) => semanticProofStore.publishHint(handle, bestMoveValue));
    },
    metrics: semanticProofStore.metrics,
  });

  function rankAt(stateId) {
    assertStateId(stateId);
    const rank = supportAccess.rankAt(states.support[stateId]);
    if (!Number.isSafeInteger(rank) || rank < 0 || rank > cellCount) throw new Error(`online semantic rank drifted: ${rank}`);
    return rank;
  }

  function isLegal(stateId, column) {
    assertStateId(stateId);
    if (!assertColumn(column, true)) return false;
    return supportAccess.landingAt(states.support[stateId], column) !== 0xff;
  }

  function landingCellAt(stateId, column) {
    assertStateId(stateId);
    if (!assertColumn(column, true)) return 0xff;
    const landing = supportAccess.landingAt(states.support[stateId], column);
    if (landing !== 0xff && (!Number.isSafeInteger(landing) || landing < 0 || landing >= cellCount)) {
      throw new Error(`online semantic landing cell drifted: ${landing}`);
    }
    return landing;
  }

  function transition(stateId, column) {
    assertStateId(stateId);
    if (!assertColumn(column, true)) return QN_ILLEGAL;
    const child = kernel.advance(stateId, column);
    if (!Number.isSafeInteger(child) || child < QN_ILLEGAL) throw new Error(`online semantic transition returned invalid child ${child}`);
    if (child >= 0 && child >= states.count) throw new Error(`online semantic transition returned unpublished state ${child}`);
    return child;
  }

  function tacticalCode(stateId) {
    assertStateId(stateId);
    const code = kernel.tacticalCode(stateId);
    assertTacticalCode(code, columns);
    return code;
  }

  function frontierBoundCode(stateId) {
    assertStateId(stateId);
    return kernel.frontierBoundCode?.(stateId) ?? 0;
  }

  const port = Object.freeze({
    columns,
    cellCount,
    rootId: kernel.rootId,
    centerOrder,
    frontierOrder: kernel.frontierOrder ?? null,
    proofStore,
    proofKey(stateId) {
      const handle = probeHandle(stateId);
      return handle < 0 ? -1 : stateId;
    },
    ensureProofKey(stateId) {
      ensureHandle(stateId);
      return assertStateId(stateId);
    },
    rankAt,
    isLegal,
    landingCellAt,
    transition,
    tacticalCode,
    frontierBoundCode,
  });

  return Object.freeze({ port, tt, proofStore, semanticProofStore, descriptorCache, identityMetrics });
}

export function createOnlineSemanticQuotientSearcher(kernel, semanticArena, options = {}) {
  const semantic = createOnlineSemanticQuotientPort(kernel, semanticArena);
  const engine = createQuotientNegamaxEngine(semantic.port, {
    etc: options.etc === true,
    etcMinRemaining: options.etcMinRemaining ?? 0,
  });
  const frontierWords = kernel.frontierOrder?.profile?.stateWords ?? 0;

  function replayPath(path) {
    if (!Array.isArray(path)) throw new TypeError('planner path must be an array');
    if (path.length > kernel.cellCount) throw new RangeError(`planner path exceeds ${kernel.cellCount} plies`);
    let stateId = kernel.rootId;
    let frontierSeed = kernel.frontierOrder?.createRootSeed() ?? null;
    if (frontierSeed !== null && (!(frontierSeed instanceof Uint32Array) || frontierSeed.length !== frontierWords)) {
      throw new TypeError(`planner root frontier seed must be Uint32Array(${frontierWords})`);
    }
    for (let index = 0; index < path.length; index += 1) {
      const column = path[index];
      if (!Number.isSafeInteger(column) || column < 0 || column >= kernel.columns) {
        throw new RangeError(`planner path column ${column} at ply ${index} is outside 0..${kernel.columns - 1}`);
      }
      if (!Number.isSafeInteger(stateId) || stateId < 0 || stateId >= kernel.states.count) {
        throw new Error(`planner replay reached invalid state ${stateId} at ply ${index}`);
      }
      const supportIndex = kernel.states.support[stateId];
      const rank = kernel.supportAccess.rankAt(supportIndex);
      if (!Number.isSafeInteger(rank) || rank !== index) {
        throw new Error(`planner path rank drift at ply ${index}: ${rank}`);
      }
      const landingCell = kernel.supportAccess.landingAt(supportIndex, column);
      if (landingCell === 0xff) throw new Error(`illegal planner path at ply ${index}: ${path.join(',')}`);
      if (!Number.isSafeInteger(landingCell) || landingCell < 0 || landingCell >= kernel.cellCount) {
        throw new Error(`planner path landing cell drift at ply ${index}: ${landingCell}`);
      }
      const mover = rank & 1;
      const child = kernel.advance(stateId, column);
      if (child === QN_ILLEGAL) throw new Error(`legal planner path produced illegal transition at ply ${index}: ${path.join(',')}`);
      if (child === QN_TERMINAL_WIN) throw new Error(`planner path crosses terminal win at ply ${index}: ${path.join(',')}`);
      if (!Number.isSafeInteger(child) || child < 0 || child >= kernel.states.count) {
        throw new Error(`planner path produced invalid child ${child} at ply ${index}`);
      }
      if (frontierSeed) {
        frontierSeed = kernel.frontierOrder.advanceSeed(frontierSeed, mover, landingCell);
        if (!(frontierSeed instanceof Uint32Array) || frontierSeed.length !== frontierWords) {
          throw new TypeError(`planner frontier transition must return Uint32Array(${frontierWords})`);
        }
      }
      stateId = child;
    }
    const finalRank = kernel.supportAccess.rankAt(kernel.states.support[stateId]);
    if (finalRank !== path.length) throw new Error(`planner final rank ${finalRank} does not match path length ${path.length}`);
    return Object.freeze({ stateId, frontierSeed });
  }

  function searchPath(path, alpha, beta) {
    const replayed = replayPath(path);
    return Object.freeze({
      stateId: replayed.stateId,
      value: engine.search(replayed.stateId, alpha, beta, replayed.frontierSeed),
    });
  }

  function solvePath(path) { return searchPath(path, -2, 2); }

  function stats() {
    return Object.freeze({
      search: Object.freeze({ ...engine.metrics }),
      identity: Object.freeze({ ...semantic.identityMetrics }),
      semanticTt: semantic.tt.stats(),
      proofStore: Object.freeze({ ...semantic.semanticProofStore.metrics }),
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
    semanticProofStore: semantic.semanticProofStore,
    descriptorCache: semantic.descriptorCache,
    port: semantic.port,
  });
}
