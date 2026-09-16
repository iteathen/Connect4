const TACTICAL_NONE = -100;
const TACTICAL_DRAW = -101;
const TACTICAL_LOSS = -102;
const TACTICAL_IMMEDIATE_BASE = 64;

export const WORKER_SEARCH_STOPPED = Symbol('worker-search-stopped');

export function solveStateWdl(kernel, startStateId, config = {}) {
  const etc = config.etc !== false;
  const etcMinRemaining = config.etcMinRemaining ?? 0;
  const stopView = config.stopView ?? null;
  const stopCheckMask = config.stopCheckMask ?? 1023;
  const { columns, cellCount, states, supportAccess } = kernel;
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
    transitionsRequested: 0,
    stopChecks: 0,
  };

  function checkStop() {
    if (!stopView) return;
    if ((metrics.calls & stopCheckMask) !== 0) return;
    metrics.stopChecks += 1;
    if (Atomics.load(stopView, 0) !== 0) throw WORKER_SEARCH_STOPPED;
  }

  function prepareMoves(stateId, forcedColumn) {
    const supportIndex = states.support[stateId];
    const rank = supportAccess.rankAt(supportIndex);
    const base = rank * columns;
    let count = 0;
    if (forcedColumn >= 0) {
      moveStack[base] = forcedColumn;
      metrics.forcedNodes += 1;
      return 1;
    }
    const best = states.bestMove[stateId];
    if (best >= 0 && supportAccess.landingAt(supportIndex, best) !== 0xff) {
      moveStack[base + count++] = best;
      metrics.ttMoveOrderHits += 1;
    }
    for (const column of kernel.centerOrder) {
      if (column === best) continue;
      if (supportAccess.landingAt(supportIndex, column) === 0xff) continue;
      moveStack[base + count++] = column;
    }
    return count;
  }

  function transition(stateId, column) {
    metrics.transitionsRequested += 1;
    return kernel.advance(stateId, column);
  }

  function search(stateId, alpha, beta) {
    metrics.calls += 1;
    checkStop();
    const lower = states.lower[stateId];
    const upper = states.upper[stateId];
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

    const tactical = kernel.tacticalCode(stateId);
    if (tactical >= TACTICAL_IMMEDIATE_BASE) {
      const move = tactical - TACTICAL_IMMEDIATE_BASE;
      states.lower[stateId] = 1;
      states.upper[stateId] = 1;
      states.bestMove[stateId] = move;
      metrics.tacticalExact += 1;
      return 1;
    }
    if (tactical === TACTICAL_LOSS) {
      states.lower[stateId] = -1;
      states.upper[stateId] = -1;
      metrics.tacticalExact += 1;
      return -1;
    }
    if (tactical === TACTICAL_DRAW) {
      states.lower[stateId] = 0;
      states.upper[stateId] = 0;
      metrics.tacticalExact += 1;
      return 0;
    }
    if (tactical !== TACTICAL_NONE && (tactical < 0 || tactical >= columns)) {
      throw new Error(`unexpected tactical code ${tactical}`);
    }

    const originalAlpha = alpha;
    const originalBeta = beta;
    alpha = Math.max(alpha, lower);
    beta = Math.min(beta, upper);
    const forcedColumn = tactical >= 0 ? tactical : -1;
    const moveCount = prepareMoves(stateId, forcedColumn);
    const supportIndex = states.support[stateId];
    const rank = supportAccess.rankAt(supportIndex);
    const base = rank * columns;
    const remaining = cellCount - rank;
    const etcActive = etc && remaining >= etcMinRemaining;

    if (etcActive) {
      for (let index = 0; index < moveCount; index += 1) {
        const column = moveStack[base + index];
        const child = transition(stateId, column);
        if (child === -1) {
          states.lower[stateId] = 1;
          states.upper[stateId] = 1;
          states.bestMove[stateId] = column;
          metrics.etcCutoffs += 1;
          return 1;
        }
        if (child < 0) continue;
        metrics.etcProbes += 1;
        const parentLower = -states.upper[child];
        if (parentLower >= beta) {
          states.lower[stateId] = Math.max(states.lower[stateId], parentLower);
          states.bestMove[stateId] = column;
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
      const score = child === -1 ? 1 : -search(child, -beta, -alpha);
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

    if (selected >= 0) states.bestMove[stateId] = selected;
    if (value <= originalAlpha) states.upper[stateId] = Math.min(states.upper[stateId], value);
    else if (value >= originalBeta) states.lower[stateId] = Math.max(states.lower[stateId], value);
    else {
      states.lower[stateId] = value;
      states.upper[stateId] = value;
    }
    return value;
  }

  const value = search(startStateId, -2, 2);
  return Object.freeze({ value, metrics: Object.freeze(metrics) });
}
