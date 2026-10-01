# CPC rank-32 q9f monotone proof-library classification 0.1

**Date:** 2026-10-01  
**Status:** frozen exact classification design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Target

Exact rank-32 semantic q class:

`9f6b7a33ab7e9552`

Representative:

`44444156666623222242551151531133`

Support:

`[6,6,4,6,5,5,0]`

Source:

`CPC_RANK20_RANK32_FORCED_OBLIGATION_LOSS_CENSUS_0_1.json`

The frozen loss census established:

- one enabled P1 singleton obligation `C5`;
- P0 has no immediate terminal action;
- P0 is forced to block in column c3;
- after the block, the old forced-obligation loss engine found no certified losing P1 reply because every rank-34 child had zero enabled P1 singleton obligations.

That is an incomplete proof-library query, not evidence that those children are novel.

## Purpose

Apply the monotone proof-library rule:

```text
before declaring an obstruction new,
query every previously qualified certificate family that applies
```

to every exact child after the forced c3 block.

## Exact execution

1. Reconstruct q9f independently in JSMinSys RBA and the semantic-quotient kernel.
2. Require exact equality of:
   - rank;
   - support;
   - normalized P0 residual antichain;
   - normalized P1 residual antichain;
   - semantic q hash.
3. Recompute the enabled P1 singleton obligation and require the frozen forced block c3.
4. Execute the c3 block by exact cofactor.
5. Enumerate every legal P1 adversarial reply.
6. For each resulting rank-34 P0 child, query the following existing proof routes in this order without changing any route semantics:
   - immediate P0 terminal;
   - exact known-root handoff where exact state equality applies;
   - legacy adaptive repair-capacity proof for every active P0 singleton target satisfying its frozen invariant;
   - generic RCIC positive routes:
     - direct target-reservoir;
     - CPC-forced pair contraction to target-reservoir;
     - exact terminal / exact known-root handoff.
7. Preserve every route attempt and rejection reason.

## Composition result

Classify q9f as `FORCED_BLOCK_ALL_REPLIES_POSITIVE` only if **every** legal P1 reply after the forced block has at least one exact positive P0 certificate from the existing library.

This is a constructive P0-win certificate:

```text
P0 forced block
AND
for every legal P1 reply:
  some existing exact P0 certificate closes the child
=> q9f is P0 winning
```

If one or more replies remain unclosed, do not infer their value. Preserve the smallest exact unclosed child as the next obstruction.

## Upstream impact

If q9f closes positively, revisit only the frozen source occurrence:

`SECOND_D1_C5_CONTRACTION:A->A / rootMove c3 / defender c3`

and report whether the original rank-30 root-move attempt is now fully closed by its existing proof grammar.

Do not infer the rank-30 leaf value from q9f alone unless every defender reply for that root move is independently closed.

## Boundary

No oracle, Pons score, solved W/D/L, minimax, unrestricted free-branch game-tree search, best-move table, opening book, BSFP solved frontier, support-only identity shortcut, or sealed holdout is permitted.

Production CPC, JSMinSys, target-reservoir semantics, repair-capacity semantics, RCIC semantics, and BSFP remain unchanged.
