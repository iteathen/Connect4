import assert from 'node:assert/strict';
import test from 'node:test';

import { loadSolvedActionCorpus } from '../corpus.mjs';
import { ExactConnect4Oracle } from '../exact7x6.mjs';

const calibration = loadSolvedActionCorpus(new URL('../../../reference/oracles/solved-actions-v1.meta.json', import.meta.url));
const spotchecks = loadSolvedActionCorpus(new URL('../../../reference/oracles/beginning-spotchecks-v1.meta.json', import.meta.url));

function assertParentCheckpoints(vectors) {
  const oracle = new ExactConnect4Oracle();
  for (const vector of vectors) {
    oracle.reset();
    assert.equal(oracle.solveSequence(vector.sequence), vector.oracleScore, vector.sequence);
  }
}

function assertActionScores(vectors) {
  const oracle = new ExactConnect4Oracle();
  for (const vector of vectors) {
    oracle.reset();
    const actual = Array.from(oracle.analyzeSequence(vector.sequence));
    assert.deepEqual(actual, vector.moveScores, vector.sequence);
    let best = -1000;
    for (let i = 0; i < actual.length; i++) if (actual[i] > best) best = actual[i];
    assert.equal(best, vector.oracleScore, vector.sequence);
  }
}

test('oracle corpus provenance binds to independently mirrored Pons test-set blobs', () => {
  assert.equal(calibration.provenance.gitBlobShaBySet.Test_L3_R1, '180daa64dc3f52f3ac931be95c99c964945554b2');
  assert.equal(calibration.provenance.gitBlobShaBySet.Test_L2_R1, '66089b7cf493c00e44f23ddcf12ad1ea0fe8a1a8');
  assert.equal(spotchecks.provenance.gitBlobShaBySet.Test_L1_R1, '125e3d872dfec4ea13fe09641606dff992f152ee');
  assert.equal(spotchecks.provenance.gitBlobShaBySet.Test_L1_R2, '481876168e3690e6bf080c56683b9d506e5ddd58');
});

test('158 external Pons parent-score checkpoints match exactly', { timeout: 30000 }, () => {
  assert.equal(calibration.vectors.length, 128);
  assert.equal(spotchecks.vectors.length, 30);
  assertParentCheckpoints(calibration.vectors);
  assertParentCheckpoints(spotchecks.vectors);
});

test('deterministic calibration action scores are regenerated exactly by the qualified oracle', { timeout: 30000 }, () => {
  assertActionScores(calibration.vectors);
});

test('bounded beginning spot-check action scores are regenerated exactly by the qualified oracle', { timeout: 60000 }, () => {
  assertActionScores(spotchecks.vectors);
});
