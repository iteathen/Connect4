#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const CENSUS = fileURLToPath(new URL('./quotient-standard7x6-proof-frontier-census.mjs', import.meta.url));
const PONS_INVALID_MOVE = -1000;

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function runCensus() {
  const child = spawnSync(process.execPath, [CENSUS], {
    env: process.env,
    encoding: 'utf-8',
    timeout: 20 * 60 * 1000,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (child.error) throw child.error;
  if (child.status !== 0) throw new Error(`proof-frontier census failed: ${(child.stderr ?? '').slice(-8000)}`);
  const line = (child.stdout ?? '').split(/\r?\n/).find(value => value.startsWith('PROOF_FRONTIER_CENSUS='));
  if (!line) throw new Error('proof-frontier census did not emit PROOF_FRONTIER_CENSUS');
  return JSON.parse(line.slice('PROOF_FRONTIER_CENSUS='.length));
}

function parsePonsLine(sequence, line) {
  const fields = line.trim().split(/\s+/);
  const scoreFields = sequence.length === 0 ? fields : fields[0] === sequence ? fields.slice(1) : null;
  if (!scoreFields || scoreFields.length !== DOMAIN.columns) throw new Error(`invalid Pons line for ${sequence}: ${line}`);
  return scoreFields.map((field, column) => {
    const score = Number(field);
    if (!Number.isSafeInteger(score) || score < PONS_INVALID_MOVE || score > 64) {
      throw new RangeError(`invalid Pons score ${field} at ${sequence}/${column + 1}`);
    }
    return score;
  });
}

function analyzeBatch(sequences) {
  if (sequences.length === 0) return [];
  const solver = requiredEnv('PONS_SOLVER_PATH');
  const book = requiredEnv('PONS_BOOK_PATH');
  const child = spawnSync(solver, ['-a', '-b', book], {
    input: `${sequences.join('\n')}\n`,
    encoding: 'utf-8',
    timeout: 120000,
    maxBuffer: Math.max(2 * 1048576, sequences.length * 256),
  });
  if (child.error) throw child.error;
  if (child.status !== 0) throw new Error(`Pons batch failed: ${(child.stderr ?? '').slice(-8000)}`);
  const lines = (child.stdout ?? '').split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length !== sequences.length) throw new Error(`Pons returned ${lines.length} lines for ${sequences.length} inputs`);
  return sequences.map((sequence, index) => parsePonsLine(sequence, lines[index]));
}

function subset(left, right) {
  return (((left[0] & ~right[0]) >>> 0) === 0) && (((left[1] & ~right[1]) >>> 0) === 0);
}

function residualImplies(leftTerms, rightTerms) {
  for (const left of leftTerms) {
    let witnessed = false;
    for (const right of rightTerms) {
      if (subset(right, left)) {
        witnessed = true;
        break;
      }
    }
    if (!witnessed) return false;
  }
  return true;
}

function stateData(kernel, stateId, sequence = null) {
  const support = kernel.states.supportAt(stateId);
  return Object.freeze({
    stateId,
    sequence,
    support,
    rank: kernel.supportAccess.rankAt(support),
    p0Class: kernel.states.p0At(stateId),
    p1Class: kernel.states.p1At(stateId),
    p0: kernel.classes.terms(kernel.states.p0At(stateId)),
    p1: kernel.classes.terms(kernel.states.p1At(stateId)),
  });
}

function qKey(state) {
  return `${state.support}:${state.p0Class}:${state.p1Class}`;
}

function dominates(a, b) {
  if (a.support !== b.support || (a.rank & 1) !== (b.rank & 1)) return false;
  return residualImplies(b.p0, a.p0) && residualImplies(a.p1, b.p1);
}

function transitionPreserves(kernel, easier, harder, column) {
  const left = kernel.advance(easier.stateId, column);
  const right = kernel.advance(harder.stateId, column);
  if (left === domain.QN_ILLEGAL || right === domain.QN_ILLEGAL) return left === right;
  const p0ToMove = (easier.rank & 1) === 0;
  const leftTerminal = left === domain.QN_TERMINAL_WIN;
  const rightTerminal = right === domain.QN_TERMINAL_WIN;
  if (p0ToMove) {
    if (rightTerminal && !leftTerminal) return false;
    if (leftTerminal) return true;
  } else {
    if (leftTerminal && !rightTerminal) return false;
    if (rightTerminal) return true;
  }
  if (left < 0 || right < 0) return left === right;
  return dominates(stateData(kernel, left), stateData(kernel, right));
}

function replay(kernel, sequence) {
  let stateId = kernel.rootId;
  for (const digit of sequence) {
    const child = kernel.advance(stateId, Number(digit) - 1);
    if (!Number.isSafeInteger(child) || child < 0) throw new Error(`replay crossed terminal/illegal edge at ${sequence}`);
    stateId = child;
  }
  return stateId;
}

function legalColumns(kernel, stateId) {
  const support = kernel.states.supportAt(stateId);
  const result = [];
  for (let column = 0; column < DOMAIN.columns; column += 1) {
    if (kernel.supportAccess.landingAt(support, column) !== 0xff) result.push(column);
  }
  return result;
}

function maximumMatching(nodes, edgeSet) {
  const nodeSet = new Set(nodes);
  const memo = new Map();
  function solve(remaining) {
    if (remaining.length < 2) return [];
    const key = remaining.join(',');
    const cached = memo.get(key);
    if (cached) return cached;
    const first = remaining[0];
    let best = solve(remaining.slice(1));
    for (let index = 1; index < remaining.length; index += 1) {
      const second = remaining[index];
      const edgeKey = first < second ? `${first}:${second}` : `${second}:${first}`;
      if (!edgeSet.has(edgeKey) || !nodeSet.has(second)) continue;
      const next = remaining.slice(1, index).concat(remaining.slice(index + 1));
      const candidate = [[first, second], ...solve(next)];
      if (candidate.length > best.length) best = candidate;
    }
    memo.set(key, best);
    return best;
  }
  return solve([...nodes].sort((a, b) => a - b));
}

const census = runCensus();
if (census.frontierDepth !== 8) throw new Error(`expected depth-8 census, got ${census.frontierDepth}`);
const level7 = census.levels.find(level => level.ply === 7);
if (!level7) throw new Error('census omitted ply-7 level');

const parentPrefixes = new Set(census.representativeQuotientStates.map(entry => entry.sequence.slice(0, 7)));
if (parentPrefixes.size !== level7.uniquePhysicalStates) {
  throw new Error(`representative prefixes cover ${parentPrefixes.size} ply-7 parents, expected ${level7.uniquePhysicalStates}`);
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 262144 }),
});
kernel.prepareSearchStorage();

