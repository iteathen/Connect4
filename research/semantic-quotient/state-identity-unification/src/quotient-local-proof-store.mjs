import { assertWdlValue } from './quotient-negamax-domain-contract.mjs';

const INITIAL_CAPACITY = 1024;

function nextPowerOfTwo(value) {
  let result = 1;
  while (result < value) result *= 2;
  return result;
}

export function createLocalQuotientProofStore(states) {
  if (!states || !Number.isInteger(states.columns) || states.columns < 1 || states.columns > 7) {
    throw new TypeError('local quotient proof store requires a state pool with 1..7 columns');
  }

  let capacity = 0;
  let lowerBounds = null;
  let upperBounds = null;
  let bestMoves = null;
  const metrics = {
    reads: 0,
    publications: 0,
    noops: 0,
    grows: 0,
    capacity: 0,
    retainedTypedBytes: 0,
  };

  function refreshMetrics() {
    metrics.capacity = capacity;
    metrics.retainedTypedBytes = (lowerBounds?.byteLength ?? 0)
      + (upperBounds?.byteLength ?? 0)
      + (bestMoves?.byteLength ?? 0);
  }

  function assertStateId(stateId) {
    if (!Number.isInteger(stateId) || stateId < 0 || stateId >= states.count) {
      throw new RangeError(`local proof state id ${stateId} is outside current state count ${states.count}`);
    }
  }

  function assertBestMove(bestMoveValue) {
    if (!Number.isInteger(bestMoveValue) || bestMoveValue < -1 || bestMoveValue >= states.columns) {
      throw new RangeError(`local proof best move must be -1..${states.columns - 1}, got ${bestMoveValue}`);
    }
  }

  function ensureCapacity(required) {
    if (required <= capacity) return;
    const next = nextPowerOfTwo(Math.max(required, INITIAL_CAPACITY));
    const lower = new Int8Array(next);
    const upper = new Int8Array(next);
    const best = new Int8Array(next);
    lower.fill(-1);
    upper.fill(1);
    best.fill(-1);
    if (capacity > 0) {
      lower.set(lowerBounds);
      upper.set(upperBounds);
      best.set(bestMoves);
    }
    lowerBounds = lower;
    upperBounds = upper;
    bestMoves = best;
    capacity = next;
    metrics.grows += 1;
    refreshMetrics();
  }

  function ensureState(stateId) {
    assertStateId(stateId);
    ensureCapacity(stateId + 1);
  }

  function lower(stateId) {
    ensureState(stateId);
    metrics.reads += 1;
    return lowerBounds[stateId];
  }

  function upper(stateId) {
    ensureState(stateId);
    metrics.reads += 1;
    return upperBounds[stateId];
  }

  function bestMove(stateId) {
    ensureState(stateId);
    metrics.reads += 1;
    return bestMoves[stateId];
  }

  function writeHint(stateId, bestMoveValue) {
    assertBestMove(bestMoveValue);
    if (bestMoveValue >= 0) bestMoves[stateId] = bestMoveValue;
  }

  function publishExact(stateId, value, bestMoveValue = -1) {
    ensureState(stateId);
    assertWdlValue(value, 'local exact proof');
    assertBestMove(bestMoveValue);
    const nextLower = Math.max(lowerBounds[stateId], value);
    const nextUpper = Math.min(upperBounds[stateId], value);
    if (nextLower > nextUpper) {
      throw new Error(
        `contradictory local exact proof for state ${stateId}: `
        + `[${lowerBounds[stateId]}, ${upperBounds[stateId]}] vs ${value}`,
      );
    }
    const changed = nextLower !== lowerBounds[stateId]
      || nextUpper !== upperBounds[stateId]
      || (bestMoveValue >= 0 && bestMoves[stateId] !== bestMoveValue);
    lowerBounds[stateId] = nextLower;
    upperBounds[stateId] = nextUpper;
    writeHint(stateId, bestMoveValue);
    if (changed) metrics.publications += 1;
    else metrics.noops += 1;
    return changed;
  }

  function publishLower(stateId, value, bestMoveValue = -1) {
    ensureState(stateId);
    assertWdlValue(value, 'local lower proof');
    assertBestMove(bestMoveValue);
    const nextLower = Math.max(lowerBounds[stateId], value);
    if (nextLower > upperBounds[stateId]) {
      throw new Error(
        `contradictory local lower proof for state ${stateId}: `
        + `${nextLower} > ${upperBounds[stateId]}`,
      );
    }
    const changed = nextLower !== lowerBounds[stateId]
      || (bestMoveValue >= 0 && bestMoves[stateId] !== bestMoveValue);
    lowerBounds[stateId] = nextLower;
    writeHint(stateId, bestMoveValue);
    if (changed) metrics.publications += 1;
    else metrics.noops += 1;
    return changed;
  }

  function publishUpper(stateId, value, bestMoveValue = -1) {
    ensureState(stateId);
    assertWdlValue(value, 'local upper proof');
    assertBestMove(bestMoveValue);
    const nextUpper = Math.min(upperBounds[stateId], value);
    if (lowerBounds[stateId] > nextUpper) {
      throw new Error(
        `contradictory local upper proof for state ${stateId}: `
        + `${lowerBounds[stateId]} > ${nextUpper}`,
      );
    }
    const changed = nextUpper !== upperBounds[stateId]
      || (bestMoveValue >= 0 && bestMoves[stateId] !== bestMoveValue);
    upperBounds[stateId] = nextUpper;
    writeHint(stateId, bestMoveValue);
    if (changed) metrics.publications += 1;
    else metrics.noops += 1;
    return changed;
  }

  function publishHint(stateId, bestMoveValue) {
    ensureState(stateId);
    assertBestMove(bestMoveValue);
    if (bestMoveValue < 0 || bestMoves[stateId] === bestMoveValue) {
      metrics.noops += 1;
      return false;
    }
    bestMoves[stateId] = bestMoveValue;
    metrics.publications += 1;
    return true;
  }

  function reset() {
    lowerBounds = null;
    upperBounds = null;
    bestMoves = null;
    capacity = 0;
    refreshMetrics();
  }

  function memoryStats() {
    return Object.freeze({
      capacity,
      retainedTypedBytes: metrics.retainedTypedBytes,
      bytesPerAdmittedState: capacity > 0 ? 3 : 0,
    });
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
    memoryStats,
    metrics,
  });
}
