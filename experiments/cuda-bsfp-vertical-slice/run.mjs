import assert from 'node:assert/strict';

import { compileDeviceLibrary, openCudaRuntime } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';
import {
  RANKED_DERIVED_ACTIVATION_U32_STATUS as ACTIVATION_STATUS,
  createRankedDerivedActivationU32Plan,
} from 'cuda-algorithms';
import {
  BSFP_4X3_CONNECT3_SUPPORT,
  createBsfpSupportPredecessorDeviceLibraryRequest,
} from '../../components/bsfp/index.mjs';

const U32_BYTES = 4;
const ALGORITHMS_REVISION = '48ee0aec9acae7776950f03ab52ab1737e598b6e';
const CUDA_JS_REVISION = '98e2ebc942c14d63acf4dd82e912dd548c363a05';

function encodeU32(values) {
  const bytes = new Uint8Array(values.length * U32_BYTES);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  values.forEach((value, index) => {
    if (!Number.isInteger(value) || value < 0 || value > 0xffff_ffff) throw new RangeError(`u32 value out of range at ${index}`);
    view.setUint32(index * U32_BYTES, value, true);
  });
  return bytes;
}

function decodeU32(bytes) {
  if (bytes.byteLength % U32_BYTES !== 0) throw new RangeError('u32 byte length is not aligned');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return Array.from({ length: bytes.byteLength / U32_BYTES }, (_, index) => view.getUint32(index * U32_BYTES, true));
}

async function allocateU32(runtime, count, access = 'read-write') {
  const memory = await runtime.allocateDevice({ byteLength: count * U32_BYTES });
  const view = await memory.view({ dtype: 'u32', elementCount: count, access });
  return { memory, view, count };
}

async function writeU32(allocation, values) {
  if (values.length > allocation.count) throw new RangeError('fixture write exceeds allocation');
  await allocation.memory.write(encodeU32(values));
}

async function readU32(allocation, count = allocation.count) {
  if (!Number.isSafeInteger(count) || count < 0 || count > allocation.count) throw new RangeError('fixture read count is outside allocation');
  if (count === 0) return [];
  const result = await allocation.memory.read({ byteLength: count * U32_BYTES });
  return decodeU32(result.bytes);
}

async function closeAllocation(allocation) {
  await allocation.view.close();
  await allocation.memory.close();
}

async function runEpoch(runtime, { outputCapacity, ranks, activeIndices, activeCount, library, verifyNative }) {
  const profile = BSFP_4X3_CONNECT3_SUPPORT;
  const plan = await createRankedDerivedActivationU32Plan(runtime, {
    itemCapacity: profile.itemCapacity,
    inputCapacity: activeIndices.length,
    outputCapacity,
    maxEmissionsPerItem: profile.maxEmissionsPerItem,
    blockSize: 64,
    derivation: { library, name: 'deriveSupportPredecessor' },
  });
  const allocations = [];
  let operation;

  try {
    const activeIndicesAllocation = await allocateU32(runtime, activeIndices.length, 'read');
    const activeCountAllocation = await allocateU32(runtime, 1, 'read');
    const ranksAllocation = await allocateU32(runtime, profile.itemCapacity, 'read');
    const nextFlags = await allocateU32(runtime, profile.itemCapacity, 'read-write');
    const prefix = await allocateU32(runtime, profile.itemCapacity, 'read-write');
    const outputIndices = await allocateU32(runtime, outputCapacity, 'write');
    const nextCount = await allocateU32(runtime, 1, 'read-write');
    const status = await allocateU32(runtime, 1, 'read-write');
    allocations.push(activeIndicesAllocation, activeCountAllocation, ranksAllocation, nextFlags, prefix, outputIndices, nextCount, status);

    await writeU32(activeIndicesAllocation, activeIndices);
    await writeU32(activeCountAllocation, [activeCount]);
    await writeU32(ranksAllocation, ranks);
    await writeU32(nextFlags, new Array(profile.itemCapacity).fill(0));
    await writeU32(prefix, new Array(profile.itemCapacity).fill(0));
    await writeU32(outputIndices, new Array(outputCapacity).fill(0));
    await writeU32(nextCount, [0]);
    await writeU32(status, [0]);

    operation = await plan.submit({
      activeIndices: activeIndicesAllocation.view,
      activeCount: activeCountAllocation.view,
      ranks: ranksAllocation.view,
      nextFlags: nextFlags.view,
      prefix: prefix.view,
      outputIndices: outputIndices.view,
      nextCount: nextCount.view,
      status: status.view,
    });
    const terminal = await operation.wait();
    assert.equal(terminal.status, 'completed');
    assert.equal(terminal.kind, 'prepared-batch');
    assert.equal(terminal.nodeCount, 4);

    const result = {
      operationStatus: terminal.status,
      planContract: plan.contract,
      derivationLibrarySha256: plan.derivation.librarySha256,
      preparedNodeCount: plan.realization.preparedNodeCount,
    };

    if (verifyNative) {
      const [semanticStatus] = await readU32(status, 1);
      const [requiredCount] = await readU32(nextCount, 1);
      result.semanticStatus = semanticStatus;
      result.requiredCount = requiredCount;
      if (semanticStatus === ACTIVATION_STATUS.OK) result.outputIndices = await readU32(outputIndices, requiredCount);
    }

    return result;
  } finally {
    if (operation) await operation.close();
    await plan.close();
    for (let index = allocations.length - 1; index >= 0; index -= 1) await closeAllocation(allocations[index]);
  }
}

