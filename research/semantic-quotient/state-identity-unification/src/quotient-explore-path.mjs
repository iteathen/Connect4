import {
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
  assertTacticalCode,
  tacticalExactValue,
  tacticalForcedColumn,
} from './quotient-negamax-domain-contract.mjs';
import { createLiveLineMoveOrder } from './quotient-live-line-move-order.mjs';

function assertKernel(kernel) {
  if (!kernel || typeof kernel !== 'object' || !kernel.states || !kernel.classes || !kernel.supportAccess) {
    throw new TypeError('frontier exploration requires a quotient kernel');
  }
  if (!Number.isInteger(kernel.columns) || kernel.columns < 1
      || !Number.isInteger(kernel.rows) || kernel.rows < 1
      || !Number.isInteger(kernel.connect) || kernel.connect < 1
      || !Number.isInteger(kernel.cellCount) || kernel.cellCount < 1 || kernel.cellCount > 64) {
    throw new RangeError('frontier exploration received an invalid kernel geometry');
  }
  if (typeof kernel.advance !== 'function' || typeof kernel.tacticalCode !== 'function') {
    throw new TypeError('frontier exploration kernel is missing transition/tactical capabilities');
  }
  if (typeof kernel.classes.termCount !== 'function' || typeof kernel.classes.writeTermIds !== 'function') {
    throw new TypeError('frontier exploration requires exact residual termCount/writeTermIds');
  }
}

function normalizeDepth(depth, maxDepth) {
  if (!Number.isInteger(depth) || depth < 1 || depth > maxDepth) {
    throw new RangeError(`explore depth must be an integer in 1..${maxDepth}`);
  }
  return depth;
}

function normalizePath(kernel, path) {
  if (!Array.isArray(path)) throw new TypeError('explore path must be an array');
  if (path.length > kernel.cellCount) {
    throw new RangeError(`explore path length ${path.length} exceeds ${kernel.cellCount} cells`);
  }
  return Object.freeze(path.map((column, index) => {
    if (!Number.isInteger(column) || column < 0 || column >= kernel.columns) {
      throw new RangeError(`invalid explore path column ${column} at ply ${index}`);
    }
    return column;
  }));
}

function assertLiveLines(liveLines, expectedLength) {
  if (!(liveLines instanceof Uint32Array) || liveLines.length !== expectedLength) {
    throw new TypeError(`live-line context must be Uint32Array(${expectedLength})`);
  }
}

function localContextKey(stateId, liveLines) {
  let key = `${stateId}|`;
  for (let index = 0; index < liveLines.length; index += 1) key += `${liveLines[index].toString(16)}.`;
  return key;
}

function appendClassTerms(key, kernel, classId, termScratch) {
  const count = kernel.classes.termCount(classId);
  if (!Number.isInteger(count) || count < 0 || count > termScratch.length) {
    throw new RangeError(`explore semantic class ${classId} reported invalid term count ${count}`);
  }
  const written = kernel.classes.writeTermIds(classId, termScratch, 0);
  if (written !== count) {
    throw new Error(`explore semantic class ${classId} term write drift: expected ${count}, wrote ${written}`);
  }
  for (let index = 0; index < count; index += 1) key += `${termScratch[index]}.`;
  return key;
}

function semanticContextKey(kernel, stateId, liveLines, termScratch) {
  if (!Number.isInteger(stateId) || stateId < 0 || stateId >= kernel.states.count) {
    throw new RangeError(`explore semantic state ${stateId} is outside current state count ${kernel.states.count}`);
  }
  const supportIndex = kernel.states.support[stateId];
  const p0Class = kernel.states.p0Class[stateId];
  const p1Class = kernel.states.p1Class[stateId];
  let key = `${supportIndex}|`;
  key = appendClassTerms(key, kernel, p0Class, termScratch);
  key += '/';
  key = appendClassTerms(key, kernel, p1Class, termScratch);
  key += '|';
  for (let index = 0; index < liveLines.length; index += 1) key += `${liveLines[index].toString(16)}.`;
  return key;
}

function replayPath(kernel, path, moveOrder) {
  let stateId = kernel.rootId;
  let liveLines = moveOrder.createRootSeed();
  assertLiveLines(liveLines, moveOrder.profile.stateWords);
  for (let index = 0; index < path.length; index += 1) {
    const column = path[index];
    if (!Number.isInteger(stateId) || stateId < 0 || stateId >= kernel.states.count) {
      throw new Error(`explore replay reached invalid state ${stateId} at ply ${index}`);
    }
    const supportIndex = kernel.states.support[stateId];
    const landingCell = kernel.supportAccess.landingAt(supportIndex, column);
    if (landingCell === 0xff) throw new Error(`illegal explore path at ply ${index}: ${path.join(',')}`);
    if (!Number.isInteger(landingCell) || landingCell < 0 || landingCell >= kernel.cellCount) {
      throw new Error(`explore landing cell ${landingCell} is invalid at ply ${index}`);
    }
    const rank = kernel.supportAccess.rankAt(supportIndex);
    if (!Number.isInteger(rank) || rank !== index) {
      throw new Error(`explore replay rank drift at ply ${index}: ${rank}`);
    }
    const mover = rank & 1;
    const child = kernel.advance(stateId, column);
    if (child === QN_ILLEGAL) throw new Error(`legal explore path produced illegal transition at ply ${index}: ${path.join(',')}`);
    if (child === QN_TERMINAL_WIN) throw new Error(`explore path crosses terminal win at ply ${index}: ${path.join(',')}`);
    if (!Number.isInteger(child) || child < 0 || child >= kernel.states.count) {
      throw new Error(`explore path produced invalid child ${child} at ply ${index}`);
    }
    liveLines = moveOrder.advanceSeed(liveLines, mover, landingCell);
    assertLiveLines(liveLines, moveOrder.profile.stateWords);
    stateId = child;
  }
  return Object.freeze({ stateId, liveLines });
}

