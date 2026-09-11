import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { r3, synthesizeSupport } from '../../reference/research-prototypes/2026-09-10-oqs/incremental-oqs.mjs';
import { createBsfpSupportLatticeProfile } from '../../components/bsfp/support-lattice.mjs';

export function prepareFrozen7x6Seed() {
  const seed = JSON.parse(readFileSync(new URL('fixtures/7x6-support-470594.json', import.meta.url), 'utf8'));
  const source = readFileSync(new URL('../../components/bsfp/ownership-antichain-solver.mjs', import.meta.url), 'utf8').replaceAll('\r\n', '\n');
  assert.equal(createHash('sha256').update(source).digest('hex'), seed.sourceSha256);
  const spec = seed.spec; assert.deepEqual(spec, { columns: 7, rows: 6, connect: 4 });
  const support = createBsfpSupportLatticeProfile(spec);
  assert.equal(support.encodeHeights(seed.heights), seed.supportIndex);
  assert.equal(seed.supportIndex, 470594);
  const frontier = { wins: seed.wins.map(BigInt), losses: seed.losses.map(BigInt) };
  const lines = r3.createConnectWinningLines(spec); const orderData = r3.optimizeLineOrder(spec, lines);
  const prepared = { lines, orderData, solution: { support, frontierAt(index) { assert.equal(index, seed.supportIndex); return frontier; } } };
  return { seed, spec, prepared };
}

export function build7x6SeedSliceFixture() {
  const { seed, spec, prepared } = prepareFrozen7x6Seed();
  const stop = new Error('first independently checked transition captured'); let fixture;
  try {
    synthesizeSupport({ spec, prepared, supportIndex: seed.supportIndex, oracleMode: true, validateDirect: true,
      onTransitionStart({ cut }) { if (cut === 1) throw stop; },
      onTransition(value) { assert.equal(value.cut, 0); fixture = value; },
    });
    assert.fail('seed slice unexpectedly completed the quotient');
  } catch (error) { if (error !== stop) throw error; }
  // The stop is after the reference independently checked layers 0 and 1.
  assert(fixture); assert.equal(fixture.candidates.length, 16);
  return { ...fixture, spec, supportIndex: seed.supportIndex, seedSourceSha256: seed.sourceSha256, independentLayers: 2 };
}
