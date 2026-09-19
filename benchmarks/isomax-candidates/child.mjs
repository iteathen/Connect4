import fs from 'node:fs';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { loadSolver } from './variants.mjs';
import { makeCorpus } from '../isomax-ordering/corpus.mjs';
import { physicalExhaustion } from './corpus.mjs';
const variant = process.argv[2], Solver = await loadSolver(variant);
const corpus = JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
const emit = data => fs.writeSync(1, JSON.stringify(data) + '\n');
for (const { moves } of makeCorpus({ seed: 17, ply: 34, count: 8 })) {
  const solver = new Solver(); solver.solve(solver.createState(moves));
}
for (const {workload,roots} of corpus) {
  assert.equal(roots.length,workload.count);
  let elapsedMs = 0, setupMs = 0, nodes = 0;
  const decisions = [], work = [];
  const exhaustion = { p0:0,p1:0,both:0 };
  for (const { sequence, moves } of roots) {
    const [p0,p1] = physicalExhaustion(moves);
    exhaustion.p0 += Number(p0); exhaustion.p1 += Number(p1); exhaustion.both += Number(p0 && p1);
    global.gc?.();
    let start = performance.now();
    const solver = new Solver(), state = solver.createState(moves);
    assert.equal(state.p0Class===0,p0); assert.equal(state.p1Class===0,p1);
    if (workload.oneSided) assert.notEqual(p0,p1);
    setupMs += performance.now() - start;
    start = performance.now();
    const result = solver.solve(state), solveMs = performance.now() - start;
    elapsedMs += solveMs; nodes += result.metrics.nodes;
    decisions.push({ sequence, value: result.value, move: result.move });
    work.push(result.metrics);
    emit({ kind: 'root', variant, workload: workload.name, sequence, solveMs, ...result });
  }
  emit({ kind: 'summary', variant, workload: workload.name, elapsedMs, setupMs, nodes, decisions, work,
    exhaustion, maxRssBytes: process.resourceUsage().maxRSS * 1024 });
}