const parents = [...parentPrefixes].sort().map(sequence => {
  const stateId = replay(kernel, sequence);
  const rank = kernel.supportAccess.rankAt(kernel.states.supportAt(stateId));
  if (rank !== 7) throw new Error(`parent ${sequence} rank ${rank} != 7`);
  return { sequence, stateId, legal: legalColumns(kernel, stateId), children: new Map() };
});

const childSequences = [];
const childRefs = [];
for (const parent of parents) {
  for (const column of parent.legal) {
    const childId = kernel.advance(parent.stateId, column);
    if (childId < 0) throw new Error(`P1 proof-frontier reply unexpectedly terminal at ${parent.sequence}/${column + 1}`);
    const sequence = `${parent.sequence}${column + 1}`;
    const immediate = domain.tacticalExactValue(kernel.tacticalCode(childId)) === 1;
    const child = { column, sequence, stateId: childId, immediate, scores: null };
    parent.children.set(column, child);
    childSequences.push(sequence);
    childRefs.push(child);
  }
}
const scores = analyzeBatch(childSequences);
for (let index = 0; index < childRefs.length; index += 1) childRefs[index].scores = scores[index];

let rawSiblingEdges = 0;
let nonImmediateSiblingEdges = 0;
let exactWinningCrossPairs = 0;
let exactQConvergencePairs = 0;
let strictDominancePairs = 0;
let incomparableWinningCrossPairs = 0;
let candidateTransitionChecks = 0;
let candidateTransitionViolations = 0;
const violationExamples = [];
let baselineRecursiveObligations = 0;
let equalityMatchedPairs = 0;
let dominanceMatchedPairs = 0;
let parentsWithEqualityReduction = 0;
let parentsWithDominanceReduction = 0;
let maxEqualityMatching = 0;
let maxDominanceMatching = 0;
const parentProfiles = [];

