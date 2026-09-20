// Instrumented operation census, NEVER wall-time promotion evidence. Production
// hot functions are wrapped only in this standalone qualification process.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = path.resolve(process.argv[2]);
const output = path.resolve(process.argv[3]);
const { IsoMaxSolver } = await import(pathToFileURL(path.join(root, 'components/isometric/solver.mjs')));
const report = { source: execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'],
  { encoding: 'utf8', windowsHide: true }).trim(), node: process.version,
  sourceDiff: execFileSync('git', ['-C', root, 'diff', 'HEAD'], { encoding: 'utf8', windowsHide: true }),
  instrumented: true, timingIsNotPerformanceEvidence: true, records: [] };
const save = () => fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n', { flush: true });
save();
for (const sequence of ['717657616532237625', '466537327657277224', '616767454664457417']) {
  const solver = new IsoMaxSolver(), counts = { terminalEntries: 0, reflectionCalls: 0,
    comparisonCalls: 0, wordLoads: 0, denseClassLoads: 0, ownCalls: 0, blockCalls: 0 };
  const node = solver.solveNode;
  solver.solveNode = function (state) { if (state.status) counts.terminalEntries++; return node.call(this, state); };
  for (const [method, counter] of [['reflectClass','reflectionCalls'], ['compareClasses','comparisonCalls'],
    ['wordAt','wordLoads'], ['loadClassBits','denseClassLoads'], ['ownTransition','ownCalls'], ['blockTransition','blockCalls']]) {
    const original = solver.pool[method];
    solver.pool[method] = function (...args) { counts[counter]++; return original.apply(this, args); };
  }
  const result = solver.solveMoves(Array.from(sequence, c => Number(c) - 1));
  report.records.push({ sequence, value: result.value, move: result.move, counts, metrics: result.metrics,
    expandedEntries: result.metrics.nodes - result.metrics.transitionCacheHits - result.metrics.nativeExactHits,
    transitionEdges: result.metrics.recursiveChildren + result.metrics.forcedTransitions,
    classes: solver.pool.classCount, cacheCount: solver.transitionCache.count, cacheCapacity: solver.transitionCache.capacity });
  save();
  console.log(JSON.stringify(report.records.at(-1)));
}
