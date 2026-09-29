# Unlabeled branch quotient cross-check — exhaustive 4x4

**Status:** bounded exact research evidence  
**Research direction:** Joshua Oshiro  
**Branch:** `research/nim-control-parity-algebra-20260929`  
**Tested head:** `451940802e3e4b05422b55b64092cbd313dffd99`  
**Workflow:** `36546339998` — success  
**Scope:** 4x4 Connect-4 exhaustive control only

## Question

The branch-and-collapse result shows that perfect-play-equivalent actions need not
share literal move labels, literal `partial^2` coordinates, or terminal winning
line realizations. This cross-check asks how much of the exact finite game can
be quotiented after literal action labels are erased.

Keep two objects separate:

```text
action-labelled behavioral identity
!=
action-unlabelled value identity
```

The action-unlabelled all-legal quotient is produced from game rules and the
successor relation, not from solved W/D/L labels. Exact W/D/L is consulted only
afterward to test class homogeneity.

The optimal-continuation quotient is different: exact W/D/L-optimal edges are
used to define that control. It is therefore a semantic perfect-play control,
not a rule-only candidate producer for a closed-form solver.

## Full recursive successor quotient

Bottom-up signatures are formed from either terminal type or:

```text
(player to move, SET of child equivalence classes)
```

Literal columns and duplicate equivalent choices are erased.

Across the complete 161,029-state 4x4 graph:

```text
all-legal structural classes                 8,242
W/D/L-split classes                              0
W/D/L-split states                               0
states with duplicate equivalent moves      39,231
duplicate equivalent move edges erased      46,002
maximum class size                          11,902
root legal moves                                 4
root distinct child classes                      2
```

Using only exact optimal continuations:

```text
optimal structural classes                   1,130
W/D/L-split classes                              0
W/D/L-split states                               0
states with duplicate equivalent moves      51,033
duplicate equivalent optimal edges erased   73,201
maximum class size                          14,964
root optimal moves                               4
root distinct optimal child classes              1
```

Thus all four optimal opening moves on the 4x4 draw board occupy one recursive
optimal child class even though they are four literal physical actions.

## MQ2 cross-check

The earlier MQ2-style behavioral partition retains literal four-column action
slots and omits already-won positions from the state set.

The corrected cross-check gives:

```text
pre-win states                               139,625

action-labelled behavior classes             27,424
absolute P0/P1 W/D/L split classes                26
mover-relative W/D/L split classes                 0

action-unlabelled classes                      8,232
mover-relative W/D/L split classes                 0

action-unlabelled, absolute mover erased       8,222
mover-relative W/D/L split classes                 0

optimal action-unlabelled mover-relative       1,035
mover-relative W/D/L split classes                 0

root literal actions                               4
root all-legal distinct child classes               2
root optimal literal actions                        4
root optimal distinct child classes                 1
```

The 26 splits in the action-labelled partition were the source of the stale CI
expectation at commit `8e5474aa70005ada75a52654c37d18645e527c12`.
They disappear when outcome is expressed relative to the mover. This is a
representation issue, not an MQ2 contradiction.

Erasing absolute mover identity reduces the all-legal pre-win quotient by only
10 classes, from 8,232 to 8,222. Restricting to perfect-play continuations
collapses much more aggressively, to 1,035 classes.

## Interpretation

This establishes a finite exact semantic fixed point that is dramatically
smaller than the physical state graph and is compatible with branch-and-collapse
equivalence.

It does **not** yet establish an efficient construction.

The present producer still obtains child classes bottom-up after materializing
the exhaustive legal graph. Therefore:

```text
small quotient cardinality
!=
small construction complexity

value-homogeneous recursive fixed point
!=
polynomial generalized Connect Four solution
```

The next complexity experiment must measure per-rank state/frontier growth,
successor edges processed, and quotient-class growth, then repeat on additional
small board dimensions.

## Research consequence

The strongest current target is no longer a literal board coordinate or a
simple `partial^2` gauge. A viable rule-derived hidden value must reproduce or
refine the branch-equivalence captured by this recursive unlabeled fixed point
without traversing the entire game graph.

XOR/GF(2) remains a candidate composition law for the derived guarded control
objects. Nothing in this result establishes XOR as a W/D/L formula.

## Non-claims

This result is finite 4x4 evidence only. It does not prove the standard 7x6
quotient, a generalized polynomial-time construction, a closed-form value
function, or a production solver optimization. No production TT or solver
change follows from this result.
