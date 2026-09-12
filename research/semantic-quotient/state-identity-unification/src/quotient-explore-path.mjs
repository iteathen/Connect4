import {
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
  tacticalExactValue,
  tacticalForcedColumn,
} from './quotient-negamax-domain-contract.mjs';

function normalizeDepth(depth) {
  if (!Number.isInteger(depth) || depth < 1) throw new RangeError('explore depth must be a positive integer');
  return depth;
}

function replayPath(kernel, path) {
  if (!Array.isArray(path)) throw new TypeError('explore path must be an array');
  let stateId = kernel.rootId;
  for (let index = 0; index < path.length; index += 1) {
    const column = path[index];
    if (!Number.isInteger(column) || column < 0 || column >= kernel.columns) {
      throw new RangeError(`invalid explore path column ${column} at ply ${index}`);
    }
    const child = kernel.advance(stateId, column);
    if (child === QN_ILLEGAL) throw new Error(`illegal explore path at ply ${index}: ${path.join(',')}`);
    if (child === QN_TERMINAL_WIN) throw new Error(`explore path crosses terminal win at ply ${index}: ${path.join(',')}`);
    stateId = child;
  }
  return stateId;
}

export function exploreQuotientPath(kernel, path, depth) {
  const maxDepth = normalizeDepth(depth);
  const startPath = Object.freeze([...path]);
  const startStateId = replayPath(kernel, startPath);
  const seen = new Set([startStateId]);
  let layer = [{ stateId: startStateId, path: startPath }];
  let reachedDepth = 0;
  let expandedStates = 0;
  let traversedEdges = 0;
  let transposedEdges = 0;
  let terminalWins = 0;
  let tacticalClosed = 0;
  let forcedNodes = 0;

  for (let relativeDepth = 0; relativeDepth < maxDepth && layer.length > 0; relativeDepth += 1) {
    const next = [];
    for (const node of layer) {
      const tactical = kernel.tacticalCode(node.stateId);
      if (tacticalExactValue(tactical) !== null) {
        tacticalClosed += 1;
        continue;
      }

      const forcedColumn = tacticalForcedColumn(tactical, kernel.columns);
      const columns = forcedColumn >= 0 ? [forcedColumn] : kernel.centerOrder;
      if (forcedColumn >= 0) forcedNodes += 1;
      expandedStates += 1;

      for (const column of columns) {
        if (kernel.supportAccess.landingAt(kernel.states.support[node.stateId], column) === 0xff) continue;
        traversedEdges += 1;
        const child = kernel.advance(node.stateId, column);
        if (child === QN_ILLEGAL) continue;
        if (child === QN_TERMINAL_WIN) {
          terminalWins += 1;
          continue;
        }
        if (seen.has(child)) {
          transposedEdges += 1;
          continue;
        }
        seen.add(child);
        next.push(Object.freeze({
          stateId: child,
          path: Object.freeze([...node.path, column]),
        }));
      }
    }
    layer = next;
    reachedDepth = relativeDepth + 1;
  }

  return Object.freeze({
    kind: 'connect4-quotient-explore-fragment-v1',
    startPath,
    requestedDepth: maxDepth,
    reachedDepth,
    uniqueStates: seen.size,
    expandedStates,
    traversedEdges,
    transposedEdges,
    terminalWins,
    tacticalClosed,
    forcedNodes,
    frontierPaths: Object.freeze(layer.map((node) => node.path)),
  });
}
