#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { Compose_theorem_chain, GuardedCompositionTerms } from './quotient-guarded-theorem-composition.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const { ref } = GuardedCompositionTerms;
const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const HINGE_PREFIX = '4665655546';
const LATENT_ROOT = '466565554644';
const C = 2, D = 3, G = 6;
const C3 = 2 * 7 + C, G3 = 2 * 7 + G;
const fact = (layer, predicate, args = [], value = true) => ({ layer, predicate, args, value });

function replay(kernel, sequence) {
  let id = kernel.rootId;
  for (const digit of sequence) {
    const next = kernel.advance(id, Number(digit) - 1);
    if (!Number.isSafeInteger(next) || next < 0) throw new Error(`bad replay ${sequence}`);
    id = next;
  }
  return id;
}
function rank(kernel, id) { return kernel.supportAccess.rankAt(kernel.states.supportAt(id)); }
function landing(kernel, id, col) { return kernel.supportAccess.landingAt(kernel.states.supportAt(id), col); }
function coord(cell) { return `${String.fromCharCode(65 + (cell % 7))}${Math.floor(cell / 7) + 1}`; }
function hasCell([lo, hi], cell) { return cell < 32 ? (((lo >>> cell) & 1) !== 0) : (((hi >>> (cell - 32)) & 1) !== 0); }
function cellsOf(term) { const out = []; for (let cell = 0; cell < 42; cell++) if (hasCell(term, cell)) out.push(cell); return out; }
function terms(kernel, id, player) {
  const classId = player === 0 ? kernel.states.p0At(id) : kernel.states.p1At(id);
  return kernel.classes.terms(classId).map(cellsOf);
}
function hasSingleton(kernel, id, cell) { return terms(kernel, id, 0).some((term) => term.length === 1 && term[0] === cell); }
function sideToMove(kernel, id) { return (rank(kernel, id) & 1) === 0 ? 'P0' : 'P1'; }
function contract(base) {
  return {
    variables: [], preconditions: [], conclusions: [],
    frame: { preconditions: [], conclusions: [] },
    temporalResource: { preconditions: [], conclusions: [] },
    terminal: { accepts: ['continue'], emits: ['continue'], closes: [] },
    provenance: { mode: 'value-only', preconditions: [], conclusions: [] },
    ...base,
  };
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();

const hingeRoot = replay(kernel, HINGE_PREFIX);
assert.equal(sideToMove(kernel, hingeRoot), 'P0');
assert.equal(coord(landing(kernel, hingeRoot, D)), 'D3');
const afterD3 = kernel.advance(hingeRoot, D);
assert(afterD3 >= 0 && afterD3 !== domain.QN_TERMINAL_WIN);
assert.equal(sideToMove(kernel, afterD3), 'P1');
assert.equal(hasSingleton(kernel, afterD3, C3), true);
assert.equal(hasSingleton(kernel, afterD3, G3), true);
assert.equal(coord(landing(kernel, afterD3, D)), 'D4');
const afterD4 = kernel.advance(afterD3, D);
assert(afterD4 >= 0 && afterD4 !== domain.QN_TERMINAL_WIN);
assert.equal(afterD4, replay(kernel, LATENT_ROOT));
assert.equal(sideToMove(kernel, afterD4), 'P0');
assert.equal(coord(landing(kernel, afterD4, C)), 'C1');
assert.equal(coord(landing(kernel, afterD4, G)), 'G1');
assert.equal(hasSingleton(kernel, afterD4, C3), true);
assert.equal(hasSingleton(kernel, afterD4, G3), true);

// Important temporal boundary: D3/D4 create no live response obligation.  The exact transitions
// supply physical/residual/turn facts only.  The latent scheduler theorem below owns the policy
// saying that a future C/G support attack, once it occurs, activates a next-P1-turn response.
const hinge = contract({
  id: 'hinge_D3_instantiation', claimId: 'universal_hinge_generates_two_latent_singletons',
  variables: [{ id: 'c3', type: 'cell', concrete: 'C3' }, { id: 'g3', type: 'cell', concrete: 'G3' }],
  conclusions: [
    fact('R', 'p0_live_singleton', [ref('c3')]), fact('R', 'p0_live_singleton', [ref('g3')]),
    fact('E', 'side_to_move', ['P1']),
  ],
  frame: { preconditions: [], conclusions: [fact('N', 'exact_bridge_state', ['after_D3'])] },
  authority: { residualFacts: 'qualified hinge theorem', frameAndTurnFacts: 'exact C4-0010 D3 transition', liveTemporalObligation: 'none' },
});
const d4Bridge = contract({
  id: 'exact_D4_bridge', claimId: 'exact_event_bridge',
  variables: [{ id: 'c3', type: 'cell', concrete: 'C3' }, { id: 'g3', type: 'cell', concrete: 'G3' }],
  preconditions: [
    fact('R', 'p0_live_singleton', [ref('c3')]), fact('R', 'p0_live_singleton', [ref('g3')]),
    fact('E', 'side_to_move', ['P1']),
  ],
  conclusions: [
    fact('R', 'p0_live_singleton', [ref('c3')]), fact('R', 'p0_live_singleton', [ref('g3')]),
    fact('E', 'support_event_enabled', ['C1']), fact('E', 'support_event_enabled', ['G1']), fact('E', 'side_to_move', ['P0']),
  ],
  frame: { preconditions: [fact('N', 'exact_bridge_state', ['after_D3'])], conclusions: [fact('N', 'exact_bridge_state', ['466565554644'])] },
  authority: { allFacts: 'exact C4-0010 D4 transition from after_D3', liveTemporalObligation: 'none' },
});
const latentActivation = contract({
  id: 'latent_target_contract_activation', claimId: 'latent_target_cross_pair_temporal_contract',
  variables: [{ id: 'c3', type: 'cell', concrete: 'C3' }, { id: 'g3', type: 'cell', concrete: 'G3' }],
  preconditions: [
    fact('R', 'p0_live_singleton', [ref('c3')]), fact('R', 'p0_live_singleton', [ref('g3')]),
    fact('E', 'support_event_enabled', ['C1']), fact('E', 'support_event_enabled', ['G1']), fact('E', 'side_to_move', ['P0']),
  ],
  conclusions: [
    fact('C', 'latent_target_contract_active', ['C3', 'G3']),
    fact('R', 'p0_live_singleton', [ref('c3')]), fact('R', 'p0_live_singleton', [ref('g3')]), fact('E', 'side_to_move', ['P0']),
  ],
  frame: { preconditions: [fact('N', 'exact_bridge_state', ['466565554644'])], conclusions: [fact('N', 'exact_bridge_state', ['466565554644'])] },
  temporalResource: {
    preconditions: [],
    conclusions: [
      fact('C', 'attack_turn', ['P0']),
      fact('C', 'response_deadline_policy', ['next_P1_turn']),
      fact('C', 'defender_slots_per_attack', [1]),
      fact('C', 'live_response_obligations', [0]),
    ],
  },
  authority: { structuralFacts: 'qualified five-state latent-target scheduler contract at fixed root', temporalPolicyFacts: 'latent-target contract theorem; no live deadline exists before a C/G support trigger' },
});

const bridgeComposition = Compose_theorem_chain([hinge, d4Bridge, latentActivation]);
assert.equal(bridgeComposition.ok, true, JSON.stringify(bridgeComposition));

const STUTTERS = [
  { col: 0, label: 'A1->A2' },
  { col: 1, label: 'B1->B2' },
  { col: 3, label: 'D5->D6' },
  { col: 4, label: 'E5->E6' },
  { col: 5, label: 'F5->F6' },
];
const stutterCompositions = [];
for (const { col, label } of STUTTERS) {
  const root = replay(kernel, LATENT_ROOT);
  const firstLanding = coord(landing(kernel, root, col));
  const afterP0 = kernel.advance(root, col);
  assert(afterP0 >= 0 && afterP0 !== domain.QN_TERMINAL_WIN, `${label}: P0 event terminal/illegal`);
  const secondLanding = coord(landing(kernel, afterP0, col));
  const afterP1 = kernel.advance(afterP0, col);
  assert(afterP1 >= 0 && afterP1 !== domain.QN_TERMINAL_WIN, `${label}: P1 event terminal/illegal`);
  assert.equal(`${firstLanding}->${secondLanding}`, label);
  assert.equal(sideToMove(kernel, afterP1), 'P0');
  assert.equal(hasSingleton(kernel, afterP1, C3), true);
  assert.equal(hasSingleton(kernel, afterP1, G3), true);

  const stutter = contract({
    id: `stutter_${label}`, claimId: 'same_column_stutter_preserves_latent_contract',
    variables: [{ id: 'c3', type: 'cell', concrete: 'C3' }, { id: 'g3', type: 'cell', concrete: 'G3' }],
    preconditions: [
      fact('C', 'latent_target_contract_active', ['C3', 'G3']),
      fact('R', 'p0_live_singleton', [ref('c3')]), fact('R', 'p0_live_singleton', [ref('g3')]), fact('E', 'side_to_move', ['P0']),
    ],
    conclusions: [
      fact('C', 'latent_target_contract_active', ['C3', 'G3']),
      fact('R', 'p0_live_singleton', [ref('c3')]), fact('R', 'p0_live_singleton', [ref('g3')]), fact('E', 'side_to_move', ['P0']),
    ],
    frame: { preconditions: [fact('N', 'exact_bridge_state', ['466565554644'])], conclusions: [fact('N', 'stutter_reentry_state', [label])] },
    temporalResource: {
      preconditions: [
        fact('C', 'attack_turn', ['P0']), fact('C', 'response_deadline_policy', ['next_P1_turn']),
        fact('C', 'defender_slots_per_attack', [1]), fact('C', 'live_response_obligations', [0]),
      ],
      conclusions: [
        fact('C', 'attack_turn', ['P0']), fact('C', 'response_deadline_policy', ['next_P1_turn']),
        fact('C', 'defender_slots_per_attack', [1]), fact('C', 'live_response_obligations', [0]),
      ],
    },
    authority: { allFacts: `exact C4-0010 ${label} macro plus qualified stutter theorem`, temporalBoundary: 'off-target macro occurs before any C/G support-triggered live response obligation' },
  });
  const composed = Compose_theorem_chain([latentActivation, stutter]);
  assert.equal(composed.ok, true, `${label}: ${JSON.stringify(composed)}`);
  stutterCompositions.push({ label, destinationRank: rank(kernel, afterP1), C3Live: true, G3Live: true, composed: true });
}

console.log(`GUARDED_THEOREM_COMPOSITION_CONTROL=${JSON.stringify({
  kind: 'standard7x6-guarded-claim-theorem-composition-v2',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  bridge: {
    sourcePrefix: HINGE_PREFIX,
    events: ['P0:D3', 'P1:D4'],
    destinationPrefix: LATENT_ROOT,
    composed: bridgeComposition.ok,
    theoremChain: bridgeComposition.theoremIds,
    hingeClaimSupplies: ['P0 live singleton C3', 'P0 live singleton G3'],
    exactD3InstantiationSupplies: ['after-D3 exact frame token', 'P1 to move'],
    exactD4TransitionSupplies: ['destination exact frame token', 'C1 enabled', 'G1 enabled', 'P0 to move'],
    destinationContractSupplies: ['latent target cross-pair temporal contract active', 'next-P1-turn response policy', 'one defender slot per activated attack', 'zero live response obligations before a C/G trigger'],
  },
  stutterReentry: stutterCompositions,
  firstUnprovedPremiseTowardCenterW: {
    id: 'well_founded_off_subsystem_progress_or_reentry',
    statement: 'For every legal off-target P0 event not covered by the qualified same-column stutter, prove a guarded composition that either re-enters the latent contract, enters an exact response-capacity circuit with a proved obligation-slot map, or advances a well-founded structural progress rank toward a terminal/predecessor certificate.',
    whyItBlocks: 'The target-only scheduler and same-column stutters are composable, but the remaining odd/mixed-column off-subsystem events can transport phase/resource defects without yet proving monotone progress or eventual re-entry. Without that universal composition step, center-opening membership in W is not closed.',
  },
  temporalCorrection: 'D3/D4 do not create a live deadline. The bridge now distinguishes the latent next-P1-turn response policy from a live obligation, which is created only by a qualified C/G support trigger.',
  theoremBoundary: 'This proves theorem-contract composition for the exact D3/D4 bridge and the five qualified fixed-state stutter re-entry macros. It does not prove center-opening W membership, later strategy outside these controls, q equality, provenance equality, or a 69-to-28 winning-line reduction. No live temporal obligation is claimed at the latent root before a C/G support trigger.',
  authority: 'Exact C4-0010 transitions/residuals plus previously qualified hinge, latent-contract, and stutter research theorems. Candidate C4-0006/C4-0007 structural semantics remain upstream research dependencies; no solved W/D/L labels or recursive q-tree search are used.',
})}`);
