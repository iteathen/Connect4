import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';
import { createTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-term-id-kernel.mjs';
import { createSupportLayoutTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-term-id-support-layout-kernel.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3, expectedStates: 3735 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4, expectedStates: 34095 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4, expectedStates: 11317 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4, expectedStates: 294593 }),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function createVariant(spec, variant) {
  if (variant === 'reference') return createTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  return createSupportLayoutTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false, supportLayout: variant });
}

function enumerate(kernel) {
  let terminalEdges = 0;
  let nonterminalEdges = 0;
  let illegalEdges = 0;
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

function arraysEqual(left, right) {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) if (left[index] !== right[index]) return false;
  return true;
}

function qualifyGraph(spec) {
  const reference = createVariant(spec, 'reference').kernel;
  const table = createVariant(spec, 'table').kernel;
  const packed = createVariant(spec, 'packed').kernel;
  const referenceCensus = enumerate(reference);
  const tableCensus = enumerate(table);
  const packedCensus = enumerate(packed);
  assert(referenceCensus.states === spec.expectedStates, 'reference state census drift');
  assert(JSON.stringify(tableCensus) === JSON.stringify(referenceCensus), 'table-refactor census mismatch');
  assert(JSON.stringify(packedCensus) === JSON.stringify(referenceCensus), 'packed census mismatch');
  assert(table.classes.size === reference.classes.size && packed.classes.size === reference.classes.size, 'residual class count mismatch');
  assert(table.states.count === reference.states.count && packed.states.count === reference.states.count, 'q state count mismatch');

  for (let classId = 0; classId < reference.classes.size; classId += 1) {
    const expected = reference.classes.termIds(classId);
    assert(arraysEqual(table.classes.termIds(classId), expected), `table class ${classId} mismatch`);
    assert(arraysEqual(packed.classes.termIds(classId), expected), `packed class ${classId} mismatch`);
  }
  for (let stateId = 0; stateId < reference.states.count; stateId += 1) {
    const expected = reference.stateView(stateId);
    for (const [label, candidate] of [['table', table], ['packed', packed]]) {
      const actual = candidate.stateView(stateId);
      assert(actual.supportIndex === expected.supportIndex, `${label} state ${stateId} support mismatch`);
      assert(actual.p0Class === expected.p0Class, `${label} state ${stateId} p0 mismatch`);
      assert(actual.p1Class === expected.p1Class, `${label} state ${stateId} p1 mismatch`);
      for (let column = 0; column < spec.columns; column += 1) {
        assert(candidate.advance(stateId, column) === reference.advance(stateId, column), `${label} edge ${stateId}/${column} mismatch`);
      }
    }
  }
  return {
    census: referenceCensus,
    classes: reference.classes.size,
    tableMemory: table.memoryStats(),
    packedMemory: packed.memoryStats(),
  };
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
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `${variant} root action ${column} mismatch`);
    }
  }
  return {
    totalMs: performance.now() - started,
    setupMs,
    solveMs,
    expanded: solver.metrics.expanded,
    calls: solver.metrics.calls,
    states: wrap.kernel.states.count,
    classes: wrap.kernel.classes.size,
    memory: wrap.kernel.memoryStats(),
  };
}

function bench(spec, repeats = 17) {
  const graph = qualifyGraph(spec);
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const expectedActions = expectedRootActions(spec, oracle);
  const variants = ['reference', 'table', 'packed'];
  const qualification = {};
  for (const variant of variants) qualification[variant] = runOnce(spec, variant, oracle.rootWdl, expectedActions, true);
  assert(qualification.reference.expanded === qualification.table.expanded && qualification.reference.expanded === qualification.packed.expanded, 'support layout changed expansion count');
  assert(qualification.reference.calls === qualification.table.calls && qualification.reference.calls === qualification.packed.calls, 'support layout changed call count');

  const samples = new Map(variants.map((variant) => [variant, []]));
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    const offset = repeat % variants.length;
    for (let step = 0; step < variants.length; step += 1) {
      const variant = variants[(offset + step) % variants.length];
      samples.get(variant).push(runOnce(spec, variant, oracle.rootWdl, expectedActions));
    }
  }
  const results = {};
  for (const variant of variants) {
    const runs = samples.get(variant);
    const totalMs = median(runs.map((entry) => entry.totalMs));
    const representative = [...runs].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(runs.length / 2)];
    results[variant] = { totalMs, solveMs: median(runs.map((entry) => entry.solveMs)), representative, qualification: qualification[variant] };
  }
  console.error(`[support-kernel] ${spec.columns}x${spec.rows}:c${spec.connect} ref=${results.reference.totalMs.toFixed(3)}ms table=${results.table.totalMs.toFixed(3)}ms packed=${results.packed.totalMs.toFixed(3)}ms packed/table=${(results.packed.totalMs / results.table.totalMs).toFixed(3)}`);
  return { geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`, graph, results };
}

function structural7x6() {
  const spec = { columns: 7, rows: 6, connect: 4 };
  const table = createVariant(spec, 'table').kernel;
  const packed = createVariant(spec, 'packed').kernel;
  return {
    geometry: '7x6:c4',
    supportStates: table.support.itemCapacity,
    vocabularyTerms: table.classes.termVocabulary.count,
    tableMemory: table.memoryStats(),
    packedMemory: packed.memoryStats(),
    supportRatioPackedOverTable: packed.memoryStats().supportBytes / table.memoryStats().supportBytes,
    totalRatioPackedOverTableAtRoot: packed.memoryStats().totalTypedBytes / table.memoryStats().totalTypedBytes,
  };
}

const cases = CASES.map((spec) => bench(spec));
const standard7x6 = structural7x6();
console.error(`SUPPORT_LAYOUT_KERNEL_SUMMARY=${JSON.stringify(cases.map((entry) => ({ geometry: entry.geometry, referenceMs: entry.results.reference.totalMs, tableMs: entry.results.table.totalMs, packedMs: entry.results.packed.totalMs, packedOverTable: entry.results.packed.totalMs / entry.results.table.totalMs, tableSupportBytes: entry.results.table.representative.memory.supportBytes, packedSupportBytes: entry.results.packed.representative.memory.supportBytes })))}`);
console.log(JSON.stringify({
  kind: 'connect4-term-id-whole-kernel-support-layout-v1',
  status: 'complete',
  date: '2026-09-11',
  qualification: 'current winner vs refactored-table vs refactored-packed complete class/qID/edge identity and independent BSFP root/action WDL',
  caveat: '7x6 is structural/root-construction only; no 7x6 exact root solve in this campaign',
  cases,
  standard7x6,
}, null, 2));
