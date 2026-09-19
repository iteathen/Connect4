# Rank-34 boundary-only propagation checkpoint

**Date:** 2026-09-18
**Canonical branch:** `research/semantic-quotient`
**Status:** active checkpoint — first direct rank-34 parent qualified, second direct parent next
**Authority effect:** none

## Resume chain

Read:

1. `TWO_SIDED_BOUNDARY_PROPAGATION_CHECKPOINT.md`
2. this file

## First rank-34 target

The first earlier-rank target removes one occupied cell from the same deficient column of the first pathological rank-35 support:

```text
rank 34 parent
    [5,5,5,1,6,6,6]

direct child
    [5,5,5,2,6,6,6]
```

Support-local future residual structure at the rank-34 parent:

```text
distinct residual shapes          17
single-player antichains       1,293
full parent pair domain      1,671,849
```

The complete rank-34..42 residual-superdomain oracle contains:

```text
3,146,565 residual-pair states
```

That oracle was used only for qualification.

## Generator-only construction

The two-sided generator recurrence from the previous checkpoint was propagated from rank 42 through rank 34.

Construction metrics:

```text
fixed-action threshold constructions     616
largest pre-normalization preimage set   120
largest state Upper boundary              61
largest state Lower boundary             119
```

Exact oracle comparisons:

```text
Upper threshold boundaries               240
Upper generator-set mismatches             0

Lower threshold boundaries               240
Lower generator-set mismatches             0

total exact boundary comparisons         480
total mismatches                            0
```

Every rank 34..42 had zero mismatches.

## Significance

This is the first qualified propagation step earlier than the previously unclosed standard-7x6 rank 35.

The construction did not use:

- distributed universal proof conjunction;
- ownership-mask proof products;
- legal-q census construction;
- parent residual-pair value enumeration.

The 3.15M-state pair oracle was separate and served only as a falsifier.

The generator-only boundary widths did not increase materially at this first rank-34 step.

## Next executable step

Run the analogous direct rank-34 parent of the second pathological support:

```text
[5,5,1,5,6,6,6]
    -> [5,5,2,5,6,6,6]
```

Known pre-run geometry:

```text
residual shapes              17
single-player antichains  1,319
rank-34 pair domain      1,739,761
future-cone pair oracle  3,305,845
```

After that, checkpoint again before widening to the remaining rank-34 predecessor supports.

## Current disposition

```text
rank-35 pathological wall bypassed          YES on value-boundary path
first rank-34 parent boundary propagation   480/480 exact
largest preimage candidates                 120
rank-34 second direct parent                NEXT
root solved                                 NO
```
