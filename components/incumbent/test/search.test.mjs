import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { IncumbentSearchEngine } from '../index.mjs';

const searchVectors = JSON.parse(readFileSync(new URL('../../../reference/conformance/search-v1.json', import.meta.url), 'utf8'));
const selfPlayVectors = JSON.parse(readFileSync(new URL('../../../reference/conformance/legacy-selfplay-v1.json', import.meta.url), 'utf8'));

test('fixed-depth legacy-qualified search matches frozen move and score vectors exactly', () => {
  for (const vector of searchVectors) {
    const engine = new IncumbentSearchEngine({
      columns: vector.columns,
      rows: vector.rows,
      orderingPolicy: 'legacy-qualified',
    });
    const position = engine.createPosition(vector.moves);
    const result = engine.searchFixedDepth(position, vector.depth);
    assert.equal(result.move, vector.move, `${vector.id}: move`);
    assert.equal(result.score, vector.score, `${vector.id}: score`);
  }
});

test('tactical prepass preserves immediate win, forced block, and double-threat loss behavior', () => {
  const ids = ['immediate-win', 'forced-single-block', 'forced-double-loss'];
  for (const id of ids) {
    const vector = searchVectors.find((entry) => entry.id === id);
    const engine = new IncumbentSearchEngine({ orderingPolicy: 'legacy-qualified' });
    const result = engine.searchFixedDepth(engine.createPosition(vector.moves), vector.depth);
    if (id === 'immediate-win') assert.ok(result.metrics.tacticalImmediateWins > 0);
    if (id === 'forced-single-block') assert.ok(result.metrics.tacticalForcedBlocks > 0);
    if (id === 'forced-double-loss') assert.ok(result.metrics.tacticalDoubleThreatLosses > 0);
    assert.equal(result.move, vector.move);
    assert.equal(result.score, vector.score);
  }
});

test('legacy-qualified persistent self-play reproduces the historical depth 3 through 12 sequences', { timeout: 120000 }, () => {
  for (const vector of selfPlayVectors) {
    const engine = new IncumbentSearchEngine({ columns: 7, rows: 6, orderingPolicy: 'legacy-qualified' });
    const position = engine.createPosition();
    const moves = [];
    while (position.winner() === -1) {
      const result = engine.searchFixedDepth(position, vector.depth);
      assert.notEqual(result.move, null, `depth ${vector.depth}: nonterminal search returned no move`);
      moves.push(result.move);
      assert.ok(position.play(result.move) >= 0, `depth ${vector.depth}: illegal chosen move`);
    }
    const winner = position.winner() === 2 ? -1 : position.winner();
    assert.equal(winner, vector.winner, `depth ${vector.depth}: winner`);
    assert.deepEqual(moves, vector.moves, `depth ${vector.depth}: move sequence`);
  }
});
