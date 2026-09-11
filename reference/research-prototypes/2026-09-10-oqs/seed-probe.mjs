import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';

const sourceUrl = new URL('../../../components/bsfp/ownership-antichain-solver.mjs', import.meta.url);

/** Research-only observation of the actual reference implementation. No copied
 * solver or modified recurrence. A thrown boundary never returns a root result. */
export async function loadSeedProbe() {
  const original = readFileSync(sourceUrl, 'utf8').replaceAll('\r\n', '\n');
  const sourceSha256 = createHash('sha256').update(original).digest('hex');
  let source = original;
  const replace = (from, to) => {
    assert.equal(source.split(from).length, 2, `seed probe lost unique seam: ${from}`);
    source = source.replace(from, to);
  };
  for (const file of ['geometry.mjs', 'support-lattice.mjs']) replace(`'./${file}'`, JSON.stringify(new URL(file, sourceUrl).href));
  source = 'let probe;\n' + source;
  replace('solveBsfpOwnershipAntichainWdl({ columns, rows, connect }) {',
    'solveBsfpOwnershipAntichainWdl({ columns, rows, connect }, observation) {\n  probe = observation;');
  replace('for (let rank = support.maxRank; rank >= 0; rank -= 1) {',
    'for (let rank = support.maxRank; rank >= 0; rank -= 1) {\n    probe.rank(rank);');
  replace('const heights = support.decodeHeights(supportIndex);',
    'probe.begin({ rank, supportIndex });\n      const heights = support.decodeHeights(supportIndex);');
  replace('maximumLossFrontier = Math.max(maximumLossFrontier, losses.length);',
    'maximumLossFrontier = Math.max(maximumLossFrontier, losses.length);\n      probe.complete({ rank, supportIndex, heights: [...heights], wins, losses });');
  for (const direction of ['false', 'true']) replace(`const ordered = orderedUnique(masks, ${direction});`,
    `probe.normalize(masks.length);\n  const ordered = orderedUnique(masks, ${direction});`);
  for (const op of ['|', '&']) replace(`for (const a of left) for (const b of right) result.push(a ${op} b);`,
    `probe.product(left.length, right.length);\n  for (const a of left) for (const b of right) result.push(a ${op} b);`);
  const module = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${randomUUID()}`);
  return { solve: module.solveBsfpOwnershipAntichainWdl, sourceSha256 };
}

export class ProbeBoundary extends Error {
  constructor(kind, detail) { super(kind); this.kind = kind; this.detail = detail; }
}
