import test from 'node:test';
import assert from 'node:assert/strict';
import { loadManagerCandidate } from './scheduler-candidates.mjs';

test('every scheduler candidate admits the actual checked-out sources', async () => {
  for (const variant of ['control', 'rank2', 'rank3', 'fanin', 'affinity', 'affinity-survey', 'rank-quantum', 'survey']) {
    const loaded = await loadManagerCandidate(variant);
    assert.equal(typeof loaded.IsoMaxBranchManager, 'function', variant);
    assert.match(loaded.sourceHash, /^[a-f0-9]{64}$/);
    assert.match(loaded.candidateHash, /^[a-f0-9]{64}$/);
  }
});
