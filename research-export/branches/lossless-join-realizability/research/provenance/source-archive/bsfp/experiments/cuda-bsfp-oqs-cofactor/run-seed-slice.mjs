import assert from 'node:assert/strict';
import { openCudaRuntime } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';
import { createOqsCofactor42Plan } from '../../components/bsfp/cuda/oqs-cofactor-42-plan.mjs';
import { oqsCofactor42Shape } from '../../components/bsfp/cuda/oqs-cofactor-42-layout.mjs';
import { packOqsFixture, verifyOqsOutput } from './fixtures.mjs';
import { build7x6SeedSliceFixture } from './seed-slice-fixture.mjs';

const mode = process.argv[2] ?? 'portable'; assert(['native', 'portable'].includes(mode));
const native = mode === 'native';
console.error('[oqs-o2] rebuilding selected first cut and independent layers');
const fixture = build7x6SeedSliceFixture();
const options = { ...fixture.spec, slice: 'seed-cut-0' };
const shape = oqsCofactor42Shape(options);
const runtimeOptions = { compiler: true, driver: { execution: { maxArguments: 64 }, memory: {
  maxDeviceBytes: shape.upperBoundBytes, maxAllocationBytes: 128 * 1024 ** 2, maxTransferBytes: 64 * 1024 ** 2 } } };
const runtime = native ? await openCudaRuntime(runtimeOptions) : await openCudaRuntimeForTesting(runtimeOptions);
let plan; let result; const errors = [];
try {
  plan = await createOqsCofactor42Plan(runtime, options);
  const data = packOqsFixture(fixture, shape); const samples = [];
  for (let pass = 0; pass < (native ? 4 : 1); pass++) {
    for (const preserveAntichains of pass % 2 ? [true, false] : [false, true]) {
      const output = await plan.run(data, { preserveAntichains, numerical: native });
      if (native) verifyOqsOutput(fixture, output, shape);
      samples.push({ pass, warmup: pass === 0, preserveAntichains, uploadMs: output.uploadMs,
        submitWaitMs: output.submitWaitMs, readbackMs: output.readbackMs ?? null });
    }
  }
  result = { kind: 'connect4-bsfp-oqs-7x6-seed-slice', mode, geometry: '7x6:c4',
    outcome: native ? 'native-oqs-seed-slice-pass' : 'portable-oqs-seed-slice-submit-pass',
    supportIndex: fixture.supportIndex, cut: 0, transitionsChecked: native ? 1 : 0,
    candidatesPerPass: 16, nativePasses: native ? 8 : 0,
    independentLayers: fixture.independentLayers, seedSourceSha256: fixture.seedSourceSha256,
    mismatches: native ? 0 : null, targetCoverage: native ? 1 : null,
    evidenceGrade: native ? 'selected-seed-first-cut-only' : 'portable-composition-only',
    fullDeviceQuotientSynthesis: false, rootWdl: null, samples,
    seedWins: fixture.states[0].pair.wins.length, seedLosses: fixture.states[0].pair.losses.length,
    deviceBytes: shape.deviceBytes, upperBoundBytes: shape.upperBoundBytes, setupMs: plan.setupMs };
} catch (error) { errors.push(error); }
finally {
  try { await plan?.close(); } catch (error) { errors.push(error); }
  try { assert.equal((await runtime.close()).graceful, true); } catch (error) { errors.push(error); }
}
if (errors.length) throw new AggregateError(errors, 'OQS seed slice failed');
console.log(JSON.stringify({ ...result, cleanup: 'graceful' }, null, 2));
