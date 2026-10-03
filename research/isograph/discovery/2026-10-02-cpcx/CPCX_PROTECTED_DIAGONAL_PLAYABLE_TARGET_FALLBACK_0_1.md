# CPCX Protected Diagonal Playable-Target Fallback 0.1

**Status:** frozen theorem contract before implementation  
**Scope:** experimental CPCX only  
**Observation:** deterministic controller fallback when the highest hidden target is locally poisoned

## Purpose

Narrow one incompleteness in the qualified highest-target controller policy.

The ordinary protected-diagonal highest-target theorem selects the physically
highest missing target. If that target is support-hidden, it advances support
only when the newly released frontier cannot be an immediate opponent terminal.

A valid protected diagonal may also contain another missing target that is
already playable. If the highest hidden target is rejected specifically because
its support move would release an opponent singleton, the controller may
instead acquire one currently playable target of the **same protected
residual**.

This theorem authorizes that deterministic fallback only. It is not arbitrary
controller move selection.

## Objects

Let `S` be one exact nonterminal position with controller `A=S.mover`.

Let `R` be one live diagonal `A` residual.

Let the ordinary CPCX highest-target descent theorem be evaluated first.

Define

```text
mu(R) = (missingCount(R), supportDebt(R))
```

lexicographically.

## Premises

1. **Exact nonterminal source.**

2. **Controller to move.** `R.player=S.mover=A`.

3. **Protected source residual.**
   - `R` is live;
   - `R` is diagonal;
   - missing targets occupy distinct physical columns.

4. **Ordinary highest-target policy rejected for one precise reason.**

```text
certifyCpcxProtectedDiagonalHighestTargetDescent(S,R)
  = NO_CERTIFICATE
  seam = HIGHEST_TARGET_RELEASES_OPPONENT_SINGLETON
```

No other highest-target failure enables this theorem.

5. **Playable protected target exists.** At least one other missing target of
   `R` has support distance zero and is current legal frontier.

6. **Deterministic fallback target.** Among currently playable protected
   targets choose:
   1. greatest physical row;
   2. smallest physical column as tie-break.

   The poisoned highest hidden target is not reconsidered.

7. **Qualified target acquisition.** Apply the existing protected-residual
   target-acquisition theorem to the selected playable target.

8. **Exact acquisition result.** The acquisition theorem must return either:
   - `CERTIFIED_FIRST_WIN(A)`; or
   - `PROTECTED_RESIDUAL_TARGET_ACQUISITION`.

9. **Strict measure descent.** In the nonterminal case, target acquisition
   decreases missing cardinality by one while preserving remaining support
   debt, hence:

```text
mu(R') < mu(R).
```

## Conclusion

Emit either:

```text
CERTIFIED_FIRST_WIN(A)
```

or:

```text
PROTECTED_DIAGONAL_PLAYABLE_TARGET_FALLBACK
  rejectedHighestTarget = ...
  poisonReleaseCell     = ...
  fallbackTarget        = ...
  child                 = exact acquisition child
  childResidual         = same-line contracted residual
  childMeasure          < sourceMeasure
```

The surrounding controller-saturation automaton may continue from the exact
child residual.

## Why this is not arbitrary response search

The theorem does not enumerate future opponent replies.

The fallback target is selected from the current protected residual by a fixed
geometric order and is admitted only after the pre-existing deterministic
highest-target rule fails on one named local safety condition.

The physical move itself is certified by the already-qualified target
acquisition theorem.

## First-win discipline

All source precedence and post-acquisition opponent-terminal guards are owned
by the existing highest-target and target-acquisition theorems.

If target acquisition exposes an immediate opponent terminal, the fallback
fails closed.

## Complexity

For fixed residual cardinality `K<=4`:

```text
highest-target audit: existing polynomial bound
playable-target selection: O(K)
target acquisition: existing O(liveLineCount + K + lineIncidence)
```

No legal-reply tree, minimax, solved table, oracle, or recursive continuation
is used.

## Required qualification controls

### Fresh poisoned-highest positive

Sequence:

```text
23355162534364
```

P0 is to move with protected diagonal:

```text
A3-B4-C5-D6
```

The ordinary highest target `D6` is support-hidden. Supporting it with `D3`
releases an immediate P1 singleton at `D4`, so highest-target descent must
reject with:

```text
HIGHEST_TARGET_RELEASES_OPPONENT_SINGLETON
```

Target `C5` is already playable. The fallback must acquire `C5` and
strictly contract the protected residual.

Additional qualification must include:

1. rejection when highest-target descent succeeds normally;
2. rejection when the highest-target failure has any seam other than the
   opponent-singleton release seam;
3. rejection when no protected target is currently playable;
4. preservation of production-CPC / solver / oracle / recursion isolation.

## Turn-6 application boundary

One of the three target-inheritance A6 seams hands off to:

```text
A2-B3-C4-D5
missing = {B3,C4}
support = [0,3]
```

The ordinary highest-target policy selects hidden `C4` and rejects its support
advance on a local opponent-singleton release.

`B3` is already playable. This consumed fixture is the target application
for the generic fallback, not a theorem premise.

This theorem alone does not prove the turn-6 best set.
