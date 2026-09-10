import path from 'node:path';
const MIB = 1024n * 1024n;
const P1_OVERHEAD_BYTES = 256n * MIB;
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
const P1 = Object.freeze({
  id: 'c4-0009-p1',
  specification: 'docs/specs/profiles/C4-0009-P1-4x3-cuda-bsfp-v0.md',
  gpuRequired: true,
  requiredDependencies: Object.freeze({ cudaAlgorithmsRevision: '48ee0aec9acae7776950f03ab52ab1737e598b6e', cudaJsRevision: '98e2ebc942c14d63acf4dd82e912dd548c363a05' }),
  supports(spec) { return spec.columns === 4 && spec.rows === 3 && spec.connect === 3; },
  estimate: p1Estimate,
  steps(spec, repositoryRoot) {
    if (!this.supports(spec)) return Object.freeze([]);
    return Object.freeze([
      Object.freeze({ id: 'ranked-activation', command: process.execPath, args: [path.join(repositoryRoot, 'experiments/cuda-bsfp-vertical-slice/run.mjs'), 'native'], expected(result) { return result?.outcome === 'native-numerical-pass'; } }),
      Object.freeze({ id: 'dense-wdl', command: process.execPath, args: [path.join(repositoryRoot, 'experiments/cuda-bsfp-dense-4x3/run.mjs'), 'native'], expected(result) { return result?.outcome === 'native-exhaustive-wdl-pass' && result?.rootWdl === 1 && result?.checkedStates === 4631 && result?.legalEdges === 11818; } }),
    ]);
  },
});
const PROFILES = new Map([[P1.id, P1]]);
export function getQualificationProfile(id) { const profile = PROFILES.get(id); if (!profile) throw new RangeError(`unknown CUDA-BSFP qualification profile: ${id}`); return profile; }
export function listQualificationProfiles() { return Object.freeze([...PROFILES.keys()]); }
export { denseShapeBytes };
