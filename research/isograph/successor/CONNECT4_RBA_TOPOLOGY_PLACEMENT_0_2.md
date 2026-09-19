# Connect4 RBA topology placement — 0.2 current

**Status:** post-1.1 successor topology, not authority 1.1  
**Current QU:** `RBA-QU-0009`

## Current topology

```text
BOARD-FIBER / RESIDUAL REGION
431000
  C4-R0008/R0025/R0026/R0068
  C4-R0077 board-fiber algebra
  C4-R0079 adjoint/cofactor algebra
        |
        | RBA-REL-01
        | core determined; minimality/canonicality open
        v
RBA-QU-0009
430009
        |
        | RBA-REL-02
        | exact four-front + antichain-semiring semantics known
        | compact normal form/root width open
        v
EXACT ORDINARY VALUE ALGEBRA
431010
  C4-R0078/R0080/R0081
        |
        | exact evaluation interface
        v
NATIVE SEMIRING SCALING FRONTIER
431030
  C4-R0082/R0083/R0084

SIDE SEAM:
430009 RBA
   |
   | RBA-REL-03 OPEN
   v
431020 PROOF / CONTROLLABLE-PREDECESSOR
  C4-R0073/R0074/R0043/R0069/R0076
```

## Change from topology 0.1

- **RBA-REL-01:** board-fiber derivation and cofactor adjunction/composition are fixed; minimality/canonicality/generalization remain open.
- **RBA-REL-02:** four-front partial value and Bellman antichain-semiring semantics are fixed; compact root-scale normal form remains open.
- **RBA-REL-03:** still genuinely OPEN. The proof/clause carrier has not been proved equivalent to, projected onto, or identified with the ordinary-value semiring.
- **RBA-REL-04:** exact evaluation interface from the value algebra into the native sparse-semiring scaling region.

C4-R0076 remains relevant, but not as the primary ordinary-value blocker.

## Live frontier

```text
rank29 [3,5,2,1,6,6,6]
draw13 Lower:
    131,121 x 41,133
    = 5,393,996,493 implicit products
```

This is a scaling/evaluation frontier, not a missing semantic-law node.

Authority 1.1 is unchanged.
