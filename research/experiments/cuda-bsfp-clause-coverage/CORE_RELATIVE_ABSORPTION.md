# Core-relative cross-frontier absorption

**Status:** exact generalization of cross-frontier absorption with bounded real rank-22 evidence. Awaiting complete-control recurrence qualification before production consideration.

**Research direction:** Josh Oshiro.

## Generalized law

Let `A` and `B` be subset-antichain frontiers and let the universal product be

```text
P = { a union b | a in A, b in B }.
```

Define the mandatory cores

```text
coreA = intersection of all a in A
coreB = intersection of all b in B.
```

For a fixed row `a in A`, every product in that row contains

```text
a union coreB.
```

If there exists some witness `b0 in B` such that

```text
b0 subseteq (a union coreB),
```

then, because `coreB subseteq b0`, we have

```text
a union b0 = a union coreB.
```

That product is the intersection/lower bound of every product in row `a`, hence it is a real product occurrence and dominates the entire row. The row may therefore be replaced by the single record

```text
a union coreB.
```

Dually, a column `b in B` collapses whenever some `a0 in A` satisfies

```text
a0 subseteq (b union coreA),
```

and the column may then be replaced by

```text
b union coreA.
```

The earlier simple absorption rule is the special case where the opposite witness contributes no bits outside the fixed record at all:

```text
b0 subseteq a
or
a0 subseteq b.
```

Core-relative absorption permits the witness to contribute bits that are unavoidable anyway because they are present in every record of the opposite frontier.

## Exact rewrite

For normalized input frontiers `A` and `B`:

```text
coreA = intersection(A)
coreB = intersection(B)

row a absorbed if any b in B satisfies
    b subseteq (a union coreB)

column b absorbed if any a in A satisfies
    a subseteq (b union coreA)

emit a union coreB once for every absorbed row
emit b union coreA once for every absorbed column

generate ordinary a union b only for rows/columns not absorbed
normalize the resulting candidate set
```

Every emitted absorber is backed by an actual witness pair, so this does not introduce a lower bound that was absent from the original product.

## Bounded 6x5 rank-22 evidence

The generalized law was applied to the same deterministic 64-segment sample used for the rank-22 normalization diagnosis.

Baseline sample:

```text
raw Cartesian pairs:             18,309
legal-slice accepted candidates: 17,712
unique accepted candidates:      12,390
exact subset-minimal survivors:   2,001
post-dedup subset checks:        110,617
```

Original simple absorption:

```text
absorbed rows:                    509
absorbed columns:                 117
pairs eliminated:              7,963   (43.49%)
candidate occurrences:        10,758   (60.74% of baseline accepted)
unique candidates:             8,611   (69.50% of baseline unique)
post-dedup subset checks:      83,287   (75.29% of baseline)
```

Core-relative absorption:

```text
absorbed rows:                  1,049
absorbed columns:                 451
pairs eliminated:             16,498   (90.11%)
candidate occurrences:         3,305   (18.66% of baseline accepted)
unique candidates:             2,972   (23.99% of baseline unique)
post-dedup subset checks:      49,290   (44.56% of baseline)
```

The exact normalized frontier was required to equal the full-product authority on every sampled segment; mismatches were zero.

## Why this matters

This generalization does not merely make the normalizer faster. It removes most of the Cartesian product before:

- OR materialization;
- legal-slice checks;
- duplicate collapse;
- subset dominance;
- output compaction.

On the sampled rank-22 workload it eliminated about nine out of ten raw product pairs.

The discovery cost remains one bounded fixed-width relation check per input pair plus the two frontier cores. The row/column predicate is still ordinary subset inclusion:

```text
b subseteq (a union coreB)
a subseteq (b union coreA)
```

so the same pair tile can test both directions.

## Device shape

A GPU-oriented exact stage is:

```text
compute coreA/coreB once per segment

for each pair (a,b) in A x B:
    if b subseteq (a union coreB): mark row a absorbed
    if a subseteq (b union coreA): mark column b absorbed

emit one absorber per marked row/column

generate OR candidates only for unabsorbed row/column pairs
```

This needs no new CUDA-JS semantic primitive. It is fixed-width bitwise subset testing plus row/column marking and later compaction.

## Qualification boundary

The bounded rank-22 differential is strong evidence but not the final recurrence qualification.

Before production adoption:

1. run complete-control recurrence differential checks across multiple small Connect-K geometries;
2. require exact legal-state W/D/L equality against the full unabsorbed recurrence;
3. test the variable-word form beyond one u64 profile;
4. measure native GPU benefit independently of the correctness proof.

Do not infer 7x6 stopping rank directly from this sample.
