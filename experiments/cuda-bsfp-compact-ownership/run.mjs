import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { openCudaRuntime } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';
import { createCompactOwnership42Plan } from '../../components/bsfp/cuda/compact-ownership-42-plan.mjs';
import { compactOwnership42Shape } from '../../components/bsfp/cuda/compact-ownership-42-layout.mjs';
import { solveBsfpPacked42AntichainRootWdlRolling } from '../../components/bsfp/ownership-antichain-packed42-rolling-solver.mjs';
import { solveBsfpOwnershipAntichainWdl } from '../../components/bsfp/ownership-antichain-solver.mjs';

const mode = process.argv[2] ?? 'portable';
if (!['portable', 'native', 'scaling', 'portable-scaling', 'diagnostic', 'portable-diagnostic'].includes(mode)) throw new RangeError('invalid compact execution mode');
const diagnostic = mode.endsWith('diagnostic');
const scaling = mode.endsWith('scaling') || diagnostic;
const native = mode === 'native' || mode === 'scaling' || mode === 'diagnostic';
const columns = Number(process.argv[3] ?? 4);
const rows = Number(process.argv[4] ?? 4);
const connect = Number(process.argv[5] ?? 4);
const options = { columns, rows, connect, frontierCapacity: Number(process.argv[6] ?? 1024),
  candidateTileSize: Number(process.argv[7] ?? 2048), shardCapacity: Number(process.argv[8] ?? 64), blockSize: Number(process.argv[9] ?? 128), qualificationOracle: !scaling };
