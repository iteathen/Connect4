# Cross-frontier absorption for exact BSFP universal products

**Status:** exact lattice law with bounded real rank-22 workload evidence. Not yet integrated into the production CUDA solver.

**Research direction:** Josh Oshiro.

## Law

Let `A` and `B` be subset-antichain frontiers and let their universal/conjunctive product be the subset-minimal elements of:

```text
P = { a union b | a in A, b in B }.
```

For a fixed `b in B`, if there exists `a0 in A` such that

```text
a0 subseteq b,
```

then

```text
a0 union b = b
```

is itself a valid product occurrence. For every other `a in A`:

```text
b subseteq (a union b).
```

Therefore every other product occurrence in column `b` is dominated by `b` and the entire column may be replaced by the single record `b` before product materialization.

Dually, for a fixed `a in A`, if there exists `b0 in B` with

```text
b0 subseteq a,
```

then the entire row `a` may be replaced by the single product record `a`.

If a removed pair lies in both an absorbed row and absorbed column, either emitted absorber is sufficient; ordinary final normalization removes redundant emitted absorbers.

This is exact by subset transitivity and does not depend on Connect4-specific meaning.

## Exact product rewrite

Instead of:

```text
for every a in A:
    for every b in B:
        emit a union b
normalize all emitted records
```

use:

```text
mark absorbed rows:
    row a is absorbed if any b in B satisfies b subseteq a

mark absorbed columns:
    column b is absorbed if any a in A satisfies a subseteq b

emit each absorbed-row record a once
emit each absorbed-column record b once

for each unabsorbed row a:
    for each unabsorbed column b:
        emit a union b

normalize
```

The cross-subset marking itself is a bounded fixed-width pair predicate and is naturally GPU-parallel.

## Bounded 6x5 rank-22 evidence

The law was applied to the same leashed sample used for normalization diagnosis:

```text
geometry:                    6x5 connect-4
rank:                        22
reflection representatives: 588 total
sampled supports completed:   28
sampled universal segments:   64
raw Cartesian pairs:      18,309
```

The exact absorbed product was required to produce the same subset-minimal frontier as the full product on every segment.

Observed absorption:

```text
absorbed rows:               509
absorbed columns:            117
raw pairs eliminated:      7,963
pair elimination rate:     43.49%
full segments eliminated:      0
```

Thus no sampled segment collapsed completely to one input frontier, but partial row/column absorption removed almost half of pair materialization.

## Candidate and normalization reduction

Baseline after the existing legal-slice filter:

```text
accepted candidate occurrences: 17,712
unique accepted signatures:     12,390
subset-minimal survivors:        2,001
```

After cross-frontier absorption plus ordinary legal-slice handling of the remaining product:

```text
candidate occurrences:           10,758
unique candidate signatures:      8,611
same exact final survivors:        2,001
```

Ratios:

```text
candidate occurrences / baseline: 0.6074
unique candidates / baseline:     0.6950
```

With exact duplicate collapse before dominance, measured subset work changed from:

```text
baseline subset checks:          110,617
absorption + dedup subset checks: 83,287
ratio:                              0.7529
```

So absorption attacks both sides of the wall:

- about **43.5% fewer raw product pairs** need union/materialization;
- about **30.5% fewer unique candidates** reach dominance;
- about **24.7% fewer post-dedup subset checks** remain in the sampled CPU normalization model.

## Cost shape

The sampled absorption discovery required one cross-frontier subset predicate per original pair:

```text
cross-subset predicates: 18,309
```

For the <=64-bit coverage profile each predicate is a fixed two-u32 subset test. The discovery pass therefore replaces many more expensive operations—union generation, feasibility processing, duplicate handling and later dominance—with a simple pairwise relation test.

Do not infer native timing from the CPU sample. The point is work elimination and execution shape.

## Device-oriented formulation

A natural exact GPU stage is:

```text
A x B subset relation tile
    -> rowAbsorbed[a] |= (b subseteq a)
    -> colAbsorbed[b] |= (a subseteq b)

compact/emit absorbed rows and columns once

generate OR pairs only for
    !rowAbsorbed[a] && !colAbsorbed[b]
```

The same tiled relation pass can compute both directions from each loaded pair.

This requires no new CUDA-JS semantic primitive. It is ordinary fixed-width reads, bitwise operations and reduction/marking.

## Interaction with other reductions

Recommended order for the universal/intersection path:

```text
already-normalized input frontiers
-> cross-frontier absorption
-> generate remaining OR product
-> exact legal-slice feasibility rejection
-> exact duplicate collapse
-> subset-minimal dominance
-> compact persistent frontier
```

Horizontal reflection acts outside this support-local operation and remains independently composable.

The legal-slice filter remains useful even though it is weak in the sampled rank-22 terminal band; absorption does not rely on it.

## Scope

The law is generic to subset-ordered union products. Its use in BSFP is exact because the qualified clause-coverage universal composition is wordwise set union followed by subset-minimal normalization.

Do not extend the conclusion automatically to operations whose composition is not set union or whose order is not subset inclusion.
