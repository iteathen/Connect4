# CPCX Protected Diagonal-Track Transfer 0.1

**Status:** frozen theorem contract before implementation  
**Scope:** experimental CPCX only  
**Observation:** exact protected-carrier handoff after an opponent occupies one protected diagonal target

## Purpose

Formalize the only nonlocal-looking step remaining in the normalized turn-6
response-descent audit.

A protected diagonal winning-line residual may be killed when the opponent
occupies one of its missing cells.  On a finite Connect-K board, overlapping
winning windows on the **same physical diagonal track** may leave another live
controller residual in the exact child.

This theorem certifies a handoff only when that replacement residual is
constructed from current geometry/cofactor facts and has a strictly smaller
well-founded structural measure.

It does not infer W/D/L and does not select a replacement by solved outcome.

## Objects

Let `S` be one exact nonterminal position.

Let:

- `A` be the owner of one protected live residual `R`;
- `D=S.mover=A^1` be the opponent;
- `x` be one currently playable missing cell of `R`;
- `L(R)` be the physical winning-line cell set of `R`.

For a live residual `Q`, define

```text
mu(Q) = ( |missing(Q)| , supportDebt(Q) )
supportDebt(Q) = sum supportDistance(t)
```

ordered lexicographically.

For a diagonal line define its physical track:

```text
D+ : row - column = constant
D- : row + column = constant
```

Two diagonal winning windows are on the same track iff they have the same
orientation and the same track constant.

## Premises

1. **Exact nonterminal source.** `S` is exact and nonterminal.

2. **Opponent to move.** The current mover is `D=A^1`.

3. **Protected source residual.** `R` is a current live residual for `A`,
   has diagonal orientation `D+` or `D-`, and is pinned by exact player and
   line ancestry.

4. **Protected target event.** `x` is in `R.missingCells`, has support
   distance zero, and is the current legal frontier cell of its column.

5. **Exact target occupation.** Apply `D:x` with exact first-win stopping.
   If the event terminally wins for `D`, the transfer theorem fails closed.

6. **Source residual killed.** Owner-labelled cofactor algebra verifies that
   `D:x` kills `R`; the same source line is not live for `A` in the
   nonterminal child.

7. **Same-track replacement candidates.** Consider only live child residuals
   `Q` owned by `A` whose physical winning line:
   - has the same diagonal orientation as `R`;
   - lies on the same physical diagonal track;
   - does not contain the opponent-owned event `x`;
   - overlaps at least one retained source-line cell in
     `L(R) \ {x}`.

8. **Strict measure descent.** A candidate is admissible only when

```text
mu(Q) < mu(R)
```

lexicographically.

9. **Deterministic structural selection.** If several admissible candidates
   exist, choose by:
   1. greatest retained-cell overlap;
   2. smallest missing cardinality;
   3. smallest support debt;
   4. smallest physical line ID.

   No outcome, remoteness, U-class label, or future certificate is used.

## Conclusion

If an admissible candidate exists, emit

```text
PROTECTED_DIAGONAL_TRACK_TRANSFER
```

containing:

- exact source and child positions;
- blocked protected target;
- exact cofactor kill of the source residual;
- source and replacement line ancestry;
- common diagonal-track identity;
- retained overlap cells/count;
- source and replacement measures;
- strict lexicographic descent witness;
- current child immediate boundary.

The protected proof observation may therefore **re-anchor** from `R` to the
selected live residual `Q` for a surrounding defect-descent automaton.

## What this theorem does not prove

The theorem does not prove:

- the child is winning;
- the replacement residual must complete;
- every protected target block admits a transfer;
- that a later target block transfers again;
- a global equivalence between different physical positions;
- the UC4A 3:1 quotient identity;
- the turn-6 best set.

A surrounding response-total automaton must separately prove a controller
descent from the replacement carrier.

## First-win discipline

The blocking event is applied with ordinary exact first-terminal stopping.
An opponent terminal is a hard falsifier.

Immediate obligations in the nonterminal child are preserved as boundary
metadata.  They are not erased; deterministic forced normalization or another
higher-precedence theorem must handle them.

## Complexity

For `L` live winning lines and fixed Connect-K cardinality:

```text
source/cofactor audit: O(K)
same-track candidate scan: O(L*K)
selection: O(L log L)
```

No recursive legal-move traversal is performed.

## Required qualification controls

1. fresh positive same-track transfer not derived from `44444`;
2. fresh positive transfer with cardinality decrease;
3. rejection for a non-diagonal protected source;
4. rejection when the event is not a protected target;
5. rejection when the opponent target event is terminal;
6. rejection when same-track survivors exist but none strictly lower the
   measure;
7. deterministic structural selection and production/solver/oracle isolation.

## Turn-6 application boundary

The qualified normalized P1 target-transfer census contains exactly one current
protected-target occupation:

```text
source: A6-B5-C4-D3
P1: B5
child replacement: C4-D3-E2-F1
retained overlap: {C4,D3}
mu: (3,8) -> (3,4)
```

This consumed application motivated the theorem but is not a premise.

Promotion into the turn-6 proof additionally requires the strict normalized
P1 response-descent audit to close and a finite well-founded automaton theorem.
