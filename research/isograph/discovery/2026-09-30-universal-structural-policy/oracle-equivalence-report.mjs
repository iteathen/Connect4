#!/usr/bin/env node
import { ExactConnect4Oracle, ORACLE_CONSTANTS } from '../../../../components/oracle/exact7x6.mjs';

const sequence = process.argv[2] ?? '';
if (!/^[1-7]*$/.test(sequence)) {
  throw new RangeError('sequence must contain only one-based columns 1..7');
}

const oracle = new ExactConnect4Oracle();
const scores = Array.from(oracle.analyzeSequence(sequence));

const legal = scores
  .map((score, index) => ({ move: index + 1, score }))
  .filter(({ score }) => score !== ORACLE_CONSTANTS.INVALID_MOVE);

if (legal.length === 0) {
  console.log(JSON.stringify({
    schema: 'connect4.oracle-equivalence-report.v1',
    sequence,
    legalMoves: [],
    disposition: 'NO_LEGAL_MOVES',
  }, null, 2));
  process.exit(0);
}

const classify = (score) => score > 0 ? 'W' : score < 0 ? 'L' : 'D';
const wdlGroups = { W: [], D: [], L: [] };
for (const row of legal) wdlGroups[classify(row.score)].push(row.move);

const exactStrongGroups = [...new Set(legal.map(({ score }) => score))]
  .sort((a, b) => b - a)
  .map((score) => ({
    score,
    result: classify(score),
    moves: legal.filter((row) => row.score === score).map((row) => row.move),
  }));

const bestStrongScore = Math.max(...legal.map(({ score }) => score));
const exactStrongOptimalMoves = legal
  .filter(({ score }) => score === bestStrongScore)
  .map(({ move }) => move);

// Project-perfect semantics:
// 1. If any move forces a win, every winning move is acceptable; win speed is irrelevant.
// 2. Otherwise, if any move forces a draw, every drawing move is acceptable.
// 3. Otherwise all legal moves lose, so retain exactly the moves with maximal
//    strong score (least-negative score = longest delayed forced loss).
let projectOutcome;
let acceptablePerfectMoves;
if (wdlGroups.W.length) {
  projectOutcome = 'W';
  acceptablePerfectMoves = [...wdlGroups.W];
} else if (wdlGroups.D.length) {
  projectOutcome = 'D';
  acceptablePerfectMoves = [...wdlGroups.D];
} else {
  projectOutcome = 'L';
  acceptablePerfectMoves = [...exactStrongOptimalMoves];
}

const reflected = (move) => 8 - move;
const reflectionChecks = legal.map(({ move, score }) => {
  const peer = legal.find((row) => row.move === reflected(move));
  return {
    move,
    reflectedMove: reflected(move),
    score,
    reflectedScore: peer?.score ?? null,
    equal: peer ? peer.score === score : null,
  };
});

console.log(JSON.stringify({
  schema: 'connect4.oracle-equivalence-report.v1',
  sequence,
  semantics: {
    strongScore: 'positive=win, zero=draw, negative=loss; among losses, larger/less-negative delays loss longer',
    projectPerfect: 'any winning move; else any drawing move; else any maximal-loss-delay move',
  },
  fullMoveVector: scores.map((score, index) => ({
    move: index + 1,
    legal: score !== ORACLE_CONSTANTS.INVALID_MOVE,
    score: score === ORACLE_CONSTANTS.INVALID_MOVE ? null : score,
    result: score === ORACLE_CONSTANTS.INVALID_MOVE ? null : classify(score),
  })),
  wdlEquivalentMoves: wdlGroups,
  exactStrongEquivalentClasses: exactStrongGroups,
  exactStrongOptimalMoves,
  projectOutcome,
  acceptablePerfectMoves,
  reflectionChecks,
  oracleNodes: oracle.nodes,
}, null, 2));
