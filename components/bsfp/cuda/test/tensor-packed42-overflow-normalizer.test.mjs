import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizeMaximalPacked42Antichain,
  normalizeMinimalPacked42Antichain,
} from '../../index.mjs';

const TWO32 = 0x1_0000_0000;

function low32(value) { return value >>> 0; }
function high10(value) { return Math.floor(value / TWO32) >>> 0; }
function popcount32(value) {
  let v = value >>> 0;
  let count = 0;
  while (v !== 0) {
    v = (v & (v - 1)) >>> 0;
    count += 1;
  }
  return count;
}

function packedFixture(values) {
  const lows = new Uint32Array(values.length);
  const highs = new Uint32Array(values.length);
  const popcounts = new Uint32Array(values.length);
  for (let i = 0; i < values.length; i += 1) {
    lows[i] = low32(values[i]);
    highs[i] = high10(values[i]);
    popcounts[i] = popcount32(lows[i]) + popcount32(highs[i]);
  }
  return { lows, highs, popcounts };
}

async function loadPortableTensor(t) {
  try {
    const [{ openCudaRuntimeForTesting }, { createTensorPacked42OverflowNormalizer }] = await Promise.all([
      import('cuda-js/testing'),
      import('../tensor-packed42-overflow-normalizer.mjs'),
    ]);
    return { openCudaRuntimeForTesting, createTensorPacked42OverflowNormalizer };
  } catch (error) {
    if (error?.code === 'ERR_MODULE_NOT_FOUND') {
      t.skip('portable Tensor sibling packages are not wired in this lane');
      return null;
    }
    throw error;
  }
}

for (const entry of [
  {
    direction: 'minimal',
    values: [1, 1, 3, 5, 2, 6, 4, 7, (1 + 2 ** 32), (1 + 2 ** 32)],
    authority: normalizeMinimalPacked42Antichain,
  },
  {
    direction: 'maximal',
    values: [3, 5, 6, 1, 2, 4, 3, (3 + 2 ** 32), (1 + 2 ** 32)],
    authority: normalizeMaximalPacked42Antichain,
  },
]) {
  test(`Tensor packed42 overflow ${entry.direction} matches packed CPU authority`, { timeout: 20_000 }, async (t) => {
    const loaded = await loadPortableTensor(t);
    if (!loaded) return;
    const runtime = await loaded.openCudaRuntimeForTesting({ compiler: true });
    const normalizer = await loaded.createTensorPacked42OverflowNormalizer(runtime, {
      candidateTile: 4,
      referenceTile: 4,
      maxWorkspaceBytes: 8 * 1024 * 1024,
      backend: 'simt',
    });
    try {
      const packed = packedFixture(entry.values);
      const result = await normalizer.normalize({ ...packed, direction: entry.direction });
      const expected = [...entry.authority(entry.values)].sort((a, b) => a - b);
      const actual = [...result.frontier].sort((a, b) => a - b);
      assert.deepEqual(actual, expected);
      assert(result.stats.duplicateCandidatesRemoved > 0);
      assert(normalizer.snapshotStats().tensorRuns > 0);
    } finally {
      await normalizer.close();
      assert.equal((await runtime.close()).graceful, true);
    }
  });
}
