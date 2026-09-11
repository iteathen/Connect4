import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';
import { createTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-term-id-kernel.mjs';
import { createBoundedCacheTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-term-id-bounded-cache-kernel.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3, expectedStates: 3735 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4, expectedStates: 34095 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4, expectedStates: 11317 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4, expectedStates: 294593 }),
]);

const POLICIES = Object.freeze([
  Object.freeze({ name: 'dense', kind: 'dense' }),
  Object.freeze({ name: 'none', kind: 'none' }),
  Object.freeze({ name: 'direct-16k', kind: 'global-direct', slots: 1 << 14 }),
  Object.freeze({ name: 'direct-32k', kind: 'global-direct', slots: 1 << 15 }),
  Object.freeze({ name: 'direct-64k', kind: 'global-direct', slots: 1 << 16 }),
  Object.freeze({ name: 'direct-128k', kind: 'global-direct', slots: 1 << 17 }),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function createKernel(spec, policy) {
  if (policy.kind === 'dense') return createTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  return createBoundedCacheTermIdQuotientNativeNegamaxKernel(spec, {
    cacheEdges: false,
    termTransitionCache: policy.kind === 'none'
      ? { kind: 'none' }
      : { kind: 'global-direct', slots: policy.slots },
  });
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

function enumerate(kernel) {
  let terminalEdges = 0;
  let nonterminalEdges = 0;
  let illegalEdges = 0;
  for (let id = 0; id < kernel.states.count; id += 1) {
    for (let column = 0; column < kernel.columns; column += 1) {
      const target = kernel.advance(id, column);
      if (target === QN_ILLEGAL) illegalEdges += 1;
      else if (target === QN_TERMINAL_WIN) terminalEdges += 1;
      else nonterminalEdges += 1;
    }
  }
  return { states: kernel.states.count, terminalEdges, nonterminalEdges, illegalEdges };
}

function arraysEqual(left, right) {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

function qualifyPolicy(spec, policy) {
  const denseWrap = createKernel(spec, POLICIES[0]);
  const candidateWrap = createKernel(spec, policy);
  const dense = denseWrap.kernel;
  const candidate = candidateWrap.kernel;
  const denseCensus = enumerate(dense);
  const candidateCensus = enumerate(candidate);
  assert(denseCensus.states === spec.expectedStates, `${policy.name}: dense state census drift`);
  assert(JSON.stringify(candidateCensus) === JSON.stringify(denseCensus), `${policy.name}: edge census mismatch`);
  assert(candidate.classes.size === dense.classes.size, `${policy.name}: residual class count mismatch`);
  assert(candidate.states.count === dense.states.count, `${policy.name}: q state count mismatch`);

  for (let classId = 0; classId < dense.classes.size; classId += 1) {
    assert(arraysEqual(dense.classes.termIds(classId), candidate.classes.termIds(classId)), `${policy.name}: class ${classId} term-ID mismatch`);
  }
  for (let stateId = 0; stateId < dense.states.count; stateId += 1) {
    const expected = dense.stateView(stateId);
    const actual = candidate.stateView(stateId);
    assert(actual.supportIndex === expected.supportIndex, `${policy.name}: state ${stateId} support mismatch`);
    assert(actual.p0Class === expected.p0Class, `${policy.name}: state ${stateId} p0 class mismatch`);
    assert(actual.p1Class === expected.p1Class, `${policy.name}: state ${stateId} p1 class mismatch`);
    for (let column = 0; column < spec.columns; column += 1) {
      assert(candidate.advance(stateId, column) === dense.advance(stateId, column), `${policy.name}: state ${stateId} column ${column} edge mismatch`);
    }
  }

  return {
    census: denseCensus,
    classes: dense.classes.size,
    candidateMemory: candidate.memoryStats(),
    cache: candidateWrap.termId.transitionMemo
      ? { kind: candidateWrap.termId.transitionMemo.kind, bytes: candidateWrap.termId.transitionMemo.bytes, metrics: { ...candidateWrap.termId.transitionMemo.metrics } }
      : { kind: 'dense', bytes: candidate.classes.memoryStats().transitionCacheBytes },
  };
}

function runOnce(spec, policy, expectedWdl, expectedActions, qualifyActions = false) {
  const started = performance.now();
  const wrap = createKernel(spec, policy);
  const setupMs = performance.now() - started;
  const solver = wrap.kernel.createWdlSolver({ wdlMode: 'full', etc: false });
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `${policy.name}: root WDL mismatch`);
  let actions = null;
  if (qualifyActions) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `${policy.name}: root action ${column} mismatch`);
    }
  }
  const residual = wrap.kernel.classes.memoryStats();
  const cache = wrap.termId.transitionMemo
    ? { kind: wrap.termId.transitionMemo.kind, bytes: wrap.termId.transitionMemo.bytes, metrics: { ...wrap.termId.transitionMemo.metrics } }
    : { kind: 'dense', bytes: residual.transitionCacheBytes, metrics: null };
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
    totalTypedBytes: wrap.kernel.memoryStats().totalTypedBytes,
    residual,
    cache,
    poolMetrics: { ...wrap.kernel.classes.metrics },
  };
}

