# CPC rank-37 q649 two-safe-reply proof-library composition 0.1

**Date:** 2026-10-01  
**Status:** frozen exact RLC composition design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source

Consume only:

- `CPC_Q2DB_FORCED_TERMINAL_SAFETY_CHAIN_0_1.json`;
- pinned JSMinSys `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`;
- the unchanged monotone RLC proof library:
  - immediate terminal;
  - exact q9f handoff;
  - bounded rank-1 / rank-3 grammar;
  - legacy repair-capacity induction;
  - qualified direct target-reservoir / forced-contraction RCIC;
  - exact previously qualified theorem-q handoffs only.

Target exact state:

- q: `6496c888c4e2a157`;
- rank: 37;
- support: `[6,6,3,6,6,6,4]`;
- P1 to move;
- exact sequence: `4444415666662322224255115153113756777`.

The frozen forced-terminal-safety chain proves that q2db reaches this state through unique safe moves:

[
G2 	o G3 	o G4.
]

At q649, immediate terminal exposure no longer forces a unique P1 action. The exact safe P1 actions are C4 and G5.

## Purpose

Determine whether both P1 alternatives already enter the existing constructive P0 proof library.

This is universal branch composition over exactly two current-state alternatives, not unrestricted game-tree search.

## Procedure

1. Reconstruct q649 by exact semantic identity.
2. Verify P1 has exactly legal/safe alternatives C4 and G5 and no immediate terminal action.
3. For each alternative:
   - reconstruct the exact rank-38 P0 child;
   - require exact semantic-q / JSMinSys RBA agreement;
   - query the monotone positive library:
     - immediate P0 terminal;
     - exact q9f/theorem-q handoff;
     - rank-1 / rank-3 grammar;
     - unchanged legacy repair-capacity certificates for every invariant singleton target;
     - qualified direct target-reservoir / forced-contraction RCIC.
4. Do not infer loss from absence of a positive certificate.
5. Classify:
   - `Q649_P0_WIN` iff both P1 children have constructive P0 certificates;
   - otherwise `Q649_UNRESOLVED`, preserving each exact unclosed child.

## Backward implication

If q649 closes P0-winning, compose with the already-qualified forced-safe chain to certify q2db P0-winning.

That in turn may be used only by exact-q handoff in the q966 E/F repair branches.

Do not automatically claim q966 or the rank-30 ancestor until those compositions are rerun or explicitly checked.

## Boundary

No solved W/D/L, oracle, minimax, unrestricted game-tree value search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.

Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, and BSFP remain unchanged.
