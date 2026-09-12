import {
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
  tacticalExactValue,
  tacticalForcedColumn,
} from './quotient-negamax-domain-contract.mjs';
import { createLiveLineMoveOrder } from './quotient-live-line-move-order.mjs';

function normalizeDepth(depth) {
  if (!Number.isInteger(depth) || depth < 1) throw new RangeError('explore depth must be a positive integer');
  return depth;
}

function replayPath(kernel, path, moveOrder) {
  if (!Array.isArray(path)) throw new TypeError('explore path must be an array');
  let stateId = kernel.rootId;
  let liveLines = moveOrder.createRootSeed();
  for (let index = 0; index < path.length; index += 1) {
    const column = path[index];
    if (!Number.isInteger(column) || column < 0 || column >= kernel.columns) {
      throw new RangeError(`invalid explore path column ${column} at ply ${index}`);
    }
    const supportIndex = kernel.states.support[stateId];
    const landingCell = kernel.supportAccess.landingAt(supportIndex, column);
    if (landingCell === 0xff) throw new Error(`illegal explore path at ply ${index}: ${path.join(',')}`);
    const mover = kernel.supportAccess.rankAt(supportIndex) & 1;
    const child = kernel.advance(stateId, column);
    if (child === QN_ILLEGAL) throw new Error(`illegal explore path at ply ${index}: ${path.join(',')}`);
    if (child === QN_TERMINAL_WIN) throw new Error(`explore path crosses terminal win at ply ${index}: ${path.join(',')}`);
    liveLines = moveOrder.advanceSeed(liveLines, mover, landingCell);
    stateId = child;
  }
  return Object.freeze({ stateId, liveLines });
}

export function exploreQuotientPath(kernel, path, depth) {
  const maxDepth = normalizeDepth(depth);
  const startPath = Object.freeze([...path]);
  const moveOrder = createLiveLineMoveOrder({
    columns: kernel.columns,
    rows: kernel.rows,
    connect: kernel.connect,
  });
  const start = replayPath(kernel, startPath, moveOrder);
  const seen = new Set([start.stateId]);
  let layer = [{ stateId: start.stateId, path: startPath, liveLines: start.liveLines }];
  let reachedDepth = 0;
  let expandedStates = 0;
  let traversedEdges = 0;
  let transposedEdges = 0;
  let terminalWins = 0;
  let tacticalClosed = 0;
  let forcedNodes = 0;
  let orderedNodes = 0;
  let scoredMoves = 0;
  let maxMoveValue = 0;
  let firstLayerOrder = null;

  for (let relativeDepth = 0; relativeDepth < maxDepth && layer.length > 0; relativeDepth += 1) {
    const next = [];
    for (const node of layer) {
      const tactical = kernel.tacticalCode(node.stateId);
      if (tacticalExactValue(tactical) !== null) {
        tacticalClosed += 1;
        continue;
      }

      const forcedColumn = tacticalForcedColumn(tactical, kernel.columns);
      const supportIndex = kernel.states.support[node.stateId];
      const mover = kernel.supportAccess.rankAt(supportIndex) & 1;
      let ordered = moveOrder.orderLegal(kernel, node.stateId, node.liveLines);
      if (forcedColumn >= 0) {
        const forced = ordered.find((entry) => entry.column === forcedColumn);
        if (!forced) throw new Error(`forced column ${forcedColumn} is not legal for quotient state ${node.stateId}`);
        ordered = [forced];
        forcedNodes += 1;
      }
      orderedNodes += 1;
      scoredMoves += ordered.length;
      for (const entry of ordered) if (entry.value > maxMoveValue) maxMoveValue = entry.value;
      if (firstLayerOrder === null) firstLayerOrder = Object.freeze(ordered);
      expandedStates += 1;

      for (const entry of ordered) {
        const { column, landingCell } = entry;
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
          liveLines: moveOrder.advanceSeed(node.liveLines, mover, landingCell),
        }));
      }
    }
    layer = next;
    reachedDepth = relativeDepth + 1;
  }

  return Object.freeze({
    kind: 'connect4-quotient-explore-fragment-v3',
    startPath,
    requestedDepth: maxDepth,
    reachedDepth,
    ordering: 'dynamic-live-winning-line-frontier',
    firstLayerOrder: firstLayerOrder ?? Object.freeze([]),
    uniqueStates: seen.size,
    expandedStates,
    traversedEdges,
    transposedEdges,
    terminalWins,
    tacticalClosed,
    forcedNodes,
    orderedNodes,
    scoredMoves,
    maxMoveValue,
    frontierPaths: Object.freeze(layer.map((node) => node.path)),
  });
}
