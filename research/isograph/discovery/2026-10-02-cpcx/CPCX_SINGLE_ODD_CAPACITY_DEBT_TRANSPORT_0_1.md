# CPCX Single Odd-Capacity Debt Transport 0.1

**Date:** 2026-10-03  
**Status:** qualified generic support/parity theorem  
**Scope:** experimental CPCX temporal-control algebra  
**Originating application:** turn-6 center-spine handoff  
**Production CPC / solver:** unchanged

## Purpose

Formalize the parity-control carrier exposed by the turn-6 center-spine equivalence.

After the center column is saturated and removed from the live action space, the
turn-6 handoff support has exactly one side column with odd remaining capacity. The
other live side columns have even remaining capacity.

This unique odd column is the concrete current-state carrier of the previously
hypothesized unmatched response debt.

The theorem is pure support/parity algebra. It does not by itself license a strategic
response.

## State

Let the included live columns have remaining capacities

~~~text
C_i = H - h_i.
~~~

Assume exactly one included column delta has odd capacity:

~~~text
C_delta = 1 mod 2
C_j     = 0 mod 2 for j != delta.
~~~

Call delta the **single odd-capacity debt column**.

The debt is reconstructed directly from current support; no history tag is required.

## Two-event transport theorem

Let the adversary trigger column e.

A controller response preserves the one-debt class by either of two forms.

### Self-stutter

Respond in e:

~~~text
e ; e
~~~

The same capacity bit is toggled twice, so the parity vector is restored and:

~~~text
delta' = delta.
~~~

### Debt switch

If e != delta, respond in delta:

~~~text
e ; delta
~~~

The trigger toggles e from even to odd. The response toggles delta from odd to even.
Therefore:

~~~text
delta' = e.
~~~

The unmatched response debt has moved from delta to the trigger column.

No scalar game value is asserted. This is an exact GF(2) support transition.

## Exclusion

A response in a third column r distinct from both e and delta toggles three relevant
parity bits across the macro and does not preserve the single-debt class.

The theorem therefore rejects such a response as a parity-debt transition unless a
separate richer multi-debt theorem is supplied.

## Top-exhaustion boundary

If the selected response column has no cell remaining after the adversary trigger,
the ordinary two-event restoration cannot be completed.

The theorem emits:

~~~text
TOP_EXHAUSTION_DEBT_BOUNDARY
unmatchedResponseCount = 1
~~~

rather than treating the state as an arbitrary failure.

This exactly matches the older parity-debt interpretation:

~~~text
paired control
-> carried unmatched debt
-> top exhaustion exposes the debt
-> attached external repair transports it
~~~

The existing top-exhaustion phase-debt blocker theorem is the candidate composition
edge for that boundary.

## Turn-6 distance law

In the standard 7x6 center-spine handoff, let d be the distance of the current debt
column from center.

The qualified defect-distance common-RLC rule uses only self-stutter and debt-switch
responses and induces:

~~~text
d=1 -> d' in {1,2,3}
d=2 -> d' in {2,3}
d=3 -> d'=3
~~~

Thus debt distance never moves inward.

Every completed trigger/response macro also consumes exactly two physical side slots.

Hence the lexicographic quantity

~~~text
(3-d, totalRemainingSideCapacity)
~~~

strictly decreases on every completed macro:

- if debt moves outward, the first coordinate decreases;
- otherwise total remaining capacity decreases by two.

This is a well-founded progress measure for the parity-control automaton. It is not
yet a win measure; terminal direction and response admissibility remain CPCX/RLC
obligations.

## Qualification

Implementation:

- cpcx-parity-debt.mjs
- cpcx-parity-debt.test.mjs

Qualification run:

- 37140387006 — SUCCESS
- head: 0f54b34e21d6ab07b9988fd56d90f9879c600531

Controls passed:

- all six turn-6 handoff supports reconstruct exactly one odd side debt;
- generic same-column self-stutter;
- generic debt switch;
- all 36 applications of the qualified distance response rule preserve one debt;
- debt distance never moves inward in those applications;
- the lexicographic measure strictly decreases;
- a fresh top-exhaustion fixture emits exactly one unmatched debt;
- a third-column response is rejected;
- solver/oracle/production isolation.

## Composition boundary

This theorem supplies:

~~~text
support parity state
+ debt location
+ exact debt transport
+ well-founded support progress
~~~

It does not supply:

~~~text
strategic response admissibility
residual obligation coverage
first-win safety
terminal direction
~~~

Those must be supplied by the saturated-column cofactor, bounded residual-defect
transport, common-RLC response theorem, and CPCX first-win/RCIC machinery.

The intended composite state is therefore:

~~~text
Q = (
  saturated-column cofactor,
  bounded residual defect,
  single odd-capacity debt column,
  CPCX response/first-win resources
)
~~~

This is the current polynomial-time equivalence candidate for the turn-6 handoff.
