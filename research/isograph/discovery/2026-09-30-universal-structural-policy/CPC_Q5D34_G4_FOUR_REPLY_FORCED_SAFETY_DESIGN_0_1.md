# CPC q5d34 G4 four-reply forced-safety census 0.1

**Date:** 2026-10-01  
**Status:** frozen exact RLC consequence design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Sources

Consume only:

- `CPC_Q5D34_EF_NONWIN_CONVERGENCE_0_1.json`;
- `CPC_Q5D34_RANK36_MONOTONE_CONSEQUENCE_COMPOSITION_0_1.json`;
- pinned JSMinSys `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`;
- unchanged semantic-q terminal predicates.

The E/F nonwin composition proves that q5d34 root actions E6 and F6 cannot force P0 wins. Therefore G4 is the sole remaining q5d34 winning candidate.

For G4, the frozen rank-36 consequence composition gives four exact terminal-safe P1 reply classes:

- P1:C4 -> q `66739b4c27954716`;
- P1:E6 -> q `f435a6ec7dd5469e`;
- P1:F6 -> q `6c9a60f756817109`;
- P1:G5 -> q `1eb5ab134528f402`.

All are rank 36 with P0 to move.

## Purpose

Apply the already-qualified forced terminal-safety operator independently to those four exact q classes.

No new certificate language is introduced.

## Per-reply operator

For each rank-36 q:

1. stop on an immediate mover terminal;
2. stop draw on a full nonterminal board;
3. audit every legal mover action one ply;
4. mark an action unsafe iff the resulting nonterminal child gives the opponent an immediate terminal;
5. if zero safe actions remain, classify the current mover as losing;
6. if exactly one safe action remains, follow it;
7. if more than one safe action remains, stop `UNRESOLVED_MULTIPLE_SAFE`.

Do not branch after a multiple-safe state.

## G4 classification

Because P1 chooses the reply after G4:

- `G4_P0_WIN` iff all four reply classes close as `P0_WIN_FORCED_CHAIN`;
- `G4_P0_NONWIN` if any reply closes as `P0_LOSS_FORCED_CHAIN` or `DRAW_FULL_BOARD`;
- `G4_UNRESOLVED` otherwise.

## q5d34 implication

- if G4 is P0-nonwinning, then E/F/G are all nonwinning and q5d34 is P0-nonwinning;
- if G4 is P0-winning, q5d34 is P0-winning;
- otherwise q5d34 remains unresolved.

Do not propagate to q966 or the rank-30 ancestor until the corresponding exact compositions are explicitly checked.

## Boundary

No solved W/D/L, oracle, minimax, unrestricted game-tree value search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.

Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, forced-loss semantics, and BSFP remain unchanged.
