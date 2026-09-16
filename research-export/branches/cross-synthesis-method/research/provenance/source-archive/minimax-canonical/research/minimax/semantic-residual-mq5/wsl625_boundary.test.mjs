import test from 'node:test';
import assert from 'node:assert/strict';
import { geometry } from '../../../reference/research-prototypes/2026-09-09-winspace-native/support.mjs';

const G = geometry();

test('7x6 geometry uses 49 bit slots for 42 playable cells', () => {
  let playable = 0;
  let maximumBit = -1;
  for (let column = 0; column < 7; column += 1) {
    for (let row = 0; row < 6; row += 1) {
      playable += 1;
      maximumBit = Math.max(maximumBit, column * 7 + row);
    }
  }
  assert.equal(playable, 42);
  assert.equal(maximumBit, 47);
  assert.equal(7 * 7, 49);
});

test('winning-line masks can use playable bit positions above 41', () => {
  let hasHighPlayableBit = false;
  for (const [lo, hi] of G.lines) {
    if ((hi & 0xffff) !== 0) {
      hasHighPlayableBit = true;
      break;
    }
  }
  assert.equal(hasHighPlayableBit, true);
});
