# CPC q5d three-action monotone positive-route audit 0.1

**Date:** 2026-10-01  
**Status:** frozen exact RLC routing design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source

Consume only:

- `CPC_Q966_G_BRANCH_FORCED_SAFETY_0_1.json`;
- pinned JSMinSys `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`;
- all already-qualified positive certificate families in the monotone RLC library.

Target exact state:

- q: `5d34e24395b9d801`;
- sequence: `4444415666662322224255115153113777`;
- rank: 34;
- support: `[6,6,3,6,5,5,3]`;
- mover: P0.

The frozen G-branch safety audit proves:

- C4 is unsafe because it exposes exact P1:C5 terminal;
- terminal-safe P0 actions are exactly E6, F6, G4.

## Purpose

Determine whether any of the three surviving P0 actions already closes under the monotone constructive proof library.

This is an existential routing audit, not recursive value search.

## Per-action query

For each E6/F6/G4:

1. reconstruct the exact rank-35 child;
2. if P0 terminal occurs immediately, accept;
3. otherwise query, without modification:
   - exact already-qualified theorem-q handoffs;
   - bounded rank-1 / rank-3 grammar where mover orientation permits;
   - unchanged legacy repair-capacity for every invariant P0 singleton target;
   - qualified generic RCIC routes:
     - exact known-root handoff;
     - direct target-reservoir;
     - CPC-restricted forced terminal;
     - forced pair contraction into a target reservoir.
4. A route is accepted only under its existing exact premises.
5. No absence of a route implies loss.

## Classification

- `Q5D_P0_WIN` if at least one E/F/G action has an accepted constructive certificate;
- `Q5D_UNRESOLVED` otherwise.

Preserve all accepted actions because genuine move equivalence matters.

If unresolved, preserve all three exact child q classes and route attempts for the next structural differential/forced-chain stage.

## Backward implication

If q5d is P0-winning:

- q966 P0:G2 -> forced P1:G3 -> q5d establishes G2 as a P0-winning q966 action;
- therefore q966 is P0-winning despite E/F having draw replies.

Do not propagate farther to the rank-30 ancestor until q966 is explicitly recomposed.

## Boundary

No solved W/D/L, oracle, minimax, unrestricted game-tree value search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is used.

Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, and BSFP remain unchanged.
