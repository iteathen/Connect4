# Win-set / structural-28 synthesis

Research direction: **Josh Oshiro**.

The historical research used the numbers `69`, `61`, `38`, `30`, and `28` in several nearby contexts. The normalized model is:

```text
GEOMETRIC DOMAIN
Lambda(7x6) = 69
        |
        +---------------- perfect-play output algebra G ----------------+
        |                                                                |
        | W/D/L-only tie relation                         strong-distance tie relation
        |        |                                                       |
        |        v                                                       v
        | G_WDL(root): reported 61                         G_strong(root): exact 28
        | C4-R0048                                           C4-R0049
        |
        +---------------- structural initial-board decomposition --------+
                 |
                 +--> Y_cell = 28, Y_line = 28 ---------------- C4-R0050
                 |
                 +--> latest P0 capacity -> support E_max = 38
                         |
                         +--> rank-5 exclusion max = 10
                         |       uniquely center
                         v
                     E_rank5_min = 28 ------------------------- C4-R0051

             structural 28 / extremal 28
                         |
                         |  MISSING: prove optimal selection
                         v
               deadline-valued CPC/NDC ------------------------ C4-R0052
                         |
                         v
                  strong terminal 28
```

The bottom arrow is **not proved**. It is the active selection theorem.

## What 61 means

The 61 is not “61 lines in every variation.” It is the union of terminal-line identities admitted when W/D/L is the only optimality criterion. At a losing P1 state, faster and slower losses share the same W/D/L value, so all remain admissible. Refining the tie relation to strong distance removes many of those continuations and contracts the union to 28.

## What 30 on 6x7 means

The board-family support law gives a 30-line terminal-support upper envelope for 6x7 under the cited terminal move 41. This is not the same object as the structural core (`Y_cell=28`, `Y_line=29`) and, in the current packet, it is not yet a matching exact census. A lower-bound witness/proof for all 30 remains required.

## Why standard 7x6 is special without solving it

The generated K=4 family yields two independent exact properties:

1. gravity-oriented line/cell core balance `Delta(W,H)=0`;
2. a unique maximum-impact initially legal event, which occurs only at width 7.

Together they force `W=7,H=6`; the common core dimension then evaluates to 28. On the standard board the unique initial impact maximum is also the unique center of the canonical phase path. None of this yet proves that strong optimal play must choose that event.

## Why equal 28s are not identity

The external strong 28-line set is not a basis for the common structural core. Its exact incidence fingerprint is

```text
28 coordinates
 = 2 line-core dependencies
 + 20 cell-core image dimensions
 + 6 axis-boundary image dimensions,
```

with incidence-image dimension 26. This rules out the simplest explanation “optimal lines are simply Y.”

## Core-engine connection

This packet feeds the Isometric calculus in three ways:

- `G(s)` supplies the **semantic target**: a structural solver should reproduce the output set/value without needing the physical move DAG.
- `Y`, `E_max`, phase-center and requirement-impact results supply **initial structural state/invariants**.
- C4-R0052 names the **missing operator**: a guarded deadline-valued closure that turns the structural state into the selected perfect-play output.

That is the same gap already represented by C4-R0011 (composition laws), C4-R0018 (NDC), and C4-R0043 (realizability-preserving structural recurrence). The win-set work is therefore not a side project; it is a concrete end-to-end target for the Isometric core logic.
