# CPCX Vertical Three-Stage Setup 0.1

**Status:** frozen theorem contract; implementation/qualification pending  
**Scope:** experimental CPCX only  
**Observation:** exact one-event setup into the qualified vertical two-stage class

## Purpose

Lift the existing CPCX vertical two-stage theorem by one support level without
introducing reply search.

The existing exact primitive handles a live vertical residual whose two missing
cells are consecutive and have support distances

```text
[0,1].
```

A common predecessor is a vertical residual with three consecutive missing
cells at

```text
[0,1,2]
```

while the residual owner is to move.

The bottom event is then a deterministic structural setup: after the owner
occupies it, the same winning line contracts to the qualified two-stage shape.

This theorem certifies that setup transition only.  It does not infer that the
two-stage successor ultimately wins unless the existing two-stage composition
or a later theorem closes it.

## Objects

Let `S` be one exact nonterminal finite-gravity position.

Let:

- `A=S.mover` be the selected controller;
- `D=A^1`;
- `R` be one live vertical `A` residual with exactly three missing cells;
- in increasing row order, those cells are `x0,x1,x2`.

## Premises

Certification requires:

1. **Exact nonterminal source.** `S` is exact and nonterminal.

2. **Controller to move.** `R.player=S.mover=A`.

3. **Exact vertical ancestry.** `R` is one current live winning-line residual,
   has orientation `V`, and has exactly three missing cells.

4. **Consecutive geometry.**
   `x0,x1,x2` occupy one column and consecutive rows.

5. **Exact support profile.**

```text
supportDistance(x0)=0
supportDistance(x1)=1
supportDistance(x2)=2.
```

6. **No source immediate obligation supersedes setup.** Current immediate CPCX
   classification is `NO_IMMEDIATE_OBLIGATION`.  If a current terminal or
   forced response already exists, the ordinary higher-precedence theorem must
   handle it instead.

7. **Exact setup event.** `A:x0` is legal.  If it terminally completes for
   `A`, the setup may return `CERTIFIED_FIRST_WIN(A)`.

8. **No defender terminal after nonterminal setup.** If `A:x0` is
   nonterminal, the exact child has no currently playable `D` terminal.

9. **Two-stage reconstruction.** In the exact child, the same physical winning
   line is live for `A` with missing set `{x1,x2}`, and those cells have
   support distances `[0,1]`.

10. **Existing two-stage theorem exactness.**
    `certifyCpcxVerticalTwoStage` on that reconstructed demand returns an exact
    supported certificate.  For the ordinary defender-to-move child this is
    expected to be `PREEMPT_OR_FORCED_UPPER`; no new response semantics are
    introduced here.

## Conclusion

If `A:x0` terminally completes, emit:

```text
CERTIFIED_FIRST_WIN(A).
```

Otherwise emit:

```text
VERTICAL_THREE_STAGE_SETUP
  setupEvent = A:x0
  child      = exact physical child
  handoff    = exact CPCX vertical two-stage certificate on {x1,x2}.
```

The one-event setup plus the child two-stage macro may be composed as one
higher-level forcing macro.

For the usual defender-turn two-stage handoff:

```text
preempt branch: setup 1 + preempt 1 = 2 events
delayed branch: setup 1 + delayed 3 = 4 events
```

so both continuing classes:

- return the mover to `A`;
- have even total rank delta;
- remain control-parity equivalent.

## First-win semantics

The source setup and the inherited two-stage theorem both use exact
first-terminal stopping.

An immediate defender terminal after setup is a theorem falsifier, not an
unresolved branch to search.

`NO_CERTIFICATE` has no loss/draw meaning.

## Complexity

For one candidate residual:

```text
residual/geometry audit: O(K)
one fixed event:         O(line incidence)
two-stage handoff:       existing CPCX two-stage bound
```

with CPCX `K<=4`.

There is no recursive legal-move traversal.

## Required qualification controls

Qualification must include:

1. a fresh standard-board positive case not derived from `44444`;
2. a positive case at a nontrivial source rank;
3. rejection when the three cells are not consecutive;
4. rejection when the support profile is not exactly `[0,1,2]`;
5. rejection or precedence handoff when the source has an immediate obligation;
6. rejection when the setup exposes a defender immediate terminal;
7. regression showing the reconstructed child is accepted by the existing
   two-stage theorem rather than a duplicated response implementation;
8. production-CPC / solver / oracle / recursion isolation.

## Move-6 boundary

The current UC4A/CPCX center diagnostic contains a post-transport state with the
P0 vertical residual

```text
A3-A4-A5-A6
missing = {A4,A5,A6}
support = [0,1,2].
```

That state motivated the check but is not a theorem premise.

Even if the generic setup qualifies, it does not by itself prove the center
sixth move or `Best(44444)`.
