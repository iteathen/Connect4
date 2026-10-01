# CPC three-column phase-transfer win theorem

**Date:** 2026-10-01  
**Version:** 0.1 frozen before execution  
**Status:** exact local W/L theorem candidate; qualification pending  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Close the late three-column CPC obligation state reached after the qualified/observed c1 handoff chain without extending a generic survival horizon.

Qualification locator:

`4444415666662322224233177716111`

The sequence is a qualification locator only. The theorem statement is over the exact current RBA state reconstructed from it.

At this state:

- rank = 31;
- Player 2 is to move;
- support = `[6,6,3,6,1,6,3]`;
- only columns 3, 5, and 7 remain legal;
- Player 1 has active singleton winning obligations at c3r5 and c5r4.

The theorem keeps exact RBA ownership state throughout. Equal support vectors reached by different transition orders are **not** assumed equivalent.

## Finite phase-transfer policy

Let the initial state be (Q).

### P2:c3

P2:c3 is nonterminal and exposes c3r5.

P1:c3 must be an exact first win.

### P2:c5

P1 responds c7, reaching exact state (A).

From (A):

- P2:c3 -> P1:c3 exact first win;
- P2:c5 -> P1:c5 exact first win;
- P2:c7 -> P1:c7, reaching exact state (Z_A).

From (Z_A), only c3 and c5 remain legal for Player 2:

- P2:c3 -> P1:c3 exact first win;
- P2:c5 -> P1:c5 exact first win.

### P2:c7

P1 responds c7, reaching exact state (B).

From (B):

- P2:c3 -> P1:c3 exact first win;
- P2:c5 -> P1:c7, reaching exact state (Z_B);
- P2:c7 -> P1:c5, reaching exact state (Z_C).

For each of (Z_B) and (Z_C), only c3 and c5 remain legal for Player 2:

- P2:c3 -> P1:c3 exact first win;
- P2:c5 -> P1:c5 exact first win.

The three sink orientations (Z_A,Z_B,Z_C) may share a support vector but remain separate exact RBA states unless equality is independently established.

## Structural interpretation

This is not a move-by-move survival horizon.

The finite state machine transports turn phase through the c7 reservoir until Player 2 is forced to consume one of two support events:

- c3r4, which exposes Player-1 singleton c3r5;
- c5r3, which exposes Player-1 singleton c5r4.

Thus the decisive fact is:

`finite c7 phase reservoir + two attached support-lift singletons -> P2 must expose a Player-1 terminal`.

The c7 moves are phase-transfer events; they do not themselves need to be winning threats.

## Qualification requirements

Qualification must use only:

- exact RBA cofactors from the frozen current state;
- current active singleton attachment by exact cells;
- legal-column exhaustion from support;
- first-win terminal precedence;
- production CPC unchanged at pinned JSMinSys authority `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`.

For every listed terminal edge, qualification must verify the triggering Player-2 move is nonterminal and the stated Player-1 reply is exactly terminal for Player 1.

For every transport edge, qualification must verify the stated response is legal and nonterminal.

No support-only state merge is permitted.

## Falsifiers

Reject this theorem if any of the following occurs:

- a listed Player-2 trigger is illegal or terminal for Player 2;
- a listed Player-1 phase-transfer response is illegal or terminal in the wrong direction;
- any claimed terminal response is not a Player-1 first win;
- an unlisted legal Player-2 move exists in any state;
- one of the exact sink orientations admits a legal Player-2 move other than c3/c5;
- first-win precedence differs from the stated transition;
- qualification relies on RBA equality inferred from support equality.

## Scope boundary

If qualified, this theorem establishes an exact Player-1 win only for the stated rank-31 current RBA state and any earlier state connected to it by separately qualified exact composition.

It does not by itself prove rank 30, rank 28, rank 24 reply-7, rank 22, rank 10, exact remoteness, a universal move finder, or v5.

It does not modify production CPC or JSMinSys.
