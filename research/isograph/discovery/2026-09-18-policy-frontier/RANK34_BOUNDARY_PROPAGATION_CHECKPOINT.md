# Rank-34 boundary-only propagation checkpoint

**Date:** 2026-09-18
**Canonical branch:** `research/semantic-quotient`
**Status:** both direct rank-34 parents qualified exactly; widening to the remaining rank-34 predecessor supports
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

## Second rank-34 target

The analogous parent of the second pathological support was then qualified:

```text
rank 34 parent
    [5,5,1,5,6,6,6]

direct child
    [5,5,2,5,6,6,6]

distinct residual shapes          17
single-player antichains       1,319
rank-34 pair domain          1,739,761
complete rank-34..42 oracle  3,305,845
```

Generator-only construction:

```text
fixed-action threshold constructions     616
largest pre-normalization preimage set   100
largest state Upper boundary              55
largest state Lower boundary              99
```

Exact oracle comparison:

```text
Upper boundaries        240 / 240 exact
Lower boundaries        240 / 240 exact
total mismatches                  0
```

## Combined direct rank-34 result

```text
direct pathological-parent cones             2
Upper boundary comparisons                  480
Lower boundary comparisons                  480
total exact boundary comparisons            960
total generator-set mismatches                0
largest preimage candidate set              120
largest Upper boundary                       61
largest Lower boundary                      119
```

## Next executable step

Widen across the remaining rank-34 predecessors of the two pathological supports.

Observed single-player domain sizes range from roughly 1.3k to 6.6k antichains. The largest identified immediate predecessor is:

```text
[5,5,2,4,6,6,6]
    residual shapes             20
    antichains/player         6,556
    full pair domain     42,981,136
```

Do **not** build that 43M-state pair oracle merely for reassurance.

First run the generator-only construction itself and measure:

- single-player implication-poset cost;
- boundary widths;
- preimage candidate widths;
- time/memory.

Use a full pair oracle only on rank-34 cases where it remains a proportionate independent falsifier.

Stop if the single-player antichain/implication coordinate becomes the new wall.

## Current disposition

```text
rank-35 pathological wall bypassed              YES on value-boundary path
direct rank-34 parent #1                        480/480 exact
direct rank-34 parent #2                        480/480 exact
combined direct rank-34 qualification           960/960 exact
largest preimage candidates                     120
remaining rank-34 predecessor census            NEXT
root solved                                     NO
```
