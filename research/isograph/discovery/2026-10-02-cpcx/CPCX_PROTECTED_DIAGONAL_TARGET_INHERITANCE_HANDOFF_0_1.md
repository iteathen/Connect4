# CPCX Protected Diagonal Target-Inheritance Handoff 0.1

**Status:** frozen theorem contract before implementation  
**Scope:** experimental CPCX only  
**Observation:** opponent block kills one protected diagonal but exposes a strictly smaller live diagonal inheriting an unblocked source target

## Purpose

Close the narrow protected-carrier seam not covered by the qualified same-track
diagonal transfer or anchor-pivot transfer theorems.

The source is one live controller diagonal residual `R`. The opponent occupies
one currently playable missing target `x`, killing `R`. In the exact child,
a different controller diagonal may remain live that:

- excludes the blocked cell;
- contains at least one still-empty source target from `R\{x}`;
- has strictly smaller missing cardinality.

This theorem permits re-anchoring the protected observation on that inherited
target carrier.

It is a structural progress theorem only. It does not claim the replacement
residual is forced to complete and does not infer W/D/L.

## Objects

Let `S` be an exact nonterminal finite-gravity position.

Let:

- `A` own one protected live diagonal residual `R`;
- `D=S.mover=A^1`;
- `x` be one currently playable missing target of `R`.

For a live residual `Q`, define:

```text
supportDebt(Q) = sum supportDistance(t)
tau(Q) = (missingCount(Q), supportDebt(Q))
mu(S,Q) = (missingCount(Q), supportDebt(Q), remainingCapacity(S))
```

with lexicographic order.

## Premises

1. **Exact nonterminal source.** `S` is exact and nonterminal.

2. **Opponent to move.** `S.mover=D=A^1`.

3. **Protected source residual.**
   - `R` is live for `A`;
   - `R.orientation` is diagonal;
   - `R` has at least two missing cells.

4. **Protected target block.**
   - `x in R.missingCells`;
   - `supportDistance_S(x)=0`;
   - `x` is current legal frontier.

5. **Exact source kill.** Owner-labelled residual cofactor algebra verifies that
   `D:x` kills `R`.

6. **First-win block guard.** Exact event `D:x` is nonterminal.

7. **Inherited target set.** Define

```text
I = R.missingCells \ {x}.
```

Every cell in `I` remains physically empty immediately after the block unless
it equals `x`, which has already been removed.

8. **Target-inheritance candidate.** A child residual `Q` is admissible only if:
   - `Q.player=A`;
   - `Q` is diagonal;
   - the physical line of `Q` excludes blocked cell `x`;
   - `Q.missingCells ∩ I` is nonempty;
   - `missingCount(Q) < missingCount(R)`.

9. **Deterministic structural selection.** Among admissible `Q`, choose by:
   1. smallest missing cardinality;
   2. largest inherited-target count;
   3. smallest support debt;
   4. smallest physical line ID.

   No solved value, class ID, remoteness, or future certificate is used.

10. **Strict measure descent.** Premise 8 gives strict descent in the first
    coordinate:

```text
mu(child,Q) < mu(S,R).
```

The consumed block also decreases remaining physical capacity by one.

## Conclusion

Emit

```text
PROTECTED_DIAGONAL_TARGET_INHERITANCE_HANDOFF
```

containing:

- exact blocked event;
- exact source cofactor kill;
- exact child;
- source protected residual;
- inherited source-target set;
- every admissible child candidate;
- deterministic selected child residual;
- inherited target cells carried into the selected residual;
- source and child measures;
- strict measure-descent witness;
- exact child immediate boundary.

The surrounding protected-diagonal automaton may track the selected child
residual as its next protected carrier.

This conclusion is a **carrier handoff**, not a first-win conclusion.

## Relationship to existing transfer theorems

Use transfer rules in this order:

1. same-track diagonal transfer;
2. anchor-pivot transfer;
3. target-inheritance handoff.

The third rule is deliberately narrower than arbitrary overlapping-diagonal
selection because it requires both a concrete inherited source target and strict
missing-cardinality descent.

It does not weaken or subsume the earlier rules.

## First-win discipline

The block event is checked with exact first-terminal stopping.

The child's immediate CPCX boundary is retained unchanged. A later proof must
still close:

- opponent immediate terminals;
- forced normalizations;
- response-capacity overloads;
- support-release hazards.

`NO_CERTIFICATE` remains epistemic only.

## Complexity

For `L` live lines and fixed residual cardinality `K<=4`:

```text
source/cofactor audit:       O(K)
child residual scan:         O(L*K)
target-intersection audit:   O(L*K)
deterministic selection:     O(L log L)
```

There is no recursive legal-move-tree traversal.

## Required qualification controls

### Fresh strict handoff

Sequence:

```text
12222
```

P1 is to move. Protect P0 residual:

```text
B4-C3-D2-E1
missing = {C3,D2,E1}
```

P1 blocks `E1`.

Expected child handoff:

```text
A1-B2-C3-D4
missing = {C3,D4}
inherited target = C3
missing cardinality 3 -> 2
```

### Equal-cardinality rejection

Sequence:

```text
1
```

Protect P0 residual:

```text
B1-C2-D3-E4
missing cardinality = 4
```

P1 blocks `B1`.

Overlapping child diagonals exist, but the fresh control contains no
target-inheriting diagonal with missing cardinality below 4. The theorem must
fail closed.

### First-terminal rejection

Sequence:

```text
112131
```

Protect the nonmover diagonal containing playable `D1`.

The current mover's `D1` event is terminal. The theorem must reject rather
than transport past first-win stopping.

Additional tests must cover a hidden/nonplayable blocked target and
production-CPC / solver / oracle / recursion isolation.

## Turn-6 application boundary

At the current one-window recurrence seam, three exact `100000` opponent
boundaries expose:

```text
source protected diagonal:
  A6-B5-C4-D3
  missing = {A6,B5,C4}

opponent event:
  A6
```

The block kills the source and is currently classified `NO_TRANSFER` by the
same-track and anchor-pivot rules.

All three exact children retain the diagonal:

```text
A2-B3-C4-D5
missing = {B3,C4}
```

which inherits source target `C4` and drops missing cardinality from 3 to 2.

These consumed states are an application target only. They are not premises of
the generic theorem.

Even if this handoff qualifies, `Best(44444)` remains unproved until the
selected child carriers are shown response-total under the existing protected
descent machinery.
