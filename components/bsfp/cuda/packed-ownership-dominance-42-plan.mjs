import { compileDeviceProgram, inspectDeviceViewRelation } from 'cuda-js';

import { packedOwnershipDominance42DeviceProgram } from './packed-ownership-dominance-42-program.mjs';

const U32_BYTES = 4;
const CUDA_THREAD_BLOCK_CEILING = 1024;

export const PACKED_OWNERSHIP_DOMINANCE_42_CONTRACT = 'Connect4-CUDA-BSFP-packed-ownership-dominance-42-benchmark-v0';

function positiveSafeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${label} must be a positive safe integer`);
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
  if (failures.length > 0) throw new AggregateError(failures, 'packed ownership dominance plan cleanup failed');
}

export async function createPackedOwnershipDominance42Plan(runtime, options = {}) {
  const candidateCapacity = positiveSafeInteger(options.candidateCapacity, 'candidateCapacity');
  const frontierCapacity = positiveSafeInteger(options.frontierCapacity, 'frontierCapacity');
  const blockSize = positiveSafeInteger(options.blockSize ?? 256, 'blockSize');
  if (blockSize > CUDA_THREAD_BLOCK_CEILING) throw new RangeError('blockSize exceeds CUDA architectural thread-block ceiling');

  const compiled = await compileDeviceProgram(runtime, packedOwnershipDominance42DeviceProgram);
  const artifact = compiled.linker?.artifact ?? compiled.compiler?.artifact;
  if (!artifact || (artifact.format !== 'ptx' && artifact.format !== 'cubin')) {
    throw new Error(`unexpected executable artifact format: ${artifact?.format ?? 'missing'}`);
  }

  const module = await runtime.loadModule({ format: artifact.format, bytes: artifact.bytes });
  const kernel = kernelByName(compiled, 'markDominatedPacked42');
  const markDominated = await module.getFunction({ name: kernel.functionName, parameters: kernel.parameters });
  const gridX = Math.ceil(candidateCapacity / blockSize);

  const prepared = await runtime.prepareOperationDag({ nodes: [
    {
      id: 'mark-dominated',
      function: markDominated,
      grid: { x: gridX, y: 1, z: 1 },
      block: { x: blockSize, y: 1, z: 1 },
      arguments: [
        binding('candidateLo'),
        binding('candidateHi'),
        binding('frontierLo'),
        binding('frontierHi'),
        binding('flags'),
        binding('checks'),
        candidateCapacity,
        frontierCapacity,
      ],
      accesses: [
        { argumentIndex: 0, byteOffset: 0, byteLength: candidateCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 1, byteOffset: 0, byteLength: candidateCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 2, byteOffset: 0, byteLength: frontierCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 3, byteOffset: 0, byteLength: frontierCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 4, byteOffset: 0, byteLength: candidateCapacity * U32_BYTES, mode: 'write' },
        { argumentIndex: 5, byteOffset: 0, byteLength: candidateCapacity * U32_BYTES, mode: 'write' },
      ],
    },
  ] });

  const owned = [module, markDominated, prepared];
  let closed = false;

  return Object.freeze({
    kind: 'connect4-bsfp-benchmark-plan',
    contract: PACKED_OWNERSHIP_DOMINANCE_42_CONTRACT,
    family: 'packed-ownership-dominance-42',
    candidateCapacity,
    frontierCapacity,
    blockSize,
    gridX,
    async submit(bindings) {
      if (closed) throw new Error('packed ownership dominance plan is closed');
      const normalized = {
        candidateLo: requireU32View(bindings?.candidateLo, candidateCapacity, 'candidateLo', 'read'),
        candidateHi: requireU32View(bindings?.candidateHi, candidateCapacity, 'candidateHi', 'read'),
        frontierLo: requireU32View(bindings?.frontierLo, frontierCapacity, 'frontierLo', 'read'),
        frontierHi: requireU32View(bindings?.frontierHi, frontierCapacity, 'frontierHi', 'read'),
        flags: requireU32View(bindings?.flags, candidateCapacity, 'flags', 'write'),
        checks: requireU32View(bindings?.checks, candidateCapacity, 'checks', 'write'),
      };
      rejectWriteConflicts([
        { label: 'candidateLo', view: normalized.candidateLo, access: 'read' },
        { label: 'candidateHi', view: normalized.candidateHi, access: 'read' },
        { label: 'frontierLo', view: normalized.frontierLo, access: 'read' },
        { label: 'frontierHi', view: normalized.frontierHi, access: 'read' },
        { label: 'flags', view: normalized.flags, access: 'write' },
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
