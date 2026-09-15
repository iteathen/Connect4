import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { openCudaRuntime } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';

import { createCoverage64ExperimentalPlan } from './plan.mjs';

const U32_BYTES = 4;
const DEFAULT_SEGMENTS = 4;
const DEFAULT_CELLS = 12;
const DEFAULT_DICTIONARY = 48;
const PORTABLE_SIDE = 12;
const NATIVE_SIDE = 128;
const NATIVE_WARMUPS = 1;
const NATIVE_REPETITIONS = 5;

function positiveIntegerEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${name} must be a positive safe integer`);
  return value;
}

function xorshift32(state) {
  let value = state >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return value >>> 0;
}

function bit64(id) {
  if (id < 32) return [((1 << id) >>> 0), 0];
  return [0, ((1 << (id - 32)) >>> 0)];
}

function subsetCells(left, right) {
  return (left & ~right) === 0;
}

function pop32(value) {
  let x = value >>> 0;
  let count = 0;
  while (x !== 0) { x &= x - 1; count += 1; }
  return count;
}

function subset64(a, b) {
  return ((a.lo & ~b.lo) >>> 0) === 0 && ((a.hi & ~b.hi) >>> 0) === 0;
}

function key64(value) {
  return `${value.hi.toString(16).padStart(8, '0')}:${value.lo.toString(16).padStart(8, '0')}`;
}

function normalizeMinimal64(values) {
  const unique = new Map();
  for (const value of values) unique.set(key64(value), { lo: value.lo >>> 0, hi: value.hi >>> 0 });
  const ordered = [...unique.values()].sort((a, b) => {
    const delta = pop32(a.lo) + pop32(a.hi) - pop32(b.lo) - pop32(b.hi);
    if (delta !== 0) return delta;
    return a.hi - b.hi || a.lo - b.lo;
  });
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) if (subset64(retained, candidate)) continue outer;
    result.push(candidate);
  }
  return result;
}

function createDictionary(cellCount, dictionarySize, seed) {
  if (cellCount >= 31) throw new RangeError('synthetic fixture uses u32 cell masks and requires cellCount < 31');
  if (dictionarySize > 64 || dictionarySize < cellCount) throw new RangeError('dictionarySize must be in [cellCount, 64]');

  const clauses = [];
  for (let cell = 0; cell < cellCount; cell += 1) clauses.push((1 << cell) >>> 0);

  let state = seed >>> 0;
  while (clauses.length < dictionarySize) {
    state = xorshift32(state + clauses.length + 1);
    const size = 2 + (state % Math.min(4, Math.max(1, cellCount - 1)));
    let clause = 0;
    let cursor = state;
    while (pop32(clause) < Math.min(size, cellCount)) {
      cursor = xorshift32(cursor + 0x9e3779b9);
      clause |= 1 << (cursor % cellCount);
    }
    clause >>>= 0;
    if (!clauses.includes(clause)) clauses.push(clause);
  }

  const contains = Array.from({ length: cellCount }, () => ({ lo: 0, hi: 0 }));
  for (let id = 0; id < clauses.length; id += 1) {
    const [bitLo, bitHi] = bit64(id);
    for (let cell = 0; cell < cellCount; cell += 1) {
      if ((clauses[id] & (1 << cell)) !== 0) {
        contains[cell].lo = (contains[cell].lo | bitLo) >>> 0;
        contains[cell].hi = (contains[cell].hi | bitHi) >>> 0;
      }
    }
  }

  let singletonMaskLo = 0;
  let singletonMaskHi = 0;
  const singletonBits = [];
  for (let cell = 0; cell < cellCount; cell += 1) {
    const [lo, hi] = bit64(cell);
    singletonMaskLo = (singletonMaskLo | lo) >>> 0;
    singletonMaskHi = (singletonMaskHi | hi) >>> 0;
    singletonBits.push({ lo, hi });
  }

  return { clauses, contains, singletonBits, singletonMaskLo, singletonMaskHi };
}

function normalizeClauseIDs(ids, clauses) {
  const unique = [...new Set(ids)];
  unique.sort((a, b) => pop32(clauses[a]) - pop32(clauses[b]) || clauses[a] - clauses[b]);
  const result = [];
  outer: for (const id of unique) {
    for (const retained of result) if (subsetCells(clauses[retained], clauses[id])) continue outer;
    result.push(id);
  }
  return result;
}

function coverageOf(ids, clauses) {
  let lo = 0;
  let hi = 0;
  for (let id = 0; id < clauses.length; id += 1) {
    for (const minimum of ids) {
      if (subsetCells(clauses[minimum], clauses[id])) {
        const [bitLo, bitHi] = bit64(id);
        lo = (lo | bitLo) >>> 0;
        hi = (hi | bitHi) >>> 0;
        break;
      }
    }
  }
  return { lo, hi };
}

function createRecords(count, dictionary, seed) {
  const records = [];
  const seen = new Set();
  let state = seed >>> 0;
  while (records.length < count) {
    state = xorshift32(state + records.length + 1);
    const terms = 1 + (state % 5);
    const ids = [];
    let cursor = state;
    for (let index = 0; index < terms; index += 1) {
      cursor = xorshift32(cursor + index + 0x7f4a7c15);
      ids.push(cursor % dictionary.clauses.length);
    }
    const record = coverageOf(normalizeClauseIDs(ids, dictionary.clauses), dictionary.clauses);
    const key = key64(record);
    if (!seen.has(key)) {
      seen.add(key);
      records.push(record);
    }
  }
  return records;
}

function capacityKeep(candidate, dictionary, exactCount) {
  const forced = {
    lo: (candidate.lo & dictionary.singletonMaskLo) >>> 0,
    hi: (candidate.hi & dictionary.singletonMaskHi) >>> 0,
  };
  const forcedCount = pop32(forced.lo) + pop32(forced.hi);
  if (forcedCount > exactCount) return false;

  let satisfiedLo = 0;
  let satisfiedHi = 0;
  for (let cell = 0; cell < dictionary.singletonBits.length; cell += 1) {
    const bit = dictionary.singletonBits[cell];
    if ((forced.lo & bit.lo) !== 0 || (forced.hi & bit.hi) !== 0) {
      satisfiedLo = (satisfiedLo | dictionary.contains[cell].lo) >>> 0;
      satisfiedHi = (satisfiedHi | dictionary.contains[cell].hi) >>> 0;
    }
  }

  const extra = {
    lo: (candidate.lo & ~satisfiedLo) >>> 0,
    hi: (candidate.hi & ~satisfiedHi) >>> 0,
  };
  if (extra.lo === 0 && extra.hi === 0) return true;
  if (forcedCount === exactCount) return false;
  if (forcedCount + 1 !== exactCount) return true;

  for (let cell = 0; cell < dictionary.singletonBits.length; cell += 1) {
    const bit = dictionary.singletonBits[cell];
    if ((forced.lo & bit.lo) !== 0 || (forced.hi & bit.hi) !== 0) continue;
    if (subset64(extra, dictionary.contains[cell])) return true;
  }
  return false;
}

function cpuPairReduce(left, right, dictionary, exactCount) {
  const candidates = [];
  let rejected = 0;
  for (const a of left) {
    for (const b of right) {
      const candidate = { lo: (a.lo | b.lo) >>> 0, hi: (a.hi | b.hi) >>> 0 };
      if (capacityKeep(candidate, dictionary, exactCount)) candidates.push(candidate);
      else rejected += 1;
    }
  }
  return { frontier: normalizeMinimal64(candidates), rejected };
}

function createFixture(segmentCount, side, cellCount, dictionarySize) {
  const segments = [];
  let totalLeft = 0;
  let totalRight = 0;
  let totalCandidates = 0;

  for (let segment = 0; segment < segmentCount; segment += 1) {
    const dictionary = createDictionary(cellCount, dictionarySize, 0x9e3779b9 ^ (segment * 0x45d9f3b));
    const left = createRecords(side, dictionary, 0xa5a5a5a5 ^ segment);
    const right = createRecords(side, dictionary, 0x3c6ef372 ^ (segment * 17));
    const exactCount = Math.max(1, Math.floor(cellCount / 2) + (segment & 1));
    const authority = cpuPairReduce(left, right, dictionary, exactCount);
    segments.push({ dictionary, left, right, exactCount, authority });
    totalLeft += left.length;
    totalRight += right.length;
    totalCandidates += left.length * right.length;
  }

  return { segments, totalLeft, totalRight, totalCandidates, cellCount, dictionarySize };
}

function encodeU32(values) {
  return new Uint8Array(values.buffer, values.byteOffset, values.byteLength);
}

async function allocateU32(runtime, count, access = 'read-write') {
  const memory = await runtime.allocateDevice({ byteLength: count * U32_BYTES });
  const view = await memory.view({ dtype: 'u32', elementCount: count, access });
  return { memory, view, count };
}

async function writeU32(allocation, values) {
  assert.equal(values.length, allocation.count);
  await allocation.memory.write(encodeU32(values));
}

async function readU32(allocation) {
  const result = await allocation.memory.read({ byteLength: allocation.count * U32_BYTES });
  return new Uint32Array(result.bytes.buffer, result.bytes.byteOffset, allocation.count);
}

async function closeAllocation(allocation) {
  await allocation.view.close();
  await allocation.memory.close();
}

function summarize(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  const sum = sorted.reduce((total, value) => total + value, 0);
  return { min: sorted[0], median: sorted[Math.floor(sorted.length / 2)], mean: sum / sorted.length, max: sorted.at(-1) };
}

async function runOperation(plan, bindings) {
  const started = performance.now();
  const operation = await plan.submit(bindings);
  try {
    const terminal = await operation.wait();
    assert.equal(terminal.status, 'completed');
    return performance.now() - started;
  } finally {
    await operation.close();
  }
}

async function qualify(runtime, native, fixture) {
  const segmentCount = fixture.segments.length;
  const maxCells = fixture.cellCount;
  const outputCapacityPerSegment = fixture.segments.reduce((maximum, segment) => Math.max(maximum, segment.authority.frontier.length + 16), 1);
  const allocations = [];

  const planStart = performance.now();
  const plan = await createCoverage64ExperimentalPlan(runtime, {
    leftCapacity: fixture.totalLeft,
    rightCapacity: fixture.totalRight,
    candidateCapacity: fixture.totalCandidates,
    segmentCapacity: segmentCount,
    outputCapacityPerSegment,
    maxCells,
    blockSize: 256,
  });
  const compileLoadPrepareMs = performance.now() - planStart;

  try {
    const leftLoHost = new Uint32Array(fixture.totalLeft);
    const leftHiHost = new Uint32Array(fixture.totalLeft);
    const rightLoHost = new Uint32Array(fixture.totalRight);
    const rightHiHost = new Uint32Array(fixture.totalRight);
    const leftOffsetsHost = new Uint32Array(segmentCount + 1);
    const rightOffsetsHost = new Uint32Array(segmentCount + 1);
    const candidateOffsetsHost = new Uint32Array(segmentCount + 1);
    const exactCountsHost = new Uint32Array(segmentCount);
    const cellCountsHost = new Uint32Array(segmentCount);
    const singletonMaskLoHost = new Uint32Array(segmentCount);
    const singletonMaskHiHost = new Uint32Array(segmentCount);
    const cellMetadataCount = segmentCount * maxCells;
    const singletonBitsLoHost = new Uint32Array(cellMetadataCount);
    const singletonBitsHiHost = new Uint32Array(cellMetadataCount);
    const containsLoHost = new Uint32Array(cellMetadataCount);
    const containsHiHost = new Uint32Array(cellMetadataCount);

    let leftCursor = 0;
    let rightCursor = 0;
    let candidateCursor = 0;
    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
      const segment = fixture.segments[segmentIndex];
      leftOffsetsHost[segmentIndex] = leftCursor;
      rightOffsetsHost[segmentIndex] = rightCursor;
      candidateOffsetsHost[segmentIndex] = candidateCursor;
      exactCountsHost[segmentIndex] = segment.exactCount;
      cellCountsHost[segmentIndex] = maxCells;
      singletonMaskLoHost[segmentIndex] = segment.dictionary.singletonMaskLo;
      singletonMaskHiHost[segmentIndex] = segment.dictionary.singletonMaskHi;
      for (const value of segment.left) { leftLoHost[leftCursor] = value.lo; leftHiHost[leftCursor] = value.hi; leftCursor += 1; }
      for (const value of segment.right) { rightLoHost[rightCursor] = value.lo; rightHiHost[rightCursor] = value.hi; rightCursor += 1; }
      candidateCursor += segment.left.length * segment.right.length;
      for (let cell = 0; cell < maxCells; cell += 1) {
        const index = segmentIndex * maxCells + cell;
        singletonBitsLoHost[index] = segment.dictionary.singletonBits[cell].lo;
        singletonBitsHiHost[index] = segment.dictionary.singletonBits[cell].hi;
        containsLoHost[index] = segment.dictionary.contains[cell].lo;
        containsHiHost[index] = segment.dictionary.contains[cell].hi;
      }
    }
    leftOffsetsHost[segmentCount] = leftCursor;
    rightOffsetsHost[segmentCount] = rightCursor;
    candidateOffsetsHost[segmentCount] = candidateCursor;

    async function allocFrom(values, access = 'read') {
      const allocation = await allocateU32(runtime, values.length, access);
      allocations.push(allocation);
      await writeU32(allocation, values);
      return allocation;
    }

    const leftLo = await allocFrom(leftLoHost);
    const leftHi = await allocFrom(leftHiHost);
    const rightLo = await allocFrom(rightLoHost);
    const rightHi = await allocFrom(rightHiHost);
    const leftOffsets = await allocFrom(leftOffsetsHost);
    const rightOffsets = await allocFrom(rightOffsetsHost);
    const candidateOffsets = await allocFrom(candidateOffsetsHost);
    const exactCounts = await allocFrom(exactCountsHost);
    const cellCounts = await allocFrom(cellCountsHost);
    const singletonMaskLo = await allocFrom(singletonMaskLoHost);
    const singletonMaskHi = await allocFrom(singletonMaskHiHost);
    const singletonBitsLo = await allocFrom(singletonBitsLoHost);
    const singletonBitsHi = await allocFrom(singletonBitsHiHost);
    const containsLo = await allocFrom(containsLoHost);
    const containsHi = await allocFrom(containsHiHost);

    async function allocOutput(count) {
      const allocation = await allocateU32(runtime, count, 'read-write');
      allocations.push(allocation);
      return allocation;
    }

    const candidateLo = await allocOutput(fixture.totalCandidates);
    const candidateHi = await allocOutput(fixture.totalCandidates);
    const candidatePopcount = await allocOutput(fixture.totalCandidates);
    const generationStatus = await allocOutput(segmentCount);
    const rejectedCounts = await allocOutput(segmentCount);
    const outputElements = segmentCount * outputCapacityPerSegment;
    const outputLo = await allocOutput(outputElements);
    const outputHi = await allocOutput(outputElements);
    const outputCounts = await allocOutput(segmentCount);
    const outputStatus = await allocOutput(segmentCount);
    const checks = await allocOutput(fixture.totalCandidates);

    const bindings = {
      leftLo: leftLo.view, leftHi: leftHi.view, rightLo: rightLo.view, rightHi: rightHi.view,
      leftOffsets: leftOffsets.view, rightOffsets: rightOffsets.view, candidateOffsets: candidateOffsets.view,
      exactCounts: exactCounts.view, cellCounts: cellCounts.view,
      singletonMaskLo: singletonMaskLo.view, singletonMaskHi: singletonMaskHi.view,
      singletonBitsLo: singletonBitsLo.view, singletonBitsHi: singletonBitsHi.view,
      containsLo: containsLo.view, containsHi: containsHi.view,
      candidateLo: candidateLo.view, candidateHi: candidateHi.view, candidatePopcount: candidatePopcount.view,
      generationStatus: generationStatus.view, rejectedCounts: rejectedCounts.view,
      outputLo: outputLo.view, outputHi: outputHi.view, outputCounts: outputCounts.view, outputStatus: outputStatus.view,
      checks: checks.view,
    };

    const warmups = native ? positiveIntegerEnv('BSFP_COVERAGE_WARMUPS', NATIVE_WARMUPS) : 1;
    const repetitions = native ? positiveIntegerEnv('BSFP_COVERAGE_REPS', NATIVE_REPETITIONS) : 1;
    for (let index = 0; index < warmups; index += 1) await runOperation(plan, bindings);
    const executionSamples = [];
    for (let index = 0; index < repetitions; index += 1) executionSamples.push(await runOperation(plan, bindings));

    const generationValues = await readU32(generationStatus);
    const rejectedValues = await readU32(rejectedCounts);
    const outputCountValues = await readU32(outputCounts);
    const outputStatusValues = await readU32(outputStatus);
    const outputLoValues = await readU32(outputLo);
    const outputHiValues = await readU32(outputHi);

    let totalRejected = 0;
    let totalSurviving = 0;
    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
      assert.equal(generationValues[segmentIndex], 0, `segment ${segmentIndex} generation metadata failed`);
      assert.equal(outputStatusValues[segmentIndex], 0, `segment ${segmentIndex} output overflow/metadata failure`);
      assert.equal(rejectedValues[segmentIndex], fixture.segments[segmentIndex].authority.rejected, `segment ${segmentIndex} rejected-count mismatch`);
      totalRejected += rejectedValues[segmentIndex];

      const observed = [];
      const count = outputCountValues[segmentIndex];
      const base = segmentIndex * outputCapacityPerSegment;
      for (let i = 0; i < count; i += 1) observed.push({ lo: outputLoValues[base + i], hi: outputHiValues[base + i] });
      const expected = fixture.segments[segmentIndex].authority.frontier;
      const observedKeys = observed.map(key64).sort();
      const expectedKeys = expected.map(key64).sort();
      assert.deepEqual(observedKeys, expectedKeys, `segment ${segmentIndex} exact frontier mismatch`);
      totalSurviving += count;
    }

    const timing = summarize(executionSamples);
    return {
      schemaVersion: 1,
      kind: 'connect4-cuda-bsfp-clause-coverage64-experimental-qualification',
      mode: native ? 'native' : 'portable',
      planContract: plan.contract,
      semanticScope: 'fixed-two-u32 coverage qualification only; production coverage width is geometry-selected',
      fixture: {
        segmentCount,
        cellCount: fixture.cellCount,
        dictionarySize: fixture.dictionarySize,
        recordsPerSidePerSegment: fixture.segments[0].left.length,
        rawPairCandidates: fixture.totalCandidates,
        rejectedBeforeNormalization: totalRejected,
        normalizedSurvivingRecords: totalSurviving,
      },
      timingsMs: {
        compileLoadPrepare: compileLoadPrepareMs,
        submissionWait: timing,
        rawSubmissionWaitSamples: executionSamples,
      },
      throughput: {
        rawPairsPerSecondMedian: fixture.totalCandidates * 1000 / timing.median,
      },
      exactFrontierMismatches: 0,
      rejectedCountMismatches: 0,
    };
  } finally {
    await plan.close();
    for (let index = allocations.length - 1; index >= 0; index -= 1) await closeAllocation(allocations[index]);
  }
}

const mode = process.argv[2] ?? 'portable';
if (!['portable', 'native'].includes(mode)) throw new RangeError('mode must be portable or native');
const native = mode === 'native';
const segmentCount = positiveIntegerEnv('BSFP_COVERAGE_SEGMENTS', DEFAULT_SEGMENTS);
const cellCount = positiveIntegerEnv('BSFP_COVERAGE_CELLS', DEFAULT_CELLS);
const dictionarySize = positiveIntegerEnv('BSFP_COVERAGE_DICTIONARY', DEFAULT_DICTIONARY);
const side = positiveIntegerEnv('BSFP_COVERAGE_SIDE', native ? NATIVE_SIDE : PORTABLE_SIDE);

const fixtureStart = performance.now();
const fixture = createFixture(segmentCount, side, cellCount, dictionarySize);
const fixtureMs = performance.now() - fixtureStart;

let runtime;
const processStart = performance.now();
try {
  const runtimeStart = performance.now();
  runtime = native ? await openCudaRuntime({ compiler: true }) : await openCudaRuntimeForTesting({ compiler: true });
  const runtimeOpenMs = performance.now() - runtimeStart;
  const result = await qualify(runtime, native, fixture);
  result.timingsMs.fixture = fixtureMs;
  result.timingsMs.runtimeOpen = runtimeOpenMs;
  result.timingsMs.processToResult = performance.now() - processStart;
  console.log(JSON.stringify(result, null, 2));
} finally {
  if (runtime) {
    const closed = await runtime.close();
    assert.equal(closed.graceful, true);
  }
}
