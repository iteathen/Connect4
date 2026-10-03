# CPCX Protected Residual Support Advance 0.1

**Status:** frozen theorem contract before implementation  
**Scope:** experimental CPCX only  
**Observation:** one controller support event below one protected residual target

## Purpose

Certify the simplest monotone transition needed by the UC4A diagonal-support automaton.

A controller may own a live residual whose selected missing target is not yet
playable because one or more support cells are empty below it.  If the
controller occupies the current frontier in that target column, while that
frontier cell is not itself part of the residual, the protected residual should
remain unchanged and the selected target's support distance should decrease by
one.

This geometric fact is not sufficient by itself under first-win semantics.  A
support event may release an opponent terminal elsewhere or directly above the
played support cell.  Therefore the theorem includes an explicit immediate
first-win guard.

## Objects

Let `S` be one exact nonterminal finite-gravity position.

Let:

- `A=S.mover` be the controller;
- `D=A^1`;
- `R` be one exact live `A` residual;
- `t` be one selected missing cell of `R`;
- `d` be the current frontier cell in `t`'s column.

## Premises

1. **Exact nonterminal source.** `S` is exact and nonterminal.

2. **No higher-precedence source obligation.** Current immediate CPCX
   classification is `NO_IMMEDIATE_OBLIGATION`.

3. **Exact live protected residual.** `R` is live for `A`, and `t` is a
   current missing cell of `R`.

4. **Positive target support distance.**
   `supportDistance_S(t) >= 1`.

5. **Unique missing role in the target column.** `t` is the only missing cell
   of `R` in its physical column.

6. **Current support frontier.** `d` is exactly the legal current frontier in
   `t`'s column, lies strictly below `t`, and is empty.

7. **Support event is outside the residual.** `d` is not a missing cell of
   `R`.  Therefore `A:d` is a support event, not a residual contraction.

8. **Exact first-win stopping.** Apply `A:d`.
   - if it terminally completes for `A`, return
     `CERTIFIED_FIRST_WIN(A)`;
   - otherwise continue only if no immediate `D` terminal is available in
     the exact child.

9. **Protected cofactor identity.** In the nonterminal child, the same physical
   line remains live for `A` with exactly the same missing-cell set.

10. **Exact support transition.**
    - `supportDistance(t)` decreases by exactly one;
    - every other missing cell of `R` retains its support distance;
    - total support debt over `R` decreases by exactly one.

11. **Phase gauge preservation.** The existing CPCX global event-phase gauge
    theorem compares the same untouched missing-cell set before/after the
    transition and reports invariant relative phase / projected-owner gauge.

## Conclusion

On the nonterminal guarded path emit:

`PROTECTED_RESIDUAL_SUPPORT_ADVANCE`

with exact meaning:

- same residual ancestry;
- same missing-cell set;
- selected target support distance minus one;
- total residual support debt minus one;
- same relative event-phase / projected-owner gauge;
- no immediate opponent first-terminal move after the advance.

Thus the integer residual support debt is a strictly decreasing measure on
every admitted support-advance edge.

## Why this is not a value theorem

The theorem certifies one current event only.

It does not claim:

- that this support advance is globally optimal;
- that the opponent must later supply another support;
- that repeated support advances remain available;
- that the protected residual must eventually complete;
- that all external residuals are irrelevant;
- W/D/L or best-move value.

A surrounding finite transition automaton must prove response totality and
first-win closure.

## Complexity

For fixed CPCX residual cardinality `K<=4`:

- live residual reconstruction: O(live line count);
- fixed support event: O(line incidence);
- cofactor/support comparison: O(K);
- phase gauge comparison: O(K).

No recursive game traversal is used.

## Required qualification controls

1. fresh positive bottom support case;
2. fresh positive non-bottom target case;
3. rejection when the frontier support cell belongs to the residual;
4. rejection when the selected target is already playable;
5. rejection when the event is in the wrong column;
6. rejection when the source has a higher-precedence immediate obligation;
7. rejection when the support event exposes an immediate opponent terminal;
8. phase-gauge and exact missing-set preservation;
9. production-CPC / solver / oracle / recursive-search isolation.

## UC4A use boundary

The qualified move-6 diagonal carrier

`A6-B5-C4-D3`

has one missing cell in each of A/B/C.  Any guarded controller support event in
A, B, or C therefore satisfies the unique-column-role premise geometrically.

Application to the ten-state support simplex still requires the per-state
first-win guard and a separate proof that the resulting child belongs to an
admitted automaton class.
