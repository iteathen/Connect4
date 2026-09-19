import { compileDeviceProgram, inspectDeviceViewRelation } from 'cuda-js';

import { rankSliceCompact42DeviceProgram } from './program.mjs';

const U32_BYTES = 4;
const CUDA_THREAD_BLOCK_CEILING = 1024;

export const RANK_SLICE_COMPACT42_CONTRACT = 'Connect4-CUDA-BSFP-rank-slice-compact42-experimental-v0';

function positive(value, label) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 0xffff_ffff) throw new RangeError(`${label} must be a positive u32-safe integer`);
  return value;
}

function binding(name) { return Object.freeze({ binding: name }); }

function requireU32View(view, minimumElements, label, requiredAccess) {
  if (!view || view.kind !== 'device-view') throw new TypeError(`${label} must be a CUDA-JS device view`);
  if (view.dtype !== 'u32') throw new TypeError(`${label} must have dtype u32`);
  if (!Number.isSafeInteger(view.elementCount) || view.elementCount < minimumElements) throw new RangeError(`${label} is too small`);
  if (view.access !== 'read-write' && view.access !== requiredAccess) throw new TypeError(`${label} lacks ${requiredAccess} access`);
  return view;
}

function rejectWriteConflicts(entries) {
  for (let left = 0; left < entries.length; left += 1) {
    for (let right = left + 1; right < entries.length; right += 1) {
      const a = entries[left];
      const b = entries[right];
      if (a.access === 'read' && b.access === 'read') continue;
      if (inspectDeviceViewRelation(a.view, b.view) !== 'disjoint') throw new RangeError(`${a.label} and ${b.label} must be disjoint`);
    }
  }
}

async function closeAll(resources) {
  const failures = [];
  for (let index = resources.length - 1; index >= 0; index -= 1) {
    try { await resources[index].close(); } catch (error) { failures.push(error); }
  }
  if (failures.length) throw new AggregateError(failures, 'rank-slice compact42 cleanup failed');
}

export async function createRankSliceCompact42Plan(runtime, options = {}) {
  const candidateCapacity = positive(options.candidateCapacity, 'candidateCapacity');
  const segmentCapacity = positive(options.segmentCapacity, 'segmentCapacity');
  const outputCapacityPerSegment = positive(options.outputCapacityPerSegment, 'outputCapacityPerSegment');
  const blockSize = positive(options.blockSize ?? 256, 'blockSize');
  if (blockSize > CUDA_THREAD_BLOCK_CEILING) throw new RangeError('blockSize exceeds CUDA thread-block ceiling');
  const outputElements = segmentCapacity * outputCapacityPerSegment;
  if (!Number.isSafeInteger(outputElements) || outputElements > 0xffff_ffff) throw new RangeError('output capacity exceeds u32-safe range');

  const compiled = await compileDeviceProgram(runtime, rankSliceCompact42DeviceProgram);
  const artifact = compiled.linker?.artifact ?? compiled.compiler?.artifact;
  if (!artifact || !['ptx', 'cubin'].includes(artifact.format)) throw new Error('rank-slice compact42 executable artifact missing');
  const module = await runtime.loadModule({ format: artifact.format, bytes: artifact.bytes });
  const kernel = compiled.deviceProgram.kernels.find((entry) => entry.name === 'normalizeRankSliceSegmentPacked42');
  if (!kernel) throw new Error('rank-slice compact42 kernel missing');
  const normalize = await module.getFunction({ name: kernel.functionName, parameters: kernel.parameters });

  const prepared = await runtime.prepareOperationDag({ nodes: [{
    id: 'rank-slice-normalize',
    function: normalize,
    grid: { x: segmentCapacity, y: 1, z: 1 },
    block: { x: blockSize, y: 1, z: 1 },
    arguments: [
      binding('candidateLo'), binding('candidateHi'), binding('candidatePopcount'),
      binding('segmentOffsets'), binding('segmentDirections'), binding('legalP0Counts'),
      binding('outputLo'), binding('outputHi'), binding('outputCounts'), binding('outputStatus'), binding('checks'),
      candidateCapacity, segmentCapacity, outputCapacityPerSegment,
    ],
    accesses: [
      { argumentIndex: 0, byteOffset: 0, byteLength: candidateCapacity * U32_BYTES, mode: 'read' },
      { argumentIndex: 1, byteOffset: 0, byteLength: candidateCapacity * U32_BYTES, mode: 'read' },
      { argumentIndex: 2, byteOffset: 0, byteLength: candidateCapacity * U32_BYTES, mode: 'read-write' },
      { argumentIndex: 3, byteOffset: 0, byteLength: (segmentCapacity + 1) * U32_BYTES, mode: 'read' },
      { argumentIndex: 4, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'read' },
      { argumentIndex: 5, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'read' },
      { argumentIndex: 6, byteOffset: 0, byteLength: outputElements * U32_BYTES, mode: 'read-write' },
      { argumentIndex: 7, byteOffset: 0, byteLength: outputElements * U32_BYTES, mode: 'read-write' },
      { argumentIndex: 8, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'read-write' },
      { argumentIndex: 9, byteOffset: 0, byteLength: segmentCapacity * U32_BYTES, mode: 'read-write' },
      { argumentIndex: 10, byteOffset: 0, byteLength: candidateCapacity * U32_BYTES, mode: 'write' },
    ],
  }] });

  const owned = [module, normalize, prepared];
  let closed = false;
  return Object.freeze({
    contract: RANK_SLICE_COMPACT42_CONTRACT,
    candidateCapacity,
    segmentCapacity,
    outputCapacityPerSegment,
    outputElements,
    async submit(bindings) {
      if (closed) throw new Error('rank-slice compact42 plan is closed');
      const normalized = {
        candidateLo: requireU32View(bindings?.candidateLo, candidateCapacity, 'candidateLo', 'read'),
        candidateHi: requireU32View(bindings?.candidateHi, candidateCapacity, 'candidateHi', 'read'),
        candidatePopcount: requireU32View(bindings?.candidatePopcount, candidateCapacity, 'candidatePopcount', 'read-write'),
        segmentOffsets: requireU32View(bindings?.segmentOffsets, segmentCapacity + 1, 'segmentOffsets', 'read'),
        segmentDirections: requireU32View(bindings?.segmentDirections, segmentCapacity, 'segmentDirections', 'read'),
        legalP0Counts: requireU32View(bindings?.legalP0Counts, segmentCapacity, 'legalP0Counts', 'read'),
        outputLo: requireU32View(bindings?.outputLo, outputElements, 'outputLo', 'read-write'),
        outputHi: requireU32View(bindings?.outputHi, outputElements, 'outputHi', 'read-write'),
        outputCounts: requireU32View(bindings?.outputCounts, segmentCapacity, 'outputCounts', 'read-write'),
        outputStatus: requireU32View(bindings?.outputStatus, segmentCapacity, 'outputStatus', 'read-write'),
        checks: requireU32View(bindings?.checks, candidateCapacity, 'checks', 'write'),
      };
      rejectWriteConflicts(Object.entries(normalized).map(([label, view]) => ({
        label,
        view,
        access: ['candidatePopcount', 'outputLo', 'outputHi', 'outputCounts', 'outputStatus', 'checks'].includes(label) ? 'write' : 'read',
      })));
      return prepared.submit({ bindings: normalized });
    },
    async close() {
      if (closed) return;
      closed = true;
      await closeAll(owned);
    },
  });
}
