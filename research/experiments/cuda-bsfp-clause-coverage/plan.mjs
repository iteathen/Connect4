import { compileDeviceProgram, inspectDeviceViewRelation } from 'cuda-js';

import { coverage64ExperimentalDeviceProgram } from './program.mjs';

const U32_BYTES = 4;
const U32_MAX = 0xffff_ffff;
const CUDA_THREAD_BLOCK_CEILING = 1024;

export const COVERAGE64_EXPERIMENTAL_CONTRACT = 'Connect4-CUDA-BSFP-clause-coverage-64-experimental-v0';

function positiveU32(value, label) {
  if (!Number.isSafeInteger(value) || value < 1 || value > U32_MAX) throw new RangeError(`${label} must be a positive u32-safe integer`);
  return value;
}

function safeProduct(left, right, label) {
  const value = left * right;
  if (!Number.isSafeInteger(value) || value > U32_MAX) throw new RangeError(`${label} exceeds u32 capacity`);
  return value;
}

function binding(name) {
  return Object.freeze({ binding: name });
}

function requireU32View(view, minimumElements, label, requiredAccess) {
  if (!view || view.kind !== 'device-view') throw new TypeError(`${label} must be a CUDA-JS device view`);
  if (view.dtype !== 'u32') throw new TypeError(`${label} must have dtype u32`);
  if (!Number.isSafeInteger(view.elementCount) || view.elementCount < minimumElements) throw new RangeError(`${label} does not cover the required element range`);
  if (view.access !== 'read-write' && view.access !== requiredAccess) throw new TypeError(`${label} does not provide required ${requiredAccess} access`);
  return view;
}

