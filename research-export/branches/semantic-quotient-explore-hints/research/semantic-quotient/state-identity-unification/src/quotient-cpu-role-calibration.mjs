import { availableParallelism, cpus, platform } from 'node:os';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';

const PROBE_URL = new URL('./quotient-cpu-probe-worker.mjs', import.meta.url);
const PROBE_PATH = fileURLToPath(PROBE_URL);

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if ((sorted.length & 1) === 1) return sorted[middle];
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

function parseProbe(stdout) {
  const lines = String(stdout).trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) throw new Error('CPU probe produced no output');
  return JSON.parse(lines[lines.length - 1]);
}

function parseCpuList(text) {
  const ids = [];
  for (const token of String(text).trim().split(',')) {
    if (!token) continue;
    const [startText, endText] = token.split('-');
    const start = Number(startText);
    const end = endText === undefined ? start : Number(endText);
    if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) continue;
    for (let cpu = start; cpu <= end; cpu += 1) ids.push(cpu);
  }
  return ids;
}

function allowedCpuIds(logicalCount) {
  if (platform() !== 'linux') return Array.from({ length: logicalCount }, (_, cpuId) => cpuId);
  try {
    const status = readFileSync('/proc/self/status', 'utf-8');
    const match = status.match(/^Cpus_allowed_list:\s*(.+)$/m);
    if (match) {
      const ids = parseCpuList(match[1]);
      if (ids.length > 0) return ids;
    }
  } catch {
    // Fall through to the logical list when procfs is unavailable.
  }
  return Array.from({ length: logicalCount }, (_, cpuId) => cpuId);
}

function probeLinuxCpu(cpuId, env) {
  const run = spawnSync('taskset', ['-c', String(cpuId), process.execPath, PROBE_PATH], {
    encoding: 'utf-8',
    env,
  });
  if (run.status !== 0) return null;
  return parseProbe(run.stdout);
}

function psQuote(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function probeWindowsCpu(cpuId, env) {
  if (cpuId >= 63) return null;
  const script = [
    '$psi = New-Object System.Diagnostics.ProcessStartInfo',
    `$psi.FileName = ${psQuote(process.execPath)}`,
    `$psi.Arguments = ${psQuote(PROBE_PATH)}`,
    '$psi.UseShellExecute = $false',
    '$psi.RedirectStandardOutput = $true',
    '$psi.RedirectStandardError = $true',
    '$p = [System.Diagnostics.Process]::Start($psi)',
    `$p.ProcessorAffinity = [IntPtr]([Int64]1 -shl ${cpuId})`,
    '$out = $p.StandardOutput.ReadToEnd()',
    '$err = $p.StandardError.ReadToEnd()',
    '$p.WaitForExit()',
    'if ($p.ExitCode -ne 0) { Write-Error $err; exit $p.ExitCode }',
    'Write-Output $out',
  ].join('; ');
  const run = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
    encoding: 'utf-8',
    env,
  });
  if (run.status !== 0) return null;
  return parseProbe(run.stdout);
}

function probePinnedCpu(cpuId, env) {
  if (platform() === 'linux') return probeLinuxCpu(cpuId, env);
  if (platform() === 'win32') return probeWindowsCpu(cpuId, env);
  return null;
}

export function summarizeCpuSamples(cpuId, samples, limits = {}) {
  if (!Array.isArray(samples) || samples.length === 0) throw new RangeError('CPU samples must be non-empty');
  const center = median(samples);
  const deviations = samples.map((value) => Math.abs(value - center));
  const mad = median(deviations);
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const relativeMad = center > 0 ? mad / center : Infinity;
  const spreadRatio = min > 0 ? max / min : Infinity;
  const maxRelativeMad = limits.maxRelativeMad ?? 0.12;
  const maxSpreadRatio = limits.maxSpreadRatio ?? 1.35;
  return Object.freeze({
    cpuId,
    opsPerSecond: center,
    samples: Object.freeze([...samples]),
    mad,
    relativeMad,
    spreadRatio,
    stable: relativeMad <= maxRelativeMad && spreadRatio <= maxSpreadRatio,
  });
}

