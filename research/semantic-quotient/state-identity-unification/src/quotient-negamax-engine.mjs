import {
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
  TACTICAL_DRAW,
  TACTICAL_LOSS,
  TACTICAL_IMMEDIATE_BASE,
  assertTacticalCode,
  tacticalForcedColumn,
  tacticalImmediateColumn,
} from './quotient-negamax-domain-contract.mjs';

export function createQuotientNegamaxEngine(port, config = {}) {
  const {
    columns,
    cellCount,
    rootId,
    centerOrder,
    proofStore,
    rankAt,
    isLegal,
    transition: transitionPort,
    tacticalCode,
  } = port;
  const proofKey = port.proofKey ?? ((stateId) => stateId);
  const etc = config.etc !== false;
  const etcMinRemaining = config.etcMinRemaining ?? 0;
  const wdlMode = config.wdlMode ?? 'full';
  const workerSalt = config.workerSalt ?? 0;
  if (wdlMode !== 'full' && wdlMode !== 'threshold') throw new RangeError('wdlMode must be full or threshold');

  const moveStack = new Int8Array((cellCount + 1) * columns);
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
    etcProbes: 0,
    etcCutoffs: 0,
    thresholdPasses: 0,
    transitionsRequested: 0,
  };

  function transition(stateId, column) {
    metrics.transitionsRequested += 1;
    return transitionPort(stateId, column);
  }

  function prepareMoves(stateId, key, forcedColumn) {
    const rank = rankAt(stateId);
    const base = rank * columns;
    let count = 0;
    if (forcedColumn >= 0) {
      moveStack[base] = forcedColumn;
      metrics.forcedNodes += 1;
      return 1;
    }

    const best = proofStore.bestMove(key);
    if (best >= 0 && isLegal(stateId, best)) {
      moveStack[base + count++] = best;
      metrics.ttMoveOrderHits += 1;
    }

    if ((workerSalt & 1) === 0) {
      for (const column of centerOrder) {
        if (column === best || !isLegal(stateId, column)) continue;
        moveStack[base + count++] = column;
      }
    } else {
      for (let index = centerOrder.length - 1; index >= 0; index -= 1) {
        const column = centerOrder[index];
        if (column === best || !isLegal(stateId, column)) continue;
        moveStack[base + count++] = column;
      }
    }
    return count;
  }

  function search(stateId, alpha, beta) {
    metrics.calls += 1;
    const key = proofKey(stateId);
    const lower = proofStore.lower(key);
    const upper = proofStore.upper(key);
    if (lower === upper) {
      metrics.ttExactReturns += 1;
      return lower;
    }
    if (lower >= beta) {
      metrics.ttBoundReturns += 1;
      return lower;
    }
    if (upper <= alpha) {
      metrics.ttBoundReturns += 1;
      return upper;
    }

    const tactical = tacticalCode(stateId);
    assertTacticalCode(tactical, columns);
    if (tactical >= TACTICAL_IMMEDIATE_BASE) {
      proofStore.publishExact(key, 1, tacticalImmediateColumn(tactical));
      metrics.tacticalExact += 1;
      return 1;
    }
    if (tactical === TACTICAL_LOSS) {
      proofStore.publishExact(key, -1);
      metrics.tacticalExact += 1;
      return -1;
    }
    if (tactical === TACTICAL_DRAW) {
      proofStore.publishExact(key, 0);
      metrics.tacticalExact += 1;
      return 0;
    }

    const originalAlpha = alpha;
    const originalBeta = beta;
    alpha = Math.max(alpha, lower);
    beta = Math.min(beta, upper);
    const forcedColumn = tacticalForcedColumn(tactical, columns);
    const moveCount = prepareMoves(stateId, key, forcedColumn);
    const rank = rankAt(stateId);
    const base = rank * columns;
    const remaining = cellCount - rank;

    if (etc && remaining >= etcMinRemaining) {
      for (let index = 0; index < moveCount; index += 1) {
        const column = moveStack[base + index];
        const child = transition(stateId, column);
        if (child === QN_TERMINAL_WIN) {
          proofStore.publishExact(key, 1, column);
          metrics.etcCutoffs += 1;
          return 1;
        }
        if (child < 0) continue;
        metrics.etcProbes += 1;
        const childKey = proofKey(child);
        const parentLower = -proofStore.upper(childKey);
        if (parentLower >= beta) {
          proofStore.publishLower(key, parentLower, column);
          metrics.etcCutoffs += 1;
          return parentLower;
        }
      }
    }

    metrics.expanded += 1;
    let value = -2;
    let selected = -1;
    for (let index = 0; index < moveCount; index += 1) {
      const column = moveStack[base + index];
      const child = transition(stateId, column);
      const score = child === QN_TERMINAL_WIN ? 1 : -search(child, -beta, -alpha);
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

    if (value <= originalAlpha) proofStore.publishUpper(key, value, selected);
    else if (value >= originalBeta) proofStore.publishLower(key, value, selected);
    else proofStore.publishExact(key, value, selected);
    return value;
  }

  function solveState(stateId) {
    return search(stateId, -2, 2);
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
    if (!isLegal(rootId, column)) return null;
    const child = transition(rootId, column);
    if (child === QN_ILLEGAL) return null;
    if (child === QN_TERMINAL_WIN) return 1;
    return -search(child, -2, 2);
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
    proofStore,
    isLegal,
    transition: transitionPort,
    tacticalCode,
  } = port;
  const proofKey = port.proofKey ?? ((stateId) => stateId);
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
    workerCalls: 0,
    workerExpanded: 0,
  };

  function transition(stateId, column) {
    metrics.transitionsRequested += 1;
    return transitionPort(stateId, column);
  }

  function orderedMoves(stateId, key, forcedColumn) {
    if (forcedColumn >= 0) return [forcedColumn];
    const moves = [];
    const best = proofStore.bestMove(key);
    if (best >= 0 && isLegal(stateId, best)) moves.push(best);
    for (const column of centerOrder) {
      if (column === best || !isLegal(stateId, column)) continue;
      moves.push(column);
    }
    return moves;
  }

  function publishResult(key, value, selected, originalAlpha, originalBeta) {
    if (value <= originalAlpha) proofStore.publishUpper(key, value, selected);
    else if (value >= originalBeta) proofStore.publishLower(key, value, selected);
    else proofStore.publishExact(key, value, selected);
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

  async function search(stateId, alpha, beta, depth = 0) {
    metrics.calls += 1;
    const key = proofKey(stateId);
    const lower = proofStore.lower(key);
    const upper = proofStore.upper(key);
    if (lower === upper) {
      metrics.ttExactReturns += 1;
      return lower;
    }
    if (lower >= beta) {
      metrics.ttBoundReturns += 1;
      return lower;
    }
    if (upper <= alpha) {
      metrics.ttBoundReturns += 1;
      return upper;
    }

    const tactical = tacticalCode(stateId);
    assertTacticalCode(tactical, columns);
    if (tactical >= TACTICAL_IMMEDIATE_BASE) {
      proofStore.publishExact(key, 1, tacticalImmediateColumn(tactical));
      metrics.tacticalExact += 1;
      return 1;
    }
    if (tactical === TACTICAL_LOSS) {
      proofStore.publishExact(key, -1);
      metrics.tacticalExact += 1;
      return -1;
    }
    if (tactical === TACTICAL_DRAW) {
      proofStore.publishExact(key, 0);
      metrics.tacticalExact += 1;
      return 0;
    }

    const originalAlpha = alpha;
    const originalBeta = beta;
    alpha = Math.max(alpha, lower);
    beta = Math.min(beta, upper);

    if (depth >= splitDepth) return runLeaf(stateId, alpha, beta);

    const forcedColumn = tacticalForcedColumn(tactical, columns);
    const moves = orderedMoves(stateId, key, forcedColumn);
    if (moves.length === 0) throw new Error(`non-tactical quotient state ${stateId} has no legal moves`);
    metrics.shallowExpanded += 1;

    let value = -2;
    let selected = -1;

    const firstColumn = moves[0];
    const firstChild = transition(stateId, firstColumn);
    const firstScore = firstChild === QN_TERMINAL_WIN
      ? 1
      : -await search(firstChild, -beta, -alpha, depth + 1);
    value = firstScore;
    selected = firstColumn;
    if (value > alpha) alpha = value;
    if (alpha >= beta) {
      metrics.cutoffs += 1;
      metrics.firstMoveCutoffs += 1;
      publishResult(key, value, selected, originalAlpha, originalBeta);
      return value;
    }

    if (moves.length > 1) {
      const scoutAlpha = alpha;
      const siblings = [];
      for (let index = 1; index < moves.length; index += 1) {
        const column = moves[index];
        const child = transition(stateId, column);
        if (child === QN_TERMINAL_WIN) {
          siblings.push({ column, child, terminal: true, promise: Promise.resolve(-1) });
          continue;
        }
        metrics.scoutTasks += 1;
        siblings.push({
          column,
          child,
          terminal: false,
          promise: search(child, -scoutAlpha - 1, -scoutAlpha, depth + 1),
        });
      }
      if (siblings.length > 0) metrics.parallelBatches += 1;
      const scoutValues = await Promise.all(siblings.map((entry) => entry.promise));

      for (let index = 0; index < siblings.length; index += 1) {
        const entry = siblings[index];
        let score = entry.terminal ? 1 : -scoutValues[index];
        if (score > alpha && score < beta && !entry.terminal) {
          metrics.reSearches += 1;
          score = -await search(entry.child, -beta, -alpha, depth + 1);
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
    }

    publishResult(key, value, selected, originalAlpha, originalBeta);
    return value;
  }

  async function solveRoot() {
    return search(rootId, -2, 2, 0);
  }

  async function solveRootColumn(column) {
    if (!isLegal(rootId, column)) return null;
    const child = transition(rootId, column);
    if (child === QN_ILLEGAL) return null;
    if (child === QN_TERMINAL_WIN) return 1;
    return -(await search(child, -2, 2, 1));
  }

  async function rootActionValues() {
    const values = Array(columns).fill(null);
    for (let column = 0; column < columns; column += 1) values[column] = await solveRootColumn(column);
    return values;
  }

  return Object.freeze({
    search,
    solveRoot,
    solveRootColumn,
    rootActionValues,
    metrics,
  });
}
