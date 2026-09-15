import assert from 'node:assert/strict';
import test from 'node:test';

import { PrimitivePosition } from '../index.mjs';

const EFFECT_OWN_PLAYABLE_SINGLETON_MASK = 0x03;
const EFFECT_EXPOSES_OPPONENT_SINGLETON = 0x04;

function predictedQuietSuccessorEffects(position, column, player) {
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

    if (firstOwnCompletion < 0) firstOwnCompletion = remaining;
    else if (remaining !== firstOwnCompletion) return effects | 2;
  }

  return effects | (firstOwnCompletion >= 0 ? 1 : 0);
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

function isQuiet(position) {
  if (position.winner() !== -1) return false;
  return countPlayableSingletonCells(position, 0) === 0
    && countPlayableSingletonCells(position, 1) === 0;
}

function realizedQuietSuccessorEffects(position, column, player) {
  position.applyUnchecked(column);
  const ownPlayable = Math.min(countPlayableSingletonCells(position, player), 2);
  const opponentPlayable = countPlayableSingletonCells(position, 1 - player) !== 0;
  position.undoUnchecked();
  return ownPlayable | (opponentPlayable ? EFFECT_EXPOSES_OPPONENT_SINGLETON : 0);
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

test('quiet native singleton-effect descriptor matches the realized child frontier', () => {
  const geometries = [[4, 4], [5, 4], [7, 6], [8, 6], [6, 7]];
  const random = createRandom(0x51a6e770);
  let qualifiedMoves = 0;

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
            assert.ok((predicted & EFFECT_OWN_PLAYABLE_SINGLETON_MASK) <= 2);
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
});
