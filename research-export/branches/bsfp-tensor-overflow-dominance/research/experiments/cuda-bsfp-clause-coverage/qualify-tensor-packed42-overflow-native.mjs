import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { CUDA_JS_COMPATIBILITY, openCudaRuntime } from 'cuda-js';
import { CUDA_JS_TENSOR_COMPATIBILITY } from 'cuda-js-tensor';

import {
  normalizeMaximalPacked42Antichain,
  normalizeMinimalPacked42Antichain,
} from '../../../components/bsfp/index.mjs';
import { createTensorPacked42OverflowNormalizer } from '../../../components/bsfp/cuda/tensor-packed42-overflow-normalizer.mjs';

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
  return Object.freeze({ lows, highs, popcounts });
}

const cases = Object.freeze([
  Object.freeze({
    direction: 'minimal',
    values: Object.freeze([1, 1, 3, 5, 2, 6, 4, 7, 1 + 2 ** 32, 1 + 2 ** 32]),
    authority: normalizeMinimalPacked42Antichain,
  }),
  Object.freeze({
    direction: 'maximal',
    values: Object.freeze([3, 5, 6, 1, 2, 4, 3, 3 + 2 ** 32, 1 + 2 ** 32]),
    authority: normalizeMaximalPacked42Antichain,
  }),
]);

const started = performance.now();
let runtime;
let normalizer;
try {
  assert.equal(CUDA_JS_COMPATIBILITY.package?.version, '0.1.0-alpha.20', 'native Tensor overflow qualifier requires CUDA-JS alpha.20');
  assert.equal(CUDA_JS_TENSOR_COMPATIBILITY.cudaJs.version, '0.1.0-alpha.20', 'Tensor exact pair must target CUDA-JS alpha.20');
  assert.equal(
    CUDA_JS_TENSOR_COMPATIBILITY.cudaJs.protectedMainRevision,
    '98e2ebc942c14d63acf4dd82e912dd548c363a05',
    'Tensor exact pair must target the P2 CUDA-JS revision',
  );

  runtime = await openCudaRuntime({ compiler: true });
  normalizer = await createTensorPacked42OverflowNormalizer(runtime, {
    candidateTile: 4,
    referenceTile: 4,
    maxWorkspaceBytes: 8 * 1024 * 1024,
    backend: 'simt',
  });

  const results = [];
  for (const entry of cases) {
    const caseStarted = performance.now();
    const result = await normalizer.normalize({ ...packedFixture(entry.values), direction: entry.direction });
    const expected = [...entry.authority(entry.values)].sort((a, b) => a - b);
    const actual = [...result.frontier].sort((a, b) => a - b);
    assert.deepEqual(actual, expected, `${entry.direction} Tensor overflow frontier disagrees with packed CPU authority`);
    assert(result.stats.duplicateCandidatesRemoved > 0, `${entry.direction} fixture must exercise exact duplicate removal`);
    results.push(Object.freeze({
      direction: entry.direction,
      inputCandidates: entry.values.length,
      expectedFrontier: expected,
      actualFrontier: actual,
      duplicateCandidatesRemoved: result.stats.duplicateCandidatesRemoved,
      durationMs: performance.now() - caseStarted,
    }));
  }

  const stats = normalizer.snapshotStats();
  assert(stats.tensorRuns > 0, 'native qualifier must execute Tensor work');
  assert(stats.comparisonPairs > 0, 'native qualifier must execute positive cross-cardinality comparison work');

  console.log(JSON.stringify({
    schemaVersion: 1,
    kind: 'connect4-bsfp-tensor-packed42-overflow-native-qualification',
    outcome: 'native-tensor-packed42-overflow-pass',
    cudaJs: {
      version: CUDA_JS_COMPATIBILITY.package.version,
      tensorAcceptedRevision: CUDA_JS_TENSOR_COMPATIBILITY.cudaJs.protectedMainRevision,
    },
    cases: results,
    tensor: stats,
    timingsMs: { processToResult: performance.now() - started },
  }, null, 2));
} finally {
  if (normalizer) await normalizer.close();
  if (runtime) {
    const closed = await runtime.close();
    assert.equal(closed.graceful, true, 'native Tensor overflow qualifier runtime cleanup must be graceful');
  }
}
