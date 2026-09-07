import { IncumbentSearchEngine } from '../components/incumbent/index.mjs';
import { loadSolvedActionCorpus } from '../components/oracle/index.mjs';
import { measureStrengthCurve } from './strength-lib.mjs';

const calibration = loadSolvedActionCorpus(new URL('../reference/oracles/solved-actions-v1.meta.json', import.meta.url));
const beginningSpotchecks = loadSolvedActionCorpus(new URL('../reference/oracles/beginning-spotchecks-v1.meta.json', import.meta.url));
const maxDepth = Number.parseInt(process.env.C4_STRENGTH_MAX_DEPTH ?? '12', 10);
const ttCapacity = Number.parseInt(process.env.C4_STRENGTH_TT_CAPACITY ?? '262144', 10);
if (!Number.isInteger(maxDepth) || maxDepth < 1) throw new RangeError('C4_STRENGTH_MAX_DEPTH must be an integer >= 1');
if (!Number.isInteger(ttCapacity) || ttCapacity < 2) throw new RangeError('C4_STRENGTH_TT_CAPACITY must be an integer >= 2');

function movesFromSequence(sequence) {
  const moves = new Uint8Array(sequence.length);
  for (let i = 0; i < sequence.length; i++) moves[i] = sequence.charCodeAt(i) - 49;
  return moves;
}

function traceSolvedVector(vector, depth) {
  const engine = new IncumbentSearchEngine({ ttCapacity, orderingPolicy: 'persistent-best-move' });
  const result = engine.search(engine.createPosition(movesFromSequence(vector.sequence)), depth);
  const strongScore = vector.moveScores[result.move];
  return {
    depth,
    move: result.move,
    moveOneBased: result.move + 1,
    incumbentStrongScore: strongScore,
    oracleStrongScore: vector.oracleScore,
    resultClassPreserved: Math.sign(strongScore) === Math.sign(vector.oracleScore),
    optimal: strongScore === vector.oracleScore,
    nodes: result.metrics.nodes,
    evaluatorCalls: result.metrics.evaluatorCalls,
  };
}

const knownDefect = beginningSpotchecks.vectors.find((vector) => vector.sequence === '54676552255627');
if (!knownDefect) throw new Error('known solved defect vector is missing');

console.log(JSON.stringify({
  schema: 'connect4-incumbent-strength-evidence-v2',
  sourceRevision: process.env.C4_SOURCE_REVISION ?? process.env.GITHUB_SHA ?? null,
  runtime: {
    node: process.version,
    v8: process.versions.v8,
    platform: process.platform,
    arch: process.arch,
  },
  search: {
    method: 'production-iterative-deepening',
    orderingPolicy: 'persistent-best-move',
    independentPositionIsolation: 'fresh-engine-per-position',
    ttCapacity,
  },
  calibration: {
    corpus: calibration.schema,
    positions: calibration.vectors.length,
    selection: calibration.provenance.selection,
    results: measureStrengthCurve(calibration.vectors, { maxDepth, ttCapacity }),
  },
  beginningSpotchecks: {
    corpus: beginningSpotchecks.schema,
    positions: beginningSpotchecks.vectors.length,
    selection: beginningSpotchecks.provenance.selection,
    representative: false,
    results: measureStrengthCurve(beginningSpotchecks.vectors, { maxDepth, ttCapacity }),
  },
  solvedDefectTrace: {
    sequence: knownDefect.sequence,
    moveScores: knownDefect.moveScores,
    oracleStrongScore: knownDefect.oracleScore,
    depth12: traceSolvedVector(knownDefect, 12),
    depth19: traceSolvedVector(knownDefect, 19),
  },
}, null, 2));
