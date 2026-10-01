# CPC rank-28 dual-singleton handoff composition theorem

**Date:** 2026-10-01  
**Version:** 0.1 frozen before execution  
**Status:** exact local W/L composition candidate  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Compose the already-qualified rank-30 phase-transfer win two plies backward through a native CPC forced-response fork.

Qualification locator:

`4444415666662322224233177716`

The move sequence is a qualification locator only. The theorem is over the exact reconstructed current RBA state.

At this exact rank-28 state:

- Player 1 is to move;
- support is `[3,6,3,6,1,6,3]`;
- the existing structural profile contains a Player-1 aligned singleton at c3r5 and the c1 two-cell support ladder.

## Candidate handoff

Player 1 selects c1.

The candidate theorem requires:

1. P1:c1 is legal and nonterminal.
2. The move creates the active Player-1 singleton c1r5 while retaining the active Player-1 singleton c3r5.
3. Production CPC, unchanged at the pinned JSMinSys authority, restricts Player 2 uniquely to c1 in both baseline and frontier configurations.
4. An independent exact-RBA first-win cross-check over every legal Player-2 reply agrees that c1 is the only reply preventing an immediate Player-1 terminal.
5. P2:c1 is legal and nonterminal.
6. The exact post-c1/c1 child is exactly equal, in RBA words and active basis, to the root of the already-qualified theorem:
   `CPC_RANK30_PHASE_TRANSFER_COMPOSITION_THEOREM.md`.
7. The consumed rank-30 theorem has `accept:true`, `oracleUsed:false`, and `solvedInputsUsed:false`.

If all clauses pass, the rank-28 state is an exact Player-1 win by c1.

## Structural interpretation

This is a finite proof-class handoff:

`dual singleton / projected fork -> unique CPC block -> qualified phase-viability class`.

It is an instance of the older IsoGraph predecessor/choice-elimination architecture:

- no state equality is inferred from proof shape;
- the unique defender response is discharged structurally;
- the child is transported into an already-qualified certificate class;
- no game-tree value is used.

## Falsifiers

Reject if:

- P1:c1 is terminal in the wrong direction;
- either required singleton is absent after P1:c1;
- CPC does not uniquely restrict P2 to c1;
- any legal P2 reply other than c1 avoids the immediate Player-1 terminal;
- P2:c1 is terminal;
- exact RBA child equality with the rank-30 theorem root fails;
- the rank-30 premise is not qualified without solved inputs.

## Scope

Qualification closes only the stated rank-28 state.

It does not by itself close the earlier rank-27, rank-26, rank-24 reply-7, rank-22, or rank-10 states; it does not establish remoteness, authorize v5, or modify production CPC.
