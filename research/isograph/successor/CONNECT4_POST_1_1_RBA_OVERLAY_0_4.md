# Connect4 post-1.1 RBA current overlay 0.4

**Status:** derived successor overlay, not authority 1.1
**Date:** 2026-09-19
**Research direction:** Josh Oshiro
**Refines:** CONNECT4_POST_1_1_RBA_OVERLAY_0_3.*

## Current execution evidence

- selected rank29 [3,5,2,1,6,6,6]: complete strong-value boundary CLOSED;
- selected rank28 [3,5,2,0,6,6,6]: complete strong-value boundary CLOSED;
- selected rank27 predecessor [3,4,2,0,6,6,6]: assessed, not yet executed;
- rank27 child-boundary cache is the next exact seam.

## New exact theorem

For fixed finite inner family B, let P_B(a)=Max({a meet b | b in B}). If a is a subset of a-prime, then |P_B(a)| <= |P_B(a-prime)|.
This is outer-restriction skyline monotonicity. It follows because meet with the smaller outer mask is a monotone restriction of the larger projection family; maximal images may merge or become dominated but cannot create more maximal images than the source maximal family.

## Evaluation-policy evidence

Across all six universal products in the selected rank29 and rank28 draw folds, keeping the accumulated boundary as the outer family was fastest. This includes cases where it emitted more local candidates, so candidate count alone is not the runtime objective.
Ordered-prefix orientation sampling is rejected as biased. Deterministic hash-sampled local-work measurement is the current orientation guard on new regimes.

## Scaling disposition

Rank28 widened from 66 to 70 transformed bits and still fully closed. Its pressure is localized around loss14/draw14/win13 rather than increasing monotonically with rank or bit width.
The immediate rank27 assessment contains 36-38 residual shapes / 72-76 transformed bits. [3,4,2,0,6,6,6] was selected specifically because it has high representation width but the smallest fixed-action Upper interface.

No proof/value relation is promoted. Authority 1.1 remains unchanged.
