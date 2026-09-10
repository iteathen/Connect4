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
export async function queryNvidiaGpu(gpuIndex = 0) {
  const commonFields = 'name,driver_version,memory.total,memory.free,memory.used';
  let output; let includesComputeCapability = true;
  try { output = await execText('nvidia-smi', [`--id=${gpuIndex}`, `--query-gpu=${commonFields},compute_cap`, '--format=csv,noheader,nounits']); }
  catch (firstError) {
    includesComputeCapability = false;
    try { output = await execText('nvidia-smi', [`--id=${gpuIndex}`, `--query-gpu=${commonFields}`, '--format=csv,noheader,nounits']); }
    catch (error) { return Object.freeze({ available: false, gpuIndex, error: error?.message ?? firstError?.message ?? String(error) }); }
  }
  const line = output.split(/\r?\n/).find(Boolean); const parts = line?.split(',').map((value) => value.trim()) ?? [];
  if (parts.length < 5) return Object.freeze({ available: false, gpuIndex, error: 'unexpected nvidia-smi output shape' });
  const [name, driverVersion, total, free, used, computeCapabilityRaw] = parts; const computeCapability = includesComputeCapability ? computeCapabilityRaw : null;
  const totalMiB = Number(total); const freeMiB = Number(free); const usedMiB = Number(used);
  if (![totalMiB, freeMiB, usedMiB].every(Number.isFinite)) return Object.freeze({ available: false, gpuIndex, error: 'nvidia-smi memory telemetry was not numeric' });
  return Object.freeze({ available: true, gpuIndex, name, driverVersion, computeCapability, totalMiB, freeMiB, usedMiB });
}
async function dependencyIdentity(repositoryRoot, relativePath, packageName) {
  const root = path.join(repositoryRoot, relativePath); const git = await collectGitIdentity(root); let version = null;
  try { const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')); version = pkg.version ?? null; } catch {}
  return Object.freeze({ packageName, version, revision: git.revision });
}
export async function collectSystemSnapshot({ repositoryRoot, spoolRoot, gpuIndex }) {
  const cpus = os.cpus(); const [source, gpu, cudaAlgorithms, cudaJs] = await Promise.all([collectGitIdentity(repositoryRoot), queryNvidiaGpu(gpuIndex), dependencyIdentity(repositoryRoot, 'node_modules/cuda-algorithms', 'cuda-algorithms'), dependencyIdentity(repositoryRoot, 'node_modules/cuda-js', 'cuda-js')]);
  return Object.freeze({ schemaVersion: 1, capturedAt: new Date().toISOString(), machineId: ensureAnonymousMachineId(spoolRoot), operatingSystem: Object.freeze({ platform: os.platform(), release: os.release(), version: os.version(), architecture: os.arch() }), cpu: Object.freeze({ model: cpus[0]?.model ?? null, logicalCores: cpus.length }), hostMemory: Object.freeze({ totalMiB: Math.floor(os.totalmem() / (1024 * 1024)) }), node: Object.freeze({ version: process.version, versions: Object.freeze({ ...process.versions }) }), gpu, source, dependencies: Object.freeze({ cudaAlgorithms, cudaJs }), privacy: Object.freeze({ hostnameCollected: false, usernameCollected: false, hardwareSerialCollected: false, networkIdentifiersCollected: false, machineIdSource: 'locally-generated-random-stable-id' }) });
}
