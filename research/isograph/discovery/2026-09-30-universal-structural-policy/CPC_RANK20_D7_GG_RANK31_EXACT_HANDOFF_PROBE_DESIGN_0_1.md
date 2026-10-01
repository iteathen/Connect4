# RLC D7 G/G rank31 exact-handoff probe 0.1

**Date:** 2026-10-01  
**Status:** frozen exact-handoff probe before execution

## Source leaf

From `CPC_RANK20_FORCED_C3_FIRST_FAILURE_LOCAL_GRAMMAR_PROBE_0_1.json`:

`SECOND_D7_C5_CONTRACTION:G->G`

sequence:

`444441566666232222425511575377`

rank 30, P0 to move, support:

`[3,6,2,6,5,5,3]`.

## Candidate transform

Execute P0:c3.

The resulting support is expected to be:

`[3,6,3,6,5,5,3]`.

## Qualified theorem root

Consume the already-qualified exact rank-31 target-reservoir state:

`CPC_RANK31_C3_TARGET_RESERVOIR_QUALIFICATION_0_1.json`

locator:

`4444415666662322224233177555571`

with support:

`[3,6,3,6,5,5,3]`.

## Test

Support equality is only a locator.

Reconstruct both rank-31 states independently at pinned JSMinSys authority and require exact equality of:

- terminal code;
- rank/mover;
- full support;
- normalized P0 residual antichain;
- normalized P1 residual antichain.

Also cross-check the same ordinary q identity in the semantic-quotient kernel.

If exact equality holds, the leaf has a qualified route:

`q30 --P0:c3--> q31 == qualified q31`

and inherits the qualified rank-31 target-reservoir win by exact handoff.

## Boundary

No oracle, solved W/D/L, minimax, ordinary game-tree search, BSFP solved frontier, or support-only merge.

Production CPC, JSMinSys, and BSFP remain unchanged.
