import fs from 'node:fs';
import { performance } from 'node:perf_hooks';
import { loadSolver } from './variants.mjs';
import { makeCorpus, WORKLOADS } from '../isomax-ordering/corpus.mjs';
const variant = process.argv[2], Solver = await loadSolver(variant);
const emit = data => fs.writeSync(1, JSON.stringify(data) + '\n');
for (const { moves } of makeCorpus({ seed: 17, ply: 34, count: 8 })) {
  const solver = new Solver(); solver.solve(solver.createState(moves));
}
for (const workload of WORKLOADS) {
  let elapsedMs = 0, setupMs = 0, nodes = 0;
  const decisions = [], work = [];
  for (const { sequence, moves } of makeCorpus(workload)) {
    global.gc?.();
    let start = performance.now();
    const solver = new Solver(), state = solver.createState(moves);
    setupMs += performance.now() - start;
    start = performance.now();
    const result = solver.solve(state), solveMs = performance.now() - start;
    elapsedMs += solveMs; nodes += result.metrics.nodes;
    decisions.push({ sequence, value: result.value, move: result.move });
    work.push(result.metrics);
    emit({ kind: 'root', variant, workload: workload.name, sequence, solveMs, ...result });
  }
  emit({ kind: 'summary', variant, workload: workload.name, elapsedMs, setupMs, nodes, decisions, work,
    maxRssBytes: process.resourceUsage().maxRSS * 1024 });
}
