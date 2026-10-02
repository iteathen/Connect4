# CPC q649 two-reply consequence-class closure 0.1

**Date:** 2026-10-01  
**Status:** frozen exact consequence-class design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source

Consume only:

- `CPC_Q2DB_FORCED_TERMINAL_SAFETY_CHAIN_0_1.json`;
- pinned JSMinSys `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`;
- unchanged semantic-q terminal predicates.

The q2db forced chain reaches exact state:

- q: `6496c888c4e2a157`;
- rank: 37;
- support: `[6,6,3,6,6,6,4]`;
- P1 to move.

The one-ply safety audit proves P1 has exactly two safe actions:

- C4 -> q `28d9883e71b855c4`, rank 38, support `[6,6,4,6,6,6,4]`;
- G5 -> q `e7eb0902f1f7984c`, rank 38, support `[6,6,3,6,6,6,5]`.

These are the complete recursively distinct consequence classes at this fork.

## Purpose

Apply the already-defined forced terminal-safety operator independently to each exact P0 consequence class.

No additional branching is introduced inside a class: follow only unique safe actions and stop at the first multiple-safe state.

## Classification

For each child, report:

- `P0_WIN_FORCED_CHAIN`;
- `P0_LOSS_FORCED_CHAIN`;
- `DRAW_FULL_BOARD`;
- or `UNRESOLVED_MULTIPLE_SAFE`.

Then classify q649:

- `P0_WIN_ALL_P1_REPLIES` iff both children are P0 wins;
- `P0_LOSS_P1_REPLY` iff either child is P0 loss;
- `P0_NONWIN_DRAW_REPLY` iff no child is P0 loss and at least one is a draw;
- `UNRESOLVED` otherwise.

If q649 closes, transport the result backward through the already-qualified unique forced q2db prefix `G2,G3,G4`.

## Boundary

No solved W/D/L, oracle, minimax, unrestricted game-tree value search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.

The only universal branching retained is the exact two-element P1 consequence set already exposed at q649.

Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, and BSFP remain unchanged.