export function classifyMeasuredCpus(measurements, options = {}) {
  const minGapRatio = options.minGapRatio ?? 1.12;
  const minRobustGapRatio = options.minRobustGapRatio ?? 1.05;
  if (measurements.length < 2) {
    return Object.freeze({
      accepted: false,
      confidence: 'insufficient-data',
      performanceCpuIds: [],
      efficiencyCpuIds: [],
      candidatePerformanceCpuIds: measurements.map((item) => item.cpuId),
      candidateEfficiencyCpuIds: [],
      gapRatio: 1,
      robustGapRatio: null,
    });
  }

  const sorted = [...measurements].sort((a, b) => b.opsPerSecond - a.opsPerSecond);
  let bestGap = 1;
  let split = -1;
  for (let index = 0; index < sorted.length - 1; index += 1) {
    const ratio = sorted[index].opsPerSecond / sorted[index + 1].opsPerSecond;
    if (ratio > bestGap) {
      bestGap = ratio;
      split = index + 1;
    }
  }

  if (bestGap < minGapRatio || split <= 0 || split >= sorted.length) {
    return Object.freeze({
      accepted: false,
      confidence: 'homogeneous-or-unresolved',
      performanceCpuIds: [],
      efficiencyCpuIds: [],
      candidatePerformanceCpuIds: sorted.map((item) => item.cpuId),
      candidateEfficiencyCpuIds: [],
      gapRatio: bestGap,
      robustGapRatio: null,
    });
  }

  const performance = sorted.slice(0, split);
  const efficiency = sorted.slice(split);
  const allStable = sorted.every((item) => item.stable === true);
  const performanceFloor = Math.min(...performance.flatMap((item) => item.samples));
  const efficiencyCeiling = Math.max(...efficiency.flatMap((item) => item.samples));
  const robustGapRatio = efficiencyCeiling > 0 ? performanceFloor / efficiencyCeiling : Infinity;
  const accepted = allStable && robustGapRatio >= minRobustGapRatio;

  return Object.freeze({
    accepted,
    confidence: accepted ? 'high' : 'low-sample-stability',
    performanceCpuIds: accepted ? performance.map((item) => item.cpuId) : [],
    efficiencyCpuIds: accepted ? efficiency.map((item) => item.cpuId) : [],
    candidatePerformanceCpuIds: performance.map((item) => item.cpuId),
    candidateEfficiencyCpuIds: efficiency.map((item) => item.cpuId),
    gapRatio: bestGap,
    robustGapRatio,
    allStable,
  });
}

async function runConcurrentProbe(searchWorkers, durationMs) {
  const totalWorkers = searchWorkers + 1;
  const workers = [];
  try {
    for (let index = 0; index < totalWorkers; index += 1) {
      const worker = new Worker(PROBE_URL, { workerData: { warmupMs: 20, durationMs } });
      workers.push(worker);
      await new Promise((resolve, reject) => {
        const onOnline = () => {
          worker.off('error', onError);
          resolve();
        };
        const onError = (error) => {
          worker.off('online', onOnline);
          reject(error);
        };
        worker.once('online', onOnline);
        worker.once('error', onError);
      });
    }

    const results = await Promise.all(workers.map((worker, index) => new Promise((resolve, reject) => {
      const taskId = index + 1;
      const onMessage = (message) => {
        if (message?.type !== 'probe-result' || message.taskId !== taskId) return;
        worker.off('message', onMessage);
        worker.off('error', onError);
        resolve(message);
      };
      const onError = (error) => {
        worker.off('message', onMessage);
        reject(error);
      };
      worker.on('message', onMessage);
      worker.once('error', onError);
      worker.postMessage({ type: 'probe', taskId, durationMs });
    })));

    const searchResults = results.slice(0, searchWorkers);
    const maintenance = results[results.length - 1];
    return Object.freeze({
      searchWorkers,
      aggregateSearchOpsPerSecond: searchResults.reduce((sum, item) => sum + item.opsPerSecond, 0),
      medianSearchOpsPerSecond: median(searchResults.map((item) => item.opsPerSecond)),
      maintenanceOpsPerSecond: maintenance.opsPerSecond,
    });
  } finally {
    await Promise.allSettled(workers.map((worker) => worker.terminate()));
  }
}

