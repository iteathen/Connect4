# CPCX Class-C forced-normalization seam diagnostic result 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** positive decomposition; Class C still open  
**Workflow:** `Research CPCX Class-C forced-normalization seam`  
**Run:** `37168307479` — SUCCESS  
**Target:** winner-existence / loser-outcome-equivalence

## Question

Among the Class-C gap-1 rows not covered by the support-release reservation
theorem, how many are already governed by CPCX immediate semantics and
deterministic forced normalization?

## Result

Total retained uncovered rows:

```
247
```

Immediate classification:

```
FORCED_RESPONSE               52
NO_IMMEDIATE_OBLIGATION      177
IMMEDIATE_TERMINAL_AVAILABLE  18
```

Thus 70/247 rows are immediately classified by existing CPCX current-rank
semantics, leaving 177 genuinely non-immediate controller rows.

## Direct P0 terminal rows

All 18 rows with `IMMEDIATE_TERMINAL_AVAILABLE` were independently recognized
by the existing P0 first-win certificate:

```
D6 cohort:  4
G4 cohort: 14
total:     18
```

These are winner-turn OR witnesses and require no reservoir repair search.

## Forced-response rows

All 52 `FORCED_RESPONSE` rows were passed through the unchanged deterministic
operator:

`closeCpcxForcedResponses`.

Result:

```
forced-response rows:                  52
normalization result OPEN:             52
normalization P0 first wins:            0
exact known Class-C node re-entries:   52
```

Breakdown:

```
D6 cohort: 14 forced rows -> 14 OPEN -> 14 exact node re-entries
G4 cohort: 38 forced rows -> 38 OPEN -> 38 exact node re-entries
```

Every forced-normalized boundary therefore lands on a physical state already
present in the finite Class-C reservoir-gap cohort.

No arbitrary P0 response was selected for these rows.

## Important limitation

The normalized states were not themselves certified by the current progress
router:

```
finalProgressKind = NO_CERTIFICATE
```

for all 52.

Therefore exact state re-entry is a valid recurrence edge, but it is not by
itself proof closure.

## Current decomposition of the difficult Class-C gap-1 layer

The present evidence now separates the previously opaque layer into:

1. support-release reservation rows — partially covered by the qualified
   reservation theorem;
2. direct P0 terminal rows — 18 exact winners;
3. deterministic forced-response rows — 52 exact recurrence re-entries;
4. `NO_IMMEDIATE_OBLIGATION` rows — 177 remaining controller states.

The fourth class is now the principal unresolved controller seam.

## Next question

At each of the 177 exact P0-to-move `NO_IMMEDIATE_OBLIGATION` states, use the
existing CPCX structural progress router directly.

The winner-turn rule is existential:

> one qualified structural P0 controller action is enough.

Therefore do not continue constraining the controller to the reservoir
template when another already-qualified CPCX progress theorem applies.

For each state:

1. call `classifyCpcxProgress(...,{player:0})`;
2. if it returns an exact P0 first-win/progress certificate, compose only that
   certified macro;
3. classify the resulting boundary;
4. test exact re-entry and strict structural descent.

No arbitrary legal P0 move enumeration is required.

## Claim boundary

Still unproved:

- closure of the 177 non-immediate rows;
- Class-C first-win theorem;
- all seven sixth-move losses;
- turn-6 outcome equivalence.

Preserved:

- no solved data;
- no oracle;
- no minimax;
- no remoteness;
- no free recursive move traversal;
- production CPC unchanged;
- production solver unchanged.
