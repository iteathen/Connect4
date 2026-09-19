# Connect4 RBA topology placement - 0.6 current

**Status:** post-1.1 successor topology, not authority 1.1  
**Current QU:** `RBA-QU-0013`  
**Refines:** `CONNECT4_RBA_TOPOLOGY_PLACEMENT_0_5.*`

## Current execution placement

```text
rank29 [3,5,2,1,6,6,6]   complete strong-value boundary CLOSED
rank28 [3,5,2,0,6,6,6]   complete strong-value boundary CLOSED
rank27 [3,4,2,0,6,6,6]   loss14 / draw15 / win15 CLOSED
rank26                     blocked pending product-planner reassessment
```

C4-R0088 joins C4-R0085/C4-R0086 inside the native semiring scaling region as an exact evaluation law.

```text
C4-R0085  outer restriction cannot widen a fixed-inner local skyline
C4-R0086  dominated subtree-union projection bound permits exact subtree pruning
C4-R0088  block-signature superset/subset indexing preserves exact antichain dominance queries
```

The multi-phase planner itself remains an OPEN evaluation/scaling problem and is not promoted as a semantic relation.

RBA-REL-03 remains OPEN. Frozen authority 1.1 is unchanged.
