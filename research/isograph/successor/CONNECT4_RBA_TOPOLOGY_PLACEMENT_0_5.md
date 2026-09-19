# Connect4 RBA topology placement - 0.5 current

**Status:** post-1.1 successor topology, not authority 1.1  
**Current QU:** `RBA-QU-0012`  
**Refines:** `CONNECT4_RBA_TOPOLOGY_PLACEMENT_0_4.*`

## Current execution placement

```text
rank29 [3,5,2,1,6,6,6]   complete strong-value boundary CLOSED
rank28 [3,5,2,0,6,6,6]   complete strong-value boundary CLOSED
rank27 [3,4,2,0,6,6,6]   draw15 CLOSED; full strong boundary OPEN
```

C4-R0086 is an exact evaluation law inside the native semiring scaling region:

```text
inner subtree union upper bound
+ current local skyline dominance
-> exact subtree elimination
```

The measured 98.54% pruning ratio is evidence for C4-R0087, not a universal relation.

RBA-REL-03 remains OPEN. Authority 1.1 is unchanged.
