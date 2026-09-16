#!/usr/bin/env node

import assert from 'node:assert/strict';
import { normalizeMinimalOwnershipAntichain } from '../../../components/bsfp/ownership-antichain-solver.mjs';
import { createRealCoverage64Fixture } from './real-fixture.mjs';

const WALL_CLOCK_LIMIT_MS = 30_000;
const RAW_PAIR_BUDGET = 4_176;
const CERTIFICATE_PRODUCT_BUDGET = 1_500_000;

function popcount(mask) {
  let value = mask >>> 0;
  let count = 0;
  while (value !== 0) {
    value &= value - 1;
    count += 1;
  }
  return count;
}

function subset(left, right) {
  return ((left >>> 0) & ~(right >>> 0)) === 0;
}

function bits(mask) {
  const result = [];
  let value = mask >>> 0;
  while (value !== 0) {
    const bit = (value & -value) >>> 0;
    result.push(bit);
    value = (value & (value - 1)) >>> 0;
  }
  return result;
}

function supportUniverse(segment) {
  const { columns } = segment.geometry;
  let universe = 0;
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < segment.supportHeights[column]; row += 1) {
      universe = (universe | (1 << (row * columns + column))) >>> 0;
    }
  }
  return universe >>> 0;
}

function coverageHas(record, id) {
  if (id < 32) return ((record.lo >>> id) & 1) !== 0;
  return ((record.hi >>> (id - 32)) & 1) !== 0;
}

function coverageKey(record) {
  return `${(record.hi >>> 0).toString(16).padStart(8, '0')}${(record.lo >>> 0).toString(16).padStart(8, '0')}`;
}

function orCoverage(left, right) {
  return {
    lo: (left.lo | right.lo) >>> 0,
    hi: (left.hi | right.hi) >>> 0,
  };
}

function coverageFromRecord(record, dictionary) {
  let lo = 0;
  let hi = 0;
  for (let id = 0; id < dictionary.length; id += 1) {
    if (!record.some((clause) => subset(clause, dictionary[id]))) continue;
    if (id < 32) lo = (lo | (1 << id)) >>> 0;
    else hi = (hi | (1 << (id - 32))) >>> 0;
  }
  return { lo, hi };
}

function normalizeRecord(clauses) {
  const unique = [...new Set(clauses.map((value) => value >>> 0))];
  if (unique.some((value) => value === 0)) return null;
  unique.sort((left, right) => popcount(left) - popcount(right) || left - right);
  const result = [];
  outer: for (const clause of unique) {
    for (const retained of result) if (subset(retained, clause)) continue outer;
    result.push(clause >>> 0);
  }
  return result;
}

function recordFromCoverage(coverage, dictionary) {
  const covered = [];
  for (let id = 0; id < dictionary.length; id += 1) {
    if (coverageHas(coverage, id)) covered.push(dictionary[id] >>> 0);
  }
  return normalizeRecord(covered) ?? [];
}

function recordSatisfied(record, ownership) {
  for (const clause of record) if (((clause >>> 0) & (ownership >>> 0)) === 0) return false;
  return true;
}

function forcedAndResidual(record) {
  let forced = 0;
  for (const clause of record) if (popcount(clause) === 1) forced = (forced | clause) >>> 0;
  const residual = record.filter((clause) => ((clause >>> 0) & forced) === 0);
  return { forced: forced >>> 0, residual };
}

function normalizeMinimalMasks(masks) {
  const unique = [...new Set(masks.map((mask) => mask >>> 0))];
  unique.sort((left, right) => popcount(left) - popcount(right) || left - right);
  const retained = [];
  outer: for (const candidate of unique) {
    for (const prior of retained) if (subset(prior, candidate)) continue outer;
    retained.push(candidate >>> 0);
  }
  return retained;
}

function boundedMinimalCompletions(record, universe, exactCount) {
  const { forced, residual } = forcedAndResidual(record);
  const forcedCount = popcount(forced);
  if (forcedCount > exactCount) return [];
  const available = (universe & ~forced) >>> 0;
  const budget = exactCount - forcedCount;
  let transversals = [0];

  for (const clause of residual) {
    const selectable = (clause & available) >>> 0;
    if (selectable === 0) return [];
    const next = [];
    for (const transversal of transversals) {
      if ((transversal & clause) !== 0) {
        next.push(transversal >>> 0);
        continue;
      }
      for (const bit of bits(selectable)) {
        const candidate = (transversal | bit) >>> 0;
        if (popcount(candidate) <= budget) next.push(candidate);
      }
    }
    transversals = normalizeMinimalMasks(next);
    if (transversals.length === 0) return [];
  }

  return normalizeMinimalMasks(
    transversals
      .filter((transversal) => popcount(transversal) <= budget)
      .map((transversal) => (forced | transversal) >>> 0),
  );
}

