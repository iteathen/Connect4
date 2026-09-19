# Connect4 post-1.1 RBA current overlay 0.3

**Status:** derived successor overlay, not authority 1.1  
**Date:** 2026-09-19  
**Research direction:** Josh Oshiro  
**Refines:** `CONNECT4_POST_1_1_RBA_OVERLAY_0_2.*`  
**Base manifest:** `986f10a0011059e4d19598de6c836272c102415d`

## Current correction

```text
rank29 [3,5,2,1,6,6,6] ordinary strong-value boundary   CLOSED
draw13 final raw opportunities                           5,393,400,093
rank28 [3,5,2,0,6,6,6] draw14 threshold                CLOSED
simple monotone rank/bit-width cost rule                 FALSIFIED ON THIS STEP
empty root                                               NOT SOLVED
proof/clause -> value bridge                             STILL OPEN
```

## Successor claims

| ID | Status | Current result |
|---|---|---|
| C4-R0077 | deductive_exact | Board-fiber isomorphism determines residual/cofactor algebra |
| C4-R0078 | guarded_exact | Board-fiber isomorphism preserves abstract ordinary strong-value algebra |
| C4-R0079 | deductive_exact | Terminal-extended residual cofactors are compositional left adjoints with right adjoints |
| C4-R0080 | deductive_exact | Four nested endpoint fronts carry partial WDL block semantics |
| C4-R0081 | deductive_exact | Bellman threshold propagation is an antichain-semiring lattice polynomial |
| C4-R0082 | deductive_exact | Semiring multiplication admits exact local-skyline factorization |
| C4-R0083 | empirically_supported | Native recurrence closes selected rank31/rank30, the complete selected rank29 root, and one rank28 draw-threshold predecessor |
| C4-R0084 | open_question | Root-scale compactness/frontier law remains open; one-step evidence rejects simple monotone rank/bit-width cost growth |

## New exact numerical evidence

Rank29 final `draw13` product:

```text
131,121 x 41,133
= 5,393,400,093 implicit opportunities
-> 4,393,899 local candidates
-> 140,454 exact generators
```

Independent direct maximalization of all 4,393,899 local candidates returns the identical 140,454-generator set.

Selected rank28 predecessor:

```text
support [3,5,2,0,6,6,6]
residual shapes 35
transformed bits 70

Upper(draw14) = 144,462
Lower(draw14) = 78,546

largest Lower step:
1,903,410,921 implicit
-> 2,641,949 local candidates
-> 78,546 exact generators
```

The earlier rank has a wider transformed representation but a smaller selected draw Lower boundary than the closed rank29 target. This rejects a simple monotone rank/width cost law on this step; it does not establish that earlier ranks are generally cheaper.

## Relation discipline

RBA-REL-01 through RBA-REL-04 retain their prior meanings. No new typed relation is promoted from the empirical rank28/rank29 scaling observations.

No identification is made between the ordinary-value carrier and C4-R0043/C4-R0069/C4-R0076.

Authority 1.1 remains unchanged.
