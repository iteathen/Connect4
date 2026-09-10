import path from 'node:path';
const MIB = 1024n * 1024n;
const P1_OVERHEAD_BYTES = 256n * MIB;
const B1_RUNTIME_ALLOWANCE_BYTES = 256n * MIB;
const B1_CANDIDATE_COUNT = 1_048_576n;
const B1_FRONTIER_COUNT = 568n;
const EXPERIMENTAL_FFI_FLAG = '--experimental-ffi';

function denseShapeBytes({ columns, rows }) {
  const supportSkeletons = BigInt(rows + 1) ** BigInt(columns);
  const assignments = 1n << BigInt(columns * rows);
  return supportSkeletons * assignments * 4n;
}

function p1Estimate(spec) {
  const denseTableBytes = denseShapeBytes(spec);
  const exactSupported = spec.columns === 4 && spec.rows === 3 && spec.connect === 3;
  if (!exactSupported) return Object.freeze({ kind: 'hypothetical-dense-shape', executable: false, denseTableBytes: denseTableBytes.toString(), upperBoundBytes: null, note: 'P1 execution is frozen to 4x3 connect-3; the dense formula is reported only to expose scaling pressure.' });
  const ancillaryBytes = 256n * 4n * 2n + 14n * 4n + 4096n;
  const upperBoundBytes = denseTableBytes + ancillaryBytes + P1_OVERHEAD_BYTES;
  return Object.freeze({ kind: 'proved-profile-upper-bound', executable: true, denseTableBytes: denseTableBytes.toString(), ancillaryBytes: ancillaryBytes.toString(), fixedRuntimeAllowanceBytes: P1_OVERHEAD_BYTES.toString(), upperBoundBytes: Number(upperBoundBytes) });
}

function b1Estimate(spec) {
  const exactSupported = spec.columns === 7 && spec.rows === 6 && spec.connect === 4;
  if (!exactSupported) return Object.freeze({ kind: 'unsupported-benchmark-geometry', executable: false, upperBoundBytes: null });
  const candidateBytes = B1_CANDIDATE_COUNT * 4n * 4n;
  const frontierBytes = B1_FRONTIER_COUNT * 4n * 2n;
  const upperBoundBytes = candidateBytes + frontierBytes + B1_RUNTIME_ALLOWANCE_BYTES;
  return Object.freeze({
    kind: 'proved-benchmark-upper-bound',
    executable: true,
    candidateCount: Number(B1_CANDIDATE_COUNT),
    frontierCount: Number(B1_FRONTIER_COUNT),
    devicePayloadBytes: Number(candidateBytes + frontierBytes),
    fixedRuntimeAllowanceBytes: B1_RUNTIME_ALLOWANCE_BYTES.toString(),
    upperBoundBytes: Number(upperBoundBytes),
  });
}

export function nativeNodeArgs(scriptPath, mode = 'native') {
  const args = [];
  if (process.allowedNodeEnvironmentFlags?.has(EXPERIMENTAL_FFI_FLAG)) args.push(EXPERIMENTAL_FFI_FLAG);
  args.push(scriptPath, mode);
  return Object.freeze(args);
}

const REQUIRED_DEPENDENCIES = Object.freeze({
  cudaAlgorithmsRevision: '48ee0aec9acae7776950f03ab52ab1737e598b6e',
  cudaJsRevision: '98e2ebc942c14d63acf4dd82e912dd548c363a05',
});

const P1 = Object.freeze({
  id: 'c4-0009-p1',
  specification: 'docs/specs/profiles/C4-0009-P1-4x3-cuda-bsfp-v0.md',
  gpuRequired: true,
  requiredDependencies: REQUIRED_DEPENDENCIES,
  supports(spec) { return spec.columns === 4 && spec.rows === 3 && spec.connect === 3; },
  estimate: p1Estimate,
  steps(spec, repositoryRoot) {
    if (!this.supports(spec)) return Object.freeze([]);
    return Object.freeze([
      Object.freeze({ id: 'ranked-activation', command: process.execPath, args: nativeNodeArgs(path.join(repositoryRoot, 'experiments/cuda-bsfp-vertical-slice/run.mjs')), expected(result) { return result?.outcome === 'native-numerical-pass'; } }),
      Object.freeze({ id: 'dense-wdl', command: process.execPath, args: nativeNodeArgs(path.join(repositoryRoot, 'experiments/cuda-bsfp-dense-4x3/run.mjs')), expected(result) { return result?.outcome === 'native-exhaustive-wdl-pass' && result?.rootWdl === 1 && result?.checkedStates === 4631 && result?.legalEdges === 11818; } }),
    ]);
  },
});

const B1 = Object.freeze({
  id: 'c4-0009-b1-packed-dominance-42',
  specification: 'docs/specs/profiles/C4-0009-B1-packed-dominance-throughput-v0.md',
  gpuRequired: true,
  requiredDependencies: REQUIRED_DEPENDENCIES,
  supports(spec) { return spec.columns === 7 && spec.rows === 6 && spec.connect === 4; },
  estimate: b1Estimate,
  steps(spec, repositoryRoot) {
    if (!this.supports(spec)) return Object.freeze([]);
    return Object.freeze([
      Object.freeze({
        id: 'packed-dominance-throughput',
        command: process.execPath,
        args: nativeNodeArgs(path.join(repositoryRoot, 'experiments/cuda-bsfp-packed-dominance/run.mjs')),
        expected(result) {
          return result?.outcome === 'native-packed-dominance-pass'
            && result?.candidateCount === Number(B1_CANDIDATE_COUNT)
            && result?.frontierCount === Number(B1_FRONTIER_COUNT)
            && result?.totalSubsetChecksPerMeasuredPass === Number(B1_CANDIDATE_COUNT * B1_FRONTIER_COUNT)
            && result?.observedSubsetChecks === Number(B1_CANDIDATE_COUNT * B1_FRONTIER_COUNT)
            && result?.dominatedCount === 0
            && Number.isFinite(result?.throughput?.subsetChecksPerSecondMedian)
            && result.throughput.subsetChecksPerSecondMedian > 0;
        },
      }),
    ]);
  },
});

const PROFILES = new Map([[P1.id, P1], [B1.id, B1]]);
export function getQualificationProfile(id) { const profile = PROFILES.get(id); if (!profile) throw new RangeError(`unknown CUDA-BSFP qualification profile: ${id}`); return profile; }
export function listQualificationProfiles() { return Object.freeze([...PROFILES.keys()]); }
export { denseShapeBytes };
