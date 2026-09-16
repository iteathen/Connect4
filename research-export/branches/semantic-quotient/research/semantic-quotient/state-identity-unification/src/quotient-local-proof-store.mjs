export function createLocalQuotientProofStore(states) {
  function lower(stateId) {
    return states.lower[stateId];
  }

  function upper(stateId) {
    return states.upper[stateId];
  }

  function bestMove(stateId) {
    return states.bestMove[stateId];
  }

  function publishExact(stateId, value, bestMoveValue = -1) {
    states.lower[stateId] = value;
    states.upper[stateId] = value;
    if (bestMoveValue >= 0) states.bestMove[stateId] = bestMoveValue;
  }

  function publishLower(stateId, value, bestMoveValue = -1) {
    states.lower[stateId] = Math.max(states.lower[stateId], value);
    if (bestMoveValue >= 0) states.bestMove[stateId] = bestMoveValue;
  }

  function publishUpper(stateId, value, bestMoveValue = -1) {
    states.upper[stateId] = Math.min(states.upper[stateId], value);
    if (bestMoveValue >= 0) states.bestMove[stateId] = bestMoveValue;
  }

  function publishHint(stateId, bestMoveValue) {
    if (bestMoveValue >= 0) states.bestMove[stateId] = bestMoveValue;
  }

  return Object.freeze({
    lower,
    upper,
    bestMove,
    publishExact,
    publishLower,
    publishUpper,
    publishHint,
  });
}
