import {
  EVAL_PLAYER_SCORE_RATIO,
  MAX_SAFE,
  MIN_SAFE,
  POSITIONAL_INCREMENT,
} from './constants.mjs';

export function evaluatePlayerNonTerminal(position, player) {
  const p = position.profile;
  const cells = position.cells;
  const lines = p.lineCells;
  const heights = position.heights;
  const encoded = player + 1;
  let positionalScore = 0;
  let immediateThreatCount = 0;
  let hasSingleParityThreat = false;
  let parityMask = 0;

  for (let line = 0, base = 0; line < p.lineCount; line++, base += 4) {
    let ownCount = 0;
    let opponentCount = 0;
    let emptyCount = 0;
    let emptyIndex = -1;

    let cellIndex = lines[base];
    let cell = cells[cellIndex];
    if (cell === encoded) ownCount++; else if (cell === 0) { emptyCount++; emptyIndex = cellIndex; } else opponentCount++;
    cellIndex = lines[base + 1];
    cell = cells[cellIndex];
    if (cell === encoded) ownCount++; else if (cell === 0) { emptyCount++; emptyIndex = cellIndex; } else opponentCount++;
    cellIndex = lines[base + 2];
    cell = cells[cellIndex];
    if (cell === encoded) ownCount++; else if (cell === 0) { emptyCount++; emptyIndex = cellIndex; } else opponentCount++;
    cellIndex = lines[base + 3];
    cell = cells[cellIndex];
    if (cell === encoded) ownCount++; else if (cell === 0) { emptyCount++; emptyIndex = cellIndex; } else opponentCount++;

    if (opponentCount !== 0) continue;
    positionalScore += ownCount * POSITIONAL_INCREMENT;
    if (ownCount !== 3 || emptyCount !== 1) continue;

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
  const cells = position.cells;
  const lines = p.lineCells;
  const heights = position.heights;
  let positional0 = 0;
  let positional1 = 0;
  let immediate0 = 0;
  let immediate1 = 0;
  let singleParity0 = false;
  let singleParity1 = false;
  let parityMask0 = 0;
  let parityMask1 = 0;

  for (let line = 0, base = 0; line < p.lineCount; line++, base += 4) {
    let count0 = 0;
    let count1 = 0;
    let emptyCount = 0;
    let emptyIndex = -1;

    let cellIndex = lines[base];
    let cell = cells[cellIndex];
    if (cell === 1) count0++; else if (cell === 2) count1++; else { emptyCount++; emptyIndex = cellIndex; }
    cellIndex = lines[base + 1];
    cell = cells[cellIndex];
    if (cell === 1) count0++; else if (cell === 2) count1++; else { emptyCount++; emptyIndex = cellIndex; }
    cellIndex = lines[base + 2];
    cell = cells[cellIndex];
    if (cell === 1) count0++; else if (cell === 2) count1++; else { emptyCount++; emptyIndex = cellIndex; }
    cellIndex = lines[base + 3];
    cell = cells[cellIndex];
    if (cell === 1) count0++; else if (cell === 2) count1++; else { emptyCount++; emptyIndex = cellIndex; }

    if (count1 === 0) positional0 += count0 * POSITIONAL_INCREMENT;
    if (count0 === 0) positional1 += count1 * POSITIONAL_INCREMENT;
    if (emptyCount !== 1) continue;

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
