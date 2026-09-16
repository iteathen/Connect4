import { STATUS_ONGOING } from '../domain/index.mjs';
import { exactValueConclusion, forcedMoveConclusion } from './certificate.mjs';

function popcount32(value) {
  let x = value >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

function countMask(lo, hi) {
  return popcount32(lo) + popcount32(hi);
}

function firstCell(lo, hi) {
  if (lo !== 0) return 31 - Math.clz32((lo & -lo) >>> 0);
  if (hi !== 0) return 32 + 31 - Math.clz32((hi & -hi) >>> 0);
  return -1;
}

export function deriveNativeFrontierConsequence(state) {
  if (state.status !== STATUS_ONGOING) {
    const winner = state.winner();
    return exactValueConclusion(winner === null ? 0 : winner === 0 ? 1 : -1, 0);
  }
  if (state.hasStructuralDrawCertificate()) return exactValueConclusion(0, null);

  const ownClass = state.sideToMove === 0 ? state.p0Class : state.p1Class;
  const opponentClass = state.sideToMove === 0 ? state.p1Class : state.p0Class;
  const ownLo = (state.pool.singletonLo[ownClass] & state.playableLo) >>> 0;
  const ownHi = (state.pool.singletonHi[ownClass] & state.playableHi) >>> 0;
  if ((ownLo | ownHi) !== 0) {
    return exactValueConclusion(state.sideToMove === 0 ? 1 : -1, 1);
  }

  const opponentLo = (state.pool.singletonLo[opponentClass] & state.playableLo) >>> 0;
  const opponentHi = (state.pool.singletonHi[opponentClass] & state.playableHi) >>> 0;
  const opponentThreats = countMask(opponentLo, opponentHi);
  if (opponentThreats >= 2) return exactValueConclusion(state.sideToMove === 0 ? -1 : 1, 2);
  if (opponentThreats === 1) return forcedMoveConclusion(firstCell(opponentLo, opponentHi));
  return null;
}