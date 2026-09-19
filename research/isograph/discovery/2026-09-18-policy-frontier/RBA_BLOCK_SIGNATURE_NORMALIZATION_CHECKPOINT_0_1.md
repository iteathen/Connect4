# RBA block-signature normalization refinement checkpoint 0.1

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** exact evaluation-law refinement + real rank27 product qualification  
**Authority effect:** none  
**Research direction:** Josh Oshiro

## Trigger

The rank27 `win15` checkpoint observed that an alternate first Lower product

```text
30,387 x 20,096
= 610,657,152 raw pair opportunities
```

did not close under the then-selected flat/global normalization path, despite being smaller than the qualified first product.

That observation was real, but the initial interpretation was too broad. The wall was not intrinsic to the factor pair.

The product was decomposed into:

```text
exact local projection skylines
-> union of local candidates
-> exact global maximalization
```

and each phase was measured separately.

## Exact block-signature superset index

For subset-maximal normalization, process distinct candidates in non-increasing popcount order.

Maintain the already accepted generators `G`.

Partition the transformed q bits into small fixed blocks. For every accepted generator `g`, store its exact block signature in one bucket per block.

For a query candidate `q`, any possible dominating generator must satisfy:

```text
g superset_eq q
```

and therefore, for **every** block `B`:

```text
sig_B(g) superset_eq sig_B(q).
```

For each available block:

1. enumerate all block signatures that are supersets of `sig_B(q)`;
2. sum their current bucket populations;
3. choose the block with the smallest exact candidate population;
4. inspect only generators in those buckets;
5. accept dominance only after the full 76-bit exact superset test.

This cannot omit a true global superset, because every true superset belongs to one of the enumerated superset-signature buckets for **any** chosen block.

It cannot create a false dominance result, because bucket membership is only an index filter and the complete transformed mask is checked before rejection.

Therefore the index changes query cost only; maximal-antichain semantics are unchanged.

## Real product — action 0 x action 2

Rank27 `win15` fixed-action Lower factors:

```text
factor 0   30,387
factor 2   20,096
raw pairs 610,657,152
```

The exact projection-tree local phase was split into two disjoint outer ranges.

### Outer 0..19,999

```text
local candidates    2,327,296
inner leaf scans      169,597,191
tree nodes visited     16,592,192
local query time          28.882 s
```

### Outer 20,000..30,386

```text
local candidates      534,899
inner leaf scans       72,830,035
tree nodes visited      7,427,885
local query time           9.448 s
```

### Complete local union

```text
local candidates      2,862,195
leaf scans              242,427,226
tree nodes visited       24,020,077
local query time            ~38.33 s
```

The local phase is therefore not the earlier >420-second wall.

## Exact global maximalization

Complete local union:

```text
candidate occurrences  2,862,195
distinct candidates     2,170,447
exact maximal output      143,550
```

Block-signature normalization:

```text
sort/deduplicate            ~0.77 s
maximalization             ~18.59 s
total normalization         ~19.36 s
peak RSS                    ~57 MiB
```

So the complete exact product closes in approximately:

```text
38.33 s local projection
+19.36 s exact normalization
~=57.7 s
```

instead of failing the bounded flat/old-index paths.

## Differential qualification

A real 100,000-candidate prefix from the same product was normalized independently by:

1. the existing exact `normalizeQ(..., wantMax=true)` implementation;
2. the new block-signature index.

Result:

```text
old exact normalizer       26,078 generators
block-signature normalizer 26,078 generators
exact generator-set match     YES
combined differential time    ~0.39 s
```

The full block-signature result also re-normalizes as an exact maximal antichain under the governing transformed subset order.

## Correction to the factor-order interpretation

The earlier observation remains useful:

```text
smaller raw product
!=
automatically cheaper under one fixed evaluator
```

But the stronger claim:

```text
0 x 2 is intrinsically a bad factor order
```

is **not supported**.

The refined conclusion is:

> Semiring evaluation cost depends jointly on factor order, operand orientation, local projection evaluator, and global antichain normalizer.

For the same exact product:

```text
flat/direct local + old global path      bounded failure
projection-tree local + old global path  bounded failure
projection-tree local + block global     closes exactly
```

Thus an evaluation planner must choose a **pipeline**, not just a factor ordering.

## Why the small sample was misleading

A deterministic 64- and 1,024-outer projection sample predicted that local projection for `0 -> 2` should be affordable.

That prediction was correct for the local phase.

The product still timed out because the old global maximalizer consumed the local-candidate union inefficiently.

Therefore the sampling failure was not primarily a local-query heavy-tail failure. It was an objective mismatch: sampled local-query economics were being used to predict a pipeline whose dominant cost had shifted to global normalization.

## Refined cost decomposition

For exact product `A times B`, track separately:

```text
Q(A,B)
    local restricted-image query work

C(A,B)
    local skyline candidate occurrences

D(A,B)
    distinct candidate count

M(A,B)
    maximal/minimal antichain normalization work

O(A,B)
    exact output width
```

No single one is a sufficient cost law.

A useful evaluator/planner must estimate the active bottleneck among these phases and choose:

- orientation;
- factor order;
- local projection method;
- global normalization index.

## Genericity boundary

The block-signature index is generic fixed-width set-order machinery.

Connect4 owns:

- transformed residual/value semantics;
- which antichain is Upper versus Lower;
- Bellman factor meaning;
- correctness qualification.

The block-signature superset-query/maximalization mechanism itself does not depend on Connect4 semantics and may eventually belong in CUDA-Algorithms if a reusable implementation is justified.

Do not move it merely because Connect4 discovered it first.

## Next

Before rank26 descent:

1. qualify the block-signature normalizer on additional real Lower products and the minimal-antichain dual;
2. test whether an adaptive product pipeline can reproduce the qualified `win15` final stream with substantially less work;
3. derive a planner objective that estimates both local projection and global normalization pressure.

Frozen authority 1.1 remains unchanged. The proof/value bridge remains a separate OPEN side seam.