function completionKey(completions) {
  return completions.map((mask) => (mask >>> 0).toString(16)).join('.');
}

function ownershipAlgebraProduct(left, right, exactCount, accounting, applyCapacity = true) {
  if (left.length === 0 || right.length === 0) return [];
  const products = [];
  for (const a of left) for (const b of right) {
    accounting.value += 1;
    if (accounting.value > CERTIFICATE_PRODUCT_BUDGET) throw new Error('positive-certificate product budget exceeded');
    const merged = (a | b) >>> 0;
    if (applyCapacity && popcount(merged) > exactCount) continue;
    products.push(BigInt(merged));
  }
  return normalizeMinimalOwnershipAntichain(products).map((mask) => Number(mask) >>> 0);
}

function exactAssignments(universe, exactCount) {
  const result = [];
  for (let mask = universe >>> 0; ; mask = ((mask - 1) & universe) >>> 0) {
    if (popcount(mask) === exactCount) result.push(mask >>> 0);
    if (mask === 0) break;
  }
  return result;
}

function assertWithinLeash(startedAt) {
  if (Date.now() - startedAt > WALL_CLOCK_LIMIT_MS) throw new Error('positive-certificate algebra wall-clock leash exceeded');
}

function decorateInput(coverage, dictionary, universe, exactCount) {
  const record = recordFromCoverage(coverage, dictionary);
  const recovered = coverageFromRecord(record, dictionary);
  return {
    coverage,
    coverageIdentity: coverageKey(coverage),
    inversionMismatch: coverageKey(recovered) !== coverageKey(coverage),
    record,
    completions: boundedMinimalCompletions(record, universe, exactCount),
  };
}

function groupFeasibleCertificateInputs(inputs) {
  const groups = new Map();
  let infeasibleInputs = 0;
  for (const input of inputs) {
    if (input.completions.length === 0) {
      infeasibleInputs += 1;
      continue;
    }
    const key = completionKey(input.completions);
    let group = groups.get(key);
    if (group === undefined) {
      group = [];
      groups.set(key, group);
    }
    group.push(input);
  }
  return { groups, infeasibleInputs };
}

const startedAt = Date.now();
const fixture = createRealCoverage64Fixture();
assert.equal(fixture.totalCandidates, RAW_PAIR_BUDGET, 'qualified real-workload pair budget changed');

let rawPairs = 0;
let inputCoverageRecords = 0;
let inputInversionMismatches = 0;
let directCoverageClasses = 0;
let directCompletionClasses = 0;
let compositionMismatches = 0;
let concreteRepresentativeMismatches = 0;
let preRejectedRawPairs = 0;
let feasibleCertificateClassPairs = 0;
let inputCompletionClasses = 0;
let inputCoverageRecordsCollapsedByCompletionIdentity = 0;
let uncappedCapacityCounterexamples = 0;
let crossContextCompletionKeyCollisions = 0;
let anchorSliceMismatches = 0;
const certificateProductAccounting = { value: 0 };
const globalCompletionContexts = new Map();
const segmentSummaries = [];
let anchorSummary = null;

