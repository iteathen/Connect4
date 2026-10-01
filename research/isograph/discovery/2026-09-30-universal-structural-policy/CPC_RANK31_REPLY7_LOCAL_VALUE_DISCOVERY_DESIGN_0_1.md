# CPC rank-31 reply-7 local value discovery 0.1

**Date:** 2026-10-01  
**Status:** frozen diagnostic design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Use exact local RBA recursion only as a discovery/falsification diagnostic at the structurally quiet rank-31 state reached by the forced reply-7 chain.

Exact qualification locator:

`4444415666662322224233177555756`

The locator is provenance only. The current exact RBA state must have:

- rank 31;
- Player 2 to move;
- support `[2,6,3,6,5,6,3]`;
- legal Player-2 moves `[1,3,5,7]`.

The preceding outcome-free probe established that this state has no immediate terminal, no active singleton, no CPC restriction, no target-reservoir certificate, and no equality with the already-qualified rank-31 phase-transfer root.

## Critical epistemic boundary

This experiment deliberately uses ordinary recursive W/D/L evaluation.

Therefore:

- `ordinaryGameTreeSearchUsed=true`;
- `proofPremiseAllowed=false`;
- no W/D/L value from this experiment may be used as an RLC theorem premise;
- no move may be certified merely because this diagnostic says it wins/draws/loses.

Its only purpose is to localize the next structural proof target.

## Exact diagnostic

Reconstruct the current RBA state at pinned JSMinSys authority
`bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`.

Use exact RBA cofactors and memoized recursion with value encoding:

- 3 = Player-1 win;
- 2 = draw;
- 1 = Player-2 win.

Player 1 maximizes; Player 2 minimizes.

Record:

1. root value;
2. exact value of every legal Player-2 move;
3. the set of best defender moves;
4. for each rank-32 Player-1 child:
   - its exact value;
   - value of every legal Player-1 response;
   - all P1 best responses in that child;
5. search node/memo statistics only as diagnostics.

## Structural profiling after the value diagnostic

For every defender branch, structurally profile every P1 response that matches that child state's best value:

- exact terminal/support;
- production CPC for Player 2, baseline/frontier;
- immediate Player-2 winning columns;
- exact minimal Player-1 and Player-2 residuals;
- fully projected-owner-aligned minimal residuals;
- active singleton residuals;
- exact equality against already-qualified compatible theorem roots where rank-compatible.

The structural profile is current-state evidence. The diagnostic value used to select which rows to profile remains forbidden as a proof premise.

## Decision after the diagnostic

Use the result only to choose the next label-free experiment:

- if every legal Player-2 move still has value P1_WIN, seek a common finite consequence-class / response-capacity proof across the defender branches;
- if one or more defender moves are DRAW or P2_WIN, reject the current `P1:c7 -> P2:c5 -> P1:c6` continuation as a universal P1-win closure and return to the preceding rank-28 alternatives;
- if P1 winning responses collapse to a small repeated structural family, freeze that family before attempting a theorem.

## Boundary

No Pons, external oracle, solved database, opening book, best-move table, physical-position identity, BSFP solved frontier, or sealed formula holdout is used.

Production CPC and JSMinSys remain read-only and unchanged. BSFP remains unchanged.

The recursive values in this experiment are discovery/falsification evidence only.
