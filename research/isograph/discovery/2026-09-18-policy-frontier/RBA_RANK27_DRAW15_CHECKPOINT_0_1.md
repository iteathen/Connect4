# RBA rank-27 draw15 restricted-image checkpoint 0.1

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** selected rank27 draw threshold CLOSED  
**Authority effect:** none  
**Research direction:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

## Target

```text
support            [3,4,2,0,6,6,6]
rank               27
remaining cells    15
residual shapes    38
transformed bits   76
threshold          draw15
```

This support was selected before execution because it combines high representation width with a small measured predecessor interface.

## Exact rank28 child boundaries

```text
child [4,4,2,0,6,6,6]
    Upper(draw14)  67,191
    Lower(draw14)  17,721

child [3,5,2,0,6,6,6]
    Upper(draw14) 144,462
    Lower(draw14)  78,546
    previously qualified control

child [3,4,3,0,6,6,6]
    Upper(draw14)  63,615
    Lower(draw14)  36,217

child [3,4,2,1,6,6,6]
    Upper(draw14) 340,316
    Lower(draw14) 164,113
```

A shared resumable support cache was used so completed descendants were not reconstructed after bounded interruptions. A duplicate cache-writer process was detected during execution, stopped, and all 415 completed U/L cache pairs were validated as paired, nonempty, newline-complete lowercase-hex streams before single-writer continuation.

One informative rank29 interior child reached:

```text
[3,4,2,2,6,6,6]
Upper  90,872
Lower 454,206
```

yet the following rank28 projections collapsed substantially. This is direct evidence that intermediate boundary cardinality need not propagate monotonically through the next support fiber.

## Exact fixed-action draw15 fronts

```text
column 0:
    Upper 16,185
    Lower 48,278
    max cover 4

column 1:
    Upper 23,203
    Lower 72,117
    max cover 2

column 2:
    Upper 14,190
    Lower 27,665
    max cover 9

column 3:
    Upper 135,341
    Lower 289,959
    max cover 4
```

The action-3 predecessor was the only materially expensive fixed-action construction:

```text
child U/L          340,316 / 164,113
Upper raw          261,451
Upper normalize      ~3.09 s
Lower raw          442,538
Lower normalize     ~12.31 s
total                ~15.82 s
```

So the root wall is not general principal-cover/preimage construction.

## Exact state Upper(draw15)

Union of the four action-U fronts:

```text
raw action-U candidates   188,919
Upper(draw15)             161,398
replay time                  ~3.54 s
SHA-256
7a3588c307e673b097f54c2a65c0153c023425b2ac3d812c49c61ab576ad1307
```

An independent Upper replay returned the identical stream hash.

## Lower product planning

A deterministic hash-sampled local-work planner evaluated the six possible first action-factor pairs. It selected actions 0 and 2.

Exact first product:

```text
48,278 x 27,665
= 1,335,610,870 implicit opportunities
-> 3,758,845 local candidates
median/p90/p99 local width 37 / 190 / 594
max width 5,973
-> 2,770,449 distinct
-> 1,253,115 same-mover
->   724,409 same-opponent
->   212,509 exact generators

local generation    4.983 s
normalization      10.781 s
total              15.764 s
```

Second product with action 1:

```text
212,509 x 72,117
= 15,325,511,553 implicit opportunities
-> 2,476,392 local candidates
median/p90/p99 local width 1 / 27 / 124
max width 71,372
-> 2,188,951 distinct
-> 1,308,027 same-mover
->   834,324 same-opponent
->   308,934 exact generators

local generation   14.963 s
normalization      18.649 s
total              33.612 s
```

A flat final product against action 3:

```text
308,934 x 289,959
= 89,578,193,706 implicit opportunities
```

did not close within a bounded 300-second flat-scan run.

A different early tree, action 0 x action 3, also failed to close within a bounded 180-second flat-scan run. This rejects multiplication order alone as the complete remedy.

## New exact evaluation law — subtree projection pruning

Fix outer generator `a` and an inner-family subtree `S`. Let:

```text
u(S) = bitwise union of every b in S.
```

Every projection from that subtree satisfies:

```text
a meet b <= a meet u(S).
```

Therefore, if the current exact local skyline already contains some generator `g` with:

```text
g >= a meet u(S),
```

then every projection from `S` is dominated and the entire subtree can be skipped without inspecting its members.

This is deductive and semantics-preserving. It refines C4-R0085 from outer-restriction monotonicity into an executable projection-query pruning law.

## Full indexed final product

A balanced inner-family projection tree used that exact subtree rule.

```text
inner tree nodes             14,199
tree build                    195 ms

raw implicit opportunities
                         89,578,193,706

inner generator visits
                          1,306,881,417

scan fraction                    1.46%
pruned fraction                 98.54%

average tree nodes / outer     424.858

local skyline candidates     1,555,168
median width                         1
p90                                  9
p99                                 65
maximum                        260,376

distinct candidates          1,455,371
after same-mover             1,072,695
after same-opponent            829,972
exact global generators        534,618

indexed local generation        28.061 s
global normalization            41.698 s
total                            69.759 s
peak RSS                        195,188 KiB
```

Thus:

```text
Lower(draw15) = 534,618
SHA-256
9c99ecd677a47c3e200a26ecd9a4bfc994c29894cf34973f25f06c1ff5da9355
```

The projection-tree algorithm is the same exact pruning construction previously qualified against the complete rank28 product, where it returned the independently persisted exact final set.

## What actually governs the cost

The result refines the frontier-law hypothesis.

Local skyline width alone is not sufficient: the flat kernel still inspected all 89.6B pairs and timed out despite median width 1.

The indexed query shows the missing quantity:

```text
restricted-image width
+
how much of the inner family can be certified dominated
without leaf inspection.
```

On the complete rank27 final product:

```text
89.7% of outer generators have local skyline width 1.

For width-1 outers:
    average inspected inner generators       ~505
    average scan fraction                    ~0.174%
    share of all inner visits                ~10.7%

scan-count percentiles over all outers:
    median       316
    p90        7,657
    p99       72,086
    p99.9    122,346
    max      287,103

correlation:
    corr(log(1+width), log(1+inspected)) ~0.783
```

The single pathological outer misses only 5 of the 75 variable bits visible in the inner family and has:

```text
local width       260,376
inner inspected   287,103 / 289,959
```

Simple outer popcount/missing-bit count is still not a sufficient global predictor; the relational organization of the restricted inner family remains load-bearing.

## Current exact result

```text
rank27 [3,4,2,0,6,6,6]
Upper(draw15) 161,398
Lower(draw15) 534,618
```

The root is therefore algebraically closed at the draw threshold. The new wall was flat projection-query evaluation, and the exact projection tree removed it.

## Next

Do not descend to rank26 yet.

First test the same projection-indexed recurrence on the adjacent rank27 strong thresholds, especially loss14 / win15, to determine whether the 98.5% pruning phenomenon is threshold-local or a stable property of this support fiber. Then reassess the frontier-width law.

The C4-R0043 / C4-R0069 / C4-R0076 proof-value bridge remains a separate OPEN side seam. Frozen authority 1.1 is unchanged.
