import { compileDeviceProgram, inspectDeviceViewRelation } from 'cuda-js';

import { segmentedPackedAntichain42DeviceProgram } from './segmented-packed-antichain-42-program.mjs';

const U32_BYTES = 4;
const CUDA_THREAD_BLOCK_CEILING = 1024;

export const SEGMENTED_PACKED_ANTICHAIN_42_CONTRACT = 'Connect4-CUDA-BSFP-segmented-packed-antichain-42-cardinality-v1';
export const SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION = Object.freeze({ MINIMAL: 0, MAXIMAL: 1 });
export const SEGMENTED_PACKED_ANTICHAIN_42_STATUS = Object.freeze({ OK: 0, OUTPUT_CAPACITY_EXCEEDED: 1 });

function positiveSafeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${label} must be a positive safe integer`);
  return value;
}

function safeProduct(left, right, label) {
  const value = left * right;
  if (!Number.isSafeInteger(value)) throw new RangeError(`${label} exceeds safe integer capacity`);
  return value;
}

function binding(name) {
  return Object.freeze({ binding: name });
}

function requireU32View(view, minimumElements, label, requiredAccess) {
  if (!view || view.kind !== 'device-view') throw new TypeError(`${label} must be a CUDA-JS device view`);
  if (view.dtype !== 'u32') throw new TypeError(`${label} must have dtype u32`);
  if (!Number.isSafeInteger(view.elementCount) || view.elementCount < minimumElements) {
    throw new RangeError(`${label} does not cover the required element range`);
  }
  if (view.access !== 'read-write' && view.access !== requiredAccess) {
    throw new TypeError(`${label} does not provide required ${requiredAccess} access`);
  }
  return view;
}

function rejectWriteConflicts(entries) {
  for (let left = 0; left < entries.length; left += 1) {
    for (let right = left + 1; right < entries.length; right += 1) {
      const a = entries[left];
      const b = entries[right];
      if (a.access === 'read' && b.access === 'read') continue;
      const relation = inspectDeviceViewRelation(a.view, b.view);
      if (relation !== 'disjoint') {
        throw new RangeError(`${a.label} and ${b.label} must be disjoint because at least one role writes; CUDA-JS reports ${relation}`);
      }
    }
  }
}

function kernelByName(compiled, name) {
  const kernel = compiled.deviceProgram.kernels.find((entry) => entry.name === name);
  if (!kernel) throw new Error(`compiled Device-JS program is missing kernel ${name}`);
  return kernel;
}

async function closeResources(resources) {
  const failures = [];
  for (let index = resources.length - 1; index >= 0; index -= 1) {
    try {
      await resources[index].close();
    } catch (error) {
      failures.push(error);
    }
  }
  if (failures.length > 0) throw new AggregateError(failures, 'segmented packed antichain plan cleanup failed');
}

export async function createSegmentedPackedAntichain42Plan(runtime, options = {}) {
  const candidateCapacity = positiveSafeInteger(options.candidateCapacity, 'candidateCapacity');
  const segmentCapacity = positiveSafeInteger(options.segmentCapacity, 'segmentCapacity');
  const outputCapacityPerSegment = positiveSafeInteger(options.outputCapacityPerSegment, 'outputCapacityPerSegment');
  const blockSize = positiveSafeInteger(options.blockSize ?? 256, 'blockSize');
  if (blockSize > CUDA_THREAD_BLOCK_CEILING) throw new RangeError('blockSize exceeds CUDA architectural thread-block ceiling');

  const outputElements = safeProduct(segmentCapacity, outputCapacityPerSegment, 'segmented output');
  const compiled = await compileDeviceProgram(runtime, segmentedPackedAntichain42DeviceProgram);
  const artifact = compiled.linker?.artifact ?? compiled.compiler?.artifact;
  if (!artifact || (artifact.format !== 'ptx' && artifact.format !== 'cubin')) {
    throw new Error(`unexpected executable artifact format: ${artifact?.format ?? 'missing'}`);
  }

  const module = await runtime.loadModule({ format: artifact.format, bytes: artifact.bytes });
  const normalizeKernel = kernelByName(compiled, 'normalizeSegmentPacked42');
  const normalize = await module.getFunction({ name: normalizeKernel.functionName, parameters: normalizeKernel.parameters });

  const prepared = await runtime.prepareOperationDag({ nodes: [{
    id: 'normalize-cardinality-antichains',
    function: normalize,
    grid: { x: segmentCapacity, y: 1, z: 1 },
    block: { x: blockSize, y: 1, z: 1 },
    arguments: [
      binding('candidateLo'), binding('candidateHi'), binding('candidatePopcount'), binding('segmentOffsets'),
      binding('segmentDirections'), binding('outputLo'), binding('outputHi'), binding('outputCounts'),
      binding('outputStatus'), binding('checks'), candidateCapacity, segmentCapacity, outputCapacityPerSegment,
    ],
    accesses: [
      { argumentIndex: 0, byteOffset: 0, byteLength: candidateCapacity * U32_BYTES, mode: 'read' },
      { argumentIndex: 1, byteOffset: 0, byteLength: candidateCapacity * U32_BYTES, mode: 'read' },
      { argumentIndex: 2, byteOffset: 0, byteLength: candidateCapacity * U32_BYTES, mode: 'read' },
      { argumentIndex: 3, byteOffset: 0, byteLength: (segmentCapacity + 1) * U32_BYTES, mode: 'read' },
      { argumentIndex: 4, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'read' },
      { argumentIndex: 5, byteOffset: 0, byteLength: outputElements * U32_BYTES, mode: 'read-write' },
      { argumentIndex: 6, byteOffset: 0, byteLength: outputElements * U32_BYTES, mode: 'read-write' },
      { argumentIndex: 7, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'read-write' },
      { argumentIndex: 8, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'read-write' },
      { argumentIndex: 9, byteOffset: 0, byteLength: candidateCapacity * U32_BYTES, mode: 'write' },
    ],
  }] });

  const owned = [module, normalize, prepared];
  let closed = false;

  return Object.freeze({
    kind: 'connect4-bsfp-cuda-plan',
    contract: SEGMENTED_PACKED_ANTICHAIN_42_CONTRACT,
    family: 'segmented-packed-antichain-42-cardinality',
    candidateCapacity,
    segmentCapacity,
    outputCapacityPerSegment,
    outputElements,
    blockSize,
    gridX: segmentCapacity,
    async submit(bindings) {
      if (closed) throw new Error('segmented packed antichain plan is closed');
      const normalized = {
        candidateLo: requireU32View(bindings?.candidateLo, candidateCapacity, 'candidateLo', 'read'),
        candidateHi: requireU32View(bindings?.candidateHi, candidateCapacity, 'candidateHi', 'read'),
        candidatePopcount: requireU32View(bindings?.candidatePopcount, candidateCapacity, 'candidatePopcount', 'read'),
        segmentOffsets: requireU32View(bindings?.segmentOffsets, segmentCapacity + 1, 'segmentOffsets', 'read'),
        segmentDirections: requireU32View(bindings?.segmentDirections, segmentCapacity, 'segmentDirections', 'read'),
        outputLo: requireU32View(bindings?.outputLo, outputElements, 'outputLo', 'read-write'),
        outputHi: requireU32View(bindings?.outputHi, outputElements, 'outputHi', 'read-write'),
        outputCounts: requireU32View(bindings?.outputCounts, segmentCapacity, 'outputCounts', 'read-write'),
        outputStatus: requireU32View(bindings?.outputStatus, segmentCapacity, 'outputStatus', 'read-write'),
        checks: requireU32View(bindings?.checks, candidateCapacity, 'checks', 'write'),
      };
      rejectWriteConflicts([
        { label: 'candidateLo', view: normalized.candidateLo, access: 'read' },
        { label: 'candidateHi', view: normalized.candidateHi, access: 'read' },
        { label: 'candidatePopcount', view: normalized.candidatePopcount, access: 'read' },
        { label: 'segmentOffsets', view: normalized.segmentOffsets, access: 'read' },
        { label: 'segmentDirections', view: normalized.segmentDirections, access: 'read' },
        { label: 'outputLo', view: normalized.outputLo, access: 'write' },
        { label: 'outputHi', view: normalized.outputHi, access: 'write' },
        { label: 'outputCounts', view: normalized.outputCounts, access: 'write' },
        { label: 'outputStatus', view: normalized.outputStatus, access: 'write' },
        { label: 'checks', view: normalized.checks, access: 'write' },
      ]);
      return prepared.submit({ bindings: normalized });
    },
    async close() {
      if (closed) return;
      closed = true;
      await closeResources(owned);
    },
  });
}
