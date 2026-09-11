import { performance } from 'node:perf_hooks';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';
import { createQuotientNativeNegamaxSupportLayoutKernel } from './quotient-native-negamax-support-layout-kernel.mjs';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3, expectedStates: 3735 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4, expectedStates: 34095 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4, expectedStates: 11317 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4, expectedStates: 294593 }),
]);

const SOURCE_URL = new URL('./quotient-slot64-residual-pool.mjs', import.meta.url);
const GENERATED_URL = new URL('./quotient-slot64-residual-pool-direct-block.generated.mjs', import.meta.url);
const OLD_BLOCK = `  pool.blockTransition = function blockTransitionSlot64(id, cell) {
    const cached = cacheGet(blockTransitions, id, cell, false);
    if (cached !== CLASS_UNKNOWN) { metrics.blockTransitionHits += 1; return cached; }
    metrics.blockTransitionMisses += 1;
    loadClassBits(id, inputBits);
    const containsBase = cell * WORDS_PER_CLASS;
    let changed = false;
    for (let word = 0; word < WORDS_PER_CLASS; word += 1) {
      const input = inputBits[word] >>> 0;
      const next = (input & ~containsMasks[containsBase + word]) >>> 0;
      resultBits[word] = next;
      if (next !== input) changed = true;
    }
    if (!changed) {
      cacheSet(blockTransitions, id, cell, id);
      metrics.blockNoop += 1;
      return id;
    }
    const result = internBits(resultBits, id);
    cacheSet(blockTransitions, id, cell, result);
    return result;
  };`;

const NEW_BLOCK = `  pool.blockTransition = function blockTransitionSlot64Direct(id, cell) {
    const cached = cacheGet(blockTransitions, id, cell, false);
    if (cached !== CLASS_UNKNOWN) { metrics.blockTransitionHits += 1; return cached; }
    metrics.blockTransitionMisses += 1;

    const containsBase = cell * WORDS_PER_CLASS;
    let changedSlots = 0;
    for (let slotIndex = 0; slotIndex < CHUNKS_PER_CLASS; slotIndex += 1) {
      const parentChunk = classSlotIds[slotIndex][id];
      chunkIds[slotIndex] = parentChunk;
      const word = slotIndex * CHUNK_WORDS;
      const mask0 = containsMasks[containsBase + word] >>> 0;
      const mask1 = containsMasks[containsBase + word + 1] >>> 0;
      if ((mask0 | mask1) === 0) continue;

      const parentBase = parentChunk * CHUNK_WORDS;
      const input0 = slotPools[slotIndex].words[parentBase] >>> 0;
      const input1 = slotPools[slotIndex].words[parentBase + 1] >>> 0;
      const next0 = (input0 & ~mask0) >>> 0;
      const next1 = (input1 & ~mask1) >>> 0;
      if (next0 === input0 && next1 === input1) continue;

      resultBits[word] = next0;
      resultBits[word + 1] = next1;
      chunkIds[slotIndex] = slotPools[slotIndex].intern(resultBits, word);
      metrics.chunkInterns += 1;
      changedSlots += 1;
    }

    if (changedSlots === 0) {
      cacheSet(blockTransitions, id, cell, id);
      metrics.blockNoop += 1;
      return id;
    }

    metrics.internLookups += 1;
    metrics.parentChunkReuses += CHUNKS_PER_CLASS - changedSlots;
    if ((classCount + 1) * 10 >= classHashSlots.length * 7) growClassHash();
    const hash = hashChunkTuple(chunkIds);
    const hashMask = classHashSlots.length - 1;
    let hashSlot = hash & hashMask;
    while (true) {
      const existingId = classHashSlots[hashSlot];
      if (existingId === -1) break;
      if (classHashes[existingId] === hash && classEquals(existingId, chunkIds)) {
        metrics.internHits += 1;
        cacheSet(blockTransitions, id, cell, existingId);
        return existingId;
      }
      hashSlot = (hashSlot + 1) & hashMask;
    }

    for (let slotIndex = 0; slotIndex < CHUNKS_PER_CLASS; slotIndex += 1) {
      ensureReferenceWidth(slotIndex, chunkIds[slotIndex]);
    }
    ensureClassCapacity(classCount + 1);
    const result = classCount;
    for (let slotIndex = 0; slotIndex < CHUNKS_PER_CLASS; slotIndex += 1) {
      classSlotIds[slotIndex][result] = chunkIds[slotIndex];
    }
    classHashes[result] = hash;
    const bitLo = cell < 32 ? ((2 ** cell) >>> 0) : 0;
    const bitHi = cell >= 32 ? ((2 ** (cell - 32)) >>> 0) : 0;
    singletonLo[result] = (singletonLo[id] & ~bitLo) >>> 0;
    singletonHi[result] = (singletonHi[id] & ~bitHi) >>> 0;
    classHashSlots[hashSlot] = result;
    classCount += 1;
    metrics.internMisses += 1;
    cacheSet(blockTransitions, id, cell, result);
    return result;
  };`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function options() {
  return { cacheEdges: false, supportLayout: 'packed', prefixClasses: 4096 };
}

