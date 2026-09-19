import { STATUS_ONGOING } from '../domain/index.mjs';
import { exactValueConclusion, forcedMoveConclusion } from './certificate.mjs';

function firstCell(lo, hi) {
  // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
  // Keep direct bit indexing with the +32 high-word offset; no cell list or string conversion.
  // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
  if (lo !== 0) return 31 - Math.clz32((lo & -lo) >>> 0);
  if (hi !== 0) return 32 + 31 - Math.clz32((hi & -hi) >>> 0);
  return -1;
}

// Numeric worker ABI: zero = unresolved; exact value = (code & 3) - 2;
// bits 2..4 retain the consequence kind/distance; 64 + cell = forced move.
// The public proof-facing view uses immutable, module-preloaded conclusions.
const conclusions = new Array(106).fill(null);
for (let value = -1; value <= 1; value++) {
  conclusions[value + 2] = exactValueConclusion(value, 0);
  conclusions[8 + value + 2] = exactValueConclusion(value, 1);
  conclusions[16 + value + 2] = exactValueConclusion(value, 2);
}
conclusions[6] = exactValueConclusion(0, null);
for (let cell = 0; cell < 42; cell++) conclusions[64 + cell] = forcedMoveConclusion(cell);

export function nativeFrontierCode(state) {
  // OWNER-PROTECTED HOT-PATH — do not remove/weaken this or adjacent comments.
  // Return scalar codes; proof-facing objects are preloaded above, never
  // constructed/frozen per node. Keep the zero/one/multiple bit classification,
  // separate 32-bit halves, and own-win precedence. A full popcount or repeated
  // semantic validation here needs measured justification, not convenience.
  if (state.status !== STATUS_ONGOING) {
    const winner = state.winner();
    return winner === null ? 2 : winner === 0 ? 3 : 1;
  }
  if (state.p0Class === state.pool.emptyClass && state.p1Class === state.pool.emptyClass) return 6;

  const ownClass = state.sideToMove === 0 ? state.p0Class : state.p1Class;
  const opponentClass = state.sideToMove === 0 ? state.p1Class : state.p0Class;
  const ownLo = (state.pool.singletonLo[ownClass] & state.playableLo) >>> 0;
  const ownHi = (state.pool.singletonHi[ownClass] & state.playableHi) >>> 0;
  if ((ownLo | ownHi) !== 0) {
    return state.sideToMove === 0 ? 11 : 9;
  }

  const opponentLo = (state.pool.singletonLo[opponentClass] & state.playableLo) >>> 0;
  const opponentHi = (state.pool.singletonHi[opponentClass] & state.playableHi) >>> 0;
  if ((opponentLo | opponentHi) === 0) return 0;
  // Only zero / one / multiple matters. Preserve separate halves: OR-ing them
  // before the single-bit test would conflate cell 0 with cell 32.
  if ((opponentLo !== 0 && opponentHi !== 0) ||
      (opponentLo & (opponentLo - 1)) !== 0 || (opponentHi & (opponentHi - 1)) !== 0)
    return state.sideToMove === 0 ? 17 : 19;
  return 64 + firstCell(opponentLo, opponentHi);
}

export function deriveNativeFrontierConsequence(state) {
  // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
  // Return the preloaded immutable view; ordinary recursion consumes nativeFrontierCode directly.
  // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
  return conclusions[nativeFrontierCode(state)];
}
