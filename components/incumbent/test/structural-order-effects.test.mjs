import assert from 'node:assert/strict';
import test from 'node:test';

import { PrimitivePosition } from '../index.mjs';

const EFFECT_OWN_PLAYABLE_SINGLETON_MASK = 0x03;
const EFFECT_EXPOSES_OPPONENT_SINGLETON = 0x04;
const EFFECT_OPPONENT_SUPPRESSION_SHIFT = 3;
const EFFECT_OPPONENT_SUPPRESSION_MASK = 0x18;

function predictedQuietSuccessorEffects(position, column, player) {
  const p = position.profile;
  const heights = position.heights;
  const row = heights[column];
  const index = row * p.columns + column;
  const ownRefs = player === 0 ? position.singletonRefs0 : position.singletonRefs1;
  const opponentRefs = player === 0 ? position.singletonRefs1 : position.singletonRefs0;
  let effects = 0;
  let firstOwnCompletion = -1;
  let opponentSuppressionClass = 0;

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

    if (ownCount === 0 && opponentCount > opponentSuppressionClass && opponentCount < 3) {
      opponentSuppressionClass = opponentCount;
    }

    if (ownCount !== 2 || opponentCount !== 0) continue;

    const remaining = position.lineEmptyXor[line] ^ index;
    const remainingColumn = remaining % p.columns;
    const remainingRow = (remaining / p.columns) | 0;
    const playableAfterMove = remainingColumn === column
      ? remainingRow === row + 1
      : heights[remainingColumn] === remainingRow;
    if (!playableAfterMove) continue;

    if (firstOwnCompletion < 0) firstOwnCompletion = remaining;
    else if (remaining !== firstOwnCompletion) return effects | 2;
  }

  if (firstOwnCompletion >= 0) return effects | 1;
  return effects | (opponentSuppressionClass << EFFECT_OPPONENT_SUPPRESSION_SHIFT);
}

function countPlayableSingletonCells(position, player) {
  const p = position.profile;
  const refs = player === 0 ? position.singletonRefs0 : position.singletonRefs1;
  let count = 0;
  for (let column = 0; column < p.columns; column++) {
    const row = position.heights[column];
    if (row >= p.rows) continue;
    const index = row * p.columns + column;
    if (refs[index] !== 0) count++;
  }
  return count;
}

function bruteOpponentSuppressionClass(position, column, player) {
  const p = position.profile;
  const row = position.heights[column];
  const index = row * p.columns + column;
  const ownEncoded = player + 1;
  const opponentEncoded = 2 - player;
  let suppressionClass = 0;

  const start = p.positionLineOffsets[index];
  const end = p.positionLineOffsets[index + 1];
  for (let at = start; at < end; at++) {
    const base = p.positionLineIndices[at] << 2;
    let ownCount = 0;
    let opponentCount = 0;
    for (let j = 0; j < 4; j++) {
      const cell = position.cells[p.lineCells[base + j]];
      if (cell === ownEncoded) ownCount++;
      else if (cell === opponentEncoded) opponentCount++;
    }
    if (ownCount === 0 && opponentCount > suppressionClass && opponentCount < 3) {
      suppressionClass = opponentCount;
    }
  }
  return suppressionClass;
}

function isQuiet(position) {
  if (position.winner() !== -1) return false;
  return countPlayableSingletonCells(position, 0) === 0
    && countPlayableSingletonCells(position, 1) === 0;
}

function realizedQuietSuccessorEffects(position, column, player) {
  const suppressionClass = bruteOpponentSuppressionClass(position, column, player);
  position.applyUnchecked(column);
  const ownPlayable = Math.min(countPlayableSingletonCells(position, player), 2);
  const opponentPlayable = countPlayableSingletonCells(position, 1 - player) !== 0;
  position.undoUnchecked();
  const frontierEffects = ownPlayable | (opponentPlayable ? EFFECT_EXPOSES_OPPONENT_SINGLETON : 0);
  if (ownPlayable !== 0) return frontierEffects;
  return frontierEffects | (suppressionClass << EFFECT_OPPONENT_SUPPRESSION_SHIFT);
}

function createRandom(seed) {
  let state = seed >>> 0;
  return (limit) => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state % limit;
  };
}

test('quiet native structural-effect descriptor matches tiered child effects', () => {
  const geometries = [[4, 4], [5, 4], [7, 6], [8, 6], [6, 7]];
  const random = createRandom(0x51a6e770);
  let qualifiedMoves = 0;
  let qualifiedSuppressionMoves = 0;

  for (const [columns, rows] of geometries) {
    for (let trial = 0; trial < 240; trial++) {
      const position = new PrimitivePosition(columns, rows);
      const limit = random(position.profile.cellCount + 1);

      for (let step = 0; step <= limit; step++) {
        if (isQuiet(position)) {
          const player = position.sideToMove;
          for (let column = 0; column < columns; column++) {
            if (position.heights[column] >= rows) continue;
            const predicted = predictedQuietSuccessorEffects(position, column, player);
            const realized = realizedQuietSuccessorEffects(position, column, player);
            assert.equal(
              predicted,
              realized,
              `${columns}x${rows} trial ${trial} ply ${position.ply} column ${column}`,
            );
            const singletonClass = predicted & EFFECT_OWN_PLAYABLE_SINGLETON_MASK;
            const suppressionClass = (predicted & EFFECT_OPPONENT_SUPPRESSION_MASK)
              >>> EFFECT_OPPONENT_SUPPRESSION_SHIFT;
            assert.ok(singletonClass <= 2);
            assert.ok(suppressionClass <= 2);
            if (singletonClass !== 0) assert.equal(suppressionClass, 0, 'suppression must be absent inside stronger singleton tier');
            if (suppressionClass !== 0) qualifiedSuppressionMoves++;
            qualifiedMoves++;
          }
        }

        if (step === limit || position.winner() !== -1) break;
        const legal = [];
        for (let column = 0; column < columns; column++) {
          if (position.heights[column] < rows) legal.push(column);
        }
        if (legal.length === 0) break;
        position.applyUnchecked(legal[random(legal.length)]);
      }
    }
  }

  assert.ok(qualifiedMoves > 10_000, `expected broad qualification coverage, got ${qualifiedMoves}`);
  assert.ok(qualifiedSuppressionMoves > 1_000, `expected broad suppression coverage, got ${qualifiedSuppressionMoves}`);
});
