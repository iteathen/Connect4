# Connect4 RBA Quantifiable Unknown - 0.12 restricted-image refinement

**Record ID:** `RBA-QU-0012`  
**Refines:** `RBA-QU-0011`  
**State:** `OPEN`  
**Date:** 2026-09-19  
**Authority effect:** post-1.1 research refinement only

## Newly fixed / constrained

- selected rank27 `[3,4,2,0,6,6,6]` is exact at `draw15`: Upper 161,398 / Lower 534,618;
- flat pair scanning is falsified as a sufficient output-sensitive evaluator at this frontier;
- C4-R0086 fixes exact projection-tree subtree pruning by dominance of `a meet union(subtree)`;
- the final rank27 product prunes 98.54% of inner visits while returning the exact antichain;
- local skyline width alone is insufficient as a cost law because median width 1 coexists with an 89.6B flat-scan wall.

## Refined open region

- O1 minimality/canonical presentation;
- O2 intrinsic frontier/query-width law;
- O3 indexed projection scaling across adjacent rank27 thresholds and earlier ranks;
- O4 transformer fusion;
- O5 empty-root compactness;
- O6 proof/value bridge;
- O7 independent replay of new numerical suffixes;
- O8 general factor-order/orientation planning;
- O9 representation-independent characterization of certifiable projection-pruning volume.

## Current exact seam

Test adjacent rank27 strong thresholds, especially `loss14` and `win15`, using the projection-indexed evaluator when flat scan economics predict a wall. Determine whether the 98.5% pruning is a draw-local accident or a stable support-fiber property.

Do not descend to rank26 before that reassessment.

Authority 1.1 remains unchanged.
