import test from 'node:test';
import assert from 'node:assert/strict';
import { COLUMNS } from '../../domain/index.mjs';
import {
  CONCLUSION_EXACT_VALUE,
  CONCLUSION_FORCED_MOVE,
  IsoMaxCertificateIndex,
  IsoMaxTransitionCache,
  IsometricState,
  ResidualPool,
  deriveNativeFrontierConsequence,
  exactValueConclusion,
  forcedMoveConclusion,
  maskGuard,
  rankGuard,
} from '../index.mjs';

function reflectColumn(column) {
  return COLUMNS - 1 - column;
}

function bitForCell(cell) {
  return cell < 32 ? [((2 ** cell) >>> 0), 0] : [0, ((2 ** (cell - 32)) >>> 0)];
}

test('IsoMax certificate buckets transfer typed guards and conclusions across reflection', () => {
  const pool = new ResidualPool();
  const index = new IsoMaxCertificateIndex(pool);
  const a = new IsometricState({ pool, moves: [0, 3] });
  const b = new IsometricState({ pool, moves: [6, 3] });
  const [supportLo, supportHi] = bitForCell(0);
  index.add(a, {
    guard: maskGuard({ supportAllLo: supportLo, supportAllHi: supportHi }),
    conclusion: forcedMoveConclusion(1),
    proofIdentity: 'reflection-transfer',
    provenance: 'test',
  });

  const direct = index.lookup(a, { conclusionKind: CONCLUSION_FORCED_MOVE });
  assert.equal(direct.applicable.length, 1);
  assert.equal(direct.applicable[0].conclusion.cell, 1);

  const mirrored = index.lookup(b, { conclusionKind: CONCLUSION_FORCED_MOVE });
  assert.equal(mirrored.applicable.length, 1);
  assert.equal(mirrored.applicable[0].conclusion.cell, reflectColumn(1));
});

test('proof identity deduplicates proof work independently of transition identity', () => {
  const pool = new ResidualPool();
  const index = new IsoMaxCertificateIndex(pool);
  const state = new IsometricState({ pool });
  const first = index.add(state, {
    guard: rankGuard({ min: 0, max: 0 }),
    conclusion: exactValueConclusion(0),
    proofIdentity: 77,
  });
  const second = index.add(state, {
    guard: rankGuard({ min: 0, max: 0 }),
    conclusion: exactValueConclusion(0),
    proofIdentity: 77,
  });
  assert.equal(first, second);
  assert.equal(index.size, 1);
  const result = index.lookup(state, { conclusionKind: CONCLUSION_EXACT_VALUE });
  assert.equal(result.applicable.length, 1);
  assert.equal(result.applicable[0].conclusion.value, 0);
});

test('transition cache uses stronger support-aware identity while mirrors share one canonical entry', () => {
  const pool = new ResidualPool();
  const cache = new IsoMaxTransitionCache({ initialCapacity: 8 });
  const a = new IsometricState({ pool, moves: [1, 3, 2, 4] });
  const b = new IsometricState({ pool, moves: [5, 3, 4, 2] });
  cache.set(a, 12345);
  assert.equal(cache.get(b), 12345);
  const different = new IsometricState({ pool, moves: [1, 3, 2] });
  assert.equal(cache.get(different), undefined);
});

test('transition cache resize preserves the incoming signature and arbitrary cached values', () => {
  const pool = new ResidualPool();
  const cache = new IsoMaxTransitionCache({ initialCapacity: 8 });
  const prefixes = [
    [],
    [0],
    [0, 1],
    [0, 1, 0],
    [0, 1, 0, 1],
    [0, 1, 0, 1, 0],
  ];
  const states = prefixes.map((moves) => new IsometricState({ pool, moves }));
  for (let index = 0; index < states.length; index += 1) cache.set(states[index], 10000 + index);
  assert.ok(cache.capacity > 8);
  for (let index = 0; index < states.length; index += 1) assert.equal(cache.get(states[index]), 10000 + index);
});

test('native WSL frontier derives exact immediate win', () => {
  const state = new IsometricState({ moves: [3, 0, 3, 0, 3, 1] });
  const consequence = deriveNativeFrontierConsequence(state);
  assert.equal(consequence.kind, CONCLUSION_EXACT_VALUE);
  assert.equal(consequence.value, 1);
  assert.equal(consequence.distance, 1);
});

test('native WSL frontier derives unique forced reply without claiming a value', () => {
  const state = new IsometricState({ moves: [0, 3, 1, 3, 4, 3] });
  const consequence = deriveNativeFrontierConsequence(state);
  assert.equal(consequence.kind, CONCLUSION_FORCED_MOVE);
  assert.equal(consequence.cell, 24);
});

test('native WSL frontier derives exact double-threat loss with first-win ordering', () => {
  const state = new IsometricState({ moves: [0, 0, 0, 0, 0, 0, 2, 2, 3, 2, 4] });
  const consequence = deriveNativeFrontierConsequence(state);
  assert.equal(consequence.kind, CONCLUSION_EXACT_VALUE);
  assert.equal(consequence.value, 1);
  assert.equal(consequence.distance, 2);
});