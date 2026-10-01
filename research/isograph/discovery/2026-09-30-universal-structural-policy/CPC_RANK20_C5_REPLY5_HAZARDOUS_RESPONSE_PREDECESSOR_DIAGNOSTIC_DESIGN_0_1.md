# CPC rank-20 c5/reply-c5 hazardous-response predecessor diagnostic 0.1

**Date:** 2026-10-01  
**Status:** frozen bounded diagnostic before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source evidence

Consume:

- `CPC_RANK20_C5_REPLY5_PARTIAL_RESERVOIR_EXACT_VALIDATION_PROBE_0_1.json`;
- `CPC_RANK20_C5_REPLY5_TARGET_RESERVOIR_REJECTION_LOCALIZATION_0_1.json`.

Reconstruct every maximum-coverage partial reservoir candidate independently at pinned JSMinSys authority.

## Purpose

Exact dynamic validation proved that every partial reservoir candidate fails by a Player-2 terminal in column 3:

- c3r4 for the first rank-25 state;
- c3r5 for the four rank-27 states.

The reservoir response policy may itself expose that terminal cell by playing immediately below it.

Trace the exact predecessor of the first such defender terminal and inspect the **preceding Player-1 response decision** before the hazardous support lift.

Do not change the response policy in this experiment.

## Trace per candidate

Run the same deterministic reservoir policy as the existing validator while retaining the response-pair path.

At the first defender-terminal failure record:

1. state immediately before the terminal Player-2 move;
2. terminal cell;
3. immediately preceding Player-1 move, if any;
4. state immediately before that Player-1 response;
5. Player-2 trigger that created that response obligation;
6. mapped reservoir response cell;
7. whether the mapped response is immediately below the eventual terminal cell.

At the pre-response P1 state evaluate unchanged production CPC in baseline and frontier-response modes.

Also enumerate:

- legal P1 moves;
- immediate exact P1 terminal moves;
- exact qualified theorem-root handoffs after one P1 move;
- active/minimal P1/P2 residuals;
- playable P2 singleton obligations before the P1 response.

## Positive signal

A failure is **CPC-reroute promising** if, at the pre-response state:

- baseline/frontier agree on one CPC_RESTRICT column;
- that forced column differs from the hazardous mapped reservoir response column;
- the forced move is legal and does not immediately lose by first-win semantics.

A separate composition probe is required before using the reroute.

## Negative signal

If CPC is NONE/BOUND, agrees with the hazardous response, or gives no usable alternative, preserve the exact response hazard.

## Recurrence

Group failures by:

- terminal cell;
- hazardous response cell;
- trigger cell;
- CPC decision signature.

Report recurrence across source states and pairing candidates.

## Boundary

No oracle, solved W/D/L, minimax, ordinary free-branch game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.

Production CPC, JSMinSys, target-reservoir semantics, and BSFP remain unchanged.

This is discovery evidence only.
