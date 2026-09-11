import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import {
  createQuotientNativeNegamaxKernel,
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
} from './quotient-native-negamax-kernel.mjs';

const UNKNOWN = -3;
const TERMINAL = -1;
const EMPTY_CLASS_KEY = 0xffff_ffff;

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4 }),
]);

const MODES = Object.freeze([
  'dense',
  'none',
  'sparse',
  'direct1',
  'direct2',
  'direct4',
  'direct8',
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function nextPowerOfTwo(value) {
  let result = 1;
  while (result < value) result *= 2;
  return result;
}

function mix32(value) {
  let x = value >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b) >>> 0;
  x ^= x >>> 16;
  return x >>> 0;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function createNoCache() {
  return Object.freeze({
    get() { return UNKNOWN; },
    set() {},
    stats: { hits: 0, misses: 0, inserts: 0, evictions: 0, grows: 0 },
    memoryBytes() { return 0; },
  });
}

function createSparseCache() {
  let capacity = 1024;
  let count = 0;
  let keyClass = new Uint32Array(capacity);
  let keyTag = new Uint8Array(capacity);
  let values = new Int32Array(capacity);
  keyClass.fill(EMPTY_CLASS_KEY);
  const stats = { hits: 0, misses: 0, inserts: 0, evictions: 0, grows: 0 };

  function hash(classId, tag) {
    return mix32((classId >>> 0) ^ Math.imul((tag + 1) >>> 0, 0x9e3779b1));
  }

  function insertRaw(classId, tag, value) {
    const mask = capacity - 1;
    let slot = hash(classId, tag) & mask;
    while (keyClass[slot] !== EMPTY_CLASS_KEY) slot = (slot + 1) & mask;
    keyClass[slot] = classId >>> 0;
    keyTag[slot] = tag;
    values[slot] = value;
    count += 1;
  }

  function grow() {
    const oldClass = keyClass;
    const oldTag = keyTag;
    const oldValues = values;
    capacity *= 2;
    count = 0;
    keyClass = new Uint32Array(capacity);
    keyTag = new Uint8Array(capacity);
    values = new Int32Array(capacity);
    keyClass.fill(EMPTY_CLASS_KEY);
    for (let index = 0; index < oldClass.length; index += 1) {
      if (oldClass[index] !== EMPTY_CLASS_KEY) insertRaw(oldClass[index], oldTag[index], oldValues[index]);
    }
    stats.grows += 1;
  }

  return Object.freeze({
    get(classId, tag) {
      const mask = capacity - 1;
      let slot = hash(classId, tag) & mask;
      while (true) {
        const candidate = keyClass[slot];
        if (candidate === EMPTY_CLASS_KEY) {
          stats.misses += 1;
          return UNKNOWN;
        }
        if (candidate === (classId >>> 0) && keyTag[slot] === tag) {
          stats.hits += 1;
          return values[slot];
        }
        slot = (slot + 1) & mask;
      }
    },
    set(classId, tag, value) {
      if ((count + 1) * 10 >= capacity * 7) grow();
      const mask = capacity - 1;
      let slot = hash(classId, tag) & mask;
      while (true) {
        const candidate = keyClass[slot];
        if (candidate === EMPTY_CLASS_KEY) {
          keyClass[slot] = classId >>> 0;
          keyTag[slot] = tag;
          values[slot] = value;
          count += 1;
          stats.inserts += 1;
          return;
        }
        if (candidate === (classId >>> 0) && keyTag[slot] === tag) {
          values[slot] = value;
          return;
        }
        slot = (slot + 1) & mask;
      }
    },
    stats,
    memoryBytes() { return keyClass.byteLength + keyTag.byteLength + values.byteLength; },
  });
}

function createDirectCache(slotsPerClass) {
  assert((slotsPerClass & (slotsPerClass - 1)) === 0, 'direct slots must be a power of two');
  let classCapacity = 8;
  let tags = new Uint8Array(classCapacity * slotsPerClass);
  let values = new Int32Array(classCapacity * slotsPerClass);
  tags.fill(0xff);
  const stats = { hits: 0, misses: 0, inserts: 0, evictions: 0, grows: 0 };

  function ensure(classId) {
    if (classId < classCapacity) return;
    const nextCapacity = nextPowerOfTwo(classId + 1);
    const nextTags = new Uint8Array(nextCapacity * slotsPerClass);
    nextTags.fill(0xff);
    nextTags.set(tags);
    const nextValues = new Int32Array(nextCapacity * slotsPerClass);
    nextValues.set(values);
    tags = nextTags;
    values = nextValues;
    classCapacity = nextCapacity;
    stats.grows += 1;
  }

  function slotOf(classId, tag) {
    const local = mix32(Math.imul((tag + 1) >>> 0, 0x9e3779b1)) & (slotsPerClass - 1);
    return classId * slotsPerClass + local;
  }

  return Object.freeze({
    get(classId, tag) {
      ensure(classId);
      const slot = slotOf(classId, tag);
      if (tags[slot] === tag) {
        stats.hits += 1;
        return values[slot];
      }
      stats.misses += 1;
      return UNKNOWN;
    },
    set(classId, tag, value) {
      ensure(classId);
      const slot = slotOf(classId, tag);
      if (tags[slot] !== 0xff && tags[slot] !== tag) stats.evictions += 1;
      if (tags[slot] === 0xff) stats.inserts += 1;
      tags[slot] = tag;
      values[slot] = value;
    },
    stats,
    memoryBytes() { return tags.byteLength + values.byteLength; },
  });
}

function installClassTransitionCache(kernel, mode) {
  if (mode === 'dense') {
    return Object.freeze({
      mode,
      externalCache: null,
      memoryBytes() { return 0; },
      stats: null,
    });
  }

  const classes = kernel.classes;
  const cellCount = kernel.cellCount;
  const externalCache = mode === 'none'
    ? createNoCache()
    : mode === 'sparse'
      ? createSparseCache()
      : createDirectCache(Number(mode.slice('direct'.length)));

  // Disable the prototype's dense class×cell arrays before any search-created
  // classes can grow them. Cache misses are semantically allowed to recompute.
  classes.ownTransitions = new Int32Array(0);
  classes.blockTransitions = new Int32Array(0);
  classes.transitionClassCapacity = 0;
  classes._ensureTransitionCapacity = () => {};

  function ownTransition(classId, cell, bitLo, bitHi) {
    const tag = cell;
    const cached = externalCache.get(classId, tag);
    if (cached !== UNKNOWN) {
      classes.metrics.ownTransitionHits += 1;
      return cached;
    }
    classes.metrics.ownTransitionMisses += 1;

    const start = classes.starts[classId];
    const length = classes.lengths[classId];
    const next = [];
    for (let index = 0; index < length; index += 1) {
      let lo = classes.flatLo[start + index] >>> 0;
      let hi = classes.flatHi[start + index] >>> 0;
      const contains = (((lo & bitLo) >>> 0) !== 0) || (((hi & bitHi) >>> 0) !== 0);
      if (contains) {
        lo = (lo & ~bitLo) >>> 0;
        hi = (hi & ~bitHi) >>> 0;
        if (lo === 0 && hi === 0) {
          externalCache.set(classId, tag, TERMINAL);
          return TERMINAL;
        }
      }
      next.push([lo, hi]);
    }
    const result = classes.intern(next);
    externalCache.set(classId, tag, result);
    return result;
  }

  function blockTransition(classId, cell, bitLo, bitHi) {
    const tag = cellCount + cell;
    const cached = externalCache.get(classId, tag);
    if (cached !== UNKNOWN) {
      classes.metrics.blockTransitionHits += 1;
      return cached;
    }
    classes.metrics.blockTransitionMisses += 1;

    const start = classes.starts[classId];
    const length = classes.lengths[classId];
    const next = [];
    for (let index = 0; index < length; index += 1) {
      const lo = classes.flatLo[start + index] >>> 0;
      const hi = classes.flatHi[start + index] >>> 0;
      const contains = (((lo & bitLo) >>> 0) !== 0) || (((hi & bitHi) >>> 0) !== 0);
      if (!contains) next.push([lo, hi]);
    }
    const result = classes.internNormalized(next);
    externalCache.set(classId, tag, result);
    return result;
  }

  classes.ownTransition = ownTransition;
  classes.blockTransition = blockTransition;

  return Object.freeze({
    mode,
    externalCache,
    memoryBytes() { return externalCache.memoryBytes(); },
    stats: externalCache.stats,
  });
}

function exhaustGraph(spec, mode) {
  const kernel = createQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const cache = installClassTransitionCache(kernel, mode);
  let hash = 0x811c9dc5;
  let nonterminal = 0;
  let terminal = 0;
  let illegal = 0;

  for (let stateId = 0; stateId < kernel.states.count; stateId += 1) {
    for (let column = 0; column < spec.columns; column += 1) {
      const target = kernel.advance(stateId, column);
      const encoded = (target + 4) >>> 0;
      hash = Math.imul(hash ^ mix32(encoded ^ Math.imul(column + 1, 0x9e3779b1)), 0x01000193) >>> 0;
      if (target === QN_ILLEGAL) illegal += 1;
      else if (target === QN_TERMINAL_WIN) terminal += 1;
      else nonterminal += 1;
    }
  }

  return Object.freeze({
    mode,
    stateCount: kernel.states.count,
    classCount: kernel.classes.size,
    edgeHash: hash >>> 0,
    nonterminal,
    terminal,
    illegal,
    externalCacheBytes: cache.memoryBytes(),
    externalCacheStats: cache.stats ? Object.freeze({ ...cache.stats }) : null,
  });
}

function runOnce(spec, expected, mode) {
  const started = performance.now();
  const kernel = createQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const cache = installClassTransitionCache(kernel, mode);
  const setupMs = performance.now() - started;
  const solver = kernel.createWdlSolver({ wdlMode: 'full', etc: false, etcMinRemaining: 0 });
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expected, `${mode}: expected WDL ${expected}, got ${result}`);

  const kernelMemory = kernel.memoryStats();
  return Object.freeze({
    result,
    setupMs,
    solveMs,
    totalMs: performance.now() - started,
    expanded: solver.metrics.expanded,
    calls: solver.metrics.calls,
    stateCount: kernel.states.count,
    classCount: kernel.classes.size,
    classMetrics: Object.freeze({ ...kernel.classes.metrics }),
    baseTypedBytes: kernelMemory.totalTypedBytes,
    externalCacheBytes: cache.memoryBytes(),
    typedBytesLowerBound: kernelMemory.totalTypedBytes + cache.memoryBytes(),
    externalCacheStats: cache.stats ? Object.freeze({ ...cache.stats }) : null,
  });
}

function benchmarkMode(spec, expected, mode, repeats = 7) {
  const runs = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) runs.push(runOnce(spec, expected, mode));
  const representative = [...runs].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(runs.length / 2)];
  return Object.freeze({
    mode,
    totalMsMedian: median(runs.map((run) => run.totalMs)),
    solveMsMedian: median(runs.map((run) => run.solveMs)),
    setupMsMedian: median(runs.map((run) => run.setupMs)),
    representative,
  });
}

