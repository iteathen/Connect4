import test from 'node:test';
import assert from 'node:assert/strict';
import { BSFP_IDENTITY, bsfpIdentity, gameplayIdentity, proofIdentity, valueBoundaryIdentity, createBsfpFactCache } from '../identity.mjs';
import { createRbaFiber } from '../rba-wdl-reference.mjs';
import { physicalControl } from '../../../experiments/bsfp-rba-reference/physical-control.mjs';

test('equal legal q permits gameplay reuse but distinct physical records and proof premises remain distinct', () => {
  const geometry = { columns: 4, rows: 3, connect: 3 };
  const control = physicalControl(geometry);
  const seen = new Map();
  let pair;
  for (const state of control.states.values()) {
    if (seen.has(state.qKey)) { pair = [seen.get(state.qKey), state]; break; }
    seen.set(state.qKey, state);
  }
  assert(pair);
  function q(state) {
    const supportIndex = state.heights.reduce((a, h, c) => a + h * 4 ** c, 0);
    return gameplayIdentity(geometry, { ...state, supportIndex, sideToMove: state.rank & 1 });
  }
  const [a, b] = pair.map(q);
  assert.deepEqual(a, b);
  const cache = createBsfpFactCache(a); cache.set(a, pair[0].value);
  assert.equal(cache.get(b), pair[1].value);
  const record = state => bsfpIdentity(BSFP_IDENTITY.REPRESENTATION, geometry, 'ownership-v1',
    { heights: state.heights, p0: state.p0, p1: state.p1 });
  assert.notDeepEqual(record(pair[0]), record(pair[1]));
  assert.throws(() => cache.get(record(pair[0])), /profile mismatch/);

  const profile = { revision: 'negative-control-v1', requiredPremises: ['deadline', 'resources'] };
  const proof = proofIdentity(a, profile, { deadline: 3, resources: [1, 2] });
  const proofCache = createBsfpFactCache(proof); proofCache.set(proof, 'certificate');
  assert.equal(proofCache.get(proofIdentity(b, profile, { resources: [1, 2], deadline: 3 })), 'certificate');
  for (const premises of [{ deadline: 4, resources: [1, 2] }, { deadline: 3, resources: [1, 3] },
    { deadline: 3, resources: [1, 2], reservation: 0 }]) {
    assert.equal(proofCache.get(proofIdentity(b, profile, premises)), undefined);
  }
  assert.throws(() => proofCache.get(b), /profile mismatch/);
  assert.throws(() => proofIdentity(a, profile, { deadline: 3 }), /missing/);
  assert.throws(() => proofCache.get(proofIdentity(b, { ...profile, revision: 'other' }, { deadline: 3, resources: [] })), /profile mismatch/);
});

test('boundary reuse includes fiber, threshold, polarity, geometry and profile revision', () => {
  const fiber = createRbaFiber({ columns: 2, rows: 2, connect: 2 }, [0, 0]);
  const identity = valueBoundaryIdentity(fiber, 0, 'upper', 0n);
  const cache = createBsfpFactCache(identity); cache.set(identity, 'ordinary value');
  assert.equal(cache.get(valueBoundaryIdentity(fiber, 1, 'upper', 0n)), undefined);
  assert.equal(cache.get(valueBoundaryIdentity(fiber, 0, 'lower', 0n)), undefined);
  assert.equal(cache.get(valueBoundaryIdentity(createRbaFiber(fiber.geometry, [1, 0]), 0, 'upper', 0n)), undefined);
  assert.throws(() => cache.get(valueBoundaryIdentity({ ...fiber, profile: 'other-revision' }, 0, 'upper', 0n)), /profile mismatch/);
  assert.throws(() => cache.get(valueBoundaryIdentity(createRbaFiber({ columns: 3, rows: 2, connect: 2 }, [0, 0, 0]), 0, 'upper', 0n)), /profile mismatch/);
  assert.throws(() => proofIdentity(identity, { revision: 'proof', requiredPremises: [] }, {}), /Q_ITEM/);
});

test('exact keys preserve types and reject lossy/omitted identity data', () => {
  const geometry = { columns: 2, rows: 2, connect: 2 };
  const id = value => bsfpIdentity(BSFP_IDENTITY.REPRESENTATION, geometry, 'test-v1', value);
  assert.notDeepEqual(id(1n), id('1'));
  assert.notDeepEqual(id(1), id(1n));
  assert.notDeepEqual(id([1, 2]), id({ 0: 1, 1: 2 }));
  assert.deepEqual(id({ a: 1, b: 2 }), id({ b: 2, a: 1 }));
  for (const v of [undefined, NaN, Infinity, 0.5, new Map(), { dropped: undefined }, { [Symbol()]: 1 }]) {
    assert.throws(() => id(v), /identity/);
  }
});

