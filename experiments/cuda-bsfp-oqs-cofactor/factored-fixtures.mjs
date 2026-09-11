import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { r3, prepareCase, synthesizeSupport, semanticKey } from '../../reference/research-prototypes/2026-09-10-oqs/incremental-oqs.mjs';
import { prepareFrozen7x6Seed } from './seed-slice-fixture.mjs';
import { packOqsFixture } from './fixtures.mjs';

export function buildFactoredFixtures(spec) {
  const fixtures = [];
  if (spec.columns === 4 && spec.rows === 4 && spec.connect === 4) {
    const prepared = prepareCase({ ...spec, selection: 'supports', supports: [468] });
    synthesizeSupport({ spec, prepared, supportIndex: 468, oracleMode: true, validateDirect: true,
      reuseResidualCofactors: true, onTransition(t) { fixtures.push({ ...t, supportIndex: 468, oracle: 'independent-R3-layers' }); } });
  } else {
    assert.deepEqual(spec, { columns: 7, rows: 6, connect: 4 });
    const { prepared, seed } = prepareFrozen7x6Seed();
    const evidence = JSON.parse(readFileSync(new URL('../../docs/research/evidence/2026-09-11-oqs-residual-cofactor-reuse.json', import.meta.url), 'utf8'));
    const expected = evidence.logs.find(l => l.file === '7x6-reuse-ab-baseline.jsonl').events.filter(e => e.event === 'cut-complete');
    const stop = new Error('qualified cut captured');
    try {
      synthesizeSupport({ spec, prepared, supportIndex: seed.supportIndex, oracleMode: false, validateDirect: true,
        reuseResidualCofactors: true, onTransitionStart({ cut }) { if (cut === 6) throw stop; },
        onTransition(t) {
          const digest = createHash('sha256').update(t.nextStates.map(s => semanticKey(s.xMask, s.pair)).sort().join('\n')).digest('hex');
          assert.equal(digest, expected.find(e => e.cut === t.cut).stateSetSha256);
          if (t.cut === 5) fixtures.push({ ...t, supportIndex: seed.supportIndex, oracle: 'retained-baseline-six-layer-digests' });
        },
      });
      assert.fail('unexpected complete quotient');
    } catch (error) { if (error !== stop) throw error; }
  }
  assert.equal(fixtures.length, spec.columns === 4 ? 10 : 1);
  return fixtures;
}

/** Host oracle preparation only. Production GPU ID discovery is not implemented. */
export function factorOqsFixture(fixture) {
  const ids = new Map(); const states = []; const occurrenceIds = [];
  for (const state of fixture.states) {
    const key = r3.pairKey(state.pair);
    let id = ids.get(key);
    if (id === undefined) { id = states.length; ids.set(key, id); states.push({ xMask: 0n, pair: state.pair }); }
    occurrenceIds.push(id);
  }
  return { states, occurrenceIds };
}

export function packFactoredFixture(fixture, shape) {
  assert(shape.factored);
  const { states, occurrenceIds } = factorOqsFixture(fixture);
  const data = packOqsFixture({ ...fixture, states }, shape);
  assert(fixture.states.length <= shape.occurrenceCapacity);
  assert(fixture.candidates.length <= shape.mappedCapacity);
  data.activeOccurrenceCount[0] = fixture.states.length;
  fixture.states.forEach((s, i) => {
    assert(s.xMask >= 0n && s.xMask < 1n << 42n);
    data.occurrenceXLo[i] = Number(s.xMask & 0xffff_ffffn);
    data.occurrenceXHi[i] = Number(s.xMask >> 32n);
    data.occurrenceResidualId[i] = occurrenceIds[i];
  });
  return data;
}

export function verifyFactoredOutput(fixture, output, shape) {
  assert.equal(output.mappedCount, fixture.candidates.length);
  const { states, occurrenceIds } = factorOqsFixture(fixture);
  assert.equal(output.count, states.length * fixture.inputs.length);
  const unpack = (lo, hi) => BigInt(lo) | (BigInt(hi) << 32n);
  const pairKey = pair => JSON.stringify([pair.wins.map(String).sort(), pair.losses.map(String).sort()]);
  const payloadKeys = new Map(); const expectedKeys = new WeakMap(); const targetKeys = new Set();
  const expectedKey = pair => {
    let key = expectedKeys.get(pair);
    if (key === undefined) { key = pairKey(pair); expectedKeys.set(pair, key); }
    return key;
  };
  fixture.candidates.forEach((candidate, i) => {
    assert.equal(output.mappedStatus[i], 0);
    const x = unpack(output.mappedXLo[i], output.mappedXHi[i]);
    assert.equal(x, candidate.xMask);
    const slot = output.mappedResidualSlots[i];
    assert.equal(slot, occurrenceIds[Math.floor(i / fixture.inputs.length)] * fixture.inputs.length + i % fixture.inputs.length);
    if (!payloadKeys.has(slot)) {
      const pair = {};
      for (const side of ['Win', 'Loss']) {
        const count = output[`output${side}Counts`][slot];
        assert(count <= shape.frontierCapacity); assert.equal(output[`output${side}Status`][slot], 0);
        const masks = Array.from({ length: count }, (_, j) => unpack(output[`output${side}Lo`][slot * shape.frontierCapacity + j], output[`output${side}Hi`][slot * shape.frontierCapacity + j]));
        assert.equal(new Set(masks).size, count);
        pair[side === 'Win' ? 'wins' : 'losses'] = masks;
      }
      payloadKeys.set(slot, pairKey(pair));
    }
    assert.equal(payloadKeys.get(slot), expectedKey(candidate.pair));
    targetKeys.add(`${x}|${payloadKeys.get(slot)}`);
  });
  assert.equal(payloadKeys.size, output.count, 'every generated pair/input payload is referenced');
  assert.deepEqual(targetKeys, new Set(fixture.nextStates.map(s => `${s.xMask}|${expectedKey(s.pair)}`)));
}
