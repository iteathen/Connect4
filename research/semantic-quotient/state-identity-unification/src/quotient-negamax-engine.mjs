import {
  FRONTIER_BOUND_DRAW,
  FRONTIER_BOUND_MOVER_NO_WIN,
  FRONTIER_BOUND_NONE,
  FRONTIER_BOUND_OPPONENT_NO_WIN,
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
  TACTICAL_DRAW,
  TACTICAL_LOSS,
  TACTICAL_IMMEDIATE_BASE,
  assertTacticalCode,
  tacticalForcedColumn,
  tacticalImmediateColumn,
} from './quotient-negamax-domain-contract.mjs';

function applyFrontierBound(code, lower, upper) {
  if (code === FRONTIER_BOUND_NONE) return [lower, upper];
  if (code === FRONTIER_BOUND_MOVER_NO_WIN) return [lower, Math.min(upper, 0)];
  if (code === FRONTIER_BOUND_OPPONENT_NO_WIN) return [Math.max(lower, 0), upper];
  if (code === FRONTIER_BOUND_DRAW) return [0, 0];
  throw new Error(`unexpected frontier bound code ${code}`);
}

function createProofAccess(port, metrics) {
  const { proofStore } = port;
  const proofKey = port.proofKey ?? ((stateId) => stateId);
  const ensureProofKey = port.ensureProofKey ?? proofKey;

  function probe(stateId) {
    const key = proofKey(stateId);
    if (key < 0) metrics.proofProbeMisses += 1;
    return key;
  }

  function ensure(stateId, key) {
    if (key >= 0) return key;
    metrics.proofAdmissions += 1;
    return ensureProofKey(stateId);
  }

  function lower(key) { return key < 0 ? -1 : proofStore.lower(key); }
  function upper(key) { return key < 0 ? 1 : proofStore.upper(key); }
  function bestMove(key) { return key < 0 ? -1 : proofStore.bestMove(key); }

  function publishExact(stateId, key, value, bestMoveValue = -1) {
    proofStore.publishExact(ensure(stateId, key), value, bestMoveValue);
  }
  function publishLower(stateId, key, value, bestMoveValue = -1) {
    proofStore.publishLower(ensure(stateId, key), value, bestMoveValue);
  }
  function publishUpper(stateId, key, value, bestMoveValue = -1) {
    proofStore.publishUpper(ensure(stateId, key), value, bestMoveValue);
  }

  return Object.freeze({ probe, lower, upper, bestMove, publishExact, publishLower, publishUpper });
}

function frontierBoundsFor(port, stateId, lower, upper) {
  if (typeof port.frontierBoundCode !== 'function') return [lower, upper];
  return applyFrontierBound(port.frontierBoundCode(stateId), lower, upper);
}

