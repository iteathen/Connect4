import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  PrimitivePosition,
  createProfile,
  evaluatePlayer,
  evaluateRootRaw,
} from '../index.mjs';

const evaluatorVectors = JSON.parse(readFileSync(new URL('../../../reference/conformance/evaluator-v1.json', import.meta.url), 'utf8'));

test('generic profile retains standard 7x6 geometry without making it an implementation limit', () => {
  assert.equal(createProfile(7, 6).lineCount, 69);
  assert.equal(createProfile(4, 4).columns, 4);
  assert.equal(createProfile(5, 4).rows, 4);
  assert.equal(createProfile(8, 7).cellCount, 56);
  assert.notEqual(createProfile(4, 4), createProfile(7, 6));
});

test('frozen incumbent evaluator vectors match exactly across board profiles', () => {
  for (const vector of evaluatorVectors) {
    const position = new PrimitivePosition(vector.columns, vector.rows, vector.moves);
    const winner = position.winner();
    assert.equal(winner === -1 ? null : winner, vector.winner, `${vector.id}: winner`);
    assert.equal(position.sideToMove, vector.sideToMove, `${vector.id}: side to move`);
    assert.equal(evaluatePlayer(position, 0), vector.player0Score, `${vector.id}: player 0 score`);
    assert.equal(evaluatePlayer(position, 1), vector.player1Score, `${vector.id}: player 1 score`);
  }
});

test('live-line positional field naturally prefers center investment over edge investment', () => {
  const center = new PrimitivePosition(7, 6, [3]);
  const edge = new PrimitivePosition(7, 6, [0]);
  assert.equal(evaluatePlayer(center, 0), 140);
  assert.equal(evaluatePlayer(edge, 0), 60);
  assert.ok(evaluatePlayer(center, 0) > evaluatePlayer(edge, 0));
});

test('optimized repeated-immediate promotion remains observable incumbent behavior', () => {
  const vector = evaluatorVectors.find((entry) => entry.id === 'repeated-immediate-quirk');
  const position = new PrimitivePosition(vector.columns, vector.rows, vector.moves);
  assert.equal(position.isWinningMove(0, 1), true);
  assert.equal(evaluatePlayer(position, 1), 262364);
});

test('root utility remains explicitly asymmetric rather than negamax-compatible', () => {
  const vector = evaluatorVectors.find((entry) => entry.id === 'repeated-immediate-quirk');
  const position = new PrimitivePosition(vector.columns, vector.rows, vector.moves);
  const root0 = evaluateRootRaw(position, 0);
  const root1 = evaluateRootRaw(position, 1);
  assert.notEqual(root0, -root1);
});
