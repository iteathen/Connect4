# CPCX exhausted-center maximum handoff / center-gate exchange 0.1

**Date:** 2026-10-03  
**Research direction / originating turn-6 observation:** Joshua Oshiro  
**Status:** exact rank-local structural facts established; continuation congruence still open  
**Scope:** experimental CPCX / RLC bridge; no solved-value premise  
**Production CPC / solver:** unchanged

## Purpose

Record the turn-6 structural observation that resolves the meaning of the old RLC
UNIQUE_MAX_EXHAUSTS_COLUMN boundary at prefix 44444.

The prior rank-local pre-search calculator proved the first five center moves using the
landing tuple (A,B,H), where:

- A is the number of mover-live winning lines incident to the landing;
- B is the number of opponent-live winning lines denied by the landing;
- H is the number of empty same-column cells remaining above the landing.

At 44444, column 4 / cell D6 is still the unique Pareto maximum:

~~~text
D6 = (6,6,0)
~~~

The earlier runtime conservatively returned UNRESOLVED because H=0: taking D6 fills
the center column.

The new observation is that this exhaustion is not merely loss of a local resource.
At this exact boundary, it induces a two-case handoff.

## 1. Exact rank-6 dichotomy

After P2 makes the sixth move from 44444, exactly one of two structural classes exists.

### A. Center consumed

Sequence: 444444.

Facts:

- D6 is occupied by P2;
- column 4 is saturated;
- all six off-center columns are untouched;
- P1 is to move.

The center owner word from bottom to top is:

~~~text
P1, P2, P1, P2, P1, P2
~~~

Thus the center is an alternating parity spine.

Every winning line that avoids column 4 has exactly the same ownership projection as
on the empty board. The only correction to the empty-board substrate is the fixed
center-incidence boundary.

For single-center-cell crossing lines:

- center rows 1,3,5 are P1 anchors;
- center rows 2,4,6 are P2 anchors.

Every vertical length-4 line in column 4 contains both owners and is dead to both.

The P1 RLC Pareto frontier becomes exactly {3,5}, with reflection symmetry and
positive remaining height.

### B. Center declined

For every sixth move x in {1,2,3,5,6,7}, the position 44444x has:

- exactly one off-center P2 token;
- D6 still legal;
- P1 to move.

More strongly, the exact D6 RLC tuple is unchanged:

~~~text
D6 = (6,6,0)
~~~

and D6 remains the unique Pareto maximum for P1.

Therefore an off-center P2 event does not destroy, weaken, or split the exhausted
center maximum. It passes that rank-local control object intact to the opponent.

This is the central new fact.

## 2. Center-gate quotient

At rank 6 define:

- G=1 iff the center gate D6 remains open;
- E = number of off-center tokens added on move 6.

Then for all seven legal sixth moves:

~~~text
G = E in {0,1}
~~~

and:

~~~text
G + untouched_off_center_columns = 6
~~~

Hence P2 cannot both consume the center gate and perturb an off-center column on the
same move.

The two possibilities are exhaustive:

~~~text
consume center -> virgin side substrate passes to P1
decline center -> unchanged exhausted center maximum passes to P1
~~~

This is a rank-local resource-exchange statement, not a game-value statement.

## 3. Two-event exchange identity

For every off-center column x, compare:

~~~text
44444 x 4
44444 4 x
~~~

The two positions have:

- identical support heights;
- identical mover;
- identical owner labels on every cell except x1 and D6.

On those two cells ownership is exchanged exactly.

Therefore every winning line outside the incidence cone of {x1,D6} is identical
between the two positions.

Symbolically:

~~~text
support(x ; 4) = support(4 ; x)

owner(x ; 4)
  = owner(4 ; x) with owners swapped only on {x1,D6}
~~~

This is the precise equivalence object suggested by the turn-6 observation. It is not
full physical-state equality.

## 4. One-response macro convergence

Use the rank-local response:

~~~text
P2 sixth move x != 4 -> P1 plays 4
P2 sixth move 4      -> P1 plays 3 or reflected 5
~~~

Every branch then has:

- saturated center column;
- exactly one occupied off-center bottom cell;
- the same physical rank and mover class.

In particular, 4444443 and 4444434 have identical support and mover and differ only
by the ownership exchange on C1 and D6.

Thus the center-consumed branch re-enters the same support class as a near-center
declined branch after one P1 response.

## 5. Proposed RLC extension

Candidate name: **Exhausted-Max Handoff Lemma (EMH).**

Let m be a unique Pareto-maximal rank-local landing with H(m)=0.

Do not automatically classify this as unresolved.

Instead test whether:

1. every adversary move not equal to m is outside the dependency cone of the
   (A,B,H) descriptor at m;
2. therefore m remains legal with the same descriptor for the next mover;
3. adversary occupation of m produces a finite quotient boundary class;
4. that boundary class has a response-total handoff into an already-known RLC/RCIC
   class, possibly through an exact local ownership-exchange relation.

When all four hold, H=0 is a **handoff boundary**, not a local-certificate failure.

At 44444, premises 1-3 are now mechanically supported. Premise 4 is the remaining
proof obligation.

## 6. Why this matters for turn 6

The previous CPCX program attacked turn 6 by extending structural progress deeper into
future positions.

This result suggests a shorter route:

~~~text
rank-5 RLC state
-> exhausted-max handoff
-> one rank-local response
-> exact exchange / claim-relative equivalence
-> reuse existing controlled-invariant logic
~~~

rather than a complete projection to terminal play.

This matches the general RLC theorem architecture: an exact handoff may reuse a
previous theorem class without physical state identity, provided the retained
observation is a congruence for the continuation claim.

## 7. Remaining falsifier

Do not promote this to Best(44444)=LegalActions(44444) yet.

The load-bearing missing statement is:

> The {x1,D6} ownership exchange is a congruence for the continuation certificate
> being reused, or every distinction it creates is confined to a finite incident-line
> correction that routes to the same RLC/RCIC normal form.

A counterexample would be an exchange pair with the same support substrate for which
the relevant continuation theorem requires different non-isomorphic response
resources, deadlines, first-win ordering, or terminal direction.

The next test should therefore operate on the **exchange cone**, not project to the
end of the game.

## 8. Mechanical evidence

Diagnostics:

- run-uc4a-cpcx-turn6-center-gate-equivalence.mjs
- run-uc4a-cpcx-turn6-exhausted-max-handoff.mjs

Qualified observations include:

- exactly two rank-6 gate classes;
- center gate open iff one off-center disturbance exists;
- 444444 leaves a virgin off-center substrate;
- the saturated center is an alternating parity spine;
- D6 (6,6,0) is preserved unchanged after every off-center sixth move;
- D6 remains the unique P1 Pareto maximum after every off-center sixth move;
- center consumption produces the reflected P1 side-max pair {3,5};
- the two move orders x,4 and 4,x have identical support and differ only by the
  two-cell owner exchange.

No solver W/D/L label, opening book, oracle value, minimax result, or recursive future
state search is a premise of these observations.
