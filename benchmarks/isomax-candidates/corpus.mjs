import assert from 'node:assert/strict';
import { Connect4Position, WINNING_LINES } from '../../components/domain/index.mjs';
import { makeCorpus, WORKLOADS as EVEN_WORKLOADS } from '../isomax-ordering/corpus.mjs';

// Qualification only. Select roots using physical line blocking, never solver
// output, runtime, class IDs or the candidate's exhaustion implementation.
export const WORKLOADS = [
  ...EVEN_WORKLOADS,
  ...[19,21,25,29].map(ply => ({ name:'quiet-ply'+ply, seed:0x80c4+ply, ply, count:8 })),
  ...[34,35].map(ply => ({ name:'one-sided-ply'+ply, seed:0x81c4+ply, ply, count:32, oneSided:true })),
];
export function physicalExhaustion(moves) {
  const position = new Connect4Position(moves);
  return [0,1].map(player => WINNING_LINES.every(line =>
    line.some(cell => position.cells[cell] === 2-player)));
}
export function makeCandidateCorpus(workload) {
  if (!workload.oneSided) return makeCorpus(workload);
  const roots = [], seen = new Set();
  for (let batch=0;batch<16 && roots.length<workload.count;batch++) {
    for (const root of makeCorpus({...workload,seed:workload.seed+batch*65537,count:512})) {
      const [p0,p1] = physicalExhaustion(root.moves);
      if (p0===p1 || seen.has(root.sequence)) continue;
      seen.add(root.sequence); roots.push(root);
      if (roots.length===workload.count) break;
    }
  }
  assert.equal(roots.length,workload.count,'insufficient independent exhaustion roots');
  return roots;
}
