#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const CENSUS = fileURLToPath(new URL('./quotient-standard7x6-proof-frontier-census.mjs', import.meta.url));

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

function subset(left, right) {
  return (((left[0] & ~right[0]) >>> 0) === 0) && (((left[1] & ~right[1]) >>> 0) === 0);
}

// OR-of-AND residual formula implication:
// phi(X) => phi(Y) iff every minimal X term contains some minimal Y term.
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

function replay(kernel, sequence) {
  let stateId = kernel.rootId;
  for (const digit of sequence) {
    const child = kernel.advance(stateId, Number(digit) - 1);
    if (!Number.isSafeInteger(child) || child < 0) throw new Error(`replay crossed terminal/illegal edge at ${sequence}`);
    stateId = child;
  }
  return stateId;
}

function stateData(kernel, stateId, sequence = null) {
  return Object.freeze({
    stateId,
    sequence,
    support: kernel.states.supportAt(stateId),
    rank: kernel.supportAccess.rankAt(kernel.states.supportAt(stateId)),
    p0: kernel.classes.terms(kernel.states.p0At(stateId)),
    p1: kernel.classes.terms(kernel.states.p1At(stateId)),
  });
}

// A dominates B means A is structurally at least as favorable to absolute P0:
// B's P0 completion formula implies A's (A is no harder for P0), while
// A's P1 completion formula implies B's (A is no easier for P1).
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

const census = runCensus();
if (census.frontierDepth !== 8) throw new Error(`expected depth-8 census, got ${census.frontierDepth}`);
const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 262144 }),
});
kernel.prepareSearchStorage();

const recursive = [];
for (const representative of census.representativeQuotientStates) {
  const stateId = replay(kernel, representative.sequence);
  if (domain.tacticalExactValue(kernel.tacticalCode(stateId)) !== null) continue;
  recursive.push(stateData(kernel, stateId, representative.sequence));
}

const bySupport = new Map();
for (const state of recursive) {
  let bucket = bySupport.get(state.support);
  if (!bucket) {
    bucket = [];
    bySupport.set(state.support, bucket);
  }
  bucket.push(state);
}

const outgoing = new Map(recursive.map(state => [state.stateId, new Set()]));
const incoming = new Map(recursive.map(state => [state.stateId, new Set()]));
let strictDominancePairs = 0;
let mutualDominancePairs = 0;
let transitionChecks = 0;
let transitionViolations = 0;
const violationExamples = [];

for (const bucket of bySupport.values()) {
  for (let i = 0; i < bucket.length; i += 1) {
    for (let j = i + 1; j < bucket.length; j += 1) {
      const a = bucket[i];
      const b = bucket[j];
      const ab = dominates(a, b);
      const ba = dominates(b, a);
      if (ab && ba) {
        mutualDominancePairs += 1;
        continue;
      }
      const easier = ab ? a : ba ? b : null;
      const harder = ab ? b : ba ? a : null;
      if (!easier) continue;
      strictDominancePairs += 1;
      outgoing.get(easier.stateId).add(harder.stateId);
      incoming.get(harder.stateId).add(easier.stateId);
      for (let column = 0; column < DOMAIN.columns; column += 1) {
        if (kernel.supportAccess.landingAt(easier.support, column) === 0xff) continue;
        transitionChecks += 1;
        if (!transitionPreserves(kernel, easier, harder, column)) {
          transitionViolations += 1;
          if (violationExamples.length < 20) {
            violationExamples.push({ easier: easier.sequence, harder: harder.sequence, column: column + 1 });
          }
        }
      }
    }
  }
}

const hardest = recursive.filter(state => outgoing.get(state.stateId).size === 0);
const easiest = recursive.filter(state => incoming.get(state.stateId).size === 0);
let coveredByHardest = 0;
let maxHardestCoverage = 0;
const hardestCoverage = [];
for (const hard of hardest) {
  const covered = recursive.filter(state =>
    state.support === hard.support && (state.stateId === hard.stateId || dominates(state, hard)));
  maxHardestCoverage = Math.max(maxHardestCoverage, covered.length);
  hardestCoverage.push({ sequence: hard.sequence, covered: covered.length, examples: covered.slice(0, 8).map(state => state.sequence) });
}
for (const state of recursive) {
  if (hardest.some(hard => hard.support === state.support && (state.stateId === hard.stateId || dominates(state, hard)))) {
    coveredByHardest += 1;
  }
}
hardestCoverage.sort((left, right) => right.covered - left.covered || left.sequence.localeCompare(right.sequence));

const supportSizes = [...bySupport.values()].map(bucket => bucket.length).sort((a, b) => b - a);
console.log(`RECURSIVE_DOMINANCE=${JSON.stringify({
  kind: 'standard7x6-depth8-recursive-residual-dominance-v1',
  attribution: {
    researchDirectionAndStructuralTarget: 'Josh Oshiro',
    formalizationImplementationAndQualification: 'OpenAI ChatGPT',
  },
  sourceFrontierPhysicalStates: census.frontierPhysicalStates,
  recursiveStates: recursive.length,
  exactSupportGroups: bySupport.size,
  largestExactSupportGroup: supportSizes[0] ?? 0,
  strictDominancePairs,
  mutualDominancePairs,
  transitionChecks,
  transitionViolations,
  violationExamples,
  hardestStates: hardest.length,
  easiestStates: easiest.length,
  coveredByHardest,
  uncoveredByHardest: recursive.length - coveredByHardest,
  proofObligationReductionIfTheoremValidated: recursive.length - hardest.length,
  maxStatesCoveredByOneHardestProof: maxHardestCoverage,
  topHardestCoverage: hardestCoverage.slice(0, 20),
  relation: {
    meaning: 'A dominates B iff same support/side, phi_P0(B) => phi_P0(A), and phi_P1(A) => phi_P1(B); A is no harder for P0 and no easier for P1.',
    intendedTransport: 'Win0(B) => Win0(A). Therefore only sink/hardest obligations would require independent positive proofs if the preorder is proven sound under all quotient transitions and terminal cases.',
  },
  theoremStatus: 'bounded structural simulation test only; zero transition violations would motivate a general proof from the C4-0010 residual transition laws, not establish it by enumeration',
})}`);
