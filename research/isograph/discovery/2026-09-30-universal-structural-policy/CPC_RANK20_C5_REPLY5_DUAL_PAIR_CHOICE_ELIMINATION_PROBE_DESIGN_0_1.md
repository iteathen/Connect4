# CPC rank-20 c5/reply-c5 dual-pair choice-elimination probe 0.1

**Date:** 2026-10-01  
**Status:** frozen structural composition probe before execution  
**Branch:** `research/universal-structural-policy-20260930`  
**Superclass:** `RLC_RANKED_CONTROLLED_INVARIANT_CERTIFICATE_THEOREM.md`

## Exact source

Rank-20 root:

`44444156666623222242`

Consumed path:

`P1:c5, P2:c5`

Exact rank-22 child support:

`[1,6,1,6,3,5,0]`.

The root multi-route census proved that `P1:c5` closes defender replies c1, c3, c6, and c7 under the existing RLC route grammar. Defender c5 is the only unresolved child.

This exact child contains two Player-1-aligned minimal size-2 residuals:

[
L={c1r3,c3r5},
qquad
R={c7r3,c5r5}.
]

The distance-1 setup endpoints are:

- `c1r3` for (L);
- `c5r5` for (R).

## Purpose

Test the already-used dual-pair choice-elimination mechanism on this single remaining child.

No new proof primitive is proposed.

Both possible distance-1 setup orientations must be tested:

1. **L-first:** setup beneath `c1r3`;
2. **R-first:** setup beneath `c5r5`.

No orientation is privileged before execution.

## First setup stage

For a chosen aligned pair with distance-1 endpoint (e):

1. Player 1 plays in the endpoint column, placing immediately below (e);
2. enumerate every legal Player-2 reply.

### Off-setup-column reply

If Player 2 does not play the setup column:

1. require no Player-2 first terminal;
2. require endpoint (e) to remain playable;
3. Player 1 consumes (e);
4. require exact contraction of the chosen pair to the other endpoint as an active Player-1 singleton;
5. require Player-1 CPC target ownership;
6. require no currently playable Player-2 singleton;
7. synthesize and exhaustively validate the existing target-reservoir RCIC.

### Same-setup-column reply

If Player 2 plays the setup column, Player 2 consumes (e) and destroys the chosen pair.

Then inspect the other aligned pair.

If its distance-1 endpoint remains available:

1. Player 1 performs the second setup beneath that endpoint;
2. enumerate every legal Player-2 reply.

For every off-second-setup-column reply, Player 1 consumes the endpoint and must contract the surviving pair to a singleton followed by a fresh target-reservoir RCIC.

If Player 2 also plays the second setup column and consumes the second pair endpoint:

- do not assign a value;
- freeze the exact double-taken state;
- record support/rank/mover, CPC baseline/frontier, minimal residual geometry, aligned-pair status, and exact known-root match if any.

## Exact handoff

At every nonterminal macro-state, exact full-RBA equality to a currently qualified theorem root may close the branch.

Support equality alone is insufficient.

## Boundedness

For each orientation the probe permits at most:

- one first setup;
- one first defender reply;
- one deterministic endpoint consumption, or one second setup;
- one second defender reply;
- one deterministic endpoint consumption;
- finite target-reservoir validation.

No ordinary recursive game-tree search is permitted.

## Success criterion

Useful positive evidence is:

- one setup orientation closes every off-double-taken branch;
- or one orientation closes the entire child by exact handoff/RCIC.

If both orientations fail before the double-taken case, preserve the smallest failed subroute exactly.

If one orientation reduces the child to a single exact double-taken state, that state becomes the next localized witness.

## Boundary

No oracle, Pons score, solved W/D/L, minimax, ordinary game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout may be used.

Production CPC, JSMinSys, and BSFP remain unchanged.

This is discovery evidence only and does not by itself certify the rank-20 root or the rank-22 child.
