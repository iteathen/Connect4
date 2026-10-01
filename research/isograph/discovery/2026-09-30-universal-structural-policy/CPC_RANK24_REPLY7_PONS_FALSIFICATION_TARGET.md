# Rank-24 reply-7 Pons falsification target

**Date:** 2026-10-01  
**Status:** frozen post-structural validation target  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Determine whether continued construction of an exact Player-1 structural win certificate is warranted for the one remaining rank-24 branch of the rank-22 column-1 campaign.

Exact qualification/validation locator:

`444441566666232222423317`

This is the rank-24 state reached from the rank-22 state after:

- Player 1: column 1;
- Player 2: column 7.

Current support is:

`[2,6,3,6,1,5,1]`

Player 1 is to move.

## Oracle role

Pascal Pons is used **only after the structural target is frozen**, for validation/falsification.

The oracle result may answer:

- whether this exact state is W/D/L for the side to move;
- which legal moves are W/D/L-equivalent;
- the full strong-score equivalence classes.

The oracle result must **not** be used as:

- a CPC theorem premise;
- a runtime move-selection premise;
- a feature or threshold to fit structural machinery;
- an opening-book entry;
- a replacement for rank-local proof.

If the oracle says no Player-1 winning move exists, stop attempting to prove a Player-1 win for this state and record that the rank-22 column-1 win composition is falsified.

If the oracle says one or more Player-1 winning moves exist, subsequent proof work must derive them independently from current RBA/CPC structure. The oracle may only falsify or validate the independently produced result.

## Pinned oracle authority

Use the same already-established validation authority:

- repository: `PascalPons/connect4`;
- revision: `d6ba50d8aaf2308c769d9bf2abd42d90f34baf41`;
- book: `7x6.book`;
- SHA-256: `f346cd449626fb81da93be0958e017ee854e5f74d85b6d38062357f5403aec53`;
- analysis mode: `c4solver -a`.

## Required durable evidence

Record:

- exact sequence and rank;
- complete seven-column score vector;
- legal W/D/L move classes;
- exact strong-score equivalence classes;
- best score;
- no structural theorem claim;
- explicit `oracleRole: "validation/falsification only"`.

The result is external validation evidence and remains segregated from structural proof inputs.
