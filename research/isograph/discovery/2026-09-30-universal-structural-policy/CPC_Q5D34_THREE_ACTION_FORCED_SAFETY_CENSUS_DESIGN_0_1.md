# CPC q5d34 three-action forced-safety consequence census 0.1

**Date:** 2026-10-01  
**Status:** frozen exact RLC consequence design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source

Consume only:

- `CPC_Q966_G_BRANCH_FORCED_SAFETY_0_1.json`;
- `CPC_Q5D34_MONOTONE_PROOF_LIBRARY_AUDIT_0_1.json`;
- pinned JSMinSys `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`;
- unchanged semantic-q terminal predicates.

Target exact state:

- q: `5d34e24395b9d801`;
- sequence: `4444415666662322224255115153113777`;
- rank: 34;
- support: `[6,6,3,6,5,5,3]`;
- P0 to move.

The frozen safety audit proves C4 is unsafe and the complete terminal-safe P0 action set is:

- E6 -> q `fbb987f9d3becc5b`;
- F6 -> q `d22c464c13d0aab6`;
- G4 -> q `a2feb3b4c09b10f3`.

The complete monotone proof-library audit classifies q5d34 itself UNKNOWN, so these three consequences are the next exact structural seam.

## Purpose

Apply the already-qualified forced terminal-safety operator independently to each of the three exact P1-to-move consequence classes.

Do not introduce additional branching inside a class. Follow only a unique safe action and stop at the first multiple-safe state.

## Per-child classification

For each E6/F6/G4 child report:

- `P0_WIN_FORCED_CHAIN`;
- `P0_LOSS_FORCED_CHAIN`;
- `DRAW_FULL_BOARD`;
- or `UNRESOLVED_MULTIPLE_SAFE`.

Record every step with exact q/rank/support, mover, legal actions, immediate terminals, one-ply opponent terminal exposure, safe actions, and forced action.

## q5d34 classification

Because P0 chooses the action:

- `Q5D_P0_WIN` if **any** child is `P0_WIN_FORCED_CHAIN`;
- `Q5D_P0_LOSS` if **all** children are `P0_LOSS_FORCED_CHAIN`;
- `Q5D_P0_DRAW_OR_LOSS` if no child wins, at least one child is a draw, and every other child is draw/loss;
- `Q5D_UNRESOLVED` otherwise.

Preserve all winning actions if more than one closes.

## Backward implication

If q5d34 is P0-winning:

[
q966:G2 \to P1:G3 \to q5d34
]

certifies G2 as a P0-winning q966 action.

If q5d34 is proven nonwinning under all three actions, q966:G2 cannot force a P0 win.

Do not propagate to the rank-30 ancestor until q966 is explicitly recomposed.

## Boundary

No solved W/D/L, oracle, minimax, unrestricted game-tree value search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.

Each child follows only the exact current-state one-ply terminal-safety operator.

Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, forced-loss semantics, and BSFP remain unchanged.
