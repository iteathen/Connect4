import { ISOMETRIC_PROFILE } from './profile.mjs';
import { reflectGuard } from './guards.mjs';

export const CONCLUSION_EXACT_VALUE = 1;
export const CONCLUSION_FORCED_MOVE = 2;
export const CONCLUSION_NO_WIN = 3;
export const CONCLUSION_CELL_SET = 4;

export function exactValueConclusion(value, distance = null) {
  if (value !== -1 && value !== 0 && value !== 1) throw new RangeError('exact value must be -1, 0, or 1');
  if (distance !== null && (!Number.isInteger(distance) || distance < 0 || distance > 42)) {
    throw new RangeError('distance must be null or an integer in [0, 42]');
  }
  return Object.freeze({ kind: CONCLUSION_EXACT_VALUE, value, distance });
}

export function forcedMoveConclusion(cell) {
  if (!Number.isInteger(cell) || cell < 0 || cell >= ISOMETRIC_PROFILE.cellCount) throw new RangeError('forced move cell out of range');
  return Object.freeze({ kind: CONCLUSION_FORCED_MOVE, cell });
}

export function noWinConclusion(player) {
  if (player !== 0 && player !== 1) throw new RangeError('no-win player must be 0 or 1');
  return Object.freeze({ kind: CONCLUSION_NO_WIN, player });
}

export function cellSetConclusion(player, lo, hi) {
  if (player !== 0 && player !== 1) throw new RangeError('cell-set player must be 0 or 1');
  return Object.freeze({ kind: CONCLUSION_CELL_SET, player, lo: lo >>> 0, hi: hi >>> 0 });
}

export function reflectConclusion(conclusion) {
  if (!conclusion || typeof conclusion !== 'object') throw new TypeError('conclusion must be a typed conclusion record');
  switch (conclusion.kind) {
    case CONCLUSION_EXACT_VALUE:
    case CONCLUSION_NO_WIN:
      return conclusion;
    case CONCLUSION_FORCED_MOVE:
      return forcedMoveConclusion(ISOMETRIC_PROFILE.reflectCell(conclusion.cell));
    case CONCLUSION_CELL_SET: {
      const [lo, hi] = ISOMETRIC_PROFILE.reflectMaskPair(conclusion.lo, conclusion.hi);
      return cellSetConclusion(conclusion.player, lo, hi);
    }
    default:
      throw new RangeError(`unknown conclusion kind: ${conclusion.kind}`);
  }
}

export function canonicalizeCertificatePayload(guard, conclusion, orientation) {
  if (orientation === 0) return { guard, conclusion };
  if (orientation !== 1) throw new RangeError('orientation must be 0 or 1');
  const canonicalGuard = reflectGuard(guard);
  if (canonicalGuard === null) {
    throw new Error('guard cannot be transported through horizontal reflection yet');
  }
  return { guard: canonicalGuard, conclusion: reflectConclusion(conclusion) };
}
