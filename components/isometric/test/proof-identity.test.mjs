import test from 'node:test';
import assert from 'node:assert/strict';
import { IsometricState, ResidualPool, IsoMaxCertificateIndex, maskGuard, rankGuard,
  temporalGuard, exactValueConclusion, forcedMoveConclusion, reflectGuard, reflectConclusion } from '../index.mjs';

test('proof identities compare all load-bearing payload fields across the entire index', () => {
  const pool = new ResidualPool();
  const state = new IsometricState({ pool });
  const index = new IsoMaxCertificateIndex(pool);
  const input = { guard: rankGuard(), conclusion: exactValueConclusion(0), proofIdentity: 'p', dependencyCone: { premises: ['a'] } };
  const first = index.add(state, input);
  for (const change of [
    { guard: rankGuard({ min: 1 }) }, { conclusion: exactValueConclusion(1) },
    { dependencyCone: { premises: ['b'] } },
  ]) assert.throws(() => index.add(state, { ...input, ...change }), /collision/);
  assert.throws(() => index.add(new IsometricState({ pool, moves: [0] }), input), /collision/);
  assert.throws(() => index.add(state, { ...input, proofProfile: 'other' }), /profile/);
  assert.equal(index.add(state, { ...input, provenance: { log: 'different metadata' } }), first);
  input.dependencyCone.premises[0] = 'mutated';
  assert.deepEqual(first.dependencyCone, { premises: ['a'] });
  assert.throws(() => { first.dependencyCone.premises.push('x'); }, TypeError);
  assert.equal(index.size, 1);
});

test('mirror payloads deduplicate, including a structural reflection stabilizer', () => {
  for (const moves of [[], [0, 1, 0]]) {
    const pool = new ResidualPool();
    const a = new IsometricState({ pool, moves });
    const b = new IsometricState({ pool, moves: moves.map(c => 6 - c) });
    const index = new IsoMaxCertificateIndex(pool);
    const guard = maskGuard({ playableAllLo: 2 });
    const conclusion = forcedMoveConclusion(1);
    const first = index.add(a, { guard, conclusion, proofIdentity: 'mirror' });
    assert.equal(index.add(b, { guard: reflectGuard(guard), conclusion: reflectConclusion(conclusion), proofIdentity: 'mirror' }), first);
  }
});

test('same gameplay state does not collapse distinct proof contexts or unresolved premises', () => {
  const state = new IsometricState();
  const index = new IsoMaxCertificateIndex(state.pool);
  const base = { guard: temporalGuard({ deadline: 3 }), conclusion: exactValueConclusion(0), proofIdentity: 'time' };
  index.add(state, base);
  assert.throws(() => index.add(state, { ...base, guard: temporalGuard({ deadline: 4 }) }), /collision/);
  index.add(state, { ...base, proofIdentity: 'other-time', guard: temporalGuard({ deadline: 4 }) });
  assert.equal(index.lookup(state).unresolved.length, 2);
  assert.equal(index.lookup(state).applicable.length, 0);
});

test('proof snapshots reject data that serialization or transport would silently omit', () => {
  const state = new IsometricState();
  const index = new IsoMaxCertificateIndex(state.pool);
  const base = { guard: rankGuard(), conclusion: exactValueConclusion(0) };
  const hidden = Object.defineProperty({}, 'premise', { value: true });
  const accessor = { get premise() { throw new Error('must not invoke'); } };
  for (const dependencyCone of [hidden, accessor, { missing: undefined }, [ , 1], new Map()]) {
    assert.throws(() => index.add(state, { ...base, dependencyCone }), TypeError);
  }
  assert.throws(() => index.add(state, { ...base, guard: { ...maskGuard(), extraPremise: true } }), /losslessly/);
  assert.equal(index.size, 0);
});
