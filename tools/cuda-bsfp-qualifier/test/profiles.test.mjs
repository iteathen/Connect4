import test from 'node:test';
import assert from 'node:assert/strict';

test('O3 requires every exact mapped output and native repetition without claiming GPU grouping', () => {
  const profile = getQualificationProfile('c4-0009-o3-oqs-residual-reuse');
  for (const small of [true, false]) {
    const spec = small ? { columns: 4, rows: 4, connect: 4 } : { columns: 7, rows: 6, connect: 4 };
    const accepts = profile.steps(spec, '/repo')[0].expected;
    const cuts = small ? Array.from({ length: 10 }, (_, i) => i) : [5];
    const valid = { outcome: 'native-oqs-factored-reuse-pass', mode: 'native', geometry: `${spec.columns}x${spec.rows}:c4`,
      evidenceGrade: 'selected-input-pair-table-transform-and-mapping', inputPairIds: 'CPU-exact-qualification-fixture',
      outputPairSlots: 'unmerged-residual-input-slots', devicePairGrouping: false, fullDeviceQuotientSynthesis: false,
      rootWdl: null, transitionsChecked: cuts.length, logicalCandidates: small ? 1409 : 8192,
      residualCandidates: small ? 326 : 128, nativePassesPerTransition: 8, mismatches: 0, targetCoverage: 1,
      cleanup: 'graceful', controls: Array(small ? 9 : 0).fill('control'),
      samples: cuts.flatMap(cut => ['unfactored', 'factored'].flatMap(representation => [0, 1, 2, 3].map(pass =>
        ({ cut, representation, pass, warmup: pass === 0, uploadMs: 1, submitWaitMs: 2, readbackMs: 3 })))) };
    assert.equal(accepts(valid), true);
    for (const patch of [{ mode: 'portable' }, { rootWdl: 1 }, { devicePairGrouping: true },
      { fullDeviceQuotientSynthesis: true }, { targetCoverage: 0.99 }, { logicalCandidates: 128 },
      { samples: valid.samples.slice(1) }, { samples: valid.samples.map(s => ({ ...s, pass: 0 })) },
      { cleanup: 'failed' }, { mismatches: 1 }, { nativePassesPerTransition: 2 }]) assert.equal(accepts({ ...valid, ...patch }), false);
    assert.equal(profile.estimate(spec).upperBoundBytes, small ? 277098844 : 422507356);
  }
  assert.equal(profile.supports({ columns: 5, rows: 5, connect: 4 }), false);
});
import { denseShapeBytes, getQualificationProfile, listQualificationProfiles } from '../profiles.mjs';

test('real overflow replays distinguish executors and stay inside the unchanged admission ceiling', () => {
  for (const [id, methods] of [['c4-0009-p2-overflow-replay', ['packed', 'tensor']], ['c4-0009-p2-overflow-bucketed-replay', ['packed', 'bucketed']]]) {
    const profile = getQualificationProfile(id);
    const spec = { columns: 7, rows: 6, connect: 4 };
    const estimate = profile.estimate(spec);
    assert.equal(estimate.upperBoundBytes, 543169548);
    assert.equal(estimate.devicePayloadBytes, 90185232);
    assert.equal(estimate.replayUpperBoundBytes, 515914784);
    assert(estimate.replayUpperBoundBytes <= estimate.upperBoundBytes);
    const accepts = profile.steps(spec, '/repo')[0].expected;
    const result = { outcome: 'native-overflow-replay-pass', geometry: '7x6:c4', methods, rootWdl: null,
      mismatches: 0, cleanup: 'graceful', survivors: 1055,
      ...Object.fromEntries(methods.map(mode => [mode, { samples: [1, 2, 3] }])),
      stats: Object.fromEntries(methods.map(mode => [mode, { overflowRecoveredJobs: 4, overflowFailures: 0 }])) };
    assert(accepts(result));
    for (const change of [{ rootWdl: 1 }, { mismatches: 1 }, { survivors: 1024 }, { methods: ['wrong'] }, { cleanup: 'failed' }]) assert.equal(accepts({ ...result, ...change }), false);
    assert.equal(accepts(null), false);
  }
});

