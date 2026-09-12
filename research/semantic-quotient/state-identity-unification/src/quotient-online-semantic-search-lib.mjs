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
import {
  proofLower,
  proofUpper,
  bestMoveHint,
  withProofLower,
  withProofUpper,
  withBestMoveHint,
  withProofBounds,
} from './quotient-negamax-search-record.mjs';
import { createLocalSemanticDescriptorCache } from './quotient-local-semantic-descriptor.mjs';
import { createSemanticSharedTtView } from './quotient-semantic-shared-tt.mjs';

export function createOnlineSemanticQuotientSearcher(kernel, semanticArena, options = {}) {
  const { states, supportAccess, columns, cellCount, centerOrder } = kernel;
  const descriptorCache = createLocalSemanticDescriptorCache(kernel);
  const tt = createSemanticSharedTtView(semanticArena);
  const records = tt.records;
  const etc = options.etc === true;
  const etcMinRemaining = options.etcMinRemaining ?? 0;
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
    ttEntryLookups: 0,
    proofWrites: 0,
  };

  function ttSlot(stateId) {
    metrics.ttEntryLookups += 1;
    return tt.findOrCreate(descriptorCache.stateDescriptor(stateId));
  }

  function writeRecord(slot, record) {
    records[slot] = record;
    metrics.proofWrites += 1;
  }

  function setExact(slot, value, bestMove = -1) {
    let record = records[slot];
    record = withProofBounds(record, value, value);
    if (bestMove >= 0) record = withBestMoveHint(record, bestMove);
    writeRecord(slot, record);
  }

  function prepareMoves(stateId, slot, forcedColumn) {
    const supportIndex = states.support[stateId];
    const rank = supportAccess.rankAt(supportIndex);
    const base = rank * columns;
    let count = 0;
    if (forcedColumn >= 0) {
      moveStack[base] = forcedColumn;
      metrics.forcedNodes += 1;
      return 1;
    }
    const best = bestMoveHint(records[slot]);
    if (best >= 0 && supportAccess.landingAt(supportIndex, best) !== 0xff) {
      moveStack[base + count++] = best;
      metrics.ttMoveOrderHits += 1;
    }
    for (const column of centerOrder) {
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
    const slot = ttSlot(stateId);
    let record = records[slot];
    const lower = proofLower(record);
    const upper = proofUpper(record);
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
    assertTacticalCode(tactical, columns);
    if (tactical >= TACTICAL_IMMEDIATE_BASE) {
      setExact(slot, 1, tacticalImmediateColumn(tactical));
      metrics.tacticalExact += 1;
      return 1;
    }
    if (tactical === TACTICAL_LOSS) {
      setExact(slot, -1);
      metrics.tacticalExact += 1;
      return -1;
    }
    if (tactical === TACTICAL_DRAW) {
      setExact(slot, 0);
      metrics.tacticalExact += 1;
      return 0;
    }

    const originalAlpha = alpha;
    const originalBeta = beta;
    alpha = Math.max(alpha, lower);
    beta = Math.min(beta, upper);
    const forcedColumn = tacticalForcedColumn(tactical, columns);
    const moveCount = prepareMoves(stateId, slot, forcedColumn);
    const supportIndex = states.support[stateId];
    const rank = supportAccess.rankAt(supportIndex);
    const base = rank * columns;
    const remaining = cellCount - rank;

    if (etc && remaining >= etcMinRemaining) {
      for (let index = 0; index < moveCount; index += 1) {
        const column = moveStack[base + index];
        const child = transition(stateId, column);
        if (child === QN_TERMINAL_WIN) {
          setExact(slot, 1, column);
          metrics.etcCutoffs += 1;
          return 1;
        }
        if (child < 0) continue;
        metrics.etcProbes += 1;
        const childSlot = ttSlot(child);
        const parentLower = -proofUpper(records[childSlot]);
        if (parentLower >= beta) {
          record = records[slot];
          record = withProofLower(record, Math.max(proofLower(record), parentLower));
          record = withBestMoveHint(record, column);
          writeRecord(slot, record);
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

    record = records[slot];
    if (selected >= 0) record = withBestMoveHint(record, selected);
    if (value <= originalAlpha) {
      record = withProofUpper(record, Math.min(proofUpper(record), value));
    } else if (value >= originalBeta) {
      record = withProofLower(record, Math.max(proofLower(record), value));
    } else {
      record = withProofBounds(record, value, value);
    }
    writeRecord(slot, record);
    return value;
  }

  function replayPath(path) {
    let stateId = kernel.rootId;
    for (let index = 0; index < path.length; index += 1) {
      const child = kernel.advance(stateId, path[index]);
      if (child === QN_ILLEGAL) throw new Error(`illegal planner path at ply ${index}: ${path.join(',')}`);
      if (child === QN_TERMINAL_WIN) throw new Error(`planner path crosses terminal win at ply ${index}: ${path.join(',')}`);
      stateId = child;
    }
    return stateId;
  }

  function solvePath(path) {
    const stateId = replayPath(path);
    return Object.freeze({ stateId, value: search(stateId, -2, 2) });
  }

  function stats() {
    return Object.freeze({
      search: Object.freeze({ ...metrics }),
      semanticTt: tt.stats(),
      descriptorCache: Object.freeze({ ...descriptorCache.metrics }),
      localStates: kernel.states.count,
      localClasses: kernel.classes.size,
    });
  }

  return Object.freeze({ search, replayPath, solvePath, stats, metrics, tt, descriptorCache });
}
