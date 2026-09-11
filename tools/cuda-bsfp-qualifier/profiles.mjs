import path from 'node:path';
import { oqsCofactor42Shape } from '../../components/bsfp/cuda/oqs-cofactor-42-layout.mjs';
import { compactOwnership42Shape } from '../../components/bsfp/cuda/compact-ownership-42-layout.mjs';
const MIB = 1024n * 1024n;
const P1_OVERHEAD_BYTES = 256n * MIB;
const B1_RUNTIME_ALLOWANCE_BYTES = 256n * MIB;
const B1_CANDIDATE_COUNT = 1_048_576n;
const B1_FRONTIER_COUNT = 568n;
const B2_RUNTIME_ALLOWANCE_BYTES = 256n * MIB;
const B2_SEGMENT_COUNT = 1_024n;
const B2_SEGMENT_SIZE = 512n;
const B2_CANDIDATE_COUNT = B2_SEGMENT_COUNT * B2_SEGMENT_SIZE;
const B2_BUCKET_META_COUNT = 43n * B2_SEGMENT_COUNT;
const B2_LEGACY_STRATEGY = 'legacy-43-phase-scan';
const B2_BUCKETED_STRATEGY = 'bucketed-cardinality-v0';
const B2_EQUAL_FIXTURE = 'equal-cardinality-duplicate-stress';
const B2_MIXED_FIXTURE = 'mixed-cardinality-deterministic';
const B3_BUCKETED_STRATEGY = 'bucketed-cardinality-v0';
const B3_DEDUP_FIRST_STRATEGY = 'bucketed-dedup-first-v0';
const B3_FIXTURE = 'cartesian-or-and-duplicate-stress';
const P2_RUNTIME_ALLOWANCE_BYTES = 256n * MIB;
const P2_CANDIDATE_CAPACITY = 4_194_304n;
const P2_SEGMENT_CAPACITY = 256n;
const P2_SIDE_CAPACITY = 262_144n;
const P2_OUTPUT_CAPACITY = 1_024n;
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
  return Object.freeze({ kind: 'proved-benchmark-upper-bound', executable: true, candidateCount: Number(B1_CANDIDATE_COUNT), frontierCount: Number(B1_FRONTIER_COUNT), devicePayloadBytes: Number(candidateBytes + frontierBytes), fixedRuntimeAllowanceBytes: B1_RUNTIME_ALLOWANCE_BYTES.toString(), upperBoundBytes: Number(upperBoundBytes) });
}

function b2Estimate(spec) {
  const exactSupported = spec.columns === 7 && spec.rows === 6 && spec.connect === 4;
  if (!exactSupported) return Object.freeze({ kind: 'unsupported-normalizer-benchmark-geometry', executable: false, upperBoundBytes: null });
  const candidateBytes = B2_CANDIDATE_COUNT * 4n * 3n;
  const outputBytes = B2_CANDIDATE_COUNT * 4n * 2n;
  const checksBytes = B2_CANDIDATE_COUNT * 4n;
  const bucketIndexBytes = B2_CANDIDATE_COUNT * 4n;
  const bucketMetaBytes = B2_BUCKET_META_COUNT * 4n * 3n;
  const smallControlBytes = ((B2_SEGMENT_COUNT + 1n) + B2_SEGMENT_COUNT * 3n) * 4n;
  const devicePayloadBytes = candidateBytes + outputBytes + checksBytes + bucketIndexBytes + bucketMetaBytes + smallControlBytes;
  return Object.freeze({ kind: 'proved-packed-normalizer-ab-upper-bound', executable: true, segmentCount: Number(B2_SEGMENT_COUNT), segmentSize: Number(B2_SEGMENT_SIZE), candidateCount: Number(B2_CANDIDATE_COUNT), bucketMetaCount: Number(B2_BUCKET_META_COUNT), devicePayloadBytes: Number(devicePayloadBytes), fixedRuntimeAllowanceBytes: B2_RUNTIME_ALLOWANCE_BYTES.toString(), upperBoundBytes: Number(devicePayloadBytes + B2_RUNTIME_ALLOWANCE_BYTES) });
}

