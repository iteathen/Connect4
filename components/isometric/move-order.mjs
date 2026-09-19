import { ISOMETRIC_PROFILE as profile } from './profile.mjs';

export const CENTER_ORDER = Object.freeze([3, 2, 4, 1, 5, 0, 6]);
// Compile incidence once from the native WSL vocabulary. No board, class
// interning, speculative play/undo, or maintained per-state metadata.
const pairs = Array.from({ length: 42 }, () => []);
for (let id = 0; id < profile.count; id++) {
  if (profile.cardinality[id] !== 2) continue;
  const cells = [];
  for (let cell = 0; cell < 42; cell++) {
    if (cell < 32 ? (profile.lo[id] >>> cell) & 1 : (profile.hi[id] >>> (cell - 32)) & 1) cells.push(cell);
  }
  for (let i = 0; i < 2; i++) pairs[cells[i]].push({ word: id >>> 5, mask: 1 << (id & 31), other: cells[1-i] });
}

// Precondition: quiet ongoing node, after native exact/forced closure.
// Return the accepted advisory class only; this never supplies a WDL bound.
export function singletonEffectClass(state, column) {
  const cell = state.heights[column] * 7 + column;
  const above = cell + 7;
  const own = state.sideToMove === 0 ? state.p0Class : state.p1Class;
  const opponent = state.sideToMove === 0 ? state.p1Class : state.p0Class;
  if (above < 42 && state.pool.hasSingletonAt(opponent, above)) return 0;
  let first = above < 42 && state.pool.hasSingletonAt(own, above) ? above : -1;
  for (let i = 0; i < pairs[cell].length; i++) {
    const pair = pairs[cell][i];
    if ((state.pool.wordAt(own, pair.word) & pair.mask) === 0) continue;
    const other = pair.other;
    const playable = other === above || (other < 32
      ? (state.playableLo >>> other) & 1
      : (state.playableHi >>> (other - 32)) & 1);
    if (!playable || other === first) continue;
    if (first >= 0) return 2;
    first = other;
  }
  return first >= 0 ? 1 : 0;
}

export function promotedColumn(state) {
  let bestClass = 0, bestColumn = -1;
  for (let index = 0; index < CENTER_ORDER.length; index++) {
    const column = CENTER_ORDER[index];
    if (state.heights[column] === 6) continue;
    const effect = singletonEffectClass(state, column);
    if (effect > bestClass) {
      bestClass = effect;
      bestColumn = column;
      if (effect === 2) break;
    }
  }
  return bestColumn;
}
