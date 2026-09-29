# Support-release turn-slot capacity closure

**Status:** guarded deductive rule + bounded exact qualification  
**Research direction:** Joshua Oshiro  
**Experimental branch:** research/nim-control-parity-algebra-20260929  
**Gameplay-authority effect:** none  
**Production-solver effect:** none

## Rule

For a residual requirement owned by player P, every required future cell has a support-release lower bound.

~~~text
release(cell) = row - current_column_height + 1
~~~

Player P also has fixed possible future global turn slots: odd-numbered future plies when P is the mover, even-numbered future plies when P is the opponent.

Relax all column-order interactions except these release lower bounds. If the required cells still cannot be injectively matched to distinct P turn slots at or after their release times, the residual is unrealizable and may be deleted.

## Proof

Any legal completion induces exactly such an injection: each required cell is occupied on one distinct move by P, and no cell can be occupied before its support-release lower bound. Therefore failure of the relaxed matching proves impossibility.

The relaxation may admit schedules that the real game cannot realize, so passing the check does not assert realizability. Greedy earliest-slot matching decides the relaxed feasibility in polynomial work after sorting the release bounds.

## Qualification

The rule was applied after nonterminal frontier blocking, mover final-event cap parity, and remaining-move capacity. It was qualified against the independent recursive quotient on 3x3 C3, 4x3 C3, 3x4 C3, 4x4 C3, and 4x4 C4.

For every control, recursive class count and root value were preserved, W/D/L split classes remained zero, and structural states/edges did not increase.

Workflow 36574729963 — success.

## Incremental 4x4 Connect-4 effect

~~~text
before: 9,321 states / 29,078 edges / 8,242 classes
after:  9,319 states / 29,076 edges / 8,242 classes
increment: -2 states / -2 edges
~~~

The remaining static excess is 1,077 states. Relative to the original 10,507-state residual-orbit graph, 1,188 of the original 2,265 excess states are now directly explained, about 52.45%.

The local branch closure still needs seven rounds: 9,319 -> 9,137 -> 8,901 -> 8,612 -> 8,375 -> 8,269 -> 8,250 -> 8,242. The earliest unexplained dynamic merge remains rank 8.

## Interpretation

This is a genuine support/deadline refinement of raw move capacity, but its incremental effect is tiny. Simple local realizability is therefore no longer the dominant 4x4 gap. The remaining seam is concentrated in branch-local equivalence: opponent-obligation dominance, support-chain transport, and duplicate/equivalent action structure.

## Non-claims

This closure does not prove the relaxed schedule is sufficient for real completion, does not close the recursive quotient, and does not establish a general complexity bound or W/D/L formula.
