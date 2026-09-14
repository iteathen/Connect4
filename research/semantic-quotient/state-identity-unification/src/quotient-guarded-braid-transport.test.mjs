import test from 'node:test';
import assert from 'node:assert/strict';
import {
  Export_transport_snapshot,
  Verify_neutral_pair_transport,
  Verify_guarded_interchange,
} from './quotient-guarded-braid-transport.mjs';

function snapshot(overrides = {}) {
  return Export_transport_snapshot({
    claimId: 'latent-C3/G3', sideToMove: 'P1',
    claimInterface: { targets: ['C3','G3'], distances: [1,2] },
    phase: '0010000', supportOrdering: { C: 'C2', G: 'G1' },
    responseResources: { C: 5, G: 6 },
    obligations: [{ id: 'cross:C1->G1', deadlineClock: 'P1_turn', remaining: 1, response: ['G1'] }],
    progressRank: [20], ...overrides,
  });
}
const pair = [
  { id: 'P1:B1', legal: true, terminal: false, clockTicks: { P1_turn: 0 } },
  { id: 'P0:B2', legal: true, terminal: false, clockTicks: { P1_turn: 0 } },
];

test('neutral pair requires exact claim preservation and strict progress', () => {
  const result = Verify_neutral_pair_transport({ before: snapshot(), after: snapshot({ progressRank: [18] }), events: pair });
  assert.equal(result.ok, true);
});

test('rejects implicit player renaming', () => {
  const result = Verify_neutral_pair_transport({ before: snapshot(), after: snapshot({ sideToMove: 'P0', progressRank: [18] }), events: pair });
  assert.equal(result.ok, false); assert.equal(result.detail.field, 'sideToMove');
});

test('rejects dropped obligation without discharge', () => {
  const result = Verify_neutral_pair_transport({ before: snapshot(), after: snapshot({ obligations: [], progressRank: [18] }), events: pair });
  assert.equal(result.reason, 'obligation_dropped_without_discharge');
});

test('rejects a discharge disposition not certified by a concrete event', () => {
  const result = Verify_neutral_pair_transport({
    before: snapshot(), after: snapshot({ obligations: [], progressRank: [18] }), events: pair,
    dispositions: [{ id: 'cross:C1->G1', kind: 'discharged', eventId: 'P1:B1' }],
  });
  assert.equal(result.reason, 'obligation_discharge_not_event_certified');
});

test('accepts a discharge only when the named event certifies the exact obligation effect', () => {
  const events = [
    { id: 'P1:B1', legal: true, terminal: false, clockTicks: {}, discharges: ['cross:C1->G1'] },
    pair[1],
  ];
  const result = Verify_neutral_pair_transport({
    before: snapshot(), after: snapshot({ obligations: [], progressRank: [18] }), events,
    dispositions: [{ id: 'cross:C1->G1', kind: 'discharged', eventId: 'P1:B1' }],
  });
  assert.equal(result.ok, true);
});

test('rejects created obligation without derivation', () => {
  const obligations = [
    { id: 'cross:C1->G1', deadlineClock: 'P1_turn', remaining: 1, response: ['G1'] },
    { id: 'new', deadlineClock: 'P1_turn', remaining: 1, response: ['A1'] },
  ];
  const result = Verify_neutral_pair_transport({ before: snapshot(), after: snapshot({ obligations, progressRank: [18] }), events: pair });
  assert.equal(result.reason, 'obligation_created_without_derivation');
});

test('rejects a creation disposition not certified by the named event', () => {
  const obligations = [
    { id: 'cross:C1->G1', deadlineClock: 'P1_turn', remaining: 1, response: ['G1'] },
    { id: 'new', deadlineClock: 'P1_turn', remaining: 1, response: ['A1'] },
  ];
  const result = Verify_neutral_pair_transport({
    before: snapshot(), after: snapshot({ obligations, progressRank: [18] }), events: pair,
    dispositions: [{ id: 'new', kind: 'created', eventId: 'P0:B2' }],
  });
  assert.equal(result.reason, 'obligation_creation_not_event_certified');
});

test('rejects deadline regeneration when its causal clock ticked', () => {
  const events = [
    { id: 'P1:B1', legal: true, terminal: false, clockTicks: { P1_turn: 1 } },
    { id: 'P0:B2', legal: true, terminal: false, clockTicks: { P1_turn: 0 } },
  ];
  const result = Verify_neutral_pair_transport({ before: snapshot(), after: snapshot({ progressRank: [18] }), events });
  assert.equal(result.reason, 'obligation_deadline_regenerated');
});

test('live obligation snapshots cannot carry zero remaining deadline', () => {
  assert.throws(() => snapshot({ obligations: [{ id: 'expired', deadlineClock: 'P1_turn', remaining: 0, response: ['G1'] }] }), /positive safe integer/);
});

test('rejects response-resource drift and absent rank descent', () => {
  const drift = Verify_neutral_pair_transport({ before: snapshot(), after: snapshot({ responseResources: { C: 4, G: 6 }, progressRank: [18] }), events: pair });
  assert.equal(drift.reason, 'claim_interface_changed');
  const flat = Verify_neutral_pair_transport({ before: snapshot(), after: snapshot(), events: pair });
  assert.equal(flat.reason, 'well_founded_resource_did_not_strictly_decrease');
});

test('rejects terminal crossing', () => {
  const events = [{ id: 'x', legal: true, terminal: true, clockTicks: {} }, pair[1]];
  const result = Verify_neutral_pair_transport({ before: snapshot(), after: snapshot({ progressRank: [18] }), events });
  assert.equal(result.reason, 'event_guard_failed');
});

test('guarded interchange requires the same final claim contract', () => {
  const start = snapshot();
  const finish = snapshot({ progressRank: [18] });
  assert.equal(Verify_guarded_interchange({ start, left: { start, finish, events: pair }, right: { start, finish, events: [...pair].reverse() } }).ok, true);
  const badFinish = snapshot({ phase: '1010000', progressRank: [18] });
  assert.equal(Verify_guarded_interchange({ start, left: { start, finish, events: pair }, right: { start, finish: badFinish, events: pair } }).ok, false);
});

test('guarded interchange rejects two equally bad paths that regenerate the same deadline', () => {
  const start = snapshot();
  const finish = snapshot({ progressRank: [18] });
  const ticking = [
    { id: 'P1:B1', legal: true, terminal: false, clockTicks: { P1_turn: 1 } },
    { id: 'P0:B2', legal: true, terminal: false, clockTicks: {} },
  ];
  const result = Verify_guarded_interchange({
    start,
    left: { name: 'left', start, finish, events: ticking },
    right: { name: 'right', start, finish, events: ticking },
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'interchange_path_transport_failed');
  assert.equal(result.detail.detail.reason, 'obligation_deadline_regenerated');
});