const source = await readFile(SOURCE_URL, 'utf8');
const first = source.indexOf(OLD_BLOCK);
assert(first >= 0, 'qualified slot64 blockTransition source seam not found');
assert(source.indexOf(OLD_BLOCK, first + OLD_BLOCK.length) < 0, 'slot64 blockTransition source seam is ambiguous');
const generated = source.slice(0, first) + NEW_BLOCK + source.slice(first + OLD_BLOCK.length);
await writeFile(GENERATED_URL, generated, 'utf8');
const { installSlot64ResidualPool: installDirectBlockPool } = await import(`${GENERATED_URL.href}?direct-block-v1`);

function createBaseline(spec) {
  return createSlot64ResidualQuotientKernel(spec, options());
}

function createDirect(spec) {
  const kernel = createQuotientNativeNegamaxSupportLayoutKernel(spec, options());
  const residual = installDirectBlockPool(kernel, spec, { prefixClasses: 4096 });
  return Object.freeze({ kernel, residual });
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

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) if (a[index] !== b[index]) return false;
  return true;
}

function qualifyGraph(spec) {
  const baselineWrap = createBaseline(spec);
  const directWrap = createDirect(spec);
  const baseline = baselineWrap.kernel;
  const direct = directWrap.kernel;
  const baselineCensus = enumerate(baseline);
  const directCensus = enumerate(direct);
  assert(baselineCensus.states === spec.expectedStates, `${spec.columns}x${spec.rows}: baseline census drift`);
  assert(JSON.stringify(directCensus) === JSON.stringify(baselineCensus), `${spec.columns}x${spec.rows}: edge census mismatch`);
  assert(direct.classes.size === baseline.classes.size, `${spec.columns}x${spec.rows}: class count mismatch`);
  assert(direct.states.count === baseline.states.count, `${spec.columns}x${spec.rows}: q-state count mismatch`);

  for (let classId = 0; classId < baseline.classes.size; classId += 1) {
    assert(arraysEqual(direct.classes.termIds(classId), baseline.classes.termIds(classId)), `${spec.columns}x${spec.rows}: class ${classId} term IDs differ`);
  }
  for (let stateId = 0; stateId < baseline.states.count; stateId += 1) {
    const a = baseline.stateView(stateId);
    const b = direct.stateView(stateId);
    assert(a.supportIndex === b.supportIndex && a.p0Class === b.p0Class && a.p1Class === b.p1Class,
      `${spec.columns}x${spec.rows}: state ${stateId} tuple mismatch`);
    for (let column = 0; column < spec.columns; column += 1) {
      assert(direct.advance(stateId, column) === baseline.advance(stateId, column), `${spec.columns}x${spec.rows}: edge ${stateId}/${column} mismatch`);
    }
  }

  return {
    census: baselineCensus,
    classes: baseline.classes.size,
    baselineMemory: baseline.memoryStats(),
    directMemory: direct.memoryStats(),
    baselineMetrics: { ...baseline.classes.metrics },
    directMetrics: { ...direct.classes.metrics },
  };
}

