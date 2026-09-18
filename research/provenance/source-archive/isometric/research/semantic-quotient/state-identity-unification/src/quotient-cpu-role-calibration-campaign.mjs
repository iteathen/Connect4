import { calibrateCpuRoles } from './quotient-cpu-role-calibration.mjs';

const result = await calibrateCpuRoles({
  pinnedRepeats: Number(process.env.PINNED_REPEATS ?? 2),
  pinnedDurationMs: Number(process.env.PINNED_DURATION_MS ?? 60),
  saturationDurationMs: Number(process.env.SATURATION_DURATION_MS ?? 70),
  minGapRatio: Number(process.env.MIN_GAP_RATIO ?? 1.12),
  nearPeakRatio: Number(process.env.NEAR_PEAK_RATIO ?? 0.985),
});

if (!Number.isInteger(result.maxSearchWorkers) || result.maxSearchWorkers < 1) {
  throw new Error(`invalid maxSearchWorkers ${result.maxSearchWorkers}`);
}
if (result.maxSearchWorkers > result.availableParallelism) {
  throw new Error(`maxSearchWorkers ${result.maxSearchWorkers} exceeds availableParallelism ${result.availableParallelism}`);
}
if (result.affinityProbeAvailable) {
  const classified = result.performanceCpuIds.length + result.efficiencyCpuIds.length;
  if (classified !== result.pinnedMeasurements.length) {
    throw new Error(`CPU classification mismatch: ${classified} != ${result.pinnedMeasurements.length}`);
  }
}

console.error(`CPU_ROLE_CALIBRATION_SUMMARY=${JSON.stringify(result)}`);
console.log(JSON.stringify(result, null, 2));
