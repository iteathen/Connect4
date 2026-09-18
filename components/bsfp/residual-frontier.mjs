import { createResidualState, residualStateAtLeastAsFavorableToP0 } from './residual-winspace.mjs';

function frontierArray(frontier, label) {
  if (!Array.isArray(frontier)) throw new TypeError(`${label} must be an array of residual states`);
  return frontier;
}

function comparableFrontier(frontier, state, label) {
  const normalizedState = createResidualState(state);
  for (let index = 0; index < frontier.length; index += 1) {
    const entry = createResidualState(frontier[index]);
    if (entry.supportIndex !== normalizedState.supportIndex || entry.sideToMove !== normalizedState.sideToMove) {
      throw new RangeError(`${label} contains a state from a different support/turn context`);
    }
  }
  return normalizedState;
}

/** Upward-closed P0-win region: a minimal winning boundary covers stronger states. */
export function p0WinFrontierCovers(frontier, state) {
  const entries = frontierArray(frontier, 'frontier');
  const candidate = comparableFrontier(entries, state, 'frontier');
  return entries.some((boundary) => residualStateAtLeastAsFavorableToP0(candidate, boundary));
}

/** Downward-closed P0-loss region: a maximal losing boundary covers weaker states. */
export function p0LossFrontierCovers(frontier, state) {
  const entries = frontierArray(frontier, 'frontier');
  const candidate = comparableFrontier(entries, state, 'frontier');
  return entries.some((boundary) => residualStateAtLeastAsFavorableToP0(boundary, candidate));
}

export function insertP0WinFrontier(frontier, state) {
  const entries = frontierArray(frontier, 'frontier');
  const candidate = comparableFrontier(entries, state, 'frontier');
  if (entries.some((boundary) => residualStateAtLeastAsFavorableToP0(candidate, boundary))) {
    return Object.freeze(entries.slice());
  }
  const retained = entries.filter((boundary) => !residualStateAtLeastAsFavorableToP0(boundary, candidate));
  retained.push(candidate);
  return Object.freeze(retained);
}

export function insertP0LossFrontier(frontier, state) {
  const entries = frontierArray(frontier, 'frontier');
  const candidate = comparableFrontier(entries, state, 'frontier');
  if (entries.some((boundary) => residualStateAtLeastAsFavorableToP0(boundary, candidate))) {
    return Object.freeze(entries.slice());
  }
  const retained = entries.filter((boundary) => !residualStateAtLeastAsFavorableToP0(candidate, boundary));
  retained.push(candidate);
  return Object.freeze(retained);
}

export function createResidualWdlFrontierBucket({ supportIndex, sideToMove }) {
  const context = createResidualState({ supportIndex, sideToMove, p0Requirements: [], p1Requirements: [] });
  let wins = Object.freeze([]);
  let losses = Object.freeze([]);

  function assertContext(state) {
    const candidate = createResidualState(state);
    if (candidate.supportIndex !== context.supportIndex || candidate.sideToMove !== context.sideToMove) {
      throw new RangeError('frontier bucket state is outside its support/turn context');
    }
    return candidate;
  }

  return Object.freeze({
    kind: 'connect4-bsfp-residual-wdl-frontier-bucket',
    supportIndex: context.supportIndex,
    sideToMove: context.sideToMove,
    insertWin(state) {
      const candidate = assertContext(state);
      if (p0LossFrontierCovers(losses, candidate)) throw new Error('residual WDL frontier contradiction: state is already covered by Loss');
      wins = insertP0WinFrontier(wins, candidate);
      return wins.length;
    },
    insertLoss(state) {
      const candidate = assertContext(state);
      if (p0WinFrontierCovers(wins, candidate)) throw new Error('residual WDL frontier contradiction: state is already covered by Win');
      losses = insertP0LossFrontier(losses, candidate);
      return losses.length;
    },
    classify(state) {
      const candidate = assertContext(state);
      if (p0WinFrontierCovers(wins, candidate)) return 1;
      if (p0LossFrontierCovers(losses, candidate)) return -1;
      return null;
    },
    snapshot() {
      return Object.freeze({ wins: Object.freeze(wins.slice()), losses: Object.freeze(losses.slice()) });
    },
  });
}
