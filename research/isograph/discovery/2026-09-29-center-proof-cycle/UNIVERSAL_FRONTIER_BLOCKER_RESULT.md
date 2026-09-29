# Earliest dynamic residual merge — universal frontier blocker

**Status:** bounded exact 4x4 evidence; local rule candidate identified  
**Research direction:** Joshua Oshiro  
**Source head:** `2461a5babe6a47cdb03300323b133287b8b73b2c`  
**Workflow:** `36549196291` — success  
**Production effect:** none

## Earliest non-static collapse

On the direct 4x4 Connect-4 residual-orbit graph, static column-orbit states and
recursive action-unlabelled classes are identical through rank 5.

At rank 6:

~~~text
residual-orbit states   554
recursive classes       552
merged recursive classes  2
orbit excess               2
~~~

So the first dynamic collapse consists of exactly two pairs.

Both pairs have canonical support:

~~~text
[0,1,2,3]
~~~

meaning the four legal landing events are:

~~~text
c1r1, c2r2, c3r3, c4r4
~~~

In each merge pair, one residual-orbit state differs from the other by exactly
one additional P1 residual mask:

~~~text
33825 = {c1r1,c2r2,c3r3,c4r4}
~~~

The two states in each pair have the exact same four child residual-orbit
indices, not merely the same child recursive classes.

## Rule-derived explanation

Rank 6 is P0 to move. The extra P1 requirement consists of every currently
legal landing event. Connect Four has no pass.

Therefore every legal P0 move necessarily occupies one cell of that P1
requirement and blocks it before P1 can move again.

The requirement cannot influence:

- which current actions are legal;
- whether P0 completes a line on the current move;
- any nonterminal successor residual state.

It is therefore ordinary-future inert at this node.

## Candidate implicit assertion

For a nonterminal state with mover M, let F be the set of current legal landing
events. Let R be one residual winning requirement of the opponent.

If:

~~~text
F subseteq R
~~~

then R is guaranteed to be blocked by the current mover on this ply and can be
deleted before branching.

This is a local support/residual consequence; it does not use W/D/L or solved
knowledge.

Working name: **universal frontier blocker elimination**.

## Stronger guarded form to test later

A broader sufficient condition is also suggested:

~~~text
for every current legal action a:
    a is inside R
    OR
    a terminates immediately in a mover win
~~~

Under that guard, R also cannot survive into any relevant nonterminal
successor. This stronger form has not yet been qualified.

## Why this matters

The first gap between static residual-q orbits and the recursive quotient is
explained by a direct implicit assertion over support and residual obligations,
not by an opaque minimax coincidence.

If repeated closure under such local guaranteed-blocker rules removes a large
part of the 10,507 -> 8,242 gap, it would provide a non-recursive structural
route toward the branch-and-collapse quotient.

## Non-claims

This observation is exact only for the inspected finite control until the
candidate elimination rule is separately proved and exhaustively checked. It
does not establish polynomial generalized Connect Four or an XOR value law.
