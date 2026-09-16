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
const GENERATED_URL = new URL('./quotient-slot64-residual-pool-direct-own.generated.mjs', import.meta.url);

const OLD_OWN = `  pool.ownTransition = function ownTransitionSlot64(id, cell, bitLo, bitHi) {
    const cached = cacheGet(ownTransitions, id, cell, true);
    if (cached !== CLASS_UNKNOWN) { metrics.ownTransitionHits += 1; return cached; }
    metrics.ownTransitionMisses += 1;
    if ((((singletonLo[id] & bitLo) >>> 0) !== 0) || (((singletonHi[id] & bitHi) >>> 0) !== 0)) {
      cacheSet(ownTransitions, id, cell, CLASS_TERMINAL_WIN);
      metrics.ownTerminal += 1;
      return CLASS_TERMINAL_WIN;
    }

    loadClassBits(id, inputBits);
    reducedBits.fill(0);
    let affected = false;
    const containsBase = cell * WORDS_PER_CLASS;
    for (let word = 0; word < WORDS_PER_CLASS; word += 1) {
      const input = inputBits[word] >>> 0;
      let active = (input & containsMasks[containsBase + word]) >>> 0;
      resultBits[word] = (input & ~containsMasks[containsBase + word]) >>> 0;
      if (active !== 0) affected = true;
      while (active !== 0) {
        const lsb = (active & -active) >>> 0;
        const termId = (word << 5) + bitIndex32(lsb);
        const target = vocabulary.reduce[termId * vocabulary.cellCount + cell];
        if (target === vocabulary.terminal) {
          cacheSet(ownTransitions, id, cell, CLASS_TERMINAL_WIN);
          metrics.ownTerminal += 1;
          return CLASS_TERMINAL_WIN;
        }
        reducedBits[target >>> 5] |= 1 << (target & 31);
        metrics.reducedTerms += 1;
        active = (active & (active - 1)) >>> 0;
      }
    }
    if (!affected) {
      cacheSet(ownTransitions, id, cell, id);
      metrics.ownNoop += 1;
      return id;
    }

    for (let word = 0; word < WORDS_PER_CLASS; word += 1) resultBits[word] = (resultBits[word] | reducedBits[word]) >>> 0;
    for (let word = 0; word < WORDS_PER_CLASS; word += 1) {
      let active = reducedBits[word] >>> 0;
      while (active !== 0) {
        const lsb = (active & -active) >>> 0;
        const termId = (word << 5) + bitIndex32(lsb);
        const start = strictSupersetStarts[termId];
        const end = strictSupersetStarts[termId + 1];
        for (let entry = start; entry < end; entry += 1) {
          const targetWord = strictSupersetWordIndex[entry];
          const mask = strictSupersetWordMask[entry];
          resultBits[targetWord] = (resultBits[targetWord] & ~mask) >>> 0;
          metrics.supersetWordProbes += 1;
          metrics.supersetWordClears += 1;
        }
        active = (active & (active - 1)) >>> 0;
      }
    }

    const result = internBits(resultBits, id);
    cacheSet(ownTransitions, id, cell, result);
    return result;
  };`;