function b3Estimate(spec) {
  const base = b2Estimate(spec);
  if (!base.executable) return Object.freeze({ ...base, kind: 'unsupported-dedup-benchmark-geometry' });
  return Object.freeze({ ...base, kind: 'proved-packed-dedup-order-ab-upper-bound' });
}

function p2Estimate(spec) {
  const cellCount = spec.columns * spec.rows;
  if (!Number.isSafeInteger(cellCount) || cellCount < 1 || cellCount > 42) return Object.freeze({ kind: 'unsupported-packed42-geometry', executable: false, upperBoundBytes: null, note: 'P2 supports exact packed ownership masks only through 42 cells.' });
  const candidateWorkspaceBytes = P2_CANDIDATE_CAPACITY * 4n * 4n;
  const sideInputBytes = P2_SIDE_CAPACITY * 4n * 4n;
  const outputBytes = P2_SEGMENT_CAPACITY * P2_OUTPUT_CAPACITY * 4n * 2n;
  const offsetBytes = (P2_SEGMENT_CAPACITY + 1n) * 4n * 3n;
  const statusBytes = P2_SEGMENT_CAPACITY * 4n * 4n;
  const devicePayloadBytes = candidateWorkspaceBytes + sideInputBytes + outputBytes + offsetBytes + statusBytes;
  return Object.freeze({ kind: 'proved-hybrid-workspace-upper-bound', executable: true, cellCount, candidateCapacity: Number(P2_CANDIDATE_CAPACITY), segmentCapacity: Number(P2_SEGMENT_CAPACITY), sideCapacity: Number(P2_SIDE_CAPACITY), frontierCapacityPerSegment: Number(P2_OUTPUT_CAPACITY), devicePayloadBytes: Number(devicePayloadBytes), fixedRuntimeAllowanceBytes: P2_RUNTIME_ALLOWANCE_BYTES.toString(), upperBoundBytes: Number(devicePayloadBytes + P2_RUNTIME_ALLOWANCE_BYTES) });
}

export function nativeNodeArgs(scriptPath, mode = 'native') {
  const args = [];
  if (process.allowedNodeEnvironmentFlags?.has(EXPERIMENTAL_FFI_FLAG)) args.push(EXPERIMENTAL_FFI_FLAG);
  args.push(scriptPath, mode);
  return Object.freeze(args);
}

const REQUIRED_DEPENDENCIES = Object.freeze({ cudaAlgorithmsRevision: '48ee0aec9acae7776950f03ab52ab1737e598b6e', cudaJsRevision: '98e2ebc942c14d63acf4dd82e912dd548c363a05' });

const P1 = Object.freeze({
  id: 'c4-0009-p1', specification: 'docs/specs/profiles/C4-0009-P1-4x3-cuda-bsfp-v0.md', gpuRequired: true, requiredDependencies: REQUIRED_DEPENDENCIES,
  supports(spec) { return spec.columns === 4 && spec.rows === 3 && spec.connect === 3; }, estimate: p1Estimate,
  steps(spec, repositoryRoot) { if (!this.supports(spec)) return Object.freeze([]); return Object.freeze([
    Object.freeze({ id: 'ranked-activation', command: process.execPath, args: nativeNodeArgs(path.join(repositoryRoot, 'experiments/cuda-bsfp-vertical-slice/run.mjs')), expected(result) { return result?.outcome === 'native-numerical-pass'; } }),
    Object.freeze({ id: 'dense-wdl', command: process.execPath, args: nativeNodeArgs(path.join(repositoryRoot, 'experiments/cuda-bsfp-dense-4x3/run.mjs')), expected(result) { return result?.outcome === 'native-exhaustive-wdl-pass' && result?.rootWdl === 1 && result?.checkedStates === 4631 && result?.legalEdges === 11818; } }),
  ]); },
});

