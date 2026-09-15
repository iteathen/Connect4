import {
  DEPTH_DEPENDENT_WEIGHT,
  MAX_SAFE,
  MATE_THRESHOLD,
  MIN_SAFE,
  TT_EMPTY,
  TT_EXACT,
  TT_LOWER,
  TT_UPPER,
} from './constants.mjs';
import { evaluateRootRaw } from './evaluator.mjs';
import { PrimitivePosition } from './position.mjs';
import { createProfile } from './profile.mjs';
import { PersistentTranspositionTable, fromTTScore, toTTScore } from './tt.mjs';

const EFFECT_OWN_PLAYABLE_SINGLETON_MASK = 0x03;
const EFFECT_EXPOSES_OPPONENT_SINGLETON = 0x04;

function rootTerminalScore(winner, rootPlayer, ply) {
  if (winner === 2) return 0;
  return winner === rootPlayer ? MAX_SAFE - ply : MIN_SAFE + ply;
}

function getDepthScale(depth) {
  return Math.max(depth * DEPTH_DEPENDENT_WEIGHT, 1);
}

function toExternalScore(normalizedScore, maxDepth) {
  if (normalizedScore > MATE_THRESHOLD) {
    const distance = Math.round(MAX_SAFE - normalizedScore);
    return MAX_SAFE / getDepthScale(distance);
  }
  if (normalizedScore < -MATE_THRESHOLD) {
    const distance = Math.round(MAX_SAFE + normalizedScore);
    return MIN_SAFE / getDepthScale(distance);
  }
  return normalizedScore / getDepthScale(maxDepth);
}

function quietSuccessorSingletonEffects(position, column, player) {
  const p = position.profile;
  const heights = position.heights;
  const row = heights[column];
  const index = row * p.columns + column;
  const ownRefs = player === 0 ? position.singletonRefs0 : position.singletonRefs1;
  const opponentRefs = player === 0 ? position.singletonRefs1 : position.singletonRefs0;
  let effects = 0;
  let firstOwnCompletion = -1;

  if (row + 1 < p.rows) {
    const above = index + p.columns;
    if (opponentRefs[above] !== 0) effects |= EFFECT_EXPOSES_OPPONENT_SINGLETON;
    if (ownRefs[above] !== 0) firstOwnCompletion = above;
  }

  const start = p.positionLineOffsets[index];
  const end = p.positionLineOffsets[index + 1];
  for (let at = start; at < end; at++) {
    const line = p.positionLineIndices[at];
    const state = position.lineState[line];
    const p0Count = state & 7;
    const p1Count = state >>> 3;
    const ownCount = player === 0 ? p0Count : p1Count;
    const opponentCount = player === 0 ? p1Count : p0Count;
    if (ownCount !== 2 || opponentCount !== 0) continue;

    const remaining = position.lineEmptyXor[line] ^ index;
    const remainingColumn = remaining % p.columns;
    const remainingRow = (remaining / p.columns) | 0;
    const playableAfterMove = remainingColumn === column
      ? remainingRow === row + 1
      : heights[remainingColumn] === remainingRow;
    if (!playableAfterMove) continue;

    if (firstOwnCompletion < 0) {
      firstOwnCompletion = remaining;
    } else if (remaining !== firstOwnCompletion) {
      return effects | 2;
    }
  }

  return effects | (firstOwnCompletion >= 0 ? 1 : 0);
}

export class IncumbentSearchEngine {
  constructor({ columns = 7, rows = 6, ttCapacity = 262144, orderingPolicy = 'persistent-best-move' } = {}) {
    if (orderingPolicy !== 'persistent-best-move' && orderingPolicy !== 'depth-qualified') throw new RangeError('unknown orderingPolicy');
    this.orderingPolicy = orderingPolicy;
    this.profile = createProfile(columns, rows);
    this.tt = new PersistentTranspositionTable(ttCapacity);
    this.rootBestMove = -1;
    this.targetDepth = 0;
    this.rootPlayer = 0;
    this.metrics = this.createMetrics();
  }

  createPosition(moves = null) {
    return new PrimitivePosition(this.profile.columns, this.profile.rows, moves);
  }

  resetSearchMemory() {
    this.tt.clear();
  }

