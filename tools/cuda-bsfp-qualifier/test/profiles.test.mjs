import test from 'node:test';
import assert from 'node:assert/strict';
import { denseShapeBytes, getQualificationProfile, listQualificationProfiles } from '../profiles.mjs';

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

test('P2 admits the <=42-cell compact ladder with a finite reusable GPU workspace', () => {
  const profile = getQualificationProfile('c4-0009-p2-compact-hybrid');
  for (const geometry of [{ columns: 4, rows: 3, connect: 3 }, { columns: 4, rows: 4, connect: 4 }, { columns: 5, rows: 5, connect: 4 }, { columns: 6, rows: 5, connect: 4 }, { columns: 7, rows: 5, connect: 4 }, { columns: 7, rows: 6, connect: 4 }]) assert.equal(profile.supports(geometry), true);
  assert.equal(profile.supports({ columns: 8, rows: 6, connect: 4 }), false);
  const estimate = profile.estimate({ columns: 7, rows: 6, connect: 4 });
  assert.equal(estimate.executable, true);
  assert.equal(estimate.cellCount, 42);
  assert.equal(estimate.candidateCapacity, 4_194_304);
  assert.equal(estimate.frontierCapacityPerSegment, 1_024);
  assert.ok(estimate.upperBoundBytes > 300 * 1024 * 1024);
  assert.ok(estimate.upperBoundBytes < 400 * 1024 * 1024);
  assert.equal(profile.estimate({ columns: 8, rows: 6, connect: 4 }).upperBoundBytes, null);
  assert.deepEqual(profile.requiredDependencies, getQualificationProfile('c4-0009-p1').requiredDependencies);
  assert.ok(listQualificationProfiles().includes(profile.id));
});

test('P2 passes geometry through the native child and retains known-root checks in the profile', () => {
  const profile = getQualificationProfile('c4-0009-p2-compact-hybrid');
  const steps = profile.steps({ columns: 7, rows: 6, connect: 4 }, '/repo');
  assert.equal(steps.length, 1);
  assert.equal(steps[0].id, 'compact-hybrid-root-wdl');
  assert.equal(steps[0].args.at(-1), '7x6:c4');
  assert.equal(steps[0].expected({ outcome: 'native-compact-hybrid-root-wdl-pass', geometry: '7x6-c4', rootWdl: 1, timingsMs: { solve: 12.5 }, gpuReducer: { generatedPairCandidates: 123 } }), true);
  assert.equal(steps[0].expected({ outcome: 'native-compact-hybrid-root-wdl-pass', geometry: '7x6-c4', rootWdl: 0, timingsMs: { solve: 12.5 }, gpuReducer: { generatedPairCandidates: 123 } }), false);
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
