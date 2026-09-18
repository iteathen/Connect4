import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BSFP_4X3_CONNECT3_SUPPORT,
  BSFP_INVALID_ITEM_U32,
  createBsfpSupportLatticeProfile,
  createBsfpSupportPredecessorDeviceLibraryRequest,
} from '../index.mjs';

test('4x3 connect-3 BSFP support lattice has the qualified finite shape', () => {
  const profile = BSFP_4X3_CONNECT3_SUPPORT;
  assert.equal(profile.columns, 4);
  assert.equal(profile.rows, 3);
  assert.equal(profile.connect, 3);
  assert.equal(profile.radix, 4);
  assert.equal(profile.itemCapacity, 256);
  assert.equal(profile.maxRank, 12);
  assert.equal(profile.maxEmissionsPerItem, 4);

  assert.equal(profile.encodeHeights([0, 0, 0, 0]), 0);
  assert.equal(profile.encodeHeights([3, 3, 3, 3]), 255);
  assert.deepEqual([...profile.decodeHeights(255)], [3, 3, 3, 3]);
  assert.equal(profile.rankOf(255), 12);
  assert.equal(profile.ranks[0], 0);
  assert.equal(profile.ranks[255], 12);
});

test('support predecessor derivation is exact inverse support movement and strictly lowers rank', () => {
  const profile = BSFP_4X3_CONNECT3_SUPPORT;
  assert.deepEqual(
    [0, 1, 2, 3].map((lane) => profile.derivePredecessorIndex(255, lane)),
    [254, 251, 239, 191],
  );

  for (let source = 0; source < profile.itemCapacity; source += 1) {
    const heights = profile.decodeHeights(source);
    for (let lane = 0; lane < profile.maxEmissionsPerItem; lane += 1) {
      const target = profile.derivePredecessorIndex(source, lane);
      if (heights[lane] === 0) {
        assert.equal(target, BSFP_INVALID_ITEM_U32);
        continue;
      }
      assert.equal(profile.rankOf(target), profile.rankOf(source) - 1);
      const expected = [...heights];
      expected[lane] -= 1;
      assert.equal(target, profile.encodeHeights(expected));
    }
  }
});

test('support predecessor Device-JS library mirrors the consumer-owned finite index/lane contract', () => {
  const profile = BSFP_4X3_CONNECT3_SUPPORT;
  const request = createBsfpSupportPredecessorDeviceLibraryRequest(profile);
  assert.deepEqual(request.exports, ['deriveSupportPredecessor']);
  assert.equal(request.functions.length, 1);
  assert.deepEqual(
    request.functions[0].parameters.map((parameter) => parameter.type),
    ['u32', 'u32'],
  );
  assert.equal(request.functions[0].returns, 'u32');
  assert.match(request.source, /emissionLane >= gpu\.u32\(4\)/);
  assert.match(request.source, /gpu\.u32\(4294967295\)/);
});

test('support lattice construction remains geometry-driven within the u32 profile', () => {
  const profile = createBsfpSupportLatticeProfile({ columns: 5, rows: 3, connect: 4 });
  assert.equal(profile.itemCapacity, 1024);
  assert.equal(profile.maxRank, 15);
  assert.equal(profile.maxEmissionsPerItem, 5);
  const index = profile.encodeHeights([1, 2, 3, 0, 1]);
  assert.deepEqual([...profile.decodeHeights(index)], [1, 2, 3, 0, 1]);
});
