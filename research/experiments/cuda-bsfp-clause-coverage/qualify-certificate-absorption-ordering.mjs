#!/usr/bin/env node

import assert from 'node:assert/strict';
import { createRealCoverage64Fixture } from './real-fixture.mjs';

const WALL_CLOCK_LIMIT_MS = 30_000;
const RAW_PAIR_BUDGET = 4_176;
const GENERATED_OPERATION_BUDGET = 5_000;

function popcount(mask) {
  let value = mask >>> 0;
  let count = 0;
  while (value !== 0) {
    value &= value - 1;
    count += 1;
  }
  return count;
}

function subset32(left, right) {
  return (((left >>> 0) & ~(right >>> 0)) >>> 0) === 0;
}

function subset64(left, right) {
  return ((left.lo & ~right.lo) >>> 0) === 0 && ((left.hi & ~right.hi) >>> 0) === 0;
}

function or64(left, right) {
  return { lo: (left.lo | right.lo) >>> 0, hi: (left.hi | right.hi) >>> 0 };
}

function and64(left, right) {
  return { lo: (left.lo & right.lo) >>> 0, hi: (left.hi & right.hi) >>> 0 };
}

function key64(value) {
  return `${(value.hi >>> 0).toString(16).padStart(8, '0')}:${(value.lo >>> 0).toString(16).padStart(8, '0')}`;
}

function normalizeMinimal64(values) {
  const unique = new Map();
  for (const value of values) unique.set(key64(value), { lo: value.lo >>> 0, hi: value.hi >>> 0 });
  const ordered = [...unique.values()].sort((a, b) => {
    const delta = popcount(a.lo) + popcount(a.hi) - popcount(b.lo) - popcount(b.hi);
    if (delta !== 0) return delta;
    return a.hi - b.hi || a.lo - b.lo;
  });
  const result = [];
  outer: for (const candidate of ordered) {
    for (const retained of result) if (subset64(retained, candidate)) continue outer;
    result.push(candidate);
  }
  return result;
}

function normalizeRecord(clauses) {
  const unique = [...new Set(clauses.map((value) => value >>> 0))];
  if (unique.some((value) => value === 0)) return null;
  unique.sort((left, right) => popcount(left) - popcount(right) || left - right);
  const result = [];
  outer: for (const clause of unique) {
    for (const retained of result) if (subset32(retained, clause)) continue outer;
    result.push(clause >>> 0);
  }
  return result;
}

function coverageHas(record, id) {
  if (id < 32) return ((record.lo >>> id) & 1) !== 0;
  return ((record.hi >>> (id - 32)) & 1) !== 0;
}

function coverageFromRecord(record, dictionary) {
  let lo = 0;
  let hi = 0;
  for (let id = 0; id < dictionary.length; id += 1) {
    if (!record.some((clause) => subset32(clause, dictionary[id]))) continue;
    if (id < 32) lo = (lo | (1 << id)) >>> 0;
    else hi = (hi | (1 << (id - 32))) >>> 0;
  }
  return { lo, hi };
}

