# CPC rank-30 D1 A bidirectional proof-library closure 0.1

**Date:** 2026-10-01  
**Status:** frozen exact leaf-classification design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Target leaf

`SECOND_D1_C5_CONTRACTION:A->A`

Sequence:

`444441566666232222425511515311`

Exact q:

`d21a89605c399aca`

Rank/support:

`30 / [6,6,2,6,5,5,0]`

## Frozen prior facts

From `CPC_RANK20_RANK32_FORCED_OBLIGATION_LOSS_CENSUS_0_1.json`:

- root move c5 is eliminated;
- root move c6 is eliminated;
- root move c7 is eliminated;
- root move c3 was the only surviving action.

From `CPC_RANK32_Q9F_MONOTONE_PROOF_LIBRARY_CLASSIFICATION_0_1.json`:

- after root move c3 and defender reply c3, exact q `9f6b7a33ab7e9552` is constructively P0-winning.

From `CPC_RANK30_D1_A_Q9F_HANDOFF_CONTINUATION_0_1.json`:

- the next defender reply c5 reaches exact q `0fc9d79484d94df1`;
- it is outside the old rank<=3 bounded grammar.

## Purpose

Classify every rank-32 child under the rank-30 c3 root move by querying the complete currently qualified research proof library in both directions.

This is proof-library integration, not a new game rule.

## Existing positive routes

For each rank-32 child:

1. immediate P0 terminal;
2. exact q9f handoff where exact semantic q identity matches;
3. bounded positive grammar rank 1 / rank 3;
4. legacy adaptive repair-capacity proof for invariant-compatible P0 singleton targets;
5. generic RCIC positive routes:
   - exact terminal / exact known-root handoff;
   - direct target-reservoir;
   - CPC-forced pair contraction to target-reservoir.

## Existing negative route

For each rank-32 child also run the unchanged forced-obligation loss classifier used by the frozen loss census:

- P0 terminal availability rejects loss;
- multi-obligation capacity defect;
- forced singleton block;
- adversarial P1 terminal or recursively certified child loss;
- zero enabled P1 obligation remains unknown.

No new negative rule is added.

## Child disposition

Each defender child is classified as:

- `P0_WIN` if any existing positive certificate succeeds;
- `P0_LOSS` if the existing forced-obligation loss certificate succeeds;
- `UNKNOWN` otherwise.

A child may not be both P0_WIN and P0_LOSS; such a collision is a hard falsifier.

## Root-move and leaf composition

For root move c3:

- if any legal P1 defender reply is P0_LOSS, c3 is eliminated;
- if every legal P1 defender reply is P0_WIN, c3 is constructively winning;
- otherwise c3 remains unresolved.

Combine with the already-frozen elimination of c5/c6/c7:

- if c3 is eliminated, the rank-30 leaf is P0_LOSS;
- if c3 is winning, the rank-30 leaf is P0_WIN;
- otherwise the leaf remains UNKNOWN.

## Boundary

No solved W/D/L, oracle, minimax, unrestricted free-branch game-tree search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is allowed.

Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, forced-obligation loss semantics, and BSFP remain unchanged.
