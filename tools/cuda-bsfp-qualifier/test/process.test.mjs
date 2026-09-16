import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseJsonStdout, runLoggedChild } from '../process.mjs';
const fixture = fileURLToPath(new URL('./fixtures/child.mjs', import.meta.url));
test('logged child captures JSON output and exit status', async () => { const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bsfp-q1-child-')); const result = await runLoggedChild({ command: process.execPath, args: [fixture, 'ok'], cwd: root, stdoutPath: path.join(root, 'stdout.log'), stderrPath: path.join(root, 'stderr.log'), timeoutMs: 2000, gpuIndex: 0, emergencyFreeMiB: 0, sampleIntervalMs: 5000 }); assert.equal(result.exitCode, 0); assert.equal(result.timedOut, false); assert.deepEqual(parseJsonStdout(result.stdoutTail), { outcome: 'ok', value: 7 }); });
test('logged child enforces timeout without losing the outer runner', async () => { const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bsfp-q1-timeout-')); const result = await runLoggedChild({ command: process.execPath, args: [fixture, 'hang'], cwd: root, stdoutPath: path.join(root, 'stdout.log'), stderrPath: path.join(root, 'stderr.log'), timeoutMs: 100, gpuIndex: 0, emergencyFreeMiB: 0, sampleIntervalMs: 5000 }); assert.equal(result.timedOut, true); });

test('telemetry survives timeout and unavailable performance does not disable VRAM abort', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bsfp-q1-telemetry-'));
  try {
    let calls = 0;
    const result = await runLoggedChild({ command: process.execPath, args: [fixture, 'hang'], cwd: root,
      stdoutPath: path.join(root, 'stdout.log'), stderrPath: path.join(root, 'stderr.log'),
      timeoutMs: 3000, gpuIndex: 0, emergencyFreeMiB: 256, sampleIntervalMs: 30,
      sampleGpu: async () => ({ available: true, freeMiB: ++calls > 1 ? 200 : 1000, usedMiB: 900,
        utilizationGpuPercent: calls === 1 ? 40 : null }) });
    assert.equal(result.memorySafetyAbort, true);
    assert.equal(result.timedOut, false);
    assert.equal(result.gpuTelemetry.performance.utilizationGpuPercent.mean, 40);
    const samples = fs.readFileSync(path.join(root, 'gpu-telemetry.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
    assert(samples.length >= 2);
    assert.equal(samples[0].utilizationGpuPercent, 40);
    assert(samples.every(sample => sample.elapsedMs >= sample.requestedElapsedMs));
  } finally { fs.rmSync(root, { recursive: true }); }
});
