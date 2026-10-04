# CPCX Class-C shared acquisition-block discharge diagnostic result 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** exact structural coincidence confirmed; narrow safe subset only  
**Workflow:** `Research CPCX Class-C shared acquisition-block discharge`  
**Run:** `37169076054` — SUCCESS

## Question

For the 620 Class-C acquisition attempts rejected by:

`SUPPLY_CREATES_OPPONENT_IMMEDIATE_SINGLETON`,

is the newly urgent P1 singleton on exactly the already-selected P0 acquisition
target?

## Result A — shared-cell coincidence is exact

Yes.

```
rejected seam attempts:       620
shared-cell candidates:       620
non-shared candidates:          0
```

Every one of the 620 failures had:

```
urgent P1 singleton cell = planned P0 acquisition target
```

Targets:

```
C2: 544
B4:  76
```

This is a real shared physical discharge geometry, not an analogy.

## Result B — shared occupancy is not generally sufficient

After executing the already-planned P0 target event under exact first-win and
cofactor guards:

```
locally safe shared discharges:       38
protected residual not acquired:     310
another P1 singleton remains:        272
```

Thus the broad relaxation is falsified.

The 272 `POST_SHARED_DISCHARGE_P1_SINGLETON` cases are genuinely unsafe:
after P0 has moved, P1 is to move with an immediate P1 terminal available.

The 310 `PROTECTED_RESIDUAL_NOT_ACQUIRED` cases fail the owner-side
acquisition claim itself, usually because the opponent SUPPLY event has already
altered/killed the selected protected residual.

## Safe subset

All 38 locally safe rows use target:

```
B4
```

Breakdown:

```
D6 cohort: 18 rows / 9 distinct controller states
G4 cohort: 20 rows / 11 distinct controller states
```

Pinned P0 actions are drawn from:

```
E6, F6, G5, G6
```

All 38 normalize to an open boundary, with 0 or 1 deterministic forced-response
steps.

The current generic progress and first-win routers still return:

```
NO_CERTIFICATE
```

on every resulting boundary.

## Interpretation

The exact coincidence establishes a reusable structural fact:

> in this Class-C layer, the opponent SUPPLY event that blocks ordinary
> acquisition does so by creating an urgent singleton on precisely the
> acquisition cell.

But only a small subset supports a safe shared acquire-and-block event.

Therefore:

- do not weaken the qualified acquisition theorem globally;
- do not treat shared-cell coincidence as a win certificate;
- the 38 safe rows are candidate theorem instances for a separately frozen
  shared-discharge theorem if needed.

## Next recurrence experiment

Before adding that new theorem, test whether the already-qualified structural
pieces are sufficient when composed in one stateful RCIC:

- original target-reservoir response options;
- direct P0 first wins;
- exact forced-response normalization;
- qualified support-release response reservations;
- exact reservation discharge.

Represent reservation as theorem state, not as a scalar coordinate.

Solve the resulting finite rank-increasing proof DAG bottom-up.

This uses no unqualified shared-acquisition edge.

## Claim boundary

No Class-C closure or turn-6 equivalence is claimed by this diagnostic.
