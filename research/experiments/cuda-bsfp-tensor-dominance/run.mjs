import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { compileDeviceProgram, openCudaRuntime } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';
import { TensorProgram, TensorSession, compileTensorDeviceProgram } from 'cuda-js-tensor';

import {
  SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION,
  SEGMENTED_PACKED_ANTICHAIN_42_STATUS,
  SEGMENTED_PACKED_ANTICHAIN_42_STRATEGY,
  createSegmentedPackedAntichain42Plan,
} from '../../../components/bsfp/cuda/index.mjs';
import { createMinimalDominanceFixture } from './fixture.mjs';

const U32_BYTES = 4;
const F32_BYTES = 4;
const BOARD_CELLS = 42;
const FRONTIER_COUNT = 1_487;
const CANDIDATE_COUNT = 4_096;
const BLOCK_SIZE = 256;
const WARMUPS = 1;
const REPETITIONS = 3;
const TENSOR_WORKSPACE_LIMIT = 192 * 1024 * 1024;
// CUDA-JS SPEC-0004 allocation policy, independently sized for the 164,544,512-byte arena.
const CUDA_MEMORY_POLICY = Object.freeze({ maxDeviceBytes: 256 * 1024 * 1024, maxAllocationBytes: 192 * 1024 * 1024, maxTransferBytes: 16 * 1024 * 1024 });

function encode(values) {
  return new Uint8Array(values.buffer, values.byteOffset, values.byteLength);
}

async function allocate(runtime, dtype, count, access = 'read-write') {
  const width = dtype === 'u32' || dtype === 'f32' ? 4 : null;
  if (width === null) throw new RangeError(`unsupported experiment dtype ${dtype}`);
  const memory = await runtime.allocateDevice({ byteLength: count * width });
  const view = await memory.view({ dtype, elementCount: count, access });
  return { memory, view, dtype, count, width };
}

async function write(allocation, values) {
  assert.equal(values.length, allocation.count);
  await allocation.memory.write(encode(values));
}

async function readU32(allocation, count = allocation.count) {
  const result = await allocation.memory.read({ byteLength: count * U32_BYTES });
  return new Uint32Array(result.bytes.buffer, result.bytes.byteOffset, count);
}

async function readF32(allocation, count = allocation.count) {
  const result = await allocation.memory.read({ byteLength: count * F32_BYTES });
  return new Float32Array(result.bytes.buffer, result.bytes.byteOffset, count);
}

