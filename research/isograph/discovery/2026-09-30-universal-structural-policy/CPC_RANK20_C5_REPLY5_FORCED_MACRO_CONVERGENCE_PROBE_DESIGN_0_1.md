# CPC rank-20 c5/reply-c5 forced-macro convergence probe 0.1

**Date:** 2026-10-01  
**Status:** frozen structural discovery probe before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Exact source

Rank-20 root:

`44444156666623222242`

Consumed path:

`P1:c5, P2:c5`

Exact rank-22 child support:

`[1,6,1,6,3,5,0]`.

The root multi-route census recorded two local candidates:

- `P1:c3` with baseline/frontier CPC restriction to `P2:c5`;
- `P1:c5` with baseline/frontier CPC restriction to `P2:c3`.

Both forced macros have the same support vector afterward:

`[1,6,2,6,4,5,0]`.

Support equality is not semantic equality.

## Purpose

Determine whether the two forced macros reach:

1. the same exact RBA state;
2. different exact states with a small, explicit residual/ownership difference;
3. an already-qualified theorem root.

No value is assigned.

## Route A

From the exact rank-22 source:

1. play `P1:c3`;
2. require production CPC baseline and frontier modes to agree on one `CPC_RESTRICT` column `c5`;
3. execute exact `P2:c5`;
4. freeze the rank-24 state.

## Route B

From the same exact rank-22 source:

1. play `P1:c5`;
2. require production CPC baseline and frontier modes to agree on one `CPC_RESTRICT` column `c3`;
3. execute exact `P2:c3`;
4. freeze the rank-24 state.

## Comparison

Report:

- exact full-RBA equality;
- support equality;
- basis equality;
- exact active P1/P2 residual sets;
- minimal residual descriptions;
- aligned minimal P1 pairs;
- CPC baseline/frontier state at each result;
- exact qualified theorem-root matches.

If the states are not equal, preserve the symmetric-difference residual IDs together with exact attached cells. Residual IDs remain diagnostic; cell attachment is authoritative.

## Boundedness

The probe performs exactly two two-ply macros and no recursive exploration.

## Boundary

No oracle, Pons score, solved W/D/L, minimax, ordinary game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout may be used.

Production CPC, JSMinSys, and BSFP remain unchanged.

This is discovery evidence only.
