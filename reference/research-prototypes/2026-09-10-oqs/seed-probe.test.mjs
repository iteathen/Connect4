import test from 'node:test';
import assert from 'node:assert/strict';
import { solveBsfpOwnershipAntichainWdl } from '../../../components/bsfp/ownership-antichain-solver.mjs';
import { loadSeedProbe, ProbeBoundary } from './seed-probe.mjs';
import { prepareCase, synthesizeSupport, semanticKey } from './incremental-oqs.mjs';

test('observed seed recurrence matches every reference support; boundaries never return root success', async () => {
  const spec = { columns: 4, rows: 4, connect: 4 };
  const reference = solveBsfpOwnershipAntichainWdl(spec);
  const { solve } = await loadSeedProbe(); let checked = 0;
  const observation = { rank() {}, begin() {}, normalize() {}, product() {}, complete(f) {
    assert.deepEqual({ wins: f.wins, losses: f.losses }, reference.frontierAt(f.supportIndex)); checked++;
  } };
  assert.equal(solve(spec, observation).rootWdl, reference.rootWdl);
  assert.equal(checked, reference.support.itemCapacity);
  checked = 0;
  assert.throws(() => solve(spec, { ...observation, rank(r) { if (r < 14) throw new ProbeBoundary('rank-boundary'); } }), ProbeBoundary);
  assert.equal(checked, [...reference.support.ranks].filter(r => r >= 14).length);
});

test('residual cofactor reuse preserves every exact layer on all 4x4 supports', () => {
  const spec = { columns: 4, rows: 4, connect: 4 };
  const prepared = prepareCase({ ...spec, selection: 'all' });
  let hits = 0; let candidates = 0;
  for (const supportIndex of prepared.supportIndices) {
    const layers = [];
    const keys = t => new Set(t.nextStates.map(s => semanticKey(s.xMask, s.pair)));
    const baseline = synthesizeSupport({ spec, prepared, supportIndex, oracleMode: true, validateDirect: true,
      onTransition(t) { layers.push(keys(t)); },
    });
    const reused = synthesizeSupport({ spec, prepared, supportIndex, oracleMode: false, validateDirect: true, reuseResidualCofactors: true,
      onTransition(t) { assert.deepEqual(keys(t), layers[t.cut]); },
    });
    assert.equal(reused.totalCandidates, baseline.totalCandidates);
    assert.equal(reused.cofactorEvaluations + reused.cofactorCacheHits, reused.totalCandidates);
    assert.equal(reused.directChecks, reused.cofactorEvaluations);
    hits += reused.cofactorCacheHits; candidates += reused.totalCandidates;
  }
  assert(hits > 0); assert.equal(candidates, 325652);
});

test('OQS preallocation boundary cannot emit a completed quotient or partial layer', () => {
  const spec = { columns: 4, rows: 4, connect: 4 };
  const prepared = prepareCase({ ...spec, selection: 'supports', supports: [468] });
  let observed = 0;
  assert.throws(() => synthesizeSupport({ spec, prepared, supportIndex: 468, oracleMode: false, validateDirect: true,
    onTransitionStart(value) { assert(value.candidateCount > 0); throw new ProbeBoundary('candidate-capacity'); },
    onTransition() { observed++; },
  }), ProbeBoundary);
  assert.equal(observed, 0);
  const result = synthesizeSupport({ spec, prepared, supportIndex: 468, oracleMode: true, validateDirect: true,
    onTransitionStart(value) { assert(value.candidateCount > 0); }, onTransition() { observed++; },
  });
  assert.equal(result.totalCandidates, 1409);
  assert.equal(result.oracleChecks, 11);
  assert.equal(observed, 10);
});


import { oqsCofactor42Shape } from '../../../components/bsfp/cuda/oqs-cofactor-42-layout.mjs';
import { buildFactoredFixtures, factorOqsFixture, packFactoredFixture } from '../../../experiments/cuda-bsfp-oqs-cofactor/factored-fixtures.mjs';

test('factored input IDs preserve every selected 4x4 residual and fit declared finite shapes', () => {
  const spec = { columns: 4, rows: 4, connect: 4 };
  const shape = oqsCofactor42Shape({ ...spec, slice: 'reuse-control', representation: 'factored' });
  let logical = 0; let residual = 0;
  for (const fixture of buildFactoredFixtures(spec)) {
    const factor = factorOqsFixture(fixture); const packed = packFactoredFixture(fixture, shape);
    fixture.states.forEach((s, i) => assert.deepEqual(factor.states[packed.occurrenceResidualId[i]].pair, s.pair));
    assert.equal(packed.activeOccurrenceCount[0], fixture.states.length);
    logical += fixture.candidates.length; residual += factor.states.length * fixture.inputs.length;
  }
  assert.equal(logical, 1409); assert.equal(residual, 326);
  const wide = { columns: 7, rows: 6, connect: 4, slice: 'reuse-cut-5' };
  const a = oqsCofactor42Shape({ ...wide, representation: 'unfactored' });
  const b = oqsCofactor42Shape({ ...wide, representation: 'factored' });
  assert.equal(a.candidateCapacity, 8192); assert.equal(b.candidateCapacity, 128);
  assert.equal(b.mappedCapacity, a.candidateCapacity);
  assert(b.deviceBytes < a.deviceBytes / 40);
  assert(a.deviceBytes + b.deviceBytes + 256 * 1024 ** 2 < 450 * 1024 ** 2);
  assert.throws(() => oqsCofactor42Shape({ ...wide, slice: 'unknown', representation: 'factored' }), /unsupported/);
});
