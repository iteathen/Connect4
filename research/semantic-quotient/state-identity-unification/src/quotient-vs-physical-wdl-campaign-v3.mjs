import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { createQuotientNativeNegamaxKernel } from './quotient-native-negamax-kernel.mjs';
import { createPhysicalWdlSolver } from './physical-wdl-control.mjs';

const CASES = [
  { columns: 4, rows: 4, connect: 4 },
  { columns: 5, rows: 3, connect: 4 },
  { columns: 4, rows: 5, connect: 4 },
];

function assert(ok, message) { if (!ok) throw new Error(message); }
function median(xs) { return [...xs].sort((a,b)=>a-b)[Math.floor(xs.length/2)]; }
function expectedActions(spec, oracle) {
  return Array.from({ length: spec.columns }, (_, c) => {
    const heights = Array(spec.columns).fill(0); heights[c] = 1;
    return oracle.evaluate({ heights, p0OwnershipMask: 1n << BigInt(c) });
  });
}

function quotientRoot(spec, expected) {
  const t0 = performance.now();
  const kernel = createQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const setupMs = performance.now() - t0;
  const solver = kernel.createWdlSolver({ wdlMode: 'full', etc: false, etcMinRemaining: 0 });
  const t1 = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - t1;
  assert(result === expected, `quotient root mismatch ${result} != ${expected}`);
  return {
    totalMs: performance.now() - t0, setupMs, solveMs,
    expanded: solver.metrics.expanded, calls: solver.metrics.calls,
    states: kernel.states.count, classes: kernel.classes.size,
    typedBytes: kernel.memoryStats().totalTypedBytes,
  };
}

function qualifyQuotient(spec, expected, actions) {
  const kernel = createQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const solver = kernel.createWdlSolver({ wdlMode: 'full', etc: false, etcMinRemaining: 0 });
  assert(solver.run() === expected, 'quotient qualification root mismatch');
  const got = solver.rootActionValues();
  for (let c = 0; c < spec.columns; c++) assert(got[c] === actions[c], `quotient qualification action ${c} mismatch`);
}

function physicalRoot(spec, expected, budget) {
  const t0 = performance.now();
  const solver = createPhysicalWdlSolver(spec, budget, { ways: 4 });
  const setupMs = performance.now() - t0;
  const t1 = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - t1;
  assert(result === expected, `physical root mismatch ${result} != ${expected}`);
  assert(solver.typedBytes <= budget, `physical bytes ${solver.typedBytes} > budget ${budget}`);
  return {
    totalMs: performance.now() - t0, setupMs, solveMs,
    expanded: solver.metrics.expanded, calls: solver.metrics.calls,
    typedBytes: solver.typedBytes,
    ttSlots: solver.tt.slotCount, ttOccupied: solver.tt.count,
    ttLoad: solver.tt.count / solver.tt.slotCount,
    ttMetrics: { ...solver.tt.metrics },
  };
}

function qualifyPhysical(spec, expected, actions, budget) {
  const solver = createPhysicalWdlSolver(spec, budget, { ways: 4 });
  assert(solver.run() === expected, 'physical qualification root mismatch');
  const got = solver.rootActionValues();
  for (let c = 0; c < spec.columns; c++) assert(got[c] === actions[c], `physical qualification action ${c} mismatch`);
  assert(solver.typedBytes <= budget, 'physical qualification exceeded budget');
}

function bench(spec, repeats = 15) {
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const actions = expectedActions(spec, oracle);

  // Freeze fairness budget from an isolated root-only quotient solve. Root-action
  // qualification happens separately and is never allowed to enlarge this budget.
  const budgetProbe = quotientRoot(spec, oracle.rootWdl);
  const budget = budgetProbe.typedBytes;
  qualifyQuotient(spec, oracle.rootWdl, actions);
  qualifyPhysical(spec, oracle.rootWdl, actions, budget);

  const q = [], p = [];
  for (let i = 0; i < repeats; i++) {
    q.push(quotientRoot(spec, oracle.rootWdl));
    p.push(physicalRoot(spec, oracle.rootWdl, budget));
  }
  const qr = [...q].sort((a,b)=>a.totalMs-b.totalMs)[Math.floor(repeats/2)];
  const pr = [...p].sort((a,b)=>a.totalMs-b.totalMs)[Math.floor(repeats/2)];
  const out = {
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    expectedWdl: oracle.rootWdl,
    typedMemoryBudget: budget,
    quotient: { totalMsMedian: median(q.map(x=>x.totalMs)), solveMsMedian: median(q.map(x=>x.solveMs)), representative: qr },
    physical: { totalMsMedian: median(p.map(x=>x.totalMs)), solveMsMedian: median(p.map(x=>x.solveMs)), representative: pr },
  };
  console.error(`[q-vs-p-v3] ${out.geometry} budget=${budget} q=${out.quotient.totalMsMedian.toFixed(3)}ms p=${out.physical.totalMsMedian.toFixed(3)}ms qExp=${qr.expanded} pExp=${pr.expanded} slots=${pr.ttSlots} repl=${pr.ttMetrics.replacements}`);
  return out;
}

const cases = CASES.map(bench);
const summary = cases.map(x => ({
  geometry: x.geometry, budget: x.typedMemoryBudget,
  qMs: x.quotient.totalMsMedian, pMs: x.physical.totalMsMedian,
  qExpanded: x.quotient.representative.expanded, pExpanded: x.physical.representative.expanded,
  qBytes: x.quotient.representative.typedBytes, pBytes: x.physical.representative.typedBytes,
  pSlots: x.physical.representative.ttSlots, pLoad: x.physical.representative.ttLoad,
  pReplacements: x.physical.representative.ttMetrics.replacements,
  timeRatioQoverP: x.quotient.totalMsMedian / x.physical.totalMsMedian,
  expansionRatioQoverP: x.quotient.representative.expanded / x.physical.representative.expanded,
}));
console.error(`QUOTIENT_VS_PHYSICAL_V3_SUMMARY=${JSON.stringify(summary)}`);
console.log(JSON.stringify({
  kind: 'connect4-quotient-vs-bounded-physical-wdl-v3', status: 'complete', date: '2026-09-11',
  fairness: {
    contract: 'exact WDL fail-soft full-window negamax',
    tacticalClosure: 'same immediate-win forced-response double-threat semantics',
    moveOrder: 'TT-best then center-first',
    physicalIdentity: 'supportIndex + exact P0 ownership; P1 derived from support',
    physicalTT: 'bounded 4-way exact-key table; replacement only loses cache information',
    memoryBudget: 'frozen from isolated root-only quotient typed-array footprint before root-action qualification',
    oracle: 'independent BSFP root and root-action WDL',
  },
  caveat: 'quotient typed-array footprint is still a lower bound on total JS heap; bounded controls are not a standard 7x6 production claim',
  cases,
}, null, 2));
