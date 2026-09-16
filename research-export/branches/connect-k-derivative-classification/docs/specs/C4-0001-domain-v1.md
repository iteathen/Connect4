# C4-0001 — Standard Connect Four domain v1

**Status:** accepted bootstrap specification

## Purpose

Define the product-owned Connect Four game semantics used by correctness tests and later benchmark/search adapters. This specification owns game meaning only. It does not own evaluator, minimax, MCGS, CUDA, timing, or benchmark-result semantics.

## Board

- 7 columns and 6 rows, exactly 42 cells.
- Columns are indexed `0..6` from left to right.
- Rows are indexed `0..5` from bottom to top.
- Players are identified as `0` and `1`.
- Player `0` moves first and turns alternate after every accepted move.
- A move is a column index. The token occupies the lowest empty row in that column.
- A move is illegal when the column is outside `0..6`, the column is full, or the position is terminal.

## Terminal result

A player wins immediately after placing a token that completes at least one contiguous horizontal, vertical, rising-diagonal, or falling-diagonal line of four cells owned by that player.

There are exactly 69 theoretical four-cell winning lines on the standard board. If all 42 cells are occupied without a win, the result is a draw.

No move may advance a terminal position.

## Canonical external reconstruction

A position may be reconstructed from its ordered move-column sequence. A valid sequence must be replayable from the empty board without an illegal move after any terminal state.

Private implementations may use any representation, but exposed conformance evidence must preserve the same move order, side to move, terminal result and legal-move set.

## Reversible reference behavior

The host reference domain supports reversible `play`/`undo` for testing and the incumbent minimax control. Undo must restore the exact pre-move domain state, including board cells, column heights, side to move, ply, terminal status and previous-last-move identity.

Reversible host mechanics are not automatically the Device-JS representation and do not define CUDA-MCGS graph identity.

## Ownership boundary

Connect4 owns these domain semantics and any product-specific Device-JS realization. CUDA-MCGS may consume a Connect4 domain adapter but must remain ignorant of columns, rows, players, gravity and Connect Four terminal rules in its generic core.
