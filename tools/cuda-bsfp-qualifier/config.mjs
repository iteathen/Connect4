export const MIB = 1024 * 1024;

export const DEFAULT_GEOMETRY_LADDER = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3, tier: 'exhaustive-known' }),
  Object.freeze({ columns: 4, rows: 4, connect: 4, tier: 'known-oracle' }),
  Object.freeze({ columns: 5, rows: 4, connect: 4, tier: 'known-oracle' }),
  Object.freeze({ columns: 5, rows: 5, connect: 4, tier: 'scaling' }),
  Object.freeze({ columns: 6, rows: 5, connect: 4, tier: 'scaling' }),
  Object.freeze({ columns: 7, rows: 5, connect: 4, tier: 'scaling' }),
  Object.freeze({ columns: 7, rows: 6, connect: 4, tier: 'known-oracle' }),
  Object.freeze({ columns: 8, rows: 6, connect: 4, tier: 'scaling' }),
  Object.freeze({ columns: 8, rows: 7, connect: 4, tier: 'scaling' }),
  Object.freeze({ columns: 9, rows: 7, connect: 4, tier: 'scaling' }),
]);

export const DEFAULT_QUALIFIER_LIMITS = Object.freeze({
  caseTimeoutMs: 120_000,
  runTimeoutMs: 900_000,
  vramSafeFraction: 0.70,
  vramReserveMiB: 1024,
  vramAbsoluteMaxMiB: 12 * 1024,
  emergencyFreeMiB: 512,
  gpuSampleIntervalMs: 500,
  publishLogBytes: 8 * MIB,
});

