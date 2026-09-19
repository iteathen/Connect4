import fs from 'node:fs';

// Benchmark-only fixed-order control. Production singleton ordering is the
// source of truth; remove only its ordering loop prefix. Fail if it drifts.
export async function loadFixedControlSolver() {
  const url = new URL('../../components/isometric/solver.mjs', import.meta.url);
  let source = fs.readFileSync(url, 'utf8').replaceAll('\r\n', '\n');
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