export function exploreQuotientPath(kernel, path, depth) {
  assertKernel(kernel);
  const maxDepth = normalizeDepth(depth, kernel.cellCount);
  const startPath = normalizePath(kernel, path);
  const moveOrder = createLiveLineMoveOrder({
    columns: kernel.columns,
    rows: kernel.rows,
    connect: kernel.connect,
  });
  const vocabularyCount = kernel.classes.termVocabulary?.count;
  if (!Number.isInteger(vocabularyCount) || vocabularyCount < 1 || vocabularyCount > 0xffff) {
    throw new RangeError(`explore term vocabulary count ${vocabularyCount} is invalid`);
  }
  const termScratch = new Uint16Array(vocabularyCount);
  const start = replayPath(kernel, startPath, moveOrder);
  const seen = new Set([localContextKey(start.stateId, start.liveLines)]);
  let layer = [{ stateId: start.stateId, path: startPath, liveLines: start.liveLines }];
  let reachedDepth = 0;
  let expandedContexts = 0;
  let traversedEdges = 0;
  let duplicateContextEdges = 0;
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
      assertTacticalCode(tactical, kernel.columns);
      if (tacticalExactValue(tactical) !== null) {
        tacticalClosed += 1;
        continue;
      }

      const forcedColumn = tacticalForcedColumn(tactical, kernel.columns);
      const supportIndex = kernel.states.support[node.stateId];
      const rank = kernel.supportAccess.rankAt(supportIndex);
      if (!Number.isInteger(rank) || rank < 0 || rank > kernel.cellCount) {
        throw new Error(`explore state ${node.stateId} has invalid support rank ${rank}`);
      }
      const mover = rank & 1;
      let ordered = moveOrder.orderLegal(kernel, node.stateId, node.liveLines);
      if (forcedColumn >= 0) {
        const forced = ordered.find((entry) => entry.column === forcedColumn);
        if (!forced) throw new Error(`forced column ${forcedColumn} is not legal for quotient state ${node.stateId}`);
        ordered = Object.freeze([forced]);
        forcedNodes += 1;
      }
      orderedNodes += 1;
      scoredMoves += ordered.length;
      for (const entry of ordered) if (entry.value > maxMoveValue) maxMoveValue = entry.value;
      if (firstLayerOrder === null) firstLayerOrder = ordered;
      expandedContexts += 1;

      for (const entry of ordered) {
        const { column, landingCell } = entry;
        traversedEdges += 1;
        const child = kernel.advance(node.stateId, column);
        if (child === QN_ILLEGAL) {
          throw new Error(`frontier-ordered legal column ${column} resolved illegal at state ${node.stateId}`);
        }
        if (child === QN_TERMINAL_WIN) {
          terminalWins += 1;
          continue;
        }
        if (!Number.isInteger(child) || child < 0 || child >= kernel.states.count) {
          throw new Error(`frontier exploration produced invalid child ${child}`);
        }
        const childLiveLines = moveOrder.advanceSeed(node.liveLines, mover, landingCell);
        const contextKey = localContextKey(child, childLiveLines);
        if (seen.has(contextKey)) {
          duplicateContextEdges += 1;
          continue;
        }
        seen.add(contextKey);
        next.push(Object.freeze({
          stateId: child,
          path: Object.freeze([...node.path, column]),
          liveLines: childLiveLines,
        }));
      }
    }
    layer = next;
    reachedDepth = relativeDepth + 1;
  }

  const frontierCandidates = Object.freeze(layer.map((node) => Object.freeze({
    path: node.path,
    contextKey: semanticContextKey(kernel, node.stateId, node.liveLines, termScratch),
  })));

  return Object.freeze({
    kind: 'connect4-quotient-explore-fragment-v5',
    startPath,
    startContextKey: semanticContextKey(kernel, start.stateId, start.liveLines, termScratch),
    requestedDepth: maxDepth,
    reachedDepth,
    ordering: 'dynamic-live-winning-line-frontier',
    contextIdentity: 'exact_q_semantic_content_plus_exact_live_line_frontier',
    firstLayerOrder: firstLayerOrder ?? Object.freeze([]),
    uniqueContexts: seen.size,
    expandedContexts,
    traversedEdges,
    duplicateContextEdges,
    terminalWins,
    tacticalClosed,
    forcedNodes,
    orderedNodes,
    scoredMoves,
    maxMoveValue,
    frontierCandidates,
  });
}
