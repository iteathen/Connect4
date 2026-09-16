#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const C3 = 2 * 7 + 2;
const D3 = 2 * 7 + 3;
const G3 = 2 * 7 + 6;

function replay(kernel, sequence) {
  let id = kernel.rootId;
  for (const digit of sequence) {
    const next = kernel.advance(id, Number(digit) - 1);
    if (!Number.isSafeInteger(next) || next < 0) throw new Error(`bad replay ${sequence}`);
    id = next;
  }
  return id;
}
function rank(kernel, id) {
  return kernel.supportAccess.rankAt(kernel.states.supportAt(id));
}
function landing(kernel, id, col) {
  return kernel.supportAccess.landingAt(kernel.states.supportAt(id), col);
}
function heights(kernel, id) {
  const out = [];
  for (let c = 0; c < 7; c++) {
    const cell = landing(kernel, id, c);
    out.push(cell === 0xff ? 6 : Math.floor(cell / 7));
  }
  return out;
}
function phase(kernel, id) {
  return heights(kernel, id).map((height) => height & 1);
}
function hasCell([lo, hi], cell) {
  return cell < 32 ? (((lo >>> cell) & 1) !== 0) : (((hi >>> (cell - 32)) & 1) !== 0);
}
function cellsOf(term) {
  const out = [];
  for (let cell = 0; cell < 42; cell++) if (hasCell(term, cell)) out.push(cell);
  return out;
}
function terms(kernel, id, player) {
  const classId = player === 0 ? kernel.states.p0At(id) : kernel.states.p1At(id);
  return kernel.classes.terms(classId).map(cellsOf);
}
function coordForCell(cell) {
  return String.fromCharCode(65 + (cell % 7)) + (Math.floor(cell / 7) + 1);
}
function key(term) {
  return term.join(',');
}
function normalizeTerms(input) {
  const dedup = [...new Map(input.map((term) => [key(term), term.slice().sort((a, b) => a - b)])).values()];
  dedup.sort((a, b) => a.length - b.length || key(a).localeCompare(key(b)));
  return dedup.filter((term, index) => !dedup.slice(0, index).some((other) => other.every((cell) => term.includes(cell))));
}
function sortedTerms(input) {
  return input.map((term) => term.slice().sort((a, b) => a - b)).sort((a, b) => a.length - b.length || key(a).localeCompare(key(b)));
}
function ownCofactor(before, cell) {
  const transformed = before.map((term) => term.includes(cell) ? term.filter((x) => x !== cell) : term.slice());
  assert.equal(transformed.some((term) => term.length === 0), false, 'factorization control expects nonterminal own cofactor');
  return normalizeTerms(transformed);
}
function opponentKill(before, cell) {
  return normalizeTerms(before.filter((term) => !term.includes(cell)));
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();

// R primitive: the same monotone residual cofactor operator underlies hinge
// singleton generation and opponent singleton discharge.
const hingeRoot = replay(kernel, '4665655546');
const hingeBefore = terms(kernel, hingeRoot, 0);
assert(hingeBefore.some((term) => key(term) === key([C3, D3])));
assert(hingeBefore.some((term) => key(term) === key([D3, G3])));
const afterD3 = kernel.advance(hingeRoot, 3);
assert.notEqual(afterD3, domain.QN_TERMINAL_WIN);
assert(afterD3 >= 0);
assert.deepEqual(sortedTerms(terms(kernel, afterD3, 0)), sortedTerms(ownCofactor(hingeBefore, D3)));
assert(terms(kernel, afterD3, 0).some((term) => key(term) === key([C3])));
assert(terms(kernel, afterD3, 0).some((term) => key(term) === key([G3])));
assert.equal(coordForCell(landing(kernel, afterD3, 3)), 'D4');
const afterD4 = kernel.advance(afterD3, 3);
assert.notEqual(afterD4, domain.QN_TERMINAL_WIN);
assert(afterD4 >= 0);
assert.equal(afterD4, replay(kernel, '466565554644'));

const singletonCases = [
  ['45112', 2],
  ['466565554644373', C3],
  ['466565554644377', G3],
];
const residualFactorInstances = [{ kind: 'own_cofactor_shrink', sourceClaim: 'universal_hinge_generates_two_latent_singletons', event: 'P0:D3' }];
for (const [sequence, cell] of singletonCases) {
  const before = replay(kernel, sequence);
  const beforeTerms = terms(kernel, before, 0);
  assert(beforeTerms.some((term) => term.length === 1 && term[0] === cell));
  const after = kernel.advance(before, cell % 7);
  assert.notEqual(after, domain.QN_TERMINAL_WIN);
  assert(after >= 0);
  assert.deepEqual(sortedTerms(terms(kernel, after, 0)), sortedTerms(opponentKill(beforeTerms, cell)));
  residualFactorInstances.push({ kind: 'opponent_cofactor_kill', sourceClaim: 'enabled_singleton_discharge', sequence, targetCell: cell });
}

// P primitive: one two-ply column-event operator phi' = phi + e_a + e_b
// specializes to both same-column zero displacement and distinct-column transport.
function verifyPhaseMacro(sequence, p0, p1) {
  const root = replay(kernel, sequence);
  const before = phase(kernel, root);
  const afterP0 = kernel.advance(root, p0);
  assert.notEqual(afterP0, domain.QN_TERMINAL_WIN);
  assert(afterP0 >= 0);
  const child = kernel.advance(afterP0, p1);
  assert.notEqual(child, domain.QN_TERMINAL_WIN);
  assert(child >= 0);
  const expected = before.slice();
  expected[p0] ^= 1;
  expected[p1] ^= 1;
  const after = phase(kernel, child);
  assert.deepEqual(after, expected);
  return { sequence, p0, p1, sameColumn: p0 === p1, before, after };
}
const phaseFactorInstances = [
  verifyPhaseMacro('466565554644', 0, 0),
  verifyPhaseMacro('466565554644', 3, 3),
  verifyPhaseMacro('46656551', 0, 1),
  verifyPhaseMacro('46656551', 1, 0),
];
assert.equal(phaseFactorInstances.filter((x) => x.sameColumn).every((x) => JSON.stringify(x.before) === JSON.stringify(x.after)), true);
assert.equal(phaseFactorInstances.filter((x) => !x.sameColumn).every((x) => JSON.stringify(x.before) !== JSON.stringify(x.after)), true);

console.log(`THEOREM_FACTORIZATION_CONTROL=${JSON.stringify({
  kind: 'standard7x6-claim-relative-theorem-factorization-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  primitiveFactors: [
    {
      primitive: 'R_monotone_residual_cofactor',
      downstreamClaims: ['enabled_singleton_discharge', 'universal_hinge_generates_two_latent_singletons'],
      exactInstances: residualFactorInstances.length,
      specialization: {
        ownEvent: 'remove claimed own cell from every incident residual term, normalize; empty term is terminal boundary',
        opponentEvent: 'kill every residual term containing the opponent-owned cell, normalize',
      },
    },
    {
      primitive: 'P_two_ply_GF2_column_operator',
      downstreamClaims: ['same_column_stutter_preserves_latent_contract', 'phase_defect_transport'],
      exactInstances: phaseFactorInstances.length,
      theorem: 'phi_prime = phi + e_a + e_b over GF(2)',
      specializations: ['a=b gives zero phase displacement', 'a!=b toggles both coordinates and can transport a single endpoint defect'],
    },
  ],
  partialFactor: {
    primitive: 'C_response_matching_capacity',
    downstreamClaims: ['cross_support_pair_establishes_two_chain_stage', 'size_two_response_capacity_circuit'],
    status: 'structurally indicated but not promoted to a general Connect4 composition theorem',
    reason: 'certificate-to-obligation/response-slot mapping is not yet complete',
  },
  compositionGap: 'Primitive theorem reuse is now executable, but a guarded theorem-composition calculus is still required to prove that the conclusion of one claim discharges the exact premises of the next across temporal state, terminal alternatives, resources, and opaque nonincident context.',
  exactChainCandidate: '4665655546 -- P0:D3 -- P1:D4 --> 466565554644, linking the qualified hinge consequence to the qualified latent-target temporal-contract state without implying a win.',
  authority: 'Exact C4-0010 residual transitions and support-phase transitions only; no solved W/D/L labels or recursive q-tree search.',
})}`);
