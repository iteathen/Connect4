import fs from 'node:fs';

// Benchmark-only fixed-order control. Production singleton ordering is the
// source of truth; remove only its ordering loop prefix. Fail if it drifts.
export async function loadFixedControlSolver() {
  const url = new URL('../../components/isometric/solver.mjs', import.meta.url);
  let source = fs.readFileSync(url, 'utf8').replaceAll('\r\n', '\n');
  const distributionHook = `    // Corrected #102 boundary: a distributed worker may expose surplus branch
    // opportunities here while preserving one current continuation in native
    // recursion. Canonical q is reconciliation identity, not a mandatory task
    // boundary. The ordinary production profile keeps branchDistributor null.
    if (this.branchDistributor !== null) {
      best = this.branchDistributor.solveChildren(
        this, state, maximizing, lower, upper, promoted,
      );
      this.assertNoWinBounds(best, p0NoWin, p1NoWin);
      this.storeExact(key0, key1, support, hash, best);
      return best;
    }

`;
  if (source.split(distributionHook).length !== 2) throw new Error('solver distribution seam changed; review fixed control');
  source = source.replace(distributionHook, '');
  const ordered = `    const promoted = state.ply > this.orderingRootPly ? promotedColumn(state) : -1;
    if (promoted >= 0) this.metrics.orderingPromotions++;
    for (let orderIndex = promoted >= 0 ? -1 : 0; orderIndex < MOVE_ORDER.length; orderIndex++) {
      const column = orderIndex === -1 ? promoted : MOVE_ORDER[orderIndex];
      if (orderIndex >= 0 && column === promoted) continue;`;
  if (source.split(ordered).length !== 2) throw new Error('solver ordering seam changed; review fixed control');
  source = source.replace(ordered, '    for (const column of MOVE_ORDER) {');
  source = source.replace(/from '(\.[^']+)'/g, (_, relative) => `from '${new URL(relative, url).href}'`);
  return (await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))).IsoMaxSolver;
}
