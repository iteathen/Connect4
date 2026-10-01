# CPC rank-26 reply-7 forced-chain win composition theorem

**Date:** 2026-10-01  
**Version:** 0.1 frozen before execution  
**Status:** exact W/L composition candidate; qualification pending  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Compose the newly qualified rank-31 c3r5 truncated target-reservoir certificate backward through two exact CPC forced-response layers to close the exact rank-26 reply-7 state.

Rank-26 qualification locator:

`44444156666623222242331775`

The locator is provenance only. The exact state must have:

- rank 26;
- Player 1 to move;
- support `[2,6,3,6,2,5,2]`.

Candidate winning move:

`P1:c5`.

No solved value or diagnostic best-move label is consumed by this theorem.

## Layer A — rank26 P1:c5 forced c5

After Player 1 c5, reconstruct the exact rank-27 state.

Require both production CPC modes to restrict Player 2 uniquely to c5.

Independently enumerate every legal Player-2 reply:

- for every reply other than c5, exact cofactor evaluation must expose an immediate Player-1 first win;
- reply c5 must be nonterminal and reach the exact rank-28 state:
  `4444415666662322224233177555`
  with support `[2,6,3,6,4,5,2]`.

## Layer B — rank28 P1:c5 forced c7

From that exact rank-28 state, Player 1 plays c5.

Require both production CPC modes to restrict Player 2 uniquely to c7.

Independently enumerate every legal Player-2 reply:

- for every reply other than c7, exact cofactor evaluation must expose an immediate Player-1 first win;
- reply c7 must be nonterminal and reach the exact rank-30 state:
  `444441566666232222423317755557`
  with support `[2,6,3,6,5,5,3]`.

## Layer C — rank30 P1:c1 handoff

From the exact rank-30 state, Player 1 plays c1.

The exact child must equal the rank-31 state:

`4444415666662322224233177555571`

with support `[3,6,3,6,5,5,3]`.

Freshly re-execute:

`run-cpc-rank31-c3-target-reservoir-qualification.mjs`

at pinned JSMinSys authority and require `accept=true`.

That premise proves the rank-31 child is a Player-1 win by a finite c3r5 truncated target-reservoir pairing.

## Conclusion target

If all layers qualify:

[
q_{26}
\xrightarrow{P1:c5}
\begin{cases}
P2\neq c5 &\Rightarrow \text{immediate P1 terminal},\\
P2=c5 &\Rightarrow q_{28}
  \xrightarrow{P1:c5}
  \begin{cases}
  P2\neq c7 &\Rightarrow \text{immediate P1 terminal},\\
  P2=c7 &\Rightarrow q_{30}
    \xrightarrow{P1:c1}
    q_{31}
    \Rightarrow \text{qualified c3r5 reservoir win}.
  \end{cases}
\end{cases}
]

Therefore P1:c5 is a structurally certified winning move at the exact rank-26 state.

## Required qualification

- pinned JSMinSys `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`;
- production CPC unchanged;
- exact current-state RBA cofactors;
- baseline/frontier CPC agreement at both forced layers;
- independent literal reply enumeration wherever CPC forcing is load-bearing;
- exact full-RBA equality for the rank-28/rank-30/rank-31 handoffs;
- fresh successful re-execution of the c3r5 target-reservoir premise;
- `oracleUsed=false`;
- `solvedInputsUsed=false`;
- `ordinaryGameTreeSearchUsed=false`.

## Falsifiers

Reject if any off-forced reply lacks an immediate exact P1 terminal, either CPC forced column differs, any handoff differs in full RBA identity, or the rank-31 reservoir premise fails on fresh execution.

## Scope

Qualification proves only the exact rank-26 state is P1-winning by c5.

It does not establish the value of an earlier parent, exact remoteness, move uniqueness, or a universal policy.

Production CPC, JSMinSys, and BSFP remain unchanged.
