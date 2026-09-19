# RBA static dominance-tree normalization / planner checkpoint 0.1

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** exact global-antichain evaluator qualification + multi-phase planner refinement  
**Authority effect:** none  
**Research direction:** Josh Oshiro

## Context

The current successor state already qualified block-signature exact maximal/minimal normalization and corrected the rank27 `win15` action-0 x action-2 product from an intrinsic factor-order failure to an evaluation-pipeline failure.
This checkpoint adds a second exact global normalizer and uses it to refine the multi-phase planner.

Target real product:
```text
action 0 = 30,387
action 2 = 20,096
raw implicit pairs = 610,657,152
```

The persisted projection-tree local run and an independent flat local-skyline replay produce the same complete local-candidate occurrence stream:
```text
candidate occurrences = 2,862,195
distinct candidates    = 2,170,447
occurrence stream match = YES
distinct-set match      = YES
```

## Exact static dominance tree

Let `C` be the complete distinct candidate family for subset-maximal normalization. A candidate `q` is maximal exactly when no `r in C` is a strict superset of `q`.
Build a static balanced candidate tree. Each node stores `U_N`, the bitwise union of its records, and `K_N`, their maximum popcount.
For query `q`, a node can be skipped exactly when `q` is not a subset of `U_N`, or—after exact deduplication—when `K_N <= popcount(q)`.
Leaves perform the complete transformed-mask strict-superset test. No candidate is rejected without a full-mask witness. Queries are independent and may execute in parallel.
Subset-minimal normalization is the fixed-universe complement dual.

## Maximal real-product qualification

```text
occurrences     2,862,195
distinct        2,170,447
exact maximal     143,550
```

Leaf-size 64:
```text
dedup ~0.262 s
tree build ~2.230 s
parallel query ~2.896 s
wall ~5.44 s
avg nodes/query 57.05
avg leaf records/query 313.42
```

Leaf-size 31:
```text
dedup ~0.263 s
tree build ~2.393 s
parallel query ~2.161 s
wall ~4.86 s
avg nodes/query 64.18
avg leaf records/query 139.32
```

Single-query-thread leaf-size-31 control:
```text
dedup ~0.260 s
tree build ~2.401 s
query ~4.558 s
wall ~7.26 s
```

Qualified block-signature normalization on the identical family took ~19.51 s wall.
The block-signature and static-tree outputs are byte-identical after canonical sorting:
```text
generators 143,550
SHA-256 9d621eb921febde027869bc77e88d07f4a49c5a7d50fdc67ba2c60390b765389
exact set match YES
```

The static output also re-normalizes unchanged under the older exact incremental normalizer, and two different static-tree leaf partitions return the same canonical stream.

## Minimal dual qualification

Complete rank27 `win15` action-Upper union:
```text
raw candidates 279,650
exact minimal generators 235,107
wall ~2.79 s
SHA-256 0e7af9d6ae271925a98995795ba2c1e11266d2000c905a7e2417bcc6dc243621
```
This is byte-identical to the qualified `Upper(win15)` stream. The qualified block-signature complement dual took ~5.10 s.

## Local evaluator result on action-0 x action-2

Independent flat streaming local skylines:
```text
single-thread local generation ~15.65 s
four-worker local generation ~5.64 s
candidate occurrences 2,862,195
```
The candidate-occurrence stream is identical to the persisted projection-tree local stream. Local evaluator choice therefore changes cost only on this product.

## Deterministic rare-tail guard

Define `d_B(a) = popcount(Union(B) AND NOT a)`. Probe the smallest-`d_B` outer generators explicitly in addition to order-unbiased hash samples.

Action 0 -> action 1, among the 12 union-nearest outers:
```text
one outer: d_B=7
local skyline width 57,549 / 58,059
inspected leaves 58,059
indexed query ~981 ms
```
This extreme was missed by small hash samples.

Action 0 -> action 2, among the corresponding 12 union-nearest outers:
```text
largest local skyline 3,169 / 20,096
largest measured query ~11.8 ms
```
`d_B` alone is not a complete cost law, but union-nearest probing is a useful deterministic tail guard.

## Multi-factor lookahead evidence

The fast first pair `action0 x action2` gives 143,550 generators, but its continuations are hard:
```text
x action1: projected serial local work ~230 s; extreme width 57,549
x action3: projected serial local work ~236 s; extreme width 133,469; extreme query ~4.67 s
```

The persisted qualified intermediate `(action0 x action1)=205,066` has a materially cheaper next factor 2:
```text
205,066 x 20,096
projected serial local work ~64 s
extreme width 2,427
```
whereas jumping directly to factor 3 is hard. Greedy cheapest-first factor selection is therefore insufficient.

## Balanced-tree controls

Exact pair product action0 x action3:
```text
raw 4,055,722,503
local candidates 1,317,951
distinct 1,114,518
final 234,374
local ~27.90 s / 5 workers
static global ~4.45 s
SHA-256 9e5e5f67702b828c4b544375c2bf3fb8914d3b2e710d069a4c3a0ddf068b4bff
```

Exact pair product action1 x action2:
```text
raw 1,166,753,664
local candidates 3,673,781
distinct 3,100,581
final 223,676
local ~9.06 s / 5 workers
static global ~8.70 s
SHA-256 0dec0f92604cde520cd2d2e09a8cc30d73803b35d38e22aa28101e8f94f61354
```

Their balanced final product would be:
```text
234,374 x 223,676 = 52,423,838,824 implicit pairs
```
A 64-outer exact projection sample gives ~6.21 ms/query, ~1,454.8 s projected serial local work, mean width 16.4, p99 width 132, mean 29,433 inspected leaves, scan fraction 13.16%.
The bounded five-worker full local attempt did not close within 180 s. Final skyline width is therefore not a sufficient local-query predictor.

A separate action2 x action3 attempt was rejected by the deterministic extreme probe: the nearest outer has `d_B=3`, width 133,469 / 133,469, and query time ~4.68 s.

## Final-step replay disposition

A replay of the qualified final `win15` step `239,149 x 133,469` using indexed local projection plus static global normalization exceeded a bounded 240-second run before global normalization began.
The persisted qualified result remains `Lower(win15)=306,617`, SHA-256 `a361b50c801fe6bcb339d39d04e1f15452d1663a0778d606dbb327e519a406c9`. No mismatch was observed; the local phase remains expensive.

## Planner consequence

The planner can now be staged at exact semantic phase boundaries:
```text
1. preflight orientation/local evaluator
   - deterministic hash samples
   - union-nearest extreme probes
2. execute exact local projection phase
3. observe exact C local occurrences and D distinct candidates
4. select exact global normalizer
   - static dominance tree
   - block-signature index
   - retained controls
5. for multi-factor products use bounded lookahead
   - do not greedily choose only the cheapest first pair
   - probe the resulting intermediate against remaining factors
```

This removes the need to predict global normalization pressure entirely from the original operands.
The remaining planner wall is hard local restricted-image evaluation at some intermediate/final products.

## Current refined cost object

```text
Q local projection/query work
C local skyline candidate occurrences
D distinct candidate count
M global normalization work
O exact output width
T rare-tail / extreme-projection structure
```
`R` raw pair count remains useful as a bound but is not sufficient.

## Next

Keep rank26 blocked. Qualify the staged planner on persisted rank27 products with explicit local-evaluator choice and bounded lookahead. The next technical target is reducing or predicting the hard local projection phase, not another global normalizer.

Frozen authority 1.1 is unchanged. The proof/value bridge remains a separate OPEN side seam.
