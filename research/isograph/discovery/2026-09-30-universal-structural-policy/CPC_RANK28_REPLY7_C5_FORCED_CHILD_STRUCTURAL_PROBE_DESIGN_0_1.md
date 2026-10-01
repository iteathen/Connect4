# CPC rank-28 reply-7 c5-forced-child structural continuation probe 0.1

**Date:** 2026-10-01  
**Status:** frozen outcome-free discovery design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Continue the structurally distinguished rank-26 move `P1:c5`.

The rank-26 outcome-free probe established, without solved values, that:

- `P1:c5` is legal and nonterminal;
- production CPC independently restricts Player 2 uniquely to `c5` in baseline and frontier configurations;
- literal exact cofactors independently agree that `c5` is the only defender reply avoiding an immediate Player-1 terminal.

This probe begins at the exact forced child after `P1:c5, P2:c5`.

Qualification locator:

`4444415666662322224233177555`

The locator is provenance only. The state is reconstructed as exact RBA and must have:

- rank 28;
- Player 1 to move;
- support `[2,6,3,6,4,5,2]`.

## Discovery boundary

Do not consume Pons, minimax, local W/D/L diagnostics, best-move tables, solved databases, or BSFP solved values.

Enumerate every legal Player-1 move from the exact rank-28 state.

## Per-move structural record

For every legal Player-1 move record:

1. exact terminal result and support;
2. exact minimal Player-1 and Player-2 residuals with CPC projected ownership and support distance;
3. active Player-1 and Player-2 singleton residuals;
4. production CPC result for Player 2 in baseline and frontier modes;
5. exact Player-2 immediate winning columns;
6. literal exact defender escape profile against any immediate Player-1 continuations;
7. if native CPC gives the same unique restriction in both modes, take that one exact defender child;
8. exact equality against already-qualified exact theorem roots where rank is compatible;
9. for every active nonplayable Player-1 singleton target, freshly synthesize the qualified truncated target-reservoir pairing schema and run its independent exact-RBA falsification traversal.

No target template may be copied from another state.

## Qualified roots admitted for equality tests

Only already-qualified oracle-free theorem roots may be compared:

- rank-28 dual-singleton handoff root from `CPC_RANK28_DUAL_SINGLETON_HANDOFF_COMPOSITION_THEOREM.md`;
- rank-30 phase-transfer root from `CPC_RANK30_PHASE_TRANSFER_COMPOSITION_THEOREM.md`, only when a probed child reaches rank 30.

Full RBA words and active basis must match exactly. Support equality alone is insufficient.

## Selection rule after the probe

Prefer the cheapest sound route:

1. immediate terminal;
2. unique forced response followed by exact theorem-class handoff;
3. fresh finite target-reservoir certificate;
4. smaller obligation-transfer family.

Preserve any genuine equivalence among successful moves.

## Boundary

- `oracleUsed=false`;
- `solvedInputsUsed=false`;
- `ordinaryGameTreeSearchUsed=false`;
- production CPC and JSMinSys read-only at `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`;
- BSFP unchanged;
- sealed formula holdouts untouched.

This is discovery evidence only, not a move-value theorem.
