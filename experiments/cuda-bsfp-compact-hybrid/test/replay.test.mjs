import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readReplayFixture } from '../replay.mjs';
import { fixtureDigest } from '../overflow-capture.mjs';
import { readCompactHybridOptions } from '../run.mjs';

test('real overflow fixtures preserve provenance and enforce content/capacity validation', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bsfp-fixture-'));
  try {
    const file = path.join(root, 'fixture.json');
    const payload = { schemaVersion: 1, geometry: { columns: 7, rows: 6, connect: 4 }, direction: 0,
      source: { revision: 'capture', dirty: false }, left: [1], right: [2] };
    fs.writeFileSync(file, JSON.stringify({ payload, sha256: fixtureDigest(payload) }));
    assert.equal(readReplayFixture(file).payload.left[0], 1);
    fs.writeFileSync(file, JSON.stringify({ payload: { ...payload, left: [3] }, sha256: fixtureDigest(payload) }));
    assert.throws(() => readReplayFixture(file), /hash mismatch/);
    const tooLarge = { ...payload, left: Array(2049).fill(1), right: Array(2049).fill(2) };
    fs.writeFileSync(file, JSON.stringify({ payload: tooLarge, sha256: fixtureDigest(tooLarge) }));
    assert.throws(() => readReplayFixture(file), /batch bound/);
  } finally { fs.rmSync(root, { recursive: true }); }
});

test('P2 explicitly selects the measured overflow executor, with Tensor retained', () => {
  assert.equal(readCompactHybridOptions({}).reducer.overflowExecutor, 'packed');
  assert.equal(readCompactHybridOptions({}).reducer.packedStrategy, 'bucketed-cardinality-v0');
  assert.throws(() => readCompactHybridOptions({ BSFP_HYBRID_PACKED_STRATEGY: 'bucketed-dedup-first-v0' }), /Unsupported/);
  assert.equal(readCompactHybridOptions({ BSFP_HYBRID_OVERFLOW_EXECUTOR: 'tensor' }).reducer.overflowExecutor, 'tensor');
  assert.throws(() => readCompactHybridOptions({ BSFP_HYBRID_OVERFLOW_EXECUTOR: 'auto' }), /must be tensor or packed/);
});
