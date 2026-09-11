import test from 'node:test';
import assert from 'node:assert/strict';
import { solveBsfpOwnershipAntichainWdl } from '../../../components/bsfp/ownership-antichain-solver.mjs';
import { loadSeedProbe, ProbeBoundary } from './seed-probe.mjs';
import { prepareCase, synthesizeSupport } from './incremental-oqs.mjs';

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
