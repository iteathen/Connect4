# CPCX Saturated-Column Cofactor Homomorphism 0.1

**Date:** 2026-10-03
**Status:** qualified generic theorem
**Scope:** experimental CPCX / RLC structural equivalence
**Originating application:** turn-6 center-column exhaustion after 44444
**Production CPC / solver:** unchanged

## Purpose

Formalize the exact equivalence created when one gravity column becomes saturated.

A full column is no longer a live action dimension. Its owner word is immutable for
every future continuation. Therefore it may be compiled out of the live action space,
provided its contribution to every winning line is retained as an exact owner-labelled
cofactor.

This is not support-only equivalence. It is an exact transition homomorphism for the
remaining columns.

## Objects

Let S be an exact nonterminal finite-gravity Connect-K position.

Let c be a saturated column:

~~~text
height_S(c) = H
~~~

For each player p and each geometric winning line L:

1. if L contains a fixed token of player p^1 in column c, L is permanently dead for p;
2. otherwise remove every fixed p-owned cell of L in column c from p's requirement;
3. retain the remaining cells outside c as the projected residual;
4. lines containing fixed tokens of both players are dead for both.

The resulting owner-labelled residual family is the saturated-column cofactor Q_c(S).

The quotient also retains:

- geometry of the remaining columns;
- their support heights and owner occupancy;
- current mover/rank parity;
- original winning-line identity when provenance is required.

No future action in c exists.

## Theorem

For every legal nonterminal event e outside c:

~~~text
Q_c(tau_e(S)) = tau_hat_e(Q_c(S))
~~~

where tau_hat is the ordinary owner-labelled residual cofactor/kill transition on the
projected residual family, together with the unchanged gravity transition in e's
remaining column.

Thus projection and legal side-column transition commute exactly.

## Why

The saturated owner word in c is immutable.

For every original winning line independently:

- an opponent fixed token in c kills the line forever;
- an own fixed token in c is already satisfied forever;
- all unsatisfied cells lie outside c;
- an outside event contracts the mover's projected residual exactly when it contracts
  the original line;
- the same outside event kills the opponent projected residual exactly when it kills
  the original line.

Gravity is column-local, so deleting a saturated column from the live action set cannot
alter support legality in any other column.

Therefore the projected residual system is a homomorphic image of every future
nonterminal continuation.

By induction, any finite side-event script before first terminal has the same residual
transition semantics in the physical state and in Q_c.

## First-win preservation

A projected residual becomes empty for player p on event e iff the corresponding
original winning line becomes complete for p on the same event.

Therefore first terminal identity is preserved, provided ordinary first-win stopping
is applied immediately in both systems.

The quotient does not license post-terminal events.

## RLC consequence

Any rank-local statistic that depends only on:

- legal landing support;
- mover-live line incidence at the landing;
- opponent-live line incidence at the landing;
- remaining same-column capacity;

may be computed directly from Q_c.

In particular, the first-five RLC tuple

~~~text
(A,B,H)
~~~

is preserved exactly for every legal landing outside c.

Therefore saturation does not invalidate RLC. It changes the live requirement
hypergraph from the original geometry to the exact saturated-column cofactor geometry.

## Standard 7x6 turn-6 specialization

At 444444, column D is saturated with the gauge-aligned owner word:

~~~text
P1,P2,P1,P2,P1,P2
~~~

from bottom to top.

The exact quotient has, per player:

- 18 four-cell residuals, all vertical and entirely off-center;
- 24 three-cell residuals induced by horizontal/diagonal lines crossing D;
- total 42 live residuals.

The center-crossing residuals are assigned by the fixed center-row parity:

~~~text
P1 anchors: D1,D3,D5
P2 anchors: D2,D4,D6
~~~

with, per player:

~~~text
12 horizontal three-cell residuals
6 D+ three-cell residuals
6 D- three-cell residuals
~~~

All three vertical winning lines in D contain both owners and are dead to both.

Thus the informal "empty board except for the center tokens" statement becomes exact:

~~~text
virgin six-column side substrate
+ fixed player-specific three-cell boundary residuals
+ ordinary side vertical four-cell residuals
~~~

The center geometry is retained as a static parity boundary field rather than a live
column.

## Complexity

For N geometric winning lines of cardinality K:

~~~text
compile quotient: O(N*K)
one event update: O(incident residual count * K)
~~~

For fixed Connect Four K=4.

No legal-reply tree, minimax, solved table, opening book or oracle is required.

## Required qualification

Generic implementation must include:

1. standard 7x6 alternating saturated center;
2. a non-alternating saturated column word;
3. a saturated edge column;
4. every current legal side event from at least one fresh source;
5. an own-residual contraction;
6. an opponent residual kill;
7. an event that completes a projected residual and the same physical winning line;
8. rejection when the selected column is not saturated;
9. production CPC / solver / oracle / recursive-search isolation.

## Turn-6 equivalence boundary

This theorem establishes an exact equivalence after center saturation.

It does not by itself identify the two owner-exchange orderings

~~~text
44444 x 4
44444 4 x
~~~

because their saturated center owner words differ at D6 and their side owner differs at
x1.

Those states should instead be represented as:

~~~text
gauge-aligned saturated-column base
+ bounded owner-gauge defect descriptor
~~~

The defect descriptor is a separate equivalence coordinate.

The remaining turn-6 proof question is whether that bounded defect coordinate is a
congruence for an RLC/RCIC continuation class, or can be routed by a finite correction
theorem into the same class.


## Qualification result

Generic implementation:

- `cpcx-saturated-column-cofactor.mjs`
- `cpcx-saturated-column-cofactor.test.mjs`

Qualification workflow run:

- `37139482958` — SUCCESS
- qualification head: `332a7ba4e11abc3eb26002a33f6ffc7ac0f28c12`

Controls passed:

- alternating saturated center: exact 42 residuals per player;
- exact residual-size census: 24 three-cell + 18 four-cell per player;
- RLC `(A,B,H)` computed directly from the cofactored hypergraph;
- every current side event from `444444` commutes with projection;
- non-alternating saturated-center control;
- saturated edge-column control;
- projected residual completion matches the same physical first terminal;
- unsaturated-column rejection;
- solver/oracle/production isolation.

The theorem is qualified as a transition-equivalence primitive. It does not by itself
prove a turn-6 game value or a complete RCIC continuation.
