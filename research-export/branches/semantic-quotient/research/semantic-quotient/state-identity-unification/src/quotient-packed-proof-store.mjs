import {
  INITIAL_SEARCH_RECORD,
  proofLower,
  proofUpper,
  bestMoveHint,
  withProofLower,
  withProofUpper,
  withBestMoveHint,
  withProofBounds,
} from './quotient-negamax-search-record.mjs';

export function createPackedProofStore(recordBuffer) {
  const records = new Uint8Array(recordBuffer);
  const metrics = {
    reads: 0,
    publications: 0,
    retries: 0,
  };

  function load(slot) {
    metrics.reads += 1;
    // Same-width shared-byte reads are non-tearing. A stale sound proof only
    // causes extra search work; publication uses CAS so stronger proof facts
    // cannot be lost by a competing writer.
    return records[slot];
  }

  function update(slot, transform) {
    while (true) {
      const current = Atomics.load(records, slot);
      const next = transform(current);
      if (next === current) return current;
      const observed = Atomics.compareExchange(records, slot, current, next);
      if (observed === current) {
        metrics.publications += 1;
        return next;
      }
      metrics.retries += 1;
    }
  }

  function lower(slot) {
    return proofLower(load(slot));
  }

  function upper(slot) {
    return proofUpper(load(slot));
  }

  function bestMove(slot) {
    return bestMoveHint(load(slot));
  }

  function publishExact(slot, value, bestMoveValue = -1) {
    return update(slot, (record) => {
      const currentLower = proofLower(record);
      const currentUpper = proofUpper(record);
      const nextLower = Math.max(currentLower, value);
      const nextUpper = Math.min(currentUpper, value);
      if (nextLower > nextUpper) throw new Error(`contradictory exact proof publication at slot ${slot}`);
      let next = withProofBounds(record, nextLower, nextUpper);
      if (bestMoveValue >= 0) next = withBestMoveHint(next, bestMoveValue);
      return next;
    });
  }

  function publishLower(slot, value, bestMoveValue = -1) {
    return update(slot, (record) => {
      const nextLower = Math.max(proofLower(record), value);
      const currentUpper = proofUpper(record);
      if (nextLower > currentUpper) throw new Error(`contradictory lower proof publication at slot ${slot}`);
      let next = withProofLower(record, nextLower);
      if (bestMoveValue >= 0) next = withBestMoveHint(next, bestMoveValue);
      return next;
    });
  }

  function publishUpper(slot, value, bestMoveValue = -1) {
    return update(slot, (record) => {
      const currentLower = proofLower(record);
      const nextUpper = Math.min(proofUpper(record), value);
      if (currentLower > nextUpper) throw new Error(`contradictory upper proof publication at slot ${slot}`);
      let next = withProofUpper(record, nextUpper);
      if (bestMoveValue >= 0) next = withBestMoveHint(next, bestMoveValue);
      return next;
    });
  }

  function publishHint(slot, bestMoveValue) {
    if (bestMoveValue < 0) return load(slot);
    return update(slot, (record) => withBestMoveHint(record, bestMoveValue));
  }

  function reset() {
    records.fill(INITIAL_SEARCH_RECORD);
  }

  return Object.freeze({
    lower,
    upper,
    bestMove,
    publishExact,
    publishLower,
    publishUpper,
    publishHint,
    reset,
    metrics,
  });
}