function recordFromCoverage(coverage, dictionary) {
  const covered = [];
  for (let id = 0; id < dictionary.length; id += 1) {
    if (coverageHas(coverage, id)) covered.push(dictionary[id] >>> 0);
  }
  return normalizeRecord(covered) ?? [];
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

function normalizeMinimalMasks(masks) {
  const unique = [...new Set(masks.map((mask) => mask >>> 0))];
  unique.sort((left, right) => popcount(left) - popcount(right) || left - right);
  const retained = [];
  outer: for (const candidate of unique) {
    for (const prior of retained) if (subset32(prior, candidate)) continue outer;
    retained.push(candidate >>> 0);
  }
  return retained;
}

function boundedMinimalCompletions(record, universe, exactCount) {
  let forced = 0;
  const residual = [];
  for (const clause of record) {
    if (popcount(clause) === 1) forced = (forced | clause) >>> 0;
    else residual.push(clause >>> 0);
  }
  const forcedCount = popcount(forced);
  if (forcedCount > exactCount) return [];
  const available = (universe & ~forced) >>> 0;
  const budget = exactCount - forcedCount;
  let transversals = [0];

  for (const clause of residual.filter((clause) => (clause & forced) === 0)) {
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

function decorateInput(coverage, segment, universe) {
  const dictionary = segment.dictionary.clauses;
  const record = recordFromCoverage(coverage, dictionary);
  const recovered = coverageFromRecord(record, dictionary);
  assert.equal(key64(recovered), key64(coverage), `${segment.id} input coverage inversion mismatch`);
  return {
    coverage,
    record,
    infeasible: boundedMinimalCompletions(record, universe, segment.exactCount).length === 0,
  };
}

function exactFeasible(candidate, segment, universe, memo) {
  const key = key64(candidate);
  let value = memo.get(key);
  if (value !== undefined) return value;
  const record = recordFromCoverage(candidate, segment.dictionary.clauses);
  const recovered = coverageFromRecord(record, segment.dictionary.clauses);
  assert.equal(key64(recovered), key, `${segment.id} generated coverage inversion mismatch`);
  value = boundedMinimalCompletions(record, universe, segment.exactCount).length !== 0;
  memo.set(key, value);
  return value;
}

function absorptionPlan(left, right) {
  if (left.length === 0 || right.length === 0) {
    return {
      coreA: null,
      coreB: null,
      leftAbsorbed: new Uint32Array(left.length),
      rightAbsorbed: new Uint32Array(right.length),
    };
  }

  let coreA = { ...left[0].coverage };
  for (const entry of left) coreA = and64(coreA, entry.coverage);
  let coreB = { ...right[0].coverage };
  for (const entry of right) coreB = and64(coreB, entry.coverage);

  const leftAbsorbed = new Uint32Array(left.length);
  const rightAbsorbed = new Uint32Array(right.length);
  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      if (
        leftAbsorbed[leftIndex] === 0
        && subset64(right[rightIndex].coverage, or64(left[leftIndex].coverage, coreB))
      ) leftAbsorbed[leftIndex] = 1;
      if (
        rightAbsorbed[rightIndex] === 0
        && subset64(left[leftIndex].coverage, or64(right[rightIndex].coverage, coreA))
      ) rightAbsorbed[rightIndex] = 1;
    }
  }

  return { coreA, coreB, leftAbsorbed, rightAbsorbed };
}

function materializeAbsorption(left, right, plan, skipEmptyProvenance, accounting) {
  if (left.length === 0 || right.length === 0) {
    return {
      generated: [],
      absorbedRecordEmits: 0,
      skippedAbsorbedEmits: 0,
      remainingPairs: 0,
      skippedResidualPairs: 0,
    };
  }

  const generated = [];
  let absorbedRecordEmits = 0;
  let skippedAbsorbedEmits = 0;
  let remainingPairs = 0;
  let skippedResidualPairs = 0;

  for (let index = 0; index < left.length; index += 1) {
    if (plan.leftAbsorbed[index] === 0) continue;
    absorbedRecordEmits += 1;
    if (skipEmptyProvenance && left[index].infeasible) {
      skippedAbsorbedEmits += 1;
      continue;
    }
    generated.push(or64(left[index].coverage, plan.coreB));
  }

  for (let index = 0; index < right.length; index += 1) {
    if (plan.rightAbsorbed[index] === 0) continue;
    absorbedRecordEmits += 1;
    if (skipEmptyProvenance && right[index].infeasible) {
      skippedAbsorbedEmits += 1;
      continue;
    }
    generated.push(or64(right[index].coverage, plan.coreA));
  }

  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    if (plan.leftAbsorbed[leftIndex] !== 0) continue;
    for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      if (plan.rightAbsorbed[rightIndex] !== 0) continue;
      remainingPairs += 1;
      if (skipEmptyProvenance && (left[leftIndex].infeasible || right[rightIndex].infeasible)) {
        skippedResidualPairs += 1;
        continue;
      }
      generated.push(or64(left[leftIndex].coverage, right[rightIndex].coverage));
    }
  }

  accounting.value += generated.length;
  if (accounting.value > GENERATED_OPERATION_BUDGET) throw new Error('certificate-absorption generated-operation budget exceeded');

  return {
    generated,
    absorbedRecordEmits,
    skippedAbsorbedEmits,
    remainingPairs,
    skippedResidualPairs,
  };
}

function classAndFrontierMetrics(generated, segment, universe) {
  const classes = new Map();
  for (const candidate of generated) classes.set(key64(candidate), candidate);
  const memo = new Map();
  const feasibleClasses = [];
  let infeasibleClasses = 0;
  for (const candidate of classes.values()) {
    if (exactFeasible(candidate, segment, universe, memo)) feasibleClasses.push(candidate);
    else infeasibleClasses += 1;
  }
  return {
    exactResultClasses: classes.size,
    exactFeasibleClasses: feasibleClasses.length,
    exactInfeasibleClasses: infeasibleClasses,
    exactFrontier: normalizeMinimal64(feasibleClasses),
    classKeys: new Set(classes.keys()),
    feasibleClassKeys: new Set(feasibleClasses.map(key64)),
  };
}

