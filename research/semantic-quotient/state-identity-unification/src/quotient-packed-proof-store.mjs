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
    return Atomics.load(records, slot);
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

  function bounds(slot) {
    const record = load(slot);
    return Object.freeze({ lower: proofLower(record), upper: proofUpper(record) });
  }

  function bestMove(slot) {
    return bestMoveHint(load(slot));
  }

  function publishExact(slot, value, bestMoveValue = -1) {
    return update(slot, (record) => {
      const currentLower = proofLower(record);
      const currentUpper = proofUpper(record);
      const lower = Math.max(currentLower, value);
      const upper = Math.min(currentUpper, value);
      if (lower > upper) throw new Error(`contradictory exact proof publication at slot ${slot}`);
      let next = withProofBounds(record, lower, upper);
      if (bestMoveValue >= 0) next = withBestMoveHint(next, bestMoveValue);
      return next;
    });
  }

  function publishLower(slot, value, bestMoveValue = -1) {
    return update(slot, (record) => {
      const lower = Math.max(proofLower(record), value);
      const upper = proofUpper(record);
      if (lower > upper) throw new Error(`contradictory lower proof publication at slot ${slot}`);
      let next = withProofLower(record, lower);
      if (bestMoveValue >= 0) next = withBestMoveHint(next, bestMoveValue);
      return next;
    });
  }

  function publishUpper(slot, value, bestMoveValue = -1) {
    return update(slot, (record) => {
      const lower = proofLower(record);
      const upper = Math.min(proofUpper(record), value);
      if (lower > upper) throw new Error(`contradictory upper proof publication at slot ${slot}`);
      let next = withProofUpper(record, upper);
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
    bounds,
    bestMove,
    publishExact,
    publishLower,
    publishUpper,
    publishHint,
    reset,
    metrics,
  });
}
