import { performance } from 'node:perf_hooks';
import { readFile, writeFile, unlink } from 'node:fs/promises';
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

const SOURCE_URL = new URL('./quotient-slot64-residual-pool-v2.mjs', import.meta.url);
const GENERATED_URL = new URL('./quotient-slot64-residual-pool-dense-dirty.generated.mjs', import.meta.url);

function assert(condition, message) { if (!condition) throw new Error(message); }
function replaceOnce(source, from, to, label) {
  const index = source.indexOf(from);
  assert(index >= 0, `${label}: source seam missing`);
  assert(source.indexOf(from, index + from.length) < 0, `${label}: source seam ambiguous`);
  return source.slice(0, index) + to + source.slice(index + from.length);
}
function median(values) { const sorted = [...values].sort((a, b) => a - b); return sorted[Math.floor(sorted.length / 2)]; }
function options() { return { cacheEdges: false, supportLayout: 'packed', prefixClasses: 4096 }; }

let source = await readFile(SOURCE_URL, 'utf8');
source = replaceOnce(source,
  `  const emptyBits = new Uint32Array(WORDS_PER_CLASS);`,
  `  function internBitsKnownDirty(bits, parentId, dirtySlotMask) {\n    metrics.internLookups += 1;\n    let sameAsParent = true;\n    for (let slot = 0; slot < CHUNKS_PER_CLASS; slot += 1) {\n      const parentChunk = classSlotIds[slot][parentId];\n      const slotBit = 1 << slot;\n      if ((dirtySlotMask & slotBit) === 0) {\n        chunkIds[slot] = parentChunk;\n        metrics.parentChunkReuses += 1;\n        continue;\n      }\n      const offset = slot * CHUNK_WORDS;\n      if (slotPools[slot].equals(parentChunk, bits, offset)) {\n        chunkIds[slot] = parentChunk;\n        metrics.parentChunkReuses += 1;\n        continue;\n      }\n      sameAsParent = false;\n      chunkIds[slot] = slotPools[slot].intern(bits, offset);\n      metrics.chunkInterns += 1;\n    }\n    if (sameAsParent) {\n      metrics.internHits += 1;\n      return parentId;\n    }\n    if ((classCount + 1) * 10 >= classHashSlots.length * 7) growClassHash();\n    const hash = hashChunkTuple(chunkIds);\n    const mask = classHashSlots.length - 1;\n    let slot = hash & mask;\n    while (true) {\n      const id = classHashSlots[slot];\n      if (id === -1) break;\n      if (classHashes[id] === hash && classEquals(id, chunkIds)) {\n        metrics.internHits += 1;\n        return id;\n      }\n      slot = (slot + 1) & mask;\n    }\n\n    for (let chunk = 0; chunk < CHUNKS_PER_CLASS; chunk += 1) ensureReferenceWidth(chunk, chunkIds[chunk]);\n    ensureClassCapacity(classCount + 1);\n    const id = classCount;\n    for (let chunk = 0; chunk < CHUNKS_PER_CLASS; chunk += 1) classSlotIds[chunk][id] = chunkIds[chunk];\n    classHashes[id] = hash;\n    const [lo, hi] = computeSingletonMasks(bits);\n    singletonLo[id] = lo;\n    singletonHi[id] = hi;\n    classHashSlots[slot] = id;\n    classCount += 1;\n    metrics.internMisses += 1;\n    return id;\n  }\n\n  const emptyBits = new Uint32Array(WORDS_PER_CLASS);`,
  'dirty intern helper');
source = replaceOnce(source,
  `    loadClassBits(id, inputBits);\n    reducedBits.fill(0);\n    let affected = false;`,
  `    let dirtySlotMask = 0;\n    loadClassBits(id, inputBits);\n    reducedBits.fill(0);\n    let affected = false;`,
  'dirty mask init');
source = replaceOnce(source,
  `      if (active !== 0) affected = true;`,
  `      if (active !== 0) {\n        affected = true;\n        dirtySlotMask |= 1 << (word >>> 1);\n      }`,
  'source dirty mark');