test('O2 admits only a bounded 7x6 seed cut and rejects any root/full-quotient promotion', () => {
  const p = getQualificationProfile('c4-0009-o2-oqs-7x6-seed-slice');
  const spec = { columns: 7, rows: 6, connect: 4 };
  assert(p.estimate(spec).upperBoundBytes < 260 * 1024 ** 2);
  const accepts = p.steps(spec, process.cwd())[0].expected;
  const r = { outcome: 'native-oqs-seed-slice-pass', mode: 'native', geometry: '7x6:c4', supportIndex: 470594,
    cut: 0, transitionsChecked: 1, candidatesPerPass: 16, nativePasses: 8, independentLayers: 2,
    mismatches: 0, targetCoverage: 1, seedWins: 240, seedLosses: 3792,
    evidenceGrade: 'selected-seed-first-cut-only', fullDeviceQuotientSynthesis: false, rootWdl: null, cleanup: 'graceful' };
  assert.equal(accepts(r), true);
  for (const patch of [{ rootWdl: 1 }, { fullDeviceQuotientSynthesis: true }, { independentLayers: 1 }, { mode: 'portable' },
    { cut: 1 }, { nativePasses: 0 }, { targetCoverage: 0.9 }, { seedLosses: 100 }]) assert.equal(accepts({ ...r, ...patch }), false);
  assert.equal(p.supports({ columns: 6, rows: 5, connect: 4 }), false);
});

test('OQS qualification requires native selected-support parity and does not claim a root solve', () => {
  const p = getQualificationProfile('c4-0009-o1-oqs-cofactor-42');
  const spec = { columns: 4, rows: 4, connect: 4 };
  const expected = p.steps(spec, process.cwd())[0].expected;
  const result = { outcome: 'native-oqs-cofactor-pass', mode: 'native', geometry: '4x4:c4',
    evidenceGrade: 'all-candidates-of-selected-supports', fullDeviceQuotientSynthesis: false, rootWdl: null,
    mismatches: 0, targetCoverage: 1, cleanup: 'graceful', transitionsChecked: 10,
    candidatesChecked: 1409, referenceSupports: [{ totalCandidates: 1409 }], controls: Array(11) };
  assert.equal(expected(result), true);
  for (const patch of [{ mode: 'portable' }, { rootWdl: 0 }, { fullDeviceQuotientSynthesis: true }, { targetCoverage: 0.99 }, { mismatches: 1 }, { transitionsChecked: 9 }, { candidatesChecked: 1408 }, { cleanup: 'failed' }]) assert.equal(expected({ ...result, ...patch }), false);
  assert.equal(p.supports({ columns: 7, rows: 6, connect: 4 }), false);
  assert.equal(p.estimate({ columns: 7, rows: 6, connect: 4 }).upperBoundBytes, null);
});

test('P1 is executable only for its frozen 4x3 connect-3 qualification geometry', () => {
  const profile = getQualificationProfile('c4-0009-p1');
  const small = { columns: 4, rows: 3, connect: 3 };
  const large = { columns: 8, rows: 7, connect: 4 };
  assert.equal(profile.supports(small), true);
  assert.equal(profile.supports(large), false);
  assert.ok(profile.estimate(small).upperBoundBytes > 4 * 1024 * 1024);
  assert.equal(profile.estimate(large).upperBoundBytes, null);
});

test('dense scaling estimator is exact bigint arithmetic and does not overflow host Number', () => {
  assert.equal(denseShapeBytes({ columns: 4, rows: 3 }).toString(), String(256 * 4096 * 4));
  assert.ok(denseShapeBytes({ columns: 9, rows: 7 }) > BigInt(Number.MAX_SAFE_INTEGER));
});

test('P1 freezes the exact lower revision pair required for official evidence', () => {
  const profile = getQualificationProfile('c4-0009-p1');
  assert.equal(profile.requiredDependencies.cudaAlgorithmsRevision, '48ee0aec9acae7776950f03ab52ab1737e598b6e');
  assert.equal(profile.requiredDependencies.cudaJsRevision, '98e2ebc942c14d63acf4dd82e912dd548c363a05');
});

