# Connect4 RBA topology placement - 0.7 current

**Status:** post-1.1 successor topology, not authority 1.1  
**Current QU:** `RBA-QU-0014`  
**Refines:** `CONNECT4_RBA_TOPOLOGY_PLACEMENT_0_6.*`

## Current execution placement

```text
rank29 [3,5,2,1,6,6,6]   complete strong-value boundary CLOSED
rank28 [3,5,2,0,6,6,6]   complete strong-value boundary CLOSED
rank27 [3,4,2,0,6,6,6]   loss14/draw15/win15 CLOSED; full strong boundary OPEN
rank26                      not started
```

C4-R0090 is an exact evaluator law inside the native semiring scaling region:

```text
static candidate family
+ subtree union upper envelope
+ subtree maximum cardinality
+ exact leaf dominance witness
-> exact maximal antichain
```

Minimal normalization is the fixed-universe complement dual.

C4-R0088 block signatures and C4-R0090 static dominance trees are separate exact implementations of the same fixed-width antichain-normalization semantics.

The active unresolved scaling relation is now staged local projection / multi-factor planning, not global normalization correctness.

RBA-REL-03 remains OPEN. Authority 1.1 is unchanged.