const NEW_OWN = `  pool.ownTransition = function ownTransitionSlot64Direct(id, cell, bitLo, bitHi) {
    const cached = cacheGet(ownTransitions, id, cell, true);
    if (cached !== CLASS_UNKNOWN) { metrics.ownTransitionHits += 1; return cached; }
    metrics.ownTransitionMisses += 1;
    if ((((singletonLo[id] & bitLo) >>> 0) !== 0) || (((singletonHi[id] & bitHi) >>> 0) !== 0)) {
      cacheSet(ownTransitions, id, cell, CLASS_TERMINAL_WIN);
      metrics.ownTerminal += 1;
      return CLASS_TERMINAL_WIN;
    }

    reducedBits.fill(0);
    let affected = false;
    let dirtySlotMask = 0;
    let targetSlotMask = 0;
    const containsBase = cell * WORDS_PER_CLASS;

    for (let slotIndex = 0; slotIndex < CHUNKS_PER_CLASS; slotIndex += 1) {
      const offset = slotIndex * CHUNK_WORDS;
      const mask0 = containsMasks[containsBase + offset] >>> 0;
      const mask1 = containsMasks[containsBase + offset + 1] >>> 0;
      if ((mask0 | mask1) === 0) continue;

      const parentChunk = classSlotIds[slotIndex][id];
      const parentBase = parentChunk * CHUNK_WORDS;
      const input0 = slotPools[slotIndex].words[parentBase] >>> 0;
      const input1 = slotPools[slotIndex].words[parentBase + 1] >>> 0;
      let active0 = (input0 & mask0) >>> 0;
      let active1 = (input1 & mask1) >>> 0;
      if ((active0 | active1) === 0) continue;

      affected = true;
      dirtySlotMask |= 1 << slotIndex;
      resultBits[offset] = (input0 & ~mask0) >>> 0;
      resultBits[offset + 1] = (input1 & ~mask1) >>> 0;

      while (active0 !== 0) {
        const lsb = (active0 & -active0) >>> 0;
        const termId = (slotIndex << 6) + bitIndex32(lsb);
        const target = vocabulary.reduce[termId * vocabulary.cellCount + cell];
        if (target === vocabulary.terminal) {
          cacheSet(ownTransitions, id, cell, CLASS_TERMINAL_WIN);
          metrics.ownTerminal += 1;
          return CLASS_TERMINAL_WIN;
        }
        reducedBits[target >>> 5] |= 1 << (target & 31);
        targetSlotMask |= 1 << (target >>> 6);
        metrics.reducedTerms += 1;
        active0 = (active0 & (active0 - 1)) >>> 0;
      }
      while (active1 !== 0) {
        const lsb = (active1 & -active1) >>> 0;
        const termId = (slotIndex << 6) + 32 + bitIndex32(lsb);
        const target = vocabulary.reduce[termId * vocabulary.cellCount + cell];
        if (target === vocabulary.terminal) {
          cacheSet(ownTransitions, id, cell, CLASS_TERMINAL_WIN);
          metrics.ownTerminal += 1;
          return CLASS_TERMINAL_WIN;
        }
        reducedBits[target >>> 5] |= 1 << (target & 31);
        targetSlotMask |= 1 << (target >>> 6);
        metrics.reducedTerms += 1;
        active1 = (active1 & (active1 - 1)) >>> 0;
      }
    }

    if (!affected) {
      cacheSet(ownTransitions, id, cell, id);
      metrics.ownNoop += 1;
      return id;
    }

    let singletonAddLo = 0;
    let singletonAddHi = 0;
    let pendingSlots = targetSlotMask >>> 0;
    while (pendingSlots !== 0) {
      const slotBit = (pendingSlots & -pendingSlots) >>> 0;
      const slotIndex = bitIndex32(slotBit);
      const offset = slotIndex * CHUNK_WORDS;
      const add0 = reducedBits[offset] >>> 0;
      const add1 = reducedBits[offset + 1] >>> 0;
      const dirtyBit = 1 << slotIndex;
      if ((dirtySlotMask & dirtyBit) !== 0) {
        resultBits[offset] = (resultBits[offset] | add0) >>> 0;
        resultBits[offset + 1] = (resultBits[offset + 1] | add1) >>> 0;
      } else {
        const parentChunk = classSlotIds[slotIndex][id];
        const parentBase = parentChunk * CHUNK_WORDS;
        const parent0 = slotPools[slotIndex].words[parentBase] >>> 0;
        const parent1 = slotPools[slotIndex].words[parentBase + 1] >>> 0;
        const next0 = (parent0 | add0) >>> 0;
        const next1 = (parent1 | add1) >>> 0;
        if (next0 !== parent0 || next1 !== parent1) {
          resultBits[offset] = next0;
          resultBits[offset + 1] = next1;
          dirtySlotMask |= dirtyBit;
        }
      }
      pendingSlots = (pendingSlots & (pendingSlots - 1)) >>> 0;
    }

    pendingSlots = targetSlotMask >>> 0;
    while (pendingSlots !== 0) {
      const slotBit = (pendingSlots & -pendingSlots) >>> 0;
      const slotIndex = bitIndex32(slotBit);
      const offset = slotIndex * CHUNK_WORDS;
      for (let localWord = 0; localWord < CHUNK_WORDS; localWord += 1) {
        const word = offset + localWord;
        let active = reducedBits[word] >>> 0;
        while (active !== 0) {
          const lsb = (active & -active) >>> 0;
          const termId = (word << 5) + bitIndex32(lsb);
          if (vocabulary.cardinality[termId] === 1) {
            singletonAddLo = (singletonAddLo | vocabulary.lo[termId]) >>> 0;
            singletonAddHi = (singletonAddHi | vocabulary.hi[termId]) >>> 0;
          }
          const start = strictSupersetStarts[termId];
          const end = strictSupersetStarts[termId + 1];
          for (let entry = start; entry < end; entry += 1) {
            const targetWord = strictSupersetWordIndex[entry];
            const clearMask = strictSupersetWordMask[entry] >>> 0;
            const targetSlot = targetWord >>> 1;
            const targetOffset = targetSlot * CHUNK_WORDS;
            const targetDirtyBit = 1 << targetSlot;
            metrics.supersetWordProbes += 1;
            metrics.supersetWordClears += 1;
            if ((dirtySlotMask & targetDirtyBit) !== 0) {
              resultBits[targetWord] = (resultBits[targetWord] & ~clearMask) >>> 0;
              continue;
            }
            const parentChunk = classSlotIds[targetSlot][id];
            const parentBase = parentChunk * CHUNK_WORDS;
            const parentWord = slotPools[targetSlot].words[parentBase + (targetWord & 1)] >>> 0;
            if ((parentWord & clearMask) === 0) continue;
            resultBits[targetOffset] = slotPools[targetSlot].words[parentBase] >>> 0;
            resultBits[targetOffset + 1] = slotPools[targetSlot].words[parentBase + 1] >>> 0;
            resultBits[targetWord] = (resultBits[targetWord] & ~clearMask) >>> 0;
            dirtySlotMask |= targetDirtyBit;
          }
          active = (active & (active - 1)) >>> 0;
        }
      }
      pendingSlots = (pendingSlots & (pendingSlots - 1)) >>> 0;
    }

    metrics.internLookups += 1;
    let changedSlots = 0;
    for (let slotIndex = 0; slotIndex < CHUNKS_PER_CLASS; slotIndex += 1) {
      const parentChunk = classSlotIds[slotIndex][id];
      chunkIds[slotIndex] = parentChunk;
      const dirtyBit = 1 << slotIndex;
      if ((dirtySlotMask & dirtyBit) !== 0) {
        const offset = slotIndex * CHUNK_WORDS;
        if (!slotPools[slotIndex].equals(parentChunk, resultBits, offset)) {
          chunkIds[slotIndex] = slotPools[slotIndex].intern(resultBits, offset);
          metrics.chunkInterns += 1;
          changedSlots += 1;
          continue;
        }
      }
      metrics.parentChunkReuses += 1;
    }

    if (changedSlots === 0) {
      metrics.internHits += 1;
      cacheSet(ownTransitions, id, cell, id);
      return id;
    }

    if ((classCount + 1) * 10 >= classHashSlots.length * 7) growClassHash();
    const hash = hashChunkTuple(chunkIds);
    const hashMask = classHashSlots.length - 1;
    let hashSlot = hash & hashMask;
    while (true) {
      const existingId = classHashSlots[hashSlot];
      if (existingId === -1) break;
      if (classHashes[existingId] === hash && classEquals(existingId, chunkIds)) {
        metrics.internHits += 1;
        cacheSet(ownTransitions, id, cell, existingId);
        return existingId;
      }
      hashSlot = (hashSlot + 1) & hashMask;
    }

    for (let slotIndex = 0; slotIndex < CHUNKS_PER_CLASS; slotIndex += 1) ensureReferenceWidth(slotIndex, chunkIds[slotIndex]);
    ensureClassCapacity(classCount + 1);
    const result = classCount;
    for (let slotIndex = 0; slotIndex < CHUNKS_PER_CLASS; slotIndex += 1) classSlotIds[slotIndex][result] = chunkIds[slotIndex];
    classHashes[result] = hash;
    singletonLo[result] = (singletonLo[id] | singletonAddLo) >>> 0;
    singletonHi[result] = (singletonHi[id] | singletonAddHi) >>> 0;
    classHashSlots[hashSlot] = result;
    classCount += 1;
    metrics.internMisses += 1;
    cacheSet(ownTransitions, id, cell, result);
    return result;
  };`;

