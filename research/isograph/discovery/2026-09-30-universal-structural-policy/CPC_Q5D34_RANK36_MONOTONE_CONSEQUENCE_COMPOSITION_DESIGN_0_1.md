# CPC q5d34 rank-36 monotone consequence composition 0.1

**Date:** 2026-10-01  
**Status:** frozen exact RLC composition design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source

Consume only:

- `CPC_Q5D34_THREE_SAFE_ACTION_CONSEQUENCE_CLOSURE_0_1.json`;
- all previously qualified positive certificate families used by `CPC_Q5D34_MONOTONE_PROOF_LIBRARY_AUDIT_0_1.json`;
- pinned JSMinSys `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`.

The source exact state is q `5d34e24395b9d801`, rank 34, P0 to move.

The complete terminal-safe P0 actions are E/F/G.

Their safe P1 replies produce 10 physical rank-36 histories but 9 exact semantic-q consequence classes because:

- P0:E6 then P1:F6;
- P0:F6 then P1:E6;

both reach exact q `e5d63da12420fdb3`.

## Purpose

Perform universal branch composition over the safe P1 reply classes without inventing a new certificate language.

For each unique rank-36 exact q class, query the complete current monotone proof library and the independent forced-loss calculus.

## Monotone positive library

Without changing semantics, query:

1. immediate P0 terminal;
2. exact already-qualified theorem-q handoffs;
3. bounded rank-1 positive grammar;
4. bounded rank-3 recursive grammar;
5. legacy repair-capacity induction for every invariant-compatible P0 singleton target;
6. generic research-side RCIC:
   - exact known-root handoff;
   - direct target-reservoir RCIC;
   - CPC-restricted forced terminal;
   - forced pair-contraction to target-reservoir RCIC.

## Negative library

Run the unchanged forced-obligation loss classifier on every unique rank-36 P0 q class.

Failure of positive routing is UNKNOWN, not loss.

A positive/loss collision is a hard failure.

## Composition

For each root P0 action E/F/G:

- preserve every terminal-safe P1 reply from the source;
- map each physical reply to its exact rank-36 q class;
- reuse one classification only after exact semantic-q equality;
- classify the P0 action:
  - `P0_ACTION_WIN_ALL_REPLIES` iff every safe P1 reply class is constructively P0-winning;
  - `P0_ACTION_FAILS_LOSS_REPLY` iff at least one safe P1 reply class is exactly P0-losing;
  - `P0_ACTION_UNKNOWN` otherwise.

Root q5d34 classification:

- `P0_WIN_EXISTS_ACTION` iff at least one E/F/G action wins against every safe P1 reply;
- `P0_LOSS_ALL_ACTIONS` only if every E/F/G action has an exact P0-losing reply and the already-qualified unsafe C action remains losing;
- `UNKNOWN` otherwise.

Do not infer draw/nonwin merely from unresolved positive routing.

## Output

Report:

- all 10 physical reply histories;
- the 9 exact q classes;
- exact-q merge groups;
- positive/negative classification of every q class;
- per-root-action universal composition;
- first/smallest unresolved exact q class;
- all resource failures separately.

## Boundary

No solved W/D/L, oracle, minimax, unrestricted game-tree search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.

Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, forced-loss semantics, and BSFP remain unchanged.
