# CPC q2db forced terminal-safety chain 0.1

**Date:** 2026-10-01  
**Status:** frozen exact forced-chain design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source

Consume only:

- `CPC_Q2DB_TWO_COLUMN_TERMINAL_EXPOSURE_0_1.json`;
- pinned JSMinSys `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`;
- unchanged semantic-q terminal predicates.

Start exact q:

`2db2abcb67d530e0`

at rank 34 with support `[6,6,3,6,6,6,1]`.

The frozen source already proves:

- only C and G are legal;
- P0:C4 exposes exact P1:C5 terminal;
- P0:G2 is nonterminal and does not expose an immediate P1 terminal.

Therefore the first forced move is P0:G2, reaching q `ff5553a1d76cdce7`.

## Forced-safety operator

At each exact nonterminal state:

1. if the current mover has an immediate terminal move, stop with that exact terminal certificate;
2. otherwise examine each legal mover action one ply:
   - mover-terminal action is winning immediately;
   - nonterminal action is **unsafe** if the opponent then has at least one exact immediate terminal;
   - otherwise the action is **safe**;
3. if zero safe actions remain, the current mover is losing by terminal exposure;
4. if exactly one safe action remains, that action is forced and the chain continues;
5. if two or more safe actions remain, stop `UNRESOLVED_MULTIPLE_SAFE`.

No adversarial recursion is performed. The procedure follows only a unique forced action when one exists.

## Termination

The board has finite remaining capacity, so the chain is bounded by the remaining physical events.

Record every step:

- exact q/rank/support;
- mover;
- immediate terminal actions;
- all legal actions;
- opponent immediate terminals after each nonterminal action;
- safe action set;
- chosen forced action when unique.

## Result

Report:

- `P0_WIN_FORCED_CHAIN`;
- `P0_LOSS_FORCED_CHAIN`;
- or `UNRESOLVED_MULTIPLE_SAFE`.

The result is an exact certificate only if the chain terminates by immediate terminal or zero-safe-action exposure without ever encountering multiple safe actions.

## Boundary

No solved W/D/L, oracle, minimax, unrestricted game-tree value search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.

Each transition uses only current-state legal actions and exact one-ply terminal predicates.

Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, and BSFP remain unchanged.
