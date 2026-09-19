# Connect4 post-1.1 RBA current overlay 0.6

**Status:** derived successor overlay, not authority 1.1  
**Date:** 2026-09-19  
**Research direction:** Josh Oshiro  
**Refines:** `CONNECT4_POST_1_1_RBA_OVERLAY_0_5.*`

## Current rank27 evidence

Selected support:

```text
[3,4,2,0,6,6,6]
rank 27
residual shapes 38
transformed bits 76
```

Exact adjacent thresholds:

```text
loss14   Upper 114,585   Lower 158,402
draw15   Upper 161,398   Lower 534,618
win15    Upper 235,107   Lower 306,617
```

These three thresholds have materially different evaluation economics on the same support. The pruning/evaluation regime is therefore not a support-fiber constant.

## C4-R0088 — exact block-signature antichain index

For an exact subset-maximal antichain query, partition the fixed-width transformed mask into blocks and bucket accepted generators by each exact block signature.

For candidate `q`, any true dominating generator `g` must have a block signature that is a superset of `q` on every block. Therefore an implementation may choose any block, enumerate all superset signatures for `q` on that block, and test only generators in those buckets.

Complete full-mask comparison remains the equality/dominance authority.

This is exact because:

- every true full superset is present in the enumerated buckets;
- bucket membership alone never establishes dominance;
- full transformed-mask comparison rejects false positives.

Subset-minimal normalization is the fixed-universe complement dual.

Real qualification:

```text
maximal-mode real differential:
    100,000 candidates
    old exact output   26,078
    block index output 26,078
    mismatch                0

minimal-mode full win15 Upper:
    raw candidates      279,650
    old exact output    235,107
    block dual output   235,107
    mismatch                  0
```

## Evaluation-wall correction

The rank27 `win15` alternate product

```text
30,387 x 20,096
= 610,657,152 implicit pairs
```

was initially observed to time out under older evaluation paths.

Separating the phases shows:

```text
projection-tree local candidates   2,862,195
distinct candidates                2,170,447
block-index maximal output           143,550

local projection                     ~38.33 s
global block normalization            ~19.36 s
complete product                       ~57.7 s
```

Thus the factor pair itself is not intrinsically infeasible. The failure was a physical evaluation-pipeline mismatch.

## Refined open cost object

For one exact product, track separately:

```text
R  raw pair opportunities
Q  local projection / inspected-leaf work
C  local skyline candidate occurrences
D  distinct candidate count
M  global antichain normalization work
O  exact output width
```

Current evidence rejects `R`, `O`, local skyline width, and pruning percentage as sufficient standalone cost laws.

The active research seam is to choose an exact evaluation pipeline over:

```text
factor order
x operand orientation
x local projection evaluator
x global antichain normalizer
```

using inexpensive measurements that predict both `Q` and `M`.

No proof/value relation is promoted. Frozen authority 1.1 remains unchanged.
