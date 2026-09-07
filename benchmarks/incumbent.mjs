import { performance } from 'node:perf_hooks';

import { IncumbentSearchEngine } from '../components/incumbent/index.mjs';

const depth = Number.parseInt(process.env.C4_BENCH_DEPTH ?? '8', 10);
const repetitions = Number.parseInt(process.env.C4_BENCH_REPETITIONS ?? '3', 10);
if (!Number.isInteger(depth) || depth < 1) throw new RangeError('C4_BENCH_DEPTH must be an integer >= 1');
if (!Number.isInteger(repetitions) || repetitions < 1) throw new RangeError('C4_BENCH_REPETITIONS must be an integer >= 1');

const rerootMoves = [3, 3, 3, 3, 2, 1, 5, 4, 4, 1, 4, 1];

function accumulate(target, metrics) {
  target.nodes += metrics.nodes;
  target.evaluatorCalls += metrics.evaluatorCalls;
  target.alphaBetaCutoffs += metrics.alphaBetaCutoffs;
  target.ttPositionHits += metrics.ttPositionHits;
  target.ttScoreHits += metrics.ttScoreHits;
  target.ttCrossGenerationPositionHits += metrics.ttCrossGenerationPositionHits;
  target.ttCrossGenerationScoreHits += metrics.ttCrossGenerationScoreHits;
  target.ttCrossGenerationOrderingHits += metrics.ttCrossGenerationOrderingHits;
  target.ttBoundCutoffs += metrics.ttBoundCutoffs;
}

function runScenario(resetEachRoot, scenarioDepth = depth, scenarioRepetitions = repetitions) {
  let elapsedMs = 0;
  const totals = {
    nodes: 0,
    evaluatorCalls: 0,
    alphaBetaCutoffs: 0,
    ttPositionHits: 0,
    ttScoreHits: 0,
    ttCrossGenerationPositionHits: 0,
    ttCrossGenerationScoreHits: 0,
    ttCrossGenerationOrderingHits: 0,
    ttBoundCutoffs: 0,
  };

  for (let repetition = 0; repetition < scenarioRepetitions; repetition++) {
    const engine = new IncumbentSearchEngine({ orderingPolicy: 'persistent-best-move' });
    const position = engine.createPosition();
    for (let ply = 0; ply < rerootMoves.length; ply++) {
      if (resetEachRoot) engine.resetSearchMemory();
      const start = performance.now();
      const result = engine.search(position, scenarioDepth);
      elapsedMs += performance.now() - start;
      accumulate(totals, result.metrics);
      if (position.play(rerootMoves[ply]) < 0) throw new Error(`benchmark fixture became illegal at ply ${ply}`);
    }
  }

  const seconds = elapsedMs / 1000;
  return {
    resetEachRoot,
    depth: scenarioDepth,
    repetitions: scenarioRepetitions,
    roots: rerootMoves.length * scenarioRepetitions,
    elapsedMs,
    nodesPerSecond: totals.nodes / seconds,
    evaluatorCallsPerSecond: totals.evaluatorCalls / seconds,
    cutoffRate: totals.nodes === 0 ? 0 : totals.alphaBetaCutoffs / totals.nodes,
    ...totals,
  };
}

const warmDepth = Math.min(depth, 5);
runScenario(false, warmDepth, 1);
runScenario(true, warmDepth, 1);

const output = {
  schema: 'connect4-incumbent-reroot-benchmark-v1',
  runtime: {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
  },
  profile: { columns: 7, rows: 6, depth, repetitions },
  fixtureMoves: rerootMoves,
  persistent: runScenario(false),
  isolatedResetEachRoot: runScenario(true),
};

console.log(JSON.stringify(output, null, 2));