  createMetrics() {
    return {
      nodes: 0,
      evaluatorCalls: 0,
      tacticalImmediateWins: 0,
      tacticalForcedBlocks: 0,
      tacticalDoubleThreatLosses: 0,
      horizonExactImmediateWins: 0,
      horizonExactDoubleThreatLosses: 0,
      ttProbes: 0,
      ttPositionHits: 0,
      ttScoreHits: 0,
      ttExactHits: 0,
      ttLowerHits: 0,
      ttUpperHits: 0,
      ttExactReturns: 0,
      ttBoundCutoffs: 0,
      ttOrderingHits: 0,
      ttShallowOrderingHits: 0,
      ttCrossPerspectiveOrderingHits: 0,
      ttInsufficientDepthHits: 0,
      ttPerspectiveMisses: 0,
      ttCrossGenerationPositionHits: 0,
      ttCrossGenerationScoreHits: 0,
      ttCrossGenerationOrderingHits: 0,
      alphaBetaCutoffs: 0,
      ttStores: 0,
      ttReplacements: 0,
      reachedDepth: 0,
    };
  }

  searchFixedDepth(position, depth) {
    if (!(position instanceof PrimitivePosition) || position.profile !== this.profile) {
      throw new TypeError('position must belong to this engine profile');
    }
    if (!Number.isInteger(depth) || depth < 1) throw new RangeError('depth must be an integer >= 1');
    const winner = position.winner();
    if (winner !== -1) {
      const normalizedScore = rootTerminalScore(winner, position.sideToMove, 0);
      return { move: null, score: winner === 2 ? 0 : (winner === position.sideToMove ? MAX_SAFE : MIN_SAFE), normalizedScore, depth: 0, metrics: this.createMetrics() };
    }
    this.rootPlayer = position.sideToMove;
    this.tt.nextGeneration();
    this.metrics = this.createMetrics();
    this.targetDepth = depth;
    this.rootBestMove = -1;
    const normalizedScore = this.searchNode(position, 0, MIN_SAFE, MAX_SAFE);
    this.metrics.reachedDepth = depth;
    return {
      move: this.rootBestMove < 0 ? null : this.rootBestMove,
      score: toExternalScore(normalizedScore, depth),
      normalizedScore,
      depth,
      metrics: { ...this.metrics },
    };
  }

  search(position, maxDepth) {
    if (!(position instanceof PrimitivePosition) || position.profile !== this.profile) {
      throw new TypeError('position must belong to this engine profile');
    }
    if (!Number.isInteger(maxDepth) || maxDepth < 1) throw new RangeError('maxDepth must be an integer >= 1');
    const winner = position.winner();
    if (winner !== -1) {
      return { move: null, score: winner === 2 ? 0 : (winner === position.sideToMove ? MAX_SAFE : MIN_SAFE), normalizedScore: rootTerminalScore(winner, position.sideToMove, 0), depth: 0, metrics: this.createMetrics() };
    }

    this.rootPlayer = position.sideToMove;
    this.tt.nextGeneration();
    this.metrics = this.createMetrics();
    let normalizedScore = 0;
    let bestMove = -1;
    for (let depth = 1; depth <= maxDepth; depth++) {
      this.targetDepth = depth;
      this.rootBestMove = -1;
      normalizedScore = this.searchNode(position, 0, MIN_SAFE, MAX_SAFE);
      bestMove = this.rootBestMove;
      this.metrics.reachedDepth = depth;
    }
    return {
      move: bestMove < 0 ? null : bestMove,
      score: toExternalScore(normalizedScore, maxDepth),
      normalizedScore,
      depth: maxDepth,
      metrics: { ...this.metrics },
    };
  }

