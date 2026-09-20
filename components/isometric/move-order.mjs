import { ISOMETRIC_PROFILE as profile } from './profile.mjs';

export const CENTER_ORDER = Object.freeze([3, 2, 4, 1, 5, 0, 6]);
// Compile incidence once from the native WSL vocabulary. No board, class
// interning, speculative play/undo, or maintained per-state metadata.
// OWNER-PROTECTED PRELOAD — do not remove/weaken this comment.
// Temporary objects below exist only during module initialization; the actual
// classifier consumes fixed numeric arrays. Preserve term/column tie order.
const pairStart = new Uint16Array(43);
let pairWord, pairMask, pairOther;
{
  const pairs = Array.from({ length: 42 }, () => []);
  for (let id = 0; id < profile.count; id++) {
    if (profile.cardinality[id] !== 2) continue;
    const cells = [];
    for (let cell = 0; cell < 42; cell++) {
      if (cell < 32 ? (profile.lo[id] >>> cell) & 1 : (profile.hi[id] >>> (cell - 32)) & 1) cells.push(cell);
    }
    for (let i = 0; i < 2; i++) pairs[cells[i]].push({ word: id >>> 5, mask: 1 << (id & 31), other: cells[1-i] });
  }
  let length = 0;
  for (let cell = 0; cell < 42; cell++) { pairStart[cell] = length; length += pairs[cell].length; }
  if (length > 65535) throw new RangeError('pair incidence offset exceeds profile width');
  pairStart[42] = length;
  pairWord = new Uint8Array(length); pairMask = new Uint32Array(length); pairOther = new Uint8Array(length);
  for (let cell = 0; cell < 42; cell++) for (let i = 0; i < pairs[cell].length; i++) {
    const target = pairStart[cell] + i, pair = pairs[cell][i];
    pairWord[target] = pair.word; pairMask[target] = pair.mask; pairOther[target] = pair.other;
  }
}

// Precondition: quiet ongoing node, after native exact/forced closure.
// Return the accepted advisory class only; this never supplies a WDL bound.
export function singletonEffectClass(state, column) {
  // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
  // Scan precompiled incidence numerically; preserve exposure veto and completion-cell deduplication. No child simulation or allocating score records.
  // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
  const cell = state.heights[column] * 7 + column;
  const above = cell + 7;
  const own = state.sideToMove === 0 ? state.p0Class : state.p1Class;
  const opponent = state.sideToMove === 0 ? state.p1Class : state.p0Class;
  if (above < 42 && state.pool.hasSingletonAt(opponent, above)) return 0;
  let first = above < 42 && state.pool.hasSingletonAt(own, above) ? above : -1;
  // OWNER-PROTECTED WORD REUSE — incidence is prepared in term-ID order.
  // Reuse only consecutive equal word indices; no state cache or allocation.
  // The class is immutable for this synchronous classifier invocation.
  let currentWord = -1, currentBits = 0;
  for (let i = pairStart[cell]; i < pairStart[cell + 1]; i++) {
    const word = pairWord[i];
    if (word !== currentWord) {
      currentWord = word;
      currentBits = state.pool.wordAt(own, word);
    }
    if ((currentBits & pairMask[i]) === 0) continue;
    const other = pairOther[i];
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
  // OWNER-PROTECTED HOT-PATH — do not remove/weaken this or adjacent comments.
  // Incidence is precompiled; scan by numeric index, without iterators,
  // callbacks, sorting, child materialization or speculative play/undo.
  // The caller established quiet ongoing status and columns are prevalidated.
  // Preserve the research-qualified advisory order and external-root scope;
  // ordering supplies no WDL proof. Measure any replacement in real recursion.
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
