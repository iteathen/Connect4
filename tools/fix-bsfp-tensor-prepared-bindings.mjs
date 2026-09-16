import { readFileSync, writeFileSync } from 'node:fs';

function replaceOne(path, from, to, label) {
  const before = readFileSync(path, 'utf8');
  const count = before.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one anchor, found ${count}`);
  writeFileSync(path, before.replace(from, to));
}

const run = 'research/experiments/cuda-bsfp-tensor-dominance/run.mjs';

replaceOne(
  run,
`function binding(name) { return Object.freeze({ binding: name }); }
function access(argumentIndex, allocation, mode) {
  return Object.freeze({ argumentIndex, byteOffset: 0, byteLength: allocation.count * allocation.width, mode });
}
`,
`function binding(name) { return Object.freeze({ binding: name }); }
function access(argumentIndex, allocation, mode) {
  return Object.freeze({ argumentIndex, byteOffset: 0, byteLength: allocation.count * allocation.width, mode });
}

function tensorBindingName(parameter) {
  if (parameter.role === 'input') {
    if (parameter.name === 'candidates') return 'candidateBits';
    if (parameter.name === 'frontierTransposed') return 'frontierBits';
    if (parameter.name === 'frontierPopcounts') return 'frontierPopcounts';
    if (parameter.name === 'ones') return 'ones';
  } else if (parameter.role === 'output') return 'tensorDominated';
  else if (parameter.role === 'workspace') return 'tensorWorkspace';
  throw new Error(`unsupported Tensor dominance binding role/name ${parameter.role}/${parameter.name}`);
}

function assertPreparedBindings(prepared, bindings, label) {
  const expected = Object.keys(bindings).sort();
  const actual = prepared.bindings.map((entry) => entry.name).sort();
  assert.deepEqual(actual, expected, `${label} prepared binding schema mismatch`);
}
`,
  'prepared binding helpers',
);

replaceOne(
  run,
`  const tensorParameterBinding = new Map();
  for (const parameter of pointerParameters) {
    let allocation;
    if (parameter.role === 'input') {
      if (parameter.name === 'candidates') allocation = allocations.candidateBits;
      else if (parameter.name === 'frontierTransposed') allocation = allocations.frontierBits;
      else if (parameter.name === 'frontierPopcounts') allocation = allocations.frontierPopcounts;
      else if (parameter.name === 'ones') allocation = allocations.ones;
      else throw new Error(`unmapped Tensor dominance input ${parameter.name}`);
    } else if (parameter.role === 'output') allocation = allocations.tensorDominated;
    else if (parameter.role === 'workspace') allocation = allocations.tensorWorkspace;
    else throw new Error(`unsupported Tensor dominance parameter role ${parameter.role}`);
    assert.equal(allocation.dtype, parameter.dtype);
    assert(allocation.count >= parameter.elementCount);
    tensorParameterBinding.set(parameter.parameterName, allocation);
  }

  const tensorBindings = {};
  for (const [name, allocation] of tensorParameterBinding) tensorBindings[name] = allocation.view;
  tensorBindings.tensorStatus = allocations.tensorStatus.view;

  const tensorArguments = [...pointerParameters.map((entry) => binding(entry.parameterName)), binding('tensorStatus')];
  const tensorAccesses = pointerParameters.map((entry, index) => {
    const allocation = tensorParameterBinding.get(entry.parameterName);
    const mode = entry.access === 'read' ? 'read' : entry.access === 'write' ? 'write' : 'read-write';
    return access(index, allocation, mode);
  });
`,
`  const tensorParameterBindings = pointerParameters.map((parameter) => {
    let allocation;
    if (parameter.role === 'input') {
      if (parameter.name === 'candidates') allocation = allocations.candidateBits;
      else if (parameter.name === 'frontierTransposed') allocation = allocations.frontierBits;
      else if (parameter.name === 'frontierPopcounts') allocation = allocations.frontierPopcounts;
      else if (parameter.name === 'ones') allocation = allocations.ones;
      else throw new Error(`unmapped Tensor dominance input ${parameter.name}`);
    } else if (parameter.role === 'output') allocation = allocations.tensorDominated;
    else if (parameter.role === 'workspace') allocation = allocations.tensorWorkspace;
    else throw new Error(`unsupported Tensor dominance parameter role ${parameter.role}`);
    assert.equal(allocation.dtype, parameter.dtype);
    assert(allocation.count >= parameter.elementCount);
    return Object.freeze({ parameter, allocation, bindingName: tensorBindingName(parameter) });
  });

  const tensorBindings = {};
  for (const entry of tensorParameterBindings) {
    if (Object.hasOwn(tensorBindings, entry.bindingName)) throw new Error(`duplicate Tensor logical binding ${entry.bindingName}`);
    tensorBindings[entry.bindingName] = entry.allocation.view;
  }
  tensorBindings.tensorStatus = allocations.tensorStatus.view;
  const frozenTensorBindings = Object.freeze(tensorBindings);

  const tensorArguments = [...tensorParameterBindings.map((entry) => binding(entry.bindingName)), binding('tensorStatus')];
  const tensorAccesses = tensorParameterBindings.map((entry, index) => {
    const mode = entry.parameter.access === 'read' ? 'read' : entry.parameter.access === 'write' ? 'write' : 'read-write';
    return access(index, entry.allocation, mode);
  });
`,
  'logical Tensor bindings',
);

replaceOne(
  run,
`  const tensorFullPrepared = await runtime.prepareOperationDag({ nodes: [
    unpackCandidateNode,
    unpackFrontierNode,
    Object.freeze({ ...runTensorNode, after: Object.freeze(['unpack-candidates', 'unpack-frontier']) }),
  ] });

  return Object.freeze({
    module,
    functionHandles: Object.freeze(functionHandles),
    baselinePrepared,
    baselineBindings,
    tensorOnlyPrepared,
    tensorFullPrepared,
    tensorBindings: Object.freeze(tensorBindings),
  });
`,
`  const tensorFullPrepared = await runtime.prepareOperationDag({ nodes: [
    unpackCandidateNode,
    unpackFrontierNode,
    Object.freeze({ ...runTensorNode, after: Object.freeze(['unpack-candidates', 'unpack-frontier']) }),
  ] });
  const tensorFullBindings = Object.freeze({
    ...frozenTensorBindings,
    candidateLo: allocations.candidateLo.view,
    candidateHi: allocations.candidateHi.view,
    frontierLo: allocations.frontierLo.view,
    frontierHi: allocations.frontierHi.view,
  });
  assertPreparedBindings(tensorOnlyPrepared, frozenTensorBindings, 'Tensor-only');
  assertPreparedBindings(tensorFullPrepared, tensorFullBindings, 'packed-to-Tensor');

  return Object.freeze({
    module,
    functionHandles: Object.freeze(functionHandles),
    baselinePrepared,
    baselineBindings,
    tensorOnlyPrepared,
    tensorFullPrepared,
    tensorBindings: frozenTensorBindings,
    tensorFullBindings,
  });
`,
  'full prepared binding schema',
);

replaceOne(
  run,
  'async function nativeExperiment(runtime, fixture, tensorDeviceProgram, compiled, pointerParameters) {',
  'async function executionExperiment(runtime, fixture, tensorDeviceProgram, compiled, pointerParameters, native) {',
  'execution experiment signature',
);

replaceOne(
  run,
`    prepared = await prepareNativeTensorPath(runtime, compiled, pointerParameters, allocations);
    const baselineTiming = await timePrepared(prepared.baselinePrepared, prepared.baselineBindings);

    // Populate Tensor inputs once, validate the complete path, then measure both the
    // Tensor leaf alone and the complete packed->Tensor unpack+dominance path.
    const fullPrime = await timePrepared(prepared.tensorFullPrepared, prepared.tensorBindings, 0, 1);
    const tensorOnlyTiming = await timePrepared(prepared.tensorOnlyPrepared, prepared.tensorBindings);
    const tensorFullTiming = await timePrepared(prepared.tensorFullPrepared, prepared.tensorBindings);
`,
`    prepared = await prepareNativeTensorPath(runtime, compiled, pointerParameters, allocations);
    if (!native) {
      const operation = await prepared.tensorFullPrepared.submit({ bindings: prepared.tensorFullBindings });
      try {
        const terminal = await operation.wait();
        assert.equal(terminal.status, 'completed');
      } finally {
        await operation.close();
      }
      return Object.freeze({
        outcome: 'portable-tensor-dominance-prepared-submit-pass',
        tensorOnlyBindingCount: prepared.tensorOnlyPrepared.bindings.length,
        tensorFullBindingCount: prepared.tensorFullPrepared.bindings.length,
      });
    }

    const baselineTiming = await timePrepared(prepared.baselinePrepared, prepared.baselineBindings);

    // Populate Tensor inputs once, validate the complete path, then measure both the
    // Tensor leaf alone and the complete packed->Tensor unpack+dominance path.
    const fullPrime = await timePrepared(prepared.tensorFullPrepared, prepared.tensorFullBindings, 0, 1);
    const tensorOnlyTiming = await timePrepared(prepared.tensorOnlyPrepared, prepared.tensorBindings);
    const tensorFullTiming = await timePrepared(prepared.tensorFullPrepared, prepared.tensorFullBindings);
`,
  'portable prepared submit and full bindings',
);

replaceOne(
  run,
`    const authority = await runAuthority(runtime, fixture, native);
    const execution = native ? await nativeExperiment(runtime, fixture, tensorDeviceProgram, compiled, pointerParameters) : Object.freeze({ outcome: 'portable-tensor-dominance-compile-pass' });
`,
`    const authority = await runAuthority(runtime, fixture, native);
    const execution = await executionExperiment(runtime, fixture, tensorDeviceProgram, compiled, pointerParameters, native);
`,
  'portable execution qualification',
);

const workflow = '.github/workflows/bsfp-tensor-overflow-portable.yml';
replaceOne(
  workflow,
`      - name: Qualify Tensor packed42 overflow semantics
        run: node --test components/bsfp/cuda/test/tensor-packed42-overflow-normalizer.test.mjs
      - name: Verify exact pair identities
`,
`      - name: Qualify Tensor packed42 overflow semantics
        run: node --test components/bsfp/cuda/test/tensor-packed42-overflow-normalizer.test.mjs
      - name: Qualify full-shape prepared Tensor A/B contract
        run: node research/experiments/cuda-bsfp-tensor-dominance/run.mjs portable
      - name: Verify exact pair identities
`,
  'permanent full-shape portable gate',
);