for (const parent of parents) {
  const nonImmediate = parent.legal.filter(column => !parent.children.get(column).immediate);
  baselineRecursiveObligations += nonImmediate.length;
  const equalityEdges = new Set();
  const dominanceEdges = new Set();
  const pairDetails = [];

  for (let i = 0; i < parent.legal.length; i += 1) {
    for (let j = i + 1; j < parent.legal.length; j += 1) {
      rawSiblingEdges += 1;
      const leftColumn = parent.legal[i];
      const rightColumn = parent.legal[j];
      const leftChild = parent.children.get(leftColumn);
      const rightChild = parent.children.get(rightColumn);
      if (leftChild.immediate || rightChild.immediate) continue;
      nonImmediateSiblingEdges += 1;

      const leftScore = leftChild.scores[rightColumn];
      const rightScore = rightChild.scores[leftColumn];
      if (leftScore <= 0 || rightScore <= 0) continue;
      exactWinningCrossPairs += 1;

      const leftGrandId = kernel.advance(leftChild.stateId, rightColumn);
      const rightGrandId = kernel.advance(rightChild.stateId, leftColumn);
      if (leftGrandId < 0 || rightGrandId < 0) throw new Error('non-immediate child produced terminal cross response');
      const leftGrand = stateData(kernel, leftGrandId, `${leftChild.sequence}${rightColumn + 1}`);
      const rightGrand = stateData(kernel, rightGrandId, `${rightChild.sequence}${leftColumn + 1}`);
      if (leftGrand.support !== rightGrand.support) throw new Error('cross responses failed to converge support');

      const edgeKey = `${leftColumn}:${rightColumn}`;
      if (qKey(leftGrand) === qKey(rightGrand)) {
        exactQConvergencePairs += 1;
        equalityEdges.add(edgeKey);
        dominanceEdges.add(edgeKey);
        pairDetails.push({ columns: [leftColumn + 1, rightColumn + 1], kind: 'exact-q', leftScore, rightScore });
        continue;
      }

      const leftDominates = dominates(leftGrand, rightGrand);
      const rightDominates = dominates(rightGrand, leftGrand);
      if (leftDominates || rightDominates) {
        strictDominancePairs += 1;
        dominanceEdges.add(edgeKey);
        const easier = leftDominates ? leftGrand : rightGrand;
        const harder = leftDominates ? rightGrand : leftGrand;
        let pairViolations = 0;
        for (const column of legalColumns(kernel, easier.stateId)) {
          candidateTransitionChecks += 1;
          if (!transitionPreserves(kernel, easier, harder, column)) {
            pairViolations += 1;
            candidateTransitionViolations += 1;
            if (violationExamples.length < 20) {
              violationExamples.push({ parent: parent.sequence, columns: [leftColumn + 1, rightColumn + 1], nextColumn: column + 1 });
            }
          }
        }
        pairDetails.push({
          columns: [leftColumn + 1, rightColumn + 1],
          kind: leftDominates ? 'left-easier' : 'right-easier',
          leftScore,
          rightScore,
          transitionViolations: pairViolations,
        });
      } else {
        incomparableWinningCrossPairs += 1;
      }
    }
  }

  const equalityMatching = maximumMatching(nonImmediate, equalityEdges);
  const dominanceMatching = maximumMatching(nonImmediate, dominanceEdges);
  equalityMatchedPairs += equalityMatching.length;
  dominanceMatchedPairs += dominanceMatching.length;
  if (equalityMatching.length > 0) parentsWithEqualityReduction += 1;
  if (dominanceMatching.length > 0) parentsWithDominanceReduction += 1;
  maxEqualityMatching = Math.max(maxEqualityMatching, equalityMatching.length);
  maxDominanceMatching = Math.max(maxDominanceMatching, dominanceMatching.length);
  parentProfiles.push({
    parent: parent.sequence,
    legalReplies: parent.legal.length,
    immediateChildren: parent.legal.length - nonImmediate.length,
    recursiveChildren: nonImmediate.length,
    exactQPairEdges: equalityEdges.size,
    dominancePairEdges: dominanceEdges.size,
    equalityMatching: equalityMatching.map(pair => pair.map(column => column + 1)),
    dominanceMatching: dominanceMatching.map(pair => pair.map(column => column + 1)),
    pairDetails: pairDetails.slice(0, 12),
  });
}

