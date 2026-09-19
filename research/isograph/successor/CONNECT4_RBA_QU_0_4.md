# Connect4 RBA Quantifiable Unknown — 0.4 Bellman-information refinement

**Record ID:** RBA-QU-0004  
**Refines:** RBA-QU-0003  
**Date:** 2026-09-18  
**State:** OPEN  
**Authority effect:** post-1.1 research refinement only  
**Research direction:** Josh Oshiro

## Refinement

The external-theory tests distinguish two very different abstractions.

### Rejected as the RBA target

A partition abstraction made forward-complete for the full raw labeled transition interface is far too fine:

~~~text
4x3 c3    3,734 q states -> 2,798 stable raw-transition shell classes
4x4 c4   34,094 q states -> 27,392 classes
5x3 c4   11,316 q states -> 9,772 classes
~~~

So ordinary bisimulation/transition strong preservation retains much more structure than exact Connect4 value requires.

### Surviving value-specific structure

Initialize all nonterminal q states as UNKNOWN and repeatedly apply the exact Bellman information rules over:

~~~text
UNKNOWN
WIN
DRAW
LOSS
~~~

On every complete control, the full refinement trace is exactly equivalent to the final strong score:

~~~text
geometry   state trace classes = strong-score classes

4x3 c3        19 = 19
4x4 c4        29 = 29
5x3 c4        26 = 26
~~~

Action-by-action:

~~~text
geometry   action trace classes = exact action-score-vector classes

4x3 c3      1,000 = 1,000
4x4 c4      3,005 = 3,005
5x3 c4      2,334 = 2,334
~~~

For every tested state and action:

~~~text
first iteration leaving UNKNOWN
    =
exact strong distance
~~~

with zero mismatches.

## Candidate value algebra

The strong-score chain is now treated as derived rather than primitive.

Candidate carrier:

~~~text
U = UNKNOWN
W = WIN
D = DRAW
L = LOSS
~~~

Bellman action negation:

~~~text
W <-> L
D  -> D
U  -> U
~~~

State choice follows the partial-information ordering:

~~~text
L < D < U < W
~~~

This is the same standard W/D/L/Unknown ordering used in partial-information retrograde database construction.

Strong distance is the refinement ordinal:

~~~text
strong score = (resolved W/D/L outcome, first resolution iteration)
~~~

## Symbolic boundary compatibility

Resolved-WIN-by-k regions were upward closed and resolved-LOSS-by-k regions downward closed under the favorable q order in every complete-control test.

Largest state fronts:

~~~text
geometry   WIN boundary   LOSS boundary

4x3 c3         17              11
4x4 c4         29              15
5x3 c4          6               3
~~~

Largest action fronts:

~~~text
geometry   WIN boundary   LOSS boundary

4x3 c3         14              14
4x4 c4         18              25
5x3 c4          5               6
~~~

So the four-valued Bellman information process remains compatible with the existing antichain boundary representation.

## Revised candidate core

~~~text
board fiber
    ->
residual distributive lattice
    ->
terminal-extended left-adjoint cofactor
    <-> right adjoint
    ->
four-valued Bellman information transformer
    ->
monotone WIN_k / LOSS_k fronts
    ->
resolution ordinal = strong distance
~~~

## Remaining open core

The main unresolved operation is now:

> compose multiple Bellman-information refinement steps directly on the symbolic WIN/LOSS fronts over the board-fiber graph, without constructing every intermediate support/rank boundary.

The stronger six-valued partial-information interval algebra:

~~~text
LL, LD, LW, DD, DW, WW
~~~

is a high-value next candidate for block composition because it can represent partial lower/upper outcome bounds. It remains untested for the RBA compact-boundary objective.

## Epistemic caution

This refinement does not claim that the four-valued carrier is the unique formal forward-complete shell in the full abstract-interpretation sense.

It establishes:

- raw-transition partition completeness is too fine;
- the value-specific Bellman refinement orbit exactly reconstructs strong state/action value on all complete controls;
- the refinement fronts remain monotone and compactly boundary-representable on those controls.

## Current disposition

~~~text
raw-transition complete-shell target       REJECTED AS TOO FINE
strong-score chain primitive               NO
W/D/L/U Bellman information carrier        STRONGLY SUPPORTED / THEOREM-SHAPED
resolution ordinal = strong distance       COMPLETE-CONTROL PASS
monotone WIN/LOSS fronts                    COMPLETE-CONTROL PASS
six-value partial-bound algebra             NEXT CANDIDATE
compact block-front composition             OPEN
compact root normal form                    OPEN
empty standard root solved                  NO
~~~
