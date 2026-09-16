import assert from 'node:assert/strict';
import test from 'node:test';
import {
  Canonicalize_typed_cone,
  DependencyCone_of_claim,
  Instantiate_theorem_with_opaque_nonincident_context,
  TypedEventSignature,
  TypedRef,
  Verify_structure_preserving_renaming,
} from './quotient-claim-relative-typed-event-signature.mjs';

const ref = TypedRef.of;

function singletonEvent(id, concreteTarget, { terminalPolicy = 'P1_TERMINAL_EXCEPTION_ALLOWED', unrelated = 'opaque' } = {}) {
  return {
    id,
    variables: [{ id: 'x', type: 'cell', concrete: concreteTarget }],
    nodes: [
      { id: 'side', layer: 'P', kind: 'side_to_move', attrs: { player: 'P1' } },
      { id: 'enabled', layer: 'E', kind: 'enabled_cell', attrs: { cell: ref('x') } },
      { id: 'live', layer: 'R', kind: 'live_p0_singleton', attrs: { cell: ref('x') } },
      { id: 'claim', layer: 'E', kind: 'claim_cell_now', attrs: { mover: 'P1', cell: ref('x') } },
      { id: 'terminal', layer: 'terminal', kind: 'mover_terminal_guard', attrs: { policy: terminalPolicy } },
      { id: 'result', layer: 'claim', kind: 'singleton_discharge_result', attrs: { cell: ref('x') } },
      { id: 'noise', layer: 'R', kind: 'unrelated_residual_context', attrs: { marker: unrelated } },
    ],
    edges: [
      { from: 'side', to: 'claim', role: 'mover_guard' },
      { from: 'enabled', to: 'claim', role: 'legality_guard' },
      { from: 'live', to: 'result', role: 'precondition' },
      { from: 'claim', to: 'result', role: 'discharge_event' },
      { from: 'terminal', to: 'result', role: 'terminal_exception_guard' },
      // Deliberately no dependency from noise to result.
    ],
  };
}

const singletonClaim = {
  id: 'enabled_singleton_discharge',
  observations: [{ role: 'discharge_or_terminal', node: 'result' }],
};

function stutterEvent(id, concreteColumn, pair, { p0Terminal = false } = {}) {
  return {
    id,
    variables: [{ id: 'r', type: 'resource_column', concrete: concreteColumn }],
    nodes: [
      { id: 'pair', layer: 'E', kind: 'same_column_two_ply_pair', attrs: { resource: ref('r') } },
      { id: 'rank', layer: 'P', kind: 'rank_delta', attrs: { delta: 2 } },
      { id: 'phase', layer: 'P', kind: 'gf2_phase_displacement', attrs: { displacement: 0, resource: ref('r') } },
      { id: 'c3', layer: 'R', kind: 'latent_singleton_preserved', attrs: { targetRole: 'left' } },
      { id: 'g3', layer: 'R', kind: 'latent_singleton_preserved', attrs: { targetRole: 'right' } },
      { id: 'terminal', layer: 'terminal', kind: 'p0_terminal_inside_macro', attrs: { value: p0Terminal } },
      { id: 'result', layer: 'claim', kind: 'latent_contract_stutter', attrs: {} },
      { id: 'physical', layer: 'E', kind: 'physical_pair_label', attrs: { pair } },
    ],
    edges: [
      { from: 'pair', to: 'rank', role: 'advances_rank' },
      { from: 'pair', to: 'phase', role: 'updates_phase' },
      { from: 'pair', to: 'c3', role: 'cofactor_check' },
      { from: 'pair', to: 'g3', role: 'cofactor_check' },
      { from: 'pair', to: 'terminal', role: 'terminal_check' },
      { from: 'rank', to: 'result', role: 'stutter_condition' },
      { from: 'phase', to: 'result', role: 'stutter_condition' },
      { from: 'c3', to: 'result', role: 'stutter_condition' },
      { from: 'g3', to: 'result', role: 'stutter_condition' },
      { from: 'terminal', to: 'result', role: 'stutter_condition' },
      // Physical landing rows are evidence provenance, not a dependency of this claim.
    ],
  };
}

const stutterClaim = {
  id: 'same_column_stutter_preserves_latent_contract',
  observations: [{ role: 'latent_contract_preserved', node: 'result' }],
};

