#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  TypedEventSignature,
  TypedRef,
  Verify_structure_preserving_renaming,
} from './quotient-claim-relative-typed-event-signature.mjs';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ref = TypedRef.of;
const C = 2;
const D = 3;
const G = 6;
const C3 = 2 * 7 + C;
const D3 = 2 * 7 + D;
const G3 = 2 * 7 + G;

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
function legal(kernel, id) {
  const support = kernel.states.supportAt(id);
  const out = [];
  for (let c = 0; c < 7; c++) if (kernel.supportAccess.landingAt(support, c) !== 0xff) out.push(c);
  return out;
}
function landing(kernel, id, column) {
  return kernel.supportAccess.landingAt(kernel.states.supportAt(id), column);
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
function hasSingleton(kernel, id, cell) {
  return terms(kernel, id, 0).some((term) => term.length === 1 && term[0] === cell);
}
function hasPair(kernel, id, a, b) {
  return terms(kernel, id, 0).some((term) => term.length === 2 && term.includes(a) && term.includes(b));
}
function coord(cell) {
  return `${String.fromCharCode(65 + (cell % 7))}${Math.floor(cell / 7) + 1}`;
}
function columnName(column) {
  return String.fromCharCode(65 + column);
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();

const crossSupportClaim = Object.freeze({
  id: 'cross_support_pair_establishes_two_chain_stage',
  observations: Object.freeze([{ role: 'two_chain_stage', node: 'result' }]),
});
function crossSupportEvent(id, attackColumn, responseColumn) {
  return {
    id,
    variables: [
      { id: 'attack', type: 'latent_support_chain', concrete: columnName(attackColumn) },
      { id: 'response', type: 'latent_support_chain', concrete: columnName(responseColumn) },
    ],
    nodes: [
      { id: 'p0', layer: 'E', kind: 'p0_lower_support_event', attrs: { chain: ref('attack'), row: 1 } },
      { id: 'deadline', layer: 'C', kind: 'next_p1_turn_response_deadline', attrs: { value: true } },
      { id: 'p1', layer: 'E', kind: 'p1_cross_support_response', attrs: { chain: ref('response'), row: 1 } },
      { id: 'terminal', layer: 'terminal', kind: 'two_ply_nonterminal_guard', attrs: { p0: false, p1: false } },
      { id: 'rank', layer: 'P', kind: 'support_rank_delta', attrs: { delta: 2 } },
      { id: 'attackNext', layer: 'E', kind: 'middle_support_enabled', attrs: { chain: ref('attack'), row: 2 } },
      { id: 'responseNext', layer: 'E', kind: 'middle_support_enabled', attrs: { chain: ref('response'), row: 2 } },
      { id: 'c3', layer: 'R', kind: 'latent_p0_singleton_preserved', attrs: { targetRole: 'left', value: true } },
      { id: 'g3', layer: 'R', kind: 'latent_p0_singleton_preserved', attrs: { targetRole: 'right', value: true } },
      { id: 'result', layer: 'claim', kind: 'two_chain_stage_ready', attrs: { stage: '1,1' } },
    ],
    edges: [
      { from: 'p0', to: 'deadline', role: 'activates_response_deadline' },
      { from: 'deadline', to: 'p1', role: 'requires_cross_response' },
      { from: 'p0', to: 'terminal', role: 'terminal_check' },
      { from: 'p1', to: 'terminal', role: 'terminal_check' },
      { from: 'p0', to: 'rank', role: 'rank_effect' },
      { from: 'p1', to: 'rank', role: 'rank_effect' },
      { from: 'p1', to: 'attackNext', role: 'stage_check' },
      { from: 'p1', to: 'responseNext', role: 'stage_check' },
      { from: 'p1', to: 'c3', role: 'cofactor_check' },
      { from: 'p1', to: 'g3', role: 'cofactor_check' },
      { from: 'terminal', to: 'result', role: 'macro_guard' },
      { from: 'rank', to: 'result', role: 'stage_guard' },
      { from: 'attackNext', to: 'result', role: 'stage_guard' },
      { from: 'responseNext', to: 'result', role: 'stage_guard' },
      { from: 'c3', to: 'result', role: 'contract_guard' },
      { from: 'g3', to: 'result', role: 'contract_guard' },
    ],
  };
}

const crossRoot = replay(kernel, '466565554644');
assert.equal(rank(kernel, crossRoot), 12);
assert.equal(hasSingleton(kernel, crossRoot, C3), true);
assert.equal(hasSingleton(kernel, crossRoot, G3), true);
const crossCases = [[C, G], [G, C]];
const crossSignatures = [];
const crossObservations = [];
for (const [p0Column, p1Column] of crossCases) {
  assert.equal(Math.floor(landing(kernel, crossRoot, p0Column) / 7), 0);
  const afterP0 = kernel.advance(crossRoot, p0Column);
  assert.notEqual(afterP0, domain.QN_TERMINAL_WIN);
  assert(afterP0 >= 0);
  assert.equal(Math.floor(landing(kernel, afterP0, p1Column) / 7), 0);
  const afterP1 = kernel.advance(afterP0, p1Column);
  assert.notEqual(afterP1, domain.QN_TERMINAL_WIN);
  assert(afterP1 >= 0);
  assert.equal(rank(kernel, afterP1) - rank(kernel, crossRoot), 2);
  assert.equal(Math.floor(landing(kernel, afterP1, C) / 7), 1);
  assert.equal(Math.floor(landing(kernel, afterP1, G) / 7), 1);
  assert.equal(hasSingleton(kernel, afterP1, C3), true);
  assert.equal(hasSingleton(kernel, afterP1, G3), true);
  const observation = {
    macro: `P0:${columnName(p0Column)}1->P1:${columnName(p1Column)}1`,
    rankDelta: 2,
    nextEnabled: ['C2', 'G2'],
    latentSingletonsPreserved: ['C3', 'G3'],
  };
  crossObservations.push(observation);
  crossSignatures.push(TypedEventSignature(
    crossSupportClaim,
    { opaqueNonincident: { exactReplayWitness: observation } },
    crossSupportEvent(`cross-${columnName(p0Column)}-${columnName(p1Column)}`, p0Column, p1Column),
  ));
}
assert.equal(new Set(crossSignatures.map((x) => x.canonicalKey)).size, 1);
assert.equal(Verify_structure_preserving_renaming(crossSignatures[0].cone, crossSignatures[1].cone).isomorphic, true);

const phaseTransportClaim = Object.freeze({
  id: 'phase_defect_transport',
  observations: Object.freeze([{ role: 'phase_transport', node: 'result' }]),
});
function phaseTransportEvent(id, sourceColumn, destinationColumn) {
  return {
    id,
    variables: [
      { id: 'source', type: 'phase_column', concrete: columnName(sourceColumn) },
      { id: 'destination', type: 'phase_column', concrete: columnName(destinationColumn) },
    ],
    nodes: [
      { id: 'macro', layer: 'E', kind: 'legal_nonterminal_distinct_column_two_ply_macro', attrs: { source: ref('source'), destination: ref('destination') } },
      { id: 'before', layer: 'P', kind: 'phase_endpoint_bits', attrs: { source: 1, destination: 0 } },
      { id: 'law', layer: 'P', kind: 'gf2_distinct_column_update', attrs: { equation: 'phi_prime=phi+e_source+e_destination' } },
      { id: 'after', layer: 'P', kind: 'phase_endpoint_bits', attrs: { source: 0, destination: 1 } },
      { id: 'terminal', layer: 'terminal', kind: 'two_ply_nonterminal_guard', attrs: { p0: false, p1: false } },
      { id: 'result', layer: 'claim', kind: 'phase_defect_transported', attrs: { from: ref('source'), to: ref('destination') } },
    ],
    edges: [
      { from: 'macro', to: 'law', role: 'operator_guard' },
      { from: 'before', to: 'law', role: 'phase_precondition' },
      { from: 'law', to: 'after', role: 'phase_transition' },
      { from: 'macro', to: 'terminal', role: 'terminal_check' },
      { from: 'after', to: 'result', role: 'phase_consequence' },
      { from: 'terminal', to: 'result', role: 'macro_guard' },
    ],
  };
}

const phaseSequences = ['46656551', '46656552', '46656555', '46656557'];
const phaseSignatures = [];
const phaseObservations = [];
for (const sequence of phaseSequences) {
  const root = replay(kernel, sequence);
  assert.equal(rank(kernel, root) & 1, 0, `${sequence}: expected P0 to move`);
  const before = phase(kernel, root);
  for (const p0 of legal(kernel, root)) {
    const afterP0 = kernel.advance(root, p0);
    if (afterP0 === domain.QN_TERMINAL_WIN || afterP0 < 0) continue;
    for (const p1 of legal(kernel, afterP0)) {
      if (p0 === p1 || before[p0] === before[p1]) continue;
      const child = kernel.advance(afterP0, p1);
      if (child === domain.QN_TERMINAL_WIN || child < 0) continue;
      const after = phase(kernel, child);
      const expected = before.slice();
      expected[p0] ^= 1;
      expected[p1] ^= 1;
      assert.deepEqual(after, expected, `${sequence}: GF(2) phase law drift`);
      const source = before[p0] === 1 ? p0 : p1;
      const destination = source === p0 ? p1 : p0;
      assert.equal(before[source], 1);
      assert.equal(before[destination], 0);
      assert.equal(after[source], 0);
      assert.equal(after[destination], 1);
      const observation = {
        sequence,
        p0: columnName(p0),
        p1: columnName(p1),
        source: columnName(source),
        destination: columnName(destination),
      };
      phaseObservations.push(observation);
      phaseSignatures.push(TypedEventSignature(
        phaseTransportClaim,
        { opaqueNonincident: { exactReplayWitness: observation } },
        phaseTransportEvent(`phase-${sequence}-${p0}-${p1}`, source, destination),
      ));
    }
  }
}
assert(phaseSignatures.length > 0, 'expected exact transport macros');
assert.equal(new Set(phaseSignatures.map((x) => x.canonicalKey)).size, 1);

const capacityClaim = Object.freeze({
  id: 'size_two_response_capacity_circuit',
  observations: Object.freeze([{ role: 'rank_defect', node: 'result' }]),
});
function capacityEvent(id, concreteSlot) {
  return {
    id,
    variables: [
      { id: 'u0', type: 'mandatory_response_obligation', concrete: 'u0' },
      { id: 'u1', type: 'mandatory_response_obligation', concrete: 'u1' },
      { id: 'r', type: 'defender_response_slot', concrete: concreteSlot },
    ],
    nodes: [
      { id: 'o0', layer: 'C', kind: 'mandatory_obligation', attrs: { obligation: ref('u0') } },
      { id: 'o1', layer: 'C', kind: 'mandatory_obligation', attrs: { obligation: ref('u1') } },
      { id: 'n0', layer: 'C', kind: 'sole_allowed_response', attrs: { obligation: ref('u0'), slot: ref('r') } },
      { id: 'n1', layer: 'C', kind: 'sole_allowed_response', attrs: { obligation: ref('u1'), slot: ref('r') } },
      { id: 'rank', layer: 'N', kind: 'transversal_rank', attrs: { demand: 2, rank: 1 } },
      { id: 'result', layer: 'claim', kind: 'size_two_capacity_circuit', attrs: { defect: 1 } },
    ],
    edges: [
      { from: 'o0', to: 'n0', role: 'response_neighborhood' },
      { from: 'o1', to: 'n1', role: 'response_neighborhood' },
      { from: 'n0', to: 'rank', role: 'matching_constraint' },
      { from: 'n1', to: 'rank', role: 'matching_constraint' },
      { from: 'rank', to: 'result', role: 'hall_rank_defect' },
    ],
  };
}
function maxMatchingSize(neighborhoods, slotCount) {
  let best = 0;
  const used = new Array(slotCount).fill(false);
  function visit(obligation, matched) {
    if (obligation === neighborhoods.length) {
      best = Math.max(best, matched);
      return;
    }
    visit(obligation + 1, matched);
    for (const slot of neighborhoods[obligation]) {
      if (used[slot]) continue;
      used[slot] = true;
      visit(obligation + 1, matched + 1);
      used[slot] = false;
    }
  }
  visit(0, 0);
  return best;
}
const nonemptyNeighborhoods = [[0], [1], [0, 1]];
const capacityModels = [];
for (const left of nonemptyNeighborhoods) {
  for (const right of nonemptyNeighborhoods) {
    const matching = maxMatchingSize([left, right], 2);
    capacityModels.push({ neighborhoods: [left, right], matching, hallViolation: matching < 2 });
  }
}
const capacityViolations = capacityModels.filter((x) => x.hallViolation);
assert.equal(capacityModels.length, 9);
assert.equal(capacityViolations.length, 2);
assert(capacityViolations.every((x) => x.matching === 1));
assert(capacityViolations.every((x) => x.neighborhoods[0].length === 1 && x.neighborhoods[1].length === 1));
assert(capacityViolations.every((x) => x.neighborhoods[0][0] === x.neighborhoods[1][0]));
const capacitySignatures = capacityViolations.map((model, index) => TypedEventSignature(
  capacityClaim,
  {
    opaqueNonincident: {
      finiteControl: model,
      connect4CertificateMappingStatus: 'incomplete',
    },
  },
  capacityEvent(`capacity-${index}`, `r${model.neighborhoods[0][0]}`),
));
assert.equal(new Set(capacitySignatures.map((x) => x.canonicalKey)).size, 1);
assert.equal(Verify_structure_preserving_renaming(capacitySignatures[0].cone, capacitySignatures[1].cone).isomorphic, true);

const hingeClaim = Object.freeze({
  id: 'universal_hinge_generates_two_latent_singletons',
  observations: Object.freeze([{ role: 'universal_one_reply_consequence', node: 'result' }]),
});
function hingeEvent(id, replyCount) {
  return {
    id,
    variables: [
      { id: 'hinge', type: 'hinge_cell', concrete: 'D3' },
      { id: 'left', type: 'latent_target', concrete: 'C3' },
      { id: 'right', type: 'latent_target', concrete: 'G3' },
    ],
    nodes: [
      { id: 'leftPair', layer: 'R', kind: 'hinge_incident_pair', attrs: { target: ref('left'), hinge: ref('hinge'), value: true } },
      { id: 'rightPair', layer: 'R', kind: 'hinge_incident_pair', attrs: { target: ref('right'), hinge: ref('hinge'), value: true } },
      { id: 'p0', layer: 'E', kind: 'p0_claims_hinge', attrs: { cell: ref('hinge'), terminal: false } },
      { id: 'leftSingleton', layer: 'R', kind: 'p0_singleton_generated', attrs: { target: ref('left'), value: true } },
      { id: 'rightSingleton', layer: 'R', kind: 'p0_singleton_generated', attrs: { target: ref('right'), value: true } },
      { id: 'replyDomain', layer: 'C', kind: 'all_legal_p1_replies_checked', attrs: { replyCount } },
      { id: 'terminal', layer: 'terminal', kind: 'no_immediate_p1_terminal_reply', attrs: { value: true } },
      { id: 'survival', layer: 'R', kind: 'both_singletons_survive_every_p1_reply', attrs: { value: true } },
      { id: 'result', layer: 'claim', kind: 'universal_hinge_two_latent_singletons', attrs: { horizon: 'one_P1_reply' } },
    ],
    edges: [
      { from: 'leftPair', to: 'p0', role: 'hinge_precondition' },
      { from: 'rightPair', to: 'p0', role: 'hinge_precondition' },
      { from: 'p0', to: 'leftSingleton', role: 'cofactor_consequence' },
      { from: 'p0', to: 'rightSingleton', role: 'cofactor_consequence' },
      { from: 'replyDomain', to: 'terminal', role: 'universal_quantification' },
      { from: 'replyDomain', to: 'survival', role: 'universal_quantification' },
      { from: 'leftSingleton', to: 'survival', role: 'preserved_fact' },
      { from: 'rightSingleton', to: 'survival', role: 'preserved_fact' },
      { from: 'terminal', to: 'result', role: 'universal_guard' },
      { from: 'survival', to: 'result', role: 'universal_consequence' },
    ],
  };
}

const hingeRoot = replay(kernel, '4665655546');
assert.equal(rank(kernel, hingeRoot), 10);
assert.equal(hasPair(kernel, hingeRoot, C3, D3), true);
assert.equal(hasPair(kernel, hingeRoot, D3, G3), true);
assert.equal(coord(landing(kernel, hingeRoot, D)), 'D3');
const afterHinge = kernel.advance(hingeRoot, D);
assert.notEqual(afterHinge, domain.QN_TERMINAL_WIN);
assert(afterHinge >= 0);
assert.equal(hasSingleton(kernel, afterHinge, C3), true);
assert.equal(hasSingleton(kernel, afterHinge, G3), true);
const hingeReplies = [];
for (const p1 of legal(kernel, afterHinge)) {
  const replyCell = landing(kernel, afterHinge, p1);
  const child = kernel.advance(afterHinge, p1);
  assert.notEqual(child, domain.QN_TERMINAL_WIN, `P1 ${coord(replyCell)} unexpectedly terminal`);
  assert(child >= 0, `P1 ${coord(replyCell)} unexpectedly invalid`);
  const observation = {
    reply: coord(replyCell),
    C3Survives: hasSingleton(kernel, child, C3),
    G3Survives: hasSingleton(kernel, child, G3),
  };
  assert.equal(observation.C3Survives, true);
  assert.equal(observation.G3Survives, true);
  hingeReplies.push(observation);
}
assert(hingeReplies.length > 0);
TypedEventSignature(
  hingeClaim,
  { opaqueNonincident: { exactReplyEnumeration: hingeReplies } },
  hingeEvent('D3-hinge-one-reply-horizon', hingeReplies.length),
);

console.log(`CLAIM_RELATIVE_REMAINING_SEEDS=${JSON.stringify({
  kind: 'standard7x6-claim-relative-remaining-seeds-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  seeds: [
    {
      claim: crossSupportClaim.id,
      authorityLevel: 'exact_C4_0010_replay',
      physicalContexts: crossSignatures.length,
      canonicalClasses: new Set(crossSignatures.map((x) => x.canonicalKey)).size,
      observations: crossObservations,
    },
    {
      claim: phaseTransportClaim.id,
      authorityLevel: 'exact_C4_0010_support_phase_replay',
      physicalContexts: phaseSignatures.length,
      canonicalClasses: new Set(phaseSignatures.map((x) => x.canonicalKey)).size,
      sampleObservations: phaseObservations.slice(0, 12),
      strongerLocalResidualEffectBoundary: 'not implied; incident R/cofactor data can split the stronger repair-effect claim',
    },
    {
      claim: capacityClaim.id,
      authorityLevel: 'exact_finite_matching_theorem_control',
      enumeratedModels: capacityModels.length,
      violatingModels: capacityViolations.length,
      canonicalClasses: new Set(capacitySignatures.map((x) => x.canonicalKey)).size,
      connect4CertificateMappingStatus: 'incomplete',
    },
    {
      claim: hingeClaim.id,
      authorityLevel: 'exact_C4_0010_exhaustive_one_reply_horizon',
      physicalContexts: 1,
      legalP1RepliesChecked: hingeReplies.length,
      canonicalClasses: 1,
      observation: {
        hinge: 'D3',
        generatedSingletons: ['C3', 'G3'],
        noImmediateP1TerminalReply: true,
        bothSingletonsSurviveEveryReply: true,
      },
    },
  ],
  theoremLibraryBoundary: 'These are claim-relative certificates only. They do not imply q equality, full successor equivalence, later-strategy equivalence, provenance equivalence, root W/D/L, or a 69-to-28 geometric winning-line reduction.',
  capacityBoundary: 'The size-two circuit is exact once obligation neighborhoods are supplied. The general Connect4 certificate-to-obligation/response-slot mapping remains unproved and is not inferred here.',
  hingeBoundary: 'The hinge theorem is only the exact immediate D3 cofactor consequence plus survival across one exhaustive P1 reply horizon. It does not by itself prove a later strategy.',
})}`);
