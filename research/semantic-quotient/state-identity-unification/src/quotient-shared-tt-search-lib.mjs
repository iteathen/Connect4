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
import { createPackedProofStore } from './quotient-packed-proof-store.mjs';

export function createSharedTtGraphSearcher(shared, options = {}) {
  const { spec, graph, arena } = shared;
  const { columns, rows } = spec;
  const cellCount = columns * rows;
  const edges = new Int32Array(graph.edgeBuffer);
  const tactical = new Int16Array(graph.tacticalBuffer);
  const ranks = new Uint8Array(graph.rankBuffer);
  const proofStore = createPackedProofStore(arena.recordBuffer);
  const centerOrder = graph.centerOrder;
  const etc = options.etc !== false;
  const etcMinRemaining = options.etcMinRemaining ?? 0;
  const workerSalt = options.workerSalt ?? 0;
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
    sharedRecordReads: 0,
    sharedRecordWrites: 0,
  };

  function edgeAt(stateId, column) {
    metrics.transitionsRequested += 1;
    return edges[stateId * columns + column];
  }

  function readLower(stateId) {
    metrics.sharedRecordReads += 1;
    return proofStore.lower(stateId);
  }

  function readUpper(stateId) {
    metrics.sharedRecordReads += 1;
    return proofStore.upper(stateId);
  }

  function readBestMove(stateId) {
    metrics.sharedRecordReads += 1;
    return proofStore.bestMove(stateId);
  }

  function publishExact(stateId, value, bestMove = -1) {
    metrics.sharedRecordWrites += 1;
    proofStore.publishExact(stateId, value, bestMove);
  }

  function publishLower(stateId, value, bestMove = -1) {
    metrics.sharedRecordWrites += 1;
    proofStore.publishLower(stateId, value, bestMove);
  }

  function publishUpper(stateId, value, bestMove = -1) {
    metrics.sharedRecordWrites += 1;
    proofStore.publishUpper(stateId, value, bestMove);
  }

  function prepareMoves(stateId, forcedColumn) {
    const rank = ranks[stateId];
    const base = rank * columns;
    let count = 0;
    if (forcedColumn >= 0) {
      moveStack[base] = forcedColumn;
      metrics.forcedNodes += 1;
      return 1;
    }
    const best = readBestMove(stateId);
    if (best >= 0 && edges[stateId * columns + best] !== QN_ILLEGAL) {
      moveStack[base + count++] = best;
      metrics.ttMoveOrderHits += 1;
    }

    if ((workerSalt & 1) === 0) {
      for (const column of centerOrder) {
        if (column === best) continue;
        if (edges[stateId * columns + column] === QN_ILLEGAL) continue;
        moveStack[base + count++] = column;
      }
    } else {
      for (let index = centerOrder.length - 1; index >= 0; index -= 1) {
        const column = centerOrder[index];
        if (column === best) continue;
        if (edges[stateId * columns + column] === QN_ILLEGAL) continue;
        moveStack[base + count++] = column;
      }
    }
    return count;
  }

  function search(stateId, alpha, beta) {
    metrics.calls += 1;
    const lower = readLower(stateId);
    const upper = readUpper(stateId);
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

    const tacticalCode = tactical[stateId];
    assertTacticalCode(tacticalCode, columns);
    if (tacticalCode >= TACTICAL_IMMEDIATE_BASE) {
      publishExact(stateId, 1, tacticalImmediateColumn(tacticalCode));
      metrics.tacticalExact += 1;
      return 1;
    }
    if (tacticalCode === TACTICAL_LOSS) {
      publishExact(stateId, -1);
      metrics.tacticalExact += 1;
      return -1;
    }
    if (tacticalCode === TACTICAL_DRAW) {
      publishExact(stateId, 0);
      metrics.tacticalExact += 1;
      return 0;
    }

    const originalAlpha = alpha;
    const originalBeta = beta;
    alpha = Math.max(alpha, lower);
    beta = Math.min(beta, upper);
    const forcedColumn = tacticalForcedColumn(tacticalCode, columns);
    const moveCount = prepareMoves(stateId, forcedColumn);
    const rank = ranks[stateId];
    const base = rank * columns;
    const remaining = cellCount - rank;
    const etcActive = etc && remaining >= etcMinRemaining;

    if (etcActive) {
      for (let index = 0; index < moveCount; index += 1) {
        const column = moveStack[base + index];
        const child = edgeAt(stateId, column);
        if (child === QN_TERMINAL_WIN) {
          publishExact(stateId, 1, column);
          metrics.etcCutoffs += 1;
          return 1;
        }
        if (child < 0) continue;
        metrics.etcProbes += 1;
        const parentLower = -readUpper(child);
        if (parentLower >= beta) {
          publishLower(stateId, parentLower, column);
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
      const child = edgeAt(stateId, column);
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

    if (value <= originalAlpha) publishUpper(stateId, value, selected);
    else if (value >= originalBeta) publishLower(stateId, value, selected);
    else publishExact(stateId, value, selected);
    return value;
  }

  function solveState(stateId) {
    return search(stateId, -2, 2);
  }

  function solveRoot() {
    return search(graph.rootId, -2, 2);
  }

  function solveRootColumn(column) {
    const child = edges[graph.rootId * columns + column];
    if (child === QN_ILLEGAL) return null;
    if (child === QN_TERMINAL_WIN) return 1;
    return -search(child, -2, 2);
  }

  return Object.freeze({ solveState, solveRoot, solveRootColumn, metrics, proofStore });
}