async function closeAllocation(allocation) {
  await allocation.view.close();
  await allocation.memory.close();
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

async function timePrepared(prepared, bindings, warmups = WARMUPS, repetitions = REPETITIONS) {
  const samples = [];
  for (let pass = 0; pass < warmups + repetitions; pass += 1) {
    const started = performance.now();
    const operation = await prepared.submit({ bindings });
    try {
      const terminal = await operation.wait();
      assert.equal(terminal.status, 'completed');
    } finally {
      await operation.close();
    }
    const elapsed = performance.now() - started;
    if (pass >= warmups) samples.push(elapsed);
  }
  return Object.freeze({
    samples: Object.freeze(samples),
    min: Math.min(...samples),
    median: median(samples),
    max: Math.max(...samples),
  });
}

function dominanceTensorProgram() {
  return TensorProgram.define((graph) => {
    const candidates = graph.input('candidates', {
      dtype: 'f32',
      capacityShape: [CANDIDATE_COUNT, BOARD_CELLS],
      access: 'read',
    });
    const frontierTransposed = graph.input('frontierTransposed', {
      dtype: 'f32',
      capacityShape: [BOARD_CELLS, FRONTIER_COUNT],
      access: 'read',
    });
    const frontierPopcounts = graph.input('frontierPopcounts', {
      dtype: 'f32',
      capacityShape: [FRONTIER_COUNT],
      access: 'read',
    });
    const ones = graph.input('ones', {
      dtype: 'f32',
      capacityShape: [FRONTIER_COUNT],
      access: 'read',
    });
    const overlap = graph.matmul(candidates, frontierTransposed);
    const deficit = graph.binary('sub', frontierPopcounts, overlap);
    const nonZero = graph.binary('minimum', deficit, ones);
    const subset = graph.binary('sub', ones, nonZero);
    return graph.reduce('maximum', subset, { axes: [1], order: 'fixed-tree-v1' });
  });
}

function tensorPointerParameters(deviceProgram) {
  const metadata = deviceProgram.parameters.filter((entry) => entry.role !== 'item-index');
  const functions = deviceProgram.function.parameters.slice(1);
  assert.equal(functions.length, metadata.length);
  for (let index = 0; index < functions.length; index += 1) {
    assert.equal(functions[index].name, metadata[index].parameterName);
    assert.equal(functions[index].type, metadata[index].type);
  }
  return Object.freeze(metadata.map((entry, index) => Object.freeze({ ...entry, functionParameter: functions[index] })));
}

function deviceSource(pointerParameters) {
  const wrapperParameters = pointerParameters.map((entry) => entry.functionParameter.name);
  const wrapperSignature = [
    ...pointerParameters.map((entry) => `${entry.functionParameter.name}`),
    'tensorStatus',
  ].join(', ');
  const tensorArguments = wrapperParameters.join(', ');
  return `
function unpackCandidates42(candidateLo, candidateHi, candidateBits) {
  const index = gpu.thread.globalX();
  if (index >= gpu.u32(${CANDIDATE_COUNT * BOARD_CELLS})) return;
  const candidate = index / gpu.u32(${BOARD_CELLS});
  const bit = index % gpu.u32(${BOARD_CELLS});
  let lane = candidateLo[candidate];
  let shift = bit;
  if (bit >= gpu.u32(32)) {
    lane = candidateHi[candidate];
    shift = bit - gpu.u32(32);
  }
  candidateBits[index] = gpu.cast.f32((lane >> shift) & gpu.u32(1));
}

function unpackFrontier42(frontierLo, frontierHi, frontierBits, frontierPopcounts, ones) {
  const index = gpu.thread.globalX();
  if (index >= gpu.u32(${FRONTIER_COUNT * BOARD_CELLS})) return;
  const bit = index / gpu.u32(${FRONTIER_COUNT});
  const frontier = index % gpu.u32(${FRONTIER_COUNT});
  let lane = frontierLo[frontier];
  let shift = bit;
  if (bit >= gpu.u32(32)) {
    lane = frontierHi[frontier];
    shift = bit - gpu.u32(32);
  }
  frontierBits[index] = gpu.cast.f32((lane >> shift) & gpu.u32(1));
  if (bit === gpu.u32(0)) {
    let low = frontierLo[frontier];
    let high = frontierHi[frontier];
    let count = gpu.u32(0);
    while (low !== gpu.u32(0)) { low = low & (low - gpu.u32(1)); count++; }
    while (high !== gpu.u32(0)) { high = high & (high - gpu.u32(1)); count++; }
    frontierPopcounts[frontier] = gpu.cast.f32(count);
    ones[frontier] = gpu.f32(1);
  }
}

function packedDominanceBaseline(candidateLo, candidateHi, frontierLo, frontierHi, dominated, checks) {
  const laneIndex = gpu.thread.x();
  let candidate = laneIndex;
  while (candidate < gpu.u32(${CANDIDATE_COUNT})) {
    const low = candidateLo[candidate];
    const high = candidateHi[candidate];
    let frontier = gpu.u32(0);
    let hit = gpu.u32(0);
    let tested = gpu.u32(0);
    while (frontier < gpu.u32(${FRONTIER_COUNT})) {
      const otherLow = frontierLo[frontier];
      const otherHigh = frontierHi[frontier];
      tested++;
      if ((otherLow & ~low) === gpu.u32(0) && (otherHigh & ~high) === gpu.u32(0)) {
        hit = gpu.u32(1);
        break;
      }
      frontier++;
    }
    dominated[candidate] = hit;
    checks[candidate] = tested;
    candidate = candidate + gpu.blockDim.x();
  }
}

function runTensorDominance(${wrapperSignature}) {
  const item = gpu.thread.globalX();
  if (item >= gpu.u32(${CANDIDATE_COUNT})) return;
  tensorStatus[item] = bsfpTensorDominance(item, ${tensorArguments});
}
`;
}

function kernelRecords(pointerParameters) {
  return Object.freeze([
    Object.freeze({
      name: 'unpackCandidates42', kind: 'kernel', returns: 'void',
      parameters: Object.freeze([
        Object.freeze({ name: 'candidateLo', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidateHi', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidateBits', type: 'ptr<f32>' }),
      ]),
    }),
    Object.freeze({
      name: 'unpackFrontier42', kind: 'kernel', returns: 'void',
      parameters: Object.freeze([
        Object.freeze({ name: 'frontierLo', type: 'ptr<u32>' }),
        Object.freeze({ name: 'frontierHi', type: 'ptr<u32>' }),
        Object.freeze({ name: 'frontierBits', type: 'ptr<f32>' }),
        Object.freeze({ name: 'frontierPopcounts', type: 'ptr<f32>' }),
        Object.freeze({ name: 'ones', type: 'ptr<f32>' }),
      ]),
    }),
    Object.freeze({
      name: 'packedDominanceBaseline', kind: 'kernel', returns: 'void',
      parameters: Object.freeze([
        Object.freeze({ name: 'candidateLo', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidateHi', type: 'ptr<u32>' }),
        Object.freeze({ name: 'frontierLo', type: 'ptr<u32>' }),
        Object.freeze({ name: 'frontierHi', type: 'ptr<u32>' }),
        Object.freeze({ name: 'dominated', type: 'ptr<u32>' }),
        Object.freeze({ name: 'checks', type: 'ptr<u32>' }),
      ]),
    }),
    Object.freeze({
      name: 'runTensorDominance', kind: 'kernel', returns: 'void',
      parameters: Object.freeze([
        ...pointerParameters.map((entry) => Object.freeze({ name: entry.functionParameter.name, type: entry.functionParameter.type })),
        Object.freeze({ name: 'tensorStatus', type: 'ptr<u32>' }),
      ]),
    }),
  ]);
}

function binding(name) { return Object.freeze({ binding: name }); }
function access(argumentIndex, allocation, mode) {
  return Object.freeze({ argumentIndex, byteOffset: 0, byteLength: allocation.count * allocation.width, mode });
}

function tensorBindingName(parameter) {
  if (parameter.role === 'input') {
    if (parameter.name === 'candidates') return 'candidateBits';
    if (parameter.name === 'frontierTransposed') return 'frontierBits';
    if (parameter.name === 'frontierPopcounts') return 'frontierPopcounts';
    if (parameter.name === 'ones') return 'ones';
  } else if (parameter.role === 'output') return 'tensorDominated';
  else if (parameter.role === 'workspace') return 'tensorWorkspace';
  throw new Error(`unsupported Tensor dominance binding role/name ${parameter.role}/${parameter.name}`);
}

function assertPreparedBindings(prepared, bindings, label) {
  const expected = Object.keys(bindings).sort();
  const actual = prepared.bindings.map((entry) => entry.name).sort();
  assert.deepEqual(actual, expected, `${label} prepared binding schema mismatch`);
}

async function prepareNativeTensorPath(runtime, compiled, pointerParameters, allocations) {
  const artifact = compiled.linker?.artifact ?? compiled.compiler?.artifact;
  if (!artifact) throw new Error('Tensor dominance composition produced no executable artifact');
  const module = await runtime.loadModule({ format: artifact.format, bytes: artifact.bytes });
  const functionHandles = [];
  const functionByName = new Map();
  for (const name of ['unpackCandidates42', 'unpackFrontier42', 'packedDominanceBaseline', 'runTensorDominance']) {
    const descriptor = compiled.deviceProgram.kernels.find((entry) => entry.name === name);
    if (!descriptor) throw new Error(`compiled Tensor dominance program omitted ${name}`);
    const fn = await module.getFunction({ name: descriptor.functionName, parameters: descriptor.parameters });
    functionHandles.push(fn);
    functionByName.set(name, fn);
  }

  const baselineBindings = Object.freeze({
    candidateLo: allocations.candidateLo.view,
    candidateHi: allocations.candidateHi.view,
    frontierLo: allocations.frontierLo.view,
    frontierHi: allocations.frontierHi.view,
    dominated: allocations.baselineDominated.view,
    checks: allocations.baselineChecks.view,
  });
  const baselinePrepared = await runtime.prepareOperationDag({ nodes: [Object.freeze({
    id: 'packed-baseline',
    function: functionByName.get('packedDominanceBaseline'),
    grid: Object.freeze({ x: 1, y: 1, z: 1 }),
    block: Object.freeze({ x: BLOCK_SIZE, y: 1, z: 1 }),
    arguments: Object.freeze(['candidateLo', 'candidateHi', 'frontierLo', 'frontierHi', 'dominated', 'checks'].map(binding)),
    accesses: Object.freeze([
      access(0, allocations.candidateLo, 'read'), access(1, allocations.candidateHi, 'read'),
      access(2, allocations.frontierLo, 'read'), access(3, allocations.frontierHi, 'read'),
      access(4, allocations.baselineDominated, 'write'), access(5, allocations.baselineChecks, 'write'),
    ]),
  })] });

  const tensorParameterBindings = pointerParameters.map((parameter) => {
    let allocation;
    if (parameter.role === 'input') {
      if (parameter.name === 'candidates') allocation = allocations.candidateBits;
      else if (parameter.name === 'frontierTransposed') allocation = allocations.frontierBits;
      else if (parameter.name === 'frontierPopcounts') allocation = allocations.frontierPopcounts;
      else if (parameter.name === 'ones') allocation = allocations.ones;
      else throw new Error(`unmapped Tensor dominance input ${parameter.name}`);
    } else if (parameter.role === 'output') allocation = allocations.tensorDominated;
    else if (parameter.role === 'workspace') allocation = allocations.tensorWorkspace;
    else throw new Error(`unsupported Tensor dominance parameter role ${parameter.role}`);
    assert.equal(allocation.dtype, parameter.dtype);
    assert(allocation.count >= parameter.elementCount);
    return Object.freeze({ parameter, allocation, bindingName: tensorBindingName(parameter) });
  });

  const tensorBindings = {};
  for (const entry of tensorParameterBindings) {
    if (Object.hasOwn(tensorBindings, entry.bindingName)) throw new Error(`duplicate Tensor logical binding ${entry.bindingName}`);
    tensorBindings[entry.bindingName] = entry.allocation.view;
  }
  tensorBindings.tensorStatus = allocations.tensorStatus.view;
  const frozenTensorBindings = Object.freeze(tensorBindings);

  const tensorArguments = [...tensorParameterBindings.map((entry) => binding(entry.bindingName)), binding('tensorStatus')];
  const tensorAccesses = tensorParameterBindings.map((entry, index) => {
    const mode = entry.parameter.access === 'read' ? 'read' : entry.parameter.access === 'write' ? 'write' : 'read-write';
    return access(index, entry.allocation, mode);
  });
  tensorAccesses.push(access(pointerParameters.length, allocations.tensorStatus, 'write'));

  const runTensorNode = Object.freeze({
    id: 'tensor-dominance',
    function: functionByName.get('runTensorDominance'),
    grid: Object.freeze({ x: Math.ceil(CANDIDATE_COUNT / BLOCK_SIZE), y: 1, z: 1 }),
    block: Object.freeze({ x: BLOCK_SIZE, y: 1, z: 1 }),
    arguments: Object.freeze(tensorArguments),
    accesses: Object.freeze(tensorAccesses),
  });
  const tensorOnlyPrepared = await runtime.prepareOperationDag({ nodes: [runTensorNode] });

  const unpackCandidateNode = Object.freeze({
    id: 'unpack-candidates', function: functionByName.get('unpackCandidates42'),
    grid: Object.freeze({ x: Math.ceil((CANDIDATE_COUNT * BOARD_CELLS) / BLOCK_SIZE), y: 1, z: 1 }),
    block: Object.freeze({ x: BLOCK_SIZE, y: 1, z: 1 }),
    arguments: Object.freeze(['candidateLo', 'candidateHi', 'candidateBits'].map(binding)),
    accesses: Object.freeze([
      access(0, allocations.candidateLo, 'read'), access(1, allocations.candidateHi, 'read'), access(2, allocations.candidateBits, 'write'),
    ]),
  });
  const unpackFrontierNode = Object.freeze({
    id: 'unpack-frontier', function: functionByName.get('unpackFrontier42'),
    grid: Object.freeze({ x: Math.ceil((FRONTIER_COUNT * BOARD_CELLS) / BLOCK_SIZE), y: 1, z: 1 }),
    block: Object.freeze({ x: BLOCK_SIZE, y: 1, z: 1 }),
    arguments: Object.freeze(['frontierLo', 'frontierHi', 'frontierBits', 'frontierPopcounts', 'ones'].map(binding)),
    accesses: Object.freeze([
      access(0, allocations.frontierLo, 'read'), access(1, allocations.frontierHi, 'read'),
      access(2, allocations.frontierBits, 'write'), access(3, allocations.frontierPopcounts, 'write'), access(4, allocations.ones, 'write'),
    ]),
  });
  const tensorFullPrepared = await runtime.prepareOperationDag({ nodes: [
    unpackCandidateNode,
    unpackFrontierNode,
    Object.freeze({ ...runTensorNode, after: Object.freeze(['unpack-candidates', 'unpack-frontier']) }),
  ] });
  const tensorFullBindings = Object.freeze({
    ...frozenTensorBindings,
    candidateLo: allocations.candidateLo.view,
    candidateHi: allocations.candidateHi.view,
    frontierLo: allocations.frontierLo.view,
    frontierHi: allocations.frontierHi.view,
  });
  assertPreparedBindings(tensorOnlyPrepared, frozenTensorBindings, 'Tensor-only');
  assertPreparedBindings(tensorFullPrepared, tensorFullBindings, 'packed-to-Tensor');

  return Object.freeze({
    module,
    functionHandles: Object.freeze(functionHandles),
    baselinePrepared,
    baselineBindings,
    tensorOnlyPrepared,
    tensorFullPrepared,
    tensorBindings: frozenTensorBindings,
    tensorFullBindings,
  });
}

async function runAuthority(runtime, fixture, native) {
  const plan = await createSegmentedPackedAntichain42Plan(runtime, {
    candidateCapacity: fixture.combinedCount,
    segmentCapacity: 1,
    outputCapacityPerSegment: fixture.combinedCount,
    blockSize: BLOCK_SIZE,
    strategy: SEGMENTED_PACKED_ANTICHAIN_42_STRATEGY.BUCKETED_DEDUP_FIRST,
  });
  const allocations = [];
  try {
    const candidateLo = await allocate(runtime, 'u32', fixture.combinedCount);
    const candidateHi = await allocate(runtime, 'u32', fixture.combinedCount);
    const candidatePopcount = await allocate(runtime, 'u32', fixture.combinedCount);
    const segmentOffsets = await allocate(runtime, 'u32', 2);
    const directions = await allocate(runtime, 'u32', 1);
    const outputLo = await allocate(runtime, 'u32', fixture.combinedCount);
    const outputHi = await allocate(runtime, 'u32', fixture.combinedCount);
    const outputCounts = await allocate(runtime, 'u32', 1);
    const outputStatus = await allocate(runtime, 'u32', 1);
    const checks = await allocate(runtime, 'u32', fixture.combinedCount);
    const bucketIndices = await allocate(runtime, 'u32', fixture.combinedCount);
    const bucketCounts = await allocate(runtime, 'u32', plan.bucketMetaElements);
    const bucketOffsets = await allocate(runtime, 'u32', plan.bucketMetaElements);
    const bucketCursors = await allocate(runtime, 'u32', plan.bucketMetaElements);
    allocations.push(candidateLo, candidateHi, candidatePopcount, segmentOffsets, directions, outputLo, outputHi, outputCounts, outputStatus, checks, bucketIndices, bucketCounts, bucketOffsets, bucketCursors);

    await write(candidateLo, fixture.combinedLo);
    await write(candidateHi, fixture.combinedHi);
    await write(candidatePopcount, fixture.combinedPopcount);
    await write(segmentOffsets, Uint32Array.of(0, fixture.combinedCount));
    await write(directions, Uint32Array.of(SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION.MINIMAL));

    const bindings = {
      candidateLo: candidateLo.view, candidateHi: candidateHi.view, candidatePopcount: candidatePopcount.view,
      segmentOffsets: segmentOffsets.view, segmentDirections: directions.view,
      outputLo: outputLo.view, outputHi: outputHi.view, outputCounts: outputCounts.view,
      outputStatus: outputStatus.view, checks: checks.view,
      bucketIndices: bucketIndices.view, bucketCounts: bucketCounts.view,
      bucketOffsets: bucketOffsets.view, bucketCursors: bucketCursors.view,
    };
    const started = performance.now();
    const operation = await plan.submit(bindings);
    try {
      const terminal = await operation.wait();
      assert.equal(terminal.status, 'completed');
    } finally {
      await operation.close();
    }
    const submissionWaitMs = performance.now() - started;
    if (!native) return Object.freeze({ submissionWaitMs, outcome: 'portable-authority-submit-pass' });

    const status = await readU32(outputStatus, 1);
    const counts = await readU32(outputCounts, 1);
    assert.equal(status[0], SEGMENTED_PACKED_ANTICHAIN_42_STATUS.OK);
    assert.equal(counts[0], fixture.expectedFinalFrontierCount);
    const lows = await readU32(outputLo, counts[0]);
    const highs = await readU32(outputHi, counts[0]);
    const actual = Array.from({ length: counts[0] }, (_, index) => fixture.keyFromPacked(lows[index], highs[index])).sort();
    assert.deepEqual(actual, fixture.expectedFrontierKeys);
    return Object.freeze({ submissionWaitMs, outcome: 'native-authority-frontier-match', frontierCount: counts[0] });
  } finally {
    await plan.close();
    for (let index = allocations.length - 1; index >= 0; index -= 1) await closeAllocation(allocations[index]);
  }
}

async function executionExperiment(runtime, fixture, tensorDeviceProgram, compiled, pointerParameters, native) {
  const allocations = {};
  const allocationOrder = [];
  function remember(name, value) { allocations[name] = value; allocationOrder.push(value); return value; }

  const candidateLo = remember('candidateLo', await allocate(runtime, 'u32', CANDIDATE_COUNT));
  const candidateHi = remember('candidateHi', await allocate(runtime, 'u32', CANDIDATE_COUNT));
  const frontierLo = remember('frontierLo', await allocate(runtime, 'u32', FRONTIER_COUNT));
  const frontierHi = remember('frontierHi', await allocate(runtime, 'u32', FRONTIER_COUNT));
  remember('candidateBits', await allocate(runtime, 'f32', CANDIDATE_COUNT * BOARD_CELLS));
  remember('frontierBits', await allocate(runtime, 'f32', FRONTIER_COUNT * BOARD_CELLS));
  remember('frontierPopcounts', await allocate(runtime, 'f32', FRONTIER_COUNT));
  remember('ones', await allocate(runtime, 'f32', FRONTIER_COUNT));
  remember('baselineDominated', await allocate(runtime, 'u32', CANDIDATE_COUNT));
  remember('baselineChecks', await allocate(runtime, 'u32', CANDIDATE_COUNT));
  remember('tensorDominated', await allocate(runtime, 'f32', CANDIDATE_COUNT));
  remember('tensorStatus', await allocate(runtime, 'u32', CANDIDATE_COUNT));
  const workspaceParameter = pointerParameters.find((entry) => entry.role === 'workspace');
  assert(workspaceParameter);
  remember('tensorWorkspace', await allocate(runtime, workspaceParameter.dtype, workspaceParameter.elementCount));

  let prepared;
  try {
    await write(candidateLo, fixture.candidateLo);
    await write(candidateHi, fixture.candidateHi);
    await write(frontierLo, fixture.frontierLo);
    await write(frontierHi, fixture.frontierHi);

    prepared = await prepareNativeTensorPath(runtime, compiled, pointerParameters, allocations);
    if (!native) {
      const operation = await prepared.tensorFullPrepared.submit({ bindings: prepared.tensorFullBindings });
      try {
        const terminal = await operation.wait();
        assert.equal(terminal.status, 'completed');
      } finally {
        await operation.close();
      }
      return Object.freeze({
        outcome: 'portable-tensor-dominance-prepared-submit-pass',
        tensorOnlyBindingCount: prepared.tensorOnlyPrepared.bindings.length,
        tensorFullBindingCount: prepared.tensorFullPrepared.bindings.length,
      });
    }

    const baselineTiming = await timePrepared(prepared.baselinePrepared, prepared.baselineBindings);

    // Populate Tensor inputs once, validate the complete path, then measure both the
    // Tensor leaf alone and the complete packed->Tensor unpack+dominance path.
    const fullPrime = await timePrepared(prepared.tensorFullPrepared, prepared.tensorFullBindings, 0, 1);
    const tensorOnlyTiming = await timePrepared(prepared.tensorOnlyPrepared, prepared.tensorBindings);
    const tensorFullTiming = await timePrepared(prepared.tensorFullPrepared, prepared.tensorFullBindings);

    const baseline = await readU32(allocations.baselineDominated);
    const checks = await readU32(allocations.baselineChecks);
    const tensor = await readF32(allocations.tensorDominated);
    const statuses = await readU32(allocations.tensorStatus);
    let baselineSubsetChecks = 0;
    for (let index = 0; index < CANDIDATE_COUNT; index += 1) {
      assert.equal(baseline[index], fixture.expectedDominated[index], `packed baseline mismatch at ${index}`);
      assert.equal(statuses[index], 0, `Tensor leaf status mismatch at ${index}`);
      assert(tensor[index] === 0 || tensor[index] === 1, `Tensor leaf produced non-binary dominance at ${index}`);
      assert.equal(tensor[index], fixture.expectedDominated[index], `Tensor dominance mismatch at ${index}`);
      baselineSubsetChecks += checks[index];
    }

    return Object.freeze({
      outcome: 'native-tensor-dominance-exact-match',
      baselineSubsetChecks,
      tensorLogicalSubsetPairs: CANDIDATE_COUNT * FRONTIER_COUNT,
      tensorLogicalF32Products: CANDIDATE_COUNT * FRONTIER_COUNT * BOARD_CELLS,
      baselineTiming,
      tensorOnlyTiming,
      tensorFullTiming,
      tensorPrimeMs: fullPrime.samples[0],
    });
  } finally {
    if (prepared) {
      await prepared.tensorFullPrepared.close();
      await prepared.tensorOnlyPrepared.close();
      await prepared.baselinePrepared.close();
      for (let index = prepared.functionHandles.length - 1; index >= 0; index -= 1) await prepared.functionHandles[index].close();
      await prepared.module.close();
    }
    for (let index = allocationOrder.length - 1; index >= 0; index -= 1) await closeAllocation(allocationOrder[index]);
  }
}

async function main() {
  const mode = process.argv[2] ?? 'portable';
  if (!['portable', 'native'].includes(mode)) throw new RangeError('mode must be portable or native');
  const native = mode === 'native';
  const fixture = createMinimalDominanceFixture({ frontierCount: FRONTIER_COUNT, candidateCount: CANDIDATE_COUNT });
  const runtime = native ? await openCudaRuntime({ compiler: true, driver: { memory: CUDA_MEMORY_POLICY } }) : await openCudaRuntimeForTesting({ compiler: true, driver: { memory: CUDA_MEMORY_POLICY } });
  const tensorSession = await TensorSession.open(runtime);
  let tensorDeviceProgram;
  try {
    const tensorCompileStarted = performance.now();
    tensorDeviceProgram = await compileTensorDeviceProgram(tensorSession, dominanceTensorProgram(), {
      itemCapacity: CANDIDATE_COUNT,
      itemInputs: ['candidates'],
      maxWorkspaceBytes: TENSOR_WORKSPACE_LIMIT,
    });
    const tensorCompileMs = performance.now() - tensorCompileStarted;
    const pointerParameters = tensorPointerParameters(tensorDeviceProgram);
    const composedStarted = performance.now();
    const compiled = await compileDeviceProgram(runtime, {
      source: deviceSource(pointerParameters),
      functions: kernelRecords(pointerParameters),
      imports: [tensorDeviceProgram.importAs('bsfpTensorDominance')],
    });
    const composedCompileMs = performance.now() - composedStarted;

    const authority = await runAuthority(runtime, fixture, native);
    const execution = await executionExperiment(runtime, fixture, tensorDeviceProgram, compiled, pointerParameters, native);
    console.log(JSON.stringify({
      schemaVersion: 1,
      kind: 'connect4-bsfp-tensor-dominance-overflow-ab',
      mode,
      geometry: '7x6-c4-packed42-workshape',
      fixture: {
        kind: fixture.kind,
        frontierCount: fixture.frontierCount,
        candidateCount: fixture.candidateCount,
        expectedDominatedCount: fixture.expectedDominatedCount,
        expectedFinalFrontierCount: fixture.expectedFinalFrontierCount,
      },
      tensor: {
        libraryContract: tensorDeviceProgram.contract,
        itemCapacity: tensorDeviceProgram.itemCapacity,
        totalWorkspaceBytes: tensorDeviceProgram.totalWorkspaceBytes,
        workspaceLimitBytes: TENSOR_WORKSPACE_LIMIT,
        compileMs: tensorCompileMs,
        compositionCompileMs: composedCompileMs,
      },
      authority,
      execution,
    }, null, 2));
  } finally {
    assert.equal((await tensorSession.close()).graceful, true);
    assert.equal((await runtime.close()).graceful, true);
  }
}

await main();
