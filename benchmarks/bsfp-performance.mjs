import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import {
  solveBsfpOwnershipAntichainWdl,
  solveBsfpSymbolicWdl,
} from '../components/bsfp/index.mjs';

const GEOMETRIES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3, expectedRootWdl: 1 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4, expectedRootWdl: 0 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4, expectedRootWdl: 0 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4, expectedRootWdl: 0 }),
]);

function positiveIntegerEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${name} must be a positive integer`);
  return value;
}

const repetitions = positiveIntegerEnv('BSFP_BENCH_REPS', 5);
const warmups = positiveIntegerEnv('BSFP_BENCH_WARMUPS', 1);

function quantile(sorted, fraction) {
  if (sorted.length === 1) return sorted[0];
  const position = (sorted.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  const weight = position - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function summarize(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  const sum = sorted.reduce((total, value) => total + value, 0);
  return Object.freeze({
    min: sorted[0],
    median: quantile(sorted, 0.5),
    mean: sum / sorted.length,
    p90: quantile(sorted, 0.9),
    max: sorted[sorted.length - 1],
  });
}

function measure(factory) {
  for (let index = 0; index < warmups; index += 1) {
    global.gc?.();
    factory();
  }

  const wallSamples = [];
  const cpuSamples = [];
  let result = null;
  for (let index = 0; index < repetitions; index += 1) {
    result = null;
    global.gc?.();
    const cpuStart = process.cpuUsage();
    const started = performance.now();
    result = factory();
    wallSamples.push(performance.now() - started);
    const cpu = process.cpuUsage(cpuStart);
    cpuSamples.push((cpu.user + cpu.system) / 1000);
  }

  return Object.freeze({
    result,
    wallMs: summarize(wallSamples),
    cpuMs: summarize(cpuSamples),
    rawWallMs: Object.freeze(wallSamples),
  });
}

function round(value, digits = 3) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function geometryId(geometry) {
  return `${geometry.columns}x${geometry.rows}-c${geometry.connect}`;
}

const cases = [];
for (const geometry of GEOMETRIES) {
  const symbolic = measure(() => solveBsfpSymbolicWdl(geometry));
  const antichain = measure(() => solveBsfpOwnershipAntichainWdl(geometry));

  assert.equal(symbolic.result.rootWdl, geometry.expectedRootWdl, `${geometryId(geometry)} MTBDD root WDL`);
  assert.equal(antichain.result.rootWdl, geometry.expectedRootWdl, `${geometryId(geometry)} antichain root WDL`);
  assert.equal(antichain.result.rootWdl, symbolic.result.rootWdl, `${geometryId(geometry)} representation agreement`);

  const supportSkeletons = antichain.result.support.itemCapacity;
  const mtbddNodes = symbolic.result.stats.totalNodeCount;
  const boundaryRecords = antichain.result.stats.totalBoundaryRecords;
  const medianRatio = antichain.wallMs.median / symbolic.wallMs.median;

  cases.push(Object.freeze({
    geometry: geometryId(geometry),
    rootWdl: antichain.result.rootWdl,
    supportSkeletons,
    mtbdd: Object.freeze({
      wallMs: symbolic.wallMs,
      cpuMs: symbolic.cpuMs,
      totalNodes: mtbddNodes,
      decisionNodes: symbolic.result.stats.decisionNodeCount,
      supportSkeletonsPerSecondMedian: round(supportSkeletons * 1000 / symbolic.wallMs.median),
    }),
    ownershipAntichain: Object.freeze({
      wallMs: antichain.wallMs,
      cpuMs: antichain.cpuMs,
      totalBoundaryRecords: boundaryRecords,
      totalWinRecords: antichain.result.stats.totalWinRecords,
      totalLossRecords: antichain.result.stats.totalLossRecords,
      maximumWinFrontier: antichain.result.stats.maximumWinFrontier,
      maximumLossFrontier: antichain.result.stats.maximumLossFrontier,
      boundaryRecordsPerSupportSkeleton: round(boundaryRecords / supportSkeletons),
      supportSkeletonsPerSecondMedian: round(supportSkeletons * 1000 / antichain.wallMs.median),
    }),
    comparison: Object.freeze({
      antichainToMtbddMedianTimeRatio: round(medianRatio),
      antichainWallSpeedup: round(1 / medianRatio),
      representationRecordRatio: round(boundaryRecords / mtbddNodes),
      representationReductionPct: round(100 * (1 - boundaryRecords / mtbddNodes)),
    }),
  }));
}

console.log(JSON.stringify({
  schemaVersion: 1,
  kind: 'connect4-bsfp-representation-performance',
  sourceRevision: process.env.C4_SOURCE_REVISION ?? null,
  node: process.version,
  platform: process.platform,
  arch: process.arch,
  repetitions,
  warmups,
  timingPolicy: 'descriptive-non-gating-median-plus-range',
  note: 'Wall time covers complete synchronous solver construction for each representation; it is not GPU kernel time. Representation counts are algorithmic size measures and are not byte-for-byte memory measurements.',
  cases,
}, null, 2));
