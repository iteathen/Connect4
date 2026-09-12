import {
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
  assertTacticalCode,
  tacticalExactValue,
  tacticalForcedColumn,
} from './quotient-negamax-domain-contract.mjs';
import { createDependencyAwareQuotientNegamaxEngine } from './quotient-negamax-engine.mjs';
import { createOnlineSemanticQuotientPort } from './quotient-online-semantic-search-lib.mjs';

function boundedSafeInteger(value, label, minimum, maximum) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(`${label} must be a safe integer in ${minimum}..${maximum}`);
  }
  return value;
}

export function createOnlineDependencyCoordinator(kernel, semanticArena, executor, options = {}) {
  if (!kernel || typeof kernel !== 'object' || !semanticArena || typeof semanticArena !== 'object'
      || !executor || typeof executor.submit !== 'function') {
    throw new TypeError('online dependency coordinator requires kernel, semantic arena, and executor');
  }
  const { columns, cellCount, rootId } = kernel;
  boundedSafeInteger(columns, 'kernel columns', 1, 7);
  boundedSafeInteger(cellCount, 'kernel cellCount', 1, 64);
  boundedSafeInteger(rootId, 'kernel rootId', 0, Number.MAX_SAFE_INTEGER);
  if (!Array.isArray(kernel.centerOrder) || typeof kernel.tacticalCode !== 'function') {
    throw new TypeError('online dependency coordinator requires kernel ordering and tactical contracts');
  }

  const splitDepth = boundedSafeInteger(options.splitDepth ?? 3, 'splitDepth', 1, cellCount);
  const priorityProbeDepth = boundedSafeInteger(options.priorityProbeDepth ?? 0, 'priorityProbeDepth', 0, cellCount);
  const maxCoordinatorPaths = boundedSafeInteger(options.maxCoordinatorPaths ?? 1_000_000, 'maxCoordinatorPaths', 1, 16_777_216);
  const maxPriorityMemoEntries = boundedSafeInteger(options.maxPriorityMemoEntries ?? 262_144, 'maxPriorityMemoEntries', 1, 16_777_216);

  const semantic = createOnlineSemanticQuotientPort(kernel, semanticArena);
  const basePort = semantic.port;
  const paths = new Map([[rootId, Object.freeze([])]]);
  const estimateMemo = new Map();
  const metrics = {
    pathsStored: 1,
    priorityMemoStores: 0,
    priorityMemoHits: 0,
    priorityMemoDrops: 0,
  };

  function assertStateId(stateId, label) {
    if (!Number.isSafeInteger(stateId) || stateId < 0 || stateId >= kernel.states.count) {
      throw new RangeError(`${label} ${stateId} is outside current state count ${kernel.states.count}`);
    }
    return stateId;
  }

  function assertTransitionTarget(child, stateId, column) {
    if (!Number.isSafeInteger(child) || child < QN_ILLEGAL) {
      throw new Error(`coordinator transition ${stateId}/${column} returned invalid child ${child}`);
    }
    return child;
  }

  function transition(stateId, column) {
    assertStateId(stateId, 'coordinator state');
    if (!Number.isSafeInteger(column) || column < 0 || column >= columns) {
      throw new RangeError(`coordinator column ${column} is outside 0..${columns - 1}`);
    }
    const child = assertTransitionTarget(basePort.transition(stateId, column), stateId, column);
    if (child >= 0 && !paths.has(child)) {
      const parentPath = paths.get(stateId);
      if (!parentPath) throw new Error(`missing representative path for state ${stateId}`);
      if (parentPath.length >= cellCount) throw new Error(`representative path for state ${stateId} exceeds board rank`);
      if (paths.size >= maxCoordinatorPaths) {
        throw new Error(`coordinator representative-path capacity ${maxCoordinatorPaths} exhausted`);
      }
      paths.set(child, Object.freeze([...parentPath, column]));
      metrics.pathsStored += 1;
    }
    return child;
  }

  const port = Object.freeze({ ...basePort, transition });

  function memoSet(key, value) {
    if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`priority estimate ${value} is invalid`);
    if (estimateMemo.size >= maxPriorityMemoEntries) {
      metrics.priorityMemoDrops += 1;
      return value;
    }
    estimateMemo.set(key, value);
    metrics.priorityMemoStores += 1;
    return value;
  }

  function estimate(stateId, depth = priorityProbeDepth) {
    assertStateId(stateId, 'priority estimate state');
    boundedSafeInteger(depth, 'priority estimate depth', 0, cellCount);
    const key = `${stateId}:${depth}`;
    const prior = estimateMemo.get(key);
    if (prior !== undefined) {
      metrics.priorityMemoHits += 1;
      return prior;
    }

    const tactical = kernel.tacticalCode(stateId);
    assertTacticalCode(tactical, columns);
    if (tacticalExactValue(tactical) !== null) return memoSet(key, 1);

    // Forced transit does not consume unresolved-decision probe depth, matching the
    // dependency engine's split-depth semantics.
    const forcedColumn = tacticalForcedColumn(tactical, columns);
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
      const legal = basePort.isLegal(stateId, column);
      if (typeof legal !== 'boolean') throw new TypeError(`priority legality for ${stateId}/${column} was not boolean`);
      if (!legal) continue;
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
      assertStateId(stateId, 'leaf state');
      const path = paths.get(stateId);
      if (!path) throw new Error(`missing leaf path for state ${stateId}`);
      return executor.submit({ type: 'search-path', path, alpha, beta }, priority);
    },
    {
      splitDepth,
      priorityAt: (stateId) => estimate(stateId),
    },
  );

  function stats() {
    return Object.freeze({
      ...metrics,
      representativePaths: paths.size,
      priorityMemoEntries: estimateMemo.size,
      splitDepth,
      priorityProbeDepth,
      maxCoordinatorPaths,
      maxPriorityMemoEntries,
    });
  }

  // Mutable path/memo maps remain private ownership. Consumers receive only the exact
  // engine/port plus immutable diagnostics, so external code cannot corrupt scheduling state.
  return Object.freeze({ engine, semantic, metrics, port, stats });
}
