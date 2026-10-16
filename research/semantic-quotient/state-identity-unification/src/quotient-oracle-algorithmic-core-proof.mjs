import assert from 'node:assert/strict';

import { loadSolvedActionCorpus } from '../../../../components/oracle/corpus.mjs';
import { ExactConnect4Oracle, ORACLE_CONSTANTS } from '../../../../components/oracle/exact7x6.mjs';
import {
  geometry,
  replay,
  play,
  residuals,
  cofactor,
} from './quotient-structural-discovery-signature.mjs';

const calibration = loadSolvedActionCorpus(
  new URL('../../../../reference/oracles/solved-actions-v1.meta.json', import.meta.url),
);
const spotchecks = loadSolvedActionCorpus(
  new URL('../../../../reference/oracles/beginning-spotchecks-v1.meta.json', import.meta.url),
);

const g = geometry(7, 6, 4);
const INVALID = ORACLE_CONSTANTS.INVALID_MOVE;

function movesFromSequence(sequence) {
  return Array.from(sequence, (ch) => Number.parseInt(ch, 10) - 1);
}

function mirrorSequence(sequence) {
  return Array.from(sequence, (ch) => String(8 - Number.parseInt(ch, 10))).join('');
}

function winnerFromMoverRelativeScore(score, mover) {
  if (score === 0) return 2;
  return score > 0 ? mover : 1 - mover;
}

function stable(value) {
  return JSON.stringify(value);
}

function checkLocalFormula(sequence, expectedScores = null, expectedParentScore = null) {
  const oracle = new ExactConnect4Oracle();
  const actionScores = Array.from(oracle.analyzeSequence(sequence));

  if (expectedScores !== null) {
    assert.deepEqual(actionScores, expectedScores, `qualified oracle action-vector drift at ${sequence}`);
  }

  const legalScores = actionScores.filter((score) => score !== INVALID);
  assert.ok(legalScores.length > 0, `nonterminal corpus position has no legal move: ${sequence}`);
  const parentScore = Math.max(...legalScores);
  if (expectedParentScore !== null) {
    assert.equal(parentScore, expectedParentScore, `external parent-score drift at ${sequence}`);
  }

  const state = replay(g, movesFromSequence(sequence));
  assert.equal(state.terminal, null, `oracle corpus state is terminal under independent physical replay: ${sequence}`);

  const R = residuals(g, state);
  const mover = state.ply & 1;
  const parentWinner = winnerFromMoverRelativeScore(parentScore, mover);
  const actionWinners = [];

  for (let column = 0; column < g.width; column += 1) {
    const score = actionScores[column];
    if (score === INVALID) {
      assert.equal(state.heights[column], g.height, `oracle/physical legality mismatch at ${sequence} c${column + 1}`);
      continue;
    }

    assert.ok(state.heights[column] < g.height, `oracle admitted full column at ${sequence} c${column + 1}`);

    const landingCell = column * g.height + state.heights[column];
    const formulaResiduals = cofactor(R, mover, landingCell);
    const physicalChild = play(g, state, column);
    const reconstructedResiduals = residuals(g, physicalChild);

    assert.equal(
      stable(formulaResiduals),
      stable(reconstructedResiduals),
      `q-local cofactor != independently reconstructed child residuals at ${sequence} c${column + 1}`,
    );

    const expectedHeights = [...state.heights];
    expectedHeights[column] += 1;
    assert.deepEqual(
      physicalChild.heights,
      expectedHeights,
      `support transition mismatch at ${sequence} c${column + 1}`,
    );

    const actionWinner = winnerFromMoverRelativeScore(score, mover);
    actionWinners.push(actionWinner);

    if (physicalChild.terminal !== null) {
      assert.equal(
        actionWinner,
        physicalChild.terminal,
        `oracle/physical immediate terminal mismatch at ${sequence} c${column + 1}`,
      );
    }
  }

  for (const claimant of [0, 1]) {
    const oracleClaim = parentWinner === claimant;
    const localFormulaClaim = mover === claimant
      ? actionWinners.some((winner) => winner === claimant)
      : actionWinners.every((winner) => winner === claimant);

    assert.equal(
      localFormulaClaim,
      oracleClaim,
      `claim-relative OR/AND recurrence mismatch at ${sequence}, claimant P${claimant}`,
    );
  }

  return {
    legalActions: legalScores.length,
    transitions: actionWinners.length,
    parentScore,
    parentWinner,
  };
}

const sourceVectors = [...calibration.vectors, ...spotchecks.vectors];
const seenMirrors = new Set();
let sourcePositions = 0;
let mirroredPositions = 0;
let transitions = 0;
let winParents = 0;
let drawParents = 0;
let lossParents = 0;

for (const vector of sourceVectors) {
  const source = checkLocalFormula(vector.sequence, vector.moveScores, vector.oracleScore);
  sourcePositions += 1;
  transitions += source.transitions;
  if (source.parentScore > 0) winParents += 1;
  else if (source.parentScore < 0) lossParents += 1;
  else drawParents += 1;

  const mirrored = mirrorSequence(vector.sequence);
  if (mirrored === vector.sequence || seenMirrors.has(mirrored)) continue;
  seenMirrors.add(mirrored);

  const expectedMirrorScores = [...vector.moveScores].reverse();
  const mirror = checkLocalFormula(mirrored, expectedMirrorScores, vector.oracleScore);
  mirroredPositions += 1;
  transitions += mirror.transitions;
}

const result = {
  schema: 'connect4.oracle-algorithmic-core-local-proof.v0_1',
  standardBoard: [7, 6, 4],
  sourcePositions,
  mirroredPositions,
  totalPositions: sourcePositions + mirroredPositions,
  transitions,
  sourceParentClasses: {
    moverWin: winParents,
    draw: drawParents,
    moverLoss: lossParents,
  },
  checked: {
    externalParentScore: true,
    qualifiedOracleActionVector: true,
    mirrorActionVector: true,
    supportTransition: true,
    residualCofactorTransition: true,
    immediateTerminalAgreement: true,
    claimantExistentialUniversalRecurrence: true,
    formulaRecursiveDescentUsed: false,
    solvedOracleUsedOnlyAsValidationBoundary: true,
  },
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
