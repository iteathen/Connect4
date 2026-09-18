import {
  LEGACY_MAX_SAFE,
  LEGACY_MIN_SAFE,
  depthScale,
  legacyRootUtility,
  winnerUtility,
} from "./evaluator.mjs";
import { addBitHigh, addBitLow, landingIndex } from "./primitives.mjs";
import { PersistentTranspositionTable, TT_EXACT, TT_LOWER, TT_UPPER } from "./transposition-table.mjs";

function lineCompleted(playerLow, playerHigh, lineLow, lineHigh) {
  return ((playerLow & lineLow) >>> 0) === lineLow && ((playerHigh & lineHigh) >>> 0) === lineHigh;
}

function isWinningMove(geometry, playerLow, playerHigh, occupiedLow, occupiedHigh, column) {
  const index = landingIndex(geometry, occupiedLow, occupiedHigh, column);
  if (index < 0) return false;

  let nextLow = playerLow;
  let nextHigh = playerHigh;
  if (index < 32) nextLow = addBitLow(nextLow, index);
  else nextHigh = addBitHigh(nextHigh, index);

  const start = geometry.cellLineOffsets[index];
  const end = geometry.cellLineOffsets[index + 1];
  for (let offset = start; offset < end; offset += 1) {
    const lineIndex = geometry.cellLineIndices[offset];
    if (lineCompleted(nextLow, nextHigh, geometry.lineLow[lineIndex], geometry.lineHigh[lineIndex])) return true;
  }
  return false;
}

export function positionFromMoves(geometry, moves) {
  let p0Low = 0;
  let p0High = 0;
  let p1Low = 0;
  let p1High = 0;
  let ply = 0;

  for (let moveIndex = 0; moveIndex < moves.length; moveIndex += 1) {
    const column = moves[moveIndex];
    if (!Number.isInteger(column) || column < 0 || column >= geometry.columns) throw new RangeError("invalid move column");
    const occupiedLow = (p0Low | p1Low) >>> 0;
    const occupiedHigh = (p0High | p1High) >>> 0;
    const index = landingIndex(geometry, occupiedLow, occupiedHigh, column);
    if (index < 0) throw new RangeError("move sequence overfills a column");
    if ((ply & 1) === 0) {
      if (index < 32) p0Low = addBitLow(p0Low, index);
      else p0High = addBitHigh(p0High, index);
    } else {
      if (index < 32) p1Low = addBitLow(p1Low, index);
      else p1High = addBitHigh(p1High, index);
    }
    ply += 1;
  }

  return { p0Low, p0High, p1Low, p1High, ply };
}

export class IncumbentV8Search {
  constructor(geometry, { ttPower = 19 } = {}) {
    this.geometry = geometry;
    this.tt = new PersistentTranspositionTable(ttPower);
  }

