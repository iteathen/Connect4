import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import {
  createBsfpSupportLatticeProfile,
  normalizeMaximalPacked42Antichain,
  normalizeMinimalPacked42Antichain,
} from '../../components/bsfp/index.mjs';
import { createConnectWinningLines } from '../../components/bsfp/geometry.mjs';
import { SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION } from '../../components/bsfp/cuda/packed42-direction.mjs';
import { TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES } from '../../components/bsfp/cuda/tensor-overflow-contract.mjs';

const TWO32 = 0x1_0000_0000;
const MAX_MASK_42 = 2 ** 42 - 1;
// CUDA-JS SPEC-0004 policy; independent of both Tensor workspace profiles.
const CUDA_MEMORY_POLICY = Object.freeze({ maxDeviceBytes: 268435456, maxAllocationBytes: 134217728, maxTransferBytes: 16777216 });

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

function envPositive(env, name, fallback) {
  const value = env[name] === undefined ? fallback : Number(env[name]);
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${name} must be a positive safe integer`);
  return value;
}

function envBoolean(env, name, fallback) {
  if (env[name] === undefined) return fallback;
  if (env[name] === '1') return true;
  if (env[name] === '0') return false;
  throw new RangeError(`${name} must be 0 or 1`);
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

export function cofactorUpward(frontier, landingCell, mover, preserve = true) {
  const result = [];
  if (mover === 0) for (const mask of frontier) result.push(clearCell(mask, landingCell));
  else for (const mask of frontier) if (!hasCell(mask, landingCell)) result.push(mask);
  // Filtering an antichain preserves incomparability (O1 preservation law).
  return preserve && mover === 1 ? Object.freeze(result) : normalizeMinimal(result);
}

export function cofactorDownward(frontier, landingCell, mover, preserve = true) {
  const result = [];
  if (mover === 0) {
    for (const mask of frontier) if (hasCell(mask, landingCell)) result.push(clearCell(mask, landingCell));
  } else {
    for (const mask of frontier) result.push(clearCell(mask, landingCell));
  }
  // Every retained cap contained the fixed bit. Removing the common bit is
  // injective and preserves subset order, so normalization is redundant.
  return preserve && mover === 0 ? Object.freeze(result) : normalizeMaximal(result);
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
    for (const mask of candidates) result.push(mask);
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
    for (const mask of candidates) result.push(mask);
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

export function reflectSupportIndex(index, support) {
  let remaining = index;
  let reflected = 0;
  for (let column = 0; column < support.columns; column += 1) {
    reflected = reflected * support.radix + remaining % support.radix;
    remaining = Math.floor(remaining / support.radix);
  }
  return reflected;
}

export function reflectPacked42(mask, columns) {
  let reflected = 0;
  forEachSetCell(mask, (cell) => {
    const row = Math.floor(cell / columns);
    reflected += 2 ** (row * columns + columns - 1 - cell % columns);
  });
  return reflected;
}

function reflectFrontier(frontier, columns) {
  // A geometric permutation preserves both subset order and exact identity.
  return Object.freeze({
    wins: Object.freeze(frontier.wins.map(mask => reflectPacked42(mask, columns))),
    losses: Object.freeze(frontier.losses.map(mask => reflectPacked42(mask, columns))),
  });
}

function rankItems(support, reflection) {
  const result = Array.from({ length: support.maxRank + 1 }, () => []);
  for (let index = 0; index < support.itemCapacity; index += 1) {
    if (!reflection || index <= reflectSupportIndex(index, support)) result[support.ranks[index]].push(index);
  }
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

function prepareSupport(supportIndex, rank, support, childRank, geometry, incidence, options, metrics) {
  const heights = support.decodeHeights(supportIndex);
  const mover = rank & 1;
  const universeMask = supportUniverseMask(heights, geometry.columns);
  const intersectionSets = [];
  const unionValues = [];
  for (let column = 0; column < geometry.columns; column += 1) {
    const row = heights[column];
    if (row >= geometry.rows) continue;
    const landingCell = row * geometry.columns + column;
    const childIndex = supportIndex + support.weights[column];
    const reflectedIndex = options.reflection ? reflectSupportIndex(childIndex, support) : childIndex;
    const canonicalIndex = Math.min(childIndex, reflectedIndex);
    let child = childRank.get(canonicalIndex);
    if (!child) throw new Error(`missing child frontier for support ${supportIndex}`);
    if (canonicalIndex !== childIndex) {
      metrics.reflectedChildLookups += 1;
      metrics.reflectedChildRecords += child.wins.length + child.losses.length;
      child = reflectFrontier(child, geometry.columns);
    }
    const moveWins = cofactorUpward(child.wins, landingCell, mover, options.cofactorPreservation);
    const moveLosses = cofactorDownward(child.losses, landingCell, mover, options.cofactorPreservation);
    if (mover === 0) {
      for (const mask of moveWins) unionValues.push(mask);
      intersectionSets.push(moveLosses);
    } else {
      intersectionSets.push(moveWins);
      for (const mask of moveLosses) unionValues.push(mask);
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
        context: { supportIndex: item.supportIndex, stage, rank: metrics.activeRank },
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

// The reducer is injected for independent qualification; native main always
// supplies the CUDA service. Observers cannot select or change recurrence work.
export async function solveCompactHybrid(geometry, options, reducer, { onFrontier = null, progress = true } = {}) {
  const support = createBsfpSupportLatticeProfile(geometry);
  const masks = lineMasks(geometry);
  const incidence = lineIncidence(masks, geometry.columns * geometry.rows);
  const ranks = rankItems(support, options.reflection);
  const metrics = {
    structuralPrepareMs: 0,
    gpuPairReduceWallMs: 0,
    finalizeMs: 0,
    totalBoundaryRecords: 0,
    maximumWinFrontier: 0,
    maximumLossFrontier: 0,
    peakResidentBoundaryRecords: 0,
    processedSupports: 0,
    reflectedChildLookups: 0,
    reflectedChildRecords: 0,
    rankSummaries: [],
    activeRank: null,
    activeShardStart: null,
  };
  const solveStarted = performance.now();
  const cpuStarted = process.cpuUsage();
  const reportProgress = () => { if (progress) console.error(JSON.stringify({ kind: 'compact-hybrid-progress', elapsedMs: performance.now() - solveStarted, cpuMicroseconds: process.cpuUsage(cpuStarted), activeRank: metrics.activeRank, activeShardStart: metrics.activeShardStart, processedSupports: metrics.processedSupports, completedRanks: metrics.rankSummaries.length, gpuReducer: reducer.snapshotStats() })); };
  const progressTimer = progress ? setInterval(reportProgress, 5000) : null;
  progressTimer?.unref();
  let childRank = new Map();
  let childBoundaryRecords = 0;
  try {
    for (let rank = support.maxRank; rank >= 0; rank -= 1) {
      metrics.activeRank = rank;
      const items = ranks[rank];
      const currentRank = new Map();
      let rankBoundaryRecords = 0;
      let rankMaxWin = 0;
      let rankMaxLoss = 0;
      const rankStarted = performance.now();
      for (let shardStart = 0; shardStart < items.length; shardStart += options.supportShardSize) {
        metrics.activeShardStart = shardStart;
        const shard = items.slice(shardStart, Math.min(items.length, shardStart + options.supportShardSize));
        if (rank === support.maxRank) {
          for (const supportIndex of shard) {
            const frontier = Object.freeze({ wins: Object.freeze([]), losses: Object.freeze([]) });
            currentRank.set(supportIndex, frontier);
            onFrontier?.(supportIndex, frontier);
            metrics.processedSupports += 1;
          }
          continue;
        }
        const prepareStarted = performance.now();
        const pending = shard.map((supportIndex) => prepareSupport(supportIndex, rank, support, childRank, geometry, incidence, options, metrics));
        metrics.structuralPrepareMs += performance.now() - prepareStarted;
        await reduceIntersectionStages(pending, reducer, metrics);
        const finalizeStarted = performance.now();
        for (const item of pending) {
          const frontier = finalizeSupport(item);
          currentRank.set(item.supportIndex, frontier);
          onFrontier?.(item.supportIndex, frontier);
          if (onFrontier && options.reflection) {
            const mirroredIndex = reflectSupportIndex(item.supportIndex, support);
            if (mirroredIndex !== item.supportIndex) onFrontier(mirroredIndex, reflectFrontier(frontier, geometry.columns));
          }
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
      evaluatedSupports: metrics.processedSupports,
      optimizations: { reflection: options.reflection, cofactorPreservation: options.cofactorPreservation },
      winningLines: masks.length,
      rootFrontier: root,
      metrics: Object.freeze({ ...metrics, reducer: reducer.snapshotStats() }),
    });
  } finally {
    clearInterval(progressTimer);
    reportProgress();
    await reducer.close();
  }
}

export function readCompactHybridOptions(env = process.env) {
  const supportShardSize = envPositive(env, 'BSFP_HYBRID_SUPPORT_SHARD_SIZE', 256);
  const outputCapacityPerSegment = envPositive(env, 'BSFP_HYBRID_FRONTIER_CAPACITY', 1024);
  const candidateCapacity = envPositive(env, 'BSFP_HYBRID_CANDIDATE_CAPACITY', 4194304);
  const segmentCapacity = envPositive(env, 'BSFP_HYBRID_SEGMENT_CAPACITY', 256);
  const sideCapacity = envPositive(env, 'BSFP_HYBRID_SIDE_CAPACITY', 262144);
  const tensorCandidateTile = envPositive(env, 'BSFP_HYBRID_TENSOR_CANDIDATE_TILE', 256);
  const tensorReferenceTile = envPositive(env, 'BSFP_HYBRID_TENSOR_REFERENCE_TILE', 1024);
  const tensorMaxWorkspaceBytes = envPositive(env, 'BSFP_HYBRID_TENSOR_MAX_WORKSPACE_BYTES', TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES);
  const tensorBackend = env.BSFP_HYBRID_TENSOR_BACKEND ?? 'simt';
  const overflowExecutor = env.BSFP_HYBRID_OVERFLOW_EXECUTOR ?? 'packed';
  if (!['tensor', 'packed'].includes(overflowExecutor)) throw new RangeError('BSFP_HYBRID_OVERFLOW_EXECUTOR must be tensor or packed');
  if (!['simt', 'prefer-cublaslt', 'cublaslt'].includes(tensorBackend)) throw new RangeError('BSFP_HYBRID_TENSOR_BACKEND must be simt, prefer-cublaslt, or cublaslt');
  if (tensorMaxWorkspaceBytes > TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES) {
    throw new RangeError(`BSFP_HYBRID_TENSOR_MAX_WORKSPACE_BYTES must not exceed ${TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES} for the resolved-plan profile`);
  }

  return {
    supportShardSize,
    reflection: envBoolean(env, 'BSFP_HYBRID_REFLECTION', true),
    cofactorPreservation: envBoolean(env, 'BSFP_HYBRID_COFACTOR_PRESERVATION', true),
    reducer: {
      outputCapacityPerSegment,
      candidateCapacity,
      segmentCapacity,
      leftCapacity: sideCapacity,
      rightCapacity: sideCapacity,
      blockSize: 256,
      tensorCandidateTile,
      tensorReferenceTile,
      tensorMaxWorkspaceBytes,
      tensorBackend,
      overflowExecutor,
    },
  };
}

async function main() {
  const mode = process.argv[2] ?? 'native';
  if (mode !== 'native') throw new RangeError('compact hybrid BSFP currently requires native CUDA');
  const geometry = parseGeometry(process.argv[3] ?? '4x4:c4');
  const options = readCompactHybridOptions();
  console.error(JSON.stringify({ kind: 'compact-hybrid-configuration', options, cudaMemoryPolicy: CUDA_MEMORY_POLICY }));
  if (process.env.BSFP_HYBRID_CAPTURE_OVERFLOW_DIR) {
    const { createOverflowCapture } = await import('./overflow-capture.mjs');
    options.reducer.onOverflow = createOverflowCapture(process.env.BSFP_HYBRID_CAPTURE_OVERFLOW_DIR, geometry);
  }
  let observer = null;
  if (process.env.BSFP_HYBRID_VERIFY_FRONTIERS === '1') {
    if (geometry.columns * geometry.rows > 25) throw new RangeError('all-frontier qualification is bounded to at most 25 cells');
    const { createFrontierObserver } = await import('./qualification.mjs');
    observer = createFrontierObserver(geometry);
  }

  let runtime;
  const started = performance.now();
  try {
    const { openCudaRuntime } = await import('cuda-js');
    const { createPacked42PairReducerService } = await import('../../components/bsfp/cuda/packed42-pair-reducer-tensor-service.mjs');
    runtime = await openCudaRuntime({ compiler: true, driver: { memory: CUDA_MEMORY_POLICY } });
    const runtimeOpenMs = performance.now() - started;
    const solveStarted = performance.now();
    const reducer = await createPacked42PairReducerService(runtime, options.reducer);
    const solved = await solveCompactHybrid(geometry, options, reducer, { onFrontier: observer?.onFrontier });
    const qualification = observer?.finish() ?? null;
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
      qualification,
      expectedRootWdl: expected,
      supportSkeletons: solved.supportSkeletons,
      evaluatedSupports: solved.evaluatedSupports,
      optimizations: solved.optimizations,
      winningLines: solved.winningLines,
      timingsMs: { runtimeOpen: runtimeOpenMs, solve: solveWallMs, processToResult: performance.now() - started },
      performance: {
        supportsPerSecond: solved.evaluatedSupports * 1000 / solveWallMs,
        reflectedChildLookups: solved.metrics.reflectedChildLookups,
        reflectedChildRecords: solved.metrics.reflectedChildRecords,
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

}

if (import.meta.main) await main();