const B1 = Object.freeze({
  id: 'c4-0009-b1-packed-dominance-42', specification: 'docs/specs/profiles/C4-0009-B1-packed-dominance-throughput-v0.md', gpuRequired: true, requiredDependencies: REQUIRED_DEPENDENCIES,
  supports(spec) { return spec.columns === 7 && spec.rows === 6 && spec.connect === 4; }, estimate: b1Estimate,
  steps(spec, repositoryRoot) { if (!this.supports(spec)) return Object.freeze([]); return Object.freeze([Object.freeze({ id: 'packed-dominance-throughput', command: process.execPath, args: nativeNodeArgs(path.join(repositoryRoot, 'experiments/cuda-bsfp-packed-dominance/run.mjs')), expected(result) { return result?.outcome === 'native-packed-dominance-pass' && result?.candidateCount === Number(B1_CANDIDATE_COUNT) && result?.frontierCount === Number(B1_FRONTIER_COUNT) && result?.totalSubsetChecksPerMeasuredPass === Number(B1_CANDIDATE_COUNT * B1_FRONTIER_COUNT) && result?.observedSubsetChecks === Number(B1_CANDIDATE_COUNT * B1_FRONTIER_COUNT) && result?.dominatedCount === 0 && Number.isFinite(result?.throughput?.subsetChecksPerSecondMedian) && result.throughput.subsetChecksPerSecondMedian > 0; } })]); },
});

const B2 = Object.freeze({
  id: 'c4-0009-b2-packed-normalizer-bucketed-42', specification: 'docs/specs/profiles/C4-0009-B2-packed-normalizer-bucketed-v0.md', gpuRequired: true, requiredDependencies: REQUIRED_DEPENDENCIES,
  supports(spec) { return spec.columns === 7 && spec.rows === 6 && spec.connect === 4; }, estimate: b2Estimate,
  steps(spec, repositoryRoot) {
    if (!this.supports(spec)) return Object.freeze([]);
    const script = path.join(repositoryRoot, 'experiments/cuda-bsfp-segmented-antichain/run.mjs');
    const expected = (strategy, fixture) => (result) => result?.outcome === 'native-segmented-packed-antichain-pass' && result?.strategy === strategy && result?.fixture === fixture && result?.segmentCount === Number(B2_SEGMENT_COUNT) && result?.segmentSize === Number(B2_SEGMENT_SIZE) && result?.candidateCount === Number(B2_CANDIDATE_COUNT) && result?.injectedExactDuplicates === Number(B2_SEGMENT_COUNT) && result?.verifiedSegments === Number(B2_SEGMENT_COUNT) && Number.isFinite(result?.survivors) && result.survivors > 0 && result.survivors < result.candidateCount && Number.isFinite(result?.timingsMs?.submissionWait) && result.timingsMs.submissionWait >= 0;
    const args = (mode, fixture) => Object.freeze([...nativeNodeArgs(script, mode), fixture]);
    return Object.freeze([
      Object.freeze({ id: 'legacy-equal-cardinality', command: process.execPath, args: args('native', 'equal'), expected: expected(B2_LEGACY_STRATEGY, B2_EQUAL_FIXTURE) }),
      Object.freeze({ id: 'bucketed-equal-cardinality', command: process.execPath, args: args('native-bucketed', 'equal'), expected: expected(B2_BUCKETED_STRATEGY, B2_EQUAL_FIXTURE) }),
      Object.freeze({ id: 'legacy-mixed-cardinality', command: process.execPath, args: args('native', 'mixed'), expected: expected(B2_LEGACY_STRATEGY, B2_MIXED_FIXTURE) }),
      Object.freeze({ id: 'bucketed-mixed-cardinality', command: process.execPath, args: args('native-bucketed', 'mixed'), expected: expected(B2_BUCKETED_STRATEGY, B2_MIXED_FIXTURE) }),
    ]);
  },
});

