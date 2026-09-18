import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BSFP_4X3_CONNECT3_DENSE_PROFILE,
  decodeBsfpWdlU32,
  encodeBsfpWdlU32,
} from '../dense-symbolic-profile.mjs';

test('dense 4x3 BSFP profile has finite exact symbolic table bounds', () => {
  const profile = BSFP_4X3_CONNECT3_DENSE_PROFILE;
  assert.equal(profile.cellCount, 12);
  assert.equal(profile.assignmentCount, 4096);
  assert.equal(profile.support.itemCapacity, 256);
  assert.equal(profile.tableElements, 1_048_576);
  assert.equal(profile.tableBytes, 4_194_304);
  assert.equal(profile.winningLineMasks.length, 14);
  assert.equal(profile.filledMasks[0], 0);
  assert.equal(profile.filledMasks[255], 4095);
  assert.equal(profile.filledMasks[1], 1);
  assert.equal(profile.filledMasks[4], 2);
});

test('dense WDL encoding preserves exact ordered result domain', () => {
  assert.deepEqual([-1, 0, 1].map(encodeBsfpWdlU32), [0, 1, 2]);
  assert.deepEqual([0, 1, 2].map(decodeBsfpWdlU32), [-1, 0, 1]);
});
