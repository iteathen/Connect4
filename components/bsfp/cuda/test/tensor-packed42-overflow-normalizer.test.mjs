import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizeMaximalPacked42Antichain,
  normalizeMinimalPacked42Antichain,
} from '../../index.mjs';
import { TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES } from '../tensor-overflow-contract.mjs';
import { readCompactHybridOptions } from '../../../../experiments/cuda-bsfp-compact-hybrid/run.mjs';

const TWO32 = 0x1_0000_0000;

test('actual P2 runner and reducer configure the pinned resolved-SIMT profile', { timeout: 20_000 }, async (t) => {
  const loaded = await loadPortableTensor(t);
  if (!loaded) return;
  const { tensorOverflowOptions } = await import('../packed42-pair-reducer-tensor-service.mjs');
  const options = tensorOverflowOptions(readCompactHybridOptions({}).reducer);
  assert.deepEqual(options, { candidateTile: 256, referenceTile: 1024, maxWorkspaceBytes: 67108864, backend: 'simt' });
  assert.deepEqual(tensorOverflowOptions(), options);
  for (const bytes of [128 * 1024 ** 2, 192 * 1024 ** 2]) {
    assert.throws(() => readCompactHybridOptions({ BSFP_HYBRID_TENSOR_MAX_WORKSPACE_BYTES: String(bytes) }), /must not exceed/);
  }
  const runtime = await loaded.openCudaRuntimeForTesting({ compiler: true });
  const normalizer = await loaded.createTensorPacked42OverflowNormalizer(runtime, options);
  try {
    await assert.rejects(loaded.createTensorPacked42OverflowNormalizer(runtime, { maxWorkspaceBytes: 67108865 }), /must not exceed/);
    for (const direction of ['minimal', 'maximal']) {
      // Full production tile sizes and policy, not the reduced 4x4 fixture.
      const values = [1, 2, 12];
      const result = await normalizer.normalize({ ...packedFixture(values), direction });
      assert.deepEqual([...result.frontier].sort((a, b) => a - b), values);
    }
    assert(normalizer.snapshotStats().tensorRuns >= 2);
  } finally {
    await normalizer.close();
    assert.equal((await runtime.close()).graceful, true);
  }
});

function low32(value) { return value >>> 0; }

test('Tensor recovery retains a 150,000-record equal-cardinality frontier without argument-stack overflow', async (t) => {
  const loaded = await loadPortableTensor(t);
  if (!loaded) return;
  const values = [];
  let mask = (1 << 11) - 1;
  for (let i = 0; i < 150000; i++) {
    values.push(mask);
    const bit = mask & -mask;
    const next = mask + bit;
    mask = next | (((mask ^ next) >>> 2) / bit);
  }
  const runtime = await loaded.openCudaRuntimeForTesting({ compiler: true });
  const normalizer = await loaded.createTensorPacked42OverflowNormalizer(runtime);
  try {
    for (const direction of ['minimal', 'maximal']) {
      const result = await normalizer.normalize({ ...packedFixture(values), direction });
      assert.deepEqual(result.frontier, values);
    }
    // One cardinality contains no strict dominance: this exercises host
    // publication capacity, not fake-runtime numerical kernel semantics.
    assert.equal(normalizer.snapshotStats().tensorRuns, 0);
  } finally {
    await normalizer.close();
    assert.equal((await runtime.close()).graceful, true);
  }
});
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

// The CUDA-JS testing runtime proves compile/submit/lifecycle but does not execute
// native tensor arithmetic. These controls deliberately contain cross-cardinality
// comparisons whose correct result is "not dominated" so zeroed mock output is a
// valid wiring control. Positive dominance is qualified only by the native GPU
// micro-qualifier.
for (const entry of [
  {
    direction: 'minimal',
    values: [1, 1, 2, 2, 12, 12],
    authority: normalizeMinimalPacked42Antichain,
  },
  {
    direction: 'maximal',
    values: [3, 3, 12, 12, 16, 16],
    authority: normalizeMaximalPacked42Antichain,
  },
]) {
  test(`Tensor packed42 overflow ${entry.direction} portable wiring preserves non-dominated control`, { timeout: 20_000 }, async (t) => {
    const loaded = await loadPortableTensor(t);
    if (!loaded) return;
    const runtime = await loaded.openCudaRuntimeForTesting({ compiler: true });
    const normalizer = await loaded.createTensorPacked42OverflowNormalizer(runtime, {
      candidateTile: 4,
      referenceTile: 4,
      backend: 'simt',
    });
    try {
      assert.equal(normalizer.options.maxWorkspaceBytes, TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES);
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
