import { compileDeviceProgram, inspectDeviceViewRelation } from 'cuda-js';

import { coverageMultiwordCofactorDeviceProgram } from './cofactor-multiword-program.mjs';

const U32_BYTES = 4;
const U32_MAX = 0xffff_ffff;
const CUDA_THREAD_BLOCK_CEILING = 1024;

export const COVERAGE_MULTIWORD_COFACTOR_EXPERIMENTAL_CONTRACT = 'Connect4-CUDA-BSFP-clause-coverage-cofactor-multiword-experimental-v0';

function positiveU32(value, label) {
  if (!Number.isSafeInteger(value) || value < 1 || value > U32_MAX) throw new RangeError(`${label} must be a positive u32-safe integer`);
  return value;
}

function safeProduct(...values) {
  const label = values.pop();
  let result = 1;
  for (const value of values) {
    result *= value;
    if (!Number.isSafeInteger(result) || result > U32_MAX) throw new RangeError(`${label} exceeds u32 capacity`);
  }
  return result;
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
  if (failures.length !== 0) throw new AggregateError(failures, 'multiword coverage cofactor cleanup failed');
}

export async function createCoverageMultiwordCofactorExperimentalPlan(runtime, options = {}) {
  const recordCapacity = positiveU32(options.recordCapacity, 'recordCapacity');
  const segmentCapacity = positiveU32(options.segmentCapacity, 'segmentCapacity');
  const wordCount = positiveU32(options.wordCount, 'wordCount');
  const maxDictionary = positiveU32(options.maxDictionary, 'maxDictionary');
  if (maxDictionary > wordCount * 32) throw new RangeError('maxDictionary exceeds declared wordCount capacity');
  const blockSize = positiveU32(options.blockSize ?? 256, 'blockSize');
  if (blockSize > CUDA_THREAD_BLOCK_CEILING) throw new RangeError('blockSize exceeds CUDA architectural thread-block ceiling');

  const recordWords = safeProduct(recordCapacity, wordCount, 'record words');
  const segmentWords = safeProduct(segmentCapacity, wordCount, 'segment words');
  const contributionWords = safeProduct(segmentCapacity, maxDictionary, wordCount, 'contribution words');

  const compiled = await compileDeviceProgram(runtime, coverageMultiwordCofactorDeviceProgram);
  const artifact = compiled.linker?.artifact ?? compiled.compiler?.artifact;
  if (!artifact || (artifact.format !== 'ptx' && artifact.format !== 'cubin')) throw new Error(`unexpected executable artifact format: ${artifact?.format ?? 'missing'}`);
  const module = await runtime.loadModule({ format: artifact.format, bytes: artifact.bytes });
  const kernel = kernelByName(compiled, 'mapCoverageMultiwordCofactors');
  const mapCoverage = await module.getFunction({ name: kernel.functionName, parameters: kernel.parameters });

  const prepared = await runtime.prepareOperationDag({ nodes: [
    {
      id: 'map-clause-coverage-multiword-cofactor',
      function: mapCoverage,
      grid: { x: segmentCapacity, y: 1, z: 1 },
      block: { x: blockSize, y: 1, z: 1 },
      arguments: [
        binding('inputWords'), binding('recordOffsets'),
        binding('validWords'), binding('killWords'), binding('contributionWords'),
        binding('outputWords'), binding('outputKeep'), binding('outputStatus'),
        segmentCapacity, wordCount, maxDictionary,
      ],
      accesses: [
        { argumentIndex: 0, byteOffset: 0, byteLength: recordWords * U32_BYTES, mode: 'read' },
        { argumentIndex: 1, byteOffset: 0, byteLength: (segmentCapacity + 1) * U32_BYTES, mode: 'read' },
        { argumentIndex: 2, byteOffset: 0, byteLength: segmentWords * U32_BYTES, mode: 'read' },
        { argumentIndex: 3, byteOffset: 0, byteLength: segmentWords * U32_BYTES, mode: 'read' },
        { argumentIndex: 4, byteOffset: 0, byteLength: contributionWords * U32_BYTES, mode: 'read' },
        { argumentIndex: 5, byteOffset: 0, byteLength: recordWords * U32_BYTES, mode: 'write' },
        { argumentIndex: 6, byteOffset: 0, byteLength: recordCapacity * U32_BYTES, mode: 'write' },
        { argumentIndex: 7, byteOffset: 0, byteLength: recordCapacity * U32_BYTES, mode: 'write' },
      ],
    },
  ] });

  const owned = [module, mapCoverage, prepared];
  let closed = false;

  return Object.freeze({
    kind: 'connect4-bsfp-clause-coverage-cofactor-multiword-experimental-plan',
    contract: COVERAGE_MULTIWORD_COFACTOR_EXPERIMENTAL_CONTRACT,
    recordCapacity,
    segmentCapacity,
    wordCount,
    maxDictionary,
    recordWords,
    segmentWords,
    contributionWords,
    blockSize,
    async submit(bindings) {
      if (closed) throw new Error('multiword coverage cofactor plan is closed');
      const normalized = {
        inputWords: requireU32View(bindings?.inputWords, recordWords, 'inputWords', 'read'),
        recordOffsets: requireU32View(bindings?.recordOffsets, segmentCapacity + 1, 'recordOffsets', 'read'),
        validWords: requireU32View(bindings?.validWords, segmentWords, 'validWords', 'read'),
        killWords: requireU32View(bindings?.killWords, segmentWords, 'killWords', 'read'),
        contributionWords: requireU32View(bindings?.contributionWords, contributionWords, 'contributionWords', 'read'),
        outputWords: requireU32View(bindings?.outputWords, recordWords, 'outputWords', 'write'),
        outputKeep: requireU32View(bindings?.outputKeep, recordCapacity, 'outputKeep', 'write'),
        outputStatus: requireU32View(bindings?.outputStatus, recordCapacity, 'outputStatus', 'write'),
      };
      rejectWriteConflicts(Object.entries(normalized).map(([label, view]) => ({
        label,
        view,
        access: ['outputWords', 'outputKeep', 'outputStatus'].includes(label) ? 'write' : 'read',
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
