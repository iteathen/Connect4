// Action-conditioned claim-relative progress-cone substrate.
// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

import {
  DependencyCone_of_claim,
  Canonicalize_typed_cone,
  Verify_structure_preserving_renaming,
  Instantiate_theorem_with_opaque_nonincident_context,
} from './quotient-claim-relative-typed-event-signature.mjs';

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeObservations(claim, context, event) {
  const observations = typeof claim.observations === 'function'
    ? claim.observations({ context, event })
    : claim.observations;
  if (!Array.isArray(observations) || observations.length === 0) {
    throw new TypeError(`claim ${claim?.id ?? '<unknown>'} requires observations`);
  }
  return observations.map((observation) => ({ ...observation }));
}

/**
 * Derive the exact backward dependency cone for one selected action and one declared
 * progress claim. The selected action is itself an observation root, so a canonical
 * theorem instance cannot silently rename an unrelated action into the proof.
 */
export function ActionProgressCone(claim, context, event, selectedActionNode) {
  if (!isObject(claim) || typeof claim.id !== 'string' || !claim.id) {
    throw new TypeError('ActionProgressCone requires claim.id');
  }
  if (!isObject(event) || !Array.isArray(event.nodes)) {
    throw new TypeError('ActionProgressCone requires an event graph');
  }
  if (typeof selectedActionNode !== 'string' || !selectedActionNode) {
    throw new TypeError('selectedActionNode must be a non-empty string');
  }
  if (!event.nodes.some((node) => node.id === selectedActionNode)) {
    throw new Error(`selected action node ${selectedActionNode} not present in event graph`);
  }

  const wrappedClaim = {
    id: claim.id,
    observations: ({ context: innerContext, event: innerEvent }) => [
      { role: 'selected_action', node: selectedActionNode },
      ...normalizeObservations(claim, innerContext, innerEvent),
    ],
  };
  const cone = DependencyCone_of_claim(wrappedClaim, context, event);
  if (!cone.nodes.some((node) => node.id === selectedActionNode)) {
    throw new Error('selected action was not retained by dependency slicing');
  }
  return Object.freeze({ ...cone, selectedActionNode });
}

export function Canonicalize_action_progress_cone(cone, options = {}) {
  return Canonicalize_typed_cone(cone, options);
}

export function Verify_action_progress_isomorphism(left, right, options = {}) {
  return Verify_structure_preserving_renaming(left, right, options);
}

export function Instantiate_action_progress_theorem(theorem, cone, opaqueContext = null, options = {}) {
  return Instantiate_theorem_with_opaque_nonincident_context(theorem, cone, opaqueContext, options);
}

export const ActionProgressBoundary = Object.freeze({
  observation: 'selected action + declared progress claim only',
  qStateEqualityImplied: false,
  globalStateEqualityImplied: false,
  unrelatedActionEquivalenceImplied: false,
  laterStrategyImplied: false,
  provenanceImplied: false,
});
