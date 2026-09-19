# Connect4 post-1.1 RBA current overlay 0.7

**Status:** derived successor overlay, not authority 1.1  
**Date:** 2026-09-19  
**Research direction:** Josh Oshiro  
**Refines:** `CONNECT4_POST_1_1_RBA_OVERLAY_0_6.*`

## New exact evaluation law — C4-R0090

For an exact distinct fixed-width candidate family `C`, candidate `q` is subset-maximal exactly when no strict superset of `q` exists in `C`.

A static candidate tree may store for each subtree:

```text
U_N = bitwise union of every record in the subtree
K_N = maximum record popcount in the subtree
```

For a maximality query, the subtree is impossible to contain a strict superset when either:

```text
q not subset_of U_N
```

or, after exact deduplication:

```text
K_N <= popcount(q)
```

Leaves perform complete transformed-mask superset checks. Thus the tree changes query cost only. No candidate is rejected without a full exact strict-superset witness.

Subset-minimal normalization is the fixed-universe complement dual.

## Full real differential against C4-R0088

Rank27 `win15` action-0 x action-2 Lower product:

```text
raw pairs                   610,657,152
local candidate occurrences   2,862,195
distinct candidates            2,170,447
exact maximal output             143,550
```

Static-tree and block-signature normalization return byte-identical canonical output:

```text
SHA-256
9d621eb921febde027869bc77e88d07f4a49c5a7d50fdc67ba2c60390b765389
```

Measured static-tree normalization:

```text
parallel leaf-31 wall   ~4.86 s
single-query-thread     ~7.26 s
```

Qualified block-signature normalization on the same family was ~19.51 s.

This is exact implementation evidence, not a universal speedup statement.

## Minimal dual qualification

The full rank27 `win15` action-Upper union:

```text
279,650 raw candidates
-> 235,107 exact minimal generators
```

Static complement-dual output is byte-identical to the persisted `Upper(win15)` stream:

```text
SHA-256
0e7af9d6ae271925a98995795ba2c1e11266d2000c905a7e2417bcc6dc243621
```

## Local evaluator equivalence on the same product

An independent flat local-skyline generator produced the same 2,862,195 candidate-occurrence stream as the persisted projection-tree local evaluator.

This confirms a useful separation:

```text
semantic product
!= physical local evaluator
!= physical global normalizer
```

Each physical stage may vary only with exact stream/output invariance.

## Staged planner refinement

Global normalization pressure need not be predicted completely before executing the product.

An exact staged planner may:

```text
preflight local/orientation choice
-> execute exact local projection phase
-> observe exact C and D
-> choose exact global normalizer
```

where:

```text
C = local candidate occurrences
D = exact distinct candidate volume
```

This removes the former requirement to infer `M`, global normalization work, solely from the original operands.

## Rare-tail guard

Small order-unbiased projection samples can miss rare catastrophic local projections.

A deterministic supplemental probe orders outer generators by:

```text
d_B(a) = popcount(Union(B) AND NOT a)
```

and explicitly tests the union-nearest outers.

On rank27 `win15`:

```text
action0 -> action1:
    rare outer width 57,549 / 58,059
    query ~981 ms

action0 -> action2:
    first-12 largest width 3,169 / 20,096
    query <= ~11.8 ms
```

The metric is not itself a complete cost law, but the deterministic extreme probe catches a load-bearing tail missed by small hash samples.

## Multi-factor consequence

The cheapest first pair is not necessarily the cheapest full multiplication tree.

The exact fast pair:

```text
action0 x action2 -> 143,550
```

leaves only expensive next-factor choices. By contrast, the persisted qualified `action0 x action1` intermediate has a substantially cheaper next multiplication by action2.

Balanced pair trees likewise can create hard final restricted-image products despite modest final local skyline width.

Therefore the active planner must use bounded lookahead over exact intermediates rather than greedily minimizing one pair.

## Refined cost object

Current staged product cost tracks:

```text
Q = local restricted-image query work
C = local skyline candidate occurrences
D = distinct candidate count
M = global normalization work
O = exact output width
T = rare-tail / extreme-projection structure
```

Raw pair count remains a useful bound but not a sufficient cost oracle.

The principal remaining scaling wall is now local restricted-image evaluation for hard intermediate/final products.

No proof/value relation is promoted. Frozen authority 1.1 remains unchanged.