function assert(condition, message) { if (!condition) throw new Error(message); }
function median(values) { const sorted = [...values].sort((a, b) => a - b); return sorted[Math.floor(sorted.length / 2)]; }
function options() { return { cacheEdges: false, supportLayout: 'packed', prefixClasses: 4096 }; }

const source = await readFile(SOURCE_URL, 'utf8');
const seam = source.indexOf(OLD_OWN);
assert(seam >= 0, 'qualified slot64-v2 ownTransition seam not found');
assert(source.indexOf(OLD_OWN, seam + OLD_OWN.length) < 0, 'slot64-v2 ownTransition seam is ambiguous');
await writeFile(GENERATED_URL, source.slice(0, seam) + NEW_OWN + source.slice(seam + OLD_OWN.length), 'utf8');
const { installSlot64ResidualPool: installDirectOwnPool } = await import(`${GENERATED_URL.href}?direct-own-v1`);

function createBaseline(spec) { return createSlot64ResidualQuotientKernel(spec, options()); }
function createDirect(spec) {
  const kernel = createQuotientNativeNegamaxSupportLayoutKernel(spec, options());
  const residual = installDirectOwnPool(kernel, spec, { prefixClasses: 4096 });
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
  const direct = createDirect(spec).kernel;
  const baselineCensus = enumerate(baseline);
  const directCensus = enumerate(direct);
  assert(baselineCensus.states === spec.expectedStates, 'baseline state census drift');
  assert(JSON.stringify(directCensus) === JSON.stringify(baselineCensus), 'direct-own edge census mismatch');
  assert(direct.classes.size === baseline.classes.size, 'direct-own class count mismatch');
  assert(direct.states.count === baseline.states.count, 'direct-own q-state count mismatch');
  for (let classId = 0; classId < baseline.classes.size; classId += 1) {
    assert(arraysEqual(direct.classes.termIds(classId), baseline.classes.termIds(classId)), `class ${classId} term-ID mismatch`);
  }
  for (let stateId = 0; stateId < baseline.states.count; stateId += 1) {
    const a = baseline.stateView(stateId);
    const b = direct.stateView(stateId);
    assert(a.supportIndex === b.supportIndex && a.p0Class === b.p0Class && a.p1Class === b.p1Class, `state ${stateId} tuple mismatch`);
    for (let column = 0; column < spec.columns; column += 1) {
      assert(direct.advance(stateId, column) === baseline.advance(stateId, column), `edge ${stateId}/${column} mismatch`);
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
    const heights = Array(spec.columns).fill(0); heights[column] = 1;
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
  assert(result === expectedWdl, `${direct ? 'direct-own' : 'baseline'} root WDL mismatch`);
  let actions = null;
  if (qualifyActions) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `${direct ? 'direct-own' : 'baseline'} root action ${column} mismatch`);
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
  assert(directQualification.expanded === baselineQualification.expanded, 'direct-own expansion count mismatch');
  assert(directQualification.calls === baselineQualification.calls, 'direct-own call count mismatch');
  const baselineRuns = []; const directRuns = [];
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
  const baselineRep = [...baselineRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  const directRep = [...directRuns].sort((a, b) => a.totalMs - b.totalMs)[Math.floor(repeats / 2)];
  return {
    baselineMs, directMs, ratio: directMs / baselineMs,
    baselineSolveMs, directSolveMs, solveRatio: directSolveMs / baselineSolveMs,
    baselineRepresentative: baselineRep, directRepresentative: directRep,
  };
}

try {
  const qualification = CASES.map((spec) => ({ geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`, ...qualifyGraph(spec) }));
  const benchmark = bench(CASES.at(-1));
  const result = {
    kind: 'connect4-slot64-direct-own-transition-v1',
    status: 'complete',
    date: '2026-09-11',
    contract: {
      baseline: 'qualified slot64-v2 with sparse normalization and direct blocking',
      candidate: 'lazy slot-local mover reduction/target insertion/normalization plus incremental singleton metadata',
      exactness: 'complete class/qID/edge identity on all bounded controls plus independent BSFP root/action WDL and identical Negamax work',
    },
    qualification,
    benchmark4x5: benchmark,
  };
  console.error(`SLOT64_DIRECT_OWN_SUMMARY=${JSON.stringify({
    baselineMs: benchmark.baselineMs,
    directMs: benchmark.directMs,
    ratio: benchmark.ratio,
    baselineSolveMs: benchmark.baselineSolveMs,
    directSolveMs: benchmark.directSolveMs,
    solveRatio: benchmark.solveRatio,
    baselineOwnMisses: benchmark.baselineRepresentative.metrics.ownTransitionMisses,
    directOwnMisses: benchmark.directRepresentative.metrics.ownTransitionMisses,
    baselineChunkInterns: benchmark.baselineRepresentative.metrics.chunkInterns,
    directChunkInterns: benchmark.directRepresentative.metrics.chunkInterns,
    baselineBytes: benchmark.baselineRepresentative.memory.totalTypedBytes,
    directBytes: benchmark.directRepresentative.memory.totalTypedBytes,
  })}`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await unlink(GENERATED_URL).catch(() => {});
}
