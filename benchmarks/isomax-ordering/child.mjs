import fs from 'node:fs';
import { performance } from 'node:perf_hooks';
import { IsoMaxSolver } from '../../components/isometric/solver.mjs';
import { loadCandidateSolver } from './candidate.mjs';
import { makeCorpus, WORKLOADS } from './corpus.mjs';

const variant = process.argv[2];
if (!['fixed', 'singleton'].includes(variant)) throw new Error('expected fixed or singleton');
const Solver = variant === 'fixed' ? IsoMaxSolver : await loadCandidateSolver();
const emit = data => fs.writeSync(1, JSON.stringify(data) + '\n');
// Same untimed warmup for both variants, then fresh pool/cache per measured root.
for (const { moves } of makeCorpus({ seed: 17, ply: 34, count: 8 })) {
  const solver = new Solver(); solver.solve(solver.createState(moves));
}
for (const workload of WORKLOADS) {
  const corpus = makeCorpus(workload);
  let elapsedMs = 0, setupMs = 0, nodes = 0, promotions = 0;
  const decisions = [];
  for (const { sequence, moves } of corpus) {
    global.gc?.();
    let start = performance.now();
    const solver = new Solver(), state = solver.createState(moves);
    setupMs += performance.now() - start;
    start = performance.now();
    const result = solver.solve(state);
    const solveMs = performance.now() - start;
    elapsedMs += solveMs; nodes += result.metrics.nodes;
    promotions += solver.orderingPromotions ?? 0;
    decisions.push({ sequence, value: result.value, move: result.move });
    emit({ kind: 'root', variant, workload: workload.name, sequence, value: result.value,
      move: result.move, nodes: result.metrics.nodes, solveMs, promotions: solver.orderingPromotions ?? 0 });
  }
  emit({ kind: 'summary', variant, workload: workload.name, elapsedMs, setupMs, nodes, promotions, decisions,
    maxRssBytes: process.resourceUsage().maxRSS * 1024 });
}
