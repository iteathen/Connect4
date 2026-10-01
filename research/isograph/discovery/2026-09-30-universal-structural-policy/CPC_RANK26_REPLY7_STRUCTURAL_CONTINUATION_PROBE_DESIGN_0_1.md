# CPC rank-26 reply-7 structural continuation probe 0.1

**Date:** 2026-10-01  
**Status:** frozen outcome-free discovery design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Localize the cheapest rank-local certificate route for the sole remaining off-c7 branch of the rank-24 reply-7 structural `P1:c7` hypothesis.

The exact source state is:

`44444156666623222242331775`

with:

- rank 26;
- Player 1 to move;
- support `[2,6,3,6,2,5,2]`.

This state was reached structurally by `P1:c7, P2:c5` from the rank-24 reply-7 state.

## Critical discovery boundary

Do not consume the local game-tree values already recorded elsewhere for this state.

Do not preselect a move from Pons, minimax, the local W/D/L diagnostic, a best-move table, or a solved database.

Enumerate every legal Player-1 move from the exact current RBA state and record only current-state / finite one-restriction consequences.

## Per-move structural record

For each legal Player-1 move:

1. exact terminal status and support;
2. exact minimal Player-1 and Player-2 residuals with cell attachment;
3. CPC projected owner and support distance for every residual cell;
4. production CPC output for Player 2 under baseline and frontier configurations;
5. exact Player-2 immediate winning columns;
6. if both CPC configurations emit the same unique forced defender column:
   - take that exact defender cofactor;
   - record terminal/support;
   - record the resulting Player-1 minimal residuals;
   - compare native CPC restriction with literal exact cofactors by testing every legal defender reply against the threatened immediate Player-1 continuation indicated by the restriction when one is identifiable from an active singleton.

## Selection rule after the probe

Prefer, in order:

1. immediate terminal;
2. exact forced-response handoff into an already-qualified theorem root;
3. finite target-reservoir / response-capacity certificate;
4. obligation transfer with a strictly smaller unresolved residual family.

The probe itself makes no W/D/L claim.

## Boundary

- `oracleUsed=false`;
- `solvedInputsUsed=false`;
- `ordinaryGameTreeSearchUsed=false`;
- no sealed formula holdout;
- production CPC and JSMinSys read-only at `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`;
- BSFP unchanged.
