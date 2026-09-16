import { ISOMETRIC_PROFILE } from './profile.mjs';

export const GUARD_INAPPLICABLE = 0;
export const GUARD_APPLICABLE = 1;
export const GUARD_UNRESOLVED = -1;

export const GUARD_MASK = 1;
export const GUARD_TURN = 2;
export const GUARD_RANK = 3;
export const GUARD_ALL = 4;
export const GUARD_TEMPORAL = 5;
export const GUARD_RESOURCE = 6;
export const GUARD_REALIZABILITY = 7;

function u32(value = 0) {
  return value >>> 0;
}

export function maskGuard({
  supportAllLo = 0,
  supportAllHi = 0,
  supportNoneLo = 0,
  supportNoneHi = 0,
  playableAllLo = 0,
  playableAllHi = 0,
  playableNoneLo = 0,
  playableNoneHi = 0,
} = {}) {
  return Object.freeze({
    kind: GUARD_MASK,
    supportAllLo: u32(supportAllLo),
    supportAllHi: u32(supportAllHi),
    supportNoneLo: u32(supportNoneLo),
    supportNoneHi: u32(supportNoneHi),
    playableAllLo: u32(playableAllLo),
    playableAllHi: u32(playableAllHi),
    playableNoneLo: u32(playableNoneLo),
    playableNoneHi: u32(playableNoneHi),
  });
}

export function turnGuard(player) {
  if (player !== 0 && player !== 1) throw new RangeError('turn guard player must be 0 or 1');
  return Object.freeze({ kind: GUARD_TURN, player });
}

export function rankGuard({ min = 0, max = 42 } = {}) {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max > 42 || min > max) {
    throw new RangeError('rank guard requires 0 <= min <= max <= 42');
  }
  return Object.freeze({ kind: GUARD_RANK, min, max });
}

export function allGuards(...guards) {
  const flat = guards.flat().filter(Boolean);
  return Object.freeze({ kind: GUARD_ALL, guards: Object.freeze(flat) });
}

export function temporalGuard(payload) {
  return Object.freeze({ kind: GUARD_TEMPORAL, payload });
}

export function resourceGuard(payload) {
  return Object.freeze({ kind: GUARD_RESOURCE, payload });
}

export function realizabilityGuard(payload) {
  return Object.freeze({ kind: GUARD_REALIZABILITY, payload });
}

function maskView(state, orientation) {
  if (orientation === 0) {
    return {
      supportLo: state.supportLo >>> 0,
      supportHi: state.supportHi >>> 0,
      playableLo: state.playableLo >>> 0,
      playableHi: state.playableHi >>> 0,
    };
  }
  if (orientation !== 1) throw new RangeError('orientation must be 0 or 1');
  const [supportLo, supportHi] = ISOMETRIC_PROFILE.reflectMaskPair(state.supportLo, state.supportHi);
  const [playableLo, playableHi] = ISOMETRIC_PROFILE.reflectMaskPair(state.playableLo, state.playableHi);
  return { supportLo, supportHi, playableLo, playableHi };
}

function containsAll(actualLo, actualHi, requiredLo, requiredHi) {
  return (((actualLo & requiredLo) >>> 0) === (requiredLo >>> 0))
    && (((actualHi & requiredHi) >>> 0) === (requiredHi >>> 0));
}

function intersects(actualLo, actualHi, forbiddenLo, forbiddenHi) {
  return (((actualLo & forbiddenLo) >>> 0) !== 0) || (((actualHi & forbiddenHi) >>> 0) !== 0);
}

export function evaluateGuard(state, guard, orientation = 0) {
  if (!guard || typeof guard !== 'object') throw new TypeError('guard must be a typed guard record');
  switch (guard.kind) {
    case GUARD_MASK: {
      const view = maskView(state, orientation);
      if (!containsAll(view.supportLo, view.supportHi, guard.supportAllLo, guard.supportAllHi)) return GUARD_INAPPLICABLE;
      if (intersects(view.supportLo, view.supportHi, guard.supportNoneLo, guard.supportNoneHi)) return GUARD_INAPPLICABLE;
      if (!containsAll(view.playableLo, view.playableHi, guard.playableAllLo, guard.playableAllHi)) return GUARD_INAPPLICABLE;
      if (intersects(view.playableLo, view.playableHi, guard.playableNoneLo, guard.playableNoneHi)) return GUARD_INAPPLICABLE;
      return GUARD_APPLICABLE;
    }
    case GUARD_TURN:
      return state.sideToMove === guard.player ? GUARD_APPLICABLE : GUARD_INAPPLICABLE;
    case GUARD_RANK:
      return state.ply >= guard.min && state.ply <= guard.max ? GUARD_APPLICABLE : GUARD_INAPPLICABLE;
    case GUARD_ALL: {
      let sawUnresolved = false;
      for (const child of guard.guards) {
        const result = evaluateGuard(state, child, orientation);
        if (result === GUARD_INAPPLICABLE) return GUARD_INAPPLICABLE;
        if (result === GUARD_UNRESOLVED) sawUnresolved = true;
      }
      return sawUnresolved ? GUARD_UNRESOLVED : GUARD_APPLICABLE;
    }
    case GUARD_TEMPORAL:
    case GUARD_RESOURCE:
    case GUARD_REALIZABILITY:
      return GUARD_UNRESOLVED;
    default:
      throw new RangeError(`unknown guard kind: ${guard.kind}`);
  }
}

export function reflectGuard(guard) {
  if (!guard || typeof guard !== 'object') throw new TypeError('guard must be a typed guard record');
  switch (guard.kind) {
    case GUARD_MASK: {
      const [supportAllLo, supportAllHi] = ISOMETRIC_PROFILE.reflectMaskPair(guard.supportAllLo, guard.supportAllHi);
      const [supportNoneLo, supportNoneHi] = ISOMETRIC_PROFILE.reflectMaskPair(guard.supportNoneLo, guard.supportNoneHi);
      const [playableAllLo, playableAllHi] = ISOMETRIC_PROFILE.reflectMaskPair(guard.playableAllLo, guard.playableAllHi);
      const [playableNoneLo, playableNoneHi] = ISOMETRIC_PROFILE.reflectMaskPair(guard.playableNoneLo, guard.playableNoneHi);
      return maskGuard({
        supportAllLo,
        supportAllHi,
        supportNoneLo,
        supportNoneHi,
        playableAllLo,
        playableAllHi,
        playableNoneLo,
        playableNoneHi,
      });
    }
    case GUARD_TURN:
    case GUARD_RANK:
      return guard;
    case GUARD_ALL: {
      const reflected = [];
      for (const child of guard.guards) {
        const value = reflectGuard(child);
        if (value === null) return null;
        reflected.push(value);
      }
      return allGuards(reflected);
    }
    case GUARD_TEMPORAL:
    case GUARD_RESOURCE:
    case GUARD_REALIZABILITY:
      return null;
    default:
      throw new RangeError(`unknown guard kind: ${guard.kind}`);
  }
}