const B3 = Object.freeze({
  id: 'c4-0009-b3-packed-dedup-first-42', specification: 'docs/specs/profiles/C4-0009-B3-packed-dedup-first-v0.md', gpuRequired: true, requiredDependencies: REQUIRED_DEPENDENCIES,
  supports(spec) { return spec.columns === 7 && spec.rows === 6 && spec.connect === 4; }, estimate: b3Estimate,
  steps(spec, repositoryRoot) {
    if (!this.supports(spec)) return Object.freeze([]);
    const script = path.join(repositoryRoot, 'experiments/cuda-bsfp-dedup-first/run.mjs');
    const expected = (strategy) => (result) => result?.outcome === 'native-dedup-first-stress-pass'
      && result?.strategy === strategy && result?.fixture === B3_FIXTURE
      && result?.segmentCount === Number(B2_SEGMENT_COUNT) && result?.segmentSize === Number(B2_SEGMENT_SIZE)
      && result?.candidateCount === Number(B2_CANDIDATE_COUNT)
      && Number.isFinite(result?.uniqueCandidateCount) && result.uniqueCandidateCount > 0 && result.uniqueCandidateCount < result.candidateCount
      && Number.isFinite(result?.exactDuplicateCount) && result.exactDuplicateCount === result.candidateCount - result.uniqueCandidateCount
      && Number.isFinite(result?.duplicateFraction) && result.duplicateFraction > 0 && result.duplicateFraction < 1
      && Number.isFinite(result?.survivors) && result.survivors > 0 && result.survivors <= result.uniqueCandidateCount
      && Number.isFinite(result?.observedFrontierSubsetChecks) && result.observedFrontierSubsetChecks >= 0
      && Number.isFinite(result?.timingsMs?.submissionWait) && result.timingsMs.submissionWait >= 0;
    return Object.freeze([
      Object.freeze({ id: 'bucketed-duplicate-rich-control', command: process.execPath, args: nativeNodeArgs(script, 'native-bucketed'), expected: expected(B3_BUCKETED_STRATEGY) }),
      Object.freeze({ id: 'dedup-first-duplicate-rich', command: process.execPath, args: nativeNodeArgs(script, 'native-dedup-first'), expected: expected(B3_DEDUP_FIRST_STRATEGY) }),
    ]);
  },
});

const KNOWN_P2_ROOTS = Object.freeze(new Map([['4x3-c3', 1], ['4x4-c4', 0], ['5x4-c4', 0], ['5x5-c4', 0], ['7x6-c4', 1]]));
const P2 = Object.freeze({
  id: 'c4-0009-p2-compact-hybrid', specification: 'docs/specs/profiles/C4-0009-P2-compact-hybrid-v0.md', gpuRequired: true, requiredDependencies: REQUIRED_DEPENDENCIES,
  supports(spec) { const cells = spec.columns * spec.rows; return Number.isSafeInteger(cells) && cells >= 1 && cells <= 42; }, estimate: p2Estimate,
  steps(spec, repositoryRoot) { if (!this.supports(spec)) return Object.freeze([]); const geometry = `${spec.columns}x${spec.rows}:c${spec.connect}`; const resultGeometry = `${spec.columns}x${spec.rows}-c${spec.connect}`; const expectedRoot = KNOWN_P2_ROOTS.get(resultGeometry); return Object.freeze([Object.freeze({ id: 'compact-hybrid-root-wdl', command: process.execPath, args: Object.freeze([...nativeNodeArgs(path.join(repositoryRoot, 'experiments/cuda-bsfp-compact-hybrid/run.mjs')), geometry]), expected(result) { return result?.outcome === 'native-compact-hybrid-root-wdl-pass' && result?.geometry === resultGeometry && [-1, 0, 1].includes(result?.rootWdl) && (expectedRoot === undefined || result.rootWdl === expectedRoot) && Number.isFinite(result?.timingsMs?.solve) && result.timingsMs.solve >= 0 && Number.isFinite(result?.gpuReducer?.generatedPairCandidates); } })]); },
});

