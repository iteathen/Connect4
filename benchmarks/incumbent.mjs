import os from 'node:os';
import { performance } from 'node:perf_hooks';

import { IncumbentSearchEngine } from '../components/incumbent/index.mjs';

function parsePositiveInteger(name, fallback) {
  const value = Number.parseInt(process.env[name] ?? String(fallback), 10);
  if (!Number.isInteger(value) || value < 1) throw new RangeError(`${name} must be an integer >= 1`);
  return value;
}

const depth = parsePositiveInteger('C4_BENCH_DEPTH', 8);
const repetitions = parsePositiveInteger('C4_BENCH_REPETITIONS', 3);
const wallBudgetMs = parsePositiveInteger('C4_BENCH_WALL_MS', 250);
const wallMaxDepth = parsePositiveInteger('C4_BENCH_WALL_MAX_DEPTH', 14);
const wallRepetitions = parsePositiveInteger('C4_BENCH_WALL_REPETITIONS', 3);
const ttCapacity = parsePositiveInteger('C4_BENCH_TT_CAPACITY', 262144);

const rerootMoves = Object.freeze([3, 3, 3, 3, 2, 1, 5, 4, 4, 1, 4, 1]);
const wallClockMoves = Object.freeze([3, 3, 3, 3, 2, 1, 5, 4]);

function maybeGc() {
  if (typeof globalThis.gc === 'function') globalThis.gc();
}

function memorySnapshot() {
  const m = process.memoryUsage();
  return {
    rss: m.rss,
    heapTotal: m.heapTotal,
    heapUsed: m.heapUsed,
    external: m.external,
    arrayBuffers: m.arrayBuffers,
  };
}

function memoryDelta(before, after) {
  return {
    rss: after.rss - before.rss,
    heapTotal: after.heapTotal - before.heapTotal,
    heapUsed: after.heapUsed - before.heapUsed,
    external: after.external - before.external,
    arrayBuffers: after.arrayBuffers - before.arrayBuffers,
  };
}

function createTotals() {
  return {
    nodes: 0,
    evaluatorCalls: 0,
    tacticalImmediateWins: 0,
    tacticalForcedBlocks: 0,
    tacticalDoubleThreatLosses: 0,
    alphaBetaCutoffs: 0,
    ttProbes: 0,
    ttPositionHits: 0,
    ttScoreHits: 0,
    ttExactHits: 0,
    ttLowerHits: 0,
    ttUpperHits: 0,
    ttExactReturns: 0,
    ttBoundCutoffs: 0,
    ttOrderingHits: 0,
    ttShallowOrderingHits: 0,
    ttCrossPerspectiveOrderingHits: 0,
    ttInsufficientDepthHits: 0,
    ttPerspectiveMisses: 0,
    ttCrossGenerationPositionHits: 0,
    ttCrossGenerationScoreHits: 0,
    ttCrossGenerationOrderingHits: 0,
    ttStores: 0,
    ttReplacements: 0,
  };
}

function accumulate(target, metrics) {
  for (const key of Object.keys(target)) target[key] += metrics[key] ?? 0;
}

function runFixedRequestScenario(resetEachRoot, scenarioDepth = depth, scenarioRepetitions = repetitions) {
  maybeGc();
  const memoryBefore = memorySnapshot();
  let elapsedMs = 0;
  let decisionChecksum = 0;
  const totals = createTotals();

  for (let repetition = 0; repetition < scenarioRepetitions; repetition++) {
    const engine = new IncumbentSearchEngine({ ttCapacity, orderingPolicy: 'persistent-best-move' });
    const position = engine.createPosition();
    for (let ply = 0; ply < rerootMoves.length; ply++) {
      if (resetEachRoot) engine.resetSearchMemory();
      const start = performance.now();
      const result = engine.search(position, scenarioDepth);
      elapsedMs += performance.now() - start;
      accumulate(totals, result.metrics);
      decisionChecksum = (Math.imul(decisionChecksum ^ ((result.move ?? 31) + 1), 0x9e3779b1)
        ^ (Math.trunc(result.normalizedScore) >>> 0)) >>> 0;
      if (position.play(rerootMoves[ply]) < 0) throw new Error(`benchmark fixture became illegal at ply ${ply}`);
    }
  }

  const memoryAfter = memorySnapshot();
  maybeGc();
  const memoryAfterGc = memorySnapshot();
  const seconds = elapsedMs / 1000;
  return {
    resetEachRoot,
    depth: scenarioDepth,
    repetitions: scenarioRepetitions,
    roots: rerootMoves.length * scenarioRepetitions,
    elapsedMs,
    nodesPerSecond: seconds === 0 ? 0 : totals.nodes / seconds,
    evaluatorCallsPerSecond: seconds === 0 ? 0 : totals.evaluatorCalls / seconds,
    alphaBetaCutoffRate: totals.nodes === 0 ? 0 : totals.alphaBetaCutoffs / totals.nodes,
    ttPositionHitRate: totals.ttProbes === 0 ? 0 : totals.ttPositionHits / totals.ttProbes,
    decisionChecksum,
    memory: {
      gcExposed: typeof globalThis.gc === 'function',
      before: memoryBefore,
      after: memoryAfter,
      afterGc: memoryAfterGc,
      deltaBeforeToAfter: memoryDelta(memoryBefore, memoryAfter),
      retainedDeltaAfterGc: memoryDelta(memoryBefore, memoryAfterGc),
    },
    ...totals,
  };
}

