import assert from 'node:assert/strict';
import test from 'node:test';

import { IncumbentSearchEngine } from '../../components/incumbent/index.mjs';
import { loadSolvedActionCorpus } from '../../components/oracle/index.mjs';
import { measureStrengthCurve } from '../strength-lib.mjs';

const calibration = loadSolvedActionCorpus(new URL('../../reference/oracles/solved-actions-v1.meta.json', import.meta.url));
const spotchecks = loadSolvedActionCorpus(new URL('../../reference/oracles/beginning-spotchecks-v1.meta.json', import.meta.url));

const calibrationExpected = [
  [1, 111, 121, 60, 7],
  [2, 119, 126, 10, 2],
  [3, 122, 127, 9, 1],
  [4, 121, 125, 23, 3],
  [5, 125, 127, 8, 1],
  [6, 127, 128, 1, 0],
  [7, 126, 127, 3, 1],
  [8, 128, 128, 0, 0],
  [9, 128, 128, 0, 0],
  [10, 128, 128, 0, 0],
  [11, 128, 128, 0, 0],
  [12, 128, 128, 0, 0],
];

const spotcheckExpected = [
  [1, 27, 30, 3, 0],
  [2, 26, 30, 21, 0],
  [3, 21, 29, 36, 1],
  [4, 21, 29, 48, 1],
  [5, 25, 29, 32, 1],
  [6, 26, 30, 21, 0],
  [7, 26, 29, 14, 1],
  [8, 26, 29, 17, 1],
  [9, 26, 29, 17, 1],
  [10, 27, 29, 16, 1],
  [11, 28, 29, 15, 1],
  [12, 28, 29, 6, 1],
];

function assertCurve(vectors, expected) {
  const curve = measureStrengthCurve(vectors, { maxDepth: 12, ttCapacity: 262144 });
  assert.equal(curve.length, expected.length);
  for (let i = 0; i < expected.length; i++) {
    const [depth, optimal, resultClass, regret, resultClassDrops] = expected[i];
    const actual = curve[i];
    assert.equal(actual.depth, depth);
    assert.equal(actual.positions, vectors.length);
    assert.equal(actual.optimalMoves, optimal, `optimal depth ${depth}`);
    assert.equal(actual.resultClassPreserved, resultClass, `result class depth ${depth}`);
    assert.equal(actual.totalStrongRegret, regret, `regret depth ${depth}`);
    assert.equal(actual.resultClassDrops, resultClassDrops, `result-class drops depth ${depth}`);
  }
}

test('production incumbent strength curve matches the deterministic solved calibration corpus', () => {
  assert.equal(calibration.vectors.length, 128);
  assertCurve(calibration.vectors, calibrationExpected);
});

test('beginning solved spot-check curve remains separate and reproducible', () => {
  assert.equal(spotchecks.vectors.length, 30);
  assert.equal(spotchecks.provenance.selection.includes('not representative'), true);
  assertCurve(spotchecks.vectors, spotcheckExpected);
});

test('known solved result-class defect is present at depth 12 and corrected at depth 19', { timeout: 30000 }, () => {
  const vector = spotchecks.vectors.find((entry) => entry.sequence === '54676552255627');
  assert.ok(vector);
  const moves = Uint8Array.from(vector.sequence, (char) => char.charCodeAt(0) - 49);

  const depth12 = new IncumbentSearchEngine({ orderingPolicy: 'persistent-best-move' });
  const result12 = depth12.search(depth12.createPosition(moves), 12);
  assert.equal(result12.move, 2); // one-based column 3
  assert.equal(vector.moveScores[result12.move], -2);
  assert.equal(Math.sign(vector.moveScores[result12.move]), -1);
  assert.equal(Math.sign(vector.oracleScore), 1);

  const depth19 = new IncumbentSearchEngine({ orderingPolicy: 'persistent-best-move' });
  const result19 = depth19.search(depth19.createPosition(moves), 19);
  assert.equal(result19.move, 1); // one-based column 2
  assert.equal(vector.moveScores[result19.move], 2);
  assert.equal(vector.moveScores[result19.move], vector.oracleScore);
});
