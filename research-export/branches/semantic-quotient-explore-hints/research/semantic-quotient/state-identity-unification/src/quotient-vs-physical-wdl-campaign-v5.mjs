import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { createTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-term-id-kernel.mjs';
import { createPhysicalWdlSolver } from './physical-wdl-control.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4 }),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function expectedRootActions(spec, oracle) {
  const actions = Array(spec.columns).fill(null);
  for (let column = 0; column < spec.columns; column += 1) {
    const heights = Array(spec.columns).fill(0);
    heights[column] = 1;
    actions[column] = oracle.evaluate({ heights, p0OwnershipMask: 1n << BigInt(column) });
  }
  return actions;
}

function fullTypedBytes(wrap) {
  const base = wrap.kernel.memoryStats();
  const residual = wrap.termId.memoryStats();
  const supportCore = wrap.kernel.support.ranks.byteLength + wrap.kernel.support.weights.byteLength;
  return base.state.totalTypedBytes + base.supportBytes + supportCore + residual.totalTypedBytes;
}

function runQuotient(spec, expectedWdl, expectedActions, qualify = false) {
  const started = performance.now();
  const wrap = createTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const setupMs = performance.now() - started;
  const solver = wrap.kernel.createWdlSolver({ wdlMode: 'full', etc: false });
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `term-ID quotient root mismatch expected=${expectedWdl} got=${result}`);
  let actions = null;
  if (qualify) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `term-ID quotient root action ${column} mismatch`);
    }
  }
  return {
    totalMs: performance.now() - started,
    setupMs,
    solveMs,
    result,
    actions,
    expanded: solver.metrics.expanded,
    calls: solver.metrics.calls,
    states: wrap.kernel.states.count,
    classes: wrap.kernel.classes.size,
    typedBytes: fullTypedBytes(wrap),
    residual: wrap.termId.memoryStats(),
  };
}

function runPhysical(spec, expectedWdl, expectedActions, budget, qualify = false) {
  const started = performance.now();
  const solver = createPhysicalWdlSolver(spec, budget, { ways: 4 });
  const setupMs = performance.now() - started;
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `physical root mismatch expected=${expectedWdl} got=${result}`);
  let actions = null;
  if (qualify) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `physical root action ${column} mismatch`);
    }
  }
  assert(solver.typedBytes <= budget, 'physical typed bytes exceed frozen term-ID quotient budget');
  return {
    totalMs: performance.now() - started,
    setupMs,
    solveMs,
    result,
    actions,
    expanded: solver.metrics.expanded,
    calls: solver.metrics.calls,
    typedBytes: solver.typedBytes,
    ttSlots: solver.tt.slotCount,
    ttOccupied: solver.tt.count,
    ttLoad: solver.tt.count / solver.tt.slotCount,
    ttMetrics: { ...solver.tt.metrics },
  };
}

function bench(spec, repeats = 25) {
  assert(Number.isInteger(repeats) && repeats > 0, 'repeat count must be positive');
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const actions = expectedRootActions(spec, oracle);

  // Freeze budget from an isolated root solve, including the full typed term-ID
  // residual substrate rather than the older lower-bound-only accounting.
  const budgetProbe = runQuotient(spec, oracle.rootWdl, actions, false);
  const budget = budgetProbe.typedBytes;
  const quotientQualification = runQuotient(spec, oracle.rootWdl, actions, true);
  const physicalQualification = runPhysical(spec, oracle.rootWdl, actions, budget, true);

  const quotientRuns = [];
  const physicalRuns = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    quotientRuns.push(runQuotient(spec, oracle.rootWdl, actions));
    physicalRuns.push(runPhysical(spec, oracle.rootWdl, actions, budget));
  }
  const qMs = median(quotientRuns.map((entry) => entry.totalMs));
  const pMs = median(physicalRuns.map((entry) => entry.totalMs));
  const qRep = [...quotientRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  const pRep = [...physicalRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  const result = {
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    typedMemoryBudget: budget,
    quotient: {
      totalMsMedian: qMs,
      solveMsMedian: median(quotientRuns.map((entry) => entry.solveMs)),
      representative: qRep,
      qualification: quotientQualification,
    },
    physical: {
      totalMsMedian: pMs,
      solveMsMedian: median(physicalRuns.map((entry) => entry.solveMs)),
      representative: pRep,
      qualification: physicalQualification,
    },
    timeRatioQuotientOverPhysical: qMs / pMs,
    expansionRatioQuotientOverPhysical: qRep.expanded / pRep.expanded,
  };
  console.error(`[q-vs-p-v5] ${result.geometry} q=${qMs.toFixed(3)}ms p=${pMs.toFixed(3)}ms ratio=${result.timeRatioQuotientOverPhysical.toFixed(3)} qExp=${qRep.expanded} pExp=${pRep.expanded} budget=${budget}`);
  return result;
}

const cases = CASES.map((spec) => bench(spec));
const compact = cases.map((entry) => ({
  geometry: entry.geometry,
  budget: entry.typedMemoryBudget,
  quotientMs: entry.quotient.totalMsMedian,
  physicalMs: entry.physical.totalMsMedian,
  timeRatioQoverP: entry.timeRatioQuotientOverPhysical,
  quotientExpanded: entry.quotient.representative.expanded,
  physicalExpanded: entry.physical.representative.expanded,
  expansionRatioQoverP: entry.expansionRatioQuotientOverPhysical,
  quotientBytes: entry.quotient.representative.typedBytes,
  physicalBytes: entry.physical.representative.typedBytes,
  physicalSlots: entry.physical.representative.ttSlots,
  physicalReplacements: entry.physical.representative.ttMetrics.replacements,
}));
console.error(`QUOTIENT_VS_PHYSICAL_V5_SUMMARY=${JSON.stringify(compact)}`);
console.log(JSON.stringify({
  kind: 'connect4-term-id-quotient-vs-bounded-physical-wdl-v5',
  status: 'complete',
  date: '2026-09-11',
  fairness: {
    contract: 'exact WDL fail-soft full-window negamax',
    tacticalClosure: 'same immediate-win forced-response double-threat semantics',
    moveOrder: 'TT-best then center-first',
    quotientIdentity: 'supportIndex + exact P0 residual class + exact P1 residual class; side-to-move from rank',
    quotientResidual: 'u16 term-ID classes with precomputed reduce/subset algebra',
    physicalIdentity: 'supportIndex + exact P0 ownership; P1 derived from support',
    physicalTT: 'bounded 4-way exact-key table; replacement only loses cache information',
    memoryBudget: 'frozen from isolated quotient root full typed term-ID footprint',
    oracle: 'independent BSFP root and root-action WDL',
  },
  caveat: 'Small JS object/control metadata is not byte-for-byte modeled on either side; this remains bounded-control evidence, not standard-7x6 production qualification.',
  cases,
}, null, 2));
