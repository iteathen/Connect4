#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import process from 'node:process';

const EXPECTED_SEQUENCE = '444441566';
const DEFAULT_REPS = 1000;
const DEFAULT_WARMUP = 200;

function positiveIntEnv(name, fallback) {
  const raw = process.env[name];
  if (raw == null || raw === '') return fallback;
  const value = Number(raw);
  assert(Number.isInteger(value) && value > 0, `${name} must be a positive integer`);
  return value;
}

function quantileSorted(sorted, q) {
  const index = Math.max(0, Math.min(sorted.length - 1, Math.ceil(q * sorted.length) - 1));
  return sorted[index];
}

function stats(nsValues) {
  const sorted = nsValues.slice().sort((a, b) => a - b);
  const sum = nsValues.reduce((a, b) => a + b, 0);
  const median = quantileSorted(sorted, 0.5);
  const p95 = quantileSorted(sorted, 0.95);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mean = sum / nsValues.length;
  return {
    n: nsValues.length,
    minNs: min,
    medianNs: median,
    p95Ns: p95,
    maxNs: max,
    meanNs: mean,
    minMs: min / 1e6,
    medianMs: median / 1e6,
    p95Ms: p95 / 1e6,
    maxMs: max / 1e6,
    meanMs: mean / 1e6,
  };
}

const sourceReadStart = process.hrtime.bigint();
const source = await readFile(new URL('./universal-structural-policy-v4.mjs', import.meta.url), 'utf8');
const sourceReadEnd = process.hrtime.bigint();

const marker = 'console.log(JSON.stringify(run(),null,2));';
assert(source.includes(marker), 'v4 terminal runner marker not found; benchmark refuses to guess instrumentation');
const instrumented = source.replace(
  marker,
  'export { position, select, apply, oneReflectionOrbit };'
);

const moduleInitStart = process.hrtime.bigint();
const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(instrumented).toString('base64');
const v4 = await import(moduleUrl);
const moduleInitEnd = process.hrtime.bigint();

const { position, select, apply } = v4;

function diagnosticNine() {
  let P = position('');
  let sequence = '';
  const selectedSets = [];
  const representatives = [];
  const reasons = [];
  for (let ply = 1; ply <= 9; ply++) {
    const result = select(P);
    const cols = result.selected.map(r => r.column);
    assert(cols.length > 0, `v4 selected no move at ply ${ply}`);
    const c = Math.min(...cols);
    selectedSets.push(cols.map(x => x + 1));
    representatives.push(c + 1);
    reasons.push(result.reason);
    P = apply(P, c);
    assert(!P.win, `unexpected terminal before/at ply ${ply}`);
    sequence += String(c + 1);
  }
  assert.equal(sequence, EXPECTED_SEQUENCE, 'v4 first-nine trajectory changed');
  return { sequence, selectedSets, representatives, reasons, finalHeights: P.heights.slice() };
}

const diagnostic = diagnosticNine();
const expectedFinalHeights = diagnostic.finalHeights.join(',');

function validateFinal(P) {
  assert.equal(P.rank, 9);
  assert.equal(P.heights.join(','), expectedFinalHeights);
  assert.equal(P.win, false);
}

function aggregateTrialNs() {
  // Primary hot interval begins only after the empty rank-local state is ready.
  let P = position('');
  const t0 = process.hrtime.bigint();
  for (let ply = 1; ply <= 9; ply++) {
    const result = select(P);
    const cols = result.selected.map(r => r.column);
    const c = Math.min(...cols);
    P = apply(P, c);
  }
  const t1 = process.hrtime.bigint();
  validateFinal(P);
  return Number(t1 - t0);
}

function perPlyTrialNs() {
  let P = position('');
  const times = new Array(9);
  for (let ply = 0; ply < 9; ply++) {
    const t0 = process.hrtime.bigint();
    const result = select(P);
    const cols = result.selected.map(r => r.column);
    const c = Math.min(...cols);
    P = apply(P, c);
    const t1 = process.hrtime.bigint();
    times[ply] = Number(t1 - t0);
  }
  validateFinal(P);
  return times;
}

const stateInitStart = process.hrtime.bigint();
const readyState = position('');
const stateInitEnd = process.hrtime.bigint();
assert.equal(readyState.rank, 0);

const repetitions = positiveIntEnv('C4_BENCH_REPS', DEFAULT_REPS);
const warmupRepetitions = positiveIntEnv('C4_BENCH_WARMUP', DEFAULT_WARMUP);

for (let i = 0; i < warmupRepetitions; i++) aggregateTrialNs();

const aggregateNs = new Array(repetitions);
for (let i = 0; i < repetitions; i++) aggregateNs[i] = aggregateTrialNs();

const perPlyNs = Array.from({ length: 9 }, () => new Array(repetitions));
for (let i = 0; i < repetitions; i++) {
  const row = perPlyTrialNs();
  for (let ply = 0; ply < 9; ply++) perPlyNs[ply][i] = row[ply];
}

const cpus = os.cpus();
const result = {
  schema: 'connect4.universal_structural_policy.v4.first_nine_timing.v1',
  timestampUtc: new Date().toISOString(),
  subject: {
    file: 'research/isograph/discovery/2026-09-30-universal-structural-policy/universal-structural-policy-v4.mjs',
    expectedSequence: EXPECTED_SEQUENCE,
    diagnostic,
    note: 'Computational-cost baseline only; no soundness or universality promotion.',
  },
  interval: {
    primary: 'empty rank-local state ready -> select structurally -> deterministic minimum representative -> apply -> repeat through ply 9',
    excludes: [
      'process startup',
      'repository checkout',
      'source file I/O',
      'module parse/initialization',
      'oracle/Pons execution',
      'opening-book loading',
      'JSON serialization',
      'console logging',
      'GitHub Actions setup',
      'compiler/build time',
    ],
    aggregateMeasurement: 'clean one-timer cohort; no nested per-ply timers',
    perPlyMeasurement: 'separate cohort with one high-resolution timer around each select+representative+apply calculation',
  },
  configuration: {
    repetitions,
    warmupRepetitions,
  },
  initialization: {
    sourceReadNsExcluded: Number(sourceReadEnd - sourceReadStart),
    moduleInitNsExcluded: Number(moduleInitEnd - moduleInitStart),
    oneShotEmptyStateInitNsExcluded: Number(stateInitEnd - stateInitStart),
  },
  environment: {
    node: process.version,
    v8: process.versions.v8,
    platform: process.platform,
    arch: process.arch,
    osType: os.type(),
    osRelease: os.release(),
    osVersion: os.version(),
    cpuModel: cpus[0]?.model ?? null,
    cpuCount: cpus.length,
    cpuSpeedMHzReported: cpus[0]?.speed ?? null,
    runnerOS: process.env.RUNNER_OS ?? null,
    runnerArch: process.env.RUNNER_ARCH ?? null,
    runnerName: process.env.RUNNER_NAME ?? null,
    imageOS: process.env.ImageOS ?? null,
    imageVersion: process.env.ImageVersion ?? null,
    githubSha: process.env.GITHUB_SHA ?? null,
    githubRef: process.env.GITHUB_REF ?? null,
  },
  summary: {
    totalFirstNine: stats(aggregateNs),
    perPly: perPlyNs.map((values, i) => ({
      ply: i + 1,
      representative: diagnostic.representatives[i],
      selectedSet: diagnostic.selectedSets[i],
      ...stats(values),
    })),
  },
  raw: {
    aggregateNs,
    perPlyNs,
  },
};

process.stdout.write(JSON.stringify(result, null, 2) + '\n');
