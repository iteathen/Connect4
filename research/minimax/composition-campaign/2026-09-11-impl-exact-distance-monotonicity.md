# IMPL exact-distance monotonicity — bounded complete controls

**Date:** 2026-09-11  
**Status:** qualified bounded evidence; not a standalone 7x6 proof.

## Question

Earlier RID implication experiments established exact W/D/L monotonicity. The current MQ5 solver uses distance-sensitive integer scores and null-window alpha-beta, so transferring a W/D/L result as though it were an exact numeric value would be unsound.

Before accepting 7x6 IMPL pruning, this qualifier therefore checks the stronger relation directly on complete bounded semantic games:

> At identical gravity support, if residual state `A` is at least as favorable as residual state `B` for the side to move, then exact distance-sensitive value must satisfy `V(A) >= V(B)`.

This is the condition needed for directional bound transfer:

- a **lower bound** learned for `B` may transfer upward to more-favorable `A`;
- an **upper bound** learned for `A` may transfer downward to less-favorable `B`;
- neither transfer makes a null-window result exact.

Harness:

`research/minimax/semantic-residual-mq5/impl_exact_distance_monotone_small.mjs`

Workflow run `34619503663`, job `103329654578`, conclusion **success**.

## Complete bounded results

| geometry | exact root | semantic states | side states | support buckets | same-support ordered pairs | dominance pairs | violations |
|---|---:|---:|---:|---:|---:|---:|---:|
| 4x3 connect-3 | +2 | 3,735 | 1,988 | 256 | 78,288 | 7,880 | **0** |
| 4x4 connect-4 | 0 | 34,095 | 7,507 | 625 | 3,132,564 | 235,243 | **0** |
| 5x3 connect-4 | 0 | 11,317 | 954 | 1,024 | 174,970 | 28,312 | **0** |
| **total** | — | **49,147** | — | — | **3,385,822** | **271,435** | **0** |

Every reachable ordered state pair sharing exact gravity support was tested. For every pair satisfying exact RID favorability, exact bottom-up distance-sensitive values respected the same order. Worst observed violation gap was zero because no violations occurred.

## Authority boundary

This is substantially stronger qualification for numeric null-window use than the earlier W/D/L-only experiments, but it remains **bounded complete-control evidence**, not a formal proof that the relation is monotone for every standard 7x6 state.

The 7x6 IMPL experiment must therefore still:

- preserve exact frozen root scores;
- retain bound type rather than reinterpret a null-window return as exact;
- transfer lower and upper bounds only in their valid monotone directions;
- keep exact RID closure as authority after any signature/index rejection filter.

A future formal proof of the distance-sensitive monotonicity law would supersede the bounded-evidence qualification, not vice versa.
