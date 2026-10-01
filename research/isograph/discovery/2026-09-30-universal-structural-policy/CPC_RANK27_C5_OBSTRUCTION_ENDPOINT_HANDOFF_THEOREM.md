# CPC rank-27 c5 obstruction endpoint / contested-target handoff theorem

**Date:** 2026-10-01  
**Version:** 0.1 frozen before execution  
**Status:** exact local RLC composition candidate  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Close the sole remaining off-c7 branch of the frozen rank-24 reply-7 `P1:c7` candidate.

The exact qualification state is located by:

`444441566666232222423317757`

The locator is qualification provenance only. Qualification reconstructs the exact current RBA state and reasons only from current support/residual attachment.

At this rank-27 state:

- Player 2 is to move;
- support is `[2,6,3,6,2,5,3]`;
- Player 1 owns the active singleton target `c5r5`;
- the previously qualified synchronized c5r5 target-reservoir family covers every active Player-2 residual except the exact two-cell residual `{c5r3,c3r5}`;
- `c5r3` is the currently playable endpoint of that obstruction.

## Candidate split

### Case A — Player 2 does not play c5

Player 1 replies `c5`, occupying `c5r3`.

Qualification must verify:

1. P2's reply is legal and nonterminal.
2. P1:c5 is legal and nonterminal.
3. Occupying c5r3 kills the exact obstruction residual `{c5r3,c3r5}`.
4. The active Player-1 singleton `c5r5` remains attached.
5. Player 2 has no immediately playable singleton terminal.
6. A **freshly synthesized** truncated target-reservoir pairing certificate exists for c5r5 on that exact post-block state.
7. Independent exact-RBA traversal of the synthesized finite template has no Player-2 first win or nonterminal escape.

No template may be copied from another branch.

### Case B — Player 2 plays c5

Player 2 occupies c5r3, contracting the obstruction toward c3r5.

Player 1 replies `c1`, occupying c1r3 and contracting the independent aligned Player-1 pair `{c1r3,c3r5}` to the active singleton `c3r5`.

Qualification must verify:

1. P2:c5 is legal and nonterminal.
2. P1:c1 is legal and nonterminal.
3. P1 has an active singleton c3r5 after c1.
4. Any active Player-2 c3r5 singleton/residual is retained as an exact defender obligation, not ignored.
5. Player 2 has no already-playable singleton terminal.
6. A fresh truncated target-reservoir pairing certificate for c3r5 assigns c3r5 as a Player-1 response and covers **every** active Player-2 residual, including any residual containing c3r5.
7. Exact-RBA traversal of that finite template reaches only Player-1 first wins.

This is a contested-target first-win certificate: if Player 2 triggers c3r4, the response law assigns c3r5 immediately to Player 1.

## Conclusion target

If all legal Player-2 replies are discharged by one of the two cases, the rank-27 state is a Player-1 win.

Together with the already-qualified rank-27 c7-taken theorem, this closes every defender reply after the frozen rank-24 reply-7 candidate move `P1:c7`.

## Falsifiers

Reject or narrow if:

- any legal defender reply is omitted;
- P1:c5 fails to kill the live-endpoint obstruction in Case A;
- c5r5 is lost or a defender playable singleton remains after the block;
- fresh c5r5 target-reservoir synthesis or traversal fails;
- P1:c1 fails to create the c3r5 singleton in Case B;
- the contested c3r5 target cannot be assigned as a Player-1 response;
- any active Player-2 residual is uncovered by the contested-target template;
- exact traversal contains a Player-2 first win, illegal response, or nonterminal escape.

## Boundary

This theorem consumes exact RBA cofactors and the already-qualified truncated target-reservoir theorem schema only.

No Pons/oracle value, solved W/D/L input, minimax result, best-move table, physical-position identity, BSFP solved frontier, or sealed holdout may be used.

Production CPC, JSMinSys, and BSFP remain unchanged.
