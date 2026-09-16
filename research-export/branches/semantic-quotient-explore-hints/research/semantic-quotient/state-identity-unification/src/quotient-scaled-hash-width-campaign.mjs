import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';
import { createScaledTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-scaled-term-id-kernel.mjs';
import { createHash16ScaledQuotientKernel } from './quotient-native-negamax-scaled-hash16-kernel.mjs';
import { createNoStoredStateHashScaledQuotientKernel } from './quotient-native-negamax-scaled-nohash-kernel.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 4, connect: 4, expectedStates: 34095 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4, expectedStates: 11317 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4, expectedStates: 294593 }),
]);
const VARIANTS = Object.freeze(['hash32', 'hash16', 'nohash']);

function assert(condition, message) { if (!condition) throw new Error(message); }
function median(values) { const sorted = [...values].sort((a, b) => a - b); return sorted[Math.floor(sorted.length / 2)]; }
function createVariant(spec, variant) {
  const options = { cacheEdges: false, supportLayout: 'packed', prefixClasses: 4096 };
  if (variant === 'hash32') return createScaledTermIdQuotientNativeNegamaxKernel(spec, options);
  if (variant === 'hash16') return createHash16ScaledQuotientKernel(spec, options);
  if (variant === 'nohash') return createNoStoredStateHashScaledQuotientKernel(spec, options);
  throw new RangeError(`unknown variant ${variant}`);
}
function enumerate(kernel) {
  let terminalEdges = 0; let nonterminalEdges = 0; let illegalEdges = 0;
  for (let stateId = 0; stateId < kernel.states.count; stateId += 1) {
    for (let column = 0; column < kernel.columns; column += 1) {
      const child = kernel.advance(stateId, column);
      if (child === QN_ILLEGAL) illegalEdges += 1;
      else if (child === QN_TERMINAL_WIN) terminalEdges += 1;
      else nonterminalEdges += 1;
    }
  }
  return { states: kernel.states.count, terminalEdges, nonterminalEdges, illegalEdges };
}
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
  return true;
}
function qualifyGraph(spec) {
  const wraps = Object.fromEntries(VARIANTS.map((variant) => [variant, createVariant(spec, variant)]));
  const base = wraps.hash32.kernel;
  const census = enumerate(base);
  assert(census.states === spec.expectedStates, 'hash32 state census drift');
  const result = { hash32: { census, memory: base.memoryStats() } };
  for (const variant of ['hash16', 'nohash']) {
    const kernel = wraps[variant].kernel;
    const actualCensus = enumerate(kernel);
    assert(JSON.stringify(actualCensus) === JSON.stringify(census), `${variant} census mismatch`);
    assert(kernel.classes.size === base.classes.size, `${variant} class count mismatch`);
    assert(kernel.states.count === base.states.count, `${variant} q count mismatch`);
    for (let classId = 0; classId < base.classes.size; classId += 1) {
      assert(arraysEqual(kernel.classes.termIds(classId), base.classes.termIds(classId)), `${variant} class ${classId} mismatch`);
    }
    for (let stateId = 0; stateId < base.states.count; stateId += 1) {
      const a = base.stateView(stateId); const b = kernel.stateView(stateId);
      assert(a.supportIndex === b.supportIndex && a.p0Class === b.p0Class && a.p1Class === b.p1Class, `${variant} state ${stateId} mismatch`);
      for (let column = 0; column < spec.columns; column += 1) {
        assert(kernel.advance(stateId, column) === base.advance(stateId, column), `${variant} edge ${stateId}/${column} mismatch`);
      }
    }
    result[variant] = { census: actualCensus, memory: kernel.memoryStats() };
  }
  return result;
}
function expectedRootActions(spec, oracle) {
  const values = Array(spec.columns).fill(null);
  for (let column = 0; column < spec.columns; column += 1) {
    const heights = Array(spec.columns).fill(0); heights[column] = 1;
    values[column] = oracle.evaluate({ heights, p0OwnershipMask: 1n << BigInt(column) });
  }
  return values;
}
function runOnce(spec, variant, expectedWdl, expectedActions, qualifyActions = false) {
  const started = performance.now();
  const wrap = createVariant(spec, variant);
  const setupMs = performance.now() - started;
  const solver = wrap.kernel.createWdlSolver({ wdlMode: 'full', etc: false });
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `${variant} root WDL mismatch`);
  let actions = null;
  if (qualifyActions) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) assert(actions[column] === expectedActions[column], `${variant} action ${column} mismatch`);
  }
  return { totalMs: performance.now() - started, setupMs, solveMs, result, actions, expanded: solver.metrics.expanded, calls: solver.metrics.calls, states: wrap.kernel.states.count, classes: wrap.kernel.classes.size, memory: wrap.kernel.memoryStats(), stateMetrics: { ...wrap.kernel.states.metrics } };
}
function bench(spec, repeats = 23) {
  const graph = qualifyGraph(spec);
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const expectedActions = expectedRootActions(spec, oracle);
  const qualification = {};
  for (const variant of VARIANTS) qualification[variant] = runOnce(spec, variant, oracle.rootWdl, expectedActions, true);
  for (const variant of VARIANTS) {
    assert(qualification[variant].expanded === qualification.hash32.expanded, `${variant} expansion mismatch`);
    assert(qualification[variant].calls === qualification.hash32.calls, `${variant} calls mismatch`);
  }
  const samples = new Map(VARIANTS.map((variant) => [variant, []]));
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    const offset = repeat % VARIANTS.length;
    for (let step = 0; step < VARIANTS.length; step += 1) {
      const variant = VARIANTS[(offset + step) % VARIANTS.length];
      samples.get(variant).push(runOnce(spec, variant, oracle.rootWdl, expectedActions));
    }
  }
  const results = {};
  for (const variant of VARIANTS) {
    const runs = samples.get(variant);
    const totalMs = median(runs.map((entry) => entry.totalMs));
    const representative = [...runs].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(runs.length / 2)];
    results[variant] = { totalMs, solveMs: median(runs.map((entry) => entry.solveMs)), representative, qualification: qualification[variant] };
  }
  const baseMs = results.hash32.totalMs;
  console.error(`[q-hash-width] ${spec.columns}x${spec.rows}:c${spec.connect} ${JSON.stringify(Object.fromEntries(VARIANTS.map((variant) => [variant, { ms: results[variant].totalMs, ratio: results[variant].totalMs / baseMs, stateBytes: results[variant].representative.memory.state.totalTypedBytes, totalBytes: results[variant].representative.memory.totalTypedBytes }])))}`);
  return { geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`, graph, results };
}
function structural7x6() {
  const spec = { columns: 7, rows: 6, connect: 4 };
  return Object.fromEntries(VARIANTS.map((variant) => {
    const kernel = createVariant(spec, variant).kernel;
    return [variant, kernel.memoryStats()];
  }));
}
const cases = CASES.map((spec) => bench(spec));
const standard7x6 = structural7x6();
console.error(`HASH_WIDTH_SUMMARY=${JSON.stringify(cases.map((entry) => ({ geometry: entry.geometry, results: Object.fromEntries(VARIANTS.map((variant) => [variant, { ms: entry.results[variant].totalMs, stateBytes: entry.results[variant].representative.memory.state.totalTypedBytes, totalBytes: entry.results[variant].representative.memory.totalTypedBytes }])) })))}`);
console.log(JSON.stringify({ kind: 'connect4-scaled-state-hash-width-v1', status: 'complete', date: '2026-09-11', qualification: 'complete graph/qID/class/edge identity plus BSFP root/action WDL and identical search work', cases, standard7x6 }, null, 2));
