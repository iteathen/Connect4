# CPC rank-20 c5/reply-c5 reservoir CPC-guard conflict diagnostic 0.1

**Date:** 2026-10-01  
**Status:** frozen bounded diagnostic before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Sources

Consume:

- `CPC_RANK20_C5_REPLY5_PARTIAL_RESERVOIR_EXACT_VALIDATION_PROBE_0_1.json`;
- `CPC_RANK20_C5_REPLY5_HAZARDOUS_RESPONSE_PREDECESSOR_DIAGNOSTIC_0_1.json`.

Reconstruct each maximum-coverage reservoir policy independently at pinned JSMinSys authority.

## Purpose

The first terminal trace shows that the final P2 trigger `c3r3` enters an exact P1-loss state. The safety decision therefore lies earlier.

Evaluate unchanged production CPC at **every Player-1 response decision** along the first failing deterministic reservoir path.

Compare the reservoir-mapped response with any exact one-column CPC restriction.

## Per response decision

After each P2 trigger and before the mapped P1 reservoir response, record:

- rank/support;
- trigger cell;
- mapped reservoir response cell;
- CPC baseline/frontier result;
- agreed one-column restriction if both modes agree;
- whether the mapped reservoir response obeys that restriction;
- whether the CPC-forced move is legal;
- terminal/support result of the CPC-forced move;
- immediate P1 winning moves;
- exact theorem-root handoffs after one P1 move.

Classify:

- `CPC_GUARD_CONFLICT`: agreed CPC restriction exists and mapped response column differs;
- `CPC_GUARD_MATCH`: agreed restriction exists and mapped response matches;
- `CPC_EXACT`, `CPC_BOUND`, or `CPC_NONE`: no one-column restriction.

## Earliest conflict

For each failing candidate preserve the earliest CPC guard conflict, if any.

A candidate is **guard-reroute promising** if its earliest conflict occurs strictly before the first CPC_EXACT P1-loss decision and the forced move is legal/non-P2-terminal.

No reroute is executed in this experiment.

## Recurrence

Group conflicts by:

- trigger cell;
- mapped response column;
- CPC forced column;
- rank/support of the P1 decision.

## Boundary

No oracle, solved W/D/L, minimax, ordinary free-branch game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.

Production CPC, JSMinSys, target-reservoir semantics, and BSFP remain unchanged.

This is discovery evidence only.
