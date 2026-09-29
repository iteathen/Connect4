# Unlabeled recursive quotient — cross-dimension control

**Status:** bounded exact rule-derived evidence  
**Research direction:** Joshua Oshiro  
**Branch:** `research/nim-control-parity-algebra-20260929`  
**Tested head:** `d19476c05e4d6ec9962ada97c09f0a036c7726ad`  
**Workflow:** `36547330072` — success  
**Producer inputs:** geometry, gravity, alternating turn order, first-win stopping, legal successor graph  
**Solved/outcome labels used by producer:** no

## Purpose

This experiment tests whether the action-unlabelled recursive quotient observed on
the exhaustive 4x4 Connect-4 control is an artifact of one board or survives
small changes in width, height and Connect-K.

The producer freezes equivalence classes before W/D/L is derived. Exact W/D/L is
computed only afterward as a validation layer.

A class is defined bottom-up by:

```text
terminal:
    (rank, terminal type)

nonterminal:
    (rank, player to move, SET of child classes)
```

Literal column labels and duplicate equivalent choices are erased.

This is a finite recursive semantic quotient, not a closed-form structural
solver.

## Reproduction gate

The generic producer independently reproduced the established 4x4 Connect-4
control exactly:

```text
states                    161,029
legal successor edges     304,574
unlabelled classes          8,242
W/D/L-split classes             0
root legal moves                 4
root distinct child classes      2
```

The cross-dimension results below are therefore from the same quotient semantics
as the earlier 4x4 audit.

## Dimension matrix

| Board | Winning lines | States | Legal edges | Classes | States/class | Peak class frontier | Peak state frontier |
|---|---:|---:|---:|---:|---:|---|---|
| 3x3 C3 | 8 | 694 | 966 | 130 | 5.34 | r5: 108 / 45 | r7: 176 / 7 |
| 4x3 C3 | 14 | 7,157 | 11,818 | 1,002 | 7.14 | r6: 718 / 299 | r9: 1,598 / 25 |
| 3x4 C3 | 14 | 2,715 | 3,714 | 406 | 6.69 | r6: 258 / 105 | r9: 608 / 21 |
| 4x4 C3 | 24 | 41,750 | 65,756 | 4,384 | 9.52 | r8: 3,664 / 1,076 | r11: 8,268 / 211 |
| 4x4 C4 | 10 | 161,029 | 304,574 | 8,242 | 19.54 | r9: 9,276 / 2,015 | r13: 28,922 / 25 |

Each peak cell is written as:

```text
rank: physical states / quotient classes
```

All five post-hoc W/D/L validations have zero split classes. As documented in
the 4x4 quotient result, that homogeneity is expected by backward induction from
this recursive quotient definition; it is not independent evidence for a new
value theorem.

## Gravity-orientation control

The strongest immediate perturbation is:

```text
4x3 Connect-3:
    cells          12
    winning lines  14
    states          7,157
    classes         1,002

3x4 Connect-3:
    cells          12
    winning lines  14
    states          2,715
    classes           406
```

The two boards have the same area and the same raw winning-line count, but the
legal gravity-support topology is different. Their action-unlabelled recursive
quotients are correspondingly different.

Post-hoc exact validation also gives different root W/D/L values, but that
outcome fact was not available to the producer.

Disposition:

```text
board area + raw winning-line count
    !=
sufficient structural carrier
```

Any candidate closed form must preserve at least the support/accessibility
orientation induced by gravity, rather than reducing geometry to line
cardinality.

## Frontier-shape observation

Across every tested board, the quotient-class frontier peaks before the physical
state frontier.

Examples:

```text
4x4 C3:
    class peak  rank 8
    state peak  rank 11

4x4 C4:
    class peak  rank 9
    state peak  rank 13
```

Late game positions therefore collapse very strongly under action-label erasure:
on 4x4 C4 the physical frontier at rank 13 contains 28,922 states but only 25
recursive classes.

This is a useful representation-economics observation, not evidence that those
classes can be reached without first enumerating the physical states.

## Connect-K effect on fixed geometry

The 4x4 controls separate rule length from board geometry:

```text
4x4 C3:
    states   41,750
    classes   4,384
    ratio      9.52

4x4 C4:
    states  161,029
    classes   8,242
    ratio     19.54
```

Changing K changes both early stopping and the future obligation structure. The
same support lattice therefore does not determine the quotient by itself.

## Current interpretation

The experiment strengthens three bounded conclusions:

1. branch-equivalence compression is not unique to the original 4x4 C4 control;
2. the quotient is sensitive to gravity/support topology and Connect-K, not just
   area or raw line count;
3. quotient cardinality grows much more slowly than physical-state cardinality
   in the tested cases, especially late in the game.

It does **not** establish a polynomial construction. The current producer still
enumerates the complete first-win-stopped legal graph and processes every legal
successor edge.

The research target remains a rule-derived structural signature that predicts
these recursive classes directly from geometry, support, obligations, shared
resources and deadlines.

## Next falsifier

The next useful test is not another W/D/L comparison. It is a carrier audit:

```text
candidate local structural signature
    -> does one signature ever contain multiple recursive quotient classes?
```

Candidate inputs should be rule-derived only and should reuse existing Connect4
authority rather than inventing parallel objects, beginning with combinations of:

- support/height state;
- player-relative residual winning-line requirements;
- accessibility of next required cells;
- control parity;
- shared blocker/response resources;
- first-win deadline relations.

A split signature is a direct falsifier of that carrier. A non-split finite
control remains only bounded evidence until dimension perturbation and a
derivation establish the general law.

## Non-claims

This experiment does not prove a generalized Connect Four solution, polynomial
time, an XOR W/D/L formula, or production-solver applicability. No TT, IsoMax,
BSFP or JSMinSys change follows from this result.