  search(position, maxDepth, { reusePersistentOrdering = true } = {}) {
    if (!Number.isInteger(maxDepth) || maxDepth < 1 || maxDepth > this.geometry.cellCount) {
      throw new RangeError("maxDepth must be 1..cellCount");
    }
    const geometry = this.geometry;
    const tt = this.tt;
    const rootPlayer = position.ply & 1;
    const rootPly = position.ply;
    tt.beginSearch();

    let nodes = 0;
    let evaluations = 0;
    let ttValueHits = 0;
    let ttOrderingHits = 0;
    let ttCrossRootOrderingHits = 0;
    let rootBestMove = -1;

    function searchNode(depth, p0Low, p0High, p1Low, p1High, alpha, beta) {
      nodes += 1;
      if (depth >= maxDepth) {
        evaluations += 1;
        return legacyRootUtility(geometry, p0Low, p0High, p1Low, p1High, rootPly + depth, rootPlayer, depth);
      }

      const originalAlpha = alpha;
      const originalBeta = beta;
      const remainingDepth = maxDepth - depth;
      const entry = tt.probe(p0Low, p0High, p1Low, p1High);
      let retainedMove = -1;
      if (entry >= 0) {
        retainedMove = tt.bestMove[entry];
        if (reusePersistentOrdering && retainedMove >= 0) {
          ttOrderingHits += 1;
          if (tt.rootPlayer[entry] !== rootPlayer || tt.rootPly[entry] !== rootPly) ttCrossRootOrderingHits += 1;
        }
        if (
          tt.rootPlayer[entry] === rootPlayer
          && tt.rootPly[entry] === rootPly
          && tt.depth[entry] >= remainingDepth
        ) {
          ttValueHits += 1;
          const cachedScore = tt.score[entry];
          const cachedFlag = tt.flag[entry];
          if (cachedFlag === TT_EXACT) {
            if (depth === 0) rootBestMove = retainedMove;
            return cachedScore;
          }
          if (cachedFlag === TT_LOWER && cachedScore > alpha) alpha = cachedScore;
          else if (cachedFlag === TT_UPPER && cachedScore < beta) beta = cachedScore;
          if (alpha >= beta) {
            if (depth === 0) rootBestMove = retainedMove;
            return cachedScore;
          }
        }
      }

      const occupiedLow = (p0Low | p1Low) >>> 0;
      const occupiedHigh = (p0High | p1High) >>> 0;
      const currentPlayer = (rootPly + depth) & 1;
      const playerLow = currentPlayer === 0 ? p0Low : p1Low;
      const playerHigh = currentPlayer === 0 ? p0High : p1High;
      const opponentLow = currentPlayer === 0 ? p1Low : p0Low;
      const opponentHigh = currentPlayer === 0 ? p1High : p0High;

      let legalMask = 0;
      for (let orderIndex = 0; orderIndex < geometry.columns; orderIndex += 1) {
        const column = geometry.moveOrder[orderIndex];
        if (((occupiedLow & geometry.topLow[column]) | (occupiedHigh & geometry.topHigh[column])) === 0) legalMask |= 1 << column;
      }
      if (legalMask === 0) return 0;

      for (let orderIndex = 0; orderIndex < geometry.columns; orderIndex += 1) {
        const column = geometry.moveOrder[orderIndex];
        if ((legalMask & (1 << column)) !== 0 && isWinningMove(geometry, playerLow, playerHigh, occupiedLow, occupiedHigh, column)) {
          const value = winnerUtility(currentPlayer, rootPlayer, depth + 1);
          tt.store(p0Low, p0High, p1Low, p1High, remainingDepth, value, column, TT_EXACT, rootPlayer, rootPly);
          if (depth === 0) rootBestMove = column;
          return value;
        }
      }

      let forcedColumn = -1;
      let threatCount = 0;
      for (let orderIndex = 0; orderIndex < geometry.columns; orderIndex += 1) {
        const column = geometry.moveOrder[orderIndex];
        if ((legalMask & (1 << column)) === 0) continue;
        if (isWinningMove(geometry, opponentLow, opponentHigh, occupiedLow, occupiedHigh, column)) {
          if (forcedColumn < 0) forcedColumn = column;
          threatCount += 1;
          if (threatCount > 1) break;
        }
      }
      if (threatCount > 1) {
        const value = winnerUtility(1 - currentPlayer, rootPlayer, depth + 1);
        tt.store(p0Low, p0High, p1Low, p1High, remainingDepth, value, forcedColumn, TT_EXACT, rootPlayer, rootPly);
        if (depth === 0) rootBestMove = forcedColumn;
        return value;
      }
      if (threatCount === 1) legalMask = 1 << forcedColumn;

      const isMax = currentPlayer === rootPlayer;
      let value = isMax ? LEGACY_MIN_SAFE / depthScale(depth) : LEGACY_MAX_SAFE / depthScale(depth);
      let bestMove = -1;

      if (reusePersistentOrdering && retainedMove >= 0 && (legalMask & (1 << retainedMove)) !== 0) {
        const index = landingIndex(geometry, occupiedLow, occupiedHigh, retainedMove);
        let nextP0Low = p0Low;
        let nextP0High = p0High;
        let nextP1Low = p1Low;
        let nextP1High = p1High;
        if (currentPlayer === 0) {
          if (index < 32) nextP0Low = addBitLow(nextP0Low, index);
          else nextP0High = addBitHigh(nextP0High, index);
        } else if (index < 32) nextP1Low = addBitLow(nextP1Low, index);
        else nextP1High = addBitHigh(nextP1High, index);

        value = searchNode(depth + 1, nextP0Low, nextP0High, nextP1Low, nextP1High, alpha, beta);
        bestMove = retainedMove;
        legalMask &= ~(1 << retainedMove);
        if (isMax) {
          if (value > alpha) alpha = value;
        } else if (value < beta) beta = value;
      }

      if (alpha < beta) {
        for (let orderIndex = 0; orderIndex < geometry.columns; orderIndex += 1) {
          const column = geometry.moveOrder[orderIndex];
          if ((legalMask & (1 << column)) === 0) continue;

          const index = landingIndex(geometry, occupiedLow, occupiedHigh, column);
          let nextP0Low = p0Low;
          let nextP0High = p0High;
          let nextP1Low = p1Low;
          let nextP1High = p1High;
          if (currentPlayer === 0) {
            if (index < 32) nextP0Low = addBitLow(nextP0Low, index);
            else nextP0High = addBitHigh(nextP0High, index);
          } else if (index < 32) nextP1Low = addBitLow(nextP1Low, index);
          else nextP1High = addBitHigh(nextP1High, index);

          const moveScore = searchNode(depth + 1, nextP0Low, nextP0High, nextP1Low, nextP1High, alpha, beta);
          if (isMax) {
            if (moveScore > value) {
              value = moveScore;
              bestMove = column;
            }
            if (value > alpha) alpha = value;
          } else {
            if (moveScore < value) {
              value = moveScore;
              bestMove = column;
            }
            if (value < beta) beta = value;
          }
          if (alpha >= beta) break;
        }
      }

      let flag = TT_EXACT;
      if (value <= originalAlpha) flag = TT_UPPER;
      else if (value >= originalBeta) flag = TT_LOWER;
      tt.store(p0Low, p0High, p1Low, p1High, remainingDepth, value, bestMove, flag, rootPlayer, rootPly);
      if (depth === 0) rootBestMove = bestMove;
      return value;
    }

    const score = searchNode(0, position.p0Low, position.p0High, position.p1Low, position.p1High, LEGACY_MIN_SAFE, LEGACY_MAX_SAFE);
    return {
      score,
      move: rootBestMove,
      nodes,
      evaluations,
      ttValueHits,
      ttOrderingHits,
      ttCrossRootOrderingHits,
    };
  }
}