function directExactAuthority(left, right, segment, universe) {
  const memo = new Map();
  const classes = new Map();
  for (const leftEntry of left) for (const rightEntry of right) {
    const candidate = or64(leftEntry.coverage, rightEntry.coverage);
    classes.set(key64(candidate), candidate);
  }
  const feasible = [];
  for (const candidate of classes.values()) if (exactFeasible(candidate, segment, universe, memo)) feasible.push(candidate);
  return {
    exactResultClasses: classes.size,
    exactFeasibleClasses: feasible.length,
    exactFrontier: normalizeMinimal64(feasible),
  };
}

function sortedFrontierKeys(frontier) {
  return frontier.map(key64).sort();
}

function setDifferenceCount(left, right) {
  let count = 0;
  for (const key of left) if (!right.has(key)) count += 1;
  return count;
}

function assertWithinLeash(startedAt) {
  if (Date.now() - startedAt > WALL_CLOCK_LIMIT_MS) throw new Error('certificate-absorption ordering wall-clock leash exceeded');
}

const startedAt = Date.now();
const fixture = createRealCoverage64Fixture();
assert.equal(fixture.totalCandidates, RAW_PAIR_BUDGET, 'qualified fixture raw-pair budget changed');

const generatedAccounting = { value: 0 };
const totals = {
  rawPairs: 0,
  emptyInputLeft: 0,
  emptyInputRight: 0,
  certificatePreRejectedRawPairs: 0,
  preRejectedRawPairsAlreadyRemovedFromResidualProduct: 0,
  preRejectedResidualPairsSurvivingAbsorption: 0,
  baselineAbsorbedRecordEmits: 0,
  baselineResidualPairs: 0,
  baselineGeneratedOperations: 0,
  baselineExactResultClasses: 0,
  baselineExactInfeasibleClasses: 0,
  provenanceSkippedAbsorbedEmits: 0,
  provenanceSkippedResidualPairs: 0,
  provenanceGeneratedOperations: 0,
  provenanceExactResultClasses: 0,
  provenanceExactInfeasibleClasses: 0,
  filteredRawPairs: 0,
  filteredAbsorbedRecordEmits: 0,
  filteredResidualPairs: 0,
  filteredGeneratedOperations: 0,
  filteredExactResultClasses: 0,
  filteredExactInfeasibleClasses: 0,
  baselineFrontierMismatches: 0,
  provenanceFrontierMismatches: 0,
  filteredFrontierMismatches: 0,
  provenanceFeasibleClassLosses: 0,
};
const segmentSummaries = [];

