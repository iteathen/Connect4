import assert from 'node:assert/strict';
import test from 'node:test';

import { IncumbentSearchEngine } from '../index.mjs';

test('shallower inherited entries order moves but do not supply cross-generation scores', () => {
  const engine = new IncumbentSearchEngine({ orderingPolicy: 'persistent-best-move' });
  const position = engine.createPosition();
  engine.searchFixedDepth(position, 3);
  const deeper = engine.searchFixedDepth(position, 4);
  assert.ok(deeper.metrics.ttInsufficientDepthHits > 0);
  assert.ok(deeper.metrics.ttShallowOrderingHits > 0);
  assert.equal(deeper.metrics.ttCrossGenerationScoreHits, 0);
});

test('reroot preserves search memory while enforcing root-perspective score identity', () => {
  const engine = new IncumbentSearchEngine({ orderingPolicy: 'persistent-best-move' });
  const position = engine.createPosition();

  const first = engine.search(position, 6);
  assert.ok(position.play(first.move) >= 0);

  const oppositePerspective = engine.search(position, 6);
  assert.ok(oppositePerspective.metrics.ttCrossGenerationPositionHits > 0);
  assert.ok(oppositePerspective.metrics.ttCrossPerspectiveOrderingHits > 0);
  assert.equal(oppositePerspective.metrics.ttCrossGenerationScoreHits, 0);
  assert.ok(position.play(oppositePerspective.move) >= 0);

  const samePerspectiveAgain = engine.search(position, 6);
  assert.ok(samePerspectiveAgain.metrics.ttCrossGenerationPositionHits > 0);
  assert.ok(samePerspectiveAgain.metrics.ttCrossGenerationScoreHits > 0);
});

test('explicit reset isolates benchmark experiments without changing production persistence policy', () => {
  const engine = new IncumbentSearchEngine({ orderingPolicy: 'persistent-best-move' });
  const position = engine.createPosition();
  engine.search(position, 5);
  engine.resetSearchMemory();
  const isolated = engine.search(position, 5);
  assert.equal(isolated.metrics.ttCrossGenerationPositionHits, 0);
  assert.equal(isolated.metrics.ttCrossGenerationScoreHits, 0);
});
