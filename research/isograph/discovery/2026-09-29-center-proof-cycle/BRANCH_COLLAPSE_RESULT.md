# Optimal branch-and-collapse audit — exhaustive 4x4

**Status:** bounded exact rule-derived evidence  
**Research direction:** Joshua Oshiro  
**Branch:** `research/nim-control-parity-algebra-20260929`  
**Tested head:** `f03d08e9ba6ab941f87b7e815bc1086a2238c832`  
**Workflow:** `36542646831` — success  
**Inputs:** 4x4 Connect-4 rules only; no solved database or opening labels

## Result

The complete legal 4x4 game graph contains 161,029 states.

Exact W/D/L-optimal edges were generated from the rules and retained for both
players. The resulting optimal-policy DAG is highly non-unique:

```text
optimal edges                         219,010
states with >1 optimal move            56,763
mover-winning states with >1 optimal    5,695
maximum optimal branching                   4
optimal transposition merge states      65,507
maximum optimal indegree                     4
explicit three-ply optimal diamonds      67,292
```

Thus exact perfect play does not define a unique principal variation even on
this small board. Different optimal physical branches frequently reconverge.

## Terminal realization multiplicity

Among exact winning states:

```text
winning states with >1 terminal winning line   13,951
maximum distinct winning lines from one state        6
```

The audit found a value-+1 state with two optimal moves whose perfect
continuations reach two different winning-line realizations.

This is the small-board analogue of the standard-7x6 observation that perfect
play can realize multiple winning lines. It supports treating literal moves and
literal terminal lines as realizations of a coarser control object rather than
as the control object itself.

## Example local reconvergence

One exact three-ply diamond begins from a rank-13 draw-valued state:

```text
first optimal choices: columns 2 or 3
common optimal reply: column 4
third optimal move: the other first-choice column
-> same physical state
```

The endpoint identity is checked on the exact board representation, not merely
on W/D/L.

## Root control

The empty 4x4 root is a draw and all four opening columns are W/D/L-optimal.
Under optimal play its terminal realization is draw-only. This is useful because
it separates **move non-uniqueness** from **winning-line multiplicity**: the
former exists even when the root value is draw.

## Interpretation

Any proposed latent control algebra should permit:

```text
one control class
-> multiple literal optimal actions
-> different physical states
-> later transposition / quotient collapse
-> multiple terminal realizations with the same exact value
```

A candidate is not falsified merely because equal-value states have different
best-move sets or different terminal lines.

Conversely, a proposed "solution" that always emits one literal move is too
fine or is imposing an unnecessary tie-break unless uniqueness is separately
proved.

## Non-claims

This audit does not establish the standard-board set of 28 terminal lines and
does not use it as a premise. It does not prove the current GF(2) carrier is the
correct value quotient. It establishes only that branch-and-collapse behavior
is an exact feature of perfect-play structure on the exhaustive 4x4 control.


## Sibling quotient audit

A follow-up compared every set of sibling optimal moves against two signatures:

1. player-labelled line `partial^2`;
2. the exact set of terminal realizations reachable while both players remain
   W/D/L-optimal.

Across all 56,763 multi-optimal states:

```text
all optimal children share the same partial^2 signature          0
optimal children split across partial^2 signatures          56,763

all optimal children share the same terminal-realization set 47,148
children split across terminal-realization sets                9,615

sibling pairs:
same partial^2, different terminal set                              0
different partial^2, same terminal set                         98,702
```

This is a strong bounded falsifier of treating literal `partial^2` as the
final value carrier. The middle derivative remains exact structural geometry,
but perfect-play equivalence is much coarser than its literal player-labelled
coordinates.

The next algebraic question is whether XOR differences between equivalent
sibling `partial^2` signatures form a low-dimensional or otherwise
geometry-derived gauge subspace that can be quotiented out without erasing
strategically meaningful distinctions.


## XOR delta-space falsifier

The next test formed the GF(2) span of player-labelled `partial^2` differences
between sibling optimal moves.

Observed on exhaustive 4x4:

```text
same-terminal-set optimal sibling pairs      98,702
different-terminal-set optimal sibling pairs 18,484
distinct optimal partial2 deltas                 176
optimal delta-space rank                           22
```

The same-terminal subset alone already generated all 176 observed optimal
deltas and the full rank-22 span. Every different-terminal-set optimal sibling
delta also lay in that span.

A stronger negative control then compared **all legal sibling moves**, not just
optimal ones:

```text
all legal sibling pairs                    246,704
distinct legal partial2 deltas                  176
legal delta-space rank                           22
legal deltas outside optimal span                 0
optimal delta set == legal delta set           true
```

Disposition: the rank-22 sibling delta space is a geometric move-choice space,
not a perfect-play selector. It must not be promoted as the latent strategic
value.

This is still useful: any final control quotient that identifies equivalent
perfect moves must quotient or otherwise absorb ordinary legal move-coordinate
differences, but optimality requires additional guarded structure beyond this
linear `partial^2` move gauge.
