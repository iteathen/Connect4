import {
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
  TACTICAL_DRAW,
  TACTICAL_LOSS,
  TACTICAL_IMMEDIATE_BASE,
  applyFrontierBoundCode,
  assertSearchWindow,
  assertTacticalCode,
  assertWdlInterval,
  assertWdlValue,
  tacticalForcedColumn,
  tacticalImmediateColumn,
} from './quotient-negamax-domain-contract.mjs';

const MAX_FRONTIER_SCORE = 0x7fff;

function assertPort(port) {
  if (!port || typeof port !== 'object') throw new TypeError('quotient Negamax port must be an object');
  if (!Number.isSafeInteger(port.columns) || port.columns < 1 || port.columns > 7) {
    throw new RangeError(`quotient Negamax columns must be in 1..7, got ${port.columns}`);
  }
  if (!Number.isSafeInteger(port.cellCount) || port.cellCount < 1 || port.cellCount > 64) {
    throw new RangeError(`quotient Negamax cellCount must be in 1..64, got ${port.cellCount}`);
  }
  if (!Number.isSafeInteger(port.rootId) || port.rootId < 0) throw new RangeError('quotient Negamax rootId must be non-negative');
  if (!Array.isArray(port.centerOrder) || port.centerOrder.length !== port.columns) {
    throw new TypeError('quotient Negamax centerOrder must enumerate every column');
  }
  const seen = new Set();
  for (const column of port.centerOrder) {
    if (!Number.isSafeInteger(column) || column < 0 || column >= port.columns || seen.has(column)) {
      throw new Error(`invalid center-order column ${column}`);
    }
    seen.add(column);
  }
  for (const name of ['rankAt', 'isLegal', 'transition', 'tacticalCode']) {
    if (typeof port[name] !== 'function') throw new TypeError(`quotient Negamax port.${name} must be a function`);
  }
  if (port.rankAt(port.rootId) !== 0) throw new Error('quotient Negamax root must have rank zero');
  const proofStore = port.proofStore;
  if (!proofStore || typeof proofStore !== 'object') throw new TypeError('quotient Negamax proofStore is required');
  for (const name of ['readInto', 'lower', 'upper', 'bestMove', 'publishExact', 'publishLower', 'publishUpper']) {
    if (typeof proofStore[name] !== 'function') throw new TypeError(`quotient Negamax proofStore.${name} must be a function`);
  }
}

function createProofAccess(port, metrics, columns) {
  const { proofStore } = port;
  const proofKey = port.proofKey ?? ((stateId) => stateId);
  const ensureProofKey = port.ensureProofKey ?? proofKey;
  // Ephemeral read scratch; callers copy scalars before recursion or await.
  const snapshot = new Float64Array(3);

  function assertKey(key, label, allowMiss = true) {
    const minimum = allowMiss ? -1 : 0;
    if (!Number.isSafeInteger(key) || key < minimum) throw new Error(`${label} returned invalid proof key ${key}`);
    return key;
  }

  function probe(stateId) {
    const key = assertKey(proofKey(stateId), 'proof probe');
    if (key < 0) metrics.proofProbeMisses += 1;
    return key;
  }

  function ensure(stateId, key) {
    if (key >= 0) return key;
    metrics.proofAdmissions += 1;
    return assertKey(ensureProofKey(stateId), 'proof ensure', false);
  }

  function read(key) {
    if (key < 0) { snapshot[0] = -1; snapshot[1] = 1; snapshot[2] = -1; }
    else proofStore.readInto(key, snapshot);
    assertWdlInterval(snapshot[0], snapshot[1], 'proof read interval');
    const hint = snapshot[2];
    if (!Number.isSafeInteger(hint) || hint < -1 || hint >= columns) {
      throw new Error('proof read move hint is outside the column domain');
    }
    return snapshot;
  }

  function upper(key) {
    if (key < 0) return 1;
    return assertWdlValue(proofStore.upper(key), 'proof upper');
  }

  function assertPublication(value, bestMoveValue) {
    assertWdlValue(value, 'proof publication value');
    if (!Number.isSafeInteger(bestMoveValue) || bestMoveValue < -1 || bestMoveValue >= columns) {
      throw new RangeError(`proof publication best move must be -1..${columns - 1}, got ${bestMoveValue}`);
    }
  }

  function publishExact(stateId, key, value, bestMoveValue = -1) {
    assertPublication(value, bestMoveValue);
    proofStore.publishExact(ensure(stateId, key), value, bestMoveValue);
  }

  function publishLower(stateId, key, value, bestMoveValue = -1) {
    assertPublication(value, bestMoveValue);
    proofStore.publishLower(ensure(stateId, key), value, bestMoveValue);
  }

  function publishUpper(stateId, key, value, bestMoveValue = -1) {
    assertPublication(value, bestMoveValue);
    proofStore.publishUpper(ensure(stateId, key), value, bestMoveValue);
  }

  return Object.freeze({ probe, read, upper, publishExact, publishLower, publishUpper });
}

