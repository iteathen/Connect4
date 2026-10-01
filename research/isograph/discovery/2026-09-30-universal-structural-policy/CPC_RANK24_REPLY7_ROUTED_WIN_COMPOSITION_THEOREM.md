# CPC rank-24 reply-7 routed win composition theorem

**Date:** 2026-10-01  
**Version:** 0.1 frozen before execution  
**Status:** exact RLC proof-routing composition candidate  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Close the exact rank-24 reply-7 state by routing every defender continuation after the structural candidate `P1:c7` into an already-known certificate class rather than introducing another Connect-Four primitive.

Exact root:

`444441566666232222423317`

Required state:

- rank 24;
- Player 1 to move;
- support `[2,6,3,6,1,5,1]`.

Candidate move:

`P1:c7`.

## Proof-routing policy

Before inventing a new local certificate, attempt:

1. exact forced/cofactor contraction;
2. exact RBA handoff to a qualified theorem root;
3. current-state target-reservoir requalification;
4. only if all such routes fail, declare a genuinely new proof primitive necessary.

This theorem is the first explicit use of that routing policy.

## Defender c1 / c3 / c6

Freshly re-execute the existing rank-24 dual-obligation structural probe against pinned JSMinSys.

For defender replies c1, c3, and c6 after `P1:c7`, require:

- the probe uses no oracle, solved inputs, or ordinary game-tree search;
- the exact reply is nonterminal;
- the prescribed `P1:c7` follow-up is legal/nonterminal;
- the exact residual pair contracts to the c5r5 singleton;
- the target-reservoir template is synthesized from the exact current RBA state;
- exact template traversal passes with no defender-first terminal.

These branches are requalified here as theorem premises; the previously stored probe result is not consumed as value authority.

## Defender c5

The exact reply must equal the rank-26 root:

`44444156666623222242331775`

with support `[2,6,3,6,2,5,2]`.

Freshly execute:

`run-cpc-rank26-reply7-forced-chain-win-composition.mjs`

and require `accept=true`.

## Defender c7

The exact reply is nonterminal. Player 1 then plays c1.

The resulting exact state must equal the rank-27 theorem root:

`444441566666232222423317771`

with support `[3,6,3,6,1,5,3]`.

Freshly execute:

`run-cpc-rank27-reply7-c7-taken-composition.mjs`

and require `accept=true`.

## Conclusion target

If every legal defender reply after `P1:c7` is closed by one of the routes above, then the exact rank-24 state is structurally certified as a Player-1 win by c7.

No new game-specific proof primitive is introduced. The proof is composition over:

- residual contraction;
- target-reservoir pairing;
- exact semantic-state handoff;
- previously qualified rank-local certificates.

## Falsifiers

Reject if:

- any legal defender reply is missing from the routing partition;
- any exact RBA handoff fails;
- any fresh target-reservoir traversal fails;
- either downstream theorem fails on fresh execution;
- any route requires solved W/D/L or ordinary game-tree value as a premise.

## Boundary

No diagnostic W/D/L, Pons/oracle value, solved database, ordinary game-tree search, best-move table, opening book, BSFP solved frontier, physical-position identity, or sealed holdout may be used.

Production CPC, JSMinSys, and BSFP remain unchanged.
