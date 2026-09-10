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
export async function runLoggedChild({ command, args, cwd, stdoutPath, stderrPath, timeoutMs, gpuIndex, emergencyFreeMiB, sampleIntervalMs, onEvent = () => {} }) {
  fs.mkdirSync(path.dirname(stdoutPath), { recursive: true }); const stdout = fs.createWriteStream(stdoutPath, { flags: 'a' }); const stderr = fs.createWriteStream(stderrPath, { flags: 'a' }); const env = { ...process.env }; delete env.CUDA_BSFP_GITHUB_TOKEN; delete env.GITHUB_TOKEN; delete env.GH_TOKEN;
  const startedAt = Date.now(); let stdoutTail = ''; let stderrTail = ''; let timedOut = false; let memorySafetyAbort = false; let launchError = null; let sampling = false; let sampleCount = 0; let peakUsedMiB = null; let minimumFreeMiB = null;
  let child; try { child = spawn(command, args, { cwd, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32' }); } catch (error) { launchError = error; }
  if (!child) { stdout.end(); stderr.end(); await Promise.all([once(stdout, 'finish'), once(stderr, 'finish')]); return Object.freeze({ exitCode: null, signal: null, durationMs: Date.now() - startedAt, timedOut: false, memorySafetyAbort: false, launchError: launchError?.stack ?? launchError?.message ?? String(launchError), stdoutTail, stderrTail, gpuTelemetry: Object.freeze({ sampleCount, peakUsedMiB, minimumFreeMiB }) }); }
  child.stdout.on('data', (chunk) => { const text = chunk.toString('utf8'); stdout.write(text); stdoutTail = appendTail(stdoutTail, text); });
  child.stderr.on('data', (chunk) => { const text = chunk.toString('utf8'); stderr.write(text); stderrTail = appendTail(stderrTail, text); });
  child.on('error', (error) => { launchError = error; stderr.write(`\n[qualifier-child-error]\n${error.stack ?? error.message ?? String(error)}\n`); });
  const timeout = setTimeout(() => { timedOut = true; onEvent({ type: 'case-timeout-triggered', timeoutMs }); terminateProcessTree(child); }, timeoutMs); timeout.unref?.();
  const sampleTimer = setInterval(async () => { if (sampling || child.exitCode !== null) return; sampling = true; try { const sample = await queryNvidiaGpu(gpuIndex); if (sample.available) { sampleCount += 1; peakUsedMiB = peakUsedMiB === null ? sample.usedMiB : Math.max(peakUsedMiB, sample.usedMiB); minimumFreeMiB = minimumFreeMiB === null ? sample.freeMiB : Math.min(minimumFreeMiB, sample.freeMiB); if (sample.freeMiB < emergencyFreeMiB && !memorySafetyAbort && child.exitCode === null) { memorySafetyAbort = true; onEvent({ type: 'emergency-vram-abort', freeMiB: sample.freeMiB, emergencyFreeMiB }); terminateProcessTree(child); } } else onEvent({ type: 'gpu-telemetry-sample-failed', error: sample.error }); } finally { sampling = false; } }, sampleIntervalMs); sampleTimer.unref?.();
  const [exitCode, signal] = await new Promise((resolve) => { child.once('close', (code, sig) => resolve([code, sig])); }); clearTimeout(timeout); clearInterval(sampleTimer); stdout.end(); stderr.end(); await Promise.all([once(stdout, 'finish'), once(stderr, 'finish')]);
  return Object.freeze({ exitCode, signal, durationMs: Date.now() - startedAt, timedOut, memorySafetyAbort, launchError: launchError ? (launchError.stack ?? launchError.message ?? String(launchError)) : null, stdoutTail, stderrTail, gpuTelemetry: Object.freeze({ sampleCount, peakUsedMiB, minimumFreeMiB }) });
}
