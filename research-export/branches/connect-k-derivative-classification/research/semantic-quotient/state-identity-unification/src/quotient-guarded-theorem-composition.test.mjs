import test from 'node:test';
import assert from 'node:assert/strict';
import {
  Export_typed_theorem_contract,
  Unify_conclusion_with_premise,
  Verify_opaque_frame_condition,
  Verify_temporal_resource_compatibility,
  Verify_terminal_complete_composition,
  Compose_theorem_chain,
  GuardedCompositionTerms,
} from './quotient-guarded-theorem-composition.mjs';

const { ref } = GuardedCompositionTerms;
const fact = (layer, predicate, args = [], value = true) => ({ layer, predicate, args, value });
function contract(overrides = {}) {
  return {
    id: overrides.id ?? 'contract',
    claimId: overrides.claimId ?? 'claim',
    variables: overrides.variables ?? [],
    preconditions: overrides.preconditions ?? [],
    conclusions: overrides.conclusions ?? [],
    frame: overrides.frame ?? { preconditions: [], conclusions: [] },
    temporalResource: overrides.temporalResource ?? { preconditions: [], conclusions: [] },
    terminal: overrides.terminal ?? { accepts: ['continue'], emits: ['continue'], closes: [] },
    provenance: overrides.provenance ?? { mode: 'value-only', preconditions: [], conclusions: [] },
  };
}

test('typed conclusion unification discharges renamed cell premise', () => {
  const up = Export_typed_theorem_contract(contract({
    id: 'up', variables: [{ id: 'x', type: 'cell', concrete: 'C3' }],
    conclusions: [fact('R', 'p0_live_singleton', [ref('x')])],
  }));
  const down = Export_typed_theorem_contract(contract({
    id: 'down', variables: [{ id: 'target', type: 'cell', concrete: 'C3' }],
    preconditions: [fact('R', 'p0_live_singleton', [ref('target')])],
  }));
  const result = Unify_conclusion_with_premise(up, down);
  assert.equal(result.ok, true);
  assert.equal(result.binding.target, 'var:cell:"C3"');
});

test('positive composition records premise, frame, temporal/resource, and terminal discharge', () => {
  const up = contract({
    id: 'hinge', variables: [{ id: 'x', type: 'cell', concrete: 'C3' }],
    conclusions: [fact('R', 'p0_live_singleton', [ref('x')])],
    frame: { preconditions: [], conclusions: [fact('N', 'opaque_context_token', ['bridge-context'])] },
    temporalResource: { preconditions: [], conclusions: [fact('C', 'reply_window', ['current_P1_turn'])] },
  });
  const down = contract({
    id: 'bridge', variables: [{ id: 'target', type: 'cell', concrete: 'C3' }],
    preconditions: [fact('R', 'p0_live_singleton', [ref('target')])],
    frame: { preconditions: [fact('N', 'opaque_context_token', ['bridge-context'])], conclusions: [] },
    temporalResource: { preconditions: [fact('C', 'reply_window', ['current_P1_turn'])], conclusions: [] },
  });
  const result = Compose_theorem_chain([up, down]);
  assert.equal(result.ok, true);
  assert.equal(result.links.length, 1);
  assert.equal(result.certificate.qEqualityImplied, false);
});

test('reject phase-only theorem feeding stronger repair effect without incident R', () => {
  const phase = contract({ id: 'phase', conclusions: [fact('P', 'phase_defect_transported', ['A', 'B'])] });
  const repair = contract({
    id: 'repair',
    preconditions: [fact('P', 'phase_defect_transported', ['A', 'B']), fact('R', 'incident_residual_signature', ['sig-A'])],
  });
  const result = Compose_theorem_chain([phase, repair]);
  assert.equal(result.ok, false);
  assert.equal(result.stage, 'premise');
  assert.equal(result.separator.kind, 'missing_predicate');
  assert.equal(result.separator.premise.predicate, 'incident_residual_signature');
});

test('reject capacity circuit application without exact obligation-slot mapping', () => {
  const obligations = contract({ id: 'obligations', conclusions: [fact('C', 'two_mandatory_obligations', ['o1', 'o2'])] });
  const circuit = contract({
    id: 'circuit',
    preconditions: [fact('C', 'two_mandatory_obligations', ['o1', 'o2']), fact('C', 'exact_obligation_slot_mapping', ['mapping-1'])],
  });
  const result = Compose_theorem_chain([obligations, circuit]);
  assert.equal(result.ok, false);
  assert.equal(result.stage, 'premise');
  assert.equal(result.separator.premise.predicate, 'exact_obligation_slot_mapping');
});

test('reject dropped live terminal alternative', () => {
  const up = Export_typed_theorem_contract(contract({ id: 'up', terminal: { accepts: ['continue'], emits: ['continue', 'P1_terminal'], closes: [] } }));
  const down = Export_typed_theorem_contract(contract({ id: 'down', terminal: { accepts: ['continue'], emits: ['continue'], closes: [] } }));
  const result = Verify_terminal_complete_composition(up, down);
  assert.equal(result.ok, false);
  assert.deepEqual(result.separator.alternatives, ['P1_terminal']);
});

test('reject opaque frame mutation without qualified bridge fact', () => {
  const up = Export_typed_theorem_contract(contract({ id: 'up', frame: { preconditions: [], conclusions: [fact('N', 'opaque_context_token', ['before'])] } }));
  const down = Export_typed_theorem_contract(contract({ id: 'down', frame: { preconditions: [fact('N', 'opaque_context_token', ['after'])], conclusions: [] } }));
  const result = Verify_opaque_frame_condition(up, down);
  assert.equal(result.ok, false);
  assert.equal(result.separator.kind, 'concrete_binding');
});

test('reject provenance-sensitive theorem after value-only contract', () => {
  const up = contract({ id: 'value', provenance: { mode: 'value-only', preconditions: [], conclusions: [] } });
  const down = contract({ id: 'prov', provenance: { mode: 'observable', preconditions: [], conclusions: [] } });
  const result = Compose_theorem_chain([up, down]);
  assert.equal(result.ok, false);
  assert.equal(result.stage, 'provenance');
  assert.equal(result.separator.kind, 'provenance_not_available');
});

test('reject temporal composition when resource/deadline state is missing', () => {
  const up = Export_typed_theorem_contract(contract({ id: 'up' }));
  const down = Export_typed_theorem_contract(contract({
    id: 'down', temporalResource: { preconditions: [fact('C', 'response_deadline', ['next_P1_turn'])], conclusions: [] },
  }));
  const result = Verify_temporal_resource_compatibility(up, down);
  assert.equal(result.ok, false);
  assert.equal(result.separator.kind, 'missing_predicate');
  assert.equal(result.separator.premise.predicate, 'response_deadline');
});