for (const segment of fixture.segments) {
  assertWithinLeash(startedAt);
  const universe = supportUniverse(segment);
  const dictionary = segment.dictionary.clauses;
  const left = segment.left.map((coverage) => decorateInput(coverage, dictionary, universe, segment.exactCount));
  const right = segment.right.map((coverage) => decorateInput(coverage, dictionary, universe, segment.exactCount));
  inputCoverageRecords += left.length + right.length;
  inputInversionMismatches += left.filter((entry) => entry.inversionMismatch).length + right.filter((entry) => entry.inversionMismatch).length;

  const leftGrouped = groupFeasibleCertificateInputs(left);
  const rightGrouped = groupFeasibleCertificateInputs(right);
  inputCompletionClasses += leftGrouped.groups.size + rightGrouped.groups.size;
  inputCoverageRecordsCollapsedByCompletionIdentity += (
    left.length - leftGrouped.infeasibleInputs - leftGrouped.groups.size
    + right.length - rightGrouped.infeasibleInputs - rightGrouped.groups.size
  );

  const contextKey = `${segment.geometry.columns}x${segment.geometry.rows}:c${segment.geometry.connect}:${segment.supportHeights.join(',')}:k${segment.exactCount}:b${segment.beneficiary}`;
  for (const key of [...leftGrouped.groups.keys(), ...rightGrouped.groups.keys()]) {
    let contexts = globalCompletionContexts.get(key);
    if (contexts === undefined) {
      contexts = new Set();
      globalCompletionContexts.set(key, contexts);
    }
    contexts.add(contextKey);
  }

  const representativeOutputs = new Map();
  let segmentClassPairs = 0;
  for (const [leftKey, leftGroup] of leftGrouped.groups) {
    for (const [rightKey, rightGroup] of rightGrouped.groups) {
      const output = ownershipAlgebraProduct(leftGroup[0].completions, rightGroup[0].completions, segment.exactCount, certificateProductAccounting, true);
      representativeOutputs.set(`${leftKey}|${rightKey}`, completionKey(output));
      segmentClassPairs += 1;
    }
  }
  feasibleCertificateClassPairs += segmentClassPairs;

  const directByCoverage = new Map();
  const completionOutputClasses = new Set();
  let segmentPreRejectedPairs = 0;
  let segmentCompositionMismatches = 0;
  let segmentUncappedCounterexamples = 0;

  for (const leftEntry of left) for (const rightEntry of right) {
    assertWithinLeash(startedAt);
    rawPairs += 1;

    if (leftEntry.completions.length === 0 || rightEntry.completions.length === 0) {
      preRejectedRawPairs += 1;
      segmentPreRejectedPairs += 1;
    }

    const mergedCoverage = orCoverage(leftEntry.coverage, rightEntry.coverage);
    const mergedCoverageIdentity = coverageKey(mergedCoverage);
    let direct = directByCoverage.get(mergedCoverageIdentity);
    if (direct === undefined) {
      const mergedRecord = normalizeRecord([...leftEntry.record, ...rightEntry.record]);
      direct = {
        record: mergedRecord ?? [],
        completions: mergedRecord === null ? [] : boundedMinimalCompletions(mergedRecord, universe, segment.exactCount),
      };
      directByCoverage.set(mergedCoverageIdentity, direct);
    }

    const composed = ownershipAlgebraProduct(leftEntry.completions, rightEntry.completions, segment.exactCount, certificateProductAccounting, true);
    const directKey = completionKey(direct.completions);
    const composedKey = completionKey(composed);
    if (directKey !== composedKey) {
      compositionMismatches += 1;
      segmentCompositionMismatches += 1;
    }

    if (leftEntry.completions.length !== 0 && rightEntry.completions.length !== 0) {
      const representativeKey = `${completionKey(leftEntry.completions)}|${completionKey(rightEntry.completions)}`;
      if (representativeOutputs.get(representativeKey) !== directKey) concreteRepresentativeMismatches += 1;
    }

    const uncapped = ownershipAlgebraProduct(leftEntry.completions, rightEntry.completions, segment.exactCount, certificateProductAccounting, false);
    if (direct.completions.length === 0 && uncapped.length !== 0) {
      uncappedCapacityCounterexamples += 1;
      segmentUncappedCounterexamples += 1;
    }

    if (direct.completions.length !== 0) completionOutputClasses.add(directKey);
  }

  directCoverageClasses += directByCoverage.size;
  directCompletionClasses += completionOutputClasses.size;

  const isAnchor = (
    segment.geometry.columns === 5
    && segment.geometry.rows === 4
    && segment.geometry.connect === 4
    && segment.rank === 11
    && segment.beneficiary === 0
    && segment.supportHeights.join(',') === '3,1,1,3,3'
  );

  let segmentAnchorAssignments = 0;
  let segmentAnchorMismatches = 0;
  if (isAnchor) {
    const assignments = exactAssignments(universe, segment.exactCount);
    segmentAnchorAssignments = assignments.length;
    for (const direct of directByCoverage.values()) {
      for (const assignment of assignments) {
        const fromClauses = recordSatisfied(direct.record, assignment);
        const fromCertificate = direct.completions.some((completion) => subset(completion, assignment));
        if (fromClauses !== fromCertificate) {
          anchorSliceMismatches += 1;
          segmentAnchorMismatches += 1;
        }
      }
    }
    anchorSummary = {
      support: segment.supportHeights.join(','),
      rawPairs: segment.rawPairs,
      exactCoverageClasses: directByCoverage.size,
      exactAssignments: assignments.length,
      sliceMismatches: segmentAnchorMismatches,
    };
  }

  segmentSummaries.push({
    id: segment.id,
    geometry: `${segment.geometry.columns}x${segment.geometry.rows} c${segment.geometry.connect}`,
    support: segment.supportHeights.join(','),
    exactCount: segment.exactCount,
    rawPairs: left.length * right.length,
    leftInputs: left.length,
    rightInputs: right.length,
    leftInfeasibleInputs: leftGrouped.infeasibleInputs,
    rightInfeasibleInputs: rightGrouped.infeasibleInputs,
    leftCertificateClasses: leftGrouped.groups.size,
    rightCertificateClasses: rightGrouped.groups.size,
    feasibleCertificateClassPairs: segmentClassPairs,
    preRejectedRawPairs: segmentPreRejectedPairs,
    exactCoverageOutputs: directByCoverage.size,
    feasibleCompletionOutputs: completionOutputClasses.size,
    compositionMismatches: segmentCompositionMismatches,
    uncappedCapacityCounterexamples: segmentUncappedCounterexamples,
    anchorAssignments: segmentAnchorAssignments,
  });
}