function frontierBoundsFor(port, stateId, lower, upper, target) {
  if (typeof port.frontierBoundCode !== 'function') return false;
  return applyFrontierBoundCode(port.frontierBoundCode(stateId), lower, upper, target);
}

function classifyBoundReturn(metrics, key, structuralNarrowed, proofCut) {
  if (structuralNarrowed && !proofCut) metrics.frontierBoundCuts += 1;
  else if (key >= 0) metrics.ttBoundReturns += 1;
  else metrics.domainBoundCuts += 1;
}

function assertTransitionResult(result, stateId, column) {
  if (!Number.isSafeInteger(result) || result < QN_ILLEGAL) {
    throw new Error(`transition ${stateId}/${column} returned invalid target ${result}`);
  }
  return result;
}

function requireLegalTransition(result, stateId, column) {
  assertTransitionResult(result, stateId, column);
  if (result === QN_ILLEGAL) {
    throw new Error(`column ${column} was reported legal at state ${stateId} but transition returned QN_ILLEGAL`);
  }
  return result;
}

function assertRank(rank, cellCount, stateId) {
  if (!Number.isSafeInteger(rank) || rank < 0 || rank > cellCount) {
    throw new Error(`rankAt(${stateId}) returned invalid rank ${rank}`);
  }
  return rank;
}

function checkedTransition(port, stateId, column) {
  const child = assertTransitionResult(port.transition(stateId, column), stateId, column);
  if (child >= 0) {
    const parentRank = assertRank(port.rankAt(stateId), port.cellCount, stateId);
    const childRank = assertRank(port.rankAt(child), port.cellCount, child);
    if (childRank !== parentRank + 1) throw new Error(`transition ${stateId}/${column} rank drift: ${parentRank} -> ${childRank}`);
  }
  return child;
}

function failureError(reason) {
  return reason instanceof Error ? reason : new Error('dependency work rejected without an Error', { cause: reason });
}

function createLegalAccess(isLegal, columns) {
  return (stateId, column) => {
    if (!Number.isSafeInteger(column) || column < 0 || column >= columns) return false;
    const legal = isLegal(stateId, column);
    if (typeof legal !== 'boolean') throw new TypeError(`isLegal(${stateId}, ${column}) must return boolean`);
    return legal;
  };
}

function assertFrontierOrder(frontierOrder, landingCellAt, mode) {
  if (frontierOrder === null) return 0;
  if (typeof landingCellAt !== 'function'
      || typeof frontierOrder.createRootSeed !== 'function'
      || !Number.isSafeInteger(frontierOrder.profile?.stateWords)
      || frontierOrder.profile.stateWords < 1) {
    throw new TypeError(`${mode} frontier order must expose a complete profile and landing access`);
  }
  if (mode === 'stack') {
    if (typeof frontierOrder.advanceInto !== 'function' || typeof frontierOrder.valueAtStack !== 'function') {
      throw new TypeError('stack frontier order must expose advanceInto/valueAtStack');
    }
  } else if (typeof frontierOrder.advanceSeed !== 'function' || typeof frontierOrder.valueAtSeed !== 'function') {
    throw new TypeError('dependency frontier order must expose advanceSeed/valueAtSeed');
  }
  return frontierOrder.profile.stateWords;
}

function assertFrontierSeed(seed, words, label) {
  if (!(seed instanceof Uint32Array) || seed.length !== words) {
    throw new TypeError(`${label} must be Uint32Array(${words})`);
  }
  return seed;
}

function assertFrontierScore(score, label) {
  if (!Number.isSafeInteger(score) || score < 0 || score > MAX_FRONTIER_SCORE) {
    throw new RangeError(`${label} must be an integer in 0..${MAX_FRONTIER_SCORE}, got ${score}`);
  }
  return score;
}

function frontierComesBefore(leftScore, leftColumn, rightScore, rightColumn, proofBest) {
  if (leftScore !== rightScore) return leftScore > rightScore;
  const leftProof = leftColumn === proofBest;
  const rightProof = rightColumn === proofBest;
  if (leftProof !== rightProof) return leftProof;
  return leftColumn < rightColumn;
}

function legalProofHint(best, stateId, legalAt, metrics) {
  if (best >= 0 && legalAt(stateId, best)) {
    metrics.ttMoveOrderHits += 1;
    return best;
  }
  return -1;
}

