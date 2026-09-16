import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';
import { createTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-term-id-kernel.mjs';
import { createSupportLayoutTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-term-id-support-layout-kernel.mjs';
import { createScaledTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-scaled-term-id-kernel.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 4, connect: 4, expectedStates: 34095 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4, expectedStates: 11317 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4, expectedStates: 294593 }),
]);

const VARIANTS = Object.freeze([
  'reference',
  'table-dense',
  'packed-dense',
  'table-prefix4k',
  'packed-prefix4k',
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function createVariant(spec, variant) {
  switch (variant) {
    case 'reference':
      return createTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
    case 'table-dense':
      return createSupportLayoutTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false, supportLayout: 'table' });
    case 'packed-dense':
      return createSupportLayoutTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false, supportLayout: 'packed' });
    case 'table-prefix4k':
      return createScaledTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false, supportLayout: 'table', prefixClasses: 4096 });
    case 'packed-prefix4k':
      return createScaledTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false, supportLayout: 'packed', prefixClasses: 4096 });
    default:
      throw new RangeError(`unknown variant ${variant}`);
  }
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
  const wraps = Object.fromEntries(VARIANTS.map((variant) => [variant, createVariant(spec, variant)]));
  const reference = wraps.reference.kernel;
  const expectedCensus = enumerate(reference);
  assert(expectedCensus.states === spec.expectedStates, 'reference state census drift');

  const qualification = {};
  for (const variant of VARIANTS) {
    const kernel = wraps[variant].kernel;
    const census = variant === 'reference' ? expectedCensus : enumerate(kernel);
    assert(JSON.stringify(census) === JSON.stringify(expectedCensus), `${variant}: edge census mismatch`);
    assert(kernel.classes.size === reference.classes.size, `${variant}: residual class count mismatch`);
    assert(kernel.states.count === reference.states.count, `${variant}: q state count mismatch`);
    if (variant !== 'reference') {
      for (let classId = 0; classId < reference.classes.size; classId += 1) {
        assert(arraysEqual(kernel.classes.termIds(classId), reference.classes.termIds(classId)), `${variant}: class ${classId} mismatch`);
      }
      for (let stateId = 0; stateId < reference.states.count; stateId += 1) {
        const expected = reference.stateView(stateId);
        const actual = kernel.stateView(stateId);
        assert(actual.supportIndex === expected.supportIndex, `${variant}: state ${stateId} support mismatch`);
        assert(actual.p0Class === expected.p0Class, `${variant}: state ${stateId} p0 mismatch`);
        assert(actual.p1Class === expected.p1Class, `${variant}: state ${stateId} p1 mismatch`);
        for (let column = 0; column < spec.columns; column += 1) {
          assert(kernel.advance(stateId, column) === reference.advance(stateId, column), `${variant}: edge ${stateId}/${column} mismatch`);
        }
      }
    }
    qualification[variant] = {
      census,
      classes: kernel.classes.size,
      memory: kernel.memoryStats(),
      termMetrics: { ...kernel.classes.metrics },
    };
  }
  return qualification;
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
  assert(result === expectedWdl, `${variant}: root WDL mismatch`);
  let actions = null;
  if (qualifyActions) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `${variant}: root action ${column} mismatch`);
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
    memory: wrap.kernel.memoryStats(),
    termMetrics: { ...wrap.kernel.classes.metrics },
  };
}

function bench(spec, repeats = 19) {
  const graphQualification = qualifyGraph(spec);
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const expectedActions = expectedRootActions(spec, oracle);
  const qualification = {};
  for (const variant of VARIANTS) qualification[variant] = runOnce(spec, variant, oracle.rootWdl, expectedActions, true);
  for (const variant of VARIANTS) {
    assert(qualification[variant].expanded === qualification.reference.expanded, `${variant}: expansion count mismatch`);
    assert(qualification[variant].calls === qualification.reference.calls, `${variant}: call count mismatch`);
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
    results[variant] = {
      totalMs,
      solveMs: median(runs.map((entry) => entry.solveMs)),
      representative,
      qualification: qualification[variant],
    };
  }

  const tableDense = results['table-dense'].totalMs;
  console.error(`[scaled-q] ${spec.columns}x${spec.rows}:c${spec.connect} ${JSON.stringify(Object.fromEntries(VARIANTS.map((variant) => [variant, { ms: results[variant].totalMs, ratioToTableDense: results[variant].totalMs / tableDense, bytes: results[variant].representative.memory.totalTypedBytes }])))}`);
  return {
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    expectedWdl: oracle.rootWdl,
    graphQualification,
    results,
  };
}

function structural7x6() {
  const spec = { columns: 7, rows: 6, connect: 4 };
  const variants = ['table-dense', 'packed-dense', 'table-prefix4k', 'packed-prefix4k'];
  const result = {};
  for (const variant of variants) {
    const wrap = createVariant(spec, variant);
    result[variant] = {
      memory: wrap.kernel.memoryStats(),
      supportStates: wrap.kernel.support.itemCapacity,
      vocabularyTerms: wrap.kernel.classes.termVocabulary.count,
      prefixClasses: wrap.termId.prefixClasses ?? null,
    };
  }
  return result;
}

const cases = CASES.map((spec) => bench(spec));
const standard7x6 = structural7x6();
console.error(`SCALED_QUOTIENT_SUMMARY=${JSON.stringify(cases.map((entry) => ({ geometry: entry.geometry, results: Object.fromEntries(VARIANTS.map((variant) => [variant, { ms: entry.results[variant].totalMs, bytes: entry.results[variant].representative.memory.totalTypedBytes }])) })))}`);
console.log(JSON.stringify({
  kind: 'connect4-scaled-term-id-quotient-kernel-v1',
  status: 'complete',
  date: '2026-09-11',
  qualification: 'composition preserves complete bounded class/qID/edge graph, independent BSFP root/action WDL, and identical Negamax work',
  caveat: 'standard 7x6 is root-construction/memory only; no exact 7x6 root solve',
  variants: VARIANTS,
  cases,
  standard7x6,
}, null, 2));
