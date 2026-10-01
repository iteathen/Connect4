# CPC rank-26 reply-7 forced-c5 / c3-target composition theorem

**Date:** 2026-10-01  
**Version:** 0.1 frozen before execution  
**Status:** exact local RLC composition candidate  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Close the sole remaining rank-26 branch after the rank-24 reply-7 structural candidate `P1:c7` and defender reply `P2:c5` using only current-state CPC/RBA certificates.

The exact state is:

`44444156666623222242331775`

with rank 26, Player 1 to move, support `[2,6,3,6,2,5,2]`.

An outcome-free structural scan, frozen independently of local game-tree values, established that `P1:c5` produces:

- a production CPC `CPC_RESTRICT` for Player 2 with forced column c5 under both baseline and frontier configurations;
- literal exact cofactors in which c5 is the only defender reply avoiding an immediate Player-1 c5 terminal;
- no immediate Player-2 winning move.

## Candidate composition

### Step 1 — P1:c5

Require exact nonterminal cofactor and support:

`[2,6,3,6,3,5,2]`.

Production CPC and an independent literal reply census must both identify c5 as the unique defender escape.

### Step 2 — forced P2:c5

Require exact nonterminal cofactor and support:

`[2,6,3,6,4,5,2]`.

At this state, Player 1 retains the aligned pair:

`{c1r3,c3r5}`.

### Step 3 — P1:c1

P1 occupies the playable endpoint c1r3.

Qualification must verify:

- the move is legal and nonterminal;
- c3r5 contracts to an active Player-1 singleton;
- c3r5 is projected to Player 1 under CPC;
- Player 2 has no already-playable singleton terminal.

### Step 4 — fresh c3r5 target-reservoir certificate

From the exact post-c1 state, synthesize the truncated target-reservoir response pairing from scratch.

Require:

- c3r5 is assigned as a Player-1 response event;
- every active Player-2 residual is covered;
- independent exact-RBA traversal of the finite response template reaches only Player-1 first wins;
- no copied branch template, solved value, or move-tree result.

## Conclusion target

If the unique forced reply and the fresh c3r5 target-reservoir certificate both qualify, then the exact rank-26 state is a Player-1 win by c5.

Combined with the separately qualified rank-27 c7-taken composition, this would close every defender reply after the rank-24 structural move `P1:c7`.

## Falsifiers

Reject if:

- native CPC and literal cofactors disagree about the unique c5 defense;
- forced P2:c5 is terminal or reaches a different support;
- P1:c1 is illegal/terminal in the wrong direction;
- c3r5 is not an active P1 singleton with P1 projected ownership;
- a playable Player-2 singleton exists;
- target-reservoir synthesis fails to cover every active defender residual;
- exact template traversal has a defender first win, illegal response, or nonterminal escape.

## Boundary

No Pons/oracle value, solved W/D/L input, local recursive game-tree value, best-move table, BSFP solved frontier, or sealed holdout may be used.

Production CPC, JSMinSys, and BSFP remain unchanged.