test('B1 exposes a finite 7x6-only packed-dominance performance workload', () => {
  const profile = getQualificationProfile('c4-0009-b1-packed-dominance-42');
  assert.equal(profile.supports({ columns: 7, rows: 6, connect: 4 }), true);
  assert.equal(profile.supports({ columns: 5, rows: 5, connect: 4 }), false);
  const estimate = profile.estimate({ columns: 7, rows: 6, connect: 4 });
  assert.equal(estimate.executable, true);
  assert.equal(estimate.candidateCount, 1_048_576);
  assert.equal(estimate.frontierCount, 568);
  assert.ok(estimate.upperBoundBytes > 256 * 1024 * 1024);
  assert.ok(estimate.upperBoundBytes < 300 * 1024 * 1024);
  assert.equal(profile.estimate({ columns: 5, rows: 5, connect: 4 }).upperBoundBytes, null);
  assert.deepEqual(profile.requiredDependencies, getQualificationProfile('c4-0009-p1').requiredDependencies);
  assert.ok(listQualificationProfiles().includes(profile.id));
});

test('B2 compares legacy and bucketed exact packed42 normalizers on equal and mixed cardinality fixtures', () => {
  const profile = getQualificationProfile('c4-0009-b2-packed-normalizer-bucketed-42');
  const geometry = { columns: 7, rows: 6, connect: 4 };
  assert.equal(profile.supports(geometry), true);
  assert.equal(profile.supports({ columns: 6, rows: 5, connect: 4 }), false);
  const estimate = profile.estimate(geometry);
  assert.equal(estimate.executable, true);
  assert.equal(estimate.segmentCount, 1024);
  assert.equal(estimate.segmentSize, 512);
  assert.equal(estimate.candidateCount, 524288);
  assert.ok(estimate.upperBoundBytes > 256 * 1024 * 1024);
  assert.ok(estimate.upperBoundBytes < 300 * 1024 * 1024);
  const steps = profile.steps(geometry, '/repo');
  assert.deepEqual(steps.map((step) => step.id), ['legacy-equal-cardinality', 'bucketed-equal-cardinality', 'legacy-mixed-cardinality', 'bucketed-mixed-cardinality']);
  assert.deepEqual(steps.map((step) => step.args.at(-1)), ['equal', 'equal', 'mixed', 'mixed']);
  const common = { outcome: 'native-segmented-packed-antichain-pass', segmentCount: 1024, segmentSize: 512, candidateCount: 524288, injectedExactDuplicates: 1024, verifiedSegments: 1024, survivors: 400000, timingsMs: { submissionWait: 12.5 } };
  assert.equal(steps[0].expected({ ...common, strategy: 'legacy-43-phase-scan', fixture: 'equal-cardinality-duplicate-stress' }), true);
  assert.equal(steps[1].expected({ ...common, strategy: 'bucketed-cardinality-v0', fixture: 'equal-cardinality-duplicate-stress' }), true);
  assert.equal(steps[2].expected({ ...common, strategy: 'legacy-43-phase-scan', fixture: 'mixed-cardinality-deterministic' }), true);
  assert.equal(steps[3].expected({ ...common, strategy: 'bucketed-cardinality-v0', fixture: 'mixed-cardinality-deterministic' }), true);
  assert.equal(steps[3].expected({ ...common, strategy: 'legacy-43-phase-scan', fixture: 'mixed-cardinality-deterministic' }), false);
  assert.deepEqual(profile.requiredDependencies, getQualificationProfile('c4-0009-p1').requiredDependencies);
  assert.ok(listQualificationProfiles().includes(profile.id));
});

