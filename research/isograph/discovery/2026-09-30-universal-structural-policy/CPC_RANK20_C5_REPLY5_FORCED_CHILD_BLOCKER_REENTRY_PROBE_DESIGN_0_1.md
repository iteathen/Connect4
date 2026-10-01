# CPC rank-20 c5/reply-c5 forced-child blocker re-entry probe 0.1

**Date:** 2026-10-01  
**Status:** frozen structural composition probe before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source evidence

Consume:

- `CPC_RANK20_C5_REPLY5_POST_CONTRACTION_CPC_REENTRY_DIAGNOSTIC_0_1.json`.

Use pinned JSMinSys authority and reconstruct every forced child independently.

## Purpose

Three target-reservoir-rejected singleton states were compressed by production CPC:

- baseline/frontier both restrict Player 2 to c3;
- every off-c3 defender reply exposes an immediate exact Player-1 terminal;
- the forced c3 child is nonterminal with Player 1 to move.

Each forced child still has the active Player-1 singleton target `c7r3`.

Test whether one legal Player-1 blocker/re-entry move converts the forced child into an existing target-reservoir RCIC, as in the already observed rank-24 blocker-reentry mechanism.

No new primitive is proposed.

## Frozen forced children

Use every source row with `cpcReentryPromising=true`.

For each:

1. replay its exact contraction state;
2. execute the agreed forced `P2:c3`;
3. require exact rank/support agreement with the source diagnostic;
4. enumerate every legal Player-1 move.

## Candidate test

For each legal Player-1 move:

1. execute exact cofactor;
2. accept an immediate exact P1 terminal;
3. otherwise check full-RBA equality to a qualified theorem root;
4. otherwise inspect every active minimal Player-1 singleton;
5. require CPC target projection to P1;
6. require no currently playable P2 singleton;
7. synthesize the existing target-reservoir pairing;
8. exhaustively validate first-win precedence.

Record whether the original c7r3 singleton survives and whether it is the accepted target.

No further CPC-forced macro is allowed in this probe.

## Success condition

A forced child is **closed** if at least one legal P1 candidate is accepted by immediate terminal, exact theorem-root handoff, or target-reservoir RCIC.

For each source contraction state, if:

- the source CPC compression was promising; and
- its forced child is closed here;

then mark that source contraction state **composition-ready**.

This still does not certify the full rank-20 root; unresolved sibling branches remain.

## Failure condition

Preserve the smallest exact forced child and candidate witness when no P1 move closes.

## Boundary

No oracle, Pons score, solved W/D/L, minimax, ordinary game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout may be used.

Production CPC, JSMinSys, and BSFP remain unchanged.

This is discovery evidence only.
