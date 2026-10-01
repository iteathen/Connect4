# CPC rank-20 defender-c7 dual-pair choice-elimination probe 0.1

**Date:** 2026-10-01  
**Status:** frozen structural composition probe before execution  
**Branch:** `research/universal-structural-policy-20260930`  
**Superclass:** `RLC_RANKED_CONTROLLED_INVARIANT_CERTIFICATE_THEOREM.md`

## Exact source

Rank-20 root:

`44444156666623222242`

Consumed path:

`P1:c3, P2:c7`

Exact rank-22 child support:

`[1,6,2,6,1,5,1]`.

The previous dual-obligation setup probe established two aligned P1 residual pairs:

[
L={c1r3,c3r5},
qquad
R={c7r3,c5r5},
]

with both near endpoints `c1r3` and `c7r3` one support event away.

## First setup

Use:

`P1:c7`.

Requalify the prior result:

- P2:c1, c3, c6: P1:c7 consumes `c7r3`, contracts R to singleton `c5r5`, and the freshly synthesized target-reservoir RCIC accepts.

Only P2:c5 and P2:c7 require further routing.

## P2:c5 — two-pair choice elimination

After P2:c5, both L and R remain available.

P1 plays:

`c1`

as a setup beneath `c1r3`.

Then enumerate every legal P2 reply.

### If P2:c1

P2 consumes `c1r3`, destroying L.

P1 then consumes the now-playable `c7r3`.

Require:

- exact contraction of R to singleton `c5r5`;
- P1 target ownership;
- no playable P2 singleton;
- a freshly synthesized and exhaustively validated target-reservoir RCIC.

### If P2 is not c1

P1 consumes `c1r3`.

Require:

- exact contraction of L to singleton `c3r5`;
- P1 target ownership;
- no playable P2 singleton;
- a freshly synthesized and exhaustively validated target-reservoir RCIC.

This is a response-dependent composition: the proof route may differ by defender trigger.

## P2:c7 — transported single-pair branch

P2 consumes `c7r3`, destroying R and leaving L with `c1r3` one support event away.

P1 plays:

`c1`.

Again enumerate every legal P2 reply.

### If P2 is not c1

P1 consumes `c1r3` and must contract L to singleton `c3r5`, followed by fresh target-reservoir RCIC synthesis/validation.

### If P2:c1

Both aligned near endpoints have now been taken by P2.

Do **not** assign a value.

Freeze the exact resulting state and record:

- support/rank/mover;
- current CPC baseline/frontier;
- minimal residual geometry;
- projected-owner structure;
- exact known-root matches.

This is the smallest remaining witness if all other subroutes close.

## Boundedness

No recursive search is permitted.

The probe performs at most:

- the first c7 setup;
- one exceptional P2 reply;
- one c1 setup;
- one second P2 reply;
- one deterministic P1 pair-endpoint consumption;
- finite target-reservoir validation.

## Success criterion

Strong positive evidence is:

- complete closure of the P2:c5 exception by the two-pair choice rule;
- complete closure of every off-c1 continuation of the P2:c7 transport branch;
- reduction of the entire rank-20 defender-c7 child to at most one exact final double-taken state.

## Boundary

No oracle, Pons score, solved W/D/L, minimax, ordinary game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout may be used.

Production CPC, JSMinSys, and BSFP remain unchanged.

This is discovery evidence only.