test('B3 compares ordinary bucketed and exact duplicate-first packed42 normalization on Cartesian duplicate stress', () => {
  const profile = getQualificationProfile('c4-0009-b3-packed-dedup-first-42');
  const geometry = { columns: 7, rows: 6, connect: 4 };
  assert.equal(profile.supports(geometry), true);
  assert.equal(profile.supports({ columns: 6, rows: 5, connect: 4 }), false);
  const estimate = profile.estimate(geometry);
  assert.equal(estimate.executable, true);
  assert.equal(estimate.kind, 'proved-packed-dedup-order-ab-upper-bound');
  assert.equal(estimate.segmentCount, 1024);
  assert.equal(estimate.segmentSize, 512);
  assert.equal(estimate.candidateCount, 524288);
  assert.ok(estimate.upperBoundBytes > 256 * 1024 * 1024);
  assert.ok(estimate.upperBoundBytes < 300 * 1024 * 1024);
  const steps = profile.steps(geometry, '/repo');
  assert.deepEqual(steps.map((step) => step.id), ['bucketed-duplicate-rich-control', 'dedup-first-duplicate-rich']);
  assert.deepEqual(steps.map((step) => step.args.at(-1)), ['native-bucketed', 'native-dedup-first']);
  const common = {
    outcome: 'native-dedup-first-stress-pass',
    fixture: 'cartesian-or-and-duplicate-stress',
    segmentCount: 1024,
    segmentSize: 512,
    candidateCount: 524288,
    uniqueCandidateCount: 430000,
    exactDuplicateCount: 94288,
    duplicateFraction: 94288 / 524288,
    survivors: 120000,
    observedFrontierSubsetChecks: 1_000_000,
    timingsMs: { submissionWait: 12.5 },
  };
  assert.equal(steps[0].expected({ ...common, strategy: 'bucketed-cardinality-v0' }), true);
  assert.equal(steps[1].expected({ ...common, strategy: 'bucketed-dedup-first-v0' }), true);
  assert.equal(steps[1].expected({ ...common, strategy: 'bucketed-cardinality-v0' }), false);
  assert.equal(steps[1].expected({ ...common, exactDuplicateCount: 0, uniqueCandidateCount: 524288, duplicateFraction: 0 }), false);
  assert.deepEqual(profile.requiredDependencies, getQualificationProfile('c4-0009-p1').requiredDependencies);
  assert.ok(listQualificationProfiles().includes(profile.id));
});

test('P2 admits the <=42-cell compact ladder with a finite reusable GPU workspace', () => {
  const profile = getQualificationProfile('c4-0009-p2-compact-hybrid');
  for (const geometry of [{ columns: 4, rows: 3, connect: 3 }, { columns: 4, rows: 4, connect: 4 }, { columns: 5, rows: 5, connect: 4 }, { columns: 6, rows: 5, connect: 4 }, { columns: 7, rows: 5, connect: 4 }, { columns: 7, rows: 6, connect: 4 }]) assert.equal(profile.supports(geometry), true);
  assert.equal(profile.supports({ columns: 8, rows: 6, connect: 4 }), false);
  const estimate = profile.estimate({ columns: 7, rows: 6, connect: 4 });
  assert.equal(estimate.executable, true);
  assert.equal(estimate.cellCount, 42);
  assert.equal(estimate.candidateCapacity, 4_194_304);
  assert.equal(estimate.frontierCapacityPerSegment, 1_024);
  assert.equal(estimate.kind, 'proved-hybrid-tensor-overflow-workspace-upper-bound');
  assert.equal(estimate.tensorOverflowAllowanceBytes, String(64 * 1024 * 1024));
  assert.equal(estimate.tensorDeviceProgramWorkspaceLimitBytes, String(192 * 1024 * 1024));
  assert.ok(estimate.upperBoundBytes > 500 * 1024 * 1024);
  assert.ok(estimate.upperBoundBytes < 576 * 1024 * 1024);
  assert.equal(profile.estimate({ columns: 8, rows: 6, connect: 4 }).upperBoundBytes, null);
  assert.equal(profile.requiredDependencies.cudaAlgorithmsRevision, getQualificationProfile('c4-0009-p1').requiredDependencies.cudaAlgorithmsRevision);
  assert.equal(profile.requiredDependencies.cudaJsRevision, getQualificationProfile('c4-0009-p1').requiredDependencies.cudaJsRevision);
  assert.equal(profile.requiredDependencies.cudaJsTensorRevision, '9df9324b0ca7606f9dd2af2e89aed118839896a5');
  assert.ok(listQualificationProfiles().includes(profile.id));
});