function rejectWriteConflicts(entries) {
  for (let left = 0; left < entries.length; left += 1) {
    for (let right = left + 1; right < entries.length; right += 1) {
      const a = entries[left];
      const b = entries[right];
      if (a.access === 'read' && b.access === 'read') continue;
      if (inspectDeviceViewRelation(a.view, b.view) !== 'disjoint') {
        throw new RangeError(`${a.label} and ${b.label} must be disjoint because at least one role writes`);
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
    try { await resources[index].close(); } catch (error) { failures.push(error); }
  }
  if (failures.length !== 0) throw new AggregateError(failures, 'coverage64 experimental cleanup failed');
}

export async function createCoverage64ExperimentalPlan(runtime, options = {}) {
  const leftCapacity = positiveU32(options.leftCapacity, 'leftCapacity');
  const rightCapacity = positiveU32(options.rightCapacity, 'rightCapacity');
  const candidateCapacity = positiveU32(options.candidateCapacity, 'candidateCapacity');
  const segmentCapacity = positiveU32(options.segmentCapacity, 'segmentCapacity');
  const outputCapacityPerSegment = positiveU32(options.outputCapacityPerSegment, 'outputCapacityPerSegment');
  const maxCells = positiveU32(options.maxCells, 'maxCells');
  const blockSize = positiveU32(options.blockSize ?? 256, 'blockSize');
  if (blockSize > CUDA_THREAD_BLOCK_CEILING) throw new RangeError('blockSize exceeds CUDA architectural thread-block ceiling');

  const outputElements = safeProduct(segmentCapacity, outputCapacityPerSegment, 'coverage output');
  const cellMetadataElements = safeProduct(segmentCapacity, maxCells, 'coverage cell metadata');

  const compiled = await compileDeviceProgram(runtime, coverage64ExperimentalDeviceProgram);
  const artifact = compiled.linker?.artifact ?? compiled.compiler?.artifact;
  if (!artifact || (artifact.format !== 'ptx' && artifact.format !== 'cubin')) throw new Error(`unexpected executable artifact format: ${artifact?.format ?? 'missing'}`);
  const module = await runtime.loadModule({ format: artifact.format, bytes: artifact.bytes });

  const generateKernel = kernelByName(compiled, 'generateFilterCoveragePairs64');
  const normalizeKernel = kernelByName(compiled, 'normalizeCoverageSegments64');
  const generate = await module.getFunction({ name: generateKernel.functionName, parameters: generateKernel.parameters });
  const normalize = await module.getFunction({ name: normalizeKernel.functionName, parameters: normalizeKernel.parameters });

  const prepared = await runtime.prepareOperationDag({ nodes: [
    {
      id: 'generate-filter-coverage-pairs',
      function: generate,
      grid: { x: segmentCapacity, y: 1, z: 1 },
      block: { x: blockSize, y: 1, z: 1 },
      arguments: [
        binding('leftLo'), binding('leftHi'), binding('rightLo'), binding('rightHi'),
        binding('leftOffsets'), binding('rightOffsets'), binding('candidateOffsets'),
        binding('exactCounts'), binding('cellCounts'),
        binding('singletonMaskLo'), binding('singletonMaskHi'),
        binding('singletonBitsLo'), binding('singletonBitsHi'),
        binding('containsLo'), binding('containsHi'),
        binding('candidateLo'), binding('candidateHi'), binding('candidatePopcount'),
        binding('generationStatus'), binding('rejectedCounts'),
        leftCapacity, rightCapacity, candidateCapacity, segmentCapacity, maxCells,
      ],
      accesses: [
        { argumentIndex: 0, byteOffset: 0, byteLength: leftCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 1, byteOffset: 0, byteLength: leftCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 2, byteOffset: 0, byteLength: rightCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 3, byteOffset: 0, byteLength: rightCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 4, byteOffset: 0, byteLength: (segmentCapacity + 1) * U32_BYTES, mode: 'read' },
        { argumentIndex: 5, byteOffset: 0, byteLength: (segmentCapacity + 1) * U32_BYTES, mode: 'read' },
        { argumentIndex: 6, byteOffset: 0, byteLength: (segmentCapacity + 1) * U32_BYTES, mode: 'read' },
        { argumentIndex: 7, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 8, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 9, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 10, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 11, byteOffset: 0, byteLength: cellMetadataElements * U32_BYTES, mode: 'read' },
        { argumentIndex: 12, byteOffset: 0, byteLength: cellMetadataElements * U32_BYTES, mode: 'read' },
        { argumentIndex: 13, byteOffset: 0, byteLength: cellMetadataElements * U32_BYTES, mode: 'read' },
        { argumentIndex: 14, byteOffset: 0, byteLength: cellMetadataElements * U32_BYTES, mode: 'read' },
        { argumentIndex: 15, byteOffset: 0, byteLength: candidateCapacity * U32_BYTES, mode: 'write' },
        { argumentIndex: 16, byteOffset: 0, byteLength: candidateCapacity * U32_BYTES, mode: 'write' },
        { argumentIndex: 17, byteOffset: 0, byteLength: candidateCapacity * U32_BYTES, mode: 'write' },
        { argumentIndex: 18, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'write' },
        { argumentIndex: 19, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'write' },
      ],
    },
    {
      id: 'normalize-coverage-pairs',
      after: ['generate-filter-coverage-pairs'],
      function: normalize,
      grid: { x: segmentCapacity, y: 1, z: 1 },
      block: { x: blockSize, y: 1, z: 1 },
      arguments: [
        binding('candidateLo'), binding('candidateHi'), binding('candidatePopcount'), binding('candidateOffsets'),
        binding('outputLo'), binding('outputHi'), binding('outputCounts'), binding('outputStatus'), binding('checks'),
        candidateCapacity, segmentCapacity, outputCapacityPerSegment,
      ],
      accesses: [
        { argumentIndex: 0, byteOffset: 0, byteLength: candidateCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 1, byteOffset: 0, byteLength: candidateCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 2, byteOffset: 0, byteLength: candidateCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 3, byteOffset: 0, byteLength: (segmentCapacity + 1) * U32_BYTES, mode: 'read' },
        { argumentIndex: 4, byteOffset: 0, byteLength: outputElements * U32_BYTES, mode: 'read-write' },
        { argumentIndex: 5, byteOffset: 0, byteLength: outputElements * U32_BYTES, mode: 'read-write' },
        { argumentIndex: 6, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'read-write' },
        { argumentIndex: 7, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'read-write' },
        { argumentIndex: 8, byteOffset: 0, byteLength: candidateCapacity * U32_BYTES, mode: 'write' },
      ],
    },
  ] });

  const owned = [module, generate, normalize, prepared];
  let closed = false;

  return Object.freeze({
    kind: 'connect4-bsfp-clause-coverage64-experimental-plan',
    contract: COVERAGE64_EXPERIMENTAL_CONTRACT,
    leftCapacity,
    rightCapacity,
    candidateCapacity,
    segmentCapacity,
    outputCapacityPerSegment,
    outputElements,
    maxCells,
    cellMetadataElements,
    blockSize,
    async submit(bindings) {
      if (closed) throw new Error('coverage64 experimental plan is closed');
      const normalized = {
        leftLo: requireU32View(bindings?.leftLo, leftCapacity, 'leftLo', 'read'),
        leftHi: requireU32View(bindings?.leftHi, leftCapacity, 'leftHi', 'read'),
        rightLo: requireU32View(bindings?.rightLo, rightCapacity, 'rightLo', 'read'),
        rightHi: requireU32View(bindings?.rightHi, rightCapacity, 'rightHi', 'read'),
        leftOffsets: requireU32View(bindings?.leftOffsets, segmentCapacity + 1, 'leftOffsets', 'read'),
        rightOffsets: requireU32View(bindings?.rightOffsets, segmentCapacity + 1, 'rightOffsets', 'read'),
        candidateOffsets: requireU32View(bindings?.candidateOffsets, segmentCapacity + 1, 'candidateOffsets', 'read'),
        exactCounts: requireU32View(bindings?.exactCounts, segmentCapacity, 'exactCounts', 'read'),
        cellCounts: requireU32View(bindings?.cellCounts, segmentCapacity, 'cellCounts', 'read'),
        singletonMaskLo: requireU32View(bindings?.singletonMaskLo, segmentCapacity, 'singletonMaskLo', 'read'),
        singletonMaskHi: requireU32View(bindings?.singletonMaskHi, segmentCapacity, 'singletonMaskHi', 'read'),
        singletonBitsLo: requireU32View(bindings?.singletonBitsLo, cellMetadataElements, 'singletonBitsLo', 'read'),
        singletonBitsHi: requireU32View(bindings?.singletonBitsHi, cellMetadataElements, 'singletonBitsHi', 'read'),
        containsLo: requireU32View(bindings?.containsLo, cellMetadataElements, 'containsLo', 'read'),
        containsHi: requireU32View(bindings?.containsHi, cellMetadataElements, 'containsHi', 'read'),
        candidateLo: requireU32View(bindings?.candidateLo, candidateCapacity, 'candidateLo', 'read-write'),
        candidateHi: requireU32View(bindings?.candidateHi, candidateCapacity, 'candidateHi', 'read-write'),
        candidatePopcount: requireU32View(bindings?.candidatePopcount, candidateCapacity, 'candidatePopcount', 'read-write'),
        generationStatus: requireU32View(bindings?.generationStatus, segmentCapacity, 'generationStatus', 'write'),
        rejectedCounts: requireU32View(bindings?.rejectedCounts, segmentCapacity, 'rejectedCounts', 'write'),
        outputLo: requireU32View(bindings?.outputLo, outputElements, 'outputLo', 'read-write'),
        outputHi: requireU32View(bindings?.outputHi, outputElements, 'outputHi', 'read-write'),
        outputCounts: requireU32View(bindings?.outputCounts, segmentCapacity, 'outputCounts', 'read-write'),
        outputStatus: requireU32View(bindings?.outputStatus, segmentCapacity, 'outputStatus', 'read-write'),
        checks: requireU32View(bindings?.checks, candidateCapacity, 'checks', 'write'),
      };

      rejectWriteConflicts(Object.entries(normalized).map(([label, view]) => ({
        label,
        view,
        access: ['candidateLo', 'candidateHi', 'candidatePopcount', 'generationStatus', 'rejectedCounts', 'outputLo', 'outputHi', 'outputCounts', 'outputStatus', 'checks'].includes(label) ? 'write' : 'read',
      })));
      return prepared.submit({ bindings: normalized });
    },
    async close() {
      if (closed) return;
      closed = true;
      await closeResources(owned);
    },
  });
}
