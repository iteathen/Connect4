# Connect4 post-1.1 RBA current overlay 0.5

**Status:** derived successor overlay, not authority 1.1  
**Date:** 2026-09-19  
**Research direction:** Josh Oshiro  
**Refines:** `CONNECT4_POST_1_1_RBA_OVERLAY_0_4.*`

## New result

Selected rank27 support:

```text
[3,4,2,0,6,6,6]
rank 27
residual shapes 38
transformed bits 76

Upper(draw15) 161,398
Lower(draw15) 534,618
```

The flat final semiring product exposed the new evaluation wall:

```text
308,934 x 289,959
= 89,578,193,706 implicit pair opportunities
flat scan: bounded 300 s did not close
```

An exact projection tree closed the same product by inspecting only 1,306,881,417 inner generators:

```text
scan fraction   1.46%
pruned          98.54%
local candidates 1,555,168
exact output      534,618
local generation  28.061 s
normalization      41.698 s
```

## New deductive law — C4-R0086

For fixed outer generator `a` and an inner subtree `S`, let `u(S)` be the union of all generators in `S`.

Every projection satisfies:

```text
a meet b <= a meet u(S)
```

for every `b in S`.

Therefore, if the current exact local skyline already contains `g >= a meet u(S)`, every projection from `S` is dominated and the subtree may be skipped exactly.

This is a semantics-preserving evaluation law derived from the same transformed meet order as C4-R0082/C4-R0085.

## Refined scaling interpretation

Restricted-image width alone is not the whole cost law. The rank27 final product has median local skyline width 1, yet the flat evaluator times out because it still inspects all 89.6B pairs.

The measured cost object is now closer to:

```text
restricted-image width
+
certifiable projection-pruning / leaf-inspection volume
+
global normalization volume
```

This remains an evaluation/scaling question, not a missing Bellman law.

No proof/value relation is promoted. Authority 1.1 remains unchanged.
