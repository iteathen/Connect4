# CPC q2db two-column terminal-exposure audit 0.1

**Date:** 2026-10-01  
**Status:** frozen exact audit before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source

Consume only:

- `CPC_RANK32_Q966_EXTENDED_REPAIR_COMPOSITION_0_1.json`;
- pinned JSMinSys `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`;
- unchanged semantic-q / repair-capacity terminal predicates.

Target exact state:

- q: `2db2abcb67d530e0`;
- rank: 34;
- support: `[6,6,3,6,6,6,1]`;
- P0 to move;
- live P0 target G3 at support distance 1;
- no enabled P1 singleton recorded at the state.

This exact q is reached by both:

- q966, P0:E, P1:F6;
- q966, P0:F, P1:E6.

## Purpose

Determine whether this converged two-column state is already an exact loss by immediate terminal exposure after every legal P0 action.

No recursive proof search is allowed.

## Audit

1. reconstruct q by exact semantic identity;
2. verify the only legal columns are C and G;
3. for each legal P0 action:
   - if P0 wins immediately, record a positive counterexample;
   - otherwise enumerate exact immediate P1 terminal actions in the child;
4. classify:
   - `P0_LOSS_TERMINAL_EXPOSURE` iff every legal P0 action is nonterminal and exposes at least one exact immediate P1 terminal;
   - `P0_WIN_IMMEDIATE` iff any legal P0 action is immediate terminal;
   - `UNRESOLVED` otherwise.

For each exposing action retain:

- P0 action/landing cell;
- child q/support;
- exact P1 terminal columns/cells;
- newly enabled P1 singleton set.

## Boundary

No solved W/D/L, oracle, minimax, unrestricted game-tree value search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.

This is at most a one-ply terminal-exposure theorem over the exact current state.

Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, and BSFP remain unchanged.
