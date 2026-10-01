# CPC rank-24 zugzwang win composition theorem

**Date:** 2026-10-01  
**Version:** 0.1 frozen before execution  
**Status:** qualified exact local W/L theorem  
**Branch:** research/universal-structural-policy-20260930

## Purpose

Compose two independently qualified CPC structural results into an exact current-state win certificate at the rank-24 obstruction state.

The qualification locator is:

444441566666232222423311

The move history is used only to reconstruct this exact RBA state for qualification. It is not a universal runtime proof premise.

## Qualified premises

### Premise A — trigger-5 forced compression

CPC_TRIGGER5_FORCED_COMPRESSION_LEMMA.md is qualified.

At the exact rank-24 state, Player 1 can play column 5.

Every legal Player-2 reply is one of columns 1, 3, 5, 6, or 7.

- Reply 5 permits an immediate exact Player-1 win by the next column-5 move.
- Replies 1, 3, 6, or 7 each enter the qualified forced-compression macro:
  - Player 1 plays column 5;
  - native CPC exactly restricts Player 2 to column 5;
  - independent exact-RBA cofactors confirm column 5 is the sole reply avoiding the immediate next Player-1 terminal;
  - Player 1 then consumes column 5 row 5;
  - the attached minimal pair contracts to the active singleton target at column 7 row 3.

### Premise B — truncated target-reservoir pairing

CPC_TRUNCATED_TARGET_RESERVOIR_PAIRING_THEOREM.md is qualified.

Every one of the four exact rank-29 post-compression states reached after replies 1, 3, 6, or 7 admits a finite truncated synchronized pairing certificate that:

- assigns the active singleton target c7r3 to Player 1;
- blocks or target-defers every active Player-2 residual;
- respects gravity and first-win precedence;
- forces a Player-1 terminal under the finite response law.

Therefore every off-column reply also loses to Player 1.

## Composition

Let \(q_{24}\) be the current exact rank-24 state.

Player 1 selects column 5.

For every legal Player-2 reply \(r\):

\[
r=5
\Longrightarrow
\text{immediate qualified Player-1 terminal},
\]

or

\[
r\in\{1,3,6,7\}
\Longrightarrow
\text{qualified forced compression}
\Longrightarrow
q_{29}^{(r)}
\Longrightarrow
\text{qualified truncated-reservoir Player-1 win}.
\]

Thus:

\[
\boxed{
q_{24}\xrightarrow{\text{P1: column 5}}
\text{Player 1 wins against every legal reply}
}
\]

and column 5 is a structurally certified winning move at this current state.

## What is exact here

The conclusion is W/L, not merely a survival lower bound:

- a concrete Player-1 move is identified;
- every legal Player-2 reply is covered;
- direct reply 5 has an exact first-win terminal;
- every off-column reply is mapped by an exact forced macro into a state carrying a qualified finite zugzwang certificate;
- no solved W/D/L premise or oracle value participates.

The theorem does not claim exact remoteness because some pairing branches terminate earlier than the target response and no maximum/minimum terminal distance theorem is asserted.

## Required qualification

Qualification must freshly execute the two frozen structural certificates at the pinned JSMinSys authority and verify that:

1. both certificates accept with oracleUsed=false and solvedInputsUsed=false;
2. the trigger certificate's off-column family is exactly {1,3,6,7};
3. the target-reservoir certificate's qualified family is exactly the same {1,3,6,7};
4. every direct/off-column branch is covered exactly once by the composition;
5. no production CPC source is modified.

The composition runner may invoke the two structural qualification runners as theorem-premise checks. It must not read Pons, an oracle, a solved W/D/L database, a best-move table, or a sealed holdout.

## Qualification result

Qualified on 2026-10-01 by CPC_RANK24_ZUGZWANG_WIN_COMPOSITION_0_1.json at pinned JSMinSys authority bf23d3a67652cd42e1975f29c7dc4eed54f7eb42.

The qualification freshly re-executed both structural premise certificates and verified:

- oracleUsed=false and solvedInputsUsed=false throughout;
- current state rank 24, Player 1 to move, support [3,6,3,6,1,5,0];
- Player-1 column 5 is the certified move;
- the complete legal Player-2 reply set is exactly {1,3,5,6,7};
- reply 5 closes by an immediate exact Player-1 terminal;
- replies 1,3,6,7 each close by the qualified forced-compression theorem followed by the qualified truncated target-reservoir pairing theorem;
- relative remoteness remains unclaimed.

Qualification workflow: GitHub Actions run 36881588496, successful. Durable evidence commit: e8679c949ed0fac24ff0fc6bd01730f78e2b8a6d.

This changes the earlier status discipline at this one state: an attacker forced-completion W/L theorem is now closed at rank 24. It does not imply an attacker forced-completion theorem from rank 10.

## Falsifiers

Reject this theorem if:

- either premise no longer qualifies at the pinned authority;
- the legal reply family differs;
- one off-column compressed state lacks a target-reservoir certificate;
- the direct column-5 reply no longer yields the exact Player-1 terminal;
- any branch is omitted or duplicated;
- either premise reports oracleUsed or solvedInputsUsed true.

## Scope boundary

This is an exact local W/L theorem for the stated current RBA state.

It does not yet prove:

- the earlier candidate-6 rank-10 state is won/lost by structural proof;
- exact relative remoteness;
- candidate-6 optimality;
- a universal policy from the empty board;
- v5.

Its significance is narrower and concrete: the previously repeated D13/D27 obstruction now closes as a finite CPC zugzwang win at rank 24.
