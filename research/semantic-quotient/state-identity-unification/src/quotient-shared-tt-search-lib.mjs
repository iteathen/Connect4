import {
  SHARED_Q_ILLEGAL,
  SHARED_Q_TERMINAL_WIN,
  lowerOfSharedRecord,
  upperOfSharedRecord,
  bestOfSharedRecord,
  withSharedLower,
  withSharedUpper,
  withSharedBest,
  withSharedBounds,
} from './quotient-shared-graph-lib.mjs';

const TACTICAL_NONE = -100;
const TACTICAL_DRAW = -101;
const TACTICAL_LOSS = -102;
const TACTICAL_IMMEDIATE_BASE = 64;

function publishExact(records, stateId, value, bestMove = -1) {
  let record = records[stateId];
  record = withSharedBounds(record, value, value);
  if (bestMove >= 0) record = withSharedBest(record, bestMove);
  records[stateId] = record;
}

export function createSharedTtGraphSearcher(shared, options = {}) {
  const { spec, graph, arena } = shared;
  const { columns, rows } = spec;
  const cellCount = columns * rows;
  const edges = new Int32Array(graph.edgeBuffer);
  const tactical = new Int16Array(graph.tacticalBuffer);
  const ranks = new Uint8Array(graph.rankBuffer);
  const records = new Uint8Array(arena.recordBuffer);
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

  function readRecord(stateId) {
    metrics.sharedRecordReads += 1;
    return records[stateId];
  }

  function writeRecord(stateId, record) {
    metrics.sharedRecordWrites += 1;
    records[stateId] = record;
  }

  function setExact(stateId, value, bestMove = -1) {
    let record = readRecord(stateId);
    record = withSharedBounds(record, value, value);
    if (bestMove >= 0) record = withSharedBest(record, bestMove);
    writeRecord(stateId, record);
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
    const record = readRecord(stateId);
    const best = bestOfSharedRecord(record);
    if (best >= 0 && edges[stateId * columns + best] !== SHARED_Q_ILLEGAL) {
      moveStack[base + count++] = best;
      metrics.ttMoveOrderHits += 1;
    }

    if ((workerSalt & 1) === 0) {
      for (const column of centerOrder) {
        if (column === best) continue;
        if (edges[stateId * columns + column] === SHARED_Q_ILLEGAL) continue;
        moveStack[base + count++] = column;
      }
    } else {
      for (let index = centerOrder.length - 1; index >= 0; index -= 1) {
        const column = centerOrder[index];
        if (column === best) continue;
        if (edges[stateId * columns + column] === SHARED_Q_ILLEGAL) continue;
        moveStack[base + count++] = column;
      }
    }
    return count;
  }

  function search(stateId, alpha, beta) {
    metrics.calls += 1;
    let record = readRecord(stateId);
    const lower = lowerOfSharedRecord(record);
    const upper = upperOfSharedRecord(record);
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
    if (tacticalCode >= TACTICAL_IMMEDIATE_BASE) {
      const move = tacticalCode - TACTICAL_IMMEDIATE_BASE;
      setExact(stateId, 1, move);
      metrics.tacticalExact += 1;
      return 1;
    }
    if (tacticalCode === TACTICAL_LOSS) {
      setExact(stateId, -1);
      metrics.tacticalExact += 1;
      return -1;
    }
    if (tacticalCode === TACTICAL_DRAW) {
      setExact(stateId, 0);
      metrics.tacticalExact += 1;
      return 0;
    }
    if (tacticalCode !== TACTICAL_NONE && (tacticalCode < 0 || tacticalCode >= columns)) {
      throw new Error(`unexpected tactical code ${tacticalCode}`);
    }

    const originalAlpha = alpha;
    const originalBeta = beta;
    alpha = Math.max(alpha, lower);
    beta = Math.min(beta, upper);
    const forcedColumn = tacticalCode >= 0 ? tacticalCode : -1;
    const moveCount = prepareMoves(stateId, forcedColumn);
    const rank = ranks[stateId];
    const base = rank * columns;
    const remaining = cellCount - rank;
    const etcActive = etc && remaining >= etcMinRemaining;

    if (etcActive) {
      for (let index = 0; index < moveCount; index += 1) {
        const column = moveStack[base + index];
        const child = edgeAt(stateId, column);
        if (child === SHARED_Q_TERMINAL_WIN) {
          setExact(stateId, 1, column);
          metrics.etcCutoffs += 1;
          return 1;
        }
        if (child < 0) continue;
        metrics.etcProbes += 1;
        const childRecord = readRecord(child);
        const parentLower = -upperOfSharedRecord(childRecord);
        if (parentLower >= beta) {
          record = readRecord(stateId);
          const currentLower = lowerOfSharedRecord(record);
          record = withSharedLower(record, Math.max(currentLower, parentLower));
          record = withSharedBest(record, column);
          writeRecord(stateId, record);
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
      const score = child === SHARED_Q_TERMINAL_WIN ? 1 : -search(child, -beta, -alpha);
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

    record = readRecord(stateId);
    if (selected >= 0) record = withSharedBest(record, selected);
    if (value <= originalAlpha) {
      record = withSharedUpper(record, Math.min(upperOfSharedRecord(record), value));
    } else if (value >= originalBeta) {
      record = withSharedLower(record, Math.max(lowerOfSharedRecord(record), value));
    } else {
      record = withSharedBounds(record, value, value);
    }
    writeRecord(stateId, record);
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
    if (child === SHARED_Q_ILLEGAL) return null;
    if (child === SHARED_Q_TERMINAL_WIN) return 1;
    return -search(child, -2, 2);
  }

  return Object.freeze({ solveState, solveRoot, solveRootColumn, metrics, records });
}