parentProfiles.sort((left, right) =>
  right.dominanceMatching.length - left.dominanceMatching.length
  || right.dominancePairEdges - left.dominancePairEdges
  || right.recursiveChildren - left.recursiveChildren
  || left.parent.localeCompare(right.parent));

console.log(`SIBLING_CROSS_RESPONSE=${JSON.stringify({
  kind: 'standard7x6-ply7-sibling-cross-response-v1',
  attribution: {
    researchDirectionAndStructuralTarget: 'Josh Oshiro',
    formalizationImplementationAndQualification: 'OpenAI ChatGPT',
  },
  sourceConstruction: census.construction,
  oracleAuthority: 'Pons action scores are discovery/falsification controls used only to reject cross-responses that are not value-preserving; equality/dominance claims use q structure only',
  parentStates: parents.length,
  rawSiblingPairs: rawSiblingEdges,
  nonImmediateSiblingPairs: nonImmediateSiblingEdges,
  exactWinningCrossPairs,
  exactQConvergencePairs,
  strictDominancePairs,
  incomparableWinningCrossPairs,
  candidateTransitionChecks,
  candidateTransitionViolations,
  violationExamples,
  baselineRecursiveObligations,
  equalityMatchedPairs,
  dominanceMatchedPairs,
  equalityOnlyObligationsAfterPairing: baselineRecursiveObligations - equalityMatchedPairs,
  dominanceCandidateObligationsAfterPairing: baselineRecursiveObligations - dominanceMatchedPairs,
  equalityReductionFraction: equalityMatchedPairs / Math.max(1, baselineRecursiveObligations),
  dominanceReductionFraction: dominanceMatchedPairs / Math.max(1, baselineRecursiveObligations),
  parentsWithEqualityReduction,
  parentsWithDominanceReduction,
  maxEqualityMatching,
  maxDominanceMatching,
  topParentProfiles: parentProfiles.slice(0, 30),
  interpretation: {
    exactQEdge: 'two distinct defender replies can be answered crosswise by P0 with exact-winning actions that land in the same exact q consequence',
    dominanceEdge: 'the cross responses have common support and one residual consequence is structurally no harder for P0; if residual dominance is proven as a transition simulation, one harder grandchild proof discharges both sibling replies',
    matching: 'each matched sibling pair replaces two recursive child obligations by at most one lower recursive grandchild obligation; immediate children are already discharged separately',
  },
  theoremStatus: 'bounded discovery/control only; exact-q convergence is semantically exact, while strict dominance requires a general theorem before proof reuse',
})}`);
