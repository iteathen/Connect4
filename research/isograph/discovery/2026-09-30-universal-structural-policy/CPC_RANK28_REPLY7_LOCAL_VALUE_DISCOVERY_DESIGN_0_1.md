# CPC rank-28 reply-7 c5-forced-child local value discovery 0.1

**Date:** 2026-10-01  
**Status:** frozen diagnostic design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Localize the next RLC proof target at the exact rank-28 state reached after the rank-26 structurally distinguished `P1:c5 -> forced P2:c5` exchange.

Exact locator:

`4444415666662322224233177555`

The state must reconstruct as:

- rank 28;
- Player 1 to move;
- support `[2,6,3,6,4,5,2]`;
- legal Player-1 moves `[1,3,5,6,7]`.

The outcome-free structural probe already showed:

- P1:c1 leaves a nonplayable c3r5 singleton but fresh target-template synthesis fails;
- P1:c5 uniquely forces P2:c7;
- P1:c7 uniquely forces P2:c5, then P1:c6, but that resulting rank-31 state is diagnostic draw under P2:c1;
- P1:c3 and P1:c6 have no immediate CPC restriction.

## Critical epistemic boundary

This experiment uses exact recursive W/D/L evaluation solely for discovery.

Therefore:

- `ordinaryGameTreeSearchUsed=true`;
- `proofPremiseAllowed=false`;
- no diagnostic value or best-move label may appear in a structural theorem premise;
- any selected continuation must be re-proved from current-state RLC facts.

## Diagnostic

Using exact RBA cofactors at pinned JSMinSys
`bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`:

1. compute the rank-28 root value;
2. compute the exact value of every legal Player-1 move;
3. preserve every diagnostically best move;
4. for each best move, record the complete legal Player-2 reply values;
5. preserve every best defender reply for that child;
6. structurally profile each best-move child using current-state CPC/RBA:
   - terminal/support;
   - baseline/frontier CPC;
   - immediate Player-2 wins;
   - exact minimal residuals;
   - projected-owner-aligned minima;
   - singleton residuals.

## Decision after the diagnostic

- If P1:c5 is winning, continue its forced-c7 rank-30 child and derive a label-free certificate there.
- If another move is winning while c5 is not, reject c5 as the winning continuation and freeze the structurally cheapest winning candidate.
- If all moves are at most draw, reject the preceding rank-26 P1:c5 continuation as a win route and return one layer further.
- Preserve diagnostic move equivalence exactly.

## Boundary

No Pons, external oracle, solved database, opening book, best-move table, BSFP solved values, physical-position identity, or sealed holdout is used.

Production CPC and JSMinSys are read-only and unchanged. BSFP is unchanged.

The recursive values are discovery/falsification evidence only.