export function createQuotientNegamaxEngine(port, config = {}) {
  assertPort(port);
  const {
    columns,
    cellCount,
    rootId,
    centerOrder,
    rankAt,
    isLegal,
    tacticalCode,
  } = port;
  const legalAt = createLegalAccess(isLegal, columns);
  const frontierOrder = port.frontierOrder ?? null;
  const landingCellAt = port.landingCellAt ?? null;
  const frontierWords = assertFrontierOrder(frontierOrder, landingCellAt, 'stack');
  const hasFrontierOrder = frontierOrder !== null;
  const etc = config.etc !== false;
  const etcMinRemaining = config.etcMinRemaining ?? 0;
  const wdlMode = config.wdlMode ?? 'full';
  if (!Number.isSafeInteger(etcMinRemaining) || etcMinRemaining < 0 || etcMinRemaining > cellCount) {
    throw new RangeError(`etcMinRemaining must be an integer in 0..${cellCount}`);
  }
  if (wdlMode !== 'full' && wdlMode !== 'threshold') throw new RangeError('wdlMode must be full or threshold');

  const moveStack = new Int8Array((cellCount + 1) * columns);
  const moveScores = hasFrontierOrder ? new Int16Array((cellCount + 1) * columns) : null;
  const frontierStack = hasFrontierOrder ? new Uint32Array((cellCount + 1) * frontierWords) : null;
  const rootFrontierSeed = hasFrontierOrder
    ? assertFrontierSeed(frontierOrder.createRootSeed(), frontierWords, 'root live-line frontier seed')
    : null;
  const metrics = {
    calls: 0,
    expanded: 0,
    ttExactReturns: 0,
    ttBoundReturns: 0,
    domainBoundCuts: 0,
    ttMoveOrderHits: 0,
    cutoffs: 0,
    firstMoveCutoffs: 0,
    tacticalExact: 0,
    forcedNodes: 0,
    forcedMacroChains: 0,
    forcedMacroTransitions: 0,
    frontierBoundCuts: 0,
    frontierOrderedNodes: 0,
    etcProbes: 0,
    etcCutoffs: 0,
    thresholdPasses: 0,
    transitionsRequested: 0,
    proofProbeMisses: 0,
    proofAdmissions: 0,
  };
  const proof = createProofAccess(port, metrics, columns);

  function transition(stateId, column) {
    metrics.transitionsRequested += 1;
    return checkedTransition(port, stateId, column);
  }

  function initializeFrontier(stateId, frontierSeed) {
    const rank = assertRank(rankAt(stateId), cellCount, stateId);
    if (!hasFrontierOrder) return rank;
    const offset = rank * frontierWords;
    if (frontierSeed === undefined || frontierSeed === null) {
      if (rank !== 0) throw new Error('non-root quotient search requires live-line frontier seed');
      frontierStack.set(rootFrontierSeed, offset);
      return rank;
    }
    assertFrontierSeed(frontierSeed, frontierWords, 'live-line frontier seed');
    frontierStack.set(frontierSeed, offset);
    return rank;
  }

  function landingForLegalMove(stateId, column) {
    const landingCell = landingCellAt(stateId, column);
    if (!Number.isSafeInteger(landingCell) || landingCell < 0 || landingCell >= cellCount) {
      throw new Error(`landingCellAt(${stateId}, ${column}) returned invalid legal landing cell ${landingCell}`);
    }
    return landingCell;
  }

  function advanceFrontier(stateId, column, rank) {
    if (!hasFrontierOrder) return;
    const landingCell = landingForLegalMove(stateId, column);
    frontierOrder.advanceInto(
      frontierStack,
      rank * frontierWords,
      rank & 1,
      landingCell,
      frontierStack,
      (rank + 1) * frontierWords,
    );
  }

  function prepareMoves(stateId, proofHint, forcedColumn, rank) {
    const base = rank * columns;
    if (forcedColumn >= 0) {
      if (!legalAt(stateId, forcedColumn)) throw new Error(`forced tactical column ${forcedColumn} is not legal at state ${stateId}`);
      moveStack[base] = forcedColumn;
      metrics.forcedNodes += 1;
      return 1;
    }

    if (hasFrontierOrder) {
      const frontierOffset = rank * frontierWords;
      const mover = rank & 1;
      const proofBest = legalProofHint(proofHint, stateId, legalAt, metrics);
      let count = 0;
      for (let column = 0; column < columns; column += 1) {
        if (!legalAt(stateId, column)) continue;
        const landingCell = landingForLegalMove(stateId, column);
        const score = assertFrontierScore(
          frontierOrder.valueAtStack(frontierStack, frontierOffset, mover, landingCell),
          'frontier score',
        );
        let at = count;
        while (at > 0) {
          const previousScore = moveScores[base + at - 1];
          const previousColumn = moveStack[base + at - 1];
          if (frontierComesBefore(previousScore, previousColumn, score, column, proofBest)) break;
          moveScores[base + at] = previousScore;
          moveStack[base + at] = previousColumn;
          at -= 1;
        }
        moveScores[base + at] = score;
        moveStack[base + at] = column;
        count += 1;
      }
      metrics.frontierOrderedNodes += 1;
      return count;
    }

    let count = 0;
    const best = legalProofHint(proofHint, stateId, legalAt, metrics);
    if (best >= 0) moveStack[base + count++] = best;
    for (const column of centerOrder) {
      if (column === best || !legalAt(stateId, column)) continue;
      moveStack[base + count++] = column;
    }
    return count;
  }

  function publishResult(stateId, key, value, selected, originalAlpha, originalBeta) {
    assertWdlValue(value, 'search result');
    if (value <= originalAlpha) proof.publishUpper(stateId, key, value, selected);
    else if (value >= originalBeta) proof.publishLower(stateId, key, value, selected);
    else proof.publishExact(stateId, key, value, selected);
  }

  function searchNode(startStateId, startAlpha, startBeta, startRank) {
    let stateId = startStateId;
    let alpha = startAlpha;
    let beta = startBeta;
    let rank = startRank;
    let sign = 1;
    let forcedTransitions = 0;

    while (true) {
      metrics.calls += 1;
      const key = proof.probe(stateId);
      const proofSnapshot = proof.read(key);
      const proofLower = proofSnapshot[0];
      const proofUpper = proofSnapshot[1];
      const proofHint = proofSnapshot[2];
      const proofExact = proofLower === proofUpper;
      const proofLowerCut = proofLower >= beta;
      const proofUpperCut = proofUpper <= alpha;
      const structuralNarrowed = frontierBoundsFor(port, stateId, proofLower, proofUpper, proofSnapshot);
      const lower = proofSnapshot[0];
      const upper = proofSnapshot[1];

      if (lower === upper) {
        if (proofExact && key >= 0) metrics.ttExactReturns += 1;
        else if (structuralNarrowed && !proofExact) metrics.frontierBoundCuts += 1;
        else if (key < 0) metrics.domainBoundCuts += 1;
        else metrics.ttExactReturns += 1;
        if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
        return sign * lower;
      }
      if (lower >= beta) {
        classifyBoundReturn(metrics, key, structuralNarrowed, proofLowerCut);
        if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
        return sign * lower;
      }
      if (upper <= alpha) {
        classifyBoundReturn(metrics, key, structuralNarrowed, proofUpperCut);
        if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
        return sign * upper;
      }

      const tactical = tacticalCode(stateId);
      assertTacticalCode(tactical, columns);
      if (tactical >= TACTICAL_IMMEDIATE_BASE) {
        proof.publishExact(stateId, key, 1, tacticalImmediateColumn(tactical));
        metrics.tacticalExact += 1;
        if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
        return sign;
      }
      if (tactical === TACTICAL_LOSS) {
        proof.publishExact(stateId, key, -1);
        metrics.tacticalExact += 1;
        if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
        return -sign;
      }
      if (tactical === TACTICAL_DRAW) {
        proof.publishExact(stateId, key, 0);
        metrics.tacticalExact += 1;
        if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
        return 0;
      }

      const originalAlpha = alpha;
      const originalBeta = beta;
      alpha = Math.max(alpha, lower);
      beta = Math.min(beta, upper);
      const forcedColumn = tacticalForcedColumn(tactical, columns);
      if (forcedColumn >= 0) {
        metrics.forcedNodes += 1;
        metrics.forcedMacroTransitions += 1;
        forcedTransitions += 1;
        const child = requireLegalTransition(transition(stateId, forcedColumn), stateId, forcedColumn);
        if (child === QN_TERMINAL_WIN) {
          proof.publishExact(stateId, key, 1, forcedColumn);
          metrics.tacticalExact += 1;
          metrics.forcedMacroChains += 1;
          return sign;
        }
        advanceFrontier(stateId, forcedColumn, rank);
        const nextAlpha = -beta;
        const nextBeta = -alpha;
        stateId = child;
        rank += 1;
        sign = -sign;
        alpha = nextAlpha;
        beta = nextBeta;
        continue;
      }

      if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
      const moveCount = prepareMoves(stateId, proofHint, -1, rank);
      if (moveCount === 0) throw new Error(`non-tactical quotient state ${stateId} has no legal moves`);
      const base = rank * columns;
      const remaining = cellCount - rank;
      const etcActive = etc && remaining >= etcMinRemaining;
      if (etcActive) {
        for (let index = 0; index < moveCount; index += 1) {
          const column = moveStack[base + index];
          const child = requireLegalTransition(transition(stateId, column), stateId, column);
          if (child === QN_TERMINAL_WIN) {
            proof.publishExact(stateId, key, 1, column);
            metrics.etcCutoffs += 1;
            return sign;
          }
          metrics.etcProbes += 1;
          const childKey = proof.probe(child);
          const parentLower = -proof.upper(childKey);
          assertWdlValue(parentLower, 'ETC parent lower');
          if (parentLower >= beta) {
            proof.publishLower(stateId, key, parentLower, column);
            metrics.etcCutoffs += 1;
            return sign * parentLower;
          }
        }
      }

      metrics.expanded += 1;
      let value = -2;
      let selected = -1;
      for (let index = 0; index < moveCount; index += 1) {
        const column = moveStack[base + index];
        const child = requireLegalTransition(transition(stateId, column), stateId, column);
        let score;
        if (child === QN_TERMINAL_WIN) score = 1;
        else {
          advanceFrontier(stateId, column, rank);
          score = -searchNode(child, -beta, -alpha, rank + 1);
        }
        assertWdlValue(score, 'child score');
        if (score > value) {
          value = score;
          selected = column;
        }
        if (value > alpha) alpha = value;
        if (alpha >= beta) {
          metrics.cutoffs += 1;
          if (index === 0) metrics.firstMoveCutoffs += 1;
          break;
        }
      }

      publishResult(stateId, key, value, selected, originalAlpha, originalBeta);
      return sign * value;
    }
  }

  function search(stateId, alpha, beta, frontierSeed = null) {
    assertSearchWindow(alpha, beta);
    const rank = initializeFrontier(stateId, frontierSeed);
    return searchNode(stateId, alpha, beta, rank);
  }

  function solveState(stateId, frontierSeed = null) {
    return search(stateId, -2, 2, frontierSeed);
  }

  function solveRoot() {
    if (wdlMode === 'threshold') {
      let value = search(rootId, 0, 1);
      metrics.thresholdPasses += 1;
      if (value >= 1) return 1;
      value = search(rootId, -1, 0);
      metrics.thresholdPasses += 1;
      return value >= 0 ? 0 : -1;
    }
    return search(rootId, -2, 2);
  }

  function solveRootColumn(column) {
    if (!legalAt(rootId, column)) return null;
    const rank = initializeFrontier(rootId, null);
    const child = requireLegalTransition(transition(rootId, column), rootId, column);
    if (child === QN_TERMINAL_WIN) return 1;
    advanceFrontier(rootId, column, rank);
    const childSeed = hasFrontierOrder
      ? frontierStack.slice(frontierWords, frontierWords * 2)
      : null;
    const value = -search(child, -2, 2, childSeed);
    return value === 0 ? 0 : value;
  }

  function rootActionValues() {
    const values = Array(columns).fill(null);
    for (let column = 0; column < columns; column += 1) values[column] = solveRootColumn(column);
    return values;
  }

  return Object.freeze({
    search,
    solveState,
    solveRoot,
    solveRootColumn,
    rootActionValues,
    run: solveRoot,
    metrics,
  });
}

