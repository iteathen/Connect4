import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { MAX_SAFE, MIN_SAFE } from '../constants.mjs';
import { IncumbentSearchEngine } from '../index.mjs';

const searchVectors = JSON.parse(readFileSync(new URL('../../../reference/conformance/search-v1.json', import.meta.url), 'utf8'));

test('fixed-depth depth-qualified search matches current move conformance vectors', () => {
  for (const vector of searchVectors) {
    const engine = new IncumbentSearchEngine({
      columns: vector.columns,
      rows: vector.rows,
      orderingPolicy: 'depth-qualified',
    });
    const position = engine.createPosition(vector.moves);
    const result = engine.searchFixedDepth(position, vector.depth);
    assert.equal(result.move, vector.move, `${vector.id}: move`);
  }
});

test('tactical prepass preserves exact immediate win, forced block, and double-threat classification', () => {
  const ids = ['immediate-win', 'forced-single-block', 'forced-double-loss'];
  for (const id of ids) {
    const vector = searchVectors.find((entry) => entry.id === id);
    const engine = new IncumbentSearchEngine({ orderingPolicy: 'depth-qualified' });
    const result = engine.searchFixedDepth(engine.createPosition(vector.moves), vector.depth);
    if (id === 'immediate-win') {
      assert.ok(result.metrics.tacticalImmediateWins > 0);
      assert.equal(result.score, vector.score);
    }
    if (id === 'forced-single-block') assert.ok(result.metrics.tacticalForcedBlocks > 0);
    if (id === 'forced-double-loss') {
      assert.ok(result.metrics.tacticalDoubleThreatLosses > 0);
      assert.equal(result.score, vector.score);
    }
    assert.equal(result.move, vector.move);
  }
});

test('double-threat certificate uses physical +2-ply terminal distance', () => {
  const vector = searchVectors.find((entry) => entry.id === 'forced-double-loss');
  const engine = new IncumbentSearchEngine({ orderingPolicy: 'depth-qualified' });
  const position = engine.createPosition(vector.moves);
  engine.rootPlayer = position.sideToMove;
  engine.targetDepth = 1;
  engine.metrics = engine.createMetrics();
  const score = engine.searchNode(position, 0, MIN_SAFE, MAX_SAFE);
  assert.equal(score, MIN_SAFE + 2);
  assert.equal(engine.metrics.tacticalDoubleThreatLosses, 1);
});

test('horizon exact frontier overrides heuristic evaluation only for certified decisive classes', () => {
  const immediate = searchVectors.find((entry) => entry.id === 'immediate-win');
  const immediateEngine = new IncumbentSearchEngine({ orderingPolicy: 'depth-qualified' });
  const immediatePosition = immediateEngine.createPosition(immediate.moves);
  immediateEngine.rootPlayer = immediatePosition.sideToMove;
  immediateEngine.targetDepth = 0;
  immediateEngine.metrics = immediateEngine.createMetrics();
  const immediateScore = immediateEngine.searchNode(immediatePosition, 0, MIN_SAFE, MAX_SAFE);
  assert.equal(immediateScore, MAX_SAFE - 1);
  assert.equal(immediateEngine.metrics.horizonExactImmediateWins, 1);
  assert.equal(immediateEngine.metrics.horizonExactDoubleThreatLosses, 0);
  assert.equal(immediateEngine.metrics.evaluatorCalls, 0);

  const doubleLoss = searchVectors.find((entry) => entry.id === 'forced-double-loss');
  const doubleEngine = new IncumbentSearchEngine({ orderingPolicy: 'depth-qualified' });
  const doublePosition = doubleEngine.createPosition(doubleLoss.moves);
  doubleEngine.rootPlayer = doublePosition.sideToMove;
  doubleEngine.targetDepth = 0;
  doubleEngine.metrics = doubleEngine.createMetrics();
  const doubleScore = doubleEngine.searchNode(doublePosition, 0, MIN_SAFE, MAX_SAFE);
  assert.equal(doubleScore, MIN_SAFE + 2);
  assert.equal(doubleEngine.metrics.horizonExactImmediateWins, 0);
  assert.equal(doubleEngine.metrics.horizonExactDoubleThreatLosses, 1);
  assert.equal(doubleEngine.metrics.evaluatorCalls, 0);

  const quietEngine = new IncumbentSearchEngine({ orderingPolicy: 'depth-qualified' });
  const quietPosition = quietEngine.createPosition();
  quietEngine.rootPlayer = quietPosition.sideToMove;
  quietEngine.targetDepth = 0;
  quietEngine.metrics = quietEngine.createMetrics();
  const quietScore = quietEngine.searchNode(quietPosition, 0, MIN_SAFE, MAX_SAFE);
  assert.ok(Number.isFinite(quietScore));
  assert.equal(quietEngine.metrics.horizonExactImmediateWins, 0);
  assert.equal(quietEngine.metrics.horizonExactDoubleThreatLosses, 0);
  assert.equal(quietEngine.metrics.evaluatorCalls, 1);
});

test('self-play is deterministic under current search semantics', { timeout: 120000 }, () => {
  for (const depth of [3, 6, 9]) {
    const run = () => {
      const engine = new IncumbentSearchEngine({ columns: 7, rows: 6, orderingPolicy: 'depth-qualified' });
      const position = engine.createPosition();
      const moves = [];
      while (position.winner() === -1) {
        const result = engine.searchFixedDepth(position, depth);
        assert.notEqual(result.move, null, `depth ${depth}: nonterminal search returned no move`);
        moves.push(result.move);
        assert.ok(position.play(result.move) >= 0, `depth ${depth}: illegal chosen move`);
      }
      return { winner: position.winner() === 2 ? -1 : position.winner(), moves };
    };

    assert.deepEqual(run(), run(), `depth ${depth}: self-play must be deterministic`);
  }
});
