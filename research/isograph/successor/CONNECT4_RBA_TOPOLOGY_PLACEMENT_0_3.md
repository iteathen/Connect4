# Connect4 RBA topology placement - 0.3 current

**Status:** post-1.1 successor topology, not authority 1.1  
**Current QU:** `RBA-QU-0010`  
**Refines:** `CONNECT4_RBA_TOPOLOGY_PLACEMENT_0_2.*`

## Current topology

```text
BOARD-FIBER / RESIDUAL REGION
431000
  C4-R0077 / C4-R0079
        |
        | RBA-REL-01
        v
RBA-QU-0010
430010
        |
        | RBA-REL-02
        v
EXACT ORDINARY VALUE ALGEBRA
431010
  C4-R0078 / C4-R0080 / C4-R0081
        |
        | RBA-REL-04
        v
NATIVE SEMIRING SCALING FRONTIER
431030
  C4-R0082 / C4-R0083 / C4-R0084

SIDE SEAM:
430010 -- RBA-REL-03 OPEN --> 431020 PROOF / CONTROLLABLE-PREDECESSOR
```

## Current execution placement

```text
rank29 [3,5,2,1,6,6,6]   complete strong-value boundary CLOSED
rank28 [3,5,2,0,6,6,6]   draw14 Upper 144,462 / Lower 78,546
                           full strong boundary OPEN
```

The rank28 result is empirical scaling evidence inside node 431030. It does not create a new semantic relation edge.

RBA-REL-03 remains OPEN. Authority 1.1 is unchanged.