test('P2 passes geometry through the native child and retains known-root checks in the profile', () => {
  const profile = getQualificationProfile('c4-0009-p2-compact-hybrid');
  const steps = profile.steps({ columns: 7, rows: 6, connect: 4 }, '/repo');
  assert.equal(steps.length, 2);
  assert.equal(steps[0].id, 'tensor-dominance-full-shape-ab');
  assert.equal(steps[1].id, 'compact-hybrid-root-wdl');
  assert.equal(steps[1].args.at(-1), '7x6:c4');
  const tensorAb = { kind: 'connect4-bsfp-tensor-dominance-overflow-ab', mode: 'native', geometry: '7x6-c4-packed42-workshape', fixture: { frontierCount: 1487, candidateCount: 4096, expectedFinalFrontierCount: 123 }, authority: { outcome: 'native-authority-frontier-match', frontierCount: 123 }, execution: { outcome: 'native-tensor-dominance-exact-match', tensorLogicalSubsetPairs: 6090752, baselineSubsetChecks: 10, baselineTiming: { median: 1 }, tensorOnlyTiming: { median: 1 }, tensorFullTiming: { median: 1 } }, tensor: { itemCapacity: 4096, totalWorkspaceBytes: 1024 } };
  assert.equal(steps[0].expected(tensorAb), true);
  assert.equal(steps[0].expected({ ...tensorAb, execution: { ...tensorAb.execution, outcome: 'portable-tensor-dominance-compile-pass' } }), false);
  const valid = { outcome: 'native-compact-hybrid-root-wdl-pass', geometry: '7x6-c4', rootWdl: 1, timingsMs: { solve: 12.5 }, gpuReducer: { generatedPairCandidates: 123, tensorOverflowCalls: 1 } };
  assert.equal(steps[1].expected(valid), true);
  assert.equal(steps[1].expected({ ...valid, rootWdl: 0 }), false);
  assert.equal(steps[1].expected({ ...valid, gpuReducer: { generatedPairCandidates: 123 } }), false);
});

test('compact qualification cannot confuse partial/scaling/portable evidence with all-frontier success', () => {
  const geometry = { columns: 4, rows: 4, connect: 4 };
  const profile = getQualificationProfile('c4-0009-c1-compact-ownership-42');
  const accepts = profile.steps(geometry, process.cwd())[0].expected;
  const valid = { outcome: 'native-compact-frontier-pass', closure: 'full-root', rootWdl: 0, comparedSupports: 625, frontierMismatches: 0, cleanup: 'graceful' };
  assert.equal(accepts(valid), true);
  for (const patch of [{ closure: 'partial-rank' }, { comparedSupports: 624 }, { frontierMismatches: 1 }, { rootWdl: 1 }, { outcome: 'native-compact-root-complete' }, { cleanup: 'failed' }]) assert.equal(accepts({ ...valid, ...patch }), false);
  assert.equal(profile.supports({ columns: 7, rows: 6, connect: 4 }), false);
  assert.equal(profile.estimate({ columns: 7, rows: 6, connect: 4 }).upperBoundBytes, null);
  const scaling = getQualificationProfile('c4-0009-c2-compact-scaling-42');
  assert.equal(scaling.supports({ columns: 6, rows: 5, connect: 4 }), true);
  assert.equal(scaling.supports({ columns: 7, rows: 6, connect: 4 }), false);
  assert.ok(scaling.estimate({ columns: 6, rows: 5, connect: 4 }).upperBoundBytes < 2 * 1024 ** 3);
});

test('C3 is a one-epoch 6x5 diagnostic and cannot be accepted as a root solve', () => {
  const profile = getQualificationProfile('c4-0009-c3-compact-work-diagnostic-42');
  const geometry = { columns: 6, rows: 5, connect: 4 };
  assert.equal(profile.supports(geometry), true);
  assert.equal(profile.supports({ columns: 5, rows: 5, connect: 4 }), false);
  assert.equal(profile.estimate(geometry).staticEpochLimit, 1);
  assert.ok(profile.estimate(geometry).upperBoundBytes < 2 * 1024 ** 3);
  assert.ok(listQualificationProfiles().includes(profile.id));
  const step = profile.steps(geometry, '/repo')[0];
  assert.equal(step.id, 'compact-work-diagnostic-prefix');
  const valid = { outcome: 'native-compact-diagnostic-prefix-pass', caseRole: 'partial-rank-diagnostic', closure: 'partial-static-prefix', rootWdl: null, comparedSupports: 0, cleanup: 'graceful', runs: [{ executedEpochCount: 1, completedFullSchedule: false, diagnostics: { executedEpochCount: 1, totals: { normalizationCalls: 5, normalizationInputRecords: 123 }, hotSupports: [] } }] };
  assert.equal(step.expected(valid), true);
  assert.equal(step.expected({ ...valid, closure: 'full-root' }), false);
  assert.equal(step.expected({ ...valid, rootWdl: 1 }), false);
  assert.equal(step.expected({ ...valid, runs: [{ ...valid.runs[0], completedFullSchedule: true }] }), false);
});
