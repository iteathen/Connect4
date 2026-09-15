#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  Instantiate_theorem_with_opaque_nonincident_context,
  TypedEventSignature,
  TypedRef,
  Verify_structure_preserving_renaming,
} from './quotient-claim-relative-typed-event-signature.mjs';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const LATENT_ROOT = '466565554644';
const C3 = 2 * 7 + 2;
const G3 = 2 * 7 + 6;
const STUTTER_COLUMNS = [0, 1, 3, 4, 5];
const INITIAL_HEIGHTS = [0, 0, 0, 4, 4, 4, 0];
const ref = TypedRef.of;

function replay(kernel, sequence) {
  let id = kernel.rootId;
  for (const digit of sequence) {
    const next = kernel.advance(id, Number(digit) - 1);
    if (!Number.isSafeInteger(next) || next < 0) throw new Error(`bad replay ${sequence}`);
    id = next;
  }
  return id;
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
function hasSingleton(kernel, id, cell) {
  return terms(kernel, id, 0).some((term) => term.length === 1 && term[0] === cell);
}
function rank(kernel, id) {
  return kernel.supportAccess.rankAt(kernel.states.supportAt(id));
}
function coord(cell) {
  return `${String.fromCharCode(65 + (cell % 7))}${Math.floor(cell / 7) + 1}`;
}
function coordAt(col, rowOneBased) {
  return `${String.fromCharCode(65 + col)}${rowOneBased}`;
}

const singletonClaim = Object.freeze({
  id: 'enabled_singleton_discharge',
  observations: Object.freeze([{ role: 'discharge_or_terminal', node: 'result' }]),
});

function singletonEvent(id, targetCell) {
  return {
    id,
    variables: [{ id: 'x', type: 'enabled_board_cell', concrete: coord(targetCell) }],
    nodes: [
      { id: 'side', layer: 'P', kind: 'side_to_move', attrs: { player: 'P1' } },
      { id: 'enabled', layer: 'E', kind: 'enabled_legal_cell', attrs: { cell: ref('x'), value: true } },
      { id: 'live', layer: 'R', kind: 'live_p0_singleton', attrs: { cell: ref('x'), value: true } },
      { id: 'claim', layer: 'E', kind: 'p1_claims_cell_now', attrs: { cell: ref('x') } },
      {
        id: 'terminal',
        layer: 'terminal',
        kind: 'p1_terminal_short_circuit',
        attrs: { policy: 'TERMINAL_OR_RESIDUAL_DISCHARGE' },
      },
      { id: 'result', layer: 'claim', kind: 'p0_singleton_discharged_or_p1_terminal', attrs: { cell: ref('x') } },
    ],
    edges: [
      { from: 'side', to: 'claim', role: 'mover_guard' },
      { from: 'enabled', to: 'claim', role: 'legality_guard' },
      { from: 'live', to: 'result', role: 'precondition' },
      { from: 'claim', to: 'result', role: 'cofactor_event' },
      { from: 'terminal', to: 'result', role: 'terminal_exception_guard' },
    ],
  };
}

const stutterClaim = Object.freeze({
  id: 'same_column_stutter_preserves_latent_contract',
  observations: Object.freeze([{ role: 'latent_contract_preserved', node: 'result' }]),
});

function stutterEvent(id, resourceColumn) {
  return {
    id,
    variables: [{ id: 'r', type: 'external_resource_column', concrete: String.fromCharCode(65 + resourceColumn) }],
    nodes: [
      { id: 'pair', layer: 'E', kind: 'same_column_two_ply_macro', attrs: { resource: ref('r') } },
      { id: 'rank', layer: 'P', kind: 'support_rank_delta', attrs: { delta: 2 } },
      { id: 'phase', layer: 'P', kind: 'gf2_phase_displacement', attrs: { displacement: 0, resource: ref('r') } },
      { id: 'c3', layer: 'R', kind: 'latent_p0_singleton_preserved', attrs: { targetRole: 'left', value: true } },
      { id: 'g3', layer: 'R', kind: 'latent_p0_singleton_preserved', attrs: { targetRole: 'right', value: true } },
      { id: 'terminal', layer: 'terminal', kind: 'macro_nonterminal_guard', attrs: { p0: false, p1: false } },
      { id: 'result', layer: 'claim', kind: 'latent_contract_stutter', attrs: {} },
    ],
    edges: [
      { from: 'pair', to: 'rank', role: 'rank_effect' },
      { from: 'pair', to: 'phase', role: 'phase_effect' },
      { from: 'pair', to: 'c3', role: 'residual_cofactor_check' },
      { from: 'pair', to: 'g3', role: 'residual_cofactor_check' },
      { from: 'pair', to: 'terminal', role: 'terminal_check' },
      { from: 'rank', to: 'result', role: 'stutter_guard' },
      { from: 'phase', to: 'result', role: 'stutter_guard' },
      { from: 'c3', to: 'result', role: 'contract_guard' },
      { from: 'g3', to: 'result', role: 'contract_guard' },
      { from: 'terminal', to: 'result', role: 'terminal_guard' },
    ],
  };
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();

// Exact C4-0010 replay evidence for the already-qualified singleton theorem class.
const singletonCases = [
  { family: 'center_response_serialization', sequence: '45112', target: 2 },
  { family: 'latent_target_response_C', sequence: '466565554644373', target: C3 },
  { family: 'latent_target_response_G', sequence: '466565554644377', target: G3 },
];
const singletonSignatures = [];
const singletonObservations = [];
for (const entry of singletonCases) {
  const before = replay(kernel, entry.sequence);
  assert.equal(entry.sequence.length & 1, 1, `${entry.family}: expected P1 to move`);
  assert.equal(hasSingleton(kernel, before, entry.target), true, `${entry.family}: target not live singleton`);
  const response = kernel.advance(before, entry.target % 7);
  const p1Terminal = response === domain.QN_TERMINAL_WIN;
  if (!p1Terminal) {
    assert(response >= 0, `${entry.family}: response illegal`);
    assert.equal(hasSingleton(kernel, response, entry.target), false, `${entry.family}: singleton survived response`);
  }
  const observation = {
    family: entry.family,
    sequence: entry.sequence,
    target: coord(entry.target),
    p1Terminal,
    residualDischarged: p1Terminal ? null : !hasSingleton(kernel, response, entry.target),
  };
  singletonObservations.push(observation);
  singletonSignatures.push(TypedEventSignature(
    singletonClaim,
    { opaqueNonincident: { exactReplayWitness: observation } },
    singletonEvent(entry.family, entry.target),
  ));
}
assert.equal(new Set(singletonSignatures.map((signature) => signature.canonicalKey)).size, 1);
const singletonTheorem = Object.freeze({
  id: 'enabled-live-p0-singleton-discharge-v1',
  claimId: singletonClaim.id,
  conclusion: 'P0 singleton is discharged unless the P1 claim is already terminal',
});
const singletonInstantiation = Instantiate_theorem_with_opaque_nonincident_context(
  singletonTheorem,
  singletonSignatures[0],
  singletonSignatures[2],
);
assert.equal(singletonInstantiation.instantiated, true);
assert.equal(singletonInstantiation.boundary.impliesQEquality, false);

// Independent exact C4-0010 replay evidence for the fixed-state same-column stutter class.
const latentRoot = replay(kernel, LATENT_ROOT);
assert.equal(rank(kernel, latentRoot), 12);
assert.equal(hasSingleton(kernel, latentRoot, C3), true);
assert.equal(hasSingleton(kernel, latentRoot, G3), true);
const stutterSignatures = [];
const stutterObservations = [];
for (const col of STUTTER_COLUMNS) {
  const lowerRow = INITIAL_HEIGHTS[col] + 1;
  const upperRow = lowerRow + 1;
  const afterP0 = kernel.advance(latentRoot, col);
  assert.notEqual(afterP0, domain.QN_TERMINAL_WIN, `${coordAt(col, lowerRow)} unexpectedly P0 terminal`);
  assert(afterP0 >= 0, `${coordAt(col, lowerRow)} illegal`);
  const afterP1 = kernel.advance(afterP0, col);
  assert.notEqual(afterP1, domain.QN_TERMINAL_WIN, `${coordAt(col, upperRow)} unexpectedly P1 terminal`);
  assert(afterP1 >= 0, `${coordAt(col, upperRow)} illegal`);
  const observation = {
    column: String.fromCharCode(65 + col),
    pair: `${coordAt(col, lowerRow)}->${coordAt(col, upperRow)}`,
    rankDelta: rank(kernel, afterP1) - rank(kernel, latentRoot),
    phaseDisplacementMod2: 0,
    C3StillLive: hasSingleton(kernel, afterP1, C3),
    G3StillLive: hasSingleton(kernel, afterP1, G3),
  };
  assert.equal(observation.rankDelta, 2);
  assert.equal(observation.C3StillLive, true);
  assert.equal(observation.G3StillLive, true);
  stutterObservations.push(observation);
  stutterSignatures.push(TypedEventSignature(
    stutterClaim,
    { opaqueNonincident: { exactReplayWitness: observation } },
    stutterEvent(`stutter-${observation.column}`, col),
  ));
}
assert.equal(new Set(stutterSignatures.map((signature) => signature.canonicalKey)).size, 1);
const stutterWitness = Verify_structure_preserving_renaming(stutterSignatures[0].cone, stutterSignatures[4].cone);
assert.equal(stutterWitness.isomorphic, true);

console.log(`CLAIM_RELATIVE_SIGNATURE_LIBRARY=${JSON.stringify({
  kind: 'standard7x6-claim-relative-typed-event-signature-library-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  genericOperations: [
    'DependencyCone_of_claim',
    'Canonicalize_typed_cone',
    'Verify_structure_preserving_renaming',
    'Instantiate_theorem_with_opaque_nonincident_context',
  ],
  independentlyQualifiedCrossFamilyClasses: 2,
  classes: [
    {
      claim: singletonClaim.id,
      physicalContexts: singletonSignatures.length,
      canonicalClasses: new Set(singletonSignatures.map((signature) => signature.canonicalKey)).size,
      observations: singletonObservations,
    },
    {
      claim: stutterClaim.id,
      physicalContexts: stutterSignatures.length,
      canonicalClasses: new Set(stutterSignatures.map((signature) => signature.canonicalKey)).size,
      observations: stutterObservations,
    },
  ],
  soundnessBoundary: 'Canonical equality licenses reuse only for the declared claim observation. It does not imply q equality, full successor equivalence, provenance equivalence, or later-strategy equivalence. Opaque context remains live.',
  authority: 'Physical premises are rechecked through exact C4-0010 transitions/residuals. No solved W/D/L labels, recursive q-frontier search, Bayesian confidence, or suspected terminal-line cardinality is used.',
})}`);