function expectedRootActions(spec, oracle) {
  const values = Array(spec.columns).fill(null);
  for (let column = 0; column < spec.columns; column += 1) {
    const heights = Array(spec.columns).fill(0);
    heights[column] = 1;
    values[column] = oracle.evaluate({ heights, p0OwnershipMask: 1n << BigInt(column) });
  }
  return values;
}

function runOnce(spec, direct, expectedWdl, expectedActions, qualifyActions = false) {
  const started = performance.now();
  const wrap = direct ? createDirect(spec) : createBaseline(spec);
  const setupMs = performance.now() - started;
  const solver = wrap.kernel.createWdlSolver({ wdlMode: 'full', etc: false });
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `${direct ? 'direct-block' : 'baseline'} root WDL mismatch`);
  let actions = null;
  if (qualifyActions) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `${direct ? 'direct-block' : 'baseline'} root action ${column} mismatch`);
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
    metrics: { ...wrap.kernel.classes.metrics },
  };
}

function bench(spec, repeats = 21) {
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const expectedActions = expectedRootActions(spec, oracle);
  const baselineQualification = runOnce(spec, false, oracle.rootWdl, expectedActions, true);
  const directQualification = runOnce(spec, true, oracle.rootWdl, expectedActions, true);
  assert(directQualification.expanded === baselineQualification.expanded, 'direct-block expansion count mismatch');
  assert(directQualification.calls === baselineQualification.calls, 'direct-block call count mismatch');

  const baselineRuns = [];
  const directRuns = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    if ((repeat & 1) === 0) {
      baselineRuns.push(runOnce(spec, false, oracle.rootWdl, expectedActions));
      directRuns.push(runOnce(spec, true, oracle.rootWdl, expectedActions));
    } else {
      directRuns.push(runOnce(spec, true, oracle.rootWdl, expectedActions));
      baselineRuns.push(runOnce(spec, false, oracle.rootWdl, expectedActions));
    }
  }
  const baselineMs = median(baselineRuns.map((entry) => entry.totalMs));
  const directMs = median(directRuns.map((entry) => entry.totalMs));
  const baselineSolveMs = median(baselineRuns.map((entry) => entry.solveMs));
  const directSolveMs = median(directRuns.map((entry) => entry.solveMs));
  return {
    baselineMs,
    directMs,
    ratio: directMs / baselineMs,
    baselineSolveMs,
    directSolveMs,
    solveRatio: directSolveMs / baselineSolveMs,
    baselineRepresentative: baselineRuns.sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)],
    directRepresentative: directRuns.sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)],
  };
}

try {
  const qualification = CASES.map((spec) => ({ geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`, ...qualifyGraph(spec) }));
  const largest = CASES.at(-1);
  const benchmark = bench(largest);
  const result = {
    kind: 'connect4-slot64-direct-block-transition-v1',
    status: 'complete',
    date: '2026-09-11',
    contract: {
      baseline: 'qualified sparse-normalization slot64 implementation',
      candidate: 'direct per-slot opponent blocking without whole-class bitset reconstruction',
      exactness: 'complete class/qID/edge identity on all bounded controls plus independent BSFP root/action WDL and identical Negamax work',
      generatedCandidate: fileURLToPath(GENERATED_URL),
    },
    qualification,
    benchmark4x5: benchmark,
  };
  console.error(`SLOT64_DIRECT_BLOCK_SUMMARY=${JSON.stringify({
    baselineMs: benchmark.baselineMs,
    directMs: benchmark.directMs,
    ratio: benchmark.ratio,
    baselineSolveMs: benchmark.baselineSolveMs,
    directSolveMs: benchmark.directSolveMs,
    solveRatio: benchmark.solveRatio,
    baselineBlockMisses: benchmark.baselineRepresentative.metrics.blockTransitionMisses,
    directBlockMisses: benchmark.directRepresentative.metrics.blockTransitionMisses,
    baselineChunkInterns: benchmark.baselineRepresentative.metrics.chunkInterns,
    directChunkInterns: benchmark.directRepresentative.metrics.chunkInterns,
  })}`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await unlink(GENERATED_URL).catch(() => {});
}
