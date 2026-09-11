import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { createFastQuotientNativeNegamaxKernel } from './quotient-native-negamax-fast-kernel.mjs';
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

function fastScratchBytes(kernel) {
  const maxTerms = Math.max(1, kernel.classes.lengths[kernel.classes.initialClass]);
  return maxTerms * 8 * Uint32Array.BYTES_PER_ELEMENT;
}

function runQuotient(spec, expectedWdl, expectedActions, qualifyActions = false) {
  const started = performance.now();
  const wrap = createFastQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const kernel = wrap.kernel;
  const setupMs = performance.now() - started;
  const solver = kernel.createWdlSolver({ wdlMode: 'full', etc: false });
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `fast quotient root WDL mismatch: expected ${expectedWdl}, got ${result}`);
  let actions = null;
  if (qualifyActions) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `fast quotient root action ${column} mismatch`);
    }
  }
  const typedBytesLowerBound = kernel.memoryStats().totalTypedBytes + fastScratchBytes(kernel);
  return {
    totalMs: performance.now() - started,
    setupMs,
    solveMs,
    result,
    actions,
    expanded: solver.metrics.expanded,
    calls: solver.metrics.calls,
    states: kernel.states.count,
    classes: kernel.classes.size,
    typedBytesLowerBound,
    specialization: { ...wrap.specialization.metrics },
  };
}

function runPhysical(spec, expectedWdl, expectedActions, memoryBudget, qualifyActions = false) {
  const started = performance.now();
  const solver = createPhysicalWdlSolver(spec, memoryBudget, { ways: 4 });
  const setupMs = performance.now() - started;
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `physical root WDL mismatch: expected ${expectedWdl}, got ${result}`);
  let actions = null;
  if (qualifyActions) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `physical root action ${column} mismatch`);
    }
  }
  assert(solver.typedBytes <= memoryBudget, `physical typed bytes ${solver.typedBytes} exceed quotient budget ${memoryBudget}`);
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

function bench(spec, repeats = 21) {
  assert(Number.isInteger(repeats) && repeats > 0, 'repeat count must be positive');
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const expectedActions = expectedRootActions(spec, oracle);

  // Freeze the equal-byte control from an isolated quotient root solve before
  // either side performs root-action qualification.
  const budgetProbe = runQuotient(spec, oracle.rootWdl, expectedActions, false);
  const budget = budgetProbe.typedBytesLowerBound;
  const quotientQualification = runQuotient(spec, oracle.rootWdl, expectedActions, true);
  const physicalQualification = runPhysical(spec, oracle.rootWdl, expectedActions, budget, true);

  const quotientRuns = [];
  const physicalRuns = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    quotientRuns.push(runQuotient(spec, oracle.rootWdl, expectedActions));
    physicalRuns.push(runPhysical(spec, oracle.rootWdl, expectedActions, budget));
  }
  const qTotal = median(quotientRuns.map((entry) => entry.totalMs));
  const pTotal = median(physicalRuns.map((entry) => entry.totalMs));
  const qRepresentative = [...quotientRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  const pRepresentative = [...physicalRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];

  const result = {
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    expectedWdl: oracle.rootWdl,
    typedMemoryBudget: budget,
    quotient: {
      totalMsMedian: qTotal,
      solveMsMedian: median(quotientRuns.map((entry) => entry.solveMs)),
      representative: qRepresentative,
      qualification: quotientQualification,
    },
    physical: {
      totalMsMedian: pTotal,
      solveMsMedian: median(physicalRuns.map((entry) => entry.solveMs)),
      representative: pRepresentative,
      qualification: physicalQualification,
    },
    timeRatioQuotientOverPhysical: qTotal / pTotal,
    expansionRatioQuotientOverPhysical: qRepresentative.expanded / pRepresentative.expanded,
  };
  console.error(`[q-vs-p-v4] ${result.geometry} q=${qTotal.toFixed(3)}ms p=${pTotal.toFixed(3)}ms ratio=${result.timeRatioQuotientOverPhysical.toFixed(3)} qExp=${qRepresentative.expanded} pExp=${pRepresentative.expanded} budget=${budget}`);
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
  quotientBytes: entry.quotient.representative.typedBytesLowerBound,
  physicalBytes: entry.physical.representative.typedBytes,
  physicalSlots: entry.physical.representative.ttSlots,
  physicalReplacements: entry.physical.representative.ttMetrics.replacements,
}));
console.error(`QUOTIENT_VS_PHYSICAL_V4_SUMMARY=${JSON.stringify(compact)}`);
console.log(JSON.stringify({
  kind: 'connect4-flat-quotient-vs-bounded-physical-wdl-v4',
  status: 'complete',
  date: '2026-09-11',
  fairness: {
    contract: 'exact WDL fail-soft full-window negamax',
    tacticalClosure: 'same immediate-win forced-response double-threat semantics',
    moveOrder: 'TT-best then center-first',
    quotientIdentity: 'supportIndex + exact P0 residual class + exact P1 residual class; side-to-move from rank',
    quotientTransitions: 'flat specialized residual algebra; no generic sort/minimization on transition misses',
    physicalIdentity: 'supportIndex + exact P0 ownership; P1 derived from support',
    physicalTT: 'bounded 4-way exact-key table; replacement only loses cache information',
    memoryBudget: 'frozen from isolated quotient root typed-array lower-bound footprint, including fixed specialized scratch arrays',
    oracle: 'independent BSFP root and root-action WDL',
  },
  caveat: 'Quotient residual metadata still uses JS number arrays whose heap bytes are not included in typed-array lower-bound accounting; bounded controls are not a standard 7x6 production claim.',
  cases,
}, null, 2));
