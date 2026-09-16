import { columnHeight, ctz32, popcount32 } from "./primitives.mjs";

export const LEGACY_MIN_SAFE = -10000000000000;
export const LEGACY_MAX_SAFE = 10000000000000;
export const LEGACY_POSITIONAL_INCREMENT = 20;
export const LEGACY_ROOT_SCORE_RATIO = 0.65;
export const LEGACY_DEPTH_WEIGHT = 1.01;

export function depthScale(depthFromRoot) {
  const scaled = depthFromRoot * LEGACY_DEPTH_WEIGHT;
  return scaled > 1 ? scaled : 1;
}

export function legacyCurrentScore(geometry, playerLow, playerHigh, opponentLow, opponentHigh, tokenCount) {
  let positionalScore = 0;
  let hasImmediateWinningTarget = false;
  let hasSingleParityThreat = false;
  let hasEvenSupportThreat = false;
  let hasOddSupportThreat = false;

  const occupiedLow = (playerLow | opponentLow) >>> 0;
  const occupiedHigh = (playerHigh | opponentHigh) >>> 0;

  for (let lineIndex = 0; lineIndex < geometry.lineCount; lineIndex += 1) {
    const lineLow = geometry.lineLow[lineIndex];
    const lineHigh = geometry.lineHigh[lineIndex];
    const playerCount = popcount32(playerLow & lineLow) + popcount32(playerHigh & lineHigh);
    const opponentCount = popcount32(opponentLow & lineLow) + popcount32(opponentHigh & lineHigh);

    if (playerCount === 4) return LEGACY_MAX_SAFE;
    if (opponentCount === 4) return LEGACY_MIN_SAFE;
    if (opponentCount !== 0) continue;

    positionalScore += playerCount * LEGACY_POSITIONAL_INCREMENT;
    if (playerCount !== 3) continue;

    const emptyLow = (lineLow & ~occupiedLow) >>> 0;
    const emptyHigh = (lineHigh & ~occupiedHigh) >>> 0;
    const emptyIndex = emptyLow !== 0 ? ctz32(emptyLow) : 32 + ctz32(emptyHigh);
    const emptyColumn = emptyIndex % geometry.columns;
    const emptyRow = Math.floor(emptyIndex / geometry.columns);
    const height = columnHeight(geometry, occupiedLow, occupiedHigh, emptyColumn);
    const emptyAtAndBelow = emptyRow - height + 1;

    if (emptyAtAndBelow === 1) {
      // Exact legacy-current score behavior: the optimized 2025 implementation
      // revisits a 3+1 line through each of its three owned tokens, causing any
      // immediately playable winning target to set the high "fork" score tier.
      hasImmediateWinningTarget = true;
      continue;
    }
    if (emptyAtAndBelow <= 1) continue;

    // Algebraic form of the original adjustable-board parity scan:
    // outsideParity !== (emptyAtAndBelow % 2).
    const totalParityToTarget = (((geometry.columns - 1) * geometry.rows) - tokenCount + emptyRow + 1) & 1;
    if (totalParityToTarget === 1) hasSingleParityThreat = true;

    if ((emptyAtAndBelow & 1) === 0) hasEvenSupportThreat = true;
    else hasOddSupportThreat = true;
  }

  if (tokenCount === geometry.cellCount) return 0;

  const forkScore = hasImmediateWinningTarget ? 1 : 0;
  const tacticalScore = (hasSingleParityThreat || (hasEvenSupportThreat && hasOddSupportThreat)) ? 1 : 0;
  const cappedPosition = Math.min(Math.abs(positionalScore), 65535) & 0xffff;
  return ((forkScore << 18) | (tacticalScore << 17) | cappedPosition) >>> 0;
}

export function legacyRootUtility(geometry, p0Low, p0High, p1Low, p1High, tokenCount, rootPlayer, depthFromRoot) {
  const score0 = legacyCurrentScore(geometry, p0Low, p0High, p1Low, p1High, tokenCount);
  const score1 = legacyCurrentScore(geometry, p1Low, p1High, p0Low, p0High, tokenCount);
  const rootScore = rootPlayer === 0 ? score0 : score1;
  const opponentScore = rootPlayer === 0 ? score1 : score0;
  return (rootScore - opponentScore * LEGACY_ROOT_SCORE_RATIO) / depthScale(depthFromRoot);
}

export function winnerUtility(winner, rootPlayer, depthFromRoot) {
  if (winner === -1) return 0;
  return (winner === rootPlayer ? LEGACY_MAX_SAFE : LEGACY_MIN_SAFE) / depthScale(depthFromRoot);
}
