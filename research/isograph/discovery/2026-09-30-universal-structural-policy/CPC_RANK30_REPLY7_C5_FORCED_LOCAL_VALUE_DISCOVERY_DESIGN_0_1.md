# CPC rank-30 reply-7 c5-forced continuation local value discovery 0.1

**Date:** 2026-10-01  
**Status:** frozen diagnostic design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Localize the next label-free RLC proof target inside the exact rank-30 child reached by the structurally certified rank-28 continuation:

`P1:c5 -> unique P2:c7`.

Exact locator:

`444441566666232222423317755557`

The state must reconstruct as:

- rank 30;
- Player 1 to move;
- support `[2,6,3,6,5,5,3]`.

The rank-28 structural probe already established, without solved values, that P1:c5 creates a playable c7 singleton and production CPC plus independent literal cofactors restrict Player 2 uniquely to c7. Therefore the rank-30 child is a legitimate structural subgoal independently of this diagnostic.

## Critical epistemic boundary

This experiment uses exact recursive W/D/L evaluation only to select which rank-30 Player-1 continuations merit structural proof.

- `ordinaryGameTreeSearchUsed=true`;
- `proofPremiseAllowed=false`;
- diagnostic values and best-move labels are forbidden as theorem premises;
- all selected continuations must be re-proved from current-state RLC facts.

## Diagnostic

At pinned JSMinSys authority
`bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`:

1. compute the exact rank-30 root value;
2. compute the value of every legal Player-1 move;
3. preserve every diagnostically best move;
4. for each best move:
   - enumerate every legal Player-2 reply and its value;
   - preserve every best defender reply;
5. structurally profile every diagnostically best Player-1 child:
   - terminal/support;
   - baseline/frontier production CPC;
   - immediate Player-2 wins;
   - exact minimal residuals;
   - projected-owner-aligned minima;
   - singleton residuals.

## Next-step selection

Prefer the diagnostically winning continuation with the cheapest independently visible RLC structure:

1. immediate terminal;
2. native CPC forced response confirmed by literal cofactors;
3. active projected-owner-aligned singleton or fork;
4. exact theorem-class handoff;
5. smaller obligation family.

Diagnostic value never substitutes for these structural requirements.

## Boundary

No Pons, external oracle, solved database, opening book, best-move table, BSFP solved frontier, physical-position identity, or sealed holdout is used.

Production CPC and JSMinSys remain read-only and unchanged. BSFP remains unchanged.

The recursive W/D/L output is discovery/falsification evidence only.
