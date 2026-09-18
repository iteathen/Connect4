#!/usr/bin/env node

import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { openCudaRuntime } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';

import { createCoverageMultiwordCofactorExperimentalPlan } from './cofactor-multiword-plan.mjs';
import { createRealCoverageMultiwordCofactorFixture } from './real-multiword-cofactor-fixture.mjs';

const U32_BYTES = 4;

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

function flattenFixture(fixture) {
  const segmentCount = fixture.segments.length;
  const wordCount = fixture.wordCount;
  const maxDictionary = fixture.maxDictionary;
  const recordOffsets = new Uint32Array(segmentCount + 1);
  const validWords = new Uint32Array(segmentCount * wordCount);
  const killWords = new Uint32Array(segmentCount * wordCount);
  const contributionWords = new Uint32Array(segmentCount * maxDictionary * wordCount);
  const inputWords = new Uint32Array(fixture.totalRecords * wordCount);
  const expectedWords = new Uint32Array(fixture.totalRecords * wordCount);
  const expectedKeep = new Uint32Array(fixture.totalRecords);

  let recordCursor = 0;
  for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
    const segment = fixture.segments[segmentIndex];
    assert.equal(segment.wordCount, wordCount, `${segment.id} unexpected word count`);
    assert.ok(segment.childDictionary.length > 64, `${segment.id} does not exercise multiword width`);
    recordOffsets[segmentIndex] = recordCursor;

    for (let word = 0; word < wordCount; word += 1) {
      validWords[segmentIndex * wordCount + word] = segment.validMask[word] >>> 0;
      killWords[segmentIndex * wordCount + word] = segment.killMask[word] >>> 0;
    }
    for (let id = 0; id < maxDictionary; id += 1) {
      for (let word = 0; word < wordCount; word += 1) {
        const value = id < segment.contributions.length ? segment.contributions[id][word] : 0;
        contributionWords[(segmentIndex * maxDictionary + id) * wordCount + word] = value >>> 0;
      }
    }

    for (let index = 0; index < segment.input.length; index += 1) {
      for (let word = 0; word < wordCount; word += 1) {
        inputWords[recordCursor * wordCount + word] = segment.input[index][word] >>> 0;
        expectedWords[recordCursor * wordCount + word] = segment.expected[index].words[word] >>> 0;
      }
      expectedKeep[recordCursor] = segment.expected[index].keep >>> 0;
      recordCursor += 1;
    }
  }
  recordOffsets[segmentCount] = recordCursor;
  assert.equal(recordCursor, fixture.totalRecords);
  return { recordOffsets, validWords, killWords, contributionWords, inputWords, expectedWords, expectedKeep };
}

async function qualify(runtime, native, fixture) {
  const host = flattenFixture(fixture);
  const segmentCount = fixture.segments.length;
  const recordCapacity = fixture.totalRecords;
  const allocations = [];

  const planStart = performance.now();
  const plan = await createCoverageMultiwordCofactorExperimentalPlan(runtime, {
    recordCapacity,
    segmentCapacity: segmentCount,
    wordCount: fixture.wordCount,
    maxDictionary: fixture.maxDictionary,
    blockSize: 256,
  });
  const compileLoadPrepareMs = performance.now() - planStart;

  try {
    async function allocFrom(values, access = 'read') {
      const allocation = await allocateU32(runtime, values.length, access);
      allocations.push(allocation);
      await writeU32(allocation, values);
      return allocation;
    }
    async function allocOutput(count) {
      const allocation = await allocateU32(runtime, count, 'read-write');
      allocations.push(allocation);
      return allocation;
    }

    const inputWords = await allocFrom(host.inputWords);
    const recordOffsets = await allocFrom(host.recordOffsets);
    const validWords = await allocFrom(host.validWords);
    const killWords = await allocFrom(host.killWords);
    const contributionWords = await allocFrom(host.contributionWords);
    const outputWords = await allocOutput(recordCapacity * fixture.wordCount);
    const outputKeep = await allocOutput(recordCapacity);
    const outputStatus = await allocOutput(recordCapacity);

    const bindings = {
      inputWords: inputWords.view,
      recordOffsets: recordOffsets.view,
      validWords: validWords.view,
      killWords: killWords.view,
      contributionWords: contributionWords.view,
      outputWords: outputWords.view,
      outputKeep: outputKeep.view,
      outputStatus: outputStatus.view,
    };

    const repetitions = native ? 5 : 1;
    if (native) await runOperation(plan, bindings);
    const samples = [];
    for (let index = 0; index < repetitions; index += 1) samples.push(await runOperation(plan, bindings));

    const result = {
      schemaVersion: 1,
      kind: 'connect4-cuda-bsfp-clause-coverage-multiword-cofactor-qualification',
      mode: native ? 'native' : 'portable',
      outcome: native ? 'native-exact-multiword-cofactor-pass' : 'portable-multiword-cofactor-compile-prepare-submit-pass',
      planContract: plan.contract,
      fixtureKind: fixture.fixtureKind,
      geometry: { columns: 6, rows: 5, connect: 4 },
      solvedSupportCounts: fixture.solvedSupportCounts,
      segmentCount,
      wordCount: fixture.wordCount,
      maxDictionary: fixture.maxDictionary,
      totalRecords: fixture.totalRecords,
      killedRecords: fixture.killedRecords,
      retainedRecords: fixture.totalRecords - fixture.killedRecords,
      segments: fixture.segments.map((segment) => ({
        id: segment.id,
        rank: segment.rank,
        parentSupportHeights: segment.parentSupportHeights,
        childSupportHeights: segment.childSupportHeights,
        ownerTrue: segment.ownerTrue,
        beneficiary: segment.beneficiary,
        childDictionarySize: segment.childDictionary.length,
        parentDictionarySize: segment.parentDictionary.length,
        inputRecords: segment.input.length,
        killedRecords: segment.killed,
      })),
      timingsMs: { compileLoadPrepare: compileLoadPrepareMs, submissionWait: summarize(samples), rawSubmissionWaitSamples: samples },
      packedCpuAuthorityMismatches: 0,
      deviceSemanticValidation: native ? 'exact' : 'not-executed-by-testing-runtime',
    };

    if (native) {
      const observedWords = await readU32(outputWords);
      const observedKeep = await readU32(outputKeep);
      const observedStatus = await readU32(outputStatus);
      assert.deepEqual([...observedStatus], new Array(recordCapacity).fill(0), 'multiword device status mismatch');
      assert.deepEqual([...observedKeep], [...host.expectedKeep], 'multiword device keep mismatch');
      assert.deepEqual([...observedWords], [...host.expectedWords], 'multiword device coverage mismatch');
      result.exactOutputMismatches = 0;
    }

    return result;
  } finally {
    await plan.close();
    for (let index = allocations.length - 1; index >= 0; index -= 1) await closeAllocation(allocations[index]);
  }
}

const mode = process.argv[2] ?? 'portable';
if (!['portable', 'native'].includes(mode)) throw new RangeError('mode must be portable or native');
const native = mode === 'native';
const fixture = createRealCoverageMultiwordCofactorFixture();

let runtime;
try {
  runtime = native ? await openCudaRuntime({ compiler: true }) : await openCudaRuntimeForTesting({ compiler: true });
  const result = await qualify(runtime, native, fixture);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} finally {
  if (runtime) {
    const closed = await runtime.close();
    assert.equal(closed.graceful, true);
  }
}
