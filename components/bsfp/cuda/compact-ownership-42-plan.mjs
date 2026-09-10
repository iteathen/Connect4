import { performance } from 'node:perf_hooks';
import { compileDeviceProgram } from 'cuda-js';
import { compactOwnership42DeviceProgram } from './compact-ownership-42-program.mjs';
import { compactOwnership42Shape, buildCompactOwnership42Layout } from './compact-ownership-42-layout.mjs';

export const COMPACT_OWNERSHIP_42_CONTRACT = 'Connect4-CUDA-BSFP-compact-ownership-42-v0';

async function closeAll(resources) {
  const failures = [];
  for (const resource of [...resources].reverse()) try { await resource.close(); } catch (error) { failures.push(error); }
  if (failures.length) throw new AggregateError(failures, 'compact BSFP cleanup failed');
}

/** Owns all device allocations. The schedule depends only on static support ranks.
 * Optional expected frontiers are read solely by independent observer kernels. */
export async function createCompactOwnership42Plan(runtime, options, expected = null) {
  const resources = [];
  const allocations = {};
  const timings = {};
  let closed = false;
  let active = false;
  let attempted = false;
  let completed = false;
  let started = performance.now();
  const shape = compactOwnership42Shape(options);
  if (expected && options.qualificationOracle === false) throw new Error('oracle was excluded from memory admission');
  const layout = buildCompactOwnership42Layout(shape);
  timings.rankSetupMs = performance.now() - started;
  const n = shape.support.itemCapacity;
  const sizes = {
    rankLo: shape.rankElements, rankHi: shape.rankElements, rankCounts: 4 * shape.rankCapacity,
    lo: shape.scratchElements, hi: shape.scratchElements, pop: shape.scratchElements, checks: shape.scratchElements,
    workLo: shape.workElements, workHi: shape.workElements, control: shape.shardCapacity, status: shape.shardCapacity,
    errors: 1, metrics: 2 * n, report: 4 * n,
  };
  const inputs = { ...layout.inputs };
  if (expected) {
    const offsets = new Uint32Array(2 * n + 1);
    const masks = [];
    for (let item = 0; item < n; item++) {
      const frontiers = expected.frontierAt(item);
      for (let direction = 0; direction < 2; direction++) {
        offsets[2 * item + direction] = masks.length;
        const frontier = direction === 0 ? frontiers.wins : frontiers.losses;
        if (frontier.length > shape.frontierCapacity) throw new RangeError('oracle exceeds admitted qualification memory bound');
        masks.push(...frontier);
      }
    }
    offsets[2 * n] = masks.length;
    inputs.expectedOffsets = offsets;
    inputs.expectedLo = Uint32Array.from(masks, (mask) => Number(BigInt(mask) & 0xffff_ffffn));
    inputs.expectedHi = Uint32Array.from(masks, (mask) => Number(BigInt(mask) >> 32n));
  }
  try {
    started = performance.now();
    const compiled = await compileDeviceProgram(runtime, compactOwnership42DeviceProgram);
    const artifact = compiled.linker?.artifact ?? compiled.compiler?.artifact;
    if (!artifact || !['ptx', 'cubin'].includes(artifact.format)) throw new Error('compact BSFP executable artifact missing');
    const module = await runtime.loadModule({ format: artifact.format, bytes: artifact.bytes });
    resources.push(module);
    const kernels = {};
    for (const kernel of compiled.deviceProgram.kernels) {
      kernels[kernel.name] = await module.getFunction({ name: kernel.functionName, parameters: kernel.parameters });
      resources.push(kernels[kernel.name]);
    }
    timings.compileLoadMs = performance.now() - started;
    started = performance.now();
    const specifications = { ...sizes };
    for (const [name, values] of Object.entries(inputs)) specifications[name] = Math.max(1, values.length);
    let deviceBytes = 0;
    for (const [name, count] of Object.entries(specifications)) {
      const width = name === 'metrics' ? 8 : 4;
      const memory = await runtime.allocateDevice({ byteLength: count * width });
      resources.push(memory);
      const view = await memory.view({ dtype: width === 8 ? 'u64' : 'u32', elementCount: count, access: inputs[name] ? 'read' : 'read-write' });
      resources.push(view);
      allocations[name] = { memory, view, byteLength: count * width, count, width };
      deviceBytes += count * width;
    }
    if (deviceBytes > shape.upperBoundBytes - 256 * 1024 ** 2) throw new Error('actual payload exceeds profile admission bound');
    timings.allocationMs = performance.now() - started;
    started = performance.now();
    // Initialize control/observer state. Payload lanes are written before use;
    // uploading zero-filled rank/scratch arenas would add no semantic evidence.
    for (const [name, allocation] of Object.entries(allocations)) {
      if (!inputs[name] && !['rankCounts', 'errors', 'metrics', 'report'].includes(name)) continue;
      let bytes;
      if (inputs[name]?.length) {
        const values = inputs[name]; bytes = new Uint8Array(values.buffer, values.byteOffset, values.byteLength);
      } else {
        bytes = new Uint8Array(allocation.byteLength);
        if (name === 'report') bytes.fill(255);
      }
      await allocation.memory.write(bytes);
    }
    timings.uploadMs = performance.now() - started;
    started = performance.now();
    const nodes = [];
    const addNode = (name, scalars, gridX) => {
      const descriptor = compactOwnership42DeviceProgram.functions.find((entry) => entry.name === name);
      const id = `compact-${nodes.length}`;
      const args = descriptor.parameters.map(({ name: parameterName, type }) => type.startsWith('ptr<') ? { binding: parameterName } : scalars[parameterName]);
      if (args.some((arg) => arg === undefined)) throw new Error('missing compact DAG scalar');
      const accesses = descriptor.parameters.flatMap(({ name: parameterName, type }, argumentIndex) => type.startsWith('ptr<') ? [{
        argumentIndex, byteOffset: 0, byteLength: allocations[parameterName].byteLength,
        mode: inputs[parameterName] ? 'read' : 'read-write',
      }] : []);
      nodes.push({ id, ...(nodes.length ? { after: [nodes.at(-1).id] } : {}), function: kernels[name],
        grid: { x: gridX, y: 1, z: 1 }, block: { x: shape.blockSize, y: 1, z: 1 }, arguments: args, accesses });
    };
    for (let rank = shape.support.maxRank; rank >= 0; rank--) {
      const scalars = { rank, rankOffset: layout.rankOffsets[rank], rankCount: shape.rankCounts[rank], rankCapacity: shape.rankCapacity,
        capacity: shape.frontierCapacity, tileSize: shape.candidateTileSize, columns: shape.columns, maxRank: shape.support.maxRank };
      for (let shardStart = 0; shardStart < scalars.rankCount; shardStart += shape.shardCapacity) {
        const shardCount = Math.min(shape.shardCapacity, scalars.rankCount - shardStart);
        addNode('solveCompactRank42', { ...scalars, shardStart, shardCount }, shardCount);
      }
      if (expected) addNode('verifyCompactRank42', scalars, scalars.rankCount);
      else addNode('recordCompactRank42', scalars, Math.ceil(scalars.rankCount / shape.blockSize));
    }
    // SPEC-0020's finite 32-node envelope: statically partition the schedule.
    // Runtime completion orders epochs; no device count or proof is read here.
    const epochs = [];
    for (let offset = 0; offset < nodes.length; offset += 32) {
      const group = nodes.slice(offset, offset + 32).map((node, index) => {
        if (index !== 0) return node;
        const { after, ...first } = node;
        return first;
      });
      const prepared = await runtime.prepareOperationDag({ nodes: group });
      resources.push(prepared);
      epochs.push({ prepared, names: [...new Set(group.flatMap((node) => node.arguments.filter((arg) => typeof arg === 'object').map((arg) => arg.binding)))] });
    }
    timings.prepareMs = performance.now() - started;
    const bindings = Object.fromEntries(Object.entries(allocations).map(([name, allocation]) => [name, allocation.view]));
    const read = async (name, byteLength = allocations[name].byteLength) => {
      const { bytes } = await allocations[name].memory.read({ byteLength });
      return allocations[name].width === 8 ? new BigUint64Array(bytes.buffer, bytes.byteOffset, byteLength / 8) : new Uint32Array(bytes.buffer, bytes.byteOffset, byteLength / 4);
    };
    return Object.freeze({
      contract: COMPACT_OWNERSHIP_42_CONTRACT, shape, deviceBytes, launchCount: nodes.length, epochCount: epochs.length, timings: Object.freeze(timings),
      async execute({ onEpoch = null } = {}) {
        if (onEpoch !== null && typeof onEpoch !== 'function') throw new TypeError('onEpoch must be a function');
        if (closed || active || attempted) throw new Error('compact plan is closed, active, or already executed');
        attempted = true;
        active = true;
        let operation;
        try {
          const begin = performance.now();
          let terminal;
          const epochSubmitWaitMs = [];
          for (const { prepared, names } of epochs) {
            const epochStarted = performance.now();
            operation = await prepared.submit({ bindings: Object.fromEntries(names.map((name) => [name, bindings[name]])) });
            terminal = await operation.wait();
            if (terminal.status !== 'completed') throw new Error(`compact operation ${terminal.status}`);
            epochSubmitWaitMs.push(performance.now() - epochStarted);
            await operation.close(); operation = null;
            // Administrative timing only; return value cannot change the schedule.
            if (onEpoch) onEpoch(epochSubmitWaitMs.length - 1, epochSubmitWaitMs.at(-1));
          }
          completed = true;
          return { submitWaitMs: performance.now() - begin, epochSubmitWaitMs, terminal };
        } finally {
          try { if (operation) await operation.close(); } finally { active = false; }
        }
      },
      async result() {
        if (closed || !completed) throw new Error('compact result requires completed operation');
        const begin = performance.now();
        const errors = await read('errors');
        if (errors[0] !== 0) throw new Error(`compact CUDA capacity failure ${errors[0]}; root unresolved`);
        const report = await read('report');
        const metrics = await read('metrics');
        const rootLo = await read('rankLo', 2 * shape.frontierCapacity * 4);
        const rootHi = await read('rankHi', 2 * shape.frontierCapacity * 4);
        const readbackMs = performance.now() - begin;
        let pairs = 0n; let subsetChecks = 0n; let totalFrontierRecords = 0; let maxFrontierWidth = 0; let mismatches = 0;
        for (let item = 0; item < n; item++) {
          pairs += metrics[item * 2]; subsetChecks += metrics[item * 2 + 1];
          for (let dir = 0; dir < 2; dir++) {
            const count = report[item * 4 + dir * 2];
            if (count > shape.frontierCapacity) throw new Error(`unfinalized/invalid support ${item}`);
            totalFrontierRecords += count; maxFrontierWidth = Math.max(maxFrontierWidth, count);
            if (expected && report[item * 4 + dir * 2 + 1] !== 0) mismatches++;
          }
        }
        const rootWins = report[0]; const rootLosses = report[2];
        if (pairs > BigInt(Number.MAX_SAFE_INTEGER) || subsetChecks > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('compact metric exceeds exact JSON integer range');
        if (rootWins > 1 || rootLosses > 1 || rootWins + rootLosses > 1) throw new Error('invalid empty-root frontier');
        for (let dir = 0; dir < 2; dir++) if (report[dir * 2] && (rootLo[dir * shape.frontierCapacity] !== 0 || rootHi[dir * shape.frontierCapacity] !== 0)) throw new Error('empty-root mask escaped universe');
        return { rootWdl: rootWins ? 1 : rootLosses ? -1 : 0, closure: 'full-root', completedRank: 0,
          comparedSupports: expected ? n : 0, frontierMismatches: expected ? mismatches : null,
          pairCandidatesGenerated: Number(pairs), subsetChecksPerformed: Number(subsetChecks), totalFrontierRecords, maxFrontierWidth,
          readbackMs, hostResultValidationMs: performance.now() - begin - readbackMs };
      },
      async close() {
        if (closed) return;
        if (active) throw new Error('cannot close active compact operation');
        closed = true; await closeAll(resources);
      },
    });
  } catch (error) {
    try { await closeAll(resources); } catch (cleanupError) { throw new AggregateError([error, cleanupError], 'compact construction and cleanup failed'); }
    throw error;
  }
}