source = replaceOnce(source,
  `    for (let word = 0; word < WORDS_PER_CLASS; word += 1) resultBits[word] = (resultBits[word] | reducedBits[word]) >>> 0;`,
  `    for (let word = 0; word < WORDS_PER_CLASS; word += 1) {\n      const before = resultBits[word] >>> 0;\n      const after = (before | reducedBits[word]) >>> 0;\n      resultBits[word] = after;\n      if (after !== before) dirtySlotMask |= 1 << (word >>> 1);\n    }`,
  'target dirty mark');
source = replaceOnce(source,
  `          resultBits[targetWord] = (resultBits[targetWord] & ~mask) >>> 0;\n          metrics.supersetWordProbes += 1;`,
  `          const before = resultBits[targetWord] >>> 0;\n          const after = (before & ~mask) >>> 0;\n          resultBits[targetWord] = after;\n          if (after !== before) dirtySlotMask |= 1 << (targetWord >>> 1);\n          metrics.supersetWordProbes += 1;`,
  'normalization dirty mark');
source = replaceOnce(source,
  `    const result = internBits(resultBits, id);\n    cacheSet(ownTransitions, id, cell, result);`,
  `    const result = internBitsKnownDirty(resultBits, id, dirtySlotMask);\n    cacheSet(ownTransitions, id, cell, result);`,
  'dirty intern use');
await writeFile(GENERATED_URL, source, 'utf8');
const { installSlot64ResidualPool: installCandidatePool } = await import(`${GENERATED_URL.href}?dense-dirty-own-v1`);

function createBaseline(spec) { return createSlot64ResidualQuotientKernel(spec, options()); }
function createCandidate(spec) {
  const kernel = createQuotientNativeNegamaxSupportLayoutKernel(spec, options());
  const residual = installCandidatePool(kernel, spec, { prefixClasses: 4096 });
  return Object.freeze({ kernel, residual });
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
  for (let index = 0; index < a.length; index += 1) if (a[index] !== b[index]) return false;
  return true;
}

function qualifyGraph(spec) {
  const baseline = createBaseline(spec).kernel;
  const candidate = createCandidate(spec).kernel;
  const baselineCensus = enumerate(baseline);
  const candidateCensus = enumerate(candidate);
  assert(baselineCensus.states === spec.expectedStates, 'baseline state census drift');
  assert(JSON.stringify(candidateCensus) === JSON.stringify(baselineCensus), 'dense-dirty edge census mismatch');
  assert(candidate.classes.size === baseline.classes.size, 'dense-dirty class count mismatch');
  assert(candidate.states.count === baseline.states.count, 'dense-dirty q-state count mismatch');
  for (let classId = 0; classId < baseline.classes.size; classId += 1) {
    assert(arraysEqual(candidate.classes.termIds(classId), baseline.classes.termIds(classId)), `class ${classId} term-ID mismatch`);
  }
  for (let stateId = 0; stateId < baseline.states.count; stateId += 1) {
    const a = baseline.stateView(stateId);
    const b = candidate.stateView(stateId);
    assert(a.supportIndex === b.supportIndex && a.p0Class === b.p0Class && a.p1Class === b.p1Class, `state ${stateId} tuple mismatch`);
    for (let column = 0; column < spec.columns; column += 1) {
      assert(candidate.advance(stateId, column) === baseline.advance(stateId, column), `edge ${stateId}/${column} mismatch`);
    }
  }
  return {
    census: baselineCensus,
    classes: baseline.classes.size,
    baselineMemory: baseline.memoryStats(),
    candidateMemory: candidate.memoryStats(),
    baselineMetrics: { ...baseline.classes.metrics },
    candidateMetrics: { ...candidate.classes.metrics },
  };
}

function expectedRootActions(spec, oracle) {
  const values = Array(spec.columns).fill(null);
  for (let column = 0; column < spec.columns; column += 1) {
    const heights = Array(spec.columns).fill(0); heights[column] = 1;
    values[column] = oracle.evaluate({ heights, p0OwnershipMask: 1n << BigInt(column) });
  }
  return values;
}