const epochLimit = diagnostic ? Number(process.argv[10] ?? 1) : null;
if (diagnostic && (!Number.isSafeInteger(epochLimit) || epochLimit < 1)) throw new RangeError('diagnostic epoch limit must be a positive safe integer');
const totalStarted = performance.now();
const oracleStarted = performance.now();
const frontiers = new Map();
const cpu = scaling ? null : solveBsfpPacked42AntichainRootWdlRolling({ columns, rows, connect, onFrontier(item, frontier) { frontiers.set(item, frontier); } });
const cpuReferenceMs = performance.now() - oracleStarted;
let expected = { frontierAt(item) { return frontiers.get(item); } };
if (!scaling && columns * rows <= 16) {
  expected = solveBsfpOwnershipAntichainWdl({ columns, rows, connect });
  assert.equal(expected.rootWdl, cpu.rootWdl);
  for (let item = 0; item < cpu.support.itemCapacity; item++) {
    for (const kind of ['wins', 'losses']) assert.deepEqual(expected.frontierAt(item)[kind].map(Number), frontiers.get(item)[kind]);
  }
}
const runtimeStarted = performance.now();
const admittedShape = compactOwnership42Shape(options);
const runtimeOptions = { compiler: true, driver: { memory: {
  maxDeviceBytes: admittedShape.upperBoundBytes,
  maxAllocationBytes: Math.max(128 * 1024 ** 2, admittedShape.rankElements * 4),
} } };
const runtime = native ? await openCudaRuntime(runtimeOptions) : await openCudaRuntimeForTesting(runtimeOptions);
const runtimeOpenMs = performance.now() - runtimeStarted;
const failures = [];
let result;
try {
  const runs = [];
  for (const audit of scaling ? [false] : native ? [true, false] : [true]) {
    let plan;
    const begin = performance.now();
    try {
      plan = await createCompactOwnership42Plan(runtime, options, audit ? expected : null);
      const execution = await plan.execute({ epochLimit, onEpoch(index, milliseconds) {
        if (native) console.error(`[compact ${diagnostic ? 'diagnostic' : audit ? 'audit' : 'solve'}] epoch ${index + 1}/${epochLimit ?? plan.epochCount}: ${milliseconds.toFixed(3)} ms`);
      } });
      const output = native && !diagnostic ? await plan.result() : null;
      const diagnostics = native && diagnostic ? await plan.diagnostics() : output?.diagnostics ?? null;
      if (native && !scaling) {
        assert.equal(output.rootWdl, cpu.rootWdl);
        assert.equal(output.totalFrontierRecords, cpu.stats.totalBoundaryRecords);
        if (audit) {
          assert.equal(output.comparedSupports, cpu.support.itemCapacity);
          assert.equal(output.frontierMismatches, 0);
        }
      }
      runs.push({ audit, ...output, diagnostics, ...plan.timings, submitWaitMs: execution.submitWaitMs,
        epochSubmitWaitMs: execution.epochSubmitWaitMs, executedEpochCount: execution.executedEpochCount,
        completedFullSchedule: execution.completedFullSchedule, epochCount: plan.epochCount,
        devicePayloadBytes: plan.deviceBytes, admissionUpperBoundBytes: plan.shape.upperBoundBytes,
        launchCount: plan.launchCount, rankBatches: plan.shape.support.maxRank + 1,
        solveWallMs: performance.now() - begin });
    } finally { if (plan) await plan.close(); }
  }
  const boundaryControls = [];
  if (!scaling && columns === 4 && rows === 4) {
    for (const control of [
      { id: 'shard-tile-block-invariance', options: { columns: 4, rows: 4, connect: 4, frontierCapacity: 128, candidateTileSize: 128, shardCapacity: 17, blockSize: 64 }, expected },
      { id: 'high-lane-42-bit-recurrence', options: { columns: 1, rows: 42, connect: 4, frontierCapacity: 128, candidateTileSize: 128, shardCapacity: 1, blockSize: 64 }, expected: solveBsfpOwnershipAntichainWdl({ columns: 1, rows: 42, connect: 4 }) },
      { id: 'capacity-is-not-convergence', options: { columns: 4, rows: 4, connect: 4, frontierCapacity: 4, candidateTileSize: 16, shardCapacity: 17, blockSize: 64 }, expected: null },
    ]) {
      let plan;
      try {
        plan = await createCompactOwnership42Plan(runtime, control.options, control.expected);
        await plan.execute();
        if (native) {
          if (!control.expected) await assert.rejects(plan.result(), /compact CUDA capacity failure/);
          else {
            const output = await plan.result();
            assert.equal(output.frontierMismatches, 0);
            assert.equal(output.comparedSupports, plan.shape.support.itemCapacity);
          }
        }
        boundaryControls.push({ id: control.id, outcome: native ? 'native-pass' : 'portable-submit-pass' });
      } finally { if (plan) await plan.close(); }
    }
  }
  const first = runs[0];
  result = { schemaVersion: 2, kind: diagnostic ? 'connect4-cuda-bsfp-compact-work-diagnostic' : 'connect4-cuda-bsfp-compact-root-solve', mode, columns, rows, connect,
    caseRole: diagnostic ? 'partial-rank-diagnostic' : 'full-root-solve',
    outcome: diagnostic ? native ? 'native-compact-diagnostic-prefix-pass' : 'portable-compact-diagnostic-prefix-submit-pass'
      : native ? scaling ? 'native-compact-root-complete' : 'native-compact-frontier-pass' : 'portable-compact-compile-submit-pass',
    rootWdl: diagnostic ? null : native ? first.rootWdl : null,
    closure: diagnostic ? 'partial-static-prefix' : native ? first.closure : 'not-numerically-executed',
    comparedSupports: diagnostic ? 0 : native ? first.comparedSupports : 0,
    frontierMismatches: diagnostic ? null : native ? first.frontierMismatches : null,
    evidenceGrade: diagnostic ? native ? 'bounded-device-work-diagnostic' : 'portable-composition-only'
      : !native ? 'portable-composition-only' : scaling ? 'completed-symbolic-closure-without-independent-large-oracle' : 'all-support-frontier-differential',
    boundaryControls,
    options: { ...options, diagnosticEpochLimit: epochLimit }, cpuReferenceMs: scaling ? null : cpuReferenceMs,
    cpuPairCandidates: cpu?.stats.generatedPairCandidates ?? null, runtimeOpenMs, runs,
    phaseTiming: { candidateGenerationMs: null, normalizationMs: null, compactionMs: null,
      reason: 'Fused block collectives; diagnostic counters separate work classes while epoch submit/wait provides the physical timing boundary.' },
    totalWallMs: performance.now() - totalStarted };
} catch (error) { failures.push(error); }
finally {
  try { const closed = await runtime.close(); assert.equal(closed.graceful, true); } catch (error) { failures.push(error); }
}
if (failures.length) throw new AggregateError(failures, 'compact qualification failed');
console.log(JSON.stringify({ ...result, cleanup: 'graceful' }, null, 2));
