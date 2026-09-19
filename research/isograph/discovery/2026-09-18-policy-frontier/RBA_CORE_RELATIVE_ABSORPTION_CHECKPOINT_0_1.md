# RBA core-relative absorption integration checkpoint 0.1

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** exact pre-product reduction law integrated into current RBA line  
**Authority effect:** post-1.1 successor research only  
**Research direction:** Josh Oshiro

## Trigger

After static/global antichain normalization ceased to be the dominant wall, the selected rank27 `win15` final Lower product still had a hard local restricted-image phase:

```text
239,149 x 133,469
= 31,918,977,881 implicit meet opportunities
```

A bounded replay using projection-indexed local skylines plus the exact static global normalizer did not finish the local phase inside 240 seconds.

The canonical research history was then reviewed for an existing pre-product law rather than inventing another RBA-specific optimization.

## Provenance recovery

A stronger generic antichain law had already been derived and qualified in the earlier BSFP clause/ownership research line:

```text
historical revision:
86f588455ac74307a211d2e0588bec3ea3985e9a

historical artifacts:
research/experiments/cuda-bsfp-clause-coverage/CORE_RELATIVE_ABSORPTION.md
research/experiments/cuda-bsfp-clause-coverage/CORE_RELATIVE_ABSORPTION_OWNERSHIP.md
```

That work established both:

- the subset-minimal OR-product law;
- the subset-maximal AND-product dual.

The historical ownership-antichain differential passed five complete variable geometries with zero frontier mismatches.

This checkpoint integrates that already-derived law into the current canonical RBA research line and qualifies it directly on the transformed-q Lower semiring product.

## Exact maximal-meet law

Let `A` and `B` be subset-maximal antichains, with product:

```text
P = Max({ a AND b | a in A, b in B }).
```

Define union envelopes:

```text
envA = OR over A
envB = OR over B
```

For fixed row `a`, every row product obeys:

```text
a AND b subseteq a AND envB.
```

If there exists `b0 in B` such that:

```text
a AND envB subseteq b0,
```

then, because `b0 subseteq envB`:

```text
a AND b0 = a AND envB.
```

This is a real product occurrence and dominates every other product in row `a`; therefore that entire row may be replaced by the single absorber `a AND envB`.

Columns are symmetric using `b AND envA`.

After marking absorbed rows/columns:

```text
emit one real absorber per absorbed row
emit one real absorber per absorbed column
evaluate only unabsorbed rows x unabsorbed columns
global-maximalize the union
```

This preserves the exact maximal antichain.

## Rank27 win15 final-step structural reduction

Exact factors:

```text
A = persisted intermediate after action0 x action1 x action2
    |A| = 239,149

B = action3 Lower
    |B| = 133,469

raw product = 31,918,977,881
```

Core-relative discovery used exact superset-existence indexes over the two already-normalized factors.

Result:

```text
absorbed rows       193,704 / 239,149 = 81.00%
absorbed columns      2,841 / 133,469 =  2.13%

unabsorbed rows      45,445
unabsorbed columns  130,628

residual Cartesian pairs
= 45,445 x 130,628
= 5,936,389,460

residual pair fraction 18.5983%
raw pairs eliminated  81.4017%

absorption discovery ~0.412 s
```

The exact rewrite therefore removes more than four fifths of the Cartesian product before local projection.

## Exact replay

The unabsorbed rectangle was evaluated with the exact projection-tree local evaluator.

Absorbed rows/columns contributed their real witness absorbers once.

Measured phases:

```text
absorber candidates             196,545

unabsorbed local candidates   1,522,099
combined candidates           1,718,644

projection-tree leaf scans  1,013,041,309
projection-tree nodes         113,961,971

local projection              ~35.146 s
static global maximalization   ~9.069 s
absorption discovery            ~0.412 s
total replay                   ~44.729 s
```

Exact result:

```text
Lower(win15) = 306,617
SHA-256
a361b50c801fe6bcb339d39d04e1f15452d1663a0778d606dbb327e519a406c9
```

The output is byte-identical to the previously persisted qualified `Lower(win15)` stream.

## Interpretation

The hard final local-projection wall was not intrinsic to the complete 31.9B pair domain.

The product contains a large exact pre-materialization quotient:

```text
normalized maximal factors
-> core/envelope relative absorbed rows/columns
-> much smaller residual rectangle
-> local restricted-image evaluation
-> exact global maximalization
```

This law sits structurally before C4-R0082 local-skyline factorization. The two reductions compose:

```text
core-relative absorption
then
local-skyline factorization
then
global exact antichain normalization
```

The result also reconnects two previously separated Connect4 research lines: the earlier BSFP antichain-product reduction and the current RBA ordinary-value semiring are instances of the same fixed-width set-lattice operation.

## Genericity boundary

Core-relative absorption is consumer-neutral set-antichain algebra.

Connect4/RBA owns:

- transformed q/value semantics;
- factor meaning;
- threshold authority;
- whether the product is semantically required.

A reusable implementation may eventually belong in CUDA-Algorithms; this checkpoint does not move ownership or change any lower repository.

## Next

Before rank26 descent:

1. quantify core-relative absorption across the persisted rank27 products/intermediates;
2. integrate it as a first-stage planner option before local-evaluator selection;
3. determine whether the remaining hard local-query tail survives after absorption;
4. require exact persisted stream identity.

Frozen authority 1.1 is unchanged. The proof/value bridge remains a separate OPEN side seam.
