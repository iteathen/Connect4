# Connect4 RBA Quantifiable Unknown - 0.15 rank26 operator transition

**Record ID:** `RBA-QU-0015`  
**Refines:** `RBA-QU-0014`  
**State:** `OPEN`  
**Date:** 2026-09-19  
**Authority effect:** post-1.1 research refinement only

## Newly fixed / constrained

- core-relative envelope absorption is exact and removes dominated product rows/columns before materialization;
- the selected rank27 `loss14/draw15/win15` stress controls now all have bounded exact staged routes;
- minimal principal-cover coordinate preimages admit exact shared uncovered-target dynamic programming;
- 576 shared-DP/preexisting-minCover differentials across six rank26 edges have zero mismatches;
- the first complete 89,032-target and 117,692-target rank26 cover families evaluate in sub-second operator time;
- selected rank26 support is `[3,3,2,0,6,6,6]`, 40 residual shapes / 80 transformed bits.

## Refined open region

- O1 minimality / canonical presentation;
- O2 intrinsic earlier-rank staged cost law;
- O3 adaptive local-evaluator scaling at rank26 and earlier;
- O4 transformer fusion;
- O5 empty-root compactness;
- O6 proof/value bridge;
- O7 independent replay;
- O8 multi-factor order/orientation planning;
- O9 representation-independent prunable-volume characterization;
- O10 rare-tail prediction;
- O11 hard restricted-image evaluation;
- O12 scaling of shared-target cover DP on earlier support fibers.

## Current exact seam

Selected rank26:

```text
[3,3,2,0,6,6,6]
draw16 target
```

Required rank27 `draw15` children:

```text
[4,3,2,0,6,6,6]   missing
[3,4,2,0,6,6,6]   closed
[3,3,3,0,6,6,6]   missing
[3,3,2,1,6,6,6]   missing
```

Cache and qualify the three missing children, then compose `draw16`. Reassess before rank25.

Frozen authority 1.1 remains unchanged.
