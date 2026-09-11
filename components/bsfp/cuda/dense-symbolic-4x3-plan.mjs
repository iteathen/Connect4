import { compileDeviceProgram, inspectDeviceViewRelation } from 'cuda-js';

import { BSFP_4X3_CONNECT3_DENSE_PROFILE } from '../dense-symbolic-profile.mjs';
import { denseBsfp4x3DeviceProgram } from './dense-symbolic-4x3-program.mjs';

const U32_BYTES = 4;
const CUDA_THREAD_BLOCK_CEILING = 1024;

export const DENSE_BSFP_4X3_WDL_CONTRACT = 'Connect4-CUDA-BSFP-dense-symbolic-4x3-wdl-v0';

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
  if (failures.length > 0) throw new AggregateError(failures, 'dense CUDA-BSFP plan cleanup failed');
}

export async function createDenseBsfp4x3WdlPlan(runtime, options = {}) {
  const profile = BSFP_4X3_CONNECT3_DENSE_PROFILE;
  const blockSize = positiveSafeInteger(options.blockSize ?? 128, 'blockSize');
  if (blockSize > CUDA_THREAD_BLOCK_CEILING) throw new RangeError('blockSize exceeds CUDA architectural thread-block ceiling');

  const compiled = await compileDeviceProgram(runtime, denseBsfp4x3DeviceProgram);
  const artifact = compiled.linker?.artifact ?? compiled.compiler?.artifact;
  if (!artifact || (artifact.format !== 'ptx' && artifact.format !== 'cubin')) {
    throw new Error(`unexpected executable artifact format: ${artifact?.format ?? 'missing'}`);
  }

  const module = await runtime.loadModule({ format: artifact.format, bytes: artifact.bytes });
  const kernel = kernelByName(compiled, 'evaluateBsfpRank4x3');
  const evaluateRank = await module.getFunction({ name: kernel.functionName, parameters: kernel.parameters });
  const gridX = Math.ceil(profile.tableElements / blockSize);

  const nodes = [];
  let previousId = null;
  for (let rank = profile.support.maxRank; rank >= 0; rank -= 1) {
    const id = `rank-${rank}`;
    nodes.push({
      id,
      ...(previousId === null ? {} : { after: [previousId] }),
      function: evaluateRank,
      grid: { x: gridX, y: 1, z: 1 },
      block: { x: blockSize, y: 1, z: 1 },
      arguments: [
        binding('table'),
        binding('ranks'),
        binding('filledMasks'),
        binding('lineMasks'),
        rank,
        profile.support.itemCapacity,
        profile.assignmentCount,
        profile.winningLineMasks.length,
      ],
      accesses: [
        { argumentIndex: 0, byteOffset: 0, byteLength: profile.tableBytes, mode: 'read-write' },
        { argumentIndex: 1, byteOffset: 0, byteLength: profile.support.itemCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 2, byteOffset: 0, byteLength: profile.support.itemCapacity * U32_BYTES, mode: 'read' },
        { argumentIndex: 3, byteOffset: 0, byteLength: profile.winningLineMasks.length * U32_BYTES, mode: 'read' },
      ],
    });
    previousId = id;
  }

  const prepared = await runtime.prepareOperationDag({ nodes });
  const owned = [module, evaluateRank, prepared];
  let closed = false;

  return Object.freeze({
    kind: 'connect4-bsfp-plan',
    contract: DENSE_BSFP_4X3_WDL_CONTRACT,
    family: 'dense-symbolic-wdl',
    geometry: profile.geometry,
    resultEncoding: profile.resultEncoding,
    realization: Object.freeze({
      tableElements: profile.tableElements,
      tableBytes: profile.tableBytes,
      supportItemCapacity: profile.support.itemCapacity,
      assignmentCount: profile.assignmentCount,
      preparedNodeCount: nodes.length,
      blockSize,
      gridX,
    }),
    async submit(bindings) {
      if (closed) throw new Error('dense CUDA-BSFP plan is closed');
      const normalized = {
        table: requireU32View(bindings?.table, profile.tableElements, 'table', 'read-write'),
        ranks: requireU32View(bindings?.ranks, profile.support.itemCapacity, 'ranks', 'read'),
        filledMasks: requireU32View(bindings?.filledMasks, profile.support.itemCapacity, 'filledMasks', 'read'),
        lineMasks: requireU32View(bindings?.lineMasks, profile.winningLineMasks.length, 'lineMasks', 'read'),
      };
      rejectWriteConflicts([
        { label: 'table', view: normalized.table, access: 'write' },
        { label: 'ranks', view: normalized.ranks, access: 'read' },
        { label: 'filledMasks', view: normalized.filledMasks, access: 'read' },
        { label: 'lineMasks', view: normalized.lineMasks, access: 'read' },
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
