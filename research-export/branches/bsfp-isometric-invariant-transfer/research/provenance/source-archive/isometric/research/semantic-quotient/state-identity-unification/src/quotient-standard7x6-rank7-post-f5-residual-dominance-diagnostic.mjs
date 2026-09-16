#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const CASES = Object.freeze([
  ['A', '466565516634', '466565516643'],
  ['B', '466565526634', '466565526643'],
  ['G', '466565576634', '466565576643'],
]);

function replay(kernel, sequence) {
  let id = kernel.rootId;
  for (const digit of sequence) {
    const next = kernel.advance(id, Number(digit) - 1);
    assert(Number.isSafeInteger(next) && next >= 0, `bad replay ${sequence}`);
    id = next;
  }
  return id;
}
function subset(a, b) {
  return (((a[0] & ~b[0]) >>> 0) === 0) && (((a[1] & ~b[1]) >>> 0) === 0);
}
// Structural implication between monotone residual objectives represented as minimal antichains.
// Returns true iff satisfying every term represented by `left` implies satisfying `right`'s disjunction,
// i.e. every left term contains at least one right term.
function residualImplies(left, right) {
  for (const l of left) {
    let witness = false;
    for (const r of right) {
      if (subset(r, l)) { witness = true; break; }
    }
    if (!witness) return false;
  }
  return true;
}
function candidateDominates(easier, harder) {
  // Candidate local order only: P0 objective no harder and P1 objective no easier.
  return residualImplies(harder.p0, easier.p0) && residualImplies(easier.p1, harder.p1);
}
function cells([lo, hi]) {
  const out = [];
  for (let x = 0; x < 42; x++) {
    const hit = x < 32 ? (((lo >>> x) & 1) !== 0) : (((hi >>> (x - 32)) & 1) !== 0);
    if (hit) out.push(`${String.fromCharCode(65 + (x % 7))}${Math.floor(x / 7) + 1}`);
  }
  return out;
}
function stateData(kernel, id, sequence) {
  const support = kernel.states.supportAt(id);
  const p0Class = kernel.states.p0At(id);
  const p1Class = kernel.states.p1At(id);
  return {
    id, sequence, support,
    rank: kernel.supportAccess.rankAt(support),
    p0Class, p1Class,
    p0: kernel.classes.terms(p0Class),
    p1: kernel.classes.terms(p1Class),
  };
}
function legal(kernel, state) {
  const support = kernel.states.supportAt(state);
  const out = [];
  for (let c = 0; c < 7; c++) if (kernel.supportAccess.landingAt(support, c) !== 0xff) out.push(c);
  return out;
}
function termWitnesses(left, right) {
  return left.map((term) => ({
    term: cells(term),
    witnessedBy: right.filter((candidate) => subset(candidate, term)).map(cells),
  })).filter((entry) => entry.witnessedBy.length === 0);
}
function compactTerms(terms) {
  return terms.map(cells).sort((a, b) => a.join(',').localeCompare(b.join(',')));
}
function compareState(kernel, left, right) {
  assert.equal(left.support.toString(), right.support.toString(), 'candidate dominance requires identical support');
  const ldr = candidateDominates(left, right);
  const rdl = candidateDominates(right, left);
  return {
    leftDominatesRightCandidate: ldr,
    rightDominatesLeftCandidate: rdl,
    implication: {
      leftP0_implies_rightP0: residualImplies(left.p0, right.p0),
      rightP0_implies_leftP0: residualImplies(right.p0, left.p0),
      leftP1_implies_rightP1: residualImplies(left.p1, right.p1),
      rightP1_implies_leftP1: residualImplies(right.p1, left.p1),
    },
    failures: {
      leftP0_to_rightP0: termWitnesses(left.p0, right.p0),
      rightP0_to_leftP0: termWitnesses(right.p0, left.p0),
      leftP1_to_rightP1: termWitnesses(left.p1, right.p1),
      rightP1_to_leftP1: termWitnesses(right.p1, left.p1),
    },
  };
}
function transitionCheck(kernel, easier, harder) {
  assert(candidateDominates(easier, harder), 'transitionCheck requires candidate dominance at parent');
  const easierLegal = legal(kernel, easier.id);
  const harderLegal = legal(kernel, harder.id);
  assert.deepEqual(easierLegal, harderLegal, 'same-support legal set drift');
  const checks = [];
  let allPreserved = true;
  for (const column of easierLegal) {
    const a = kernel.advance(easier.id, column);
    const b = kernel.advance(harder.id, column);
    const name = String.fromCharCode(65 + column);
    const aTerminal = a === domain.QN_TERMINAL_WIN;
    const bTerminal = b === domain.QN_TERMINAL_WIN;
    // Parent rank is even: P0 moves. If the harder record wins immediately, the easier record must too.
    if (bTerminal && !aTerminal) {
      allPreserved = false;
      checks.push({ column: name, preserved: false, reason: 'harder_P0_terminal_but_easier_not' });
      continue;
    }
    if (aTerminal) {
      checks.push({ column: name, preserved: true, reason: bTerminal ? 'both_P0_terminal' : 'easier_P0_terminal' });
      continue;
    }
    assert(Number.isSafeInteger(a) && a >= 0 && Number.isSafeInteger(b) && b >= 0, 'nonterminal transition invalid');
    const ad = stateData(kernel, a, `${easier.sequence}${column + 1}`);
    const bd = stateData(kernel, b, `${harder.sequence}${column + 1}`);
    const sameSupport = ad.support.toString() === bd.support.toString();
    const preserved = sameSupport && candidateDominates(ad, bd);
    if (!preserved) allPreserved = false;
    checks.push({
      column: name,
      preserved,
      sameSupport,
      easierClasses: [ad.p0Class, ad.p1Class],
      harderClasses: [bd.p0Class, bd.p1Class],
      relationAfter: sameSupport ? compareState(kernel, ad, bd).implication : null,
    });
  }
  return { allPreserved, checks };
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();

const cases = [];
for (const [reply, viaCSequence, viaDSequence] of CASES) {
  const viaC = stateData(kernel, replay(kernel, viaCSequence), viaCSequence);
  const viaD = stateData(kernel, replay(kernel, viaDSequence), viaDSequence);
  assert.equal(viaC.rank, 12);
  assert.equal(viaD.rank, 12);
  assert.equal(viaC.support.toString(), viaD.support.toString());
  const relation = compareState(kernel, viaC, viaD);
  let transitionPreservation = null;
  let candidateDirection = 'incomparable';
  if (relation.leftDominatesRightCandidate && !relation.rightDominatesLeftCandidate) {
    candidateDirection = 'viaC_dominates_viaD';
    transitionPreservation = transitionCheck(kernel, viaC, viaD);
  } else if (relation.rightDominatesLeftCandidate && !relation.leftDominatesRightCandidate) {
    candidateDirection = 'viaD_dominates_viaC';
    transitionPreservation = transitionCheck(kernel, viaD, viaC);
  } else if (relation.leftDominatesRightCandidate && relation.rightDominatesLeftCandidate) {
    candidateDirection = 'mutual_candidate_dominance';
    transitionPreservation = {
      viaCOverViaD: transitionCheck(kernel, viaC, viaD),
      viaDOverViaC: transitionCheck(kernel, viaD, viaC),
    };
  }
  cases.push({
    rank7Reply: reply,
    support: viaC.support.toString(),
    viaC: {
      sequence: viaCSequence,
      p0Class: viaC.p0Class,
      p1Class: viaC.p1Class,
      p0TermCount: viaC.p0.length,
      p1TermCount: viaC.p1.length,
      p0Terms: compactTerms(viaC.p0),
      p1Terms: compactTerms(viaC.p1),
    },
    viaD: {
      sequence: viaDSequence,
      p0Class: viaD.p0Class,
      p1Class: viaD.p1Class,
      p0TermCount: viaD.p0.length,
      p1TermCount: viaD.p1.length,
      p0Terms: compactTerms(viaD.p0),
      p1Terms: compactTerms(viaD.p1),
    },
    relation,
    candidateDirection,
    transitionPreservation,
  });
}

console.log(`RANK7_POST_F5_RESIDUAL_DOMINANCE_DIAGNOSTIC=${JSON.stringify({
  kind: 'standard7x6-rank7-post-f5-residual-dominance-diagnostic-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  cases,
  theoremBoundary: 'Diagnostic only. Candidate residual dominance is evaluated only between exact same-support A/B/G cross-response records using explicitly stated minimal-antichain subset implication, then checked through every legal same-column P0 transition for one ply. Passing this diagnostic is not global W/D/L monotonicity, q equality, strategy equivalence, or permission to cache path-dependent CPC/NDC facts under the smaller descriptor. A production theorem still requires an independently qualified local or general dominance proof.',
})}`);
