import assert from 'node:assert/strict';
import { openCudaRuntime } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';
import { createOqsCofactor42Plan } from '../../components/bsfp/cuda/oqs-cofactor-42-plan.mjs';
import { oqsCofactor42Shape } from '../../components/bsfp/cuda/oqs-cofactor-42-layout.mjs';
import { packOqsFixture, verifyOqsOutput, highLaneFixture } from './fixtures.mjs';
import { buildFactoredFixtures, factorOqsFixture, packFactoredFixture, verifyFactoredOutput } from './factored-fixtures.mjs';

const mode = process.argv[2] ?? 'portable'; assert(['native', 'portable'].includes(mode));
const native = mode === 'native';
const spec = { columns: Number(process.argv[3] ?? 4), rows: Number(process.argv[4] ?? 4), connect: 4 };
const slice = spec.columns === 4 ? 'reuse-control' : 'reuse-cut-5';
const options = { ...spec, slice };
const baseShape = oqsCofactor42Shape({ ...options, representation: 'unfactored' });
const factoredShape = oqsCofactor42Shape({ ...options, representation: 'factored' });
const deviceBytes = baseShape.deviceBytes + factoredShape.deviceBytes;
const upperBoundBytes = deviceBytes + 256 * 1024 ** 2;
console.error(`[oqs-o3] preparing exact ${spec.columns}x${spec.rows} fixtures`);
const fixtures = buildFactoredFixtures(spec);
const runtimeOptions = { compiler: true, driver: { execution: { maxArguments: 64 }, memory: {
  maxDeviceBytes: upperBoundBytes, maxAllocationBytes: 128 * 1024 ** 2, maxTransferBytes: 64 * 1024 ** 2 } } };
