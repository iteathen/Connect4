import fs from 'node:fs';
import path from 'node:path';
import { execFile, spawn } from 'node:child_process';
import { once } from 'node:events';
import { queryNvidiaGpu } from './system.mjs';
function appendTail(current, chunk, maximum = 1024 * 1024) { const combined = current + chunk; return combined.length <= maximum ? combined : combined.slice(combined.length - maximum); }
function terminateProcessTree(child) {
  if (!child?.pid) return;
  if (process.platform === 'win32') { execFile('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true }, () => {}); return; }
  try { process.kill(-child.pid, 'SIGTERM'); } catch { try { child.kill('SIGTERM'); } catch {} }
  const timer = setTimeout(() => { try { process.kill(-child.pid, 'SIGKILL'); } catch { try { child.kill('SIGKILL'); } catch {} } }, 3000); timer.unref?.();
}
export function parseJsonStdout(text) { const trimmed = text.trim(); if (!trimmed) return null; try { return JSON.parse(trimmed); } catch {} const first = trimmed.indexOf('{'); const last = trimmed.lastIndexOf('}'); if (first >= 0 && last > first) { try { return JSON.parse(trimmed.slice(first, last + 1)); } catch {} } return null; }
export async function runLoggedChild({ command, args, cwd, stdoutPath, stderrPath, timeoutMs, gpuIndex, emergencyFreeMiB, sampleIntervalMs, onEvent = () => {}, sampleGpu = queryNvidiaGpu }) {
  fs.mkdirSync(path.dirname(stdoutPath), { recursive: true }); const stdout = fs.createWriteStream(stdoutPath, { flags: 'a' }); const stderr = fs.createWriteStream(stderrPath, { flags: 'a' }); const env = { ...process.env }; delete env.CUDA_BSFP_GITHUB_TOKEN; delete env.GITHUB_TOKEN; delete env.GH_TOKEN;
  const startedAt = Date.now(); let stdoutTail = ''; let stderrTail = ''; let timedOut = false; let memorySafetyAbort = false; let launchError = null; let sampling = false; let sampleCount = 0; let peakUsedMiB = null; let minimumFreeMiB = null;
  let pendingSample = null;
  let childClosed = false;
  const performanceSamples = {};
  const telemetryPath = path.join(path.dirname(stdoutPath), 'gpu-telemetry.jsonl');
  const summarize = () => Object.freeze({ sampleCount, peakUsedMiB, minimumFreeMiB, scope: 'device-wide; sample averages are not kernel occupancy or time-weighted utilization',
    performance: Object.fromEntries(Object.entries(performanceSamples).map(([key, v]) => [key, { samples: v.count, mean: v.sum / v.count, minimum: v.min, maximum: v.max }])) });
  let child; try { child = spawn(command, args, { cwd, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32' }); } catch (error) { launchError = error; }
  if (!child) { stdout.end(); stderr.end(); await Promise.all([once(stdout, 'finish'), once(stderr, 'finish')]); return Object.freeze({ exitCode: null, signal: null, durationMs: Date.now() - startedAt, timedOut: false, memorySafetyAbort: false, launchError: launchError?.stack ?? launchError?.message ?? String(launchError), stdoutTail, stderrTail, gpuTelemetry: Object.freeze({ sampleCount, peakUsedMiB, minimumFreeMiB }) }); }
  child.stdout.on('data', (chunk) => { const text = chunk.toString('utf8'); stdout.write(text); stdoutTail = appendTail(stdoutTail, text); });
  child.stderr.on('data', (chunk) => { const text = chunk.toString('utf8'); stderr.write(text); stderrTail = appendTail(stderrTail, text); });
  child.on('error', (error) => { launchError = error; stderr.write(`\n[qualifier-child-error]\n${error.stack ?? error.message ?? String(error)}\n`); });
  const timeout = setTimeout(() => { timedOut = true; onEvent({ type: 'case-timeout-triggered', timeoutMs }); terminateProcessTree(child); }, timeoutMs); timeout.unref?.();
  const sampleTimer = setInterval(() => {
    if (sampling || childClosed || child.exitCode !== null) return;
    sampling = true;
    const requestedElapsedMs = Date.now() - startedAt;
    pendingSample = (async () => {
      try {
        const sample = await sampleGpu(gpuIndex);
        // A probe that finishes after exit is not a solver utilization sample.
        if (childClosed) return;
        fs.appendFileSync(telemetryPath, JSON.stringify({ requestedElapsedMs, elapsedMs: Date.now() - startedAt, ...sample }) + '\n', { flush: true });
        if (!sample.available) { onEvent({ type: 'gpu-telemetry-sample-failed', error: sample.error }); return; }
        sampleCount += 1;
        peakUsedMiB = peakUsedMiB === null ? sample.usedMiB : Math.max(peakUsedMiB, sample.usedMiB);
        minimumFreeMiB = minimumFreeMiB === null ? sample.freeMiB : Math.min(minimumFreeMiB, sample.freeMiB);
        for (const key of ['utilizationGpuPercent', 'utilizationMemoryPercent', 'powerDrawWatts', 'smClockMHz', 'memoryClockMHz']) {
          const value = sample[key];
          if (typeof value !== 'number' || !Number.isFinite(value)) continue;
          const entry = performanceSamples[key] ??= { count: 0, sum: 0, min: value, max: value };
          entry.count++; entry.sum += value; entry.min = Math.min(entry.min, value); entry.max = Math.max(entry.max, value);
        }
        if (sample.freeMiB < emergencyFreeMiB && !memorySafetyAbort && child.exitCode === null) {
          memorySafetyAbort = true; onEvent({ type: 'emergency-vram-abort', freeMiB: sample.freeMiB, emergencyFreeMiB }); terminateProcessTree(child);
        }
      } catch (error) { onEvent({ type: 'gpu-telemetry-sample-failed', error: error.message }); }
      finally { sampling = false; }
    })();
  }, sampleIntervalMs); sampleTimer.unref?.();
  const [exitCode, signal] = await new Promise((resolve) => { child.once('close', (code, sig) => { childClosed = true; resolve([code, sig]); }); });
  const durationMs = Date.now() - startedAt;
  clearTimeout(timeout); clearInterval(sampleTimer);
  await pendingSample;
  stdout.end(); stderr.end(); await Promise.all([once(stdout, 'finish'), once(stderr, 'finish')]);
  return Object.freeze({ exitCode, signal, durationMs, timedOut, memorySafetyAbort, launchError: launchError ? (launchError.stack ?? launchError.message ?? String(launchError)) : null, stdoutTail, stderrTail, gpuTelemetry: summarize() });
}