export function createQuotientNegamaxEngine(port, config = {}) {
  const {
    columns,
    cellCount,
    rootId,
    centerOrder,
    rankAt,
    isLegal,
    transition: transitionPort,
    tacticalCode,
  } = port;
  const frontierOrder = port.frontierOrder ?? null;
  const landingCellAt = port.landingCellAt ?? null;
  const hasFrontierOrder = frontierOrder !== null && typeof landingCellAt === 'function';
  const etc = config.etc !== false;
  const etcMinRemaining = config.etcMinRemaining ?? 0;
  const wdlMode = config.wdlMode ?? 'full';
  if (wdlMode !== 'full' && wdlMode !== 'threshold') throw new RangeError('wdlMode must be full or threshold');

  const moveStack = new Int8Array((cellCount + 1) * columns);
  const moveScores = hasFrontierOrder ? new Int16Array((cellCount + 1) * columns) : null;
  const frontierWords = hasFrontierOrder ? frontierOrder.profile.stateWords : 0;
  const frontierStack = hasFrontierOrder ? new Uint32Array((cellCount + 1) * frontierWords) : null;
  const rootFrontierSeed = hasFrontierOrder ? frontierOrder.createRootSeed() : null;
  const metrics = {
    calls: 0,
    expanded: 0,
    ttExactReturns: 0,
    ttBoundReturns: 0,
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
  const proof = createProofAccess(port, metrics);

  function transition(stateId, column) {
    metrics.transitionsRequested += 1;
    return transitionPort(stateId, column);
  }

  function initializeFrontier(stateId, frontierSeed) {
    const rank = rankAt(stateId);
    if (!hasFrontierOrder) return rank;
    const offset = rank * frontierWords;
    if (frontierSeed === undefined || frontierSeed === null) {
      if (rank !== 0) throw new Error('non-root quotient search requires live-line frontier seed');
      frontierStack.set(rootFrontierSeed, offset);
      return rank;
    }
    if (!(frontierSeed instanceof Uint32Array) || frontierSeed.length !== frontierWords) {
      throw new TypeError(`live-line frontier seed must be Uint32Array(${frontierWords})`);
    }
    frontierStack.set(frontierSeed, offset);
    return rank;
  }

  function advanceFrontier(stateId, column, rank) {
    if (!hasFrontierOrder) return;
    const landingCell = landingCellAt(stateId, column);
    if (landingCell === 0xff) throw new Error(`cannot advance live-line frontier through illegal column ${column}`);
    frontierOrder.advanceInto(
      frontierStack,
      rank * frontierWords,
      rank & 1,
      landingCell,
      frontierStack,
      (rank + 1) * frontierWords,
    );
  }

  function prepareMoves(stateId, key, forcedColumn, rank) {
    const base = rank * columns;
    if (forcedColumn >= 0) {
      moveStack[base] = forcedColumn;
      metrics.forcedNodes += 1;
      return 1;
    }

    if (hasFrontierOrder) {
      const frontierOffset = rank * frontierWords;
      const mover = rank & 1;
      let count = 0;
      for (let column = 0; column < columns; column += 1) {
        if (!isLegal(stateId, column)) continue;
        const landingCell = landingCellAt(stateId, column);
        const score = frontierOrder.valueAtStack(frontierStack, frontierOffset, mover, landingCell);
        let at = count;
        while (at > 0) {
          const previousScore = moveScores[base + at - 1];
          const previousColumn = moveStack[base + at - 1];
          if (previousScore > score || (previousScore === score && previousColumn < column)) break;
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
    const best = proof.bestMove(key);
    if (best >= 0 && isLegal(stateId, best)) {
      moveStack[base + count++] = best;
      metrics.ttMoveOrderHits += 1;
    }
    for (const column of centerOrder) {
      if (column === best || !isLegal(stateId, column)) continue;
      moveStack[base + count++] = column;
    }
    return count;
  }

  function publishResult(stateId, key, value, selected, originalAlpha, originalBeta) {
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
      let lower = proof.lower(key);
      let upper = proof.upper(key);
      [lower, upper] = frontierBoundsFor(port, stateId, lower, upper);

      if (lower === upper) {
        if (key >= 0) metrics.ttExactReturns += 1;
        else metrics.frontierBoundCuts += 1;
        if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
        return sign * lower;
      }
      if (lower >= beta) {
        if (key >= 0) metrics.ttBoundReturns += 1;
        else metrics.frontierBoundCuts += 1;
        if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
        return sign * lower;
      }
      if (upper <= alpha) {
        if (key >= 0) metrics.ttBoundReturns += 1;
        else metrics.frontierBoundCuts += 1;
        if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
        return sign * upper;
      }

      const tactical = tacticalCode(stateId);
      assertTacticalCode(tactical, columns);
      if (tactical >= TACTICAL_IMMEDIATE_BASE) {
        const value = 1;
        proof.publishExact(stateId, key, value, tacticalImmediateColumn(tactical));
        metrics.tacticalExact += 1;
        if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
        return sign * value;
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
        const child = transition(stateId, forcedColumn);
        if (child === QN_TERMINAL_WIN) {
          proof.publishExact(stateId, key, 1, forcedColumn);
          metrics.tacticalExact += 1;
          metrics.forcedMacroChains += 1;
          return sign;
        }
        if (child < 0) throw new Error(`forced column ${forcedColumn} produced invalid child ${child}`);
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
      const moveCount = prepareMoves(stateId, key, -1, rank);
      if (moveCount === 0) throw new Error(`non-tactical quotient state ${stateId} has no legal moves`);
      const base = rank * columns;
      const remaining = cellCount - rank;
      const etcActive = etc && remaining >= etcMinRemaining;
      if (etcActive) {
        for (let index = 0; index < moveCount; index += 1) {
          const column = moveStack[base + index];
          const child = transition(stateId, column);
          if (child === QN_TERMINAL_WIN) {
            proof.publishExact(stateId, key, 1, column);
            metrics.etcCutoffs += 1;
            return sign;
          }
          if (child < 0) continue;
          metrics.etcProbes += 1;
          const childKey = proof.probe(child);
          const parentLower = -proof.upper(childKey);
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
        const child = transition(stateId, column);
        let score;
        if (child === QN_TERMINAL_WIN) {
          score = 1;
        } else {
          advanceFrontier(stateId, column, rank);
          score = -searchNode(child, -beta, -alpha, rank + 1);
        }
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
    const rank = initializeFrontier(stateId, frontierSeed);
    return searchNode(stateId, alpha, beta, rank);
  }

  function solveState(stateId, frontierSeed = null) {
    return search(stateId, -2, 2, frontierSeed);
  }

  function solveRoot() {
    if (wdlMode === 'threshold') {
      let value = search(rootId, 0, 1); metrics.thresholdPasses += 1; if (value >= 1) return 1;
      value = search(rootId, -1, 0); metrics.thresholdPasses += 1; return value >= 0 ? 0 : -1;
    }
    return search(rootId, -2, 2);
  }

  function solveRootColumn(column) {
    if (!isLegal(rootId, column)) return null;
    const rank = initializeFrontier(rootId, null);
    const child = transition(rootId, column);
    if (child === QN_ILLEGAL) return null;
    if (child === QN_TERMINAL_WIN) return 1;
    advanceFrontier(rootId, column, rank);
    const childSeed = hasFrontierOrder
      ? frontierStack.slice(frontierWords, frontierWords * 2)
      : null;
    return -search(child, -2, 2, childSeed);
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
  const {
    columns,
    rootId,
    centerOrder,
    rankAt,
    isLegal,
    transition: transitionPort,
    tacticalCode,
  } = port;
  const frontierOrder = port.frontierOrder ?? null;
  const landingCellAt = port.landingCellAt ?? null;
  const hasFrontierOrder = frontierOrder !== null && typeof landingCellAt === 'function';
  const splitDepth = config.splitDepth ?? 3;
  const priorityAt = config.priorityAt ?? (() => 0);
  if (!Number.isInteger(splitDepth) || splitDepth < 1) throw new RangeError('splitDepth must be a positive integer');
  if (typeof leafSearch !== 'function') throw new TypeError('leafSearch must be a function');

  const metrics = {
    calls: 0,
    shallowExpanded: 0,
    ttExactReturns: 0,
    ttBoundReturns: 0,
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
  const proof = createProofAccess(port, metrics);
  const rootFrontierSeed = hasFrontierOrder ? frontierOrder.createRootSeed() : null;
  const background = new Set();
  let backgroundError = null;

  function trackDetached(promises) {
    if (promises.length === 0) return;
    metrics.detachedBatches += 1;
    metrics.detachedScoutTasks += promises.length;
    let tracked;
    tracked = Promise.allSettled(promises)
      .then((results) => {
        for (const result of results) {
          if (result.status === 'rejected') backgroundError ??= result.reason;
        }
      })
      .finally(() => background.delete(tracked));
    background.add(tracked);
  }

  async function drainBackground() {
    while (background.size > 0) await Promise.all([...background]);
    if (backgroundError) throw backgroundError;
  }

  function transition(stateId, column) {
    metrics.transitionsRequested += 1;
    return transitionPort(stateId, column);
  }

  function nextFrontierSeed(stateId, column, rank, seed) {
    if (!hasFrontierOrder) return null;
    const landingCell = landingCellAt(stateId, column);
    if (landingCell === 0xff) throw new Error(`cannot advance live-line frontier through illegal column ${column}`);
    return frontierOrder.advanceSeed(seed, rank & 1, landingCell);
  }

  function orderedMoves(stateId, key, forcedColumn, rank, frontierSeed) {
    if (forcedColumn >= 0) return [forcedColumn];
    if (hasFrontierOrder) {
      const scored = [];
      const mover = rank & 1;
      for (let column = 0; column < columns; column += 1) {
        if (!isLegal(stateId, column)) continue;
        const landingCell = landingCellAt(stateId, column);
        scored.push({ column, value: frontierOrder.valueAtSeed(frontierSeed, mover, landingCell) });
      }
      scored.sort((left, right) => right.value - left.value || left.column - right.column);
      metrics.frontierOrderedNodes += 1;
      return scored.map((entry) => entry.column);
    }
    const moves = [];
    const best = proof.bestMove(key);
    if (best >= 0 && isLegal(stateId, best)) moves.push(best);
    for (const column of centerOrder) {
      if (column === best || !isLegal(stateId, column)) continue;
      moves.push(column);
    }
    return moves;
  }

  function publishResult(stateId, key, value, selected, originalAlpha, originalBeta) {
    if (value <= originalAlpha) proof.publishUpper(stateId, key, value, selected);
    else if (value >= originalBeta) proof.publishLower(stateId, key, value, selected);
    else proof.publishExact(stateId, key, value, selected);
  }

  async function runLeaf(stateId, alpha, beta) {
    metrics.leafTasks += 1;
    const result = await leafSearch(stateId, alpha, beta, priorityAt(stateId));
    if (result && typeof result === 'object') {
      metrics.workerCalls += result.metrics?.calls ?? 0;
      metrics.workerExpanded += result.metrics?.expanded ?? 0;
      return result.value;
    }
    return result;
  }

  async function search(startStateId, startAlpha, startBeta, decisionDepth = 0, frontierSeed = null) {
    let stateId = startStateId;
    let alpha = startAlpha;
    let beta = startBeta;
    let rank = rankAt(stateId);
    let seed = frontierSeed;
    if (hasFrontierOrder) {
      if (seed === null) {
        if (rank !== 0) throw new Error('non-root dependency search requires live-line frontier seed');
        seed = rootFrontierSeed;
      }
    }
    let sign = 1;
    let forcedTransitions = 0;

    while (true) {
      metrics.calls += 1;
      const key = proof.probe(stateId);
      let lower = proof.lower(key);
      let upper = proof.upper(key);
      [lower, upper] = frontierBoundsFor(port, stateId, lower, upper);
      if (lower === upper) {
        if (key >= 0) metrics.ttExactReturns += 1; else metrics.frontierBoundCuts += 1;
        if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
        return sign * lower;
      }
      if (lower >= beta) {
        if (key >= 0) metrics.ttBoundReturns += 1; else metrics.frontierBoundCuts += 1;
        if (forcedTransitions > 0) metrics.forcedMacroChains += 1;
        return sign * lower;
      }
      if (upper <= alpha) {
        if (key >= 0) metrics.ttBoundReturns += 1; else metrics.frontierBoundCuts += 1;
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
        const child = transition(stateId, forcedColumn);
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

      const moves = orderedMoves(stateId, key, -1, rank, seed);
      if (moves.length === 0) throw new Error(`non-tactical quotient state ${stateId} has no legal moves`);
      metrics.shallowExpanded += 1;

      let value = -2;
      let selected = -1;
      const firstColumn = moves[0];
      const firstChild = transition(stateId, firstColumn);
      const firstSeed = firstChild >= 0 && hasFrontierOrder
        ? nextFrontierSeed(stateId, firstColumn, rank, seed)
        : null;
      const firstScore = firstChild === QN_TERMINAL_WIN
        ? 1
        : -await search(firstChild, -beta, -alpha, decisionDepth + 1, firstSeed);
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
        for (let index = 1; index < moves.length; index += 1) {
          const column = moves[index];
          const child = transition(stateId, column);
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

        const pending = new Map();
        for (let index = 0; index < siblings.length; index += 1) {
          const entry = siblings[index];
          pending.set(index, entry.promise.then(
            (result) => ({ index, result, error: null }),
            (error) => ({ index, result: null, error }),
          ));
        }

        while (pending.size > 0) {
          const settled = await Promise.race(pending.values());
          pending.delete(settled.index);
          if (settled.error) {
            trackDetached([...pending.keys()].map((index) => siblings[index].promise));
            throw settled.error;
          }

          metrics.incrementalScoutCompletions += 1;
          const entry = siblings[settled.index];
          let score = entry.terminal ? 1 : -settled.result;
          if (score > alpha && score < beta && !entry.terminal) {
            metrics.reSearches += 1;
            score = -await search(entry.child, -beta, -alpha, decisionDepth + 1, entry.seed);
          }
          if (score > value) {
            value = score;
            selected = entry.column;
          }
          if (value > alpha) alpha = value;
          if (alpha >= beta) {
            metrics.cutoffs += 1;
            trackDetached([...pending.keys()].map((index) => siblings[index].promise));
            break;
          }
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
    if (!isLegal(rootId, column)) return null;
    const child = transition(rootId, column);
    if (child === QN_ILLEGAL) return null;
    if (child === QN_TERMINAL_WIN) return 1;
    const childSeed = hasFrontierOrder ? nextFrontierSeed(rootId, column, 0, rootFrontierSeed) : null;
    return -(await search(child, -2, 2, 1, childSeed));
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