function phaseTransportEvent(id, fromConcrete, toConcrete, { distinct = true, incidentClass = 'same' } = {}) {
  return {
    id,
    variables: [
      { id: 'debt', type: 'phase_column', concrete: fromConcrete },
      { id: 'resource', type: 'phase_column', concrete: toConcrete },
    ],
    nodes: [
      { id: 'macro', layer: 'E', kind: 'distinct_column_two_ply_macro', attrs: { distinctColumns: distinct, from: ref('debt'), to: ref('resource') } },
      { id: 'gf2', layer: 'P', kind: 'gf2_phase_update', attrs: { equation: 'phi_prime=phi+e_a+e_b', from: ref('debt'), to: ref('resource') } },
      { id: 'result', layer: 'claim', kind: 'phase_defect_transported', attrs: { from: ref('debt'), to: ref('resource') } },
      { id: 'incident', layer: 'R', kind: 'incident_residual_class', attrs: { class: incidentClass } },
    ],
    edges: [
      { from: 'macro', to: 'gf2', role: 'phase_operator_guard' },
      { from: 'gf2', to: 'result', role: 'phase_consequence' },
      // incident residual class deliberately outside the pure phase claim cone.
    ],
  };
}

const phaseClaim = {
  id: 'phase_defect_transport',
  observations: [{ role: 'phase_transport', node: 'result' }],
};

function localRepairEffectEvent(id, concrete, incidentClass) {
  const event = phaseTransportEvent(id, 'latent-debt', concrete, { incidentClass });
  event.nodes.push({ id: 'preserve', layer: 'R', kind: 'remaining_target_preserved', attrs: { value: true } });
  event.nodes.push({ id: 'local', layer: 'claim', kind: 'full_local_repair_effect', attrs: {} });
  event.edges.push({ from: 'result', to: 'local', role: 'phase_component' });
  event.edges.push({ from: 'incident', to: 'local', role: 'incident_residual_component' });
  event.edges.push({ from: 'preserve', to: 'local', role: 'target_component' });
  return event;
}

const localRepairClaim = {
  id: 'phase_defect_transport_with_local_residual_effect',
  observations: [{ role: 'full_local_effect', node: 'local' }],
};

test('DependencyCone_of_claim excludes unrelated live global context but retains it opaquely', () => {
  const context = { opaqueNonincident: { qIdentity: 'support+R0+R1@45112', unrelatedResidual: 'live' } };
  const event = singletonEvent('center-C1', 'C1', { unrelated: 'center-only' });
  const cone = DependencyCone_of_claim(singletonClaim, context, event);
  assert.equal(cone.nodes.some((node) => node.id === 'noise'), false);
  assert.deepEqual(cone.opaqueNonincidentContext, context.opaqueNonincident);
});

test('C1, C3, and G3 singleton discharge instantiate one claim theorem without q equality', () => {
  const contexts = [
    [{ opaqueNonincident: { qIdentity: 'q:center:45112', unrelated: 'center' } }, singletonEvent('center-C1', 'C1')],
    [{ opaqueNonincident: { qIdentity: 'q:latent:C3', unrelated: 'latent-C' } }, singletonEvent('latent-C3', 'C3')],
    [{ opaqueNonincident: { qIdentity: 'q:latent:G3', unrelated: 'latent-G' } }, singletonEvent('latent-G3', 'G3')],
  ];
  const signatures = contexts.map(([context, event]) => TypedEventSignature(singletonClaim, context, event));
  assert.equal(new Set(signatures.map((x) => x.canonicalKey)).size, 1);
  const theorem = { id: 'enabled-live-p0-singleton-discharge-v1', claimId: singletonClaim.id, conclusion: 'discharged_or_P1_terminal' };
  const instance = Instantiate_theorem_with_opaque_nonincident_context(theorem, signatures[0], signatures[2]);
  assert.equal(instance.instantiated, true);
  assert.equal(instance.renamingWitness.typedBindings[0].fromConcrete, 'C1');
  assert.equal(instance.renamingWitness.typedBindings[0].toConcrete, 'G3');
  assert.equal(instance.opaqueNonincidentContext.qIdentity, 'q:latent:G3');
  assert.equal(instance.boundary.impliesQEquality, false);
  assert.equal(instance.boundary.impliesProvenanceEquivalence, false);
});