for (const segment of fixture.segments) {
  assertWithinLeash(startedAt);
  const universe = supportUniverse(segment);
  const left = segment.left.map((coverage) => decorateInput(coverage, segment, universe));
  const right = segment.right.map((coverage) => decorateInput(coverage, segment, universe));
  const emptyLeft = left.filter((entry) => entry.infeasible).length;
  const emptyRight = right.filter((entry) => entry.infeasible).length;
  const rawPairs = left.length * right.length;
  const preRejectedRawPairs = rawPairs - (left.length - emptyLeft) * (right.length - emptyRight);

  const baselinePlan = absorptionPlan(left, right);
  const baseline = materializeAbsorption(left, right, baselinePlan, false, generatedAccounting);
  const provenance = materializeAbsorption(left, right, baselinePlan, true, generatedAccounting);

  let invalidResidualPairs = 0;
  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    if (baselinePlan.leftAbsorbed[leftIndex] !== 0) continue;
    for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      if (baselinePlan.rightAbsorbed[rightIndex] !== 0) continue;
      if (left[leftIndex].infeasible || right[rightIndex].infeasible) invalidResidualPairs += 1;
    }
  }
  assert.equal(invalidResidualPairs, provenance.skippedResidualPairs, `${segment.id} residual provenance accounting mismatch`);

  const filteredLeft = left.filter((entry) => !entry.infeasible);
  const filteredRight = right.filter((entry) => !entry.infeasible);
  const filteredPlan = absorptionPlan(filteredLeft, filteredRight);
  const filtered = materializeAbsorption(filteredLeft, filteredRight, filteredPlan, false, generatedAccounting);

  const authority = directExactAuthority(left, right, segment, universe);
  const baselineMetrics = classAndFrontierMetrics(baseline.generated, segment, universe);
  const provenanceMetrics = classAndFrontierMetrics(provenance.generated, segment, universe);
  const filteredMetrics = classAndFrontierMetrics(filtered.generated, segment, universe);
  const authorityKeys = sortedFrontierKeys(authority.exactFrontier);
  const baselineKeys = sortedFrontierKeys(baselineMetrics.exactFrontier);
  const provenanceKeys = sortedFrontierKeys(provenanceMetrics.exactFrontier);
  const filteredKeys = sortedFrontierKeys(filteredMetrics.exactFrontier);

  const baselineMismatch = JSON.stringify(authorityKeys) !== JSON.stringify(baselineKeys);
  const provenanceMismatch = JSON.stringify(authorityKeys) !== JSON.stringify(provenanceKeys);
  const filteredMismatch = JSON.stringify(authorityKeys) !== JSON.stringify(filteredKeys);

  if (baselineMismatch) totals.baselineFrontierMismatches += 1;
  if (provenanceMismatch) totals.provenanceFrontierMismatches += 1;
  if (filteredMismatch) totals.filteredFrontierMismatches += 1;

  const feasibleClassLosses = setDifferenceCount(baselineMetrics.feasibleClassKeys, provenanceMetrics.feasibleClassKeys);
  totals.provenanceFeasibleClassLosses += feasibleClassLosses;

  totals.rawPairs += rawPairs;
  totals.emptyInputLeft += emptyLeft;
  totals.emptyInputRight += emptyRight;
  totals.certificatePreRejectedRawPairs += preRejectedRawPairs;
  totals.preRejectedResidualPairsSurvivingAbsorption += invalidResidualPairs;
  totals.preRejectedRawPairsAlreadyRemovedFromResidualProduct += preRejectedRawPairs - invalidResidualPairs;
  totals.baselineAbsorbedRecordEmits += baseline.absorbedRecordEmits;
  totals.baselineResidualPairs += baseline.remainingPairs;
  totals.baselineGeneratedOperations += baseline.generated.length;
  totals.baselineExactResultClasses += baselineMetrics.exactResultClasses;
  totals.baselineExactInfeasibleClasses += baselineMetrics.exactInfeasibleClasses;
  totals.provenanceSkippedAbsorbedEmits += provenance.skippedAbsorbedEmits;
  totals.provenanceSkippedResidualPairs += provenance.skippedResidualPairs;
  totals.provenanceGeneratedOperations += provenance.generated.length;
  totals.provenanceExactResultClasses += provenanceMetrics.exactResultClasses;
  totals.provenanceExactInfeasibleClasses += provenanceMetrics.exactInfeasibleClasses;
  totals.filteredRawPairs += filteredLeft.length * filteredRight.length;
  totals.filteredAbsorbedRecordEmits += filtered.absorbedRecordEmits;
  totals.filteredResidualPairs += filtered.remainingPairs;
  totals.filteredGeneratedOperations += filtered.generated.length;
  totals.filteredExactResultClasses += filteredMetrics.exactResultClasses;
  totals.filteredExactInfeasibleClasses += filteredMetrics.exactInfeasibleClasses;

  segmentSummaries.push({
    id: segment.id,
    geometry: `${segment.geometry.columns}x${segment.geometry.rows} c${segment.geometry.connect}`,
    support: segment.supportHeights.join(','),
    exactCount: segment.exactCount,
    rawPairs,
    emptyInputLeft: emptyLeft,
    emptyInputRight: emptyRight,
    certificatePreRejectedRawPairs: preRejectedRawPairs,
    preRejectedResidualPairsSurvivingAbsorption: invalidResidualPairs,
    baseline: {
      absorbedRecordEmits: baseline.absorbedRecordEmits,
      residualPairs: baseline.remainingPairs,
      generatedOperations: baseline.generated.length,
      exactResultClasses: baselineMetrics.exactResultClasses,
      exactInfeasibleClasses: baselineMetrics.exactInfeasibleClasses,
      frontierMismatch: baselineMismatch,
    },
    provenancePushdown: {
      skippedAbsorbedEmits: provenance.skippedAbsorbedEmits,
      skippedResidualPairs: provenance.skippedResidualPairs,
      generatedOperations: provenance.generated.length,
      exactResultClasses: provenanceMetrics.exactResultClasses,
      exactInfeasibleClasses: provenanceMetrics.exactInfeasibleClasses,
      feasibleClassLosses,
      frontierMismatch: provenanceMismatch,
    },
    filteredBeforeAbsorption: {
      leftInputs: filteredLeft.length,
      rightInputs: filteredRight.length,
      rawPairs: filteredLeft.length * filteredRight.length,
      absorbedRecordEmits: filtered.absorbedRecordEmits,
      residualPairs: filtered.remainingPairs,
      generatedOperations: filtered.generated.length,
      exactResultClasses: filteredMetrics.exactResultClasses,
      exactInfeasibleClasses: filteredMetrics.exactInfeasibleClasses,
      frontierMismatch: filteredMismatch,
    },
  });
}