export function createDependencyAwareQuotientNegamaxEngine(port, leafSearch, config = {}) {
  assertPort(port);
  const {
    columns,
    cellCount,
    rootId,
    centerOrder,
    rankAt,
    isLegal,
    tacticalCode,
  } = port;
  const legalAt = createLegalAccess(isLegal, columns);
  const frontierOrder = port.frontierOrder ?? null;
  const landingCellAt = port.landingCellAt ?? null;
  const frontierWords = assertFrontierOrder(frontierOrder, landingCellAt, 'dependency');
  const hasFrontierOrder = frontierOrder !== null;
  const splitDepth = config.splitDepth ?? 3;
  const priorityAt = config.priorityAt ?? (() => 0);
  if (!Number.isSafeInteger(splitDepth) || splitDepth < 1 || splitDepth > cellCount) {
    throw new RangeError(`splitDepth must be an integer in 1..${cellCount}`);
  }
  if (typeof leafSearch !== 'function') throw new TypeError('leafSearch must be a function');
  if (typeof priorityAt !== 'function') throw new TypeError('priorityAt must be a function');

  const metrics = {
    calls: 0,
    shallowExpanded: 0,
    ttExactReturns: 0,
    ttBoundReturns: 0,
    domainBoundCuts: 0,
    ttMoveOrderHits: 0,
    tacticalExact: 0,
    cutoffs: 0,
    firstMoveCutoffs: 0,
    transitionsRequested: 0,
    leafTasks: 0,
    scoutTasks: 0,
    reSearches: 0,
    parallelBatches: 0,
    incrementalScoutCompletions: 0,
    detachedScoutTasks: 0,
    detachedBatches: 0,
    workerCalls: 0,
    workerExpanded: 0,
    forcedNodes: 0,
    forcedMacroChains: 0,
    forcedMacroTransitions: 0,
    frontierBoundCuts: 0,
    frontierOrderedNodes: 0,
    proofProbeMisses: 0,
    proofAdmissions: 0,
  };
  const proof = createProofAccess(port, metrics, columns);
  const rootFrontierSeed = hasFrontierOrder
    ? assertFrontierSeed(frontierOrder.createRootSeed(), frontierWords, 'dependency root frontier seed')
    : null;
  const background = new Set();
  let backgroundError = null;

  function trackDetached(promises) {
    if (!Array.isArray(promises) || promises.length === 0) return;
    metrics.detachedBatches += 1;
    metrics.detachedScoutTasks += promises.length;
    const observed = promises.map((promise) => Promise.resolve(promise).catch((error) => {
      backgroundError ??= failureError(error);
      throw backgroundError;
    }));
    let tracked;
    tracked = Promise.allSettled(observed).finally(() => background.delete(tracked));
    background.add(tracked);
  }

  async function drainBackground() {
    while (background.size > 0) await Promise.all([...background]);
    if (backgroundError) throw backgroundError;
  }

  function transition(stateId, column) {
    metrics.transitionsRequested += 1;
    return checkedTransition(port, stateId, column);
  }

  function rankFor(stateId) {
    return assertRank(rankAt(stateId), cellCount, stateId);
  }

  function landingForLegalMove(stateId, column) {
    const landingCell = landingCellAt(stateId, column);
    if (!Number.isSafeInteger(landingCell) || landingCell < 0 || landingCell >= cellCount) {
      throw new Error(`landingCellAt(${stateId}, ${column}) returned invalid legal landing cell ${landingCell}`);
    }
    return landingCell;
  }

  function nextFrontierSeed(stateId, column, rank, seed) {
    if (!hasFrontierOrder) return null;
    assertFrontierSeed(seed, frontierWords, 'dependency frontier seed');
    const landingCell = landingForLegalMove(stateId, column);
    return assertFrontierSeed(
      frontierOrder.advanceSeed(seed, rank & 1, landingCell),
      frontierWords,
      'frontierOrder.advanceSeed result',
    );
  }

  function orderedMoves(stateId, proofHint, forcedColumn, rank, frontierSeed) {
    if (forcedColumn >= 0) {
      if (!legalAt(stateId, forcedColumn)) throw new Error(`forced tactical column ${forcedColumn} is not legal at state ${stateId}`);
      return [forcedColumn];
    }
    if (hasFrontierOrder) {
      assertFrontierSeed(frontierSeed, frontierWords, 'dependency frontier ordering seed');
      const proofBest = legalProofHint(proofHint, stateId, legalAt, metrics);
      const scored = [];
      const mover = rank & 1;
      for (let column = 0; column < columns; column += 1) {
        if (!legalAt(stateId, column)) continue;
        const landingCell = landingForLegalMove(stateId, column);
        const score = assertFrontierScore(
          frontierOrder.valueAtSeed(frontierSeed, mover, landingCell),
          'dependency frontier score',
        );
        scored.push({ column, value: score });
      }
      scored.sort((left, right) => {
        if (left.value !== right.value) return right.value - left.value;
        const leftProof = left.column === proofBest;
        const rightProof = right.column === proofBest;
        if (leftProof !== rightProof) return leftProof ? -1 : 1;
        return left.column - right.column;
      });
      metrics.frontierOrderedNodes += 1;
      return scored.map((entry) => entry.column);
    }
    const moves = [];
    const best = legalProofHint(proofHint, stateId, legalAt, metrics);
    if (best >= 0) moves.push(best);
    for (const column of centerOrder) {
      if (column === best || !legalAt(stateId, column)) continue;
      moves.push(column);
    }
    return moves;
  }

  function publishResult(stateId, key, value, selected, originalAlpha, originalBeta) {
    assertWdlValue(value, 'dependency result');
    if (value <= originalAlpha) proof.publishUpper(stateId, key, value, selected);
    else if (value >= originalBeta) proof.publishLower(stateId, key, value, selected);
    else proof.publishExact(stateId, key, value, selected);
  }

  async function runLeaf(stateId, alpha, beta) {
    metrics.leafTasks += 1;
    const priority = priorityAt(stateId);
    if (!Number.isFinite(priority)) throw new Error(`priorityAt(${stateId}) returned non-finite priority ${priority}`);
    const result = await leafSearch(stateId, alpha, beta, priority);
    let value;
    if (result && typeof result === 'object') {
      const calls = result.metrics?.calls ?? 0;
      const expanded = result.metrics?.expanded ?? 0;
      if (!Number.isSafeInteger(calls) || calls < 0 || !Number.isSafeInteger(expanded) || expanded < 0) {
        throw new Error('leaf telemetry must contain non-negative safe-integer calls/expanded counters');
      }
      metrics.workerCalls += calls;
      metrics.workerExpanded += expanded;
      value = result.value;
    } else value = result;
    return assertWdlValue(value, `leaf result for state ${stateId}`);
  }

  async function search(startStateId, startAlpha, startBeta, decisionDepth = 0, frontierSeed = null) {
    if (backgroundError) throw backgroundError;
    assertSearchWindow(startAlpha, startBeta, 'dependency search window');
    if (!Number.isSafeInteger(decisionDepth) || decisionDepth < 0 || decisionDepth > cellCount) {
      throw new RangeError(`decisionDepth must be an integer in 0..${cellCount}`);
    }
    let stateId = startStateId;
    let alpha = startAlpha;
    let beta = startBeta;
    let rank = rankFor(stateId);
    let seed = frontierSeed;
    if (hasFrontierOrder && seed === null) {
      if (rank !== 0) throw new Error('non-root dependency search requires live-line frontier seed');
      seed = rootFrontierSeed;
    }
    if (hasFrontierOrder) assertFrontierSeed(seed, frontierWords, 'dependency frontier seed');
    let sign = 1;
    let forcedTransitions = 0;

    while (true) {
      metrics.calls += 1;
      const key = proof.probe(stateId);
      const proofSnapshot = proof.read(key);
      const proofLower = proofSnapshot[0];
      const proofUpper = proofSnapshot[1];
      const proofHint = proofSnapshot[2];
      const proofExact = proofLower === proofUpper;
      const proofLowerCut = proofLower >= beta;
      const proofUpperCut = proofUpper <= alpha;
      const structuralNarrowed = frontierBoundsFor(port, stateId, proofLower, proofUpper, proofSnapshot);
      const lower = proofSnapshot[0];
      const upper = proofSnapshot[1];
      if (lower === upper) {
        if (proofExact && key >= 0) metrics.ttExactReturns += 1;
        else if (structuralNarrowed && !proofExact) metrics.frontierBoundCuts += 1;
        else if (key < 0) metrics.domainBoundCuts += 1;
        else metrics.ttExactReturns += 1;
        if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
        return sign * lower;
      }
      if (lower >= beta) {
        classifyBoundReturn(metrics, key, structuralNarrowed, proofLowerCut);
        if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
        return sign * lower;
      }
      if (upper <= alpha) {
        classifyBoundReturn(metrics, key, structuralNarrowed, proofUpperCut);
        if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
        return sign * upper;
      }

      const tactical = tacticalCode(stateId);
      assertTacticalCode(tactical, columns);
      if (tactical >= TACTICAL_IMMEDIATE_BASE) {
        proof.publishExact(stateId, key, 1, tacticalImmediateColumn(tactical));
        metrics.tacticalExact += 1;
        if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
        return sign;
      }
      if (tactical === TACTICAL_LOSS) {
        proof.publishExact(stateId, key, -1);
        metrics.tacticalExact += 1;
        if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
        return -sign;
      }
      if (tactical === TACTICAL_DRAW) {
        proof.publishExact(stateId, key, 0);
        metrics.tacticalExact += 1;
        if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
        return 0;
      }

      const originalAlpha = alpha;
      const originalBeta = beta;
      alpha = Math.max(alpha, lower);
      beta = Math.min(beta, upper);
      const forcedColumn = tacticalForcedColumn(tactical, columns);
      if (forcedColumn >= 0) {
        metrics.forcedNodes += 1;
        metrics.forcedMacroTransitions += 1;
        forcedTransitions += 1;
        const child = requireLegalTransition(transition(stateId, forcedColumn), stateId, forcedColumn);
        if (child === QN_TERMINAL_WIN) {
          proof.publishExact(stateId, key, 1, forcedColumn);
          metrics.tacticalExact += 1;
          metrics.forcedMacroChains += 1;
          return sign;
        }
        const nextSeed = hasFrontierOrder ? nextFrontierSeed(stateId, forcedColumn, rank, seed) : null;
        const nextAlpha = -beta;
        const nextBeta = -alpha;
        stateId = child;
        rank += 1;
        seed = nextSeed;
        sign = -sign;
        alpha = nextAlpha;
        beta = nextBeta;
        continue;
      }

      if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
      if (decisionDepth >= splitDepth) return sign * await runLeaf(stateId, alpha, beta);

      const moves = orderedMoves(stateId, proofHint, -1, rank, seed);
      if (moves.length === 0) throw new Error(`non-tactical quotient state ${stateId} has no legal moves`);
      metrics.shallowExpanded += 1;

      let value = -2;
      let selected = -1;
      const firstColumn = moves[0];
      const firstChild = requireLegalTransition(transition(stateId, firstColumn), stateId, firstColumn);
      const firstSeed = firstChild >= 0 && hasFrontierOrder
        ? nextFrontierSeed(stateId, firstColumn, rank, seed)
        : null;
      const firstScore = firstChild === QN_TERMINAL_WIN
        ? 1
        : -await search(firstChild, -beta, -alpha, decisionDepth + 1, firstSeed);
      assertWdlValue(firstScore, `first child score for state ${stateId}/${firstColumn}`);
      value = firstScore;
      selected = firstColumn;
      if (value > alpha) alpha = value;
      if (alpha >= beta) {
        metrics.cutoffs += 1;
        metrics.firstMoveCutoffs += 1;
        publishResult(stateId, key, value, selected, originalAlpha, originalBeta);
        return sign * value;
      }

      if (moves.length > 1) {
        const scoutAlpha = alpha;
        const siblings = [];
        let pending = null;
        try {
          for (let index = 1; index < moves.length; index += 1) {
            const column = moves[index];
            const child = requireLegalTransition(transition(stateId, column), stateId, column);
            if (child === QN_TERMINAL_WIN) {
              siblings.push({ column, child, terminal: true, seed: null, promise: Promise.resolve(-1) });
              continue;
            }
            const childSeed = hasFrontierOrder ? nextFrontierSeed(stateId, column, rank, seed) : null;
            metrics.scoutTasks += 1;
            siblings.push({
              column,
              child,
              terminal: false,
              seed: childSeed,
              promise: search(child, -scoutAlpha - 1, -scoutAlpha, decisionDepth + 1, childSeed),
            });
          }
          if (siblings.length > 0) metrics.parallelBatches += 1;

          pending = new Map();
          for (let index = 0; index < siblings.length; index += 1) {
            const entry = siblings[index];
            pending.set(index, entry.promise.then(
              (result) => ({ index, result, ok: true }),
              (error) => ({ index, error: failureError(error), ok: false }),
            ));
          }

          while (pending.size > 0) {
            const settled = await Promise.race(pending.values());
            pending.delete(settled.index);
            if (!settled.ok) {
              throw settled.error;
            }

            metrics.incrementalScoutCompletions += 1;
            const entry = siblings[settled.index];
            let score = entry.terminal ? 1 : -settled.result;
            assertWdlValue(score, `scout score for state ${stateId}/${entry.column}`);
            if (score > alpha && score < beta && !entry.terminal) {
              metrics.reSearches += 1;
              score = -await search(entry.child, -beta, -alpha, decisionDepth + 1, entry.seed);
              assertWdlValue(score, `re-search score for state ${stateId}/${entry.column}`);
            }
            if (score > value) {
              value = score;
              selected = entry.column;
            }
            if (value > alpha) alpha = value;
            if (alpha >= beta) {
              metrics.cutoffs += 1;
              break;
            }
          }
        } finally {
          // Every exit, including construction/validation/re-search failure, keeps
          // unfinished scouts owned until their lifecycle completion is observed.
          trackDetached(pending === null
            ? siblings.map((entry) => entry.promise)
            : [...pending.keys()].map((index) => siblings[index].promise));
        }
      }

      publishResult(stateId, key, value, selected, originalAlpha, originalBeta);
      return sign * value;
    }
  }

  async function solveRoot() {
    return search(rootId, -2, 2, 0, hasFrontierOrder ? rootFrontierSeed : null);
  }

  async function solveRootColumn(column) {
    if (!legalAt(rootId, column)) return null;
    const child = requireLegalTransition(transition(rootId, column), rootId, column);
    if (child === QN_TERMINAL_WIN) return 1;
    const childSeed = hasFrontierOrder ? nextFrontierSeed(rootId, column, 0, rootFrontierSeed) : null;
    const value = -(await search(child, -2, 2, 1, childSeed));
    return value === 0 ? 0 : value;
  }

  async function rootActionValues() {
    await drainBackground();
    const values = Array(columns).fill(null);
    for (let column = 0; column < columns; column += 1) values[column] = await solveRootColumn(column);
    await drainBackground();
    return values;
  }

  return Object.freeze({
    search,
    solveRoot,
    solveRootColumn,
    rootActionValues,
    drainBackground,
    metrics,
  });
}
