import {
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
  assertTacticalCode,
  tacticalExactValue,
  tacticalForcedColumn,
} from './quotient-negamax-domain-contract.mjs';
import { createDependencyAwareQuotientNegamaxEngine } from './quotient-negamax-engine.mjs';
import { createOnlineSemanticQuotientPort } from './quotient-online-semantic-search-lib.mjs';

export function createOnlineDependencyCoordinator(kernel, semanticArena, executor, options = {}) {
  if (!kernel || !semanticArena || !executor || typeof executor.submit !== 'function') {
    throw new TypeError('online dependency coordinator requires kernel, semantic arena, and executor');
  }
  const splitDepth = options.splitDepth ?? 3;
  const priorityProbeDepth = options.priorityProbeDepth ?? 0;
  const maxCoordinatorPaths = options.maxCoordinatorPaths ?? 1_000_000;
  const maxPriorityMemoEntries = options.maxPriorityMemoEntries ?? 262_144;
  if (!Number.isInteger(splitDepth) || splitDepth < 1 || splitDepth > kernel.cellCount) {
    throw new RangeError(`splitDepth must be an integer in 1..${kernel.cellCount}`);
  }
  if (!Number.isInteger(priorityProbeDepth) || priorityProbeDepth < 0 || priorityProbeDepth > kernel.cellCount) {
    throw new RangeError(`priorityProbeDepth must be an integer in 0..${kernel.cellCount}`);
  }
  if (!Number.isInteger(maxCoordinatorPaths) || maxCoordinatorPaths < 1) {
    throw new RangeError('maxCoordinatorPaths must be positive');
  }
  if (!Number.isInteger(maxPriorityMemoEntries) || maxPriorityMemoEntries < 1) {
    throw new RangeError('maxPriorityMemoEntries must be positive');
  }

  const semantic = createOnlineSemanticQuotientPort(kernel, semanticArena);
  const basePort = semantic.port;
  const paths = new Map([[kernel.rootId, Object.freeze([])]]);
  const metrics = {
    pathsStored: 1,
    priorityMemoStores: 0,
    priorityMemoHits: 0,
    priorityMemoDrops: 0,
  };

  function transition(stateId, column) {
    const child = basePort.transition(stateId, column);
    if (child >= 0 && !paths.has(child)) {
      const parentPath = paths.get(stateId);
      if (!parentPath) throw new Error(`missing representative path for state ${stateId}`);
      if (paths.size >= maxCoordinatorPaths) {
        throw new Error(`coordinator representative-path capacity ${maxCoordinatorPaths} exhausted`);
      }
      paths.set(child, Object.freeze([...parentPath, column]));
      metrics.pathsStored += 1;
    }
    return child;
  }

  const port = Object.freeze({ ...basePort, transition });
  const estimateMemo = new Map();

  function memoSet(key, value) {
    if (estimateMemo.size >= maxPriorityMemoEntries) {
      metrics.priorityMemoDrops += 1;
      return value;
    }
    estimateMemo.set(key, value);
    metrics.priorityMemoStores += 1;
    return value;
  }

  function estimate(stateId, depth = priorityProbeDepth) {
    if (!Number.isInteger(depth) || depth < 0 || depth > kernel.cellCount) {
      throw new RangeError(`priority estimate depth ${depth} is outside 0..${kernel.cellCount}`);
    }
    const key = `${stateId}:${depth}`;
    const prior = estimateMemo.get(key);
    if (prior !== undefined) {
      metrics.priorityMemoHits += 1;
      return prior;
    }

    const tactical = kernel.tacticalCode(stateId);
    assertTacticalCode(tactical, kernel.columns);
    if (tacticalExactValue(tactical) !== null) return memoSet(key, 1);

    const forcedColumn = tacticalForcedColumn(tactical, kernel.columns);
    if (forcedColumn >= 0) {
      const child = transition(stateId, forcedColumn);
      if (child === QN_ILLEGAL) throw new Error(`forced priority probe move ${stateId}/${forcedColumn} resolved illegal`);
      const cost = child === QN_TERMINAL_WIN ? 2 : 1 + estimate(child, depth);
      if (!Number.isSafeInteger(cost) || cost < 1) throw new RangeError(`priority estimate overflow at state ${stateId}`);
      return memoSet(key, cost);
    }

    if (depth === 0) return memoSet(key, 1);

    let cost = 1;
    for (const column of kernel.centerOrder) {
      if (!basePort.isLegal(stateId, column)) continue;
      const child = transition(stateId, column);
      if (child === QN_TERMINAL_WIN) cost += 1;
      else if (child === QN_ILLEGAL) throw new Error(`legal priority probe move ${stateId}/${column} resolved illegal`);
      else cost += estimate(child, depth - 1);
      if (!Number.isSafeInteger(cost)) throw new RangeError(`priority estimate overflow at state ${stateId}`);
    }
    return memoSet(key, cost);
  }

  const engine = createDependencyAwareQuotientNegamaxEngine(
    port,
    (stateId, alpha, beta, priority) => {
      const path = paths.get(stateId);
      if (!path) throw new Error(`missing leaf path for state ${stateId}`);
      return executor.submit({ type: 'search-path', path, alpha, beta }, priority);
    },
    {
      splitDepth,
      priorityAt: (stateId) => estimate(stateId),
    },
  );

  return Object.freeze({ engine, paths, semantic, estimateMemo, metrics, port });
}