for (const contexts of globalCompletionContexts.values()) if (contexts.size > 1) crossContextCompletionKeyCollisions += 1;

assert.equal(rawPairs, RAW_PAIR_BUDGET, 'raw pair accounting changed');
assert.equal(inputInversionMismatches, 0, 'input coverage-to-clause inversion was not exact');
assert.equal(compositionMismatches, 0, 'bounded completion composition disagreed with direct merged completion');
assert.equal(concreteRepresentativeMismatches, 0, 'completion-equivalent inputs did not share the same merged certificate result');
assert.equal(anchorSliceMismatches, 0, 'certificate composition did not preserve exact-cardinality anchor semantics');
assert(anchorSummary, 'qualified 32x19=608 anchor not found');
assert.equal(anchorSummary.rawPairs, 608);
assert.equal(anchorSummary.exactAssignments, 462);
assertWithinLeash(startedAt);

if (preRejectedRawPairs === 0 && inputCoverageRecordsCollapsedByCompletionIdentity === 0 && feasibleCertificateClassPairs >= rawPairs) {
  throw new Error('positive-certificate algebra produced no pre-product rejection, input quotient, or class-pair reduction');
}

const output = {
  schemaVersion: 1,
  kind: 'connect4-bsfp-positive-certificate-algebra-synthesis',
  attribution: 'Josh Oshiro',
  candidateLaw: 'under fixed positive-monotone admissibility context, bounded minimal-completion certificates map normalized clause conjunction to the maintained ownership upward-antichain product: C_k(A union B) = min-subset {x union y | x in C_k(A), y in C_k(B), |x union y| <= k}',
  authorityRelationship: {
    clauseOperation: 'normalized union/conjunction of positive clause antichains',
    certificateOperation: 'pairwise ownership-mask OR followed by maintained normalizeMinimalOwnershipAntichain',
    admissibilityObservation: 'certificate antichain non-emptiness and exact-cardinality upward slice',
  },
  fixture: {
    segments: fixture.segments.length,
    rawPairs,
    inputCoverageRecords,
    inputInversionMismatches,
    exactCoverageOutputClasses: directCoverageClasses,
    feasibleCompletionOutputClasses: directCompletionClasses,
  },
  composition: {
    mismatches: compositionMismatches,
    representativeMismatches: concreteRepresentativeMismatches,
    certificateUnionProducts: certificateProductAccounting.value,
    certificateUnionProductBudget: CERTIFICATE_PRODUCT_BUDGET,
  },
  preProductReduction: {
    infeasibleRawPairsRejectedFromEmptyInputCertificate: preRejectedRawPairs,
    feasibleCertificateClassPairs,
    classPairReductionVsRawPairs: 1 - feasibleCertificateClassPairs / rawPairs,
    inputCompletionClasses,
    inputCoverageRecordsCollapsedByCompletionIdentity,
  },
  guardControls: {
    uncappedCapacityCounterexamples,
    crossContextCompletionKeyCollisions,
  },
  anchor: anchorSummary,
  segmentSummaries,
  leashes: {
    wallClockMs: WALL_CLOCK_LIMIT_MS,
    rawPairs: RAW_PAIR_BUDGET,
    certificateUnionProducts: CERTIFICATE_PRODUCT_BUDGET,
  },
  wallMs: Date.now() - startedAt,
};

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
