#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ActionProgressCone,
  Canonicalize_action_progress_cone,
  Verify_action_progress_isomorphism,
} from './quotient-action-progress-cone.mjs';

const ref = (id) => ({ $ref: id });

function symmetricEvent({ hostileB = false } = {}) {
  return {
    id: 'two-action-control',
    variables: [
      { id: 'a', type: 'Cell' },
      { id: 'b', type: 'Cell' },
      { id: 'ta', type: 'Cell' },
      { id: 'tb', type: 'Cell' },
    ],
    nodes: [
      { id: 'actionA', layer: 'E', kind: 'enabled_selected_action', attrs: { cell: ref('a') } },
      { id: 'actionB', layer: 'E', kind: 'enabled_selected_action', attrs: { cell: ref('b') } },
      { id: 'rA', layer: 'R', kind: 'selected_action_incident_cofactor', attrs: { action: ref('a') } },
      { id: 'rB', layer: 'R', kind: hostileB ? 'hostile_extra_residual_guard' : 'selected_action_incident_cofactor', attrs: { action: ref('b') } },
      { id: 'targetA', layer: 'R', kind: 'target_singleton_preserved', attrs: { target: ref('ta') } },
      { id: 'targetB', layer: 'R', kind: 'target_singleton_preserved', attrs: { target: ref('tb') } },
      { id: 'outA', layer: 'claim', kind: 'strict_selected_resource_descent', attrs: { amount: 1 } },
      { id: 'outB', layer: 'claim', kind: 'strict_selected_resource_descent', attrs: { amount: 1 } },
      { id: 'unrelated', layer: 'R', kind: 'live_but_nonincident_context', attrs: { token: 'opaque' } },
    ],
    edges: [
      { from: 'actionA', to: 'outA', role: 'selected_event' },
      { from: 'rA', to: 'outA', role: 'incident_R_guard' },
      { from: 'targetA', to: 'outA', role: 'target_guard' },
      { from: 'actionB', to: 'outB', role: 'selected_event' },
      { from: 'rB', to: 'outB', role: 'incident_R_guard' },
      { from: 'targetB', to: 'outB', role: 'target_guard' },
    ],
  };
}

const claim = {
  id: 'selected_action_progress',
  observations: ({ context }) => [{ role: 'progress_outcome', node: context.outcome }],
};

test('ActionProgressCone keeps only the selected action dependency branch', () => {
  const event = symmetricEvent();
  const cone = ActionProgressCone(
    claim,
    { outcome: 'outA', opaqueNonincident: { stillLive: 'unrelated-global-fact' } },
    event,
    'actionA',
  );
  const ids = new Set(cone.nodes.map((node) => node.id));
  assert.deepEqual([...ids].sort(), ['actionA', 'outA', 'rA', 'targetA']);
  assert.deepEqual(cone.opaqueNonincidentContext, { stillLive: 'unrelated-global-fact' });
});

test('physically distinct selected actions can reuse one theorem under typed renaming', () => {
  const event = symmetricEvent();
  const a = ActionProgressCone(claim, { outcome: 'outA' }, event, 'actionA');
  const b = ActionProgressCone(claim, { outcome: 'outB' }, event, 'actionB');
  const ca = Canonicalize_action_progress_cone(a);
  const cb = Canonicalize_action_progress_cone(b);
  assert.equal(ca.canonicalKey, cb.canonicalKey);
  const iso = Verify_action_progress_isomorphism(a, b);
  assert.equal(iso.isomorphic, true);
});

test('selected-action theorem reuse rejects a load-bearing residual mismatch', () => {
  const normal = symmetricEvent();
  const hostile = symmetricEvent({ hostileB: true });
  const a = ActionProgressCone(claim, { outcome: 'outA' }, normal, 'actionA');
  const b = ActionProgressCone(claim, { outcome: 'outB' }, hostile, 'actionB');
  const ca = Canonicalize_action_progress_cone(a);
  const cb = Canonicalize_action_progress_cone(b);
  assert.notEqual(ca.canonicalKey, cb.canonicalKey);
  const iso = Verify_action_progress_isomorphism(a, b);
  assert.equal(iso.isomorphic, false);
});
