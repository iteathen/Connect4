import assert from 'node:assert/strict';
import { openCudaRuntime } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';
import { createOqsCofactor42Plan } from '../../components/bsfp/cuda/oqs-cofactor-42-plan.mjs';
import { oqsCofactor42Shape } from '../../components/bsfp/cuda/oqs-cofactor-42-layout.mjs';
import { buildOqsFixtures, packOqsFixture, verifyOqsOutput, highLaneFixture } from './fixtures.mjs';

const mode = process.argv[2] ?? 'portable';
assert(['portable', 'native'].includes(mode));
const native = mode === 'native';
const spec = { columns: Number(process.argv[3] ?? 4), rows: Number(process.argv[4] ?? 4), connect: Number(process.argv[5] ?? 4) };
const shape = oqsCofactor42Shape(spec);
console.error(`[oqs] building exact reference fixtures for ${spec.columns}x${spec.rows}`);
const reference = buildOqsFixtures(native ? spec : { columns: 4, rows: 4, connect: 4 }, { portable: !native });
console.error(`[oqs] ${reference.fixtures.length} transitions ready; C1 seed ${reference.c1SolveMs.toFixed(1)} ms`);
const runtimeOptions = { compiler: true, driver: { execution: { maxArguments: 64 }, memory: { maxDeviceBytes: shape.upperBoundBytes, maxAllocationBytes: 128 * 1024 ** 2, maxTransferBytes: 64 * 1024 ** 2 } } };
const runtime = native ? await openCudaRuntime(runtimeOptions) : await openCudaRuntimeForTesting(runtimeOptions);
const failures = []; const resources = [];
let result;
try {
  const plan = await createOqsCofactor42Plan(runtime, spec); resources.push(plan);
  const timings = { baseline: { uploadMs: 0, submitWaitMs: 0, readbackMs: 0 }, preserved: { uploadMs: 0, submitWaitMs: 0, readbackMs: 0 } };
  let candidatesChecked = 0; let transitionsChecked = 0;
  const fixtures = native ? reference.fixtures : reference.fixtures.slice(0, 1);
  for (const [index, fixture] of fixtures.entries()) {
    const inputs = packOqsFixture(fixture, shape);
    for (const preserveAntichains of index % 2 ? [true, false] : [false, true]) {
      const output = await plan.run(inputs, { preserveAntichains, numerical: native });
      if (native) verifyOqsOutput(fixture, output, shape);
      const t = timings[preserveAntichains ? 'preserved' : 'baseline'];
      for (const key of Object.keys(t)) t[key] += output[key] ?? 0;
    }
    candidatesChecked += fixture.candidates.length;
    transitionsChecked++;
    if (fixture.cut === 0 || index === fixtures.length - 1) console.error(`[oqs] support ${fixture.supportIndex}, cut ${fixture.cut}: ${native ? 'both modes exact' : 'portable submission only'}`);
  }
  const controls = [];
  if (spec.columns === 4 && spec.rows === 4) {
    const high = highLaneFixture();
    for (const preserveAntichains of [false, true]) {
      const out = await plan.run(packOqsFixture(high, shape), { preserveAntichains, numerical: native });
      if (native) verifyOqsOutput(high, out, shape);
    }
    controls.push('bits-31-32-41-and-cofactor-collapse');
    const empty = packOqsFixture({ states: [], introduced: [], inputs: [0n], nextCrossingMask: 0n }, shape);
    const out = await plan.run(empty, { numerical: native });
    if (native) assert.equal(out.count, 0);
    controls.push('empty-active-extent');
    for (const [name, mutate, error] of [
      ['invalid-extent', d => { d.activeStateCount[0] = shape.stateCapacity + 1; }, /global status 1/],
      ['candidate-overflow', d => { d.activeStateCount[0] = shape.stateCapacity; }, /global status 1/],
      ['invalid-offset', d => { d.stateWinOffsets[1] = shape.recordCapacity + 1; }, /generation status 2/],
      ['frontier-overflow', d => { d.stateWinOffsets[1] = shape.frontierCapacity + 1; }, /generation status 3/],
      ['invalid-input-mask', d => { d.inputP0Lo[0] = 1; }, /generation status 4/],
      ['invalid-fanout', d => { d.cutMeta[4] = 4; }, /global status 1/],
      ['invalid-high-lane', d => { d.cutMeta[1] |= 1024; }, /global status 1/],
    ]) {
      const data = packOqsFixture(high, shape); mutate(data);
      if (native) await assert.rejects(plan.run(data), error);
      else await plan.run(data, { numerical: false });
      controls.push(name);
    }
    const worst = fixtures.reduce((a, b) => a.candidates.length >= b.candidates.length ? a : b);
    const recovered = await plan.run(packOqsFixture(worst, shape), { numerical: native });
    if (native) verifyOqsOutput(worst, recovered, shape);
    for (let start = 0; start < worst.states.length; start += 17) {
      const states = worst.states.slice(start, start + 17);
      const candidates = worst.candidates.slice(start * worst.inputs.length, (start + states.length) * worst.inputs.length);
      const shard = { ...worst, states, candidates, nextStates: candidates };
      const sharded = await plan.run(packOqsFixture(shard, shape), { numerical: native });
      if (native) verifyOqsOutput(shard, sharded, shape);
    }
    controls.push('state-shards-17-match-full-candidate-set');
    await plan.close();
    const variant = await createOqsCofactor42Plan(runtime, { ...spec, blockSize: 64 }); resources.push(variant);
    const varied = await variant.run(packOqsFixture(worst, variant.shape), { numerical: native });
    if (native) verifyOqsOutput(worst, varied, variant.shape);
    controls.push('block-64-128-and-success-after-failure');
  }
  result = { kind: 'connect4-bsfp-oqs-cofactor-42', mode, geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    outcome: native ? 'native-oqs-cofactor-pass' : 'portable-oqs-cofactor-submit-pass',
    evidenceGrade: native ? 'all-candidates-of-selected-supports' : 'portable-composition-only',
    fullDeviceQuotientSynthesis: false, rootWdl: null, transitionsChecked: native ? transitionsChecked : 0,
    candidatesChecked: native ? candidatesChecked : 0, mismatches: native ? 0 : null,
    targetCoverage: native ? 1 : null, controls, timings, compileLoadMs: plan.compileLoadMs, setupMs: plan.setupMs,
    deviceBytes: shape.deviceBytes, upperBoundBytes: shape.upperBoundBytes,
    seedConstructionMs: reference.c1SolveMs, lineOrderMs: reference.lineOrderMs, referenceSupports: reference.summaries,
    interpretation: 'CPU oracle layers are qualification inputs. GPU candidate generation and exact cofactor normalization are exercised; grouping, dense IDs and chained OQS remain unimplemented. Submit/wait includes orchestration, not pure kernel time.' };
} catch (error) { failures.push(error); }
finally {
  for (const resource of resources.reverse()) try { await resource.close(); } catch (error) { failures.push(error); }
  try { assert.equal((await runtime.close()).graceful, true); } catch (error) { failures.push(error); }
}
if (failures.length) throw new AggregateError(failures, 'OQS qualification failed');
console.log(JSON.stringify({ ...result, cleanup: 'graceful' }, null, 2));