const C1 = Object.freeze({
  id: 'c4-0009-c1-compact-ownership-42', specification: 'docs/specs/profiles/C4-0009-C1-compact-ownership-42-v0.md', gpuRequired: true, requiredDependencies: REQUIRED_DEPENDENCIES,
  supports(spec) { return (spec.columns === 4 && spec.rows === 3 && spec.connect === 3) || (spec.columns === 4 && spec.rows === 4 && spec.connect === 4) || (spec.columns === 5 && spec.rows === 5 && spec.connect === 4); },
  estimate(spec) { if (!this.supports(spec)) return { kind: 'unsupported-compact-geometry', executable: false, upperBoundBytes: null }; const shape = compactOwnership42Shape(spec); return { kind: 'bounded-compact-arenas-with-oracle', executable: true, upperBoundBytes: shape.upperBoundBytes, payloadUpperBoundBytes: shape.payloadUpperBoundBytes, oracleUpperBoundBytes: shape.oracleUpperBoundBytes, frontierCapacity: shape.frontierCapacity, candidateTileSize: shape.candidateTileSize, shardCapacity: shape.shardCapacity }; },
  steps(spec, repositoryRoot) { if (!this.supports(spec)) return []; return [{ id: 'compact-root-wdl', command: process.execPath, args: [...nativeNodeArgs(path.join(repositoryRoot, 'experiments/cuda-bsfp-compact-ownership/run.mjs')), String(spec.columns), String(spec.rows), String(spec.connect)], expected(result) { return result?.outcome === 'native-compact-frontier-pass' && result?.closure === 'full-root' && result?.rootWdl === (spec.connect === 3 ? 1 : 0) && result?.comparedSupports === (spec.rows + 1) ** spec.columns && result?.frontierMismatches === 0 && result?.cleanup === 'graceful'; } }]; },
});

const C2 = Object.freeze({
  id: 'c4-0009-c2-compact-scaling-42', specification: 'docs/specs/profiles/C4-0009-C1-compact-ownership-42-v0.md', gpuRequired: true, requiredDependencies: REQUIRED_DEPENDENCIES,
  supports(spec) { return spec.columns === 6 && spec.rows === 5 && spec.connect === 4; },
  estimate(spec) { if (!this.supports(spec)) return { kind: 'unsupported-compact-scaling-geometry', executable: false, upperBoundBytes: null }; const shape = compactOwnership42Shape({ ...spec, frontierCapacity: 8192, candidateTileSize: 2048, qualificationOracle: false }); return { kind: 'bounded-compact-scaling-arenas-no-oracle', executable: true, upperBoundBytes: shape.upperBoundBytes, frontierCapacity: shape.frontierCapacity, candidateTileSize: shape.candidateTileSize, shardCapacity: shape.shardCapacity }; },
  steps(spec, repositoryRoot) { if (!this.supports(spec)) return []; return [{ id: 'compact-scaling-root', command: process.execPath, args: [...nativeNodeArgs(path.join(repositoryRoot, 'experiments/cuda-bsfp-compact-ownership/run.mjs'), 'scaling'), '6', '5', '4', '8192', '2048'], expected(result) { return result?.outcome === 'native-compact-root-complete' && result?.closure === 'full-root' && [-1, 0, 1].includes(result?.rootWdl) && result?.comparedSupports === 0 && result?.cleanup === 'graceful'; } }]; },
});

const C3 = Object.freeze({
  id: 'c4-0009-c3-compact-work-diagnostic-42', specification: 'docs/specs/profiles/C4-0009-C3-compact-work-diagnostic-v0.md', gpuRequired: true, requiredDependencies: REQUIRED_DEPENDENCIES,
  supports(spec) { return spec.columns === 6 && spec.rows === 5 && spec.connect === 4; },
  estimate(spec) { if (!this.supports(spec)) return { kind: 'unsupported-compact-diagnostic-geometry', executable: false, upperBoundBytes: null }; const shape = compactOwnership42Shape({ ...spec, frontierCapacity: 8192, candidateTileSize: 2048, qualificationOracle: false }); return { kind: 'bounded-compact-diagnostic-arenas-no-oracle', executable: true, upperBoundBytes: shape.upperBoundBytes, frontierCapacity: shape.frontierCapacity, candidateTileSize: shape.candidateTileSize, shardCapacity: shape.shardCapacity, staticEpochLimit: 1 }; },
  steps(spec, repositoryRoot) { if (!this.supports(spec)) return []; return [{ id: 'compact-work-diagnostic-prefix', command: process.execPath, args: [...nativeNodeArgs(path.join(repositoryRoot, 'experiments/cuda-bsfp-compact-ownership/run.mjs'), 'diagnostic'), '6', '5', '4', '8192', '2048', '64', '128', '1'], expected(result) { const run = result?.runs?.[0]; return result?.outcome === 'native-compact-diagnostic-prefix-pass' && result?.caseRole === 'partial-rank-diagnostic' && result?.closure === 'partial-static-prefix' && result?.rootWdl === null && result?.comparedSupports === 0 && run?.executedEpochCount === 1 && run?.completedFullSchedule === false && run?.diagnostics?.executedEpochCount === 1 && Number.isFinite(run?.diagnostics?.totals?.normalizationCalls) && Number.isFinite(run?.diagnostics?.totals?.normalizationInputRecords) && Array.isArray(run?.diagnostics?.hotSupports) && result?.cleanup === 'graceful'; } }]; },
});