function bench(spec, repeats = 17) {
  assert(Number.isInteger(repeats) && repeats > 0, 'repeat count must be positive');
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const expectedActions = expectedRootActions(spec, oracle);
  const qualifications = {};
  for (const policy of POLICIES) {
    qualifications[policy.name] = qualifyPolicy(spec, policy);
    runOnce(spec, policy, oracle.rootWdl, expectedActions, true);
  }

  const samples = new Map(POLICIES.map((policy) => [policy.name, []]));
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    const offset = repeat % POLICIES.length;
    for (let step = 0; step < POLICIES.length; step += 1) {
      const policy = POLICIES[(offset + step) % POLICIES.length];
      samples.get(policy.name).push(runOnce(spec, policy, oracle.rootWdl, expectedActions));
    }
  }

  const policies = {};
  for (const policy of POLICIES) {
    const runs = samples.get(policy.name);
    const totalMs = median(runs.map((entry) => entry.totalMs));
    const representative = [...runs].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(runs.length / 2)];
    policies[policy.name] = {
      totalMs,
      solveMs: median(runs.map((entry) => entry.solveMs)),
      representative,
      qualification: qualifications[policy.name],
    };
  }

  const denseMs = policies.dense.totalMs;
  const compact = Object.fromEntries(POLICIES.map((policy) => [policy.name, {
    totalMs: policies[policy.name].totalMs,
    ratioToDense: policies[policy.name].totalMs / denseMs,
    cacheBytes: policies[policy.name].representative.cache.bytes,
    typedBytes: policies[policy.name].representative.totalTypedBytes,
    hits: policies[policy.name].representative.cache.metrics?.hits ?? null,
    misses: policies[policy.name].representative.cache.metrics?.misses ?? null,
    collisions: policies[policy.name].representative.cache.metrics?.collisions ?? null,
  }]));
  console.error(`[term-cache] ${spec.columns}x${spec.rows}:c${spec.connect} ${JSON.stringify(compact)}`);
  return {
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    expectedWdl: oracle.rootWdl,
    policies,
  };
}

function standard7x6StructuralProbe() {
  const spec = { columns: 7, rows: 6, connect: 4 };
  const wrap = createBoundedCacheTermIdQuotientNativeNegamaxKernel(spec, {
    cacheEdges: false,
    termTransitionCache: { kind: 'global-direct', slots: 1 << 16 },
  });
  const classCapacities = [1 << 16, 1 << 18, 1 << 20];
  const denseTransitionBytes = Object.fromEntries(classCapacities.map((capacity) => [capacity, capacity * spec.columns * spec.rows * 2 * Int32Array.BYTES_PER_ELEMENT]));
  return {
    geometry: '7x6:c4',
    supportStates: wrap.kernel.support.itemCapacity,
    vocabularyTerms: wrap.termId.vocabulary.count,
    vocabularyBits: Math.ceil(Math.log2(wrap.termId.vocabulary.count)),
    bounded64kCacheBytes: wrap.termId.transitionMemo.bytes,
    rootTypedBytes: wrap.kernel.memoryStats().totalTypedBytes,
    denseBytesPerReservedClass: spec.columns * spec.rows * 2 * Int32Array.BYTES_PER_ELEMENT,
    denseTransitionBytes,
  };
}

const cases = CASES.map((spec) => bench(spec));
const standard7x6 = standard7x6StructuralProbe();
console.error(`TERM_ID_CACHE_SCALING_SUMMARY=${JSON.stringify(cases.map((entry) => ({ geometry: entry.geometry, policies: Object.fromEntries(Object.entries(entry.policies).map(([name, result]) => [name, { totalMs: result.totalMs, cacheBytes: result.representative.cache.bytes, typedBytes: result.representative.totalTypedBytes }])) })))}`);
console.log(JSON.stringify({
  kind: 'connect4-term-id-transition-cache-scaling-v1',
  status: 'complete',
  date: '2026-09-11',
  authority: 'cache policy only; exact quotient transition semantics unchanged',
  qualification: 'complete graph identity by class ID/qID/edge plus independent BSFP root/action WDL for every policy',
  policies: POLICIES,
  cases,
  standard7x6,
}, null, 2));