assert.equal(totals.rawPairs, RAW_PAIR_BUDGET, 'raw-pair accounting changed');
assert.equal(totals.certificatePreRejectedRawPairs, 1047, 'positive-certificate pre-rejection checkpoint changed');
assert.equal(totals.baselineResidualPairs, 330, 'core-absorption residual-pair checkpoint changed');
assert.equal(totals.baselineAbsorbedRecordEmits, 251, 'core-absorption emit checkpoint changed');
assert.equal(totals.baselineGeneratedOperations, 581, 'core-absorption generated-operation checkpoint changed');
assert.equal(totals.baselineExactResultClasses, 514, 'exact-result quotient checkpoint changed');
assert.equal(totals.baselineFrontierMismatches, 0, 'baseline absorption failed full exact-admissibility authority');
assert.equal(totals.provenanceFrontierMismatches, 0, 'certificate provenance pushdown changed exact-admissibility frontier');
assert.equal(totals.filteredFrontierMismatches, 0, 'filter-before-absorption changed exact-admissibility frontier');
assert.equal(totals.provenanceFeasibleClassLosses, 0, 'certificate provenance pushdown removed an exact-feasible result class');
assert.equal(
  totals.provenanceGeneratedOperations,
  totals.baselineGeneratedOperations - totals.provenanceSkippedAbsorbedEmits - totals.provenanceSkippedResidualPairs,
  'provenance generated-operation accounting drift',
);
assertWithinLeash(startedAt);

const provenanceGeneratedSavings = totals.baselineGeneratedOperations - totals.provenanceGeneratedOperations;
const provenanceClassSavings = totals.baselineExactResultClasses - totals.provenanceExactResultClasses;
const filteredGeneratedSavings = totals.baselineGeneratedOperations - totals.filteredGeneratedOperations;
const filteredClassSavings = totals.baselineExactResultClasses - totals.filteredExactResultClasses;

if (provenanceGeneratedSavings <= 0 && filteredGeneratedSavings <= 0) {
  throw new Error('certificate pruning is fully subsumed by core absorption on captured workloads');
}

const output = {
  schemaVersion: 1,
  kind: 'connect4-bsfp-certificate-absorption-ordering-synthesis',
  attribution: 'Josh Oshiro',
  candidateLaw: 'empty exact completion certificates may be pushed before product materialization and, when inputs are filtered, before recomputing core-relative absorption, provided the same guarded exact-admissibility frontier is preserved',
  totals: {
    ...totals,
    rawCertificatePairReduction: totals.certificatePreRejectedRawPairs / totals.rawPairs,
    rawPreRejectionOverlapWithAbsorption: totals.preRejectedRawPairsAlreadyRemovedFromResidualProduct / totals.certificatePreRejectedRawPairs,
    incrementalResidualPairSavingsAfterAbsorption: totals.preRejectedResidualPairsSurvivingAbsorption,
    incrementalResidualPairSavingsFraction: totals.preRejectedResidualPairsSurvivingAbsorption / totals.baselineResidualPairs,
    provenanceGeneratedSavings,
    provenanceGeneratedSavingsFraction: provenanceGeneratedSavings / totals.baselineGeneratedOperations,
    provenanceClassSavings,
    provenanceClassSavingsFraction: provenanceClassSavings / totals.baselineExactResultClasses,
    filteredGeneratedSavings,
    filteredGeneratedSavingsFraction: filteredGeneratedSavings / totals.baselineGeneratedOperations,
    filteredClassSavings,
    filteredClassSavingsFraction: filteredClassSavings / totals.baselineExactResultClasses,
  },
  interpretationBoundary: {
    provenancePushdown: 'keeps baseline absorption cores/marks but omits absorbed emits sourced by an empty input certificate and residual pairs with any empty input certificate',
    filteredBeforeAbsorption: 'removes exact-infeasible inputs first, recomputes cores and absorption marks on the retained inputs, then materializes and exact-guards results',
    authority: 'full raw Cartesian merge followed by exact minimal-completion feasibility and subset-minimal packed frontier normalization',
  },
  segmentSummaries,
  leashes: {
    wallClockMs: WALL_CLOCK_LIMIT_MS,
    rawPairs: RAW_PAIR_BUDGET,
    generatedOperationsAcrossVariants: GENERATED_OPERATION_BUDGET,
  },
  wallMs: Date.now() - startedAt,
};

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
