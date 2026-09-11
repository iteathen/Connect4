import { performance } from 'node:perf_hooks';
import { compileDeviceProgram } from 'cuda-js';
import { oqsCofactor42DeviceProgram } from './oqs-cofactor-42-program.mjs';
import { oqsCofactor42Shape } from './oqs-cofactor-42-layout.mjs';

async function closeResources(resources) {
  const errors = [];
  for (const r of [...resources].reverse()) try { await r.close(); } catch (error) { errors.push(error); }
  if (errors.length) throw new AggregateError(errors, 'OQS resource cleanup failed');
}

/** Bounded semantic-transform qualification plan, not a quotient synthesizer.
 * Owns disjoint input/output/scratch buffers and reusable baseline/optimized DAGs.
 * Full-sized input buffers permit deliberate invalid device-metadata tests. */
export async function createOqsCofactor42Plan(runtime, options) {
  const shape = oqsCofactor42Shape(options);
  const resources = [];
  const buffers = {};
  let closed = false;
  let active = false;
  const started = performance.now();
  try {
    const compiled = await compileDeviceProgram(runtime, oqsCofactor42DeviceProgram);
    const artifact = compiled.linker?.artifact ?? compiled.compiler?.artifact;
    if (!artifact || !['ptx', 'cubin'].includes(artifact.format)) throw new Error('OQS executable artifact missing');
    const module = await runtime.loadModule({ format: artifact.format, bytes: artifact.bytes });
    resources.push(module);
    const kernels = {};
    for (const k of compiled.deviceProgram.kernels) {
      kernels[k.name] = await module.getFunction({ name: k.functionName, parameters: k.parameters });
      resources.push(kernels[k.name]);
    }
    const compileLoadMs = performance.now() - started;
    for (const [name, size] of Object.entries({ ...shape.inputSizes, ...shape.outputSizes })) {
      const memory = await runtime.allocateDevice({ byteLength: size * 4 });
      resources.push(memory);
      const view = await memory.view({ dtype: 'u32', elementCount: size, access: shape.inputSizes[name] ? 'read' : 'read-write' });
      resources.push(view);
      buffers[name] = { memory, view, size };
    }
    const dags = [];
    for (const preserveAntichains of [0, 1]) {
      const scalars = { ...shape, winRecordCapacity: shape.recordCapacity, lossRecordCapacity: shape.recordCapacity, preserveAntichains };
      const nodes = compiled.deviceProgram.kernels.map((k, index) => ({
        id: k.name, ...(index ? { after: [compiled.deviceProgram.kernels[index - 1].name] } : {}),
        function: kernels[k.name], grid: { x: index ? shape.candidateCapacity : 1, y: 1, z: 1 },
        block: { x: shape.blockSize, y: 1, z: 1 },
        arguments: oqsCofactor42DeviceProgram.functions.find(f => f.name === k.name).parameters.map(p => p.type.startsWith('ptr<') ? { binding: p.name } : scalars[p.name]),
        accesses: oqsCofactor42DeviceProgram.functions.find(f => f.name === k.name).parameters.flatMap((p, argumentIndex) => p.type.startsWith('ptr<') ? [{ argumentIndex,
          byteOffset: 0, byteLength: buffers[p.name].size * 4, mode: shape.inputSizes[p.name] ? 'read' : 'read-write' }] : []),
      }));
      const prepared = await runtime.prepareOperationDag({ nodes });
      resources.push(prepared); dags.push(prepared);
    }
    const bindings = Object.fromEntries(Object.entries(buffers).map(([name, b]) => [name, b.view]));
    const read = async (name, count = buffers[name].size) => {
      if (count === 0) return new Uint32Array(0);
      const { bytes } = await buffers[name].memory.read({ byteLength: count * 4 });
      return new Uint32Array(bytes.buffer, bytes.byteOffset, count);
    };
    return Object.freeze({ shape, compileLoadMs, setupMs: performance.now() - started,
      async run(inputs, { preserveAntichains = true, numerical = true } = {}) {
        if (closed || active) throw new Error('OQS plan is closed or active');
        active = true;
        let operation;
        try {
          let begin = performance.now();
          for (const [name, count] of Object.entries(shape.inputSizes)) {
            const a = inputs[name];
            if (!(a instanceof Uint32Array) || a.length !== count) throw new RangeError(`invalid OQS input extent ${name}`);
            await buffers[name].memory.write(new Uint8Array(a.buffer, a.byteOffset, a.byteLength));
          }
          const uploadMs = performance.now() - begin;
          begin = performance.now();
          operation = await dags[preserveAntichains ? 1 : 0].submit({ bindings });
          const terminal = await operation.wait();
          if (terminal.status !== 'completed') throw new Error(`OQS runtime ${terminal.status}`);
          const submitWaitMs = performance.now() - begin;
          await operation.close(); operation = null;
          if (!numerical) return { uploadMs, submitWaitMs, evidenceGrade: 'portable-composition-only' };
          begin = performance.now();
          const globalStatus = (await read('globalStatus'))[0];
          if (globalStatus !== 0) throw new Error(`OQS global status ${globalStatus}`);
          const count = (await read('candidateCount'))[0];
          if (count > shape.candidateCapacity) throw new Error('OQS candidate count outside capacity');
          const generations = await read('generationStatus', count);
          for (let i = 0; i < count; i++) if (generations[i] !== 0) throw new Error(`OQS candidate ${i} generation status ${generations[i]}`);
          const output = {};
          for (const name of ['outputWinCounts', 'outputWinStatus', 'outputLossCounts', 'outputLossStatus', 'candidateXLo', 'candidateXHi']) output[name] = await read(name, count);
          for (let i = 0; i < count; i++) for (const side of ['Win', 'Loss']) {
            if (output[`output${side}Status`][i] || output[`output${side}Counts`][i] > shape.frontierCapacity) throw new Error(`OQS ${side} frontier invalid`);
          }
          for (const name of ['outputWinLo', 'outputWinHi', 'outputLossLo', 'outputLossHi']) output[name] = await read(name, count * shape.frontierCapacity);
          return { count, ...output, uploadMs, submitWaitMs, readbackMs: performance.now() - begin };
        } catch (error) {
          if (operation) {
            try { await operation.close(); } catch (cleanup) { throw new AggregateError([error, cleanup], 'OQS operation and cleanup failed'); }
          }
          throw error;
        } finally { active = false; }
      },
      async close() {
        if (closed) return;
        if (active) throw new Error('cannot close active OQS plan');
        closed = true; await closeResources(resources);
      },
    });
  } catch (error) {
    try { await closeResources(resources); } catch (cleanup) { throw new AggregateError([error, cleanup], 'OQS construction and cleanup failed'); }
    throw error;
  }
}
