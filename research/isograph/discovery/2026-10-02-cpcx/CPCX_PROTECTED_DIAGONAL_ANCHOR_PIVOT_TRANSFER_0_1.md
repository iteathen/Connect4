# CPCX Protected Diagonal Anchor-Pivot Transfer 0.1

**Status:** frozen theorem contract before implementation  
**Scope:** experimental CPCX only  
**Observation:** exact re-anchoring across diagonal orientation after an opponent blocks one protected target

## Purpose

Handle a narrow transfer geometry not covered by the qualified same-track
diagonal transfer theorem.

A controller may own an anchored diagonal residual with one unique already-owned
line cell and several missing targets. If the opponent occupies one playable
target, the source line dies. The exact child may still contain a live
controller diagonal of the opposite orientation through the same owned anchor.

This theorem permits that pivot only when the protected defect measure does not
increase, and uses remaining physical capacity as the final well-founded
coordinate.

It does **not** loosen the existing same-track transfer theorem and does not
permit arbitrary overlapping-diagonal transfer.

## Objects

Let `S` be an exact nonterminal finite-gravity position.

Let:

- `A` be the owner of one protected live diagonal residual `R`;
- `D=S.mover=A^1`;
- `x` be one currently playable missing cell of `R`;
- `a` be the unique physical line cell of `R` already owned by `A`.

For a live residual `Q`, define

```text
tau(Q) = (missingCount(Q), supportDebt(Q))
supportDebt(Q) = sum supportDistance(t)
```

and define the extended finite measure

```text
mu(S,Q) = (missingCount(Q), supportDebt(Q), remainingCapacity(S))
```

ordered lexicographically, where

```text
remainingCapacity(S) = boardCellCount - S.rank.
```

## Premises

1. **Exact nonterminal source.** `S` is exact and nonterminal.

2. **Opponent to move.** `S.mover=D=A^1`.

3. **Anchored source residual.**
   - `R` is live for `A`;
   - `R.orientation` is diagonal;
   - exactly one physical source-line cell is already owned by `A`;
   - every other source-line cell is a current missing cell of `R`;
   - that unique owned cell is the anchor `a`.

4. **Protected target block.**
   - `x in R.missingCells`;
   - `x` has support distance zero;
   - `x` is the current legal frontier in its column.

5. **Exact cofactor kill.** Owner-labelled residual algebra verifies that
   `D:x` kills `R`.

6. **First-win block guard.** Exact event `D:x` is nonterminal. An opponent
   terminal fails closed.

7. **Anchor survives.** In the exact child `T`, cell `a` is still owned by
   `A`.

8. **Pivot candidates.** A candidate `Q` must be a live `A` residual in
   `T` such that:
   - `Q` is diagonal;
   - `Q.orientation != R.orientation`;
   - the physical winning line of `Q` contains anchor `a`;
   - the physical line of `Q` does not contain blocked cell `x`.

9. **Nonincreasing protected tuple.**

```text
tau(Q) <= tau(R)
```

lexicographically.

10. **Strict extended descent.** Since `D:x` consumes exactly one physical
    cell,

```text
remainingCapacity(T) = remainingCapacity(S) - 1.
```

Therefore Premise 9 implies

```text
mu(T,Q) < mu(S,R).
```

11. **Deterministic structural selection.** Among admitted pivot candidates,
    choose by:
    1. smallest missing cardinality;
    2. smallest support debt;
    3. smallest physical line ID.

    No solved outcome, remoteness, class ID, or future certificate is used.

## Conclusion

Emit

```text
PROTECTED_DIAGONAL_ANCHOR_PIVOT_TRANSFER
```

containing:

- exact blocked event;
- source residual and unique anchor;
- exact source cofactor kill;
- exact child;
- selected opposite-orientation pivot residual;
- source and pivot tuples;
- source and child remaining capacity;
- strict extended-measure descent witness;
- child immediate boundary.

The surrounding protected-carrier automaton may re-anchor from `R` to `Q`.

## Relationship to same-track transfer

The existing same-track theorem remains the preferred transfer whenever it
applies.

This theorem is a distinct edge:

```text
same-track transfer:
  same orientation + same diagonal track + strict tau decrease

anchor-pivot transfer:
  opposite orientation + same unique owned anchor
  + tau nonincrease + strict remaining-capacity decrease
```

Neither theorem authorizes arbitrary diagonal overlap.

## First-win discipline

The blocking event is checked with exact stopping.

The theorem does not erase the child's immediate CPCX boundary. Any controller
forced response, opponent overload, or other first-win condition is preserved
for the surrounding automaton.

## Complexity

For `L` live winning lines and fixed residual cardinality `K<=4`:

```text
source/cofactor audit: O(K)
pivot candidate scan: O(L*K)
deterministic selection: O(L log L)
```

No recursive legal-move traversal is performed.

## Required qualification controls

1. Fresh strict-tuple pivot, independent of `44444`.
2. Fresh equal-tuple pivot where strict descent comes only from remaining
   capacity.
3. Rejection when the source has no unique owned anchor.
4. Rejection when the blocked event is not a protected playable target.
5. Rejection when the block terminally wins for the opponent.
6. Rejection when only pivot candidates with larger protected tuple exist.
7. Deterministic selection and production/solver/oracle/recursion isolation.

## Fresh controls frozen before implementation

### Strict tuple control

Sequence:

```text
2244422
```

with P1 to move.

Protected P0 source:

```text
A6-B5-C4-D3
anchor D3
B5 playable
```

After `P1:B5`, the expected opposite-diagonal candidate

```text
B1-C2-D3-E4
```

has strictly smaller protected tuple.

### Equal tuple / capacity descent control

Sequence:

```text
724442223
```

with P1 to move.

Protected P0 source:

```text
A6-B5-C4-D3
anchor D3
tau = (3,7)
B5 playable
```

After `P1:B5`, the expected opposite-diagonal candidate

```text
C2-D3-E4-F5
```

has the same protected tuple `(3,7)`.

The transition is nevertheless strictly decreasing under `mu` because one
physical cell has been consumed.

These controls are geometry/rule derived and independent of the consumed
turn-6 U30 fixture.

## Turn-6 boundary

The consumed A-cycle diagnostic isolates one same-track failure:

```text
U30 normalized boundary
P1:B5
source tau = (3,7)
anchor D3
```

The exact child contains the equal-tuple pivot candidates:

```text
C2-D3-E4-F5
D3-E4-F5-G6
```

This fixture may be used only after generic qualification.

The theorem by itself does not prove `Best(44444)`.
