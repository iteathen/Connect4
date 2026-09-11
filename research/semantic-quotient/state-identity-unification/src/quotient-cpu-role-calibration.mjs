import { availableParallelism, cpus, platform } from 'node:os';
import { spawnSync } from 'node:child_process';
import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';

const PROBE_URL = new URL('./quotient-cpu-probe-worker.mjs', import.meta.url);
const PROBE_PATH = fileURLToPath(PROBE_URL);

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function parseProbe(stdout) {
  const lines = String(stdout).trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) throw new Error('CPU probe produced no output');
  return JSON.parse(lines[lines.length - 1]);
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

function classifyMeasuredCpus(measurements, minGapRatio) {
  if (measurements.length < 2) {
    return { performanceCpuIds: measurements.map((item) => item.cpuId), efficiencyCpuIds: [], gapRatio: 1 };
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
    return { performanceCpuIds: sorted.map((item) => item.cpuId), efficiencyCpuIds: [], gapRatio: bestGap };
  }
  return {
    performanceCpuIds: sorted.slice(0, split).map((item) => item.cpuId),
    efficiencyCpuIds: sorted.slice(split).map((item) => item.cpuId),
    gapRatio: bestGap,
  };
}

async function runConcurrentProbe(searchWorkers, durationMs) {
  const totalWorkers = searchWorkers + 1;
  const workers = [];
  try {
    for (let index = 0; index < totalWorkers; index += 1) {
      const worker = new Worker(PROBE_URL, { workerData: { warmupMs: 20, durationMs } });
      workers.push(worker);
      await new Promise((resolve, reject) => {
        worker.once('online', resolve);
        worker.once('error', reject);
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
  const pinnedRepeats = options.pinnedRepeats ?? 2;
  const pinnedDurationMs = options.pinnedDurationMs ?? 70;
  const saturationDurationMs = options.saturationDurationMs ?? 90;
  const minGapRatio = options.minGapRatio ?? 1.12;
  const maxProbeCpus = Math.min(options.maxProbeCpus ?? logicalCount, logicalCount);
  const env = {
    ...process.env,
    C4_CPU_PROBE_WARMUP_MS: String(options.pinnedWarmupMs ?? 35),
    C4_CPU_PROBE_DURATION_MS: String(pinnedDurationMs),
  };

  const measurements = [];
  let affinityProbeAvailable = true;
  for (let cpuId = 0; cpuId < maxProbeCpus; cpuId += 1) {
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
    measurements.push(Object.freeze({ cpuId, opsPerSecond: median(samples), samples: Object.freeze(samples) }));
  }

  const roleSplit = affinityProbeAvailable
    ? classifyMeasuredCpus(measurements, minGapRatio)
    : { performanceCpuIds: [], efficiencyCpuIds: [], gapRatio: null };

  const saturationUpper = Math.max(1, Math.min(
    options.maxSearchWorkers ?? available,
    roleSplit.performanceCpuIds.length || available,
  ));
  const saturation = [];
  for (let searchWorkers = 1; searchWorkers <= saturationUpper; searchWorkers += 1) {
    saturation.push(await runConcurrentProbe(searchWorkers, saturationDurationMs));
  }
  const maxThroughput = Math.max(...saturation.map((item) => item.aggregateSearchOpsPerSecond));
  const nearPeakRatio = options.nearPeakRatio ?? 0.985;
  const recommended = saturation.find((item) => item.aggregateSearchOpsPerSecond >= maxThroughput * nearPeakRatio)
    ?? saturation[saturation.length - 1];

  const cleanupCpuId = roleSplit.efficiencyCpuIds.length > 0
    ? roleSplit.efficiencyCpuIds[roleSplit.efficiencyCpuIds.length - 1]
    : null;

  return Object.freeze({
    kind: 'connect4-cpu-role-calibration-v1',
    platform: platform(),
    logicalCpuCount: logicalCount,
    availableParallelism: available,
    affinityProbeAvailable,
    affinityEnforcedForNodeWorkers: false,
    pinnedMeasurements: Object.freeze(measurements),
    performanceCpuIds: Object.freeze(roleSplit.performanceCpuIds),
    efficiencyCpuIds: Object.freeze(roleSplit.efficiencyCpuIds),
    measuredClusterGapRatio: roleSplit.gapRatio,
    cleanupCpuId,
    saturation: Object.freeze(saturation),
    maxSearchWorkers: recommended.searchWorkers,
    rationale: cleanupCpuId === null
      ? 'No distinct efficiency cluster was measured; search-worker count comes from concurrent saturation with one maintenance worker present.'
      : 'Performance and efficiency logical-CPU clusters were measured; cleanup target is the slow cluster and search-worker count is further bounded by concurrent saturation.',
  });
}
