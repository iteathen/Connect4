import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { openCudaRuntime } from 'cuda-js';
import {
  createBsfpSupportLatticeProfile,
  normalizeMaximalPacked42Antichain,
  normalizeMinimalPacked42Antichain,
} from '../../components/bsfp/index.mjs';
import { createConnectWinningLines } from '../../components/bsfp/geometry.mjs';
import { createPacked42PairReducerService } from '../../components/bsfp/cuda/packed42-pair-reducer-service.mjs';
import { SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION } from '../../components/bsfp/cuda/index.mjs';

const TWO32 = 0x1_0000_0000;
const MAX_MASK_42 = 2 ** 42 - 1;

function parseGeometry(text) {
  const match = /^(\d+)x(\d+):c(\d+)$/.exec(text ?? '');
  if (!match) throw new RangeError('geometry must look like 5x5:c4');
  const columns = Number(match[1]);
  const rows = Number(match[2]);
  const connect = Number(match[3]);
  if (![columns, rows, connect].every((v) => Number.isSafeInteger(v) && v > 0)) throw new RangeError('geometry values must be positive safe integers');
  if (columns * rows > 42) throw new RangeError('hybrid packed42 BSFP supports at most 42 cells');
  return Object.freeze({ columns, rows, connect });
}

function envPositive(name, fallback) {
  const value = process.env[name] === undefined ? fallback : Number(process.env[name]);
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${name} must be a positive safe integer`);
  return value;
}

function low32(value) { return value >>> 0; }
function high10(value) { return Math.floor(value / TWO32) >>> 0; }
function pack42(low, high) { return (low >>> 0) + (high >>> 0) * TWO32; }
function mask42(value) {
  if (!Number.isSafeInteger(value) || value < 0 || value > MAX_MASK_42) throw new RangeError('mask escaped exact 42-bit range');
  return value;
}
function or42(a, b) { return pack42((low32(a) | low32(b)) >>> 0, (high10(a) | high10(b)) >>> 0); }
function and42(a, b) { return pack42((low32(a) & low32(b)) >>> 0, (high10(a) & high10(b)) >>> 0); }
function andNot42(a, b) { return pack42((low32(a) & ~low32(b)) >>> 0, (high10(a) & ~high10(b)) >>> 0); }
function subset42(a, b) { return ((low32(a) & ~low32(b)) >>> 0) === 0 && ((high10(a) & ~high10(b)) >>> 0) === 0; }
function hasCell(mask, cell) { return cell < 32 ? (low32(mask) & ((1 << cell) >>> 0)) !== 0 : (high10(mask) & (1 << (cell - 32))) !== 0; }
function setCell(mask, cell) { return cell < 32 ? pack42((low32(mask) | ((1 << cell) >>> 0)) >>> 0, high10(mask)) : pack42(low32(mask), (high10(mask) | (1 << (cell - 32))) >>> 0); }
function clearCell(mask, cell) { return cell < 32 ? pack42((low32(mask) & ~((1 << cell) >>> 0)) >>> 0, high10(mask)) : pack42(low32(mask), (high10(mask) & ~(1 << (cell - 32))) >>> 0); }

function forEachSetCell(mask, callback) {
  let low = low32(mask);
  while (low !== 0) {
    const bit = (low & -low) >>> 0;
    callback(31 - Math.clz32(bit));
    low = (low & (low - 1)) >>> 0;
  }
  let high = high10(mask);
  while (high !== 0) {
    const bit = (high & -high) >>> 0;
    callback(32 + 31 - Math.clz32(bit));
    high = (high & (high - 1)) >>> 0;
  }
}

function normalizeMinimal(values) { return normalizeMinimalPacked42Antichain(values); }
function normalizeMaximal(values) { return normalizeMaximalPacked42Antichain(values); }

function cofactorUpward(frontier, landingCell, mover) {
  const result = [];
  if (mover === 0) for (const mask of frontier) result.push(clearCell(mask, landingCell));
  else for (const mask of frontier) if (!hasCell(mask, landingCell)) result.push(mask);
  return normalizeMinimal(result);
}

function cofactorDownward(frontier, landingCell, mover) {
  const result = [];
  if (mover === 0) for (const mask of frontier) if (hasCell(mask, landingCell)) result.push(clearCell(mask, landingCell));
  else for (const mask of frontier) result.push(clearCell(mask, landingCell));
  return normalizeMaximal(result);
}

function subtractUpwardFromDownward(downward, forbiddenUpward) {
  if (downward.length === 0 || forbiddenUpward.length === 0) return downward;
  const result = [];
  for (const cap of downward) {
    let candidates = [cap];
    for (const forbidden of forbiddenUpward) {
      const next = [];
      for (const candidate of candidates) {
        if (!subset42(forbidden, candidate)) next.push(candidate);
        else forEachSetCell(forbidden, (cell) => next.push(clearCell(candidate, cell)));
      }
      candidates = normalizeMaximal(next);
      if (candidates.length === 0) break;
    }
    result.push(...candidates);
  }
  return normalizeMaximal(result);
}

function subtractDownwardFromUpward(upward, forbiddenDownward, universeMask) {
  if (upward.length === 0 || forbiddenDownward.length === 0) return upward;
  const result = [];
  for (const base of upward) {
    let candidates = [base];
    for (const forbidden of forbiddenDownward) {
      const next = [];
      for (const candidate of candidates) {
        if (!subset42(candidate, forbidden)) next.push(candidate);
        else {
          const available = andNot42(universeMask, forbidden);
          forEachSetCell(available, (cell) => next.push(setCell(candidate, cell)));
        }
      }
      candidates = normalizeMinimal(next);
      if (candidates.length === 0) break;
    }
    result.push(...candidates);
  }
  return normalizeMinimal(result);
}

function supportUniverseMask(heights, columns) {
  let mask = 0;
  for (let column = 0; column < columns; column += 1) for (let row = 0; row < heights[column]; row += 1) mask = setCell(mask, row * columns + column);
  return mask;
}

function lineMasks(geometry) {
  return Object.freeze(createConnectWinningLines(geometry).map((line) => {
    let mask = 0;
    for (const cell of line) mask = setCell(mask, cell);
    return mask;
  }));
}

function lineIncidence(masks, cellCount) {
  const result = Array.from({ length: cellCount }, () => []);
  for (const mask of masks) for (let cell = 0; cell < cellCount; cell += 1) if (hasCell(mask, cell)) result[cell].push(mask);
  return Object.freeze(result.map((entry) => Object.freeze(entry)));
}

function rankItems(support) {
  const result = Array.from({ length: support.maxRank + 1 }, () => []);
  for (let index = 0; index < support.itemCapacity; index += 1) result[support.ranks[index]].push(index);
  return Object.freeze(result.map((entry) => Object.freeze(entry)));
}

function terminalBoundary(heights, rank, geometry, support, incidence) {
  const mover = rank & 1;
  const universeMask = supportUniverseMask(heights, geometry.columns);
  const terminal = [];
  for (let column = 0; column < geometry.columns; column += 1) {
    const row = heights[column];
    if (row >= geometry.rows) continue;
    const landingCell = row * geometry.columns + column;
    for (const lineMask of incidence[landingCell]) {
      const required = clearCell(lineMask, landingCell);
      if (!subset42(required, universeMask)) continue;
      terminal.push(mover === 0 ? required : andNot42(universeMask, required));
    }
  }
  return mover === 0 ? normalizeMinimal(terminal) : normalizeMaximal(terminal);
}

function prepareSupport(supportIndex, rank, support, childRank, geometry, incidence) {
  const heights = support.decodeHeights(supportIndex);
  const mover = rank & 1;
  const universeMask = supportUniverseMask(heights, geometry.columns);
  const intersectionSets = [];
  const unionValues = [];
  for (let column = 0; column < geometry.columns; column += 1) {
    const row = heights[column];
    if (row >= geometry.rows) continue;
    const landingCell = row * geometry.columns + column;
    const child = childRank.get(supportIndex + support.weights[column]);
    if (!child) throw new Error(`missing child frontier for support ${supportIndex}`);
    const moveWins = cofactorUpward(child.wins, landingCell, mover);
    const moveLosses = cofactorDownward(child.losses, landingCell, mover);
    if (mover === 0) {
      unionValues.push(...moveWins);
      intersectionSets.push(moveLosses);
    } else {
      intersectionSets.push(moveWins);
      unionValues.push(...moveLosses);
    }
  }
  const terminal = terminalBoundary(heights, rank, geometry, support, incidence);
  const union = mover === 0
    ? normalizeMinimal([...unionValues, ...terminal])
    : normalizeMaximal([...unionValues, ...terminal]);
  return { supportIndex, mover, universeMask, terminal, union, intersectionSets, intersection: intersectionSets[0] ?? Object.freeze([]) };
}

async function reduceIntersectionStages(pending, reducer, metrics) {
  let stage = 1;
  for (;;) {
    const jobs = [];
    const owners = [];
    let any = false;
    for (const item of pending) {
      if (stage >= item.intersectionSets.length) continue;
      any = true;
      const right = item.intersectionSets[stage];
      if (item.intersection.length === 0 || right.length === 0) {
        item.intersection = Object.freeze([]);
        continue;
      }
      jobs.push({
        left: item.intersection,
        right,
        direction: item.mover === 0 ? SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MAXIMAL : SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MINIMAL,
      });
      owners.push(item);
    }
    if (!any) break;
    if (jobs.length > 0) {
      const started = performance.now();
      const results = await reducer.reduce(jobs);
      metrics.gpuPairReduceWallMs += performance.now() - started;
      for (let i = 0; i < results.length; i += 1) owners[i].intersection = results[i];
    }
    stage += 1;
  }
}

function finalizeSupport(item) {
  if (item.mover === 0) {
    return Object.freeze({
      wins: item.union,
      losses: subtractUpwardFromDownward(item.intersection, item.terminal),
    });
  }
  return Object.freeze({
    wins: subtractDownwardFromUpward(item.intersection, item.terminal, item.universeMask),
    losses: item.union,
  });
}

function classifyRoot(frontier) {
  const win = frontier.wins.some((mask) => mask === 0);
  const loss = frontier.losses.some((mask) => mask === 0);
  if (win && loss) throw new Error('hybrid root frontier overlaps');
  return win ? 1 : loss ? -1 : 0;
}

async function solve(runtime, geometry, options) {
  const support = createBsfpSupportLatticeProfile(geometry);
  const masks = lineMasks(geometry);
  const incidence = lineIncidence(masks, geometry.columns * geometry.rows);
  const ranks = rankItems(support);
  const reducer = await createPacked42PairReducerService(runtime, options.reducer);
  const metrics = {
    structuralPrepareMs: 0,
    gpuPairReduceWallMs: 0,
    finalizeMs: 0,
    totalBoundaryRecords: 0,
    maximumWinFrontier: 0,
    maximumLossFrontier: 0,
    peakResidentBoundaryRecords: 0,
    processedSupports: 0,
    rankSummaries: [],
  };
  let childRank = new Map();
  let childBoundaryRecords = 0;
  try {
    for (let rank = support.maxRank; rank >= 0; rank -= 1) {
      const items = ranks[rank];
      const currentRank = new Map();
      let rankBoundaryRecords = 0;
      let rankMaxWin = 0;
      let rankMaxLoss = 0;
      const rankStarted = performance.now();
      for (let shardStart = 0; shardStart < items.length; shardStart += options.supportShardSize) {
        const shard = items.slice(shardStart, Math.min(items.length, shardStart + options.supportShardSize));
        if (rank === support.maxRank) {
          for (const supportIndex of shard) currentRank.set(supportIndex, Object.freeze({ wins: Object.freeze([]), losses: Object.freeze([]) }));
          continue;
        }
        const prepareStarted = performance.now();
        const pending = shard.map((supportIndex) => prepareSupport(supportIndex, rank, support, childRank, geometry, incidence));
        metrics.structuralPrepareMs += performance.now() - prepareStarted;
        await reduceIntersectionStages(pending, reducer, metrics);
        const finalizeStarted = performance.now();
        for (const item of pending) {
          const frontier = finalizeSupport(item);
          currentRank.set(item.supportIndex, frontier);
          const records = frontier.wins.length + frontier.losses.length;
          rankBoundaryRecords += records;
          rankMaxWin = Math.max(rankMaxWin, frontier.wins.length);
          rankMaxLoss = Math.max(rankMaxLoss, frontier.losses.length);
          metrics.maximumWinFrontier = Math.max(metrics.maximumWinFrontier, frontier.wins.length);
          metrics.maximumLossFrontier = Math.max(metrics.maximumLossFrontier, frontier.losses.length);
          metrics.processedSupports += 1;
        }
        metrics.finalizeMs += performance.now() - finalizeStarted;
        metrics.peakResidentBoundaryRecords = Math.max(metrics.peakResidentBoundaryRecords, childBoundaryRecords + rankBoundaryRecords);
      }
      metrics.totalBoundaryRecords += rankBoundaryRecords;
      metrics.rankSummaries.push(Object.freeze({
        rank,
        supports: items.length,
        boundaryRecords: rankBoundaryRecords,
        maximumWinFrontier: rankMaxWin,
        maximumLossFrontier: rankMaxLoss,
        wallMs: performance.now() - rankStarted,
      }));
      childRank = currentRank;
      childBoundaryRecords = rankBoundaryRecords;
    }
    const root = childRank.get(0);
    if (!root) throw new Error('hybrid root frontier missing');
    return Object.freeze({
      rootWdl: classifyRoot(root),
      supportSkeletons: support.itemCapacity,
      winningLines: masks.length,
      rootFrontier: root,
      metrics: Object.freeze({ ...metrics, reducer: reducer.snapshotStats() }),
    });
  } finally {
    await reducer.close();
  }
}

const mode = process.argv[2] ?? 'native';
if (mode !== 'native') throw new RangeError('compact hybrid BSFP currently requires native CUDA');
const geometry = parseGeometry(process.argv[3] ?? '4x4:c4');
const supportShardSize = envPositive('BSFP_HYBRID_SUPPORT_SHARD_SIZE', 256);
const outputCapacityPerSegment = envPositive('BSFP_HYBRID_FRONTIER_CAPACITY', 1024);
const candidateCapacity = envPositive('BSFP_HYBRID_CANDIDATE_CAPACITY', 4194304);
const segmentCapacity = envPositive('BSFP_HYBRID_SEGMENT_CAPACITY', 256);
const sideCapacity = envPositive('BSFP_HYBRID_SIDE_CAPACITY', 262144);

let runtime;
const started = performance.now();
try {
  runtime = await openCudaRuntime({ compiler: true });
  const runtimeOpenMs = performance.now() - started;
  const solveStarted = performance.now();
  const solved = await solve(runtime, geometry, {
    supportShardSize,
    reducer: {
      outputCapacityPerSegment,
      candidateCapacity,
      segmentCapacity,
      leftCapacity: sideCapacity,
      rightCapacity: sideCapacity,
      blockSize: 256,
    },
  });
  const solveWallMs = performance.now() - solveStarted;
  const expected = geometry.columns === 4 && geometry.rows === 3 && geometry.connect === 3 ? 1
    : geometry.columns === 4 && geometry.rows === 4 && geometry.connect === 4 ? 0
      : geometry.columns === 5 && geometry.rows === 5 && geometry.connect === 4 ? 0
        : geometry.columns === 7 && geometry.rows === 6 && geometry.connect === 4 ? 1
          : null;
  if (expected !== null) assert.equal(solved.rootWdl, expected, 'hybrid root W/D/L disagrees with established result');
  console.log(JSON.stringify({
    schemaVersion: 1,
    kind: 'connect4-cuda-bsfp-compact-hybrid-root-wdl',
    mode: 'native',
    geometry: `${geometry.columns}x${geometry.rows}-c${geometry.connect}`,
    outcome: 'native-compact-hybrid-root-wdl-pass',
    rootWdl: solved.rootWdl,
    expectedRootWdl: expected,
    supportSkeletons: solved.supportSkeletons,
    winningLines: solved.winningLines,
    timingsMs: { runtimeOpen: runtimeOpenMs, solve: solveWallMs, processToResult: performance.now() - started },
    performance: {
      supportsPerSecond: solved.supportSkeletons * 1000 / solveWallMs,
      structuralPrepareMs: solved.metrics.structuralPrepareMs,
      gpuPairReduceWallMs: solved.metrics.gpuPairReduceWallMs,
      finalizeMs: solved.metrics.finalizeMs,
    },
    frontiers: {
      totalBoundaryRecords: solved.metrics.totalBoundaryRecords,
      maximumWinFrontier: solved.metrics.maximumWinFrontier,
      maximumLossFrontier: solved.metrics.maximumLossFrontier,
      peakResidentBoundaryRecords: solved.metrics.peakResidentBoundaryRecords,
      rootWinRecords: solved.rootFrontier.wins.length,
      rootLossRecords: solved.rootFrontier.losses.length,
    },
    gpuReducer: solved.metrics.reducer,
    rankSummaries: solved.metrics.rankSummaries,
  }, null, 2));
} finally {
  if (runtime) {
    const closed = await runtime.close();
    assert.equal(closed.graceful, true);
  }
}
