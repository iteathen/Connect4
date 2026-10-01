# CPC rank-24 reply-3 singleton-handoff composition theorem

**Date:** 2026-10-01  
**Version:** 0.1 frozen before execution  
**Status:** qualified exact W/L composition theorem  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Close the unresolved defender-reply-3 branch of the rejected rank-22 c1 composition without changing production CPC and without extending a survival horizon.

Qualification state:

`444441566666232222423313`

This sequence is a qualification locator only. It reconstructs the exact rank-24 RBA state reached from the rank-22 candidate move P1:c1 followed by P2:c3.

Current support is:

`[2,6,4,6,1,5,0]`

Player 1 is to move.

## Candidate composition

The state contains a fully Player-1-aligned minimal residual attached to:

- c1r3;
- c3r5.

Both cells are currently playable.

Player 1 selects c3.

This consumes c3r5 and contracts that attached residual to the active singleton c1r3.

Therefore:

1. production CPC must restrict Player 2 to c1;
2. independent exact-RBA enumeration must agree that c1 is the only legal Player-2 reply preventing an immediate Player-1 c1 terminal;
3. P2:c1 must be nonterminal;
4. the resulting rank-26 state must retain the fully Player-1-aligned minimal pair `{c5r5,c7r3}`;
5. column 5 must have support height 1 with Player 1 to move;
6. the already-frozen height-1 c5 forced-compression plus truncated target-reservoir certificate must accept that exact rank-26 state.

If all clauses hold, the rank-24 reply-3 state is an exact Player-1 win by c3.

## Structural interpretation

This is a singleton handoff:

`{c1r3,c3r5} -> P1:c3 -> {c1r3} -> forced P2:c1 -> next CPC obligation class`.

The important invariant is residual attachment and first-win precedence, not support geometry alone. The alternative route P1:c1 followed by P2:c3 reaches the same support vector but a different RBA ownership state and was already falsified as a c5-compression continuation.

## Qualification requirements

Qualification must:

- use exact RBA cofactors;
- use pinned JSMinSys authority `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`;
- consume production CPC unchanged;
- identify residuals by cell attachment, not stable IDs;
- independently enumerate every legal Player-2 reply after P1:c3;
- freshly execute the existing height-1 c5 compression and target-reservoir proof on the exact post-c1 state;
- record `oracleUsed: false` and `solvedInputsUsed: false`.

## Qualification result

Qualified on 2026-10-01 by `CPC_RANK24_REPLY3_SINGLETON_HANDOFF_COMPOSITION_0_1.json` at pinned JSMinSys authority `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`, with `oracleUsed: false` and `solvedInputsUsed: false`.

The frozen composition passed:

- P1:c3 created the active singleton c1r3;
- production CPC restricted Player 2 to c1 in both baseline and frontier modes;
- exact literal cofactors independently showed c1 was the only reply avoiding an immediate P1:c1 terminal;
- P2:c1 was nonterminal;
- the post-handoff rank-26 state retained the aligned `{c5r5,c7r3}` pair with c5 at height 1;
- the existing height-1 c5 compression and truncated target-reservoir certificate accepted the exact post-handoff state.

Qualification workflow: GitHub Actions run `36885769173`, successful. Durable evidence commit: `8af6df024f570c914e83b0339df1990c22c9fdd6`.

## Falsifiers

Reject this theorem if:

- P1:c3 is terminal in the wrong direction;
- c1r3 is not an active Player-1 singleton after P1:c3;
- native CPC does not restrict P2 to c1;
- any legal P2 reply other than c1 prevents an immediate P1 c1 win;
- P2:c1 is terminal;
- the post-c1 state does not satisfy the premises of the existing height-1 c5 compression;
- any branch of that c5 compression or its target-reservoir certificate fails.

## Scope boundary

Qualification would close only the rank-24 reply-3 state and one branch of the rank-22 c1 composition.

It would not by itself close the separate rank-24 reply-7 state, prove rank 22, prove rank 10, establish remoteness, authorize v5, or solve Connect Four.
