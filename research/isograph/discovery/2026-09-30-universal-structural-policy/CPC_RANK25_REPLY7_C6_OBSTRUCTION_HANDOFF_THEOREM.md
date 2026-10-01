# CPC rank-25 reply-7 c6 obstruction handoff theorem

**Date:** 2026-10-01  
**Version:** 0.1 frozen before execution  
**Status:** exact local composition candidate; qualification pending  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Close the dangerous orientation of the sole uncovered Player-2 residual in the rank-24 reply-7 branch.

Qualification state after the rank-22 candidate path and P1:c1 singleton creation has support:

`[3,6,3,6,1,5,1]`

Player 2 is to move. Player 1 owns the active singleton target c3r5. The current truncated pairing theorem covers every active Player-2 residual except the exact two-cell residual `{c5r5,c6r6}`.

The endpoint c6r6 is currently playable.

## Candidate handoff

If Player 2 selects c6r6:

1. the move is nonterminal;
2. Player 1 plays c3, occupying c3r4 and making the active singleton c3r5 immediately playable;
3. production CPC restricts Player 2 to c3;
4. exact literal cofactors independently confirm c3 is the only Player-2 reply preventing an immediate P1:c3 terminal;
5. P2:c3 is nonterminal and blocks the c3r5 singleton;
6. the resulting state has Player 1 to move, c5 support height 1, and retains the fully Player-1-aligned minimal pair `{c5r5,c7r3}`;
7. the already-qualified height-1 c5 compression and truncated c7r3 target-reservoir certificate accept that exact state.

If every clause holds, Player 2 taking c6r6 cannot preempt the Player-1 win; it transfers the obligation into the previously qualified c5/c7 certificate.

## Falsifiers

Reject this theorem if any of the following occurs:

- P2:c6 is terminal;
- P1:c3 is terminal in the wrong direction or fails to retain an active c3r5 singleton;
- production CPC does not restrict P2 to c3;
- a legal P2 reply other than c3 avoids the immediate P1:c3 terminal;
- P2:c3 is terminal;
- the resulting state does not retain `{c5r5,c7r3}` with c5 at height 1 and Player 1 to move;
- the qualified height-1 c5 compression or its target-reservoir certificate rejects.

## Boundary

This is a local obligation-handoff theorem, not a new production CPC feature. It uses exact RBA cofactors, first-win precedence, and existing qualified certificate classes only.

It does not by itself close the entire reply-7 state; the other Player-2 first moves require the separate c6-blocker re-entry qualification.
