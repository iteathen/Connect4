# CPCX Class-C response-totality repair result 0.1

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** capacity-descent falsifier preserved; Class C remains open  
**Target:** winner-existence / loser-outcome-equivalence

## Question

Can the final Class-C reservoir-gap seam be closed without adding any response
class by extending the existing well-founded reservoir obstruction descriptor
with remaining physical capacity as its final lexicographic tiebreaker?

## Frozen candidate

The tested descriptor was:

```
(
  minimumUncoveredResiduals,
  uncoveredMissingCellMass,
  uncoveredSupportDebtSum,
  uncoveredSupportDebtMax,
  descendingSupportDebtVector,
  remainingCapacity
)
```

The response set was unchanged.

## Root localization before the test

For both strongest Class-C candidates, the exact current P1 event `B3` was
the first visible response-totality blocker.

### D6 candidate

After the Class-C forcing macro and P0 `D6`:

```
rank = 25
support = [6,2,0,6,3,5,3]
target = C3
root gap = 2
```

The uncovered opponent structure included:

- `B2-C2-D2-E2`, singleton target `C2`;
- `G2-G3-G4-G5`, missing `G4,G5`.

For P1 `B3`, the existing partial reservoir template already prescribed P0
`B4`. That child preserved the complete original obstruction descriptor and
was rejected only because the old descriptor did not strictly decrease.

### G4 candidate

After P0 `G4`:

```
rank = 25
support = [6,2,0,5,3,5,4]
target = C3
root gap = 2
```

The uncovered opponent structure included:

- `B2-C2-D2-E2`, singleton target `C2`;
- `D6-E5-F4-G3`, missing `D6,E5`.

Again P1 `B3` followed by the existing template response P0 `B4` preserved
the obstruction descriptor while consuming two physical events.

## Result

The capacity tiebreak admits those neutral/stuttering transitions as strict
descent, but it does **not** close the proof graph.

### D6 -> C3

```
kind = NO_CERTIFICATE
seam = COVERAGE_REPAIR_RESPONSE_TOTALITY_FAILURE
rootGap = 2
nodeCount = 244
certifiedNodeCount = 0
unresolvedNodeCount = 244
```

### G4 -> C3

```
kind = NO_CERTIFICATE
seam = COVERAGE_REPAIR_RESPONSE_TOTALITY_FAILURE
rootGap = 2
nodeCount = 674
certifiedNodeCount = 0
unresolvedNodeCount = 674
```

A second non-Class-C G4 occurrence also remained unresolved:

```
nodeCount = 277
certifiedNodeCount = 0
```

The isolated comparison workflow completed successfully. Workflow success is
only execution evidence; the theorem result is the negative certificate status
above.

## Stronger diagnostic consequence

The expanded cohort exposes exact lower-gap states where P1 has a genuine
first-terminal move.

The recurring important hazard is the horizontal residual:

```
B2-C2-D2-E2
```

with P1 singleton target:

```
C2
```

At many gap-1 descendants this target becomes current frontier and exact
P1:C2 is terminal for P1.

Therefore the Class-C obstruction is not repaired by a more permissive
well-founded rank. First-win precedence is genuinely load-bearing.

The capacity experiment must remain falsified.

## Interpretation

The missing theorem is now more specific:

> before the latent P1 `C2` singleton is released into an immediate
> first-terminal event, the P0 recurrence needs an exact response-capacity or
> support-release mechanism that reserves its discharge while preserving the
> P0 claim.

This is consistent with the already-qualified CPCX
support-release-response-neutralization theorem, but that theorem has **not**
yet been composed into this RCIC.

No such composition is claimed by this checkpoint.

## Next frozen question

Test the already-qualified support-release response theorem directly on the
exact Class-C gap-1 states that carry the latent `C2` singleton at support
distance one.

The diagnostic must ask only whether an already-admitted/current P0 structural
event can pin a valid reservation:

```
P1 supplies support(C2) -> P0 occupies C2
```

under all existing first-win guards.

Do not add a new arbitrary response class before this exact compatibility test.

## Claim boundary

Still unproved:

- Class-C P0 first-win closure;
- global CPCX recurrence closure;
- P0 first win after every sixth action from `44444`;
- turn-6 P1 move outcome equivalence.

Preserved constraints:

- no solved values;
- no oracle;
- no best-move labels;
- no minimax / negamax / alpha-beta;
- no remoteness;
- no arbitrary future legal-move search;
- production CPC unchanged;
- production solver unchanged.
