# Connect4 RBA topology placement - 0.8 current

**Status:** post-1.1 successor topology, not authority 1.1  
**Current QU:** `RBA-QU-0015`  
**Refines:** `CONNECT4_RBA_TOPOLOGY_PLACEMENT_0_7.*`

## Current execution placement

```text
rank29 [3,5,2,1,6,6,6]   complete
rank28 [3,5,2,0,6,6,6]   complete
rank27 [3,4,2,0,6,6,6]   loss14/draw15/win15 closed; staged evaluator qualified
rank26 [3,3,2,0,6,6,6]   selected; three draw15 children missing
rank25                      not started
```

## New exact evaluation relations

C4-R0091 lives in antichain-semiring evaluation:

```text
core/envelope relation
+ real absorber witness
-> exact row/column product collapse
```

C4-R0092 lives in coordinate predecessor evaluation:

```text
fixed cofactor principal-image relation
+ uncovered child target
+ memoized minimal-cover recurrence
-> exact shared target preimage frontier
```

C4-R0091 derives from the semiring product structure C4-R0082.

C4-R0092 derives from the cofactor/preimage structure C4-R0079.

The selected rank26 support is execution state, not a native relation.

RBA-REL-03 remains OPEN. Authority 1.1 is unchanged.