test('terminal semantics are load-bearing for singleton discharge and reject false reuse', () => {
  const a = DependencyCone_of_claim(singletonClaim, {}, singletonEvent('a', 'C1', { terminalPolicy: 'P1_TERMINAL_EXCEPTION_ALLOWED' }));
  const b = DependencyCone_of_claim(singletonClaim, {}, singletonEvent('b', 'C3', { terminalPolicy: 'NO_TERMINAL_EXCEPTION' }));
  const verdict = Verify_structure_preserving_renaming(a, b);
  assert.equal(verdict.isomorphic, false);
  assert.match(verdict.separator.path, /attrs|nodes/);
});

test('all five qualified fixed-state same-column pairs share the stutter theorem despite physical row labels', () => {
  const physical = [
    ['A', 'A1->A2'], ['B', 'B1->B2'], ['D', 'D5->D6'], ['E', 'E5->E6'], ['F', 'F5->F6'],
  ];
  const signatures = physical.map(([column, pair]) => TypedEventSignature(
    stutterClaim,
    { opaqueNonincident: { physicalPair: pair } },
    stutterEvent(`stutter-${column}`, column, pair),
  ));
  assert.equal(new Set(signatures.map((x) => x.canonicalKey)).size, 1);
  assert.equal(signatures[0].cone.nodes.some((node) => node.id === 'physical'), false);
});

test('P0 terminal inside same-column macro is a separating load-bearing field', () => {
  const safe = DependencyCone_of_claim(stutterClaim, {}, stutterEvent('safe', 'A', 'A1->A2'));
  const poisoned = DependencyCone_of_claim(stutterClaim, {}, stutterEvent('bad', 'A', 'A1->A2', { p0Terminal: true }));
  const verdict = Verify_structure_preserving_renaming(safe, poisoned);
  assert.equal(verdict.isomorphic, false);
  assert.match(stableSeparator(verdict), /false.*true|true.*false/);
});

test('pure phase-defect transport ignores incident residual class outside its dependency cone', () => {
  const a = TypedEventSignature(phaseClaim, { opaqueNonincident: { residualClass: 'A/B-specific' } }, phaseTransportEvent('a', 'C', 'A', { incidentClass: 'bottom-live' }));
  const b = TypedEventSignature(phaseClaim, { opaqueNonincident: { residualClass: 'D/E/F-specific' } }, phaseTransportEvent('b', 'G', 'D', { incidentClass: 'upper-tail' }));
  assert.equal(a.canonicalKey, b.canonicalKey);
});

test('the stronger local-repair claim rejects geometry-only merge when incident R data differs', () => {
  const a = DependencyCone_of_claim(localRepairClaim, {}, localRepairEffectEvent('A/B', 'A', 'bottom-live'));
  const b = DependencyCone_of_claim(localRepairClaim, {}, localRepairEffectEvent('D/E/F', 'D', 'upper-tail'));
  const verdict = Verify_structure_preserving_renaming(a, b);
  assert.equal(verdict.isomorphic, false);
  assert.match(stableSeparator(verdict), /bottom-live|upper-tail/);
});

test('distinct-column guard is load-bearing for GF(2) defect transport', () => {
  const a = DependencyCone_of_claim(phaseClaim, {}, phaseTransportEvent('good', 'C', 'A', { distinct: true }));
  const b = DependencyCone_of_claim(phaseClaim, {}, phaseTransportEvent('same-column', 'C', 'C', { distinct: false }));
  const verdict = Verify_structure_preserving_renaming(a, b);
  assert.equal(verdict.isomorphic, false);
});

test('canonicalizer enforces a hard exact-permutation complexity bound', () => {
  const cone = DependencyCone_of_claim(singletonClaim, {}, singletonEvent('x', 'C1'));
  assert.doesNotThrow(() => Canonicalize_typed_cone(cone, { maxPermutations: 1000 }));
  assert.throws(() => Canonicalize_typed_cone(cone, { maxPermutations: 0 }), /positive safe integer/);
});

function stableSeparator(verdict) {
  return JSON.stringify(verdict.separator);
}
