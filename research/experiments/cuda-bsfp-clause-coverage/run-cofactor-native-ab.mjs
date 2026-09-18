import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { openCudaRuntime } from 'cuda-js';

import { createCoverage64CofactorExperimentalPlan } from './cofactor-plan.mjs';
import { createCoverage64WarpCofactorExperimentalPlan } from './cofactor-warp-plan.mjs';
import { createRealCoverage64CofactorFixture } from './real-cofactor-fixture.mjs';

const U32_BYTES = 4;
const WARMUPS = 3;
const REPETITIONS = 25;

function envPositive(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${name} must be a positive safe integer`);
  return value;
}
function bytes(values) { return new Uint8Array(values.buffer, values.byteOffset, values.byteLength); }
function bitIsSet(value, id) { return id < 32 ? (value.lo & ((1 << id) >>> 0)) !== 0 : (value.hi & ((1 << (id - 32)) >>> 0)) !== 0; }
function setChildPreimage(lo, hi, base, parentId, childId) {
  const index = base + parentId;
  if (childId < 32) lo[index] = (lo[index] | ((1 << childId) >>> 0)) >>> 0;
  else hi[index] = (hi[index] | ((1 << (childId - 32)) >>> 0)) >>> 0;
}
function summarize(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  const sum = sorted.reduce((total, value) => total + value, 0);
  return { min: sorted[0], median: sorted[Math.floor(sorted.length / 2)], mean: sum / sorted.length, max: sorted.at(-1), samples };
}

function packFixture(fixture) {
  const segments = fixture.segments.length;
  const inputLo = new Uint32Array(fixture.totalRecords); const inputHi = new Uint32Array(fixture.totalRecords); const offsets = new Uint32Array(segments + 1);
  const validLo = new Uint32Array(segments); const validHi = new Uint32Array(segments); const killLo = new Uint32Array(segments); const killHi = new Uint32Array(segments);
  const contributionsLo = new Uint32Array(segments * fixture.maxDictionary); const contributionsHi = new Uint32Array(segments * fixture.maxDictionary);
  const preimageLo = new Uint32Array(segments * fixture.maxDictionary); const preimageHi = new Uint32Array(segments * fixture.maxDictionary);
  const expectedLo = new Uint32Array(fixture.totalRecords); const expectedHi = new Uint32Array(fixture.totalRecords); const expectedKeep = new Uint32Array(fixture.totalRecords);
  let cursor = 0;
  for (let segmentIndex = 0; segmentIndex < segments; segmentIndex += 1) {
    const segment = fixture.segments[segmentIndex]; const base = segmentIndex * fixture.maxDictionary; offsets[segmentIndex] = cursor;
    validLo[segmentIndex] = segment.validMask.lo; validHi[segmentIndex] = segment.validMask.hi; killLo[segmentIndex] = segment.killMask.lo; killHi[segmentIndex] = segment.killMask.hi;
    for (let childId = 0; childId < segment.contributions.length; childId += 1) {
      const contribution = segment.contributions[childId]; contributionsLo[base + childId] = contribution.lo; contributionsHi[base + childId] = contribution.hi;
      for (let parentId = 0; parentId < segment.parentDictionary.length; parentId += 1) if (bitIsSet(contribution, parentId)) setChildPreimage(preimageLo, preimageHi, base, parentId, childId);
    }
    for (let local = 0; local < segment.input.length; local += 1) {
      inputLo[cursor] = segment.input[local].lo; inputHi[cursor] = segment.input[local].hi;
      expectedLo[cursor] = segment.expected[local].lo; expectedHi[cursor] = segment.expected[local].hi; expectedKeep[cursor] = segment.expected[local].keep; cursor += 1;
    }
  }
  offsets[segments] = cursor; assert.equal(cursor, fixture.totalRecords);
  return { segments, inputLo, inputHi, offsets, validLo, validHi, killLo, killHi, contributionsLo, contributionsHi, preimageLo, preimageHi, expectedLo, expectedHi, expectedKeep };
}

async function alloc(runtime, valuesOrCount, access = 'read') {
  const count = typeof valuesOrCount === 'number' ? valuesOrCount : valuesOrCount.length;
  const memory = await runtime.allocateDevice({ byteLength: count * U32_BYTES });
  const view = await memory.view({ dtype: 'u32', elementCount: count, access });
  if (typeof valuesOrCount !== 'number') await memory.write(bytes(valuesOrCount));
  return { memory, view, count };
}
async function readWords(allocation) {
  const result = await allocation.memory.read({ byteLength: allocation.count * U32_BYTES });
  return new Uint32Array(result.bytes.buffer, result.bytes.byteOffset, allocation.count);
}
async function closeAlloc(allocation) { await allocation.view.close(); await allocation.memory.close(); }
async function timedSubmit(plan, bindings) {
  const started = performance.now(); const operation = await plan.submit(bindings);
  try { const terminal = await operation.wait(); assert.equal(terminal.status, 'completed'); return performance.now() - started; }
  finally { await operation.close(); }
}

const fixture = createRealCoverage64CofactorFixture(); const packed = packFixture(fixture); const runtime = await openCudaRuntime({ compiler: true });
const allocations = [];
let scalarPlan; let warpPlan;
try {
  const inputLo = await alloc(runtime, packed.inputLo); allocations.push(inputLo); const inputHi = await alloc(runtime, packed.inputHi); allocations.push(inputHi);
  const offsets = await alloc(runtime, packed.offsets); allocations.push(offsets); const validLo = await alloc(runtime, packed.validLo); allocations.push(validLo); const validHi = await alloc(runtime, packed.validHi); allocations.push(validHi);
  const killLo = await alloc(runtime, packed.killLo); allocations.push(killLo); const killHi = await alloc(runtime, packed.killHi); allocations.push(killHi);
  const contributionsLo = await alloc(runtime, packed.contributionsLo); allocations.push(contributionsLo); const contributionsHi = await alloc(runtime, packed.contributionsHi); allocations.push(contributionsHi);
  const preimageLo = await alloc(runtime, packed.preimageLo); allocations.push(preimageLo); const preimageHi = await alloc(runtime, packed.preimageHi); allocations.push(preimageHi);
  const scalarOutLo = await alloc(runtime, fixture.totalRecords, 'read-write'); allocations.push(scalarOutLo); const scalarOutHi = await alloc(runtime, fixture.totalRecords, 'read-write'); allocations.push(scalarOutHi); const scalarKeep = await alloc(runtime, fixture.totalRecords, 'read-write'); allocations.push(scalarKeep); const scalarStatus = await alloc(runtime, packed.segments, 'read-write'); allocations.push(scalarStatus);
  const warpOutLo = await alloc(runtime, fixture.totalRecords, 'read-write'); allocations.push(warpOutLo); const warpOutHi = await alloc(runtime, fixture.totalRecords, 'read-write'); allocations.push(warpOutHi); const warpKeep = await alloc(runtime, fixture.totalRecords, 'read-write'); allocations.push(warpKeep); const warpStatus = await alloc(runtime, packed.segments, 'read-write'); allocations.push(warpStatus);

  scalarPlan = await createCoverage64CofactorExperimentalPlan(runtime, { recordCapacity: fixture.totalRecords, segmentCapacity: packed.segments, maxDictionary: fixture.maxDictionary, blockSize: 256 });
  warpPlan = await createCoverage64WarpCofactorExperimentalPlan(runtime, { recordCapacity: fixture.totalRecords, segmentCapacity: packed.segments, maxDictionary: fixture.maxDictionary, blockSize: 256 });
  const common = { inputLo: inputLo.view, inputHi: inputHi.view, recordOffsets: offsets.view, validLo: validLo.view, validHi: validHi.view, killLo: killLo.view, killHi: killHi.view };
  const scalarBindings = { ...common, contributionLo: contributionsLo.view, contributionHi: contributionsHi.view, outputLo: scalarOutLo.view, outputHi: scalarOutHi.view, outputKeep: scalarKeep.view, segmentStatus: scalarStatus.view };
  const warpBindings = { ...common, preimageLo: preimageLo.view, preimageHi: preimageHi.view, outputLo: warpOutLo.view, outputHi: warpOutHi.view, outputKeep: warpKeep.view, segmentStatus: warpStatus.view };

  const warmups = envPositive('BSFP_COFACTOR_AB_WARMUPS', WARMUPS); const repetitions = envPositive('BSFP_COFACTOR_AB_REPS', REPETITIONS);
  for (let i = 0; i < warmups; i += 1) { await timedSubmit(scalarPlan, scalarBindings); await timedSubmit(warpPlan, warpBindings); }
  const scalarSamples = []; const warpSamples = [];
  for (let i = 0; i < repetitions; i += 1) {
    if ((i & 1) === 0) { scalarSamples.push(await timedSubmit(scalarPlan, scalarBindings)); warpSamples.push(await timedSubmit(warpPlan, warpBindings)); }
    else { warpSamples.push(await timedSubmit(warpPlan, warpBindings)); scalarSamples.push(await timedSubmit(scalarPlan, scalarBindings)); }
  }

  const [sLo, sHi, sKeep, sStatus, wLo, wHi, wKeep, wStatus] = await Promise.all([readWords(scalarOutLo), readWords(scalarOutHi), readWords(scalarKeep), readWords(scalarStatus), readWords(warpOutLo), readWords(warpOutHi), readWords(warpKeep), readWords(warpStatus)]);
  for (let segment = 0; segment < packed.segments; segment += 1) { assert.equal(sStatus[segment], 0); assert.equal(wStatus[segment], 0); }
  for (let record = 0; record < fixture.totalRecords; record += 1) {
    for (const [label, actual, expected] of [['scalar keep', sKeep[record], packed.expectedKeep[record]], ['warp keep', wKeep[record], packed.expectedKeep[record]], ['scalar lo', sLo[record], packed.expectedLo[record]], ['warp lo', wLo[record], packed.expectedLo[record]], ['scalar hi', sHi[record], packed.expectedHi[record]], ['warp hi', wHi[record], packed.expectedHi[record]]]) assert.equal(actual, expected, `${label} record ${record}`);
  }
  const scalar = summarize(scalarSamples); const warp = summarize(warpSamples);
  console.log(JSON.stringify({ schemaVersion: 1, kind: 'connect4-bsfp-clause-coverage-cofactor-native-ab', fixtureKind: fixture.fixtureKind, inputRecords: fixture.totalRecords, killedRecords: fixture.killedRecords, maxDictionary: fixture.maxDictionary, scalarOracle: scalar, warpNative: warp, medianRatioWarpOverScalar: warp.median / scalar.median, exactRecordMismatches: 0, scalarRole: 'qualification-oracle-only', intendedExecution: 'warp-native' }, null, 2));
} finally {
  if (warpPlan) await warpPlan.close(); if (scalarPlan) await scalarPlan.close();
  for (let index = allocations.length - 1; index >= 0; index -= 1) await closeAlloc(allocations[index]);
  const terminal = await runtime.close(); assert.equal(terminal.graceful, true);
}
