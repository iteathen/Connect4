# Remaining-move capacity closure

**Status:** guarded deductive rule + bounded exact qualification  
**Research direction:** Joshua Oshiro  
**Experimental branch:** research/nim-control-parity-algebra-20260929  
**Gameplay-authority effect:** none  
**Production-solver effect:** none

## Rule

Let a structural state have R empty cells remaining and let M be the player to
move.

Then the maximum number of future placements available to the two players is:

~~~text
moves(M)        = ceil(R / 2)
moves(opponent) = floor(R / 2)
~~~

For any residual winning requirement Q owned by player P:

~~~text
|Q| > moves(P)
    ->
Q is unrealizable
~~~

and the requirement may be removed from that player's residual antichain.

## Proof

A residual requirement contains distinct future board cells that must all be
occupied by the same player before that residual can complete.

Each legal move occupies exactly one board cell. A player cannot make more than
their remaining number of turns before the board is full. Therefore a player
with fewer than |Q| remaining moves cannot occupy every cell in Q.

First-win stopping can only reduce the number of moves actually available, so
it cannot invalidate the impossibility conclusion.

The rule is independent of solved outcomes and does not use minimax values.

## Qualification

The closure was applied after:

- residual-antichain normalization;
- nonterminal frontier blocker elimination;
- mover final-event cap-parity elimination.

It was qualified against the independently constructed recursive quotient on
the full current small-board matrix:

~~~text
3x3 Connect-3
4x3 Connect-3
3x4 Connect-3
4x4 Connect-3
4x4 Connect-4
~~~

For every control:

~~~text
recursive class count preserved
root value preserved
W/D/L split classes = 0
structural states did not increase
structural edges did not increase
~~~

Workflow qualification: 36573895595 — success.

## 4x4 Connect-4 effect

Before this closure, after the earlier nonterminal-frontier and mover-cap rules:

~~~text
structural states   9,441
structural edges   29,351
recursive classes   8,242
static excess        1,199
~~~

After remaining-move capacity:

~~~text
structural states   9,321
structural edges   29,078
recursive classes   8,242
W/D/L splits             0
root value             draw
static excess        1,079
~~~

So this exact local rule removes:

~~~text
120 structural states
273 structural edges
~~~

without changing the recursive quotient.

Relative to the original 10,507-state residual-orbit graph:

~~~text
original static excess     2,265
remaining excess           1,079
directly explained excess  1,186
explained fraction        ~52.36%
~~~

The local branch-closure depth remains seven rounds, but the early refinement
trajectory is reduced:

~~~text
round 0  9,321
round 1  9,138
round 2  8,903
round 3  8,612
round 4  8,375
round 5  8,269
round 6  8,250
round 7  8,242
~~~

The convergence to the same 8,375 classes at round 4 is notable: the new rule
removes states whose distinctions were already eliminated by the first few
recursive branch-equivalence rounds.

## Relation to the residual-deletion audit

A separate post-hoc structural audit found 438 reachable single-opponent-
residual deletions that preserve recursive class on the rewritten 4x4 graph.

Remaining-move capacity explains a principled subset of this broader
phenomenon. It does not explain the earliest rank-8 deletion-equivalent pair,
so opponent-obligation dominance and branch-local deadline equivalence remain
open research seams.

## Interpretation

This rule is another recursive implicit assertion obtained from ordinary game
resources:

~~~text
finite remaining turns
+ one cell per move
+ same-player residual obligation
    ->
move-capacity unrealizability
~~~

It is strictly more general than any rule tied to one board line or one support
shape, but it is still only a local realizability closure.

## Non-claims

This result does not close the residual/action-orbit graph, prove polynomial
state growth, provide an XOR W/D/L formula, or promote a production solver
change. It leaves 1,079 excess 4x4 structural states and the earliest unexplained
dynamic merges at rank 8.

## 6x4 rank-12 scale control

The exact closure was then enabled on the same 6x4 rank-12 prefix used for the
structural-growth measurement.

Workflow: 36574445551 — success.

Result:

~~~text
remaining-move-capacity removals   0

prefix states              1,245,671  (unchanged)
rank-12 frontier             628,961  (unchanged)
literal edges              3,228,589  (unchanged)
canonicalization calls     3,122,715  (unchanged)
~~~

Therefore the closure has **no semantic effect through rank 12 on 6x4
Connect-4**.

This is useful negative evidence. The rule is exact and removes late-game
states on 4x4, but the 6x4 width-growth wall develops before simple remaining
move count becomes constraining.

Matched execution also became slower:

~~~text
rank-12 baseline elapsed       125.6285 s
move-capacity elapsed          175.4696 s
change                         +39.68%
~~~

Because it performed no deletions in the measured prefix, enabling this check
unconditionally is not justified as a scale optimization. Later experiments
should either invoke it only near ranks where it can become active or treat it
as a semantic closure rather than a hot-path mechanism.

This strengthens the distinction:

~~~text
exact late realizability rule
!=
early structural-growth reduction
~~~
