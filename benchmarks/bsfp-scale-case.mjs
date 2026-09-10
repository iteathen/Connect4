import { performance } from 'node:perf_hooks';

import {
  solveBsfpOwnershipAntichainRootWdlRolling,
  solveBsfpOwnershipAntichainWdl,
} from '../components/bsfp/index.mjs';

function parseGeometry(text) {
  const match = /^(\d+)x(\d+):c(\d+)$/.exec(text ?? '');
  if (!match) throw new RangeError('geometry must look like 5x4:c4');
  const columns = Number(match[1]);
  const rows = Number(match[2]);
  const connect = Number(match[3]);
  if (![columns, rows, connect].every((value) => Number.isSafeInteger(value) && value > 0)) {
    throw new RangeError('geometry values must be positive safe integers');
  }
  return Object.freeze({ columns, rows, connect });
}

function positiveIntegerEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${name} must be a positive integer`);
  return value;
}

function mib(bytes) {
  return Math.round((bytes / (1024 * 1024)) * 1000) / 1000;
}

const geometry = parseGeometry(process.argv[2]);
const id = `${geometry.columns}x${geometry.rows}-c${geometry.connect}`;
const executor = process.env.BSFP_SCALE_EXECUTOR ?? 'rolling';
const supportShardSize = positiveIntegerEnv('BSFP_SUPPORT_SHARD_SIZE', 2048);
const candidateTileSize = positiveIntegerEnv('BSFP_CANDIDATE_TILE_SIZE', 8192);
if (executor !== 'rolling' && executor !== 'retained') throw new RangeError('BSFP_SCALE_EXECUTOR must be rolling or retained');

global.gc?.();
const memoryBefore = process.memoryUsage();
const cpuStart = process.cpuUsage();
const wallStart = performance.now();
const solved = executor === 'rolling'
  ? solveBsfpOwnershipAntichainRootWdlRolling({ ...geometry, supportShardSize, candidateTileSize })
  : solveBsfpOwnershipAntichainWdl(geometry);
const wallMs = performance.now() - wallStart;
const cpu = process.cpuUsage(cpuStart);
const memoryAfter = process.memoryUsage();
const usage = process.resourceUsage();

const supportSkeletons = solved.support.itemCapacity;
const totalBoundaryRecords = solved.stats.totalBoundaryRecords;

console.log(JSON.stringify({
  schemaVersion: 2,
  kind: 'connect4-bsfp-antichain-scaling-case',
  sourceRevision: process.env.C4_SOURCE_REVISION ?? null,
  geometry: id,
  executor,
  rootWdl: solved.rootWdl,
  supportSkeletons,
  wallMs,
  cpuMs: (cpu.user + cpu.system) / 1000,
  supportSkeletonsPerSecond: supportSkeletons * 1000 / wallMs,
  totalBoundaryRecords,
  totalWinRecords: solved.stats.totalWinRecords,
  totalLossRecords: solved.stats.totalLossRecords,
  boundaryRecordsPerSupportSkeleton: totalBoundaryRecords / supportSkeletons,
  maximumWinFrontier: solved.stats.maximumWinFrontier,
  maximumLossFrontier: solved.stats.maximumLossFrontier,
  terminalWinSubtractions: solved.stats.terminalWinSubtractions,
  terminalLossSubtractions: solved.stats.terminalLossSubtractions,
  rolling: executor === 'rolling' ? {
    rankWindow: solved.execution.rankWindow,
    supportShardSize: solved.execution.supportShardSize,
    candidateTileSize: solved.execution.candidateTileSize,
    peakRankBoundaryRecords: solved.stats.peakRankBoundaryRecords,
    peakResidentBoundaryRecords: solved.stats.peakResidentBoundaryRecords,
    peakResidentToTotalBoundaryRatio: solved.stats.peakResidentToTotalBoundaryRatio,
    peakRankSupportCount: solved.stats.peakRankSupportCount,
    retainedBoundaryRecordsAtEnd: solved.stats.retainedBoundaryRecordsAtEnd,
    totalShards: solved.stats.totalShards,
    generatedPairCandidates: solved.stats.generatedPairCandidates,
    candidateTiles: solved.stats.candidateTiles,
    maximumCandidateTile: solved.stats.maximumCandidateTile,
    normalizationCalls: solved.stats.normalizationCalls,
    maximumNormalizationInput: solved.stats.maximumNormalizationInput,
  } : null,
  memory: {
    beforeMiB: {
      rss: mib(memoryBefore.rss),
      heapUsed: mib(memoryBefore.heapUsed),
      external: mib(memoryBefore.external),
    },
    afterMiB: {
      rss: mib(memoryAfter.rss),
      heapUsed: mib(memoryAfter.heapUsed),
      external: mib(memoryAfter.external),
    },
    maxRssMiB: process.platform === 'linux' ? usage.maxRSS / 1024 : null,
  },
  runtime: {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
  },
}, null, 2));