  searchNode(position, ply, alpha, beta) {
    const metrics = this.metrics;
    metrics.nodes++;
    const winner = position.winner();
    if (winner !== -1) return rootTerminalScore(winner, this.rootPlayer, ply);
    if (ply >= this.targetDepth) {
      const currentPlayer = position.sideToMove;
      const currentSingletonLines = currentPlayer === 0 ? position.singletonLineCount0 : position.singletonLineCount1;
      const opponentSingletonLines = currentPlayer === 0 ? position.singletonLineCount1 : position.singletonLineCount0;
      let immediateWin = false;
      let opponentThreatCount = 0;

      if ((currentSingletonLines | opponentSingletonLines) !== 0) {
        const hp = this.profile;
        const heights = position.heights;
        const currentRefs = currentPlayer === 0 ? position.singletonRefs0 : position.singletonRefs1;
        const opponentRefs = currentPlayer === 0 ? position.singletonRefs1 : position.singletonRefs0;
        for (let i = 0; i < hp.moveOrder.length; i++) {
          const column = hp.moveOrder[i];
          const row = heights[column];
          if (row >= hp.rows) continue;
          const index = row * hp.columns + column;
          if (currentSingletonLines !== 0 && currentRefs[index] !== 0) {
            immediateWin = true;
            break;
          }
          if (opponentSingletonLines !== 0 && opponentThreatCount < 2 && opponentRefs[index] !== 0) opponentThreatCount++;
        }
      }

      if (immediateWin) {
        metrics.horizonExactImmediateWins++;
        return rootTerminalScore(currentPlayer, this.rootPlayer, ply + 1);
      }
      if (opponentThreatCount > 1) {
        metrics.horizonExactDoubleThreatLosses++;
        return rootTerminalScore(1 - currentPlayer, this.rootPlayer, ply + 2);
      }

      metrics.evaluatorCalls++;
      return evaluateRootRaw(position, this.rootPlayer);
    }

    const originalAlpha = alpha;
    const originalBeta = beta;
    const remainingDepth = this.targetDepth - ply;
    const tt = this.tt;
    metrics.ttProbes++;
    let slot = tt.find(position.hashLo, position.hashHi, position.sideToMove);
    let ttMove = -1;
    if (slot >= 0) {
      metrics.ttPositionHits++;
      const slotGeneration = tt.lastGeneration[slot];
      if (slotGeneration !== tt.generation) metrics.ttCrossGenerationPositionHits++;
      let ownMove;
      let otherMove;
      let depth;
      let flag;
      let storedScore;
      let scoreGeneration;
      let otherGeneration;
      if (this.rootPlayer === 0) {
        ownMove = tt.bestMove0[slot];
        otherMove = tt.bestMove1[slot];
        depth = tt.depth0[slot];
        flag = tt.flag0[slot];
        storedScore = tt.score0[slot];
        scoreGeneration = tt.gen0[slot];
        otherGeneration = tt.gen1[slot];
      } else {
        ownMove = tt.bestMove1[slot];
        otherMove = tt.bestMove0[slot];
        depth = tt.depth1[slot];
        flag = tt.flag1[slot];
        storedScore = tt.score1[slot];
        scoreGeneration = tt.gen1[slot];
        otherGeneration = tt.gen0[slot];
      }
      const scoreSufficient = flag !== TT_EMPTY && depth >= remainingDepth;
      if (ownMove >= 0 && (this.orderingPolicy === 'persistent-best-move' || scoreSufficient)) {
        ttMove = ownMove;
        metrics.ttOrderingHits++;
        if (!scoreSufficient) metrics.ttShallowOrderingHits++;
        if (scoreGeneration !== tt.generation) metrics.ttCrossGenerationOrderingHits++;
      } else if (this.orderingPolicy === 'persistent-best-move' && otherMove >= 0) {
        ttMove = otherMove;
        metrics.ttOrderingHits++;
        metrics.ttCrossPerspectiveOrderingHits++;
        if (otherGeneration !== tt.generation) metrics.ttCrossGenerationOrderingHits++;
      }
      if (flag !== TT_EMPTY) {
        if (scoreSufficient) {
          metrics.ttScoreHits++;
          if (flag === TT_EXACT) metrics.ttExactHits++;
          else if (flag === TT_LOWER) metrics.ttLowerHits++;
          else if (flag === TT_UPPER) metrics.ttUpperHits++;
          if (scoreGeneration !== tt.generation) metrics.ttCrossGenerationScoreHits++;
          const cachedScore = fromTTScore(storedScore, ply);
          if (flag === TT_EXACT) {
            metrics.ttExactReturns++;
            if (ply === 0 && ownMove >= 0) this.rootBestMove = ownMove;
            return cachedScore;
          }
          if (flag === TT_LOWER && cachedScore > alpha) alpha = cachedScore;
          else if (flag === TT_UPPER && cachedScore < beta) beta = cachedScore;
          if (alpha >= beta) {
            metrics.ttBoundCutoffs++;
            return cachedScore;
          }
        } else {
          metrics.ttInsufficientDepthHits++;
        }
      } else if (otherMove >= 0) {
        metrics.ttPerspectiveMisses++;
      }
    }

    const p = this.profile;
    const heights = position.heights;
    const currentPlayer = position.sideToMove;
    const currentSingletonLines = currentPlayer === 0 ? position.singletonLineCount0 : position.singletonLineCount1;
    const opponentSingletonLines = currentPlayer === 0 ? position.singletonLineCount1 : position.singletonLineCount0;
    let immediateWinMove = -1;
    let opponentThreatCount = 0;
    let forcedBlock = -1;

    if ((currentSingletonLines | opponentSingletonLines) !== 0) {
      const currentRefs = currentPlayer === 0 ? position.singletonRefs0 : position.singletonRefs1;
      const opponentRefs = currentPlayer === 0 ? position.singletonRefs1 : position.singletonRefs0;
      for (let i = 0; i < p.moveOrder.length; i++) {
        const column = p.moveOrder[i];
        const row = heights[column];
        if (row >= p.rows) continue;
        const index = row * p.columns + column;
        if (currentSingletonLines !== 0 && currentRefs[index] !== 0) {
          immediateWinMove = column;
          break;
        }
        if (opponentSingletonLines !== 0 && opponentThreatCount < 2 && opponentRefs[index] !== 0) {
          if (forcedBlock < 0) forcedBlock = column;
          opponentThreatCount++;
        }
      }
    }

    if (immediateWinMove >= 0) {
      metrics.tacticalImmediateWins++;
      const value = rootTerminalScore(currentPlayer, this.rootPlayer, ply + 1);
      if (slot < 0) { slot = tt.allocate(position.hashLo, position.hashHi, position.sideToMove); if (tt.lastAllocationReplaced) metrics.ttReplacements++; }
      tt.store(slot, this.rootPlayer, remainingDepth, TT_EXACT, toTTScore(value, ply), immediateWinMove);
      metrics.ttStores++;
      if (ply === 0) this.rootBestMove = immediateWinMove;
      return value;
    }

    const opponent = 1 - currentPlayer;
    if (opponentThreatCount > 1) {
      metrics.tacticalDoubleThreatLosses++;
      const value = rootTerminalScore(opponent, this.rootPlayer, ply + 2);
      if (slot < 0) { slot = tt.allocate(position.hashLo, position.hashHi, position.sideToMove); if (tt.lastAllocationReplaced) metrics.ttReplacements++; }
      tt.store(slot, this.rootPlayer, remainingDepth, TT_EXACT, toTTScore(value, ply), forcedBlock);
      metrics.ttStores++;
      if (ply === 0) this.rootBestMove = forcedBlock;
      return value;
    }

    const isMax = currentPlayer === this.rootPlayer;
    let value = isMax ? MIN_SAFE : MAX_SAFE;
    let bestMove = -1;

    if (opponentThreatCount === 1) {
      metrics.tacticalForcedBlocks++;
      position.applyUnchecked(forcedBlock);
      const score = this.searchNode(position, ply + 1, alpha, beta);
      position.undoUnchecked();
      value = score;
      bestMove = forcedBlock;
    } else {
      if (ttMove >= 0 && heights[ttMove] < p.rows) {
        position.applyUnchecked(ttMove);
        const score = this.searchNode(position, ply + 1, alpha, beta);
        position.undoUnchecked();
        value = score;
        bestMove = ttMove;
        if (isMax) alpha = Math.max(alpha, value); else beta = Math.min(beta, value);
      }

      let structuralMove = -1;
      if (ply > 0 && alpha < beta) {
        let structuralClass = 0;
        for (let i = 0; i < p.moveOrder.length; i++) {
          const column = p.moveOrder[i];
          if (column === ttMove || heights[column] >= p.rows) continue;
          const effects = quietSuccessorSingletonEffects(position, column, currentPlayer);
          if ((effects & EFFECT_EXPOSES_OPPONENT_SINGLETON) !== 0) continue;
          const candidateClass = effects & EFFECT_OWN_PLAYABLE_SINGLETON_MASK;
          if (candidateClass > structuralClass) {
            structuralClass = candidateClass;
            structuralMove = column;
            if (candidateClass === 2) break;
          }
        }
      }

      if (structuralMove >= 0) {
        position.applyUnchecked(structuralMove);
        const score = this.searchNode(position, ply + 1, alpha, beta);
        position.undoUnchecked();
        if (bestMove < 0 || (isMax ? score > value : score < value)) {
          value = score;
          bestMove = structuralMove;
        }
        if (isMax) {
          if (value > alpha) alpha = value;
        } else if (value < beta) beta = value;
        if (alpha >= beta) metrics.alphaBetaCutoffs++;
      }

      if (alpha < beta) {
        for (let i = 0; i < p.moveOrder.length; i++) {
          const column = p.moveOrder[i];
          if (column === ttMove || column === structuralMove || heights[column] >= p.rows) continue;
          position.applyUnchecked(column);
          const score = this.searchNode(position, ply + 1, alpha, beta);
          position.undoUnchecked();
          if (bestMove < 0 || (isMax ? score > value : score < value)) {
            value = score;
            bestMove = column;
          }
          if (isMax) {
            if (value > alpha) alpha = value;
          } else if (value < beta) beta = value;
          if (alpha >= beta) {
            metrics.alphaBetaCutoffs++;
            break;
          }
        }
      }
    }

    let flag = TT_EXACT;
    if (value <= originalAlpha) flag = TT_UPPER;
    else if (value >= originalBeta) flag = TT_LOWER;
    if (slot < 0) { slot = tt.allocate(position.hashLo, position.hashHi, position.sideToMove); if (tt.lastAllocationReplaced) metrics.ttReplacements++; }
    tt.store(slot, this.rootPlayer, remainingDepth, flag, toTTScore(value, ply), bestMove);
    metrics.ttStores++;
    if (ply === 0) this.rootBestMove = bestMove;
    return value;
  }
}
