import { compileDeviceProgram, inspectDeviceViewRelation } from 'cuda-js';

import { coverage64CofactorExperimentalDeviceProgram } from './cofactor-program.mjs';

const U32_BYTES = 4;
const U32_MAX = 0xffff_ffff;
const CUDA_THREAD_BLOCK_CEILING = 1024;

export const COVERAGE64_COFACTOR_EXPERIMENTAL_CONTRACT = 'Connect4-CUDA-BSFP-clause-coverage-cofactor-64-experimental-v0';

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
  if (failures.length !== 0) throw new AggregateError(failures, 'coverage cofactor experimental cleanup failed');
}

export async function createCoverage64CofactorExperimentalPlan(runtime, options = {}) {
  const recordCapacity = positiveU32(options.recordCapacity, 'recordCapacity');
  const segmentCapacity = positiveU32(options.segmentCapacity, 'segmentCapacity');
  const maxDictionary = positiveU32(options.maxDictionary, 'maxDictionary');
  if (maxDictionary > 64) throw new RangeError('maxDictionary exceeds fixed-two-u32 qualification width');
  const blockSize = positiveU32(options.blockSize ?? 256, 'blockSize');
  if (blockSize > CUDA_THREAD_BLOCK_CEILING) throw new RangeError('blockSize exceeds CUDA architectural thread-block ceiling');
  const mapEntries = safeProduct(segmentCapacity, maxDictionary, 'cofactor map');

  const compiled = await compileDeviceProgram(runtime, coverage64CofactorExperimentalDeviceProgram);
  const artifact = compiled.linker?.artifact ?? compiled.compiler?.artifact;
  if (!artifact || (artifact.format !== 'ptx' && artifact.format !== 'cubin')) throw new Error(`unexpected executable artifact format: ${artifact?.format ?? 'missing'}`);
  const module = await runtime.loadModule({ format: artifact.format, bytes: artifact.bytes });
  const kernel = kernelByName(compiled, 'mapCoverageCofactor64');
  const mapCoverage = await module.getFunction({ name: kernel.functionName, parameters: kernel.parameters });

  const prepared = await runtime.prepareOperationDag({ nodes: [
    {
      id: 'map-clause-coverage-cofactor',
      function: mapCoverage,
      grid: { x: segmentCapacity, y: 1, z: 1 },
      block: { x: blockSize, y: 1, z: 1 },
      arguments: [
        binding('inputLo'), binding('inputHi'), binding('recordOffsets'),
        binding('validLo'), binding('validHi'), binding('killLo'), binding('killHi'),
        binding('contributionLo'), binding('contributionHi'),
        binding('outputLo'), binding('outputHi'), binding('outputKeep'), binding('segmentStatus'),
        recordCapacity, segmentCapacity, maxDictionary,
      ],
      accesses: [
        { argumentIndex: 0, byteOffset: 0, byteLength: recordCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 1, byteOffset: 0, byteLength: recordCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 2, byteOffset: 0, byteLength: (segmentCapacity + 1) * U32_BYTES, mode: 'read' },
        { argumentIndex: 3, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 4, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 5, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 6, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 7, byteOffset: 0, byteLength: mapEntries * U32_BYTES, mode: 'read' },
        { argumentIndex: 8, byteOffset: 0, byteLength: mapEntries * U32_BYTES, mode: 'read' },
        { argumentIndex: 9, byteOffset: 0, byteLength: recordCapacity * U32_BYTES, mode: 'write' },
        { argumentIndex: 10, byteOffset: 0, byteLength: recordCapacity * U32_BYTES, mode: 'write' },
        { argumentIndex: 11, byteOffset: 0, byteLength: recordCapacity * U32_BYTES, mode: 'write' },
        { argumentIndex: 12, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'write' },
      ],
    },
  ] });

  const owned = [module, mapCoverage, prepared];
  let closed = false;

  return Object.freeze({
    kind: 'connect4-bsfp-clause-coverage-cofactor64-experimental-plan',
    contract: COVERAGE64_COFACTOR_EXPERIMENTAL_CONTRACT,
    recordCapacity,
    segmentCapacity,
    maxDictionary,
    mapEntries,
    blockSize,
    async submit(bindings) {
      if (closed) throw new Error('coverage cofactor experimental plan is closed');
      const normalized = {
        inputLo: requireU32View(bindings?.inputLo, recordCapacity, 'inputLo', 'read'),
        inputHi: requireU32View(bindings?.inputHi, recordCapacity, 'inputHi', 'read'),
        recordOffsets: requireU32View(bindings?.recordOffsets, segmentCapacity + 1, 'recordOffsets', 'read'),
        validLo: requireU32View(bindings?.validLo, segmentCapacity, 'validLo', 'read'),
        validHi: requireU32View(bindings?.validHi, segmentCapacity, 'validHi', 'read'),
        killLo: requireU32View(bindings?.killLo, segmentCapacity, 'killLo', 'read'),
        killHi: requireU32View(bindings?.killHi, segmentCapacity, 'killHi', 'read'),
        contributionLo: requireU32View(bindings?.contributionLo, mapEntries, 'contributionLo', 'read'),
        contributionHi: requireU32View(bindings?.contributionHi, mapEntries, 'contributionHi', 'read'),
        outputLo: requireU32View(bindings?.outputLo, recordCapacity, 'outputLo', 'write'),
        outputHi: requireU32View(bindings?.outputHi, recordCapacity, 'outputHi', 'write'),
        outputKeep: requireU32View(bindings?.outputKeep, recordCapacity, 'outputKeep', 'write'),
        segmentStatus: requireU32View(bindings?.segmentStatus, segmentCapacity, 'segmentStatus', 'write'),
      };

      rejectWriteConflicts(Object.entries(normalized).map(([label, view]) => ({
        label,
        view,
        access: ['outputLo', 'outputHi', 'outputKeep', 'segmentStatus'].includes(label) ? 'write' : 'read',
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
