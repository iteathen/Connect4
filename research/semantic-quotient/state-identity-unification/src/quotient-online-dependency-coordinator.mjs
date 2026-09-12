import {
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
  tacticalExactValue,
} from './quotient-negamax-domain-contract.mjs';
import { createDependencyAwareQuotientNegamaxEngine } from './quotient-negamax-engine.mjs';
import { createOnlineSemanticQuotientPort } from './quotient-online-semantic-search-lib.mjs';

export function createOnlineDependencyCoordinator(kernel, semanticArena, executor, options = {}) {
  const splitDepth = options.splitDepth ?? 3;
  const priorityProbeDepth = options.priorityProbeDepth ?? 0;
  const semantic = createOnlineSemanticQuotientPort(kernel, semanticArena);
  const basePort = semantic.port;
  const paths = [];
  paths[kernel.rootId] = Object.freeze([]);

  function transition(stateId, column) {
    const child = basePort.transition(stateId, column);
    if (child >= 0 && paths[child] === undefined) {
      const parentPath = paths[stateId];
      if (!parentPath) throw new Error(`missing representative path for state ${stateId}`);
      paths[child] = Object.freeze([...parentPath, column]);
    }
    return child;
  }

  const port = Object.freeze({ ...basePort, transition });
  const estimateMemo = new Map();

  function estimate(stateId, depth = priorityProbeDepth) {
    if (depth <= 0) return 1;
    const key = `${stateId}:${depth}`;
    const prior = estimateMemo.get(key);
    if (prior !== undefined) return prior;
    if (tacticalExactValue(kernel.tacticalCode(stateId)) !== null) {
      estimateMemo.set(key, 1);
      return 1;
    }
    let cost = 1;
    for (const column of kernel.centerOrder) {
      if (!basePort.isLegal(stateId, column)) continue;
      const child = transition(stateId, column);
      if (child === QN_TERMINAL_WIN) cost += 1;
      else if (child !== QN_ILLEGAL) cost += estimate(child, depth - 1);
    }
    estimateMemo.set(key, cost);
    return cost;
  }

  const engine = createDependencyAwareQuotientNegamaxEngine(
    port,
    (stateId, alpha, beta, priority) => {
      const path = paths[stateId];
      if (!path) throw new Error(`missing leaf path for state ${stateId}`);
      return executor.submit({ type: 'search-path', path, alpha, beta }, priority);
    },
    {
      splitDepth,
      priorityAt: (stateId) => estimate(stateId),
    },
  );

  return Object.freeze({ engine, paths, semantic, estimateMemo, port });
}