function runOnce(spec, candidate, expectedWdl, expectedActions, qualifyActions = false) {
  const started = performance.now();
  const wrap = candidate ? createCandidate(spec) : createBaseline(spec);
  const setupMs = performance.now() - started;
  const solver = wrap.kernel.createWdlSolver({ wdlMode: 'full', etc: false });
  const solveStarted = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStarted;
  assert(result === expectedWdl, `${candidate ? 'dense-dirty' : 'baseline'} root WDL mismatch`);
  let actions = null;
  if (qualifyActions) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `${candidate ? 'dense-dirty' : 'baseline'} root action ${column} mismatch`);
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
  const candidateQualification = runOnce(spec, true, oracle.rootWdl, expectedActions, true);
  assert(candidateQualification.expanded === baselineQualification.expanded, 'dense-dirty expansion count mismatch');
  assert(candidateQualification.calls === baselineQualification.calls, 'dense-dirty call count mismatch');
  const baselineRuns = []; const candidateRuns = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    if ((repeat & 1) === 0) {
      baselineRuns.push(runOnce(spec, false, oracle.rootWdl, expectedActions));
      candidateRuns.push(runOnce(spec, true, oracle.rootWdl, expectedActions));
    } else {
      candidateRuns.push(runOnce(spec, true, oracle.rootWdl, expectedActions));
      baselineRuns.push(runOnce(spec, false, oracle.rootWdl, expectedActions));
    }
  }
  const baselineMs = median(baselineRuns.map((entry) => entry.totalMs));
  const candidateMs = median(candidateRuns.map((entry) => entry.totalMs));
  const baselineSolveMs = median(baselineRuns.map((entry) => entry.solveMs));
  const candidateSolveMs = median(candidateRuns.map((entry) => entry.solveMs));
  const baselineRep = [...baselineRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  const candidateRep = [...candidateRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  return {
    baselineMs, candidateMs, ratio: candidateMs / baselineMs,
    baselineSolveMs, candidateSolveMs, solveRatio: candidateSolveMs / baselineSolveMs,
    baselineRepresentative: baselineRep, candidateRepresentative: candidateRep,
  };
}

try {
  const qualification = CASES.map((spec) => ({ geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`, ...qualifyGraph(spec) }));
  const benchmark = bench(CASES.at(-1));
  const result = {
    kind: 'connect4-slot64-dense-dirty-mover-v1',
    status: 'complete',
    date: '2026-09-11',
    contract: {
      baseline: 'qualified slot64-v2',
      candidate: 'unchanged dense mover transform plus conservative dirty-slot mask to skip known-clean parent chunk comparisons',
      exactness: 'complete class/qID/edge identity on all bounded controls plus independent BSFP root/action WDL and identical Negamax work',
    },
    qualification,
    benchmark4x5: benchmark,
  };
  console.error(`SLOT64_DENSE_DIRTY_OWN_SUMMARY=${JSON.stringify({
    baselineMs: benchmark.baselineMs,
    candidateMs: benchmark.candidateMs,
    ratio: benchmark.ratio,
    baselineSolveMs: benchmark.baselineSolveMs,
    candidateSolveMs: benchmark.candidateSolveMs,
    solveRatio: benchmark.solveRatio,
    baselineOwnMisses: benchmark.baselineRepresentative.metrics.ownTransitionMisses,
    candidateOwnMisses: benchmark.candidateRepresentative.metrics.ownTransitionMisses,
    baselineParentReuses: benchmark.baselineRepresentative.metrics.parentChunkReuses,
    candidateParentReuses: benchmark.candidateRepresentative.metrics.parentChunkReuses,
    baselineChunkInterns: benchmark.baselineRepresentative.metrics.chunkInterns,
    candidateChunkInterns: benchmark.candidateRepresentative.metrics.chunkInterns,
    baselineBytes: benchmark.baselineRepresentative.memory.totalTypedBytes,
    candidateBytes: benchmark.candidateRepresentative.memory.totalTypedBytes,
  })}`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await unlink(GENERATED_URL).catch(() => {});
}
