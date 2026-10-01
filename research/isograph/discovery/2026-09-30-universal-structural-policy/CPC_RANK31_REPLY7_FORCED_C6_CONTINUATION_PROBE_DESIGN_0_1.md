# CPC rank-31 reply-7 forced-c6 structural continuation probe 0.1

**Date:** 2026-10-01  
**Status:** frozen outcome-free discovery design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Continue the structurally distinguished off-c7 reply-7 chain after the rank-28 forced-child probe exposed a second exact forced-response step.

The qualified/current-state chain is:

`rank26 P1:c5 -> unique P2:c5 -> rank28 P1:c7 -> unique P2:c5 -> forced P1:c6`.

This probe begins at the exact state after that final forced c6 response.

Qualification locator:

`4444415666662322224233177555756`

The locator is provenance only. The state must be reconstructed as exact RBA and must have:

- rank 31;
- Player 2 to move;
- support `[2,6,3,6,5,6,3]`.

## Discovery boundary

Do not consume Pons, minimax, local W/D/L diagnostics, best-move tables, solved databases, or BSFP solved values.

Do not assume that the earlier c3 target-reservoir template applies. The preceding rank-26 and rank-27 c3-target candidates were rejected because fresh target-template synthesis returned null.

Production CPC remains read-only at JSMinSys `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`.

## Parent-state structural checks

Before enumerating defender moves, record:

1. exact minimal Player-1 and Player-2 residuals;
2. active singleton residuals and CPC projected ownership/support distance;
3. production CPC output for the current Player-2 move in baseline/frontier modes;
4. exact immediate winning columns for each player;
5. exact equality against already-qualified rank-31 roots where rank-compatible;
6. for every active nonplayable Player-1 singleton, freshly synthesize the truncated target-reservoir pairing schema and independently traverse it.

A parent target certificate is accepted only if fresh synthesis succeeds and exhaustive exact-RBA traversal reaches only Player-1 first wins.

## Per-defender-move structural record

Enumerate every legal Player-2 move from the exact rank-31 state and record:

1. exact terminal result and support;
2. Player-1 immediate winning columns in the exact child;
3. exact minimal residuals and singleton attachments for both players;
4. production CPC output for Player 1 in baseline/frontier modes;
5. literal exact Player-1 immediate-response profile;
6. if baseline/frontier CPC agree on one forced Player-1 column, take exactly that child and record:
   - terminal/support/rank;
   - residual/singleton structure;
   - exact equality against already-qualified compatible theorem roots;
7. for every active nonplayable Player-1 singleton in the child, freshly synthesize and independently traverse a target-reservoir certificate.

No finite template may be copied from another branch.

## Qualified roots admitted for equality

Only already-qualified oracle-free roots may be compared by full RBA words and active basis:

- rank-31 three-column phase-transfer root from `CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_THEOREM.md`;
- any later-rank exact root already qualified on this branch if rank-compatible.

Support equality alone is insufficient.

## Selection rule after the probe

Prefer the cheapest sound route:

1. parent-state finite target certificate;
2. defender move exposing an immediate Player-1 terminal;
3. unique CPC response followed by exact theorem-class handoff;
4. fresh finite target-reservoir certificate in the exact child;
5. a strictly smaller unresolved response-obligation family.

Preserve genuine move equivalence.

## Boundary

- `oracleUsed=false`;
- `solvedInputsUsed=false`;
- `ordinaryGameTreeSearchUsed=false`;
- no sealed formula holdout;
- production CPC and JSMinSys unchanged;
- BSFP unchanged.

This is discovery evidence only and does not assign game value unless a sound structural certificate is actually qualified.
