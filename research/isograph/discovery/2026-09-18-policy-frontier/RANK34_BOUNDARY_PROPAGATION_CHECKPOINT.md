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


## Sparse single-coordinate implementation validation

Before widening to the largest rank-34 coordinate domain, the dense pair-free boundary construction was rewritten so it no longer allocates an n x n player-pair table.

For rank-34/near-terminal testing it uses exact monotone-function signatures over the at-most-eight future cells only as a fast implication comparator; the semantic objects remain the residual antichains.

The sparse implementation was replayed on the already oracle-qualified parent:

```text
[5,5,5,1,6,6,6]

sparse Upper root boundaries == qualified dense boundaries   YES
sparse Lower root boundaries == qualified dense boundaries   YES

largest action candidates   120
largest Upper                61
largest Lower               119
```

Thus the sparse code path reproduces the prior exact result before being used on larger coordinate domains.

## Largest immediate rank-34 predecessor tested

Target:

```text
[5,5,2,4,6,6,6]
```

Geometry/domain size:

```text
residual shapes                    20
single-player antichains        6,556

full parent pair domain
if explicitly enumerated   42,981,136
```

The full pair oracle was deliberately **not** built.

Sparse generator-only construction over its complete rank-34..42 future cone:

```text
supports                                60
largest single-player antichain set  6,556
largest action preimage candidate set   536
largest state Upper boundary            359
largest state Lower boundary            372
largest distinct dual active patterns 1,673
bounded prototype elapsed              ~26.6 s
```

Root rank-34 boundary widths:

```text
Upper:
    loss2      1
    loss4      8
    loss6     28
    loss8    102
    draw8    359
    win7     150
    win5      44
    win3       5
    win1       4

Lower:
    loss2      8
    loss4     29
    loss6     98
    loss8    203
    draw8    213
    win7      83
    win5       6
    win3       1
    win1       1
```

### Disposition

This is not independently pair-oracle-qualified at the 43M parent domain.

It is, however, produced by the same sparse boundary implementation that exactly reproduced the already-qualified rank-34 parent, and it exercises the current largest immediate single-coordinate domain.

The next observed scaling pressure has therefore moved from player-pair/product materialization to:

```text
single-player residual-antichain coordinate size
+
dual-boundary active-pattern count.
```

That pressure is measurable but has not yet become a wall at rank 34.

## Updated next executable step

Run the sparse generator-only recurrence across the remaining rank-34 predecessor supports and record the envelope:

```text
max antichains/player
max action-preimage candidates
max Upper width
max Lower width
max dual active-pattern count
time
```

Do not construct large pair oracles.

If the rank-34 envelope remains bounded, move one structurally informative case to rank 33 and identify whether the first true new wall is:

1. single-player antichain count;
2. dual-complement pattern count;
3. action preimage width;
4. threshold boundary width.

Current breadcrumb:

```text
largest rank-34 coordinate case tested
    [5,5,2,4,6,6,6]

result
    CLOSED by sparse generator-only recurrence

next
    rank34_sparse_predecessor_envelope
```