const graphQualification = [];
for (const spec of CASES) {
  const control = exhaustGraph(spec, 'dense');
  const modes = [control];
  for (const mode of MODES) {
    if (mode === 'dense') continue;
    const candidate = exhaustGraph(spec, mode);
    assert(candidate.stateCount === control.stateCount, `${mode}: q census differs from dense control`);
    assert(candidate.classCount === control.classCount, `${mode}: residual class census differs from dense control`);
    assert(candidate.edgeHash === control.edgeHash, `${mode}: quotient edge hash differs from dense control`);
    assert(candidate.nonterminal === control.nonterminal, `${mode}: nonterminal edge count differs`);
    assert(candidate.terminal === control.terminal, `${mode}: terminal edge count differs`);
    assert(candidate.illegal === control.illegal, `${mode}: illegal edge count differs`);
    modes.push(candidate);
  }
  graphQualification.push(Object.freeze({
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    status: 'pass',
    controlHash: control.edgeHash,
    modes,
  }));
}

const cases = [];
for (const spec of CASES) {
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const candidates = MODES.map((mode) => benchmarkMode(spec, oracle.rootWdl, mode));
  const best = [...candidates].sort((a, b) => a.totalMsMedian - b.totalMsMedian)[0];
  const geometry = `${spec.columns}x${spec.rows}:c${spec.connect}`;
  console.error(
    `[quotient-class-cache] ${geometry}`
    + ` best=${best.mode}`
    + ` totalMs=${best.totalMsMedian.toFixed(3)}`
    + ` typedBytes=${best.representative.typedBytesLowerBound}`
    + ` states=${best.representative.stateCount}`,
  );
  cases.push(Object.freeze({ geometry, expectedWdl: oracle.rootWdl, best: best.mode, candidates }));
}

const compact = cases.map((entry) => ({
  geometry: entry.geometry,
  best: entry.best,
  candidates: Object.fromEntries(entry.candidates.map((candidate) => [candidate.mode, {
    totalMsMedian: candidate.totalMsMedian,
    solveMsMedian: candidate.solveMsMedian,
    expanded: candidate.representative.expanded,
    states: candidate.representative.stateCount,
    classes: candidate.representative.classCount,
    typedBytesLowerBound: candidate.representative.typedBytesLowerBound,
    cacheBytes: candidate.representative.externalCacheBytes,
    cacheStats: candidate.representative.externalCacheStats,
  }])),
}));

console.error(`QUOTIENT_CLASS_CACHE_SUMMARY=${JSON.stringify(compact)}`);
console.log(JSON.stringify({
  kind: 'connect4-quotient-native-class-transition-cache-campaign-v1',
  status: 'complete',
  date: '2026-09-11',
  question: 'Can sparse or bounded tagged exact memoization replace the sparsely occupied dense residual-class transition arrays?',
  semantics: 'Cache hits are exact. A miss or direct-cache collision may only recompute the qualified transition; it cannot alter the result.',
  graphQualification,
  cases,
}, null, 2));