export async function calibrateCpuRoles(options = {}) {
  const logicalCount = cpus().length;
  const available = availableParallelism();
  const allowed = allowedCpuIds(logicalCount);
  const pinnedRepeats = options.pinnedRepeats ?? 3;
  const pinnedDurationMs = options.pinnedDurationMs ?? 70;
  const saturationDurationMs = options.saturationDurationMs ?? 90;
  const maxProbeCpus = Math.min(options.maxProbeCpus ?? allowed.length, allowed.length);
  const probeCpuIds = allowed.slice(0, maxProbeCpus);
  const stabilityLimits = {
    maxRelativeMad: options.maxRelativeMad ?? 0.12,
    maxSpreadRatio: options.maxSpreadRatio ?? 1.35,
  };
  const env = {
    ...process.env,
    C4_CPU_PROBE_WARMUP_MS: String(options.pinnedWarmupMs ?? 35),
    C4_CPU_PROBE_DURATION_MS: String(pinnedDurationMs),
  };

  const measurements = [];
  let affinityProbeAvailable = true;
  for (const cpuId of probeCpuIds) {
    const samples = [];
    for (let repeat = 0; repeat < pinnedRepeats; repeat += 1) {
      const sample = probePinnedCpu(cpuId, env);
      if (!sample) {
        affinityProbeAvailable = false;
        break;
      }
      samples.push(sample.opsPerSecond);
    }
    if (!affinityProbeAvailable) break;
    measurements.push(summarizeCpuSamples(cpuId, samples, stabilityLimits));
  }

  const roleSplit = affinityProbeAvailable
    ? classifyMeasuredCpus(measurements, {
        minGapRatio: options.minGapRatio ?? 1.12,
        minRobustGapRatio: options.minRobustGapRatio ?? 1.05,
      })
    : Object.freeze({
        accepted: false,
        confidence: 'affinity-unavailable',
        performanceCpuIds: [],
        efficiencyCpuIds: [],
        candidatePerformanceCpuIds: [],
        candidateEfficiencyCpuIds: [],
        gapRatio: null,
        robustGapRatio: null,
      });

  const topologySearchCeiling = roleSplit.accepted ? roleSplit.performanceCpuIds.length : available;
  const saturationUpper = Math.max(1, Math.min(
    options.maxSearchWorkers ?? available,
    topologySearchCeiling,
  ));
  const saturation = [];
  for (let searchWorkers = 1; searchWorkers <= saturationUpper; searchWorkers += 1) {
    saturation.push(await runConcurrentProbe(searchWorkers, saturationDurationMs));
  }
  const maxThroughput = Math.max(...saturation.map((item) => item.aggregateSearchOpsPerSecond));
  const nearPeakRatio = options.nearPeakRatio ?? 0.985;
  const recommended = saturation.find((item) => item.aggregateSearchOpsPerSecond >= maxThroughput * nearPeakRatio)
    ?? saturation[saturation.length - 1];

  const cleanupCpuId = roleSplit.accepted && roleSplit.efficiencyCpuIds.length > 0
    ? roleSplit.efficiencyCpuIds[roleSplit.efficiencyCpuIds.length - 1]
    : null;

  return Object.freeze({
    kind: 'connect4-cpu-role-calibration-v2',
    platform: platform(),
    logicalCpuCount: logicalCount,
    allowedCpuIds: Object.freeze(allowed),
    availableParallelism: available,
    affinityProbeAvailable,
    affinityEnforcedForNodeWorkers: false,
    pinnedMeasurements: Object.freeze(measurements),
    topology: roleSplit,
    performanceCpuIds: Object.freeze(roleSplit.performanceCpuIds),
    efficiencyCpuIds: Object.freeze(roleSplit.efficiencyCpuIds),
    cleanupCpuId,
    saturation: Object.freeze(saturation),
    maxSearchWorkers: recommended.searchWorkers,
    rationale: roleSplit.accepted
      ? 'Stable, robustly separated CPU throughput clusters bound search capacity; concurrent saturation with one maintenance worker present selects the actual search-worker ceiling.'
      : 'CPU topology was not accepted with high confidence; worker count comes from concurrent saturation with one maintenance worker present and no affinity-role claim is made.',
  });
}
