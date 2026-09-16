import {
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
  tacticalExactValue,
  tacticalForcedColumn,
} from './quotient-negamax-domain-contract.mjs';
import {
  addOccupancyStone,
  createLiveLineMoveOrder,
  EMPTY_OCCUPANCY,
} from './quotient-live-line-move-order.mjs';

function normalizeDepth(depth) {
  if (!Number.isInteger(depth) || depth < 1) throw new RangeError('explore depth must be a positive integer');
  return depth;
}

function replayPath(kernel, path) {
  if (!Array.isArray(path)) throw new TypeError('explore path must be an array');
  let stateId = kernel.rootId;
  let occupancy = EMPTY_OCCUPANCY;
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
    occupancy = addOccupancyStone(occupancy, mover, landingCell);
    stateId = child;
  }
  return Object.freeze({ stateId, occupancy });
}

export function exploreQuotientPath(kernel, path, depth) {
  const maxDepth = normalizeDepth(depth);
  const startPath = Object.freeze([...path]);
  const start = replayPath(kernel, startPath);
  const moveOrder = createLiveLineMoveOrder({
    columns: kernel.columns,
    rows: kernel.rows,
    connect: kernel.connect,
  }, kernel.centerOrder);
  const seen = new Set([start.stateId]);
  let layer = [{ stateId: start.stateId, path: startPath, occupancy: start.occupancy }];
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
      let ordered;
      if (forcedColumn >= 0) {
        const all = moveOrder.orderLegal(kernel, node.stateId, node.occupancy);
        const forced = all.find((entry) => entry.column === forcedColumn);
        if (!forced) throw new Error(`forced column ${forcedColumn} is not legal for quotient state ${node.stateId}`);
        ordered = [forced];
        forcedNodes += 1;
      } else {
        ordered = moveOrder.orderLegal(kernel, node.stateId, node.occupancy);
      }
      orderedNodes += 1;
      scoredMoves += ordered.length;
      for (const entry of ordered) if (entry.value > maxMoveValue) maxMoveValue = entry.value;
      if (firstLayerOrder === null) {
        firstLayerOrder = Object.freeze(ordered.map((entry) => Object.freeze({
          column: entry.column,
          landingCell: entry.landingCell,
          value: entry.value,
        })));
      }
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
          occupancy: addOccupancyStone(node.occupancy, mover, landingCell),
        }));
      }
    }
    layer = next;
    reachedDepth = relativeDepth + 1;
  }

  return Object.freeze({
    kind: 'connect4-quotient-explore-fragment-v2',
    startPath,
    requestedDepth: maxDepth,
    reachedDepth,
    ordering: 'legacy-live-winning-line-incidence',
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
