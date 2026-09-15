import {
  EVAL_PLAYER_SCORE_RATIO,
  MAX_SAFE,
  MIN_SAFE,
  POSITIONAL_INCREMENT,
} from './constants.mjs';

export function evaluatePlayerNonTerminal(position, player) {
  const p = position.profile;
  const lineState = position.lineState;
  const lineEmptyXor = position.lineEmptyXor;
  const heights = position.heights;
  let positionalScore = 0;
  let immediateThreatCount = 0;
  let hasSingleParityThreat = false;
  let parityMask = 0;

  for (let line = 0; line < p.lineCount; line++) {
    const state = lineState[line];
    const count0 = state & 7;
    const count1 = state >>> 3;
    const ownCount = player === 0 ? count0 : count1;
    const opponentCount = player === 0 ? count1 : count0;
    if (opponentCount !== 0) continue;

    positionalScore += ownCount * POSITIONAL_INCREMENT;
    if (ownCount !== 3) continue;

    const emptyCount = 4 - count0 - count1;
    if (emptyCount !== 1) continue;
    // With exactly one empty cell, the maintained XOR is that cell's exact identity.
    const emptyIndex = lineEmptyXor[line];
    const emptyRow = Math.floor(emptyIndex / p.columns);
    const emptyColumn = emptyIndex - emptyRow * p.columns;
    const emptyAtOrBelow = emptyRow - heights[emptyColumn] + 1;
    if (emptyAtOrBelow === 1) {
      // Preserve optimized legacy semantics: this line was visited once per owned token.
      immediateThreatCount += ownCount;
    } else if (emptyAtOrBelow > 1) {
      const totalParityToTarget = (((p.columns - 1) * p.rows) - position.ply + emptyRow + 1) & 1;
      if (totalParityToTarget === 1) hasSingleParityThreat = true;
      parityMask |= 1 << (emptyAtOrBelow & 1);
    }
  }

  const forkScore = immediateThreatCount > 1 ? 1 : 0;
  const tacticalScore = (hasSingleParityThreat || parityMask === 3) ? 1 : 0;
  const immediateThreatScore = immediateThreatCount === 1 ? 1 : 0;
  return ((forkScore << 18)
    | (tacticalScore << 17)
    | (immediateThreatScore << 16)
    | (Math.min(positionalScore, 65535) & 0xffff));
}

export function evaluatePlayer(position, player) {
  const winner = position.winner();
  if (winner !== -1) {
    if (winner === 2) return 0;
    return winner === player ? MAX_SAFE : MIN_SAFE;
  }
  return evaluatePlayerNonTerminal(position, player);
}

export function evaluateRootRaw(position, rootPlayer) {
  const p = position.profile;
  const lineState = position.lineState;
  const lineEmptyXor = position.lineEmptyXor;
  const heights = position.heights;
  let positional0 = 0;
  let positional1 = 0;
  let immediate0 = 0;
  let immediate1 = 0;
  let singleParity0 = false;
  let singleParity1 = false;
  let parityMask0 = 0;
  let parityMask1 = 0;

  for (let line = 0; line < p.lineCount; line++) {
    const state = lineState[line];
    const count0 = state & 7;
    const count1 = state >>> 3;

    if (count1 === 0) positional0 += count0 * POSITIONAL_INCREMENT;
    if (count0 === 0) positional1 += count1 * POSITIONAL_INCREMENT;
    if (count0 + count1 !== 3) continue;

    // Exactly one cell is empty here, so XOR of the remaining empties is its identity.
    const emptyIndex = lineEmptyXor[line];
    const emptyRow = Math.floor(emptyIndex / p.columns);
    const emptyColumn = emptyIndex - emptyRow * p.columns;
    const emptyAtOrBelow = emptyRow - heights[emptyColumn] + 1;
    if (count1 === 0 && count0 === 3) {
      if (emptyAtOrBelow === 1) immediate0 += 3;
      else if (emptyAtOrBelow > 1) {
        const totalParityToTarget = (((p.columns - 1) * p.rows) - position.ply + emptyRow + 1) & 1;
        if (totalParityToTarget === 1) singleParity0 = true;
        parityMask0 |= 1 << (emptyAtOrBelow & 1);
      }
    }
    if (count0 === 0 && count1 === 3) {
      if (emptyAtOrBelow === 1) immediate1 += 3;
      else if (emptyAtOrBelow > 1) {
        const totalParityToTarget = (((p.columns - 1) * p.rows) - position.ply + emptyRow + 1) & 1;
        if (totalParityToTarget === 1) singleParity1 = true;
        parityMask1 |= 1 << (emptyAtOrBelow & 1);
      }
    }
  }

  const score0 = (((immediate0 > 1 ? 1 : 0) << 18)
    | (((singleParity0 || parityMask0 === 3) ? 1 : 0) << 17)
    | ((immediate0 === 1 ? 1 : 0) << 16)
    | (Math.min(positional0, 65535) & 0xffff));
  const score1 = (((immediate1 > 1 ? 1 : 0) << 18)
    | (((singleParity1 || parityMask1 === 3) ? 1 : 0) << 17)
    | ((immediate1 === 1 ? 1 : 0) << 16)
    | (Math.min(positional1, 65535) & 0xffff));
  return rootPlayer === 0
    ? score0 - score1 * EVAL_PLAYER_SCORE_RATIO
    : score1 - score0 * EVAL_PLAYER_SCORE_RATIO;
}