function median(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  const middle = sorted.length >>> 1;
  return sorted.length & 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function runWallClockDepthSweep() {
  const depths = [];
  let deepestWithinBudget = 0;
  let firstOverBudgetDepth = null;

  for (let candidateDepth = 1; candidateDepth <= wallMaxDepth; candidateDepth++) {
    const elapsed = new Array(wallRepetitions);
    let reference = null;
    for (let repetition = 0; repetition < wallRepetitions; repetition++) {
      maybeGc();
      const engine = new IncumbentSearchEngine({ ttCapacity, orderingPolicy: 'persistent-best-move' });
      const position = engine.createPosition(wallClockMoves);
      const start = performance.now();
      const result = engine.search(position, candidateDepth);
      elapsed[repetition] = performance.now() - start;
      if (reference === null) {
        reference = {
          move: result.move,
          normalizedScore: result.normalizedScore,
          nodes: result.metrics.nodes,
          evaluatorCalls: result.metrics.evaluatorCalls,
          ttPositionHits: result.metrics.ttPositionHits,
          ttScoreHits: result.metrics.ttScoreHits,
          alphaBetaCutoffs: result.metrics.alphaBetaCutoffs,
        };
      } else if (reference.move !== result.move || reference.normalizedScore !== result.normalizedScore) {
        throw new Error(`wall-clock sweep became nondeterministic at depth ${candidateDepth}`);
      }
    }

    const medianMs = median(elapsed);
    depths.push({
      depth: candidateDepth,
      medianMs,
      minMs: Math.min(...elapsed),
      maxMs: Math.max(...elapsed),
      repetitions: wallRepetitions,
      ...reference,
    });

    if (medianMs <= wallBudgetMs) {
      deepestWithinBudget = candidateDepth;
    } else {
      firstOverBudgetDepth = candidateDepth;
      break;
    }
  }

  return {
    method: 'fresh-engine-full-iterative-deepening-depth-sweep',
    budgetMs: wallBudgetMs,
    maxDepth: wallMaxDepth,
    repetitionsPerDepth: wallRepetitions,
    fixtureMoves: wallClockMoves,
    deepestCompletedDepthWithinBudget: deepestWithinBudget,
    firstOverBudgetDepth,
    depths,
  };
}

const warmDepth = Math.min(depth, 5);
runFixedRequestScenario(false, warmDepth, 1);
runFixedRequestScenario(true, warmDepth, 1);

const persistent = runFixedRequestScenario(false);
const isolatedResetEachRoot = runFixedRequestScenario(true);
const wallClock = runWallClockDepthSweep();
const cpus = os.cpus();

const output = {
  schema: 'connect4-incumbent-node-benchmark-v2',
  sourceRevision: process.env.C4_SOURCE_REVISION ?? process.env.GITHUB_SHA ?? null,
  runtime: {
    node: process.version,
    v8: process.versions.v8,
    platform: process.platform,
    arch: process.arch,
    osRelease: os.release(),
    osVersion: os.version(),
    cpuModel: cpus[0]?.model ?? null,
    logicalCpuCount: cpus.length,
    totalMemoryBytes: os.totalmem(),
    runnerOs: process.env.RUNNER_OS ?? null,
    runnerArch: process.env.RUNNER_ARCH ?? null,
    runnerName: process.env.RUNNER_NAME ?? null,
    imageOs: process.env.ImageOS ?? null,
    imageVersion: process.env.ImageVersion ?? null,
  },
  profile: {
    columns: 7,
    rows: 6,
    orderingPolicy: 'persistent-best-move',
    ttCapacity,
    fixedRequestDepth: depth,
    fixedRequestRepetitions: repetitions,
  },
  fixedRequestWorkload: {
    fixtureMoves: rerootMoves,
    persistent,
    isolatedResetEachRoot,
    persistentVsReset: {
      elapsedRatioResetOverPersistent: persistent.elapsedMs === 0 ? null : isolatedResetEachRoot.elapsedMs / persistent.elapsedMs,
      nodeRatioPersistentOverReset: isolatedResetEachRoot.nodes === 0 ? null : persistent.nodes / isolatedResetEachRoot.nodes,
      evaluatorCallRatioPersistentOverReset: isolatedResetEachRoot.evaluatorCalls === 0 ? null : persistent.evaluatorCalls / isolatedResetEachRoot.evaluatorCalls,
    },
  },
  wallClockDepthSweep: wallClock,
};

console.log(JSON.stringify(output, null, 2));