const runtime = native ? await openCudaRuntime(runtimeOptions) : await openCudaRuntimeForTesting(runtimeOptions);
const resources = []; const errors = []; let result;
try {
  const base = await createOqsCofactor42Plan(runtime, { ...options, representation: 'unfactored' }); resources.push(base);
  const factored = await createOqsCofactor42Plan(runtime, { ...options, representation: 'factored' }); resources.push(factored);
  const samples = []; let logicalCandidates = 0; let residualCandidates = 0;
  for (const fixture of fixtures) {
    const baseData = packOqsFixture(fixture, base.shape); const factoredData = packFactoredFixture(fixture, factored.shape);
    const pairs = factorOqsFixture(fixture).states.length;
    logicalCandidates += fixture.candidates.length; residualCandidates += pairs * fixture.inputs.length;
    for (let pass = 0; pass < (native ? 4 : 1); pass++) {
      for (const representation of (pass + fixture.cut) % 2 ? ['factored', 'unfactored'] : ['unfactored', 'factored']) {
        const plan = representation === 'factored' ? factored : base;
        const data = representation === 'factored' ? factoredData : baseData;
        const out = await plan.run(data, { preserveAntichains: true, numerical: native });
        if (native) {
          if (representation === 'factored') verifyFactoredOutput(fixture, out, plan.shape);
          else verifyOqsOutput(fixture, out, plan.shape);
        }
        samples.push({ cut: fixture.cut, representation, pass, warmup: pass === 0,
          uploadMs: out.uploadMs, submitWaitMs: out.submitWaitMs, readbackMs: out.readbackMs ?? null });
      }
    }
    console.error(`[oqs-o3] cut ${fixture.cut}: ${fixture.candidates.length} logical / ${pairs * fixture.inputs.length} residual candidates`);
  }
  const controls = [];
  if (spec.columns === 4) {
    const high = highLaneFixture(); const carried = 1n << 40n;
    const candidates = [...high.candidates, ...high.candidates.map(c => ({ ...c, xMask: c.xMask | carried }))];
    const fixture = { ...high, nextCrossingMask: high.nextCrossingMask | carried,
      states: [...high.states, { ...high.states[0], xMask: carried }], candidates, nextStates: candidates };
    const run = async (data, expectedError) => {
      if (expectedError && native) await assert.rejects(factored.run(data), expectedError);
      else return factored.run(data, { numerical: native });
    };
    const out = await run(packFactoredFixture(fixture, factored.shape));
    if (native) verifyFactoredOutput(fixture, out, factored.shape);
    controls.push('shared-pair-distinct-crossing-bits-31-32-40-41');
    for (const [name, mutate, error] of [
      ['invalid-occurrence-extent', d => { d.activeOccurrenceCount[0] = factored.shape.occurrenceCapacity + 1; }, /mapping global status 1/],
      ['mapping-product-overflow', d => { d.activeOccurrenceCount[0] = factored.shape.occurrenceCapacity; }, /mapping global status 1/],
      ['invalid-residual-id', d => { d.occurrenceResidualId[0] = 0xffff_ffff; }, /mapping status 2/],
      ['invalid-crossing-high-lane', d => { d.occurrenceXHi[0] |= 1024; }, /mapping status 4/],
      ['upstream-cofactor-failure', d => { d.stateWinOffsets[1] = factored.shape.recordCapacity + 1; }, /generation status 2/],
    ]) {
      const data = packFactoredFixture(fixture, factored.shape); mutate(data); await run(data, error); controls.push(name);
    }
    const empty = packFactoredFixture(fixture, factored.shape); empty.activeOccurrenceCount[0] = 0;
    const emptyOut = await run(empty); if (native) assert.equal(emptyOut.mappedCount, 0);
    controls.push('empty-occurrence-extent');
    const recovered = await run(packFactoredFixture(fixture, factored.shape));
    if (native) verifyFactoredOutput(fixture, recovered, factored.shape);
    const unpreserved = await factored.run(packFactoredFixture(fixture, factored.shape), { preserveAntichains: false, numerical: native });
    if (native) verifyFactoredOutput(fixture, unpreserved, factored.shape);
    controls.push('valid-reuse-after-errors-and-both-normalizers');
    await factored.close();
    const variant = await createOqsCofactor42Plan(runtime, { ...options, representation: 'factored', blockSize: 64 }); resources.push(variant);
    const varied = await variant.run(packFactoredFixture(fixture, variant.shape), { numerical: native });
    if (native) verifyFactoredOutput(fixture, varied, variant.shape);
    controls.push('block-64-128');
  }
  result = { kind: 'connect4-bsfp-oqs-factored-reuse', mode, geometry: `${spec.columns}x${spec.rows}:c4`,
    outcome: native ? 'native-oqs-factored-reuse-pass' : 'portable-oqs-factored-submit-pass',
    evidenceGrade: native ? 'selected-input-pair-table-transform-and-mapping' : 'portable-composition-only',
    inputPairIds: 'CPU-exact-qualification-fixture', outputPairSlots: 'unmerged-residual-input-slots',
    devicePairGrouping: false, fullDeviceQuotientSynthesis: false, rootWdl: null,
    transitionsChecked: native ? fixtures.length : 0, logicalCandidates: native ? logicalCandidates : 0,
    residualCandidates: native ? residualCandidates : 0, nativePassesPerTransition: native ? 8 : 0,
    mismatches: native ? 0 : null, targetCoverage: native ? 1 : null, controls, samples,
    unfactoredDeviceBytes: baseShape.deviceBytes, factoredDeviceBytes: factoredShape.deviceBytes,
    deviceBytes, upperBoundBytes, setupMs: base.setupMs + factored.setupMs };
} catch (error) { errors.push(error); }
finally {
  for (const resource of resources.reverse()) try { await resource.close(); } catch (error) { errors.push(error); }
  try { assert.equal((await runtime.close()).graceful, true); } catch (error) { errors.push(error); }
}
if (errors.length) throw new AggregateError(errors, 'OQS factored qualification failed');
console.log(JSON.stringify({ ...result, cleanup: 'graceful' }, null, 2));