async function qualify(runtime, verifyNative) {
  const profile = BSFP_4X3_CONNECT3_SUPPORT;
  const compiledLibrary = await compileDeviceLibrary(runtime, createBsfpSupportPredecessorDeviceLibraryRequest(profile));
  const library = compiledLibrary.library;

  const baseRanks = Array.from(profile.ranks);
  const duplicateSourceFixture = await runEpoch(runtime, {
    outputCapacity: profile.itemCapacity,
    ranks: baseRanks,
    activeIndices: [255, 255],
    activeCount: 2,
    library,
    verifyNative,
  });

  const result = {
    schemaVersion: 1,
    kind: 'connect4-cuda-bsfp-ranked-activation-vertical-slice',
    mode: verifyNative ? 'native' : 'portable',
    connect4Profile: '4x3-connect3-support-lattice',
    supportItemCapacity: profile.itemCapacity,
    supportMaxRank: profile.maxRank,
    maxEmissionsPerItem: profile.maxEmissionsPerItem,
    expectedFullSkeletonPredecessors: [191, 239, 251, 254],
    dependencyPair: {
      cudaAlgorithms: ALGORITHMS_REVISION,
      cudaJs: CUDA_JS_REVISION,
    },
    duplicateSourceFixture,
  };

  if (!verifyNative) {
    result.outcome = 'portable-composition-pass';
    return result;
  }

  assert.equal(duplicateSourceFixture.semanticStatus, ACTIVATION_STATUS.OK);
  assert.equal(duplicateSourceFixture.requiredCount, 4);
  assert.deepEqual(duplicateSourceFixture.outputIndices, [191, 239, 251, 254]);

  const capacityFixture = await runEpoch(runtime, {
    outputCapacity: 2,
    ranks: baseRanks,
    activeIndices: [255],
    activeCount: 1,
    library,
    verifyNative: true,
  });
  assert.equal(capacityFixture.semanticStatus, ACTIVATION_STATUS.OUTPUT_CAPACITY_EXHAUSTED);
  assert.equal(capacityFixture.requiredCount, 4);
  result.capacityFixture = capacityFixture;

  const invalidRanks = [...baseRanks];
  invalidRanks[254] = invalidRanks[255];
  const rankViolationFixture = await runEpoch(runtime, {
    outputCapacity: profile.itemCapacity,
    ranks: invalidRanks,
    activeIndices: [255],
    activeCount: 1,
    library,
    verifyNative: true,
  });
  assert.equal(rankViolationFixture.semanticStatus, ACTIVATION_STATUS.RANK_DESCENT_VIOLATION);
  result.rankViolationFixture = rankViolationFixture;

  result.outcome = 'native-numerical-pass';
  return result;
}

const mode = process.argv[2] ?? 'portable';
if (!['portable', 'native'].includes(mode)) throw new RangeError('mode must be portable or native');

let runtime;
try {
  runtime = mode === 'native'
    ? await openCudaRuntime({ compiler: true })
    : await openCudaRuntimeForTesting({ compiler: true });
  const result = await qualify(runtime, mode === 'native');
  console.log(JSON.stringify(result, null, 2));
} finally {
  if (runtime) {
    const closed = await runtime.close();
    assert.equal(closed.graceful, true);
  }
}
