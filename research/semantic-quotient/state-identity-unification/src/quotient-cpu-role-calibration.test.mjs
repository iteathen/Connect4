import test from 'node:test';
import assert from 'node:assert/strict';
import {
  summarizeCpuSamples,
  classifyMeasuredCpus,
} from './quotient-cpu-role-calibration.mjs';

function measurements(sampleSets) {
  return sampleSets.map((samples, cpuId) => summarizeCpuSamples(cpuId, samples));
}

test('homogeneous CPUs do not invent an efficiency cluster', () => {
  const result = classifyMeasuredCpus(measurements([
    [490, 500, 495],
    [491, 501, 496],
    [492, 502, 497],
    [493, 503, 498],
  ]));
  assert.equal(result.accepted, false);
  assert.equal(result.confidence, 'homogeneous-or-unresolved');
  assert.deepEqual(result.performanceCpuIds, []);
  assert.deepEqual(result.efficiencyCpuIds, []);
});

test('stable separated clusters qualify as performance and efficiency CPUs', () => {
  const result = classifyMeasuredCpus(measurements([
    [500, 510, 505],
    [495, 505, 500],
    [270, 275, 272],
    [265, 270, 268],
  ]));
  assert.equal(result.accepted, true);
  assert.equal(result.confidence, 'high');
  assert.deepEqual(result.performanceCpuIds, [0, 1]);
  assert.deepEqual(result.efficiencyCpuIds, [2, 3]);
  assert.ok(result.robustGapRatio > 1.05);
});

test('bimodal noisy samples reject a false P/E split', () => {
  const result = classifyMeasuredCpus(measurements([
    [505, 481, 252],
    [255, 496, 482],
    [252, 257, 256],
    [244, 501, 503],
    [477, 259, 249],
  ]));
  assert.equal(result.accepted, false);
  assert.equal(result.confidence, 'low-sample-stability');
  assert.deepEqual(result.performanceCpuIds, []);
  assert.deepEqual(result.efficiencyCpuIds, []);
  assert.ok(result.robustGapRatio < 1);
});
