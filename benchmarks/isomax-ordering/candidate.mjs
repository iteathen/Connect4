import fs from 'node:fs';
import { ISOMETRIC_PROFILE as profile } from '../../components/isometric/profile.mjs';

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
  for (const column of CENTER_ORDER) {
    if (!state.canPlay(column)) continue;
    const effect = singletonEffectClass(state, column);
    if (effect > bestClass) {
      bestClass = effect;
      bestColumn = column;
      if (effect === 2) break;
    }
  }
  return bestColumn;
}

// Experiment-only substitution, asserted against the current source shape.
// Production files remain untouched; all other solver code is identical.
// Import URLs exist only in memory and are never serialized into evidence.
export async function loadCandidateSolver() {
  const url = new URL('../../components/isometric/solver.mjs', import.meta.url);
  let source = fs.readFileSync(url, 'utf8').replaceAll('\r\n', '\n');
  const before = '    for (const column of MOVE_ORDER) {\n      if (!state.canPlay(column)) continue;\n      sawMove = true;';
  if (source.split(before).length !== 2) throw new Error('solver ordering seam changed; review candidate substitution');
  source = source.replace(before, `    const promoted = state.ply > this.orderingRootPly ? promotedColumn(state) : -1;
    if (promoted >= 0) this.orderingPromotions++;
    for (let orderIndex = promoted >= 0 ? -1 : 0; orderIndex < MOVE_ORDER.length; orderIndex++) {
      const column = orderIndex === -1 ? promoted : MOVE_ORDER[orderIndex];
      if (orderIndex >= 0 && column === promoted) continue;
      if (!state.canPlay(column)) continue;
      sawMove = true;`);
  source = source.replace(/from '(\.[^']+)'/g, (_, relative) => `from '${new URL(relative, url).href}'`);
  source = `import { promotedColumn } from '${import.meta.url}';\n` + source;
  const { IsoMaxSolver } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  return class SingletonOrderedSolver extends IsoMaxSolver {
    solveValue(state) {
      this.orderingRootPly = state.ply;
      this.orderingPromotions = 0;
      return super.solveValue(state);
    }
    solve(state) {
      this.orderingRootPly = state.ply;
      this.orderingPromotions = 0;
      return super.solve(state);
    }
  };
}
