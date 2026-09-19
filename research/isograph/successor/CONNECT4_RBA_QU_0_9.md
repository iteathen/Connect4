# Connect4 RBA Quantifiable Unknown — 0.9 current refinement

**Record ID:** `RBA-QU-0009`  
**Refines:** `RBA-QU-0008`  
**State:** `OPEN`  
**Date:** 2026-09-19  
**Authority effect:** post-1.1 research refinement only

## Fixed semantic core

The broad ordinary-value algebra is no longer the main unknown:

```text
board fiber
-> residual distributive lattice
-> terminal-extended left adjoint <-> right adjoint
-> four nested partial-WDL fronts
-> antichain semiring
-> Bellman lattice polynomial
-> strong-distance resolution ordinal
```

## Current exact frontier

```text
support [3,5,2,1,6,6,6]
rank 29
residual shapes 33
state bits 66

loss2..loss12     CLOSED
Upper(draw13)     47,472

Lower products:
30,430 x 31,397 -> 92,989
92,989 x 8,821  -> 131,121

OPEN:
131,121 x 41,133
= 5,393,996,493 implicit opportunities
preferred orientation 41,133 outer / 131,121 inner
```

The 128-bit widening reproduced prior exact controls. The live seam is sparse semiring scaling, not representation correctness or a missing Bellman law.

## Open region

- minimality/canonical presentation of the current algebra;
- law controlling local skyline/final antichain width;
- output-sensitive multiplication at earlier ranks;
- Bellman transformer fusion across ranks/fibers;
- empty-root compactness;
- exact proof/value bridge to C4-R0043/C4-R0069/C4-R0076;
- second-representation replay of newly generated late-rank numerical suffixes.

Authority 1.1 remains unchanged.