const O1 = Object.freeze({
  id: 'c4-0009-o1-oqs-cofactor-42', specification: 'docs/specs/profiles/C4-0009-O1-oqs-cofactor-42-v0.md',
  gpuRequired: true, requiredDependencies: REQUIRED_DEPENDENCIES,
  supports(spec) { return (spec.columns === 4 && spec.rows === 3 && spec.connect === 3)
    || (spec.columns === 4 && spec.rows === 4 && spec.connect === 4)
    || (spec.columns === 5 && spec.rows === 5 && spec.connect === 4); },
  estimate(spec) {
    if (!this.supports(spec)) return { executable: false, upperBoundBytes: null, kind: 'unsupported-oqs-geometry' };
    const shape = oqsCofactor42Shape(spec);
    return { executable: true, upperBoundBytes: shape.upperBoundBytes, deviceBytes: shape.deviceBytes, kind: 'bounded-oqs-cofactor-fixture' };
  },
  steps(spec, repositoryRoot) {
    if (!this.supports(spec)) return [];
    return [{ id: 'oqs-cofactor-exact', command: process.execPath,
      args: [...nativeNodeArgs(path.join(repositoryRoot, 'experiments/cuda-bsfp-oqs-cofactor/run.mjs')), String(spec.columns), String(spec.rows), String(spec.connect)],
      expected(result) {
        const references = result?.referenceSupports;
        return result?.outcome === 'native-oqs-cofactor-pass' && result?.mode === 'native'
          && result?.geometry === `${spec.columns}x${spec.rows}:c${spec.connect}`
          && result?.evidenceGrade === 'all-candidates-of-selected-supports'
          && result?.fullDeviceQuotientSynthesis === false && result?.rootWdl === null
          && result?.mismatches === 0 && result?.targetCoverage === 1 && result?.cleanup === 'graceful'
          && result?.transitionsChecked === (spec.columns === 5 ? 112 : spec.rows === 3 ? 14 : 10)
          && Array.isArray(references) && references.length === (spec.columns === 5 ? 4 : 1)
          && result?.candidatesChecked > 0 && result.candidatesChecked === references.reduce((s, r) => s + r.totalCandidates, 0)
          && (spec.columns !== 4 || spec.rows !== 4 || result.controls?.length === 11);
      } }];
  },
});
const O2 = Object.freeze({
  id: 'c4-0009-o2-oqs-7x6-seed-slice', specification: 'docs/specs/profiles/C4-0009-O2-oqs-7x6-seed-slice-v0.md',
  gpuRequired: true, requiredDependencies: REQUIRED_DEPENDENCIES,
  supports(spec) { return spec.columns === 7 && spec.rows === 6 && spec.connect === 4; },
  estimate(spec) {
    if (!this.supports(spec)) return { executable: false, upperBoundBytes: null, kind: 'unsupported-oqs-seed-slice' };
    const shape = oqsCofactor42Shape({ ...spec, slice: 'seed-cut-0' });
    return { executable: true, upperBoundBytes: shape.upperBoundBytes, deviceBytes: shape.deviceBytes, kind: 'bounded-selected-seed-first-cut' };
  },
  steps(spec, repositoryRoot) {
    if (!this.supports(spec)) return [];
    return [{ id: 'oqs-selected-seed-first-cut', command: process.execPath,
      args: nativeNodeArgs(path.join(repositoryRoot, 'experiments/cuda-bsfp-oqs-cofactor/run-seed-slice.mjs')),
      expected(r) { return r?.outcome === 'native-oqs-seed-slice-pass' && r.mode === 'native' && r.geometry === '7x6:c4'
        && r.supportIndex === 470594 && r.cut === 0 && r.transitionsChecked === 1 && r.candidatesPerPass === 16
        && r.nativePasses === 8 && r.independentLayers === 2 && r.mismatches === 0 && r.targetCoverage === 1
        && r.seedWins === 240 && r.seedLosses === 3792 && r.evidenceGrade === 'selected-seed-first-cut-only'
        && r.fullDeviceQuotientSynthesis === false && r.rootWdl === null && r.cleanup === 'graceful'; },
    }];
  },
});
const O3 = Object.freeze({
  id: 'c4-0009-o3-oqs-residual-reuse', specification: 'docs/specs/profiles/C4-0009-O3-oqs-residual-reuse-v0.md',
  gpuRequired: true, requiredDependencies: REQUIRED_DEPENDENCIES,
  supports(s) { return s.connect === 4 && ((s.columns === 4 && s.rows === 4) || (s.columns === 7 && s.rows === 6)); },
  estimate(spec) {
    if (!this.supports(spec)) return { executable: false, upperBoundBytes: null, kind: 'unsupported-oqs-reuse-slice' };
    const options = { ...spec, slice: spec.columns === 4 ? 'reuse-control' : 'reuse-cut-5' };
    const a = oqsCofactor42Shape({ ...options, representation: 'unfactored' });
    const b = oqsCofactor42Shape({ ...options, representation: 'factored' });
    const deviceBytes = a.deviceBytes + b.deviceBytes;
    return { executable: true, deviceBytes, upperBoundBytes: deviceBytes + 256 * 1024 ** 2, kind: 'bounded-residual-transform-and-mapping-ab' };
  },
  steps(spec, repositoryRoot) {
    if (!this.supports(spec)) return [];
    const small = spec.columns === 4;
    const cuts = small ? Array.from({ length: 10 }, (_, i) => i) : [5];
    return [{ id: 'oqs-residual-transform-and-mapping', command: process.execPath,
      args: [...nativeNodeArgs(path.join(repositoryRoot, 'experiments/cuda-bsfp-oqs-cofactor/run-factored.mjs')), String(spec.columns), String(spec.rows)],
      expected(r) {
        return r?.outcome === 'native-oqs-factored-reuse-pass' && r.mode === 'native'
          && r.geometry === `${spec.columns}x${spec.rows}:c4`
          && r.evidenceGrade === 'selected-input-pair-table-transform-and-mapping'
          && r.inputPairIds === 'CPU-exact-qualification-fixture' && r.outputPairSlots === 'unmerged-residual-input-slots'
          && r.devicePairGrouping === false && r.fullDeviceQuotientSynthesis === false && r.rootWdl === null
          && r.transitionsChecked === cuts.length && r.logicalCandidates === (small ? 1409 : 8192)
          && r.residualCandidates === (small ? 326 : 128) && r.nativePassesPerTransition === 8
          && r.mismatches === 0 && r.targetCoverage === 1 && r.cleanup === 'graceful'
          && Array.isArray(r.controls) && r.controls.length === (small ? 9 : 0)
          && Array.isArray(r.samples) && r.samples.length === cuts.length * 8
          && cuts.every(cut => ['unfactored', 'factored'].every(representation => [0, 1, 2, 3].every(pass =>
            r.samples.filter(s => s.cut === cut && s.representation === representation && s.pass === pass
              && s.warmup === (pass === 0) && ['uploadMs', 'submitWaitMs', 'readbackMs'].every(k => Number.isFinite(s[k]) && s[k] >= 0)).length === 1)));
      },
    }];
  },
});
const PROFILES = new Map([[P1.id, P1], [B1.id, B1], [B2.id, B2], [B3.id, B3], [P2.id, P2], [C1.id, C1], [C2.id, C2], [C3.id, C3], [O1.id, O1], [O2.id, O2], [O3.id, O3]]);
export function getQualificationProfile(id) { const profile = PROFILES.get(id); if (!profile) throw new RangeError(`unknown CUDA-BSFP qualification profile: ${id}`); return profile; }
export function listQualificationProfiles() { return Object.freeze([...PROFILES.keys()]); }
export { denseShapeBytes };
