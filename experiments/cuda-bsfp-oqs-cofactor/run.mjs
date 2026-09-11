import assert from 'node:assert/strict';

import { compileDeviceProgram, inspectDeviceProgram } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';

import { oqsCofactor42DeviceProgram } from '../../components/bsfp/cuda/oqs-cofactor-42-program.mjs';

const inspection = inspectDeviceProgram(oqsCofactor42DeviceProgram);
assert(inspection);

let runtime;
try {
  runtime = await openCudaRuntimeForTesting({ compiler: true });
  const compiled = await compileDeviceProgram(runtime, oqsCofactor42DeviceProgram);
  const artifact = compiled.linker?.artifact ?? compiled.compiler?.artifact;
  assert(artifact);
  assert(['ptx', 'cubin'].includes(artifact.format));
  const names = new Set(compiled.deviceProgram.functions.map((entry) => entry.name));
  assert(names.has('resetOqsCofactor42Control'));
  assert(names.has('synthesizeOqsCofactor42Candidates'));
  console.log(JSON.stringify({
    kind: 'connect4-bsfp-oqs-cofactor-42-portable-compile',
    status: 'pass',
    artifactFormat: artifact.format,
    functionCount: compiled.deviceProgram.functions.length,
    kernels: compiled.deviceProgram.functions.filter((entry) => entry.kind === 'kernel').map((entry) => entry.name),
  }));
} finally {
  if (runtime) {
    const closed = await runtime.close();
    assert.equal(closed.graceful, true);
  }
}