function parsePositiveInteger(value, label) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw new RangeError(`${label} must be a positive safe integer`);
  return parsed;
}
function parseNonnegativeInteger(value, label) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) throw new RangeError(`${label} must be a nonnegative safe integer`);
  return parsed;
}
function parseFraction(value, label) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= 1) throw new RangeError(`${label} must be between 0 and 1`);
  return parsed;
}
function takeOption(argv, index, name) {
  const current = argv[index];
  const prefix = `${name}=`;
  if (current.startsWith(prefix)) return { value: current.slice(prefix.length), consumed: 1 };
  if (current === name) {
    if (index + 1 >= argv.length) throw new RangeError(`${name} requires a value`);
    return { value: argv[index + 1], consumed: 2 };
  }
  return null;
}
export function parseCaseList(text) {
  if (typeof text !== 'string' || text.trim().length === 0) throw new RangeError('--cases must not be empty');
  return Object.freeze(text.split(',').map((raw, index) => {
    const match = raw.trim().match(/^(\d+)x(\d+)(?::c(\d+))?$/i);
    if (!match) throw new RangeError(`invalid case ${index + 1}: ${raw}`);
    const columns = parsePositiveInteger(match[1], 'columns');
    const rows = parsePositiveInteger(match[2], 'rows');
    const connect = match[3] ? parsePositiveInteger(match[3], 'connect') : Math.min(4, columns, rows);
    if (connect > columns && connect > rows) throw new RangeError(`connect length ${connect} cannot fit ${columns}x${rows}`);
    return Object.freeze({ columns, rows, connect, tier: 'user-specified' });
  }));
}
export function caseId(spec) { return `${spec.columns}x${spec.rows}-c${spec.connect}`; }
export function parseQualifierArgs(argv = process.argv.slice(2)) {
  let armed = false;
  let publish = true;
  let dryRun = false;
  let profile = 'c4-0009-p1';
  let cases = DEFAULT_GEOMETRY_LADDER;
  let gpuIndex = 0;
  let reportRepository = null;
  let reportBase = null;
  let spoolRoot = '.cuda-bsfp-qualification';
  let caseTimeoutMs = DEFAULT_QUALIFIER_LIMITS.caseTimeoutMs;
  let runTimeoutMs = DEFAULT_QUALIFIER_LIMITS.runTimeoutMs;
  let vramSafeFraction = DEFAULT_QUALIFIER_LIMITS.vramSafeFraction;
  let vramReserveMiB = DEFAULT_QUALIFIER_LIMITS.vramReserveMiB;
  let vramAbsoluteMaxMiB = DEFAULT_QUALIFIER_LIMITS.vramAbsoluteMaxMiB;
  let emergencyFreeMiB = DEFAULT_QUALIFIER_LIMITS.emergencyFreeMiB;
  let gpuSampleIntervalMs = DEFAULT_QUALIFIER_LIMITS.gpuSampleIntervalMs;
  let publishLogBytes = DEFAULT_QUALIFIER_LIMITS.publishLogBytes;
  let continueAfterBoundary = false;
  for (let i = 0; i < argv.length;) {
    const arg = argv[i];
    if (arg === '--qualify-benchmark') { armed = true; i += 1; continue; }
    if (arg === '--no-publish') { publish = false; i += 1; continue; }
    if (arg === '--dry-run') { dryRun = true; publish = false; i += 1; continue; }
    if (arg === '--continue-after-boundary') { continueAfterBoundary = true; i += 1; continue; }
    const options = [
      ['--profile', (v) => { profile = v; }],
      ['--cases', (v) => { cases = parseCaseList(v); }],
      ['--gpu-index', (v) => { gpuIndex = parseNonnegativeInteger(v, '--gpu-index'); }],
      ['--report-repo', (v) => { reportRepository = v; }],
      ['--report-base', (v) => { reportBase = v; }],
      ['--spool-root', (v) => { spoolRoot = v; }],
      ['--case-timeout-ms', (v) => { caseTimeoutMs = parsePositiveInteger(v, '--case-timeout-ms'); }],
      ['--run-timeout-ms', (v) => { runTimeoutMs = parsePositiveInteger(v, '--run-timeout-ms'); }],
      ['--vram-fraction', (v) => { vramSafeFraction = parseFraction(v, '--vram-fraction'); }],
      ['--vram-reserve-mib', (v) => { vramReserveMiB = parseNonnegativeInteger(v, '--vram-reserve-mib'); }],
      ['--max-vram-mib', (v) => { vramAbsoluteMaxMiB = parsePositiveInteger(v, '--max-vram-mib'); }],
      ['--emergency-free-mib', (v) => { emergencyFreeMiB = parseNonnegativeInteger(v, '--emergency-free-mib'); }],
      ['--gpu-sample-ms', (v) => { gpuSampleIntervalMs = parsePositiveInteger(v, '--gpu-sample-ms'); }],
      ['--publish-log-bytes', (v) => { publishLogBytes = parsePositiveInteger(v, '--publish-log-bytes'); }],
    ];
    let matched = false;
    for (const [name, assign] of options) {
      const taken = takeOption(argv, i, name);
      if (!taken) continue;
      assign(taken.value);
      i += taken.consumed;
      matched = true;
      break;
    }
    if (!matched) throw new RangeError(`unknown qualifier option: ${arg}`);
  }
  if (!armed) throw new Error('refusing to run: pass --qualify-benchmark to arm CUDA-BSFP qualification');
  if (caseTimeoutMs > runTimeoutMs) caseTimeoutMs = runTimeoutMs;
  if (emergencyFreeMiB > vramReserveMiB && vramReserveMiB > 0) throw new RangeError('--emergency-free-mib must not exceed --vram-reserve-mib');
  return Object.freeze({ publish, dryRun, profile, cases, gpuIndex, reportRepository, reportBase, spoolRoot, limits: Object.freeze({ caseTimeoutMs, runTimeoutMs, vramSafeFraction, vramReserveMiB, vramAbsoluteMaxMiB, emergencyFreeMiB, gpuSampleIntervalMs, publishLogBytes }), continueAfterBoundary });
}
export function computeMemoryAdmission({ estimatedBytes, freeMiB, limits }) {
  if (estimatedBytes === null || estimatedBytes === undefined) return Object.freeze({ allowed: false, reason: 'profile-memory-bound-unavailable' });
  if (!Number.isFinite(freeMiB) || freeMiB < 0) return Object.freeze({ allowed: false, reason: 'free-vram-telemetry-unavailable' });
  const estimatedMiB = Math.ceil(Number(estimatedBytes) / MIB);
  if (!Number.isSafeInteger(estimatedMiB) || estimatedMiB < 0) return Object.freeze({ allowed: false, reason: 'profile-memory-bound-not-host-representable' });
  const fractionBound = Math.floor(freeMiB * limits.vramSafeFraction);
  const reserveBound = Math.max(0, Math.floor(freeMiB - limits.vramReserveMiB));
  const allowedMiB = Math.max(0, Math.min(limits.vramAbsoluteMaxMiB, fractionBound, reserveBound));
  return Object.freeze({ allowed: estimatedMiB <= allowedMiB, reason: estimatedMiB <= allowedMiB ? 'admitted' : 'estimated-working-set-exceeds-safe-vram-budget', estimatedMiB, freeMiB: Math.floor(freeMiB), allowedMiB, policy: Object.freeze({ safeFraction: limits.vramSafeFraction, reserveMiB: limits.vramReserveMiB, absoluteMaxMiB: limits.vramAbsoluteMaxMiB, emergencyFreeMiB: limits.emergencyFreeMiB }) });
}
