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
