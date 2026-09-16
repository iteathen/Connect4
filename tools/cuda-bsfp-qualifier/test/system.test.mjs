import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNvidiaGpu } from '../system.mjs';

test('GPU performance telemetry preserves unsupported readings as null, never zero', () => {
  const full = parseNvidiaGpu('GPU, 610, 6144, 5000, 1000, 7.5, 42, 12, 33.5, 1500, 6000', 0, true, true);
  assert.equal(full.utilizationGpuPercent, 42);
  assert.equal(full.powerDrawWatts, 33.5);
  const unavailable = parseNvidiaGpu('GPU, 610, 6144, 5000, 1000, 7.5, N/A, [Not Supported], N/A, 0,', 0, true, true);
  assert.equal(unavailable.available, true);
  assert.equal(unavailable.utilizationGpuPercent, null);
  assert.equal(unavailable.memoryClockMHz, null);
  assert.equal(unavailable.smClockMHz, 0);
  assert.equal(parseNvidiaGpu('GPU, 610, , 5000, 1000').available, false);
  assert.equal(parseNvidiaGpu('GPU, 610, 6144, N/A, 1000').available, false);
});
