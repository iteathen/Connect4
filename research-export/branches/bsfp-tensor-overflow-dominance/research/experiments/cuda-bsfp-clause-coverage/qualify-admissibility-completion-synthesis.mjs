#!/usr/bin/env node

import assert from 'node:assert/strict';
import { createRealCoverage64Fixture } from './real-fixture.mjs';

const WALL_CLOCK_LIMIT_MS = 30_000;
const RAW_PAIR_BUDGET = 4_176;
const ANCHOR_SUBSET_CHECK_BUDGET = 1_500_000;

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

function recordFromCoverage(coverage, dictionary) {
  const covered = [];
  for (let id = 0; id < dictionary.length; id += 1) {
    if (coverageHas(coverage, id)) covered.push(dictionary[id] >>> 0);
  }
  covered.sort((left, right) => popcount(left) - popcount(right) || left - right);
  const minimal = [];
  outer: for (const clause of covered) {
    for (const retained of minimal) if (subset(retained, clause)) continue outer;
    minimal.push(clause >>> 0);
  }
  return minimal;
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

function cheapGuardKeep(record, universe, exactCount) {
  const { forced, residual } = forcedAndResidual(record);
  const forcedCount = popcount(forced);
  if (forcedCount > exactCount) return false;
  if (residual.length === 0) return true;
  const budget = exactCount - forcedCount;
  if (budget === 0) return false;
  if (budget !== 1) return true;
  let common = (universe & ~forced) >>> 0;
  for (const clause of residual) common = (common & clause) >>> 0;
  return common !== 0;
}

function hitAllWithinTwo(residual, available) {
  if (residual.length === 0) return true;
  const selectable = bits(available);
  for (const first of selectable) {
    let all = true;
    for (const clause of residual) if ((clause & first) === 0) { all = false; break; }
    if (all) return true;
  }
  for (let left = 0; left < selectable.length; left += 1) {
    for (let right = left + 1; right < selectable.length; right += 1) {
      const pair = (selectable[left] | selectable[right]) >>> 0;
      let all = true;
      for (const clause of residual) if ((clause & pair) === 0) { all = false; break; }
      if (all) return true;
    }
  }
  return false;
}

function budgetTwoGuardKeep(record, universe, exactCount) {
  const { forced, residual } = forcedAndResidual(record);
  const forcedCount = popcount(forced);
  if (forcedCount > exactCount) return false;
  if (residual.length === 0) return true;
  const budget = exactCount - forcedCount;
  if (budget === 0) return false;
  if (budget === 1) {
    let common = (universe & ~forced) >>> 0;
    for (const clause of residual) common = (common & clause) >>> 0;
    return common !== 0;
  }
  if (budget === 2) return hitAllWithinTwo(residual, (universe & ~forced) >>> 0);
  return true;
}

function completionKey(completions) {
  return completions.map((mask) => (mask >>> 0).toString(16)).join('.');
}

function bruteMinimalCompletions(record, universe, exactCount, counter) {
  const satisfying = [];
  for (let mask = universe >>> 0; ; mask = ((mask - 1) & universe) >>> 0) {
    counter.value += 1;
    if (counter.value > ANCHOR_SUBSET_CHECK_BUDGET) throw new Error('anchor subset-check budget exceeded');
    if (popcount(mask) <= exactCount && recordSatisfied(record, mask)) satisfying.push(mask >>> 0);
    if (mask === 0) break;
  }
  return normalizeMinimalMasks(satisfying);
}

function exactAssignments(universe, exactCount, counter) {
  const result = [];
  for (let mask = universe >>> 0; ; mask = ((mask - 1) & universe) >>> 0) {
    counter.value += 1;
    if (counter.value > ANCHOR_SUBSET_CHECK_BUDGET) throw new Error('anchor subset-check budget exceeded');
    if (popcount(mask) === exactCount) result.push(mask >>> 0);
    if (mask === 0) break;
  }
  return result;
}

function assertWithinLeash(startedAt) {
  if (Date.now() - startedAt > WALL_CLOCK_LIMIT_MS) throw new Error('admissibility completion wall-clock leash exceeded');
}

const startedAt = Date.now();
const fixture = createRealCoverage64Fixture();
assert.equal(fixture.totalCandidates, RAW_PAIR_BUDGET, 'qualified real-workload pair budget changed');

let rawPairs = 0;
let exactCoverageClasses = 0;
let exactInfeasibleClasses = 0;
let exactInfeasibleOccurrences = 0;
let cheapRejectedClasses = 0;
let cheapRejectedOccurrences = 0;
let cheapFalseRejects = 0;
let cheapMissedInfeasibleClasses = 0;
let cheapMissedInfeasibleOccurrences = 0;
let budgetTwoAdditionalRejectedClasses = 0;
let budgetTwoAdditionalRejectedOccurrences = 0;
let budgetTwoFalseRejects = 0;
let budgetTwoMissedInfeasibleClasses = 0;
let budgetTwoMissedInfeasibleOccurrences = 0;
let budgetLeOneExactnessCases = 0;
let budgetLeOneExactnessMismatches = 0;
let budgetLeTwoExactnessCases = 0;
let budgetLeTwoExactnessMismatches = 0;
let feasibleCoverageClasses = 0;
let feasibleCompletionClasses = 0;
let feasibleCoverageClassesCollapsedByCompletionIdentity = 0;
let completionIdentityCollisionClasses = 0;
let inversionMismatches = 0;
const segmentSummaries = [];
let anchor = null;

for (const segment of fixture.segments) {
  assertWithinLeash(startedAt);
  const universe = supportUniverse(segment);
  const dictionary = segment.dictionary.clauses;
  const candidates = new Map();

  for (const left of segment.left) for (const right of segment.right) {
    const coverage = orCoverage(left, right);
    const key = coverageKey(coverage);
    let entry = candidates.get(key);
    if (entry === undefined) {
      const record = recordFromCoverage(coverage, dictionary);
      const recovered = coverageFromRecord(record, dictionary);
      if (coverageKey(recovered) !== key) inversionMismatches += 1;
      entry = { coverage, record, occurrences: 0 };
      candidates.set(key, entry);
    }
    entry.occurrences += 1;
    rawPairs += 1;
  }

  const completionClasses = new Map();
  let segmentExactInfeasible = 0;
  let segmentCheapRejected = 0;
  let segmentBudgetTwoExtra = 0;

  for (const [key, entry] of candidates) {
    const completions = boundedMinimalCompletions(entry.record, universe, segment.exactCount);
    const feasible = completions.length !== 0;
    const cheapKeep = cheapGuardKeep(entry.record, universe, segment.exactCount);
    const budgetTwoKeep = budgetTwoGuardKeep(entry.record, universe, segment.exactCount);
    const { forced, residual } = forcedAndResidual(entry.record);
    const remainingBudget = segment.exactCount - popcount(forced);

    exactCoverageClasses += 1;
    if (!feasible) {
      exactInfeasibleClasses += 1;
      exactInfeasibleOccurrences += entry.occurrences;
      segmentExactInfeasible += 1;
    }
    if (!cheapKeep) {
      cheapRejectedClasses += 1;
      cheapRejectedOccurrences += entry.occurrences;
      segmentCheapRejected += 1;
      if (feasible) cheapFalseRejects += 1;
    } else if (!feasible) {
      cheapMissedInfeasibleClasses += 1;
      cheapMissedInfeasibleOccurrences += entry.occurrences;
    }
    if (!budgetTwoKeep && cheapKeep) {
      budgetTwoAdditionalRejectedClasses += 1;
      budgetTwoAdditionalRejectedOccurrences += entry.occurrences;
      segmentBudgetTwoExtra += 1;
    }
    if (!budgetTwoKeep && feasible) budgetTwoFalseRejects += 1;
    if (budgetTwoKeep && !feasible) {
      budgetTwoMissedInfeasibleClasses += 1;
      budgetTwoMissedInfeasibleOccurrences += entry.occurrences;
    }

    if (remainingBudget >= 0 && remainingBudget <= 1) {
      budgetLeOneExactnessCases += 1;
      if (cheapKeep !== feasible) budgetLeOneExactnessMismatches += 1;
    }
    if (remainingBudget >= 0 && remainingBudget <= 2) {
      budgetLeTwoExactnessCases += 1;
      if (budgetTwoKeep !== feasible) budgetLeTwoExactnessMismatches += 1;
    }

    if (feasible) {
      feasibleCoverageClasses += 1;
      const semanticKey = completionKey(completions);
      let identities = completionClasses.get(semanticKey);
      if (identities === undefined) {
        identities = new Set();
        completionClasses.set(semanticKey, identities);
      }
      identities.add(key);
    }

    entry.completions = completions;
  }

  feasibleCompletionClasses += completionClasses.size;
  for (const identities of completionClasses.values()) {
    if (identities.size <= 1) continue;
    completionIdentityCollisionClasses += 1;
    feasibleCoverageClassesCollapsedByCompletionIdentity += identities.size - 1;
  }

  const summary = {
    id: segment.id,
    geometry: `${segment.geometry.columns}x${segment.geometry.rows} c${segment.geometry.connect}`,
    support: segment.supportHeights.join(','),
    rank: segment.rank,
    exactCount: segment.exactCount,
    rawPairs: segment.left.length * segment.right.length,
    exactCoverageClasses: candidates.size,
    exactInfeasibleClasses: segmentExactInfeasible,
    cheapRejectedClasses: segmentCheapRejected,
    budgetTwoAdditionalRejectedClasses: segmentBudgetTwoExtra,
    feasibleCompletionClasses: completionClasses.size,
  };
  segmentSummaries.push(summary);

  if (
    segment.geometry.columns === 5
    && segment.geometry.rows === 4
    && segment.geometry.connect === 4
    && segment.rank === 11
    && segment.beneficiary === 0
    && segment.supportHeights.join(',') === '3,1,1,3,3'
  ) {
    anchor = { segment, universe, candidates };
  }
}

assert.equal(rawPairs, RAW_PAIR_BUDGET, 'raw pair accounting changed');
assert.equal(inversionMismatches, 0, 'coverage-to-clause inversion was not exact');
assert(anchor, 'qualified 32x19=608 anchor not found');
assert.equal(anchor.segment.left.length, 32);
assert.equal(anchor.segment.right.length, 19);
assert.equal(anchor.segment.rawPairs, 608);

const bruteCounter = { value: 0 };
const anchorAssignments = exactAssignments(anchor.universe, anchor.segment.exactCount, bruteCounter);
let anchorCompletionMismatches = 0;
let anchorExactSliceMismatches = 0;
let anchorFeasibilityMismatches = 0;
let anchorCompletionIdentitySliceMismatches = 0;
const anchorSemanticClasses = new Map();

for (const [coverageIdentity, entry] of anchor.candidates) {
  assertWithinLeash(startedAt);
  const brute = bruteMinimalCompletions(entry.record, anchor.universe, anchor.segment.exactCount, bruteCounter);
  const viaTransversal = entry.completions;
  if (completionKey(brute) !== completionKey(viaTransversal)) anchorCompletionMismatches += 1;

  const anyExact = anchorAssignments.some((assignment) => recordSatisfied(entry.record, assignment));
  if (anyExact !== (viaTransversal.length !== 0)) anchorFeasibilityMismatches += 1;

  for (const assignment of anchorAssignments) {
    const direct = recordSatisfied(entry.record, assignment);
    const fromCompletion = viaTransversal.some((completion) => subset(completion, assignment));
    if (direct !== fromCompletion) anchorExactSliceMismatches += 1;
  }

  const semanticIdentity = completionKey(viaTransversal);
  let group = anchorSemanticClasses.get(semanticIdentity);
  if (group === undefined) {
    group = [];
    anchorSemanticClasses.set(semanticIdentity, group);
  }
  group.push({ coverageIdentity, entry });
}

for (const group of anchorSemanticClasses.values()) {
  if (group.length <= 1) continue;
  const reference = group[0].entry.record;
  for (let index = 1; index < group.length; index += 1) {
    const candidate = group[index].entry.record;
    for (const assignment of anchorAssignments) {
      if (recordSatisfied(reference, assignment) !== recordSatisfied(candidate, assignment)) {
        anchorCompletionIdentitySliceMismatches += 1;
      }
    }
  }
}

assert.equal(anchorCompletionMismatches, 0, 'minimal-transversal completion disagreed with brute-force minimal completions');
assert.equal(anchorFeasibilityMismatches, 0, 'completion non-emptiness disagreed with exact-cardinality feasibility');
assert.equal(anchorExactSliceMismatches, 0, 'completion antichain did not reconstruct exact-cardinality semantics');
assert.equal(anchorCompletionIdentitySliceMismatches, 0, 'completion identity merged different exact-cardinality semantics');
assert.equal(cheapFalseRejects, 0, 'existing cheap guard rejected a realizable record');
assert.equal(budgetTwoFalseRejects, 0, 'budget-two extension rejected a realizable record');
assert.equal(budgetLeOneExactnessMismatches, 0, 'existing budget-0/1 guard was not exact where it claims complete bounded search');
assert.equal(budgetLeTwoExactnessMismatches, 0, 'budget-two extension was not exact for remaining budget <=2');
assertWithinLeash(startedAt);

const output = {
  schemaVersion: 1,
  kind: 'connect4-bsfp-admissibility-completion-synthesis',
  attribution: 'Josh Oshiro',
  candidateLaw: 'positive monotone admissibility is represented by the antichain of minimal admissible completions; exact rejection is emptiness, current cheap legal-slice guards are bounded-depth emptiness certificates, and direct realizability completion returns the antichain itself',
  fixture: {
    segments: fixture.segments.length,
    rawPairs,
    exactCoverageClasses,
    inversionMismatches,
  },
  exactCompletion: {
    exactInfeasibleClasses,
    exactInfeasibleOccurrences,
    feasibleCoverageClasses,
    feasibleCompletionClasses,
    completionIdentityCollisionClasses,
    feasibleCoverageClassesCollapsedByCompletionIdentity,
  },
  currentCheapGuard: {
    rejectedClasses: cheapRejectedClasses,
    rejectedOccurrences: cheapRejectedOccurrences,
    falseRejects: cheapFalseRejects,
    missedExactInfeasibleClasses: cheapMissedInfeasibleClasses,
    missedExactInfeasibleOccurrences: cheapMissedInfeasibleOccurrences,
    remainingBudgetLeOneCases: budgetLeOneExactnessCases,
    remainingBudgetLeOneMismatches: budgetLeOneExactnessMismatches,
  },
  budgetTwoExtension: {
    additionalRejectedClasses: budgetTwoAdditionalRejectedClasses,
    additionalRejectedOccurrences: budgetTwoAdditionalRejectedOccurrences,
    falseRejects: budgetTwoFalseRejects,
    missedExactInfeasibleClasses: budgetTwoMissedInfeasibleClasses,
    missedExactInfeasibleOccurrences: budgetTwoMissedInfeasibleOccurrences,
    remainingBudgetLeTwoCases: budgetLeTwoExactnessCases,
    remainingBudgetLeTwoMismatches: budgetLeTwoExactnessMismatches,
  },
  anchor: {
    support: anchor.segment.supportHeights.join(','),
    rawPairs: anchor.segment.rawPairs,
    exactCoverageClasses: anchor.candidates.size,
    exactAssignments: anchorAssignments.length,
    bruteSubsetChecks: bruteCounter.value,
    minimalCompletionMismatches: anchorCompletionMismatches,
    feasibilityMismatches: anchorFeasibilityMismatches,
    exactSliceMismatches: anchorExactSliceMismatches,
    completionIdentitySliceMismatches: anchorCompletionIdentitySliceMismatches,
    completionIdentityClasses: anchorSemanticClasses.size,
  },
  segmentSummaries,
  leashes: {
    wallClockMs: WALL_CLOCK_LIMIT_MS,
    rawPairs: RAW_PAIR_BUDGET,
    anchorSubsetChecks: ANCHOR_SUBSET_CHECK_BUDGET,
  },
  wallMs: Date.now() - startedAt,
};

if (budgetTwoAdditionalRejectedOccurrences === 0 && feasibleCoverageClassesCollapsedByCompletionIdentity === 0) {
  throw new Error('synthesis predicted no new work elimination or shared identity on the bounded real workload');
}

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
