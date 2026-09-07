import { IncumbentSearchEngine } from '../components/incumbent/index.mjs';

function resultClass(score) {
  return score > 0 ? 1 : score < 0 ? -1 : 0;
}

function createGroup() {
  return {
    positions: 0,
    optimalMoves: 0,
    resultClassPreserved: 0,
    totalStrongRegret: 0,
    resultClassDrops: 0,
  };
}

export function measureStrengthAtDepth(vectors, depth, { ttCapacity = 262144 } = {}) {
  if (!Number.isInteger(depth) || depth < 1) throw new RangeError('depth must be an integer >= 1');
  if (!Array.isArray(vectors) || vectors.length === 0) throw new RangeError('vectors must be a non-empty array');

  const summary = createGroup();
  const groups = Object.create(null);
  let nodes = 0;
  let evaluatorCalls = 0;

  for (let i = 0; i < vectors.length; i++) {
    const vector = vectors[i];
    const engine = new IncumbentSearchEngine({ ttCapacity, orderingPolicy: 'persistent-best-move' });
    const moves = new Uint8Array(vector.sequence.length);
    for (let j = 0; j < vector.sequence.length; j++) moves[j] = vector.sequence.charCodeAt(j) - 49;
    const position = engine.createPosition(moves);
    const result = engine.search(position, depth);
    if (result.move === null) throw new Error(`strength vector unexpectedly terminal: ${vector.sequence}`);

    const chosenStrongScore = vector.moveScores[result.move];
    if (chosenStrongScore <= -1000) throw new Error(`incumbent selected an illegal oracle move: ${vector.sequence}`);
    const optimal = chosenStrongScore === vector.oracleScore;
    const classPreserved = resultClass(chosenStrongScore) === resultClass(vector.oracleScore);
    const regret = vector.oracleScore - chosenStrongScore;
    const classDropped = resultClass(chosenStrongScore) < resultClass(vector.oracleScore);

    summary.positions++;
    if (optimal) summary.optimalMoves++;
    if (classPreserved) summary.resultClassPreserved++;
    summary.totalStrongRegret += regret;
    if (classDropped) summary.resultClassDrops++;

    const group = groups[vector.group] ?? (groups[vector.group] = createGroup());
    group.positions++;
    if (optimal) group.optimalMoves++;
    if (classPreserved) group.resultClassPreserved++;
    group.totalStrongRegret += regret;
    if (classDropped) group.resultClassDrops++;

    nodes += result.metrics.nodes;
    evaluatorCalls += result.metrics.evaluatorCalls;
  }

  return {
    depth,
    ...summary,
    optimalMoveRate: summary.optimalMoves / summary.positions,
    resultClassPreservationRate: summary.resultClassPreserved / summary.positions,
    meanStrongRegret: summary.totalStrongRegret / summary.positions,
    nodes,
    evaluatorCalls,
    groups,
  };
}

export function measureStrengthCurve(vectors, { minDepth = 1, maxDepth = 12, ttCapacity = 262144 } = {}) {
  if (!Number.isInteger(minDepth) || !Number.isInteger(maxDepth) || minDepth < 1 || maxDepth < minDepth) {
    throw new RangeError('invalid strength depth range');
  }
  const results = new Array(maxDepth - minDepth + 1);
  for (let depth = minDepth; depth <= maxDepth; depth++) {
    results[depth - minDepth] = measureStrengthAtDepth(vectors, depth, { ttCapacity });
  }
  return results;
}
