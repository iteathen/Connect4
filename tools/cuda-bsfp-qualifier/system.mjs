import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
async function execText(command, args, options = {}) { const result = await execFileAsync(command, args, { encoding: 'utf8', windowsHide: true, maxBuffer: 4 * 1024 * 1024, timeout: 5000, ...options }); return result.stdout.trim(); }
function atomicWrite(filePath, content) { fs.mkdirSync(path.dirname(filePath), { recursive: true }); const temp = `${filePath}.tmp-${process.pid}`; fs.writeFileSync(temp, content, 'utf8'); fs.renameSync(temp, filePath); }
export function ensureAnonymousMachineId(spoolRoot) {
  const filePath = path.resolve(spoolRoot, 'machine-id');
  try { const current = fs.readFileSync(filePath, 'utf8').trim(); if (/^q1-[0-9a-f-]{36}$/i.test(current)) return current; } catch {}
  const id = `q1-${crypto.randomUUID()}`; atomicWrite(filePath, `${id}\n`); return id;
}
export async function collectGitIdentity(repositoryRoot) {
  const fallback = { revision: null, branch: null, dirty: null, repository: null };
  try {
    const [revision, branch, status, remote] = await Promise.all([execText('git', ['-C', repositoryRoot, 'rev-parse', 'HEAD']), execText('git', ['-C', repositoryRoot, 'branch', '--show-current']), execText('git', ['-C', repositoryRoot, 'status', '--porcelain']), execText('git', ['-C', repositoryRoot, 'remote', 'get-url', 'origin']).catch(() => '')]);
    return Object.freeze({ revision, branch: branch || null, dirty: status.length > 0, repository: normalizeGitHubRepository(remote) });
  } catch { return Object.freeze(fallback); }
}
function normalizeGitHubRepository(remote) { if (!remote) return null; const https = remote.match(/github\.com[/:]([^/]+\/[^/.]+?)(?:\.git)?$/i); return https ? https[1] : null; }
export function parseNvidiaGpu(output, gpuIndex = 0, includesComputeCapability = true, includesPerformance = false) {
  const line = output.split(/\r?\n/).find(Boolean);
  const parts = line?.split(',').map(value => value.trim()) ?? [];
  const numeric = value => value !== undefined && value !== '' && Number.isFinite(Number(value)) ? Number(value) : null;
  const [name, driverVersion, total, free, used] = parts;
  const [totalMiB, freeMiB, usedMiB] = [total, free, used].map(numeric);
  if (parts.length < 5 || [totalMiB, freeMiB, usedMiB].some(v => v === null || v < 0)) return Object.freeze({ available: false, gpuIndex, error: 'nvidia-smi memory telemetry was not numeric' });
  const perf = includesPerformance ? parts.slice(6).map(numeric) : [];
  return Object.freeze({ available: true, gpuIndex, name, driverVersion, computeCapability: includesComputeCapability ? parts[5] : null, totalMiB, freeMiB, usedMiB,
    utilizationGpuPercent: perf[0] ?? null, utilizationMemoryPercent: perf[1] ?? null,
    powerDrawWatts: perf[2] ?? null, smClockMHz: perf[3] ?? null, memoryClockMHz: perf[4] ?? null });
}
export async function queryNvidiaGpu(gpuIndex = 0) {
  const commonFields = 'name,driver_version,memory.total,memory.free,memory.used';
  const performanceFields = 'utilization.gpu,utilization.memory,power.draw,clocks.sm,clocks.mem';
  let lastError;
  for (const [suffix, compute, perf] of [[`,compute_cap,${performanceFields}`, true, true], [',compute_cap', true, false], ['', false, false]]) {
    try { return parseNvidiaGpu(await execText('nvidia-smi', [`--id=${gpuIndex}`, `--query-gpu=${commonFields}${suffix}`, '--format=csv,noheader,nounits']), gpuIndex, compute, perf); }
    catch (error) { lastError = error; }
  }
  return Object.freeze({ available: false, gpuIndex, error: lastError?.message ?? String(lastError) });
}
async function dependencyIdentity(repositoryRoot, relativePath, packageName) {
  const root = path.join(repositoryRoot, relativePath); const git = await collectGitIdentity(root); let version = null;
  try { const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')); version = pkg.version ?? null; } catch {}
  return Object.freeze({ packageName, version, revision: git.revision });
}
export async function collectSystemSnapshot({ repositoryRoot, spoolRoot, gpuIndex }) {
  const cpus = os.cpus(); const [source, gpu, cudaAlgorithms, cudaJs, cudaJsTensor] = await Promise.all([collectGitIdentity(repositoryRoot), queryNvidiaGpu(gpuIndex), dependencyIdentity(repositoryRoot, 'node_modules/cuda-algorithms', 'cuda-algorithms'), dependencyIdentity(repositoryRoot, 'node_modules/cuda-js', 'cuda-js'), dependencyIdentity(repositoryRoot, 'node_modules/cuda-js-tensor', 'cuda-js-tensor')]);
  return Object.freeze({ schemaVersion: 1, capturedAt: new Date().toISOString(), machineId: ensureAnonymousMachineId(spoolRoot), operatingSystem: Object.freeze({ platform: os.platform(), release: os.release(), version: os.version(), architecture: os.arch() }), cpu: Object.freeze({ model: cpus[0]?.model ?? null, logicalCores: cpus.length }), hostMemory: Object.freeze({ totalMiB: Math.floor(os.totalmem() / (1024 * 1024)) }), node: Object.freeze({ version: process.version, versions: Object.freeze({ ...process.versions }) }), gpu, source, dependencies: Object.freeze({ cudaAlgorithms, cudaJs, cudaJsTensor }), privacy: Object.freeze({ hostnameCollected: false, usernameCollected: false, hardwareSerialCollected: false, networkIdentifiersCollected: false, machineIdSource: 'locally-generated-random-stable-id' }) });
}
