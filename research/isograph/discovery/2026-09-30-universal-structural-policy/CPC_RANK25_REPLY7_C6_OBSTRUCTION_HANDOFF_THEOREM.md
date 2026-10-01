# CPC rank-25 reply-7 c6 obstruction handoff theorem

**Date:** 2026-10-01  
**Version:** 0.1 frozen before execution  
**Status:** rejected exact local composition candidate  
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


## Qualification result

Rejected on 2026-10-01 by `CPC_RANK25_REPLY7_C6_OBSTRUCTION_HANDOFF_0_1.json` at pinned JSMinSys authority `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`, with `oracleUsed: false` and `solvedInputsUsed: false`.

The handoff itself qualified through the forced block:

- P2:c6 was nonterminal;
- P1:c3 created the active c3r5 singleton;
- production CPC restricted Player 2 to c3 in both baseline and frontier modes;
- exact literal cofactors independently showed c3 was the only reply avoiding the immediate P1:c3 terminal;
- P2:c3 was nonterminal;
- the resulting rank-28 state retained the aligned `{c5r5,c7r3}` pair with c5 at height 1 and Player 1 to move.

The frozen theorem failed only at its final re-entry claim. In the attempted height-1 c5 compression from that exact rank-28 state, P1:c5 was followed by an **immediate P2:c5 terminal**. Therefore the old c5 compression theorem does not transfer unchanged into this ownership state.

This is a theorem rejection, not a workflow/resource failure. The exact rank-28 state must be analyzed directly.
