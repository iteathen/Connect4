# CPCX Center-Spine Defect Common-RLC Response Lemma 0.1

**Date:** 2026-10-03  
**Status:** frozen theorem contract after exhaustive current-rank qualification of the turn-6 handoff family  
**Scope:** standard 7x6 center-spine handoff; rank-local structural response only  
**Production CPC / solver:** unchanged

## Purpose

Give the saturated-center / bounded-defect equivalence a usable response rule.

The relevant paired states have:

- standard 7x6 geometry;
- saturated center column D;
- identical side support and mover;
- one gauge-aligned representative;
- one representative differing by the owner exchange on D6 and one bottom side cell X1;
- exact bounded residual defect carried by the qualified residual-defect transport theorem.

Let

~~~text
d = |column(X)-4| in {1,2,3}
~~~

be the reflection-invariant defect distance from center.

After one common legal adversary event in side column e, compute the original RLC
Pareto frontier on the exact saturated-column cofactor in both representatives.

The theorem supplies one column that belongs to both Pareto frontiers.

## Response rule

For one-based columns:

~~~text
d = 1:
    respond X

d = 2:
    if e is an edge column {1,7}, respond X
    otherwise respond e

d = 3:
    respond e
~~~

Equivalently:

~~~text
R(d,X,e) =
  X                         if d=1
  X                         if d=2 and e is an edge
  e                         otherwise
~~~

The rule is reflection invariant.

It depends only on:

- center location;
- the bottom gauge-defect column X;
- distance d;
- current adversary event column e.

It does not depend on the original move number, U-class identifier, solved value,
history string, or future continuation.

## Qualified current-rank statement

For every one of the six owner-exchange handoff pairs

~~~text
44444 X 4
44444 4 X
~~~

with X != 4, and for every current common legal side event e:

1. bounded residual-defect transport is exact;
2. no first-terminal divergence occurs on e;
3. the residual defect does not grow;
4. after e, the selected response R(d,X,e) is legal;
5. R(d,X,e) belongs to the exact RLC (A,B) Pareto frontier of both paired states.

Thus the same rank-local response is licensed without deciding which owner-exchange
representative is the semantic normal form.

## Qualification census

The exact current-rank census contains:

~~~text
6 handoff pairs
x 6 current side events
= 36 paired adversary events
~~~

Results:

~~~text
36/36 nonterminal
36/36 have nonempty common RLC Pareto frontier
36/36 selected by R(d,X,e) are common Pareto responses
0 terminal divergences
0 defect growth
~~~

The common-frontier cardinality ranges from 1 through 4; the theorem does not require
the raw Pareto sets themselves to be equal.

## Meaning

This is the constrained equivalence needed at the turn-6 handoff.

The two physical states are not identified.

Instead:

~~~text
common saturated-center cofactor
+ bounded residual defect
~~~

admits a common controller action selected from the same RLC calculus.

The defect changes local A/B scores, but at this boundary it does not force a different
controller response.

This is stronger than support equivalence and weaker than global state equivalence.

## Relationship to exhausted-max handoff

At 44444:

- D6=(6,6,0) is the unique RLC maximum;
- if P2 declines D6, P1 takes D6;
- if P2 consumes D6, P1 takes a reflected side maximum 3 or 5.

After that handoff, the paired representations differ by the bounded X1/D6 gauge
defect.

The present lemma shows that after the next adversary side event, the same RLC
controller action can be selected in both representations.

Therefore the old UNIQUE_MAX_EXHAUSTS_COLUMN boundary is not an immediate breakdown
of the rank-local calculus. It hands control into a defect-corrected RLC class.

## Complexity

The response rule itself is O(1).

Qualification of membership in both exact RLC Pareto frontiers is polynomial in the
cofactored live-line incidence:

~~~text
O(legalColumns * liveResidualCount)
~~~

Bounded residual-defect transport is separately polynomial.

No recursive legal-move search is used.

## Proof boundary

This lemma proves one current adversary-response macro layer in the exact turn-6
handoff family.

It does not yet prove:

- indefinite closure of the same response rule;
- a complete RCIC;
- a Player-1 forced win from the handoff;
- Best(44444)=all legal moves.

The next composition target is to show that applying R(d,X,e) either:

1. enters an already-qualified CPCX/RLC certificate class; or
2. reconstructs the same bounded center-spine defect class with a strict
   well-founded measure decrease.

That is the remaining step needed to convert this common-response lemma into a
reusable controlled-invariant transition.
