# CPC q966 nonwin propagation and surviving-G audit 0.1

**Date:** 2026-10-01  
**Status:** frozen exact RLC propagation design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Sources

Consume only:

- `CPC_RANK32_Q966_EXTENDED_REPAIR_COMPOSITION_0_1.json`;
- `CPC_Q2DB_TWO_COLUMN_TERMINAL_EXPOSURE_0_1.json`;
- `CPC_Q2DB_FORCED_TERMINAL_SAFETY_CHAIN_0_1.json`;
- `CPC_Q649_TWO_REPLY_CONSEQUENCE_CLASS_CLOSURE_0_1.json`;
- `CPC_Q5D34_STRUCTURAL_NONWIN_BACKPROP_0_1.json`;
- pinned JSMinSys `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`;
- exact semantic-q terminal predicates.

Target:

- q `966e6353e06e4d41`;
- rank 32;
- support `[6,6,3,6,5,5,1]`;
- P0 to move.

## Already-qualified consequences

### E and F

The q966 extended-repair audit proves:

- E -> P1:F6 -> exact q `2db2abcb67d530e0`;
- F -> P1:E6 -> the same exact q.

The q2db forced-safety chain reaches q649 after the only terminal-safe G continuation. q649 has the qualified `P0_NONWIN_DRAW_REPLY` certificate. Together with q2db:C exposing immediate P1 terminal C5, monotone interval predecessor reasoning gives q2db the one-sided interval `[-1,0]`.

Therefore E and F cannot be P0-winning actions.

This is a monotone exact-q nonwin handoff. It does not assert that q2db is a P0 loss or exact draw.

### C and G

Reconstruct these remaining legal q966 actions directly.

For each:

1. if P0 wins immediately, accept the action;
2. otherwise enumerate immediate P1 terminal replies;
3. any immediate P1 terminal is an exact elimination witness against that P0 action.

## Surviving G path

If G is nonterminal and has no immediate P1 terminal:

1. reconstruct the exact G child;
2. apply the already-qualified forced terminal-safety operator;
3. require the unique safe P1 response G3 to reach exact q `5d34e24395b9d801`;
4. consume `CPC_Q5D34_STRUCTURAL_NONWIN_BACKPROP_0_1.json` only after exact q equality;
5. assign the G action the q5d one-sided upper bound `U <= 0`.

The prior stop-at-multiple-safe boundary is superseded here only because q5d now has an independently qualified structural nonwin certificate.

## q966 classification

- `Q966_P0_WIN_G` if G is structurally certified P0-winning;
- `Q966_P0_NONWIN` if C is eliminated and E/F/G each have sound structural `U <= 0` certificates;
- `Q966_UNRESOLVED_G` otherwise.

Record exact reasons for every P0 action:

- `P1_TERMINAL_REPLY`;
- `EXACT_Q2DB_NONWIN_REPLY`;
- `P0_WIN_FORCED_CHAIN`;
- `P0_LOSS_FORCED_CHAIN`;
- `DRAW_FULL_BOARD`;
- `UNRESOLVED_MULTIPLE_SAFE`;
- or immediate P0 terminal.

## Boundary

No solved W/D/L, oracle, minimax, unrestricted game-tree value search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.

The draw handoff is admitted only by exact semantic-q identity and its previously qualified structural certificate.

Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, and BSFP remain unchanged.
