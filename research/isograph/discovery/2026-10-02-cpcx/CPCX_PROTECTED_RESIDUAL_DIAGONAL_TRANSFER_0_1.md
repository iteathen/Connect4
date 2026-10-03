# CPCX Protected-Residual Diagonal Transfer 0.1

**Status:** frozen theorem contract before implementation  
**Scope:** experimental CPCX only  
**Observation:** opponent occupation of one protected diagonal target may kill that line while exposing a strictly smaller overlapping diagonal carrier

## Purpose

Certify a rank-local transfer edge when the opponent occupies one currently playable target of a protected controller diagonal.

The source residual is allowed to die. Transfer is authorized only when the exact child position contains another live controller diagonal residual that overlaps the retained source-line geometry and has a strictly smaller lexicographic defect tuple:

`(missing cardinality, support debt)`.

This theorem certifies the structural transfer only. It does not infer eventual completion or a game value.

## Premises

1. The source position is exact and nonterminal.
2. The pinned source residual is live, controller-owned, and diagonal.
3. The current mover is the opponent of the protected residual owner.
4. The blocked cell is a missing cell of the source residual and is the current legal frontier.
5. The opponent event on that cell is nonterminal.
6. The source residual is killed by that event.
7. In the exact child, at least one live controller diagonal residual overlaps the retained physical source-line cells in at least the declared overlap threshold.
8. The candidate transfer tuple is strictly smaller than the source tuple.

## Canonical transfer selection

Among all admitted candidates, choose deterministically by:

1. greatest retained-cell overlap;
2. smallest missing cardinality;
3. smallest support debt;
4. smallest physical line ID.

This is a polynomial scan over current live line incidence, not future-state search.

## Conclusion

Emit `PROTECTED_RESIDUAL_DIAGONAL_TRANSFER` containing the exact opponent block event, killed source ancestry, transferred line ancestry, retained overlap, source and transfer tuples, child immediate boundary, and `strictTupleDecrease=true`.

## Failure conditions

Fail closed if the source is terminal, the source residual is absent or non-diagonal, the mover is not the opponent, the block is not a current protected target, the block is terminal, the source residual survives unexpectedly, or no overlapping strictly smaller controller diagonal carrier exists.

## Complexity

`O(liveLineCount * K)`, with K<=4. No reply tree, minimax, oracle, solved table, or recursive future-state search is used.

## Fresh qualification control

The legal sequence `2424224` creates P1 to move with a P0 protected residual `A6-B5-C4-D3`. B5 is currently playable. P1:B5 kills that source residual and exposes `C4-D3-E2-F1`, retaining C4,D3. The defect tuple falls from `(3,8)` to `(3,4)`.

This control is independent of the consumed turn-6 unresolved fixtures.

## Turn-6 application boundary

Workflow run `37133241820` found exactly one protected-target occupation among all 98 current P1 events from the 14 normalized turn-6 P1 boundary classes. It is the same B5 geometry, and its best exact transfer is `C4-D3-E2-F1` with tuple `(3,4)`.

The turn-6 fixture may qualify an application only after the generic theorem passes fresh controls.
