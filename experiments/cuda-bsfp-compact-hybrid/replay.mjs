import assert from 'node:assert/strict';
import fs from 'node:fs';
import { performance } from 'node:perf_hooks';
import { fixtureDigest } from './overflow-capture.mjs';
import { createReferenceReducer } from './qualification.mjs';
import { readCompactHybridOptions } from './run.mjs';

export function readReplayFixture(file) {
  const fixture = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(fixture.sha256, fixtureDigest(fixture.payload), 'fixture content hash mismatch');
  const p = fixture.payload;
  assert.equal(p.schemaVersion, 1);
  assert([0, 1].includes(p.direction));
  assert.deepEqual(p.geometry, { columns: 7, rows: 6, connect: 4 });
  for (const side of [p.left, p.right]) {
    assert(Array.isArray(side) && side.length > 0 && side.length <= 262144);
    assert(side.every(v => Number.isSafeInteger(v) && v >= 0 && v < 2 ** 42));
  }
  assert(p.left.length * p.right.length <= 4194304, 'fixture exceeds P2 batch bound');
  return fixture;
}

const sorted = values => [...values].sort((a, b) => a - b);
const distribution = samples => ({ samples, min: Math.min(...samples),
  median: sorted(samples)[Math.floor(samples.length / 2)], max: Math.max(...samples) });

async function main() {
  const fixture = readReplayFixture(process.env.BSFP_OVERFLOW_REPLAY_FIXTURE);
  const job = fixture.payload;
  const oracleStarted = performance.now();
  const reference = createReferenceReducer();
  const [expected] = await reference.reduce([job]);
  await reference.close();
  const oracleMs = performance.now() - oracleStarted;
  assert(expected.length > 1024, 'fixture does not cross ordinary P2 overflow boundary');
  const { openCudaRuntime } = await import('cuda-js');
  const { createPacked42PairReducerService } = await import('../../components/bsfp/cuda/packed42-pair-reducer-tensor-service.mjs');
  const runtime = await openCudaRuntime({ compiler: true, driver: { memory: {
    maxDeviceBytes: 268435456, maxAllocationBytes: 134217728, maxTransferBytes: 16777216,
  } } });
  const services = {};
  const methods = process.argv.includes('final') ? ['tensor', 'allbucketed']
    : process.argv.includes('pair-bucketed') ? ['bucketed', 'allbucketed']
    : process.argv.includes('bucketed') ? ['packed', 'bucketed'] : ['packed', 'tensor'];
  const samples = Object.fromEntries(methods.map(mode => [mode, []]));
  const stages = Object.fromEntries(methods.map(mode => [mode, []]));
  const setupMs = {};
  let output;
  try {
    for (const mode of methods) {
      const started = performance.now();
      services[mode] = await createPacked42PairReducerService(runtime, { ...readCompactHybridOptions({}).reducer,
        overflowExecutor: mode === 'tensor' ? 'tensor' : 'packed',
        packedStrategy: ['bucketed', 'allbucketed'].includes(mode) ? 'bucketed-cardinality-v0' : 'legacy-43-phase-scan',
        pairStrategy: mode === 'allbucketed' ? 'bucketed-cardinality-v0' : 'legacy-43-phase-scan' });
      setupMs[mode] = performance.now() - started;
    }
    // One warmup and three measured passes per method; reverse order every pass.
    // This measures the entire pair/recovery path, including generation and I/O.
    for (let pass = 0; pass < 4; pass++) {
      for (const mode of (pass % 2 ? [...methods].reverse() : methods)) {
        const before = services[mode].snapshotStats();
        const started = performance.now();
        const [actual] = await services[mode].reduce([job]);
        const wallMs = performance.now() - started;
        assert.deepEqual(sorted(actual), sorted(expected), mode + ' independent BigInt frontier mismatch');
        const after = services[mode].snapshotStats();
        assert.equal(after.overflowRecoveredJobs - before.overflowRecoveredJobs, 1);
        assert.equal(after.generatedPairCandidates - before.generatedPairCandidates, job.left.length * job.right.length);
        assert.equal(after.activeBatch, null);
        const delta = Object.fromEntries(['uploadMs', 'executionMs', 'readbackMs', 'overflowExecutionMs'].map(key => [key, after[key] - before[key]]));
        console.error(JSON.stringify({ kind: 'overflow-replay-sample', fixture: fixture.sha256, mode, pass, warmup: pass === 0, wallMs, ...delta, survivors: actual.length }));
        if (pass > 0) { samples[mode].push(wallMs); stages[mode].push(delta); }
      }
    }
    output = { outcome: 'native-overflow-replay-pass', geometry: '7x6:c4', rootWdl: null,
      fixture: { sha256: fixture.sha256, source: job.source, context: job.context, direction: job.direction,
        left: job.left.length, right: job.right.length, candidates: job.left.length * job.right.length },
      oracle: 'independent BigInt full Cartesian product + exact antichain normalization', oracleMs,
      survivors: expected.length, setupMs, timingScope: 'whole pair generation plus overflow recovery; host wall time, excludes oracle/verification',
      methods, ...Object.fromEntries(methods.map(mode => [mode, distribution(samples[mode])])), stages,
      stats: Object.fromEntries(Object.entries(services).map(([mode, service]) => [mode, service.snapshotStats()])),
      mismatches: 0 };
  } finally {
    for (const service of Object.values(services).reverse()) await service.close();
    assert.equal((await runtime.close()).graceful, true);
  }
  console.log(JSON.stringify({ ...output, cleanup: 'graceful' }, null, 2));
}
if (import.meta.main) await main();
